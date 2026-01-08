/**
 * Detect the likely hospital context for a student based on their shifts
 * @param {Object} shiftMap - Map of dates to shift codes
 * @returns {string|null} Detected hospital name or null
 */
export const detectStudentHospitalContext = (shiftMap) => {
    const codes = Object.values(shiftMap).map(s => String(s || '').toUpperCase().trim());

    // Check for AQ General signals (Numbered codes, specific units)
    const hasAQGeneralSignal = codes.some(code =>
        code.match(/ICU\s?\d/) || code.match(/ER\s?\d/) ||
        code === 'SU' || code === 'HD' || code === 'MCW' || code === 'CICU' || code === 'CCU' ||
        code.includes('ENDOSCOPY') ||
        code === 'MSW' || code === 'FSW' || code === 'MMW' || code === 'FMW'
    );

    if (hasAQGeneralSignal) return 'Al Qasimi General Hospital';

    // Check for AQ Women signals
    const hasAQWomenSignal = codes.some(code =>
        code.match(/OBG/) || code === 'LR' || code.includes('OBS') || code === 'NICU' ||
        code.includes('PEAD') || code.startsWith('PN')
    );

    if (hasAQWomenSignal) return 'Al Qasimi Women & Child Hospital';

    // Check for Saqr signals (Generic codes without AQ signals)
    const hasSaqrSignal = codes.some(code =>
        code === 'ICU' || code === 'ER' || code === 'OT' || code === 'OPD' || code === 'AE' || code === 'MW'
    );

    if (hasSaqrSignal) return 'Saqr Hospital';

    return null;
};

/**
 * Hospital mapping based on shift codes
 * @param {string} shift - Shift code
 * @param {string|null} contextHospital - Detected hospital context for the student
 * @returns {Object} { name, color }
 */
export const getHospitalFromShift = (shift, contextHospital = null) => {
    const code = shift.toUpperCase().trim();

    // 0. Explicit Prefixes (User Manual Override in Excel)
    if (code.startsWith('AB-') || code.startsWith('AB_') || code.startsWith('ABDULLAH')) {
        return { name: 'Abdullah Bin Omran Hospital', color: 'bg-blue-500' };
    }
    if (code.startsWith('DB-') || code.startsWith('DB_') || code.startsWith('DIBBA')) {
        return { name: 'Dibba Hospital', color: 'bg-green-500' };
    }
    if (code.startsWith('AQW-') || code.startsWith('AQW_')) {
        return { name: 'Al Qasimi Women & Child Hospital', color: 'bg-rose-500' };
    }
    if (code.startsWith('AQG-') || code.startsWith('AQG_') || code.startsWith('AQ-')) {
        return { name: 'Al Qasimi General Hospital', color: 'bg-orange-500' };
    }
    if (code.startsWith('S-') || code.startsWith('S_') || code.startsWith('SAQR')) {
        return { name: 'Saqr Hospital', color: 'bg-yellow-500' };
    }

    // 1. Community Health
    if (code.includes('COMMUNITY') || code.includes('HC') || code.includes('PHC')) {
        return { name: 'Community Health', color: 'bg-cyan-500' };
    }

    // 2. Al Qasimi Women & Child Hospital (Obstetrics)
    if (code.match(/OBG/) || code === 'LR' || code.includes('OBS') || code === 'NICU' || code.includes('PEAD') || code.startsWith('PN')) {
        return { name: 'Al Qasimi Women & Child Hospital', color: 'bg-rose-500' };
    }

    // 3. Al Qasimi General Hospital (Critical Care - Specific/Numbered)
    if (code.match(/ICU\s?\d/) || code.match(/ER\s?\d/) ||
        code === 'SU' || code === 'HD' || code === 'MCW' || code === 'CICU' || code === 'CCU' ||
        code.includes('ENDOSCOPY') ||
        code === 'MSW' || code === 'FSW' || code === 'MMW' || code === 'FMW') {
        return { name: 'Al Qasimi General Hospital', color: 'bg-orange-500' };
    }

    // 4. Context-Aware Fallback
    if (contextHospital === 'Al Qasimi General Hospital') {
        if (code === 'ICU' || code === 'ER' || code === 'OT' || code === 'OPD' || code === 'AE' || code === 'MW') {
            return { name: 'Al Qasimi General Hospital', color: 'bg-orange-500' };
        }
    }

    // 5. Saqr Hospital (Critical Care - Generic)
    if (code === 'ICU' || code === 'ER' || code === 'OT' || code === 'OPD' || code === 'AE' || code === 'MW') {
        return { name: 'Saqr Hospital', color: 'bg-yellow-500' };
    }

    // Default Fallback
    return { name: 'Al Qasimi General Hospital', color: 'bg-blue-600' };
};

/**
 * Get a clean category ID for hospital styling
 * @param {string} hospitalName - Hospital name
 * @returns {string} Category ID for CSS classes (e.g., "dibba")
 */
export const getHospitalCategory = (hospitalName) => {
    if (!hospitalName) return 'off';
    const name = hospitalName.toLowerCase();

    if (name.includes('community')) return 'community';
    if (name.includes('dibba')) return 'dibba';
    if (name.includes('saqr')) return 'saqr';
    if (name.includes('women')) return 'aq-women';
    if (name.includes('general') || name.includes('qasimi')) return 'aq-general';
    if (name.includes('abdullah')) return 'abdullah';
    if (name.includes('kuwait')) return 'al-kuwait';

    return 'default';
};

/**
 * Get shift type category for styling
 * @param {string} shift - Shift code string or object
 * @returns {string} Category name for CSS class
 */
export const getShiftCategory = (shift) => {
    const isShiftObject = shift && typeof shift === 'object';
    const code = isShiftObject ? shift.code : String(shift || '');
    const upper = code.toUpperCase();

    if (upper.includes('ICU')) return 'icu';
    if (upper.includes('ER') || upper.includes('EMERGENCY')) return 'er';
    if (upper.includes('OT') || upper.includes('OPERATING')) return 'ot';
    if (upper.includes('MW') || upper.includes('WARD')) return 'mw';
    if (upper.includes('OFF') || upper === '') return 'off';

    return 'default';
};
