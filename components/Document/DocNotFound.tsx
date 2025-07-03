'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

interface DocNotFoundProps {
  id: number | undefined;
}

const DocNotFound: React.FC<DocNotFoundProps> = ({ id }) => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-center h-[80vh] bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-mainDark mb-4'>Document not found</h1>
        <p className='text-gray-500 mb-6'>The document you are trying to access does not exist or has been deleted.</p>
        <button
          onClick={() => router.replace('/session/' + id)}
          className='bg-mainDark text-white px-6 py-3 rounded hover:bg-mainDarkHover'
        >
          Return to Session
        </button>
      </div>
    </div>
  );
};

export default DocNotFound;
