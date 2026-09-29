import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Check, 
  AlertCircle,
  MessageSquareHeart
} from 'lucide-react';
import { submitReview } from '../services/dbService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [tripType, setTripType] = useState('Outstation Round Trip');
  const [vehicleName, setVehicleName] = useState('Maruti Suzuki Dzire');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      setError('Please provide your name and feedback comment.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitReview({
        customerName: customerName.trim(),
        customerCity: customerCity.trim() || 'Hubli / Pune',
        bookingCode: bookingCode.trim() || undefined,
        tripType,
        vehicleName,
        rating,
        comment: comment.trim(),
      });

      setIsSuccess(true);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-heading">
                Share Your Travel Experience
              </h3>
              <p className="text-[11px] text-slate-400">Help fellow travelers make informed choices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-heading">
                Thank You For Your Review!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your feedback has been received. Once approved by our team, it will appear on our official reviews section.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Rating Stars */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 self-center ml-2">
                    {rating === 5 ? 'Excellent (5/5)' : `${rating} Stars`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kulkarni"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune / Hubli / Bangalore"
                    value={customerCity}
                    onChange={e => setCustomerCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Booking ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADV-2026-000101"
                    value={bookingCode}
                    onChange={e => setBookingCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Traveled In
                  </label>
                  <select
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden"
                  >
                    <option value="Maruti Suzuki Dzire">Maruti Suzuki Dzire</option>
                    <option value="Toyota Etios">Toyota Etios</option>
                    <option value="Maruti Suzuki Ertiga">Maruti Suzuki Ertiga</option>
                    <option value="Toyota Innova Crysta">Toyota Innova Crysta</option>
                    <option value="Force Tempo Traveller">Force Tempo Traveller</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Review & Trip Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the driver's driving, cleanliness of vehicle, punctuality, and overall trip comfort..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? 'Submitting Review...' : 'Submit Customer Review'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
