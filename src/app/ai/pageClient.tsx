'use client';

import { useSearchParams } from 'next/navigation';
import ContractAnalyzer from './components/Chatbox';

export default function AIPageContent() {
  const params = useSearchParams();
  const q = params.get('q') || undefined;

  return <ContractAnalyzer initialQuery={q} />;
}


