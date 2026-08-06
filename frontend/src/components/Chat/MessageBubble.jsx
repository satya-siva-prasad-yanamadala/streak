import ReactMarkdown from 'react-markdown';
import { Bot, TrendingUp, User } from 'lucide-react';
import './MessageBubble.css';

export default function MessageBubble({ message, accentClass }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'} animate-fade-in`}>
      {!isUser && (
        <div className={`message-avatar bot-avatar ${accentClass}`}>
          {accentClass === 'gym' ? <Bot size={16} color="#10B981" /> : <TrendingUp size={16} color="#F59E0B" />}
        </div>
      )}

      <div className={`message-bubble ${isUser ? 'user-bubble' : `bot-bubble ${accentClass}`}`}>
        {isUser ? (
          <p className="message-text user-text">{message.content}</p>
        ) : (
          <div className="message-markdown">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <div className="message-time">{time}</div>
      </div>

      {isUser && (
        <div className="message-avatar user-avatar">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
