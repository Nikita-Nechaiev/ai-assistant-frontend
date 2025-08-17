import { renderHook, act } from '@testing-library/react';
import type { DeltaStatic } from 'react-quill-new';

jest.mock('react-quill-new', () => ({
  Quill: class {},
}));

const convertSpy = jest.fn<DeltaStatic, any[]>();

jest.mock('@/helpers/documentHelpers', () => ({
  convertRichContentToDelta: (...a: any[]) => convertSpy(...a),
}));

jest.mock('@/hooks/common/useDebouncedCallback', () => ({
  __esModule: true,
  default: (fn: (...a: any[]) => void) => fn,
}));

import useEditorState from '../useEditorState';

const doc = (rich = '<p>hello</p>') => ({ id: 1, richContent: rich }) as any;

describe('useEditorState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initialises delta and localContent from currentDocument', () => {
    const fakeDelta = { ops: [] } as unknown as DeltaStatic;

    convertSpy.mockReturnValue(fakeDelta);

    const { result } = renderHook(() =>
      useEditorState({
        currentDocument: doc('<p>x</p>'),
        previewContent: '',
        isUserCanEdit: true,
        changeContentAndSaveDocument: jest.fn(),
      }),
    );

    expect(convertSpy).toHaveBeenCalled();
    expect(result.current.localContent).toBe('<p>x</p>');
    expect(result.current.quillDelta).toBe(fakeDelta);
  });

  it('isReadOnly true when no edit permission or preview content', () => {
    const { result: r1 } = renderHook(() =>
      useEditorState({
        currentDocument: doc(),
        previewContent: '',
        isUserCanEdit: false,
        changeContentAndSaveDocument: jest.fn(),
      }),
    );

    expect(r1.current.isReadOnly).toBe(true);

    const { result: r2 } = renderHook(() =>
      useEditorState({
        currentDocument: doc(),
        previewContent: '<html/>',
        isUserCanEdit: true,
        changeContentAndSaveDocument: jest.fn(),
      }),
    );

    expect(r2.current.isReadOnly).toBe(true);
  });

  it('handleEditorChange saves only on user input and content changed', () => {
    const saveMock = jest.fn();
    const { result } = renderHook(() =>
      useEditorState({
        currentDocument: doc('<p>a</p>'),
        previewContent: '',
        isUserCanEdit: true,
        changeContentAndSaveDocument: saveMock,
      }),
    );

    act(() => result.current.handleEditorChange('<p>a</p>', {} as any, 'api'));
    expect(saveMock).not.toHaveBeenCalled();

    act(() => result.current.handleEditorChange('<p>a</p>', {} as any, 'user'));
    expect(saveMock).not.toHaveBeenCalled();

    act(() => result.current.handleEditorChange('<p>b</p>', {} as any, 'user'));
    expect(saveMock).toHaveBeenCalledWith('<p>b</p>');
    expect(result.current.localContent).toBe('<p>a</p>');
  });
});
