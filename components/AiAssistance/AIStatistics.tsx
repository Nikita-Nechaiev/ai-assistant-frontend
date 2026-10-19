import React from 'react';

import { FiZap, FiFileText, FiStar } from 'react-icons/fi';

import { Card } from '@/components/ui/card';
import { formatAiToolName } from '@/helpers/aiToolPresentation';

interface AIStatisticsProps {
  firstRequestDate: Date | null;
  totalRequests: number;
  totalWordCount: number;
  mostUsedTool: string | null;
}

const AIStatistics: React.FC<AIStatisticsProps> = ({
  firstRequestDate,
  totalRequests,
  totalWordCount,
  mostUsedTool,
}) => {
  const format = new Intl.NumberFormat('en-US');
  const hasDate = firstRequestDate && !Number.isNaN(firstRequestDate.getTime());
  const stats = [
    {
      title: 'AI requests',
      value: format.format(totalRequests),
      detail: 'Ideas explored with a little assistance',
      Icon: FiZap,
    },
    {
      title: 'Words generated',
      value: format.format(totalWordCount),
      detail: 'From a first thought to a finished draft',
      Icon: FiFileText,
    },
    {
      title: 'Your favorite tool',
      value: mostUsedTool ? formatAiToolName(mostUsedTool) : 'Yet to be discovered',
      detail: 'Find the tools that fit the way you work',
      Icon: FiStar,
    },
  ];

  return (
    <div>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Your AI at a glance</h2>
        <span className='text-[13px] text-muted-foreground'>
          {hasDate
            ? `Since ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(firstRequestDate)}`
            : 'All-time activity'}
        </span>
      </div>
      <div className='grid grid-cols-3 gap-5'>
        {stats.map((stat) => {
          const { title, value, detail, Icon } = stat;

          return (
            <Card key={title} className='border-border px-5 py-5 shadow-card'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>{title}</p>
                <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary'>
                  <Icon size={16} aria-hidden='true' />
                </span>
              </div>
              <p
                className={`mt-2.5 font-semibold tracking-tight ${title === 'Your favorite tool' ? 'text-2xl leading-9' : 'text-[32px] leading-9'}`}
              >
                {value}
              </p>
              <p className='mt-2 text-sm leading-5 text-muted-foreground'>{detail}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AIStatistics;
