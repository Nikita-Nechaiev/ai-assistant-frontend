'use client';
import React from 'react';

import Link from 'next/link';

interface AppLogoProps {
  isLink?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ isLink = true }) => {
  const content = (
    <div className='flex items-center space-x-3 px-4 py-4'>
      <img src='/company_logo.png' alt='AI Powered Editor' className='h-10 w-10' />
      <h1 className='text-xl font-bold'>AI Powered Editor</h1>
    </div>
  );

  return isLink ? <Link href='/dashboard'>{content}</Link> : content;
};

export default AppLogo;
