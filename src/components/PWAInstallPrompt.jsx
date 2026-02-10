import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 3 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 7 days
        localStorage.setItem('pwaPromptDismissed', Date.now().toString());
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-4 text-white">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <Download className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Install Park It</h3>
                            <p className="text-xs text-blue-100">Quick access from your home screen</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-blue-50 mb-4">
                    Get instant access, offline maps, and push notifications for your parking sessions.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-xl transition-colors text-sm"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PWAInstallPrompt;
