'use client';
import React, { useEffect } from 'react';
import useSnackbarStore from '@/store/useSnackbarStore';
import { RxCross1 } from 'react-icons/rx';
import { FiCheckCircle } from 'react-icons/fi';
import { IoWarningOutline } from 'react-icons/io5';
import { PiWarningOctagon } from 'react-icons/pi';
import { SnackbarStatusEnum } from '@/models/enums';

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
    [SnackbarStatusEnum.WARNING]: 'bg-amber-500',
    [SnackbarStatusEnum.ERROR]: 'bg-red-500',
  };

  const iconMap: Record<SnackbarStatusEnum, React.ReactNode> = {
    [SnackbarStatusEnum.SUCCESS]: <FiCheckCircle size={24} />,
    [SnackbarStatusEnum.WARNING]: <IoWarningOutline size={24} />,
    [SnackbarStatusEnum.ERROR]: <PiWarningOctagon size={24} />,
  };

  return (
    <div
      className={`
        absolute bottom-[40px] left-[20px]
        min-w-[300px] max-w-[500px] h-[60px]
        flex justify-between items-center
        font-semibold px-4 py-3
        rounded shadow-md
        ${backgroundColorMap[status]}
        text-white
      `}
      style={{zIndex: 1010}}
    >
      <div className='flex justify-between items-center gap-[10px]'>
        <div>{iconMap[status]}</div>
        <div>{message}</div>
      </div>

      <button
        onClick={closeSnackbar}
        className='
          ml-4 text-xl leading-none focus:outline-none
          flex justify-center items-center
          w-[30px] h-[30px] rounded-full
          bg-inherit hover:bg-[#0000003b]
          transition-colors duration-300
        '
      >
        <RxCross1 />
      </button>
    </div>
  );
};

export default Snackbar;
