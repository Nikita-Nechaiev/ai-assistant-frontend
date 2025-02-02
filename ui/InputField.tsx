import React from 'react';
import { FieldError } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: FieldError | string;
  marginBottom?: string | number; // Accepts either `px` values or numbers
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  error,
  marginBottom = 0, // Default to no margin-bottom if not provided
  ...props
}) => {
  return (
    <div className='grow' style={{ marginBottom }}>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`p-2 outline-none mt-[1px] block w-full rounded-md bg-gray-100
          border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500
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
