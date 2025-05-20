'use client';
import { useEffect, useState, useCallback } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import { FiCopy } from 'react-icons/fi';

import axiosInstance from '@/services/axiosInstance';
import { IAiToolUsage } from '@/models/models';
import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';
import SmallLoader from '@/ui/SmallLoader';

const AiUsageTable = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<IAiToolUsage | null>(null);
  const [filterText, setFilterText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(filterText);
  const { setSnackbar } = useSnackbarStore();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filterText), 500);

    return () => clearTimeout(handler);
  }, [filterText]);

  const {
    data: usageData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['usage', debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosInstance.get('/ai-tool-usage/user', {
        params: { page: pageParam, limit: 8, search: debouncedSearch },
      });

      return data;
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length === 8 ? pages.length + 1 : undefined),
    initialPageParam: 1,
  });

  const allUsage = usageData?.pages.flat() ?? [];

  const openModalWithUsage = useCallback((usage: IAiToolUsage) => {
    setSelectedUsage(usage);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedUsage(null);
  }, []);

  const onCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setSnackbar('Text copied to clipboard!', SnackbarStatusEnum.SUCCESS);
    },
    [setSnackbar],
  );

  return (
    <div className='mt-8 max-w-3xl'>
      <InputField
        id='search'
        label='Search usage'
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder='Enter search term...'
        marginBottom='16px'
      />

      {isLoading ? (
        <div className='flex flex-col items-center justify-center space-y-3 mt-6'>
          <SmallLoader />
          <p className='text-gray-500 text-sm animate-pulse'>Loading usage data...</p>
        </div>
      ) : allUsage.length === 0 ? (
        <p className='text-center text-gray-500 mt-4'>No usage data found.</p>
      ) : (
        <div className='overflow-hidden border border-gray-300 rounded'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 px-4 py-2 text-left'>#</th>
                <th className='border border-gray-300 px-4 py-2 text-left'>Date</th>
                <th className='border border-gray-300 px-4 py-2 text-left'>AI Tool</th>
                <th className='border border-gray-300 px-4 py-2 text-left'>Show Results</th>
              </tr>
            </thead>
            <tbody>
              {allUsage.map((usage, index) => (
                <tr key={usage.id}>
                  <td className='border border-gray-300 px-4 py-2'>{index + 1}</td>
                  <td className='border border-gray-300 px-4 py-2'>{new Date(usage.timestamp).toLocaleDateString()}</td>
                  <td className='border border-gray-300 px-4 py-2'>{usage.toolName}</td>
                  <td className='border border-gray-300 px-4 py-2'>
                    <button onClick={() => openModalWithUsage(usage)} className='text-blue-500 hover:underline'>
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
            className='text-mainDark underline flex items-center justify-center space-x-2'
          >
            {isFetchingNextPage ? (
              <>
                <SmallLoader />
                <span>Loading more...</span>
              </>
            ) : (
              'Show more'
            )}
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title='Usage Details' width='w-[1000px]'>
        {selectedUsage ? (
          <div>
            <div className='text-lg mb-4'>
              <span className='font-bold'>{selectedUsage.toolName}</span>
              <span className='text-gray-500 ml-2'>({new Date(selectedUsage.timestamp).toLocaleDateString()})</span>
            </div>
            <div className='border border-gray-300 rounded p-4 flex gap-4'>
              <div className='w-1/2'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-mainDark font-semibold'>Requested Text</h3>
                  <button
                    onClick={() => onCopy(selectedUsage.sentText)}
                    className='text-gray-500 hover:text-mainDark transition'
                  >
                    <FiCopy size={18} />
                  </button>
                </div>
                <div className='p-3 bg-gray-100 rounded h-40 overflow-auto'>{selectedUsage.sentText}</div>
              </div>
              <div className='w-1/2'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-mainDark font-semibold'>AI Result</h3>
                  <button
                    onClick={() => onCopy(selectedUsage.result)}
                    className='text-gray-500 hover:text-mainDark transition'
                  >
                    <FiCopy size={18} />
                  </button>
                </div>
                <div className='p-3 bg-gray-100 rounded h-40 overflow-auto'>{selectedUsage.result}</div>
              </div>
            </div>
          </div>
        ) : (
          <p>No details available.</p>
        )}
      </Modal>
    </div>
  );
};

export default AiUsageTable;
