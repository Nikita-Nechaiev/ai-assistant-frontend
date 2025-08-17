'use client';

import React, { useState, useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { FcInvite } from 'react-icons/fc';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { MdDelete, MdEdit } from 'react-icons/md';

import { PermissionEnum } from '@/models/enums';
import UserAvatarCircle from '@/components/common/UserAvatarCircle';
import RequirePermission from '@/helpers/RequirePermission';
import TruncatedText from '@/ui/TruncateText';
import ConfirmationModal from '@/ui/ConfirmationModal';
import { formatTimeSpent } from '@/helpers/timeHelpers';
import { useSessionHeaderSocket } from '@/hooks/sockets/useSessionHeaderSocket';

interface Props {
  sessionId: number;
  socket: Socket;
  handleOpenInviteModal: () => void;
}

export default function SessionHeader({ sessionId, socket, handleOpenInviteModal }: Props) {
  const router = useRouter();
  const params = useParams();

  const { sessionName, onlineUsers, timeSpentMs, emitChangeSessionName, emitDeleteSession, emitChangeUserPermissions } =
    useSessionHeaderSocket({ sessionId, socket });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isEditing) setTempName(sessionName);
  }, [sessionName, isEditing]);

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== sessionName) {
      emitChangeSessionName(tempName);
    }

    setIsEditing(false);
  };

  const handleGoBack = () => {
    if (params.id && params.documentId) router.push(`/session/${params.id}`);
    else router.push('/dashboard');
  };

  const shownUsers = onlineUsers.slice(0, 10);
  const hasMore = onlineUsers.length > 10;

  return (
    <header className='z-50 flex items-center justify-between fixed w-full h-[72px] px-6 bg-mainDark text-mainLight shadow-md'>
      <div className='flex items-center space-x-4'>
        <button
          onClick={handleGoBack}
          className='flex items-center justify-center h-10 w-10 rounded-full bg-mainLight text-mainDark hover:bg-gray-200 transition'
        >
          <RiArrowGoBackFill />
        </button>

        <div className='flex items-center space-x-5'>
          {isEditing ? (
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className='bg-mainLight text-mainDark px-2 py-1 rounded focus:outline-none'
            />
          ) : (
            <h1 className='text-xl flex items-center'>
              <TruncatedText text={sessionName} maxLength={55} className='font-semibold' />
            </h1>
          )}

          <RequirePermission permission={PermissionEnum.ADMIN}>
            <div className='flex items-center space-x-4'>
              <button onClick={() => setIsEditing(true)} className='hover:text-gray-300 transition'>
                <MdEdit size={25} />
              </button>
              <button onClick={() => setDeleteModalOpen(true)} className='hover:text-gray-300 transition'>
                <MdDelete size={25} />
              </button>
            </div>
          </RequirePermission>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex -space-x-2'>
          {shownUsers.map((u) => (
            <UserAvatarCircle
              key={u.id}
              userId={u.id}
              name={u.name}
              email={u.email}
              avatar={u.avatar}
              isYellow
              isBelowTooltip
              currentPermission={u.permissions[u.permissions.length - 1]}
              changeUserPermissions={emitChangeUserPermissions}
            />
          ))}
          {hasMore && <span className='text-sm font-medium'>…</span>}
        </div>

        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            data-testid='open-invite-modal'
            onClick={handleOpenInviteModal}
            className='h-10 w-10 bg-mainLight text-mainDark rounded-full flex items-center justify-center hover:bg-gray-200 transition'
          >
            <FcInvite />
          </button>
        </RequirePermission>

        <div className='text-lg font-semibold'>{formatTimeSpent(Math.floor(timeSpentMs / 1000))}</div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSubmit={() => {
          emitDeleteSession();
          setDeleteModalOpen(false);
        }}
        onCancel={() => setDeleteModalOpen(false)}
        description='Are you sure you want to delete this session? This action cannot be undone.'
        submitText='Delete'
      />
    </header>
  );
}
