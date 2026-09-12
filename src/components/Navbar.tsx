import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Target,
  SlidersHorizontal,
  ReceiptText,
  Bot,
  MessageSquareQuote,
  Coins,
  Crown,
  User as UserIcon,
  Menu,
  X,
  Server,
  CheckCircle2,
  ChevronDown,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { User, SystemStatus } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenSystemStatus: () => void;
  systemStatus: SystemStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenProfile,
  onOpenAuth,
  onOpenSystemStatus,
  systemStatus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strictly display the first name only across the app as requested
  const firstNameOnly = user
    ? user.firstName || user.name.split(' ')[0] || 'User'
    : '';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'simulator', label: 'What-If', icon: SlidersHorizontal },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'chat', label: 'AI Chat', icon: MessageSquareQuote },
    { id: 'currency', label: 'FX Convert', icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3E8]/90 backdrop-blur-md border-b border-[#17352A]/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              id="brand-home-btn"
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-md shadow-[#0B5D3B]/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#DCFCE7]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#0B5D3B] group-hover:text-[#15803D] transition-colors">
                  FINORA
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-[#17352A]/60 -mt-1">
                  FinTech Advisory
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/70 p-1.5 rounded-full border border-[#17352A]/10 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0B5D3B] text-white shadow-sm'
                      : 'text-[#17352A]/80 hover:text-[#0B5D3B] hover:bg-[#DCFCE7]/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#DCFCE7]' : 'text-inherit'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Premium Button */}
            <button
              id="nav-item-premium"
              onClick={() => onNavigate('premium')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentView === 'premium'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-100/70'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Premium</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200/60 text-amber-800">
                Trial
              </span>
            </button>
          </nav>

          {/* Right Area: System Status & User Profile */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Database & Cloud Connection Status Pill */}
            <button
              id="system-status-btn"
              onClick={onOpenSystemStatus}
              title="View Database & AI System Status"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#17352A]/10 text-[11px] font-medium text-[#17352A]/80 hover:bg-white hover:border-[#0B5D3B]/40 transition-colors shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803D]"></span>
              </span>
              <Server className="w-3.5 h-3.5 text-[#0B5D3B]" />
              <span className="hidden md:inline">
                {systemStatus?.database.type === 'mongodb' ? 'MongoDB Cluster' : 'Local Storage'}
              </span>
            </button>

            {/* User Account / Profile Button or Log In / Sign Up */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="user-profile-btn"
                  onClick={onOpenProfile}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-[#17352A]/10 hover:border-[#0B5D3B]/40 shadow-xs transition-all text-xs font-semibold text-[#17352A]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-bold flex items-center justify-center text-xs">
                    {firstNameOnly.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <span className="block truncate max-w-[110px] font-bold text-[#17352A]">
                      {firstNameOnly}
                    </span>
                    <span className="text-[10px] text-[#0B5D3B] font-bold">{user.currency}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#17352A]/50" />
                </button>
                <button
                  id="navbar-switch-account-btn"
                  onClick={() => onOpenAuth('login')}
                  title="Switch or create account"
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-medium text-[#17352A]/70 hover:text-[#0B5D3B] hover:bg-white/80 transition-colors"
                >
                  Switch
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  id="login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#17352A]/15 text-[#17352A] text-xs font-bold hover:border-[#0B5D3B] hover:text-[#0B5D3B] transition-colors shadow-2xs flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  id="signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-colors shadow-xs flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              id="mobile-system-status-btn"
              onClick={onOpenSystemStatus}
              className="p-2 rounded-full bg-white border border-[#17352A]/10 text-[#0B5D3B]"
            >
              <Server className="w-4 h-4" />
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white border border-[#17352A]/10 text-[#17352A] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 border-b border-[#17352A]/10 px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#17352A]/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#0B5D3B] text-white'
                      : 'bg-[#F7F3E8] text-[#17352A] hover:bg-[#DCFCE7]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              id="mobile-premium-btn"
              onClick={() => {
                onNavigate('premium');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>Premium (30-Day Trial)</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="mobile-profile-btn"
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-800"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#0B5D3B]" />
                  <span>{firstNameOnly}</span>
                </button>
                <button
                  id="mobile-switch-auth-btn"
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-semibold text-[#0B5D3B] underline px-1"
                >
                  Switch
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="mobile-login-btn"
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 border border-[#17352A]/10 text-[#17352A] text-xs font-bold"
                >
                  Log In
                </button>
                <button
                  id="mobile-signup-btn"
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
