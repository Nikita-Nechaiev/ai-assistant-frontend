'use client';

import React from 'react';

import Link from 'next/link';

import useResetPasswordForm from '@/hooks/auth/useResetPasswordForm';
import AuthLayout from '@/components/Layout/AuthLayout';
import InputField from '@/components/common/InputField';
import SubmitButton from '@/components/common/SubmitButton';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { register, handleSubmit, errors, isLoading, formOptions, onSubmit } = useResetPasswordForm(params);

  return (
    <AuthLayout
      title='Choose a new password.'
      eyebrow='A fresh start'
      description='Set a new password for your account, then sign in to return to your workspace.'
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          id='password'
          label='New password'
          type='password'
          autoComplete='new-password'
          placeholder='Create a new password'
          error={errors.password}
          {...register('password', formOptions.password)}
          marginBottom={12}
        />
        <p className='mb-5 text-sm leading-5 text-muted-foreground'>
          Use at least 8 characters, including an uppercase letter and a number.
        </p>
        <InputField
          id='confirmPassword'
          label='Confirm new password'
          type='password'
          autoComplete='new-password'
          placeholder='Enter your new password again'
          error={errors.confirmPassword}
          {...register('confirmPassword', formOptions.confirmPassword)}
          marginBottom={24}
        />
        <SubmitButton isLoading={isLoading} label='Reset password' />
      </form>
      <div className='mt-7 border-t border-border pt-6 text-center'>
        <Link href='/login' className='text-sm font-medium text-primary hover:underline underline-offset-4'>
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
