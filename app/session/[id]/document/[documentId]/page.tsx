'use client';
import React, { useState } from 'react';
import { DocumentData, TextStyle } from '@/models/models';
import ExportButton from '@/components/Document/ExportButton';
import DocumentCanvas from '@/components/Document/DocumentCanvas';
import TextAreaOverlay from '@/components/Document/TextAreaOverlay';
import TextStylePanel from '@/components/Document/TextStylePanel';

export default function DocumentPage() {
  // Document state
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: 'My Document',
    createdAt: new Date(),
    lastUpdated: new Date(),
    elements: [
      {
        id: 'text-1',
        type: 'text',
        content: '',
        position: { x: 40, y: 40 },
        style: {
          fontFamily: 'Arial',
          fontSize: 20,
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
          color: '#000000',
          textAlign: 'left',
        },
      },
    ],
  });

  // Update document content
  const handleTextChange = (newContent: string) => {
    setDocumentData((prev) => ({
      ...prev,
      lastUpdated: new Date(),
      elements: prev.elements.map((el) =>
        el.id === 'text-1' ? { ...el, content: newContent } : el,
      ),
    }));
  };

  // Update text style
  const handleStyleChange = (newStyle: Partial<TextStyle>) => {
    setDocumentData((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id === 'text-1' && el.type === 'text') {
          return {
            ...el,
            style: {
              ...el.style,
              ...newStyle,
            } as TextStyle, // Ensure the type is narrowed
          };
        }
        return el; // Return unchanged element
      }),
    }));
  };

  return (
    <div className='p-4'>
      {/* Title and Style Panel */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold mb-2'>{documentData.title}</h1>
        <TextStylePanel
          currentStyle={
            documentData.elements.find(
              (el) => el.id === 'text-1' && el.type === 'text',
            )?.style as TextStyle
          }
          onStyleChange={handleStyleChange}
        />
      </div>

      {/* Export Button */}
      <ExportButton documentData={documentData} />

      {/* Document Wrapper */}
      <div className='flex justify-center'>
        <div className='relative' style={{ width: 800, height: 1123 }}>
          {/* Canvas for rendering background or additional content */}
          <DocumentCanvas documentData={documentData} />

          {/* TextArea Overlay for input */}
          <TextAreaOverlay
            documentData={documentData}
            onChange={handleTextChange}
          />
        </div>
      </div>
    </div>
  );
}
