'use client';

import React, { useState } from 'react';

import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';

import { AITool } from '@/models/models';
import { aiToolList } from '@/helpers/aiToolsList';
import { getAiToolPresentation, AiToolCategory } from '@/helpers/aiToolPresentation';
import { cn } from '@/lib/utils';

interface AiToolCatalogProps {
  onToolSelect: (tool: AITool) => void;
}

const categories: ('All tools' | AiToolCategory)[] = ['All tools', 'Writing', 'Analysis', 'Translation'];

const AiToolCatalog = ({ onToolSelect }: AiToolCatalogProps) => {
  const [category, setCategory] = useState<(typeof categories)[number]>('All tools');
  const tools = aiToolList.filter(
    (tool) => category === 'All tools' || getAiToolPresentation(tool).category === category,
  );

  return (
    <div>
      <div className='mb-5 flex items-center justify-between gap-4'>
        <div
          role='group'
          aria-label='Filter AI tools'
          className='flex gap-1 rounded-lg border border-border bg-white p-1'
        >
          {categories.map((item) => (
            <button
              key={item}
              type='button'
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={cn(
                'rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                category === item
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <p className='text-[13px] text-muted-foreground'>
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'} to make it your own
        </p>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        {tools.map((tool) => {
          const { title, description, category: toolCategory, Icon } = getAiToolPresentation(tool);
          const content = (
            <>
              <div className='mb-5 flex items-center justify-between'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100/70 bg-accent/70 text-primary'>
                  <Icon size={19} aria-hidden='true' />
                </span>
                <FiArrowUpRight
                  size={15}
                  className='text-slate-300 transition-colors group-hover:text-primary'
                  aria-hidden='true'
                />
              </div>
              <p className='mb-1.5 text-[13px] font-medium uppercase tracking-wider text-muted-foreground'>
                {toolCategory}
              </p>
              <h3 className='text-lg font-semibold tracking-tight transition-colors group-hover:text-primary'>
                {title}
              </h3>
              <p className='mt-2 max-w-[270px] text-sm leading-6 text-muted-foreground'>{description}</p>
              <span className='mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary'>
                Use tool
                <FiArrowRight size={12} aria-hidden='true' />
              </span>
            </>
          );
          const className =
            'group block rounded-xl border border-border bg-white p-5 text-left shadow-card transition-colors hover:border-primary/30 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

          return (
            <button
              type='button'
              key={tool.id}
              aria-label={tool.name}
              onClick={() => onToolSelect(tool)}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AiToolCatalog;
