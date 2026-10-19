import { useCallback, useEffect } from 'react';

import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { IAiToolUsage } from '@/models/models';
import { validateAiInput } from '@/helpers/validateAiInput';

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
  setNewAiUsage?: (value: IAiToolUsage | null) => void;
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
  const modal = useAiModal({ setNewAiUsage });
  const { flow, setIsOpen, reset } = modal;
  const { setCurrentStep } = flow;
  const overlay = useTextSelectionOverlay({
    selectedTool: flow.selectedTool,
    targetLanguage: flow.targetLanguage,
    setSnackbar,
    setModalOpen: setIsOpen,
  });
  const { handleCancelTextSelection, clearSelection } = overlay;

  useEffect(() => {
    reset();
    setIsOpen(false);
    clearSelection();
  }, [documentId, reset, setIsOpen, clearSelection]);
  useEffect(() => {
    if (newAiUsage?.document?.id === documentId && newAiUsage.user?.id === currentUser?.id) {
      handleCancelTextSelection();
      setIsOpen(true);
      setCurrentStep(3);
    }
  }, [newAiUsage, documentId, currentUser?.id, handleCancelTextSelection, setIsOpen, setCurrentStep]);

  const handleCreateUsage = useCallback(() => {
    if (isFetchingAI) return;

    const input = validateAiInput(flow.selectedTool, overlay.selectedText || flow.inputValue, flow.targetLanguage);

    if (!input.ok) {
      setSnackbar(input.message, SnackbarStatusEnum.ERROR);

      return;
    }

    createDocumentAiUsage?.({
      toolName: input.value.tool.endpoint,
      text: input.value.text,
      documentId,
      targetLanguage: input.value.targetLanguage,
    });
  }, [
    isFetchingAI,
    flow.selectedTool,
    flow.inputValue,
    flow.targetLanguage,
    overlay.selectedText,
    documentId,
    createDocumentAiUsage,
    setSnackbar,
  ]);

  return {
    overlay: {
      isActive: overlay.isTextSelectionActive,
      qlRect: overlay.qlRect,
      selectedText: overlay.selectedText,
      handleCancel: handleCancelTextSelection,
    },
    ai: {
      flow,
      isOpen: modal.isAiModalOpen,
      open: modal.open,
      close: modal.close,
      reset,
      currentStep: flow.currentStep,
      handleActivateSelection: overlay.handleActivateTextSelection,
      handleCreateUsage,
      isLoading: isFetchingAI,
      result: newAiUsage?.result ?? 'Error. No result to display',
    },
  };
}
