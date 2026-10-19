'use client';

import React from 'react';

import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';

import { Button } from '@/components/ui/button';

const DocNotFound = () => {
  const router = useRouter();
  const { id: sessionId } = useParams<{ id: string }>();

  return (
    <div className='mx-auto flex min-h-[65vh] max-w-[600px] items-center justify-center px-8'>
      <div className='w-full rounded-2xl border border-border bg-white px-10 py-14 text-center shadow-card'>
        <span className='mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-accent text-primary'>
          <FiFileText size={25} aria-hidden='true' />
        </span>
        <h1 className='text-2xl font-semibold tracking-tight'>Document not found</h1>
        <p className='mt-3 text-base leading-6 text-muted-foreground'>
          The document you are trying to access does not exist or has been deleted.
        </p>
        <Button
          onClick={() => router.replace(sessionId ? `/session/${sessionId}` : '/dashboard')}
          className='mt-7 gap-2 text-sm'
        >
          <FiArrowLeft size={14} aria-hidden='true' />
          Return to Session
        </Button>
      </div>
    </div>
  );
};

export default DocNotFound;
