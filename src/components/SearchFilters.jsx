import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, DollarSign, Clock, X } from 'lucide-react';
import styles from './SearchFilters.module.css';

function SearchFilters({ onFilterChange, onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        maxPrice: 1000,
        maxDistance: 20,
        type: 'all',
        availability: 'all',
        amenities: []
    });

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) {
            onSearch(query);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (onSearch) {
            onSearch('');
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
        <div className={styles.container}>
            {/* Search Bar */}
            <div className={styles.searchBarContainer}>
                <div className={styles.searchInputWrapper}>
                    <input
                        type="text"
                        placeholder="Where do you want to park?"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    {/* The "start" icon moved to be after text as requested */}
                    <Search className={styles.searchIcon} size={18} strokeWidth={1} />

                    {searchQuery && (
                        <button onClick={clearSearch} className="text-white/40 hover:text-white transition-colors mr-2">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className={styles.searchActions}>
                    {/* Filters Toggle pushed to end */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={styles.filterToggleBtn}
                        title="Filters"
                    >
                        <SlidersHorizontal size={18} strokeWidth={1.5} className="text-white" />
                    </button>

                    {/* Primary Search Action pushed to end */}
                    <button
                        className={styles.searchButton}
                        onClick={() => onSearch && onSearch(searchQuery)}
                        title="Search"
                    >
                        <Search size={20} strokeWidth={1.5} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filtersGrid}>
                        {/* Price Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                <DollarSign size={16} />
                                Max Price (PKR/hr)
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                                className={styles.filterRange}
                            />
                            <span className={styles.filterValue}>PKR {filters.maxPrice}/hr</span>
                        </div>

                        {/* Distance Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                <MapPin size={16} />
                                Max Distance (km)
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="20"
                                step="0.5"
                                value={filters.maxDistance}
                                onChange={(e) => handleFilterChange('maxDistance', parseFloat(e.target.value))}
                                className={styles.filterRange}
                            />
                            <span className={styles.filterValue}>{filters.maxDistance} km</span>
                        </div>

                        {/* Type Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Parking Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Types</option>
                                <option value="street">Street Parking</option>
                                <option value="garage">Parking Garage</option>
                                <option value="lot">Parking Lot</option>
                                <option value="reserved">Reserved</option>
                            </select>
                        </div>

                        {/* Availability Filter */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                <Clock size={16} />
                                Availability
                            </label>
                            <select
                                value={filters.availability}
                                onChange={(e) => handleFilterChange('availability', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All</option>
                                <option value="available">Available Now</option>
                                <option value="reserved">Reservable</option>
                            </select>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Amenities</label>
                        <div className={styles.amenitiesGrid}>
                            {['EV Charging', 'Covered', 'Security', 'Disabled Access', '24/7'].map((amenity) => (
                                <button
                                    key={amenity}
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`${styles.amenityTag} ${filters.amenities.includes(amenity) ? styles.active : ''}`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reset Filters */}
                    <button
                        onClick={() => {
                            const defaults = {
                                maxPrice: 500,
                                maxDistance: 5,
                                type: 'all',
                                availability: 'all',
                                amenities: []
                            };
                            setFilters(defaults);
                            if (onFilterChange) onFilterChange(defaults);
                        }}
                        className={styles.resetFiltersBtn}
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}

export default SearchFilters;
