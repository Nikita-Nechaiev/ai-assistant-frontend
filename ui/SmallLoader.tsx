'use client';

import React from 'react';

const SmallLoader = () => {
  return (
    <div className='w-full flex justify-center items-center gap-x-2'>
      <div className='w-5 h-5 bg-gray-300 rounded-full animate-bounce animate-pulse'></div>
      <div className='w-5 h-5 bg-gray-600 rounded-full animate-bounce animate-pulse'></div>
      <div className='w-5 h-5 bg-mainDark rounded-full animate-bounce animate-pulse'></div>
    </div>
  );
};

export default SmallLoader;
