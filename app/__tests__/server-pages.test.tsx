import React from 'react';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Home from '../page';
import Welcome from '../welcome/page';
import RootLayout from '../layout';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/components/Welcome/WelcomePage', () => ({ __esModule: true, default: () => null }));
jest.mock('@/providers/ReactQueryProvider', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hydration/ZustandHydration', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/common/Snackbar', () => ({ __esModule: true, default: () => null }));
it.each([null, 'authenticated'])('routes home and passes welcome auth state (%s)', async (user) => {
  (headers as jest.Mock).mockResolvedValue({ get: () => user });
  await Home();
  expect(redirect).toHaveBeenLastCalledWith(user ? '/dashboard' : '/welcome');

  const element: any = await Welcome();

  expect(element.props.isAuthenticated).toBe(!!user);
});
it.each([null, Buffer.from(JSON.stringify({ name: 'Микита' })).toString('base64'), 'invalid'])(
  'renders the root layout and safely decodes the user header (%s)',
  async (header) => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});

    (headers as jest.Mock).mockResolvedValue({ get: () => header });

    const element: any = await RootLayout({ children: <div>Content</div> });

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('en');

    if (header === 'invalid') expect(log).toHaveBeenCalled();

    log.mockRestore();
  },
);
