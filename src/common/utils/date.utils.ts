const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const perthDateFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function dateOnlyToUtc(dateOnly: string): Date {
  const match = DATE_ONLY_PATTERN.exec(dateOnly);

  if (!match) {
    throw new RangeError('date must use YYYY-MM-DD format');
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('date must be a valid calendar date');
  }

  return date;
}

export function getPerthDateOnly(now: Date = new Date()): string {
  const parts = perthDateFormatter.formatToParts(now);
  const year = parts.find(({ type }) => type === 'year')?.value;
  const month = parts.find(({ type }) => type === 'month')?.value;
  const day = parts.find(({ type }) => type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to determine the current Perth date');
  }

  return `${year}-${month}-${day}`;
}

export function getPerthTodayDate(now: Date = new Date()): Date {
  return dateOnlyToUtc(getPerthDateOnly(now));
}
