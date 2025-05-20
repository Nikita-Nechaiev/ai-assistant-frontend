'use client';
import React, { useState } from 'react';

import Step1SelectTool from '@/components/AiAssistance/Step1SelectTool';
import Step2Input from '@/components/AiAssistance/Step2Input';
import Step3Success from '@/components/AiAssistance/Step3Success';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { AITool } from '@/models/models';

interface AiAsssistanceStepperProps {
  isOnDocumentPage: boolean;
  onSubmit: (inputValue: string) => void;
  onRestart: () => void;
  isLoading: boolean;
  result?: string;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  handleActivateTextSelection?: () => void;
  setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
  targetLanguage: string;
  selectedTool: AITool | null;
  setSelectedTool: React.Dispatch<React.SetStateAction<AITool | null>>;
}

export default function AiAsssistanceStepper({
  onSubmit,
  onRestart,
  isLoading,
  result,
  currentStep,
  setCurrentStep,
  isOnDocumentPage,
  handleActivateTextSelection,
  setTargetLanguage,
  targetLanguage,
  selectedTool,
  setSelectedTool,
}: AiAsssistanceStepperProps) {
  const { setSnackbar } = useSnackbarStore();
  const [inputValue, setInputValue] = useState<string>('');

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedTool(null);
    setInputValue('');
    setTargetLanguage('');
    onRestart();
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setSnackbar('Result copied to clipboard', SnackbarStatusEnum.SUCCESS);
    }
  };
  const onGoBack = () => {
    setCurrentStep(1);
    setInputValue('');
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  return (
    <div className='py-8 px-4 flex-grow'>
      {currentStep === 1 && (
        <Step1SelectTool
          isOnDocumentPage={isOnDocumentPage}
          onToolSelect={(tool) => {
            setSelectedTool(tool);
            setCurrentStep(2);
          }}
        />
      )}

      {currentStep === 2 && selectedTool && (
        <Step2Input
          isOnDocumentPage={isOnDocumentPage}
          selectedTool={selectedTool}
          inputValue={inputValue}
          onInputChange={setInputValue}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          onSubmit={handleSubmit}
          onGoBack={onGoBack}
          isLoading={isLoading}
          handleActivateTextSelection={handleActivateTextSelection}
        />
      )}

      {currentStep === 3 && <Step3Success result={result} onCopyResult={handleCopyResult} onRestart={handleRestart} />}
    </div>
  );
}
