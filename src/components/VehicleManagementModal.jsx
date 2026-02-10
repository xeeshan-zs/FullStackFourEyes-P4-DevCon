import { useState } from 'react';
import { X, Car, Plus, Trash2, Save } from 'lucide-react';
import { addVehicle, removeVehicle as removeVehicleFromProfile } from '../services/userProfileService';

function VehicleManagementModal({ vehicles, onClose, onUpdate, userId }) {
    const [localVehicles, setLocalVehicles] = useState(vehicles || []);
    const [newVehicle, setNewVehicle] = useState({ plateNumber: '', make: '', model: '', color: '' });
    const [saving, setSaving] = useState(false);

    const handleAddVehicle = async () => {
        if (!newVehicle.plateNumber.trim()) {
            alert('License plate number is required');
            return;
        }

        setSaving(true);
        const result = await addVehicle(userId, newVehicle);
        if (result.success) {
            setLocalVehicles([...localVehicles, result.data]);
            setNewVehicle({ plateNumber: '', make: '', model: '', color: '' });
            onUpdate([...localVehicles, result.data]);
        }
        setSaving(false);
    };

    const handleRemoveVehicle = async (vehicleId) => {
        if (localVehicles.length <= 1) {
            alert('You must have at least one vehicle registered');
            return;
        }

        if (!confirm('Are you sure you want to remove this vehicle?')) {
            return;
        }

        setSaving(true);
        const result = await removeVehicleFromProfile(userId, vehicleId);
        if (result.success) {
            const updated = localVehicles.filter(v => v.id !== vehicleId);
            setLocalVehicles(updated);
            onUpdate(updated);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-[#0B1120] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-blue-600/20 to-transparent border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl">
                            <Car size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">My Vehicles</h2>
                            <p className="text-sm text-gray-400">Manage your registered vehicles</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                    {/* Existing Vehicles */}
                    <div className="space-y-3">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Registered Vehicles</h3>
                        {localVehicles.map((vehicle, index) => (
                            <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <Car size={20} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold font-mono tracking-wider">{vehicle.plateNumber}</p>
                                        <p className="text-sm text-gray-400">
                                            {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : 'No details'}
                                            {vehicle.color && ` • ${vehicle.color}`}
                                        </p>
                                    </div>
                                </div>
                                {localVehicles.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveVehicle(vehicle.id)}
                                        disabled={saving}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Vehicle */}
                    <div className="space-y-3">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Add New Vehicle</h3>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">License Plate Number *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ABC-1234"
                                        value={newVehicle.plateNumber}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono tracking-wider"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Make</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Toyota"
                                        value={newVehicle.make}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Model</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Corolla"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Color</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., White"
                                        value={newVehicle.color}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddVehicle}
                                disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Add Vehicle
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/2">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VehicleManagementModal;
