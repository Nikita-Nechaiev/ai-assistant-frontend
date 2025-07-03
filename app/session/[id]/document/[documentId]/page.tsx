'use client';

import React from 'react';
import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import VersionDrawer from '@/components/Document/VersionDrawer';
import DocumentHeader from '@/components/Document/DocumentHeader';
import TextSelectionOverlay from '@/components/Document/TextSelectionOverlay';
import AiAsssistanceStepper from '@/components/AiAssistance/AiAssistanceStepper';
import Modal from '@/ui/Modal';
import LargeLoader from '@/ui/LargeLoader';
import DocNotFound from '@/components/Document/DocNotFound';
import useDocumentPage from '@/hooks/document/useDocumentPage';
import { formats, modules } from '@/helpers/quilConfig';
import { useSessionStore } from '@/store/useSessionStore';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <LargeLoader />,
});

export default function DocumentPage() {
  const { documentId: id } = useParams<{ documentId: string }>();

  const { session: userSession } = useSessionStore();

  const documentId = parseInt(id, 10);

  const data = useDocumentPage(documentId);

  if (data.isLoadingPage) return <LargeLoader />;

  if (!data.currentDocument) return <DocNotFound id={documentId} />;

  return (
    <div className='flex flex-col items-center p-10 pt-0'>
      <DocumentHeader
        onTitleSave={data.handleSaveTitle}
        documentTitle={data.currentDocument.title}
        onOpenAiModal={data.ai.open}
        onOpenVersionDrawer={data.versionDrawer.open}
        quillDelta={data.quillDelta}
      />

      <div className='w-[900px] h-[80vh] bg-white p-4 border border-gray-300 rounded mb-4'>
        <ReactQuill
          key={data.currentDocument.id + JSON.stringify(userSession)}
          theme='snow'
          modules={data.isReadOnly ? { toolbar: false } : modules}
          formats={formats}
          value={data.previewContent || data.localContent}
          onChange={data.handleEditorChange}
          className='h-full whitespace-pre-wrap'
          readOnly={data.isReadOnly}
        />
      </div>

      <VersionDrawer
        isOpen={data.versionDrawer.isOpen}
        versions={data.versions || []}
        previewContent={data.previewContent}
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
        <Modal isOpen={data.ai.isOpen} onClose={data.ai.close} width='w-[80vw]'>
          <div className='flex justify-center items-center h-[70vh] w-full'>
            <AiAsssistanceStepper
              selectedTool={data.ai.selectedTool}
              setSelectedTool={data.ai.selectTool}
              targetLanguage={data.ai.targetLanguage}
              setTargetLanguage={data.ai.setTargetLanguage}
              handleActivateTextSelection={data.ai.handleActivateSelection}
              isOnDocumentPage
              setCurrentStep={data.ai.setCurrentStep}
              currentStep={data.ai.currentStep}
              onSubmit={data.ai.handleCreateUsage}
              onRestart={data.ai.reset}
              isLoading={data.ai.isLoading}
              result={data.ai.result}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
