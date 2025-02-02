'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import useSnackbarStore from '@/store/useSnackbarStore';
import InputField from '@/ui/InputField';
import FileButton from '@/ui/FileButton';
import SubmitButton from '@/ui/SubmitButton';
import GoogleSigninButton from '@/ui/GoogleSigninButton';
import { SnackbarStatusEnum } from '@/models/enums';

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
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const password = watch('password');
  const avatar = watch('avatar');

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const { name, email, password, avatar } = data;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    if (avatar && avatar[0]) {
      formData.append('avatar', avatar[0]);
    }

    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSnackbar('Registration successful!', SnackbarStatusEnum.SUCCESS);
      setLoading(false);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 409) {
          setSnackbar(
            'User with this email already exists!',
            SnackbarStatusEnum.ERROR,
          );
        } else {
          setSnackbar('Registration error', SnackbarStatusEnum.ERROR);
        }
        console.log(
          'Registration error:',
          error.response?.data || error.message,
        );
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8'>
        <h1 className='text-2xl font-semibold text-center mb-6'>Register</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
          marginBottom={20}
            id='name'
            label='Name'
            placeholder='Enter your name'
            error={errors.name}
            {...register('name', { required: 'Name is required' })}
          />

          <InputField
          marginBottom={20}
            id='email'
            type='email'
            label='Email'
            placeholder='Enter your email'
            error={errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Invalid email format',
              },
            })}
          />

          <InputField
          marginBottom={20}
            id='password'
            type='password'
            label='Password'
            placeholder='Enter your password'
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
            type='password'
            label='Confirm Password'
            placeholder='Re-enter your password'
            error={errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
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
              onChange={(e) => {
                setValue('avatar', e.target.files as FileList, {
                  shouldValidate: true,
                });
              }}
            />
          </div>

          <SubmitButton isLoading={isLoading} label='Register' />
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='text-blue-500 hover:underline'>
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
