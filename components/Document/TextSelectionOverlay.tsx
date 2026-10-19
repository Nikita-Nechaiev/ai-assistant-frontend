'use client';

import React, { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';
import { FiCheck, FiLoader, FiMousePointer, FiX } from 'react-icons/fi';

import { Button } from '@/components/ui/button';

export interface TextSelectionOverlayProps {
  qlRect: DOMRect;
  hasSelectedText: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TextSelectionOverlay: React.FC<TextSelectionOverlayProps> = ({
  qlRect,
  hasSelectedText,
  onCancel,
  onSubmit,
  isLoading,
}) => {
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('resize', updateViewport);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, onCancel]);

  const left = Math.max(0, Math.min(viewport.width, qlRect.left));
  const top = Math.max(0, Math.min(viewport.height, qlRect.top));
  const right = Math.max(left, Math.min(viewport.width, qlRect.right));
  const bottom = Math.max(top, Math.min(viewport.height, qlRect.bottom));
  const radius = Math.min(24, (right - left) / 2, (bottom - top) / 2);
  // The even-odd path leaves the real editor visible and clickable through the rounded opening.
  const maskPath = [
    `M0 0H${viewport.width}V${viewport.height}H0Z`,
    `M${left + radius} ${top}H${right - radius}`,
    `Q${right} ${top} ${right} ${top + radius}V${bottom - radius}`,
    `Q${right} ${bottom} ${right - radius} ${bottom}H${left + radius}`,
    `Q${left} ${bottom} ${left} ${bottom - radius}V${top + radius}`,
    `Q${left} ${top} ${left + radius} ${top}Z`,
  ].join(' ');

  return createPortal(
    <div className='saas-shell pointer-events-none fixed inset-0 z-[1100] text-foreground'>
      <svg
        aria-hidden='true'
        className='absolute inset-0 h-full w-full'
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio='none'
      >
        <path
          d={maskPath}
          fill='rgba(15, 23, 42, 0.55)'
          fillRule='evenodd'
          pointerEvents='visiblePainted'
          onPointerDown={(event) => event.preventDefault()}
        />
      </svg>
      <div
        aria-hidden='true'
        className='absolute ring-2 ring-primary/40'
        style={{ left, top, width: right - left, height: bottom - top, borderRadius: radius }}
      />
      <div
        role='group'
        aria-labelledby='text-selection-instructions'
        className='pointer-events-auto absolute bottom-6 left-1/2 flex w-[min(640px,calc(100%-2rem))] -translate-x-1/2 flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-xl'
      >
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
            <FiMousePointer size={19} aria-hidden='true' />
          </span>
          <div>
            <p id='text-selection-instructions' className='text-base font-semibold'>
              Select text from your document
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>Highlight a passage, then submit it to AI.</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onPointerDown={(event) => event.preventDefault()}
            onClick={onCancel}
            disabled={isLoading}
            className='rounded-xl'
          >
            <FiX aria-hidden='true' />
            Cancel
          </Button>
          <Button
            type='button'
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onSubmit()}
            disabled={!hasSelectedText || isLoading}
            className='rounded-xl'
          >
            {isLoading ? <FiLoader className='animate-spin' aria-hidden='true' /> : <FiCheck aria-hidden='true' />}
            {isLoading ? 'Processing...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TextSelectionOverlay;
