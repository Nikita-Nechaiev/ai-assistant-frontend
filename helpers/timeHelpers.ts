export const formatTimeSpent = (timeSpent: number): string => {
  const hours = Math.floor(timeSpent / 3600);
  const minutes = Math.floor((timeSpent % 3600) / 60);
  const seconds = timeSpent % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

export function formatAiUsageDate(timestamp: Date | string) {
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
