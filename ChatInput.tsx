
import React, { useState } from 'react';
import { SendHorizonal, LoaderCircle, BriefcaseMedical } from 'lucide-react';
import { USER_REQUESTS_DOCTOR_DISCUSSION_PHRASE } from '../constants';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDoctorDiscussionClick = () => {
    if (!isLoading) {
      onSendMessage(USER_REQUESTS_DOCTOR_DISCUSSION_PHRASE);
      // Optionally clear input or keep it if user might want to add more context
      // setInputValue(''); 
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white/50 backdrop-blur-md border-t border-white/30 flex items-center gap-2 sm:gap-3 shadow- ऊपर-lg"
    >
      <button
        type="button"
        onClick={handleDoctorDiscussionClick}
        disabled={isLoading}
        className="p-3 text-sky-600 bg-white/70 rounded-xl hover:bg-sky-100/70 disabled:text-slate-400 disabled:bg-slate-200/50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shadow-md hover:shadow-lg active:scale-95 disabled:hover:scale-100"
        aria-label="Mark discussion point for doctor"
        title="Mark discussion point for doctor"
      >
        <BriefcaseMedical size={22} />
      </button>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-grow p-3 border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none custom-scrollbar text-sm text-slate-700 placeholder-slate-500 bg-white/70 shadow-sm focus:shadow-md transition-shadow"
        rows={1}
        style={{ maxHeight: '120px' }}
        disabled={isLoading}
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-3 bg-gradient-to-r from-sky-500 to-rose-500 text-white rounded-xl hover:from-sky-600 hover:to-rose-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-150 ease-in-out flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
        aria-label="Send message"
      >
        {isLoading ? <LoaderCircle size={24} className="animate-spin" /> : <SendHorizonal size={24} className="group-hover:animate-pulse"/>}
      </button>
    </form>
  );
};

export default ChatInput;
