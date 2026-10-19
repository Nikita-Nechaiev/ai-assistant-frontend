import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Drawer from '../Drawer';

it('renders a named panel only while open and supports Escape', () => {
  const close = jest.fn();
  const { rerender } = render(
    <Drawer isOpen handleClose={close} title='History'>
      Content
    </Drawer>,
  );

  expect(screen.getByRole('dialog', { name: 'History' })).toHaveTextContent('Content');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(close).toHaveBeenCalled();
  rerender(
    <Drawer isOpen={false} handleClose={close}>
      Content
    </Drawer>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('resizes within bounds with the keyboard and pointer, closes below minimum and restores cursor', () => {
  Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true, writable: true });

  const close = jest.fn();

  render(
    <Drawer isOpen handleClose={close} minWidth={20} maxWidth={60}>
      Content
    </Drawer>,
  );

  const resize = screen.getByRole('separator');

  fireEvent.keyDown(resize, { key: 'ArrowLeft' });
  expect(resize).toHaveAttribute('aria-valuenow', '34');
  fireEvent.keyDown(resize, { key: 'ArrowRight' });
  expect(resize).toHaveAttribute('aria-valuenow', '32');
  fireEvent.pointerDown(resize);
  fireEvent.pointerMove(document, { clientX: 100 });
  expect(resize).toHaveAttribute('aria-valuenow', '60');
  fireEvent.pointerUp(document);
  expect(document.body.style.cursor).toBe('');
  fireEvent.pointerDown(resize);
  fireEvent.pointerMove(document, { clientX: 990 });
  expect(close).toHaveBeenCalled();
});
