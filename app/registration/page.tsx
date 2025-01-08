'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums/SnackbarStatusEnum';
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
  } = useForm<RegisterFormInputs>();
  const { setSnackbar } = useSnackbarStore();
  const { setUser } = useUserStore()
  const router = useRouter();

  const password = watch('password');

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const { name, email, password, avatar } = data;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    if (avatar && avatar[0]) {
      formData.append('avatar', avatar[0]);
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          withCredentials: true,
        },
      });
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      setSnackbar('Registration successful!', SnackbarStatusEnum.SUCCESS);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError) {
        setSnackbar('Registration error', SnackbarStatusEnum.ERROR);
        console.log('Registration error:', error.response?.data || error.message);
      }
    }
  }

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''
                }`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''
                }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Invalid email format',
                },
              })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : ''
                }`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''
                }`}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              Avatar (optional)
            </label>
            <div className="flex items-center">
              <label
                htmlFor="avatar"
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Choose File
              </label>
              <span className="ml-3 text-sm text-gray-600" id="file-name">No file selected</span>
            </div>
            <input
              type="file"
              id="avatar"
              className="hidden"
              {...register('avatar')}
              accept="image/*"
              onChange={(e) => {
                const fileNameElement = document.getElementById('file-name');
                if (e.target.files?.[0] && fileNameElement) {
                  fileNameElement.textContent = e.target.files[0].name;
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </form>

        {/* Already Have an Account */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 font-medium">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="gap-2 mt-4 w-full py-3 px-4 flex items-center justify-center border border-gray-300 rounded-md shadow-sm text-base font-medium bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FcGoogle />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
