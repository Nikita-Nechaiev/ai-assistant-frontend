'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { DeltaStatic, Quill as QuillType } from 'react-quill-new';

import { convertRichContentToDelta } from '@/helpers/documentHelpers';
import { IDocument } from '@/models/models';
import useDebouncedCallback from '@/hooks/common/useDebouncedCallback';

interface Params {
  currentDocument: IDocument | null;
  previewContent: string;
  isUserCanEdit: boolean;
  changeContentAndSaveDocument?: (newContent: string) => void;
}

export default function useEditorState({
  currentDocument,
  previewContent,
  isUserCanEdit,
  changeContentAndSaveDocument,
}: Params) {
  const [localContent, setLocalContent] = useState('');
  const [quillDelta, setQuillDelta] = useState<DeltaStatic | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!currentDocument) return;

    const fixedDelta = convertRichContentToDelta(currentDocument.richContent, QuillType);

    setQuillDelta(fixedDelta);
    setLocalContent(currentDocument.richContent);

    isInitialMount.current = false;
  }, [currentDocument]);

  const saveContent = useCallback(
    (next: string) => {
      if (!currentDocument || !changeContentAndSaveDocument || currentDocument.richContent === next) return;

      changeContentAndSaveDocument(next);
    },
    [currentDocument, changeContentAndSaveDocument],
  );

  const debouncedSave = useDebouncedCallback(saveContent, 700);

  const handleContentChange = useCallback(
    (next: string) => {
      if (previewContent || !currentDocument || !changeContentAndSaveDocument) return;

      setLocalContent(next);
      debouncedSave(next);
    },
    [previewContent, currentDocument, changeContentAndSaveDocument, debouncedSave],
  );

  const handleEditorChange = useCallback(
    (content: string, _delta: DeltaStatic, source: 'api' | 'user') => {
      if (source !== 'user') return;

      if (isInitialMount.current) return;

      handleContentChange(content);
    },
    [handleContentChange],
  );

  const isReadOnly = !isUserCanEdit || !!previewContent;

  return {
    localContent,
    quillDelta,
    isReadOnly,
    handleEditorChange,
  };
}
