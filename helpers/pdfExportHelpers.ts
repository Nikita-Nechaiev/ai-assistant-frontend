import jsPDF from 'jspdf';

export interface Segment {
  text: string;
  fontSize: number;
  lineHeight: number;
  width: number;
  op: any;
}

export interface PhysicalLine {
  segments: Segment[];
  maxLineHeight: number;
  totalWidth: number;
}

export const getSpaceWidth = (doc: jsPDF) => doc.getTextWidth(' ');

export const getFontProps = (op: any): { fontSize: number; lineHeight: number } => {
  const baseFontSize = 12;
  const baseLineHeight = 5;

  if (op.attributes?.header) {
    const headerLevel = op.attributes.header;

    switch (headerLevel) {
      case 1:
        return { fontSize: baseFontSize * 2.1, lineHeight: baseLineHeight * 2.1 };
      case 2:
        return { fontSize: baseFontSize * 1.48, lineHeight: baseLineHeight * 1.48 };
      case 3:
        return { fontSize: baseFontSize * 1.17, lineHeight: baseLineHeight * 1.17 };
      case 4:
        return { fontSize: baseFontSize, lineHeight: baseLineHeight };
      case 5:
        return { fontSize: baseFontSize * 0.87, lineHeight: baseLineHeight * 0.87 };
      case 6:
        return { fontSize: baseFontSize * 0.7, lineHeight: baseLineHeight * 0.7 };
      default:
        return { fontSize: baseFontSize, lineHeight: baseLineHeight };
    }
  }

  return { fontSize: baseFontSize, lineHeight: baseLineHeight };
};

export const setFontStyle = (op: any, doc: jsPDF) => {
  if (op.attributes?.bold && op.attributes?.italic) doc.setFont('helvetica', 'bolditalic');
  else if (op.attributes?.bold) doc.setFont('helvetica', 'bold');
  else if (op.attributes?.italic) doc.setFont('helvetica', 'italic');
  else doc.setFont('helvetica', 'normal');
};

export const groupOpsByLine = (ops: any[]): any[][] => {
  const lines: any[][] = [];
  let currentLine: any[] = [];

  const pushLine = (lineAttrs?: any) => {
    if (lineAttrs) currentLine.push({ insert: '', attributes: lineAttrs });

    lines.push(currentLine);
    currentLine = [];
  };

  for (const op of ops) {
    if (typeof op.insert === 'string') {
      const text = op.insert as string;

      if (text === '\n') {
        pushLine(op.attributes || {});
        continue;
      }

      if (text.includes('\n')) {
        const parts = text.split('\n');
        const doesEndsWithNewline = parts[parts.length - 1] === '';

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isLast = i === parts.length - 1;

          if (part !== '') currentLine.push({ ...op, insert: part });

          if (!isLast || doesEndsWithNewline) {
            pushLine(op.attributes || {});
          }
        }

        continue;
      }

      currentLine.push(op);
      continue;
    }

    if (op.insert?.image) {
      if (currentLine.length) pushLine();

      lines.push([op]);
    }
  }

  if (currentLine.length) lines.push(currentLine);

  return lines;
};

export const getListType = (ops: any[]): 'ordered' | 'bullet' | null => {
  const listOp = ops.find((o) => o?.attributes?.list);

  return listOp ? (listOp.attributes.list as 'ordered' | 'bullet') : null;
};

export const isValidColor = (value?: string): value is string => typeof value === 'string' && value !== 'initial';

export const getHdrLevel = (ops: any[] | undefined) => {
  if (!ops || !ops.length) return 0;

  const h = ops.find((o) => o.attributes?.header);

  return h ? (h.attributes.header as number) : 0;
};

export const LH: { [key: number]: number } = {
  0: 0,
  1: 10.5,
  2: 7.4,
  3: 5.9,
  4: 5,
  5: 4.35,
  6: 3.5,
};

export const getBottomFix = (curLvl: number) => (curLvl > 0 ? LH[curLvl] : 0);

export const getExtraSpacing = (ops: any[]): { topAdd: number } => {
  const hdrOp = ops.find((o) => o.attributes?.header);

  if (!hdrOp) return { topAdd: 2 };

  return { topAdd: LH[hdrOp.attributes.header] };
};

export const processTextGroup = (lineOps: any[], doc: jsPDF, availableWidthTotal: number): PhysicalLine[] => {
  const physicalLines: PhysicalLine[] = [];
  let currentLine: PhysicalLine = { segments: [], maxLineHeight: 0, totalWidth: 0 };

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

    let textRemaining = op.insert as string;

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

      if (textRemaining.length > 0) pushCurrentLine();
    }
  }

  pushCurrentLine();

  return physicalLines;
};
