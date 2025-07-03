'use client';
import React, { useState, useRef, useEffect } from 'react';

import { AiOutlineCamera } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import { UserApi } from '@/services/UserApi';
import { SnackbarStatusEnum } from '@/models/enums';
import { isGoogleAvatar } from '@/helpers/isGoogleAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  name: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUserStore();
  const { setSnackbar } = useSnackbarStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: user?.name ?? '' },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      reset({ name: user?.name ?? '' });
      setAvatarFile(null);
      setAvatarPreview(user?.avatar);
    }
  }, [isOpen, user, reset]);

  const chooseFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    const trimmedName = data.name.trim();

    const isNameChanged = trimmedName !== (user?.name ?? '');
    const isAvatarChanged = !!avatarFile;

    if (!isNameChanged && !isAvatarChanged) {
      setSnackbar('No changes to update', SnackbarStatusEnum.ERROR);

      return;
    }

    const formData = new FormData();

    formData.append('name', trimmedName);

    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const updated = await UserApi.updateProfile(formData);

      updateUser(updated);

      queryClient.invalidateQueries({ queryKey: ['userSessions'] });

      setSnackbar('Profile updated successfully', SnackbarStatusEnum.SUCCESS);
      onClose();
    } catch (e) {
      setSnackbar('Failed to update profile', SnackbarStatusEnum.ERROR);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit(onSubmit)}
      cancelText='Cancel'
      submitText='Save'
      title='Edit profile'
      width='w-[28rem]'
    >
      <div className='flex flex-col items-center gap-6'>
        <div className='relative'>
          {avatarPreview ? (
            <img
              src={isGoogleAvatar(avatarPreview) ? avatarPreview : `${process.env.NEXT_PUBLIC_API_URL}${avatarPreview}`}
              alt='Avatar preview'
              className='h-28 w-28 rounded-full object-cover'
            />
          ) : (
            <div className='h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center'>
              <AiOutlineCamera size={36} className='text-gray-500' />
            </div>
          )}

          <button
            type='button'
            onClick={chooseFile}
            className='absolute bottom-0 right-0 bg-mainDark p-2 rounded-full hover:bg-mainDarkHover transition-colors'
          >
            <AiOutlineCamera size={18} className='text-white' />
          </button>

          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
        </div>

        <InputField
          id='name'
          label='Name'
          {...register('name', { required: 'Name is required' })}
          error={errors.name}
        />
      </div>
    </Modal>
  );
};

export default ProfileModal;
