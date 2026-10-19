'use client';

import { useParams } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { FiClock, FiUserPlus } from 'react-icons/fi';

import WorkspaceBreadcrumbs, { WorkspaceBreadcrumbItem } from '@/components/common/WorkspaceBreadcrumbs';
import AppLogo from '@/components/common/AppLogo';
import UserAvatarCircle from '@/components/common/UserAvatarCircle';
import { Button } from '@/components/ui/button';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/components/common/RequirePermission';
import { formatTimeSpent } from '@/helpers/timeHelpers';
import { useSessionHeaderSocket } from '@/hooks/sockets/useSessionHeaderSocket';

import SessionActions from './SessionActions';

interface Props {
  sessionId: number;
  socket: Socket;
  handleOpenInviteModal: () => void;
  documentTitle?: string;
}

export default function SessionHeader({ sessionId, socket, handleOpenInviteModal, documentTitle }: Props) {
  const { documentId } = useParams<{ documentId?: string }>();
  const session = useSessionHeaderSocket({ sessionId, socket });
  const { onlineUsers, timeSpentMs, emitChangeUserPermissions } = session;
  const shownUsers = onlineUsers.slice(0, 5);
  const items: WorkspaceBreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: session.sessionName ? `Session (${session.sessionName})` : 'Session', href: `/session/${sessionId}` },
  ];

  if (documentId)
    items.push({
      label: documentTitle !== undefined ? `Document (${documentTitle})` : 'Document',
      href: `/session/${sessionId}/document/${documentId}`,
    });

  return (
    <>
      <header className='fixed inset-x-0 top-0 z-40 flex h-[72px] items-center justify-between gap-6 border-b border-border bg-white px-8'>
        <div className='flex min-w-0 flex-1 items-center gap-6'>
          <div className='shrink-0 border-r border-border pr-6'>
            <AppLogo variant='workspace' />
          </div>
          <WorkspaceBreadcrumbs items={items} />
        </div>
        <div className='flex shrink-0 items-center gap-5'>
          <div className='flex items-center gap-3'>
            <div className='flex -space-x-2'>
              {shownUsers.map((user) => (
                <UserAvatarCircle
                  key={user.id}
                  userId={user.id}
                  name={user.name}
                  email={user.email}
                  avatar={user.avatar}
                  isYellow
                  isBelowTooltip
                  currentPermission={user.permissions[user.permissions.length - 1]}
                  changeUserPermissions={emitChangeUserPermissions}
                />
              ))}
              {onlineUsers.length > 5 && (
                <span className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-[13px] font-semibold text-primary'>
                  +{onlineUsers.length - 5}
                </span>
              )}
            </div>
            <span className='text-sm text-muted-foreground'>{onlineUsers.length} online</span>
          </div>
          <div
            title='Your time in this session'
            className='flex items-center gap-2 border-l border-border pl-5 text-sm tabular-nums text-muted-foreground'
          >
            <FiClock size={14} aria-hidden='true' />
            {formatTimeSpent(Math.floor(timeSpentMs / 1000))}
          </div>
          <RequirePermission permission={PermissionEnum.EDIT}>
            <Button
              data-testid='open-invite-modal'
              onClick={handleOpenInviteModal}
              size='sm'
              className='h-9 text-sm shadow-blue'
            >
              <FiUserPlus aria-hidden='true' />
              Invite collaborators
            </Button>
          </RequirePermission>
        </div>
      </header>
      <SessionActions session={session} sessionId={sessionId} isDocumentPage={!!documentId} />
    </>
  );
}
