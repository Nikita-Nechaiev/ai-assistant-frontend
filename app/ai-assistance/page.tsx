'use client';
import MainLayout from '@/components/Dashboard/Layout';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/axiosInstance';
import { IAiToolUsage } from '@/models/models';
import Modal from '@/ui/Modal';
import { SnackbarStatusEnum } from '@/models/enums';
import { AiOutlineCopy } from 'react-icons/ai';
import useSnackbarStore from '@/store/useSnackbarStore';

export default function AiAssistancePage() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/ai-assistance/stepper');
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<IAiToolUsage | null>(null);
  const { setSnackbar } = useSnackbarStore();

  const openModalWithUsage = (usage: IAiToolUsage) => {
    setSelectedUsage(usage);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUsage(null);
  };

  // Infinite query to fetch paginated usage items (5 per page)
  const {
    data: usageData,
    isLoading: loadingUsage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<IAiToolUsage[], Error>({
    queryKey: ['usage'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get('/ai-tool-usage/user', {
        params: { page: pageParam, limit: 5 },
      });
      return res.data;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 5 ? pages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const allUsage = usageData?.pages.flat() ?? [];

  // Query to fetch statistics from the backend
  const { data: mostUsedData, isLoading: loadingMostUsed } = useQuery({
    queryKey: ['mostUsedTool'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ai-tool-usage/user/most-used-tool');
      return res.data; // expected: { mostFrequentTool, totalUsageNumber, totalWordCount, mostInDayUsage, firstAiUsage }
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar('Text copied to clipboard!', SnackbarStatusEnum.SUCCESS);
  };

  const totalWordCount = mostUsedData?.totalWordCount
  const totalRequests = mostUsedData?.totalUsageNumber
  const mostUsedTool = mostUsedData?.mostFrequentTool
  const firstRequestDate = mostUsedData?.firstAiUsage
    ? new Date(mostUsedData.firstAiUsage)
    : new Date();

  return (
    <MainLayout>
      <div className='py-8 px-4'>
        {/* Section 1: Welcome */}
        <div className='flex flex-col justify-center py-8'>
          <h1 className='text-4xl font-bold text-mainDark mb-4'>
            Welcome to AI Assistance
          </h1>
          <p className='text-lg text-gray-500 mb-6 max-w-xl'>
            Here you can use AI-powered tools for text analysis, generation, and
            processing. Simply follow the steps to get started.
          </p>
          <button
            onClick={handleStartClick}
            className='bg-mainDark hover:bg-mainDarkHover text-mainLight px-6 py-3 w-[400px] h-[50px] rounded'
          >
            Get Started with AI
          </button>
        </div>

        {/* Section 2: Statistics */}
        <div className='mt-12 border border-mainDark rounded p-6 max-w-3xl'>
          <h2 className='text-2xl font-bold text-mainDark mb-4'>
            Your recent activity and statistics:
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <p>
                <span>You started using AI assistance: </span>
                <span className='font-bold'>
                  {firstRequestDate.toLocaleDateString()}
                </span>
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
        </div>

        {/* Section 3: Table */}
        <div className='mt-8 max-w-3xl'>
          {loadingUsage ? (
            <p>Loading usage data...</p>
          ) : (
            <div className='overflow-hidden border border-gray-300 rounded'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='border border-gray-300 px-4 py-2 text-left'>
                      #
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-left'>
                      Date
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-left'>
                      AI Tool
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-left'>
                      Show Results
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsage.map((usage, index) => (
                    <tr key={usage.id}>
                      <td className='border border-gray-300 px-4 py-2'>
                        {index + 1}
                      </td>
                      <td className='border border-gray-300 px-4 py-2'>
                        {new Date(usage.timestamp).toLocaleDateString()}
                      </td>
                      <td className='border border-gray-300 px-4 py-2'>
                        {usage.toolName}
                      </td>
                      <td className='border border-gray-300 px-4 py-2'>
                        <button
                          onClick={() => openModalWithUsage(usage)}
                          className='text-blue-500 hover:underline'
                        >
                          Show results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasNextPage && (
            <div className='mt-4 text-center'>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className='text-mainDark underline'
              >
                {isFetchingNextPage ? 'Loading more...' : 'Show more'}
              </button>
            </div>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title='Usage Details'
          width='w-[1000px]'
        >
          {selectedUsage ? (
            <div>
              {/* Tool Name and Date */}
              <div className='text-lg mb-4'>
                <span className='font-bold'>{selectedUsage.toolName}</span>
                <span className='text-gray-500 ml-2'>
                  ({new Date(selectedUsage.timestamp).toLocaleDateString()})
                </span>
              </div>

              <div className='border border-gray-300 rounded p-4 flex gap-4'>
                <div className='w-1/2'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-mainDark font-semibold'>
                      Requested Text
                    </h3>
                    <button
                      onClick={() => handleCopy(selectedUsage.sentText)}
                      className='text-gray-500 hover:text-mainDark transition'
                    >
                      <AiOutlineCopy size={18} />
                    </button>
                  </div>
                  <div className='p-3 bg-gray-100 rounded h-40 overflow-auto'>
                    {selectedUsage.sentText}
                  </div>
                </div>

                {/* Right Column: AI Response */}
                <div className='w-1/2'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-mainDark font-semibold'>AI Result</h3>
                    <button
                      onClick={() => handleCopy(selectedUsage.result)}
                      className='text-gray-500 hover:text-mainDark transition'
                    >
                      <AiOutlineCopy size={18} />
                    </button>
                  </div>
                  <div className='p-3 bg-gray-100 rounded h-40 overflow-auto'>
                    {selectedUsage.result}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
