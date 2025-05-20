'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { GoArrowSwitch } from 'react-icons/go';

import InputField from '@/ui/InputField';
import { useUserStore } from '@/store/useUserStore';
import Modal from '@/ui/Modal';
import axiosInstance from '@/services/axiosInstance';
import { ICollaborationSession, ISessionItem } from '@/models/models';
import { SnackbarStatusEnum } from '@/models/enums';
import SmallLoader from '@/ui/SmallLoader';

import SessionItem from './SessionItem';
import useSnackbarStore from '../../store/useSnackbarStore';

export const fetchUserSessions = async ({
  queryKey,
  pageParam,
}: {
  queryKey: readonly unknown[];
  pageParam?: unknown;
}) => {
  const [, search] = queryKey as [string, string];
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const { data } = await axiosInstance.get<ISessionItem[]>('/collaboration-session/get-user-sessions', {
    params: { page: page, search: search },
  });

  return data;
};

const SessionList: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { setSnackbar } = useSnackbarStore();
  const { user } = useUserStore();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
    ISessionItem[],
    AxiosError
  >({
    queryKey: ['userSessions', debouncedSearch],
    queryFn: fetchUserSessions,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.length === 25 ? lastPage.length + 1 : undefined),
  });

  const mutation = useMutation<ICollaborationSession, AxiosError, string>({
    mutationFn: async (name) => {
      const response = await axiosInstance.post<ICollaborationSession>('/collaboration-session/create', {
        name: name.trim(),
      });

      return response.data;
    },
    onSuccess: (newSession) => {
      setSnackbar('Session created successfully!', SnackbarStatusEnum.SUCCESS);
      router.push(`/session/${newSession.id}`);
    },
    onError: () => {
      setSnackbar('Failed to create session!', SnackbarStatusEnum.ERROR);
    },
  });

  const handleCreateSession = useCallback(() => {
    if (!sessionName.trim()) return;

    mutation.mutate(sessionName);
  }, [sessionName, mutation]);

  const handlePopupOpen = useCallback(() => {
    setModalOpen(true);
    setSessionName(`${user?.name}'s session`);
  }, [user]);

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-mainDark'>Sessions</h1>
        <button className='bg-mainDark text-white py-2 px-4 rounded hover:bg-mainDarkHover' onClick={handlePopupOpen}>
          Create Session
        </button>
      </div>

      <InputField
        id='sessionSearch'
        label='Search Sessions'
        ref={inputRef}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='Enter session name...'
        marginBottom={20}
      />

      {error && <div className='text-center text-red-500'>⚠️ Failed to load sessions! Please try again later.</div>}

      {isLoading ? (
        <div className='flex flex-col items-center justify-center space-y-3'>
          <SmallLoader />
          <p className='text-gray-500 text-sm animate-pulse'>Loading sessions...</p>
        </div>
      ) : data?.pages.flat().length === 0 ? (
        <div className='flex flex-col items-center justify-center space-y-4 py-10 text-gray-500'>
          <GoArrowSwitch size={30} />
          <h2 className='text-lg font-semibold'>No sessions found</h2>
        </div>
      ) : (
        <>
          <ul className='space-y-2'>
            {data?.pages
              .flat()
              .map((session, index) => <SessionItem index={index} key={session.id} session={session} />)}
          </ul>
          {hasNextPage && (
            <div className='text-center'>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className={`bg-mainDark text-white py-2 px-4 rounded hover:bg-mainDarkHover transition-all ${
                  isFetchingNextPage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isFetchingNextPage ? (
                  <div className='flex items-center space-x-2'>
                    <SmallLoader />
                    <span>Loading more...</span>
                  </div>
                ) : (
                  'Show More'
                )}
              </button>
            </div>
          )}
        </>
      )}

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
    </div>
  );
};

export default SessionList;
