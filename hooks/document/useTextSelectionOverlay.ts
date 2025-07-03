import { useState, useEffect, useCallback } from 'react';

import { AITool } from '@/models/models';
import { SnackbarStatusEnum } from '@/models/enums';
import { lockBodyScroll } from '@/helpers/scrollLock';

interface Props {
  selectedTool: AITool | null;
  targetLanguage: string;
  setSnackbar: (msg: string, status: SnackbarStatusEnum) => void;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useTextSelectionOverlay({ selectedTool, targetLanguage, setSnackbar, setModalOpen }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [qlRect, setQlRect] = useState<DOMRect | null>(null);

  const handleActivateTextSelection = useCallback(() => {
    if (selectedTool?.requiresTargetLanguage && !targetLanguage.trim()) {
      setSnackbar('Please specify a target language', SnackbarStatusEnum.ERROR);

      return;
    }

    setModalOpen(false);
    setIsActive(true);
  }, [selectedTool, targetLanguage, setSnackbar, setModalOpen]);

  const handleCancelTextSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setIsActive(false);
    setModalOpen(true);
    setSelectedText('');
  }, [setModalOpen]);

  useEffect(() => {
    if (!isActive) return;

    const qlEditor = document.querySelector('.ql-editor') as HTMLElement | null;

    if (!qlEditor) return;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    const t = setTimeout(() => {
      setQlRect(qlEditor.getBoundingClientRect());
      qlEditor.style.position = 'relative';
      qlEditor.style.zIndex = '1001';
      lockBodyScroll();
    }, 500);

    return () => {
      clearTimeout(t);
      qlEditor.style.position = '';
      qlEditor.style.zIndex = '';
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleSelectionChange = () => {
      const sel = window.getSelection();

      setSelectedText(sel ? sel.toString().trim() : '');
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isActive]);

  return {
    isTextSelectionActive: isActive,
    qlRect,
    selectedText,
    handleActivateTextSelection,
    handleCancelTextSelection,
  };
}
