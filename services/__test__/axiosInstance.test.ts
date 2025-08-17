import axios from 'axios';

import { useUserStore } from '@/store/useUserStore';

import axiosInstance from '../axiosInstance';

jest.mock('@/store/useUserStore', () => ({
  useUserStore: {
    getState: jest.fn(),
  },
}));

const rejectedHandler = () =>
  (axiosInstance as any).interceptors.response.handlers[0].rejected as (err: any) => Promise<unknown>;

describe('axiosInstance response interceptor', () => {
  const apiUrl = 'http://fake-api.test';
  const originalEnv = process.env;
  const realWindow = window;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: apiUrl };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (useUserStore.getState as jest.Mock).mockReturnValue({
      clearUser: jest.fn(),
    });

    (global as any).window = {
      ...realWindow,
      location: { href: 'http://localhost/' },
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    (global as any).window = realWindow;
  });

  it('passes successful responses through untouched', () => {
    const response = { data: 'OK' };
    const fulfilled = (axiosInstance as any).interceptors.response.handlers[0].fulfilled as (res: unknown) => unknown;

    expect(fulfilled(response)).toBe(response);
  });

  it('on 401 → refresh succeeds → retries original request', async () => {
    const mockError = {
      response: { status: 401 },
      config: { url: '/protected', method: 'get' },
    };

    jest.spyOn(axios, 'get').mockResolvedValue({ data: { message: 'refreshed' } });

    const retrySpy = jest.spyOn(axiosInstance, 'request').mockResolvedValue({ data: 'retried' });

    const result = await rejectedHandler()(mockError);

    expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/auth/refresh-cookies`, { withCredentials: true });
    expect(retrySpy).toHaveBeenCalledWith(mockError.config);
    expect(result).toEqual({ data: 'retried' });
  });

  it('on 401 → refresh fails → clears user & redirects to /login', async () => {
    const refreshError = new Error('refresh failed');

    jest.spyOn(axios, 'get').mockRejectedValue(refreshError);

    const clearUserMock = jest.fn();

    (useUserStore.getState as jest.Mock).mockReturnValue({ clearUser: clearUserMock });

    const mockError = { response: { status: 401 }, config: {} };

    await expect(rejectedHandler()(mockError)).rejects.toThrow('refresh failed');

    expect(clearUserMock).toHaveBeenCalledTimes(1);
  });

  it('propagates non-401 errors untouched', async () => {
    const otherError = { response: { status: 500 } };

    await expect(rejectedHandler()(otherError)).rejects.toBe(otherError);
  });
});
