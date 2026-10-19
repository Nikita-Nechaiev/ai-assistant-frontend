import { useState, useCallback } from 'react';

import { IAiToolUsage } from '@/models/models';
import useAiStepperState from '@/hooks/ai/useAiStepperState';
import useBodyScrollLock from '@/hooks/common/useBodyScrollLock';

interface Props {
  setNewAiUsage?: (value: IAiToolUsage | null) => void;
}

export default function useAiModal({ setNewAiUsage }: Props) {
  const flow = useAiStepperState();
  const { reset: resetFlow } = flow;
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock(isOpen);

  const reset = useCallback(() => {
    resetFlow();
    setNewAiUsage?.(null);
  }, [resetFlow, setNewAiUsage]);
  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);
  const close = useCallback(() => {
    setIsOpen(false);
    setNewAiUsage?.(null);
  }, [setNewAiUsage]);

  return { flow, isAiModalOpen: isOpen, setIsOpen, open, close, reset };
}
