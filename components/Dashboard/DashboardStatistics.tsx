'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { FiClock, FiFileText, FiFolderPlus, FiUsers, FiRefreshCw } from 'react-icons/fi';

import { queryKeys } from '@/lib/queryKeys';
import { StatisticsApi } from '@/services/StatisticsApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/store/useUserStore';

import DashboardActivityChart from './DashboardActivityChart';

const DashboardStatistics = () => {
  const userId = useUserStore((state) => state.user?.id);
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard(userId),
    queryFn: ({ signal }) => StatisticsApi.fetchDashboard(signal),
    enabled: !!userId,
    staleTime: 10_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const numberFormat = new Intl.NumberFormat('en-US');

  return (
    <section aria-labelledby='workspace-statistics-heading' aria-busy={isPending} className='min-w-0 space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 id='workspace-statistics-heading' className='text-xl font-semibold'>
            Your workspace statistics
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>Totals across the sessions you currently belong to.</p>
        </div>
        <Button
          type='button'
          variant='outline'
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label='Refresh workspace statistics'
          title='Refresh statistics'
          className='shrink-0 gap-2'
        >
          <FiRefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden='true' />
          Refresh
        </Button>
      </div>
      {error && !data ? (
        <Card role='alert' className='border-border p-4 shadow-card'>
          <p className='text-base font-medium'>Could not load statistics</p>
          <p className='mt-2 text-sm leading-6 text-muted-foreground'>
            Try refreshing. You can still open your sessions.
          </p>
        </Card>
      ) : !data ? (
        <div
          aria-label='Loading workspace statistics'
          className='grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5'
        >
          <div className='grid grid-cols-2 gap-4'>
            {[0, 1, 2, 3].map((item) => (
              <Card key={item} className='space-y-3 border-border p-5 shadow-card'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-20' />
              </Card>
            ))}
          </div>
          <Card className='space-y-4 border-border p-4 shadow-card'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-[260px] w-full' />
          </Card>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5'>
            <dl className='grid grid-cols-2 gap-4'>
              {[
                {
                  label: 'Time in sessions',
                  value: data.overview.totalTimeSpentLabel,
                  detail: 'Recorded time, saved when you leave a session.',
                  Icon: FiClock,
                },
                {
                  label: 'Shared documents',
                  value: numberFormat.format(data.overview.totalDocuments),
                  detail: 'Documents across all sessions you can access.',
                  Icon: FiFileText,
                },
                {
                  label: 'Sessions created',
                  value: numberFormat.format(data.overview.createdSessions),
                  detail: 'Sessions where you have Admin access.',
                  Icon: FiFolderPlus,
                },
                {
                  label: 'Sessions joined',
                  value: numberFormat.format(data.overview.joinedSessions),
                  detail: 'Sessions you joined by invitation.',
                  Icon: FiUsers,
                },
              ].map((stat) => {
                const { label, value, detail, Icon } = stat;

                return (
                  <Card key={label} className='min-w-0 border-border p-5 shadow-card'>
                    <dt className='flex items-center justify-between gap-3 text-sm leading-6 text-muted-foreground'>
                      <span>{label}</span>
                      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                        <Icon size={18} aria-hidden='true' />
                      </span>
                    </dt>
                    <dd className='mt-4 break-words text-[32px] font-semibold leading-tight tracking-tight'>{value}</dd>
                    <dd className='mt-4 text-sm leading-6 text-muted-foreground'>{detail}</dd>
                  </Card>
                );
              })}
            </dl>
            <DashboardActivityChart activity={data.activity} />
          </div>
          {error && (
            <p role='status' className='text-sm leading-6 text-muted-foreground'>
              Could not refresh statistics. Showing the last loaded data.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default DashboardStatistics;
