'use client';

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

import DocumentHeader from '@/components/Document/DocumentHeader';
import VersionDrawer from '@/components/Document/VersionDrawer';
import { formats, modules } from '@/helpers/quilConfig';
import { SessionContext } from '@/components/Session/SessionLayout';
import Modal from '@/ui/Modal';
import { AITool, IVersion } from '@/models/models';
import { useParams, useRouter } from 'next/navigation';
import useSnackbarStore from '@/store/useSnackbarStore';
import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';
import AiAsssistanceStepper from '@/components/AiAssistance/AiAssistanceStepper';
import TextSelectionOverlay from '@/components/Document/TextSelectionOverlay';
import { useUserStore } from '@/store/useUserStore';
import { useSessionStore } from '@/store/useSessionStore';

import {
  DeltaStatic,
  EmitterSource,
  Quill as QuillType,
} from 'react-quill-new';
import Delta from 'quill-delta';
import LargeLoader from '@/ui/LargeLoader';

type QuillUnprivilegedEditor = {
  getContents(): DeltaStatic;
  getHTML?(): string;
  getText?(index?: number, length?: number): string;
};

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <LargeLoader />,
});

function cleanDelta(delta: DeltaStatic): DeltaStatic {
  return new Delta(delta.ops.filter((op) => op.insert !== '\n'));
}

export default function DocumentPage() {
  const sessionContext = useContext(SessionContext);
  const {
    session,
    currentDocument,
    versions,
    createDocumentAiUsage,
    getDocument,
    getVersions,
    changeDocumentTitle,
    applyVersion,
    changeContentAndSaveDocument,
    isAiUsageFetching,
    setNewAiUsage,
    newAiUsage,
  } = sessionContext || {};

  const { setSnackbar } = useSnackbarStore();
  const { user: currentUser } = useUserStore();
  const { session: userSession } = useSessionStore();

  const [localContent, setLocalContent] = useState<string>('');
  const [quillDelta, setQuillDelta] = useState<DeltaStatic | null>(null);

  const [selectedVersion, setSelectedVersion] = useState<IVersion | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] =
    useState<boolean>(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [isTextSelectionActive, setIsTextSelectionActive] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [qlRect, setQlRect] = useState<DOMRect | null>(null);

  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('');

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { documentId: id } = useParams<{ documentId: string }>();
  const documentId: number = parseInt(id, 10);

  const userPermissions = userSession?.permissions;

  useEffect(() => {
    if (documentId) {
      getDocument?.(documentId);
      getVersions?.(documentId);
    }
  }, [documentId, getDocument, getVersions]);

  useEffect(() => {
    if (currentDocument) {
      setLocalContent(currentDocument.richContent);
      const tempQuill = new QuillType(document.createElement('div'));
      const delta = tempQuill.clipboard.convert({
        html: currentDocument.richContent,
      });
      setQuillDelta(delta);
    }
  }, [currentDocument]);

  useEffect(() => {
    if (newAiUsage && newAiUsage.user?.id === currentUser?.id) {
      setIsAiModalOpen(true);
      setCurrentStep(3);
      setIsTextSelectionActive(false);
    }
  }, [newAiUsage, currentUser?.id]);

  useEffect(() => {
    if (!isTextSelectionActive) return;

    const qlEditor = document.querySelector('.ql-editor') as HTMLElement;
    if (qlEditor) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      const timer = setTimeout(() => {
        setQlRect(qlEditor.getBoundingClientRect());
        qlEditor.style.position = 'relative';
        qlEditor.style.zIndex = '1001';
        document.body.style.overflow = 'hidden';
      }, 500);

      return () => {
        clearTimeout(timer);
        qlEditor.style.position = '';
        qlEditor.style.zIndex = '';
        document.body.style.overflow = '';
      };
    }
  }, [isTextSelectionActive]);

  useEffect(() => {
    if (!isTextSelectionActive) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection) {
        setSelectedText(selection.toString().trim());
      } else {
        setSelectedText('');
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isTextSelectionActive]);

  const handleSaveTitle = useCallback(
    (title: string) => {
      changeDocumentTitle?.(documentId, title);
    },
    [changeDocumentTitle, documentId],
  );

  const handleApplyVersion = useCallback(() => {
    if (selectedVersion) {
      applyVersion?.(documentId, selectedVersion.id);
      setPreviewContent('');
      setSelectedVersion(null);
      setIsVersionDrawerOpen(false);
    }
  }, [selectedVersion, applyVersion, documentId]);

  const handleSelectVersion = useCallback((version: IVersion) => {
    setSelectedVersion(version);
  }, []);

  const handleSetPreview = useCallback((version: IVersion) => {
    setPreviewContent(version.richContent);
  }, []);

  const handleCreateAiUsage = useCallback(
    (inputValue = '') => {
      const textToSend = selectedText || inputValue;
      if (!textToSend.trim()) {
        setSnackbar('Input cannot be empty', SnackbarStatusEnum.ERROR);
        return;
      }
      if (selectedTool?.requiresTargetLanguage && !targetLanguage) {
        setSnackbar(
          'Please specify a target language',
          SnackbarStatusEnum.ERROR,
        );
        return;
      }
      if (!selectedTool) {
        return;
      }

      createDocumentAiUsage?.({
        toolName: selectedTool.endpoint,
        text: textToSend,
        documentId,
        targetLanguage,
      });

      setSelectedText('');
    },
    [
      selectedText,
      selectedTool,
      documentId,
      targetLanguage,
      setSnackbar,
      createDocumentAiUsage,
    ],
  );

  const handleRestartStepper = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsAiModalOpen(true);
    setCurrentStep(1);
    setNewAiUsage?.(null);
  }, [setNewAiUsage]);

  const handleModalClose = useCallback(() => {
    setIsAiModalOpen(false);
    setNewAiUsage?.(null);
    document.body.style.overflowY = 'auto';
  }, [setNewAiUsage]);

  const handleActivateTextSelection = useCallback(() => {
    if (selectedTool?.requiresTargetLanguage && !targetLanguage) {
      setSnackbar('Please specify a target language', SnackbarStatusEnum.ERROR);
      return;
    }
    setIsAiModalOpen(false);
    document.body.style.overflowY = 'auto';
    setIsTextSelectionActive(true);
  }, [selectedTool, targetLanguage, setSnackbar]);

  const handleCancelTextSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setIsTextSelectionActive(false);
    setIsAiModalOpen(true);
    setSelectedText('');
  }, []);

  const handleContentChange = useCallback(
    (
      newContent: string,
      delta: DeltaStatic,
      source: EmitterSource,
      editor: QuillUnprivilegedEditor,
    ) => {
      if (previewContent || !changeContentAndSaveDocument || !currentDocument) {
        return;
      }

      const tempQuill = new QuillType(document.createElement('div'));
      const oldDelta = cleanDelta(
        tempQuill.clipboard.convert({ html: currentDocument.richContent }),
      );
      const newDelta = cleanDelta(editor.getContents());

      if (JSON.stringify(oldDelta) === JSON.stringify(newDelta)) {
        return;
      }

      setLocalContent(newContent);
      setQuillDelta(newDelta);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        changeContentAndSaveDocument(documentId, newContent);
      }, 700);
    },
    [previewContent, changeContentAndSaveDocument, currentDocument, documentId],
  );

  if (!currentDocument && session?.id) {
    return <LargeLoader />
  }

  if (!currentDocument) {
    return (
      <div className='flex items-center justify-center h-[80vh] bg-gray-100'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-mainDark mb-4'>
            Document not found
          </h1>
          <p className='text-gray-500 mb-6'>
            The document you are trying to access does not exist or has been
            deleted.
          </p>
          <button
            onClick={() =>
              router.replace('/session/' + sessionContext?.session?.id)
            }
            className='bg-mainDark text-white px-6 py-3 rounded hover:bg-mainDarkHover'
          >
            Return to Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center p-10 pt-0'>
      <DocumentHeader
        onTitleSave={handleSaveTitle}
        documentTitle={currentDocument.title}
        onOpenAiModal={handleModalOpen}
        onOpenVersionDrawer={() => setIsVersionDrawerOpen(true)}
        quillDelta={quillDelta}
      />

      <div className='w-[900px] h-[80vh] bg-white p-4 border border-gray-300 rounded mb-4'>
        <ReactQuill
          key={JSON.stringify(userSession)}
          theme='snow'
          modules={
            userPermissions?.includes(PermissionEnum.EDIT)
              ? modules
              : { toolbar: false }
          }
          formats={formats}
          value={previewContent || localContent}
          onChange={handleContentChange}
          className='h-full'
          readOnly={
            !userPermissions?.includes(PermissionEnum.EDIT) || !!previewContent
          }
        />
      </div>

      {isAiModalOpen && (
        <Modal
          isOpen={isAiModalOpen}
          onClose={handleModalClose}
          width='w-[80vw]'
          height='h-[80vh]'
        >
          <div className='flex justify-center items-center h-full w-full'>
            <AiAsssistanceStepper
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              handleActivateTextSelection={handleActivateTextSelection}
              isOnDocumentPage={true}
              setCurrentStep={setCurrentStep}
              currentStep={currentStep}
              onSubmit={handleCreateAiUsage}
              onRestart={handleRestartStepper}
              isLoading={Boolean(isAiUsageFetching)}
              result={
                newAiUsage ? newAiUsage.result : 'Error. No result to display'
              }
            />
          </div>
        </Modal>
      )}

      <VersionDrawer
        isOpen={isVersionDrawerOpen}
        versions={versions || []}
        previewContent={previewContent}
        selectedVersion={selectedVersion}
        handleSelectVersion={handleSelectVersion}
        handleApplyVersion={handleApplyVersion}
        handleSetPreview={handleSetPreview}
        handleClose={() => {
          setIsVersionDrawerOpen(false);
          setPreviewContent('');
          setSelectedVersion(null);
        }}
      />

      {isTextSelectionActive && qlRect && (
        <TextSelectionOverlay
          isLoading={Boolean(isAiUsageFetching)}
          qlRect={qlRect}
          hasSelectedText={!!selectedText.trim()}
          onCancel={handleCancelTextSelection}
          onSubmit={handleCreateAiUsage}
        />
      )}
    </div>
  );
}
