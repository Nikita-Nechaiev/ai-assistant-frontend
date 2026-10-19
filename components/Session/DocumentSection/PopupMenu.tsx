'use client';

import React, { useContext, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import { FiEdit2, FiExternalLink, FiCopy, FiTrash2, FiDownload } from 'react-icons/fi';
import { Quill as QuillType } from 'react-quill-new';

import { exportToPDF } from '@/helpers/exportToPdf';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/components/common/RequirePermission';
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

  const handleDelete = useCallback(() => {
    deleteDocument(documentId);
    onClose();
  }, [deleteDocument, documentId, onClose]);

  const handleExport = useCallback(() => {
    const delta = convertRichContentToDelta(richContent, QuillType);

    exportToPDF(documentTitle, delta, setSnackbar);
  }, [richContent, documentTitle, setSnackbar]);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.popup-menu')) onClose();
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', outside);
    window.addEventListener('keydown', escape);

    return () => {
      window.removeEventListener('mousedown', outside);
      window.removeEventListener('keydown', escape);
    };
  }, [onClose]);

  return (
    <div
      role='menu'
      aria-label='Document actions'
      className='popup-menu absolute bottom-[66px] right-3 z-20 w-44 rounded-xl border border-border bg-white p-1.5 shadow-lg'
    >
      <RequirePermission permission={PermissionEnum.EDIT}>
        <button
          type='button'
          role='menuitem'
          onClick={handleRename}
          className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
        >
          <FiEdit2 size={14} aria-hidden='true' />
          Rename
        </button>
        <button
          type='button'
          role='menuitem'
          onClick={handleEdit}
          className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
        >
          <FiExternalLink size={14} aria-hidden='true' />
          Open document
        </button>
        <button
          type='button'
          role='menuitem'
          onClick={handleDuplicate}
          className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
        >
          <FiCopy size={14} aria-hidden='true' />
          Duplicate
        </button>
      </RequirePermission>
      <button
        type='button'
        role='menuitem'
        onClick={handleExport}
        className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
      >
        <FiDownload size={14} aria-hidden='true' />
        Export as PDF
      </button>
      <RequirePermission permission={PermissionEnum.EDIT}>
        <div className='my-1 border-t border-border' />
        <button
          type='button'
          role='menuitem'
          onClick={handleDelete}
          className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none'
        >
          <FiTrash2 size={14} aria-hidden='true' />
          Delete document
        </button>
      </RequirePermission>
    </div>
  );
};

export default PopupMenu;
