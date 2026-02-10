import { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, ChevronRight, Check, MapPin } from 'lucide-react';
import { calculateReservationCost } from '../utils/pricingEngine';
import styles from './ReservationModal.module.css';

function ReservationModal({ facility, onClose, onConfirm }) {
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('12:00');
    const [duration, setDuration] = useState(2);
    const [cost, setCost] = useState({ total: 0, hourly: 0 });

    useEffect(() => {
        if (facility) {
            setCost(calculateReservationCost(facility, duration));
        }
    }, [facility, duration]);

    const handlePayment = () => {
        // Mock payment processing
        setStep(3);
        setTimeout(() => {
            onConfirm({
                facilityId: facility.id,
                facilityName: facility.name,
                date,
                time,
                duration,
                totalCost: cost.total,
                licensePlate: 'ABC1234', // TODO: Add actual input field
                status: 'confirmed',
                timestamp: new Date().toISOString()
            });
        }, 2000);
    };

    if (!facility) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={20} />
                </button>

                {step === 1 && (
                    <div className={styles.content}>
                        <h2 className={styles.title}>Reserve Spot</h2>
                        <div className={styles.facilityInfo}>
                            <h3>{facility.name}</h3>
                            <p>{facility.address}</p>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${facility.location?.lat || 0},${facility.location?.lng || 0}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 text-sm mt-1 hover:underline"
                            >
                                <MapPin size={14} /> Get Directions
                            </a>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <div className={styles.inputWrapper}>
                                <Calendar size={18} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Start Time</label>
                            <div className={styles.inputWrapper}>
                                <Clock size={18} />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Duration ({duration} hours)</label>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className={styles.range}
                            />
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>Rate</span>
                                <span>PKR {cost.hourly}/hr</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Duration</span>
                                <span>{duration} hrs</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>PKR {cost.total}</span>
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} className={styles.btnPrimary}>
                            Proceed to Payment <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.content}>
                        <h2 className={styles.title}>Payment Method</h2>

                        <div className={styles.cardPreview}>
                            <div className={styles.cardChip}></div>
                            <div className={styles.cardNumber}>•••• •••• •••• 4242</div>
                            <div className={styles.cardDetails}>
                                <span>John Doe</span>
                                <span>12/28</span>
                            </div>
                            <div className={styles.cardLogo}>VISA</div>
                        </div>

                        <div className={styles.alertBox}>
                            <CreditCard size={18} />
                            <span>This is a secure sandbox transaction. No real money will be charged.</span>
                        </div>

                        <div className={styles.summary}>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Amount to Pay</span>
                                <span>PKR {cost.total}</span>
                            </div>
                        </div>

                        <button onClick={handlePayment} className={styles.btnPrimary}>
                            Pay & Reserve
                        </button>

                        {/* Prototype Bypass Button */}
                        <button
                            onClick={handlePayment}
                            className="w-full mt-3 py-3 px-4 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-xl font-medium hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-xs uppercase font-bold tracking-wider">Prototype Mode</span>
                            Bypass Payment
                        </button>

                        <button onClick={() => setStep(1)} className={styles.btnLink}>
                            Back
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.successContent}>
                        <div className={styles.successIcon}>
                            <Check size={40} />
                        </div>
                        <h2>Reservation Confirmed!</h2>
                        <p>Your spot at {facility.name} is reserved.</p>
                        <p className={styles.ticketId}>Ticket #{Math.floor(Math.random() * 100000)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReservationModal;
