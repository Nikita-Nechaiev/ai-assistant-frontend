'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useCollaborationSocket } from '@/hooks/useCollaborationSocket';
import SessionHeader from '@/components/Session/Header';
import DocumentList from '@/components/Session/DocumentList';
import Chat from '@/components/Session/Chat';
import InvitationModal from '@/components/Session/InvitationModal';
import { BsChatDots } from 'react-icons/bs';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';

export default function SessionPage() {
  const { id: sessionId } = useParams();
  const {
    session,
    timeSpent,
    onlineUsers,
    messages,
    sendMessage,
    invitations,
    createInvitation,
    changeInvitationRole,
    deleteNotification,
    changeUserPermissions,
    changeSessionName,
  } = useCollaborationSocket({ sessionId: Number(sessionId) });

  const [isInvitationModalOpen, setInvitationModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!session) {
    return <div>Loading session...</div>;
  }

  const handleOpenInviteModal = () => setInvitationModalOpen(true);
  const handleCloseInviteModal = () => setInvitationModalOpen(false);

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <div className='relative min-h-screen'>
      <SessionHeader
        changeSessionName={changeSessionName}
        handleOpenInviteModal={handleOpenInviteModal}
        sessionName={session.name}
        collaborators={onlineUsers}
        timeSpent={timeSpent}
        changeUserPermissions={changeUserPermissions}
      />

      <div className='pt-[92px]'>
        <DocumentList sessionId={session.id} documents={session.documents} />
      </div>

      {!isChatOpen && (
        <button
          onClick={handleOpenChat}
          className='fixed bottom-4 right-4 z-50 flex items-center justify-center p-3 bg-mainDark hover:bg-mainDarkHover text-white rounded-full shadow-lg'
        >
          <BsChatDots size={30} />
        </button>
      )}

      <Chat
        isOpen={isChatOpen}
        handleClose={handleCloseChat}
        messages={messages}
        sendMessage={sendMessage}
      />

      <RequirePermission permission={PermissionEnum.EDIT}>
        <InvitationModal
          deleteInvitation={deleteNotification}
          createInvitation={createInvitation}
          isOpen={isInvitationModalOpen}
          onClose={handleCloseInviteModal}
          invitations={invitations}
          changeInvitationRole={changeInvitationRole}
        />
      </RequirePermission>
    </div>
  );
}
