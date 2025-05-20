import { PermissionEnum } from '@/models/enums';
import { useSessionStore } from '@/store/useSessionStore';

interface RequirePermissionProps {
  children: React.ReactNode;
  permission: PermissionEnum;
}

export default function RequirePermission({ children, permission }: RequirePermissionProps) {
  const { session } = useSessionStore();

  const userPermissions = session?.permissions;

  if (!userPermissions || !userPermissions.includes(permission)) {
    return null;
  }

  return <>{children}</>;
}
