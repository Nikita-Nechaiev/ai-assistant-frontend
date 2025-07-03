'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';

import { IInvitation } from '@/models/models';
import { NotificationStatusEnum, SnackbarStatusEnum } from '@/models/enums';
import useSnackbarStore from '@/store/useSnackbarStore';

export function useDashboardSocket(socket: Socket | null) {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const onNotifications = (list: IInvitation[]) => setInvitations(list);

    const upsert = (inv: IInvitation) =>
      setInvitations((p) => (p.some((i) => i.id === inv.id) ? p.map((i) => (i.id === inv.id ? inv : i)) : [...p, inv]));
    const onDel = ({ invitationId }: { invitationId: number }) =>
      setInvitations((p) => p.filter((i) => i.id !== invitationId));

    const onInvitations = (list: IInvitation[]) => setInvitations(list);

    const onAccepted = ({ invitationSessionId }: { invitationSessionId: number; invitationId: number }) => {
      setSnackbar('Invitation accepted. Redirecting…', SnackbarStatusEnum.SUCCESS);
      router.push(`/session/${invitationSessionId}`);
    };

    socket.on('notifications', onNotifications);
    socket.on('notificationUpdated', upsert);
    socket.on('notificationDeleted', onDel);

    socket.on('invitations', onInvitations);
    socket.on('newInvitation', upsert);
    socket.on('invitationUpdated', upsert);
    socket.on('invitationAccepted', onAccepted);

    return () => {
      socket.off('notifications', onNotifications);
      socket.off('notificationUpdated', upsert);
      socket.off('notificationDeleted', onDel);

      socket.off('invitations', onInvitations);
      socket.off('newInvitation', upsert);
      socket.off('invitationUpdated', upsert);
      socket.off('invitationAccepted', onAccepted);
    };
  }, [socket, setSnackbar, router]);

  const fetchNotifications = useCallback(() => socket?.emit('getNotifications'), [socket]);

  const acceptInvitation = useCallback(
    (id: number) => socket?.emit('acceptInvitation', { invitationId: id }),
    [socket],
  );

  const updateNotificationStatus = useCallback(
    (id: number, status: NotificationStatusEnum) =>
      socket?.emit('updateNotificationStatus', { invitationId: id, status }),
    [socket],
  );

  const deleteInvitation = useCallback(
    (id: number) => socket?.emit('deleteNotification', { invitationId: id }),
    [socket],
  );

  return {
    invitations,
    fetchNotifications,
    acceptInvitation,
    updateNotificationStatus,
    deleteInvitation,
  };
}
