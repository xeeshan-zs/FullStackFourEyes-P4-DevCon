import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const SETTINGS_DOC_ID = 'system_settings';

// Default settings structure
const DEFAULT_SETTINGS = {
    general: {
        systemName: 'ParkIt Smart Hub',
        supportEmail: 'support@parkit.com',
        maintenanceMode: false
    },
    notifications: {
        emailAlerts: true,
        pushNotifications: true,
        violationAlerts: true
    },
    pricing: {
        baseHourlyRate: 150,
        processingFee: 2.5
    },
    security: {
        twoFactorAuth: false
    },
    updatedAt: new Date().toISOString()
};

/**
 * Get current system settings
 */
export async function getSettings() {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
            return settingsSnap.data();
        } else {
            // Initialize with defaults if doesn't exist
            await setDoc(settingsRef, DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update entire settings object
 */
export async function updateSettings(newSettings) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        const updatedSettings = {
            ...newSettings,
            updatedAt: new Date().toISOString()
        };

        await setDoc(settingsRef, updatedSettings, { merge: true });
        return { success: true, data: updatedSettings };
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update specific notification setting
 */
export async function updateNotificationSetting(notificationType, enabled) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await updateDoc(settingsRef, {
            [`notifications.${notificationType}`]: enabled,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update pricing rules
 */
export async function updatePricing(hourlyRate, processingFee) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await updateDoc(settingsRef, {
            'pricing.baseHourlyRate': parseFloat(hourlyRate),
            'pricing.processingFee': parseFloat(processingFee),
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating pricing:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(systemName, supportEmail, maintenanceMode) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await updateDoc(settingsRef, {
            'general.systemName': systemName,
            'general.supportEmail': supportEmail,
            'general.maintenanceMode': maintenanceMode,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating general settings:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(enabled) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await updateDoc(settingsRef, {
            'general.maintenanceMode': enabled,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle two-factor authentication
 */
export async function toggleTwoFactorAuth(enabled) {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await updateDoc(settingsRef, {
            'security.twoFactorAuth': enabled,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error toggling 2FA:', error);
        return { success: false, error: error.message };
    }
}
