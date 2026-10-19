'use client';

import React from 'react';

import { FiLogOut } from 'react-icons/fi';

import useLogout from '@/hooks/auth/useLogout';

const LogoutButton = ({ workspace = false }: { workspace?: boolean }) => {
  const handleLogout = useLogout();

  return (
    <button
      onClick={handleLogout}
      className={
        workspace
          ? 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          : 'p-2 border-mainDark bg-mainLight text-mainDark hover:bg-gray-100 rounded transition'
      }
    >
      {workspace && <FiLogOut size={17} aria-hidden='true' />}
      Logout
    </button>
  );
};

export default LogoutButton;
