import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Apple, Wallet, Bot, TrendingUp } from 'lucide-react';
import './ChatWindow.css';

export default function ChatWindow({
  messages,
  onSend,
  loading,
  placeholder,
  accentClass, // 'gym' | 'money'
  quickReplies = [],
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-window glass-card ${accentClass}`}>
      {/* Messages area */}
      <div className="chat-messages" id="chat-messages-container">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              {accentClass === 'gym' ? <Apple size={48} color="#10B981" /> : <Wallet size={48} color="#F59E0B" />}
            </div>
            <div className="chat-empty-title">
              {accentClass === 'gym' ? 'Start logging your meals!' : 'Start tracking your money!'}
            </div>
            <div className="chat-empty-desc">
              {accentClass === 'gym'
                ? 'Type what you ate and I\'ll calculate your macros instantly.'
                : 'Tell me what you spent or earned today.'}
            </div>
            {quickReplies.length > 0 && (
              <div className="chat-quick-replies">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    className={`chat-quick-reply btn-${accentClass}`}
                    onClick={() => onSend(qr)}
                    id={`quick-reply-${i}`}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} accentClass={accentClass} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="chat-typing animate-fade-in">
            <div className="chat-typing-avatar">
              {accentClass === 'gym' ? <Bot size={20} color="#10B981" /> : <TrendingUp size={20} color="#F59E0B" />}
            </div>
            <div className="chat-typing-dots">
              <span style={{ animationDelay: '0ms' }} />
              <span style={{ animationDelay: '150ms' }} />
              <span style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          id={`chat-input-${accentClass}`}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={loading}
        />
        <button
          id={`chat-send-btn-${accentClass}`}
          className={`chat-send-btn btn btn-${accentClass}`}
          onClick={handleSend}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          {loading ? <div className="spinner" /> : '↑'}
        </button>
      </div>
    </div>
  );
}
