/**
 * STATIC SCHEDULE DATA
 * 
 * Instructions for editing:
 * 1. Add new students to the `students` array.
 * 2. For each student, provide:
 *    - id: A unique number
 *    - name: Their full name
 *    - shifts: An object where the KEY is the date (YYYY-MM-DD) and the VALUE is the shift code
 * 
 * 3. The app will automatically figure out the Hospital and Color based on the shift code.
 */

export const staticSchedule = [
    {
        id: "22904073",
        name: "Fatema Mohammed Abdulla Alteneiji",
        shifts: {
            "2026-01-13": "Community Health",
            "2026-01-14": "Community Health",
            "2026-01-15": "Community Health",
            "2026-01-17": "Community Health",
            "2026-01-19": "Community Health",
            "2026-01-20": "Community Health",
            "2026-01-21": "Community Health",
            "2026-01-23": "Community Health",
            "2026-01-27": "OT",
            "2026-01-28": "OT",
            "2026-01-29": "ER",
            // Add more dates here...
        }
    },
    {
        id: "22904025",
        name: "Rawan Abdelhamid Elsayed",
        shifts: {
            "2026-01-13": "Community Health",
            "2026-01-14": "Community Health",
            "2026-01-15": "Community Health",
            "2026-01-17": "Community Health",
            "2026-01-27": "OT",
            "2026-01-28": "OT",
            "2026-01-29": "ER",
            "2026-02-04": "ICU",
            "2026-02-05": "ICU",
        }
    },
    {
        id: "22904031",
        name: "Omar Mohammed",
        shifts: {
            "2026-01-13": "Community Health",
            "2026-01-14": "Community Health",
            "2026-01-27": "ICU 2",
            "2026-01-28": "ICU 2",
            "2026-01-29": "ICU 3",
        }
    }
];

// Helper to process this simple format into the app's full format
import { getHospitalFromShift } from '../utils/parseSchedule';

export const processStaticData = () => {
    const processedStudents = staticSchedule.map(student => {
        // Process name
        const nameParts = student.name.split(' ');
        const displayName = nameParts.slice(0, 2).join(' '); // First two names

        // Process shifts
        const finalSchedule = {};
        const dates = Object.keys(student.shifts);

        dates.forEach(date => {
            const code = student.shifts[date];
            const hospitalData = getHospitalFromShift(code);

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
