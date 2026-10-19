'use client';

import React from 'react';

import Link from 'next/link';

import useLoginForm from '@/hooks/auth/useLoginForm';
import AuthLayout, { AuthDivider } from '@/components/Layout/AuthLayout';
import InputField from '@/components/common/InputField';
import SubmitButton from '@/components/common/SubmitButton';
import GoogleSigninButton from '@/components/common/GoogleSigninButton';

export default function LoginPage() {
  const { register, handleSubmit, errors, isLoading, formOptions, onSubmit, handleGoogleSignIn } = useLoginForm();

  return (
    <AuthLayout title='Welcome back.' description='Sign in to pick up your ideas right where you left them.'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          id='email'
          label='Email address'
          type='email'
          autoComplete='email'
          placeholder='you@company.com'
          error={errors.email}
          {...register('email', formOptions.email)}
          marginBottom={20}
        />
        <InputField
          id='password'
          label='Password'
          type='password'
          autoComplete='current-password'
          placeholder='Enter your password'
          error={errors.password}
          {...register('password', formOptions.password)}
          marginBottom={16}
        />
        <div className='mb-6 text-right'>
          <Link href='/forgot-password' className='text-sm font-medium text-primary hover:underline underline-offset-4'>
            Forgot password?
          </Link>
        </div>
        <SubmitButton isLoading={isLoading} label='Sign in' />
      </form>
      <AuthDivider />
      <GoogleSigninButton onClick={handleGoogleSignIn} disabled={isLoading} />
      <p className='mt-7 text-center text-sm text-muted-foreground'>
        New to AI Editor?{' '}
        <Link href='/registration' className='font-semibold text-primary hover:underline underline-offset-4'>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
