import { X, Navigation, Clock, CreditCard, Shield, Zap } from 'lucide-react';

function ParkingSpotDrawer({ facility, onClose, onReserve }) {
    if (!facility) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="w-full md:w-[400px] bg-white/90 backdrop-blur-xl h-full md:h-auto md:min-h-screen shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col animate-slide-up border-l border-white/20">
                {/* Header Image Placeholder */}
                <div className="h-48 bg-gray-200 relative">
                    <img
                        src={`https://source.unsplash.com/800x400/?parking,garage,car&sig=${facility.id}`}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-4 text-white">
                        <span className={`px-2 py-1 rounded text-xs font-bold mb-2 inline-block ${facility.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {facility.status}
                        </span>
                        <h2 className="text-2xl font-bold leading-tight">{facility.name}</h2>
                        <p className="text-white/80 text-sm">{facility.type} Parking via Park-it</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Stats Row */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                            <p className="text-blue-600 text-xs font-bold uppercase mb-1">Price</p>
                            <p className="text-2xl font-bold text-gray-800">PKR {facility.pricePerHour}<span className="text-sm font-normal text-gray-500">/hr</span></p>
                        </div>
                        <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                            <p className="text-green-600 text-xs font-bold uppercase mb-1">Available</p>
                            <p className="text-2xl font-bold text-gray-800">{facility.availableSpots}<span className="text-sm font-normal text-gray-500">/{facility.totalSpots}</span></p>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-500" />
                                Amenities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {facility.amenities.map((amenity, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Operating Hours
                            </h3>
                            <p className="text-gray-600 text-sm">Mon-Sun: 24 Hours</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                Features
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Instant Confirmation
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Contactless Entry
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Free Cancellation (15 min)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 md:pb-8">
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <Navigation className="w-4 h-4" />
                            Navigate
                        </button>
                        <button
                            onClick={() => onReserve(facility)}
                            className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            Reserve Spot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ParkingSpotDrawer;
