'use client';
import React, { useRef, useEffect } from 'react';
import { DocumentData, TextElement } from '@/models/models';

interface DocumentCanvasProps {
  documentData: DocumentData;
}

export default function DocumentCanvas({ documentData }: DocumentCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill canvas background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1123);

    // (Optional) Render text on canvas
    const textElement = documentData.elements[0] as TextElement;
    ctx.textBaseline = 'top';
    ctx.font = `${textElement.style.fontStyle} ${textElement.style.fontWeight} ${textElement.style.fontSize}px ${textElement.style.fontFamily}`;
    ctx.fillStyle = textElement.style.color;
    ctx.textAlign = textElement.style.textAlign as CanvasTextAlign;

    // Uncomment if you want to draw text on the canvas
    ctx.fillText(
      textElement.content,
      textElement.position.x,
      textElement.position.y
    );
  }, [documentData]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={1123}
      style={{
        display: 'block',
        background: '#ffffff',
        cursor: 'text',
      }}
      onClick={() => {
        const textarea = document.getElementById(
          'textEditor',
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          const len = textarea.value.length;
          textarea.setSelectionRange(len, len);
        }
      }}
    />
  );
}
