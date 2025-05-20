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

export function useSocketEmitters({ sessionId, socket, setAiUsageFetching }: UseSocketEmittersParams) {
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
      socket?.emit('updateNotificationStatus', { invitationId: invitationId, status: status });
    },
    [socket],
  );

  const deleteNotification = useCallback(
    (invitationId: number) => {
      socket?.emit('deleteNotification', { invitationId: invitationId });
    },
    [socket],
  );

  const acceptInvitation = useCallback(
    (invitationId: number) => {
      socket?.emit('acceptInvitation', { invitationId: invitationId });
    },
    [socket],
  );

  const changeInvitationRole = useCallback(
    (invitationId: number, newRole: PermissionEnum) => {
      socket?.emit('changeInvitationRole', { invitationId: invitationId, newRole: newRole });
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

      socket?.emit('updateSessionName', { sessionId: sessionId, newName: newName });
    },
    [socket, sessionId],
  );

  const deleteSession = useCallback(
    (deleteSessionId: number) => {
      socket?.emit('deleteSession', { sessionId: Number(deleteSessionId) });
    },
    [socket],
  );

  const changeDocumentTitle = useCallback(
    (documentId: number, newTitle: string) => {
      socket?.emit('changeDocumentTitle', { documentId: documentId, newTitle: newTitle });
    },
    [socket],
  );

  const createDocument = useCallback(
    (title: string) => {
      socket?.emit('createDocument', { title: title });
    },
    [socket],
  );

  const deleteDocument = useCallback(
    (documentId: number) => {
      socket?.emit('deleteDocument', { documentId: documentId });
    },
    [socket],
  );

  const duplicateDocument = useCallback(
    (documentId: number) => {
      socket?.emit('duplicateDocument', { documentId: documentId });
    },
    [socket],
  );

  const changeContentAndSaveDocument = useCallback(
    (documentId: number, newContent: string) => {
      socket?.emit('changeContentAndSaveDocument', { documentId: documentId, newContent: newContent });
    },
    [socket],
  );

  const applyVersion = useCallback(
    (documentId: number, versionId: number) => {
      socket?.emit('applyVersion', { documentId: documentId, versionId: versionId });
    },
    [socket],
  );

  const getDocument = useCallback(
    (documentId: number) => {
      socket?.emit('getDocument', { documentId: documentId });
    },
    [socket],
  );

  const getDocumentAiUsage = useCallback(
    (documentId: number) => {
      socket?.emit('getDocumentAiUsage', { documentId: documentId });
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
      socket?.emit('getVersions', { documentId: documentId });
    },
    [socket],
  );

  return {
    createInvitation: createInvitation,
    fetchNotifications: fetchNotifications,
    updateNotificationStatus: updateNotificationStatus,
    deleteNotification: deleteNotification,
    acceptInvitation: acceptInvitation,
    changeInvitationRole: changeInvitationRole,
    changeUserPermissions: changeUserPermissions,
    changeSessionName: changeSessionName,
    deleteSession: deleteSession,
    changeDocumentTitle: changeDocumentTitle,
    createDocument: createDocument,
    deleteDocument: deleteDocument,
    duplicateDocument: duplicateDocument,
    changeContentAndSaveDocument: changeContentAndSaveDocument,
    applyVersion: applyVersion,
    getDocument: getDocument,
    getDocumentAiUsage: getDocumentAiUsage,
    createDocumentAiUsage: createDocumentAiUsage,
    getVersions: getVersions,
  };
}
