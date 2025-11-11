"use client";
import { ReactNode, useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
// @ts-expect-error SchemaRegistry and SchemaEncoder are exported from the eas-sdk package but not typed
import { EAS, SchemaRegistry, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import VulnerabilityCard from './VulnerabilityCard';
import MarkdownRenderer from './MarkdownRenderer';
import TopMetricsBox from './TopMetricsBox';
import VerdictBanner from './VerdictBanner';
import { EASNetworks } from './EAS';
import { useSigner } from '@/app/providers';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    metrics?: { key: string; label: string; value: string }[];
    verdictLine?: string | null;
    token?: { address: string; name?: string; symbol?: string } | null;
    vulnerabilities?: { severity: number; text: string }[];
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
  const [isFlagging, setIsFlagging] = useState(false);
  const { isConnected, address } = useAccount();
  const currentChainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const signer = useSigner();
  // const { data: provider } = useProvider();

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

  const handleTweetClick = async () => {
    if (!isAI) return;
    const contentRaw = message.content || '';
    const token = message.token || null;

    // Parse vulnerabilities and sort by severity desc
    const vulns = parseVulnerabilities(contentRaw)
      .filter(v => v.text)
      .sort((a, b) => b.severity - a.severity);

    // Header lines
    const headerLines: string[] = [];
    headerLines.push('🚨 PDOGE CONTRACT CHECK REPORT 🚨');
    if (token?.name || token?.symbol) {
      const nameSym = `${token?.name || ''}${token?.name && token?.symbol ? ' ' : ''}${token?.symbol ? `(${token.symbol})` : ''}`.trim();
      if (nameSym) headerLines.push(`🔍 Token: ${nameSym}`);
    }
    if (token?.address) headerLines.push(`📜 Contract: ${token.address}`);
    headerLines.push('🔎 Findings:');

    const sevEmoji = (s: number) => {
      if (s >= 9) return '🔴';
      if (s >= 7) return '🟠';
      if (s >= 3) return '🟡';
      return '🔵';
    };

    const maxLen = 280;
    let tweet = headerLines.join('\n');

    const addLineIfFits = (line: string) => {
      const candidate = tweet + '\n' + line;
      if (candidate.length <= maxLen) {
        tweet = candidate;
        return true;
      }
      return false;
    };

    for (const v of vulns) {
      const text = v.text.replace(/\s+/g, ' ').trim();
      const withoutSeverity = text.replace(/Severity[:\s-]*\d+(?:\.\d+)?(?:\s*\/\s*10)?\s*/i, '').trim();
      const split = withoutSeverity.split(/\s[–-]\s/);
      const rawTitle = (split[0] || withoutSeverity).trim();
      const rawSummary = (split[1] || withoutSeverity.slice(rawTitle.length)).trim();
      const score = Math.round(v.severity * 10) / 10;
      const sev = sevEmoji(v.severity);

      // Prefer title – summary (score/10), then fallback to title (score/10)
      const build = (title: string, summary?: string) => summary ? `${sev} ${title} – ${summary} (${score}/10)` : `${sev} ${title} (${score}/10)`;

      // Try full line
      const title = rawTitle.slice(0, 80);
      const summary = rawSummary.slice(0, 160);
      let line = build(title, summary);
      if (addLineIfFits(line)) continue;

      // Try shorten summary
      let remaining = maxLen - (tweet.length + 1) - (build(title, '').length);
      if (remaining > 1) {
        const shortSummary = rawSummary.slice(0, remaining - 1) + '…';
        line = build(title, shortSummary);
        if (addLineIfFits(line)) continue;
      }

      // Try without summary
      line = build(title, undefined);
      if (addLineIfFits(line)) continue;

      // Shorten title to fit minimal form
      remaining = maxLen - (tweet.length + 1) - (build('', undefined).length);
      if (remaining > 1) {
        const shortTitle = rawTitle.slice(0, Math.max(0, remaining - 1)) + '…';
        line = build(shortTitle, undefined);
        if (addLineIfFits(line)) continue;
      }

      // No more space
      break;
    }

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
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
  
  const handleFlagClick = async () => {
    if (!isAI) return;
    try {
      const schemaUid = (process.env.NEXT_PUBLIC_EAS_SCHEMA_UID || '').trim();
      // const easAddress = (process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS || '').trim();
      const desiredChainIdStr = (process.env.NEXT_PUBLIC_EAS_CHAIN_ID || '1').trim();
      const tokenAddress = message.token?.address?.trim();

      if (!schemaUid || !/^0x[0-9a-fA-F]{64}$/.test(schemaUid)) {
        alert('Missing or invalid NEXT_PUBLIC_EAS_SCHEMA_UID (bytes32).');
        return;
      }
      if (!tokenAddress || !/^0x[0-9a-fA-F]{40}$/.test(tokenAddress)) {
        alert('No valid contract address found to flag.');
        return;
      }
      setIsFlagging(true);
      const desiredChainId = Number(desiredChainIdStr);


      // Connect if needed
      if (!isConnected || !address) {
        openConnectModal?.();
        setIsFlagging(false);
        return;
      }

      // Ensure correct chain
      if (currentChainId && currentChainId !== desiredChainId) {
        try {
          await switchChainAsync({ chainId: desiredChainId });
        } catch {
          alert('Please switch to Polygon and try again.');
          setIsFlagging(false);
          return;
        }
      }

      if (typeof window === 'undefined' || !window.ethereum) {
        alert('No wallet found. Please install MetaMask or a compatible wallet.');
        setIsFlagging(false);
        return;
      }

      // Get ethers v5 signer from the connected wallet
      // const provider = new (ethers as unknown as {
      //   providers: { Web3Provider: new (p: Eip1193Provider) => { getSigner: () => unknown } }
      // }).providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      if (!signer) {
        alert('No signer found. Please connect your wallet.');
        setIsFlagging(false);
        return;
      }

      const easConfig = EASNetworks[desiredChainId];
      const schemaRegistry = new SchemaRegistry(easConfig.SchemaRegistry);

      schemaRegistry.connect(signer);
      const schema = await schemaRegistry.getSchema({ uid: schemaUid });
      const schemaEncoder = new SchemaEncoder(schema.schema);
      const schemaData = [
        { name: 'contractAddress', type: 'address', value: tokenAddress },
      ];
      const encodedData = schemaEncoder.encodeData(schemaData);


      // const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const eas = new EAS(easConfig.EASDeployment);
      eas.connect(signer);

      const tx = await eas.attest({
        schema: schemaUid,
        data: {
          data: encodedData,
          recipient: address,
          revocable: true,
        },
      });
  
 
      const uid = await tx.wait();
      alert(`Flag submitted onchain. UID: ${easConfig.explorer}/attestation/view/${uid}`);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'Failed to submit flag.';
      console.error(msg);
      // alert(msg);
    } finally {
      setIsFlagging(false);
    }
  };
  
  const serverVulns = Array.isArray(message.vulnerabilities) ? message.vulnerabilities : [];
  const parsedVulns = parseVulnerabilities(message.content).filter(v => v.severity > 0);
  const shouldRenderParsed = hasAnalyticText && notPlaceholder && parsedVulns.length > 0;
  const shouldRender = serverVulns.length > 0 || shouldRenderParsed;

  if (isAI && shouldRender) {
    const vulnerabilities = serverVulns.length > 0 ? [...serverVulns] : [...parsedVulns];
    
    // Sort by severity in descending order
    vulnerabilities.sort((a, b) => b.severity - a.severity);
    
    messageContent = (
      <div className="space-y-4">
        {Array.isArray(message.metrics) && message.metrics.length > 0 && (
          <TopMetricsBox metrics={message.metrics} token={message.token || null} />
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
                onClick={handleFlagClick}
                disabled={isFlagging}
                className={`inline-flex items-center gap-1 transition-colors ${isFlagging ? 'opacity-60 cursor-not-allowed' : 'hover:text-[#9654d2]'}`}
                aria-label="Flag this contract onchain"
                title="Flag this contract onchain"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M4 4a1 1 0 0 1 1-1h10.5a1 1 0 0 1 .8 1.6l-1 1.4 1 1.4a1 1 0 0 1-.8 1.6H6v9a1 1 0 1 1-2 0V4z"/>
                </svg>
                {isFlagging ? 'Flagging…' : 'Flag'}
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