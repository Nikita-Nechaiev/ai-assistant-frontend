'use client';

import React, { createContext, useState } from 'react';

import { useParams } from 'next/navigation';
import { BsChatDots } from 'react-icons/bs';
import { Socket } from 'socket.io-client';

import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';
import LargeLoader from '@/ui/LargeLoader';
import { useCollaborationSocket } from '@/hooks/sockets/useCollaborationSocket';

import InvitationModal from '../InvitationModal/InvitationModal';
import Chat from '../Chat/Chat';
import SessionHeader from './SessionHeader';

interface SessionContextType {
  socket: Socket | null;
  sessionId: number;
}

export const SessionContext = createContext<SessionContextType | null>(null);

interface SessionLayoutProps {
  children: React.ReactNode;
}

const SessionLayout: React.FC<SessionLayoutProps> = ({ children }) => {
  const { id: sessionId } = useParams<{
    id: string;
    documentId: string;
  }>();

  const { socket } = useCollaborationSocket({ sessionId });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInvitationModalOpen, setInvitationModalOpen] = useState(false);

  if (!socket) {
    return <LargeLoader />;
  }

  const handleOpenInviteModal = () => setInvitationModalOpen(true);
  const handleCloseInviteModal = () => setInvitationModalOpen(false);
  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <SessionContext.Provider
      value={{
        sessionId: Number(sessionId),
        socket,
      }}
    >
      <div className='relative min-h-screen'>
        <SessionHeader sessionId={Number(sessionId)} handleOpenInviteModal={handleOpenInviteModal} socket={socket} />
        <div className='pt-[92px]'>{children}</div>
        {!isChatOpen && (
          <button
            onClick={handleOpenChat}
            className='fixed bottom-4 right-4 z-40 flex items-center justify-center p-3 bg-mainDark hover:bg-mainDarkHover text-white rounded-full shadow-lg'
          >
            <BsChatDots size={30} />
          </button>
        )}
        <Chat isOpen={isChatOpen} handleClose={handleCloseChat} socket={socket} />
        <RequirePermission permission={PermissionEnum.EDIT}>
          <InvitationModal isOpen={isInvitationModalOpen} onClose={handleCloseInviteModal} socket={socket} />
        </RequirePermission>
      </div>
    </SessionContext.Provider>
  );
};

export default SessionLayout;
