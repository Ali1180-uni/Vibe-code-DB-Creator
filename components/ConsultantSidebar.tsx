import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, Database } from 'lucide-react';
import { Message, MessageAction } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ConsultantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  onActionClick: (value: string) => void;
}

const ConsultantSidebar: React.FC<ConsultantSidebarProps> = ({ isOpen, onClose, messages, addMessage, onActionClick }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };
    
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await sendMessageToGemini(input);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      addMessage(aiMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render content based on message type
  const renderMessageContent = (msg: Message) => {
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap">{msg.text}</p>
        
        {/* Action Buttons */}
        {msg.action && msg.action.type === 'BUTTON' && msg.action.options && (
          <div className="flex flex-col gap-2 mt-3">
            {msg.action.options.map((option) => (
              <button
                key={option.value}
                onClick={() => onActionClick(option.value)}
                className={`
                  w-full py-2 px-4 rounded-lg text-sm font-medium transition-all
                  ${option.style === 'primary'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Dropdown Select */}
        {msg.action && msg.action.type === 'SELECT' && msg.action.options && (
          <div className="mt-3">
            <select
              onChange={(e) => onActionClick(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
              defaultValue=""
            >
              <option value="" disabled>{msg.action.placeholder || 'Select an option...'}</option>
              {msg.action.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0F172A] border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#151F32]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-900/30 rounded-lg">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">AI Consultant</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Online • Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center mt-10 opacity-50">
            <Database className="mx-auto mb-2 text-slate-600" size={40} />
            <p className="text-sm text-slate-500">
              Upload a database diagram to start the analysis.
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}
              `}
            >
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 flex gap-1.5 items-center border border-slate-700">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#151F32] border-t border-slate-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your schema..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none h-[52px]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultantSidebar;