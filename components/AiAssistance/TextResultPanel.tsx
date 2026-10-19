import React from 'react';

import { FiCopy } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TextResultPanelProps {
  title: string;
  text: string | undefined;
  onCopy: () => void;
  className?: string;
}

const TextResultPanel = ({ title, text, onCopy, className }: TextResultPanelProps) => (
  <div className={cn('overflow-hidden rounded-xl border border-border bg-white', className)}>
    <div className='flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-3'>
      <h3 className='text-base font-medium'>{title}</h3>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={onCopy}
        disabled={!text}
        aria-label={`Copy ${title.toLowerCase()}`}
        className='h-7 text-[13px] text-muted-foreground'
      >
        <FiCopy size={13} aria-hidden='true' />
        Copy
      </Button>
    </div>
    <div className='max-h-[390px] min-h-[220px] overflow-y-auto whitespace-pre-wrap break-words px-5 py-5 text-base leading-7 text-foreground'>
      {text || 'No text available.'}
    </div>
  </div>
);

export default TextResultPanel;
