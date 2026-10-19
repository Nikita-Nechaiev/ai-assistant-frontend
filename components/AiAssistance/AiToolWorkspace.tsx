'use client';

import React from 'react';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import useStandaloneAiRequest from '@/hooks/ai/useStandaloneAiRequest';

import AiAsssistanceStepper from './AiAssistanceStepper';

const AiToolWorkspace = () => {
  const request = useStandaloneAiRequest();

  return (
    <div className='mx-auto max-w-[1440px]'>
      <Link
        href='/ai-assistance'
        className='mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <FiArrowLeft size={14} aria-hidden='true' />
        Back to AI Assistance
      </Link>
      <div className='mb-7'>
        <p className='mb-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
          A little help for your next idea
        </p>
        <h1 className='text-[32px] font-semibold tracking-[-0.8px]'>Make room for better words.</h1>
        <p className='mt-2 text-base text-muted-foreground'>
          Choose your tool, bring your text, and see where it takes you.
        </p>
      </div>
      <AiAsssistanceStepper
        flow={request.flow}
        isOnDocumentPage={false}
        onSubmit={request.submit}
        onRestart={request.restart}
        isLoading={request.isLoading}
        result={request.result}
        errorMessage={request.errorMessage}
      />
    </div>
  );
};

export default AiToolWorkspace;
