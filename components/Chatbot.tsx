
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { CloseIcon, SendIcon } from './Icon';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  isPastelMode: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isThinking, isPastelMode }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;
  
  const theme = {
    bg: isPastelMode ? 'bg-pink-100' : 'bg-gray-800',
    headerBorder: isPastelMode ? 'border-pink-200' : 'border-gray-700',
    headerText: isPastelMode ? 'text-pink-900' : 'text-white',
    closeIcon: isPastelMode ? 'text-pink-500 hover:text-pink-700' : 'text-gray-400 hover:text-white',
    messageUserBg: isPastelMode ? 'bg-pink-500' : 'bg-indigo-600',
    messageBotBg: isPastelMode ? 'bg-pink-200' : 'bg-gray-700',
    messageBotText: isPastelMode ? 'text-pink-900' : 'text-gray-200',
    footerBorder: isPastelMode ? 'border-pink-200' : 'border-gray-700',
    inputBg: isPastelMode ? 'bg-white' : 'bg-gray-700',
    inputBorder: isPastelMode ? 'border-pink-300' : 'border-gray-600',
    inputText: isPastelMode ? 'text-pink-900' : 'text-white',
    inputFocusRing: isPastelMode ? 'focus:ring-pink-400' : 'focus:ring-indigo-500',
    inputFocusBorder: isPastelMode ? 'focus:border-pink-400' : 'focus:border-indigo-500',
    sendButtonBg: isPastelMode ? 'bg-pink-500 hover:bg-pink-600' : 'bg-indigo-600 hover:bg-indigo-700',
  };


  return (
    <div className={`fixed bottom-24 right-6 w-96 h-[60vh] shadow-2xl rounded-2xl flex flex-col z-50 animate-fade-in-up transition-colors duration-500 ${theme.bg}`}>
      <header className={`flex justify-between items-center p-4 border-b ${theme.headerBorder}`}>
        <h3 className={`text-lg font-bold ${theme.headerText}`}>AI Filmmaking Assistant</h3>
        <button onClick={onClose} className={theme.closeIcon}>
          <CloseIcon />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? `${theme.messageUserBg} text-white rounded-br-none` : `${theme.messageBotBg} ${theme.messageBotText} rounded-bl-none`}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
         {isThinking && (
          <div className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${theme.messageBotBg} ${theme.messageBotText} rounded-bl-none flex items-center space-x-2`}>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className={`p-4 border-t ${theme.footerBorder}`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className={`flex-1 rounded-full py-2 px-4 border transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocusRing} ${theme.inputFocusBorder}`}
            disabled={isThinking}
          />
          <button type="submit" disabled={isThinking || !input.trim()} className={`text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.sendButtonBg}`}>
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chatbot;
