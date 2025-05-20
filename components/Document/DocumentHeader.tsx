'use client';
import React, { useState } from 'react';

import { MdEdit } from 'react-icons/md';
import { DeltaStatic } from 'react-quill-new';

import { PermissionEnum } from '@/models/enums';
import ExportButton from '@/components/Document/ExportButton';
import RequirePermission from '@/helpers/RequirePermission';
import TruncatedText from '@/ui/TruncateText';

interface DocumentHeaderProps {
  documentTitle: string;
  onTitleSave: (newTitle: string) => void;
  onOpenAiModal: () => void;
  onOpenVersionDrawer: () => void;
  quillDelta: DeltaStatic | null;
}

export default function DocumentHeader({
  documentTitle,
  onTitleSave,
  onOpenAiModal,
  onOpenVersionDrawer,
  quillDelta,
}: DocumentHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);

  const handleSave = () => {
    if (tempTitle.trim()) {
      onTitleSave(tempTitle);
    }

    setIsEditing(false);
  };

  return (
    <div className='max-w-[90vw] w-full flex justify-between items-center p-4 bg-mainLight mb-2'>
      <div className='flex items-center space-x-5'>
        {isEditing ? (
          <input
            type='text'
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className='bg-mainDark text-mainLight px-2 py-1 rounded focus:outline-none'
          />
        ) : (
          <h1 className='text-xl flex items-center'>
            <TruncatedText text={documentTitle} maxLength={55} className='text-mainDark font-semibold' />
          </h1>
        )}
        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={() => {
              setIsEditing(true);
              setTempTitle(documentTitle);
            }}
            className='text-mainDark hover:text-mainDarkHover transition'
          >
            <MdEdit size={25} />
          </button>
        </RequirePermission>
      </div>
      <div className='flex items-center space-x-4'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <button onClick={onOpenAiModal} className='bg-mainDark text-white h-10 px-4 py-2 rounded'>
            AI Assistance
          </button>
          <button onClick={onOpenVersionDrawer} className='bg-mainDark text-white h-10 px-4 py-2 rounded'>
            Show Versions
          </button>
        </RequirePermission>
        <ExportButton documentTitle={documentTitle} quillDelta={quillDelta} />
      </div>
    </div>
  );
}
