'use client';

import React, { memo, useContext, useEffect } from 'react';
import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiZap } from 'react-icons/fi';

import VersionDrawer from '@/components/Document/VersionDrawer';
import DocumentHeader from '@/components/Document/DocumentHeader';
import DocumentHelp from '@/components/Document/DocumentHelp';
import TextSelectionOverlay from '@/components/Document/TextSelectionOverlay';
import AiAsssistanceStepper from '@/components/AiAssistance/AiAssistanceStepper';
import DocumentLoading from '@/components/Document/DocumentLoading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DocNotFound from '@/components/Document/DocNotFound';
import useDocumentPage from '@/hooks/document/useDocumentPage';
import { formats, modules } from '@/helpers/quilConfig';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

const ReactQuill = memo(
  dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <DocumentLoading editorOnly />,
  }),
);

const readOnlyModules = { toolbar: false };

export default function DocumentPage() {
  const { documentId: id } = useParams<{ documentId: string }>();

  const documentId = /^\d+$/.test(id) ? Number(id) : NaN;

  const data = useDocumentPage(documentId);
  const { setSnackbar } = useSnackbarStore();
  const sessionContext = useContext(SessionContext);
  const setDocumentBreadcrumb = sessionContext?.setDocumentBreadcrumb;
  const currentDocumentId = data.currentDocument?.id;
  const currentDocumentTitle = data.currentDocument?.title;

  useEffect(() => {
    if (currentDocumentId !== undefined && currentDocumentTitle !== undefined) {
      setDocumentBreadcrumb?.({ id: currentDocumentId, title: currentDocumentTitle });
    }
  }, [currentDocumentId, currentDocumentTitle, setDocumentBreadcrumb]);

  if (data.isLoadingPage) return <DocumentLoading />;

  if (!data.currentDocument) return <DocNotFound />;

  const handlePasteInDocument = () => {
    if (data.ai.isLoading || data.ai.currentStep !== 3 || !data.appendText(data.ai.result)) return;

    data.ai.close();
    setSnackbar('AI text added to the end of your document.', SnackbarStatusEnum.SUCCESS);
  };

  return (
    <div className='mx-auto max-w-[1440px] space-y-8 px-10'>
      <DocumentHeader
        onTitleSave={data.handleSaveTitle}
        documentTitle={data.currentDocument.title}
        onOpenAiModal={data.ai.open}
        onOpenVersionDrawer={data.versionDrawer.open}
        quillDelta={data.quillDelta}
        lastUpdated={data.currentDocument.lastUpdated}
        versionCount={data.versions.length}
      />

      <section className='mx-auto max-w-[960px]' aria-label='Document editor'>
        <div className='mb-2 flex justify-start'>
          <DocumentHelp />
        </div>
        {data.previewContent && (
          <div
            className='mb-4 flex items-center justify-between gap-5 rounded-xl border border-blue-100 bg-accent px-5 py-3'
            role='status'
          >
            <div>
              <p className='text-sm font-semibold text-primary'>You are previewing a saved version</p>
              <p className='mt-1 text-sm text-muted-foreground'>Return to the current document to continue editing.</p>
            </div>
            <Button variant='outline' size='sm' onClick={data.versionDrawer.close} className='shrink-0 gap-2 text-sm'>
              <FiArrowLeft size={13} aria-hidden='true' />
              Back to current
            </Button>
          </div>
        )}
        <div className='rounded-xl border border-border bg-white shadow-[0_4px_24px_rgba(20,42,75,0.04)]'>
          <ReactQuill
            key={data.currentDocument.id}
            theme='snow'
            modules={data.isReadOnly ? readOnlyModules : modules}
            formats={formats}
            value={data.previewContent || data.localContent}
            onChange={data.handleEditorChange}
            className='document-editor whitespace-pre-wrap'
            readOnly={data.isReadOnly}
            placeholder='Start writing. Your next great idea begins here…'
          />
          <div className='flex items-center justify-between gap-4 rounded-b-xl border-t border-border bg-muted/40 px-6 py-3 text-[13px] text-muted-foreground'>
            <span>
              {data.previewContent
                ? 'Saved version · read only'
                : data.isReadOnly
                  ? 'This document is shared with you for viewing.'
                  : 'Changes save automatically as you write.'}
            </span>
            <span>AI Editor</span>
          </div>
        </div>
      </section>

      <VersionDrawer
        isOpen={data.versionDrawer.isOpen}
        versions={data.versions || []}
        selectedVersion={data.versionDrawer.selectedVersion}
        handleSelectVersion={data.versionDrawer.handleSelectVersion}
        handleApplyVersion={data.versionDrawer.handleApplyVersion}
        handleSetPreview={data.versionDrawer.handleSetPreview}
        handleClose={data.versionDrawer.close}
      />

      {data.overlay.isActive && data.overlay.qlRect && (
        <TextSelectionOverlay
          isLoading={data.ai.isLoading}
          qlRect={data.overlay.qlRect}
          hasSelectedText={!!data.overlay.selectedText.trim()}
          onCancel={data.overlay.handleCancel}
          onSubmit={data.ai.handleCreateUsage}
        />
      )}

      {data.ai.isOpen && (
        <Dialog
          open={data.ai.isOpen}
          onOpenChange={(open) => {
            if (!open) data.ai.close();
          }}
        >
          <DialogContent
            className='flex h-[82dvh] max-w-[1180px] flex-col gap-0 overflow-hidden p-0'
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader className='shrink-0 border-b border-border px-6 py-4 pr-14'>
              <div className='flex items-center gap-3.5'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-accent text-primary'>
                  <FiZap size={19} aria-hidden='true' />
                </span>
                <div>
                  <DialogTitle className='text-xl'>AI Assistance</DialogTitle>
                  <DialogDescription className='mt-1.5 text-sm'>
                    Refine your writing with a tool, or select a passage directly from your document.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className='min-h-0 flex-1 bg-muted/50 p-5'>
              <AiAsssistanceStepper
                flow={data.ai.flow}
                handleActivateTextSelection={data.ai.handleActivateSelection}
                isOnDocumentPage
                onSubmit={data.ai.handleCreateUsage}
                onRestart={data.ai.reset}
                isLoading={data.ai.isLoading}
                result={data.ai.result}
                onPasteInDocument={handlePasteInDocument}
                pasteDisabled={data.isReadOnly || data.ai.isLoading}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
