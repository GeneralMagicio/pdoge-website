import { NextResponse } from 'next/server';
import { performAnalysis } from '@/server/contractAnalysis';

export async function POST(req: Request) {
  try {
    const { content, messages } = await req.json();
    const result = await performAnalysis({ content, messages });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing contract:', error);
    return NextResponse.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}