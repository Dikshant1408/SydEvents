
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Event, UserPreferences } from '../types';
import { getRecommendations } from '../services/geminiService';

interface ChatAssistantProps {
  events: Event[];
  preferences: UserPreferences;
  onUpdatePreferences: (cats: string[]) => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ events, preferences, onUpdatePreferences }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your Sydney Event Assistant. What are you looking to do this week?" }
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
      const response = await getRecommendations(userMsg, events);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Heuristic: If they ask about a category, ask to subscribe
      // Explicitly type categories as string[] to resolve 'unknown' type error on cat.toLowerCase()
      const categories: string[] = Array.from(new Set(events.map(e => e.category)));
      const mentionedCat = categories.find(cat => userMsg.toLowerCase().includes(cat.toLowerCase()));
      
      if (mentionedCat && !preferences.categories.includes(mentionedCat)) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `I can notify you whenever new ${mentionedCat} events are added. Would you like to subscribe?` 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble thinking. Try again later!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const subscribeTo = (cat: string) => {
    onUpdatePreferences([...preferences.categories, cat]);
    setMessages(prev => [...prev, { role: 'assistant', content: `Great! You're now subscribed to ${cat} updates.` }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl w-[350px] sm:w-[450px] h-[600px] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-indigo-600 text-white rounded-t-3xl flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" /></svg>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">AI Assistant</h3>
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">Sydney Expert</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                  
                  {msg.content.includes("Would you like to subscribe?") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Cast to string[] to ensure 'c' is treated as string in the map callback */}
                      {(Array.from(new Set(events.map(e => e.category))) as string[]).filter(c => !preferences.categories.includes(c)).slice(0, 3).map(c => (
                        <button 
                          key={c}
                          onClick={() => subscribeTo(c)}
                          className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-none border border-slate-200 flex space-x-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-100 rounded-b-3xl">
            {preferences.categories.length > 0 && (
              <div className="flex items-center space-x-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Your Subs:</span>
                {preferences.categories.map(c => (
                  <span key={c} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">{c}</span>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-3">
              <input 
                type="text" 
                placeholder="Ask for recommendations..."
                className="flex-grow px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100 active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:bg-indigo-600 hover:scale-110 transition-all duration-500 group active:scale-95"
        >
          <svg className="w-7 h-7 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-50 border-4 border-slate-50 rounded-full animate-pulse"></div>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
