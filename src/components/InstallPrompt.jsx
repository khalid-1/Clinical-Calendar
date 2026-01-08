import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, MoreVertical, Download, Smartphone, CalendarDays } from 'lucide-react';

const InstallPrompt = ({ onBypass }) => {
    const [os, setOs] = useState('ios'); // Default to iOS for better visibility? Or detect initially
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // Initial Detection (Soft default)
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) {
            setOs('android');
        } else {
            // Default to iOS for iPhones, iPads, and "Desktop" detection on mobile
            setOs('ios');
        }

        // Capture Android install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 max-w-sm w-full bg-white/95 backdrop-blur-xl text-gray-800 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-fade-in-up overflow-hidden border border-white/20">
                {/* Header Section */}
                <div className="pt-12 pb-10 px-8 text-center relative">
                    <div className="w-28 h-28 mx-auto mb-8 relative group">
                        <div className="absolute inset-0 bg-blue-600/20 rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform duration-500 scale-110 blur-sm"></div>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] w-full h-full flex items-center justify-center shadow-2xl relative z-10 border-2 border-white/50 transform group-hover:scale-105 transition-transform duration-500">
                            <CalendarDays size={56} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black mb-3 tracking-tight text-gray-900 leading-tight">Install App</h1>
                    <p className="text-gray-500 font-semibold leading-relaxed px-2 text-sm">
                        Experience Clinical Calendar as a <span className="text-blue-600">native application</span> on your device.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 mx-8 mb-8 bg-gray-100/80 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
                    <button
                        onClick={() => setOs('ios')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all duration-300 ${os === 'ios'
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.8-1.31.05-2.3-1.23-3.14-2.47-1.7-2.45-3-6.95-1.25-9.98 0.87-1.5 2.43-2.46 4.12-2.48 1.3 0 2.53.88 3.32.88.78 0 2.25-.9 3.79-.82 1.3.1 2.45.64 3.1 1.63-2.83 1.41-2.36 5.8 0.28 6.96-.64 1.83-1.53 3.6-2.61 5.2zM13 3.5c.67-0.83 1.13-1.95.84-3.5-1.63.1-3.6 1.14-4.22 3.1-.64 0.65-1.15 1.76-0.9 3.2 1.81.14 3.64-0.94 4.28-2.8z" /></svg>
                        iOS
                    </button>
                    <button
                        onClick={() => setOs('android')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all duration-300 ${os === 'android'
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Smartphone size={16} />
                        Android
                    </button>
                </div>

                <div className="px-10 pb-12">
                    {os === 'ios' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner border border-blue-100/50">
                                    <Share size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Step 1</p>
                                    <p className="text-sm font-bold text-gray-800">Tap the <span className="text-blue-600">Share</span> icon</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 shrink-0 shadow-inner border border-gray-100">
                                    <PlusSquare size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Step 2</p>
                                    <p className="text-sm font-bold text-gray-800">Select <span className="text-gray-900 uppercase text-xs">Add to Home Screen</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {os === 'android' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 shrink-0 shadow-inner border border-gray-100">
                                    <MoreVertical size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Step 1</p>
                                    <p className="text-sm font-bold text-gray-800">Tap the <span className="text-gray-900">Menu</span> dots</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner border border-blue-100/50">
                                    <Download size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Step 2</p>
                                    <p className="text-sm font-bold text-gray-800">Tap <span className="text-blue-600">Install App</span></p>
                                </div>
                            </div>

                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 text-sm uppercase tracking-wider"
                                >
                                    <Download size={20} />
                                    Install Now
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onBypass}
                        className="mt-12 text-[10px] text-gray-300 hover:text-blue-500 transition-colors font-black uppercase tracking-[0.2em] w-full text-center"
                    >
                        Continue in browser (Dev)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
