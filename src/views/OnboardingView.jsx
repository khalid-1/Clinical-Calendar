import { useState, useMemo } from 'react';
import { Search, ChevronRight, CalendarDays, Users } from 'lucide-react';

/**
 * Onboarding view - Student selection screen
 * @param {Object} props
 * @param {Array} props.students - Array of student objects
 * @param {function} props.onSelect - Callback when student is selected
 */
const OnboardingView = ({ students, onSelectUser }) => {
    const [search, setSearch] = useState('');

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;

        const query = search.toLowerCase();
        return students.filter(s =>
            s.fullName.toLowerCase().includes(query) ||
            s.name.toLowerCase().includes(query) ||
            s.id.includes(query)
        );
    }, [students, search]);

    return (
        <div className="h-screen w-full flex flex-col gradient-hero overflow-hidden">
            {/* Header - Static */}
            <div className="px-6 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] shrink-0">
                <div className="text-center space-y-3 mb-6">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                        <CalendarDays size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Who are you?</h1>
                        <p className="text-blue-100 text-sm">Select your name to view your schedule</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 flex items-center">
                    <Search size={20} className="ml-4 text-blue-200" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="w-full bg-transparent border-none p-3 text-white placeholder-blue-200 focus:outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mt-4 px-1">
                    <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <Users size={14} />
                        <span>{filteredStudents.length} students found</span>
                    </div>
                </div>
            </div>

            {/* Student List - Scrollable */}
            <div className="flex-1 bg-gray-50 rounded-t-[2rem] overflow-hidden flex flex-col relative z-10 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="flex-1 overflow-y-auto p-4 pt-6 pb-20 no-scrollbar">
                    <div className="space-y-3">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, idx) => (
                                <button
                                    key={student.id}
                                    onClick={() => onSelectUser(student)}
                                    className={`
                                      w-full bg-white p-4 rounded-xl flex items-center justify-between 
                                      hover:bg-blue-50 transition-all duration-200 shadow-sm border border-gray-100
                                      hover:shadow-md hover:border-blue-100 active:scale-[0.98]
                                      animate-fade-in-up
                                    `}
                                    style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">{student.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">ID: {student.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No students found</p>
                                <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
