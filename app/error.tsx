'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <Alert variant="error" className="mb-6">
          <h2 className="text-xl font-bold text-[#5D4037] mb-2 font-[var(--font-playfair)]">
            Something went wrong!
          </h2>
          <p className="text-[#333333]">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
