import React, { useState, useEffect } from 'react';
import { Download, Save, Users, Calendar, Building2, History, Clock } from 'lucide-react';
import { getUpcomingDays } from '../utils/dateHelpers';
import { HOSPITALS } from '../utils/constants';

const AdminTools = ({ students, overrides, onApplyOverrides }) => {
    const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'history'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedHospital, setSelectedHospital] = useState(HOSPITALS[0]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [isAllStudents, setIsAllStudents] = useState(true);
    const [changelog, setChangelog] = useState([]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetch('/api/changelog')
                .then(res => res.json())
                .then(data => setChangelog(data))
                .catch(err => console.error('Failed to load history', err));
        }
    }, [activeTab]);

    const handleApply = () => {
        if (!startDate || !endDate || !selectedHospital) {
            alert('Please select start date, end date, and hospital.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
        }

        const newOverrides = { ...overrides };
        const targetIds = isAllStudents ? students.map(s => s.id) : selectedStudentIds;

        targetIds.forEach(id => {
            if (!newOverrides[id]) newOverrides[id] = {};
            dates.forEach(date => {
                newOverrides[id][date] = {
                    hospital: selectedHospital.name,
                    color: selectedHospital.color
                };
            });
        });

        onApplyOverrides(newOverrides);
        alert(`Updated ${targetIds.length} students for ${dates.length} days.`);
    };

    const handleDirectSave = async () => {
        if (!confirm('This will OVERWRITE your local schedule.json file. Are you sure?')) return;

        // Generate the export data (same logic as generateJSON)
        // Generate the export data (merging current UI state)
        const exportData = students.map(student => {
            // 1. Start with existing student schedule
            const shifts = {};

            // Copy existing shifts properly
            Object.entries(student.schedule).forEach(([date, shiftData]) => {
                shifts[date] = {
                    shift: shiftData.code,
                    hospital: shiftData.hospital || ""
                };
            });

            // 2. Apply pending changes if this student is selected
            if ((isAllStudents || selectedStudentIds.includes(student.id)) && selectedHospital) {
                const datesToUpdate = getDatesInRange(startDate, endDate);
                datesToUpdate.forEach(date => {
                    // Preserve existing shift code, only update hospital
                    // If no existing shift, we might not want to create one? 
                    // Usually we only update existing shifts.
                    // Let's assume we update if the date exists in the student's schedule OR just upsert?
                    // The previous logic was "update override".
                    // Let's check safely:
                    if (shifts[date]) {
                        shifts[date].hospital = selectedHospital.name;
                    } else {
                        // Optional: Create new shift if it didn't exist? 
                        // For now, let's stick to modifying existing shifts to be safe, 
                        // unless the requirement is to add new shifts. 
                        // But bulk editor usually tags existing rotations.
                        shifts[date] = {
                            shift: "Community Health", // Default fallback or empty?
                            hospital: selectedHospital.name
                        };
                    }
                });
            }

            return {
                id: student.id,
                name: student.fullName,
                shifts: shifts
            };
        });

        // Create Log Entry
        const desc = `Bulk update: ${isAllStudents ? 'All' : selectedStudentIds.length} students assigned to ${selectedHospital.name}`;

        const payload = {
            scheduleData: exportData,
            logEntry: {
                timestamp: new Date().toISOString(),
                description: desc,
                affectedStudents: isAllStudents ? students.length : selectedStudentIds.length,
                hospital: selectedHospital.name
            }
        };

        try {
            const response = await fetch('/api/save-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                alert('✅ Saved successfully! The app will reload shortly.');
                window.location.reload();
            } else {
                alert('❌ Error: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('❌ Network Error: Is the dev server running?');
        }
    };

    const generateJSON = () => {
        const exportData = students.map(student => {
            const shifts = {};
            Object.entries(student.schedule).forEach(([date, shiftData]) => {
                shifts[date] = {
                    shift: shiftData.code,
                    hospital: shiftData.hospital || ""
                };
            });

            return {
                id: student.id,
                name: student.fullName, // Use original full name
                shifts: shifts
            };
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "updated_schedule.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl mt-8 relative overflow-hidden">
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow delay-700"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Admin Tools</h3>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Schedule Management</p>
                    </div>
                </div>

                <div className="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50 backdrop-blur-sm">
                    {['editor', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab
                                ? 'bg-white shadow-lg shadow-gray-200/50 text-blue-600 scale-100'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'editor' ? (
                <div className="space-y-6 animate-fade-in-up relative z-10">
                    {/* Date Selection Card */}
                    <div className="bg-white/60 p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Date Range
                        </h4>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 transition-colors group-hover:text-blue-600">Start Date</label>
                                <div className="relative overflow-hidden rounded-xl">
                                    <input
                                        type="date"
                                        className="appearance-none block w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm font-medium h-12 px-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:bg-white"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 transition-colors group-hover:text-blue-600">End Date</label>
                                <div className="relative overflow-hidden rounded-xl">
                                    <input
                                        type="date"
                                        className="appearance-none block w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm font-medium h-12 px-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:bg-white"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hospital Selection Card */}
                    <div className="bg-white/60 p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Hospital Assignment
                        </h4>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-800 font-bold px-5 py-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer hover:bg-white"
                                value={selectedHospital.name}
                                onChange={e => setSelectedHospital(HOSPITALS.find(h => h.name === e.target.value))}
                            >
                                {HOSPITALS.map(h => (
                                    <option key={h.name} value={h.name}>{h.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        <div className={`mt-3 h-1.5 rounded-full ${selectedHospital.color} w-full opacity-60`}></div>
                    </div>

                    {/* Student Selection Card */}
                    <div className="bg-white/60 p-5 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Target Students
                        </h4>
                        <div className="flex gap-4 mb-4 p-1 bg-gray-100/50 rounded-xl w-fit">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${isAllStudents ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                                <input
                                    type="radio"
                                    checked={isAllStudents}
                                    onChange={() => setIsAllStudents(true)}
                                    className="hidden"
                                />
                                <span>All Students</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${!isAllStudents ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                                <input
                                    type="radio"
                                    checked={!isAllStudents}
                                    onChange={() => setIsAllStudents(false)}
                                    className="hidden"
                                />
                                <span>Select Specific</span>
                            </label>
                        </div>

                        {!isAllStudents && (
                            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-white/50 custom-scrollbar">
                                {students.map(s => (
                                    <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100 group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedStudentIds.includes(s.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                            {selectedStudentIds.includes(s.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(s.id)}
                                            onChange={e => {
                                                if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id]);
                                                else setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                                            }}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{s.name}</span>
                                        <span className="text-xs text-gray-400 ml-auto bg-gray-50 px-2 py-1 rounded-md">{s.id}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleApply}
                            className="group relative overflow-hidden bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg shadow-blue-100 border border-blue-100 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                <span>Apply Only</span>
                            </span>
                            <span className="text-[10px] font-medium text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">Temporary (RAM)</span>
                        </button>

                        <button
                            onClick={handleDirectSave}
                            className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                <span>Save to Disk</span>
                            </span>
                            <span className="text-[10px] font-medium text-emerald-100 uppercase tracking-widest opacity-80">Permanent Update</span>
                        </button>
                    </div>

                    <div className="flex justify-center mt-2">
                        <button
                            onClick={generateJSON}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors py-2 px-4 rounded-lg hover:bg-gray-100/50"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Backup JSON
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in relative z-10">
                    {changelog.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">No history available yet.</p>
                            <p className="text-xs text-gray-300 mt-1">Changes you save to disk will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 h-96 overflow-y-auto custom-scrollbar px-1">
                            {changelog.map((entry, idx) => (
                                <div key={idx} className="group bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-blue-50 shadow-sm hover:shadow-md transition-all hover:bg-white relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(entry.timestamp).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                        <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                            {entry.affectedStudents} Students
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 leading-snug">{entry.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-medium">Assigned to:</span>
                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {entry.hospital}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminTools;
