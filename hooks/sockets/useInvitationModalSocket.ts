'use client';

import { useState, useEffect, useCallback } from 'react';

import { Socket } from 'socket.io-client';

import { IInvitation } from '@/models/models';
import { PermissionEnum } from '@/models/enums';

export function useInvitationModalSocket(socket: Socket | null, onError?: (msg: string) => void) {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onInvitations = (list: IInvitation[]) => setInvitations(list);

    const onNewInvitation = (inv: IInvitation) =>
      setInvitations((prev) => (prev.some((i) => i.id === inv.id) ? prev : [...prev, inv]));

    const onInvitationUpdated = (inv: IInvitation) =>
      setInvitations((prev) => prev.map((i) => (i.id === inv.id ? { ...i, ...inv } : i)));

    const onInvitationDeleted = ({ invitationId }: { invitationId: number }) =>
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));

    const onErr = (msg: string) => onError?.(msg);

    socket.on('invitations', onInvitations);
    socket.on('newInvitation', onNewInvitation);
    socket.on('invitationUpdated', onInvitationUpdated);
    socket.on('notificationDeleted', onInvitationDeleted);
    socket.on('error', onErr);

    return () => {
      socket.off('invitations', onInvitations);
      socket.off('newInvitation', onNewInvitation);
      socket.off('invitationUpdated', onInvitationUpdated);
      socket.off('notificationDeleted', onInvitationDeleted);
      socket.off('error', onErr);
    };
  }, [socket, onError]);

  const createInvitation = useCallback(
    (data: { email: string; role: PermissionEnum }) => socket?.emit('createInvitation', data),
    [socket],
  );

  const changeInvitationRole = useCallback(
    (invitationId: number, newRole: PermissionEnum) => socket?.emit('changeInvitationRole', { invitationId, newRole }),
    [socket],
  );

  const deleteInvitation = useCallback(
    (invitationId: number) => socket?.emit('deleteNotification', { invitationId }),
    [socket],
  );

  const fetchNotifications = useCallback(() => socket?.emit('getInvitations'), [socket]);

  return {
    invitations,
    createInvitation,
    changeInvitationRole,
    deleteInvitation,
    fetchNotifications,
  };
}
