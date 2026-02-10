import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get user profile data
 */
export async function getUserProfile(uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { success: true, data: userSnap.data() };
        } else {
            // Return empty profile structure
            return {
                success: true,
                data: {
                    vehicles: [],
                    createdAt: new Date().toISOString()
                }
            };
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Initialize user profile if it doesn't exist
 */
export async function initializeUserProfile(uid, email, role = 'driver') {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newProfile = {
                uid,
                email,
                role,
                vehicles: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            return { success: true, data: newProfile };
        }

        return { success: true, data: userSnap.data() };
    } catch (error) {
        console.error('Error initializing user profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a vehicle to user profile
 */
export async function addVehicle(uid, vehicleData) {
    try {
        const userRef = doc(db, 'users', uid);
        const vehicle = {
            id: Date.now().toString(),
            plateNumber: vehicleData.plateNumber.toUpperCase(),
            make: vehicleData.make || '',
            model: vehicleData.model || '',
            color: vehicleData.color || '',
            addedAt: new Date().toISOString()
        };

        await updateDoc(userRef, {
            vehicles: arrayUnion(vehicle),
            updatedAt: new Date().toISOString()
        });

        return { success: true, data: vehicle };
    } catch (error) {
        console.error('Error adding vehicle:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update all vehicles for a user
 */
export async function updateVehicles(uid, vehicles) {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            vehicles: vehicles,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating vehicles:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a vehicle from user profile
 */
export async function removeVehicle(uid, vehicleId) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedVehicles = userData.vehicles.filter(v => v.id !== vehicleId);

            await updateDoc(userRef, {
                vehicles: updatedVehicles,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        }

        return { success: false, error: 'User not found' };
    } catch (error) {
        console.error('Error removing vehicle:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user has completed onboarding (has vehicles)
 */
export async function hasCompletedOnboarding(uid) {
    try {
        const result = await getUserProfile(uid);
        if (result.success && result.data) {
            return result.data.vehicles && result.data.vehicles.length > 0;
        }
        return false;
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
}
