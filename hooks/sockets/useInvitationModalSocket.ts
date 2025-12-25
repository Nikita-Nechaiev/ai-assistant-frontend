'use client';

import { useState, useEffect, useCallback, useContext } from 'react';

import { Socket } from 'socket.io-client';

import { IInvitation } from '@/models/models';
import { PermissionEnum } from '@/models/enums';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';

export function useInvitationModalSocket(socket: Socket | null, onError?: (msg: string) => void) {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);

  const ctx = useContext(SessionContext);
  const sessionId = ctx?.sessionId;

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
  }, [socket, sessionId, onError]);

  const changeInvitationRole = useCallback(
    (invitationId: number, newRole: PermissionEnum) =>
      socket?.emit('changeInvitationRole', { invitationId, newRole, sessionId }),
    [socket, sessionId],
  );

  const deleteInvitation = useCallback(
    (invitationId: number) => socket?.emit('deleteNotification', { invitationId, sessionId }),
    [socket, sessionId],
  );

  const createInvitation = useCallback(
    (data: { email: string; role: PermissionEnum }) =>
      new Promise<IInvitation>((resolve, reject) => {
        socket?.emit('createInvitation', { ...data, sessionId }, (res: any) => {
          if (res?.ok && res.invitation) return resolve(res.invitation);

          reject(new Error(res?.message || 'Failed to create invitation'));
        });
      }),
    [socket, sessionId],
  );

  const fetchNotifications = useCallback(
    () =>
      new Promise<IInvitation[] | void>((resolve) => {
        socket?.emit('getInvitations', { sessionId }, () => resolve());
      }),
    [socket, sessionId],
  );

  return {
    invitations,
    createInvitation,
    changeInvitationRole,
    deleteInvitation,
    fetchNotifications,
  };
}
