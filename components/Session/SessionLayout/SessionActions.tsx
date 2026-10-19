'use client';

import { useRef, useState } from 'react';

import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';

import { PermissionEnum } from '@/models/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import RequirePermission from '@/components/common/RequirePermission';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useSessionHeaderSocket } from '@/hooks/sockets/useSessionHeaderSocket';
import { cn } from '@/lib/utils';

interface SessionActionsProps {
  session: ReturnType<typeof useSessionHeaderSocket>;
  sessionId: number;
  isDocumentPage: boolean;
}

export default function SessionActions({ session, sessionId, isDocumentPage }: SessionActionsProps) {
  const { sessionName, emitChangeSessionName, emitDeleteSession } = session;
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const hasCommitted = useRef(false);

  const handleSaveName = () => {
    if (hasCommitted.current) return;

    hasCommitted.current = true;

    if (tempName.trim() && tempName.trim() !== sessionName) emitChangeSessionName(tempName);

    setIsEditing(false);
  };

  return (
    <section
      aria-label='Session actions'
      className={cn('mx-auto px-10 pb-4 pt-[104px]', isDocumentPage ? 'max-w-[1440px]' : 'max-w-[1380px]')}
    >
      <p className='mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
        Your shared workspace
      </p>
      <div className='flex items-center justify-between gap-6'>
        <div className='flex min-w-0 items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            asChild
            className='h-9 w-9 shrink-0 bg-white text-muted-foreground shadow-none'
          >
            <Link
              href={isDocumentPage ? `/session/${sessionId}` : '/dashboard'}
              aria-label={isDocumentPage ? 'Back to session' : 'Back to dashboard'}
              title={isDocumentPage ? 'Back to session' : 'Back to dashboard'}
            >
              <FiArrowLeft aria-hidden='true' />
            </Link>
          </Button>
          {isEditing ? (
            <Input
              value={tempName}
              aria-label='Session name'
              onChange={(event) => setTempName(event.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;

                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSaveName();
                }

                if (event.key === 'Escape') {
                  hasCommitted.current = true;
                  setIsEditing(false);
                }
              }}
              autoFocus
              className='h-9 w-[320px] bg-white text-base font-semibold'
            />
          ) : sessionName ? (
            <h2 title={sessionName} className='max-w-[420px] truncate text-2xl font-semibold tracking-tight'>
              {sessionName}
            </h2>
          ) : (
            <Skeleton className='h-6 w-56' />
          )}
          <RequirePermission permission={PermissionEnum.ADMIN}>
            <div className='ml-3 flex shrink-0 items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Rename session'
                title='Rename session'
                onClick={() => {
                  hasCommitted.current = false;
                  setTempName(sessionName);
                  setIsEditing(true);
                }}
                className='h-11 w-11 text-muted-foreground [&_svg]:size-5'
              >
                <FiEdit2 size={15} aria-hidden='true' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Delete session'
                title='Delete session'
                onClick={() => setDeleteModalOpen(true)}
                className='h-11 w-11 text-muted-foreground hover:bg-red-50 hover:text-destructive [&_svg]:size-5'
              >
                <FiTrash2 size={15} aria-hidden='true' />
              </Button>
            </div>
          </RequirePermission>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSubmit={() => {
          emitDeleteSession();
          setDeleteModalOpen(false);
        }}
        onCancel={() => setDeleteModalOpen(false)}
        description='This session and its documents will be permanently deleted. Everyone in the session will lose access. This cannot be undone.'
        submitText='Delete session'
      />
    </section>
  );
}
