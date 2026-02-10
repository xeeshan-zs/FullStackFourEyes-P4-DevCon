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

import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'parkingSpots';

export const getParkingFacilities = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const facilities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return facilities;
    } catch (error) {
        console.error("Error fetching parking spots:", error);
        return [];
    }
};

export const addFacility = async (facilityData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), facilityData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding facility:", error);
        return { success: false, error };
    }
};

export const updateFacility = async (id, updates) => {
    try {
        const facilityRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(facilityRef, updates);
        return { success: true };
    } catch (error) {
        console.error("Error updating facility:", error);
        return { success: false, error };
    }
};

export const deleteFacility = async (id) => {
    try {
        const facilityRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(facilityRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting facility:", error);
        return { success: false, error };
    }
};
