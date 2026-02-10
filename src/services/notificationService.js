/**
 * Notification Service
 * Handles push notifications for parking expiry alerts
 */

export const scheduleExpiryNotification = (reservationId, spotName, expiryTime) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.warn('Notifications not enabled');
        return;
    }

    const now = new Date().getTime();
    const expiry = new Date(expiryTime).getTime();
    const timeUntilExpiry = expiry - now;

    // Schedule notification 15 minutes before expiry
    const notificationTime = timeUntilExpiry - (15 * 60 * 1000);

    if (notificationTime > 0) {
        setTimeout(() => {
            new Notification('⏰ Parking Time Almost Up!', {
                body: `Your parking at ${spotName} expires in 15 minutes`,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: `expiry-${reservationId}`,
                requireInteraction: true,
                actions: [
                    { action: 'extend', title: 'Extend Time' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            });
        }, notificationTime);

        console.log(`Notification scheduled for ${new Date(now + notificationTime).toLocaleString()}`);
    }

    // Schedule final notification at expiry
    if (timeUntilExpiry > 0) {
        setTimeout(() => {
            new Notification('❌ Parking Time Expired!', {
                body: `Your parking at ${spotName} has expired. Please move your vehicle.`,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: `expired-${reservationId}`,
                requireInteraction: true
            });
        }, timeUntilExpiry);
    }
};

export const sendNotification = (title, body, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
    });
};

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        return 'unsupported';
    }

    const permission = await Notification.requestPermission();
    return permission;
};
