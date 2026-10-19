import jsPDF from 'jspdf';

import {
  getFontProps,
  setFontStyle,
  getLineAttrs,
  groupOpsByLine,
  getListType,
  isValidColor,
  getExtraSpacing,
  processTextGroup,
} from '../pdfExportHelpers';
import { exportToPDF } from '../exportToPdf';
import { convertRichContentToDelta, replaceMultipleSpacesWithChar, restoreSpacesFromChar } from '../documentHelpers';

jest.mock('jspdf', () => ({ __esModule: true, default: jest.fn() }));

const pdf = () => ({
  internal: { pageSize: { width: 210 } },
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  getTextWidth: (text: string) => text.length,
  addPage: jest.fn(),
  setTextColor: jest.fn(),
  setDrawColor: jest.fn(),
  setFillColor: jest.fn(),
  rect: jest.fn(),
  text: jest.fn(),
  setLineWidth: jest.fn(),
  line: jest.fn(),
  save: jest.fn(),
});

it.each([
  [undefined, 12],
  [1, 25.2],
  [2, 17.759999999999998],
  [3, 14.04],
  [4, 12],
  [5, 10.44],
  [6, 8.399999999999999],
  [9, 12],
])('maps header %s to a font size', (header, size) => {
  expect(getFontProps({ attributes: { header } }).fontSize).toBeCloseTo(size);
});
it('uses combined font styles and safely handles absent attributes', () => {
  const doc = pdf();

  for (const [attributes, style] of [
    [{}, 'normal'],
    [{ bold: true }, 'bold'],
    [{ italic: true }, 'italic'],
    [{ bold: true, italic: true }, 'bolditalic'],
  ] as const) {
    setFontStyle({ attributes }, doc as any);
    expect(doc.setFont).toHaveBeenLastCalledWith('helvetica', style);
  }

  setFontStyle({}, doc as any);
  expect(doc.setFont).toHaveBeenLastCalledWith('helvetica', 'normal');
});
it('splits logical lines, carries line attributes and isolates images', () => {
  const lines = groupOpsByLine([
    { insert: 'one\ntwo\n', attributes: { bold: true } },
    { insert: '\n' },
    { insert: 'before' },
    { insert: { image: 'image.png' } },
    { insert: 'after' },
    { insert: { video: 'ignore' } },
  ]);

  expect(lines[0]).toContainEqual({ insert: 'one', attributes: { bold: true } });
  expect(lines[1]).toContainEqual({ insert: 'two', attributes: { bold: true } });
  expect(lines).toContainEqual([{ insert: { image: 'image.png' } }]);
  expect(lines.at(-1)).toEqual([{ insert: 'after' }]);
  expect(getLineAttrs([{ insert: '', attributes: { header: 2 } }])).toEqual({ header: 2 });
  expect(getLineAttrs([])).toBeUndefined();
  expect(getListType([{ insert: 'a', attributes: { list: 'ordered' } }])).toBe('ordered');
  expect(getListType([])).toBeNull();
  expect(isValidColor('#123456')).toBe(true);
  expect(isValidColor('initial')).toBe(false);
  expect(isValidColor()).toBe(false);
});
it('adds spacing before larger headings only when they follow a smaller line', () => {
  expect(getExtraSpacing([])).toEqual({ topAdd: 0, bottomAdd: 0, curLineHeight: 5 });
  expect(getExtraSpacing([{ insert: '', attributes: { header: 4 } }], 5, false).topAdd).toBe(0);

  for (const header of [1, 2, 3, 5, 6, 9]) {
    const ops = [{ insert: '', attributes: { header } }];

    expect(getExtraSpacing(ops, 1, false).topAdd).toBeGreaterThan(0);
    expect(getExtraSpacing(ops, 1, true).topAdd).toBe(0);
    expect(getExtraSpacing(ops, null, false).topAdd).toBe(0);
    expect(getExtraSpacing(ops, 99, false).topAdd).toBe(0);
    expect(getExtraSpacing(ops).bottomAdd).toBeGreaterThan(0);
  }
});
it('wraps words and long tokens, retaining styling and propagating line headings', () => {
  const doc = pdf();
  const lines = processTextGroup(
    [
      { insert: 'one two three', attributes: { bold: true } },
      { insert: '', attributes: { header: 2 } },
    ],
    doc as any,
    8,
  );

  expect(lines.map((line) => line.segments.map((s) => s.text).join(''))).toEqual(['one two', 'three']);
  expect(lines[0].segments[0].op.attributes.header).toBe(2);
  expect(processTextGroup([{ insert: 'abcdefgh' }], doc as any, 3).map((line) => line.segments[0].text)).toEqual([
    'abc',
    'def',
    'gh',
  ]);
  expect(processTextGroup([{ insert: 'a' }], doc as any, 0)[0].segments[0].text).toBe('a');
  expect(processTextGroup([{ insert: '' }], doc as any, 3)).toEqual([]);
  expect(
    processTextGroup(
      [
        { insert: 'x', attributes: { header: 1 } },
        { insert: '', attributes: { header: 2 } },
      ],
      doc as any,
      8,
    )[0].segments[0].op.attributes.header,
  ).toBe(1);
});
it('preserves consecutive spaces during Quill conversion and leaves embedded content intact', () => {
  const input = '<p>a  b</p>';

  expect(restoreSpacesFromChar(replaceMultipleSpacesWithChar(input))).toBe(input);

  const convert = jest.fn().mockReturnValue({ ops: [{ insert: 'a₴₴b' }, { insert: { image: 'x' } }] });
  const Delta = jest.fn().mockImplementation((ops) => ({ ops }));
  const Quill: any = jest.fn().mockImplementation(() => ({ clipboard: { convert } }));

  Quill.import = () => Delta;

  const result = convertRichContentToDelta(input, Quill);

  expect(convert).toHaveBeenCalledWith({ html: '<p>a₴₴b</p>' });
  expect(result.ops).toEqual([{ insert: 'a  b' }, { insert: { image: 'x' } }]);
});
it('rejects empty export content without creating a PDF', async () => {
  const snack = jest.fn();

  await exportToPDF('Empty', null, snack);
  await exportToPDF('Empty', { ops: [] } as any, snack);
  expect(snack).toHaveBeenCalledWith('No content for export', 'error');
});
it('exports lists, alignments, colors, underline/strike and page breaks', async () => {
  const doc = pdf();

  (jsPDF as unknown as jest.Mock).mockImplementation(() => doc);

  const ops: any[] = [];

  for (const [list, align, header] of [
    ['ordered', 'center', 1],
    ['ordered', 'right', 2],
    ['bullet', 'left', 4],
    [undefined, 'left', 6],
    ['ordered', 'left', 3],
    ['bullet', 'left', 5],
    ['ordered', 'left', 0],
    [undefined, 'left', 0],
  ]) {
    ops.push(
      {
        insert: 'Some formatted text',
        attributes: {
          bold: true,
          italic: true,
          underline: true,
          strike: true,
          color: '#123456',
          background: '#ffffff',
        },
      },
      { insert: '\n', attributes: { list, align, header } },
    );
  }

  ops.push({ insert: 'plain text\n' });
  ops.push({ insert: '\n'.repeat(60) });
  ops.push({ insert: 'A long line with lots of words. '.repeat(300) });
  await exportToPDF('Project', { ops } as any, jest.fn());
  expect(doc.save).toHaveBeenCalledWith('Project.pdf');
  expect(doc.addPage).toHaveBeenCalled();
  expect(doc.rect).toHaveBeenCalled();
  expect(doc.line).toHaveBeenCalled();
  expect(doc.setTextColor).toHaveBeenCalledWith('#123456');
  expect(doc.setTextColor).toHaveBeenCalledWith(0, 0, 0);
  expect(doc.text).toHaveBeenCalledWith('1. ', expect.any(Number), expect.any(Number), expect.any(Object));
});
it('reports PDF failures', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

  (jsPDF as unknown as jest.Mock).mockImplementation(() => {
    throw Error('PDF failed');
  });

  const snack = jest.fn();

  await exportToPDF('Failed', { ops: [{ insert: 'text' }] } as any, snack);
  expect(snack).toHaveBeenCalledWith('Error while exporting the document', 'error');
  spy.mockRestore();
});
