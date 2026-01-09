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
            <div className="gradient-hero text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] rounded-b-[2rem] shadow-md z-40 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onNavigate('settings')}
                            className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-smooth touch-button"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={onLogout}
                            className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-smooth touch-button"
                            aria-label="Change user"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-400 animate-pulse-soft' : 'bg-gray-400'}`} />
                    <span className="text-blue-100 text-sm">
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
                    <div className="mt-6 mb-2">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <Timer size={18} className="text-blue-600" />
                            <h3 className="font-bold text-gray-800 text-lg">Next Rotation</h3>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                            {/* Countdown badge at top-right */}
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                <p className="text-sm font-bold">{timeRemaining.days}d {timeRemaining.hours}h</p>
                            </div>

                            {/* Main content - stacked vertically */}
                            <div className="relative z-10 pr-20">
                                <p className="text-blue-100 text-sm font-medium mb-2">
                                    {formatDate(nextRotation.date)} &bull; 7:00 AM
                                </p>
                                <h4 className="text-lg font-bold leading-tight mb-2">{nextRotation.shift.hospital}</h4>
                                <p className="text-white/80 text-sm flex items-center gap-1.5 uppercase font-bold tracking-wider">
                                    <MapPin size={14} />
                                    {nextRotation.shift.code}
                                </p>
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
