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
            {/* Header - Fixed */}
            <div className="gradient-hero text-white px-6 pb-8 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] shadow-md rounded-b-[2rem] z-40 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Settings</h1>
                        <p className="text-blue-200 text-sm">Manage your profile & data</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 overscroll-contain">
                {/* Profile Section */}
                <div className="space-y-4">
                    <div className="glass-card rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-lg">{user.name}</p>
                                <p className="text-gray-500 text-sm">ID: {user.id}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Full Name</p>
                            <p className="text-gray-700">{user.fullName}</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <CalendarDays size={20} className="text-blue-500 mb-2" />
                            <p className="text-2xl font-bold text-gray-800">
                                {Object.keys(user.schedule).length}
                            </p>
                            <p className="text-xs text-gray-500">Scheduled Days</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <Info size={20} className="text-green-500 mb-2" />
                            <p className="text-2xl font-bold text-gray-800">
                                {new Set(Object.values(user.schedule)).size}
                            </p>
                            <p className="text-xs text-gray-500">Unique Rotations</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold px-1">Actions</p>

                        <button
                            onClick={onChangeUser}
                            className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-smooth active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <UserCircle size={20} className="text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Change Profile</p>
                                    <p className="text-xs text-gray-500">Switch to a different student</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                        <button
                            onClick={() => setActiveView('admin')}
                            className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-smooth active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Settings size={20} className="text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Admin Tools</p>
                                    <p className="text-xs text-gray-500">Bulk schedule management</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                    </div>

                    {/* App Info */}
                    <div className="text-center pt-8 pb-8 space-y-1">
                        <p className="text-gray-300 text-[10px] tracking-widest uppercase font-semibold">Clinical Calendar</p>
                        <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
                            Developed by <span className="font-medium text-gray-600">Khalid Said</span>
                        </p>
                        <p className="text-gray-300 text-[10px]">v1.2.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
