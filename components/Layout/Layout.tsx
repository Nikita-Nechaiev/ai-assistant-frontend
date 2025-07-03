'use client';

import React, { ReactNode, useCallback, useState } from 'react';

import LargeLoader from '@/ui/LargeLoader';
import Snackbar from '@/ui/Snackbar';
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
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
    <div className='flex h-screen overflow-clip'>
      <Sidebar />

      <div className='ml-64 flex-1 flex flex-col'>
        <Header invitations={invitations} handleToggleDrawwer={toggleDrawer} />

        <MainContent>{children}</MainContent>

        <Snackbar />
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
