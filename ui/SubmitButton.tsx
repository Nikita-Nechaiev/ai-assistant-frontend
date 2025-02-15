import React from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
  label: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, label }) => {
  return (
    <button
      type='submit'
      className='w-full py-2 px-4 bg-mainDark text-white font-semibold 
        rounded-md shadow-sm hover:bg-mainDarkHover focus:outline-none 
        focus:ring-2 focus:ring-mainDark focus:ring-offset-2'
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
};

export default SubmitButton;
