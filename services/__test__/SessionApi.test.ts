import type { ISessionItem, ICollaborationSession } from '@/models/models';

import axiosInstance from '../axiosInstance';
import { SessionApi } from '../SessionApi';

jest.mock('../axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('SessionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserSessions', () => {
    it('hits the correct endpoint with page & search params and returns data', async () => {
      const fakeSessions = [{ id: 1, name: 'Foo' }] as unknown as ISessionItem[];

      mockedAxios.get.mockResolvedValueOnce({ data: fakeSessions });

      const result = await SessionApi.fetchUserSessions(2, 'bar');

      expect(mockedAxios.get).toHaveBeenCalledWith('/collaboration-session/get-user-sessions', {
        params: { page: 2, search: 'bar' },
      });
      expect(result).toBe(fakeSessions);
    });

    it('uses default params when none are supplied', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await SessionApi.fetchUserSessions();

      expect(mockedAxios.get).toHaveBeenCalledWith('/collaboration-session/get-user-sessions', {
        params: { page: 1, search: '' },
      });
    });
  });

  describe('createSession', () => {
    it('trims the name and returns the created session', async () => {
      const newSession = { id: 42, name: 'My session' } as unknown as ICollaborationSession;

      mockedAxios.post.mockResolvedValueOnce({ data: newSession });

      const result = await SessionApi.createSession('  My session  ');

      expect(mockedAxios.post).toHaveBeenCalledWith('/collaboration-session/create', { name: 'My session' });
      expect(result).toBe(newSession);
    });
  });
});
