import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { DeltaStatic } from 'react-quill-new';

import ExportButton from '../ExportButton';

/* ------------------------------------------------------------------ */
/*               1 — mock external helpers / zustand store             */
/* ------------------------------------------------------------------ */
const exportMock = jest.fn();

jest.mock('@/helpers/exportToPdf', () => ({
  exportToPDF: (...args: any[]) => exportMock(...args),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: setSnackbarMock,
}));

/* ------------------------------------------------------------------ */
/*                                 tests                              */
/* ------------------------------------------------------------------ */
describe('ExportButton', () => {
  const title = 'My Awesome Doc';
  const delta: DeltaStatic = { ops: [{ insert: 'hello' }] } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button and calls exportToPDF with props', () => {
    render(<ExportButton documentTitle={title} quillDelta={delta} />);

    const btn = screen.getByRole('button', { name: /export to pdf/i });

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(exportMock).toHaveBeenCalledWith(title, delta, setSnackbarMock);
  });

  it('works when quillDelta is null', () => {
    render(<ExportButton documentTitle={title} quillDelta={null} />);

    fireEvent.click(screen.getByRole('button', { name: /export to pdf/i }));
    expect(exportMock).toHaveBeenCalledWith(title, null, setSnackbarMock);
  });
});
