/**
 * Date helper utilities for Clinical Calendar
 */

/**
 * Format a specific date object to YYYY-MM-DD using local time
 * @param {Date} date 
 * @returns {string}
 */
const toLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get today's date as YYYY-MM-DD string
 * @returns {string} Today's date formatted as YYYY-MM-DD
 */
export const getTodayString = () => {
    return toLocalISOString(new Date());
};

/**
 * Format a date string for display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "Mon, Jan 15"
 */
export const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format a date string for full display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "Monday, January 15, 2026"
 */
export const formatDateFull = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Get the day of week abbreviation
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Day abbreviation like "Mon"
 */
export const getDayOfWeek = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get the day number from a date string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {number} Day of the month
 */
export const getDayNumber = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
};

/**
 * Get the month name from a date string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Month name like "January"
 */
export const getMonthName = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Get upcoming days with shifts
 * @param {Object} schedule - Map of date strings to shift codes
 * @param {string} startDate - Starting date in YYYY-MM-DD format
 * @param {number} count - Number of days to look ahead
 * @returns {Array} Array of { date, shift } objects
 */
export const getUpcomingDays = (schedule, startDate, count = 14) => {
    const upcoming = [];
    const d = new Date(startDate + 'T00:00:00');

    for (let i = 1; i <= count; i++) {
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + i);
        const dateStr = toLocalISOString(nextD);
        const shift = schedule[dateStr];
        if (shift) {
            upcoming.push({ date: dateStr, shift });
        }
    }

    return upcoming;
};

/**
 * Check if a date is today
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateStr) => {
    return dateStr === getTodayString();
};

/**
 * Check if a date is tomorrow
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is tomorrow
 */
export const isTomorrow = (dateStr) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return dateStr === toLocalISOString(tomorrow);
};

/**
 * Get all days in a month
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (0-11)
 * @returns {Array} Array of date strings for the month
 */
export const getDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month, 1);

    while (date.getMonth() === month) {
        days.push(toLocalISOString(date));
        date.setDate(date.getDate() + 1);
    }

    return days;
};

/**
 * Get the first day of week for a month (0 = Sunday)
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of week (0-6)
 */
export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

/**
 * Calculate time remaining until a target date (assuming 07:30 AM start)
 * @param {string} targetDateStr - YYYY-MM-DD
 * @returns {Object|null} { days, hours } or null if past
 */
export const getTimeRemaining = (targetDateStr) => {
    const now = new Date();
    const target = new Date(targetDateStr + 'T07:00:00'); // Assume 7:00 AM shift start

    const diff = target - now;
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days, hours };
};

/**
 * Format a date string and time for ICS format
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:mm
 * @returns {string} ICS formatted date (YYYYMMDDTHHmmSS)
 */
export const formatToICSDate = (dateStr, timeStr = "07:00") => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/:/g, '');
    return `${cleanDate}T${cleanTime}00`;
};
