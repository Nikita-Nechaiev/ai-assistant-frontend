import axiosInstance from '../axiosInstance';
import { AiUsageApi } from '../AiUsageApi';
import { StatisticsApi } from '../StatisticsApi';
import { PublicInfoApi } from '../PublicInfoApi';

jest.mock('../axiosInstance', () => ({ __esModule: true, default: { get: jest.fn() } }));

const get = axiosInstance.get as jest.Mock;

afterEach(() => jest.restoreAllMocks());
it('fetches scoped dashboard statistics', async () => {
  get.mockResolvedValue({ data: { overview: { totalSessions: 0 } } });
  expect(await StatisticsApi.fetchDashboard()).toEqual({ overview: { totalSessions: 0 } });
  expect(get).toHaveBeenCalledWith('/statistics/dashboard', undefined);
});
it('passes pagination/search to AI history and fetches its summary', async () => {
  get.mockResolvedValue({ data: [] });
  await expect(AiUsageApi.fetchUsage()).resolves.toEqual([]);
  expect(get).toHaveBeenLastCalledWith('/ai-tool-usage/user', { params: { page: 1, limit: 8, search: '' } });
  await AiUsageApi.fetchUsage(2, 'grammar');
  expect(get).toHaveBeenLastCalledWith('/ai-tool-usage/user', { params: { page: 2, limit: 8, search: 'grammar' } });
  await AiUsageApi.fetchStatistics();
  expect(get).toHaveBeenLastCalledWith('/ai-tool-usage/user/most-used-tool', undefined);
});
describe('public CV download', () => {
  const original = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = original;
  });
  it('requires a configured API URL', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    await expect(PublicInfoApi.fetchCv()).rejects.toThrow('not configured');
  });
  it.each([
    [false, 'application/pdf'],
    [true, 'text/html'],
    [true, null],
  ])('rejects unsuccessful or non-PDF responses (%s, %s)', async (ok, type) => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
    global.fetch = jest.fn().mockResolvedValue({ ok, headers: { get: () => type } });
    await expect(PublicInfoApi.fetchCv()).rejects.toThrow('Could not download');
  });
  it('downloads PDF bytes without sending credentials', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com///';

    const blob = new Blob(['%PDF']);

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, headers: { get: () => 'application/pdf' }, blob: async () => blob });
    await expect(PublicInfoApi.fetchCv()).resolves.toBe(blob);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/public-info/cv', {
      credentials: 'omit',
      headers: { Accept: 'application/pdf' },
    });
  });
});
