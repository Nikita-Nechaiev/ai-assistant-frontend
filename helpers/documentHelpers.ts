import { Quill as QuillType } from 'react-quill-new';

const TEMP_SPACE_CHAR = '₴';

export function replaceMultipleSpacesWithChar(input: string): string {
  return input.replace(/ {2,}/g, (spaces) => TEMP_SPACE_CHAR.repeat(spaces.length));
}

export function restoreSpacesFromChar(input: string): string {
  return input.replace(new RegExp(TEMP_SPACE_CHAR, 'g'), ' ');
}

export function convertRichContentToDelta(richContent: string, quill: typeof QuillType) {
  const htmlWithTempSpaces = replaceMultipleSpacesWithChar(richContent);

  const tempQuill = new quill(document.createElement('div'));
  const delta = tempQuill.clipboard.convert({ html: htmlWithTempSpaces });

  const fixedOps = delta.ops.map((op) => {
    if (typeof op.insert === 'string') {
      return {
        ...op,
        insert: op.insert.replace(new RegExp(TEMP_SPACE_CHAR, 'g'), ' '),
      };
    }

    return op;
  });

  const QuillDelta = quill.import('delta');

  return new QuillDelta(fixedOps);
}
