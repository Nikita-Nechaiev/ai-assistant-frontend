'use client';

import React from 'react';

import { FiCheck, FiZap } from 'react-icons/fi';

import Step1SelectTool from '@/components/AiAssistance/Step1SelectTool';
import Step2Input from '@/components/AiAssistance/Step2Input';
import Step3Success from '@/components/AiAssistance/Step3Success';
import useClipboard from '@/hooks/common/useClipboard';
import { AiStepperState } from '@/hooks/ai/useAiStepperState';
import { cn } from '@/lib/utils';

export interface AiAsssistanceStepperProps {
  flow: AiStepperState;
  isOnDocumentPage: boolean;
  onSubmit: () => void;
  onRestart: () => void;
  isLoading: boolean;
  result?: string;
  handleActivateTextSelection?: () => void;
  errorMessage?: string;
  onPasteInDocument?: () => void;
  pasteDisabled?: boolean;
}

export default function AiAsssistanceStepper({
  flow,
  onSubmit,
  onRestart,
  isLoading,
  result,
  isOnDocumentPage,
  handleActivateTextSelection,
  errorMessage,
  onPasteInDocument,
  pasteDisabled,
}: AiAsssistanceStepperProps) {
  const { currentStep, selectedTool, inputValue, setInputValue, targetLanguage, setTargetLanguage } = flow;
  const copy = useClipboard(
    'Result copied to clipboard',
    'Could not copy the result. Please select and copy the text manually.',
  );

  return (
    <div
      className={cn(
        'saas-shell w-full min-w-0 text-foreground',
        isOnDocumentPage ? 'h-full overflow-y-auto px-2 py-1' : 'pb-4',
      )}
    >
      <div className='mb-7 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-white px-6 py-5'>
        <ol aria-label='AI request progress' className='flex flex-wrap items-center gap-4 sm:gap-7'>
          {['Choose a tool', 'Add your text', 'Your result'].map((label, index) => {
            const step = index + 1;
            const isActive = currentStep === step;
            const isComplete = currentStep > step;

            return (
              <li key={label} aria-current={isActive ? 'step' : undefined} className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold',
                    isActive
                      ? 'bg-primary text-white'
                      : isComplete
                        ? 'bg-accent text-primary'
                        : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {isComplete ? <FiCheck size={13} aria-hidden='true' /> : `0${step}`}
                </span>
                <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
                {step < 3 && <span aria-hidden='true' className='ml-4 h-px w-8 bg-border' />}
              </li>
            );
          })}
        </ol>
        <span className='flex items-center gap-1.5 text-[13px] text-muted-foreground'>
          <FiZap size={13} className='text-primary' aria-hidden='true' />A little help. Still your voice.
        </span>
      </div>
      {currentStep === 1 && <Step1SelectTool isOnDocumentPage={isOnDocumentPage} onToolSelect={flow.selectTool} />}
      {currentStep === 2 && selectedTool && (
        <Step2Input
          isOnDocumentPage={isOnDocumentPage}
          selectedTool={selectedTool}
          inputValue={inputValue}
          onInputChange={setInputValue}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          onSubmit={onSubmit}
          onGoBack={() => {
            if (!isLoading) flow.goBack();
          }}
          isLoading={isLoading}
          handleActivateTextSelection={handleActivateTextSelection}
          errorMessage={errorMessage}
        />
      )}
      {currentStep === 3 && (
        <Step3Success
          result={result}
          onCopyResult={() => copy(result)}
          onRestart={onRestart}
          onPasteInDocument={isOnDocumentPage ? onPasteInDocument : undefined}
          pasteDisabled={pasteDisabled}
        />
      )}
    </div>
  );
}
