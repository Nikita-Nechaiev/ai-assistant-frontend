'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import SubmitButton from '@/ui/SubmitButton';
import { SnackbarStatusEnum } from '@/models/enums';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();
  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();
  const password = watch('password');

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    }
    unwrapParams();
  }, [params]);

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (!token) {
      setSnackbar('Invalid token.', SnackbarStatusEnum.ERROR);
      return;
    }

    try {
      setIsLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`,
        {
          password: data.password,
        },
      );

      setSnackbar('Password reset successfully!', SnackbarStatusEnum.SUCCESS);
      router.replace('/login');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          'Error resetting password:',
          error.response?.data || error.message,
        );
        setSnackbar('Failed to reset password', SnackbarStatusEnum.ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>
          Reset Password
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            marginBottom={20}
            id='password'
            label='New Password'
            type='password'
            placeholder='Enter your new password'
            error={errors.password}
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                message:
                  'Password must have at least 8 characters, one uppercase letter, and one number',
              },
            })}
          />

          <InputField
            marginBottom={20}
            id='confirmPassword'
            label='Confirm Password'
            type='password'
            placeholder='Re-enter your password'
            error={errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: (value) => {
                if (value !== password) {
                  // Clear both fields on mismatch
                  setValue('password', '');
                  setValue('confirmPassword', '');
                  return 'Passwords do not match';
                }
                return true;
              },
            })}
          />

          <SubmitButton isLoading={isLoading} label='Reset Password' />
        </form>
      </div>
    </div>
  );
}
