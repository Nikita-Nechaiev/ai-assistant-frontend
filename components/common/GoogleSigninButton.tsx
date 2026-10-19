import React from 'react';

import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';

interface GoogleSigninButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const GoogleSigninButton: React.FC<GoogleSigninButtonProps> = ({ onClick, disabled }) => (
  <Button
    type='button'
    variant='outline'
    disabled={disabled}
    onClick={onClick}
    className='h-11 w-full gap-2.5 text-sm shadow-none'
  >
    <FcGoogle aria-hidden='true' />
    Continue with Google
  </Button>
);

export default GoogleSigninButton;
