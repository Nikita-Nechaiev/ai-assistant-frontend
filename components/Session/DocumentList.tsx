import React, { useState } from 'react';
import { PiPlusCircleDuotone } from 'react-icons/pi';
import DocumentItem from './DocumentItem';
import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import { IDocument } from '@/models/models';
import RequirePermission from '@/helpers/RequirePermission';
import { PermissionEnum } from '@/models/enums';
import { GoArrowSwitch } from 'react-icons/go';

interface DocumentListProps {
  documents?: IDocument[];
  sessionId: number;
  createDocument: (title: string) => void;
  changeDocumentTitle: (documentId: number, newTitle: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents = [],
  sessionId,
  createDocument,
  changeDocumentTitle,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(
    null,
  );

  const handleModalSubmit = () => {
    if (!documentTitle.trim()) return;
    if (editingDocumentId !== null) {
      changeDocumentTitle(editingDocumentId, documentTitle);
    } else {
      createDocument(documentTitle);
    }
    closeModal();
  };

  const openModal = (title = '', documentId: number | null = null) => {
    setDocumentTitle(title);
    setEditingDocumentId(documentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDocumentTitle('');
    setEditingDocumentId(null);
  };

  return (
    <section className='px-6 max-w-[1150px] mx-auto'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2'>
        Session Documents
      </h1>

      <div className='flex flex-wrap gap-[23.5]'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={() => openModal()}
            className='h-[268.8] w-[201.6] flex items-center justify-center bg-gray-200 rounded-sm hover:bg-gray-300 transition'
          >
            <PiPlusCircleDuotone className='w-10 h-10 text-gray-400' />
          </button>
        </RequirePermission>

        {documents.length > 0 ? (
          documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              sessionId={sessionId}
              onEditTitle={() => openModal(document.title, document.id)}
            />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-4 py-10 text-gray-500 w-[600px]'>
            <GoArrowSwitch size={30} />
            <h2 className='text-lg font-semibold'>No documents found</h2>
            <RequirePermission permission={PermissionEnum.EDIT}>
              {' '}
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
            onSubmit={handleModalSubmit}
            title={
              editingDocumentId ? 'Edit Document Title' : 'Create New Document'
            }
            width='w-[500px]'
            submitText={editingDocumentId ? 'Save' : 'Create'}
          >
            <InputField
              marginBottom={20}
              placeholder='Enter Document Title'
              id='documentTitle'
              label='Document Title'
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
          </Modal>
        </RequirePermission>
      )}
    </section>
  );
};

export default DocumentList;
