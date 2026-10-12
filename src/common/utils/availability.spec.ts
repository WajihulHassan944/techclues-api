import { DEFAULT_AVAILABILITY, slotsForDay, slotsInRange } from './availability';

describe('availability', () => {
  // A Wednesday in October 2026 (BST ends 2026-10-25, so this is still BST).
  const key = '2026-10-14';
  const now = new Date('2026-10-13T08:00:00.000Z').getTime();

  it('produces 30-minute slots within the working day, respecting notice hours', () => {
    const slots = slotsForDay(key, DEFAULT_AVAILABILITY, [], now);
    expect(slots.length).toBeGreaterThan(0);
    // 09:00 BST on 2026-10-14 is 08:00 UTC.
    expect(slots[0]).toBe('2026-10-14T08:00:00.000Z');
    expect(slots[slots.length - 1]).toBe('2026-10-14T16:00:00.000Z'); // last 30-min slot ending by 17:30 BST
  });

  it('returns no slots on a day that is switched off', () => {
    const sunday = '2026-10-18';
    const slots = slotsForDay(sunday, DEFAULT_AVAILABILITY, [], now);
    expect(slots).toEqual([]);
  });

  it('returns no slots on a blocked date', () => {
    const av = { ...DEFAULT_AVAILABILITY, blocked: [{ date: key, reason: 'Holiday' }] };
    expect(slotsForDay(key, av, [], now)).toEqual([]);
  });

  it('excludes a slot that overlaps an existing confirmed booking', () => {
    const booking = {
      id: 'b1',
      status: 'confirmed',
      start: '2026-10-14T08:00:00.000Z',
      minutes: 30,
    };
    const slots = slotsForDay(key, DEFAULT_AVAILABILITY, [booking], now);
    expect(slots).not.toContain('2026-10-14T08:00:00.000Z');
    expect(slots).toContain('2026-10-14T08:30:00.000Z');
  });

  it('respects the buffer between back-to-back bookings', () => {
    const av = { ...DEFAULT_AVAILABILITY, bufferMinutes: 15 };
    const booking = {
      id: 'b1',
      status: 'confirmed',
      start: '2026-10-14T08:00:00.000Z',
      minutes: 30,
    };
    const slots = slotsForDay(key, av, [booking], now);
    // 08:30 overlaps the 15-minute buffer after the 08:00-08:30 booking.
    expect(slots).not.toContain('2026-10-14T08:30:00.000Z');
  });

  it('handles the BST -> GMT clock change without drifting slot times', () => {
    // 2026-10-25 is the last Sunday of October: clocks go back at 02:00 BST.
    const dayAfterClockChange = '2026-10-26';
    const slots = slotsForDay(
      dayAfterClockChange,
      DEFAULT_AVAILABILITY,
      [],
      new Date('2026-10-25T00:00:00.000Z').getTime(),
    );
    // 09:00 GMT (UTC+0) on 2026-10-26 is 09:00 UTC, not 08:00.
    expect(slots[0]).toBe('2026-10-26T09:00:00.000Z');
  });

  it('slotsInRange filters to the requested window', () => {
    const slots = slotsInRange(
      DEFAULT_AVAILABILITY,
      [],
      now,
      '2026-10-14T08:00:00.000Z',
      '2026-10-14T09:00:00.000Z',
    );
    expect(slots).toEqual(['2026-10-14T08:00:00.000Z', '2026-10-14T08:30:00.000Z']);
  });
});
