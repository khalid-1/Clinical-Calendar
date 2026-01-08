<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Clinical Calendar 2026</title>
    
    <!-- PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#2563eb">
    <link rel="manifest" href="data:application/json;base64,ewogICJuYW1lIjogIkNsaW5pY2FsIENhbGVuZGFyIiwKICAic2hvcnRfbmFtZSI6ICJDbGluaWNhbCIsCiAgInN0YXJ0X3VybCI6ICIuIiwKICAiZGlzcGxheSI6ICJzdGFuZGFsb25lIiwKICAiYmFja2dyb3VuZF9jb2xvciI6ICIjZmZmZmZmIiwKICAidGhlbWVfY29xvciI6ICIjMjU2M2ViIiwKICAiaWNvbnMiOiBbXQp9">

    <!-- Libraries -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Custom Styles -->
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
        .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
        /* Hide scrollbar for clean UI */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;
        const { Calendar, MapPin, User, Search, ChevronRight, Clock, CalendarDays, LogOut, CheckCircle2 } = lucide;

        // --- RAW DATA ---
        // Embedded parsing logic to handle the CSV structure provided
        const RAW_CSV = `S.N,Month,,2026-01-01,,,,,,,,,,,,2026-02-01,,,,,,,,,,,,,,,,2026-03-01,,,,2026-04-01,,,,,,,,,,,,,,,,,,,2026-05-01,,,,,,,,,
,,,1,,,,2,,,,3,,,,4,,,,5,,,,6,,,,7,,,,8,,,,9,,,,10,,,,11,,,,12,,,,13,,,,14,,,,15,,,,
,,,13,14,15,17,19,20,21,23,27,28,29,31,3,4,5,7,10,11,12,14,17,18,19,21,24,25,26,28,3,4,5,7,10,11,12,14,31,1,2,4,Shifts,,,,,,,,,,,,,,,,,,,,Hospitals
1,22904073,Fatema Mohammed Abdulla Alteneiji,Community HealthNursing,,,,Community HealthNursing,,,,,OT,OT,ER,,ER,ICU,ICU,,AE,MW,ICU,,ICU,MW,MW,ER,ER,ER,,PN-1,OPD,OPD,,,OBS -1 W,OBS -1 W,LR,,LR,LR,LR,,,,,,,,,,,,,,,,,,,,,
2,22904064,Shouq Ali Saeed Ali Alshehhi,Community HealthNursing,,,,Community HealthNursing,,,,,OT,OT,ER,,ER,ICU,ICU,,ER,MW,ICU,,ICU,MW,MW,ER,ER,ER,,PN-1,OPD,OPD,,,OBS -1 W,OBS -1 W,LR,,LR,LR,LR,,,,,,,,,,,,,,,,,,,,,
3,22904068,Sara Waleed,,,,,,,,,,ER,ER,OT,,OT,ICU,ICU,,ICU,ICU,ER,,MW,MW,ER,MW,MW,MW,,OPD,PN-1,PN-1,,,LR,LR,OBS -1 W,,OBS -1 W,OBS -1 W,OBS -1 W,,,,,,,,,,,,,,,,,,,,,
4,22904040,Aisha Abdulla,,,,,,,,,,ER,ER,OT,,OT,ICU,ICU,,ICU,ICU,ER,,MW,MW,ER,MW,MW,MW,,OPD,PN-1,PN-1,,,LR,LR,OBS -1 W,,OBS -1 W,OBS -1 W,OBS -1 W,,,,,,,,,,,,,,,,,,,,,
5,22904051,Alya Ibrahim,,,,,,,,,,OT,OT,ICU,,ICU,ER,ER,,ICU,ICU,MW,,ER,ER,MW,MW,MW,MW,,PN-1,PN-1,OPD,,,OBS -1 W,OBS -1 W,LR,,OBS -1 W,OBS -1 W,OBS -1 W,,,,,,,,,,,,,,,,,,,,,
6,22904033,Meera Abdulrahman,,,,,,,,,,OT,OT,ICU,,ICU,ER,ER,,ICU,ICU,MW,,ER,ER,MW,MW,MW,MW,,PN-1,PN-1,OPD,,,OBS -1 W,OBS -1 W,LR,,OBS -1 W,OBS -1 W,OBS -1 W,,,,,,,,,,,,,,,,,,,,,
7,22904058,Mouza Mohammed,,,,,,,,,,ER,ER,ICU 1,,ICU 1,HD,ICU 2,,ER 4,ER,OT,,FMW,CCU,CCU,MMW,PN-2,PN-2,,PN-2,LR,PN-2,,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
8,22904072,Meera Jasem,,,,,,,,,,ER,ER,ICU 1,,ICU 1,HD,ICU 2,,ER 4,ER,OT,,FMW,CCU,CCU,MMW,PN-2,PN-2,,PN-2,LR,PN-2,,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
9,22904062,Asma Ali,,,,,,,,,,ICU 1,ICU 1,ER 5,,HD,ER 2,ICU 3,,ER,ER,OT,,ICU,ICU,MSW,PN-1,PN-1,PN-1,,LR,ER,ER,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
10,22904029,Amnah Mohammed,,,,,,,,,,ICU 1,ICU 1,ER 5,,HD,ER 2,ICU 3,,ER,ER,OT,,ICU,ICU,MSW,PN-1,PN-1,PN-1,,LR,ER,ER,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
11,22904066,Reem Thabit Thabit Ahmed,,,,,,,,,,ICU 1,ICU 1,ER 5,,HD,ER 2,ICU 3,,ER,ER,OT,,ICU,ICU,MSW,PN-1,PN-1,PN-1,,LR,ER,ER,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
12,22904067,Alaa Faesal,,,,,,,,,,ICU 1,ICU 1,HD,,ER 2,ICU 2,ER 4,,ER,OT,FMW,,CCU,CCU,MMW,PN-2,PN-2,PN-2,,LR,PN-2,PN-2,,OBG-2,OBG-2,OBG-2,,OBG-1,OBG-1,OBG-1,,,,,,,,,,,,,,,,,,,,,
13,22904031,Omar Mohammed,,,,,,,,,,ICU 2,ICU 2,ICU 3,,ICU 1,SU,ER 5,,OT,ER,FSW,,ER,MMW,ICU,ER,ER,ER,,ER,ER,ER,,,OT,OT,OT,,Pead ER,NICU,ER OBS,,,,,,,,,,,,,,,,,,,,,
14,22904052,Abduljabar Mohammed,,,,,,,,,,ICU 2,ICU 2,ICU 3,,ICU 1,SU,ER 5,,OT,ER,FSW,,ER,MMW,ICU,ER,ER,ER,,ER,ER,ER,,,OT,OT,OT,,Pead ER,NICU,ER OBS,,,,,,,,,,,,,,,,,,,,,`;

        // --- HELPERS ---

        const parseData = (csvText) => {
            const rows = csvText.trim().split('\n');
            if (rows.length < 4) return { dates: [], students: [] };

            const dayRow = rows[2].split(',');
            const students = [];
            const dateMap = {}; // index -> Date String (YYYY-MM-DD)

            // 1. Parse Dates
            // Logic: Start Jan 13, 2026. Iterate days. If day number decreases, increment month.
            let currentYear = 2026;
            let currentMonth = 0; // 0 = Jan
            let lastDayVal = 0;
            
            // The data starts at index 3 based on visual inspection of the snippet
            const startIndex = 3;

            for (let i = startIndex; i < dayRow.length; i++) {
                const val = parseInt(dayRow[i]);
                if (!isNaN(val)) {
                    // Logic to detect month change (e.g., 31 -> 3)
                    if (val < lastDayVal) {
                        currentMonth++;
                    }
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }

                    // Create date string
                    const d = new Date(currentYear, currentMonth, val);
                    const dateStr = d.toISOString().split('T')[0];
                    dateMap[i] = dateStr;
                    lastDayVal = val;
                }
            }

            // 2. Parse Students
            for (let r = 3; r < rows.length; r++) {
                const cols = rows[r].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma respecting quotes
                if (cols.length < 3) continue;

                const id = cols[1];
                const rawName = cols[2].replace(/"/g, '');
                // Clean name: First 2 names usually enough for display
                const nameParts = rawName.split(' ');
                const name = nameParts.slice(0, 2).join(' ');

                const schedule = {};
                
                for (let i = startIndex; i < cols.length; i++) {
                    const shift = cols[i] ? cols[i].trim() : '';
                    if (shift && dateMap[i]) {
                        schedule[dateMap[i]] = shift;
                    }
                }

                students.push({ id, fullName: rawName, name, schedule });
            }

            return { students, dateMap };
        };

        const getTodayString = () => {
            return new Date().toISOString().split('T')[0];
        };

        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };

        // --- COMPONENTS ---

        const Onboarding = ({ students, onSelect }) => {
            const [search, setSearch] = useState('');

            const filtered = students.filter(s => 
                s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                s.id.includes(search)
            );

            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex flex-col justify-center items-center text-white">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center space-y-2">
                            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                                <CalendarDays className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">Clinical Calendar</h1>
                            <p className="text-blue-100">Find your schedule.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 flex items-center">
                            <Search className="w-5 h-5 ml-3 text-blue-200" />
                            <input 
                                type="text"
                                placeholder="Search your name or ID..."
                                className="w-full bg-transparent border-none p-3 text-white placeholder-blue-200 focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                            {filtered.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => onSelect(student)}
                                    className="w-full bg-white text-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-all shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        const Dashboard = ({ user, onLogout }) => {
            const today = getTodayString();
            // FOR DEMO PURPOSES: If today is not in 2026, let's default to the start of the rotation 
            // so the user sees something. Otherwise it looks empty.
            // Jan 13 2026 is the start.
            const demoToday = "2026-01-15"; // Pick a date inside the data for demo visualization if "real" today is off
            const isOffRange = new Date().getFullYear() !== 2026;
            const activeDate = isOffRange ? demoToday : today;

            const todayShift = user.schedule[activeDate] || "Off";
            const isWorking = todayShift !== "Off" && todayShift !== "";

            // Get upcoming 7 days
            const upcoming = [];
            const d = new Date(activeDate);
            for (let i = 1; i <= 14; i++) {
                const nextD = new Date(d);
                nextD.setDate(d.getDate() + i);
                const dateStr = nextD.toISOString().split('T')[0];
                const shift = user.schedule[dateStr];
                if (shift) {
                    upcoming.push({ date: dateStr, shift });
                }
            }

            return (
                <div className="min-h-screen pb-10">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-6 pb-24 rounded-b-[2.5rem] shadow-xl relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                            </div>
                            <button onClick={onLogout} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="px-5 -mt-16 relative z-20 space-y-6">
                        
                        {/* Today Card */}
                        <div className="glass-card bg-white rounded-3xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {isOffRange ? "Demo View (Jan 15)" : "Today"}
                                </span>
                                <span className="text-gray-400 text-sm font-medium">{formatDate(activeDate)}</span>
                            </div>
                            
                            <div className="text-center py-4">
                                <h2 className={`text-4xl font-extrabold mb-2 ${isWorking ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {todayShift}
                                </h2>
                                <p className={`text-sm flex items-center justify-center gap-1 ${isWorking ? 'text-green-500' : 'text-gray-400'}`}>
                                    {isWorking ? <><MapPin className="w-4 h-4" /> Shift Active</> : "No rotation scheduled"}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats or Info */}
                        {isOffRange && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                                <div className="text-yellow-600 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-800 font-bold">Preview Mode</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Since it's not Jan 2026 yet, we're showing you a preview of the schedule.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Schedule */}
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-4 ml-1">Upcoming Rotations</h3>
                            <div className="space-y-3">
                                {upcoming.length > 0 ? upcoming.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-50 w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-gray-100">
                                                <span className="text-xs text-gray-400 uppercase font-bold">{new Date(item.date).toLocaleDateString('en-US', {weekday:'short'})}</span>
                                                <span className="text-lg font-bold text-gray-800">{new Date(item.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{item.shift}</p>
                                                <p className="text-xs text-gray-500">Scheduled</p>
                                            </div>
                                        </div>
                                        {idx === 0 && <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">Tomorrow</span>}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-gray-400">
                                        <p>No upcoming shifts found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => {
            const [data, setData] = useState({ students: [], dateMap: {} });
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                // 1. Parse CSV
                const parsed = parseData(RAW_CSV);
                setData(parsed);

                // 2. Check LocalStorage
                const savedId = localStorage.getItem('clinical_user_id');
                if (savedId) {
                    const found = parsed.students.find(s => s.id === savedId);
                    if (found) setUser(found);
                }
                setLoading(false);
            }, []);

            const handleLogin = (student) => {
                setUser(student);
                localStorage.setItem('clinical_user_id', student.id);
            };

            const handleLogout = () => {
                setUser(null);
                localStorage.removeItem('clinical_user_id');
            };

            if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">Loading schedule...</div>;

            return (
                <div className="antialiased max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl overflow-hidden relative">
                    {user ? 
                        <Dashboard user={user} onLogout={handleLogout} /> : 
                        <Onboarding students={data.students} onSelect={handleLogin} />
                    }
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
        lucide.createIcons();
    </script>
</body>
</html>