'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { FiArrowRight, FiBookOpen, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

import { categories, questions } from '@/components/FAQ/faqContent';
import MainLayout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function FAQPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          (category === 'all' || item.category === category) &&
          `${item.question} ${item.answer}`.toLowerCase().includes(query),
      ),
    [category, query],
  );

  return (
    <MainLayout title='Help & resources'>
      <div className='mx-auto max-w-[1320px] space-y-7 pb-8'>
        <div>
          <p className='mb-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
            Help center
          </p>
          <h1 className='text-[32px] font-semibold tracking-[-0.8px]'>Help & resources</h1>
          <p className='mt-2 text-base text-muted-foreground'>
            Learn how to manage sessions, edit documents, and use AI tools.
          </p>
        </div>
        <Card className='flex flex-col items-start justify-between gap-6 border-blue-100 bg-gradient-to-r from-accent to-white px-7 py-7 shadow-none lg:flex-row lg:items-center'>
          <div className='flex items-center gap-4'>
            <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-primary'>
              <FiBookOpen size={23} aria-hidden='true' />
            </span>
            <div>
              <h2 className='text-xl font-semibold'>Search the help topics</h2>
              <p className='mt-1.5 text-base leading-6 text-muted-foreground'>
                Filter by topic or search for a feature or action.
              </p>
            </div>
          </div>
          <div className='relative w-full shrink-0 lg:w-[320px]'>
            <FiSearch
              className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'
              size={15}
              aria-hidden='true'
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search questions…'
              aria-label='Search help questions'
              className='h-11 bg-white pl-10 pr-10 text-base shadow-none'
            />
            {search && (
              <Button
                variant='ghost'
                size='icon'
                aria-label='Clear search'
                className='absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground'
                onClick={() => setSearch('')}
              >
                <FiX aria-hidden='true' />
              </Button>
            )}
          </div>
        </Card>
        <div className='grid grid-cols-1 items-start gap-7 xl:grid-cols-[240px_minmax(0,1fr)]'>
          <aside>
            <p className='mb-3 px-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Browse topics
            </p>
            <nav aria-label='Help topics' className='grid gap-1 sm:grid-cols-2 xl:grid-cols-1'>
              {categories.map((topic) => {
                const { id, label, icon: Icon } = topic;

                return (
                  <button
                    key={id}
                    type='button'
                    onClick={() => setCategory(id)}
                    aria-pressed={category === id}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      category === id
                        ? 'bg-accent text-primary'
                        : 'text-muted-foreground hover:bg-white hover:text-foreground',
                    )}
                  >
                    <Icon size={18} className='shrink-0' aria-hidden='true' />
                    {label}
                  </button>
                );
              })}
            </nav>
          </aside>
          <section aria-label='Frequently asked questions'>
            <div className='mb-4 flex items-center justify-between gap-4'>
              <h2 className='text-xl font-semibold'>
                {query
                  ? 'Search results'
                  : category === 'all'
                    ? 'Frequently asked questions'
                    : categories.find((item) => item.id === category)?.label}
              </h2>
              <span role='status' className='text-sm text-muted-foreground'>
                {filteredQuestions.length} {filteredQuestions.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>
            {filteredQuestions.length ? (
              <div className='overflow-hidden rounded-xl border border-border bg-white shadow-card'>
                {filteredQuestions.map((item) => (
                  <details
                    key={item.question}
                    open={query ? true : undefined}
                    className='group border-b border-border last:border-b-0'
                  >
                    <summary className='flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 text-lg font-medium leading-7 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden'>
                      {item.question}
                      <FiChevronDown
                        className='shrink-0 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-primary'
                        size={15}
                        aria-hidden='true'
                      />
                    </summary>
                    <p className='max-w-[72ch] px-6 pb-6 pr-8 text-base leading-7 text-muted-foreground'>
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            ) : (
              <Card className='border-dashed px-8 py-14 text-center shadow-none'>
                <FiSearch className='mx-auto mb-4 text-primary' size={25} aria-hidden='true' />
                <h3 className='text-base font-semibold'>No answers found</h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Try a different search or browse all topics.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-5 text-sm'
                  onClick={() => {
                    setSearch('');
                    setCategory('all');
                  }}
                >
                  Show all questions
                </Button>
              </Card>
            )}
            <div className='mt-5 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-white px-6 py-5'>
              <div>
                <p className='text-base font-semibold'>Manage your sessions</p>
                <p className='mt-1.5 text-base leading-7 text-muted-foreground'>
                  Open Dashboard to create a session or return to an existing one.
                </p>
              </div>
              <Button variant='outline' asChild size='sm' className='shrink-0 text-sm shadow-none'>
                <Link href='/dashboard'>
                  Open dashboard
                  <FiArrowRight aria-hidden='true' />
                </Link>
              </Button>
            </div>
            <details className='group mt-6 rounded-xl border border-border bg-white'>
              <summary className='flex cursor-pointer list-none items-center justify-between px-6 py-4 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden'>
                About this project
                <FiChevronDown
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                  aria-hidden='true'
                />
              </summary>
              <div className='max-w-[72ch] space-y-3 px-6 pb-6 text-base leading-7 text-muted-foreground'>
                <p>AI Editor is a personal portfolio project for shared document editing and AI text tools.</p>
                <p>
                  The frontend uses Next.js, React, and TypeScript. The backend uses NestJS, PostgreSQL, and WebSockets.
                </p>
              </div>
            </details>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
