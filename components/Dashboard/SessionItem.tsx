import React from 'react';
import Link from 'next/link';
import UserAvatarCircle from '../common/UserAvatarCircle';
import { ISessionItem } from '@/models/models';
import TruncatedText from '@/ui/TruncateText';

interface SessionItemProps {
  session: ISessionItem;
  index: number;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, index }) => {
  return (
    <Link
      href={`/session/${session.id}`}
      className='flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md hover:mainDark transition'
    >
      <div className='flex items-center gap-[20px]'>
        <div>{index + 1}</div>
        <TruncatedText
          text={session.name}
          maxLength={40}
          className='text-mainDark font-medium'
          style={{ width: '250px' }}
        />

        <div className='flex -space-x-2'>
          {session.collaborators.slice(0, 4).map((collaborator) => (
            <UserAvatarCircle
              key={collaborator.id}
              name={collaborator.name}
              email={collaborator.email}
              avatar={collaborator.avatar}
            />
          ))}
          {session.collaborators.length > 4 && (
            <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white'>
              +{session.collaborators.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Last Interacted */}
      {session.lastInteracted && (
        <div className='text-mainGray text-sm whitespace-nowrap'>
          Last Interacted:{' '}
          {new Date(session.lastInteracted).toLocaleDateString()}
        </div>
      )}
    </Link>
  );
};

export default SessionItem;
