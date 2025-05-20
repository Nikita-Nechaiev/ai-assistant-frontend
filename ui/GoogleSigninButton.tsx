import React from 'react';

import { FcGoogle } from 'react-icons/fc';

interface GoogleSigninButtonProps {
  onClick: () => void;
}

const GoogleSigninButton: React.FC<GoogleSigninButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='gap-2 mt-4 w-full py-3 px-4 flex items-center justify-center 
        border border-gray-300 rounded-md shadow-sm text-base font-medium 
        bg-white text-mainDark hover:bg-gray-100 focus:outline-none 
        focus:ring-2 focus:ring-mainDark focus:ring-offset-2'
    >
      <FcGoogle />
      Continue with Google
    </button>
  );
};

export default GoogleSigninButton;
