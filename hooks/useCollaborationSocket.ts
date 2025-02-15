import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import {
  ICollaborationSession,
  ICollaborator,
  IInvitation,
  IMessage,
  IDocument,
  IAiToolUsage,
  IVersion,
} from '@/models/models';
import { SnackbarStatusEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { useSessionStore } from '@/store/useSessionStore';
import { isConvertableToNumber } from '@/helpers/isConvertableToNumber';
import { useSocketEmitters } from './useSocketEmitters';

interface UseCollaborationSocketParams {
  sessionId?: string | string[] | undefined;
}

export function useCollaborationSocket({
  sessionId,
}: UseCollaborationSocketParams) {
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();
  const { user: currentUser } = useUserStore();
  const { setSession: setUserSessionInStore, clearSession } = useSessionStore();

  const [session, setSession] = useState<ICollaborationSession | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<ICollaborator[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<IDocument | null>(
    null,
  );
  const [documentAiUsage, setDocumentAiUsage] = useState<IAiToolUsage[]>([]);
  const [isAiUsageFetching, setAiUsageFetching] = useState<boolean>(false);
  const [newAiUsage, setNewAiUsage] = useState<IAiToolUsage | null>(null);
  const [versions, setVersions] = useState<IVersion[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const totalTimeRef = useRef<number>(0);
  const socketRef = useRef<Socket | null>(null);
  const currentDocumentRef = useRef<IDocument | null>(null);

  // Establish socket connection and listeners
  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      {
        path: '/collaboration-session-socket',
        transports: ['websocket'],
        withCredentials: true,
      },
    );
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      startTimeRef.current = Date.now();

      if (sessionId) {
        if (
          typeof sessionId === 'string' &&
          !isConvertableToNumber(sessionId)
        ) {
          setSnackbar('Invalid session page', SnackbarStatusEnum.ERROR);
          router.replace('/dashboard');
          return;
        }
        socket.emit('joinSession', { sessionId: Number(sessionId) });
        socket.emit('getMessages');
        socket.emit('getInvitations');
        socket.emit('getSessionDocuments');
      } else {
        socket.emit('joinDashboard');
        socket.emit('getNotifications');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on(
      'sessionData',
      ({
        session,
        users,
      }: {
        session: ICollaborationSession;
        users: ICollaborator[];
      }) => {
        setSession(session);
        setOnlineUsers(users);
      },
    );

    socket.on('currentTime', ({ totalTime }) => {
      totalTimeRef.current = totalTime * 1000;
      startTimeRef.current = Date.now();
      setTimeSpent(totalTimeRef.current);
    });

    socket.on('userLeft', ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
    });

    socket.on('messages', (msgs) => {
      setMessages(msgs);
    });
    socket.on('newMessage', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on('error', (errorMessage: string) => {
      setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      setAiUsageFetching(false);
    });

    socket.on('invitations', (fetchedInvitations: IInvitation[]) => {
      setInvitations(fetchedInvitations);
    });
    socket.on('newInvitation', (newInvitation: IInvitation) => {
      if (sessionId && newInvitation.inviterEmail === currentUser?.email) {
        setSnackbar(
          `Invitation is sent to ${newInvitation.receiver.email}`,
          SnackbarStatusEnum.SUCCESS,
        );
      }
      setInvitations((prev) => [...prev, newInvitation]);
    });
    socket.on('invitationRoleChanged', (updatedInvitation: IInvitation) => {
      setSnackbar(
        `Invitation role changed to ${updatedInvitation.role}`,
        SnackbarStatusEnum.SUCCESS,
      );
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === updatedInvitation.id ? updatedInvitation : inv,
        ),
      );
    });
    socket.on('invitationUpdated', (updatedInvitation: IInvitation) => {
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === updatedInvitation.id ? updatedInvitation : inv,
        ),
      );
    });
    socket.on('notifications', (allInvitations: IInvitation[]) => {
      setInvitations(allInvitations);
    });
    socket.on('notificationUpdated', (updatedInvitation: IInvitation) => {
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === updatedInvitation.id ? updatedInvitation : inv,
        ),
      );
    });
    socket.on(
      'notificationDeleted',
      ({ invitationId }: { invitationId: number }) => {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      },
    );
    socket.on('invitationAccepted', ({ sessionId }: { sessionId: number }) => {
      setSnackbar(
        'Invitation accepted. Redirecting...',
        SnackbarStatusEnum.SUCCESS,
      );
      router.push(`/session/${sessionId}`);
    });
    socket.on('permissionsChanged', ({ userId, permissions }) => {
      setSession((prev) => {
        if (!prev) return prev;
        const updated = prev.userCollaborationSessions.map((ucs) =>
          ucs.user.id === userId ? { ...ucs, permissions } : ucs,
        );
        return { ...prev, userCollaborationSessions: updated };
      });
      setOnlineUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, permissions } : user,
        ),
      );
      if (currentUser && session) {
        const existing = session.userCollaborationSessions.find(
          (el) => el.user.id === currentUser.id,
        );
        if (existing) {
          setUserSessionInStore({ ...existing, permissions });
        }
      }
    });

    socket.on('documentCreated', (doc: IDocument) => {
      setDocuments((prev) => [doc, ...prev]);
    });
    socket.on('documentDuplicated', (doc: IDocument) => {
      setDocuments((prev) => [doc, ...prev]);
    });
    socket.on('documentDeleted', ({ documentId }: { documentId: number }) => {
      if (
        currentDocumentRef.current &&
        currentDocumentRef.current.id === documentId
      ) {
        router.replace('/session/' + sessionId);
        setSnackbar(
          'The document has been deleted by the editor',
          SnackbarStatusEnum.WARNING,
        );
      }
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    });
    socket.on('sessionDocuments', (docs: IDocument[]) => {
      setDocuments(docs);
    });
    socket.on('documentData', (doc: IDocument) => {
      setCurrentDocument(doc);
    });
    socket.on('documentUpdated', (doc: IDocument) => {
      setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
      if (
        currentDocumentRef.current &&
        currentDocumentRef.current.id === doc.id
      ) {
        setCurrentDocument(doc);
      }
    });
    socket.on('lastEditedDocument', (doc: IDocument) => {
      setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
    });
    socket.on('documentAiUsage', (usage: IAiToolUsage[]) => {
      setDocumentAiUsage(usage);
    });
    socket.on('documentAiUsageCreated', (usage: IAiToolUsage) => {
      setDocumentAiUsage((prev) => [...prev, usage]);
      setNewAiUsage(usage);
      setAiUsageFetching(false);
    });
    socket.on('versionsData', (data: IVersion[]) => {
      setVersions(data);
    });
    socket.on('versionCreated', (version: IVersion) => {
      setVersions((prev) => [version, ...prev]);
    });
    socket.on('sessionDeleted', ({ message, userId }) => {
      if (currentUser?.id !== userId) {
        setSnackbar(message, SnackbarStatusEnum.WARNING);
      } else {
        setSnackbar('Session has been deleted', SnackbarStatusEnum.SUCCESS);
      }
      router.replace('/dashboard');
    });
    socket.on('invalidSession', ({ message }) => {
      setSnackbar(message, SnackbarStatusEnum.ERROR);
      router.replace('/dashboard');
    });
    socket.on('invalidDocument', ({ message }) => {
      setCurrentDocument(null);
      setSnackbar(message, SnackbarStatusEnum.ERROR);
    });

    return () => {
      if (socketRef.current) {
        if (sessionId) {
          socketRef.current.emit('leaveSession');
        }
        socketRef.current.disconnect();
      }
    };
  }, [sessionId, setSnackbar, router, currentUser, setUserSessionInStore]);

  // Timer for timeSpent
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isConnected && startTimeRef.current) {
      intervalId = setInterval(() => {
        const diff = Date.now() - (startTimeRef.current as number);
        setTimeSpent(totalTimeRef.current + diff);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected]);

  // Verify user permission for the session
  useEffect(() => {
    if (session && currentUser) {
      const userSession = session.userCollaborationSessions.find(
        (el) => el.user.id === currentUser.id,
      );
      if (!userSession) {
        setSnackbar(
          'You don’t have permissions to access this page',
          SnackbarStatusEnum.ERROR,
        );
        router.push('/dashboard');
      } else {
        setUserSessionInStore(userSession);
      }
    }
  }, [session, currentUser, router, setSnackbar, setUserSessionInStore]);

  // Clear session on unmount
  useEffect(() => {
    return () => {
      clearSession();
    };
  }, [clearSession]);

  // Sync currentDocument ref
  useEffect(() => {
    currentDocumentRef.current = currentDocument;
  }, [currentDocument]);

  const timeSpentInSeconds = Math.floor(timeSpent / 1000);

  const sendMessage = useCallback((message: string) => {
    socketRef.current?.emit('sendMessage', { message });
  }, []);

  const socketEmitters = useSocketEmitters({
    sessionId,
    socket: socketRef.current,
    setAiUsageFetching,
  });

  return useMemo(
    () => ({
      session,
      changeSessionName: socketEmitters.changeSessionName,
      deleteSession: socketEmitters.deleteSession,
      timeSpent: timeSpentInSeconds,
      onlineUsers,
      sendMessage,
      messages,
      invitations,
      createInvitation: socketEmitters.createInvitation,
      fetchNotifications: socketEmitters.fetchNotifications,
      updateNotificationStatus: socketEmitters.updateNotificationStatus,
      deleteNotification: socketEmitters.deleteNotification,
      acceptInvitation: socketEmitters.acceptInvitation,
      changeInvitationRole: socketEmitters.changeInvitationRole,
      changeUserPermissions: socketEmitters.changeUserPermissions,
      setCurrentDocument,
      changeDocumentTitle: socketEmitters.changeDocumentTitle,
      createDocument: socketEmitters.createDocument,
      deleteDocument: socketEmitters.deleteDocument,
      duplicateDocument: socketEmitters.duplicateDocument,
      changeContentAndSaveDocument: socketEmitters.changeContentAndSaveDocument,
      getDocument: socketEmitters.getDocument,
      getDocumentAiUsage: socketEmitters.getDocumentAiUsage,
      createDocumentAiUsage: socketEmitters.createDocumentAiUsage,
      applyVersion: socketEmitters.applyVersion,
      getVersions: socketEmitters.getVersions,
      versions,
      documents,
      currentDocument,
      documentAiUsage,
      newAiUsage,
      setNewAiUsage,
      isAiUsageFetching,
    }),
    [
      session,
      timeSpentInSeconds,
      onlineUsers,
      messages,
      invitations,
      versions,
      documents,
      currentDocument,
      documentAiUsage,
      newAiUsage,
      isAiUsageFetching,
      socketEmitters,
      sendMessage,
    ],
  );
}
