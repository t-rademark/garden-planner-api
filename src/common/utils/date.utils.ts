export function getPerthDayRange() {
  const now = new Date();

  const perthNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Australia/Perth' }),
  );

  const startOfDay = new Date(perthNow);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(perthNow);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}


export function todayPerth(): string {
  const now = new Date();

  const perthNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Australia/Perth' }),
  );

  const year = perthNow.getFullYear();
  const month = String(perthNow.getMonth() + 1).padStart(2, '0');
  const day = String(perthNow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}