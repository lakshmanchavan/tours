import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Car, 
  Check, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageSquare
} from 'lucide-react';
import { TourPackage } from '../types';
import { BUSINESS_INFO } from '../lib/constants';

interface TourDetailModalProps {
  pkg: TourPackage | null;
  onClose: () => void;
  onBookTour: (pkg: TourPackage) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  pkg,
  onClose,
  onBookTour,
}) => {
  if (!pkg) return null;

  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'terms'>('itinerary');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]">
        
        {/* Header Image & Summary */}
        <div className="relative h-64 sm:h-72 bg-slate-900 shrink-0">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header text */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span>{pkg.destination}</span>
              <span>•</span>
              <Clock className="w-4 h-4 ml-1" />
              <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black font-heading leading-tight">
              {pkg.title}
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Package Starting from:</span>
                <span className="text-2xl font-black text-amber-400 font-heading">
                  ₹{pkg.startingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-300">/ All-inclusive cab</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call to Customize</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-6 shrink-0">
          {[
            { id: 'itinerary', label: 'Day-by-Day Itinerary' },
            { id: 'inclusions', label: 'Inclusions & Exclusions' },
            { id: 'terms', label: 'Terms & Policies' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {pkg.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Destinations & Sightseeing Covered:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.placesCovered.map((place, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/60"
                    >
                      ✓ {place}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day-by-day timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-slate-900 font-heading">
                  Detailed Day Schedule:
                </h4>
                {pkg.itinerary.map((item) => (
                  <div key={item.day} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black font-heading flex items-center justify-center shrink-0 shadow-sm">
                      D{item.day}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-slate-900">
                        Day {item.day}: {item.title}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INCLUSIONS & EXCLUSIONS */}
          {activeTab === 'inclusions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Package Inclusions</span>
                </div>
                <ul className="space-y-2.5">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Package Exclusions</span>
                </div>
                <ul className="space-y-2.5">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Booking Terms & Cancellation Policies</span>
              </div>
              <ul className="space-y-2.5">
                {pkg.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span>{term}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                  <span>Driver night allowance and interstate permits will be handled transparently as agreed during booking.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                  <span>Customizable pickups from Hubli, Dharwad, Pune, Bangalore, Belgaum or Mumbai doorstep.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-slate-500 block">Total Package Starting</span>
            <span className="text-xl font-black text-slate-900 font-heading">
              ₹{pkg.startingPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onBookTour(pkg);
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Package</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
