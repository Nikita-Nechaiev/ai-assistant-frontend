'use client';

import SessionLayout from '@/components/Session/SessionLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SessionLayout>{children}</SessionLayout>;
}
