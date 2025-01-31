'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

import {
  ICollaborationSession,
  ICollaborator,
  IInvitation,
  IMessage,
  IUser,
  IUserCollaborationSession,
} from '@/models/models';
import {
  NotificationStatusEnum,
  PermissionEnum,
  SnackbarStatusEnum,
} from '@/models/enums';

import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { useSessionStore } from '@/store/useSessionStore';

interface UseCollaborationSocketParams {
  sessionId?: number; // Если хук используется и в других местах, где sessionId может не передаваться
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

  // References для расчёта времени
  const startTimeRef = useRef<number | null>(null); // Время старта локального таймера
  const totalTimeRef = useRef<number>(0); // Накопленное время (с сервера), в миллисекундах
  const socketRef = useRef<Socket | null>(null);

  // -----------------------------------------------------------
  // 1. Инициализация WebSocket и подписки на события
  // -----------------------------------------------------------
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      path: '/collaboration-session-socket',
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      startTimeRef.current = Date.now();

      if (sessionId) {
        // Если мы заходим на страницу конкретной сессии
        socket.emit('joinSession', { sessionId });
        socket.emit('getMessages'); // Запрос существующих сообщений
        socket.emit('getInvitations'); // Запрос приглашений
      } else {
        // Например, если это "dashboard"
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

    // -----------------------------------------------------------
    // 2. Сессия: получение актуальных данных (session + users)
    // -----------------------------------------------------------
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


    // -----------------------------------------------------------
    // 3. Текущее время (timeSpent)
    // -----------------------------------------------------------
    socket.on('currentTime', ({ totalTime }) => {
      // totalTime приходит в секундах, переводим в миллисекунды
      totalTimeRef.current = totalTime * 1000;
      startTimeRef.current = Date.now();
      setTimeSpent(totalTimeRef.current);
    });

    // -----------------------------------------------------------
    // 4. Онлайн пользователи
    // -----------------------------------------------------------

    socket.on('userLeft', (payload: { userId: number }) => {
      setOnlineUsers((prev) =>
        prev.filter((user) => user.id !== payload.userId),
      );
    });

    // -----------------------------------------------------------
    // 5. Чат-сообщения
    // -----------------------------------------------------------
    socket.on('messages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // -----------------------------------------------------------
    // 6. Ошибки
    // -----------------------------------------------------------
    socket.on('error', (errorMessage: string) => {
      setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
    });

    // -----------------------------------------------------------
    // 7. Приглашения (invitations & notifications)
    // -----------------------------------------------------------
    socket.on('invitations', (fetchedInvitations: IInvitation[]) => {
      setInvitations(fetchedInvitations);
    });

    socket.on('newInvitation', (newInvitation: IInvitation) => {
      // Если мы находимся в конкретной сессии — покажем оповещение
      if (sessionId) {
        setSnackbar(
          `Invitation is sent to ${newInvitation.receiver.email}`,
          SnackbarStatusEnum.SUCCESS,
        );
      }
      setInvitations((prevInvitations) => [...prevInvitations, newInvitation]);
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
      setSession((prevSession) => {
        if (!prevSession) return prevSession;

        // Update userCollaborationSessions in session
        const updatedCollabSessions = prevSession.userCollaborationSessions.map(
          (ucs) => {
            if (ucs.user.id === userId) {
              return { ...ucs, permissions };
            }
            return ucs;
          },
        );

        return {
          ...prevSession,
          userCollaborationSessions: updatedCollabSessions,
        };
      });

      // Update online users
      setOnlineUsers((prevOnlineUsers) =>
        prevOnlineUsers.map((user) =>
          user.id === userId ? { ...user, permissions } : user,
        ),
      );

      if (currentUser && currentUser.id === userId) {
        // Find the current user's session
        const existingUserSession = session?.userCollaborationSessions.find(
          (ucs) => ucs.user.id === currentUser.id,
        );

        if (!existingUserSession) return; // If user session is not found, exit

        const updatedUserSession: IUserCollaborationSession = {
          ...existingUserSession,
          permissions,
        };

        setUserSessionInStore(updatedUserSession);
      }
    });

    // Отключаемся от сокета при анмаунте
    return () => {
      if (socketRef.current) {
        if (sessionId) {
          // Если уходим со страницы конкретной сессии
          socketRef.current.emit('leaveSession', { sessionId });
        }
        socketRef.current.disconnect();
      }
    };
  }, [sessionId, setSnackbar, router]);

  // -----------------------------------------------------------
  // 8. Локальный таймер
  // -----------------------------------------------------------
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isConnected && startTimeRef.current) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const diff = now - (startTimeRef.current as number);
        setTimeSpent(totalTimeRef.current + diff);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected]);

  // -----------------------------------------------------------
  // 9. Проверка прав пользователя на сессию и запись в store
  // -----------------------------------------------------------
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

  // При анмаунте очищаем session из Zustand
  useEffect(() => {
    return () => {
      clearSession();
    };
  }, [clearSession]);

  // -----------------------------------------------------------
  // 10. Методы для чата, инвайтов и т.д.
  // -----------------------------------------------------------
  const timeSpentInSeconds = Math.floor(timeSpent / 1000);

  const sendMessage = (message: string) => {
    socketRef.current?.emit('sendMessage', { message });
  };

  const createInvitation = (invitationData: {
    email: string;
    role: PermissionEnum;
  }) => {
    socketRef.current?.emit('createInvitation', invitationData);
  };

  const fetchNotifications = () => {
    socketRef.current?.emit('getNotifications');
  };

  const updateNotificationStatus = (
    invitationId: number,
    status: NotificationStatusEnum,
  ) => {
    socketRef.current?.emit('updateNotificationStatus', {
      invitationId,
      status,
    });
  };

  const deleteNotification = (invitationId: number) => {
    socketRef.current?.emit('deleteNotification', { invitationId });
  };

  const acceptInvitation = (invitationId: number) => {
    socketRef.current?.emit('acceptInvitation', { invitationId });
  };

  const changeInvitationRole = (
    invitationId: number,
    newRole: PermissionEnum,
  ) => {
    socketRef.current?.emit('changeInvitationRole', { invitationId, newRole });
  };

  const changeUserPermissions = (
    targetUserId: number,
    newPermission: PermissionEnum, // or string
  ) => {
    socketRef.current?.emit('changeUserPermissions', {
      userId: targetUserId,
      permission: newPermission,
    });
  };

  const changeSessionName = (newName: string) => {
    if (!sessionId || !socketRef.current) return;
    socketRef.current.emit('updateSessionName', { sessionId, newName });
  };

  return {
    // Состояние
    session, // данные о сессии (из socket)
    timeSpent: timeSpentInSeconds,
    onlineUsers,
    messages,
    invitations,

    // Методы
    sendMessage,
    createInvitation,
    fetchNotifications,
    updateNotificationStatus,
    deleteNotification,
    acceptInvitation,
    changeInvitationRole,
    changeUserPermissions,
    changeSessionName,
  };
}
