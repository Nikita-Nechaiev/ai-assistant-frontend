import React from 'react';

import { FiMail } from 'react-icons/fi';

import { IInvitation } from '@/models/models';
import { PermissionEnum } from '@/models/enums';

import InvitationItem from './InvitationItem';

const InvitationList: React.FC<{
  deleteInvitation: (invitationId: number) => void;
  invitations: IInvitation[];
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
}> = ({ invitations, changeInvitationRole, deleteInvitation }) => (
  <div className='mt-4 border-t border-border pt-4'>
    <div className='mb-3 flex items-center justify-between'>
      <h3 className='text-sm font-semibold'>Existing invitations</h3>
      <span className='rounded-md bg-secondary px-2 py-0.5 text-[13px] text-muted-foreground'>
        {invitations.length}
      </span>
    </div>
    <div className='space-y-2'>
      {invitations.length ? (
        invitations.map((invitation) => (
          <InvitationItem
            key={invitation.id}
            deleteInvitation={deleteInvitation}
            invitation={invitation}
            changeInvitationRole={changeInvitationRole}
          />
        ))
      ) : (
        <div className='flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground'>
          <FiMail size={16} aria-hidden='true' />
          No invitations yet. Start with someone you work with.
        </div>
      )}
    </div>
  </div>
);

export default InvitationList;
