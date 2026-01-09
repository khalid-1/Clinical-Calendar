import { useMemo } from 'react';
import { LogOut, Clock, MapPin, AlertCircle, Settings, Calendar, Timer } from 'lucide-react';
import ShiftCard from '../components/ShiftCard';
import { getTodayString, getUpcomingDays, formatDate, isTomorrow, getTimeRemaining } from '../utils/dateHelpers';
import { getHospitalCategory } from '../utils/scheduleUtils';

/**
 * Dashboard view - Main app screen showing today's shift and upcoming schedule
 * @param {Object} props
 * @param {Object} props.user - Selected user object
 * @param {function} props.onLogout - Callback to logout/change user
 */
const DashboardView = ({ user, onLogout, onNavigate }) => {
    const today = getTodayString();

    // Check if we're in demo mode (outside the schedule date range)
    const activeDate = today;
    const isDemo = false;

    const todayShift = user.schedule[activeDate] || null;
    const todayCode = todayShift?.code || '';
    const isWorking = todayCode && todayCode.toLowerCase() !== 'off' && todayCode.trim() !== '';

    // Find next actual rotation (skipping OFF days)
    const nextRotation = useMemo(() => {
        // Look up to 30 days ahead for the next shift
        const candidates = getUpcomingDays(user.schedule, activeDate, 30);
        return candidates.find(c => c.shift.code && c.shift.code.toLowerCase() !== 'off' && c.shift.code.trim() !== '');
    }, [user.schedule, activeDate]);

    // Get upcoming shifts
    const upcoming = useMemo(() => {
        // Filter out past dates, start from tomorrow
        const days = getUpcomingDays(user.schedule, activeDate, 14);
        // If we have a next rotation countdown, don't show that same date in the upcoming list
        if (nextRotation) {
            return days.filter(d => d.date !== nextRotation.date);
        }
        return days;
    }, [user.schedule, activeDate, nextRotation]);

    const timeRemaining = nextRotation ? getTimeRemaining(nextRotation.date) : null;

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header - Fixed Top */}
            <div className="bg-blue-600 text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] rounded-b-[2.5rem] shadow-xl z-40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-indigo-600/50 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1 tracking-wide uppercase text-[10px]">Welcome back</p>
                        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onNavigate('settings')}
                            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-95 touch-button border border-white/5"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={onLogout}
                            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-95 touch-button border border-white/5"
                            aria-label="Change user"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-5 flex items-center gap-3 relative z-10">
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white/10 ${isWorking ? 'bg-emerald-400 animate-pulse-soft' : 'bg-gray-400'}`} />
                    <span className="text-blue-50 text-sm font-medium tracking-wide">
                        {isWorking ? 'On duty today' : 'Off duty'}
                    </span>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 overscroll-contain">
                {/* Today's Shift Card */}
                <ShiftCard
                    date={activeDate}
                    shift={todayShift}
                    isToday={!isDemo}
                    large
                />

                {/* Next Rotation Countdown (If not working today or if off duty) */}
                {nextRotation && timeRemaining && (
                    <div className="mt-8 mb-4">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="p-1.5 bg-blue-100/50 rounded-lg">
                                <Timer size={16} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg tracking-tight">Next Rotation</h3>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                            {/* Decorative circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/15 transition-colors duration-500"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>

                            {/* Countdown badge at top-right */}
                            <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                                <p className="text-sm font-bold tracking-tight">{timeRemaining.days}d {timeRemaining.hours}h</p>
                            </div>

                            {/* Main content - stacked vertically */}
                            <div className="relative z-10 pr-16">
                                <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-3">
                                    {formatDate(nextRotation.date)} &bull; 7:00 AM
                                </p>
                                <h4 className="text-xl md:text-2xl font-bold leading-tight mb-3 line-clamp-2" title={nextRotation.shift.hospital}>
                                    {nextRotation.shift.hospital}
                                </h4>
                                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                    <MapPin size={14} className="text-blue-200" />
                                    <span className="text-sm font-bold tracking-wider uppercase">{nextRotation.shift.code}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Upcoming Schedule */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-gray-800 text-lg">Upcoming Rotations</h3>
                        <span className="text-sm text-gray-400">{upcoming.length} days</span>
                    </div>

                    <div className="space-y-3">
                        {upcoming.length > 0 ? (
                            upcoming.map((item, idx) => (
                                <div
                                    key={item.date}
                                >
                                    <ShiftCard
                                        date={item.date}
                                        shift={item.shift}
                                        isTomorrow={isTomorrow(item.date)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                <Clock size={32} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No upcoming shifts</p>
                                <p className="text-gray-400 text-sm mt-1">Check back later</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
