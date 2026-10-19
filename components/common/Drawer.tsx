'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface DrawerProps {
  isOpen: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  title?: string;
}

export default function Drawer({
  isOpen,
  handleClose,
  children,
  initialWidth = 32,
  minWidth = 25,
  maxWidth = 65,
  title = 'Workspace panel',
}: DrawerProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setResizing] = useState(false);
  const isDragging = useRef(false);
  const previousStyles = useRef({ cursor: '', userSelect: '' });
  const previousFocus = useRef<HTMLElement | null>(null);
  const stopDragging = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    setResizing(false);
    document.body.style.cursor = previousStyles.current.cursor;
    document.body.style.userSelect = previousStyles.current.userSelect;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const move = (event: PointerEvent) => {
      if (!isDragging.current) return;

      const nextWidth = ((window.innerWidth - event.clientX) / window.innerWidth) * 100;

      if (nextWidth < minWidth) {
        stopDragging();
        handleClose();
      } else setWidth(Math.min(maxWidth, nextWidth));
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stopDragging);
    document.addEventListener('pointercancel', stopDragging);

    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', stopDragging);
      document.removeEventListener('pointercancel', stopDragging);
      stopDragging();
    };
  }, [isOpen, minWidth, maxWidth, handleClose, stopDragging]);

  return (
    <Sheet
      open={isOpen}
      modal={false}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side='right'
        showCloseButton={false}
        aria-describedby={undefined}
        className={`saas-dialog bottom-0 top-[72px] z-[60] flex h-[calc(100dvh-72px)] max-w-none flex-col gap-0 border-border bg-white p-0 text-foreground shadow-[-12px_0_40px_-20px_rgba(24,55,99,0.25)] sm:max-w-none ${isResizing ? 'transition-none' : ''}`}
        style={{ width: `${width}%`, minWidth: 'min(360px, 100vw)', maxWidth: '100vw' }}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => {
          previousFocus.current = document.activeElement as HTMLElement;
          event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          if (previousFocus.current?.isConnected) {
            event.preventDefault();
            previousFocus.current.focus();
          }
        }}
      >
        <SheetTitle className='sr-only'>{title}</SheetTitle>
        <div
          role='separator'
          aria-label='Resize panel'
          aria-orientation='vertical'
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          aria-valuenow={Math.round(width)}
          tabIndex={0}
          className='absolute inset-y-0 -left-1 z-10 w-2 cursor-ew-resize touch-none rounded-full transition-colors hover:bg-primary/15 focus-visible:bg-primary/20 focus-visible:outline-none'
          title='Drag to resize'
          onPointerDown={(event) => {
            event.preventDefault();
            previousStyles.current = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect };
            isDragging.current = true;
            setResizing(true);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              setWidth((value) => Math.max(minWidth, Math.min(maxWidth, value + (event.key === 'ArrowLeft' ? 2 : -2))));
            }
          }}
        />
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
