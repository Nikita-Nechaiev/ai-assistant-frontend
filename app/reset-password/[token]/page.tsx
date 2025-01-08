'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormInputs>();
  const router = useRouter();
  const password = watch('password');

  // Unwrap the `params` object
  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    }
    unwrapParams();
  }, [params]);

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (!token) {
      alert('Invalid token.');
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`, {
        password: data.password,
      });
      alert('Password reset successfully! Redirecting to login page...');
      router.replace('/login'); // Use replace to prevent back navigation
    } catch (error: any) {
      console.error('Error resetting password:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your new password"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : ''}`}
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              className={`p-2 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
