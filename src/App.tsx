/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { VehicleCard } from './components/VehicleCard';
import { TourCard } from './components/TourCard';
import { TourDetailModal } from './components/TourDetailModal';
import { FareCalculatorModal } from './components/FareCalculatorModal';
import { BookingModal } from './components/BookingModal';
import { ReviewModal } from './components/ReviewModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { TrackBookingModal } from './components/TrackBookingModal';
import { WhatsAppFloatingBtn } from './components/WhatsAppFloatingBtn';
import { ContactSection } from './components/ContactSection';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Vehicle, 
  TourPackage, 
  Review, 
  PricingRules 
} from './types';
import { 
  initVehiclesIfEmpty, 
  subscribeVehicles, 
  initPackagesIfEmpty, 
  subscribeTourPackages, 
  initReviewsIfEmpty, 
  subscribeApprovedReviews,
  getPricingRules,
  initDriversIfEmpty
} from './services/dbService';
import { BUSINESS_INFO, DEFAULT_PRICING_RULES } from './lib/constants';
import { 
  Car, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Calendar,
  Award,
  Users,
  HeartHandshake
} from 'lucide-react';

function MainApp() {
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Firestore Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_PRICING_RULES);

  // Active Modals State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<any>(null);

  const [isFareCalcModalOpen, setIsFareCalcModalOpen] = useState(false);
  const [fareCalcVehicle, setFareCalcVehicle] = useState<Vehicle | undefined>(undefined);

  const [selectedTourForDetail, setSelectedTourForDetail] = useState<TourPackage | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Initialization & Live Subscriptions
  useEffect(() => {
    // Initialise seed collections if empty
    initVehiclesIfEmpty();
    initPackagesIfEmpty();
    initReviewsIfEmpty();
    initDriversIfEmpty();

    // Subscribe
    const unsubVeh = subscribeVehicles(setVehicles);
    const unsubPkg = subscribeTourPackages(setPackages);
    const unsubRev = subscribeApprovedReviews(setReviews);
    getPricingRules().then(setPricingRules);

    return () => {
      unsubVeh();
      unsubPkg();
      unsubRev();
    };
  }, []);

  // Handlers
  const handleOpenBooking = (prefillData?: any) => {
    setBookingPrefill(prefillData || null);
    setIsBookingModalOpen(true);
  };

  const handleOpenFareCalc = (vehicle?: Vehicle) => {
    setFareCalcVehicle(vehicle);
    setIsFareCalcModalOpen(true);
  };

  const handleBookVehicleDirect = (veh: Vehicle) => {
    handleOpenBooking({
      vehicleId: veh.id,
      vehicleName: veh.name,
      vehicleCategory: veh.category,
    });
  };

  const handleBookTourDirect = (pkg: TourPackage) => {
    handleOpenBooking({
      tripType: 'package',
      packageId: pkg.id,
      packageName: pkg.title,
      dropCity: pkg.destination,
      totalDays: pkg.durationDays,
    });
  };

  // If in Admin Dashboard mode
  if (currentTab === 'admin') {
    return <AdminDashboard onExitAdmin={() => setCurrentTab('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Sticky Professional Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenBookingModal={handleOpenBooking}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        
        {/* ============================================================== */}
        {/* 1. HOME TAB */}
        {/* ============================================================== */}
        {currentTab === 'home' && (
          <div>
            {/* Hero & Interactive Search Widget */}
            <HeroSection
              vehicles={vehicles}
              pricingRules={pricingRules}
              onProceedToBooking={handleOpenBooking}
              onOpenFareCalcModal={() => handleOpenFareCalc()}
            />

            {/* Why Choose Advik Section */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>The Advik Promise</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                    Why Travel With Advik Tours & Travels?
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Over a decade of trusted intercity transportation with zero hidden charges and unmatched chauffeur courtesy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Verified Chauffeurs</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      All drivers undergo rigorous background checks, police verification, and possess over 5+ years of highway driving experience.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Transparent Odometer Billing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      No surprise surges. Transparent per-km rates with driver day allowance clearly declared upfront. Complete peace of mind.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Spotless Sanitized Fleet</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every car is thoroughly cleaned, vacuumed, and perfumed before reporting at your doorstep. Chilled AC on every highway ride.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Vehicle Fleet Preview */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      Our Sanitized Cabs
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                      Explore Fleet & Transparent Rates
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      From budget sedans to family Innova Crystas and luxury Tempo Travellers.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentTab('vehicles')}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 cursor-pointer"
                  >
                    <span>View All Vehicles ({vehicles.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.slice(0, 3).map((veh) => (
                    <VehicleCard
                      key={veh.id}
                      vehicle={veh}
                      onBookNow={handleBookVehicleDirect}
                      onOpenFareCalc={handleOpenFareCalc}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Popular Tour Packages Preview */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      Customized Holiday & Pilgrimage
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                      Featured Tour Packages
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      All-inclusive itineraries with private car, doorstep pickup, and flexible sightseeing stops.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentTab('packages')}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 cursor-pointer"
                  >
                    <span>View All Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.slice(0, 3).map((pkg) => (
                    <TourCard
                      key={pkg.id}
                      pkg={pkg}
                      onViewDetails={setSelectedTourForDetail}
                      onBookTour={handleBookTourDirect}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials on Home */}
            <section className="py-16 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Real Customer Reviews</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
                    What Our Travelers Say
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    Genuine feedback from families, solo travelers, and corporate executives who travel with Advik.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.slice(0, 3).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white block font-heading">{rev.customerName}</strong>
                          <span className="text-slate-400 text-[11px]">{rev.customerCity || 'Customer'}</span>
                        </div>
                        <span className="text-[10px] text-amber-400/90 font-medium">{rev.vehicleName}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide cursor-pointer transition-colors shadow-lg shadow-amber-500/20"
                  >
                    Share Your Own Experience
                  </button>
                </div>
              </div>
            </section>

            {/* Contact & Map Section on Home */}
            <ContactSection />
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. VEHICLES TAB */}
        {/* ============================================================== */}
        {currentTab === 'vehicles' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Fleet & Tariff Card
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                Our Fleet of Sanitized Vehicles
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Transparent per-kilometer billing with verified commercial chauffeurs. No surge pricing, ever.
              </p>
            </div>

            {/* Quick Fare Explainer Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-sm block">Transparent Pricing Policy:</span>
                <p className="text-slate-700">
                  • <strong>Sedans (4+1):</strong> ₹12/km | Min 300 km/day | Driver allowance ₹300/day.
                </p>
                <p className="text-slate-700">
                  • <strong>SUVs (6+1):</strong> ₹15/km | Min 300 km/day | Driver allowance ₹400/day.
                </p>
                <p className="text-slate-700">
                  • Toll, state tax permits and parking are extra at actuals. Night allowance (₹250) applies only between 10 PM and 6 AM.
                </p>
              </div>

              <button
                onClick={() => handleOpenFareCalc()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md whitespace-nowrap cursor-pointer transition-colors"
              >
                Open Fare Calculator
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((veh) => (
                <VehicleCard
                  key={veh.id}
                  vehicle={veh}
                  onBookNow={handleBookVehicleDirect}
                  onOpenFareCalc={handleOpenFareCalc}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. TOUR PACKAGES TAB */}
        {/* ============================================================== */}
        {currentTab === 'packages' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Custom Itineraries & Pilgrimages
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                All-Inclusive Holiday Tour Packages
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Doorstep pickup, skilled chauffeurs, and customized daily sightseeing. Enjoy worry-free travel with your loved ones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <TourCard
                  key={pkg.id}
                  pkg={pkg}
                  onViewDetails={setSelectedTourForDetail}
                  onBookTour={handleBookTourDirect}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. OUTSTATION TAB */}
        {/* ============================================================== */}
        {currentTab === 'outstation' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Intercity Round Trips & Multi-day Journeys
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                Outstation Cab Service
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Book clean AC cars for business trips, family vacations, wedding events, and pilgrim circuits with verified highway chauffeurs.
              </p>
            </div>

            {/* Direct Booking Widget configured for Outstation */}
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Plan your outstation trip with instant distance & fare estimates:</span>
                <span className="font-bold">Min 300 km/day billing</span>
              </div>

              {/* Direct Booking CTA */}
              <div className="p-8 bg-slate-900 rounded-3xl text-white text-center space-y-4">
                <h3 className="text-xl font-bold font-heading text-amber-400">
                  Ready to Book Your Outstation Journey?
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Instant confirmation with ₹12/km for Sedans and ₹15/km for SUVs. Doorstep pickup and drop.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleOpenBooking({ tripType: 'outstation_round' })}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
                  >
                    Book Outstation Cab Now
                  </button>
                  <button
                    onClick={() => handleOpenFareCalc()}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 cursor-pointer"
                  >
                    Calculate Fare
                  </button>
                </div>
              </div>
            </div>

            {/* Outstation Fleet Cards */}
            <div className="pt-6">
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-4">
                Recommended Outstation Fleet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.slice(0, 3).map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onBookNow={handleBookVehicleDirect}
                    onOpenFareCalc={handleOpenFareCalc}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. ONE WAY TAB */}
        {/* ============================================================== */}
        {currentTab === 'oneway' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Direct Intercity Drop & Airport Transfers
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                One-Way Intercity Drops
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Pay only for your one-way journey. No return fare charges on popular corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 font-heading">Why Choose Advik One-Way?</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                    <li>Doorstep pickup directly from your home, office or airport.</li>
                    <li>Transparent fixed distance billing with no extra return cab charge.</li>
                    <li>Fastag highway tolls handled effortlessly.</li>
                    <li>Guaranteed cab arrival at your scheduled departure time.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <span className="font-bold text-sm block">Popular One-Way Corridors:</span>
                  <p>Pune ➔ Mumbai Airport | Hubli ➔ Goa | Bangalore ➔ Mysore | Belgaum ➔ Kolhapur</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 text-center">
                <h3 className="text-lg font-bold font-heading text-amber-400">
                  Book One-Way Cab Now
                </h3>
                <p className="text-xs text-slate-300">
                  Tell us your pickup city and destination. We will dispatch the nearest sanitized cab.
                </p>
                <button
                  onClick={() => handleOpenBooking({ tripType: 'one_way' })}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Configure One-Way Drop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. ABOUT US TAB */}
        {/* ============================================================== */}
        {currentTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                About Advik Tours and Travels
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
                Reliable Travel. Comfortable Journeys.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Founded with a mission to bring reliability, punctuality, and transparent per-km billing to Indian highway travel, ADVIK TOURS AND TRAVELS is trusted by over 50,000+ satisfied passengers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Our Customer Ethos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We believe highway travel should be relaxing. From helping with luggage to driving smoothly on ghats and respecting senior citizens, our chauffeurs put hospitality first.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Safety & Fleet Standards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every car undergoes 25-point mechanical inspections, tire tread checks, and AC sanitization before long distance highway trips.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-heading">Nationwide Reach</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Headquartered with prime fleet centers in Karnataka and Maharashtra, connecting Hubli, Pune, Mumbai, Goa, Bangalore, Belgaum, and all major pilgrimage spots.
                </p>
              </div>
            </div>

            {/* Business Contact Cards */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-black font-heading text-amber-400">
                  Ready to experience the Advik difference?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Call our 24x7 travel managers directly or send a message on WhatsApp for instant cab allocation.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={`tel:${BUSINESS_INFO.phone1}`}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {BUSINESS_INFO.displayPhone1}</span>
                </a>
                <a
                  href={`tel:${BUSINESS_INFO.phone2}`}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {BUSINESS_INFO.displayPhone2}</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. REVIEWS TAB */}
        {/* ============================================================== */}
        {currentTab === 'reviews' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Verified Traveler Ratings
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                  Customer Reviews & Testimonials
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Real experiences from travelers across India who book with Advik Tours and Travels.
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-colors"
              >
                + Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{rev.customerName}</h4>
                      <span className="text-xs text-slate-500">{rev.customerCity || 'Verified Passenger'}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Trip: {rev.tripType}</span>
                    <span>Car: {rev.vehicleName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. CONTACT TAB */}
        {/* ============================================================== */}
        {currentTab === 'contact' && <ContactSection />}

        {/* ============================================================== */}
        {/* 9. MY BOOKINGS TAB */}
        {/* ============================================================== */}
        {currentTab === 'my-bookings' && (
          <MyBookingsView 
            onOpenBookingModal={handleOpenBooking}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={setCurrentTab}
        onOpenBookingModal={handleOpenBooking}
      />

      {/* Sticky Mobile Floating WhatsApp / Call Bar */}
      <WhatsAppFloatingBtn onOpenBookingModal={() => handleOpenBooking()} />

      {/* MODAL 1: Master Booking Checkout Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        vehicles={vehicles}
        pricingRules={pricingRules}
        prefill={bookingPrefill}
      />

      {/* MODAL 2: Dynamic Transparent Fare Calculator Modal */}
      <FareCalculatorModal
        isOpen={isFareCalcModalOpen}
        onClose={() => setIsFareCalcModalOpen(false)}
        vehicles={vehicles}
        pricingRules={pricingRules}
        selectedVehicle={fareCalcVehicle}
        onProceedToBooking={handleOpenBooking}
      />

      {/* MODAL 3: Tour Package Detail Modal */}
      <TourDetailModal
        pkg={selectedTourForDetail}
        onClose={() => setSelectedTourForDetail(null)}
        onBookTour={handleBookTourDirect}
      />

      {/* MODAL 4: Customer Review Submission */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* MODAL 5: Customer Sign-In / Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* MODAL 5B: Customer Profile & Cloud Firestore UID Management */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenMyBookings={() => {
          setCurrentTab('my-bookings');
          setIsProfileModalOpen(false);
        }}
      />

      {/* MODAL 6: Guest Booking Tracker */}
      <TrackBookingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
