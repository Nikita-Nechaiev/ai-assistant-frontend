'use client';

import React from 'react';

import { DeltaStatic } from 'react-quill-new';

import { exportToPDF } from '@/helpers/exportToPdf';
import useSnackbarStore from '@/store/useSnackbarStore';

interface ExportButtonProps {
  documentTitle: string;
  quillDelta: DeltaStatic | null;
}

const ExportButton: React.FC<ExportButtonProps> = ({ documentTitle, quillDelta }) => {
  const { setSnackbar } = useSnackbarStore();

  return (
    <button
      onClick={() => exportToPDF(documentTitle, quillDelta, setSnackbar)}
      className='px-4 py-2 border border-mainDark text-mainDark bg-mainLight rounded shadow hover:bg-mainLightGray transition'
    >
      Export to PDF
    </button>
  );
};

export default ExportButton;
