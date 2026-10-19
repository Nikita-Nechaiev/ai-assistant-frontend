'use client';

import React, { useMemo, useState } from 'react';

import { Socket } from 'socket.io-client';
import { FiPlus, FiSearch, FiFileText, FiFolder, FiX, FiUsers } from 'react-icons/fi';

import WorkspaceModal from '@/components/common/WorkspaceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IDocument } from '@/models/models';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/components/common/RequirePermission';
import { useSessionStore } from '@/store/useSessionStore';
import { useDocumentListSocket } from '@/hooks/sockets/useDocumentListSocket';

import DocumentItem from './DocumentItem';

interface DocumentListProps {
  sessionId: number;
  socket: Socket | null;
}

const DocumentList: React.FC<DocumentListProps> = ({ sessionId, socket }) => {
  const { documents, createDocument, changeDocumentTitle } = useDocumentListSocket({ sessionId, socket });
  const { session } = useSessionStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const filteredDocuments = useMemo(
    () => documents.filter((document) => document.title.toLowerCase().includes(search.trim().toLowerCase())),
    [documents, search],
  );
  const isReadOnly = session?.permissions && !session.permissions.includes(PermissionEnum.EDIT);
  const closeModal = () => {
    setModalOpen(false);
    setTitleInput('');
    setEditingId(null);
  };
  const openCreate = () => {
    setTitleInput('');
    setEditingId(null);
    setModalOpen(true);
  };
  const openEdit = (document: IDocument) => {
    setTitleInput(document.title);
    setEditingId(document.id);
    setModalOpen(true);
  };
  const handleSubmit = () => {
    const trimmed = titleInput.trim();

    if (!trimmed) return;

    if (editingId) changeDocumentTitle(editingId, trimmed);
    else createDocument(trimmed);

    closeModal();
  };

  return (
    <section className='mx-auto max-w-[1380px] space-y-7 px-10'>
      <div className='flex items-center justify-between gap-6 rounded-xl border border-blue-100 bg-gradient-to-r from-accent to-white px-7 py-5'>
        <div className='flex items-center gap-4'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-primary'>
            <FiUsers size={21} aria-hidden='true' />
          </span>
          <div>
            <h2 className='text-base font-semibold'>Good work is better together.</h2>
            <p className='mt-1.5 text-sm leading-5 text-muted-foreground'>
              Open a document to write, refine with AI, and collaborate in real time.
            </p>
          </div>
        </div>
        <Badge
          variant='outline'
          className='shrink-0 gap-2 border-blue-100 bg-white px-3 py-1.5 text-[13px] font-medium text-primary'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-primary' />
          {isReadOnly ? 'View-only access' : 'Collaborative workspace'}
        </Badge>
      </div>
      <div className='flex items-end justify-between gap-6'>
        <div>
          <h1 className='text-[32px] font-semibold tracking-[-0.8px]'>Session documents</h1>
          <p className='mt-2 text-base text-muted-foreground'>
            A space for your ideas. A place to bring them together.
          </p>
        </div>
        <RequirePermission permission={PermissionEnum.EDIT}>
          <Button onClick={openCreate} className='h-10 gap-2 text-sm shadow-blue'>
            <FiPlus aria-hidden='true' />
            New document
          </Button>
        </RequirePermission>
      </div>
      <div>
        <div className='mb-5 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <FiFolder size={17} className='text-primary' aria-hidden='true' />
            <h2 className='text-xl font-semibold'>All documents</h2>
            <span className='rounded-md bg-secondary px-2 py-0.5 text-[13px] font-medium text-muted-foreground'>
              {documents.length}
            </span>
          </div>
          <div className='relative w-[260px]'>
            <FiSearch
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              aria-hidden='true'
            />
            <Input
              aria-label='Search documents'
              placeholder='Search documents…'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className='h-9 border-border bg-white pl-9 pr-8 text-sm shadow-none'
            />
            {search && (
              <button
                type='button'
                aria-label='Clear document search'
                onClick={() => setSearch('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground'
              >
                <FiX size={12} aria-hidden='true' />
              </button>
            )}
          </div>
        </div>
        {filteredDocuments.length ? (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5'>
            {filteredDocuments.map((document) => (
              <DocumentItem
                key={document.id}
                document={document}
                sessionId={sessionId}
                onEditTitle={() => openEdit(document)}
              />
            ))}
          </div>
        ) : (
          <Card className='flex min-h-[320px] flex-col items-center justify-center border-dashed border-border px-6 py-12 text-center shadow-none'>
            <span className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-accent/60 text-primary'>
              <FiFileText size={26} aria-hidden='true' />
            </span>
            <h3 className='text-base font-semibold'>
              {search.trim() ? 'No matching documents' : 'Your next idea starts here.'}
            </h3>
            <p className='mt-2 max-w-[350px] text-sm leading-6 text-muted-foreground'>
              {search.trim()
                ? 'Try another title, or clear the search to see all documents.'
                : isReadOnly
                  ? 'Documents shared with this session will appear here. Ask an editor to add the first one.'
                  : 'Every great project begins with a blank page. Create your first document and make it your own.'}
            </p>
            {search.trim() ? (
              <Button variant='outline' size='sm' onClick={() => setSearch('')} className='mt-5 text-sm'>
                Clear search
              </Button>
            ) : (
              <RequirePermission permission={PermissionEnum.EDIT}>
                <Button size='sm' onClick={openCreate} className='mt-5 text-sm'>
                  <FiPlus aria-hidden='true' />
                  Create a document
                </Button>
              </RequirePermission>
            )}
          </Card>
        )}
      </div>
      <RequirePermission permission={PermissionEnum.EDIT}>
        <WorkspaceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCancel={closeModal}
          onSubmit={handleSubmit}
          submitDisabled={!titleInput.trim()}
          title={editingId ? 'Rename document' : 'Create a document'}
          description={
            editingId
              ? 'A clear title makes your work easier to find.'
              : 'Start with a name. The rest is a blank page, ready for your ideas.'
          }
          icon={<FiFileText size={21} aria-hidden='true' />}
          submitText={editingId ? 'Save changes' : 'Create document'}
          className='max-w-[480px]'
        >
          <label htmlFor='documentTitle' className='mb-2 block text-sm font-medium'>
            Document title
          </label>
          <Input
            id='documentTitle'
            placeholder='e.g. Project proposal'
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            required
            autoComplete='off'
          />
        </WorkspaceModal>
      </RequirePermission>
    </section>
  );
};

export default DocumentList;
