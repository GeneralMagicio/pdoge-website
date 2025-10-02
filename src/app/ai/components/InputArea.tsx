'use client';

import { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="relative">
        <textarea
          className="w-full p-4 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9654d2] focus:border-transparent resize-none shadow-sm transition-all"
          rows={4}
          placeholder="Enter token address (0x...) — or paste contract code if you prefer"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute bottom-4 right-4 bg-[#9654d2] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#8548c8] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </span>
          ) : (
            <>
              Analyze
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-500">
          AI will analyze token contracts for vulnerabilities.
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enter token contract address (0x...)
        </div>
      </div>
    </form>
  );
}