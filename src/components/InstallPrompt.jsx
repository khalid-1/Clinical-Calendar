import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, MoreVertical, Download, Smartphone } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[100px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-sm w-full bg-white text-gray-800 rounded-[2.5rem] shadow-2xl animate-fade-in-up overflow-hidden">
                {/* Header Section */}
                <div className="bg-gray-50 pt-10 pb-8 px-8 text-center border-b border-gray-100 relative">
                    <div className="w-24 h-24 mx-auto mb-6 relative group">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-[1.5rem] rotate-6 transition-transform group-hover:rotate-12"></div>
                        <div className="bg-white rounded-[1.5rem] w-full h-full flex items-center justify-center shadow-lg shadow-blue-500/10 relative z-10 border border-white">
                            <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="Logo" className="w-[4.5rem] h-[4.5rem] object-cover drop-shadow-sm rounded-xl" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black mb-2 tracking-tight text-gray-900">Install App</h1>
                    <p className="text-gray-500 font-medium leading-relaxed px-4">
                        Get the full native experience.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 mx-6 -mt-6 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 relative z-20">
                    <button
                        onClick={() => setOs('ios')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${os === 'ios'
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.8-1.31.05-2.3-1.23-3.14-2.47-1.7-2.45-3-6.95-1.25-9.98 0.87-1.5 2.43-2.46 4.12-2.48 1.3 0 2.53.88 3.32.88.78 0 2.25-.9 3.79-.82 1.3.1 2.45.64 3.1 1.63-2.83 1.41-2.36 5.8 0.28 6.96-.64 1.83-1.53 3.6-2.61 5.2zM13 3.5c.67-0.83 1.13-1.95.84-3.5-1.63.1-3.6 1.14-4.22 3.1-.64 0.65-1.15 1.76-0.9 3.2 1.81.14 3.64-0.94 4.28-2.8z" /></svg>
                        iOS
                    </button>
                    <button
                        onClick={() => setOs('android')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${os === 'android'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Smartphone size={16} />
                        Android
                    </button>
                </div>

                <div className="p-8">
                    {os === 'ios' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-gray-100">
                                    <Share size={20} />
                                </div>
                                <div className="text-left pt-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Step 1</p>
                                    <p className="text-sm font-bold text-gray-700">Tap the <span className="text-blue-600">Share</span> button</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 shrink-0 border border-gray-100">
                                    <PlusSquare size={20} />
                                </div>
                                <div className="text-left pt-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Step 2</p>
                                    <p className="text-sm font-bold text-gray-700">Choose <span className="text-gray-900">Add to Home Screen</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {os === 'android' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 shrink-0 border border-gray-100">
                                    <MoreVertical size={20} />
                                </div>
                                <div className="text-left pt-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Step 1</p>
                                    <p className="text-sm font-bold text-gray-700">Tap the <span className="text-gray-900">Menu</span> (3 dots)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-gray-100">
                                    <Download size={20} />
                                </div>
                                <div className="text-left pt-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Step 2</p>
                                    <p className="text-sm font-bold text-gray-700">Tap <span className="text-blue-600">Install App</span></p>
                                </div>
                            </div>

                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                                >
                                    <Download size={18} />
                                    Install Now
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onBypass}
                        className="mt-8 text-[10px] text-gray-300 hover:text-gray-500 transition-colors font-semibold uppercase tracking-widest w-full text-center"
                    >
                        Continue in browser (Dev)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
