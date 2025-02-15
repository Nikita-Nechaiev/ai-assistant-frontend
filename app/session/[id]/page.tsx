'use client';

import { useContext, useEffect } from 'react';
import DocumentList from '@/components/Session/DocumentList';
import { SessionContext } from '@/components/Session/SessionLayout';
import LargeLoader from '@/ui/LargeLoader';

export default function SessionPage() {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext || !sessionContext.session || !sessionContext.documents) {
    return <LargeLoader />;
  }

  const {
    session,
    documents,
    currentDocument,
    setCurrentDocument,
    createDocument = () => {},
    changeDocumentTitle = () => {},
  } = sessionContext;

  useEffect(() => {
    if (currentDocument) {
      setCurrentDocument?.(null);
    }
  }, [currentDocument, setCurrentDocument]);

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
