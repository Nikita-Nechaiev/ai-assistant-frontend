import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

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
    setSelectedText('');
    setQlRect(null);
    setIsActive(true);
  }, [selectedTool, targetLanguage, setSnackbar, setModalOpen]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setIsActive(false);
    setQlRect(null);
    setSelectedText('');
  }, []);
  const handleCancelTextSelection = useCallback(() => {
    clearSelection();
    setModalOpen(true);
  }, [clearSelection, setModalOpen]);

  useLayoutEffect(() => {
    if (!isActive) return;

    const qlEditor = document.querySelector('.document-editor .ql-editor') as HTMLElement | null;

    if (!qlEditor) return;

    qlEditor.scrollIntoView({ block: 'center', behavior: 'instant' });

    const releaseScroll = lockBodyScroll();

    const updateRect = () => {
      const rect = qlEditor.getBoundingClientRect();

      setQlRect((previous) =>
        previous?.x === rect.x &&
        previous.y === rect.y &&
        previous.width === rect.width &&
        previous.height === rect.height
          ? previous
          : rect,
      );
    };
    const observer = new ResizeObserver(updateRect);

    updateRect();
    observer.observe(qlEditor);
    window.addEventListener('resize', updateRect);
    document.addEventListener('scroll', updateRect, true);

    return () => {
      releaseScroll();
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
      document.removeEventListener('scroll', updateRect, true);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      const editor = document.querySelector('.document-editor .ql-editor');

      if (!sel || !editor || !editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) return;

      setSelectedText(sel.toString().trim());
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
    clearSelection,
  };
}
