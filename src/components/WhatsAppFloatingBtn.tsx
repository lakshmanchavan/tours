import React from 'react';
import { Phone, MessageSquare, Car } from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';

interface WhatsAppFloatingBtnProps {
  onOpenBookingModal: () => void;
}

export const WhatsAppFloatingBtn: React.FC<WhatsAppFloatingBtnProps> = ({ onOpenBookingModal }) => {
  return (
    <>
      {/* Desktop Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex flex-col items-end gap-2.5">
        <a
          href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Advik%20Tours,%20I%20want%20to%20inquire%20about%20cab%20rates`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-600/30 font-bold text-xs transition-all hover:scale-105 active:scale-95 group"
          title="Chat with Advik Tours on WhatsApp"
        >
          <MessageSquare className="w-5 h-5 fill-white text-green-500" />
          <span className="tracking-wide">Chat with Advik</span>
        </a>
      </div>

      {/* Mobile Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2 sm:hidden flex items-center gap-2 shadow-2xl">
        <a
          href={`tel:${BUSINESS_INFO.phone1}`}
          className="flex-1 py-2.5 px-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call 24x7</span>
        </a>

        <a
          href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Advik%20Tours,%20I%20want%20to%20book%20a%20cab`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-2 rounded-xl bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <MessageSquare className="w-3.5 h-3.5 fill-white text-green-500" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={onOpenBookingModal}
          className="flex-1 py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Book Now</span>
        </button>
      </div>
    </>
  );
};
