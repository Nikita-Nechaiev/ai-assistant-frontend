'use client';

import React from 'react';

import { AITool } from '@/models/models';

import AiToolCatalog from './AiToolCatalog';

interface Step1SelectToolProps {
  onToolSelect: (tool: AITool) => void;
  isOnDocumentPage: boolean;
}

const Step1SelectTool: React.FC<Step1SelectToolProps> = ({ onToolSelect, isOnDocumentPage }) => (
  <section aria-labelledby='select-tool-heading'>
    <div className='mb-6'>
      <h2 id='select-tool-heading' className='text-[26px] font-semibold tracking-tight'>
        What would you like to work on?
      </h2>
      <p className='mt-2 text-sm leading-6 text-muted-foreground'>
        {isOnDocumentPage
          ? 'Choose a tool, then add text or select a passage from your document.'
          : 'Choose a tool to give your next piece of writing a thoughtful head start.'}
      </p>
    </div>
    <AiToolCatalog onToolSelect={onToolSelect} />
  </section>
);

export default Step1SelectTool;
