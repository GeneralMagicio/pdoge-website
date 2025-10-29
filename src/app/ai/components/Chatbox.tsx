'use client';

import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import FeedbackModal from './FeedbackModal';
import InputArea from './InputArea';
import { useWindowLocation } from '@/app/utils';
import { AnalysisResult } from '@/server/contractAnalysis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metrics?: { key: string; label: string; value: string }[];
  verdictLine?: string | null;
  token?: { address: string; name?: string; symbol?: string } | null;
  vulnerabilities?: { severity: number; text: string }[];
}

interface ContractAnalyzerProps {
  initialQuery?: string;
}

export default function ContractAnalyzer({ initialQuery }: ContractAnalyzerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Enter a token contract address (0x...) or paste the contract code. I\'ll fetch metadata (holders, liquidity/TVL, age, distribution) and analyze risks.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSentRef = useRef(false);
  const location = useWindowLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
        const contentStr: string = data.message || '';
        const metrics = Array.isArray(data.metrics) ? data.metrics : undefined;
        const token = data?.token ?? null;
        type ServerVuln = AnalysisResult['vulnerabilities'][number];
        const serverVulns: { severity: number; text: string }[] = Array.isArray(data.vulnerabilities)
          ? (data.vulnerabilities as ServerVuln[]).map((v) => {
              const sev = Number(v?.severity) || 0;
              const parts: string[] = [];
              if (v?.description) parts.push(String(v.description));
              return { severity: sev, text: parts.join(' — ') };
            })
          : [];
        const explicitVerdict: string | null = typeof data?.verdictLine === 'string' ? data.verdictLine : null;
        const verdictMatch = !explicitVerdict ? contentStr.match(/^FINAL VERDICT:.*$/im) : null;
        const verdictLine = explicitVerdict || (verdictMatch ? verdictMatch[0] : null);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: contentStr, metrics, verdictLine, token, vulnerabilities: serverVulns },
        ]);
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

  // Auto-run analysis once if an initial query is provided (from header search)
  useEffect(() => {
    console.log("parameters:", initialQuery, !hasAutoSentRef.current, !isLoading, location);
    if (initialQuery && initialQuery.trim() && !hasAutoSentRef.current && !isLoading) {
      console.log("Entering if statement");
      hasAutoSentRef.current = true;
      // Slight delay to allow initial render
      // const timer = setTimeout(() => {
      //   console.log("sending message:", initialQuery);
      //   sendMessage(initialQuery);
      // }, 0);
      sendMessage(initialQuery);
      // return () => clearTimeout(timer);
    }
  }, [initialQuery, isLoading, location]);

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
          PolyDoge AI
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
      {/* Floating Feedback trigger */}
      <button
        type="button"
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#9654d2] text-white px-4 py-3 shadow-lg hover:bg-[#8548c8] focus:outline-none focus:ring-2 focus:ring-[#9654d2]/50"
        aria-label="Open feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4a2 2 0 00-2 2v13.5A2.5 2.5 0 004.5 20H18l4 4V4a2 2 0 00-2-2zm-3 7H7a1 1 0 110-2h10a1 1 0 110 2zm0 4H7a1 1 0 110-2h10a1 1 0 110 2z" />
        </svg>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal */}
      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        messages={messages.map((m) => ({ role: m.role, content: m.content }))}
      />
    </div>
  );
}