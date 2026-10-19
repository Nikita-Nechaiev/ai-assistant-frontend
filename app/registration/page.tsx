'use client';

import React from 'react';

import Link from 'next/link';

import useRegistrationForm from '@/hooks/auth/useRegistrationForm';
import AuthLayout, { AuthDivider } from '@/components/Layout/AuthLayout';
import InputField from '@/components/common/InputField';
import SubmitButton from '@/components/common/SubmitButton';
import GoogleSigninButton from '@/components/common/GoogleSigninButton';
import FileButton from '@/components/common/FileButton';

export default function RegisterPage() {
  const { register, handleSubmit, errors, isLoading, formOptions, onSubmit, handleGoogleSignIn, setValue } =
    useRegistrationForm();

  return (
    <AuthLayout
      title='Make room for great work.'
      eyebrow='Start your next chapter'
      description='Create an account to write, collaborate, and bring your ideas to life.'
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          id='name'
          label='Full name'
          autoComplete='name'
          placeholder='Your name'
          error={errors.name}
          {...register('name', formOptions.name)}
          marginBottom={18}
        />
        <InputField
          id='email'
          label='Email address'
          type='email'
          autoComplete='email'
          placeholder='you@company.com'
          error={errors.email}
          {...register('email', formOptions.email)}
          marginBottom={18}
        />
        <InputField
          id='password'
          label='Password'
          type='password'
          autoComplete='new-password'
          placeholder='Create a password'
          error={errors.password}
          {...register('password', formOptions.password)}
          marginBottom={10}
        />
        <p className='mb-4 text-sm leading-5 text-muted-foreground'>
          At least 8 characters, one uppercase letter, and one number.
        </p>
        <InputField
          id='confirmPassword'
          label='Confirm password'
          type='password'
          autoComplete='new-password'
          placeholder='Enter your password again'
          error={errors.confirmPassword}
          {...register('confirmPassword', formOptions.confirmPassword)}
          marginBottom={18}
        />
        <div className='mb-6'>
          <label htmlFor='avatar' className='mb-2 block text-sm font-medium'>
            Profile photo <span className='font-normal text-muted-foreground'>(optional)</span>
          </label>
          <FileButton
            id='avatar'
            label='Upload photo'
            onChange={(event) => setValue('avatar', event.target.files as FileList, { shouldValidate: true })}
          />
        </div>
        <SubmitButton isLoading={isLoading} label='Create account' />
      </form>
      <AuthDivider />
      <GoogleSigninButton onClick={handleGoogleSignIn} disabled={isLoading} />
      <p className='mt-7 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link href='/login' className='font-semibold text-primary hover:underline underline-offset-4'>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
