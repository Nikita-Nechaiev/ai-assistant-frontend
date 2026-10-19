import React from 'react';

import { FiX } from 'react-icons/fi';

import { Button } from '@/components/ui/button';

interface PanelHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
}

const PanelHeader = ({ title, description, icon, onClose }: PanelHeaderProps) => (
  <div className='flex shrink-0 items-center gap-3 border-b border-border bg-white px-5 py-4'>
    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
      {icon}
    </span>
    <div className='min-w-0 flex-1'>
      <h2 className='text-xl font-semibold leading-7 tracking-tight'>{title}</h2>
      <p className='mt-1 text-sm leading-6 text-muted-foreground'>{description}</p>
    </div>
    <Button
      type='button'
      size='icon'
      variant='ghost'
      aria-label={`Close ${title.toLowerCase()}`}
      onClick={onClose}
      className='-mr-1 h-8 w-8 shrink-0 text-muted-foreground'
    >
      <FiX aria-hidden='true' />
    </Button>
  </div>
);

export default PanelHeader;
