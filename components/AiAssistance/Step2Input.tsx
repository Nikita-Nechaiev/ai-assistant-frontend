'use client';

import React from 'react';

import { FiArrowLeft, FiArrowRight, FiLoader, FiMousePointer } from 'react-icons/fi';

import { validateAiInput } from '@/helpers/validateAiInput';
import { AITool } from '@/models/models';
import { getAiToolPresentation } from '@/helpers/aiToolPresentation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Step2InputProps {
  selectedTool: AITool;
  inputValue: string;
  onInputChange: (value: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
  onSubmit: () => void;
  onGoBack: () => void;
  isLoading: boolean;
  isOnDocumentPage: boolean;
  handleActivateTextSelection?: () => void;
  errorMessage?: string;
}

const Step2Input: React.FC<Step2InputProps> = ({
  selectedTool,
  inputValue,
  onInputChange,
  targetLanguage,
  onTargetLanguageChange,
  onSubmit,
  onGoBack,
  isLoading,
  isOnDocumentPage,
  handleActivateTextSelection,
  errorMessage,
}) => {
  const { title, description, category, placeholder, Icon } = getAiToolPresentation(selectedTool);
  const words = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;
  const canSubmit = validateAiInput(selectedTool, inputValue, targetLanguage).ok && !isLoading;

  return (
    <section aria-labelledby='tool-input-heading'>
      <div className='mb-6 flex items-center justify-between gap-5'>
        <div className='flex items-center gap-3.5'>
          <span className='flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-accent text-primary'>
            <Icon size={21} aria-hidden='true' />
          </span>
          <div>
            <div className='flex items-center gap-2.5'>
              <h2 id='tool-input-heading' className='text-[26px] font-semibold tracking-tight'>
                {title}
              </h2>
              <Badge variant='secondary' className='text-[13px] font-normal'>
                {category}
              </Badge>
            </div>
            <p className='mt-1.5 text-sm text-muted-foreground'>{description}</p>
          </div>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={isLoading}
          onClick={onGoBack}
          className='text-sm text-muted-foreground'
        >
          <FiArrowLeft aria-hidden='true' />
          Change tool
        </Button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (canSubmit) onSubmit();
        }}
        className={cn(
          'grid items-start gap-5',
          selectedTool.requiresTargetLanguage ? 'grid-cols-[minmax(0,1fr)_250px]' : 'grid-cols-1',
        )}
      >
        <Card className='overflow-hidden border-border shadow-card'>
          <div className='flex items-center justify-between border-b border-border px-5 py-4'>
            <label htmlFor='ai-input-text' className='text-sm font-semibold'>
              {selectedTool.id === 'text-generation' ? 'Your prompt' : 'Your text'}
            </label>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={!inputValue || isLoading}
              onClick={() => onInputChange('')}
              className='h-6 px-2 text-[13px] text-muted-foreground'
            >
              Clear
            </Button>
          </div>
          <Textarea
            id='ai-input-text'
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            aria-describedby={errorMessage ? 'ai-request-error' : 'ai-text-guidance'}
            required
            className={cn(
              'resize-y rounded-none border-0 px-5 py-5 text-base leading-7 shadow-none focus-visible:ring-inset',
              isOnDocumentPage ? 'min-h-[220px]' : 'min-h-[320px]',
            )}
          />
          <div className='flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3'>
            <p id='ai-text-guidance' className='text-[13px] text-muted-foreground'>
              A little context goes a long way.
            </p>
            <span className='text-[13px] tabular-nums text-muted-foreground'>
              {words} {words === 1 ? 'word' : 'words'} · {inputValue.length} characters
            </span>
          </div>
          {isOnDocumentPage && handleActivateTextSelection && (
            <div className='border-t border-border px-5 py-4'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isLoading}
                onClick={handleActivateTextSelection}
                className='text-sm'
              >
                <FiMousePointer aria-hidden='true' />
                Select from the document
              </Button>
              <p className='mt-2 text-[13px] leading-5 text-muted-foreground'>
                Prefer to work with a passage? Select it directly in your document.
              </p>
            </div>
          )}
        </Card>
        <div className={cn('space-y-4', !selectedTool.requiresTargetLanguage && 'w-[250px] justify-self-end')}>
          {selectedTool.requiresTargetLanguage && (
            <Card className='border-border p-5 shadow-card'>
              <label htmlFor='ai-target-language' className='mb-2 block text-sm font-semibold'>
                Translate into
              </label>
              <Input
                id='ai-target-language'
                placeholder='e.g. Spanish'
                value={targetLanguage}
                disabled={isLoading}
                required
                onChange={(event) => onTargetLanguageChange(event.target.value)}
                className='bg-white text-sm'
              />
              <p className='mt-2 text-[13px] leading-5 text-muted-foreground'>
                Enter the language you would like your text translated into.
              </p>
            </Card>
          )}
          <Button type='submit' disabled={!canSubmit} className='h-11 w-full text-sm shadow-blue'>
            {isLoading ? (
              <FiLoader className='animate-spin' aria-hidden='true' />
            ) : (
              <Icon size={15} aria-hidden='true' />
            )}
            {isLoading ? 'Working on your text…' : 'Run tool'}
            {!isLoading && <FiArrowRight className='ml-auto' aria-hidden='true' />}
          </Button>
        </div>
      </form>
      {errorMessage && (
        <div
          id='ai-request-error'
          role='alert'
          className='mt-4 rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-sm leading-6 text-destructive'
        >
          {errorMessage}
        </div>
      )}
    </section>
  );
};

export default Step2Input;
