import React from 'react';

import { FiArrowUpRight, FiZap } from 'react-icons/fi';

import { IAiToolUsage } from '@/models/models';
import { Button } from '@/components/ui/button';
import { formatAiToolName } from '@/helpers/aiToolPresentation';
import { findAiTool } from '@/helpers/aiToolRegistry';
import { formatAiUsageDate } from '@/helpers/timeHelpers';

export default function AiUsageRow({ usage, onView }: { usage: IAiToolUsage; onView: (usage: IAiToolUsage) => void }) {
  const Icon = findAiTool(usage.toolName)?.Icon ?? FiZap;

  return (
    <tr className='transition-colors hover:bg-accent/20'>
      <td className='px-5 py-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary'>
            <Icon size={15} aria-hidden='true' />
          </span>
          <span className='truncate text-sm font-medium'>{formatAiToolName(usage.toolName)}</span>
        </div>
      </td>
      <td className='px-5 py-4'>
        <p className='truncate text-sm text-muted-foreground'>{usage.sentText}</p>
      </td>
      <td className='px-5 py-4 text-sm text-muted-foreground'>{formatAiUsageDate(usage.timestamp)}</td>
      <td className='px-5 py-4 text-right'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => onView(usage)}
          aria-label={`View ${formatAiToolName(usage.toolName)} result`}
          className='h-8 px-2 text-sm text-primary'
        >
          View result
          <FiArrowUpRight size={12} aria-hidden='true' />
        </Button>
      </td>
    </tr>
  );
}
