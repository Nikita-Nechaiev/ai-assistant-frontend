'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { IDocument, IVersion, IAiToolUsage } from '@/models/models';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import { useUserStore } from '@/store/useUserStore';
import { invalidateAiQueries } from '@/lib/queryInvalidation';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

interface DocumentAiUsageParams {
  toolName: string;
  text: string;
  documentId: number;
  targetLanguage?: string;
}

export default function useDocumentData(documentId: number) {
  const ctx = useContext(SessionContext);

  if (!ctx) throw new Error('useDocumentData must be used inside <SessionLayout>');

  const { socket, sessionId } = ctx;
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.id);
  const [scopeId, setScopeId] = useState(documentId);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const isValidId = Number.isSafeInteger(documentId) && documentId > 0;
  const isCurrent = scopeId === documentId;
  const pendingAi = useRef(false);

  const [currentDocument, setCurrentDocument] = useState<IDocument | null>(null);
  const [versions, setVersions] = useState<IVersion[]>([]);
  const [isFetchingAI, setFetchingAI] = useState(false);
  const [newAiUsage, setNewAiUsage] = useState<IAiToolUsage | null>(null);

  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();

  useEffect(() => {
    setScopeId(documentId);
    setCurrentDocument(null);
    setVersions([]);
    setNewAiUsage(null);
    setFetchingAI(false);
    pendingAi.current = false;
    setStatus(isValidId ? 'loading' : 'unavailable');

    if (!socket || !isValidId) return;

    let isActive = true;

    const onDocData = (doc: IDocument) => {
      if (!isActive || doc.id !== documentId) return;

      setCurrentDocument(doc);
      setStatus('ready');
    };
    const onDocUpdated = onDocData;

    const onVersions = (list: IVersion[]) => {
      if (!isActive) return;

      const matching = list.filter((v) => v.document.id === documentId);

      if (!matching.length) return;

      setVersions(matching);
    };

    const onVersionAdd = (v: IVersion) => {
      if (!isActive || v.document.id !== documentId) return;

      setVersions((prev) => [v, ...prev]);
    };

    const onAiCreated = (usage: IAiToolUsage) => {
      if (!isActive || usage.document?.id !== documentId) return;

      if (usage.user?.id !== userId) return;

      invalidateAiQueries(queryClient, userId);
      pendingAi.current = false;
      setNewAiUsage(usage);
      setFetchingAI(false);
    };

    const onError = () => {
      if (isActive) {
        pendingAi.current = false;
        setFetchingAI(false);
      }
    };
    const onInvalidDocument = (payload: { documentId: number }) => {
      if (!isActive || payload.documentId !== documentId) return;

      setCurrentDocument(null);
      setStatus('unavailable');
    };

    const onDocumentDeleted = ({ documentId: id }: { documentId: number }) => {
      if (isActive && documentId === id) {
        setSnackbar('Editor has deleted this document.', SnackbarStatusEnum.WARNING);

        router.replace(`/session/${sessionId}`);
      }
    };

    socket.on('invalidDocument', onInvalidDocument);
    socket.on('documentData', onDocData);
    socket.on('documentUpdated', onDocUpdated);
    socket.on('lastEditedDocument', onDocUpdated);

    socket.on('versionsData', onVersions);
    socket.on('versionCreated', onVersionAdd);

    socket.on('documentAiUsageCreated', onAiCreated);

    socket.on('documentDeleted', onDocumentDeleted);

    socket.on('error', onError);

    socket.emit('getDocument', { documentId });
    socket.emit('getVersions', { documentId });

    return () => {
      isActive = false;
      socket.off('invalidDocument', onInvalidDocument);
      socket.off('documentData', onDocData);
      socket.off('documentUpdated', onDocUpdated);
      socket.off('lastEditedDocument', onDocUpdated);

      socket.off('versionsData', onVersions);
      socket.off('versionCreated', onVersionAdd);

      socket.off('documentAiUsageCreated', onAiCreated);

      socket.off('documentDeleted', onDocumentDeleted);

      socket.off('error', onError);
    };
  }, [socket, documentId, isValidId, setSnackbar, router, sessionId, queryClient, userId]);

  const changeDocumentTitle = useCallback(
    (newTitle: string) =>
      socket?.emit('changeDocumentTitle', {
        documentId,
        newTitle: newTitle.trim(),
      }),
    [socket, documentId],
  );

  const changeContentAndSaveDocument = useCallback(
    (newContent: string) => {
      socket?.emit('changeContentAndSaveDocument', {
        documentId,
        newContent,
      });
    },
    [socket, documentId],
  );

  const applyVersion = useCallback(
    (versionId: number) => {
      socket?.emit('applyVersion', {
        documentId,
        versionId,
      });
    },
    [socket, documentId],
  );

  const createDocumentAiUsage = useCallback(
    (params: Omit<DocumentAiUsageParams, 'documentId'>) => {
      if (!socket || !isValidId || pendingAi.current) return;

      pendingAi.current = true;
      setFetchingAI(true);
      socket.emit('createDocumentAiUsage', { ...params, documentId });
    },
    [socket, documentId, isValidId],
  );

  const currentStatus = !isValidId ? 'unavailable' : isCurrent ? status : 'loading';
  const isLoadingPage = currentStatus === 'loading';

  return {
    status: currentStatus,
    currentDocument: isCurrent ? currentDocument : null,
    versions: isCurrent ? versions : [],
    newAiUsage: isCurrent ? newAiUsage : null,
    isFetchingAI: isCurrent && isFetchingAI,

    isLoadingPage,

    actions: {
      changeDocumentTitle,
      changeContentAndSaveDocument,
      applyVersion,
      createDocumentAiUsage,
      setNewAiUsage,
    },
  };
}
