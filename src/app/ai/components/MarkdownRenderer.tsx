/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

// Lightweight language detection from fenced code info string
function getLanguageFromClassName(className?: string): string | undefined {
  if (!className) return undefined;
  const match = /language-([\w-]+)/.exec(className);
  return match ? match[1] : undefined;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Work around TS/React 19 type issues with react-syntax-highlighter
  const Highlighter = SyntaxHighlighter as unknown as React.ComponentType<any>;
  return (
    <div className="markdown-container prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const language = getLanguageFromClassName(className) || undefined;
            const codeText = String(children).replace(/\n$/, '');
            // Fallback heuristic: if react-markdown mislabels single-line code without a language as a block,
            // render it inline instead of a full block highlighter.
            const shouldRenderInline = Boolean(inline) || (!language && !codeText.includes('\n') && codeText.length <= 120);
            if (shouldRenderInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200 text-[0.85em]" {...props}>
                  {codeText}
                </code>
              );
            }
            return (
              <div className="my-3 overflow-hidden rounded-lg border border-gray-200">
                <Highlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '12px' }}
                  showLineNumbers
                  wrapLongLines
                >
                  {codeText}
                </Highlighter>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


