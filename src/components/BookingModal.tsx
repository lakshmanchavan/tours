import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Vehicle, PricingRules, Booking, TripType, BookingStatus } from '../types';
import { BUSINESS_INFO, POPULAR_CITIES, DEFAULT_PRICING_RULES } from '../lib/constants';
import { getEstimatedRouteDistance } from '../utils/routeDistance';
import { calculateTripFare } from '../utils/fareCalculator';
import { createBooking, recordPayment } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { BookingVoucherModal } from './BookingVoucherModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  pricingRules?: PricingRules;
  prefill?: any;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  pricingRules = DEFAULT_PRICING_RULES,
  prefill,
}) => {
  if (!isOpen) return null;

  const { user, profile } = useAuth();

  // Wizard Steps: 1 = Route & Dates, 2 = Vehicle & Fare, 3 = Passenger Info, 4 = Review & Submit, 5 = Confirmation
  const [step, setStep] = useState<number>(1);

  // Form State
  const [tripType, setTripType] = useState<TripType>(prefill?.tripType || 'outstation_round');
  const [pickupCity, setPickupCity] = useState(prefill?.pickupCity || 'Pune');
  const [dropCity, setDropCity] = useState(prefill?.dropCity || 'Goa');
  const [pickupAddress, setPickupAddress] = useState(prefill?.pickupAddress || '');
  const [dropAddress, setDropAddress] = useState(prefill?.dropAddress || '');
  const [pickupDate, setPickupDate] = useState(() => {
    if (prefill?.pickupDate) return prefill.pickupDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState(prefill?.pickupTime || '06:00');
  const [returnDate, setReturnDate] = useState(() => {
    if (prefill?.returnDate) return prefill.returnDate;
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(prefill?.vehicleId || vehicles[0]?.id || 'swift-dzire');
  const [passengers, setPassengers] = useState<number>(prefill?.passengers || 4);
  const [specialRequests, setSpecialRequests] = useState('');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState(profile?.displayName || user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Validation errors
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Dynamic distance calculation
  const [distanceKm, setDistanceKm] = useState<number>(prefill?.distanceKm || 150);

  useEffect(() => {
    if (pickupCity && dropCity) {
      getEstimatedRouteDistance(pickupCity, dropCity).then(res => {
        setDistanceKm(res.distanceKm);
      });
    }
  }, [pickupCity, dropCity]);

  // Total days calculation
  const calculateTotalDays = (): number => {
    if (tripType === 'one_way' || tripType === 'local') return 1;
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
  };

  const totalDays = calculateTotalDays();
  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const fareEstimate = calculateTripFare(
    activeVehicle,
    pricingRules,
    distanceKm,
    tripType,
    totalDays
  );

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!pickupCity.trim() || !dropCity.trim()) {
        setErrorMsg('Please enter both pickup and destination locations.');
        return;
      }
      if (!pickupDate) {
        setErrorMsg('Please select a pickup date.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!customerName.trim()) {
        setErrorMsg('Please enter customer full name.');
        return;
      }
      if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number for booking updates.');
        return;
      }
      setStep(4);
    }
  };

  // Submit Booking to Firestore
  const handleSubmitBooking = async (requireImmediatePayment: boolean = false) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const initialStatus: BookingStatus = requireImmediatePayment ? 'payment_pending' : 'pending';

      const bookingPayload: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt'> = {
        userId: user?.uid || 'guest',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        tripType,
        packageId: prefill?.packageId || undefined,
        packageName: prefill?.packageName || undefined,
        pickupCity: pickupCity.trim(),
        dropCity: dropCity.trim(),
        pickupAddress: pickupAddress.trim(),
        dropAddress: dropAddress.trim(),
        pickupDate,
        pickupTime,
        returnDate: tripType === 'outstation_round' ? returnDate : undefined,
        totalDays,
        vehicleId: activeVehicle.id,
        vehicleName: activeVehicle.name,
        vehicleCategory: activeVehicle.category,
        passengers,
        luggageCount: activeVehicle.capacityLuggage || 2,
        specialRequests: specialRequests.trim(),
        estimatedDistanceKm: fareEstimate.estimatedDistanceKm,
        chargeableKm: fareEstimate.chargeableKm,
        ratePerKm: activeVehicle.ratePerKm,
        baseFare: fareEstimate.baseFare,
        driverAllowance: fareEstimate.totalDriverAllowance,
        nightCharges: fareEstimate.nightCharges,
        estimatedTotalFare: fareEstimate.grandTotal,
        advanceAmount: 0,
        balanceAmount: fareEstimate.grandTotal,
        status: initialStatus,
        paymentStatus: 'pending',
      };

      const newBooking = await createBooking(bookingPayload);
      setConfirmedBooking(newBooking);

      if (requireImmediatePayment) {
        setShowPaymentGateway(true);
      } else {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setStep(5);
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMsg('Failed to process booking. Please call our 24x7 helpdesk at 7760466777.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler when payment is confirmed in Payment Gateway
  const handlePaymentSuccess = async (payInfo: any) => {
    setShowPaymentGateway(false);
    if (!confirmedBooking) return;

    try {
      await recordPayment({
        bookingId: confirmedBooking.id,
        bookingCode: confirmedBooking.bookingCode,
        userId: user?.uid || 'guest',
        amount: payInfo.amount,
        currency: 'INR',
        paymentType: payInfo.paymentType,
        paymentMethod: payInfo.paymentMethod,
        gateway: 'razorpay',
        gatewayPaymentId: payInfo.gatewayPaymentId,
        status: 'success',
        customerName: confirmedBooking.customerName,
        customerPhone: confirmedBooking.customerPhone,
      });

      const updated = {
        ...confirmedBooking,
        status: 'confirmed' as BookingStatus,
        paymentStatus: (payInfo.paymentType === 'full' ? 'completed' : 'partial') as any,
        advanceAmount: payInfo.amount,
        balanceAmount: Math.max(0, confirmedBooking.estimatedTotalFare - payInfo.amount),
        paymentMethod: payInfo.paymentMethod,
      };

      setConfirmedBooking(updated);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      setStep(5);
    } catch (err) {
      console.warn('Payment record error:', err);
      setStep(5);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-heading text-white">ADVIK TOURS AND TRAVELS</span>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  Instant Cab Booking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reliable Travel. Comfortable Journeys. Verified Chauffeurs.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Wizard Indicator (Steps 1-4) */}
          {step < 5 && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
              <div className="flex items-center justify-between max-w-lg mx-auto text-xs font-bold">
                {[
                  { num: 1, label: 'Trip & Dates' },
                  { num: 2, label: 'Vehicle' },
                  { num: 3, label: 'Passenger' },
                  { num: 4, label: 'Confirm' },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                      step >= s.num ? 'bg-amber-500 text-white font-bold' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <span className={`hidden sm:inline ${step >= s.num ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                    {idx < 3 && <span className="text-slate-300 ml-2">➔</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* STEP 1: ROUTE & DATES */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                  {[
                    { id: 'outstation_round', label: 'Outstation Round Trip' },
                    { id: 'one_way', label: 'One Way Drop' },
                    { id: 'local', label: 'Local City Ride' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTripType(tab.id as TripType)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        tripType === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup City / Airport
                    </label>
                    <input
                      type="text"
                      value={pickupCity}
                      onChange={e => setPickupCity(e.target.value)}
                      placeholder="e.g. Pune, Hubli, Bangalore, Mumbai"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Destination City / Drop Location
                    </label>
                    <input
                      type="text"
                      value={dropCity}
                      onChange={e => setDropCity(e.target.value)}
                      placeholder="e.g. Goa, Shirdi, Mahabaleshwar"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
                    />
                  </div>

                  {tripType === 'outstation_round' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Return Date ({totalDays} Days)
                      </label>
                      <input
                        type="date"
                        min={pickupDate}
                        value={returnDate}
                        onChange={e => setReturnDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold">Calculated Highway Distance:</span>
                    <p className="text-[11px] text-slate-600">{pickupCity} ➔ {dropCity}: approx. {distanceKm} KM one-way</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-amber-300">
                    {fareEstimate.chargeableKm} Total Chargeable KM
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: VEHICLE & FARE SELECTION */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Choose Preferred Vehicle
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((veh) => {
                    const isSelected = veh.id === selectedVehicleId;
                    const vehFare = calculateTripFare(veh, pricingRules, distanceKm, tripType, totalDays);
                    return (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedVehicleId(veh.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{veh.name}</h4>
                            <p className="text-xs text-slate-500">{veh.capacityPassengers} Seats • {veh.capacityLuggage} Bags • AC</p>
                          </div>
                          <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                            ₹{veh.ratePerKm}/km
                          </span>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Est. Trip Fare</span>
                            <span className="text-base font-black text-slate-900 font-heading">
                              ₹{vehFare.grandTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Adv: ₹{vehFare.advancePayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fare Summary Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Fare ({fareEstimate.chargeableKm} km @ ₹{activeVehicle.ratePerKm}/km):</span>
                    <span className="text-white font-bold">₹{fareEstimate.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Driver Allowance ({totalDays} days):</span>
                    <span className="text-white font-bold">₹{fareEstimate.totalDriverAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>GST (5%):</span>
                    <span className="text-white font-bold">₹{fareEstimate.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-amber-400 font-heading">
                    <span>Estimated Total Amount:</span>
                    <span className="text-lg">₹{fareEstimate.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    *Toll, state taxes & parking extra at actuals during trip.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: PASSENGER & ADDRESS DETAILS */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Rajesh Patil"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number (For Driver Updates) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile (e.g. 9845112233)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address (For Voucher & Invoice)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Exact Doorstep Pickup Address
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    placeholder="House/Building name, Landmark, Area street address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination Drop Address / Hotel Name
                  </label>
                  <input
                    type="text"
                    value={dropAddress}
                    onChange={e => setDropAddress(e.target.value)}
                    placeholder="Hotel name, resort, railway station or street address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Special Requests / Senior Citizen Assistance / Luggage Notes
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Carrier required, early morning start, child seat or specific requirements..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm font-heading">
                    Booking Verification Summary
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Passenger:</span>
                      <strong className="text-slate-900">{customerName}</strong> ({customerPhone})
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Vehicle:</span>
                      <strong className="text-slate-900">{activeVehicle.name}</strong> ({activeVehicle.capacityPassengers}+1 Seater)
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Route:</span>
                      <strong className="text-slate-900">{pickupCity} ➔ {dropCity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Departure:</span>
                      <strong className="text-slate-900">{pickupDate} at {pickupTime}</strong> ({totalDays} Days)
                    </div>
                  </div>
                </div>

                {/* Payment & Confirmation Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Pay Advance & Confirm Now</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Pay 20% advance (₹{fareEstimate.advancePayable.toLocaleString('en-IN')}) via UPI or Card to instantly lock the cab.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitBooking(true)}
                      className="mt-4 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      <span>Pay ₹{fareEstimate.advancePayable.toLocaleString('en-IN')} & Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Submit Booking Request</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Send request without paying now. Our team will verify driver availability and call you within 15 minutes.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitBooking(false)}
                      className="mt-4 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      <span>Submit Request (Pay Later)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 5: SUCCESS CONFIRMATION */}
            {step === 5 && confirmedBooking && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-heading">
                    Booking Successful!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Thank you for choosing Advik Tours and Travels. Your trip request is registered.
                  </p>
                </div>

                <div className="p-4 max-w-sm mx-auto bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                    Your Booking ID
                  </span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {confirmedBooking.bookingCode}
                  </span>
                  <div className="mt-1 text-xs text-slate-600 font-medium">
                    Status: <strong className="text-emerald-700 capitalize">{confirmedBooking.status.replace('_', ' ')}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View & Print Travel Voucher</span>
                  </button>

                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi,%20I%20have%20booked%20cab%20${confirmedBooking.bookingCode}%20for%20${confirmedBooking.pickupCity}%20to%20${confirmedBooking.dropCity}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Advik Support</span>
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Footer Controls (Steps 1-3) */}
          {step < 4 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : <div></div>}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Payment Gateway Modal (simulated Razorpay / UPI) */}
      <PaymentGatewayModal
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        bookingCode={confirmedBooking?.bookingCode || ''}
        customerName={customerName}
        customerPhone={customerPhone}
        totalAmount={fareEstimate.grandTotal}
        advanceAmount={fareEstimate.advancePayable}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Printable Voucher Modal */}
      <BookingVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        booking={confirmedBooking}
      />
    </>
  );
};
