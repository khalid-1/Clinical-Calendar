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
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl mix-blend-overlay animate-pulse-soft"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-md w-full glass-card p-8 rounded-3xl text-center shadow-2xl border border-white/20">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                    <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="Logo" className="w-14 h-14 object-contain drop-shadow-md" />
                </div>

                <h1 className="text-3xl font-black mb-2 tracking-tight">Install App</h1>
                <p className="text-blue-100 mb-8 font-medium text-lg leading-relaxed">
                    Install <span className="font-bold text-white">Clinical Calendar</span> for the best full-screen experience.
                </p>

                {os === 'ios' && (
                    <div className="space-y-4 text-left bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-lg shrink-0">
                                <Share size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg mb-0.5">Step 1</p>
                                <p className="text-blue-100 text-sm">Tap the <span className="font-bold text-white">Share</span> button in your browser menu.</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-lg shrink-0">
                                <PlusSquare size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg mb-0.5">Step 2</p>
                                <p className="text-blue-100 text-sm">Select <span className="font-bold text-white">Add to Home Screen</span> from the list.</p>
                            </div>
                        </div>
                    </div>
                )}

                {os === 'android' && (
                    <div className="space-y-6">
                        <div className="space-y-4 text-left bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-2 rounded-lg shrink-0">
                                    <MoreVertical size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg mb-0.5">Step 1</p>
                                    <p className="text-blue-100 text-sm">Tap the <span className="font-bold text-white">Three Dots</span> menu.</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/10"></div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-2 rounded-lg shrink-0">
                                    <Download size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg mb-0.5">Step 2</p>
                                    <p className="text-blue-100 text-sm">Select <span className="font-bold text-white">Install App</span> or <span className="font-bold text-white">Add to Home screen</span>.</p>
                                </div>
                            </div>
                        </div>
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Install Now
                            </button>
                        )}
                    </div>
                )}

                {os === 'desktop' && (
                    <div className="text-center py-4">
                        <Smartphone size={48} className="mx-auto text-white/50 mb-4" />
                        <p className="text-blue-100 mb-4">
                            Please open this link on your mobile phone for the best experience.
                        </p>
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
                            >
                                Install App
                            </button>
                        )}
                    </div>
                )}

                {/* Developer Bypass (Hidden/Subtle) */}
                <button
                    onClick={onBypass}
                    className="mt-8 text-xs text-white/30 hover:text-white/60 transition-colors font-medium cursor-default"
                >
                    Continue in browser (Dev only)
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
