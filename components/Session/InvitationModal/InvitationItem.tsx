import { useState } from 'react';

import { BsThreeDots } from 'react-icons/bs';

import RequirePermission from '@/helpers/RequirePermission';
import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import RoleDropdown from './RoleDropdown';

const InvitationItem: React.FC<{
  invitation: IInvitation;
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
}> = ({ invitation, changeInvitationRole, deleteInvitation }) => {
  const [isOpenMenu, setOpenMenu] = useState(false);

  return (
    <div className='flex items-center justify-between bg-gray-50 border p-3 rounded-lg'>
      <div>
        <p className='font-medium'>{invitation?.receiver?.email}</p>
        <p className='text-sm text-gray-600'>Role: {invitation.role}</p>
      </div>
      <div className='relative'>
        <RequirePermission permission={PermissionEnum.ADMIN}>
          <button
            type='button'
            onClick={() => setOpenMenu((prev) => !prev)}
            className='p-2 hover:bg-gray-200 rounded-full'
          >
            <BsThreeDots size={18} />
          </button>
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
