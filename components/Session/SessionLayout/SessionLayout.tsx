'use client';

import React, { createContext, useState } from 'react';

import { useParams } from 'next/navigation';
import { FiMessageSquare } from 'react-icons/fi';
import { Socket } from 'socket.io-client';

import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/components/common/RequirePermission';
import LargeLoader from '@/components/common/LargeLoader';
import { Button } from '@/components/ui/button';
import { useCollaborationSocket } from '@/hooks/sockets/useCollaborationSocket';

import InvitationModal from '../InvitationModal/InvitationModal';
import Chat from '../Chat/Chat';
import SessionHeader from './SessionHeader';

interface SessionContextType {
  socket: Socket | null;
  sessionId: number;
  setDocumentBreadcrumb?: (document: { id: number; title: string }) => void;
}

export const SessionContext = createContext<SessionContextType | null>(null);

interface SessionLayoutProps {
  children: React.ReactNode;
}

const SessionLayout: React.FC<SessionLayoutProps> = ({ children }) => {
  const { id: sessionId, documentId } = useParams<{ id: string; documentId: string }>();
  const { socket } = useCollaborationSocket({ sessionId });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInvitationModalOpen, setInvitationModalOpen] = useState(false);
  const [documentBreadcrumb, setDocumentBreadcrumb] = useState<{ id: number; title: string } | null>(null);

  if (!socket) return <LargeLoader />;

  return (
    <SessionContext.Provider value={{ sessionId: Number(sessionId), socket, setDocumentBreadcrumb }}>
      <div className='saas-shell relative min-h-screen bg-muted text-foreground'>
        <SessionHeader
          sessionId={Number(sessionId)}
          handleOpenInviteModal={() => setInvitationModalOpen(true)}
          socket={socket}
          documentTitle={documentBreadcrumb?.id === Number(documentId) ? documentBreadcrumb.title : undefined}
        />
        <div className='pb-10'>{children}</div>
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className='fixed bottom-6 right-7 z-40 h-11 gap-2.5 rounded-xl px-5 text-sm shadow-blue'
          >
            <FiMessageSquare size={17} aria-hidden='true' />
            Session chat
          </Button>
        )}
        <Chat isOpen={isChatOpen} handleClose={() => setIsChatOpen(false)} socket={socket} />
        <RequirePermission permission={PermissionEnum.EDIT}>
          <InvitationModal
            isOpen={isInvitationModalOpen}
            onClose={() => setInvitationModalOpen(false)}
            socket={socket}
          />
        </RequirePermission>
      </div>
    </SessionContext.Provider>
  );
};

export default SessionLayout;
