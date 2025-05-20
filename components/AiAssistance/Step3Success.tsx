'use client';
import React from 'react';

import { FiCopy } from 'react-icons/fi';

interface Step3SuccessProps {
  result: string | undefined;
  onCopyResult: () => void;
  onRestart: () => void;
}

const Step3Success: React.FC<Step3SuccessProps> = ({ result, onCopyResult, onRestart }) => {
  const isBigResult = result && result?.length > 1300;

  return (
    <div className='max-w-[800px] mx-auto'>
      {/* Title */}
      <h2 className='text-2xl font-bold text-mainDark mb-6'>AI Usage Result</h2>

      <div
        className={`border border-mainDark text-mainDark p-4 pb-9 mb-4 rounded relative ${isBigResult && 'max-h-[50vh] overflow-y-scroll'}`}
      >
        <div className='flex text-gray-600 justify-between items-center mb-3'>
          <span className=' text-sm '>text</span>
          <button
            onClick={onCopyResult}
            disabled={!result}
            className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
              result ? 'text-mainDark hover:text-mainDarkHover' : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiCopy size={18} />
            <span className='text-sm'>Copy</span>
          </button>
        </div>

        {/* Result Text */}
        <p>{result ? result : 'No result available.'}</p>
      </div>

      <button
        onClick={onRestart}
        className='bg-mainDark hover:bg-mainDarkHover text-mainLight px-8 py-3 rounded transition-colors'
      >
        Go back to beginning
      </button>
    </div>
  );
};

export default Step3Success;
