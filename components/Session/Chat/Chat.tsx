'use client';

import React, { useEffect, useRef, useState } from 'react';

import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { Socket } from 'socket.io-client';

import Drawer from '@/components/common/Drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PanelHeader from '@/components/common/PanelHeader';
import { useUserStore } from '@/store/useUserStore';
import { useChatSocket } from '@/hooks/sockets/useChatSocket';

import ChatMessage from './ChatMessage';

interface ChatProps {
  isOpen: boolean;
  handleClose: () => void;
  socket: Socket;
}

export default function Chat({ isOpen, handleClose, socket }: ChatProps) {
  const { user } = useUserStore();
  const { messages, sendMessage } = useChatSocket({ socket, isOpen });
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!messageText.trim()) return;

    sendMessage(messageText);
    setMessageText('');
  };

  return (
    <Drawer
      initialWidth={32}
      minWidth={25}
      maxWidth={60}
      isOpen={isOpen}
      handleClose={handleClose}
      title='Session chat'
    >
      <PanelHeader
        title='Session chat'
        description='A place for the conversation behind the work.'
        icon={<FiMessageSquare size={19} aria-hidden='true' />}
        onClose={handleClose}
      />
      <div
        role='log'
        aria-label='Session messages'
        aria-live='polite'
        aria-relevant='additions'
        className='min-h-0 flex-1 space-y-6 overflow-y-auto bg-muted/50 p-6'
      >
        {!messages.length && (
          <div className='flex h-full min-h-[180px] flex-col items-center justify-center px-5 text-center'>
            <span className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white text-primary'>
              <FiMessageSquare size={22} aria-hidden='true' />
            </span>
            <h3 className='text-base font-semibold'>Every great idea starts a conversation.</h3>
            <p className='mt-2 max-w-[250px] text-sm leading-6 text-muted-foreground'>
              Share a thought, ask a question, or say hello to your collaborators.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id ?? `${message.sender.id}-${message.createdAt}`}
            sender={message.sender}
            text={message.text}
            createdAt={message.createdAt}
            isCurrentUser={message.sender.email === user?.email}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
        className='shrink-0 border-t border-border bg-white p-5'
      >
        <label htmlFor='messageInput' className='sr-only'>
          Message to your session
        </label>
        <div className='flex items-center gap-2'>
          <Input
            id='messageInput'
            placeholder='Write a message…'
            autoComplete='off'
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            className='h-11 border-border bg-muted/40 text-base shadow-none'
          />
          <Button
            type='submit'
            size='icon'
            disabled={!messageText.trim()}
            aria-label='Send message'
            className='h-11 w-11 shrink-0 shadow-blue'
          >
            <FiSend size={17} aria-hidden='true' />
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
