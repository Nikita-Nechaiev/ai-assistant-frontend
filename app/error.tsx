'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { FiAlertCircle, FiGrid, FiRefreshCw } from 'react-icons/fi';

import AppState from '@/components/common/AppState';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <AppState
      eyebrow='Something went wrong'
      title='Let’s get you back on track.'
      description='We couldn’t load this page. Try again, or return to your dashboard to continue working.'
      icon={<FiAlertCircle size={28} aria-hidden='true' />}
    >
      <Button variant='outline' asChild className='h-10 text-sm'>
        <Link href='/dashboard'>
          <FiGrid aria-hidden='true' />
          Dashboard
        </Link>
      </Button>
      <Button onClick={reset} className='h-10 text-sm shadow-blue'>
        <FiRefreshCw aria-hidden='true' />
        Try again
      </Button>
    </AppState>
  );
}
