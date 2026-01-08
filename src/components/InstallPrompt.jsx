import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, MoreVertical, Download, Smartphone } from 'lucide-react';

const InstallPrompt = ({ onBypass }) => {
    const [os, setOs] = useState('unknown');
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setOs('ios');
        } else if (/android/.test(userAgent)) {
            setOs('android');
        } else {
            setOs('desktop');
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

            <div className="relative z-10 max-w-sm w-full bg-white text-gray-800 p-8 rounded-[2rem] shadow-2xl animate-fade-in-up">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                    <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="Logo" className="w-14 h-14 object-contain drop-shadow-sm" />
                </div>

                <h1 className="text-2xl font-black mb-2 tracking-tight text-center text-gray-900">Install App</h1>
                <p className="text-gray-500 mb-8 text-center font-medium leading-relaxed">
                    Get the full experience.
                </p>

                {os === 'ios' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 shrink-0">
                                <Share size={20} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Step 1</p>
                                <p className="text-sm font-semibold text-gray-700">Tap the <span className="text-blue-600">Share</span> button</p>
                            </div>
                        </div>

                        <div className="w-0.5 h-4 bg-gray-200 mx-auto rounded-full"></div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 shrink-0">
                                <PlusSquare size={20} className="text-gray-700" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Step 2</p>
                                <p className="text-sm font-semibold text-gray-700">Choose <span className="text-gray-900">Add to Home Screen</span></p>
                            </div>
                        </div>
                    </div>
                )}

                {os === 'android' && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 shrink-0">
                                    <MoreVertical size={20} className="text-gray-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Step 1</p>
                                    <p className="text-sm font-semibold text-gray-700">Tap the <span className="text-gray-900">Menu</span> (3 dots)</p>
                                </div>
                            </div>

                            <div className="w-0.5 h-4 bg-gray-200 mx-auto rounded-full"></div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 shrink-0">
                                    <Download size={20} className="text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Step 2</p>
                                    <p className="text-sm font-semibold text-gray-700">Tap <span className="text-blue-600">Install App</span></p>
                                </div>
                            </div>
                        </div>

                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                <Download size={18} />
                                Install Now
                            </button>
                        )}
                    </div>
                )}

                {os === 'desktop' && (
                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Smartphone size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-sm px-4">
                            Open this link on your <strong>mobile phone</strong> to install the app.
                        </p>
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700"
                            >
                                Install App
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={onBypass}
                    className="mt-6 text-[10px] text-gray-300 hover:text-gray-500 transition-colors font-semibold uppercase tracking-widest w-full text-center"
                >
                    Continue in browser (Dev)
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
