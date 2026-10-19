'use client';

import React, { useRef } from 'react';

import { FiLoader } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  pendingText?: string;
  submitDisabled?: boolean;
  destructive?: boolean;
  className?: string;
}

const WorkspaceModal = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  title,
  description,
  icon,
  children,
  submitText = 'Save changes',
  cancelText = 'Cancel',
  isSubmitting = false,
  pendingText = 'Saving…',
  submitDisabled = false,
  destructive = false,
  className,
}: WorkspaceModalProps) => {
  const previousFocus = useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn('gap-0 p-0', className)}
        onOpenAutoFocus={() => {
          previousFocus.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(event) => {
          if (previousFocus.current?.isConnected) {
            event.preventDefault();
            previousFocus.current.focus();
          }
        }}
      >
        <DialogHeader className='flex-row items-center gap-3 space-y-0 border-b border-border px-6 py-5 pr-12 text-left'>
          {icon && (
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                destructive ? 'bg-red-50 text-destructive' : 'bg-accent text-primary',
              )}
            >
              {icon}
            </span>
          )}
          <div className='min-w-0 flex-1 space-y-1'>
            <DialogTitle className='text-xl leading-6'>{title}</DialogTitle>
            <DialogDescription className={cn('text-sm leading-5', !description && 'sr-only')}>
              {description || title}
            </DialogDescription>
          </div>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!isSubmitting && !submitDisabled) onSubmit?.();
          }}
        >
          <div className='px-6 py-5'>{children}</div>
          {(onSubmit || onCancel) && (
            <DialogFooter className='border-t border-border bg-muted/50 px-6 py-4'>
              <Button type='button' variant='outline' onClick={onCancel || onClose}>
                {cancelText}
              </Button>
              {onSubmit && (
                <Button
                  type='submit'
                  variant={destructive ? 'destructive' : 'default'}
                  disabled={isSubmitting || submitDisabled}
                >
                  {isSubmitting && <FiLoader className='animate-spin' aria-hidden='true' />}
                  {isSubmitting ? pendingText : submitText}
                </Button>
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceModal;
