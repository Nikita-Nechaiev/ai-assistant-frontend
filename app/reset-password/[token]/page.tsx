'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import SubmitButton from '@/ui/SubmitButton';
import { SnackbarStatusEnum } from '@/models/enums';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();
  const password = watch('password');

  useEffect(() => {
    params.then((resolvedParams) => setToken(resolvedParams.token));
  }, [params]);

  const formOptions = useMemo(
    () => ({
      password: {
        required: 'Password is required',
        pattern: {
          value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
          message: 'Password must be at least 8 characters, include one uppercase letter and one number',
        },
      },
      confirmPassword: {
        required: 'Confirm password is required',
        validate: (value: string) => value === password || 'Passwords do not match',
      },
    }),
    [password],
  );

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = useCallback(
    async (data) => {
      if (!token) {
        setSnackbar('Invalid token.', SnackbarStatusEnum.ERROR);

        return;
      }

      setIsLoading(true);

      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`, {
          password: data.password,
        });

        setSnackbar('Password reset successfully!', SnackbarStatusEnum.SUCCESS);
        router.replace('/login');
      } catch (error) {
        const errorMessage = axios.isAxiosError(error) ? 'Failed to reset password' : 'An unexpected error occurred';

        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [token, setSnackbar, router],
  );

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            id='password'
            label='New Password'
            type='password'
            placeholder='Enter your new password'
            error={errors.password}
            {...register('password', formOptions.password)}
            marginBottom={20}
          />

          <InputField
            id='confirmPassword'
            label='Confirm Password'
            type='password'
            placeholder='Re-enter your password'
            error={errors.confirmPassword}
            {...register('confirmPassword', formOptions.confirmPassword)}
            marginBottom={20}
          />

          <SubmitButton isLoading={isLoading} label='Reset Password' />
        </form>
      </div>
    </div>
  );
}
