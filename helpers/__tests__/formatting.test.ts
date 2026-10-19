import { cn } from '@/lib/utils';

import {
  getTimeDiffString,
  getReceivedMessage,
  getExpirationMessage,
  isInvitationExpired,
} from '../notificationHelpers';
import { formatTimeSpent } from '../timeHelpers';
import { isConvertableToNumber } from '../isConvertableToNumber';
import { isGoogleAvatar } from '../isGoogleAvatar';
import { sliceRichContent } from '../sliceRichContent';
import { lockBodyScroll, unlockBodyScroll } from '../scrollLock';
import { aiToolList } from '../aiToolsList';
import { getAiToolPresentation, formatAiToolName } from '../aiToolPresentation';
import { navigation } from '../navigation';
import { modules, formats } from '../quilConfig';

it.each([
  [0, 'a moment ago'],
  [60000, '1 minute'],
  [120000, '2 minutes'],
  [3600000, '1 hour'],
  [3660000, '1 hour and 1 minute'],
  [7320000, '2 hours and 2 minutes'],
  [86400000, '1 day'],
  [176400000, '2 days and 1 hour'],
  [180000000, '2 days and 2 hours'],
])('formats a time difference of %s', (ms, label) => expect(getTimeDiffString(ms as number)).toBe(label));
it('handles dates, invalid/missing expirations and elapsed/future messages', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-17T12:00:00Z'));
  expect(isInvitationExpired()).toBe(false);
  expect(isInvitationExpired('invalid')).toBe(false);
  expect(isInvitationExpired('2020-01-01')).toBe(true);
  expect(isInvitationExpired('2030-01-01')).toBe(false);
  expect(getExpirationMessage()).toBe('');
  expect(getExpirationMessage('invalid')).toBe('Invalid expiration date');
  expect(getExpirationMessage('2026-10-17T11:00:00Z')).toContain('expired 1 hour ago');
  expect(getExpirationMessage('2026-10-17T13:00:00Z')).toContain('expires in 1 hour');
  expect(getReceivedMessage('invalid')).toBe('Invalid date');
  expect(getReceivedMessage('2026-10-17T12:00:00Z')).toContain('a moment ago');
  expect(getReceivedMessage('2026-10-17T11:00:00Z')).toContain('1 hour ago');
  jest.useRealTimers();
});
it.each([
  [0, '0:00'],
  [65, '1:05'],
  [3661, '1:01:01'],
])('formats session time %s', (seconds, label) => expect(formatTimeSpent(seconds as number)).toBe(label));
it.each([
  [undefined, false],
  ['', false],
  ['  ', false],
  ['NaN', false],
  ['Infinity', false],
  ['12', true],
  ['-3.5', true],
])('validates route id %s', (value, expected) => expect(isConvertableToNumber(value)).toBe(expected));
it('handles avatars, preview truncation, scroll lock, utility classes and navigation', () => {
  expect(isGoogleAvatar('/uploads/a.png')).toBe(false);
  expect(isGoogleAvatar('https://google.com/a')).toBe(true);
  expect(isGoogleAvatar(undefined)).toBeUndefined();
  expect(sliceRichContent('abcdef', 3)).toBe('abc');
  expect(sliceRichContent('<p>Text</p><img src="private"/>')).not.toContain('private');
  lockBodyScroll();
  expect(document.body.style.overflow).toBe('hidden');
  unlockBodyScroll();
  expect(document.body.style.overflowY).toBe('');
  expect(cn('p-2', false, 'p-4')).toBe('p-4');
  expect(navigation.map((item) => item.href)).toEqual(['/dashboard', '/ai-assistance', '/faq']);
  expect(modules.toolbar.length).toBeGreaterThan(0);
  expect(formats).toContain('bold');
});
it('formats every tool by id, endpoint or name and preserves unknown tools', () => {
  for (const tool of aiToolList) {
    expect(getAiToolPresentation(tool).title).toBeTruthy();

    for (const name of [tool.id, tool.endpoint, tool.name])
      expect(formatAiToolName(name)).toBe(getAiToolPresentation(tool).title);
  }

  expect(formatAiToolName('other')).toBe('other');
  expect(getAiToolPresentation({ id: 'other', name: 'Other' } as any).title).toBe('Other');
});
