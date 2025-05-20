'use client';

import React, { useEffect, useRef, useState } from 'react';

import { IoMdClose } from 'react-icons/io';

import InputField from '@/ui/InputField';
import { useUserStore } from '@/store/useUserStore';
import Drawer from '@/ui/Drawer';
import { IMessage } from '@/models/models';

import ChatMessage from './ChatMessage';

interface ChatProps {
  isOpen: boolean;
  handleClose: () => void;
  messages: IMessage[];
  sendMessage: (message: string) => void;
}

export default function Chat({ isOpen, handleClose, messages, sendMessage }: ChatProps) {
  const { user } = useUserStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText.trim());
      setMessageText('');
    }
  };

  return (
    <Drawer initialWidth={50} minWidth={25} maxWidth={70} isOpen={isOpen} handleClose={handleClose}>
      <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
        <button onClick={handleClose} className='text-gray-500 hover:text-gray-700'>
          <IoMdClose size={30} />
        </button>
        <h2 className='text-xl font-semibold'>Session Chat</h2>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} sender={msg.sender} text={msg.text} isCurrentUser={msg.sender.email === user?.email} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className='p-4 border-t border-gray-200 flex items-center gap-3'>
        <InputField
          id='messageInput'
          label=''
          placeholder='Type your message...'
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          className='bg-mainDark text-mainLight px-4 py-2 rounded-lg hover:bg-mainDarkHover'
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </Drawer>
  );
}
