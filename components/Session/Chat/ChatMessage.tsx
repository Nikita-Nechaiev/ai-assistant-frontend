'use client';

import React from 'react';

import { ICollaborator } from '@/models/models';
import UserAvatarCircle from '@/components/common/UserAvatarCircle';

interface ChatMessageProps {
  sender: ICollaborator;
  text: string;
  isCurrentUser: boolean;
}

export default function ChatMessage({ sender: { name, avatar }, text, isCurrentUser }: ChatMessageProps) {
  return (
    <div className={`flex items-center gap-3 p-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && <UserAvatarCircle isBelowTooltip={false} avatar={avatar} />}

      <div
        className={`max-w-xs p-3 rounded-lg ${
          isCurrentUser ? 'bg-blue-100 text-blue-900 self-end' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className='text-sm font-semibold'>{name}</div>
        <div className='text-sm'>{text}</div>
      </div>

      {isCurrentUser && <UserAvatarCircle avatar={avatar} />}
    </div>
  );
}
