'use client';

import React from 'react';

import Link from 'next/link';
import { FiArrowRight, FiZap, FiRefreshCw } from 'react-icons/fi';

import useAiStatistics from '@/hooks/ai/useAiStatistics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AiUsageTable from '@/components/AiAssistance/AiUsageTable';
import AIStatistics from '@/components/AiAssistance/AIStatistics';
import MainLayout from '@/components/Layout/Layout';
import { aiToolList } from '@/helpers/aiToolsList';

export default function AiAssistancePage() {
  const { data, isLoading, error, refetch } = useAiStatistics();

  return (
    <MainLayout title='AI Assistance'>
      <div className='mx-auto max-w-[1440px] space-y-7 pb-4'>
        <div>
          <p className='mb-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
            Your creative companion
          </p>
          <h1 className='text-[32px] font-semibold tracking-[-0.8px]'>AI Assistance</h1>
          <p className='mt-2 text-base text-muted-foreground'>
            Thoughtful tools for clearer writing and brighter ideas.
          </p>
        </div>
        <section
          aria-labelledby='ai-introduction'
          className='relative flex items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-[#153f7b] to-[#2364b7] px-8 text-white'
        >
          <div className='py-7'>
            <Badge className='mb-4 gap-1.5 border border-white/20 bg-white/10 px-2.5 py-1 text-[13px] font-medium text-white shadow-none hover:bg-white/10'>
              <FiZap size={11} aria-hidden='true' />
              {aiToolList.length} tools. Your own voice.
            </Badge>
            <h2 id='ai-introduction' className='text-[30px] font-semibold leading-[1.3] tracking-[-0.6px]'>
              Find the right words.
              <br />
              Make them yours.
            </h2>
            <p className='mt-3 max-w-[470px] text-sm leading-6 text-blue-100'>
              Polish a draft, simplify a long read, or start something new.
              <br />A little assistance, wherever your ideas take you.
            </p>
            <Button
              asChild
              className='mt-5 h-9 bg-white text-sm font-semibold text-[#174882] shadow-none hover:bg-blue-50'
            >
              <Link href='/ai-assistance/stepper'>
                Start a new request
                <FiArrowRight aria-hidden='true' />
              </Link>
            </Button>
          </div>
          <div
            aria-hidden='true'
            className='relative mr-7 flex h-[220px] w-[270px] shrink-0 items-center justify-center'
          >
            <div className='absolute h-[190px] w-[190px] rounded-full border border-white/10' />
            <div className='absolute h-[230px] w-[230px] rounded-full border border-white/5' />
            <div className='absolute h-[145px] w-[145px] -rotate-12 rounded-xl border border-white/20 bg-white/5' />
            <div className='relative w-[145px] rotate-6 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 px-6 py-5 shadow-lg'>
              <span className='font-serif text-[55px] leading-tight tracking-tighter text-[#285c9e]'>Aa</span>
              <div className='mt-3 h-1.5 w-full rounded bg-blue-200/70' />
              <div className='mt-2 h-1.5 w-4/5 rounded bg-blue-100' />
              <div className='mt-2 h-1.5 w-3/5 rounded bg-blue-100' />
            </div>
            <span className='absolute bottom-7 left-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white text-primary shadow-sm'>
              <FiZap size={20} />
            </span>
          </div>
        </section>
        {isLoading ? (
          <section aria-label='Loading AI statistics' aria-busy='true' className='grid grid-cols-3 gap-5'>
            {[0, 1, 2].map((item) => (
              <Card key={item} className='space-y-4 border-border p-5 shadow-card'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-3 w-4/5' />
              </Card>
            ))}
          </section>
        ) : error ? (
          <Card role='alert' className='flex items-center justify-between border-border px-5 py-5 shadow-card'>
            <div>
              <p className='text-base font-medium'>Statistics are taking a little longer.</p>
              <p className='mt-1 text-sm text-muted-foreground'>You can still start a new request.</p>
            </div>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <FiRefreshCw aria-hidden='true' />
              Try again
            </Button>
          </Card>
        ) : data ? (
          <AIStatistics
            firstRequestDate={data.firstAiUsage ? new Date(data.firstAiUsage) : null}
            totalRequests={data.totalUsageNumber}
            totalWordCount={data.totalWordCount}
            mostUsedTool={data.mostFrequentTool}
          />
        ) : null}
        <AiUsageTable />
      </div>
    </MainLayout>
  );
}
