'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GoArrowSwitch } from 'react-icons/go';

import MainLayout from '@/components/Dashboard/Layout';
import axiosInstance from '@/services/axiosInstance';
import AiUsageTable from '@/components/AiAssistance/AiUsageTable';
import AIStatistics from '@/components/AiAssistance/AIStatistics';

function NoActivityFound() {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 py-6 text-gray-500'>
      <GoArrowSwitch size={30} />
      <h2 className='text-lg font-semibold'>No AI activity found</h2>
      <p>It looks like you haven't used AI functions yet. Start now!</p>
    </div>
  );
}

export default function AiAssistancePage() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/ai-assistance/stepper');
  };

  const {
    data: mostUsedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mostUsedTool'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ai-tool-usage/user/most-used-tool');

      return res.data;
    },
  });

  const firstRequestDate = useMemo(() => {
    return mostUsedData?.firstAiUsage ? new Date(mostUsedData.firstAiUsage) : new Date();
  }, [mostUsedData?.firstAiUsage]);

  const totalWordCount = useMemo(() => mostUsedData?.totalWordCount ?? 0, [mostUsedData]);
  const totalRequests = useMemo(() => mostUsedData?.totalUsageNumber ?? 0, [mostUsedData]);
  const mostUsedTool = useMemo(
    () => mostUsedData?.mostFrequentTool || 'You did not make any recent requests',
    [mostUsedData],
  );

  const noActivity = useMemo(() => {
    return (
      mostUsedData &&
      !mostUsedData.firstAiUsage &&
      !mostUsedData.mostFrequentTool &&
      mostUsedData.totalUsageNumber === 0 &&
      mostUsedData.totalWordCount === 0
    );
  }, [mostUsedData]);

  return (
    <MainLayout>
      <div className='py-8 px-4'>
        <div className='flex flex-col justify-center py-8'>
          <h1 className='text-4xl font-bold text-mainDark mb-4'>Welcome to AI Assistance</h1>
          <p className='text-lg text-gray-500 mb-6 max-w-xl'>
            Here you can use AI-powered tools for text analysis, generation, and processing. Simply follow the steps to
            get started.
          </p>
          <button
            onClick={handleStartClick}
            className='bg-mainDark hover:bg-mainDarkHover text-mainLight px-6 py-3 w-[400px] h-[50px] rounded'
          >
            Get Started with AI
          </button>
        </div>

        <div className='mt-12 border border-mainDark rounded p-6 max-w-3xl'>
          <h2 className='text-2xl font-bold text-mainDark mb-4'>Your recent activity and statistics:</h2>

          {isLoading ? (
            <p className='text-gray-500'>Loading...</p>
          ) : error ? (
            <p className='text-red-500'>Failed to load data</p>
          ) : noActivity ? (
            <NoActivityFound />
          ) : (
            <AIStatistics
              firstRequestDate={firstRequestDate}
              totalRequests={totalRequests}
              totalWordCount={totalWordCount}
              mostUsedTool={mostUsedTool}
            />
          )}
        </div>

        <div className='mt-8 mb-12 max-w-3xl'>
          <AiUsageTable />
        </div>
      </div>
    </MainLayout>
  );
}
