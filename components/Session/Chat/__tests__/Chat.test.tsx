import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Chat from '../Chat';

jest.mock('@/ui/Drawer', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid='drawer'>{children}</div>,
}));

jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: (props: any) => <input data-testid='chat-input' {...props} value={props.value} />,
}));

jest.mock('../ChatMessage', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <p data-testid='chat-msg'>{text}</p>,
}));

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { id: 2, email: 'me@mail.com', name: 'Me' } }),
}));

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

const scrollMock = jest.fn();

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: scrollMock,
});

describe('Chat drawer', () => {
  const fakeSocket = {} as any;

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

    fireEvent.change(input, { target: { value: 'New message' } });
    expect(input.value).toBe('New message');

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(sendMessageMock).toHaveBeenCalledWith('New message');
    expect(input.value).toBe('');
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

    expect(scrollMock).toHaveBeenCalled();
  });
});
