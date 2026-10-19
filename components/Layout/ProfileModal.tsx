'use client';

import React, { useRef } from 'react';

import { FiCamera, FiUser, FiMail } from 'react-icons/fi';

import useProfileForm from '@/hooks/profile/useProfileForm';
import WorkspaceModal from '@/components/common/WorkspaceModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isGoogleAvatar } from '@/helpers/isGoogleAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, register, errors, isSubmitting, onSubmit, avatarPreview, handleFileChange } = useProfileForm(
    isOpen,
    onClose,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <WorkspaceModal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      title='Profile settings'
      description='Make yourself at home. Manage how you appear in your workspace.'
      icon={<FiUser size={21} aria-hidden='true' />}
      submitText='Save changes'
      className='max-w-[520px]'
    >
      <div className='mb-5 flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4'>
        <div className='relative shrink-0'>
          {avatarPreview ? (
            <img
              src={isGoogleAvatar(avatarPreview) ? avatarPreview : `${process.env.NEXT_PUBLIC_API_URL}${avatarPreview}`}
              alt='Avatar preview'
              className='h-[72px] w-[72px] rounded-full border-4 border-white object-cover shadow-sm'
            />
          ) : (
            <span className='flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-accent text-2xl font-semibold text-primary'>
              {user?.name?.charAt(0).toUpperCase() || <FiUser />}
            </span>
          )}
          <button
            type='button'
            aria-label='Change profile photo'
            onClick={() => fileInputRef.current?.click()}
            className='absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <FiCamera size={12} aria-hidden='true' />
          </button>
        </div>
        <div>
          <p className='text-base font-semibold'>Profile photo</p>
          <p className='mt-1 text-sm leading-5 text-muted-foreground'>A familiar face for your collaborators.</p>
          <Button
            type='button'
            variant='link'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            className='mt-1 h-7 px-0 text-sm'
          >
            Upload a photo
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          aria-label='Upload profile photo'
          className='hidden'
          onChange={handleFileChange}
        />
      </div>
      <div className='space-y-4'>
        <div>
          <label htmlFor='name' className='mb-2 block text-sm font-medium'>
            Display name
          </label>
          <Input
            id='name'
            {...register('name', {
              required: 'Name is required',
              validate: (value) => !!value.trim() || 'Name is required',
            })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'profile-name-error' : undefined}
          />
          {errors.name ? (
            <p id='profile-name-error' role='alert' className='mt-2 text-sm text-destructive'>
              {errors.name.message}
            </p>
          ) : (
            <p className='mt-2 text-sm text-muted-foreground'>This is the name your collaborators will see.</p>
          )}
        </div>
        <div>
          <label htmlFor='profile-email' className='mb-2 block text-sm font-medium'>
            Email address
          </label>
          <div className='relative'>
            <FiMail
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              size={14}
              aria-hidden='true'
            />
            <Input
              id='profile-email'
              type='email'
              value={user?.email ?? ''}
              readOnly
              className='bg-muted/70 pl-9 text-muted-foreground'
            />
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>The email connected to your account.</p>
        </div>
      </div>
    </WorkspaceModal>
  );
};

export default ProfileModal;
