import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ICollaborationSession } from '@/models/models';
import { SessionApi } from '@/services/SessionApi';
import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import { invalidateSessionQueries } from '@/lib/queryInvalidation';

export const useCreateSession = (onCreated?: () => void) => {
  const userId = useUserStore((state) => state.user?.id);
  const client = useQueryClient();
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();

  return useMutation<ICollaborationSession, Error, string>({
    mutationFn: SessionApi.createSession,
    onSuccess: (session) => {
      invalidateSessionQueries(client, userId);
      onCreated?.();
      setSnackbar('Session created successfully!', SnackbarStatusEnum.SUCCESS);
      router.push(`/session/${session.id}`);
    },
  });
};
