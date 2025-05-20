'use client';

import { useEffect } from 'react';

import { IUser } from '@/models/models';
import { useUserStore } from '@/store/useUserStore';

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
