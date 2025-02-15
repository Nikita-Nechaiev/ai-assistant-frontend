import React, { useContext, useEffect, useCallback } from 'react';
import RequirePermission from '@/helpers/RequirePermission';
import { PermissionEnum } from '@/models/enums';
import { SessionContext } from './SessionLayout';
import { useRouter } from 'next/navigation';
import { exportToPDF } from '@/helpers/exportToPdf';
import { Quill } from 'react-quill-new';
import useSnackbarStore from '@/store/useSnackbarStore';

interface PopupMenuProps {
  documentId: number;
  onClose: () => void;
  onEditTitle: () => void;
  richContent: string;
  documentTitle: string;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  documentId,
  onClose,
  onEditTitle,
  richContent,
  documentTitle,
}) => {
  const sessionContext = useContext(SessionContext);
  const router = useRouter();
  const { deleteDocument, duplicateDocument, session } = sessionContext || {};
  const { setSnackbar } = useSnackbarStore();

  const handleRenameDoc = useCallback(() => {
    onEditTitle();
    onClose();
  }, [onEditTitle, onClose]);

  const handleEditDoc = useCallback(() => {
    if (session) {
      router.push(`/session/${session.id}/document/${documentId}`);
    }
  }, [router, session, documentId]);

  const handleDuplicateDoc = useCallback(() => {
    duplicateDocument?.(documentId);
    onClose();
  }, [duplicateDocument, documentId, onClose]);

  const handleDeleteDoc = useCallback(() => {
    deleteDocument?.(documentId);
  }, [deleteDocument, documentId]);

  const handleExportDoc = useCallback(() => {
    const quill = new Quill(document.createElement('div'));
    const delta = quill.clipboard.convert({ html: richContent });
    exportToPDF(documentTitle, delta, setSnackbar);
  }, [richContent, documentTitle, setSnackbar]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.popup-menu')) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className='popup-menu absolute bottom-[60px] right-0 bg-white shadow-md rounded-md p-2 w-40 z-10'>
      <ul className='space-y-2'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <li
            onClick={handleRenameDoc}
            className='cursor-pointer hover:text-blue-500 transition'
          >
            Rename
          </li>
          <li
            onClick={handleEditDoc}
            className='cursor-pointer hover:text-blue-500 transition'
          >
            Edit
          </li>
          <li
            onClick={handleDuplicateDoc}
            className='cursor-pointer hover:text-blue-500 transition'
          >
            Duplicate
          </li>
          <li
            onClick={handleDeleteDoc}
            className='cursor-pointer hover:text-blue-500 transition'
          >
            Delete
          </li>
        </RequirePermission>
        <li
          onClick={handleExportDoc}
          className='cursor-pointer hover:text-blue-500 transition'
        >
          Export as PDF
        </li>
      </ul>
    </div>
  );
};

export default PopupMenu;
