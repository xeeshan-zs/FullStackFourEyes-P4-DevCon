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
    const [initializingCamera, setInitializingCamera] = useState(true);
    const [ocrProgress, setOcrProgress] = useState(0);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setInitializingCamera(true);
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
                setInitializingCamera(false);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setInitializingCamera(false);

            if (err.name === 'NotAllowedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found on this device.');
            } else if (err.name === 'NotReadableError') {
                setError('Camera is already in use by another application.');
            } else {
                setError('Failed to access camera: ' + err.message);
            }
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

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
    };

    const processImage = async (imageData) => {
        setScanning(true);
        setError('');
        setExtractedText('');
        setOcrProgress(0);

        try {
            const result = await Tesseract.recognize(
                imageData,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text.toUpperCase().trim();
            const platePattern = /[A-Z]{2,3}[-\s]?\d{2,4}[-\s]?[A-Z]?/g;
            const matches = text.match(platePattern);

            if (matches && matches.length > 0) {
                const plate = matches[0].replace(/[\s-]/g, '');
                setExtractedText(plate);
                setConfidence(result.data.confidence);

                // Auto-confirm high confidence — pass evidence image along with plate
                if (result.data.confidence > 70) {
                    setTimeout(() => {
                        if (onPlateDetected) {
                            onPlateDetected(plate, imageData);
                        }
                    }, 1200);
                }
            } else {
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
        setOcrProgress(0);
        startCamera();
    };

    const handleConfirm = () => {
        if (extractedText && onPlateDetected) {
            // Pass both plate text and evidence image
            onPlateDetected(extractedText, capturedImage);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-[#0F172A] rounded-3xl shadow-2xl shadow-black/50 max-w-md w-full overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Camera size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Plate Scanner</h2>
                                <p className="text-xs text-white/70 flex items-center gap-1">
                                    <Zap size={12} />
                                    AI-Powered OCR
                                </p>
                            </div>
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
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {/* Initializing Camera */}
                    {initializingCamera && !error && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                            <p className="text-gray-300 font-medium">Starting camera...</p>
                            <p className="text-xs text-gray-500 mt-1">Please allow camera access</p>
                        </div>
                    )}

                    {/* Live Camera Feed */}
                    {cameraActive && !capturedImage && !error && (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-64 object-cover rounded-2xl bg-black"
                            />
                            {/* Scan Frame Overlay */}
                            <div className="absolute inset-0 pointer-events-none rounded-2xl">
                                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-400 rounded-tl-lg" />
                                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-400 rounded-tr-lg" />
                                <div className="absolute bottom-16 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-400 rounded-bl-lg" />
                                <div className="absolute bottom-16 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-400 rounded-br-lg" />
                            </div>

                            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                                📸 Align plate inside frame
                            </div>

                            {/* Capture Button */}
                            <button
                                onClick={captureImage}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-xl shadow-orange-500/30 hover:shadow-2xl transition-all flex items-center justify-center border-4 border-orange-500 hover:scale-110 active:scale-95"
                            >
                                <Camera size={28} className="text-orange-500" />
                            </button>
                        </div>
                    )}

                    {/* Hidden canvas */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Captured Image Preview (while processing) */}
                    {capturedImage && !scanning && !extractedText && (
                        <div className="rounded-2xl overflow-hidden border border-white/10">
                            <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover" />
                        </div>
                    )}

                    {/* Scanning State */}
                    {scanning && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                            <p className="text-gray-300 font-medium">Scanning plate...</p>
                            <p className="text-xs text-gray-500 mt-1">AI is reading the license plate</p>
                            {/* Progress bar */}
                            <div className="mt-4 mx-auto max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{ocrProgress}%</p>
                        </div>
                    )}

                    {/* Result */}
                    {extractedText && !scanning && (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check className="text-green-400" size={20} />
                                    <span className="text-sm font-bold text-green-400">
                                        {confidence > 70 ? 'Auto-confirmed ✓' : 'Plate Detected'}
                                    </span>
                                </div>
                                <div className="bg-[#0B1120] rounded-xl p-4 text-center border border-white/5">
                                    <p className="text-3xl font-bold text-white tracking-[0.2em] font-mono">
                                        {extractedText}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    Confidence: {confidence.toFixed(1)}%
                                </p>
                            </div>

                            {/* Photo Evidence Preview */}
                            {capturedImage && (
                                <div className="rounded-xl overflow-hidden border border-white/10">
                                    <img src={capturedImage} alt="Evidence" className="w-full h-32 object-cover opacity-80" />
                                    <div className="bg-white/5 px-3 py-1.5 flex items-center gap-2">
                                        <Camera size={12} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-400 font-medium">Photo evidence captured</span>
                                    </div>
                                </div>
                            )}

                            {confidence <= 70 && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={retryCapture}
                                        className="flex-1 py-3 px-4 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-red-400">Camera Error</p>
                                        <p className="text-xs text-red-400/70 mt-1">{error}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setError('');
                                        startCamera();
                                    }}
                                    className="w-full py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
                                >
                                    Retry Camera Access
                                </button>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-xs text-blue-400 font-medium mb-2">💡 Troubleshooting:</p>
                                <ul className="text-xs text-blue-400/70 space-y-1 ml-4 list-disc">
                                    <li>Check browser camera permissions</li>
                                    <li>Ensure no other app is using the camera</li>
                                    <li>Try refreshing the page</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LicensePlateScanner;
