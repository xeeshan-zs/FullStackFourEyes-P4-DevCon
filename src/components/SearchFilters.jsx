import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, DollarSign, Clock } from 'lucide-react';

function SearchFilters({ onFilterChange, onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        maxPrice: 10,
        maxDistance: 5,
        type: 'all',
        availability: 'all',
        amenities: []
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const toggleAmenity = (amenity) => {
        const newAmenities = filters.amenities.includes(amenity)
            ? filters.amenities.filter(a => a !== amenity)
            : [...filters.amenities, amenity];
        handleFilterChange('amenities', newAmenities);
    };

    return (
        <div className="search-filters">
            {/* Search Bar */}
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by location, landmark, or address..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-toggle-btn"
                >
                    <SlidersHorizontal size={20} />
                    Filters
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        {/* Price Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                <DollarSign size={16} />
                                Max Price ($/hr)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                                className="filter-range"
                            />
                            <span className="filter-value">${filters.maxPrice}/hr</span>
                        </div>

                        {/* Distance Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                <MapPin size={16} />
                                Max Distance (km)
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="10"
                                step="0.5"
                                value={filters.maxDistance}
                                onChange={(e) => handleFilterChange('maxDistance', parseFloat(e.target.value))}
                                className="filter-range"
                            />
                            <span className="filter-value">{filters.maxDistance} km</span>
                        </div>

                        {/* Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Parking Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Types</option>
                                <option value="street">Street Parking</option>
                                <option value="garage">Parking Garage</option>
                                <option value="lot">Parking Lot</option>
                                <option value="reserved">Reserved</option>
                            </select>
                        </div>

                        {/* Availability Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                <Clock size={16} />
                                Availability
                            </label>
                            <select
                                value={filters.availability}
                                onChange={(e) => handleFilterChange('availability', e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All</option>
                                <option value="available">Available Now</option>
                                <option value="reserved">Reservable</option>
                            </select>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="filter-group">
                        <label className="filter-label">Amenities</label>
                        <div className="amenities-grid">
                            {['EV Charging', 'Covered', 'Security', 'Disabled Access', '24/7'].map((amenity) => (
                                <button
                                    key={amenity}
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`amenity-tag ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reset Filters */}
                    <button
                        onClick={() => {
                            setFilters({
                                maxPrice: 10,
                                maxDistance: 5,
                                type: 'all',
                                availability: 'all',
                                amenities: []
                            });
                            onFilterChange && onFilterChange({
                                maxPrice: 10,
                                maxDistance: 5,
                                type: 'all',
                                availability: 'all',
                                amenities: []
                            });
                        }}
                        className="reset-filters-btn"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}

export default SearchFilters;
