'use client';

import React from 'react';

import { ICollaborator } from '@/models/models';
import UserAvatarCircle from '@/components/common/UserAvatarCircle';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  sender: ICollaborator;
  text: string;
  isCurrentUser: boolean;
  createdAt?: Date | string;
}

export default function ChatMessage({ sender: { name, avatar }, text, isCurrentUser, createdAt }: ChatMessageProps) {
  const date = createdAt ? new Date(createdAt) : null;
  const hasDate = date && !Number.isNaN(date.getTime());

  return (
    <div className={cn('flex items-end gap-2.5', isCurrentUser && 'flex-row-reverse')}>
      <div className='shrink-0 [&_img]:h-8 [&_img]:w-8 [&_img]:border-white [&_img]:shadow-none'>
        <UserAvatarCircle avatar={avatar} name={name} />
      </div>
      <div className='min-w-0 max-w-[80%]'>
        <div className={cn('mb-1.5 flex items-center gap-2 px-1', isCurrentUser && 'justify-end')}>
          <span className='truncate text-[13px] font-medium text-muted-foreground'>{isCurrentUser ? 'You' : name}</span>
          {hasDate && (
            <time dateTime={date.toISOString()} className='shrink-0 text-[13px] text-muted-foreground/80'>
              {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </time>
          )}
        </div>
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-base leading-6',
            isCurrentUser
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border border-border bg-white text-foreground shadow-card',
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
