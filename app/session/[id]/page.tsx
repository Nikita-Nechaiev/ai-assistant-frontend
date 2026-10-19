'use client';

import { useContext } from 'react';

import LargeLoader from '@/components/common/LargeLoader';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import DocumentList from '@/components/Session/DocumentSection/DocumentList';

export default function SessionPage() {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext || !sessionContext.socket) {
    return <LargeLoader />;
  }

  return <DocumentList socket={sessionContext.socket} sessionId={sessionContext.sessionId} />;
}
