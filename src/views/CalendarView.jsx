import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Edit2, X, Check, Save } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, getDayNumber, getTodayString } from '../utils/dateHelpers';
import { getShiftCategory, getHospitalCategory } from '../utils/parseSchedule';
import { HOSPITALS } from '../utils/constants';

/**
 * Calendar view - Full month calendar display
 * @param {Object} props
 * @param {Object} props.user - Selected user object
 * @param {Function} props.onUpdateShift - Handler to update shift details
 */
const CalendarView = ({ user, onUpdateShift }) => {
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

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ hospital: '', code: '' });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const monthData = useMemo(() => {
        const days = getDaysInMonth(currentYear, currentMonth);
        const rawFirstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const firstDay = (rawFirstDay + 6) % 7;

        const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        return { days, firstDay, monthName };
    }, [currentYear, currentMonth]);

    // Reset editing when selection changes
    useEffect(() => {
        setIsEditing(false);
        if (selectedDate) {
            const shift = user.schedule[selectedDate];
            if (shift) {
                setEditForm({
                    hospital: typeof shift === 'object' ? shift.hospital : '',
                    code: typeof shift === 'object' ? shift.code : String(shift)
                });
            } else {
                setEditForm({ hospital: HOSPITALS[0].name, code: '' });
            }
        }
    }, [selectedDate, user.schedule]);

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

    const handleSaveEdit = () => {
        if (!selectedDate) return;

        // Find hospital color
        const hospitalObj = HOSPITALS.find(h => h.name === editForm.hospital) || HOSPITALS[0];

        onUpdateShift(user.id, selectedDate, {
            hospital: editForm.hospital,
            code: editForm.code,
            color: hospitalObj.color
        });

        setIsEditing(false);
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
                        {Array(monthData.firstDay).fill(null).map((_, idx) => (
                            <div key={`empty-${idx}`} className="aspect-square" />
                        ))}

                        {monthData.days.map(dateStr => {
                            const dayNum = getDayNumber(dateStr);
                            const shift = user.schedule[dateStr];
                            const isShiftObject = shift && typeof shift === 'object';
                            const shiftCode = isShiftObject ? shift.code : String(shift || '');
                            const hasShift = shiftCode && shiftCode.trim() !== '';
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;

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

                {/* Selected Date Details / Editor */}
                {selectedDate && (
                    <div className="mt-4 glass-card rounded-2xl p-5 shadow-lg animate-fade-in-up">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        <Check size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    {selectedShift ? (
                                        <>
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
                                                {typeof selectedShift === 'object' ? selectedShift.hospital : ''}
                                            </p>
                                            <p className="text-2xl font-black text-gray-800">
                                                {typeof selectedShift === 'object' ? selectedShift.code : selectedShift}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xl font-bold text-gray-400">No rotation</p>
                                    )}
                                </div>
                                {selectedShift && (
                                    <div className={`px-4 py-2 rounded-xl hospital-${getHospitalCategory(selectedShift.hospital)} shadow-sm`}>
                                        <span className="text-white text-sm font-bold">
                                            {typeof selectedShift === 'object' ? selectedShift.code : selectedShift}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Hospital</label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={editForm.hospital}
                                            onChange={e => setEditForm({ ...editForm, hospital: e.target.value })}
                                        >
                                            <option value="">Select Hospital</option>
                                            {HOSPITALS.map(h => (
                                                <option key={h.name} value={h.name}>{h.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Rotation / Shift Code</label>
                                    <input
                                        type="text"
                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:font-normal"
                                        placeholder="e.g. ER, ICU, OT"
                                        value={editForm.code}
                                        onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-4 px-2">
                    <p className="text-xs text-gray-400 font-medium mb-2">Hospital Legend</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {HOSPITALS.map(h => (
                            <div key={h.name} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${h.color}`} />
                                <span className="text-[10px] text-gray-500 font-medium">{h.name.replace(' Hospital', '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
