import { useState, useEffect } from 'react';
import { Settings, Bell, Wallet, Globe, Loader2, Check } from 'lucide-react';
import {
    getSettings,
    updateGeneralSettings,
    updateNotificationSetting,
    updatePricing,
    toggleMaintenanceMode
} from '../../services/settingsService';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState('');

    // Form states
    const [systemName, setSystemName] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [hourlyRate, setHourlyRate] = useState(150);
    const [processingFee, setProcessingFee] = useState(2.5);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await getSettings();
        setSettings(data);

        // Populate form fields
        setSystemName(data.general?.systemName || 'ParkIt Smart Hub');
        setSupportEmail(data.general?.supportEmail || 'support@parkit.com');
        setHourlyRate(data.pricing?.baseHourlyRate || 150);
        setProcessingFee(data.pricing?.processingFee || 2.5);

        setLoading(false);
    };

    const handleToggle = async (category, field) => {
        if (!settings) return;

        const newValue = !settings[category][field];

        // Optimistically update UI
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: newValue
            }
        });

        // Persist to Firestore
        if (category === 'notifications') {
            await updateNotificationSetting(field, newValue);
        } else if (category === 'general' && field === 'maintenanceMode') {
            await toggleMaintenanceMode(newValue);
        }

        showSavedMessage();
    };

    const handleSaveGeneral = async () => {
        setSaving(true);
        await updateGeneralSettings(systemName, supportEmail, settings.general.maintenanceMode);
        setSaving(false);
        showSavedMessage();
    };

    const handleSavePricing = async () => {
        setSaving(true);
        await updatePricing(hourlyRate, processingFee);
        setSaving(false);
        showSavedMessage();
    };

    const showSavedMessage = () => {
        setSavedMessage('Settings saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Settings className="text-gray-400" />
                    System Settings
                </h2>
                {savedMessage && (
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg border border-green-500/20 animate-fadeIn">
                        <Check size={16} />
                        <span className="text-sm font-medium">{savedMessage}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* General Settings */}
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-blue-400" /> General
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">System Name</label>
                            <input
                                type="text"
                                value={systemName}
                                onChange={(e) => setSystemName(e.target.value)}
                                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Support Email</label>
                            <input
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-gray-300">Maintenance Mode</span>
                            <button
                                onClick={() => handleToggle('general', 'maintenanceMode')}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.general.maintenanceMode ? 'bg-orange-600' : 'bg-white/5'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                        <button
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save General Settings'}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-yellow-400" /> Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Email Alerts</p>
                                <p className="text-xs text-gray-500">Receive daily summary emails</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications', 'emailAlerts')}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.notifications.emailAlerts ? 'bg-blue-600' : 'bg-white/5'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications.emailAlerts ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Push Notifications</p>
                                <p className="text-xs text-gray-500">Real-time mobile alerts</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications', 'pushNotifications')}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.notifications.pushNotifications ? 'bg-blue-600' : 'bg-white/5'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Violation Alerts</p>
                                <p className="text-xs text-gray-500">Notify when new tickets issued</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications', 'violationAlerts')}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.notifications.violationAlerts ? 'bg-blue-600' : 'bg-white/5'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications.violationAlerts ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing & Billing */}
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-emerald-400" /> Pricing Rules
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Base Hourly Rate (PKR)</label>
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Processing Fee (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={processingFee}
                                onChange={(e) => setProcessingFee(parseFloat(e.target.value))}
                                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleSavePricing}
                            disabled={saving}
                            className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Update Pricing'}
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-red-400" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Two-Factor Auth</p>
                                <p className="text-xs text-gray-500">Enforce for all admins</p>
                            </div>
                            <button
                                onClick={() => handleToggle('security', 'twoFactorAuth')}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.security.twoFactorAuth ? 'bg-red-600' : 'bg-white/5'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                        <button className="w-full py-2 bg-white/5 text-white border border-white/10 font-bold rounded-lg hover:bg-white/10 transition-colors">
                            Reset All User Sessions
                        </button>
                        <button className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-lg hover:bg-red-500/20 transition-colors">
                            View Audit Logs
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminSettings;

