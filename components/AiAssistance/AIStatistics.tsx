import React from 'react';

interface AIStatisticsProps {
  firstRequestDate: Date;
  totalRequests: number;
  totalWordCount: number;
  mostUsedTool: string;
}

const AIStatistics: React.FC<AIStatisticsProps> = ({
  firstRequestDate,
  totalRequests,
  totalWordCount,
  mostUsedTool,
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div>
        <p>
          <span>You started using AI assistance: </span>
          <span className='font-bold'>{firstRequestDate.toLocaleDateString()}</span>
        </p>
        <p>
          <span>Total number of requests: </span>
          <span className='font-bold'>{totalRequests}</span>
        </p>
      </div>
      <div>
        <p>
          <span>Total word count from AI: </span>
          <span className='font-bold'>{totalWordCount}</span>
        </p>
        <p>
          <span>Most used AI tool: </span>
          <span className='font-bold'>{mostUsedTool}</span>
        </p>
      </div>
    </div>
  );
};

export default AIStatistics;
