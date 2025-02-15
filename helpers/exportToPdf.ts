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

export const exportToPDF = async (
  documentTitle: string,
  quillDelta: DeltaStatic | null,
  setSnackbar: (message: string, status: SnackbarStatusEnum) => void,
) => {
  const loadImageDimensions = (
    imageData: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = (err) => reject(err);
      img.src = imageData;
    });
  };

  const getFontProps = (op: any): { fontSize: number; lineHeight: number } => {
    const baseFontSize = 13;
    const baseLineHeight = 5;
    if (op.attributes?.header) {
      const headerLevel = op.attributes.header;
      switch (headerLevel) {
        case 1:
          return { fontSize: baseFontSize * 2, lineHeight: baseLineHeight * 2 };
        case 2:
          return {
            fontSize: baseFontSize * 1.5,
            lineHeight: baseLineHeight * 1.5,
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
            fontSize: baseFontSize * 0.83,
            lineHeight: baseLineHeight * 0.83,
          };
        case 6:
          return {
            fontSize: baseFontSize * 0.67,
            lineHeight: baseLineHeight * 0.67,
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
        parts.forEach((part: string, index: number) => {
          currentLine.push({ ...op, insert: part });
          if (index < parts.length - 1) {
            lines.push(currentLine);
            currentLine = [];
          }
        });
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

  const processTextGroup = (
    lineOps: any[],
    doc: jsPDF,
    availableWidthTotal: number,
    leftMargin: number,
  ): PhysicalLine[] => {
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

        if (
          lastSpaceIndex !== -1 &&
          fitText.trim().length !== textRemaining.trim().length
        ) {
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
        currentLine.maxLineHeight = Math.max(
          currentLine.maxLineHeight,
          opLineHeight,
        );

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

    for (let lineOps of linesGroups) {
      if (
        lineOps.length === 1 &&
        lineOps[0].insert &&
        typeof lineOps[0].insert !== 'string' &&
        lineOps[0].insert.image
      ) {
        const op = lineOps[0];
        const imageData = op.insert.image;

        try {
          const { width: imgW, height: imgH } = await loadImageDimensions(
            imageData,
          );
          const scaledWidth = availableWidthTotal;
          const scaledHeight = (imgH / imgW) * scaledWidth;

          if (y + scaledHeight > 280) {
            doc.addPage();
            y = 20;
          }

          let imgType = 'JPEG';
          if (imageData.toLowerCase().indexOf('png') !== -1) {
            imgType = 'PNG';
          }

          doc.addImage(
            imageData,
            imgType,
            leftMargin,
            y,
            scaledWidth,
            scaledHeight,
          );
          y += scaledHeight;
        } catch (e) {
          console.error('Error loading image', e);
        }
        continue;
      }

      const isEmptyLine = lineOps.every((op: any) => op.insert === '');
      if (isEmptyLine) {
        y += 5;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        continue;
      }

      const firstNonEmptyOp = lineOps.find((op: any) => op.insert !== '');
      const alignment = firstNonEmptyOp?.attributes?.align || 'left';
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

      const physicalLines = processTextGroup(
        lineOps,
        doc,
        availableWidthTotal,
        leftMargin,
      );

      for (const physLine of physicalLines) {
        let offsetX = leftMargin;

        if (alignment === 'center') {
          offsetX =
            leftMargin + (availableWidthTotal - physLine.totalWidth) / 2;
        } else if (alignment === 'right') {
          offsetX = leftMargin + (availableWidthTotal - physLine.totalWidth);
        }

        for (const segment of physLine.segments) {
          doc.setFontSize(segment.fontSize);
          setFontStyle(segment.op, doc);

          if (segment.op.attributes?.color) {
            doc.setTextColor(segment.op.attributes.color);
            doc.setDrawColor(segment.op.attributes.color);
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
          }

          if (segment.op.attributes?.background) {
            doc.setFillColor(segment.op.attributes.background);
            doc.rect(
              offsetX,
              y - segment.lineHeight * 0.7,
              segment.width,
              segment.lineHeight,
              'F',
            );
          }

          doc.text(segment.text, offsetX, y, { align: 'left' });

          if (segment.op.attributes?.underline) {
            const underlineY = y + segment.lineHeight * 0.15;
            doc.setLineWidth(0.35);
            doc.line(offsetX, underlineY, offsetX + segment.width, underlineY);
            doc.setLineWidth(0.75);
          }

          if (segment.op.attributes?.strike) {
            const strikeY = y - segment.lineHeight * 0.3;
            const isBold = segment.op.attributes?.bold;
            doc.setLineWidth(isBold ? 0.75 : 0.35);
            doc.line(offsetX, strikeY, offsetX + segment.width, strikeY);
            doc.setLineWidth(0.75);
          }

          offsetX += segment.width;
        }

        y += physLine.maxLineHeight;

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
