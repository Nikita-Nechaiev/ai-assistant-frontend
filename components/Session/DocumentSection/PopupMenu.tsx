'use client';

import React, { useContext, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import { Quill as QuillType } from 'react-quill-new';

import { exportToPDF } from '@/helpers/exportToPdf';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';
import useSnackbarStore from '@/store/useSnackbarStore';
import { convertRichContentToDelta } from '@/helpers/documentHelpers';
import { usePopupMenu } from '@/hooks/sockets/usePopupMenuSocket';

import { SessionContext } from '../SessionLayout/SessionLayout';

interface PopupMenuProps {
  documentId: number;
  onClose: () => void;
  onEditTitle: () => void;
  richContent: string;
  documentTitle: string;
}

const PopupMenu: React.FC<PopupMenuProps> = ({ documentId, onClose, onEditTitle, richContent, documentTitle }) => {
  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();

  const sessionCtx = useContext(SessionContext);
  const { socket, sessionId } = sessionCtx || {};
  const { duplicateDocument, deleteDocument } = usePopupMenu(socket);

  const handleRename = useCallback(() => {
    onEditTitle();
    onClose();
  }, [onEditTitle, onClose]);

  const handleEdit = useCallback(() => {
    if (sessionId) router.push(`/session/${sessionId}/document/${documentId}`);
  }, [router, sessionId, documentId]);

  const handleDuplicate = useCallback(() => {
    duplicateDocument(documentId);
    onClose();
  }, [duplicateDocument, documentId, onClose]);

  const handleDelete = useCallback(() => deleteDocument(documentId), [deleteDocument, documentId]);

  const handleExport = useCallback(() => {
    const delta = convertRichContentToDelta(richContent, QuillType);

    exportToPDF(documentTitle, delta, setSnackbar);
  }, [richContent, documentTitle, setSnackbar]);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.popup-menu')) onClose();
    };

    window.addEventListener('mousedown', outside);

    return () => window.removeEventListener('mousedown', outside);
  }, [onClose]);

  return (
    <div className='popup-menu absolute bottom-[60px] right-0 bg-white shadow-md rounded-md p-2 w-40 z-10'>
      <ul className='space-y-2'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <li onClick={handleRename} className='cursor-pointer hover:text-blue-500 transition'>
            Rename
          </li>
          <li onClick={handleEdit} className='cursor-pointer hover:text-blue-500 transition'>
            Edit
          </li>
          <li onClick={handleDuplicate} className='cursor-pointer hover:text-blue-500 transition'>
            Duplicate
          </li>
          <li onClick={handleDelete} className='cursor-pointer hover:text-blue-500 transition'>
            Delete
          </li>
        </RequirePermission>

        <li onClick={handleExport} className='cursor-pointer hover:text-blue-500 transition'>
          Export as PDF
        </li>
      </ul>
    </div>
  );
};

export default PopupMenu;
