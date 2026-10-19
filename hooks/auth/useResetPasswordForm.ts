import { useState, useCallback, useMemo, useEffect } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { AuthApi } from '@/services/AuthApi';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

export default function useResetPasswordForm(params: Promise<{ token: string }>) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();
  const password = watch('password');

  useEffect(() => {
    params.then((resolvedParams) => setToken(resolvedParams.token));
  }, [params]);

  const formOptions = useMemo(
    () => ({
      password: {
        required: 'Password is required',
        pattern: {
          value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
          message: 'Password must be at least 8 characters, include one uppercase letter and one number',
        },
      },
      confirmPassword: {
        required: 'Confirm password is required',
        validate: (value: string) => value === password || 'Passwords do not match',
      },
    }),
    [password],
  );

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = useCallback(
    async (data) => {
      if (!token) {
        setSnackbar('Invalid token.', SnackbarStatusEnum.ERROR);

        return;
      }

      setIsLoading(true);

      try {
        await AuthApi.resetPassword(token, data.password);

        setSnackbar('Password reset successfully!', SnackbarStatusEnum.SUCCESS);
        router.replace('/login');
      } catch (error) {
        const errorMessage = axios.isAxiosError(error) ? 'Failed to reset password' : 'An unexpected error occurred';

        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [token, setSnackbar, router],
  );

  return { register, handleSubmit, errors, isLoading, formOptions, onSubmit };
}
