import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Car, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Booking } from '../types';
import { lookupBooking } from '../services/dbService';
import { BookingVoucherModal } from './BookingVoucherModal';

interface TrackBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [showVoucher, setShowVoucher] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      setError('Please enter your Booking ID (e.g. ADV-2026-000101)');
      return;
    }

    setLoading(true);
    setError('');
    setFoundBooking(null);

    try {
      const res = await lookupBooking(bookingCode.trim(), phone.trim());
      if (res) {
        setFoundBooking(res);
      } else {
        setError('No active booking found with this ID and phone number. Please verify or call 7760466777.');
      }
    } catch {
      setError('Search timed out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col">
          
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">
                Track Booking Status
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Booking ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ADV-2026-000101"
                  value={bookingCode}
                  onChange={e => setBookingCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit phone used during booking"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
              >
                {loading ? 'Searching...' : 'Track Trip Status'}
              </button>
            </form>

            {/* Found Booking Result Card */}
            {foundBooking && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900 text-xs">{foundBooking.bookingCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    foundBooking.status === 'confirmed' || foundBooking.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundBooking.status === 'driver_assigned'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {foundBooking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <div className="font-semibold">{foundBooking.pickupCity} ➔ {foundBooking.dropCity}</div>
                  <div className="text-slate-500">{foundBooking.pickupDate} at {foundBooking.pickupTime}</div>
                  <div className="text-slate-500">Vehicle: {foundBooking.vehicleName}</div>
                  {foundBooking.driverName && (
                    <div className="text-emerald-700 font-bold pt-1">
                      Driver: {foundBooking.driverName} ({foundBooking.driverPhone})
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowVoucher(true)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Printable Voucher</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      <BookingVoucherModal
        isOpen={showVoucher}
        onClose={() => setShowVoucher(false)}
        booking={foundBooking}
      />
    </>
  );
};
