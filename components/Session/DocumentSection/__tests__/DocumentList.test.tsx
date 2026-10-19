import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument } from '@/models/models';

import DocumentList from '../DocumentList';

const createDocMock = jest.fn();
const changeTitleMock = jest.fn();

let docs: IDocument[] = [];

jest.mock('@/hooks/sockets/useDocumentListSocket', () => ({
  useDocumentListSocket: () => ({
    documents: docs,
    createDocument: createDocMock,
    changeDocumentTitle: changeTitleMock,
  }),
}));

jest.mock('@/components/common/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/common/InputField', () => ({
  __esModule: true,
  default: ({ id, value, onChange }: any) => <input data-testid={id} value={value} onChange={onChange} />,
}));

jest.mock('../DocumentItem', () => ({
  __esModule: true,
  default: ({ document, onEditTitle }: { document: IDocument; onEditTitle: () => void }) => (
    <div data-testid={`doc-${document.id}`} onClick={onEditTitle}>
      {document.title}
    </div>
  ),
}));

const renderList = () => render(<DocumentList sessionId={777} socket={null} />);

const openCreateModal = () => fireEvent.click(screen.getByRole('button', { name: 'New document' }));

describe('DocumentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    docs = [];
  });

  it('shows “No documents” placeholder when list empty', () => {
    docs = [];
    renderList();

    expect(screen.getByText('Your next idea starts here.')).toBeInTheDocument();
  });

  it('opens “create” modal and calls createDocument', () => {
    docs = [];
    renderList();

    openCreateModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Document title'), {
      target: { value: '   New Doc   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create document' }));

    expect(createDocMock).toHaveBeenCalledWith('New Doc');
  });

  it('opens “edit title” modal from DocumentItem and calls changeDocumentTitle', () => {
    docs = [{ id: 11, title: 'Old title' } as IDocument];

    renderList();

    fireEvent.click(screen.getByTestId('doc-11'));

    const input = screen.getByLabelText('Document title');

    expect(input).toHaveValue('Old title');

    fireEvent.change(input, { target: { value: 'New title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(changeTitleMock).toHaveBeenCalledWith(11, 'New title');
  });
});
