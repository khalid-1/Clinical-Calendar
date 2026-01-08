/**
 * LocalStorage utilities for Clinical Calendar
 */

const STORAGE_KEYS = {
    SCHEDULE_DATA: 'clinical_schedule_data',
    SELECTED_USER: 'clinical_selected_user',
    SCHEDULE_OVERRIDES: 'clinical_schedule_overrides',
};

/**
 * Get stored schedule data from localStorage
 * @returns {Object|null} Parsed schedule data or null if not found
 */
export const getStoredData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading schedule data from localStorage:', error);
        return null;
    }
};

/**
 * Save schedule data to localStorage
 * @param {Object} data - Schedule data with students array
 */
export const setStoredData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_DATA, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving schedule data to localStorage:', error);
    }
};

/**
 * Get selected user from localStorage
 * @returns {Object|null} Selected user object or null
 */
export const getSelectedUser = () => {
    try {
        const user = localStorage.getItem(STORAGE_KEYS.SELECTED_USER);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error reading selected user from localStorage:', error);
        return null;
    }
};

/**
 * Save selected user to localStorage
 * @param {Object} user - User object with id, name, schedule
 */
export const setSelectedUser = (user) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving selected user to localStorage:', error);
    }
};

/**
 * Clear selected user from localStorage
 */
export const clearSelectedUser = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_USER);
    } catch (error) {
        console.error('Error clearing selected user from localStorage:', error);
    }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.SCHEDULE_DATA);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_USER);
        localStorage.removeItem(STORAGE_KEYS.SCHEDULE_OVERRIDES);
    } catch (error) {
        console.error('Error clearing all data from localStorage:', error);
    }
};

/**
 * Get stored schedule overrides from localStorage
 * @returns {Object} Overrides map { studentId: { date: { hospital, color } } }
 */
export const getScheduleOverrides = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_OVERRIDES);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading overrides from localStorage:', error);
        return {};
    }
};

/**
 * Save schedule overrides to localStorage
 * @param {Object} overrides - Overrides map
 */
export const saveScheduleOverrides = (overrides) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_OVERRIDES, JSON.stringify(overrides));
    } catch (error) {
        console.error('Error saving overrides to localStorage:', error);
    }
};

/**
 * Check if schedule data exists in localStorage
 * @returns {boolean} True if data exists
 */
export const hasStoredData = () => {
    return getStoredData() !== null;
};

/**
 * Check if a user is selected
 * @returns {boolean} True if a user is selected
 */
export const hasSelectedUser = () => {
    return getSelectedUser() !== null;
};
