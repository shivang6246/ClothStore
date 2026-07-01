import { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/chatService';
import api from '../services/api';

interface ChatMsg {
  id?: number;
  senderEmail: string;
  senderName: string;
  conversationEmail: string;
  content: string;
  timestamp: string;
  fromAdmin: boolean;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userEmail = localStorage.getItem('email') || '';
  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('role') || '';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // Connect WebSocket when widget opens
  useEffect(() => {
    if (!open || !token) return;

    let mounted = true;

    const init = async () => {
      try {
        await chatService.connect(token);
        if (!mounted) return;
        setConnected(true);

        // Load history if first open
        if (!historyLoaded) {
          try {
            const res = await api.get(`/api/chat/history/${userEmail}`);
            if (mounted) {
              setMessages(res.data);
              setHistoryLoaded(true);
              scrollToBottom();
            }
          } catch (e) {
            console.error('Failed to load chat history:', e);
          }
        }

        // Subscribe to conversation
        if (subIdRef.current) {
          chatService.unsubscribe(subIdRef.current);
        }
        subIdRef.current = chatService.subscribe(
          `/topic/conversation/${userEmail}`,
          (msg: ChatMsg) => {
            if (!mounted) return;
            setMessages((prev) => {
              // Avoid duplicates
              if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            scrollToBottom();
          }
        );

        scrollToBottom();
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (e) {
        console.error('WebSocket connection failed:', e);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [open, token]);

  // Track unread when closed
  useEffect(() => {
    if (!token || !userEmail) return;

    let mounted = true;

    const initBg = async () => {
      try {
        await chatService.connect(token);
        if (!mounted) return;

        const bgSubId = chatService.subscribe(
          `/topic/conversation/${userEmail}`,
          (msg: ChatMsg) => {
            if (!mounted) return;
            if (msg.fromAdmin && !open) {
              setUnread((prev) => prev + 1);
            }
            if (!open) {
              setMessages((prev) => {
                if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          }
        );

        return () => {
          chatService.unsubscribe(bgSubId);
        };
      } catch {
        // silent
      }
    };

    initBg();

    return () => {
      mounted = false;
    };
  }, [token, userEmail]);

  // Clear unread when opening
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !connected) return;

    chatService.sendMessage('/app/chat.send', {
      conversationEmail: userEmail,
      content: text,
      fromAdmin: false,
    });

    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Don't render for admin users or when not logged in
  if (role === 'ADMIN' || !token) return null;

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        .chat-fab:hover { transform: scale(1.1) !important; box-shadow: 0 8px 32px rgba(201,169,110,0.4) !important; }
        .chat-send-btn:hover:not(:disabled) { background: #b4943e !important; }
        .chat-msg-bubble { word-wrap: break-word; overflow-wrap: break-word; }
      `}</style>

      {/* ─── Floating Action Button ─── */}
      {!open && (
        <button
          id="chat-fab"
          className="chat-fab"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a96e, #7c5a2e)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(201,169,110,0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 9999,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: 'white', borderRadius: '50%',
              width: 22, height: 22, fontSize: '0.68rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'chatPulse 2s ease infinite',
              border: '2px solid #0a0a0a',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* ─── Chat Panel ─── */}
      {open && (
        <div
          id="chat-panel"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 380,
            maxWidth: 'calc(100vw - 24px)',
            height: 520,
            maxHeight: 'calc(100vh - 56px)',
            background: 'rgba(14, 14, 14, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #1e1e1e',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,110,0.08)',
            animation: 'chatSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem 1.2rem',
            background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(124,90,46,0.04))',
            borderBottom: '1px solid #1e1e1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9a96e, #7c5a2e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: '#0a0a0a',
              }}>
                V
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  color: '#f0ede6',
                  letterSpacing: 0.5,
                }}>
                  Customer Support
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: connected ? '#22c55e' : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: connected ? '#22c55e' : '#555',
                    display: 'inline-block',
                  }} />
                  {connected ? 'Online' : 'Connecting...'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#888',
                cursor: 'pointer', fontSize: '1.3rem', padding: '0.3rem',
                transition: 'color 0.2s', lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f0ede6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#555',
                textAlign: 'center',
                padding: '2rem',
                gap: '0.8rem',
              }}>
                <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>💬</div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  color: '#888',
                }}>
                  Start a Conversation
                </div>
                <div style={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.5 }}>
                  Send us a message and our team will respond shortly.
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMe = !msg.fromAdmin;
              const showDate = i === 0 ||
                new Date(msg.timestamp).toDateString() !== new Date(messages[i - 1].timestamp).toDateString();

              return (
                <div key={msg.id || `msg-${i}`}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      fontSize: '0.62rem',
                      color: '#555',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      padding: '0.8rem 0 0.4rem',
                    }}>
                      {new Date(msg.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    paddingLeft: isMe ? '2.5rem' : 0,
                    paddingRight: isMe ? 0 : '2.5rem',
                  }}>
                    <div className="chat-msg-bubble" style={{
                      maxWidth: '85%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: isMe
                        ? 'linear-gradient(135deg, #c9a96e, #a8893e)'
                        : '#1a1a1a',
                      color: isMe ? '#0a0a0a' : '#e0ddd6',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      border: isMe ? 'none' : '1px solid #252525',
                    }}>
                      {!isMe && (
                        <div style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: '#c9a96e',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          marginBottom: 3,
                        }}>
                          {msg.senderName || 'Support'}
                        </div>
                      )}
                      <div>{msg.content}</div>
                      <div style={{
                        fontSize: '0.58rem',
                        color: isMe ? 'rgba(10,10,10,0.55)' : '#555',
                        textAlign: 'right',
                        marginTop: 4,
                      }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '0.8rem 1rem',
            borderTop: '1px solid #1e1e1e',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            background: 'rgba(10, 10, 10, 0.6)',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '0.7rem 0.9rem',
                background: '#141414',
                border: '1px solid #252525',
                borderRadius: 10,
                color: '#f0ede6',
                fontSize: '0.85rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#c9a96e')}
              onBlur={(e) => (e.target.style.borderColor = '#252525')}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || !connected}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: input.trim() && connected ? '#c9a96e' : '#1a1a1a',
                border: 'none',
                cursor: input.trim() && connected ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && connected ? '#0a0a0a' : '#555'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
