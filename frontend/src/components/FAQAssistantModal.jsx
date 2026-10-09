import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, BookOpen, Clock, ShieldCheck } from 'lucide-react';

const KNOWLEDGE_BASE = [
  {
    keywords: ["attendance", "75", "shortage", "percentage", "sms"],
    answer: "Engineering attendance requirement is strictly 75% per course as mandated by University regulations. When faculty finalizes an attendance session, an automatic SMS alert is instantly dispatched to your verified mobile number with updated percentage and status."
  },
  {
    keywords: ["lab", "booking", "equipment", "hardware", "gpu"],
    answer: "Engineering laboratories (NVIDIA AI/ML GPU Lab, IoT Robotics Lab, Cloud Systems) can be reserved via the 'Engineering Labs' tab. Submit your slot and purpose; faculty in-charge will approve/reject within 24 hours. Slot conflicts are automatically prevented."
  },
  {
    keywords: ["project", "hackathon", "team", "skills", "github"],
    answer: "Use the 'Project & Hackathon Hub' to pitch mini/capstone projects or find teammates matching skills (Python, React, AI/ML, IoT, ROS). You can view team sizes, send join requests, and link public GitHub repos."
  },
  {
    keywords: ["placement", "cgpa", "google", "microsoft", "drive"],
    answer: "Campus placement drives list minimum CGPA requirements (typically 7.5 - 8.5 for Tier-1 product companies). Apply directly from the 'Placement & Career' portal and access mock coding practice and aptitude drills."
  },
  {
    keywords: ["complaint", "wifi", "water", "projector", "maintenance"],
    answer: "Campus infrastructure issues (Wi-Fi, drinking water, projectors, electricity) can be reported under 'Campus Complaints'. A unique Ticket ID (e.g. CMP-2026-XXXX) is generated with real-time status tracking from Submitted → In Progress → Resolved."
  },
  {
    keywords: ["library", "book", "reserve", "due date"],
    answer: "The Digital Library catalog allows you to search books by title, author, or ISBN. You can reserve available books for 14 days and pick them up at the designated rack within 24 hours."
  },
  {
    keywords: ["emergency", "helpline", "medical", "security", "ambulance"],
    answer: "Campus 24x7 Emergency numbers: Health Centre & Ambulance: +91-80-2846-1001, Main Gate Security Desk: +91-80-2846-1002, Women Helpline: +91-80-2846-1008."
  }
];

export const FAQAssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Smart Campus AI Knowledge Assistant. Ask me anything about attendance rules, SMS alerts, engineering labs, project teams, placements, or campus complaints."
    }
  ]);
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    const userMsg = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");

    // Simple rule-based retrieval from knowledge base
    const lower = userText.toLowerCase();
    let bestMatch = KNOWLEDGE_BASE.find(k => k.keywords.some(kw => lower.includes(kw)));
    
    setTimeout(() => {
      const reply = bestMatch 
        ? bestMatch.answer
        : "I couldn't find a direct match for that query in the college handbook. Please visit the Department HOD office, check the announcements board, or file a request via Campus Complaints Desk.";
      
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Campus FAQ Assistant
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold px-2 py-0.5 rounded-full">AI Bot</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Preloaded Engineering College Knowledge Base</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                m.sender === 'bot' 
                  ? 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20' 
                  : 'bg-blue-600 text-white'
              }`}>
                {m.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                m.sender === 'bot'
                  ? 'bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  : 'bg-cyan-500 text-white font-medium rounded-tr-sm shadow-md shadow-cyan-500/20'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-navy-950/30 border-t border-slate-100 dark:border-navy-800 flex gap-1.5 overflow-x-auto text-[11px] text-slate-600 dark:text-slate-300">
          <button 
            onClick={() => setQuery("What is the attendance criteria?")} 
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-500 whitespace-nowrap transition-colors"
          >
            Attendance 75% rule
          </button>
          <button 
            onClick={() => setQuery("How to book a GPU lab slot?")} 
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-500 whitespace-nowrap transition-colors"
          >
            Lab booking
          </button>
          <button 
            onClick={() => setQuery("How to report broken Wi-Fi?")} 
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-500 whitespace-nowrap transition-colors"
          >
            Wi-Fi complaint
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-navy-800 flex items-center space-x-2 bg-white dark:bg-navy-900">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question about college policies, labs..."
            className="flex-1 px-4 py-2 text-xs bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
