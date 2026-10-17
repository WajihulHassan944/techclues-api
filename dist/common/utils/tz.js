"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMin = exports.hhmm = exports.minutesOfDay = exports.TZ = void 0;
exports.zoned = zoned;
exports.dateKey = dateKey;
exports.addDays = addDays;
exports.weekday = weekday;
exports.TZ = 'Europe/London';
const PARTS = new Intl.DateTimeFormat('en-GB', {
    timeZone: exports.TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
function parts(d) {
    const o = {};
    for (const p of PARTS.formatToParts(d))
        if (p.type !== 'literal')
            o[p.type] = Number(p.value);
    return o;
}
const offsetMin = (d) => {
    const p = parts(d);
    return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - d.getTime()) / 60_000);
};
function zoned(key, minutes) {
    const [y, m, d] = key.split('-').map(Number);
    const base = Date.UTC(y, m - 1, d, 0, minutes);
    const o1 = offsetMin(new Date(base));
    let t = base - o1 * 60_000;
    const o2 = offsetMin(new Date(t));
    if (o2 !== o1)
        t = base - o2 * 60_000;
    return new Date(t);
}
function dateKey(d) {
    const p = parts(new Date(d));
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
const minutesOfDay = (d) => {
    const p = parts(new Date(d));
    return p.hour * 60 + p.minute;
};
exports.minutesOfDay = minutesOfDay;
function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}
function weekday(key) {
    const [y, m, d] = key.split('-').map(Number);
    return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
exports.hhmm = hhmm;
const toMin = (s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
};
exports.toMin = toMin;
//# sourceMappingURL=tz.js.map