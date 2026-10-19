import React from 'react';

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import { useUserStore } from '@/store/useUserStore';
import { useSessionStore } from '@/store/useSessionStore';
import { PermissionEnum } from '@/models/enums';
import { queryKeys } from '@/lib/queryKeys';

import DocumentPage from '../session/[id]/document/[documentId]/page';

let route = '12';
const replace = jest.fn();
const router = { replace };

jest.mock('next/navigation', () => ({ useParams: () => ({ id: '3', documentId: route }), useRouter: () => router }));
jest.mock('@/components/Session/SessionLayout/SessionLayout', () => ({
  SessionContext: require('react').createContext(null),
}));
jest.mock('next/dynamic', () => () => ({ value, readOnly, onChange }: any) => (
  <div className='document-editor'>
    <textarea
      className='ql-editor'
      aria-label='Editor'
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value, {}, 'user')}
    />
  </div>
));
jest.mock('react-quill-new', () => ({ Quill: {} }));
jest.mock('@/helpers/documentHelpers', () => ({ convertRichContentToDelta: () => ({ ops: [] }) }));
jest.mock('@/components/Document/ExportButton', () => ({ __esModule: true, default: () => null }));

const snackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));

class Socket {
  emit = jest.fn();

  listeners = new Map<string, Set<(value: any) => void>>();

  on(event: string, fn: (value: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());

    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: (value: any) => void) {
    this.listeners.get(event)?.delete(fn);
  }

  trigger(event: string, value: any) {
    this.listeners.get(event)?.forEach((fn) => fn(value));
  }
}

const doc = (id: number) => ({
  id,
  title: `Document ${id}`,
  richContent: `<p>Text ${id}</p>`,
  lastUpdated: '2026-10-17',
});
const usage = (id = 12, userId = 7) => ({
  id: 22,
  result: 'Generated <text>\nNext line',
  document: { id },
  user: { id: userId },
});

function setup() {
  const socket = new Socket();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = jest.spyOn(client, 'invalidateQueries');
  const tree = () => (
    <QueryClientProvider client={client}>
      <SessionContext.Provider value={{ socket: socket as any, sessionId: 3 }}>
        <DocumentPage />
      </SessionContext.Provider>
    </QueryClientProvider>
  );
  const view = render(tree());

  return { ...view, socket, client, invalidate, refresh: () => view.rerender(tree()) };
}
beforeEach(() => {
  route = '12';
  jest.clearAllMocks();
  useUserStore.setState({ user: { id: 7 } as any });
  useSessionStore.setState({ session: { permissions: [PermissionEnum.EDIT] } as any });
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
});
afterEach(() => {
  jest.useRealTimers();
});
it('handles loading, foreign errors and unavailable documents, with a return to the session', () => {
  const { socket } = setup();

  expect(screen.getByRole('status', { name: 'Loading document' })).toBeInTheDocument();
  act(() => socket.trigger('invalidDocument', { documentId: 99 }));
  expect(screen.queryByText('Document not found')).not.toBeInTheDocument();
  act(() => socket.trigger('invalidDocument', { documentId: 12 }));
  expect(screen.getByRole('heading', { name: 'Document not found' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Return to Session' }));
  expect(replace).toHaveBeenCalledWith('/session/3');
});
it('clears previous content, versions and AI on ID change and ignores late or foreign replies', () => {
  const { socket, refresh } = setup();

  act(() => socket.trigger('documentData', doc(12)));
  expect(screen.getByLabelText('Editor')).toHaveValue('<p>Text 12</p>');
  act(() =>
    socket.trigger('versionsData', [{ id: 1, document: { id: 12 }, richContent: 'Old', createdAt: new Date() }]),
  );
  fireEvent.click(screen.getByRole('button', { name: /AI Assistance/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Text Rephrasing' }));
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'Previous' } });

  const stale = [...(socket.listeners.get('documentData') || [])][0];

  route = '24';
  refresh();
  expect(screen.getByRole('status', { name: 'Loading document' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  act(() => {
    stale(doc(12));
    socket.trigger('documentData', doc(12));
    socket.trigger('invalidDocument', { documentId: 12 });
    socket.trigger('documentAiUsageCreated', usage(12));
  });
  expect(screen.queryByLabelText('Editor')).not.toBeInTheDocument();
  act(() => socket.trigger('documentData', doc(24)));
  expect(screen.getByLabelText('Editor')).toHaveValue('<p>Text 24</p>');
  fireEvent.click(screen.getByRole('button', { name: /AI Assistance/ }));
  expect(screen.getByRole('button', { name: 'Text Rephrasing' })).toBeInTheDocument();
});
it.each(['invalid', '0', '9007199254740992', '12abc'])('rejects invalid document id %s before requesting it', (id) => {
  route = id;

  const { socket } = setup();

  expect(socket.emit).not.toHaveBeenCalled();
  expect(screen.getByText('Document not found')).toBeInTheDocument();
});
it('runs document AI once, ignores another user, copies and appends escaped text with automatic saving', async () => {
  const { socket, invalidate } = setup();

  act(() => socket.trigger('documentData', doc(12)));
  fireEvent.click(screen.getByRole('button', { name: /AI Assistance/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Text Rephrasing' }));
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: ' Text to rewrite ' } });

  const run = screen.getByRole('button', { name: 'Run tool' });

  fireEvent.click(run);
  fireEvent.submit(run.closest('form')!);
  expect(socket.emit.mock.calls.filter(([event]) => event === 'createDocumentAiUsage')).toHaveLength(1);
  expect(socket.emit).toHaveBeenCalledWith('createDocumentAiUsage', {
    documentId: 12,
    toolName: 'rephrase',
    text: 'Text to rewrite',
    targetLanguage: undefined,
  });
  act(() => socket.trigger('documentAiUsageCreated', usage(12, 99)));
  expect(screen.getByRole('button', { name: 'Working on your text…' })).toBeDisabled();
  act(() => socket.trigger('documentAiUsageCreated', usage()));
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.ai(7) });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard(7) });
  fireEvent.click(screen.getByRole('button', { name: 'Copy ai result' }));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Generated <text>\nNext line'));
  fireEvent.click(screen.getByRole('button', { name: /Paste in document/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Editor')).toHaveValue('<p>Text 12</p><p>Generated &lt;text&gt;</p><p>Next line</p>');
  await waitFor(() =>
    expect(socket.emit).toHaveBeenCalledWith('changeContentAndSaveDocument', {
      documentId: 12,
      newContent: '<p>Text 12</p><p>Generated &lt;text&gt;</p><p>Next line</p>',
    }),
  );
});
it('preserves read-only behavior and cancels queued saves when navigating to a different document', () => {
  jest.useFakeTimers();

  const { socket, refresh } = setup();

  act(() => socket.trigger('documentData', doc(12)));
  fireEvent.change(screen.getByLabelText('Editor'), { target: { value: 'Changed' } });
  route = '24';
  refresh();
  act(() => socket.trigger('documentData', doc(24)));
  act(() => jest.advanceTimersByTime(800));
  expect(socket.emit.mock.calls.filter(([event]) => event === 'changeContentAndSaveDocument')).toHaveLength(0);
  act(() => useSessionStore.setState({ session: { permissions: [PermissionEnum.READ] } as any }));
  expect(screen.getByLabelText('Editor')).toHaveAttribute('readonly');
  fireEvent.change(screen.getByLabelText('Editor'), { target: { value: 'Cannot edit' } });
  act(() => jest.advanceTimersByTime(800));
  expect(socket.emit.mock.calls.filter(([event]) => event === 'changeContentAndSaveDocument')).toHaveLength(0);
});

it('validates document translation and allows retry after a socket error without losing input', () => {
  const { socket } = setup();

  act(() => socket.trigger('documentData', doc(12)));
  fireEvent.click(screen.getByRole('button', { name: /AI Assistance/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Text Translation' }));
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: ' Hello ' } });

  const run = screen.getByRole('button', { name: 'Run tool' });

  expect(run).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Translate into'), { target: { value: '  ' } });
  expect(run).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Translate into'), { target: { value: ' French ' } });
  fireEvent.click(run);
  expect(socket.emit).toHaveBeenCalledWith('createDocumentAiUsage', {
    documentId: 12,
    toolName: 'translation',
    text: 'Hello',
    targetLanguage: 'French',
  });
  act(() => socket.trigger('error', 'failed'));
  expect(screen.getByLabelText('Your text')).toHaveValue(' Hello ');
  fireEvent.click(screen.getByRole('button', { name: 'Run tool' }));
  expect(socket.emit.mock.calls.filter(([event]) => event === 'createDocumentAiUsage')).toHaveLength(2);
});
it('keeps selection during document selection mode and restores scrolling after cancellation or unmount', () => {
  document.body.style.overflow = 'scroll';

  const { socket, unmount } = setup();

  act(() => socket.trigger('documentData', doc(12)));
  fireEvent.click(screen.getByRole('button', { name: /AI Assistance/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Text Rephrasing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select from the document' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('hidden');

  const editor = document.querySelector('.ql-editor')!;
  const selection = {
    anchorNode: editor,
    focusNode: editor,
    toString: () => 'Selected passage',
    removeAllRanges: jest.fn(),
  };
  const getSelection = jest.spyOn(window, 'getSelection').mockReturnValue(selection as any);

  fireEvent(document, new Event('selectionchange'));

  const submit = screen.getByRole('button', { name: 'Submit' });

  expect(submit).toBeEnabled();
  fireEvent.resize(window);
  expect(selection.removeAllRanges).not.toHaveBeenCalled();
  fireEvent.click(submit);
  expect(socket.emit).toHaveBeenCalledWith('createDocumentAiUsage', {
    documentId: 12,
    toolName: 'rephrase',
    text: 'Selected passage',
    targetLanguage: undefined,
  });
  act(() => socket.trigger('error', 'offline'));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(document.body.style.overflow).toBe('scroll');
  getSelection.mockRestore();
  unmount();
  expect(document.body.style.overflow).toBe('scroll');
  document.body.style.overflow = '';
});
it('previews earlier versions read-only and returns to the current document', () => {
  const { socket } = setup();

  act(() => socket.trigger('documentData', doc(12)));

  const versions = [
    {
      id: 2,
      document: { id: 12 },
      richContent: '<p>Current</p>',
      createdAt: '2026-10-17',
      userEmail: 'current@example.com',
    },
    {
      id: 1,
      document: { id: 12 },
      richContent: '<p>Earlier</p>',
      createdAt: '2026-10-16',
      userEmail: 'earlier@example.com',
    },
  ];

  act(() => socket.trigger('versionsData', versions));
  fireEvent.click(screen.getByRole('button', { name: /Version history/ }));

  const earlier = screen.getByText('earlier@example.com').closest('button')!;

  fireEvent.mouseEnter(earlier.parentElement!);
  expect(screen.getByLabelText('Editor')).toHaveValue('<p>Earlier</p>');
  expect(screen.getByLabelText('Editor')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('button', { name: 'Back to current' }));
  expect(screen.getByLabelText('Editor')).toHaveValue('<p>Text 12</p>');
  expect(screen.getByLabelText('Editor')).not.toHaveAttribute('readonly');
});
