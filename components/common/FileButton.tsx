import React, { useEffect, useRef, useState } from 'react';

import { FiUpload, FiUser } from 'react-icons/fi';

import { Button } from '@/components/ui/button';

interface FileButtonProps {
  id: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileButton: React.FC<FileButtonProps> = ({ id, label, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setPreview(file?.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setFileName(file?.name ?? '');
    onChange(event);
  };

  return (
    <div className='flex items-center gap-4 rounded-xl border border-border bg-muted/50 p-3.5'>
      <span className='flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-accent text-primary'>
        {preview ? (
          <img src={preview} alt='Selected profile photo' className='h-full w-full object-cover' />
        ) : (
          <FiUser size={21} aria-hidden='true' />
        )}
      </span>
      <div className='min-w-0'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 text-sm shadow-none'
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload aria-hidden='true' />
          {label}
        </Button>
        <p className='mt-1.5 truncate text-[13px] text-muted-foreground' title={fileName || undefined}>
          {fileName || 'Add a photo for your collaborators.'}
        </p>
      </div>
      <input
        ref={inputRef}
        type='file'
        id={id}
        aria-label='Upload profile photo'
        className='hidden'
        onChange={handleFileChange}
        accept='image/*'
      />
    </div>
  );
};

export default FileButton;
