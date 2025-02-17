'use client';
import React, { ReactNode, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import Snackbar from '@/ui/Snackbar';
import NotificationsDrawer from './NotificationsDrawer';
import { useCollaborationSocket } from '@/hooks/useCollaborationSocket';
import { NotificationStatusEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';
import LargeLoader from '@/ui/LargeLoader';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user: currentUser } = useUserStore();

  const {
    invitations,
    fetchNotifications,
    acceptInvitation,
    updateNotificationStatus,
    deleteNotification,
  } = useCollaborationSocket({});

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
    if (!isDrawerOpen) fetchNotifications();
  }, [isDrawerOpen, fetchNotifications]);

  const handleAccept = useCallback(
    (id: number) => acceptInvitation(id),
    [acceptInvitation],
  );
  const handleMarkAsRead = useCallback(
    (id: number) => updateNotificationStatus(id, NotificationStatusEnum.READ),
    [updateNotificationStatus],
  );
  const handleDelete = useCallback(
    (id: number) => deleteNotification(id),
    [deleteNotification],
  );

  if (!currentUser?.id) {
    return <LargeLoader />
  }

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
        handleClose={() => setIsDrawerOpen(false)}
        invitations={invitations}
        onAccept={handleAccept}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MainLayout;
