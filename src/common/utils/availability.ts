import { addDays, dateKey, toMin, weekday, zoned } from './tz';

export type AvailabilityDay = { on: boolean; from: string; to: string };
export type AvailabilityBlocked = { date: string; reason: string };

export type AvailabilityConfig = {
  slotMinutes: number;
  bufferMinutes: number;
  noticeHours: number;
  windowDays: number;
  meetingLink: string;
  /** Monday to Sunday. `to` is when the last call must end. */
  days: AvailabilityDay[];
  blocked: AvailabilityBlocked[];
};

export const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  slotMinutes: 30,
  bufferMinutes: 0,
  noticeHours: 4,
  windowDays: 21,
  meetingLink: 'https://meet.jit.si/TechClues-Calls',
  days: [
    { on: true, from: '09:00', to: '17:30' },
    { on: true, from: '09:00', to: '17:30' },
    { on: true, from: '09:00', to: '17:30' },
    { on: true, from: '09:00', to: '17:30' },
    { on: true, from: '09:00', to: '17:30' },
    { on: false, from: '09:00', to: '13:00' },
    { on: false, from: '09:00', to: '13:00' },
  ],
  blocked: [],
};

export const isBlocked = (av: AvailabilityConfig, key: string) =>
  av.blocked.find((b) => b.date === key);

export type BusyBooking = { id: string; status: string; start: Date | string; minutes: number };

/** Free start times on a day, as ISO strings. Ported from the frontend's `availability.ts`. */
export function slotsForDay(
  key: string,
  av: AvailabilityConfig,
  bookings: BusyBooking[],
  now: number,
  ignoreId?: string,
): string[] {
  const day = av.days[weekday(key)];
  if (!day.on || isBlocked(av, key)) return [];
  const earliest = now + av.noticeHours * 3_600_000;
  const latest = zoned(addDays(dateKey(now), av.windowDays), 24 * 60).getTime();
  const step = av.slotMinutes + av.bufferMinutes;
  const busyRanges = bookings
    .filter((b) => b.status === 'confirmed' && b.id !== ignoreId)
    .map((b) => {
      const start = new Date(b.start).getTime();
      return [
        start - av.bufferMinutes * 60_000,
        start + (b.minutes + av.bufferMinutes) * 60_000,
      ] as const;
    });
  const out: string[] = [];
  for (let s = toMin(day.from); s + av.slotMinutes <= toMin(day.to); s += step) {
    const start = zoned(key, s).getTime();
    const end = start + av.slotMinutes * 60_000;
    if (start < earliest || start >= latest) continue;
    if (busyRanges.some(([a, b]) => start < b && end > a)) continue;
    out.push(new Date(start).toISOString());
  }
  return out;
}

/** The next few free slots across the booking window. */
export function nextSlots(
  av: AvailabilityConfig,
  bookings: BusyBooking[],
  now: number,
  count = 6,
): string[] {
  const out: string[] = [];
  let key = dateKey(now);
  for (let i = 0; i <= av.windowDays && out.length < count; i++, key = addDays(key, 1)) {
    out.push(...slotsForDay(key, av, bookings, now));
  }
  return out.slice(0, count);
}

/** All free slots within an arbitrary [from, to) range — used by GET /public/availability. */
export function slotsInRange(
  av: AvailabilityConfig,
  bookings: BusyBooking[],
  now: number,
  fromIso: string,
  toIso: string,
): string[] {
  const out: string[] = [];
  let key = dateKey(fromIso);
  const toKey = dateKey(toIso);
  // bound the loop to the configured window regardless of what the caller asks for
  for (let i = 0; i <= av.windowDays + 1; i++) {
    out.push(...slotsForDay(key, av, bookings, now));
    if (key >= toKey) break;
    key = addDays(key, 1);
  }
  return out.filter((iso) => iso >= fromIso && iso < toIso);
}
