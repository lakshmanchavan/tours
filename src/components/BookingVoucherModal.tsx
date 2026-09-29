import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Phone, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Booking } from '../types';
import { BUSINESS_INFO } from '../lib/constants';

interface BookingVoucherModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingVoucherModal: React.FC<BookingVoucherModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*ADVIK TOURS AND TRAVELS - BOOKING CONFIRMATION*\n` +
      `Booking ID: ${booking.bookingCode}\n` +
      `Customer: ${booking.customerName}\n` +
      `Route: ${booking.pickupCity} to ${booking.dropCity}\n` +
      `Date & Time: ${booking.pickupDate} at ${booking.pickupTime}\n` +
      `Vehicle: ${booking.vehicleName}\n` +
      `Total Fare: ₹${booking.estimatedTotalFare}\n` +
      `Status: ${booking.status.toUpperCase()}\n` +
      `24x7 Helpline: ${BUSINESS_INFO.displayPhone1}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col print:border-none print:shadow-none print:m-0 print:w-full">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Official Booking Voucher
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="p-2 rounded-lg bg-green-600/30 hover:bg-green-600 text-green-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Body (Printable Area) */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Brand & Booking ID Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black font-heading text-xl shadow-md">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-heading">
                  ADVIK TOURS AND TRAVELS
                </h1>
                <p className="text-xs text-slate-500">
                  Reliable Travel. Comfortable Journeys.
                </p>
                <p className="text-[11px] text-slate-400">
                  GSTIN: {BUSINESS_INFO.gstin} • Support: {BUSINESS_INFO.displayPhone1}
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-amber-50 p-3 rounded-2xl border border-amber-200 w-full sm:w-auto">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                Booking ID
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                {booking.bookingCode}
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                  booking.status === 'confirmed' || booking.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.status === 'driver_assigned'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Trip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
            
            {/* Passenger Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Passenger Details</span>
              </h4>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900">{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-900">{booking.customerPhone}</span>
                </div>
                {booking.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span>{booking.customerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers:</span>
                  <span>{booking.passengers} Person(s)</span>
                </div>
              </div>
            </div>

            {/* Vehicle & Trip Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Vehicle & Schedule</span>
              </h4>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-900">{booking.vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trip Category:</span>
                  <span className="font-semibold capitalize">{booking.tripType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-900">{booking.pickupDate} at {booking.pickupTime}</span>
                </div>
                {booking.returnDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Date:</span>
                    <span>{booking.returnDate} ({booking.totalDays} Days)</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Route Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Itinerary Route</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Pickup Point</span>
                <span className="font-bold text-slate-900 text-sm">{booking.pickupCity}</span>
                <p className="text-slate-600 mt-0.5">{booking.pickupAddress || 'Address will be confirmed by driver'}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Destination Drop</span>
                <span className="font-bold text-slate-900 text-sm">{booking.dropCity}</span>
                <p className="text-slate-600 mt-0.5">{booking.dropAddress || 'Destination center'}</p>
              </div>
            </div>
          </div>

          {/* Assigned Driver (If present) */}
          {booking.driverName && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Assigned Chauffeur & Vehicle</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Driver Name</span>
                  <span className="font-bold">{booking.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Driver Phone</span>
                  <a href={`tel:${booking.driverPhone}`} className="font-bold text-emerald-700 underline">{booking.driverPhone}</a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Vehicle Reg. Number</span>
                  <span className="font-mono font-bold">{booking.driverVehicleRegNumber || 'Confirmed on departure'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Fare Summary Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white text-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm font-heading">
              Billing & Payment Summary
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Chargeable Distance:</span>
                <span>{booking.chargeableKm} KM (Billed @ ₹{booking.ratePerKm}/km)</span>
              </div>
              <div className="flex justify-between">
                <span>Base KM Fare:</span>
                <span>₹{booking.baseFare?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver Day Allowance:</span>
                <span>₹{booking.driverAllowance?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total Estimated Fare:</span>
                <span className="text-base text-amber-600">₹{booking.estimatedTotalFare?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Advance Paid:</span>
                <span>₹{booking.advanceAmount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                <span>Balance to be Paid to Driver:</span>
                <span>₹{(booking.balanceAmount || (booking.estimatedTotalFare - (booking.advanceAmount || 0))).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Crucial Travel Advisory */}
          <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-200 pt-4">
            <p className="font-semibold text-slate-700">Important Instructions for Passenger:</p>
            <p>1. Toll charges, interstate state-tax permits, and parking are NOT included in the base fare and must be cleared by customer on actuals.</p>
            <p>2. Starting and ending kilometers and timings will be verified with odometer reading from pickup to drop location.</p>
            <p>3. Driver contact details are dispatched via SMS & WhatsApp 2 hours prior to journey.</p>
            <p>4. 24x7 Helpdesk: <strong>{BUSINESS_INFO.displayPhone1}</strong> or <strong>{BUSINESS_INFO.displayPhone2}</strong>.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
