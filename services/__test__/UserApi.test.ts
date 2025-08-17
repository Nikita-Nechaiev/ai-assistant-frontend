import type { IUser } from '@/models/models';

import { UserApi } from '../UserApi';
import axiosInstance from '../axiosInstance';

jest.mock('../axiosInstance', () => ({
  __esModule: true,
  default: {
    patch: jest.fn(),
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('UserApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('sends a PATCH request with formData and returns updated user', async () => {
      const fakeUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.png',
      } as IUser;

      const formData = new FormData();

      formData.append('name', 'John Doe');
      formData.append('avatar', new File(['dummy'], 'avatar.png', { type: 'image/png' }));

      mockedAxios.patch.mockResolvedValueOnce({
        data: { message: 'Profile updated', user: fakeUser },
      });

      const result = await UserApi.updateProfile(formData);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toBe(fakeUser);
    });
  });
});
