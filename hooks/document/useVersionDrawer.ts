import { useState, useCallback, useEffect } from 'react';

import { IVersion } from '@/models/models';

interface Params {
  versions: IVersion[] | undefined;
  applyVersion?: (versionId: number) => void;
  documentId?: number;
}

export default function useVersionDrawer({ versions, applyVersion, documentId }: Params) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<IVersion | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    setIsOpen(false);
    setSelectedVersion(null);
    setPreviewContent('');
  }, [documentId]);

  const handleApplyVersion = useCallback(() => {
    if (!selectedVersion) return;

    applyVersion?.(selectedVersion.id);
    setPreviewContent('');
    setSelectedVersion(null);
    setIsOpen(false);
  }, [applyVersion, selectedVersion]);

  return {
    versions,
    previewContent,
    isOpen,
    open: () => setIsOpen(true),
    close: () => {
      setIsOpen(false);
      setPreviewContent('');
      setSelectedVersion(null);
    },
    selectedVersion,
    handleSelectVersion: setSelectedVersion,
    handleSetPreview: (v: IVersion) => setPreviewContent(v.richContent),
    handleApplyVersion,
  };
}
