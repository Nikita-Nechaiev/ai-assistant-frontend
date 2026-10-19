'use client';

import { FiLayers } from 'react-icons/fi';

const LargeLoader = () => (
  <div
    className='saas-shell flex min-h-dvh w-full items-center justify-center bg-muted text-foreground'
    role='status'
    aria-live='polite'
  >
    <div className='flex flex-col items-center px-8 py-12'>
      <span className='relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-primary shadow-card'>
        <FiLayers size={26} aria-hidden='true' />
        <span
          className='absolute -inset-2 rounded-[22px] border-2 border-transparent border-t-primary/60 animate-spin motion-reduce:animate-none'
          aria-hidden='true'
        />
      </span>
      <p className='text-base font-semibold tracking-tight'>Preparing your workspace</p>
      <p className='mt-2 text-sm text-muted-foreground'>Just a moment. Your ideas are on their way.</p>
    </div>
  </div>
);

export default LargeLoader;
