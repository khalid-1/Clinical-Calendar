import scheduleData from '../data/schedule.json';
import { getHospitalFromShift, detectStudentHospitalContext } from './parseSchedule';

/**
 * Process the JSON schedule data into the app's internal format
 * @param {Object} overrides - Manual overrides map { studentId: { date: { hospital, color } } }
 * @returns {Object} Processed data object
 */
export const processStaticData = (overrides = {}) => {
    const processedStudents = scheduleData.map(student => {
        // Process name
        const nameParts = student.name.split(' ');
        const displayName = nameParts.slice(0, 2).join(' '); // First two names

        // Process shifts
        const finalSchedule = {};
        const dates = Object.keys(student.shifts);

        // Detect hospital context for this student (e.g. if they have 'ICU 1', they are likely AQ General even for generic 'ER')
        const contextHospital = detectStudentHospitalContext(student.shifts);

        dates.forEach(date => {
            const rawShift = student.shifts[date];
            let code = '';
            let jsonHospital = null;

            if (typeof rawShift === 'object' && rawShift !== null) {
                code = rawShift.shift || '';
                jsonHospital = rawShift.hospital || null;
            } else {
                code = String(rawShift || '');
            }

            // Default logic
            // If the JSON already has a hospital name (from Excel/JSON edit), use it!
            let hospitalData;

            // Map known hospital names to colors if explicit
            if (jsonHospital) {
                const knownColors = {
                    'Saqr Hospital': 'bg-yellow-500',
                    'Al Qasimi General Hospital': 'bg-orange-500',
                    'Al Qasimi Women & Child Hospital': 'bg-rose-500',
                    'Abdullah Bin Omran Hospital': 'bg-blue-500',
                    'Dibba Hospital': 'bg-green-500',
                    'Community Health': 'bg-cyan-500',
                    'Al Kuwait Sharjah Hospital': 'bg-emerald-400'
                };
                hospitalData = {
                    name: jsonHospital,
                    color: knownColors[jsonHospital] || 'bg-blue-600'
                };
            } else {
                hospitalData = getHospitalFromShift(code, contextHospital);
            }

            // Apply Override if exists
            if (overrides && overrides[student.id] && overrides[student.id][date]) {
                const ov = overrides[student.id][date];
                // Apply hospital override
                if (ov.hospital) {
                    hospitalData = { name: ov.hospital, color: ov.color };
                }
                // Apply shift code override
                if (ov.code !== undefined) {
                    code = ov.code;
                }
            }

            finalSchedule[date] = {
                code: code,
                hospital: hospitalData.name,
                color: hospitalData.color
            };
        });

        return {
            id: student.id,
            fullName: student.name,
            name: displayName,
            schedule: finalSchedule
        };
    }).sort((a, b) => {
        // Sort by ID ascending (numeric comparison)
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });

    // Calculate global date range
    let allDates = [];
    processedStudents.forEach(s => {
        allDates = [...allDates, ...Object.keys(s.schedule)];
    });
    allDates.sort();

    return {
        students: processedStudents,
        totalStudents: processedStudents.length,
        dateRange: {
            startDate: allDates[0] || "2026-01-01",
            endDate: allDates[allDates.length - 1] || "2026-12-31"
        }
    };
};
