'use client';

import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import InputArea from './InputArea';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ContractAnalyzer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Paste your cryptocurrency token contract code here, and I\'ll analyze it for potential vulnerabilities.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, there was an error analyzing the contract. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error analyzing the contract. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#9654d2] to-[#8045b8] text-white p-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="font-medium">Contract Analysis</h2>
        </div>
        <div className="flex items-center text-xs bg-white bg-opacity-20 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          GPT-4o-mini
        </div>
      </div>
      
      <div className="h-[60vh] overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-[#9654d2] rounded-full"></div>
              <div className="h-2 w-2 bg-[#9654d2] rounded-full delay-150 animate-bounce"></div>
              <div className="h-2 w-2 bg-[#9654d2] rounded-full delay-300 animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <InputArea onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}