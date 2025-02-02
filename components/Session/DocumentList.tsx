import React, { useState } from 'react';
import { PiPlusCircleDuotone } from 'react-icons/pi';
import DocumentItem from './DocumentItem';
import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import { IDocument } from '@/models/models';
import RequirePermission from '@/helpers/RequirePermission';
import { PermissionEnum } from '@/models/enums';
import Link from 'next/link';

interface DocumentListProps {
  documents?: IDocument[];
  sessionId: number;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  sessionId,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('New Document');

  const handleCreateDocument = () => {
    console.log('Creating document:', documentTitle);
    setModalOpen(false);
  };

  const hasDocuments = documents && documents.length > 0;

  return (
    <section className='px-6 max-w-[1150px] mx-auto'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2'>
        Session Documents
      </h1>
      <div className='flex flex-wrap gap-[23.5]'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={() => setModalOpen(true)}
            className='h-[268.8] w-[201.6] relative flex duration-300 items-center justify-center bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300'
          >
            <PiPlusCircleDuotone className='w-10 h-10 text-gray-400' />
          </button>
        </RequirePermission>
        <Link href={`/session/${sessionId}/document/1`} className='block p-5 bg-mainDark text-mainLight rounded'>MOCK DOCUMENT LINK</Link>
        {hasDocuments ? (
          documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              sessionId={sessionId}
            />
          ))
        ) : (
          <div className='text-center text-gray-500 mt-4'>
            No documents found. Click the button to create a new document.
          </div>
        )}
      </div>
      <RequirePermission permission={PermissionEnum.EDIT}>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleCreateDocument}
            title='Create New Document'
            width='w-[500px]'
            submitText='Create'
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
        )}
      </RequirePermission>
    </section>
  );
};

export default DocumentList;
