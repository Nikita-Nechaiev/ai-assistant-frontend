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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeMenu]);

  return (
    <div
      ref={ref}
      className='absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-lg'
      role='menu'
      aria-label='Invitation actions'
    >
      {invitation.role !== PermissionEnum.READ && (
        <button
          type='button'
          role='menuitem'
          className='block w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.READ);
            closeMenu();
          }}
        >
          Change to Viewer
        </button>
      )}
      {invitation.role !== PermissionEnum.EDIT && (
        <button
          type='button'
          role='menuitem'
          className='block w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:outline-none'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.EDIT);
            closeMenu();
          }}
        >
          Change to Editor
        </button>
      )}
      <button
        type='button'
        role='menuitem'
        className='block w-full rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none'
        onClick={() => {
          deleteInvitation(invitation.id);
          closeMenu();
        }}
      >
        Delete invitation
      </button>
    </div>
  );
};

export default RoleDropdown;
