'use client';

import { useState } from 'react';

import { FiDownload, FiLoader } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { SnackbarStatusEnum } from '@/models/enums';
import { PublicInfoApi } from '@/services/PublicInfoApi';
import useSnackbarStore from '@/store/useSnackbarStore';

export default function ResumeDownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { setSnackbar } = useSnackbarStore();

  const downloadResume = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const file = await PublicInfoApi.fetchCv();
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'Mykyta-Nechaiev-CV.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setSnackbar('Could not download the resume. Please try again.', SnackbarStatusEnum.ERROR);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={downloadResume}
      disabled={isDownloading}
      aria-busy={isDownloading}
      title='Download resume (PDF)'
      className='h-9 gap-2 rounded-lg text-xs shadow-none'
    >
      {isDownloading ? <FiLoader className='animate-spin' aria-hidden='true' /> : <FiDownload aria-hidden='true' />}
      {isDownloading ? 'Downloading…' : 'Resume'}
    </Button>
  );
}
