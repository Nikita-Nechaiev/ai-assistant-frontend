'use client';
import React from 'react';
import { DocumentData, TextElement } from '@/models/models';

interface TextAreaOverlayProps {
  documentData: DocumentData;
  onChange: (newContent: string) => void;
}

export default function TextAreaOverlay({
  documentData,
  onChange,
}: TextAreaOverlayProps) {
  const textElement = documentData.elements[0] as TextElement;

  return (
    <textarea
      id='textEditor'
      value={textElement.content}
      onChange={(e) => onChange(e.target.value)}
      style={{
        position: 'absolute',
        left: textElement.position.x,
        top: textElement.position.y,
        width: 800 - 80,
        height: 1123 - 80,
        border: 'none',
        outline: 'none',
        resize: 'none',
        background: 'transparent',
        fontFamily: textElement.style.fontFamily,
        fontSize: textElement.style.fontSize,
        lineHeight: '26px',
        color: textElement.style.color,
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        padding: 0,
      }}
    />
  );
}
