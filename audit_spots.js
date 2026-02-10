import { db } from './src/services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function auditParkingSpots() {
    console.log('--- Auditing parkingSpots Collection ---');
    try {
        const querySnapshot = await getDocs(collection(db, 'parkingSpots'));
        let total = 0;
        let available = 0;
        let count = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id} | Name: ${data.name} | Total: ${data.totalSpots} | Available: ${data.availableSpots} | Occupied: ${data.occupied}`);
            total += parseInt(data.totalSpots) || 0;
            available += parseInt(data.availableSpots) || 0;
            count++;
        });

        console.log('----------------------------------------');
        console.log(`Total Facilities: ${count}`);
        console.log(`Sum of totalSpots: ${total}`);
        console.log(`Sum of availableSpots: ${available}`);
    } catch (e) {
        console.error(e);
    }
}

// Since I can't run this directly easily due to ESM/Node config in the user's environment, 
// I'll instead write it as a component I can temporarily "test" or just rely on my logic.
// Actually, I'll just check the code again for obvious flaws.
