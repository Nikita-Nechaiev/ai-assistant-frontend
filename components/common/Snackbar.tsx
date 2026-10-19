'use client';

import React, { useEffect } from 'react';

import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

const presentation = {
  [SnackbarStatusEnum.SUCCESS]: {
    icon: FiCheckCircle,
    title: 'Success',
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  },
  [SnackbarStatusEnum.WARNING]: {
    icon: FiAlertTriangle,
    title: 'Please note',
    tone: 'border-amber-100 bg-amber-50 text-amber-600',
  },
  [SnackbarStatusEnum.ERROR]: {
    icon: FiAlertCircle,
    title: 'Something went wrong',
    tone: 'border-red-100 bg-red-50 text-destructive',
  },
};

const Snackbar: React.FC = () => {
  const { message, status, closeSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(closeSnackbar, 4000);

    return () => clearTimeout(timer);
  }, [message, closeSnackbar]);

  if (!message || !status) return null;

  const { icon: Icon, title, tone } = presentation[status];

  return (
    <div
      data-testid='snackbar-root'
      role={status === SnackbarStatusEnum.ERROR ? 'alert' : 'status'}
      aria-atomic='true'
      className='saas-shell fixed bottom-6 left-6 z-[1100] flex w-[390px] max-w-[calc(100vw-3rem)] items-center gap-3.5 rounded-xl border border-border bg-white p-4 text-foreground shadow-[0_8px_30px_rgba(20,42,75,0.12)]'
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
        <Icon size={18} aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold'>{title}</p>
        <p className='mt-1.5 break-words text-sm leading-5 text-muted-foreground'>{message}</p>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={closeSnackbar}
        aria-label='Dismiss notification'
        className='-mr-1 h-7 w-7 shrink-0 text-muted-foreground'
      >
        <FiX aria-hidden='true' />
      </Button>
    </div>
  );
};

export default Snackbar;
