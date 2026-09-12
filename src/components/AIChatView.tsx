import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, FinancialProfile, FinancialGoal } from '../types';
import { formatCurrency } from '../utils/finance';

interface AIChatViewProps {
  profile: FinancialProfile;
  goals: FinancialGoal[];
}

export const AIChatView: React.FC<AIChatViewProps> = ({ profile, goals }) => {
  const currency = profile.currency || 'KWD';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Finora**, your contextual financial advisor. I am linked directly to your active budget: **${formatCurrency(profile.monthlyIncome, currency, false)}** monthly income, **${formatCurrency(profile.availableToSave, currency, false)}** available to save, and **${goals.length}** goal(s). How can I assist your financial planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Can I afford this car?',
    'How much should I save every month?',
    `What happens if I save 50 ${currency} more?`,
    'Where am I spending too much?',
    'Will I reach my goal on time?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_demo',
        },
        body: JSON.stringify({ question: textToSend }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I have analyzed your situation and updated your advice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Finora analysis: With your monthly available surplus of **${formatCurrency(profile.availableToSave, currency, false)}**, keeping a disciplined 20% savings allocation ensures stability while funding your milestone goals.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6 text-[#DCFCE7]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-[#17352A]">Finora Contextual Advisor</h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-[#17352A]/60">
              Live Grounded on: {formatCurrency(profile.availableToSave, currency, false)}/mo surplus • {goals.length} target(s)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#0B5D3B] bg-[#DCFCE7]/70 px-3 py-1.5 rounded-full font-semibold border border-[#15803D]/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Private & Data-Isolated</span>
        </div>
      </div>

      {/* Suggested Questions Pill Row */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-[#17352A]/60 block px-1">
          Quick Inquiries Grounded on Your Real Finances:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#17352A]/10 text-xs font-semibold text-[#17352A] hover:bg-[#DCFCE7]/50 hover:border-[#0B5D3B] transition-all whitespace-nowrap shadow-2xs shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#17352A]/10 shadow-xs h-[480px] flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#17352A] text-white'
                      : 'bg-[#DCFCE7] text-[#0B5D3B]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#0B5D3B] text-white rounded-tr-none'
                      : 'bg-[#F7F3E8] text-[#17352A] rounded-tl-none border border-[#17352A]/5'
                  }`}
                >
                  <div
                    className="whitespace-pre-wrap space-y-2"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                    }}
                  />
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-emerald-200/70' : 'text-[#17352A]/50'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-[#0B5D3B] font-medium pl-10">
              <div className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-[#0B5D3B] animate-bounce delay-200" />
              <span className="text-[11px] text-[#17352A]/60">Finora is computing cash flow answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-[#17352A]/10 flex items-center space-x-2"
        >
          <input
            id="chat-query-input"
            type="text"
            placeholder="Ask about vehicle affordability, saving targets, or category cuts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-full border border-[#17352A]/20 bg-[#F7F3E8]/50 text-xs sm:text-sm text-[#17352A] focus:outline-none focus:border-[#0B5D3B] focus:bg-white transition-all"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={isTyping || !input.trim()}
            className="w-11 h-11 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center hover:bg-[#15803D] disabled:opacity-40 transition-colors shadow-xs shrink-0"
          >
            <Send className="w-4 h-4 text-[#DCFCE7]" />
          </button>
        </form>
      </div>
    </div>
  );
};
