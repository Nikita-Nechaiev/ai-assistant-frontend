'use client';
import React, { ReactNode, useState } from 'react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const {
    invitations,
    fetchNotifications,
    acceptInvitation,
    updateNotificationStatus,
    deleteNotification,
  } = useCollaborationSocket({});

  // Drawer handlers
  const handleDrawerOpen = () => {
    setIsDrawerOpen((prev) => !prev);

    if (!isDrawerOpen) {
      fetchNotifications(); // Fetch notifications when the drawer is opened
    }
  };

  const handleDrawerClose = () => setIsDrawerOpen(false);

  // Notification actions
  const handleAccept = (id: number) => {
    acceptInvitation(id);
  };

  const handleMarkAsRead = (id: number) => {
    updateNotificationStatus(id, NotificationStatusEnum.READ); // Assuming 'READ' is the status enum for marking as read
  };

  const handleDelete = (id: number) => {
    deleteNotification(id);
  };

  return (
    <div className='flex h-screen overflow-clip'>
      <Sidebar />

      <div className='ml-64 flex-1 flex flex-col'>
        <Header
          invitations={invitations}
          handleToggleDrawwer={handleDrawerOpen}
        />

        <MainContent>{children}</MainContent>

        <Snackbar />
      </div>
      <NotificationsDrawer
        isOpen={isDrawerOpen}
        handleClose={handleDrawerClose}
        invitations={invitations} // Pass invitations to the drawer
        onAccept={handleAccept}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MainLayout;
