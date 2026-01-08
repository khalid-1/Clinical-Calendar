import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, getDayNumber, getTodayString } from '../utils/dateHelpers';
import { getShiftCategory, getHospitalCategory } from '../utils/parseSchedule';

/**
 * Calendar view - Full month calendar display
 * @param {Object} props
 * @param {Object} props.user - Selected user object
 */
const CalendarView = ({ user }) => {
    const today = getTodayString();

    // Get initial month/year from schedule or current date
    const initialDate = useMemo(() => {
        const dates = Object.keys(user.schedule).sort();
        if (dates.length > 0) {
            const firstDate = new Date(dates[0] + 'T00:00:00');
            return { year: firstDate.getFullYear(), month: firstDate.getMonth() };
        }
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    }, [user.schedule]);

    const [currentYear, setCurrentYear] = useState(initialDate.year);
    const [currentMonth, setCurrentMonth] = useState(initialDate.month);
    const [selectedDate, setSelectedDate] = useState(null);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const monthData = useMemo(() => {
        const days = getDaysInMonth(currentYear, currentMonth);
        // Check if we need to shift back one day as per user request
        // (val + 6) % 7 is equivalent to (val - 1) with wrap around
        const rawFirstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const firstDay = (rawFirstDay + 6) % 7;

        const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        return { days, firstDay, monthName };
    }, [currentYear, currentMonth]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const selectedShift = selectedDate ? user.schedule[selectedDate] : null;

    return (
        <div className="min-h-screen pb-24 bg-gray-50">
            {/* Header */}
            <div className="gradient-hero text-white px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Calendar</h1>
                            <p className="text-blue-200 text-sm">View your full schedule</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="px-4 -mt-4">
                <div className="glass-card rounded-2xl p-4 shadow-lg">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-smooth touch-button"
                        >
                            <ChevronLeft size={24} className="text-gray-600" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-800">
                            {monthData.monthName}
                        </h2>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-smooth touch-button"
                        >
                            <ChevronRight size={24} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Week Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="text-center text-xs font-semibold text-gray-400 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for alignment */}
                        {Array(monthData.firstDay).fill(null).map((_, idx) => (
                            <div key={`empty-${idx}`} className="aspect-square" />
                        ))}

                        {/* Day cells */}
                        {monthData.days.map(dateStr => {
                            const dayNum = getDayNumber(dateStr);
                            const shift = user.schedule[dateStr];
                            const isShiftObject = shift && typeof shift === 'object';
                            const shiftCode = isShiftObject ? shift.code : String(shift || '');
                            const hasShift = shiftCode && shiftCode.trim() !== '';
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const category = hasShift ? getShiftCategory(shift) : 'off';

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                                    className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    transition-all duration-200 relative
                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    ${isToday ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                    ${!isToday && hasShift ? 'bg-gray-50' : ''}
                  `}
                                >
                                    <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>
                                        {dayNum}
                                    </span>
                                    {hasShift && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 hospital-${getHospitalCategory(shift.hospital)}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                    <div className="mt-4 glass-card rounded-2xl p-4 shadow-lg animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <div className="mt-1">
                                    {selectedShift ? (
                                        <>
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">
                                                {typeof selectedShift === 'object' ? selectedShift.hospital : ''}
                                            </p>
                                            <p className="text-xl font-bold text-gray-800">
                                                {typeof selectedShift === 'object' ? selectedShift.code : selectedShift}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xl font-bold text-gray-400">No rotation</p>
                                    )}
                                </div>
                            </div>
                            {selectedShift && (
                                <div className={`px-4 py-2 rounded-xl hospital-${getHospitalCategory(selectedShift.hospital)} shadow-sm`}>
                                    <span className="text-white text-sm font-bold">
                                        {typeof selectedShift === 'object' ? selectedShift.code : selectedShift}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Legend */}
                <div className="mt-4 px-2">
                    <p className="text-xs text-gray-400 font-medium mb-2">Hospital Legend</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {[
                            { label: 'AQ General', className: 'hospital-aq-general' },
                            { label: 'AQ Women', className: 'hospital-aq-women' },
                            { label: 'Saqr', className: 'hospital-saqr' },
                            { label: 'Dibba', className: 'hospital-dibba' },
                            { label: 'Community', className: 'hospital-community' },
                            { label: 'Abdullah Omran', className: 'hospital-abdullah' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${item.className}`} />
                                <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
