import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Chat from '../Chat';

/* ------------------------------------------------------------------ */
/*                   1 – mocks for child deps / hooks                 */
/* ------------------------------------------------------------------ */

// Drawer – just a passthrough container
jest.mock('@/ui/Drawer', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='drawer'>{children}</div>,
}));

// InputField – plain <input>
jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: (props: any) => (
    <input
      data-testid='chat-input'
      {...props}
      // Preserve value so we can read it after updates
      value={props.value}
    />
  ),
}));

// ChatMessage – show the text so we can assert it rendered
jest.mock('../ChatMessage', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <p data-testid='chat-msg'>{text}</p>,
}));

// useUserStore – current user
jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { id: 2, email: 'me@mail.com', name: 'Me' } }),
}));

// useChatSocket – stub messages + spyable sendMessage
const sendMessageMock = jest.fn();
const mockMessages = [
  {
    id: 1,
    text: 'Hello',
    createdAt: '2025-01-01',
    sender: { id: 1, email: 'userA@mail.com', name: 'Alice' },
  },
  {
    id: 2,
    text: 'Hi',
    createdAt: '2025-01-01',
    sender: { id: 2, email: 'me@mail.com', name: 'Me' },
  },
];

jest.mock('@/hooks/sockets/useChatSocket', () => ({
  useChatSocket: () => ({ messages: mockMessages, sendMessage: sendMessageMock }),
}));

/* ------------------------------------------------------------------ */
/*                       2 – global DOM helpers                       */
/* ------------------------------------------------------------------ */
const scrollMock = jest.fn();

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: scrollMock,
});

/* ------------------------------------------------------------------ */
/*                               tests                                */
/* ------------------------------------------------------------------ */
describe('Chat drawer', () => {
  const fakeSocket = {} as any; // we never touch it in tests

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders every message through ChatMessage', () => {
    render(<Chat isOpen socket={fakeSocket} handleClose={jest.fn()} />);

    const renderedMsgs = screen.getAllByTestId('chat-msg').map((el) => el.textContent);
    const originalTexts = mockMessages.map((m) => m.text);

    expect(renderedMsgs).toEqual(originalTexts);
  });

  it('calls sendMessage and clears input on “Send” button', () => {
    render(<Chat isOpen socket={fakeSocket} handleClose={jest.fn()} />);

    const input = screen.getByTestId<HTMLInputElement>('chat-input');

    // type a message
    fireEvent.change(input, { target: { value: 'New message' } });
    expect(input.value).toBe('New message');

    // click Send
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(sendMessageMock).toHaveBeenCalledWith('New message');
    expect(input.value).toBe(''); // cleared after sending
  });

  it('sends message on Enter key press', () => {
    render(<Chat isOpen socket={fakeSocket} handleClose={jest.fn()} />);

    const input = screen.getByTestId<HTMLInputElement>('chat-input');

    fireEvent.change(input, { target: { value: 'Enter msg' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(sendMessageMock).toHaveBeenCalledWith('Enter msg');
  });

  it('scrolls to newest message when opened / updated', () => {
    render(<Chat isOpen socket={fakeSocket} handleClose={jest.fn()} />);

    // Called at least once (on mount with isOpen=true)
    expect(scrollMock).toHaveBeenCalled();
  });
});
