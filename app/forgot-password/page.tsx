'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import SubmitButton from '@/ui/SubmitButton';
import { SnackbarStatusEnum } from '@/models/enums';

interface ForgotPasswordFormInputs {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const { setSnackbar } = useSnackbarStore();

  const formOptions = useMemo(
    () => ({
      email: { required: 'Email is required' },
    }),
    [],
  );

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
          data,
        );
        setSnackbar(
          'Password reset link sent to your email.',
          SnackbarStatusEnum.SUCCESS,
        );
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message ||
            'Failed to send password reset link'
          : 'An unexpected error occurred';
        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [setSnackbar],
  );

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            marginBottom={20}
            id='email'
            label='Email'
            type='email'
            placeholder='Enter your email'
            error={errors.email}
            {...register('email', formOptions.email)}
          />
          <SubmitButton isLoading={isLoading} label='Send Reset Link' />
        </form>
      </div>
    </div>
  );
}
