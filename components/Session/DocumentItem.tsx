import React, { useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';
import { IDocument } from '@/models/models';
import RequirePermission from '@/helpers/RequirePermission';
import { PermissionEnum } from '@/models/enums';

interface DocumentItemProps {
  document: IDocument;
  sessionId: number;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, sessionId }) => {
  const [isShowPopup, setShowPopup] = React.useState<number | null>(null);

  const handleEllipsisClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPopup(document.id);
  };

  const closePopup = () => {
    setShowPopup(null);
  };

  return (
    <div className='relative h-[268.8px] w-[201.6px] bg-gray-100 rounded-md shadow-md cursor-pointer flex flex-col justify-between'>
      {/* Image Preview */}
      <Link
        href={`/session/${sessionId}/document/${document.id}`}
        className='block object-cover grow shrink'
      >
        <img
          src='/document-placeholder.png'
          alt={`${document.title} Preview`}
          className='object-cover w-full h-full rounded-t-md'
        />
      </Link>

      {/* Title, Date, and Ellipsis */}
      <div className='flex justify-between items-center px-3 py-2 rounded-b-md'>
        <div className='flex flex-col'>
          <span className='text-gray-700 font-medium truncate'>
            {document.title}
          </span>
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

      {/* Popup Menu */}
      {isShowPopup === document.id && (
        <PopupMenu documentId={document.id} onClose={closePopup} />
      )}
    </div>
  );
};

export default DocumentItem;

interface PopupMenuProps {
  documentId: number;
  onClose: () => void;
}

const PopupMenu: React.FC<PopupMenuProps> = ({ documentId, onClose }) => {
  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.popup-menu')) {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className='popup-menu absolute bottom-[60px] right-0 bg-white shadow-md rounded-md p-2 w-40 z-10'>
      <ul className='space-y-2'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <li className='cursor-pointer duration-300 hover:text-blue-500'>
            Rename
          </li>
          <li className='cursor-pointer duration-300 hover:text-blue-500'>
            Edit
          </li>
          <li className='cursor-pointer duration-300 hover:text-blue-500'>
            Duplicate
          </li>
          <li className='cursor-pointer duration-300 hover:text-blue-500'>
            Delete
          </li>
          <li className='cursor-pointer duration-300 hover:text-blue-500'>
            View Statistics
          </li>
        </RequirePermission>
        <li className='cursor-pointer duration-300 hover:text-blue-500'>
          Export as PDF
        </li>
      </ul>
    </div>
  );
};
