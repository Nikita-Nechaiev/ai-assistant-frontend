'use client';

import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

import { useParams } from 'next/navigation';
import { BsChatDots } from 'react-icons/bs';

import { useCollaborationSocket } from '@/hooks/useCollaborationSocket';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';
import { IAiToolUsage, ICollaborationSession, IDocument, IVersion } from '@/models/models';
import LargeLoader from '@/ui/LargeLoader';

import InvitationModal from '../InvitationModal/InvitationModal';
import Chat from '../Chat/Chat';
import SessionHeader from './SessionHeader';

interface SessionContextType {
  session: ICollaborationSession;
  documents: IDocument[];
  currentDocument: IDocument | null;
  changeDocumentTitle: (documentId: number, newTitle: string) => void;
  createDocument: (title: string) => void;
  deleteDocument: (documentId: number) => void;
  duplicateDocument: (documentId: number) => void;
  changeContentAndSaveDocument: (documentId: number, newContent: string) => void;
  applyVersion: (documentId: number, versionId: number) => void;
  getDocument: (documentId: number) => void;
  createDocumentAiUsage: (params: {
    toolName: string;
    text: string;
    documentId: number;
    targetLanguage?: string;
  }) => void;
  getVersions: (documentId: number) => void;
  versions: IVersion[];
  newAiUsage: IAiToolUsage | null;
  setNewAiUsage: Dispatch<SetStateAction<IAiToolUsage | null>>;
  isAiUsageFetching: boolean;
  setCurrentDocument: Dispatch<SetStateAction<IDocument | null>>;
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

  const {
    session,
    timeSpent,
    onlineUsers,
    messages,
    invitations,
    documents,
    currentDocument,
    sendMessage,
    createInvitation,
    deleteNotification,
    changeInvitationRole,
    changeUserPermissions,
    changeSessionName,
    changeDocumentTitle,
    createDocument,
    deleteDocument,
    duplicateDocument,
    changeContentAndSaveDocument,
    applyVersion,
    getDocument,
    createDocumentAiUsage,
    getVersions,
    versions,
    isAiUsageFetching,
    setNewAiUsage,
    newAiUsage,
    setCurrentDocument,
    deleteSession,
  } = useCollaborationSocket({ sessionId: sessionId });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInvitationModalOpen, setInvitationModalOpen] = useState(false);

  if (!session) {
    return <LargeLoader />;
  }

  const handleOpenInviteModal = () => setInvitationModalOpen(true);
  const handleCloseInviteModal = () => setInvitationModalOpen(false);
  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <SessionContext.Provider
      value={{
        session: session,
        versions: versions,
        getVersions: getVersions,
        documents: documents,
        currentDocument: currentDocument,
        changeDocumentTitle: changeDocumentTitle,
        createDocument: createDocument,
        deleteDocument: deleteDocument,
        duplicateDocument: duplicateDocument,
        changeContentAndSaveDocument: changeContentAndSaveDocument,
        applyVersion: applyVersion,
        getDocument: getDocument,
        createDocumentAiUsage: createDocumentAiUsage,
        isAiUsageFetching: isAiUsageFetching,
        setNewAiUsage: setNewAiUsage,
        newAiUsage: newAiUsage,
        setCurrentDocument: setCurrentDocument,
      }}
    >
      <div className='relative min-h-screen'>
        <SessionHeader
          deleteSession={() => deleteSession(session.id)}
          changeSessionName={changeSessionName}
          handleOpenInviteModal={handleOpenInviteModal}
          sessionName={session.name}
          collaborators={onlineUsers}
          timeSpent={timeSpent}
          changeUserPermissions={changeUserPermissions}
        />
        <div className='pt-[92px]'>{children}</div>
        {!isChatOpen && (
          <button
            onClick={handleOpenChat}
            className='fixed bottom-4 right-4 z-40 flex items-center justify-center p-3 bg-mainDark hover:bg-mainDarkHover text-white rounded-full shadow-lg'
          >
            <BsChatDots size={30} />
          </button>
        )}
        <Chat isOpen={isChatOpen} handleClose={handleCloseChat} messages={messages} sendMessage={sendMessage} />
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
    </SessionContext.Provider>
  );
};

export default SessionLayout;
