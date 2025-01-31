'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DrawerProps {
  isOpen: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  initialWidth?: number; // Allow custom initial width (percentage)
  minWidth?: number; // Allow custom minimum width (percentage)
  maxWidth?: number; // Allow custom maximum width (percentage)
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    if (isOpen) {
      document.body.style.cursor = 'ew-resize';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const screenWidth = window.innerWidth;
      const newWidth = ((screenWidth - e.clientX) / screenWidth) * 100;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      } else if (newWidth < minWidth) {
        handleClose();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'default';
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className={`
        fixed right-0 z-40 bg-white border-l border-gray-200 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      // Высота: отступ сверху 72px и полная высота минус 72px
      style={{
        top: '72px',
        height: 'calc(100% - 72px)',
        width: `${width}%`,
      }}
    >
      {/* Drag-handle */}
      <div
        className='absolute top-0 left-0 h-full w-2 cursor-ew-resize z-50'
        onMouseDown={handleMouseDown}
        title='Drag to resize'
      />
      {/* Прокрутка если контента много */}
      <div className='overflow-y-auto h-[100%] flex flex-col'>{children}</div>
    </div>
  );
}
