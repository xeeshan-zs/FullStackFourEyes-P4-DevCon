import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Check, AlertCircle, Zap } from 'lucide-react';
import Tesseract from 'tesseract.js';

function LicensePlateScanner({ onPlateDetected, onClose }) {
    const [scanning, setScanning] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Auto-start camera on mount
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
            }
        } catch (err) {
            setError('Camera access denied. Please enable camera permissions.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);

        // Stop camera after capture
        stopCamera();

        // Process the captured image
        processImage(imageData);
    };

    const processImage = async (imageData) => {
        setScanning(true);
        setError('');
        setExtractedText('');

        try {
            // OCR Processing
            const result = await Tesseract.recognize(
                imageData,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
                        }
                    }
                }
            );

            // Extract license plate pattern
            const text = result.data.text.toUpperCase().trim();

            // Enhanced pattern matching for license plates
            // Supports formats like: ABC-1234, AB123, ABC1234, etc.
            const platePattern = /[A-Z]{2,3}[-\s]?\d{2,4}[-\s]?[A-Z]?/g;
            const matches = text.match(platePattern);

            if (matches && matches.length > 0) {
                const plate = matches[0].replace(/[\s-]/g, '');
                setExtractedText(plate);
                setConfidence(result.data.confidence);

                // Auto-confirm if confidence is high
                if (result.data.confidence > 70) {
                    setTimeout(() => {
                        if (onPlateDetected) {
                            onPlateDetected(plate);
                            onClose && onClose();
                        }
                    }, 1500);
                }
            } else {
                // No pattern match, use cleaned text
                const cleanedText = text.split('\n')[0]?.trim() || text;
                setExtractedText(cleanedText);
                setConfidence(result.data.confidence);
            }

            setScanning(false);
        } catch (err) {
            setError('Failed to process image: ' + err.message);
            setScanning(false);
        }
    };

    const retryCapture = () => {
        setCapturedImage(null);
        setExtractedText('');
        setConfidence(0);
        startCamera();
    };

    const handleConfirm = () => {
        if (extractedText && onPlateDetected) {
            onPlateDetected(extractedText);
            onClose && onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Camera size={24} />
                            <h2 className="text-xl font-bold">License Plate Scanner</h2>
                        </div>
                        {onClose && (
                            <button
                                onClick={() => {
                                    stopCamera();
                                    onClose();
                                }}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-white/80 mt-2 flex items-center gap-2">
                        <Zap size={14} />
                        Live Camera + AI Recognition
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Live Camera Feed */}
                    {cameraActive && !capturedImage && (
                        <div className="relative mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-64 object-cover rounded-xl bg-black"
                            />
                            <div className="absolute inset-0 border-4 border-dashed border-orange-400 rounded-xl pointer-events-none opacity-50"></div>

                            {/* Capture Button */}
                            <button
                                onClick={captureImage}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border-4 border-orange-500"
                            >
                                <Camera size={28} className="text-orange-500" />
                            </button>
                        </div>
                    )}

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Captured Image Preview */}
                    {capturedImage && !scanning && (
                        <div className="mb-4 rounded-xl overflow-hidden border-2 border-gray-200">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {scanning && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Scanning plate...</p>
                            <p className="text-xs text-gray-400 mt-1">AI is reading the license plate</p>
                        </div>
                    )}

                    {/* Result */}
                    {extractedText && !scanning && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="text-green-600" size={20} />
                                    <span className="text-sm font-semibold text-green-800">
                                        Plate Detected {confidence > 70 ? '(Auto-confirmed)' : ''}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 tracking-wider">
                                    {extractedText}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Confidence: {confidence.toFixed(1)}%
                                </p>
                            </div>

                            {confidence <= 70 && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={retryCapture}
                                        className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Error</p>
                                <p className="text-xs text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LicensePlateScanner;
