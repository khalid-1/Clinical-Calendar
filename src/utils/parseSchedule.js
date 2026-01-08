/**
 * Smart parser for Excel/CSV schedule files
 * Handles the complex header structure with month/day rows
 */

import * as XLSX from 'xlsx';

/**
 * Parse an Excel or CSV file and extract student schedules
 * @param {File} file - The uploaded file
 * @returns {Promise<Object>} Parsed data with students array
 */
export const parseScheduleFile = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
        return parseExcelFile(file);
    } else if (extension === 'csv') {
        return parseCSVFile(file);
    } else {
        throw new Error('Unsupported file format. Please upload .xlsx or .csv files.');
    }
};

/**
 * Parse an Excel file
 * @param {File} file - Excel file
 * @returns {Promise<Object>} Parsed schedule data
 */
const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to array of arrays
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const result = processScheduleData(rows);
                resolve(result);
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Parse a CSV file
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Parsed schedule data
 */
const parseCSVFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const rows = parseCSVText(text);
                const result = processScheduleData(rows);
                resolve(result);
            } catch (error) {
                reject(new Error('Failed to parse CSV file: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

/**
 * Parse CSV text into array of arrays
 * @param {string} text - CSV content
 * @returns {Array} Array of row arrays
 */
const parseCSVText = (text) => {
    const rows = text.trim().split('\n');
    return rows.map(row => {
        // Handle quoted values with commas inside
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());

        return result;
    });
};

/**
 * Process raw schedule data rows into structured format
 * @param {Array} rows - Array of row arrays
 * @returns {Object} Structured schedule data
 */
const processScheduleData = (rows) => {
    if (rows.length < 4) {
        throw new Error('File does not contain enough data. Expected at least 4 rows.');
    }

    const students = [];
    const dateMap = {};

    // 1. Detect Header Rows
    let dayRowIndex = -1;
    // Look for the row with dates 13, 14, 15...
    for (let i = 0; i < Math.min(6, rows.length); i++) {
        const row = rows[i];
        const numbers = row.filter(cell => {
            const num = parseInt(cell);
            return !isNaN(num) && num >= 10 && num <= 31; // Look for double digits to avoid week row (1,2,3)
        });
        if (numbers.length > 5) {
            dayRowIndex = i;
            break;
        }
    }

    if (dayRowIndex === -1) {
        dayRowIndex = 2; // Default fallback
    }

    const dayRow = rows[dayRowIndex];
    const monthRow = rows[0]; // Usually index 0 has the month info

    // 2. Determine Base Date
    let currentYear = 2026;
    let currentMonth = 0; // Default January

    // Try to find a date in the month row (Row 0)
    for (let cell of monthRow) {
        if (cell instanceof Date) {
            currentYear = cell.getFullYear();
            currentMonth = cell.getMonth();
            break;
        } else if (typeof cell === 'number' && cell > 40000) {
            const d = XLSX.SSF.parse_date_code(cell);
            currentYear = d.y;
            currentMonth = d.m - 1;
            break;
        } else if (typeof cell === 'string' && (cell.includes('-') || cell.includes('/'))) {
            const d = new Date(cell);
            if (!isNaN(d.getTime())) {
                currentYear = d.getFullYear();
                currentMonth = d.getMonth();
                break;
            }
        }
    }

    // 3. Parse Dates from Day Row
    let lastDayVal = 0;
    const startIndex = 3;

    for (let i = startIndex; i < dayRow.length; i++) {
        const val = parseInt(dayRow[i]);

        if (!isNaN(val) && val >= 1 && val <= 31) {
            // Month rollover logic: 31 -> 3
            if (val < lastDayVal && lastDayVal > 20) {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            } else if (val < lastDayVal && lastDayVal <= 20) {
                // If it goes 15 -> 1, maybe it's a new month too?
                // But here we have 31 -> 3.
                // What if Feb 28 -> Mar 1? 28 > 20.
                currentMonth++;
            }

            const d = new Date(currentYear, currentMonth, val);
            // Adjust for timezone offset to avoid previous day issue
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];

            dateMap[i] = dateStr;
            lastDayVal = val;
        }
    }

    // 4. Parse Student Rows
    const dataStartRow = dayRowIndex + 1;

    // Detect if there is a "Hospital" column in the header row (row 0, 1, or dayRowIndex)
    // We scan likely header rows
    let hospitalColIndex = -1;
    [0, 1, 2, dayRowIndex].forEach(rIdx => {
        if (rows[rIdx]) {
            rows[rIdx].forEach((cell, cIdx) => {
                if (String(cell).toLowerCase().includes('hospital')) {
                    hospitalColIndex = cIdx;
                }
            });
        }
    });

    for (let r = dataStartRow; r < rows.length; r++) {
        const cols = rows[r];
        if (!cols || cols.length < 3) continue;

        const id = String(cols[1] || '').trim();
        const rawName = String(cols[2] || '').replace(/"/g, '').trim();

        if (!id || !rawName || !/^\d+$/.test(id)) continue;

        const nameParts = rawName.split(' ').filter(p => p.length > 0);
        const displayName = nameParts.slice(0, 2).join(' ');

        // EXTRACT HOSPITAL FROM COLUMN (Perfect override)
        let explicitHospital = null;
        if (hospitalColIndex > -1 && cols[hospitalColIndex]) {
            const val = String(cols[hospitalColIndex]).trim();
            if (val.toLowerCase().includes('saqr')) explicitHospital = 'Saqr Hospital';
            else if (val.toLowerCase().includes('general') || val.includes('AQG')) explicitHospital = 'Al Qasimi General Hospital';
            else if (val.toLowerCase().includes('women') || val.includes('AQW')) explicitHospital = 'Al Qasimi Women & Child Hospital';
            else if (val.toLowerCase().includes('abdullah') || val.includes('AB')) explicitHospital = 'Abdullah Bin Omran Hospital';
            else if (val.toLowerCase().includes('dibba') || val.includes('DB')) explicitHospital = 'Dibba Hospital';
            else if (val.toLowerCase().includes('community')) explicitHospital = 'Community Health';
        }

        const schedule = {};
        // First pass to build shift map for context detection
        const rawShiftMap = {};
        for (let i = startIndex; i < cols.length; i++) {
            rawShiftMap[i] = String(cols[i] || '').trim();
        }

        // Use Explicit Column OR Auto-Detect Context
        const contextHospital = explicitHospital || detectStudentHospitalContext(rawShiftMap);

        for (let i = startIndex; i < cols.length; i++) {
            const shift = String(cols[i] || '').trim();
            const dateStr = dateMap[i];

            if (shift && dateStr && shift.length > 0) {
                const hospital = getHospitalFromShift(shift, contextHospital);
                schedule[dateStr] = {
                    code: shift,
                    hospital: hospital.name,
                    color: hospital.color
                };
            }
        }

        if (Object.keys(schedule).length > 0) {
            students.push({
                id,
                fullName: rawName,
                name: displayName,
                schedule
            });
        }
    }

    return {
        students,
        dateMap,
        totalStudents: students.length,
        dateRange: getDateRange(dateMap)
    };
};

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
    // AB- or AB_ : Abdullah Bin Omran
    // DB- or DB_ : Dibba
    // AQW- : AQ Women
    // AQG- : AQ General
    // S- : Saqr
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
    // If we know the student is in AQ General context, generic codes become AQ General
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
 * Get the date range from the date map
 * @param {Object} dateMap - Map of column indices to date strings
 * @returns {Object} Object with startDate and endDate
 */
const getDateRange = (dateMap) => {
    const dates = Object.values(dateMap).sort();
    return {
        startDate: dates[0] || null,
        endDate: dates[dates.length - 1] || null
    };
};

/**
 * Parse embedded CSV text (for demo/testing)
 * @param {string} csvText - Raw CSV text
 * @returns {Object} Parsed schedule data
 */
export const parseEmbeddedCSV = (csvText) => {
    const rows = parseCSVText(csvText);
    return processScheduleData(rows);
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
 * @param {string} shiftObj - Shift object or string
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
