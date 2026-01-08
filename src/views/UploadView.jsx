import { useState } from 'react';
import { CalendarDays, Sparkles, Clock, Calendar, Bell } from 'lucide-react';
import DragDropZone from '../components/DragDropZone';
import { parseScheduleFile } from '../utils/parseSchedule';

/**
 * Upload view - First screen shown when no data exists
 */
const UploadView = ({ onDataParsed }) => {
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
                onDataParsed(data);
            }, 500);
        } catch (err) {
            setError(err.message || 'Failed to parse the file. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex flex-col justify-center items-center p-6 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-sm space-y-8 relative z-10">
                {/* Logo & Header */}
                <div className="text-center space-y-5 animate-fade-in-up">
                    <div className="bg-white/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                        <CalendarDays size={48} className="text-white drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                            Clinical Calendar
                        </h1>
                        <p className="text-blue-100 text-sm font-medium opacity-90">
                            Your personal rotation schedule tracker
                        </p>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="animate-fade-in-up delay-100">
                    <div className="bg-white/5 backdrop-blur-lg rounded-[2.5rem] p-1 border border-white/10 shadow-2xl">
                        <DragDropZone
                            onFileSelect={handleFileSelect}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center animate-fade-in-up delay-200">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
                        <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                        <span className="text-white text-xs font-semibold tracking-wide">
                            Upload your schedule to get started
                        </span>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-300">
                    {[
                        { icon: <Clock size={20} />, label: 'Today\'s Shift' },
                        { icon: <Calendar size={20} />, label: 'Full Calendar' },
                        { icon: <Bell size={20} />, label: 'Quick Access' },
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-xl hover:bg-white/15 transition-colors cursor-default"
                        >
                            <div className="text-white mx-auto flex justify-center mb-2">
                                {feature.icon}
                            </div>
                            <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider">{feature.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadView;
