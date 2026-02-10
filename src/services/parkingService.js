// Mock data for parking facilities
export const MOCK_FACILITIES = [
    {
        id: '1',
        name: 'City Center Mall',
        location: { lat: 40.7128, lng: -74.0060 },
        type: 'Multi-story',
        totalSpots: 200,
        availableSpots: 145,
        pricePerHour: 5.0,
        status: 'OPEN',
        amenities: ['EV Charging', 'Covered', 'CCTV']
    },
    {
        id: '2',
        name: 'Downtown Street Parking',
        location: { lat: 40.7140, lng: -74.0080 },
        type: 'Street',
        totalSpots: 50,
        availableSpots: 12,
        pricePerHour: 2.5,
        status: 'OPEN',
        amenities: ['Pay Meter']
    },
    {
        id: '3',
        name: 'Westside Garage',
        location: { lat: 40.7110, lng: -74.0090 },
        type: 'Underground',
        totalSpots: 100,
        availableSpots: 5,
        pricePerHour: 4.0,
        status: 'FULL',
        amenities: ['Security', 'Valet']
    },
    {
        id: '4',
        name: 'North Park Lot',
        location: { lat: 40.7150, lng: -74.0040 },
        type: 'Surface Lot',
        totalSpots: 80,
        availableSpots: 80,
        pricePerHour: 3.0,
        status: 'OPEN',
        amenities: ['Disabled Access']
    }
];

export const getParkingFacilities = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_FACILITIES;
};
