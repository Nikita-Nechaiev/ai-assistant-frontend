'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiGrid, FiSearch } from 'react-icons/fi';

import AppState from '@/components/common/AppState';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <AppState
      eyebrow='Error 404'
      title='This page is out of reach.'
      description='The link may have changed, or the page may no longer exist. Head back to your workspace to keep going.'
      icon={<FiSearch size={28} aria-hidden='true' />}
    >
      <Button variant='outline' onClick={() => router.back()} className='h-10 text-sm'>
        <FiArrowLeft aria-hidden='true' />
        Go back
      </Button>
      <Button asChild className='h-10 text-sm shadow-blue'>
        <Link href='/dashboard'>
          <FiGrid aria-hidden='true' />
          Open dashboard
        </Link>
      </Button>
    </AppState>
  );
}
