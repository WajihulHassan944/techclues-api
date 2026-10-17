"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlocked = exports.DEFAULT_AVAILABILITY = void 0;
exports.slotsForDay = slotsForDay;
exports.nextSlots = nextSlots;
exports.slotsInRange = slotsInRange;
const tz_1 = require("./tz");
exports.DEFAULT_AVAILABILITY = {
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
const isBlocked = (av, key) => av.blocked.find((b) => b.date === key);
exports.isBlocked = isBlocked;
function slotsForDay(key, av, bookings, now, ignoreId) {
    const day = av.days[(0, tz_1.weekday)(key)];
    if (!day.on || (0, exports.isBlocked)(av, key))
        return [];
    const earliest = now + av.noticeHours * 3_600_000;
    const latest = (0, tz_1.zoned)((0, tz_1.addDays)((0, tz_1.dateKey)(now), av.windowDays), 24 * 60).getTime();
    const step = av.slotMinutes + av.bufferMinutes;
    const busyRanges = bookings
        .filter((b) => b.status === 'confirmed' && b.id !== ignoreId)
        .map((b) => {
        const start = new Date(b.start).getTime();
        return [
            start - av.bufferMinutes * 60_000,
            start + (b.minutes + av.bufferMinutes) * 60_000,
        ];
    });
    const out = [];
    for (let s = (0, tz_1.toMin)(day.from); s + av.slotMinutes <= (0, tz_1.toMin)(day.to); s += step) {
        const start = (0, tz_1.zoned)(key, s).getTime();
        const end = start + av.slotMinutes * 60_000;
        if (start < earliest || start >= latest)
            continue;
        if (busyRanges.some(([a, b]) => start < b && end > a))
            continue;
        out.push(new Date(start).toISOString());
    }
    return out;
}
function nextSlots(av, bookings, now, count = 6) {
    const out = [];
    let key = (0, tz_1.dateKey)(now);
    for (let i = 0; i <= av.windowDays && out.length < count; i++, key = (0, tz_1.addDays)(key, 1)) {
        out.push(...slotsForDay(key, av, bookings, now));
    }
    return out.slice(0, count);
}
function slotsInRange(av, bookings, now, fromIso, toIso) {
    const out = [];
    let key = (0, tz_1.dateKey)(fromIso);
    const toKey = (0, tz_1.dateKey)(toIso);
    for (let i = 0; i <= 366; i++) {
        out.push(...slotsForDay(key, av, bookings, now));
        if (key >= toKey)
            break;
        key = (0, tz_1.addDays)(key, 1);
    }
    return out.filter((iso) => iso >= fromIso && iso < toIso);
}
//# sourceMappingURL=availability.js.map