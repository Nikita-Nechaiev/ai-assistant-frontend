'use client';
import React, { ReactNode, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import Snackbar from '@/ui/Snackbar';
import NotificationsDrawer from './NotificationsDrawer';
import { useCollaborationSocket } from '@/hooks/useCollaborationSocket';
import { NotificationStatusEnum } from '@/models/enums';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    invitations,
    fetchNotifications,
    acceptInvitation,
    updateNotificationStatus,
    deleteNotification,
  } = useCollaborationSocket({});

  
  console.log(typeof invitations[0]?.date); // Check if it's a string, undefined, or object
  console.log(typeof invitations[0]?.expiresAt);

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
