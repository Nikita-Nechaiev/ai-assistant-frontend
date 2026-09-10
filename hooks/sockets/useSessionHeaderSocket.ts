'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';

import { ICollaborationSession, ICollaborator } from '@/models/models';
import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';
import { useSessionStore } from '@/store/useSessionStore';
import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';

interface Params {
  sessionId: number;
  socket: Socket;
}

export function useSessionHeaderSocket({ sessionId, socket }: Params) {
  const { setSnackbar } = useSnackbarStore();
  const { user: currentUser } = useUserStore();
  const { updateSession, setSession: setUserSessionInStore } = useSessionStore();

  const router = useRouter();

  const [sessionName, setSessionName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<ICollaborator[]>([]);
  const [timeSpentMs, setTimeSpentMs] = useState(0);

  const emitChangeSessionName = useCallback(
    (newName: string) => {
      if (!newName.trim()) return;

      socket.emit('updateSessionName', { sessionId, newName: newName.trim() });
    },
    [socket, sessionId],
  );

  const emitDeleteSession = useCallback(() => socket.emit('deleteSession', { sessionId }), [socket, sessionId]);

  const emitChangeUserPermissions = useCallback(
    (userId: number, permission: PermissionEnum) => socket.emit('changeUserPermissions', { userId, permission }),
    [socket],
  );

  const startTimeRef = useRef<number | null>(null);
  const totalTimeRef = useRef<number>(0);
  const routerRef = useRef(router);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const onTotalSessionData = ({
      sessionData,
      users,
      timeSpent,
    }: {
      sessionData: ICollaborationSession;
      users: ICollaborator[];
      timeSpent: number;
    }) => {
      if (!sessionData || !currentUserId) return;

      const currUserSession = sessionData.userCollaborationSessions.find((el) => el.user.id === currentUserId);

      if (!currUserSession) {
        setSnackbar('You don’t have permissions to access this page', SnackbarStatusEnum.ERROR);
        routerRef.current.push('/dashboard');

        return;
      }

      setUserSessionInStore(currUserSession);

      setSessionName(sessionData.name);
      setOnlineUsers(users);

      totalTimeRef.current = timeSpent * 1000;
      startTimeRef.current = Date.now();
      setTimeSpentMs(totalTimeRef.current);
    };

    const onSessionData = (data: ICollaborationSession) => {
      setSessionName(data.name);
    };

    const onUserLeft = ({ userId }: { userId: number }) =>
      setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));

    const onNewOnlineUser = (user: ICollaborator) =>
      setOnlineUsers((prev) => (prev.find((u) => u.id === user.id) ? prev : [...prev, user]));

    const onPermissionsChanged = ({ userId, permissions }: { userId: number; permissions: PermissionEnum[] }) => {
      setOnlineUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, permissions } : u)));

      if (currentUserId === userId) {
        updateSession({ permissions });
      }
    };

    const onError = (msg: string) => setSnackbar(msg, SnackbarStatusEnum.ERROR);

    socket.on('totalSessionData', onTotalSessionData);
    socket.on('sessionData', onSessionData);
    socket.on('newOnlineUser', onNewOnlineUser);
    socket.on('userLeft', onUserLeft);
    socket.on('permissionsChanged', onPermissionsChanged);
    socket.on('error', onError);

    socket.emit('getSessionData', { sessionId });

    return () => {
      socket.off('totalSessionData', onTotalSessionData);
      socket.off('sessionData', onSessionData);
      socket.off('newOnlineUser', onNewOnlineUser);
      socket.off('userLeft', onUserLeft);
      socket.off('permissionsChanged', onPermissionsChanged);
      socket.off('error', onError);
    };
  }, [socket, currentUserId, setSnackbar, setUserSessionInStore, updateSession, sessionId]);

  useEffect(() => {
    if (startTimeRef.current === null) return;

    const id = setInterval(() => {
      const diff = Date.now() - startTimeRef.current!;

      setTimeSpentMs(totalTimeRef.current + diff);
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimeRef.current]);

  return {
    sessionName,
    onlineUsers,
    timeSpentMs,

    emitChangeSessionName,
    emitDeleteSession,
    emitChangeUserPermissions,
  };
}
