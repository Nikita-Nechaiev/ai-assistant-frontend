import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { DeltaStatic } from 'react-quill-new';

import DocumentHeader from '../DocumentHeader';

/* ------------------------------------------------------------------ */
/*           моки вложенных компонентов / хелперов / стора            */
/* ------------------------------------------------------------------ */
jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/ui/TruncateText', () => ({
  __esModule: true,
  default: ({ text }: any) => <span data-testid='title'>{text}</span>,
}));

const exportSpy = jest.fn();

jest.mock('@/components/Document/ExportButton', () => ({
  __esModule: true,
  default: ({ documentTitle, quillDelta }: any) => {
    exportSpy(documentTitle, quillDelta);

    return <button data-testid='export'>export</button>;
  },
}));

/* ------------------------------------------------------------------ */
/*                              helpers                               */
/* ------------------------------------------------------------------ */
type Cbs = {
  onSave: jest.Mock;
  onAI: jest.Mock;
  onDrawer: jest.Mock;
};

const mount = (title = 'My Doc', delta: DeltaStatic | null = null, cb?: Partial<Cbs>) => {
  const callbacks: Cbs = {
    onSave: jest.fn(),
    onAI: jest.fn(),
    onDrawer: jest.fn(),
    ...cb,
  };

  render(
    <DocumentHeader
      documentTitle={title}
      quillDelta={delta}
      onTitleSave={callbacks.onSave}
      onOpenAiModal={callbacks.onAI}
      onOpenVersionDrawer={callbacks.onDrawer}
    />,
  );

  return callbacks;
};

/* ------------------------------------------------------------------ */
/*                                tests                               */
/* ------------------------------------------------------------------ */
describe('DocumentHeader', () => {
  it('renders title and passes props to ExportButton', () => {
    const delta = {} as unknown as DeltaStatic;

    mount('Doc A', delta);

    expect(screen.getByTestId('title')).toHaveTextContent('Doc A');
    expect(exportSpy).toHaveBeenCalledWith('Doc A', delta);
  });

  it('enters edit mode, saves on Enter / blur', () => {
    const save = jest.fn();

    mount('Start', null, { onSave: save });

    // — первый проход: Enter —
    fireEvent.click(screen.getByRole('button', { name: '' })); // иконка

    const input = screen.getByDisplayValue('Start');

    fireEvent.change(input, { target: { value: 'Updated' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(save).toHaveBeenCalledWith('Updated');

    // — второй проход: blur —
    fireEvent.click(screen.getByRole('button', { name: '' })); // открыть снова

    const input2 = screen.getByDisplayValue('Start'); // снова "Start", т.к. prop не менялся

    fireEvent.change(input2, { target: { value: 'BlurSave' } });
    fireEvent.blur(input2);
    expect(save).toHaveBeenCalledWith('BlurSave');
  });

  it('does not save empty/whitespace title', () => {
    const save = jest.fn();

    mount('Title', null, { onSave: save });

    fireEvent.click(screen.getByRole('button', { name: '' }));

    const input = screen.getByDisplayValue('Title');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(save).not.toHaveBeenCalled();
  });

  it('AI Assistance & Show Versions buttons trigger callbacks', () => {
    const { onAI, onDrawer } = mount();

    fireEvent.click(screen.getByRole('button', { name: /ai assistance/i }));
    expect(onAI).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /show versions/i }));
    expect(onDrawer).toHaveBeenCalled();
  });
});
