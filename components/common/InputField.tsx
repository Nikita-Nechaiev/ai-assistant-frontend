import React from 'react';

import { FieldError } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: FieldError | string;
  marginBottom?: string | number;
  ref?: React.Ref<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, error, ref, marginBottom = 0, className, ...props }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className='grow' style={{ marginBottom }}>
      <label htmlFor={id} className='mb-2 block text-sm font-medium text-foreground'>
        {label}
      </label>
      <Input
        ref={ref}
        id={id}
        {...props}
        aria-invalid={!!error}
        aria-describedby={errorMessage ? `${id}-error` : props['aria-describedby']}
        className={cn(
          'h-11 bg-white text-base',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
      />
      {errorMessage && (
        <p id={`${id}-error`} role='alert' className='mt-2 text-sm leading-5 text-destructive'>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputField;
