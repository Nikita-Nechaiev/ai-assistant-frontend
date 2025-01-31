'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';

import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import SubmitButton from '@/ui/SubmitButton';
import GoogleSigninButton from '@/ui/GoogleSigninButton';
import { SnackbarStatusEnum } from '@/models/enums';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      setIsLoading(true);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      setSnackbar('Successfully logged in!', SnackbarStatusEnum.SUCCESS);
      router.replace('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError) {
        setSnackbar('Invalid email or password!', SnackbarStatusEnum.ERROR);
        console.log('Login error:', error.response?.data || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            id='email'
            label='Email'
            type='email'
            placeholder='Enter your email'
            error={errors.email}
            {...register('email', { required: 'Email is required' })}
          />

          <InputField
            id='password'
            label='Password'
            type='password'
            placeholder='Enter your password'
            error={errors.password}
            {...register('password', { required: 'Password is required' })}
          />

          <div className='text-right mb-6'>
            <Link
              href='/forgot-password'
              className='text-sm text-blue-500 hover:underline'
            >
              Forgot Password?
            </Link>
          </div>

          <SubmitButton isLoading={isLoading} label='Log In' />
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link
              href='/registration'
              className='text-blue-500 hover:underline'
            >
              Register here
            </Link>
          </p>
        </div>

        <div className='flex items-center my-6'>
          <div className='flex-grow border-t border-gray-300'></div>
          <span className='mx-4 text-gray-500 font-medium'>OR</span>
          <div className='flex-grow border-t border-gray-300'></div>
        </div>

        <GoogleSigninButton onClick={handleGoogleSignIn} />
      </div>
    </div>
  );
}
