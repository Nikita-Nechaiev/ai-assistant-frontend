import { useEffect, useRef } from 'react';

import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

const RoleDropdown: React.FC<{
  invitation: IInvitation;
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
  closeMenu: () => void;
}> = ({ invitation, changeInvitationRole, deleteInvitation, closeMenu }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <div ref={ref} className='absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10 overflow-hidden'>
      {invitation.role !== PermissionEnum.READ && (
        <button
          type='button'
          className='block w-full px-4 py-2 text-left hover:bg-gray-100'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.READ);
            closeMenu();
          }}
        >
          Change to READ
        </button>
      )}
      {invitation.role !== PermissionEnum.EDIT && (
        <button
          type='button'
          className='block w-full px-4 py-2 text-left hover:bg-gray-100'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.EDIT);
            closeMenu();
          }}
        >
          Change to EDIT
        </button>
      )}
      <button
        type='button'
        className='block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100'
        onClick={() => {
          deleteInvitation(invitation.id);
          closeMenu();
        }}
      >
        Delete Invitation
      </button>
    </div>
  );
};

export default RoleDropdown;
