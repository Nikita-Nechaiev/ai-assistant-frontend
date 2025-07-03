'use client';

import React, { useState } from 'react';

import { Socket } from 'socket.io-client';
import { PiPlusCircleDuotone } from 'react-icons/pi';
import { GoArrowSwitch } from 'react-icons/go';

import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import { IDocument } from '@/models/models';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';
import { useDocumentListSocket } from '@/hooks/sockets/useDocumentListSocket';

import DocumentItem from './DocumentItem';

interface DocumentListProps {
  sessionId: number;
  socket: Socket | null;
}

const DocumentList: React.FC<DocumentListProps> = ({ sessionId, socket }) => {
  const { documents, createDocument, changeDocumentTitle } = useDocumentListSocket({
    sessionId,
    socket,
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const closeModal = () => {
    setModalOpen(false);
    setTitleInput('');
    setEditingId(null);
  };

  const openCreate = () => {
    setTitleInput('');
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (doc: IDocument) => {
    setTitleInput(doc.title);
    setEditingId(doc.id);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const trimmed = titleInput.trim();

    if (!trimmed) return;

    if (editingId) changeDocumentTitle(editingId, trimmed);
    else createDocument(trimmed);

    closeModal();
  };

  return (
    <section className='px-6 max-w-[1150px] mx-auto'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2'>Session&nbsp;Documents</h1>

      <div className='flex flex-wrap gap-[23.5px]'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={openCreate}
            className='h-[268.8px] w-[201.6px] flex items-center justify-center bg-gray-200 rounded-sm hover:bg-gray-300 transition'
          >
            <PiPlusCircleDuotone className='w-10 h-10 text-gray-400' />
          </button>
        </RequirePermission>

        {documents.length ? (
          documents.map((doc) => (
            <DocumentItem key={doc.id} document={doc} sessionId={sessionId} onEditTitle={() => openEdit(doc)} />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-4 py-10 text-gray-500 w-[600px]'>
            <GoArrowSwitch size={30} />
            <h2 className='text-lg font-semibold'>No documents found</h2>
            <RequirePermission permission={PermissionEnum.EDIT}>
              <p>Click the button to create a new document.</p>
            </RequirePermission>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RequirePermission permission={PermissionEnum.EDIT}>
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            title={editingId ? 'Edit Document Title' : 'Create New Document'}
            width='w-[500px]'
            submitText={editingId ? 'Save' : 'Create'}
            cancelText='Cancel'
          >
            <InputField
              marginBottom={20}
              placeholder='Enter Document Title'
              id='documentTitle'
              label='Document Title'
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
          </Modal>
        </RequirePermission>
      )}
    </section>
  );
};

export default DocumentList;
