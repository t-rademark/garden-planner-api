import {
  dateOnlyToUtc,
  getPerthDateOnly,
  getPerthTodayDate,
} from './date.utils';

describe('date utilities', () => {
  describe('dateOnlyToUtc', () => {
    it('converts a date-only value to UTC midnight', () => {
      expect(dateOnlyToUtc('2026-09-01').toISOString()).toBe(
        '2026-09-01T00:00:00.000Z',
      );
    });

    it('supports leap days', () => {
      expect(dateOnlyToUtc('2028-02-29').toISOString()).toBe(
        '2028-02-29T00:00:00.000Z',
      );
    });

    it.each(['2026-02-29', '2026-13-01', '01-09-2026'])(
      'rejects invalid date %s',
      (dateOnly) => {
        expect(() => dateOnlyToUtc(dateOnly)).toThrow(RangeError);
      },
    );
  });

  describe('Perth calendar date', () => {
    it('uses the previous date immediately before Perth midnight', () => {
      const instant = new Date('2026-08-31T15:59:59.999Z');

      expect(getPerthDateOnly(instant)).toBe('2026-08-31');
    });

    it('rolls over at Perth midnight', () => {
      const instant = new Date('2026-08-31T16:00:00.000Z');

      expect(getPerthDateOnly(instant)).toBe('2026-09-01');
      expect(getPerthTodayDate(instant).toISOString()).toBe(
        '2026-09-01T00:00:00.000Z',
      );
    });
  });
});
