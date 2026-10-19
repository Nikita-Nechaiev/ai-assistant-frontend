'use client';
import React from 'react';

import Link from 'next/link';
import { FiLayers } from 'react-icons/fi';

interface AppLogoProps {
  isLink?: boolean;
  variant?: 'default' | 'workspace';
}

const AppLogo: React.FC<AppLogoProps> = ({ isLink = true, variant = 'default' }) => {
  const content =
    variant === 'workspace' ? (
      <div className='flex items-center gap-3'>
        <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-blue'>
          <FiLayers size={22} aria-hidden='true' />
        </span>
        <span className='text-[21px] font-semibold tracking-[-0.7px] text-foreground'>
          AI Editor<span className='text-primary'>.</span>
        </span>
      </div>
    ) : (
      <div className='flex items-center space-x-3 px-4 py-4'>
        <img src='/company_logo.png' alt='AI Powered Editor' className='h-10 w-10' />
        <h1 className='text-xl font-bold'>AI Powered Editor</h1>
      </div>
    );

  return isLink ? <Link href='/dashboard'>{content}</Link> : content;
};

export default AppLogo;
