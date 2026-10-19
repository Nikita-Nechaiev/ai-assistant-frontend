import '@testing-library/jest-dom';

// jsdom does not implement layout observers or native pointer events.
global.ResizeObserver = class {
  observe() {}

  unobserve() {}

  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof window !== 'undefined') {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  Element.prototype.scrollIntoView = jest.fn();
}

URL.revokeObjectURL = jest.fn();
