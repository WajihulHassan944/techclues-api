/**
 * Ported verbatim from techclues frontend `lib/admin/tz.ts` so slot times
 * match bit-for-bit (including DST transitions). Do not "simplify" this —
 * the frontend's BookingWidget and admin calendar rely on exact agreement.
 */
export const TZ = 'Europe/London';

const PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function parts(d: Date) {
  const o: Record<string, number> = {};
  for (const p of PARTS.formatToParts(d)) if (p.type !== 'literal') o[p.type] = Number(p.value);
  return o as {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}

const offsetMin = (d: Date) => {
  const p = parts(d);
  return Math.round(
    (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - d.getTime()) / 60_000,
  );
};

/** UK wall-clock time to a real instant. `minutes` is minutes after midnight. */
export function zoned(key: string, minutes: number): Date {
  const [y, m, d] = key.split('-').map(Number);
  const base = Date.UTC(y, m - 1, d, 0, minutes);
  const o1 = offsetMin(new Date(base));
  let t = base - o1 * 60_000;
  const o2 = offsetMin(new Date(t));
  if (o2 !== o1) t = base - o2 * 60_000;
  return new Date(t);
}

/** YYYY-MM-DD in UK time. */
export function dateKey(d: Date | string | number): string {
  const p = parts(new Date(d));
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export const minutesOfDay = (d: Date | string) => {
  const p = parts(new Date(d));
  return p.hour * 60 + p.minute;
};

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** Monday = 0 … Sunday = 6. */
export function weekday(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
