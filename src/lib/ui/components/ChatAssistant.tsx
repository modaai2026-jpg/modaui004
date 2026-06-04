import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { generateWithOllama } from '../../../services/ollama.service';

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    { role: 'assistant', content: '您好！我是 MODAUI 的官方 AI 助手。我可以为您介绍公司的业务、智体技术以及如何开启您的 AI 自动化运营。有什么我可以帮您的吗？' }
  ]);
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

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);
    
    try {
      const systemPrompt = `You are the Official AI Assistant of MODAUI. 
      MODAUI is an AI-powered Corporate Operations System. 
      Key facts:
      - It allows users to build automated companies.
      - Process: Select Industry -> Register -> Select Mode -> Spawn 6-agent AI Taskforce -> Automated Management.
      - 6 Core Industries: Fashion, Catering, Retail, Beauty, Fitness, Jewelry.
      - Features: AI Team Commander, SPU Database, Logistics Integration (SF Express), Automated Marketing.
      - Technology: Uses Gemini, OpenAI, and Ollama (Local AI).
      
      Respond in Chinese. Be professional, friendly, and helpful. Keep responses concise.`;

      const fullPrompt = `${systemPrompt}\n\nUser: ${userMsg}\nAssistant:`;
      const response = await generateWithOllama(fullPrompt, "llama3.1:8b");
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，我目前连接本地算力时遇到一点小问题。您可以直接通过官网导航了解我们的 6 大行业智体方案。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 bg-[#1D9BF0] hover:bg-[#38BDF8] shadow-2xl text-white rounded-full border-4 border-white/10"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="absolute bottom-20 right-0 z-[100] w-screen max-w-[380px]"
          >
            <Card className="h-[500px] flex flex-col bg-white shadow-2xl border-slate-200 overflow-hidden rounded-3xl">
              {/* Header */}
              <div className="p-4 bg-[#1D9BF0] text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">MODAUI 客服助手</h3>
                    <div className="flex items-center text-[10px] opacity-80">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                      AI 专家在线
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#1D9BF0] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex space-x-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="请输入您的问题..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#1D9BF0]/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1D9BF0] text-white rounded-xl hover:bg-[#38BDF8] disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-center space-x-1 text-[10px] text-slate-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Powered by MODAUI Gemini Engine</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
