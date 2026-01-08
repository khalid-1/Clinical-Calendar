import { useState } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import DragDropZone from '../components/DragDropZone';
import { parseScheduleFile } from '../utils/parseSchedule';

/**
 * Upload view - First screen shown when no data exists
 * @param {Object} props
 * @param {function} props.onDataLoaded - Callback when data is successfully parsed
 */
const UploadView = ({ onDataLoaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (file, fileError) => {
        if (fileError) {
            setError(fileError);
            return;
        }

        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await parseScheduleFile(file);

            if (data.students.length === 0) {
                setError('No student schedules found in the file. Please check the file format.');
                setIsLoading(false);
                return;
            }

            // Small delay for visual feedback
            setTimeout(() => {
                onDataLoaded(data);
            }, 500);
        } catch (err) {
            setError(err.message || 'Failed to parse the file. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo & Header */}
                <div className="text-center space-y-4 animate-fade-in-up">
                    <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm shadow-lg">
                        <CalendarDays size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Clinical Calendar
                        </h1>
                        <p className="text-blue-100 text-sm">
                            Your personal rotation schedule tracker
                        </p>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="animate-fade-in-up delay-100">
                    <DragDropZone
                        onFileSelect={handleFileSelect}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>

                {/* Help Text */}
                <div className="text-center animate-fade-in-up delay-200">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Sparkles size={14} className="text-yellow-300" />
                        <span className="text-blue-100 text-xs">
                            Upload your schedule Excel file to get started
                        </span>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-300">
                    {[
                        { emoji: '📅', label: 'Today\'s Shift' },
                        { emoji: '📋', label: 'Full Calendar' },
                        { emoji: '🔔', label: 'Quick Access' },
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
                        >
                            <span className="text-2xl">{feature.emoji}</span>
                            <p className="text-white/80 text-xs mt-1">{feature.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadView;
