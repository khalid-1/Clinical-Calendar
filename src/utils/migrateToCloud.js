import { db } from '../services/firebase';
import { doc, writeBatch } from "firebase/firestore";
import { processStaticData } from './processStaticData';
import { getScheduleOverrides } from './storage';

/**
 * Migrates local data (JSON + LocalStorage Overrides) to Firestore
 */
export const migrateToCloud = async () => {
    try {
        console.log("Starting migration...");

        // 1. Get the current full state (Static JSON + Overrides applied)
        const overrides = getScheduleOverrides();
        const { students } = processStaticData(overrides);

        // 2. Prepare Batch (Firestore limits batches to 500 ops)
        // We have ~84 students, so one batch is fine.
        const batch = writeBatch(db);

        let count = 0;
        students.forEach(student => {
            const studentRef = doc(db, "students", student.id);

            // Clean up the object for storage
            // processStaticData adds 'fullName' and 'name' (short), we want to keep those?
            // Yes, let's store the processed version as the source of truth now.
            // But we need to ensure 'schedule' is stored cleanly.

            // The 'schedule' in processedStudents is:
            // { "2026-01-01": { code: "ER", hospital: "Saqr", color: "..." } }
            // This is good for the DB.

            const docData = {
                id: student.id,
                name: student.fullName, // Original full name
                displayName: student.name, // Short name
                schedule: student.schedule
            };

            batch.set(studentRef, docData);
            count++;
        });

        console.log(`Committing batch with ${count} students...`);
        await batch.commit();

        console.log("Migration successful!");
        return { success: true, count };
    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error: error.message };
    }
};
