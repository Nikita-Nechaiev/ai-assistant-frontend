import jsPDF from 'jspdf';
import { DeltaStatic } from 'react-quill-new';

import { SnackbarStatusEnum } from '@/models/enums';

import type { PhysicalLine } from './pdfExportHelpers';
import {
  setFontStyle,
  groupOpsByLine,
  getListType,
  isValidColor,
  getExtraSpacing,
  processTextGroup,
  getLineAttrs,
} from './pdfExportHelpers';

export const exportToPDF = async (
  documentTitle: string,
  quillDelta: DeltaStatic | null,
  setSnackbar: (message: string, status: SnackbarStatusEnum) => void,
) => {
  try {
    if (!quillDelta || !quillDelta.ops?.length) {
      setSnackbar('No content for export', SnackbarStatusEnum.ERROR);

      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.width;
    const leftMargin = 10;
    const rightMargin = 10;

    const textPad = 0.6;

    const contentLeft = leftMargin + textPad;
    const contentRight = rightMargin + textPad;

    const availableWidthTotal = pageWidth - contentLeft - contentRight;

    let y = 20;

    let prevLineHeight: number | null = null;
    let isFirstOnPage = true;

    let orderedListCounter = 1;
    let lastListType: 'ordered' | 'bullet' | null = null;

    const addPage = () => {
      doc.addPage();
      y = 20;
      prevLineHeight = null;
      isFirstOnPage = true;
    };

    const linesGroups = groupOpsByLine(quillDelta.ops);

    for (let i = 0; i < linesGroups.length; i++) {
      let lineOps = linesGroups[i];

      const isEmptyLine = lineOps.every((op: any) => op.insert === '');

      if (isEmptyLine) {
        y += 6;

        if (y > 280) addPage();

        continue;
      }

      const listType = getListType(lineOps);

      if (listType === 'ordered') {
        if (lastListType !== 'ordered') orderedListCounter = 1;

        lineOps = [{ insert: `${orderedListCounter}. `, attributes: { bold: false } }, ...lineOps];
        orderedListCounter += 1;
        lastListType = 'ordered';
      } else if (listType === 'bullet') {
        lineOps = [{ insert: '• ', attributes: { bold: false } }, ...lineOps];

        if (lastListType === 'ordered') orderedListCounter = 1;

        lastListType = 'bullet';
      } else {
        if (lastListType === 'ordered') orderedListCounter = 1;

        lastListType = null;
      }

      const lineAttrs = getLineAttrs(lineOps);
      const alignment = lineAttrs?.align || 'left';

      const { topAdd, bottomAdd, curLineHeight } = getExtraSpacing(lineOps, prevLineHeight, isFirstOnPage);

      y += topAdd;

      const physicalLines: PhysicalLine[] = processTextGroup(lineOps, doc, availableWidthTotal);

      for (let j = 0; j < physicalLines.length; j++) {
        const physLine = physicalLines[j];

        let offsetX = contentLeft;

        if (alignment === 'center') {
          offsetX = contentLeft + (availableWidthTotal - physLine.totalWidth) / 2;
        } else if (alignment === 'right') {
          offsetX = contentLeft + (availableWidthTotal - physLine.totalWidth);
        }

        for (const segment of physLine.segments) {
          doc.setFontSize(segment.fontSize);
          setFontStyle(segment.op, doc);

          const textColor = segment.op.attributes?.color;

          if (isValidColor(textColor)) {
            doc.setTextColor(textColor);
            doc.setDrawColor(textColor);
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
          }

          const bgColor = segment.op.attributes?.background;

          if (isValidColor(bgColor)) {
            const padding = segment.lineHeight * 0.12;
            const expand = segment.lineHeight * 0.05;

            const top = y - segment.lineHeight * 0.78 - expand + padding;
            const height = segment.lineHeight * 0.96 + expand * 2 - padding * 2;

            doc.setFillColor(bgColor);
            doc.rect(offsetX, top, segment.width, height, 'F');
          }

          doc.text(segment.text, offsetX, y, { align: 'left' });

          const isHeader123 = segment.op.attributes?.header && [1, 2, 3].includes(segment.op.attributes.header);

          if (segment.op.attributes?.underline) {
            const underlineY = y + segment.lineHeight * 0.15;

            doc.setLineWidth(isHeader123 ? 0.75 : 0.35);
            doc.line(offsetX, underlineY, offsetX + segment.width, underlineY);
            doc.setLineWidth(0.75);
          }

          if (segment.op.attributes?.strike) {
            const strikeY = y - segment.lineHeight * 0.25;

            doc.setLineWidth(isHeader123 ? 0.75 : 0.35);
            doc.line(offsetX, strikeY, offsetX + segment.width, strikeY);
            doc.setLineWidth(0.75);
          }

          offsetX += segment.width;
        }

        y += physLine.maxLineHeight;

        if (y > 280) addPage();
      }

      y += bottomAdd;
      prevLineHeight = curLineHeight;
      isFirstOnPage = false;

      if (y > 280) addPage();
    }

    doc.save(`${documentTitle}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    setSnackbar('Error while exporting the document', SnackbarStatusEnum.ERROR);
  }
};
