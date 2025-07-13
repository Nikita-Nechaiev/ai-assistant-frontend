import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Modal from '../Modal';

describe('Modal', () => {
  const onClose = jest.fn();
  const onCancel = jest.fn();
  const onSubmit = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    // на случай, если тест упал и класс остался
    document.body.classList.remove('overflow-hidden');
  });

  it('returns null when closed', () => {
    const { container } = render(<Modal isOpen={false} onClose={onClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('adds and removes body overflow-hidden class', () => {
    const { rerender } = render(<Modal isOpen={true} onClose={onClose} />);

    expect(document.body).toHaveClass('overflow-hidden');

    rerender(<Modal isOpen={false} onClose={onClose} />);
    expect(document.body).not.toHaveClass('overflow-hidden');
  });

  it('triggers onClose on background click and on close-button click', () => {
    const { container } = render(<Modal isOpen onClose={onClose} />);

    // клик по тёмному фону (самый внешний div)
    fireEvent.click(container.firstChild as HTMLElement);

    // клик по кнопке-крестику
    const closeBtn = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('triggers onClose when Escape pressed', () => {
    render(<Modal isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onSubmit and onCancel buttons', () => {
    render(
      <Modal isOpen onClose={onClose} onCancel={onCancel} onSubmit={onSubmit} cancelText='Cancel' submitText='Save' />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Save'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('triggers onSubmit when Enter key pressed inside modal', () => {
    render(<Modal isOpen onClose={onClose} onSubmit={onSubmit} />);

    // контент-блок модалки имеет tabIndex=0
    const modalBox = document.querySelector('div[tabindex="0"]') as HTMLElement;

    fireEvent.keyDown(modalBox, { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
