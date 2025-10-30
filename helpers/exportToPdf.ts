import jsPDF from 'jspdf';
import { DeltaStatic } from 'react-quill-new';

import { SnackbarStatusEnum } from '@/models/enums';

import type { PhysicalLine } from './pdfExportHelpers';
import {
  getSpaceWidth,
  setFontStyle,
  groupOpsByLine,
  getListType,
  isValidColor,
  getHdrLevel,
  getBottomFix,
  getExtraSpacing,
  processTextGroup,
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
    const availableWidthTotal = pageWidth - leftMargin - rightMargin;
    let y = 20;

    const SPACE_W = getSpaceWidth(doc);

    let orderedListCounter = 1;
    let lastListType: 'ordered' | 'bullet' | null = null;

    const linesGroups = groupOpsByLine(quillDelta.ops);

    for (let i = 0; i < linesGroups.length; i++) {
      let lineOps = linesGroups[i];

      const curLvl = getHdrLevel(lineOps);
      const { topAdd } = getExtraSpacing(lineOps);

      const isEmptyLine = lineOps.every((op: any) => op.insert === '');

      if (isEmptyLine) {
        y += 7;

        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        continue;
      }

      const firstNonEmptyOp = lineOps.find((op: any) => op.insert !== '');
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

      y += topAdd;

      const alignment = firstNonEmptyOp?.attributes?.align || 'left';
      const physicalLines: PhysicalLine[] = processTextGroup(lineOps, doc, availableWidthTotal);

      for (let j = 0; j < physicalLines.length; j++) {
        const physLine = physicalLines[j];
        const isLast = j === physicalLines.length - 1;

        let offsetX = leftMargin + SPACE_W;

        if (alignment === 'center') {
          offsetX = leftMargin + (availableWidthTotal - physLine.totalWidth) / 2;
        } else if (alignment === 'right') {
          offsetX = leftMargin + (availableWidthTotal - physLine.totalWidth);
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

        if (isLast) y -= getBottomFix(curLvl);

        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      }
    }

    doc.save(`${documentTitle}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    setSnackbar('Error while exporting the document', SnackbarStatusEnum.ERROR);
  }
};
