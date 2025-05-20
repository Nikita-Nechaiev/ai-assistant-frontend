'use client';
import React, { useState, useEffect } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);

  return (
    <>
      {['top', 'left', 'right', 'bottom'].map((position) => (
        <div
          key={position}
          style={{
            position: 'fixed',
            top: position === 'bottom' ? qlRect.bottom : position === 'top' ? 0 : qlRect.top,
            left: position === 'right' ? qlRect.right : 0,
            width: position === 'left' ? qlRect.left : position === 'right' ? window.innerWidth - qlRect.right : '100%',
            height:
              position === 'top'
                ? qlRect.top
                : position === 'bottom'
                  ? window.innerHeight - qlRect.bottom
                  : qlRect.height,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            zIndex: 1000,
          }}
        />
      ))}

      <div
        style={{
          position: 'fixed',
          top: window.innerHeight / 2 - 70,
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 1001,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <button
          onClick={onCancel}
          className='px-20 py-3 border border-mainDark text-mainDark bg-mainLight rounded shadow hover:bg-mainLightGray transition text-lg'
        >
          Cancel
        </button>

        <button
          onClick={() => {
            onSubmit();
          }}
          disabled={!hasSelectedText}
          className={`px-20 py-3 rounded text-lg shadow transition ${
            hasSelectedText
              ? 'bg-mainDark text-white hover:bg-mainDarkHover cursor-pointer'
              : 'bg-mainLightGray text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </>
  );
};

export default TextSelectionOverlay;
