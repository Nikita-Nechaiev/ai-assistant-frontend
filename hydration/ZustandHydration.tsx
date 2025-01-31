'use client';

import { IUser } from '@/models/app-models/models';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

interface Props {
  user: IUser | null;
}

export default function ZustandHydration({ user }: Props) {
  const { setUser } = useUserStore();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return null;
}
