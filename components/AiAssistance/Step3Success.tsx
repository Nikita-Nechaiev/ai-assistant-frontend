'use client';

import React from 'react';

import { FiCheck, FiRefreshCw, FiArrowRight, FiFilePlus } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import TextResultPanel from './TextResultPanel';

interface Step3SuccessProps {
  result: string | undefined;
  onCopyResult: () => void;
  onRestart: () => void;
  onPasteInDocument?: () => void;
  pasteDisabled?: boolean;
}

const Step3Success: React.FC<Step3SuccessProps> = ({
  result,
  onCopyResult,
  onRestart,
  onPasteInDocument,
  pasteDisabled = false,
}) => {
  const wordCount = result?.trim() ? result.trim().split(/\s+/).length : 0;

  return (
    <section aria-labelledby='ai-result-heading' className='mx-auto max-w-[960px]'>
      <div className='mb-6 flex items-start justify-between gap-6'>
        <div>
          <Badge
            variant='secondary'
            className='mb-3 gap-1.5 border border-blue-100 bg-accent px-2 py-1 text-[13px] font-medium text-primary'
          >
            {result ? <FiCheck size={11} aria-hidden='true' /> : null}
            {result ? 'AI-generated' : 'No result available'}
          </Badge>
          <h2 id='ai-result-heading' className='text-[28px] font-semibold tracking-tight'>
            {result ? 'Your result is ready.' : 'Nothing to show just yet.'}
          </h2>
          <p className='mt-2 text-sm leading-6 text-muted-foreground'>
            {result
              ? onPasteInDocument
                ? 'Copy the result, or use Paste in document to add it to the end of your document.'
                : 'Copy the result to use it in a document or another app.'
              : 'Choose a tool and submit your text to get a result.'}
          </p>
        </div>
        {result && (
          <span className='mt-1 shrink-0 text-[13px] text-muted-foreground'>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} generated
          </span>
        )}
      </div>
      <TextResultPanel title='AI result' text={result} onCopy={onCopyResult} className='shadow-card' />
      <div className='mt-5 flex flex-wrap items-center justify-between gap-6'>
        <p className='text-[13px] leading-5 text-muted-foreground'>
          {result
            ? 'You can find this result in the request history on the AI Assistance page.'
            : 'Previous results are available in the request history on the AI Assistance page.'}
        </p>
        <div className='flex shrink-0 flex-wrap items-center gap-2.5'>
          <Button
            type='button'
            variant={onPasteInDocument ? 'outline' : 'default'}
            onClick={onRestart}
            className='text-sm'
          >
            <FiRefreshCw aria-hidden='true' />
            Try another tool
            <FiArrowRight aria-hidden='true' />
          </Button>
          {onPasteInDocument && (
            <Button
              type='button'
              onClick={onPasteInDocument}
              disabled={pasteDisabled || !result?.trim()}
              className='text-sm'
            >
              <FiFilePlus aria-hidden='true' />
              Paste in document
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Step3Success;
