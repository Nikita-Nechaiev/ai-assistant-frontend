'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DrawerProps {
  isOpen: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export default function Drawer({
  isOpen,
  handleClose,
  children,
  initialWidth = 30,
  minWidth = 20,
  maxWidth = 30,
}: DrawerProps) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const screenWidth = window.innerWidth;
      const newWidth = ((screenWidth - e.clientX) / screenWidth) * 100;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      } else if (newWidth < minWidth) {
        handleClose();
      }
    },
    [handleClose, minWidth, maxWidth],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`fixed right-0 z-50 bg-white border-l border-gray-200 shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        top: '72px',
        height: 'calc(100% - 72px)',
        width: `${width}%`,
      }}
    >
      <div
        className='absolute top-0 left-0 h-full w-2 cursor-ew-resize z-50'
        onMouseDown={handleMouseDown}
        title='Drag to resize'
      />
      <div className='overflow-y-auto h-full flex flex-col'>{children}</div>
    </div>
  );
}
