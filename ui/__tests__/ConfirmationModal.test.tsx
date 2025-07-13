import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  const onCloseMock = jest.fn();
  const onCancelMock = jest.fn();
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    onCancelMock.mockClear();
    onSubmitMock.mockClear();
  });

  it('renders description and title when open', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        onCancel={onCancelMock}
        description='Are you sure you want to proceed?'
        submitText='Confirm'
      />,
    );

    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm your action')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        onCancel={onCancelMock}
        description='Should not show'
        submitText='Confirm'
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onSubmit and onCancel when buttons clicked', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        onCancel={onCancelMock}
        description='Action?'
        submitText='Yes'
      />,
    );

    fireEvent.click(screen.getByText('Yes'));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
