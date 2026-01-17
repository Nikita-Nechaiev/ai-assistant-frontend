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

export const getFontProps = (op: any): { fontSize: number; lineHeight: number } => {
  const baseFontSize = 12;
  const baseLineHeight = 5;

  const headerLevel = op.attributes?.header;

  if (headerLevel) {
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

export const getLineAttrs = (lineOps: any[]): any | undefined =>
  lineOps.find((o) => o?.insert === '' && o?.attributes)?.attributes;

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

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];

          if (part !== '') currentLine.push({ ...op, insert: part });

          pushLine(op.attributes || {});
        }

        const lastPart = parts[parts.length - 1];

        if (lastPart !== '') currentLine.push({ ...op, insert: lastPart });

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

export const getExtraSpacing = (
  ops: any[],
  prevLineHeight?: number | null,
  isFirstOnPage?: boolean,
): { topAdd: number; bottomAdd: number; curLineHeight: number } => {
  const lineAttrs = getLineAttrs(ops);
  const lvl = lineAttrs?.header ? (lineAttrs.header as number) : 0;

  const { lineHeight: curLineHeight } = lvl ? getFontProps({ attributes: { header: lvl } }) : getFontProps({});

  if (!lvl || lvl === 4) {
    return { topAdd: 0, bottomAdd: 0, curLineHeight };
  }

  const topK: Record<number, number> = { 1: 0.6, 2: 0.55, 3: 0.5, 5: 0.45, 6: 0.4 };
  const bottomK: Record<number, number> = { 1: 0.28, 2: 0.26, 3: 0.24, 5: 0.22, 6: 0.2 };

  const bottomAdd = Math.max(0.9, curLineHeight * (bottomK[lvl] ?? 0.24));

  let topAdd = 0;

  const hasPrev = typeof prevLineHeight === 'number';
  const isPrevSmaller = hasPrev && (prevLineHeight as number) < curLineHeight;

  if (!isFirstOnPage && isPrevSmaller) {
    topAdd = Math.max(1.2, curLineHeight * (topK[lvl] ?? 0.5));
  }

  return { topAdd, bottomAdd, curLineHeight };
};

export const processTextGroup = (lineOps: any[], doc: jsPDF, availableWidthTotal: number): PhysicalLine[] => {
  const physicalLines: PhysicalLine[] = [];
  let currentLine: PhysicalLine = { segments: [], maxLineHeight: 0, totalWidth: 0 };

  const lineAttrs = getLineAttrs(lineOps);

  const pushCurrentLine = () => {
    if (currentLine.segments.length > 0) {
      physicalLines.push(currentLine);
      currentLine = { segments: [], maxLineHeight: 0, totalWidth: 0 };
    }
  };

  for (const op of lineOps) {
    if (op.insert === '') continue;

    const effectiveOp =
      lineAttrs?.header && !op.attributes?.header
        ? { ...op, attributes: { ...(op.attributes || {}), header: lineAttrs.header } }
        : op;

    const { fontSize, lineHeight: opLineHeight } = getFontProps(effectiveOp);

    doc.setFontSize(fontSize);
    setFontStyle(effectiveOp, doc);

    let textRemaining = effectiveOp.insert as string;

    while (textRemaining.length > 0) {
      const availableSpace = availableWidthTotal - currentLine.totalWidth;

      let fitText = '';
      let fitWidth = 0;

      let lastSpaceIndex = -1;

      for (let i = 0; i < textRemaining.length; i++) {
        const char = textRemaining[i];
        const charWidth = doc.getTextWidth(char);

        if (fitWidth + charWidth > availableSpace) break;

        fitText += char;
        fitWidth += charWidth;

        if (char === ' ') lastSpaceIndex = i;
      }

      const didOverflow = fitText.length < textRemaining.length;

      let displayText = fitText;
      let consumedLen = fitText.length;

      if (didOverflow && lastSpaceIndex !== -1) {
        displayText = textRemaining.slice(0, lastSpaceIndex).trimEnd();
        consumedLen = lastSpaceIndex + 1;
        fitWidth = doc.getTextWidth(displayText);
      }

      if (displayText === '') {
        displayText = textRemaining[0];
        consumedLen = 1;
        fitWidth = doc.getTextWidth(displayText);
      }

      const segment: Segment = {
        text: displayText,
        fontSize,
        lineHeight: opLineHeight,
        width: fitWidth,
        op: effectiveOp,
      };

      currentLine.segments.push(segment);
      currentLine.totalWidth += fitWidth;
      currentLine.maxLineHeight = Math.max(currentLine.maxLineHeight, opLineHeight);

      textRemaining = textRemaining.substring(consumedLen);

      if (didOverflow && lastSpaceIndex !== -1) {
        textRemaining = textRemaining.replace(/^ +/, '');
      }

      if (textRemaining.length > 0) pushCurrentLine();
    }
  }

  pushCurrentLine();

  return physicalLines;
};
