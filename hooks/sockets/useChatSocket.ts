'use client';

import { useState, useEffect, useCallback } from 'react';

import { Socket } from 'socket.io-client';

import { IMessage } from '@/models/models';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

interface Params {
  socket: Socket;
  isOpen: boolean;
}

export function useChatSocket({ socket, isOpen }: Params) {
  const { setSnackbar } = useSnackbarStore();

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const onMessages = (msgs: IMessage[]) => setMessages(msgs);
    const onNewMessage = (msg: IMessage) => setMessages((prev) => [...prev, msg]);
    const onError = (msg: string) => setSnackbar(msg, SnackbarStatusEnum.ERROR);

    socket.on('messages', onMessages);
    socket.on('newMessage', onNewMessage);
    socket.on('error', onError);

    return () => {
      socket.off('messages', onMessages);
      socket.off('newMessage', onNewMessage);
      socket.off('error', onError);
    };
  }, [socket, setSnackbar]);

  useEffect(() => {
    if (isOpen) socket.emit('getMessages');
  }, [isOpen, socket]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) return;

      socket.emit('sendMessage', { message: trimmed });
    },
    [socket],
  );

  return { messages, sendMessage };
}
