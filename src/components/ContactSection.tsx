import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Navigation
} from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';
import { submitEnquiry } from '../services/dbService';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tripType, setTripType] = useState('Outstation Cab Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide your name, phone number, and journey details.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        tripType,
        message: message.trim(),
      });
      setIsSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Could not submit inquiry. Please call 7760466777 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>24x7 Customer Helpdesk</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Contact Advik Tours & Travels
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Reach out for custom corporate travel, group wedding convoys, outstation cab reservations, or pilgrimage packages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Office Details */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Calling & WhatsApp Box */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5">
              <h3 className="text-lg font-bold font-heading text-amber-400">
                Direct Booking Helplines
              </h3>
              
              <div className="space-y-3">
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Primary Dispatch Line</span>
                    <span className="text-base font-bold text-white font-mono">{BUSINESS_INFO.displayPhone1}</span>
                  </div>
                </a>

                <a
                  href={`tel:${BUSINESS_INFO.phone2}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Secondary Helpline</span>
                    <span className="text-base font-bold text-white font-mono">{BUSINESS_INFO.displayPhone2}</span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Advik%20Tours,%20I%20need%20cab%20rates`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[11px] text-green-400 uppercase font-semibold block">Instant WhatsApp Chat</span>
                    <span className="text-base font-bold text-white font-mono">{BUSINESS_INFO.displayPhone1}</span>
                  </div>
                </a>
              </div>

              {/* Working Hours */}
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Operating Hours: <strong>{BUSINESS_INFO.workingHours}</strong></span>
              </div>
            </div>

            {/* Office Locations */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Head Office & Fleet Hub</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{BUSINESS_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="text-slate-700 hover:text-amber-600 font-medium font-mono">
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>

            {/* Simulated Google Maps View */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 h-52 relative">
              <iframe
                title="Advik Tours and Travels Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123114.73377757912!2d75.05943015509378!3d15.364708300000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d734e0689b1d%3A0xb52444d31481b499!2sHubballi%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                <Navigation className="w-3 h-3 text-amber-400" />
                <span>Advik Tours Operating Headquarters</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
            <h3 className="text-xl font-black text-slate-900 font-heading mb-1">
              Send Trip Inquiry / Request Callback
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in your planned travel dates and destination. Our travel manager will get back to you with custom discounted rates within 15 minutes.
            </p>

            {isSuccess ? (
              <div className="text-center py-10 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Inquiry Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you! Our operations coordinator will contact you via phone or WhatsApp shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Joshi"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Trip Requirement Type
                    </label>
                    <select
                      value={tripType}
                      onChange={e => setTripType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden"
                    >
                      <option value="Outstation Cab Inquiry">Outstation Cab (Round Trip)</option>
                      <option value="One Way Drop Inquiry">One Way Drop</option>
                      <option value="Holiday Tour Package">Holiday Tour Package</option>
                      <option value="Pilgrimage Circuit">Pilgrimage Circuit (Shirdi/Tirupati)</option>
                      <option value="Corporate / Wedding Bulk Booking">Corporate / Wedding Convoy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Planned Route, Dates & Passengers *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify pickup city, destination, tentative travel date, vehicle type preferred (Sedan/SUV/Tempo), and any specific requirements..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Send Travel Inquiry Now'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
