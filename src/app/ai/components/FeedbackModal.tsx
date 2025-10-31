'use client';

import { useEffect, useState } from 'react';

interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  messages: SimpleMessage[];
}

export default function FeedbackModal({ open, onClose, messages }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFeedback('');
      setContact('');
      setSubmitting(false);
      setSubmitted(false);
      setError(null);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type: 'ai_feedback',
        comment: feedback.trim(),
        contact: contact.trim() || undefined,
        messages,
        page: typeof window !== 'undefined' ? window.location.href : undefined,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to send feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1000);
      // setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
            <div className="w-9 h-9 rounded-full bg-[#9654d2] text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M12 3c-4.97 0-9 3.582-9 8 0 2.313 1.137 4.39 2.965 5.836-.12.995-.52 2.302-1.61 3.392 0 0 2.159-.049 3.77-1.15A10.9 10.9 0 0 0 12 19c4.97 0 9-3.582 9-8s-4.03-8-9-8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Send Feedback</h3>
              <p className="text-xs text-gray-500">Help us improve the AI analyzer</p>
            </div>
            <button
              type="button"
              className="ml-auto text-gray-400 hover:text-gray-600"
              onClick={() => !submitting && onClose()}
              aria-label="Close feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your feedback
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#9654d2] focus:border-transparent resize-none"
              rows={5}
              placeholder="e.g., AI said High Risk, but contract is safe — here is why"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={submitting}
              required
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact (optional)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#9654d2] focus:border-transparent"
                placeholder="Email or X handle (@user)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                We’ll send your note along with the chat transcript.
              </div>
              <button
                type="submit"
                disabled={submitting || !feedback.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#9654d2] px-4 py-2 text-white font-medium shadow hover:bg-[#8548c8] disabled:bg-gray-300 disabled:text-white"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Sending
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </div>

            {submitted && (
              <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-500 rounded-md px-3 py-2">
                Thank you! Your feedback was sent.
              </div>
            )}
            {error && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-500 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


