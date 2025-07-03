import { useEffect, useRef, useState } from 'react';

import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

import { SnackbarStatusEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { useSessionStore } from '@/store/useSessionStore';
import { isConvertableToNumber } from '@/helpers/isConvertableToNumber';

interface UseCollaborationSocketParams {
  sessionId?: string | string[] | undefined;
}

export function useCollaborationSocket({ sessionId }: UseCollaborationSocketParams) {
  const router = useRouter();

  const { setSnackbar } = useSnackbarStore();
  const { user: currentUser } = useUserStore();
  const { clearSession, setSession: setUserSessionInStore } = useSessionStore();

  const [_, setSocketReady] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      path: '/collaboration-session-socket',
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;
    setSocketReady(true);

    socket.on('connect', () => {
      if (sessionId) {
        if (typeof sessionId === 'string' && !isConvertableToNumber(sessionId)) {
          setSnackbar('Invalid session page', SnackbarStatusEnum.ERROR);
          router.replace('/dashboard');

          return;
        }

        socket.emit('joinSession', { sessionId: Number(sessionId) });
      } else {
        socket.emit('joinDashboard');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    socket.on('error', (errorMessage: string) => {
      setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
    });

    socket.on('sessionDeleted', ({ message, userId }) => {
      if (socketRef.current) {
        if (sessionId) {
          socketRef.current.emit('leaveSession');
        }

        socketRef.current.disconnect();
      }

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

    return () => {
      if (socketRef.current) {
        if (sessionId) {
          socketRef.current.emit('leaveSession');
        }

        socketRef.current.disconnect();
      }
    };
  }, [currentUser, sessionId, router, setSnackbar, setUserSessionInStore]);

  useEffect(() => {
    return () => {
      clearSession();
      setSocketReady(false);
    };
  }, [clearSession]);

  return { socket: socketRef.current };
}
