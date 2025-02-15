'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-mainLight text-mainDark'>
      <h1 className='text-6xl font-extrabold text-mainDark drop-shadow-lg'>
        Oops!
      </h1>
      <p className='mt-4 text-xl text-mainGray'>
        Something went wrong. Please try again.
      </p>
      <div className='mt-6 flex gap-4'>
        <button
          onClick={() => reset()}
          className='px-6 py-3 rounded-lg bg-mainDark text-mainLight font-semibold hover:bg-mainDarkHover transition'
        >
          Retry
        </button>
        <a
          href='/dashboard'
          className='px-6 py-3 rounded-lg bg-gray-200 text-mainDark font-semibold hover:bg-gray-300 transition'
        >
          Go Home
        </a>
      </div>
      <div className='absolute bottom-10 text-sm text-mainGray'>
        If the problem persists, please contact support.
      </div>
    </div>
  );
}
