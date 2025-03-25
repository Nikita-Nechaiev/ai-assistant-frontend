import React from 'react';
import 'react-quill-new/dist/quill.snow.css';

interface DocumentPreviewProps {
  richContent: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ richContent }) => {
  const formattedContent = richContent;

  return (
    <div className='relative w-full h-[209px] bg-white overflow-hidden rounded-t-md p-2 text-[6px]'>
      <div
        className='h-full overflow-hidden text-gray-800 whitespace-pre-wrap'
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </div>
  );
};

export default React.memo(DocumentPreview);
