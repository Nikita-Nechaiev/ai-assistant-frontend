'use client';

import React, { ReactNode, useCallback, useState } from 'react';

import LargeLoader from '@/components/common/LargeLoader';
import { useUserStore } from '@/store/useUserStore';
import { NotificationStatusEnum } from '@/models/enums';
import { useCollaborationSocket } from '@/hooks/sockets/useCollaborationSocket';
import { useDashboardSocket } from '@/hooks/sockets/useDashboardSocket';

import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import NotificationsDrawer from '../Dashboard/NotificationsDrawer';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout = ({ children, title = 'Workspace' }: MainLayoutProps) => {
  const { user } = useUserStore();
  const { socket } = useCollaborationSocket({});

  const { invitations, fetchNotifications, acceptInvitation, updateNotificationStatus, deleteInvitation } =
    useDashboardSocket(socket);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => {
    setDrawerOpen((open) => {
      const willOpen = !open;

      if (willOpen) fetchNotifications();

      return willOpen;
    });
  }, [fetchNotifications]);

  const handleAccept = useCallback((id: number) => acceptInvitation(id), [acceptInvitation]);
  const handleMarkAsRead = useCallback(
    (id: number) => updateNotificationStatus(id, NotificationStatusEnum.READ),
    [updateNotificationStatus],
  );
  const handleDelete = useCallback((id: number) => deleteInvitation(id), [deleteInvitation]);

  if (!user?.id) return <LargeLoader />;

  return (
    <div className='saas-shell flex h-dvh overflow-hidden bg-muted text-foreground'>
      <Sidebar />

      <div className='ml-[232px] flex min-w-0 flex-1 flex-col'>
        <Header title={title} invitations={invitations} handleToggleDrawwer={toggleDrawer} />

        <MainContent>{children}</MainContent>
      </div>

      <NotificationsDrawer
        isOpen={isDrawerOpen}
        handleClose={() => setDrawerOpen(false)}
        invitations={invitations}
        onAccept={handleAccept}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MainLayout;
