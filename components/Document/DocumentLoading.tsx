import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentLoading({ editorOnly = false }: { editorOnly?: boolean }) {
  const paper = (
    <div className='min-h-[480px] bg-white px-16 py-12'>
      <Skeleton className='mb-10 h-8 w-2/5' />
      <div className='space-y-4'>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className={`h-3 ${index === 3 || index === 7 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );

  if (editorOnly)
    return (
      <div aria-label='Loading editor' role='status'>
        {paper}
      </div>
    );

  return (
    <div className='mx-auto max-w-[1440px] space-y-8 px-10' role='status' aria-label='Loading document'>
      <div className='flex items-center justify-between gap-8'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-12 w-12 rounded-xl' />
          <div className='space-y-3'>
            <Skeleton className='h-3 w-28' />
            <Skeleton className='h-7 w-72' />
          </div>
        </div>
        <Skeleton className='h-10 w-80' />
      </div>
      <div className='mx-auto max-w-[960px] overflow-hidden rounded-xl border border-border bg-white shadow-card'>
        <div className='flex h-14 items-center gap-3 border-b border-border px-6'>
          <Skeleton className='h-7 w-28' />
          <Skeleton className='h-7 w-48' />
        </div>
        {paper}
      </div>
    </div>
  );
}
