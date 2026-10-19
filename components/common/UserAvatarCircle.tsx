'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { FiUser, FiShield } from 'react-icons/fi';

import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/components/common/RequirePermission';
import { useUserStore } from '@/store/useUserStore';
import { isGoogleAvatar } from '@/helpers/isGoogleAvatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserAvatarCircleProps {
  avatar?: string;
  userId?: number;
  name?: string;
  email?: string;
  currentPermission?: PermissionEnum;
  isBelowTooltip?: boolean;
  isYellow?: boolean;
  changeUserPermissions?: (userId: number, permission: PermissionEnum) => void;
}

export default function UserAvatarCircle({
  userId,
  name,
  email,
  avatar,
  currentPermission,
  isBelowTooltip,
  isYellow,
  changeUserPermissions,
}: UserAvatarCircleProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useUserStore();
  const canOpen = !!(email && name && userId);
  const role =
    currentPermission === PermissionEnum.ADMIN
      ? 'Admin'
      : currentPermission === PermissionEnum.EDIT
        ? 'Editor'
        : 'Viewer';
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) setIsTooltipOpen(false);
  }, []);

  useEffect(() => {
    if (!isTooltipOpen) return;

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsTooltipOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', escape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [isTooltipOpen, handleClickOutside]);

  const avatarContent = (
    <>
      {avatar && avatar !== failedAvatar ? (
        <img
          src={isGoogleAvatar(avatar) ? avatar : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`}
          alt={name || 'Collaborator'}
          referrerPolicy='no-referrer'
          onError={() => setFailedAvatar(avatar)}
          className='h-9 w-9 rounded-full border-2 border-white object-cover'
        />
      ) : (
        <span className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-sm font-semibold text-primary'>
          {name?.trim().charAt(0).toUpperCase() || <FiUser size={16} aria-hidden='true' />}
        </span>
      )}
      {isYellow && (
        <span
          className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary'
          aria-label='Online'
        />
      )}
    </>
  );

  return (
    <div ref={containerRef} className='relative shrink-0'>
      {canOpen ? (
        <button
          type='button'
          aria-label={`View ${name}'s profile`}
          aria-expanded={isTooltipOpen}
          onClick={() => setIsTooltipOpen((open) => !open)}
          className='relative block rounded-full transition hover:ring-2 hover:ring-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {avatarContent}
        </button>
      ) : (
        <span className='relative block'>{avatarContent}</span>
      )}
      {canOpen && isTooltipOpen && (
        <div
          role='dialog'
          aria-label={`${name}'s profile`}
          className={cn(
            'saas-dialog absolute right-0 z-[70] w-[240px] rounded-xl border border-border bg-white p-4 text-foreground shadow-lg',
            isBelowTooltip ? 'top-12' : 'bottom-12',
          )}
        >
          <p className='truncate text-base font-semibold'>{name}</p>
          <p className='mt-1 truncate text-sm text-muted-foreground'>{email}</p>
          <div className='mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground'>
            <FiShield size={12} className='text-primary' aria-hidden='true' />
            {role} access
          </div>
          {changeUserPermissions && currentPermission !== PermissionEnum.ADMIN && currentUser?.id !== userId && (
            <RequirePermission permission={PermissionEnum.ADMIN}>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-4 w-full text-sm'
                onClick={() => {
                  if (userId)
                    changeUserPermissions(
                      userId,
                      currentPermission === PermissionEnum.EDIT ? PermissionEnum.READ : PermissionEnum.EDIT,
                    );
                }}
              >
                Change to {currentPermission === PermissionEnum.EDIT ? 'Viewer' : 'Editor'}
              </Button>
            </RequirePermission>
          )}
        </div>
      )}
    </div>
  );
}
