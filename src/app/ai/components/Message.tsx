"use client";
import { ReactNode } from 'react';
import VulnerabilityCard from './VulnerabilityCard';
import MarkdownRenderer from './MarkdownRenderer';
import TopMetricsBox from './TopMetricsBox';
import VerdictBanner from './VerdictBanner';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    metrics?: { key: string; label: string; value: string }[];
    verdictLine?: string | null;
  };
}

// Function to parse vulnerability entries from AI response
const parseVulnerabilities = (content: string): { severity: number; text: string }[] => {
  // Try to split by distinct vulnerability sections
  const sections = content.split(/\n(?:\s*\n)+|\n\d+\.\s+/);
  const vulnerabilities: { severity: number; text: string }[] = [];
  
  for (let section of sections) {
    section = section.trim();
    if (!section) continue;
    if (/^FINAL VERDICT:/i.test(section)) continue; // Do not treat verdict as a vulnerability
    
    // Look for severity indicators
    const severityMatch = section.match(/(?:Severity[:\s-]*(\d+(?:\.\d+)?)\s*\/\s*10|Severity[:\s-]*(\d+(?:\.\d+)?))/i);
    
    let severity = 0;
    if (severityMatch) {
      severity = parseFloat(severityMatch[1] || severityMatch[2]);
    }
    
    // If no explicit severity found but contains keywords, assign default values
    if (severity === 0) {
      if (/critical|severe|serious/i.test(section)) severity = 9;
      else if (/high/i.test(section)) severity = 7;
      else if (/medium/i.test(section)) severity = 5;
      else if (/low/i.test(section)) severity = 3;
      else if (/info|note/i.test(section)) severity = 1;
    }
    
    vulnerabilities.push({
      severity,
      text: section
    });
  }
  
  return vulnerabilities;
};

export default function Message({ message }: MessageProps) {
  const isAI = message.role === 'assistant';
  
  // For AI messages, check if it contains vulnerability analysis
  let messageContent: ReactNode;
  const content = (message.content || '').trim();
  const placeholderRegex = /(enter a token contract address|paste the contract code|sorry,? there was an error|error analyzing the contract|please try again)/i;
  const analyticHintRegex = /(FINAL VERDICT|Severity|Vulnerability|Risk|Finding|Recommendation)/i;
  const hasMetrics = Array.isArray(message.metrics) && message.metrics.length > 0;
  const hasVerdict = Boolean(message.verdictLine);
  const hasAnalyticText = analyticHintRegex.test(content);
  const notPlaceholder = !placeholderRegex.test(content) && content.length > 30;
  const shouldShowShare = isAI && notPlaceholder && (hasMetrics || hasVerdict || hasAnalyticText);

  const handleTweetClick = () => {
    if (!isAI) return;
    const raw = message.content || '';
    const singleLine = raw.replace(/\s+/g, ' ').trim();
    const maxLen = 280;
    const truncated = singleLine.length > maxLen ? singleLine.slice(0, maxLen - 1) + '…' : singleLine;
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(truncated)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleJsonClick = () => {
    if (!isAI) return;
    const payload = {
      type: 'assistant_response',
      content: message.content,
      metrics: message.metrics ?? null,
      verdictLine: message.verdictLine ?? null,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `polydoge-ai-response-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (isAI && message.content.includes('Severity')) {
    const vulnerabilities = parseVulnerabilities(message.content);
    
    // Sort by severity in descending order
    vulnerabilities.sort((a, b) => b.severity - a.severity);
    
    messageContent = (
      <div className="space-y-4">
        {Array.isArray(message.metrics) && message.metrics.length > 0 && (
          <TopMetricsBox metrics={message.metrics} />
        )}
        {message.verdictLine && (
          <VerdictBanner verdictLine={message.verdictLine} />
        )}
        {vulnerabilities.map((vulnerability, index) => (
          <VulnerabilityCard 
            key={index}
            severity={vulnerability.severity}
            text={vulnerability.text}
          />
        ))}
      </div>
    );
  } else {
    // For regular messages, render markdown with syntax highlighting
    messageContent = (
      <MarkdownRenderer content={message.content} />
    );
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-lg p-4 ${
          isAI
            ? 'bg-gray-100 text-gray-800'
            : 'bg-[#9654d2] text-white'
        }`}
      >
        {messageContent}
        {shouldShowShare && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <button
                type="button"
                onClick={handleTweetClick}
                className="inline-flex items-center gap-1 hover:text-[#9654d2] transition-colors"
                aria-label="Share as Tweet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.92c-.74.32-1.53.53-2.36.63.85-.51 1.49-1.32 1.79-2.28-.79.47-1.67.8-2.6.98A4.13 4.13 0 0 0 16.1 4c-2.29 0-4.15 1.86-4.15 4.15 0 .33.04.65.11.96-3.45-.17-6.51-1.83-8.56-4.35-.36.63-.57 1.36-.57 2.14 0 1.48.75 2.79 1.89 3.55-.7-.02-1.36-.22-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.15-1.13.15-.27 0-.54-.03-.79-.08.54 1.69 2.11 2.92 3.97 2.95A8.31 8.31 0 0 1 2 19.54 11.73 11.73 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53.8-.58 1.49-1.3 2.04-2.12z" />
                </svg>
                Tweet
              </button>
              <button
                type="button"
                onClick={handleJsonClick}
                className="inline-flex items-center gap-1 hover:text-[#9654d2] transition-colors"
                aria-label="Download JSON"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42L11 13.59V4a1 1 0 0 1 1-1z" />
                  <path d="M5 20a2 2 0 0 1-2-2v-2a1 1 0 1 1 2 0v2h14v-2a1 1 0 1 1 2 0v2a2 2 0 0 1-2 2H5z" />
                </svg>
                JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}