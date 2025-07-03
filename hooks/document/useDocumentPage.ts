import { PermissionEnum } from '@/models/enums';
import { useSessionStore } from '@/store/useSessionStore';

import useDocumentData from './useDocumentData';
import useVersionDrawer from './useVersionDrawer';
import useEditorState from './useEditorState';
import useDocumentAI from './useDocumentAI';

export default function useDocumentPage(documentId: number) {
  const { currentDocument, versions, newAiUsage, isFetchingAI, actions, isLoadingPage } = useDocumentData(documentId);

  const versionDrawer = useVersionDrawer({
    versions,
    applyVersion: actions.applyVersion,
  });

  const { session: userSession } = useSessionStore();
  const isUserCanEdit = !!userSession?.permissions?.includes(PermissionEnum.EDIT);

  const editor = useEditorState({
    currentDocument,
    previewContent: versionDrawer.previewContent,
    isUserCanEdit,
    changeContentAndSaveDocument: actions.changeContentAndSaveDocument,
  });

  const aiBundles = useDocumentAI({
    documentId,
    createDocumentAiUsage: actions.createDocumentAiUsage,
    newAiUsage,
    setNewAiUsage: actions.setNewAiUsage,
    isFetchingAI,
  });

  return {
    currentDocument,
    quillDelta: editor.quillDelta,
    localContent: editor.localContent,
    previewContent: versionDrawer.previewContent,
    isReadOnly: editor.isReadOnly,
    handleEditorChange: editor.handleEditorChange,

    handleSaveTitle: (title: string) => actions.changeDocumentTitle?.(title),

    versions,
    versionDrawer,

    overlay: aiBundles.overlay,

    ai: aiBundles.ai,

    isLoadingPage,
  };
}
