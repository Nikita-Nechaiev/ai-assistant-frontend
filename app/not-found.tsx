'use client';

import AppLogo from '@/components/common/AppLogo';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-mainLight text-mainDark text-center'>
      <AppLogo isLink={false} />

      <h1 className='text-4xl font-bold'>Page Not Found (404)</h1>
      <p className='text-lg text-mainGray mt-2'>
        The page you are looking for doesn't exist.
      </p>

      <button
        className='mt-6 text-lg text-blue-600 underline hover:text-blue-800 transition'
        onClick={() => router.back()}
      >
        Go back
      </button>
    </div>
  );
}
