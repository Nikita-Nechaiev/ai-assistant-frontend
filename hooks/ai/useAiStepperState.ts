import { useCallback, useState } from 'react';

import { AITool } from '@/models/models';

export default function useAiStepperState() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const reset = useCallback(() => {
    setCurrentStep(1);
    setSelectedTool(null);
    setInputValue('');
    setTargetLanguage('');
  }, []);
  const selectTool = useCallback((tool: AITool | null) => {
    setSelectedTool(tool);
    setTargetLanguage('');
    setCurrentStep(tool ? 2 : 1);
  }, []);
  const goBack = useCallback(() => {
    setCurrentStep(1);
    setInputValue('');
  }, []);

  return {
    currentStep,
    setCurrentStep,
    selectedTool,
    selectTool,
    inputValue,
    setInputValue,
    targetLanguage,
    setTargetLanguage,
    reset,
    goBack,
  };
}

export type AiStepperState = ReturnType<typeof useAiStepperState>;
