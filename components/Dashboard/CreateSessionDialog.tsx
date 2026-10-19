'use client';

import React, { useEffect, useState, RefObject } from 'react';

import { FiLayers, FiPlus, FiLoader } from 'react-icons/fi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateSession } from '@/hooks/dashboard/useCreateSession';
import { useUserStore } from '@/store/useUserStore';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const CreateSessionDialog = ({ open, onOpenChange, triggerRef }: CreateSessionDialogProps) => {
  const [name, setName] = useState('');
  const { user } = useUserStore();
  const { mutate, isPending, error, reset } = useCreateSession(() => onOpenChange(false));

  useEffect(() => {
    if (open) {
      setName(user?.name ? `${user.name}'s session` : 'Untitled session');
      reset();
    }
  }, [open, user?.name, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='saas-dialog gap-5 border-border p-6'
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogHeader className='flex-row items-center gap-3 space-y-0 pr-7 text-left'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
            <FiLayers size={22} aria-hidden='true' />
          </span>
          <div className='min-w-0 flex-1 space-y-1'>
            <DialogTitle className='leading-6'>Create a session</DialogTitle>
            <DialogDescription className='text-sm leading-5'>
              A shared space for your documents, ideas, and collaborators.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (name.trim() && !isPending) mutate(name.trim());
          }}
        >
          <label htmlFor='sessionName' className='mb-2 block text-base font-medium'>
            Session name
          </label>
          <Input
            id='sessionName'
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='e.g. Product launch'
            autoComplete='off'
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'create-session-error' : undefined}
          />
          {error && (
            <p id='create-session-error' role='alert' className='mt-3 text-base text-destructive'>
              Could not create your session. Please try again.
            </p>
          )}
          <DialogFooter className='mt-5'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={!name.trim() || isPending}>
              {isPending ? <FiLoader className='animate-spin' aria-hidden='true' /> : <FiPlus aria-hidden='true' />}
              {isPending ? 'Creating…' : 'Create session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionDialog;
