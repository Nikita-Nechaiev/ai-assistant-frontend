'use client';
import React from 'react';
import { AITool } from '@/models/models';
import InputField from '@/ui/InputField';

interface Step2InputProps {
  selectedTool: AITool;
  inputValue: string;
  onInputChange: (value: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
  onSubmit: () => void;
  onGoBack: () => void;
  isLoading: boolean;
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
}) => {
  return (
    <div className='max-w-[800px] mx-auto'>
      {/* Title */}
      <h2 className='text-2xl font-bold mb-4'>{selectedTool.name}</h2>

      {/* Textarea */}
      <div className='mb-4'>
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder='Enter your text here...'
          className='w-full p-3 border border-mainLightGray rounded h-40 resize-none outline-none'
        />
      </div>

      {selectedTool.requiresTargetLanguage && (
        <div className='mb-4'>
          <input
            type='text'
            value={targetLanguage}
            onChange={(e) => onTargetLanguageChange(e.target.value)}
            placeholder='Enter target language'
            className='w-full p-2 border border-mainLightGray rounded outline-none'
          />
        </div>
      )}

      {/* Buttons */}
      <div className='flex justify-between gap-4'>
        <button
          onClick={onGoBack}
          className='text-mainDark border border-mainDark hover:text-mainDarkHover px-4 py-2 rounded transition-all'
        >
          Go Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className='bg-mainDark hover:bg-mainDarkHover text-mainLight px-20 py-3 rounded transition-opacity'
        >
          {isLoading ? 'Processing the request...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default Step2Input;
