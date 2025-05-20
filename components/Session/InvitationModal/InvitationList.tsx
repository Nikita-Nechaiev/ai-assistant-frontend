import { IInvitation } from '@/models/models';
import { PermissionEnum } from '@/models/enums';

import InvitationItem from './InvitationItem';

const InvitationList: React.FC<{
  deleteInvitation: (invitationId: number) => void;
  invitations: IInvitation[];
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
}> = ({ invitations, changeInvitationRole, deleteInvitation }) => (
  <div className='mt-6'>
    <h3 className='text-lg font-semibold mb-3'>Existing Invitations</h3>
    <div className='flex flex-col space-y-2'>
      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <InvitationItem
            deleteInvitation={deleteInvitation}
            key={invitation.id}
            invitation={invitation}
            changeInvitationRole={changeInvitationRole}
          />
        ))
      ) : (
        <p className='text-sm text-gray-500'>No invitations found.</p>
      )}
    </div>
  </div>
);

export default InvitationList;
