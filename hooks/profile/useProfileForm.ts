import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { UserApi } from '@/services/UserApi';
import { SnackbarStatusEnum } from '@/models/enums';
import { queryKeys } from '@/lib/queryKeys';

import useAvatarPreview from './useAvatarPreview';

export default function useProfileForm(isOpen: boolean, onClose: () => void) {
  const { user, updateUser } = useUserStore();
  const { setSnackbar } = useSnackbarStore();
  const client = useQueryClient();
  const form = useForm<{ name: string }>({ defaultValues: { name: user?.name ?? '' } });
  const { reset } = form;
  const avatar = useAvatarPreview(user?.avatar, isOpen);

  useEffect(() => {
    if (isOpen) reset({ name: user?.name ?? '' });
  }, [isOpen, user?.name, reset]);

  const submit = async ({ name }: { name: string }) => {
    const trimmedName = name.trim();

    if (trimmedName === (user?.name ?? '') && !avatar.file) {
      setSnackbar('No changes to update', SnackbarStatusEnum.ERROR);

      return;
    }

    const data = new FormData();

    data.append('name', trimmedName);

    if (avatar.file) data.append('avatar', avatar.file);

    try {
      const updated = await UserApi.updateProfile(data);

      updateUser(updated);

      if (user?.id) void client.invalidateQueries({ queryKey: queryKeys.sessions(user.id) });

      setSnackbar('Profile updated successfully', SnackbarStatusEnum.SUCCESS);
      onClose();
    } catch {
      setSnackbar('Failed to update profile', SnackbarStatusEnum.ERROR);
    }
  };

  return {
    user,
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(submit),
    avatarPreview: avatar.preview,
    handleFileChange: avatar.onChange,
  };
}
