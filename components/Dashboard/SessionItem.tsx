'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { FiArrowUpRight, FiFolder } from 'react-icons/fi';

import { ISessionItem, ICollaborator } from '@/models/models';
import { isGoogleAvatar } from '@/helpers/isGoogleAvatar';

function MemberAvatar({ collaborator }: { collaborator: ICollaborator }) {
  const [hasError, setHasError] = useState(false);
  const initials = collaborator.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const src = isGoogleAvatar(collaborator.avatar)
    ? collaborator.avatar
    : `${process.env.NEXT_PUBLIC_API_URL}${collaborator.avatar}`;

  return (
    <span
      title={collaborator.name}
      className='flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-50 text-xs font-semibold text-primary'
    >
      {collaborator.avatar && !hasError ? (
        <img
          src={src}
          alt={collaborator.name}
          onError={() => setHasError(true)}
          className='h-full w-full object-cover'
        />
      ) : (
        <span aria-label={collaborator.name}>{initials || '?'}</span>
      )}
    </span>
  );
}

const SessionItem = ({ session }: { session: ISessionItem }) => {
  const lastActivity = session.lastInteracted ? new Date(session.lastInteracted) : null;
  const date = lastActivity && !Number.isNaN(lastActivity.getTime()) ? lastActivity : null;

  return (
    <li>
      <Link
        href={`/session/${session.id}`}
        className='group grid grid-cols-[minmax(0,1fr)_104px_132px_16px] items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
      >
        <div className='flex min-w-0 items-center gap-3'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100/70 bg-accent/60 text-primary'>
            <FiFolder size={17} aria-hidden='true' />
          </span>
          <div className='min-w-0'>
            <p
              title={session.name}
              className='truncate text-base font-medium transition-colors group-hover:text-primary'
            >
              {session.name}
            </p>
            <p className='mt-1 text-[13px] text-muted-foreground'>
              {session.collaborators.length} {session.collaborators.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        <div className='flex items-center -space-x-2'>
          {session.collaborators.slice(0, 3).map((collaborator) => (
            <MemberAvatar key={collaborator.id} collaborator={collaborator} />
          ))}
          {session.collaborators.length > 3 && (
            <span className='flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-secondary text-xs font-medium text-muted-foreground'>
              +{session.collaborators.length - 3}
            </span>
          )}
        </div>
        <span className='text-[13px] text-muted-foreground'>
          {date ? (
            <time dateTime={date.toISOString()}>
              {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)}
            </time>
          ) : (
            'No activity yet'
          )}
        </span>
        <FiArrowUpRight
          size={14}
          className='text-slate-300 transition-colors group-hover:text-primary'
          aria-hidden='true'
        />
      </Link>
    </li>
  );
};

export default SessionItem;
