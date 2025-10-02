import { ReactNode } from 'react';
import VulnerabilityCard from './VulnerabilityCard';
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
    // For regular messages, just display the text
    messageContent = (
      <div className="whitespace-pre-wrap">{message.content}</div>
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
      </div>
    </div>
  );
}