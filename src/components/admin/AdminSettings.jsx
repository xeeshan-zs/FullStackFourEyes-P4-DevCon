import { Settings, Bell, Shield, Wallet, Globe } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="text-gray-400" />
                System Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* General Settings */}
                <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/5 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-blue-400" /> General
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">System Name</label>
                            <input type="text" defaultValue="ParkIt Smart Hub" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Support Email</label>
                            <input type="email" defaultValue="support@parkit.com" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-gray-300">Maintenance Mode</span>
                            <div className="w-12 h-6 bg-white/5 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-gray-500 rounded-full transition-transform"></div>
                            </div>
                        </div>
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
                            <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer flex justify-end">
                                <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Push Notifications</p>
                                <p className="text-xs text-gray-500">Real-time mobile alerts</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer flex justify-end">
                                <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Violation Alerts</p>
                                <p className="text-xs text-gray-500">Notify when new tickets issued</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer flex justify-end">
                                <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                            </div>
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
                            <input type="number" defaultValue="150" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Processing Fee (%)</label>
                            <input type="number" defaultValue="2.5" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <button className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                            Update Pricing
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
                            <div className="w-12 h-6 bg-white/5 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-gray-500 rounded-full transition-transform"></div>
                            </div>
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
