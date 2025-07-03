import { useMutation } from '@tanstack/react-query';

import { ICollaborationSession } from '@/models/models';
import { SessionApi } from '@/services/SessionApi';

export const useCreateSession = () =>
  useMutation<ICollaborationSession, Error, string>({
    mutationFn: SessionApi.createSession,
  });
