'use client';

import { PermissionEnum } from '@/models/enums';
import { useState, useEffect, useRef, useCallback } from 'react';
import RequirePermission from '@/helpers/RequirePermission';
import { useUserStore } from '@/store/useUserStore';

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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useUserStore();

  const toggleTooltip = useCallback(
    () => setIsTooltipOpen((prev) => !prev),
    [],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target as Node)
    ) {
      setIsTooltipOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isTooltipOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTooltipOpen, handleClickOutside]);

  const handleTogglePermission = useCallback(() => {
    if (!changeUserPermissions || !userId) return;
    changeUserPermissions(
      userId,
      currentPermission === PermissionEnum.EDIT
        ? PermissionEnum.READ
        : PermissionEnum.EDIT,
    );
  }, [changeUserPermissions, userId, currentPermission]);

  const isGoogleAvatar = avatar && !avatar.startsWith('/uploads');
  console.log('avatar', avatar)

  return (
    <div className='relative'>
      <img
        src={
          isGoogleAvatar
            ? avatar
            : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`
        }
        alt={name}
        referrerPolicy='no-referrer'
        className={`w-10 h-10 rounded-full border-2 ${
          isYellow ? 'border-yellow-400' : 'border-mainDark'
        } shadow-sm object-cover ${email && name ? 'cursor-pointer' : ''}`}
        onClick={toggleTooltip}
      />

      {email && name && userId && isTooltipOpen && (
        <div
          ref={tooltipRef}
          className={`absolute ${
            isBelowTooltip ? 'top-12' : 'bottom-12'
          } left-1/2 transform -translate-x-1/2 bg-mainDark text-white text-sm p-3 rounded shadow-lg min-w-[200px]`}
        >
          <div>{name}</div>
          <div className='text-gray-400 text-xs'>{email}</div>
          <div className='mt-2'>
            <span className='font-semibold'>Role:</span> {currentPermission}
          </div>

          {changeUserPermissions &&
            currentPermission !== PermissionEnum.ADMIN &&
            currentUser?.id !== userId && (
              <RequirePermission permission={PermissionEnum.ADMIN}>
                <button
                  onClick={handleTogglePermission}
                  className='mt-2 bg-mainLight text-mainDark px-2 py-1 rounded hover:bg-mainLightGray transition'
                >
                  Change to{' '}
                  {currentPermission === PermissionEnum.EDIT ? 'Read' : 'Edit'}
                </button>
              </RequirePermission>
            )}
        </div>
      )}
    </div>
  );
}
