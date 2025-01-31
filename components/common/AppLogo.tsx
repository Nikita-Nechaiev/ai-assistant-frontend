import Link from 'next/link';
import React from 'react';

const AppLogo = () => {
  return (
    <Link href='/dashboard' className='flex items-center space-x-3 px-4 py-4'>
      <img
        src='/company_logo.png'
        alt='AI Powered Editor'
        className='h-10 w-10'
      />
      <h1 className='text-xl font-bold'>AI Powered Editor</h1>
    </Link>
  );
};

export default AppLogo;
