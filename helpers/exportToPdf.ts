import jsPDF from 'jspdf';
import { DeltaStatic } from 'react-quill-new';

import { SnackbarStatusEnum } from '@/models/enums';

interface Segment {
  text: string;
  fontSize: number;
  lineHeight: number;
  width: number;
  op: any;
}

interface PhysicalLine {
  segments: Segment[];
  maxLineHeight: number;
  totalWidth: number;
}

const SPACE_W = new jsPDF({ unit: 'mm' }).getTextWidth(' ');

export const exportToPDF = async (
  documentTitle: string,
  quillDelta: DeltaStatic | null,
  setSnackbar: (message: string, status: SnackbarStatusEnum) => void,
) => {
  const getFontProps = (op: any): { fontSize: number; lineHeight: number } => {
    const baseFontSize = 12;
    const baseLineHeight = 5;

    if (op.attributes?.header) {
      const headerLevel = op.attributes.header;

      switch (headerLevel) {
        case 1:
          return { fontSize: baseFontSize * 2.1, lineHeight: baseLineHeight * 2.1 };
        case 2:
          return {
            fontSize: baseFontSize * 1.48,
            lineHeight: baseLineHeight * 1.48,
          };
        case 3:
          return {
            fontSize: baseFontSize * 1.17,
            lineHeight: baseLineHeight * 1.17,
          };
        case 4:
          return { fontSize: baseFontSize, lineHeight: baseLineHeight };
        case 5:
          return {
            fontSize: baseFontSize * 0.87,
            lineHeight: baseLineHeight * 0.87,
          };
        case 6:
          return {
            fontSize: baseFontSize * 0.7,
            lineHeight: baseLineHeight * 0.7,
          };
        default:
          return { fontSize: baseFontSize, lineHeight: baseLineHeight };
      }
    }

    return { fontSize: baseFontSize, lineHeight: baseLineHeight };
  };

  const setFontStyle = (op: any, doc: jsPDF) => {
    if (op.attributes?.bold && op.attributes?.italic) {
      doc.setFont('helvetica', 'bolditalic');
    } else if (op.attributes?.bold) {
      doc.setFont('helvetica', 'bold');
    } else if (op.attributes?.italic) {
      doc.setFont('helvetica', 'italic');
    } else {
      doc.setFont('helvetica', 'normal');
    }
  };

  const groupOpsByLine = (ops: any[]): any[][] => {
    const lines: any[][] = [];
    let currentLine: any[] = [];

    for (const op of ops) {
      if (typeof op.insert === 'string') {
        const parts = op.insert.split('\n');

        for (let index = 0; index < parts.length; index++) {
          const part = parts[index];

          currentLine.push({ ...op, insert: part });

          if (index < parts.length - 1) {
            lines.push(currentLine);
            currentLine = [];
          }
        }
      } else if (op.insert && op.insert.image) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }

        lines.push([op]);
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  };

  const isValidColor = (value?: string): value is string => typeof value === 'string' && value !== 'initial';

  const getHdrLevel = (ops: any[] | undefined) => {
    if (!ops || !ops.length) return 0;

    const h = ops.find((o) => o.attributes?.header);

    return h ? (h.attributes.header as number) : 0;
  };

  const LH: { [key: number]: number } = {
    0: 5,
    1: 10.5, // h1
    2: 7.4, // h2
    3: 5.9, // h3
    4: 5,
    5: 4.35,
    6: 3.5,
  };

  const getBottomFix = (curLvl: number) => {
    return LH[curLvl];
  };

  const getExtraSpacing = (ops: any[]): { topAdd: number } => {
    const hdrOp = ops.find((o) => o.attributes?.header);

    if (!hdrOp) {
      return { topAdd: 2 };
    }

    return { topAdd: LH[hdrOp.attributes.header] };
  };

  const processTextGroup = (lineOps: any[], doc: jsPDF, availableWidthTotal: number): PhysicalLine[] => {
    const physicalLines: PhysicalLine[] = [];
    let currentLine: PhysicalLine = {
      segments: [],
      maxLineHeight: 0,
      totalWidth: 0,
    };

    const pushCurrentLine = () => {
      if (currentLine.segments.length > 0) {
        physicalLines.push(currentLine);
        currentLine = { segments: [], maxLineHeight: 0, totalWidth: 0 };
      }
    };

    for (const op of lineOps) {
      if (op.insert === '') continue;

      const { fontSize, lineHeight: opLineHeight } = getFontProps(op);

      doc.setFontSize(fontSize);
      setFontStyle(op, doc);

      let textRemaining = op.insert;

      while (textRemaining.length > 0) {
        const availableSpace = availableWidthTotal - currentLine.totalWidth;
        let fitText = '';
        let fitWidth = 0;
        let lastSpaceIndex = -1;
        let lastSpaceFitText = '';
        let lastSpaceFitWidth = 0;

        for (let i = 0; i < textRemaining.length; i++) {
          const char = textRemaining[i];
          const charWidth = doc.getTextWidth(char);

          if (fitWidth + charWidth > availableSpace) break;

          fitText += char;
          fitWidth += charWidth;

          if (char === ' ') {
            lastSpaceIndex = i;
            lastSpaceFitText = fitText;
            lastSpaceFitWidth = fitWidth;
          }
        }

        if (lastSpaceIndex !== -1 && fitText.trim().length !== textRemaining.trim().length) {
          fitText = lastSpaceFitText.trimEnd();
          fitWidth = lastSpaceFitWidth;
        }

        if (fitText === '') {
          fitText = textRemaining[0];
          fitWidth = doc.getTextWidth(fitText);
        }

        const segment: Segment = {
          text: fitText,
          fontSize,
          lineHeight: opLineHeight,
          width: fitWidth,
          op,
        };

        currentLine.segments.push(segment);
        currentLine.totalWidth += fitWidth;
        currentLine.maxLineHeight = Math.max(currentLine.maxLineHeight, opLineHeight);

        textRemaining = textRemaining.substring(fitText.length);

        if (textRemaining.length > 0) {
          pushCurrentLine();
        }
      }
    }

    pushCurrentLine();

    return physicalLines;
  };

  try {
    if (!quillDelta || !quillDelta.ops?.length) {
      setSnackbar('No content for export', SnackbarStatusEnum.ERROR);

      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.width;
    const leftMargin = 10;
    const rightMargin = 10;
    const availableWidthTotal = pageWidth - leftMargin - rightMargin;
    let y = 20;

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
      const listType = firstNonEmptyOp?.attributes?.list || null;

      if (listType === 'ordered') {
        if (lastListType !== 'ordered') {
          orderedListCounter = 1;
        }

        lineOps = [
          {
            insert: `${orderedListCounter}. `,
            attributes: { bold: false },
          },
          ...lineOps,
        ];
        orderedListCounter += 1;
        lastListType = 'ordered';
      } else if (listType === 'bullet') {
        lineOps = [
          {
            insert: '• ',
            attributes: { bold: false },
          },
          ...lineOps,
        ];

        if (lastListType === 'ordered') {
          orderedListCounter = 1;
        }

        lastListType = 'bullet';
      } else {
        if (lastListType === 'ordered') {
          orderedListCounter = 1;
        }

        lastListType = null;
      }

      y += topAdd;

      const alignment = firstNonEmptyOp?.attributes?.align || 'left';
      const physicalLines = processTextGroup(lineOps, doc, availableWidthTotal);

      for (let j = 0; j < physicalLines.length; j++) {
        const physLine = physicalLines[j];
        const isLast = j === physicalLines.length - 1;

        let offsetX = leftMargin;

        offsetX += SPACE_W;

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

          // Underline
          if (segment.op.attributes?.underline) {
            const underlineY = y + segment.lineHeight * 0.15;

            doc.setLineWidth(isHeader123 ? 0.75 : 0.35);
            doc.line(offsetX, underlineY, offsetX + segment.width, underlineY);
            doc.setLineWidth(0.75);
          }

          // Strike
          if (segment.op.attributes?.strike) {
            const strikeY = y - segment.lineHeight * 0.25;

            doc.setLineWidth(isHeader123 ? 0.75 : 0.35);
            doc.line(offsetX, strikeY, offsetX + segment.width, strikeY);
            doc.setLineWidth(0.75);
          }

          offsetX += segment.width;
        }

        y += physLine.maxLineHeight;

        if (isLast) {
          y -= getBottomFix(curLvl);
        }

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
