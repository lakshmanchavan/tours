import React from 'react';
import { 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenBookingModal: (prefill?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBookingModal }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Verified Chauffeurs</h4>
              <p className="text-xs text-slate-400 mt-1">Background checked, police verified & courteous experienced highway drivers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">No Hidden Charges</h4>
              <p className="text-xs text-slate-400 mt-1">Transparent per-km pricing with clear driver allowances and no surge pricing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Sanitized AC Fleet</h4>
              <p className="text-xs text-slate-400 mt-1">Immaculate, sanitized sedans, luxury SUVs, and group Tempo Travellers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">24x7 Trip Support</h4>
              <p className="text-xs text-slate-400 mt-1">Round-the-clock emergency support, live monitoring, and breakdown assistance.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-heading tracking-tight">ADVIK</span>
                <span className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  TOURS AND TRAVELS
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              {BUSINESS_INFO.description}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{BUSINESS_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex gap-2">
                  <a href={`tel:${BUSINESS_INFO.phone1}`} className="hover:text-white transition-colors">{BUSINESS_INFO.displayPhone1}</a>
                  <span>/</span>
                  <a href={`tel:${BUSINESS_INFO.phone2}`} className="hover:text-white transition-colors">{BUSINESS_INFO.displayPhone2}</a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white transition-colors">{BUSINESS_INFO.email}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">{BUSINESS_INFO.workingHours}</span>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a 
                href={`tel:${BUSINESS_INFO.phone1}`} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                <Phone className="w-3 h-3" />
                <span>Call {BUSINESS_INFO.displayPhone1}</span>
              </a>
              <a 
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 text-xs font-semibold"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp Now</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide font-heading">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'home', label: 'Home' },
                { id: 'vehicles', label: 'Our Fleet & Pricing' },
                { id: 'packages', label: 'Holiday Tour Packages' },
                { id: 'outstation', label: 'Outstation Cabs' },
                { id: 'oneway', label: 'One Way Intercity Taxi' },
                { id: 'about', label: 'About Company' },
                { id: 'reviews', label: 'Customer Testimonials' },
                { id: 'contact', label: 'Contact & Office Location' },
                { id: 'my-bookings', label: 'Track My Booking' },
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-400 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Popular Taxi Routes */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide font-heading">Popular Routes</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                { from: 'Pune', to: 'Mumbai Airport', dist: '150 km' },
                { from: 'Pune', to: 'Shirdi Darshan', dist: '205 km' },
                { from: 'Hubli', to: 'Goa Beaches', dist: '155 km' },
                { from: 'Hubli', to: 'Bangalore City', dist: '415 km' },
                { from: 'Pune', to: 'Mahabaleshwar', dist: '120 km' },
                { from: 'Hubli', to: 'Belgaum Airport', dist: '98 km' },
                { from: 'Bangalore', to: 'Mysore & Coorg', dist: '255 km' },
                { from: 'Mumbai', to: 'Lonavala & Pune', dist: '150 km' },
              ].map((route, i) => (
                <li key={i}>
                  <button 
                    onClick={() => onOpenBookingModal({ pickupCity: route.from, dropCity: route.to, tripType: 'outstation_round' })}
                    className="hover:text-amber-400 transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                  >
                    <span>{route.from} to {route.to}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{route.dist}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Fleet & Policy */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide font-heading">Our Fleet & Rates</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span>Sedan (Dzire / Etios)</span>
                <span className="font-semibold text-amber-400">₹12 / km</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span>SUV (Ertiga 6+1)</span>
                <span className="font-semibold text-amber-400">₹15 / km</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span>Innova Crysta (7+1)</span>
                <span className="font-semibold text-amber-400">₹18 / km</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span>Tempo Traveller (12+1)</span>
                <span className="font-semibold text-amber-400">₹24 / km</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span>Tempo Traveller (17+1)</span>
                <span className="font-semibold text-amber-400">₹28 / km</span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-snug">
                <span className="font-semibold text-amber-300">Fare Policy:</span> Min 300 km/day. Driver allowance ₹300-₹600/day. Tolls, state tax & parking extra at actuals.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ADVIK TOURS AND TRAVELS. All Rights Reserved. Govt. Recognized Travel Operator.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GSTIN: {BUSINESS_INFO.gstin}</span>
            <span>•</span>
            <span>Safe & Sanitized Travel</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">Customer Support: {BUSINESS_INFO.displayPhone1}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
