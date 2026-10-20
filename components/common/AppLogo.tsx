'use client';
import React from 'react';

import Link from 'next/link';

interface AppLogoProps {
  isLink?: boolean;
  variant?: 'default' | 'workspace';
}

const AppLogo: React.FC<AppLogoProps> = ({ isLink = true, variant = 'default' }) => {
  const content = (
    <div className={variant === 'workspace' ? 'flex items-center gap-3' : 'flex items-center gap-3 px-4 py-4'}>
      <img src='/logo.svg' alt='' width={40} height={40} className='h-10 w-10 rounded-xl shadow-blue' />
      <span className='text-[21px] font-semibold tracking-[-0.7px] text-foreground'>
        AI Editor<span className='text-primary'>.</span>
      </span>
    </div>
  );

  return isLink ? <Link href='/dashboard'>{content}</Link> : content;
};

export default AppLogo;
