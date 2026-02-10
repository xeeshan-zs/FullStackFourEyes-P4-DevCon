/**
 * Mock Parking Data
 * Enhanced with pricing, amenities, and location data for Module 4
 */

export const parkingFacilities = [
    {
        id: 1,
        name: 'Central Plaza Garage',
        type: 'garage',
        position: [51.505, -0.09],
        capacity: 250,
        occupied: 180,
        price: 5.5,
        address: '123 Main St, Downtown',
        distance: 0.8,
        amenities: ['EV Charging', 'Covered', 'Security', '24/7'],
        rating: 4.5
    },
    {
        id: 2,
        name: 'Market Street Lot',
        type: 'lot',
        position: [51.51, -0.1],
        capacity: 120,
        occupied: 110,
        price: 3.0,
        address: '456 Market St',
        distance: 1.2,
        amenities: ['Security', 'Disabled Access'],
        rating: 4.0
    },
    {
        id: 3,
        name: 'River View Parking',
        type: 'street',
        position: [51.515, -0.095],
        capacity: 50,
        occupied: 15,
        price: 2.0,
        address: 'River Road',
        distance: 1.8,
        amenities: [],
        rating: 3.5
    },
    {
        id: 4,
        name: 'Business District Garage',
        type: 'garage',
        position: [51.512, -0.08],
        capacity: 300,
        occupied: 250,
        price: 6.0,
        address: '789 Business Ave',
        distance: 2.1,
        amenities: ['EV Charging', 'Covered', 'Security', '24/7', 'Valet'],
        rating: 4.8
    },
    {
        id: 5,
        name: 'Park & Ride Station',
        type: 'lot',
        position: [51.502, -0.085],
        capacity: 400,
        occupied: 120,
        price: 1.5,
        address: 'Station Road',
        distance: 3.5,
        amenities: ['Security', '24/7'],
        rating: 4.2
    },
    {
        id: 6,
        name: 'Shopping Mall Parking',
        type: 'garage',
        position: [51.508, -0.105],
        capacity: 500,
        occupied: 350,
        price: 4.5,
        address: 'Mall Plaza',
        distance: 1.5,
        amenities: ['Covered', 'Disabled Access', 'Security'],
        rating: 4.3
    },
    {
        id: 7,
        name: 'Stadium Lot A',
        type: 'lot',
        position: [51.52, -0.095],
        capacity: 800,
        occupied: 50,
        price: 3.5,
        address: 'Stadium Dr',
        distance: 4.2,
        amenities: ['Security'],
        rating: 3.8
    },
    {
        id: 8,
        name: 'Hotel Premium Parking',
        type: 'reserved',
        position: [51.498, -0.092],
        capacity: 80,
        occupied: 60,
        price: 8.0,
        address: 'Grand Hotel, Luxury St',
        distance: 0.5,
        amenities: ['EV Charging', 'Covered', 'Security', '24/7', 'Valet'],
        rating: 4.9
    }
];
