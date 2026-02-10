import { useState } from 'react';
import { X, Car, Plus, Trash2, CheckCircle } from 'lucide-react';

function VehicleOnboardingModal({ onComplete, userEmail }) {
    const [vehicles, setVehicles] = useState([
        { id: '1', plateNumber: '', make: '', model: '', color: '' }
    ]);
    const [saving, setSaving] = useState(false);

    const addVehicle = () => {
        setVehicles([
            ...vehicles,
            { id: Date.now().toString(), plateNumber: '', make: '', model: '', color: '' }
        ]);
    };

    const removeVehicle = (id) => {
        if (vehicles.length > 1) {
            setVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    const updateVehicle = (id, field, value) => {
        setVehicles(vehicles.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const handleSave = async () => {
        // Validate at least one vehicle with plate number
        const validVehicles = vehicles.filter(v => v.plateNumber.trim() !== '');

        if (validVehicles.length === 0) {
            alert('Please add at least one vehicle with a license plate number');
            return;
        }

        setSaving(true);
        await onComplete(validVehicles);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#0B1120] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-blue-600/20 to-transparent border-b border-white/5">
                    <div className="flex items-center gap-3 text-white mb-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl">
                            <Car size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Welcome to ParkIt!</h2>
                            <p className="text-sm text-gray-400">Register your vehicle(s) to get started</p>
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                        <p className="text-xs text-blue-400">
                            ℹ️ Add your vehicle details to make reservations and receive parking notifications
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                    {vehicles.map((vehicle, index) => (
                        <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Car size={16} className="text-orange-400" />
                                    Vehicle {index + 1}
                                </h3>
                                {vehicles.length > 1 && (
                                    <button
                                        onClick={() => removeVehicle(vehicle.id)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                                        License Plate Number *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ABC-1234"
                                        value={vehicle.plateNumber}
                                        onChange={(e) => updateVehicle(vehicle.id, 'plateNumber', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono tracking-wider"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Make</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Toyota"
                                        value={vehicle.make}
                                        onChange={(e) => updateVehicle(vehicle.id, 'make', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Model</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Corolla"
                                        value={vehicle.model}
                                        onChange={(e) => updateVehicle(vehicle.id, 'model', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Color</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., White"
                                        value={vehicle.color}
                                        onChange={(e) => updateVehicle(vehicle.id, 'color', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addVehicle}
                        className="w-full py-3 bg-white/5 border border-dashed border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add Another Vehicle
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Save & Continue
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        At least one vehicle is required to use ParkIt
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VehicleOnboardingModal;
