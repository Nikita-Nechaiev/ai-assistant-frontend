'use client';
import React, { useRef, useState } from 'react';

import { FiClock, FiEdit2, FiFileText, FiZap } from 'react-icons/fi';
import { DeltaStatic } from 'react-quill-new';

import { PermissionEnum } from '@/models/enums';
import ExportButton from '@/components/Document/ExportButton';
import RequirePermission from '@/components/common/RequirePermission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentHeaderProps {
  documentTitle: string;
  onTitleSave: (newTitle: string) => void;
  onOpenAiModal: () => void;
  onOpenVersionDrawer: () => void;
  quillDelta: DeltaStatic | null;
  lastUpdated?: Date;
  versionCount?: number;
}

export default function DocumentHeader({
  documentTitle,
  onTitleSave,
  onOpenAiModal,
  onOpenVersionDrawer,
  quillDelta,
  lastUpdated,
  versionCount = 0,
}: DocumentHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const isCommitting = useRef(false);
  const updatedDate = lastUpdated ? new Date(lastUpdated) : null;
  const updatedLabel =
    updatedDate && !Number.isNaN(updatedDate.getTime())
      ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
          updatedDate,
        )
      : null;

  const handleSave = () => {
    if (isCommitting.current) return;

    isCommitting.current = true;

    if (tempTitle.trim() && tempTitle.trim() !== documentTitle) onTitleSave(tempTitle.trim());

    setIsEditing(false);
  };

  return (
    <header className='flex flex-wrap items-center justify-between gap-6'>
      <div className='flex min-w-0 flex-1 items-center gap-4'>
        <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-primary shadow-card'>
          <FiFileText size={23} aria-hidden='true' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='mb-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
            Document workspace
          </p>
          <div className='flex min-h-9 items-center gap-2'>
            {isEditing ? (
              <Input
                type='text'
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSave}
                aria-label='Document title'
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;

                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSave();
                  }

                  if (event.key === 'Escape') {
                    isCommitting.current = true;
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className='h-9 max-w-[520px] bg-white text-xl font-semibold'
              />
            ) : (
              <h1 title={documentTitle} className='truncate text-[30px] font-semibold tracking-[-0.7px]'>
                {documentTitle}
              </h1>
            )}
            <RequirePermission permission={PermissionEnum.EDIT}>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Rename document'
                onClick={() => {
                  setIsEditing(true);
                  setTempTitle(documentTitle);
                  isCommitting.current = false;
                }}
                className='h-8 w-8 shrink-0 text-muted-foreground'
              >
                <FiEdit2 size={14} aria-hidden='true' />
              </Button>
            </RequirePermission>
          </div>
          {updatedLabel && <p className='mt-1.5 text-sm text-muted-foreground'>Updated {updatedLabel}</p>}
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2.5'>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <Button variant='outline' onClick={onOpenVersionDrawer} className='h-10 gap-2 text-sm shadow-none'>
            <FiClock size={15} aria-hidden='true' />
            Version history
            <span className='ml-1 rounded bg-secondary px-1.5 py-0.5 text-[13px] text-muted-foreground'>
              {versionCount}
            </span>
          </Button>
        </RequirePermission>
        <ExportButton documentTitle={documentTitle} quillDelta={quillDelta} />
        <RequirePermission permission={PermissionEnum.EDIT}>
          <Button onClick={onOpenAiModal} className='h-10 gap-2 text-sm shadow-blue'>
            <FiZap size={15} aria-hidden='true' />
            AI Assistance
          </Button>
        </RequirePermission>
      </div>
    </header>
  );
}
