import { ReactNode } from 'react';

import { FiCheck, FiFileText, FiLayers, FiUsers, FiZap } from 'react-icons/fi';

import AppLogo from '@/components/common/AppLogo';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
}

export default function AuthLayout({
  title,
  description,
  children,
  eyebrow = 'Your workspace awaits',
}: AuthLayoutProps) {
  return (
    <main className='saas-shell grid min-h-dvh bg-white text-foreground lg:grid-cols-[0.95fr_1.05fr]'>
      <aside className='relative hidden flex-col justify-between overflow-hidden border-r border-blue-100 bg-accent/50 px-14 py-10 lg:flex'>
        <AppLogo variant='workspace' isLink={false} />
        <div className='relative mx-auto w-full max-w-[440px] py-14'>
          <p className='mb-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-primary'>
            Write. Refine. Collaborate.
          </p>
          <h2 className='text-[44px] font-semibold leading-[1.12] tracking-[-1.8px]'>
            Great ideas deserve
            <br />a better workspace.
          </h2>
          <p className='mt-5 max-w-[350px] text-base leading-7 text-muted-foreground'>
            Bring your documents, your team, and the power of AI together. Make every draft a step forward.
          </p>
          <div className='relative mt-10 rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_12px_40px_rgba(20,60,110,0.06)]'>
            <div className='mb-6 flex items-center gap-3 border-b border-border pb-4'>
              <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary'>
                <FiFileText size={18} aria-hidden='true' />
              </span>
              <div>
                <p className='text-sm font-semibold'>From first thought to final draft</p>
                <p className='mt-1 text-[13px] text-muted-foreground'>One place to move your work forward</p>
              </div>
            </div>
            <div className='space-y-4'>
              {[
                { icon: FiLayers, text: 'A clear home for every document' },
                { icon: FiUsers, text: 'A shared space for your team' },
                { icon: FiZap, text: 'AI tools for better writing' },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.text} className='flex items-center gap-3 text-sm'>
                    <Icon size={15} className='text-primary' aria-hidden='true' />
                    <span className='flex-1 text-muted-foreground'>{feature.text}</span>
                    <FiCheck size={13} className='text-primary/70' aria-hidden='true' />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className='text-sm text-muted-foreground'>A little more clarity. A lot more possibility.</p>
      </aside>
      <section className='flex min-w-0 flex-col justify-center px-8 py-12'>
        <div className='mx-auto w-full max-w-[400px]'>
          <div className='mb-10 lg:hidden'>
            <AppLogo variant='workspace' isLink={false} />
          </div>
          <p className='mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary'>{eyebrow}</p>
          <h1 className='text-[32px] font-semibold tracking-[-0.9px]'>{title}</h1>
          <p className='mb-8 mt-3 text-base leading-6 text-muted-foreground'>{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthDivider() {
  return (
    <div className='my-6 flex items-center gap-4' aria-hidden='true'>
      <span className='h-px flex-1 bg-border' />
      <span className='text-[13px] text-muted-foreground'>or continue with</span>
      <span className='h-px flex-1 bg-border' />
    </div>
  );
}
