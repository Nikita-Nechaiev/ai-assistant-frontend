import { useState, useCallback, useMemo } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { AuthApi } from '@/services/AuthApi';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: FileList;
}

export default function useRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormInputs>();
  const { setSnackbar } = useSnackbarStore();
  const { setUser } = useUserStore();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const watchedPassword = watch('password');

  const formOptions = useMemo(
    () => ({
      name: { required: 'Name is required' },
      email: {
        required: 'Email is required',
        pattern: {
          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          message: 'Invalid email format',
        },
      },
      password: {
        required: 'Password is required',
        pattern: {
          value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
          message: 'Password must be at least 8 characters, include one uppercase letter and one number',
        },
      },
      confirmPassword: {
        required: 'Confirm password is required',
        validate: (value: string) => value === watchedPassword || 'Passwords do not match',
      },
    }),
    [watchedPassword],
  );

  const onSubmit: SubmitHandler<RegisterFormInputs> = useCallback(
    async (data) => {
      setLoading(true);

      const { name, email, password, avatar } = data;

      const formData = new FormData();

      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);

      if (avatar?.[0]) formData.append('avatar', avatar[0]);

      try {
        const responseData = await AuthApi.register(formData);

        setUser(responseData.user);
        setSnackbar('Registration successful!', SnackbarStatusEnum.SUCCESS);
        router.push('/dashboard');
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.status === 409
            ? 'User with this email already exists!'
            : 'Registration error';

        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setSnackbar, router],
  );

  const handleGoogleSignIn = useCallback(() => {
    AuthApi.signInWithGoogle();
  }, []);

  return { register, handleSubmit, errors, isLoading, formOptions, onSubmit, handleGoogleSignIn, setValue };
}
