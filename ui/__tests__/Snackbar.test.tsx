import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';

import Snackbar from '../Snackbar';

const closeSnackbarMock = jest.fn();

let snackbarState: {
  message: string | null;
  status: SnackbarStatusEnum | null;
  closeSnackbar: jest.Mock;
} = {
  message: null,
  status: null,
  closeSnackbar: closeSnackbarMock,
};

jest.mock('@/store/useSnackbarStore', () => () => snackbarState);

describe('Snackbar', () => {
  beforeEach(() => {
    closeSnackbarMock.mockClear();
    snackbarState = { message: null, status: null, closeSnackbar: closeSnackbarMock };
  });

  it('returns null when there is no message', () => {
    const { container } = render(<Snackbar />);

    expect(container.firstChild).toBeNull();
  });

  it('renders success message with proper style', () => {
    snackbarState.message = 'Saved!';
    snackbarState.status = SnackbarStatusEnum.SUCCESS;

    render(<Snackbar />);

    const snackbar = screen.getByTestId('snackbar-root');

    expect(snackbar).toHaveClass('bg-green-500');
  });

  it('calls closeSnackbar after 4 s timeout', () => {
    jest.useFakeTimers();

    snackbarState.message = 'Auto close';
    snackbarState.status = SnackbarStatusEnum.SUCCESS;

    render(<Snackbar />);

    expect(closeSnackbarMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    expect(closeSnackbarMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('calls closeSnackbar when user clicks X button', () => {
    snackbarState.message = 'Need manual close';
    snackbarState.status = SnackbarStatusEnum.ERROR;

    render(<Snackbar />);

    fireEvent.click(screen.getByRole('button'));
    expect(closeSnackbarMock).toHaveBeenCalledTimes(1);
  });
});
