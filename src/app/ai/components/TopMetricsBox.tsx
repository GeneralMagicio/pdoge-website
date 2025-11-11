interface TopMetric {
  key: string;
  label: string;
  value: string;
}

interface TokenInfo {
  name?: string;
  symbol?: string;
}

interface TopMetricsBoxProps {
  metrics: TopMetric[];
  token?: TokenInfo | null;
}

export default function TopMetricsBox({ metrics, token }: TopMetricsBoxProps) {
  const hasMetrics = Array.isArray(metrics) && metrics.length > 0;
  const tokenDisplay =
    (token?.name || token?.symbol)
      ? `${token?.name ?? ''}${token?.name && token?.symbol ? ' ' : ''}${token?.symbol ? `(${token.symbol})` : ''}`
      : '';
  if (!hasMetrics && !tokenDisplay) return null;

  const augmentedMetrics: TopMetric[] = tokenDisplay
    ? [{ key: 'token', label: 'Token', value: tokenDisplay }, ...(metrics || [])]
    : (metrics || []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-2">Token quick facts</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {augmentedMetrics.map((m) => (
          <div key={m.key} className="flex items-start">
            <div className="text-xs text-gray-500 mr-2 mt-0.5 whitespace-nowrap">{`${m.label}:`}</div>
            <div className="text-sm text-gray-900 break-all capitalize">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
