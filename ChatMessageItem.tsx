import React from 'react';
import { ChatMessage, MessageSender } from '../types';
import { User, Bot, ClipboardPlus } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onFlagMessage?: (messageText: string) => void;
}

const renderMessageWithLinks = (text: string): (string | JSX.Element)[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g; // Matches http:// or https:// URLs
  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    
    const url = match[0];
    
    elements.push(
      <a
        key={`${url}-${match.index}`} // A unique key for the link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-600 hover:text-sky-700 underline font-medium break-all"
      >
        {url} {/* Display the full URL as the link text */}
      </a>
    );
    lastIndex = urlRegex.lastIndex;
  }
  
  // Add any remaining text after the last link
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  
  // If no links were found, return the original text in an array
  return elements.length > 0 ? elements : [text];
};


const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onFlagMessage }) => {
  const isUser = message.sender === MessageSender.USER;

  const handleFlagClick = () => {
    if (onFlagMessage) {
      onFlagMessage(message.text);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full group`}>
      <div className={`flex items-start gap-2.5 max-w-[80%] md:max-w-[70%]`}>
        {!isUser && (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-rose-400 to-amber-500 rounded-full text-white shadow-md">
            <Bot size={20} />
          </div>
        )}
        <div
          className={`p-3.5 rounded-xl shadow-lg relative ${
            isUser
              ? 'bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-br-none'
              : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {renderMessageWithLinks(message.text)}
            {message.isStreaming && <span className="inline-block w-1.5 h-1.5 ml-1.5 bg-current rounded-full animate-pulse"></span>}
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${isUser ? 'text-sky-100' : 'text-slate-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {!isUser && onFlagMessage && (
              <button
                onClick={handleFlagClick}
                title="Flag this message for later discussion"
                aria-label="Flag this message for later discussion"
                className="ml-2 p-1.5 text-slate-400 hover:text-sky-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 rounded-full hover:bg-sky-100/70 focus:bg-sky-100/70"
              >
                <ClipboardPlus size={16} />
              </button>
            )}
          </div>
        </div>
        {isUser && (
           <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full text-white shadow-md">
            <User size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;