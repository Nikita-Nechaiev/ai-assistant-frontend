'use client';

import React, { useState, useEffect } from 'react';

import { FiSearch, FiPlus, FiLayers, FiRefreshCw, FiArrowDown, FiLoader, FiX } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useDebouncedValue from '@/hooks/common/useDebouncedValue';
import { useUserSessions } from '@/hooks/dashboard/useUserSessions';

import SessionItem from './SessionItem';

interface SessionListProps {
  onCreateSession: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const SessionList = ({ onCreateSession }: SessionListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm.trim());
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [debouncedSearch]);

  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useUserSessions(debouncedSearch);
  const sessions = data?.pages.flat() ?? [];
  const visibleSessions = sessions.slice(0, visibleCount);
  const hasMore = sessions.length > visibleCount || hasNextPage;
  const showMore = async () => {
    if (sessions.length <= visibleCount && hasNextPage) {
      const result = await fetchNextPage();

      if (result.isError) return;
    }

    setVisibleCount((count) => count + 6);
  };

  return (
    <section aria-labelledby='sessions-heading' className='min-w-0'>
      <div className='mb-4'>
        <div>
          <h2 id='sessions-heading' className='text-2xl font-semibold tracking-tight'>
            Your sessions
          </h2>
          <p className='mt-1 text-sm leading-6 text-muted-foreground'>
            Open a session to continue working on its documents.
          </p>
        </div>
      </div>
      <Card className='overflow-hidden border-border shadow-card'>
        <div className='flex items-center justify-between gap-4 border-b border-border p-4'>
          <div className='relative w-full max-w-[320px]'>
            <FiSearch
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              size={14}
              aria-hidden='true'
            />
            <Input
              id='sessionSearch'
              aria-label='Search sessions'
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Search sessions…'
              className='h-9 border-border bg-muted/50 pl-9 pr-8 text-sm shadow-none'
            />
            {searchTerm && (
              <button
                type='button'
                aria-label='Clear search'
                onClick={() => setSearchTerm('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <FiX size={12} aria-hidden='true' />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div role='status' className='space-y-6 p-5'>
            <span className='sr-only'>Loading sessions…</span>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10' />
                <Skeleton className='h-4 w-2/5' />
                <Skeleton className='ml-auto h-4 w-20' />
              </div>
            ))}
          </div>
        ) : error && !sessions.length ? (
          <div role='alert' className='px-6 py-12 text-center'>
            <FiRefreshCw size={24} className='mx-auto mb-4 text-muted-foreground' aria-hidden='true' />
            <p className='text-base font-medium'>Failed to load sessions</p>
            <p className='mt-2 text-sm text-muted-foreground'>Please try again. Your work is still there.</p>
            <Button variant='outline' size='sm' onClick={() => refetch()} className='mt-5'>
              Try again
            </Button>
          </div>
        ) : !sessions.length ? (
          <div className='px-8 py-12 text-center'>
            <span className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary'>
              <FiLayers size={23} aria-hidden='true' />
            </span>
            <h3 className='text-xl font-semibold'>{debouncedSearch ? 'No sessions found' : 'No sessions yet'}</h3>
            <p className='mx-auto mt-3 max-w-[400px] text-base leading-7 text-muted-foreground'>
              {debouncedSearch
                ? 'Try another name, or clear your search to see your sessions.'
                : 'A session holds your shared documents. Create one to start writing and invite people to work with you.'}
            </p>
            <Button
              className='mt-6 h-10 gap-2 text-sm'
              onClick={debouncedSearch ? () => setSearchTerm('') : onCreateSession}
            >
              {!debouncedSearch && <FiPlus aria-hidden='true' />}
              {debouncedSearch ? 'Clear search' : 'Create your first session'}
            </Button>
            {!debouncedSearch && (
              <p className='mt-4 text-sm text-muted-foreground'>
                You can also join a session by accepting an invitation from notifications.
              </p>
            )}
          </div>
        ) : (
          <>
            <div
              className='grid grid-cols-[minmax(0,1fr)_104px_132px_16px] gap-3 border-b border-border bg-muted/40 px-5 py-3 text-[13px] font-medium uppercase tracking-wider text-muted-foreground'
              aria-hidden='true'
            >
              <span>Session name</span>
              <span>Members</span>
              <span>Last activity</span>
              <span />
            </div>
            <ul className='divide-y divide-border'>
              {visibleSessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </ul>
            <div className='flex items-center justify-between border-t border-border px-5 py-3'>
              <p className='text-[13px] text-muted-foreground'>
                {visibleSessions.length} {visibleSessions.length === 1 ? 'session' : 'sessions'} shown
              </p>
              {hasMore && (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isFetchingNextPage}
                  onClick={showMore}
                  className='h-7 text-[13px] text-primary'
                >
                  {isFetchingNextPage ? (
                    <FiLoader className='animate-spin' aria-hidden='true' />
                  ) : (
                    <FiArrowDown aria-hidden='true' />
                  )}
                  {isFetchingNextPage ? 'Loading…' : 'Show More'}
                </Button>
              )}
            </div>
            {isFetchNextPageError && (
              <p role='alert' className='border-t border-border px-5 py-3 text-sm text-destructive'>
                Could not load more sessions. Select Show More to try again.
              </p>
            )}
          </>
        )}
      </Card>
    </section>
  );
};

export default SessionList;
