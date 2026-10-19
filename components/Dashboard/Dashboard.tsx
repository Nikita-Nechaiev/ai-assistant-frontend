'use client';

import React, { useRef, useState } from 'react';

import Link from 'next/link';
import { FiPlus, FiArrowRight, FiCalendar } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';

import DashboardStatistics from './DashboardStatistics';
import SessionGuideCard from './SessionGuideCard';
import SessionList from './SessionList';
import CreateSessionDialog from './CreateSessionDialog';

const Dashboard = () => {
  const { user } = useUserStore();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const [today] = useState(() =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()),
  );
  const openCreate = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setCreateOpen(true);
  };

  return (
    <div className='mx-auto max-w-[1440px] pb-4'>
      <header className='mb-9 flex items-center justify-between gap-8 rounded-xl border border-border bg-card px-6 py-5 shadow-card'>
        <div className='min-w-0 flex-1'>
          <h1 className='break-words text-[44px] font-semibold leading-[1.15] tracking-[-1.4px]'>
            Welcome back
            {firstName && (
              <>
                , <span className='text-primary'>{firstName}</span>
              </>
            )}
            .
          </h1>
          <div className='mt-3 flex items-center gap-2.5 text-base text-muted-foreground'>
            <FiCalendar size={20} className='shrink-0 text-primary' aria-hidden='true' />
            <time>{today}</time>
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-5'>
          <Link
            href='/ai-assistance'
            className='inline-flex items-center gap-2 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            AI Assistance
            <FiArrowRight size={16} aria-hidden='true' />
          </Link>
          <Button onClick={openCreate} className='h-11 gap-2 px-5 text-sm'>
            <FiPlus aria-hidden='true' />
            Create a session
          </Button>
        </div>
      </header>

      <div className='mb-7'>
        <DashboardStatistics />
      </div>
      <div className='grid grid-cols-[minmax(0,1fr)_380px] items-start gap-7'>
        <SessionList onCreateSession={openCreate} />
        <div className='min-w-0 space-y-6'>
          <SessionGuideCard />
        </div>
      </div>
      <CreateSessionDialog open={isCreateOpen} onOpenChange={setCreateOpen} triggerRef={triggerRef} />
    </div>
  );
};

export default Dashboard;
