import React, { useState } from 'react';

import { FiMoreHorizontal, FiMail } from 'react-icons/fi';

import RequirePermission from '@/components/common/RequirePermission';
import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import RoleDropdown from './RoleDropdown';

const InvitationItem: React.FC<{
  invitation: IInvitation;
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
}> = ({ invitation, changeInvitationRole, deleteInvitation }) => {
  const [isOpenMenu, setOpenMenu] = useState(false);

  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-3'>
      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary'>
        <FiMail size={14} aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{invitation.receiver?.email}</p>
        <Badge variant='secondary' className='mt-1.5 px-1.5 py-0 text-[13px] font-normal'>
          {invitation.role === PermissionEnum.EDIT ? 'Editor' : 'Viewer'}
        </Badge>
      </div>
      <div className='relative'>
        <RequirePermission permission={PermissionEnum.ADMIN}>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Manage invitation'
            aria-expanded={isOpenMenu}
            className='h-8 w-8 text-muted-foreground'
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setOpenMenu((open) => !open)}
          >
            <FiMoreHorizontal aria-hidden='true' />
          </Button>
          {isOpenMenu && (
            <RoleDropdown
              invitation={invitation}
              changeInvitationRole={changeInvitationRole}
              deleteInvitation={deleteInvitation}
              closeMenu={() => setOpenMenu(false)}
            />
          )}
        </RequirePermission>
      </div>
    </div>
  );
};

export default InvitationItem;
