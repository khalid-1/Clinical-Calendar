import { MapPin, Clock } from 'lucide-react';
import { formatDate, getDayOfWeek, getDayNumber } from '../utils/dateHelpers';
import { getHospitalCategory } from '../utils/scheduleUtils';
/**
 * Card displaying shift information for a specific date
 * @param {Object} props
 * @param {string} props.date - Date in YYYY-MM-DD format
 * @param {string|Object} props.shift - Shift code/location or an object { code: string, hospital: string }
 * @param {boolean} props.isToday - Whether this is today's shift
 * @param {boolean} props.isTomorrow - Whether this is tomorrow's shift
 * @param {boolean} props.large - Whether to display as large card
 */
const ShiftCard = ({ date, shift, isToday, isTomorrow, large = false }) => {
    const isShiftObject = shift && typeof shift === 'object';
    const code = isShiftObject ? shift.code : String(shift || '');
    const hospital = isShiftObject ? shift.hospital : '';
    const category = getHospitalCategory(hospital);
    const isWorking = code && code.toLowerCase() !== 'off' && code.trim() !== '';
    if (large) {
        return (
            <div className="glass-card rounded-3xl p-6 shadow-xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isToday
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isToday ? 'Today' : 'Preview'}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                        {formatDate(date)}
                    </span>
                </div>
                <div className="text-center py-6">
                    <div className="mb-2">
                        <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-1">
                            {isWorking ? code : 'Off Duty'}
                        </p>
                        <h2 className={`text-4xl font-extrabold ${isWorking ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                            {isWorking ? hospital : 'Relax'}
                        </h2>
                    </div>
                    <p className={`text-sm flex items-center justify-center gap-2 ${isWorking ? 'text-green-500' : 'text-gray-400'
                        }`}>
                        {isWorking ? (
                            <>
                                <MapPin size={16} />
                                <span>{code}</span>
                            </>
                        ) : (
                            <>
                                <Clock size={16} />
                                <span>No rotation scheduled</span>
                            </>
                        )}
                    </p>
                </div>
                {isWorking && (
                    <div className="mt-4 flex gap-2">
                        <div className={`flex-1 p-3 rounded-xl hospital-${category} bg-opacity-10 text-center`}>
                            <span className="text-white text-xs font-bold uppercase">{code}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-smooth hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className="bg-gray-50 w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-xs text-gray-400 uppercase font-bold">
                        {getDayOfWeek(date)}
                    </span>
                    <span className="text-lg font-bold text-gray-800">
                        {getDayNumber(date)}
                    </span>
                </div>
                <div>
                    <p className="font-bold text-gray-800">{hospital || (isWorking ? '' : 'Off')}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {isWorking ? code : 'No rotation'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isWorking && (
                    <div className={`w-2 h-2 rounded-full hospital-${category}`} />
                )}
                {isTomorrow && (
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                        Tomorrow
                    </span>
                )}
            </div>
        </div>
    );
};
export default ShiftCard;
