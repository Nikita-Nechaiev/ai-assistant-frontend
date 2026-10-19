import { useState, useCallback, useMemo } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { AuthApi } from '@/services/AuthApi';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function useLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  const { setSnackbar } = useSnackbarStore();
  const { setUser } = useUserStore();
  const router = useRouter();

  const formOptions = useMemo(
    () => ({
      email: { required: 'Email is required' },
      password: { required: 'Password is required' },
    }),
    [],
  );

  const onSubmit: SubmitHandler<LoginFormInputs> = useCallback(
    async (data) => {
      setIsLoading(true);

      try {
        const responseData = await AuthApi.login(data);

        setUser(responseData.user);
        setSnackbar('Successfully logged in!', SnackbarStatusEnum.SUCCESS);
        router.replace('/dashboard');
      } catch (error) {
        const errorMessage = axios.isAxiosError(error) ? 'Invalid email or password!' : 'An unexpected error occurred';

        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setSnackbar, router],
  );

  const handleGoogleSignIn = useCallback(() => {
    AuthApi.signInWithGoogle();
  }, []);

  return { register, handleSubmit, errors, isLoading, formOptions, onSubmit, handleGoogleSignIn };
}
