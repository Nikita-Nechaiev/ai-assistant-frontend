'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import useSnackbarStore from '../../store/useSnackbarStore';
import SessionItem from './SessionItem';
import InputField from '@/ui/InputField';
import { useUserStore } from '@/store/useUserStore';
import Modal from '@/ui/Modal';
import axiosInstance from '@/services/axiosInstance';
import { ICollaborationSession, ISessionItem } from '@/models/models';
import { SnackbarStatusEnum } from '@/models/enums';

export const fetchUserSessions = async (): Promise<ISessionItem[]> => {
  const response = await axiosInstance.get<ISessionItem[]>(
    '/collaboration-session/get-user-sessions',
  );
  return response.data;
};

export const createSession = async (
  name: string,
): Promise<ICollaborationSession> => {
  const response = await axiosInstance.post<ICollaborationSession>(
    '/collaboration-session/create',
    {
      name: name.trim(),
    },
  );
  return response.data;
};

const SessionList: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();
  const { user } = useUserStore();

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery<ISessionItem[], AxiosError>({
    queryKey: ['userSessions'],
    queryFn: fetchUserSessions,
  });

  const mutation = useMutation<ICollaborationSession, AxiosError, string>({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      setSnackbar('Session created successfully!', SnackbarStatusEnum.SUCCESS);
      router.push(`/session/${newSession.id}`);
      setModalOpen(false); // Close popup on success
    },
    onError: () => {
      setSnackbar('Failed to create session!', SnackbarStatusEnum.ERROR);
    },
  });

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      return;
    }
    mutation.mutate(sessionName);
  };

  const handlePopupOpen = () => {
    setModalOpen(true);
    setSessionName(`${user?.name}'s session`);
  };

  if (isLoading) {
    return <div className='text-center'>Loading sessions...</div>;
  }

  if (error) {
    setSnackbar('Failed to fetch sessions!', SnackbarStatusEnum.ERROR);
    return (
      <div className='text-center text-red-500'>Failed to load sessions</div>
    );
  }

  // Handle case when `sessions` is empty or undefined
  const hasSessions = sessions && sessions.length > 0;

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-mainDark'>Sessions</h1>
        <button
          className='bg-mainDark text-white py-2 px-4 rounded hover:bg-mainDarkHover'
          onClick={handlePopupOpen}
        >
          Create Session
        </button>
      </div>

      {!hasSessions ? (
        <div className='text-center text-gray-500'>
          No sessions found. Click "Create Session" to add a new one!
        </div>
      ) : (
        <ul className='space-y-2'>
          {sessions.map((session, index) => (
            <SessionItem index={index} key={session.id} session={session} />
          ))}
        </ul>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateSession}
          title='Create New Session'
          width='w-[500px]'
          submitText='Create'
        >
          <InputField
            marginBottom={20}
            placeholder='Enter Session Name'
            id='sessionName'
            label='Session Name'
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </Modal>
      )}
    </div>
  );
};

export default SessionList;
