import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, Phone, Video } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Message } from '../types';
import { generateChatResponse, generateSmartReplies } from '../services/geminiService';

interface ChatDetailProps {
  contactId: string;
  onBack: () => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ contactId, onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'other', text: contactId === 'ai' ? 'Hello! I am Gemini. How can I assist you today?' : 'Hey! How are you?', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAi = contactId === 'ai';
  const name = isAi ? 'Gemini AI' : 'Jane'; // Mock name for non-AI

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Generate smart replies for the last message if it's from the other person
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId === 'other') {
        generateSmartReplies(lastMsg.text).then(replies => setSmartReplies(replies));
    } else {
        setSmartReplies([]);
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSmartReplies([]);

    if (isAi) {
      setLoading(true);
      
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.senderId === 'me' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

      const responseText = await generateChatResponse(history, text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'other',
        text: responseText,
        timestamp: new Date(),
        isAi: true
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    } else {
        // Simulate reply from human
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                senderId: 'other',
                text: "That sounds great! Let's talk more later.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between glass-panel border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isAi ? 'border-purple-400 bg-white p-1' : 'border-white/20'}`}>
                <img 
                    src={isAi ? "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" : "https://picsum.photos/100/100?random=10"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-full" 
                />
             </div>
             <div>
                <h3 className="font-bold">{name}</h3>
                <p className="text-xs text-white/50 flex items-center gap-1">
                    {isAi ? <><Sparkles size={10} className="text-purple-400"/> AI Assistant</> : 'Online'}
                </p>
             </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Phone size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Video size={20} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.senderId === 'me' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 rounded-tr-none text-white shadow-lg' 
                  : 'glass-panel rounded-tl-none text-white/90'
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-1 opacity-50 text-right`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
             <div className="flex justify-start">
                <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Replies */}
      {smartReplies.length > 0 && !loading && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {smartReplies.map((reply, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(reply)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full glass-panel text-xs text-purple-200 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
                  >
                      {reply}
                  </button>
              ))}
          </div>
      )}

      {/* Input */}
      <div className="p-4 glass-panel border-t border-white/10">
        <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70">
                <Sparkles size={20} />
            </button>
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 focus:outline-none focus:border-white/30 text-sm transition-all"
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim() && !loading}
                className="p-2.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20"
            >
                <Send size={18} className={input.trim() ? 'translate-x-0.5' : ''} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;