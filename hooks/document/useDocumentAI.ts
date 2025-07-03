import { useCallback, useEffect } from 'react';

import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { IAiToolUsage } from '@/models/models';

import useAiModal from './useAiModal';
import useTextSelectionOverlay from './useTextSelectionOverlay';

interface Params {
  documentId: number;
  createDocumentAiUsage?: (args: {
    toolName: string;
    text: string;
    documentId: number;
    targetLanguage?: string;
  }) => void;
  newAiUsage: IAiToolUsage | null;
  setNewAiUsage?: (val: IAiToolUsage | null) => void;
  isFetchingAI: boolean;
}

export default function useDocumentAI({
  documentId,
  createDocumentAiUsage,
  newAiUsage,
  setNewAiUsage,
  isFetchingAI,
}: Params) {
  const { user: currentUser } = useUserStore();
  const { setSnackbar } = useSnackbarStore();

  const aiModal = useAiModal({ setNewAiUsage });
  const overlay = useTextSelectionOverlay({
    selectedTool: aiModal.selectedTool,
    targetLanguage: aiModal.targetLanguage,
    setSnackbar,
    setModalOpen: aiModal.setIsOpen,
  });

  useEffect(() => {
    if (newAiUsage && newAiUsage.user?.id === currentUser?.id) {
      overlay.handleCancelTextSelection();
      aiModal.setIsOpen(true);
      aiModal.setCurrentStep(3);
    }
  }, [newAiUsage, currentUser?.id, aiModal, overlay, setNewAiUsage]);

  const handleCreateUsage = useCallback(
    (manualInput = '') => {
      const textToSend = overlay.selectedText || manualInput;

      if (!textToSend.trim()) {
        setSnackbar('Input cannot be empty', SnackbarStatusEnum.ERROR);

        return;
      }

      if (aiModal.selectedTool?.requiresTargetLanguage && !aiModal.targetLanguage) {
        setSnackbar('Please specify a target language', SnackbarStatusEnum.ERROR);

        return;
      }

      if (!aiModal.selectedTool) return;

      createDocumentAiUsage?.({
        toolName: aiModal.selectedTool.endpoint,
        text: textToSend,
        documentId,
        targetLanguage: aiModal.targetLanguage,
      });
    },
    [
      overlay.selectedText,
      aiModal.selectedTool,
      aiModal.targetLanguage,
      documentId,
      createDocumentAiUsage,
      setSnackbar,
    ],
  );

  return {
    overlay: {
      isActive: overlay.isTextSelectionActive,
      qlRect: overlay.qlRect,
      selectedText: overlay.selectedText,
      handleCancel: overlay.handleCancelTextSelection,
    },
    ai: {
      isOpen: aiModal.isAiModalOpen,
      open: aiModal.open,
      close: aiModal.close,
      currentStep: aiModal.currentStep,
      setCurrentStep: aiModal.setCurrentStep,
      nextStep: aiModal.nextStep,
      reset: aiModal.reset,
      selectedTool: aiModal.selectedTool,
      selectTool: aiModal.selectTool,
      targetLanguage: aiModal.targetLanguage,
      setTargetLanguage: aiModal.setTargetLanguage,
      handleActivateSelection: overlay.handleActivateTextSelection,
      handleCreateUsage,
      isLoading: isFetchingAI,
      result: newAiUsage ? newAiUsage.result : 'Error. No result to display',
    },
  };
}
