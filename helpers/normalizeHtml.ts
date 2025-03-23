import { Quill as QuillType } from 'react-quill-new';

export const normalizeHTML = (html: string): string => {
  const tempQuill = new QuillType(document.createElement('div'));

  const delta = tempQuill.clipboard.convert({ html });

  tempQuill.setContents(delta);
  return tempQuill.root.innerHTML;
};
