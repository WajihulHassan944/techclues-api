"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBookingIcs = buildBookingIcs;
const ics_1 = require("ics");
function buildBookingIcs(params) {
    const d = params.start;
    const startArray = [
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
    ];
    const { error, value } = (0, ics_1.createEvent)({
        start: startArray,
        startInputType: 'utc',
        duration: { minutes: params.minutes },
        title: params.title,
        description: params.description,
        location: params.location,
        organizer: { name: 'TechClues', email: params.organizerEmail },
        attendees: [{ name: params.attendeeName, email: params.attendeeEmail, rsvp: true }],
        status: 'CONFIRMED',
    });
    if (error || !value)
        throw error ?? new Error('Failed to build .ics invite');
    return value;
}
//# sourceMappingURL=ics.js.map