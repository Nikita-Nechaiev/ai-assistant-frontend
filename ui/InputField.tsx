import React from 'react';

import { FieldError } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: FieldError | string;
  marginBottom?: string | number;
  ref?: React.Ref<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, error, ref, marginBottom = 0, ...props }) => {
  return (
    <div className='grow' style={{ marginBottom }}>
      <label htmlFor={id} className='block text-sm font-medium text-mainDark'>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        {...props}
        className={`p-2 outline-none mt-[1px] block w-full rounded-md bg-gray-100
          border-gray-300 shadow-sm focus:ring-mainDark focus:border-mainDark
          ${error ? 'border-red-500' : ''}`}
      />
      {error && typeof error === 'object' && 'message' in error ? (
        <p className='text-red-500 text-sm mt-1'>{error.message as string}</p>
      ) : typeof error === 'string' ? (
        <p className='text-red-500 text-sm mt-1'>{error}</p>
      ) : null}
    </div>
  );
};

export default InputField;
