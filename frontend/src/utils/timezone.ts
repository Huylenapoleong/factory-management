/**
 * Utility to compute the client's current timezone offset in UTC format (e.g. UTC+7, UTC+8, UTC-5).
 */
export const getLocalTimezoneOffsetString = (date: Date = new Date()): string => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
};
