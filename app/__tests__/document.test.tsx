import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import useDocumentPage from '@/hooks/document/useDocumentPage';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';

import DocumentPage from '../session/[id]/document/[documentId]/page';

jest.mock('@/hooks/document/useDocumentPage', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('next/navigation', () => ({
  useParams: () => ({ documentId: '12' }),
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('next/dynamic', () => () => ({ value, readOnly, onChange }: any) => (
  <textarea
    aria-label='Editor'
    value={value}
    readOnly={readOnly}
    onChange={(event) => onChange(event.target.value, {}, 'user')}
  />
));
jest.mock('@/components/Session/SessionLayout/SessionLayout', () => ({
  SessionContext: require('react').createContext(null),
}));
jest.mock('@/components/Document/DocumentHeader', () => ({
  __esModule: true,
  default: ({ documentTitle, onOpenAiModal, onOpenVersionDrawer, onTitleSave }: any) => (
    <div>
      <h1>{documentTitle}</h1>
      <button onClick={onOpenAiModal}>AI</button>
      <button onClick={onOpenVersionDrawer}>Versions</button>
      <button onClick={() => onTitleSave('Updated')}>Rename</button>
    </div>
  ),
}));
jest.mock('@/components/Document/VersionDrawer', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/AiAssistance/AiAssistanceStepper', () => ({
  __esModule: true,
  default: ({ onPasteInDocument, pasteDisabled }: any) => (
    <button onClick={onPasteInDocument} disabled={pasteDisabled}>
      Paste result
    </button>
  ),
}));

const snackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));

const hook = useDocumentPage as jest.Mock;
const state = () => ({
  currentDocument: { id: 12, title: 'Project', lastUpdated: new Date() },
  isLoadingPage: false,
  localContent: 'Current',
  previewContent: '',
  isReadOnly: false,
  quillDelta: null,
  versions: [],
  appendText: jest.fn().mockReturnValue(true),
  handleEditorChange: jest.fn(),
  handleSaveTitle: jest.fn(),
  versionDrawer: { isOpen: false, open: jest.fn(), close: jest.fn() },
  overlay: { isActive: false, qlRect: null, selectedText: '', handleCancel: jest.fn() },
  ai: { isOpen: false, isLoading: false, currentStep: 3, result: 'Generated text', open: jest.fn(), close: jest.fn() },
});

it('shows loading and missing-document states', () => {
  hook.mockReturnValue({ ...state(), isLoadingPage: true });

  const { rerender } = render(<DocumentPage />);

  expect(screen.getByRole('status', { name: 'Loading document' })).toBeInTheDocument();
  hook.mockReturnValue({ ...state(), currentDocument: null });
  rerender(<DocumentPage />);
  expect(screen.getByText('Document not found')).toBeInTheDocument();
});
it('connects the editor, title actions and breadcrumb to the current document', () => {
  const value = state();

  hook.mockReturnValue(value);

  const breadcrumb = jest.fn();

  render(
    <SessionContext.Provider value={{ setDocumentBreadcrumb: breadcrumb } as any}>
      <DocumentPage />
    </SessionContext.Provider>,
  );
  expect(breadcrumb).toHaveBeenCalledWith({ id: 12, title: 'Project' });
  fireEvent.change(screen.getByLabelText('Editor'), { target: { value: 'Changed' } });
  expect(value.handleEditorChange).toHaveBeenCalledWith('Changed', {}, 'user');
  fireEvent.click(screen.getByText('AI'));
  expect(value.ai.open).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Versions'));
  expect(value.versionDrawer.open).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Rename'));
  expect(value.handleSaveTitle).toHaveBeenCalledWith('Updated');
});
it('shows read-only previews and returns to the current document', () => {
  const value = { ...state(), previewContent: 'Saved draft', isReadOnly: true };

  hook.mockReturnValue(value);

  const { rerender } = render(<DocumentPage />);

  expect(screen.getByLabelText('Editor')).toHaveValue('Saved draft');
  expect(screen.getByLabelText('Editor')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('button', { name: 'Back to current' }));
  expect(value.versionDrawer.close).toHaveBeenCalled();
  hook.mockReturnValue({ ...value, previewContent: '' });
  rerender(<DocumentPage />);
  expect(screen.getByText('This document is shared with you for viewing.')).toBeInTheDocument();
});
it('pastes a completed AI result into the document, then closes the dialog', () => {
  const value = state();

  value.ai.isOpen = true;
  hook.mockReturnValue(value);
  render(<DocumentPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Paste result' }));
  expect(value.appendText).toHaveBeenCalledWith('Generated text');
  expect(value.ai.close).toHaveBeenCalled();
  expect(snackbar).toHaveBeenCalledWith('AI text added to the end of your document.', 'success');
});
it.each(['loading', 'not-ready', 'rejected', 'read-only'])('does not insert an AI result while %s', (condition) => {
  const value = state();

  value.ai.isOpen = true;

  if (condition === 'loading') value.ai.isLoading = true;

  if (condition === 'not-ready') value.ai.currentStep = 2;

  if (condition === 'rejected') value.appendText.mockReturnValue(false);

  if (condition === 'read-only') value.isReadOnly = true;

  hook.mockReturnValue(value);
  render(<DocumentPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Paste result' }));
  expect(value.ai.close).not.toHaveBeenCalled();
});
it('supports closing AI and shows the selection overlay independently', () => {
  const value = state();

  value.ai.isOpen = true;
  hook.mockReturnValue(value);

  const { rerender } = render(<DocumentPage />);

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(value.ai.close).toHaveBeenCalled();
  hook.mockReturnValue({
    ...state(),
    overlay: {
      isActive: true,
      qlRect: new DOMRect(10, 10, 200, 100),
      selectedText: 'passage',
      handleCancel: jest.fn(),
    },
  });
  rerender(<DocumentPage />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
});
