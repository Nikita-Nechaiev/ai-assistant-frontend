import { useState, useCallback, useMemo } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';

import { AuthApi } from '@/services/AuthApi';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

interface ForgotPasswordFormInputs {
  email: string;
}

export default function useForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();

  const [isLoading, setIsLoading] = useState(false);
  const { setSnackbar } = useSnackbarStore();

  const formOptions = useMemo(
    () => ({
      email: { required: 'Email is required' },
    }),
    [],
  );

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = useCallback(
    async (data) => {
      setIsLoading(true);

      try {
        await AuthApi.forgotPassword(data);
        setSnackbar('Password reset link sent to your email.', SnackbarStatusEnum.SUCCESS);
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to send password reset link'
          : 'An unexpected error occurred';

        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [setSnackbar],
  );

  return { register, handleSubmit, errors, isLoading, formOptions, onSubmit };
}
