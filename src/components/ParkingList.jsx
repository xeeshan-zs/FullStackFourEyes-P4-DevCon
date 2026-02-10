import { useState } from 'react';
import { MapPin, DollarSign, Clock, Navigation, Star, TrendingUp } from 'lucide-react';
import { calculatePrice, getPricingTier } from '../utils/pricingEngine';

function ParkingList({ facilities, onSelectFacility, sortBy = 'distance' }) {
    const [currentSort, setCurrentSort] = useState(sortBy);

    // Sort facilities
    const sortedFacilities = [...facilities].sort((a, b) => {
        switch (currentSort) {
            case 'price':
                const priceA = calculatePrice(a).hourly;
                const priceB = calculatePrice(b).hourly;
                return priceA - priceB;
            case 'distance':
                return (a.distance || 0) - (b.distance || 0);
            case 'availability':
                const availA = a.capacity - (a.occupied || 0);
                const availB = b.capacity - (b.occupied || 0);
                return availB - availA;
            default:
                return 0;
        }
    });

    const SortButton = ({ value, icon: Icon, label }) => (
        <button
            onClick={() => setCurrentSort(value)}
            className={`sort-btn ${currentSort === value ? 'active' : ''}`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="parking-list">
            {/* Sort Options */}
            <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <div className="sort-buttons">
                    <SortButton value="distance" icon={Navigation} label="Distance" />
                    <SortButton value="price" icon={DollarSign} label="Price" />
                    <SortButton value="availability" icon={Clock} label="Availability" />
                </div>
            </div>

            {/* Facilities List */}
            <div className="facilities-grid">
                {sortedFacilities.length === 0 ? (
                    <div className="no-results">
                        <MapPin size={48} />
                        <p>No parking facilities found</p>
                        <p className="no-results-hint">Try adjusting your filters</p>
                    </div>
                ) : (
                    sortedFacilities.map((facility) => {
                        const pricing = calculatePrice(facility);
                        const available = facility.capacity - (facility.occupied || 0);
                        const availabilityPercent = ((available / facility.capacity) * 100).toFixed(0);

                        return (
                            <div
                                key={facility.id}
                                onClick={() => onSelectFacility && onSelectFacility(facility)}
                                className="facility-card"
                            >
                                {/* Header */}
                                <div className="facility-header">
                                    <div className="facility-title">
                                        <h3>{facility.name}</h3>
                                        <span className="facility-type">{facility.type}</span>
                                    </div>
                                    {pricing.surge && (
                                        <div className="surge-badge">
                                            <TrendingUp size={14} />
                                            Surge
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="facility-stats">
                                    <div className="stat">
                                        <MapPin size={16} />
                                        <span>{facility.distance ? `${facility.distance.toFixed(1)} km` : 'N/A'}</span>
                                    </div>
                                    <div className="stat">
                                        <DollarSign size={16} />
                                        <span>${pricing.hourly}/hr</span>
                                        <span className="pricing-tier">{getPricingTier(pricing.hourly)}</span>
                                    </div>
                                    <div className="stat">
                                        <Clock size={16} />
                                        <span>{available} / {facility.capacity} spots</span>
                                    </div>
                                </div>

                                {/* Availability Bar */}
                                <div className="availability-bar">
                                    <div
                                        className={`availability-fill ${availabilityPercent > 50 ? 'high' : availabilityPercent > 20 ? 'medium' : 'low'
                                            }`}
                                        style={{ width: `${availabilityPercent}%` }}
                                    />
                                </div>

                                {/* Amenities */}
                                {facility.amenities && facility.amenities.length > 0 && (
                                    <div className="facility-amenities">
                                        {facility.amenities.slice(0, 3).map((amenity, idx) => (
                                            <span key={idx} className="amenity-badge">{amenity}</span>
                                        ))}
                                        {facility.amenities.length > 3 && (
                                            <span className="amenity-badge">+{facility.amenities.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {/* Action Button */}
                                <button className="facility-action-btn">
                                    View Details & Reserve
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ParkingList;
