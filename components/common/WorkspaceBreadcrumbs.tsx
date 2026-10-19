import Link from 'next/link';
import { FiChevronRight, FiGrid } from 'react-icons/fi';

import { cn } from '@/lib/utils';

export interface WorkspaceBreadcrumbItem {
  label: string;
  href: string;
}

export default function WorkspaceBreadcrumbs({ items }: { items: WorkspaceBreadcrumbItem[] }) {
  return (
    <nav aria-label='Breadcrumb' className='min-w-0'>
      <ol className='flex min-w-0 items-center gap-2.5 text-base font-medium'>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={item.href} className={cn('flex min-w-0 items-center gap-2.5', index === 0 && 'shrink-0')}>
              {index > 0 && <FiChevronRight size={15} className='shrink-0 text-slate-300' aria-hidden='true' />}
              {isCurrent ? (
                <span
                  aria-current='page'
                  title={item.label}
                  className='inline-flex min-w-0 items-center gap-2 font-semibold text-foreground'
                >
                  {index === 0 && <FiGrid size={17} className='shrink-0' aria-hidden='true' />}
                  <span className='max-w-[min(30vw,420px)] truncate'>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  title={item.label}
                  className='inline-flex min-w-0 items-center gap-2 rounded-sm text-muted-foreground decoration-1 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4'
                >
                  {index === 0 && <FiGrid size={17} className='shrink-0' aria-hidden='true' />}
                  <span className='max-w-[min(30vw,420px)] truncate'>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
