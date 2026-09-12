import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = 3000;

// Stripe configuration with keys from environment or user credentials
function resolveStripeKeys() {
  const envSecret = process.env.STRIPE_SECRET_KEY?.trim() || '';
  const envPub = process.env.STRIPE_PUBLISHABLE_KEY?.trim() || '';

  // Automatically detect and swap if entered vice-versa in environment
  let secretKey = '';
  let publishableKey = '';

  if (envSecret.startsWith('sk_')) {
    secretKey = envSecret;
  } else if (envPub.startsWith('sk_')) {
    secretKey = envPub;
  }

  if (envPub.startsWith('pk_')) {
    publishableKey = envPub;
  } else if (envSecret.startsWith('pk_')) {
    publishableKey = envSecret;
  }

  return { secretKey, publishableKey };
}

const { secretKey: STRIPE_SECRET_KEY, publishableKey: STRIPE_PUBLISHABLE_KEY } = resolveStripeKeys();

let stripeClient: Stripe | null = null;
function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

app.use(express.json());

// ==========================================
// Database & Storage Strategy
// MongoDB with Automatic Resilient Local Persistence Fallback
// ==========================================
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LOCAL_DB_FILE = path.join(DATA_DIR, 'finora_db.json');

interface LocalDBData {
  users: any[];
  profiles: Record<string, any>;
  goals: any[];
  expenses: any[];
}

function loadLocalDB(): LocalDBData {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }

  // Initial default seed for immediate out-of-the-box exploration
  const defaultData: LocalDBData = {
    users: [
      {
        id: 'usr_demo',
        name: 'Ahmad Al-Kandari',
        email: 'ahmad@finora.app',
        currency: 'KWD',
        isPremium: false,
        trialStartDate: new Date().toISOString(),
        trialDaysRemaining: 28,
        createdAt: new Date().toISOString(),
      },
    ],
    profiles: {
      usr_demo: {
        monthlyIncome: 900,
        monthlyExpenses: 500,
        currentSavings: 2000,
        monthlyDebt: 0,
        currency: 'KWD',
        lastUpdated: new Date().toISOString(),
      },
    },
    goals: [
      {
        id: 'goal_car_1',
        userId: 'usr_demo',
        name: 'Electric Car Downpayment',
        category: 'Car',
        targetAmount: 8000,
        currentAmount: 2000,
        targetDate: new Date(Date.now() + 18 * 30.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlySaving: 333.33,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'goal_emergency_1',
        userId: 'usr_demo',
        name: 'Emergency Buffer (6 Mo)',
        category: 'Emergency Fund',
        targetAmount: 3000,
        currentAmount: 2000,
        targetDate: new Date(Date.now() + 10 * 30.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlySaving: 100,
        createdAt: new Date().toISOString(),
      },
    ],
    expenses: [
      {
        id: 'exp_1',
        userId: 'usr_demo',
        amount: 140,
        category: 'Food',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Monthly Organic Groceries & Dining',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_2',
        userId: 'usr_demo',
        amount: 90,
        category: 'Bills',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Telecom, Fiber Internet & Utilities',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_3',
        userId: 'usr_demo',
        amount: 85,
        category: 'Transport',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Fuel, Tolls & Maintenance',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_4',
        userId: 'usr_demo',
        amount: 75,
        category: 'Entertainment',
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Weekend Activities & Streaming',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_5',
        userId: 'usr_demo',
        amount: 110,
        category: 'Shopping',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Apparel & Home Essentials',
        createdAt: new Date().toISOString(),
      },
    ],
  };

    try {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    } catch (e) {
      // ignore
    }
    return defaultData;
  }

// MongoDB Client Connection Management
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let mongoStatus = {
  connected: false,
  clusterUriConfigured: Boolean(MONGODB_URI),
  clusterHost: MONGODB_URI ? (MONGODB_URI.match(/@([^/?]+)/)?.[1] || 'MongoDB Atlas') : '',
  message: MONGODB_URI ? 'Connecting to MongoDB Atlas Cluster...' : 'MongoDB URI not detected. Running on local persistent storage.',
};

async function syncToMongoDB(data: LocalDBData) {
  if (!mongoDb) return;
  try {
    // 1. Sync users
    for (const u of data.users) {
      await mongoDb.collection('users').updateOne({ id: u.id }, { $set: u }, { upsert: true });
    }

    // 2. Sync profiles
    for (const [userId, profile] of Object.entries(data.profiles)) {
      await mongoDb
        .collection('profiles')
        .updateOne({ userId }, { $set: { userId, ...(profile as any) } }, { upsert: true });
    }

    // 3. Sync goals
    for (const g of data.goals) {
      await mongoDb.collection('goals').updateOne({ id: g.id }, { $set: g }, { upsert: true });
    }
    const currentGoalIds = data.goals.map((g) => g.id);
    if (currentGoalIds.length > 0) {
      await mongoDb.collection('goals').deleteMany({ id: { $nin: currentGoalIds } });
    }

    // 4. Sync expenses
    for (const e of data.expenses) {
      await mongoDb.collection('expenses').updateOne({ id: e.id }, { $set: e }, { upsert: true });
    }
    const currentExpenseIds = data.expenses.map((e) => e.id);
    if (currentExpenseIds.length > 0) {
      await mongoDb.collection('expenses').deleteMany({ id: { $nin: currentExpenseIds } });
    }
  } catch (err: any) {
    console.warn('MongoDB Atlas background sync warning:', err.message);
  }
}

function saveLocalDB(data: LocalDBData) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db file:', err);
  }

  // Trigger non-blocking cloud database persistence
  syncToMongoDB(data).catch((err) => {
    console.warn('Asynchronous MongoDB Atlas sync exception:', err?.message || err);
  });
}

let localDB = loadLocalDB();

async function initMongoDB() {
  const uri = MONGODB_URI;
  if (!uri) {
    mongoStatus = {
      connected: false,
      clusterUriConfigured: false,
      clusterHost: '',
      message: 'MongoDB URI not detected. Running on local persistent storage.',
    };
    return;
  }

  try {
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db('finora');
    const hostMatch = uri.match(/@([^/?]+)/);
    const host = hostMatch ? hostMatch[1] : 'MongoDB Atlas';
    mongoStatus = {
      connected: true,
      clusterUriConfigured: true,
      clusterHost: host,
      message: `Connected successfully to MongoDB Atlas Cluster (${host})!`,
    };
    console.log(`Connected successfully to MongoDB Atlas Cluster: ${host}`);

    // Populate or sync collections
    try {
      const usersCount = await mongoDb.collection('users').countDocuments();
      if (usersCount > 0) {
        console.log(`Pulling existing data from MongoDB Atlas (${usersCount} users found)...`);
        const remoteUsers = await mongoDb
          .collection('users')
          .find({}, { projection: { _id: 0 } })
          .toArray();
        const remoteProfiles = await mongoDb
          .collection('profiles')
          .find({}, { projection: { _id: 0 } })
          .toArray();
        const remoteGoals = await mongoDb
          .collection('goals')
          .find({}, { projection: { _id: 0 } })
          .toArray();
        const remoteExpenses = await mongoDb
          .collection('expenses')
          .find({}, { projection: { _id: 0 } })
          .toArray();

        if (remoteUsers.length > 0) localDB.users = remoteUsers;
        if (remoteProfiles.length > 0) {
          const profMap: Record<string, any> = {};
          for (const p of remoteProfiles) {
            profMap[p.userId] = p;
          }
          localDB.profiles = profMap;
        }
        if (remoteGoals.length > 0) localDB.goals = remoteGoals;
        if (remoteExpenses.length > 0) localDB.expenses = remoteExpenses;

        // Persist snapshot to local cache
        fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(localDB, null, 2), 'utf-8');
      } else {
        console.log('Seeding initial dataset to MongoDB Atlas cluster...');
        await syncToMongoDB(localDB);
      }
    } catch (collErr: any) {
      console.warn('Initial collection sync notice:', collErr.message);
    }
  } catch (err: any) {
    console.warn('MongoDB connection notice:', err.message);
    mongoStatus = {
      connected: false,
      clusterUriConfigured: true,
      clusterHost: 'cluster0.xf4rpnx.mongodb.net',
      message: `MongoDB cluster unreachable (${err.message}). Defaulted to local persistent cache.`,
    };
  }
}

initMongoDB();

// ==========================================
// Gemini AI Initialization
// ==========================================
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to get active user
function getActiveUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser && headerUser.trim()) return headerUser;
  return 'usr_demo';
}

// ==========================================
// API Routes
// ==========================================

// 1. System & Integration Status
app.get('/api/system/status', (req: Request, res: Response) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.trim().length > 5
  );

  const hasStripe = Boolean(
    (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) ||
      (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_'))
  );

  res.json({
    database: {
      type: mongoStatus.connected ? 'mongodb' : 'persistent_json',
      connected: true,
      clusterUriConfigured: Boolean(process.env.MONGODB_URI),
      message: mongoStatus.message,
    },
    ai: {
      geminiConfigured: hasGemini,
      model: 'gemini-3.8-flash',
      mode: hasGemini ? 'gemini-3.8-flash' : 'intelligent_rules_engine',
    },
    stripe: {
      configured: hasStripe,
      sandboxMode: true,
      publishableKey: STRIPE_PUBLISHABLE_KEY,
    },
  });
});

// Stripe Integration Routes
app.get('/api/stripe/status', (req: Request, res: Response) => {
  const stripe = getStripeClient();
  res.json({
    configured: Boolean(stripe),
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    sandboxMode: true,
  });
});

app.post('/api/stripe/checkout', async (req: Request, res: Response) => {
  try {
    const { planId = 'pro_annual', userId = 'usr_demo' } = req.body;
    const stripe = getStripeClient();

    if (!stripe) {
      res.json({
        simulated: true,
        message: '30-Day Free Trial Activated (Simulated Mode).',
      });
      return;
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const origin = req.headers.origin || `${protocol}://${host}`;

    const isAnnual = planId === 'pro_annual';
    const amountInCents = isAnnual ? 4700 : 490; // $47/year or $4.90/month in test USD

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isAnnual ? 'Finora Pro (Annual)' : 'Finora Pro (Monthly)',
              description: 'Unlimited financial goals, scenario forecasts, priority AI advisor, and full audit exports.',
            },
            unit_amount: amountInCents,
            recurring: {
              interval: isAnnual ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          userId,
          planId,
        },
      },
      client_reference_id: userId,
      success_url: `${origin}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment_cancelled=true`,
    });

    res.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({
      error: err?.message || 'Failed to create Stripe Checkout session',
    });
  }
});

app.post('/api/stripe/verify-session', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = getActiveUserId(req);
    const stripe = getStripeClient();

    if (!sessionId || !stripe) {
      res.status(400).json({ error: 'Missing session ID or Stripe not configured' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status === 'complete' || session.payment_status === 'paid' || session.mode === 'subscription') {
      const targetUserId = session.client_reference_id || userId;
      const userIndex = localDB.users.findIndex((u) => u.id === targetUserId);
      if (userIndex !== -1) {
        localDB.users[userIndex].isPremium = true;
        localDB.users[userIndex].trialDaysRemaining = 30;
        saveLocalDB(localDB);
      }
      res.json({ success: true, isPremium: true });
      return;
    }

    res.json({ success: false, status: session.status });
  } catch (err: any) {
    console.error('Stripe verify session error:', err);
    res.status(500).json({ error: err?.message || 'Verification failed' });
  }
});

// Verification codes store: email -> { code, firstName, lastName, password, expiresAt }
const verificationStore = new Map<
  string,
  {
    code: string;
    firstName: string;
    lastName: string;
    password?: string;
    currency?: string;
    expiresAt: number;
  }
>();

// 2. Auth Routes
// Step 1 of Sign Up: Send 6-digit verification code to email
app.post('/api/auth/send-verification', (req: Request, res: Response) => {
  const { firstName, lastName, email, password, currency = 'KWD' } = req.body;

  if (!firstName || !firstName.trim()) {
    res.status(400).json({ error: 'First name is required (الاسم الأول مطلوب)' });
    return;
  }
  if (!lastName || !lastName.trim()) {
    res.status(400).json({ error: 'Last name is required (الاسم الثاني مطلوب)' });
    return;
  }
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required (البريد الإلكتروني غير صحيح)' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({
      error: 'Password must be at least 8 characters long (كلمة المرور يجب أن تتكون من 8 أحرف على الأقل)',
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = localDB.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(400).json({
      error: 'An account with this email already exists. Please log in. (هذا البريد مسجل مسبقاً، يرجى تسجيل الدخول)',
    });
    return;
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Valid for 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;

  verificationStore.set(normalizedEmail, {
    code,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    password,
    currency,
    expiresAt,
  });

  console.log(`[AUTH] Verification code for ${normalizedEmail} is: ${code}`);

  res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    email: normalizedEmail,
    code, // Returned for effortless demo/testing verification directly in UI
  });
});

// Step 2 of Sign Up: Verify 6-digit code and create account
app.post('/api/auth/verify-and-register', (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ error: 'Email and 6-digit verification code are required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const pending = verificationStore.get(normalizedEmail);

  if (!pending) {
    res.status(400).json({
      error: 'No active verification code found for this email. Please request a new code.',
    });
    return;
  }

  if (Date.now() > pending.expiresAt) {
    verificationStore.delete(normalizedEmail);
    res.status(400).json({
      error: 'Verification code has expired. Please request a new one.',
    });
    return;
  }

  if (pending.code !== String(code).trim()) {
    res.status(400).json({
      error: 'Invalid 6-digit verification code. Please check and try again.',
    });
    return;
  }

  // Verification successful, create user
  const fullName = `${pending.firstName} ${pending.lastName}`.trim();
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: fullName,
    firstName: pending.firstName,
    lastName: pending.lastName,
    email: normalizedEmail,
    password: pending.password, // In-memory/cluster stored for credentials verification
    currency: pending.currency || 'KWD',
    isPremium: false,
    trialStartDate: new Date().toISOString(),
    trialDaysRemaining: 30,
    createdAt: new Date().toISOString(),
  };

  localDB.users.push(newUser);
  localDB.profiles[newUser.id] = {
    monthlyIncome: 900,
    monthlyExpenses: 500,
    currentSavings: 2000,
    monthlyDebt: 0,
    currency: pending.currency || 'KWD',
    lastUpdated: new Date().toISOString(),
  };

  saveLocalDB(localDB);
  verificationStore.delete(normalizedEmail);

  res.json({
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      currency: newUser.currency,
      isPremium: newUser.isPremium,
      trialStartDate: newUser.trialStartDate,
      trialDaysRemaining: newUser.trialDaysRemaining,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { firstName, lastName, name, email, currency = 'KWD', password } = req.body;
  if (!email || (!firstName && !name)) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  if (password && password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  const fName = firstName?.trim() || name?.split(' ')[0] || 'User';
  const lName = lastName?.trim() || (name?.split(' ').slice(1).join(' ') || '');
  const fullName = `${fName} ${lName}`.trim();

  const existing = localDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: fullName,
    firstName: fName,
    lastName: lName,
    email: email.trim().toLowerCase(),
    password,
    currency,
    isPremium: false,
    trialStartDate: new Date().toISOString(),
    trialDaysRemaining: 30,
    createdAt: new Date().toISOString(),
  };

  localDB.users.push(newUser);
  localDB.profiles[newUser.id] = {
    monthlyIncome: 900,
    monthlyExpenses: 500,
    currentSavings: 2000,
    monthlyDebt: 0,
    currency,
    lastUpdated: new Date().toISOString(),
  };

  saveLocalDB(localDB);
  res.json({ user: newUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required (البريد الإلكتروني مطلوب)' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = localDB.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    res.status(401).json({
      error: 'Account not found. Please register a new account. (الحساب غير موجود، يرجى إنشاء حساب جديد)',
    });
    return;
  }

  // If user has a password set, verify it
  if (user.password && password && user.password !== password) {
    res.status(401).json({
      error: 'Incorrect password. (كلمة المرور غير صحيحة)',
    });
    return;
  }

  // Ensure firstName is available
  if (!user.firstName && user.name) {
    user.firstName = user.name.split(' ')[0];
    user.lastName = user.name.split(' ').slice(1).join(' ');
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency,
      isPremium: user.isPremium,
      trialStartDate: user.trialStartDate,
      trialDaysRemaining: user.trialDaysRemaining,
    },
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  let user = localDB.users.find((u) => u.id === userId);
  if (!user) {
    user = localDB.users[0];
  }
  res.json({ user });
});

// User Profile routes (/api/user/profile)
app.get('/api/user/profile', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  let user = localDB.users.find((u) => u.id === userId);
  if (!user) {
    user = localDB.users[0];
  }
  res.json({ user });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { name, currency } = req.body;
  const userIndex = localDB.users.findIndex((u) => u.id === userId);

  if (userIndex !== -1) {
    if (name) localDB.users[userIndex].name = name;
    if (currency) localDB.users[userIndex].currency = currency;
    saveLocalDB(localDB);
    res.json({ user: localDB.users[userIndex] });
    return;
  }

  // Create or return demo user
  const updatedUser = {
    id: userId,
    name: name || 'Ahmad Al-Kandari',
    email: 'user@finora.app',
    currency: currency || 'KWD',
    isPremium: true,
    trialStartDate: new Date().toISOString(),
    trialDaysRemaining: 28,
    createdAt: new Date().toISOString(),
  };
  localDB.users.push(updatedUser);
  saveLocalDB(localDB);
  res.json({ user: updatedUser });
});

app.post('/api/auth/premium/toggle', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const userIndex = localDB.users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    localDB.users[userIndex].isPremium = !localDB.users[userIndex].isPremium;
    saveLocalDB(localDB);
    res.json({ user: localDB.users[userIndex] });
    return;
  }
  res.status(404).json({ error: 'User not found' });
});

// 3. Financial Profile Routes
app.get('/api/financials', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  let profile = localDB.profiles[userId];
  if (!profile) {
    profile = {
      monthlyIncome: 900,
      monthlyExpenses: 500,
      currentSavings: 2000,
      monthlyDebt: 0,
      currency: 'KWD',
      lastUpdated: new Date().toISOString(),
    };
    localDB.profiles[userId] = profile;
    saveLocalDB(localDB);
  }
  res.json({ profile });
});

app.put('/api/financials', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    monthlyDebt,
    currency,
  } = req.body;

  const updatedProfile = {
    monthlyIncome: Number(monthlyIncome) || 0,
    monthlyExpenses: Number(monthlyExpenses) || 0,
    currentSavings: Number(currentSavings) || 0,
    monthlyDebt: Number(monthlyDebt) || 0,
    currency: currency || 'KWD',
    lastUpdated: new Date().toISOString(),
  };

  localDB.profiles[userId] = updatedProfile;

  // Also update user's currency preference if provided
  const user = localDB.users.find((u) => u.id === userId);
  if (user && currency) {
    user.currency = currency;
  }

  saveLocalDB(localDB);
  res.json({ profile: updatedProfile });
});

// Alias for POST /api/financials
app.post('/api/financials', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    monthlyDebt,
    currency,
  } = req.body;

  const updatedProfile = {
    monthlyIncome: Number(monthlyIncome) || 0,
    monthlyExpenses: Number(monthlyExpenses) || 0,
    currentSavings: Number(currentSavings) || 0,
    monthlyDebt: Number(monthlyDebt) || 0,
    currency: currency || 'KWD',
    lastUpdated: new Date().toISOString(),
  };

  localDB.profiles[userId] = updatedProfile;

  const user = localDB.users.find((u) => u.id === userId);
  if (user && currency) {
    user.currency = currency;
  }

  saveLocalDB(localDB);
  res.json({ profile: updatedProfile });
});

// 4. Goals Routes
app.get('/api/goals', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const userGoals = localDB.goals.filter((g) => g.userId === userId);
  res.json({ goals: userGoals });
});

app.post('/api/goals', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { name, category, targetAmount, currentAmount = 0, targetDate } = req.body;

  if (!name || !targetAmount || !targetDate) {
    res.status(400).json({ error: 'Goal name, target amount, and target date are required' });
    return;
  }

  const newGoal = {
    id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    name,
    category: category || 'Custom Goal',
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount) || 0,
    targetDate,
    createdAt: new Date().toISOString(),
  };

  localDB.goals.push(newGoal);
  saveLocalDB(localDB);
  res.json({ goal: newGoal });
});

app.put('/api/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getActiveUserId(req);
  const index = localDB.goals.findIndex((g) => g.id === id && g.userId === userId);

  if (index === -1) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const existing = localDB.goals[index];
  const { name, category, targetAmount, currentAmount, targetDate, depositAmount } = req.body;

  let newCurrentAmount = currentAmount !== undefined ? Number(currentAmount) : existing.currentAmount;
  if (depositAmount && Number(depositAmount) > 0) {
    newCurrentAmount += Number(depositAmount);
  }

  const updated = {
    ...existing,
    name: name ?? existing.name,
    category: category ?? existing.category,
    targetAmount: targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount,
    currentAmount: Math.min(newCurrentAmount, targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount),
    targetDate: targetDate ?? existing.targetDate,
    updatedAt: new Date().toISOString(),
  };

  localDB.goals[index] = updated;
  saveLocalDB(localDB);
  res.json({ goal: updated });
});

app.post('/api/goals/:id/deposit', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getActiveUserId(req);
  const { amount } = req.body;

  const index = localDB.goals.findIndex((g) => g.id === id && g.userId === userId);
  if (index === -1) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const existing = localDB.goals[index];
  const depositVal = Number(amount) || 0;
  existing.currentAmount = Math.min(existing.targetAmount, existing.currentAmount + depositVal);
  existing.updatedAt = new Date().toISOString();

  localDB.goals[index] = existing;
  saveLocalDB(localDB);
  res.json({ goal: existing });
});

app.delete('/api/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getActiveUserId(req);
  const initialLength = localDB.goals.length;
  localDB.goals = localDB.goals.filter((g) => !(g.id === id && g.userId === userId));

  if (localDB.goals.length === initialLength) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  saveLocalDB(localDB);
  res.json({ success: true });
});

// 5. Expenses Routes
app.get('/api/expenses', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const userExpenses = localDB.expenses
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ expenses: userExpenses });
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { amount, category, date, description } = req.body;

  if (!amount || !category) {
    res.status(400).json({ error: 'Amount and category are required' });
    return;
  }

  const newExpense = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    amount: Number(amount),
    category,
    date: date || new Date().toISOString().split('T')[0],
    description: description || '',
    createdAt: new Date().toISOString(),
  };

  localDB.expenses.unshift(newExpense);

  // Automatically adjust monthlyExpenses in profile to keep dashboard live & synced!
  const userExpenses = localDB.expenses.filter((e) => e.userId === userId);
  const totalExpenses = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  if (localDB.profiles[userId]) {
    localDB.profiles[userId].monthlyExpenses = totalExpenses;
    localDB.profiles[userId].lastUpdated = new Date().toISOString();
  }

  saveLocalDB(localDB);
  res.json({ expense: newExpense, totalExpenses });
});

app.delete('/api/expenses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getActiveUserId(req);
  const initialLength = localDB.expenses.length;
  localDB.expenses = localDB.expenses.filter((e) => !(e.id === id && e.userId === userId));

  if (localDB.expenses.length === initialLength) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }

  // Recalculate total
  const userExpenses = localDB.expenses.filter((e) => e.userId === userId);
  const totalExpenses = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  if (localDB.profiles[userId]) {
    localDB.profiles[userId].monthlyExpenses = totalExpenses;
    localDB.profiles[userId].lastUpdated = new Date().toISOString();
  }

  saveLocalDB(localDB);
  res.json({ success: true, totalExpenses });
});

// 6. AI Financial Advisor Analysis Route
app.get('/api/ai/advisor', async (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const profile = localDB.profiles[userId] || {
    monthlyIncome: 900,
    monthlyExpenses: 500,
    currentSavings: 2000,
    monthlyDebt: 0,
    currency: 'KWD',
  };
  const goals = localDB.goals.filter((g) => g.userId === userId);
  const expenses = localDB.expenses.filter((e) => e.userId === userId);

  const availableToSave = profile.monthlyIncome - profile.monthlyExpenses - profile.monthlyDebt;
  const savingsRate =
    profile.monthlyIncome > 0
      ? Math.round((availableToSave / profile.monthlyIncome) * 100)
      : 0;

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || [
    'General',
    0,
  ];

  const gemini = getGeminiClient();

  if (gemini) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    const prompt = `You are Finora's Senior Personal Financial Advisor.
Analyze this user's real financial data:
- Currency: ${profile.currency}
- Monthly Income: ${profile.monthlyIncome}
- Monthly Expenses: ${profile.monthlyExpenses}
- Monthly Debt: ${profile.monthlyDebt}
- Current Liquid Savings: ${profile.currentSavings}
- Available to Save: ${availableToSave}
- Savings Rate: ${savingsRate}%
- Biggest Expense Category: ${topCategory[0]} (${topCategory[1]} ${profile.currency})
- Active Financial Goals (${goals.length}):
${goals
  .map(
    (g) =>
      `  * ${g.name} (${g.category}): Target ${g.targetAmount}, Current ${g.currentAmount}, Target Date ${g.targetDate}`
  )
  .join('\n')}

Provide a concise, practical executive assessment strictly in valid JSON format matching this schema:
{
  "financialSummary": "2-3 crisp sentences evaluating overall cash flow and financial health.",
  "strengths": ["Clear strength 1", "Clear strength 2"],
  "concerns": ["Area of attention 1", "Area of attention 2"],
  "recommendations": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "goalSpecificAdvice": "Specific evaluation of whether goals are on track and what adjustments are needed."
}`;

    for (const modelName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json({
          financialSummary: parsed.financialSummary,
          strengths: parsed.strengths || [],
          concerns: parsed.concerns || [],
          recommendations: parsed.recommendations || [],
          goalSpecificAdvice: parsed.goalSpecificAdvice,
          disclaimer:
            'Educational guidance for informational purposes only. This does not constitute certified legal or financial advice.',
          source: `gemini (${modelName})`,
          generatedAt: new Date().toISOString(),
        });
        return;
      } catch (err: any) {
        console.warn(`Gemini advisor model (${modelName}) warning:`, err?.message || err);
        // Continue to next fallback model if 503 or unavailable
      }
    }
  }

  // Algorithmic Financial Advisor (Deterministic, highly intelligent, strictly based on real data)
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  if (savingsRate >= 20) {
    strengths.push(
      `Strong savings rate of ${savingsRate}%, exceeding the benchmark 20% rule.`
    );
  } else if (savingsRate > 0) {
    strengths.push(
      `Positive cash flow generates ${availableToSave} ${profile.currency} surplus every month.`
    );
  } else {
    concerns.push(
      `Zero or negative monthly savings margin. Current expenses and debt equal or exceed income.`
    );
  }

  if (profile.monthlyDebt === 0) {
    strengths.push('Zero consumer debt payments, giving you 100% control over your income allocation.');
  } else if ((profile.monthlyDebt / (profile.monthlyIncome || 1)) * 100 <= 15) {
    strengths.push('Healthy debt-to-income ratio below 15%.');
  } else {
    concerns.push(`Monthly debt represents ${Math.round((profile.monthlyDebt / profile.monthlyIncome) * 100)}% of your income.`);
  }

  const emergencyMonths =
    profile.monthlyExpenses > 0
      ? Math.round((profile.currentSavings / profile.monthlyExpenses) * 10) / 10
      : 0;

  if (emergencyMonths >= 3) {
    strengths.push(`Liquid savings cover ${emergencyMonths} months of recurring expenses.`);
  } else {
    concerns.push(
      `Liquid savings only cover ${emergencyMonths} months of living costs. Recommended target is 3 to 6 months.`
    );
  }

  if (topCategory[1] > 0) {
    concerns.push(
      `Highest spending occurs in ${topCategory[0]} (${topCategory[1]} ${profile.currency}).`
    );
  }

  recommendations.push(
    `Set aside ${Math.max(50, Math.round(availableToSave * 0.6))} ${profile.currency} on the first day of each salary cycle via auto-deposit.`
  );
  recommendations.push(
    `Audit ${topCategory[0]} outlays to redirect at least 10% towards active financial goals.`
  );
  recommendations.push(
    emergencyMonths < 3
      ? `Prioritize building an emergency safety net of ${profile.monthlyExpenses * 3} ${profile.currency} before expanding discretionary purchases.`
      : `Keep maintaining your reserve and deploy surplus into milestone goals or safe yields.`
  );

  let goalSpecificAdvice = '';
  if (goals.length === 0) {
    goalSpecificAdvice = 'You have not set any active financial goals yet. Create a goal like Emergency Fund, Vehicle, or Travel to start tracking progress.';
  } else {
    const totalGoalNeed = goals.reduce((acc, g) => acc + (g.targetAmount - g.currentAmount), 0);
    goalSpecificAdvice = `You have ${goals.length} active target(s) requiring a cumulative ${totalGoalNeed.toLocaleString()} ${profile.currency}. Given your available ${availableToSave} ${profile.currency}/month, prioritized targets are reachable within your designated timeline.`;
  }

  res.json({
    financialSummary: `Based on your monthly income of ${profile.monthlyIncome.toLocaleString()} ${profile.currency} and total commitments of ${(profile.monthlyExpenses + profile.monthlyDebt).toLocaleString()} ${profile.currency}, your net cash flow is ${availableToSave >= 0 ? 'positive' : 'restricted'} at ${availableToSave.toLocaleString()} ${profile.currency} per month.`,
    strengths,
    concerns,
    recommendations,
    goalSpecificAdvice,
    disclaimer:
      'Educational guidance for informational purposes only. This does not constitute certified legal or financial advice.',
    source: 'algorithmic_advisor',
    generatedAt: new Date().toISOString(),
  });
});

// 7. AI Financial Chat Route
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'A valid question is required' });
    return;
  }

  const profile = localDB.profiles[userId] || {
    monthlyIncome: 900,
    monthlyExpenses: 500,
    currentSavings: 2000,
    monthlyDebt: 0,
    currency: 'KWD',
  };
  const goals = localDB.goals.filter((g) => g.userId === userId);
  const expenses = localDB.expenses.filter((e) => e.userId === userId);

  const availableToSave = profile.monthlyIncome - profile.monthlyExpenses - profile.monthlyDebt;
  const savingsRate =
    profile.monthlyIncome > 0
      ? Math.round((availableToSave / profile.monthlyIncome) * 100)
      : 0;

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  const gemini = getGeminiClient();

  if (gemini) {
    const systemInstruction = `You are Finora AI, a friendly, ultra-practical personal financial advisor.
You are interacting directly with the user who has these live financial metrics:
- Currency: ${profile.currency}
- Monthly Income: ${profile.monthlyIncome}
- Monthly Expenses: ${profile.monthlyExpenses}
- Monthly Debt Obligations: ${profile.monthlyDebt}
- Available to Save: ${availableToSave} ${profile.currency}/month
- Current Savings: ${profile.currentSavings} ${profile.currency}
- Savings Rate: ${savingsRate}%
- Top Spending Categories: ${JSON.stringify(categoryTotals)}
- Current Goals: ${JSON.stringify(goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount, date: g.targetDate })))}

Answer the user's question directly, clearly, concisely (max 3-4 bullet points or short paragraphs), utilizing their EXACT real numbers.
Always calculate specific affordability or timelines using math. Never be vague. Be empathetic yet financially disciplined.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    for (const modelName of candidateModels) {
      try {
        const chat = gemini.chats.create({
          model: modelName,
          config: {
            systemInstruction,
          },
        });

        const response = await chat.sendMessage({
          message: question,
        });

        res.json({
          answer: response.text,
          source: `gemini (${modelName})`,
          timestamp: new Date().toISOString(),
        });
        return;
      } catch (err: any) {
        console.warn(`Gemini chat model (${modelName}) warning:`, err?.message || err);
        // Try next model if 503 or unavailable
      }
    }
  }

  // Algorithmic contextual responses handling the exact user prompt questions:
  const q = question.toLowerCase();
  let answer = '';

  if (q.includes('car') || q.includes('afford')) {
    if (availableToSave >= 250) {
      answer = `Based on your monthly surplus of **${availableToSave} ${profile.currency}**, you can afford a modest vehicle installment or down payment plan up to **${Math.round(availableToSave * 0.65)} ${profile.currency}/month**, preserving a **${Math.round(availableToSave * 0.35)} ${profile.currency}** safety cushion for running costs, insurance, and emergency buffer.`;
    } else {
      answer = `With your current available savings of **${availableToSave} ${profile.currency}/month**, committing to a substantial vehicle installment would strain your cash flow. We recommend trimming expenses in categories like Shopping or Dining first, or saving a larger upfront down payment.`;
    }
  } else if (q.includes('how much should i save') || q.includes('save every month')) {
    const recommended = Math.round(profile.monthlyIncome * 0.2);
    answer = `The recommended benchmark is the **50/30/20 rule**: aim to save at least **20% of your income**, which equals **${recommended} ${profile.currency}/month**. Currently, you have **${availableToSave} ${profile.currency}** available (${savingsRate}%). Allocating ${Math.min(availableToSave, recommended)} ${profile.currency} consistently will keep you comfortably on track!`;
  } else if (q.includes('50') || q.includes('save more') || q.includes('what happens if')) {
    const newSavings = availableToSave + 50;
    const yearlyExtra = 50 * 12;
    answer = `Saving an extra **50 ${profile.currency} every month** adds **${yearlyExtra} ${profile.currency}** to your wealth each year. This would accelerate your milestone goals significantly and increase your financial health buffer by an additional month of living expenses in under a year!`;
  } else if (q.includes('spending too much') || q.includes('where') || q.includes('expense')) {
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCat, topAmt] = sortedCategories[0];
      const pct = profile.monthlyExpenses > 0 ? Math.round((topAmt / profile.monthlyExpenses) * 100) : 0;
      answer = `Your largest spending category is **${topCat}** at **${topAmt} ${profile.currency}** (${pct}% of your total expenses). Trimming just 15% here would unlock an additional **${Math.round(topAmt * 0.15)} ${profile.currency}** monthly towards your financial goals.`;
    } else {
      answer = `Your logged expenses are currently modest. Total monthly expenses stand at **${profile.monthlyExpenses} ${profile.currency}**. Track daily purchases in the Expense Tracker to identify detailed saving opportunities.`;
    }
  } else if (q.includes('goal') || q.includes('time') || q.includes('reach')) {
    if (goals.length > 0) {
      const g = goals[0];
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const months = availableToSave > 0 ? Math.ceil(remaining / availableToSave) : 'N/A';
      answer = `For your priority goal **"${g.name}"** (${remaining.toLocaleString()} ${profile.currency} remaining), at your current capacity of **${availableToSave} ${profile.currency}/month**, you will complete it in approximately **${months} months**!`;
    } else {
      answer = `You haven't added any goals yet. Click on "Financial Goals" in the menu to set up your first goal, and I'll calculate your exact time to completion.`;
    }
  } else {
    answer = `Finora analysis: Your monthly income is **${profile.monthlyIncome} ${profile.currency}**, commitments are **${(profile.monthlyExpenses + profile.monthlyDebt)} ${profile.currency}**, leaving **${availableToSave} ${profile.currency}** available to save (${savingsRate}% savings rate). Ask me about car affordability, saving targets, or category optimization!`;
  }

  res.json({
    answer,
    source: 'algorithmic_advisor',
    timestamp: new Date().toISOString(),
  });
});

// 8. Sandbox Stripe Checkout Simulation
app.post('/api/checkout/session', (req: Request, res: Response) => {
  const userId = getActiveUserId(req);
  res.json({
    sessionId: `cs_test_${Date.now()}_finora_sandbox`,
    status: 'sandbox_ready',
    amount: 2.99,
    currency: 'KWD',
    subscriptionPeriod: 'monthly',
    message: 'Finora Sandbox Checkout Session Created. Connect Stripe API key in Settings when ready.',
  });
});

// Vite Middleware for Frontend Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Finora Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
