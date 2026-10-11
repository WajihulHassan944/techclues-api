import { createEvent, DateArray } from 'ics';

export function buildBookingIcs(params: {
  start: Date;
  minutes: number;
  title: string;
  description: string;
  location: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const d = params.start;
  const startArray: DateArray = [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ];
  const { error, value } = createEvent({
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
  if (error || !value) throw error ?? new Error('Failed to build .ics invite');
  return value;
}
