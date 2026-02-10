import { useState } from 'react';
import { QrCode, X, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function QRCheckIn({ reservation, onCheckIn, onClose }) {
    const [checkedIn, setCheckedIn] = useState(false);

    const handleCheckIn = () => {
        if (onCheckIn) {
            onCheckIn(reservation.id);
        }
        setCheckedIn(true);
    };

    const qrData = JSON.stringify({
        type: 'PARK_IT_CHECKIN',
        reservationId: reservation.id,
        spotName: reservation.facilityName,
        date: reservation.date,
        time: reservation.time
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <QrCode size={24} />
                            <h2 className="text-xl font-bold">QR Check-In</h2>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!checkedIn ? (
                        <>
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {reservation.facilityName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {reservation.date} • {reservation.time}
                                </p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-white border-4 border-blue-100 rounded-2xl shadow-lg">
                                    <QRCodeSVG
                                        value={qrData}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-blue-800 text-center">
                                    <strong>Show this QR code</strong> to the parking attendant or scan at the entry gate
                                </p>
                            </div>

                            <button
                                onClick={handleCheckIn}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Self Check-In
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-600" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Checked In!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You're all set at {reservation.facilityName}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QRCheckIn;
