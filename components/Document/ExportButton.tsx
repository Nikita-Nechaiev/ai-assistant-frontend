'use client';

import React from 'react';

import { DeltaStatic } from 'react-quill-new';
import { FiDownload } from 'react-icons/fi';

import { exportToPDF } from '@/helpers/exportToPdf';
import useSnackbarStore from '@/store/useSnackbarStore';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  documentTitle: string;
  quillDelta: DeltaStatic | null;
}

const ExportButton: React.FC<ExportButtonProps> = ({ documentTitle, quillDelta }) => {
  const { setSnackbar } = useSnackbarStore();

  return (
    <Button
      variant='outline'
      onClick={() => exportToPDF(documentTitle, quillDelta, setSnackbar)}
      className='h-10 gap-2 text-sm shadow-none'
    >
      <FiDownload size={15} aria-hidden='true' />
      Export to PDF
    </Button>
  );
};

export default ExportButton;
