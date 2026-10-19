import React from 'react';

import { FiFileText, FiCheck } from 'react-icons/fi';

import { IVersion } from '@/models/models';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VersionItemProps {
  version: IVersion;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: (version: IVersion) => void;
  onMouseEnter: (version: IVersion) => void;
  onMouseLeave: () => void;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isSelected,
  isCurrent,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const date = new Date(version.createdAt);
  const hasDate = !Number.isNaN(date.getTime());

  return (
    <div onMouseEnter={() => onMouseEnter(version)} onMouseLeave={onMouseLeave}>
      <button
        type='button'
        aria-pressed={isSelected}
        onClick={() => onClick(version)}
        onFocus={() => onMouseEnter(version)}
        onBlur={onMouseLeave}
        className={cn(
          'w-full rounded-xl border p-4 text-left shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isSelected ? 'border-primary/40 bg-accent/60' : 'border-border bg-white hover:border-blue-200',
        )}
      >
        <div className='mb-3 flex items-center justify-between'>
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              isSelected ? 'bg-primary text-white' : 'bg-accent text-primary',
            )}
          >
            <FiFileText size={15} aria-hidden='true' />
          </span>
          {isCurrent && (
            <Badge
              variant='secondary'
              className='gap-1 border border-blue-100 bg-accent text-[13px] font-medium text-primary'
            >
              <FiCheck size={10} aria-hidden='true' />
              Current
            </Badge>
          )}
        </div>
        <p className='text-sm font-semibold'>
          {hasDate
            ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
            : 'Saved version'}
        </p>
        <p className='mt-1.5 truncate text-[13px] text-muted-foreground'>{version.userEmail}</p>
        {hasDate && (
          <time dateTime={date.toISOString()} className='mt-3 block text-[13px] text-muted-foreground'>
            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </time>
        )}
      </button>
    </div>
  );
};

export default VersionItem;
