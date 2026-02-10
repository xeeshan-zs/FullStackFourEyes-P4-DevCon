import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, DollarSign, Car, Save, X, CheckSquare, ChevronDown } from 'lucide-react';
import { getParkingFacilities, addFacility, updateFacility, deleteFacility } from '../services/parkingService';

function FacilityManager({ initialFacilities, readOnly = false }) {
    const [facilities, setFacilities] = useState(initialFacilities || []);
    const [loading, setLoading] = useState(!initialFacilities);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFacility, setCurrentFacility] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        pricePerHour: '',
        totalSpots: '',
        type: 'Surface Lot',
        amenities: [],
        lat: '',
        lng: ''
    });

    useEffect(() => {
        if (!initialFacilities) {
            loadFacilities();
        } else {
            setFacilities(initialFacilities);
            setLoading(false);
        }
    }, [initialFacilities]);

    const loadFacilities = async () => {
        const data = await getParkingFacilities();
        setFacilities(data);
        setLoading(false);
    };

    const handleEdit = (facility) => {
        setCurrentFacility(facility);
        setFormData({
            name: facility.name || '',
            address: facility.address || '',
            pricePerHour: facility.price || facility.pricePerHour || '',
            totalSpots: facility.totalSpots || '',
            type: facility.type || 'Surface Lot',
            amenities: facility.amenities || [],
            lat: facility.location?.lat || '',
            lng: facility.location?.lng || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this facility?')) {
            await deleteFacility(id);
            loadFacilities();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const facilityData = {
            name: formData.name,
            address: formData.address,
            pricePerHour: parseFloat(formData.pricePerHour),
            totalSpots: parseInt(formData.totalSpots) || 0,
            type: formData.type,
            amenities: formData.amenities,
            location: {
                lat: parseFloat(formData.lat) || 0,
                lng: parseFloat(formData.lng) || 0
            },
            status: 'OPEN',
            availableSpots: parseInt(formData.totalSpots) || 0
        };

        if (currentFacility) {
            await updateFacility(currentFacility.id, facilityData);
        } else {
            await addFacility(facilityData);
        }

        setIsEditing(false);
        setCurrentFacility(null);
        resetForm();
        loadFacilities();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            pricePerHour: '',
            totalSpots: '',
            type: 'Surface Lot',
            amenities: [],
            lat: '',
            lng: ''
        });
    };

    const toggleAmenity = (amenity) => {
        if (formData.amenities.includes(amenity)) {
            setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
        }
    };

    if (loading) return <div className="text-white">Loading facilities...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
                {!isEditing && !readOnly && (
                    <button
                        onClick={() => { setIsEditing(true); resetForm(); setCurrentFacility(null); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus size={18} /> Add Facility
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            {currentFacility ? <Edit2 className="text-blue-400" /> : <Plus className="text-green-400" />}
                            {currentFacility ? 'Edit Facility' : 'Add New Facility'}
                        </h3>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm uppercase tracking-wider text-blue-400 font-bold border-b border-white/10 pb-2">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Facility Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Central City Mall Parking"
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-white/30 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Parking Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white appearance-none transition-all cursor-pointer"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option className="bg-gray-900">Surface Lot</option>
                                            <option className="bg-gray-900">Multi-story Garage</option>
                                            <option className="bg-gray-900">Underground</option>
                                            <option className="bg-gray-900">Street Parking</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white/50">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capacity & Price Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm uppercase tracking-wider text-green-400 font-bold border-b border-white/10 pb-2">Capacity & Pricing</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Price Rate (PKR/hr)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 font-bold">PKR</span>
                                        <input
                                            type="number"
                                            required
                                            placeholder="0.00"
                                            className="w-full pl-14 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 text-white placeholder-white/30 transition-all"
                                            value={formData.pricePerHour}
                                            onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Total Capacity</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
                                            <Car size={18} />
                                        </span>
                                        <input
                                            type="number"
                                            required
                                            placeholder="Total Spots"
                                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-white/30 transition-all"
                                            value={formData.totalSpots}
                                            onChange={e => setFormData({ ...formData, totalSpots: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm uppercase tracking-wider text-purple-400 font-bold border-b border-white/10 pb-2">Location Coordinates</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="33.6844"
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-white/30 transition-all font-mono"
                                        value={formData.lat}
                                        onChange={e => setFormData({ ...formData, lat: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="73.0479"
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-white/30 transition-all font-mono"
                                        value={formData.lng}
                                        onChange={e => setFormData({ ...formData, lng: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amenities Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm uppercase tracking-wider text-yellow-400 font-bold border-b border-white/10 pb-2">Amenities</h4>
                            <div className="flex flex-wrap gap-3">
                                {['EV Charging', 'Covered', 'Security', 'CCTV', 'Valet', 'Disabled Access'].map(amenity => (
                                    <button
                                        type="button"
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 transform hover:scale-105 ${formData.amenities.includes(amenity)
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                <Save size={20} />
                                {currentFacility ? 'Update Facility' : 'Save Facility'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map(facility => (
                        <div key={facility.id} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{facility.name}</h3>
                                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                                        <MapPin size={14} className="text-gray-500" />
                                        {facility.location?.lat.toFixed(4)}, {facility.location?.lng.toFixed(4)}
                                    </p>

                                </div>
                                {!readOnly && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(facility)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(facility.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-sm pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                    <DollarSign size={16} className="text-green-400" />
                                    <span className="font-bold text-white">PKR {facility.pricePerHour || facility.price || 0}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">/hr</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Car size={16} className="text-blue-400" />
                                    <span className="font-bold text-white">
                                        {Math.max(0, parseInt(facility.availableSpots) || 0)}
                                    </span>
                                    <span className="text-gray-500">/ {Math.max(parseInt(facility.totalSpots) || 0, parseInt(facility.availableSpots) || 0)}</span>
                                    <span className="text-[10px] text-gray-500 ml-1 uppercase">Spots</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {facility.amenities?.slice(0, 3).map(am => (
                                    <span key={am} className="text-[10px] uppercase font-bold text-gray-500 px-2 py-1 bg-white/5 rounded-md">
                                        {am}
                                    </span>
                                ))}
                                {(facility.amenities?.length > 3) && (
                                    <span className="text-[10px] text-gray-500 px-2 py-1">+{(facility.amenities.length - 3)} more</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {facilities.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Car size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-400">No facilities found</p>
                            <p className="text-sm">Get started by adding your first parking lot!</p>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
}

export default FacilityManager;
