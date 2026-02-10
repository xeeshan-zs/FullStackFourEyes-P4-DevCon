import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, AlertCircle, Zap } from 'lucide-react';
import Tesseract from 'tesseract.js';

/**
 * Embeddable Camera Preview Component
 * Shows live camera feed with optional OCR scanning
 */
function CameraPreview({ onPlateDetected, onCapture, autoHeight = false }) {
    const [cameraActive, setCameraActive] = useState(false);
    const [initializingCamera, setInitializingCamera] = useState(true);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
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
                setError('Camera permission denied. Please allow camera access.');
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

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        // Notify parent of capture first
        if (onCapture) {
            onCapture(imageData);
        }

        // Then process with OCR
        setScanning(true);
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
                if (onPlateDetected) {
                    onPlateDetected(plate, imageData);
                }
            } else {
                const cleanedText = text.split('\n')[0]?.trim() || text;
                if (onPlateDetected) {
                    onPlateDetected(cleanedText, imageData);
                }
            }

            setScanning(false);
        } catch (err) {
            console.error('OCR error:', err);
            setScanning(false);
        }
    };

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-bold text-red-400">Camera Error</p>
                        <p className="text-xs text-red-400/70 mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={startCamera}
                    className="w-full py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
                >
                    Retry Camera Access
                </button>
            </div>
        );
    }

    if (initializingCamera) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">Starting camera...</p>
                <p className="text-xs text-gray-500 mt-1">Please allow camera access</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full ${autoHeight ? 'h-auto' : 'h-64 md:h-80'} object-cover rounded-2xl bg-black`}
            />

            {/* Scan Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-400 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-400 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-400 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-400 rounded-br-lg" />
            </div>

            {/* Camera Active Indicator */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-2">
                <Zap size={12} className="text-orange-400" />
                {scanning ? `Scanning... ${ocrProgress}%` : 'Camera Active'}
            </div>

            {/* Capture Button */}
            {cameraActive && !scanning && (
                <button
                    onClick={captureAndProcess}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <Camera size={20} />
                    Capture & Scan
                </button>
            )}

            {/* Scanning Overlay */}
            {scanning && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-3" />
                        <p className="text-white font-medium">Scanning plate...</p>
                        <div className="mt-3 mx-auto max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                                style={{ width: `${ocrProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{ocrProgress}%</p>
                    </div>
                </div>
            )}

            {/* Hidden canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

export default CameraPreview;
