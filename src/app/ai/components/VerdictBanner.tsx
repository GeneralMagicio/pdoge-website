interface VerdictBannerProps {
  verdictLine: string; // The single-line: "FINAL VERDICT: ..."
}

function mapSeverityFromLine(line: string): { bg: string; border: string; text: string } {
  // Detect emoji or severity keyword
  if (/🔴|Critical/i.test(line)) return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' };
  if (/🟠|High/i.test(line)) return { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' };
  if (/🟡|Medium/i.test(line)) return { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' };
  if (/⚪|Praise/i.test(line)) return { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-700' };
  // Low / default
  return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' };
}

export default function VerdictBanner({ verdictLine }: VerdictBannerProps) {
  if (!verdictLine) return null;
  const styles = mapSeverityFromLine(verdictLine);
  const display = verdictLine.replace(/^FINAL VERDICT:\s*/i, '');
  return (
    <div className={`border-l-4 ${styles.border} rounded-lg overflow-hidden shadow-sm`}>
      <div className={`p-3 ${styles.bg} ${styles.text} text-sm font-medium`}>
        {display}
      </div>
    </div>
  );
}


