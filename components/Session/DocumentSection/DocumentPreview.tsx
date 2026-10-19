import React from 'react';

import { FiFileText } from 'react-icons/fi';

interface DocumentPreviewProps {
  richContent: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ richContent }) => {
  const hasContent =
    !!richContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, '')
      .trim() || /<img\b/i.test(richContent);

  return (
    <div className='relative mx-auto h-[170px] w-full overflow-hidden rounded-t border border-b-0 border-border bg-white p-5 shadow-sm transition-transform group-hover:-translate-y-1'>
      {hasContent ? (
        <div
          className='h-full overflow-hidden whitespace-pre-wrap text-xs leading-relaxed text-slate-600 [&_img]:max-w-full'
          dangerouslySetInnerHTML={{ __html: richContent }}
        />
      ) : (
        <div className='flex h-full flex-col items-center justify-center gap-3 text-slate-300'>
          <FiFileText size={28} strokeWidth={1} aria-hidden='true' />
          <span className='text-[13px] text-muted-foreground'>Blank document</span>
        </div>
      )}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent'
      />
    </div>
  );
};

export default React.memo(DocumentPreview);
