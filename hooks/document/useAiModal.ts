import { useState, useCallback } from 'react';

import { AITool, IAiToolUsage } from '@/models/models';
import { lockBodyScroll, unlockBodyScroll } from '@/helpers/scrollLock';

interface Props {
  setNewAiUsage?: (val: IAiToolUsage | null) => void;
}

export default function useAiModal({ setNewAiUsage }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');

  const open = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(1);
    setNewAiUsage?.(null);

    lockBodyScroll();
  }, [setNewAiUsage]);

  const close = useCallback(() => {
    setIsOpen(false);
    setNewAiUsage?.(null);

    unlockBodyScroll();
  }, [setNewAiUsage]);

  const nextStep = useCallback(() => setCurrentStep((s) => s + 1), []);
  const reset = useCallback(() => {
    setNewAiUsage?.(null);
    setCurrentStep(1);
  }, [setNewAiUsage]);
  const selectTool = useCallback((tool: AITool | null) => setSelectedTool(tool), []);

  return {
    isAiModalOpen: isOpen,
    currentStep,
    selectedTool,
    targetLanguage,

    open,
    close,
    nextStep,
    reset,
    selectTool,
    setTargetLanguage,
    setIsOpen,
    setCurrentStep,
    setSelectedTool,
  };
}
