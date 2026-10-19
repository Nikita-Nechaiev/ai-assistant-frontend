'use client';

import React, { useState } from 'react';

import { FiMoreHorizontal, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { IDocument } from '@/models/models';
import { sliceRichContent } from '@/helpers/sliceRichContent';

import DocumentPreview from './DocumentPreview';
import PopupMenu from './PopupMenu';

interface DocumentItemProps {
  document: IDocument;
  sessionId: number;
  onEditTitle: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, sessionId, onEditTitle }) => {
  const [isShowPopup, setShowPopup] = useState(false);
  const created = new Date(document.createdAt);

  return (
    <article className='group relative rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-md'>
      <Link
        href={`/session/${sessionId}/document/${document.id}`}
        aria-label={`Open ${document.title}`}
        className='block overflow-hidden rounded-t-xl border-b border-border bg-muted/70 px-7 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <DocumentPreview richContent={sliceRichContent(document.richContent)} />
      </Link>
      <div className='flex items-center justify-between gap-2 px-4 py-4'>
        <div className='min-w-0'>
          <Link
            href={`/session/${sessionId}/document/${document.id}`}
            className='flex min-w-0 items-center gap-2 text-base font-medium transition-colors hover:text-primary'
          >
            <FiFileText size={14} className='shrink-0 text-primary/80' aria-hidden='true' />
            <span title={document.title} className='truncate'>
              {document.title}
            </span>
          </Link>
          <p className='mt-1.5 pl-[22px] text-[13px] text-muted-foreground'>
            Created{' '}
            {Number.isNaN(created.getTime())
              ? 'recently'
              : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(created)}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label={`Actions for ${document.title}`}
          aria-expanded={isShowPopup}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => setShowPopup((open) => !open)}
          className='h-8 w-8 shrink-0 text-muted-foreground'
        >
          <FiMoreHorizontal aria-hidden='true' />
        </Button>
      </div>
      {isShowPopup && (
        <PopupMenu
          documentTitle={document.title}
          richContent={document.richContent}
          onEditTitle={onEditTitle}
          documentId={document.id}
          onClose={() => setShowPopup(false)}
        />
      )}
    </article>
  );
};

export default DocumentItem;
