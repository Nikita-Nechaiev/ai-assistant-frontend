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
  const { clearSession } = useSessionStore();

  const [socket, setSocket] = useState<Socket | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const routerRef = useRef(router);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const collaborationSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      path: '/collaboration-session-socket',
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = collaborationSocket;
    setSocket(collaborationSocket);

    collaborationSocket.on('connect', () => {
      if (sessionId) {
        if (typeof sessionId === 'string' && !isConvertableToNumber(sessionId)) {
          setSnackbar('Invalid session page', SnackbarStatusEnum.ERROR);
          routerRef.current.replace('/dashboard');

          return;
        }

        collaborationSocket.emit('joinSession', { sessionId: Number(sessionId) });
      } else {
        collaborationSocket.emit('joinDashboard');
      }
    });

    collaborationSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    collaborationSocket.on('error', (errorMessage: string) => {
      setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
    });

    collaborationSocket.on('sessionDeleted', ({ message, userId }) => {
      if (socketRef.current) {
        if (sessionId) {
          socketRef.current.emit('leaveSession');
        }

        socketRef.current.disconnect();
      }

      if (currentUserId !== userId) {
        setSnackbar(message, SnackbarStatusEnum.WARNING);
      } else {
        setSnackbar('Session has been deleted', SnackbarStatusEnum.SUCCESS);
      }

      routerRef.current.replace('/dashboard');
    });

    collaborationSocket.on('invalidSession', ({ message }) => {
      setSnackbar(message, SnackbarStatusEnum.ERROR);
      routerRef.current.replace('/dashboard');
    });

    return () => {
      if (socketRef.current) {
        if (sessionId) {
          socketRef.current.emit('leaveSession');
        }

        socketRef.current.disconnect();
      }

      socketRef.current = null;
      setSocket(null);
    };
  }, [currentUserId, sessionId, setSnackbar]);

  useEffect(() => {
    return () => {
      clearSession();
    };
  }, [clearSession]);

  return { socket };
}
