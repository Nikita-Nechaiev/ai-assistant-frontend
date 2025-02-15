'use client';
import React from 'react';
import { AITool } from '@/models/models';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { aiToolList } from '@/helpers/aiToolsList';

interface Step1SelectToolProps {
  onToolSelect: (tool: AITool) => void;
  isOnDocumentPage: boolean;
}

const Step1SelectTool: React.FC<Step1SelectToolProps> = ({
  onToolSelect,
  isOnDocumentPage,
}) => {
  const router = useRouter();

  return (
    <div>
      {!isOnDocumentPage && (
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-mainDark hover:text-mainDarkHover transition-all'
        >
          <span className=' hover:underline'>Go Back</span>
          <RiArrowGoBackFill size={15} />
        </button>
      )}

      <h2 className='text-2xl text-center font-bold mb-4 '>
        Select an AI Tool
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {aiToolList.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool)}
            className={`border rounded p-4 text-center flex flex-col items-center justify-center gap-2 hover:bg-mainLightGray transition-colors h-24border-mainLightGray`}
          >
            {tool.Icon && <tool.Icon size={24} />}
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step1SelectTool;
