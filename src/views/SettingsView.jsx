import { useState } from 'react';
import { Settings, UserCircle, Trash2, RefreshCw, ChevronRight, ChevronLeft, AlertTriangle, CalendarDays, Info } from 'lucide-react';
import AdminTools from '../components/AdminTools';

const SettingsView = ({ user, onChangeUser, onResetData, adminProps }) => {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [activeView, setActiveView] = useState('main'); // 'main' | 'admin'

    const handleReset = () => {
        onResetData();
        setShowResetConfirm(false);
    };

    if (activeView === 'admin') {
        return (
            <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
                <div className="bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] shadow-sm flex items-center gap-2 shrink-0 z-20">
                    <button
                        onClick={() => setActiveView('main')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors touch-button"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800">Admin Tools</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-24 overscroll-contain pt-4">
                    {adminProps && (
                        <AdminTools
                            students={adminProps.students}
                            overrides={adminProps.overrides}
                            onApplyOverrides={adminProps.onApplyOverrides}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header - Fixed Top */}
            <div className="bg-blue-600 text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] rounded-b-[2.5rem] shadow-xl z-40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-indigo-600/50 pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-sm">
                        <Settings size={22} className="text-blue-50" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                        <p className="text-blue-100/80 text-sm font-medium">Manage your profile & data</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 overscroll-contain">
                {/* Profile Section */}
                <div className="space-y-5">
                    <div className="bg-white rounded-3xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg leading-tight">{user.name}</p>
                                <p className="text-gray-400 text-xs font-medium tracking-wide">ID: {user.id}</p>
                            </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1.5">Full Name</p>
                            <p className="text-gray-700 font-medium">{user.fullName}</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 text-blue-600">
                                <CalendarDays size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
                                {Object.keys(user.schedule).length}
                            </p>
                            <p className="text-xs font-semibold text-gray-400">Scheduled Days</p>
                        </div>
                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600">
                                <Info size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
                                {new Set(Object.values(user.schedule)).size}
                            </p>
                            <p className="text-xs font-semibold text-gray-400">Unique Rotations</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider px-2">Actions</p>

                        <button
                            onClick={onChangeUser}
                            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <UserCircle size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">Change Profile</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Switch to a different student</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                        {/* Admin Tools - Disabled for now as per user request
                        <button
                            onClick={() => setActiveView('admin')}
                            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 hover:border-purple-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Settings size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">Admin Tools</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Bulk schedule management</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>
                        */}

                    </div>

                    {/* App Info */}
                    <div className="text-center pt-8 pb-4 space-y-1">
                        <p className="text-gray-300 text-[10px] tracking-widest uppercase font-bold">Clinical Calendar</p>
                        <p className="text-gray-400 text-xs flex items-center justify-center gap-1 font-medium">
                            Developed by <span className="text-gray-600">Khalid Said</span>
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-400 font-mono">v1.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
