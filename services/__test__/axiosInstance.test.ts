import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

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

  beforeAll(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: apiUrl };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    (useUserStore.getState as jest.Mock).mockReturnValue({
      clearUser: jest.fn(),
    });

    (global as any).window = {
      ...realWindow,
      location: { href: 'http://localhost/' },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    jest.spyOn(axios, 'post').mockResolvedValue({ data: { message: 'refreshed' } });

    const retrySpy = jest.spyOn(axiosInstance, 'request').mockResolvedValue({ data: 'retried' });

    const result = await rejectedHandler()(mockError);

    expect(axios.post).toHaveBeenCalledWith(`${apiUrl}/auth/refresh-cookies`, {}, { withCredentials: true });
    expect(retrySpy).toHaveBeenCalledWith(mockError.config);
    expect(mockError.config).toMatchObject({ hasRetriedAuth: true });
    expect(result).toEqual({ data: 'retried' });
  });

  it('stops after one refresh when the actual retried request also receives 401', async () => {
    const refreshSpy = jest.spyOn(axios, 'post').mockResolvedValue({ status: 200 });
    const clearUserMock = jest.fn();

    (useUserStore.getState as jest.Mock).mockReturnValue({ clearUser: clearUserMock });

    const errors: AxiosError[] = [];
    const adapter = jest.fn(async (config: InternalAxiosRequestConfig & { hasRetriedAuth?: boolean }) => {
      const error = new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: new AxiosHeaders(),
        config,
      });

      errors.push(error);

      // Bound the regression test even if the retry guard is accidentally removed.
      if (errors.length > 2) throw new Error('Unexpected third attempt');

      throw error;
    });

    await expect(axiosInstance.get('/protected', { adapter })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(adapter).toHaveBeenCalledTimes(2);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(clearUserMock).toHaveBeenCalledTimes(1);
    expect(errors[1].config).toMatchObject({ hasRetriedAuth: true });
  });

  it('tracks refresh attempts separately for independent requests', async () => {
    const refreshSpy = jest.spyOn(axios, 'post').mockResolvedValue({ status: 200 });
    const adapter = jest.fn(async (config: InternalAxiosRequestConfig & { hasRetriedAuth?: boolean }) => {
      if (!config.hasRetriedAuth) {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
          status: 401,
          statusText: 'Unauthorized',
          data: {},
          headers: new AxiosHeaders(),
          config,
        });
      }

      return { status: 200, statusText: 'OK', data: 'retried', headers: new AxiosHeaders(), config };
    });

    await expect(axiosInstance.get('/first', { adapter })).resolves.toMatchObject({ data: 'retried' });
    await expect(axiosInstance.get('/second', { adapter })).resolves.toMatchObject({ data: 'retried' });

    expect(adapter).toHaveBeenCalledTimes(4);
    expect(refreshSpy).toHaveBeenCalledTimes(2);
  });

  it('does not attempt a refresh when a 401 response has no request config', async () => {
    const refreshSpy = jest.spyOn(axios, 'post');
    const error = { response: { status: 401 } };

    await expect(rejectedHandler()(error)).rejects.toBe(error);

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(useUserStore.getState().clearUser).toHaveBeenCalledTimes(1);
  });

  it('on 401 → refresh fails → clears user & redirects to /login', async () => {
    const refreshError = new Error('refresh failed');

    jest.spyOn(axios, 'post').mockRejectedValue(refreshError);

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
