import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

function NotificationPermission() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        // Check current permission status
        if ('Notification' in window) {
            setPermission(Notification.permission);

            // Show prompt if not granted and not dismissed
            const dismissed = localStorage.getItem('notificationPromptDismissed');
            if (Notification.permission === 'default' && !dismissed) {
                setTimeout(() => setShowPrompt(true), 5000);
            }
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Send test notification
                new Notification('🅿️ Park It Notifications Enabled!', {
                    body: 'You\'ll be notified 15 minutes before your parking expires.',
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png',
                    tag: 'welcome'
                });
            }

            setShowPrompt(false);
        }
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        localStorage.setItem('notificationPromptDismissed', 'true');
    };

    if (!showPrompt || permission !== 'default') return null;

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-xl p-4 text-white">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">Enable Notifications</h3>
                            <p className="text-xs text-white/90">Get parking expiry alerts</p>
                        </div>
                    </div>
                    <button
                        onClick={dismissPrompt}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <p className="text-sm text-white/90 mb-3">
                    Never get a parking ticket! We'll notify you 15 minutes before your time expires.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={requestPermission}
                        className="flex-1 bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                    >
                        Enable
                    </button>
                    <button
                        onClick={dismissPrompt}
                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificationPermission;
