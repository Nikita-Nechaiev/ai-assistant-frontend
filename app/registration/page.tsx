'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import FileButton from '@/ui/FileButton';
import SubmitButton from '@/ui/SubmitButton';
import GoogleSigninButton from '@/ui/GoogleSigninButton';
import { SnackbarStatusEnum } from '@/models/enums';
import { IUser } from '@/models/models';
import { useUserStore } from '@/store/useUserStore';

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: FileList;
}

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormInputs>();
  const { setSnackbar } = useSnackbarStore();
  const { setUser } = useUserStore();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const password = watch('password');

  const formOptions = useMemo(
    () => ({
      name: { required: 'Name is required' },
      email: {
        required: 'Email is required',
        pattern: {
          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          message: 'Invalid email format',
        },
      },
      password: {
        required: 'Password is required',
        pattern: {
          value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
          message:
            'Password must be at least 8 characters, include one uppercase letter and one number',
        },
      },
      confirmPassword: {
        required: 'Confirm password is required',
        validate: (value: string) =>
          value === password || 'Passwords do not match',
      },
    }),
    [password],
  );

  const onSubmit: SubmitHandler<RegisterFormInputs> = useCallback(
    async (data) => {
      setLoading(true);
      const { name, email, password, avatar } = data;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar?.[0]) formData.append('avatar', avatar[0]);

      try {
        const { data: responseData } = await axios.post<{
          accessToken: string;
          user: IUser;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setUser(responseData.user);
        setSnackbar('Registration successful!', SnackbarStatusEnum.SUCCESS);
        router.push('/dashboard');
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.status === 409
            ? 'User with this email already exists!'
            : 'Registration error';
        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setSnackbar, router],
  );

  const handleGoogleSignIn = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }, []);

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>Register</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            id='name'
            label='Name'
            placeholder='Enter your name'
            error={errors.name}
            {...register('name', formOptions.name)}
            marginBottom={20}
          />

          <InputField
            id='email'
            type='email'
            label='Email'
            placeholder='Enter your email'
            error={errors.email}
            {...register('email', formOptions.email)}
            marginBottom={20}
          />

          <InputField
            id='password'
            type='password'
            label='Password'
            placeholder='Enter your password'
            error={errors.password}
            {...register('password', formOptions.password)}
            marginBottom={20}
          />

          <InputField
            id='confirmPassword'
            type='password'
            label='Confirm Password'
            placeholder='Re-enter your password'
            error={errors.confirmPassword}
            {...register('confirmPassword', formOptions.confirmPassword)}
            marginBottom={20}
          />

          <div className='mb-6'>
            <label
              htmlFor='avatar'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Avatar (optional)
            </label>
            <FileButton
              id='avatar'
              label='Choose File'
              onChange={(e) =>
                setValue('avatar', e.target.files as FileList, {
                  shouldValidate: true,
                })
              }
            />
          </div>

          <SubmitButton isLoading={isLoading} label='Register' />
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='text-mainDark hover:underline'>
              Login here
            </Link>
          </p>
          <div className='flex items-center my-6'>
            <div className='flex-grow border-t border-gray-300'></div>
            <span className='mx-4 text-gray-500 font-medium'>OR</span>
            <div className='flex-grow border-t border-gray-300'></div>
          </div>
          <GoogleSigninButton onClick={handleGoogleSignIn} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
