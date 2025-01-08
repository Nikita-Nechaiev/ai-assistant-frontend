'use client'
import React, { useEffect } from 'react';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums/SnackbarStatusEnum';

const Snackbar: React.FC = () => {
  const { message, status, closeSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        closeSnackbar();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [message, closeSnackbar]);

  if (!message || !status) return null;

  const backgroundColorMap: Record<SnackbarStatusEnum, string> = {
    [SnackbarStatusEnum.SUCCESS]: 'bg-green-500',
    [SnackbarStatusEnum.WARNING]: 'bg-yellow-500',
    [SnackbarStatusEnum.ERROR]: 'bg-red-500',
  };

  const textColorMap: Record<SnackbarStatusEnum, string> = {
    [SnackbarStatusEnum.SUCCESS]: 'text-white',
    [SnackbarStatusEnum.WARNING]: 'text-black',
    [SnackbarStatusEnum.ERROR]: 'text-white',
  };

  const containerStyles = `
    fixed bottom-4 left-4
    z-50
    w-auto max-w-sm
    px-4 py-2
    rounded shadow-md
    ${backgroundColorMap[status]}
    ${textColorMap[status]}
    transition-opacity duration-300
  `;

  return (
    <div className={containerStyles}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={closeSnackbar}
          className="ml-4 text-xl leading-none focus:outline-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
