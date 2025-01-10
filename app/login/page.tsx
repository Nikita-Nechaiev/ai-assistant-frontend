'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums/SnackbarStatusEnum';
import { useUserStore } from '@/store/useUserStore';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { setSnackbar } = useSnackbarStore()
  const { setUser, id } = useUserStore()
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { user } = response.data;

      setUser(user);

      setSnackbar('Login successful!', SnackbarStatusEnum.SUCCESS);

      router.push('/dashboard');
    } catch (error: any) {
      setSnackbar('Login error', SnackbarStatusEnum.ERROR);

      console.log('Login error:', error.response?.data || error.message);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`mt-1 block w-full p-2 rounded-md border border-gray-300 shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''
                }`}
              {...register('email', { required: 'Email is required' })}
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
              className={`mt-1 block w-full p-2 rounded-md border border-gray-300 shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : ''
                }`}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="text-right mb-6">
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/registration" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="gap-2 w-full py-3 px-4 flex items-center justify-center border border-gray-300 rounded-md shadow-sm text-base font-medium bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FcGoogle />
          Log in with Google
        </button>
      </div>
    </div>
  );
}
