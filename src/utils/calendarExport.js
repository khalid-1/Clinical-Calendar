import { formatToICSDate } from './dateHelpers';

/**
 * Generate an iCalendar (.ics) file content string
 * @param {string} userName - Full name of the student
 * @param {Object} shifts - Map of date strings to shift objects { code, hospital }
 * @returns {string} ICS file content
 */
export const generateICS = (userName, shifts) => {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Clinical Calendar//Clinical Cal v1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    Object.entries(shifts).forEach(([dateStr, shift]) => {
        if (!shift.code || shift.code.toUpperCase() === 'OFF') return;

        const dtStart = formatToICSDate(dateStr, "07:00");
        const dtEnd = formatToICSDate(dateStr, "15:00"); // Assume 8 hour shift
        const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${dateStr}-${shift.code}-${userName.replace(/\s/g, '_')}@clinicalcal.app`);
        lines.push(`DTSTAMP:${stamp}`);
        lines.push(`DTSTART:${dtStart}`);
        lines.push(`DTEND:${dtEnd}`);
        lines.push(`SUMMARY:Clinical Rotation: ${shift.code}`);
        lines.push(`LOCATION:${shift.hospital}`);
        lines.push(`DESCRIPTION:Clinical rotation for ${userName} at ${shift.hospital}. Shift code: ${shift.code}.`);
        lines.push('STATUS:CONFIRMED');
        lines.push('TRANSP:OPAQUE');
        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
};

/**
 * Trigger a browser download for the generated calendar
 * @param {string} userName - Student name for filename
 * @param {string} icsContent - Generated ICS string
 */
export const downloadCalendar = (userName, icsContent) => {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const filename = `${userName.replace(/\s/g, '_')}_Clinical_Schedule.ics`;

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
