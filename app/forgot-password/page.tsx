'use client';

import React from 'react';

import Link from 'next/link';

import useForgotPasswordForm from '@/hooks/auth/useForgotPasswordForm';
import AuthLayout from '@/components/Layout/AuthLayout';
import InputField from '@/components/common/InputField';
import SubmitButton from '@/components/common/SubmitButton';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, errors, isLoading, formOptions, onSubmit } = useForgotPasswordForm();

  return (
    <AuthLayout
      title='Forgot your password?'
      eyebrow='Let’s get you back in'
      description='Enter the email connected to your account. We’ll send you a link to reset your password.'
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          id='email'
          label='Email address'
          type='email'
          autoComplete='email'
          placeholder='you@company.com'
          error={errors.email}
          {...register('email', formOptions.email)}
          marginBottom={24}
        />
        <SubmitButton isLoading={isLoading} label='Send reset link' />
      </form>
      <p className='mt-6 text-sm leading-6 text-muted-foreground'>
        Check your inbox and spam folder after requesting the link.
      </p>
      <div className='mt-7 border-t border-border pt-6 text-center'>
        <Link href='/login' className='text-sm font-medium text-primary hover:underline underline-offset-4'>
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
