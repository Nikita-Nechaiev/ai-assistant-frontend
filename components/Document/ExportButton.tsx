'use client';
import React from 'react';
import { jsPDF } from 'jspdf';
import { DocumentData, TextElement } from '@/models/models';

interface ExportButtonProps {
  documentData: DocumentData;
  label?: string;
}

export default function ExportButton({
  documentData,
  label,
}: ExportButtonProps) {
  const exportPDF = () => {
    const pdf = new jsPDF({
      unit: 'px',
      format: [800, 1123], // match the "document" dimensions
    });

    // "Replay" each text element onto the PDF
    documentData.elements.forEach((element) => {
      if (element.type === 'text') {
        const textElement = element as TextElement;
        const { fontFamily, fontSize, color } = textElement.style;

        pdf.setFont(fontFamily);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color);

        // If you’re line-wrapping in the canvas, do the same wrapping for PDF or
        // simply place the text. This example just places the raw text at top-left:
        pdf.text(textElement.content, 50, 50);
      }
    });

    pdf.save(`${documentData.title || 'document'}.pdf`);
  };

  return (
    <button
      onClick={exportPDF}
      className='mb-4 px-4 py-2 bg-blue-500 text-white rounded'
    >
      {label || 'Export as PDF'}
    </button>
  );
}
