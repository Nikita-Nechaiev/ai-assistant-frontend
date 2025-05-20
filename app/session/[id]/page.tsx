'use client';

import { useContext, useEffect } from 'react';

import LargeLoader from '@/ui/LargeLoader';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import DocumentList from '@/components/Session/DocumentSection/DocumentList';

export default function SessionPage() {
  const sessionContext = useContext(SessionContext);

  useEffect(() => {
    if (sessionContext?.currentDocument) {
      sessionContext.setCurrentDocument?.(null);
    }
  }, [sessionContext]);

  if (!sessionContext || !sessionContext.session || !sessionContext.documents) {
    return <LargeLoader />;
  }

  const { session, documents, createDocument = () => {}, changeDocumentTitle = () => {} } = sessionContext;

  return (
    <div className='py-4'>
      <DocumentList
        createDocument={createDocument}
        changeDocumentTitle={changeDocumentTitle}
        sessionId={session.id}
        documents={documents}
      />
    </div>
  );
}
