import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  MapPin, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';
import { BookingWidget } from './BookingWidget';
import { Vehicle, PricingRules } from '../types';

interface HeroSectionProps {
  vehicles: Vehicle[];
  pricingRules: PricingRules;
  onProceedToBooking: (bookingData: any) => void;
  onOpenFareCalcModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  vehicles,
  pricingRules,
  onProceedToBooking,
  onOpenFareCalcModal,
}) => {
  return (
    <section className="relative pt-6 pb-20 overflow-hidden bg-slate-900 text-white">
      {/* Background Image with Warm Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
          alt="Indian Highway Road Trip"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-900"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-6 backdrop-blur-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>India’s Most Trusted Outstation Cab & Holiday Service</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-400">4.9 / 5 Rating</span>
        </div>

        {/* Hero Headline & Intro */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-[1.15]">
            Reliable Travel. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Comfortable Journeys.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Welcome to <strong className="text-white font-semibold">ADVIK TOURS AND TRAVELS</strong>. Premium outstation cabs, one-way city drops, airport transfers, and customized pilgrimage & holiday tour packages. Verified chauffeurs, immaculate AC cars, and transparent per-km billing.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pb-6">
            <a
              href={`tel:${BUSINESS_INFO.phone1}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {BUSINESS_INFO.displayPhone1}</span>
            </a>

            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hi%20Advik%20Tours,%20I%20need%20a%20cab%20quotation`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-900/30 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Quote</span>
            </a>

            <button
              onClick={onOpenFareCalcModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Fare Calculator</span>
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>Sedans from ₹12/km</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>SUVs from ₹15/km</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>Sanitized AC Vehicles</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>24x7 Customer Helpdesk</span>
            </span>
          </div>
        </div>

        {/* Dynamic Booking & Search Engine Card */}
        <div className="mt-10">
          <BookingWidget
            vehicles={vehicles}
            pricingRules={pricingRules}
            onProceedToBooking={onProceedToBooking}
          />
        </div>

      </div>
    </section>
  );
};
