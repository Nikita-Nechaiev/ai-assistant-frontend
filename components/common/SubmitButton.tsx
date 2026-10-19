import React from 'react';

import { FiArrowRight, FiLoader } from 'react-icons/fi';

import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isLoading: boolean;
  label: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, label }) => (
  <Button type='submit' disabled={isLoading} aria-busy={isLoading} className='h-11 w-full gap-2 text-sm shadow-blue'>
    {isLoading && <FiLoader className='animate-spin motion-reduce:animate-none' aria-hidden='true' />}
    {isLoading ? 'Please wait…' : label}
    {!isLoading && <FiArrowRight aria-hidden='true' />}
  </Button>
);

export default SubmitButton;
