'use client';

import React from 'react';

import { FiInfo } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const instructions = [
  {
    title: 'Write and format',
    description:
      'Click inside the document to write. Use the toolbar for headings, lists, alignment, and text styles. Editing requires edit access to the session.',
  },
  {
    title: 'Save and collaborate',
    description:
      'Your changes save automatically as you write. Collaborators with access to the session can open the same document and work together in real time.',
  },
  {
    title: 'Use AI Assistance',
    description:
      'With edit access, open AI Assistance and choose a tool. Enter your text or use Select from the document to highlight a passage. Review the result, then click Paste in document to add it as new paragraphs at the end of your current document. Your existing text stays in place and the changes save automatically. You can also copy the result to use it elsewhere.',
  },
  {
    title: 'Explore version history',
    description:
      'With edit access, open Version history to preview saved drafts. Choose an earlier version and click Apply version to restore it, or Back to current to keep working on your latest draft.',
  },
  {
    title: 'Export your document',
    description: 'Click Export to PDF to download a copy of your document.',
  },
];

export default function DocumentHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          aria-label='Show info about working with your document'
          title='Show info'
          className='h-8 gap-2 px-2 text-sm text-primary [&_svg]:size-5'
        >
          <FiInfo aria-hidden='true' />
          Show info
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[560px] gap-0 p-0'>
        <DialogHeader className='flex-row items-center gap-3 space-y-0 border-b border-border px-6 py-5 pr-12 text-left'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
            <FiInfo size={21} aria-hidden='true' />
          </span>
          <div className='min-w-0 flex-1 space-y-1'>
            <DialogTitle className='leading-6'>Working with your document</DialogTitle>
            <DialogDescription className='text-sm leading-5'>
              A quick guide to writing, collaborating, and refining your draft.
            </DialogDescription>
          </div>
        </DialogHeader>
        <ol className='space-y-4 px-6 py-5'>
          {instructions.map(({ title, description }, index) => (
            <li key={title} className='flex items-center gap-3'>
              <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary'>
                {index + 1}
              </span>
              <div>
                <h3 className='text-base font-semibold'>{title}</h3>
                <p className='mt-1 text-sm leading-5 text-muted-foreground'>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <DialogFooter className='border-t border-border bg-muted/50 px-6 py-4'>
          <DialogClose asChild>
            <Button type='button'>Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
