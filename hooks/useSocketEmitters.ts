import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { NotificationStatusEnum, PermissionEnum } from '@/models/enums';

interface DocumentAiUsageParams {
  toolName: string;
  text: string;
  documentId: number;
  targetLanguage?: string;
}

interface UseSocketEmittersParams {
  sessionId: string | string[] | undefined;
  socket: Socket | null;
  setAiUsageFetching: (value: boolean) => void;
}

export function useSocketEmitters({
  sessionId,
  socket,
  setAiUsageFetching,
}: UseSocketEmittersParams) {
  const createInvitation = useCallback(
    (invitationData: { email: string; role: PermissionEnum }) => {
      socket?.emit('createInvitation', invitationData);
    },
    [socket],
  );

  const fetchNotifications = useCallback(() => {
    socket?.emit('getNotifications');
  }, [socket]);

  const updateNotificationStatus = useCallback(
    (invitationId: number, status: NotificationStatusEnum) => {
      socket?.emit('updateNotificationStatus', { invitationId, status });
    },
    [socket],
  );

  const deleteNotification = useCallback(
    (invitationId: number) => {
      socket?.emit('deleteNotification', { invitationId });
    },
    [socket],
  );

  const acceptInvitation = useCallback(
    (invitationId: number) => {
      socket?.emit('acceptInvitation', { invitationId });
    },
    [socket],
  );

  const changeInvitationRole = useCallback(
    (invitationId: number, newRole: PermissionEnum) => {
      socket?.emit('changeInvitationRole', { invitationId, newRole });
    },
    [socket],
  );

  const changeUserPermissions = useCallback(
    (targetUserId: number, newPermission: PermissionEnum) => {
      socket?.emit('changeUserPermissions', {
        userId: targetUserId,
        permission: newPermission,
      });
    },
    [socket],
  );

  const changeSessionName = useCallback(
    (newName: string) => {
      if (!sessionId) return;
      socket?.emit('updateSessionName', { sessionId, newName });
    },
    [socket, sessionId],
  );

  const deleteSession = useCallback(
    (sessionId: number) => {
      socket?.emit('deleteSession', { sessionId: Number(sessionId) });
    },
    [socket],
  );

  const changeDocumentTitle = useCallback(
    (documentId: number, newTitle: string) => {
      socket?.emit('changeDocumentTitle', { documentId, newTitle });
    },
    [socket],
  );

  const createDocument = useCallback(
    (title: string) => {
      socket?.emit('createDocument', { title });
    },
    [socket],
  );

  const deleteDocument = useCallback(
    (documentId: number) => {
      socket?.emit('deleteDocument', { documentId });
    },
    [socket],
  );

  const duplicateDocument = useCallback(
    (documentId: number) => {
      socket?.emit('duplicateDocument', { documentId });
    },
    [socket],
  );

  const changeContentAndSaveDocument = useCallback(
    (documentId: number, newContent: string) => {
      socket?.emit('changeContentAndSaveDocument', { documentId, newContent });
    },
    [socket],
  );

  const applyVersion = useCallback(
    (documentId: number, versionId: number) => {
      socket?.emit('applyVersion', { documentId, versionId });
    },
    [socket],
  );

  const getDocument = useCallback(
    (documentId: number) => {
      socket?.emit('getDocument', { documentId });
    },
    [socket],
  );

  const getDocumentAiUsage = useCallback(
    (documentId: number) => {
      socket?.emit('getDocumentAiUsage', { documentId });
    },
    [socket],
  );

  const createDocumentAiUsage = useCallback(
    (params: DocumentAiUsageParams) => {
      setAiUsageFetching(true);
      socket?.emit('createDocumentAiUsage', params);
    },
    [socket, setAiUsageFetching],
  );

  const getVersions = useCallback(
    (documentId: number) => {
      socket?.emit('getVersions', { documentId });
    },
    [socket],
  );

  return {
    createInvitation,
    fetchNotifications,
    updateNotificationStatus,
    deleteNotification,
    acceptInvitation,
    changeInvitationRole,
    changeUserPermissions,
    changeSessionName,
    deleteSession,
    changeDocumentTitle,
    createDocument,
    deleteDocument,
    duplicateDocument,
    changeContentAndSaveDocument,
    applyVersion,
    getDocument,
    getDocumentAiUsage,
    createDocumentAiUsage,
    getVersions,
  };
}
