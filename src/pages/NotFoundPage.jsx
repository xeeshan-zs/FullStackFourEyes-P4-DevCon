import { Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-blue-500" size={48} />
                </div>

                <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    The parking spot you're looking for doesn't exist. It might have been moved or removed.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                    <MapPin size={20} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
