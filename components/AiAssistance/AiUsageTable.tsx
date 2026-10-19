'use client';

import React from 'react';

import Link from 'next/link';
import { FiArrowDown, FiArrowUpRight, FiClock, FiSearch, FiLoader, FiRefreshCw, FiX } from 'react-icons/fi';

import useAiUsageHistory from '@/hooks/ai/useAiUsageHistory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import AiUsageRow from './AiUsageRow';
import AiUsageDialog from './AiUsageDialog';

const AiUsageTable = () => {
  const {
    allUsage,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    selectedUsage,
    isModalOpen,
    filterText,
    setFilterText,
    debouncedSearch,
    openModalWithUsage,
    closeModal,
  } = useAiUsageHistory();

  return (
    <section aria-labelledby='ai-history-heading'>
      <div className='mb-5 flex items-center justify-between gap-5'>
        <div>
          <h2 id='ai-history-heading' className='text-xl font-semibold tracking-tight'>
            Pick up a previous thought.
          </h2>
          <p className='mt-1.5 text-sm text-muted-foreground'>Your request history, ready whenever you need it.</p>
        </div>
        <span className='flex items-center gap-1.5 text-[13px] text-muted-foreground'>
          <FiClock size={13} aria-hidden='true' />
          Request history
        </span>
      </div>
      <Card className='overflow-hidden border-border shadow-card'>
        <div className='flex items-center justify-between gap-5 border-b border-border p-4'>
          <div className='relative w-[300px]'>
            <FiSearch
              size={14}
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              aria-hidden='true'
            />
            <Input
              id='ai-usage-search'
              aria-label='Search request history'
              value={filterText}
              onChange={(event) => setFilterText(event.target.value)}
              placeholder='Search tools, text, or results…'
              className='h-9 border-border bg-muted/40 pl-9 pr-8 text-sm shadow-none'
            />
            {filterText && (
              <button
                type='button'
                aria-label='Clear history search'
                onClick={() => setFilterText('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <FiX size={12} aria-hidden='true' />
              </button>
            )}
          </div>
          <p className='text-[13px] text-muted-foreground'>
            {debouncedSearch ? 'Matching requests' : 'Your AI activity'}
          </p>
        </div>
        {isLoading ? (
          <div role='status' className='space-y-6 p-5'>
            <span className='sr-only'>Loading request history…</span>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className='flex items-center gap-3'>
                <Skeleton className='h-9 w-9' />
                <Skeleton className='h-4 w-1/4' />
                <Skeleton className='ml-8 h-4 w-2/5' />
                <Skeleton className='ml-auto h-4 w-20' />
              </div>
            ))}
          </div>
        ) : error && !allUsage.length ? (
          <div role='alert' className='px-6 py-12 text-center'>
            <FiRefreshCw size={24} className='mx-auto mb-4 text-muted-foreground' aria-hidden='true' />
            <h3 className='text-base font-semibold'>Couldn’t load your request history.</h3>
            <p className='mt-2 text-sm text-muted-foreground'>Please try again in a moment.</p>
            <Button variant='outline' size='sm' onClick={() => refetch()} className='mt-5 text-sm'>
              Try again
            </Button>
          </div>
        ) : !allUsage.length ? (
          <div className='px-6 py-12 text-center'>
            <span className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary'>
              <FiClock size={23} aria-hidden='true' />
            </span>
            <h3 className='text-base font-semibold'>
              {debouncedSearch ? 'No matching requests' : 'A fresh page. Plenty of possibilities.'}
            </h3>
            <p className='mx-auto mt-2 max-w-[360px] text-sm leading-6 text-muted-foreground'>
              {debouncedSearch
                ? 'Try another search, or clear the filter to see your history.'
                : 'Your AI requests will appear here. Start with a tool above and see what you can create.'}
            </p>
            {debouncedSearch ? (
              <Button variant='outline' size='sm' className='mt-5 text-sm' onClick={() => setFilterText('')}>
                Clear search
              </Button>
            ) : (
              <Button asChild size='sm' className='mt-5 text-sm'>
                <Link href='/ai-assistance/stepper'>
                  Start your first request
                  <FiArrowUpRight aria-hidden='true' />
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <table className='w-full table-fixed text-left'>
              <caption className='sr-only'>AI request history</caption>
              <colgroup>
                <col className='w-[240px]' />
                <col />
                <col className='w-[145px]' />
                <col className='w-[130px]' />
              </colgroup>
              <thead className='sr-only'>
                <tr>
                  <th scope='col' className='w-[240px] px-5 py-3 font-medium'>
                    AI tool
                  </th>
                  <th scope='col' className='px-5 py-3 font-medium'>
                    Your text
                  </th>
                  <th scope='col' className='w-[145px] px-5 py-3 font-medium'>
                    Date
                  </th>
                  <th scope='col' className='w-[130px] px-5 py-3 text-right font-medium'>
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {allUsage.map((usage) => (
                  <AiUsageRow key={usage.id} usage={usage} onView={openModalWithUsage} />
                ))}
              </tbody>
            </table>
            <div className='flex items-center justify-between border-t border-border px-5 py-3'>
              <p className='text-[13px] text-muted-foreground'>
                {allUsage.length} {allUsage.length === 1 ? 'request' : 'requests'} shown
              </p>
              {hasNextPage && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className='h-7 text-[13px] text-primary'
                >
                  {isFetchingNextPage ? (
                    <FiLoader className='animate-spin' aria-hidden='true' />
                  ) : (
                    <FiArrowDown aria-hidden='true' />
                  )}
                  {isFetchingNextPage ? 'Loading…' : 'Show more'}
                </Button>
              )}
            </div>
            {error && (
              <p role='alert' className='border-t border-border px-5 py-3 text-sm text-destructive'>
                {isFetchNextPageError
                  ? 'Could not load more requests. Select Show more to try again.'
                  : 'Could not refresh your history. Your previous requests are still shown.'}
              </p>
            )}
          </>
        )}
      </Card>
      <AiUsageDialog isModalOpen={isModalOpen} selectedUsage={selectedUsage} closeModal={closeModal} />
    </section>
  );
};

export default AiUsageTable;
