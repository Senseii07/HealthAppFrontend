'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/api';
import { Sparkles, Send, MessageCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function Chat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [mobileView, setMobileView] = useState<'chat' | 'sessions'>('sessions');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await chatService.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (id: string) => {
    try {
      const data = await chatService.getSessionDetail(id);
      setActiveSession(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchSessionDetail(activeSessionId);
    } else {
      setActiveSession(null);
    }
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, sending]);

  const handleCreateSession = async () => {
    try {
      const newSession = await chatService.createSession('New Chat');
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMobileView('chat');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat history?')) return;
    try {
      await chatService.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeSessionId || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    // Optimistically update UI
    const tempUserMessage = { id: 'temp-user', role: 'user', content: text, created_at: new Date().toISOString() };
    setActiveSession((prev: any) => ({
      ...prev,
      messages: [...(prev?.messages || []), tempUserMessage]
    }));

    try {
      const updatedSession = await chatService.sendMessage(activeSessionId, text);
      setActiveSession(updatedSession);
      
      // Update session title in list if it changed
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: updatedSession.title } : s));
    } catch (err) {
      console.error(err);
      const tempErrorMsg = { 
        id: 'temp-error', 
        role: 'assistant', 
        content: 'Sorry, I couldn\'t process that message. Please verify your connection to the server.', 
        created_at: new Date().toISOString() 
      };
      setActiveSession((prev: any) => ({
        ...prev,
        messages: [...(prev?.messages || []), tempErrorMsg]
      }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="py-2">
        <h2 className="font-quicksand text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
          AI Wellness Assistant <Sparkles className="w-6 h-6 text-tertiary fill-tertiary/10" />
        </h2>
        <p className="text-sm text-on-surface-variant/80 font-medium mt-1">
          Chat with your empathetic companion for nutrition advice, lifestyle coaching, and hormone-supportive habits.
        </p>
      </header>

      {/* Warning Disclaimer */}
      <div className="bg-tertiary-fixed/30 border border-tertiary-fixed-dim/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-on-tertiary-fixed-variant leading-relaxed font-medium">
        <ShieldAlert className="w-5 h-5 text-tertiary flex-shrink-0" />
        <p>
          <strong>Safety Note:</strong> I am a wellness companion, not a doctor. I provide suggestions on exercise, recipes, and daily habits. If you experience severe symptoms or have medical concerns, please consult a professional healthcare provider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[65vh]">
        
        {/* Left Side: Chat Sessions List (3 Columns on Desktop, togglable on mobile) */}
        <section className={`${mobileView === 'sessions' ? 'flex' : 'hidden'} md:flex md:col-span-4 bg-white p-5 rounded-[2rem] border border-outline-variant/20 shadow-sm flex-col justify-between h-full`}>
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <button
              onClick={handleCreateSession}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-primary/10 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" /> New Chat Session
            </button>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 select-none">
              {sessions.map((s) => {
                const isActive = activeSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setMobileView('chat');
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-primary-fixed/30 border-primary-fixed/40 text-primary'
                        : 'bg-surface-container-low/40 border-outline-variant/35 text-on-surface-variant hover:bg-surface-container-low/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageCircle className="w-4.5 h-4.5 text-outline flex-shrink-0" />
                      <span className="text-xs font-bold truncate pr-2">{s.title || 'Conversation'}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="p-1.5 hover:text-error rounded-lg hover:bg-error-container/20 text-outline transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {sessions.length === 0 && !loading && (
                <div className="text-center py-8 text-xs text-outline font-medium">
                  No previous sessions. Click "New Chat" to begin.
                </div>
              )}
            </div>

            {activeSessionId && (
              <button
                type="button"
                onClick={() => setMobileView('chat')}
                className="md:hidden w-full py-3 bg-surface-container-low text-primary font-bold rounded-2xl text-[10px] uppercase tracking-wider border border-primary-fixed/30 text-center"
              >
                Back to Conversation &rarr;
              </button>
            )}
          </div>
        </section>

        {/* Right Side: Chat Window (8 Columns, togglable on mobile) */}
        <section className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex md:col-span-8 bg-white rounded-[2rem] border border-outline-variant/20 shadow-sm flex-col justify-between h-full overflow-hidden relative`}>
          
          {/* Header bar inside chat window */}
          <div className="p-4 bg-surface-container-low/50 border-b border-outline-variant/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setMobileView('sessions')}
                className="md:hidden px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-primary bg-white border border-outline-variant/30 rounded-xl shadow-sm"
              >
                &larr; Chats
              </button>
              <span className="text-xs font-bold text-on-surface truncate max-w-[150px] sm:max-w-xs">
                {activeSession?.title || 'Active Chat'}
              </span>
            </div>
            <span className="text-[9px] text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
              AI Companion
            </span>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
            {activeSession?.messages?.map((msg: any) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[1.75rem] px-5 py-3.5 text-xs leading-relaxed font-medium shadow-sm ${
                    isUser
                      ? 'bg-primary text-on-primary rounded-tr-none'
                      : 'bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-tl-none'
                  }`}>
                    {/* Preserve line breaks inside content */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[1.75rem] px-5 py-3.5 text-xs leading-relaxed font-semibold bg-surface-container-low border border-outline-variant/40 text-outline rounded-tl-none animate-pulse">
                  Gemini is thinking...
                </div>
              </div>
            )}

            {!activeSessionId && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8">
                <Sparkles className="w-12 h-12 text-outline/30 animate-bounce" />
                <h4 className="font-quicksand font-bold text-on-surface-variant">Your Companion is Ready</h4>
                <p className="text-xs text-outline max-w-sm leading-relaxed">
                  Start a new session or select an existing conversation to ask questions about diet, stress, or workouts.
                </p>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Bar */}
          {activeSessionId && (
            <form onSubmit={handleSendMessage} className="p-4 bg-surface-container-low/50 border-t border-outline-variant/20 flex gap-3 items-center">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask your wellness assistant..."
                className="flex-1 px-5 py-3.5 bg-white border border-outline-variant/35 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary/20 shadow-inner"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="p-3.5 bg-primary text-on-primary rounded-2xl shadow-md shadow-primary/10 hover:opacity-95 active:scale-95 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </section>

      </div>
    </div>
  );
}
