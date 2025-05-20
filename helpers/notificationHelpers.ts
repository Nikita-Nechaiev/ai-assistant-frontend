export const getTimeDiffString = (diffInMs: number): string => {
  const totalSeconds = Math.floor(diffInMs / 1000);

  if (totalSeconds < 60) {
    return 'a moment ago';
  }

  const totalMinutes = Math.floor(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (totalHours < 24) {
    let result = `${totalHours} hour${totalHours !== 1 ? 's' : ''}`;

    if (remainingMinutes > 0) {
      result += ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }

    return result;
  }

  const totalDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  let result = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;

  if (remainingHours > 0) {
    result += ` and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  }

  return result;
};

export const isInvitationExpired = (expiresAt?: string | null): boolean => {
  if (!expiresAt) return false;

  const expiresAtDate = new Date(expiresAt);

  return !isNaN(expiresAtDate.getTime()) && expiresAtDate < new Date();
};

export const getReceivedMessage = (date: string): string => {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) return 'Invalid date';

  const receivedDiff = new Date().getTime() - dateObj.getTime();
  const receivedTimeStr = getTimeDiffString(receivedDiff);

  return `You received a message ${receivedTimeStr === 'a moment ago' ? 'a moment ago' : receivedTimeStr + ' ago'}.`;
};

export const getExpirationMessage = (expiresAt?: string | null): string => {
  if (!expiresAt) return '';

  const expiresAtDate = new Date(expiresAt);

  if (isNaN(expiresAtDate.getTime())) return 'Invalid expiration date';

  const expirationDiff = expiresAtDate.getTime() - new Date().getTime();
  const expiresStr = getTimeDiffString(Math.abs(expirationDiff));

  return expirationDiff < 0 ? `The invitation expired ${expiresStr} ago.` : `The invitation expires in ${expiresStr}.`;
};
