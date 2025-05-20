import React from 'react';

import { FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';

import { IDocument } from '@/models/models';
import { sliceRichContent } from '@/helpers/sliceRichContent';
import TruncatedText from '@/ui/TruncateText';

import DocumentPreview from './DocumentPreview';
import PopupMenu from './PopupMenu';

interface DocumentItemProps {
  document: IDocument;
  sessionId: number;
  onEditTitle: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, sessionId, onEditTitle }) => {
  const [isShowPopup, setShowPopup] = React.useState<number | null>(null);

  const handleEllipsisClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPopup(document.id);
  };

  const closePopup = () => {
    setShowPopup(null);
  };

  return (
    <div className='relative h-[268.8px] w-[201.6px] bg-gray-100 rounded-sm shadow-md cursor-pointer flex flex-col justify-between'>
      <Link
        href={`/session/${sessionId}/document/${document.id}`}
        className='block object-cover grow shrink border-b border-gray-200'
      >
        <DocumentPreview richContent={sliceRichContent(document.richContent)} />
      </Link>

      <div className='flex justify-between items-center px-3 py-2 rounded-b-md bg-white'>
        <div className='flex flex-col'>
          <TruncatedText text={document.title} maxLength={17} className='text-gray-700 font-medium' />
          <span className='text-gray-500 text-sm'>
            {new Date(document.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <button
          className='rounded-full duration-300 text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 cursor-pointer'
          onClick={(e) => handleEllipsisClick(e)}
        >
          <FaEllipsisV className='w-5 h-5' />
        </button>
      </div>

      {isShowPopup === document.id && (
        <PopupMenu
          documentTitle={document.title}
          richContent={document.richContent}
          onEditTitle={onEditTitle}
          documentId={document.id}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default DocumentItem;
