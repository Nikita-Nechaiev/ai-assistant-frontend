import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Drawer from '../Drawer';

describe('Drawer', () => {
  const handleCloseMock = jest.fn();

  beforeEach(() => {
    handleCloseMock.mockClear();
  });

  it('renders children when open', () => {
    render(
      <Drawer isOpen={true} handleClose={handleCloseMock}>
        <p>Drawer Content</p>
      </Drawer>,
    );

    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    expect(screen.getByTitle('Drag to resize')).toBeInTheDocument();
  });

  it('has translate-x-0 class when open and translate-x-full when closed', () => {
    const { rerender, container } = render(
      <Drawer isOpen={true} handleClose={handleCloseMock}>
        <div>Content</div>
      </Drawer>,
    );

    const drawerDiv = container.firstChild as HTMLElement;

    expect(drawerDiv.className).toMatch(/translate-x-0/);

    rerender(
      <Drawer isOpen={false} handleClose={handleCloseMock}>
        <div>Content</div>
      </Drawer>,
    );
    expect(drawerDiv.className).toMatch(/translate-x-full/);
  });

  it('calls handleClose when dragged below minWidth', () => {
    render(
      <Drawer isOpen={true} handleClose={handleCloseMock} minWidth={20} maxWidth={30}>
        <div>Content</div>
      </Drawer>,
    );

    const resizeDiv = screen.getByTitle('Drag to resize');

    fireEvent.mouseDown(resizeDiv);

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    fireEvent.mouseMove(document, { clientX: 999 });

    fireEvent.mouseUp(document);

    expect(handleCloseMock).toHaveBeenCalled();
  });

  it('does not call handleClose if width stays within min and max', () => {
    render(
      <Drawer isOpen={true} handleClose={handleCloseMock} minWidth={20} maxWidth={80}>
        <div>Content</div>
      </Drawer>,
    );

    const resizeDiv = screen.getByTitle('Drag to resize');

    fireEvent.mouseDown(resizeDiv);

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    fireEvent.mouseMove(document, { clientX: 700 });

    fireEvent.mouseUp(document);

    expect(handleCloseMock).not.toHaveBeenCalled();
  });
});
