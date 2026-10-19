import { ReactNode } from 'react';

import AppLogo from '@/components/common/AppLogo';

interface AppStateProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function AppState({ eyebrow, title, description, icon, children }: AppStateProps) {
  return (
    <main className='saas-shell flex min-h-dvh flex-col bg-muted text-foreground'>
      <div className='border-b border-border bg-white px-10 py-6'>
        <AppLogo variant='workspace' isLink={false} />
      </div>
      <div className='flex flex-1 items-center justify-center px-6 py-16'>
        <section className='w-full max-w-[540px] rounded-2xl border border-border bg-white px-12 py-12 text-center shadow-card'>
          <span className='mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-accent text-primary'>
            {icon}
          </span>
          <p className='mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary'>{eyebrow}</p>
          <h1 className='text-[28px] font-semibold leading-tight tracking-[-0.8px]'>{title}</h1>
          <p className='mx-auto mt-4 max-w-[350px] text-base leading-7 text-muted-foreground'>{description}</p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>{children}</div>
        </section>
      </div>
    </main>
  );
}
