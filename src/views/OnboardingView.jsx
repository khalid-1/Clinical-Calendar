import { useState, useMemo, useRef } from 'react';
import { Search, ChevronRight, CalendarDays, Users, Pin } from 'lucide-react';
import { getPinnedUserId, setPinnedUserId, clearPinnedUserId } from '../utils/storage';

/**
 * Onboarding view - Student selection screen
 * @param {Object} props
 * @param {Array} props.students - Array of student objects
 * @param {function} props.onSelect - Callback when student is selected
 */
const OnboardingView = ({ students, onSelectUser }) => {
    const [search, setSearch] = useState('');
    const [pinnedId, setPinnedId] = useState(() => getPinnedUserId());
    const listRef = useRef(null);

    const handlePin = (e, studentId) => {
        e.stopPropagation(); // Prevent selecting the user when pinning
        if (pinnedId === studentId) {
            // Unpin
            clearPinnedUserId();
            setPinnedId(null);
        } else {
            // Pin this user
            setPinnedUserId(studentId);
            setPinnedId(studentId);

            // Scroll to top to show the pinned user
            if (listRef.current) {
                listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const filteredStudents = useMemo(() => {
        let result = students;

        if (search.trim()) {
            const query = search.toLowerCase();
            result = students.filter(s =>
                s.fullName.toLowerCase().includes(query) ||
                s.name.toLowerCase().includes(query) ||
                s.id.includes(query)
            );
        }

        // Sort pinned user to top
        if (pinnedId) {
            result = [...result].sort((a, b) => {
                if (a.id === pinnedId) return -1;
                if (b.id === pinnedId) return 1;
                return 0;
            });
        }

        return result;
    }, [students, search, pinnedId]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Premium Header */}
            <div className="bg-blue-600 text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] rounded-b-[2.5rem] shadow-xl z-40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-indigo-600/50 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="bg-white/10 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-white/10 mb-4">
                            <CalendarDays size={32} className="text-blue-50" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Who are you?</h1>
                        <p className="text-blue-100/80 text-sm font-medium">Select your name to get started</p>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 shadow-lg flex items-center group focus-within:bg-white/20 transition-all">
                        <Search size={20} className="ml-3 text-blue-200 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full bg-transparent border-none p-3 text-white placeholder-blue-200/70 focus:outline-none font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Results Count & List */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto px-4 pt-6 pb-12 overscroll-contain"
            >
                <div className="flex items-center justify-between mb-4 px-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'} Found
                    </p>
                </div>

                <div className="space-y-3 pb-8">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => {
                            const isPinned = student.id === pinnedId;
                            return (
                                <button
                                    key={student.id}
                                    onClick={() => onSelectUser(student)}
                                    className={`
                                      w-full bg-white p-4 rounded-2xl flex items-center justify-between 
                                      border transition-all duration-200 relative overflow-hidden group
                                      ${isPinned
                                            ? 'border-blue-200 shadow-lg shadow-blue-500/10'
                                            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100'
                                        }
                                      active:scale-[0.98]
                                    `}
                                >
                                    {isPinned && (
                                        <div className="absolute top-0 right-0 bg-blue-600 text-[10px] text-white font-bold px-2 py-1 rounded-bl-xl z-10">
                                            PINNED
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${isPinned
                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                            }`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold text-base ${isPinned ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium tracking-wide">ID: {student.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <div
                                            onClick={(e) => handlePin(e, student.id)}
                                            className={`p-2.5 rounded-xl transition-all duration-200 ${isPinned
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-300 hover:text-blue-500 hover:bg-gray-50'
                                                }`}
                                            title={isPinned ? "Unpin student" : "Pin to top"}
                                        >
                                            <Pin
                                                size={18}
                                                fill={isPinned ? "currentColor" : "none"}
                                                className="transition-transform active:scale-90"
                                            />
                                        </div>
                                        <div className="p-2 text-gray-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 opacity-60">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-bold">No students found</p>
                            <p className="text-gray-400 text-sm mt-1">Try searching for a different name</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;

