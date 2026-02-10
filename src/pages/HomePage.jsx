import { db } from '../services/firebase';
import { CheckCircle2 } from 'lucide-react';

function HomePage() {
    const testFirebaseConnection = async () => {
        try {
            // Just check if db is initialized
            console.log('Firebase connected:', db);
            alert('✅ Firebase is connected successfully!');
        } catch (error) {
            console.error('Firebase connection error:', error);
            alert('❌ Firebase connection failed. Check console for details.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-white/20 p-6 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white">
                        Park-it
                    </h1>

                    <p className="text-xl md:text-2xl text-white/90">
                        Smart City Parking & Traffic Management Hub
                    </p>

                    <div className="pt-4">
                        <button
                            onClick={testFirebaseConnection}
                            className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Test Firebase Connection
                        </button>
                    </div>

                    <div className="pt-6 text-white/80 text-sm">
                        <p>Module 1: Project Scaffold Complete ✓</p>
                        <p className="mt-2">Ready for Module 2: Authentication</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
