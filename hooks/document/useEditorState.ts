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
    if (!currentDocument) {
      setLocalContent('');
      setQuillDelta(null);
      isInitialMount.current = true;

      return;
    }

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
      if (!isUserCanEdit || previewContent || !currentDocument || !changeContentAndSaveDocument) return;

      setLocalContent(next);
      debouncedSave(next);
    },
    [isUserCanEdit, previewContent, currentDocument, changeContentAndSaveDocument, debouncedSave],
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

  const appendText = useCallback(
    (text: string) => {
      if (isReadOnly || !currentDocument || !changeContentAndSaveDocument || !text.trim()) return false;

      const paragraphs = text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => {
          const paragraph = document.createElement('p');

          if (line) paragraph.textContent = line;
          else paragraph.appendChild(document.createElement('br'));

          return paragraph.outerHTML;
        });
      const existingContent = localContent === '<p><br></p>' ? '' : localContent;

      handleContentChange(existingContent + paragraphs.join(''));

      return true;
    },
    [isReadOnly, currentDocument, changeContentAndSaveDocument, localContent, handleContentChange],
  );

  return {
    localContent,
    quillDelta,
    isReadOnly,
    handleEditorChange,
    appendText,
  };
}
