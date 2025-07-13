import { renderHook, act } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import useDocumentPage from '../useDocumentPage';

/* ─────────── child-hook stubs ─────────── */
const mockDocData = {
  currentDocument: { id: 1, name: 'A' } as any,
  versions: [{ id: 11 }] as any,
  newAiUsage: null,
  isFetchingAI: false,
  isLoadingPage: false,
  actions: {
    changeDocumentTitle: jest.fn(),
    changeContentAndSaveDocument: jest.fn(),
    applyVersion: jest.fn(),
    createDocumentAiUsage: jest.fn(),
    setNewAiUsage: jest.fn(),
  },
};

jest.mock('../useDocumentData', () => ({
  __esModule: true,
  default: jest.fn(() => mockDocData),
}));

const mockVersionDrawer = {
  previewContent: '<html />',
  open: jest.fn(),
  close: jest.fn(),
};

jest.mock('../useVersionDrawer', () => ({
  __esModule: true,
  default: jest.fn(() => mockVersionDrawer),
}));

/** Editor mock – we’ll mutate `isReadOnly` in tests as needed */
const mockEditor = {
  quillDelta: {},
  localContent: 'hi',
  isReadOnly: false,
  handleEditorChange: jest.fn(),
};

jest.mock('../useEditorState', () => ({
  __esModule: true,
  default: jest.fn(() => mockEditor),
}));

const mockAiBundles = {
  overlay: { isActive: false } as any,
  ai: { isOpen: false } as any,
};

jest.mock('../useDocumentAI', () => ({
  __esModule: true,
  default: jest.fn(() => mockAiBundles),
}));

/* ─────────── store mock for permissions ─────────── */
let permissions: PermissionEnum[] = [PermissionEnum.EDIT];

jest.mock('@/store/useSessionStore', () => ({
  useSessionStore: () => ({
    session: { permissions },
  }),
}));

/* ─────────── tests ─────────── */
describe('useDocumentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    permissions = [PermissionEnum.EDIT];
    mockEditor.isReadOnly = false;
  });

  it('exposes aggregated data from sub-hooks', () => {
    const { result } = renderHook(() => useDocumentPage(1));

    expect(result.current.currentDocument).toBe(mockDocData.currentDocument);
    expect(result.current.previewContent).toBe(mockVersionDrawer.previewContent);
    expect(result.current.quillDelta).toBe(mockEditor.quillDelta);
    expect(result.current.overlay).toBe(mockAiBundles.overlay);
    expect(result.current.ai).toBe(mockAiBundles.ai);
    expect(result.current.isReadOnly).toBe(false); // permission includes EDIT
  });

  it('sets isReadOnly = true when user lacks EDIT permission', () => {
    permissions = []; // user can’t edit
    mockEditor.isReadOnly = true; // editor will reflect that

    const { result } = renderHook(() => useDocumentPage(1));

    expect(result.current.isReadOnly).toBe(true);
  });

  it('handleSaveTitle delegates to changeDocumentTitle action', () => {
    const { result } = renderHook(() => useDocumentPage(1));

    act(() => result.current.handleSaveTitle('New'));
    expect(mockDocData.actions.changeDocumentTitle).toHaveBeenCalledWith('New');
  });
});
