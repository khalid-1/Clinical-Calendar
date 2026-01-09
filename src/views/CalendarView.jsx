import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Edit2, X, Check, Save, Trash2, Share } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, getDayNumber, getTodayString } from '../utils/dateHelpers';
import { getShiftCategory, getHospitalCategory } from '../utils/scheduleUtils';
import { HOSPITALS } from '../utils/constants';
import { generateICS, downloadCalendar } from '../utils/calendarExport';

/**
 * Calendar view - Full month calendar display
 * @param {Object} props
 * @param {Object} props.user - Selected user object
 * @param {Function} props.onUpdateShift - Handler to update shift details
 */
const CalendarView = ({ user, onUpdateShift, onMoveShift, onDeleteShift }) => {
    const today = getTodayString();

    const handleExport = () => {
        const ics = generateICS(user.name, user.schedule);
        downloadCalendar(user.name, ics);
    };

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
    const [editForm, setEditForm] = useState({ hospital: '', code: '', date: '' });

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
                    code: typeof shift === 'object' ? shift.code : String(shift),
                    date: selectedDate
                });
            } else {
                setEditForm({
                    hospital: HOSPITALS[0].name,
                    code: '',
                    date: selectedDate
                });
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

        const details = {
            hospital: editForm.hospital,
            code: editForm.code,
            color: hospitalObj.color
        };

        if (editForm.date !== selectedDate) {
            // Move Shift
            onMoveShift(user.id, selectedDate, editForm.date, details);
            setSelectedDate(editForm.date); // Jump to new date
        } else {
            // Update in place
            onUpdateShift(user.id, selectedDate, details);
        }

        setIsEditing(false);
    };

    const handleDelete = () => {
        if (selectedDate && onDeleteShift) {
            onDeleteShift(user.id, selectedDate);
            setIsEditing(false);
            setSelectedDate(null);
        }
    };

    const selectedShift = selectedDate ? user.schedule[selectedDate] : null;

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header - Fixed Top */}
            <div className="bg-blue-600 text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] rounded-b-[2.5rem] shadow-xl z-40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-indigo-600/50 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-sm">
                            <Calendar size={22} className="text-blue-50" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Calendar</h1>
                            <p className="text-blue-100/80 text-sm font-medium">Full schedule view</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2 border border-white/10 shadow-sm group"
                        title="Export Calendar"
                    >
                        <Share size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold tracking-wide uppercase">Export</span>
                    </button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 overscroll-contain">
                {/* Calendar Card */}
                <div className="bg-white rounded-3xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-gray-100"
                        >
                            <ChevronLeft size={24} className="text-gray-400 hover:text-gray-800 transition-colors" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                            {monthData.monthName}
                        </h2>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-gray-100"
                        >
                            <ChevronRight size={24} className="text-gray-400 hover:text-gray-800 transition-colors" />
                        </button>
                    </div>

                    {/* Week Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1"
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
                                    {selectedShift && (
                                        <button
                                            onClick={handleDelete}
                                            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors mr-2"
                                            title="Delete Shift"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
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
                                            <p className={`text-sm font-bold uppercase tracking-wider mb-0.5 ${(() => {
                                                const cat = typeof selectedShift === 'object' ? getHospitalCategory(selectedShift.hospital) : 'default';
                                                const colors = {
                                                    'saqr': 'text-yellow-600',
                                                    'dibba': 'text-emerald-600',
                                                    'al-kuwait': 'text-teal-600',
                                                    'aq-general': 'text-blue-600',
                                                    'aq-women': 'text-pink-600',
                                                    'abdullah': 'text-purple-600',
                                                    'community': 'text-cyan-600'
                                                };
                                                return colors[cat] || 'text-blue-500';
                                            })()
                                                }`}>
                                                {typeof selectedShift === 'object' ? selectedShift.hospital.replace(' Hospital', '') : ''}
                                            </p>
                                            <p className="text-lg font-bold text-gray-500">
                                                {typeof selectedShift === 'object' ? selectedShift.code : selectedShift}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xl font-bold text-gray-400">No rotation</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-2">
                                {/* Date Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:font-normal"
                                        value={editForm.date}
                                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                    />
                                </div>

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
                <div className="mt-6 px-1 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Custom order: Saqr, Dibba, Al Kuwait, AQ General, AQ Women & Child, Omran, Community */}
                        {[
                            'Saqr Hospital',
                            'Dibba Hospital',
                            'Al Kuwait Sharjah Hospital',
                            'Al Qasimi General Hospital',
                            'Al Qasimi Women & Child Hospital',
                            'Abdullah Bin Omran Hospital',
                            'Community Health'
                        ].map(hospitalName => {
                            const h = HOSPITALS.find(hos => hos.name === hospitalName);
                            if (!h) return null;

                            const category = getHospitalCategory(h.name);
                            // Use fuller names for the box layout as per user request
                            const displayName = h.name
                                .replace('Al Qasimi', 'AQ')
                                .replace(' Hospital', '')
                                .replace('Sharjah', '')
                                .trim();

                            return (
                                <div key={h.name} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 hospital-${category}`} />
                                    <span className="text-xs font-bold text-gray-700 leading-tight">
                                        {displayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CalendarView;
