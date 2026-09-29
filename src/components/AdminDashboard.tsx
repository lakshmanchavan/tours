import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Users, 
  CreditCard, 
  Star, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  FileText, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  Booking, 
  Vehicle, 
  TourPackage, 
  Driver, 
  Review, 
  Enquiry, 
  PricingRules,
  BookingStatus,
  PaymentStatus
} from '../types';
import { 
  subscribeAllBookings, 
  subscribeVehicles, 
  saveVehicle, 
  deleteVehicle,
  subscribeTourPackages,
  saveTourPackage,
  deleteTourPackage,
  subscribeDrivers,
  saveDriver,
  deleteDriver,
  subscribeAllReviews,
  updateReviewStatus,
  deleteReview,
  subscribeEnquiries,
  updateEnquiryStatus,
  updateBookingStatus,
  assignDriverToBooking,
  updateBookingPayment,
  getPricingRules,
  updatePricingRules
} from '../services/dbService';
import { BUSINESS_INFO, DEFAULT_PRICING_RULES } from '../lib/constants';
import { BookingVoucherModal } from './BookingVoucherModal';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [currentSection, setCurrentSection] = useState<string>('overview');

  // Firestore Live Subscriptions
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRules>(DEFAULT_PRICING_RULES);

  // Modals & Active Selections
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverAssignBooking, setDriverAssignBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // Booking search and filter
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');

  // Subscribe to all live collections
  useEffect(() => {
    const unsubBookings = subscribeAllBookings(setBookings);
    const unsubVehicles = subscribeVehicles(setVehicles);
    const unsubPackages = subscribeTourPackages(setPackages);
    const unsubDrivers = subscribeDrivers(setDrivers);
    const unsubReviews = subscribeAllReviews(setReviews);
    const unsubEnquiries = subscribeEnquiries(setEnquiries);
    getPricingRules().then(setPricingRules);

    return () => {
      unsubBookings();
      unsubVehicles();
      unsubPackages();
      unsubDrivers();
      unsubReviews();
      unsubEnquiries();
    };
  }, []);

  // Compute Overview KPI Metrics
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending' || b.status === 'payment_pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'driver_assigned' || b.status === 'paid').length;
  const completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookingsCount = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;
  
  const totalRevenue = bookings.reduce((sum, b) => {
    return sum + (b.advanceAmount || 0) + (b.paymentStatus === 'completed' ? (b.balanceAmount || 0) : 0);
  }, 0);

  const pendingPaymentsTotal = bookings.reduce((sum, b) => {
    if (b.status === 'confirmed' || b.status === 'driver_assigned') {
      return sum + (b.balanceAmount || b.estimatedTotalFare);
    }
    return sum;
  }, 0);

  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;

  // Driver Assignment handler
  const handleAssignDriver = async () => {
    if (!driverAssignBooking || !selectedDriverId) return;
    const drv = drivers.find(d => d.id === selectedDriverId);
    if (!drv) return;

    await assignDriverToBooking(driverAssignBooking.id, {
      id: drv.id,
      name: drv.name,
      phone: drv.phone,
      vehicleRegNumber: drv.vehicleRegNumber,
    });

    setDriverAssignBooking(null);
    setSelectedDriverId('');
  };

  // Status Change handler
  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    const note = prompt('Optional internal note for this status change:') || undefined;
    await updateBookingStatus(bookingId, status, note);
  };

  // Pricing rules save
  const handleSavePricingRules = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePricingRules(pricingRules);
    alert('Global pricing rules saved successfully.');
  };

  // Vehicle save handler
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    await saveVehicle(editingVehicle);
    setEditingVehicle(null);
  };

  // Package save handler
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    await saveTourPackage(editingPackage);
    setEditingPackage(null);
  };

  // Driver save handler
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    await saveDriver(editingDriver);
    setEditingDriver(null);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
    const matchSearch = 
      b.bookingCode?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      b.customerPhone?.includes(bookingSearchTerm) ||
      b.pickupCity?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      b.dropCity?.toLowerCase().includes(bookingSearchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black font-heading shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-heading tracking-wide">ADVIK TRAVELS</div>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Operations</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
              { id: 'bookings', label: 'Manage Bookings', icon: Calendar, badge: pendingBookingsCount },
              { id: 'vehicles', label: 'Fleet & Pricing', icon: Car, badge: null },
              { id: 'packages', label: 'Tour Packages', icon: MapPin, badge: null },
              { id: 'drivers', label: 'Driver Pool', icon: Users, badge: null },
              { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: pendingReviewsCount },
              { id: 'enquiries', label: 'Inquiries & Leads', icon: MessageSquare, badge: newEnquiriesCount },
              { id: 'pricing', label: 'Pricing Formula', icon: DollarSign, badge: null },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit Button */}
        <div className="pt-6 border-t border-slate-800/80">
          <button
            onClick={onExitAdmin}
            className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ← Exit Admin Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        
        {/* SECTION 1: DASHBOARD OVERVIEW */}
        {currentSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-white font-heading">
                  Business Operations Center
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live trip updates, revenue metrics, driver status, and fleet performance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Logged in as Owner:</span>
                <span className="text-xs font-mono font-bold text-amber-400">{BUSINESS_INFO.adminEmail}</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Bookings</span>
                <div className="text-2xl font-black text-white font-heading">{totalBookingsCount}</div>
                <div className="text-[11px] text-amber-400 font-semibold">{pendingBookingsCount} Pending Review</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Confirmed / Active</span>
                <div className="text-2xl font-black text-emerald-400 font-heading">{confirmedBookingsCount}</div>
                <div className="text-[11px] text-slate-400">{completedBookingsCount} Completed Trips</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Recorded Revenue</span>
                <div className="text-2xl font-black text-amber-400 font-heading">₹{totalRevenue.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-slate-400">₹{pendingPaymentsTotal.toLocaleString('en-IN')} Balance to Collect</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/80 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Inquiries & Leads</span>
                <div className="text-2xl font-black text-blue-400 font-heading">{enquiries.length}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">{newEnquiriesCount} New Unread</div>
              </div>

            </div>

            {/* Recent Bookings Table Snapshot */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white font-heading">
                  Recent Booking Requests
                </h3>
                <button
                  onClick={() => setCurrentSection('bookings')}
                  className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  View All ({bookings.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Fare</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-slate-750">
                        <td className="p-3 font-mono font-bold text-white">{b.bookingCode}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <div className="text-slate-400 text-[11px]">{b.customerPhone}</div>
                        </td>
                        <td className="p-3">{b.pickupCity} ➔ {b.dropCity}</td>
                        <td className="p-3">{b.pickupDate}</td>
                        <td className="p-3">{b.vehicleName}</td>
                        <td className="p-3 font-bold text-amber-400">₹{b.estimatedTotalFare?.toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed' || b.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : b.status === 'driver_assigned'
                              ? 'bg-blue-500/20 text-blue-400'
                              : b.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedBookingForVoucher(b)}
                            className="p-1 hover:text-white text-slate-400 cursor-pointer"
                            title="View Voucher"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Fleet & Driver Status Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-white font-heading">Fleet Utilization</h4>
                  <button onClick={() => setCurrentSection('vehicles')} className="text-xs text-amber-400 hover:underline">Manage Fleet</button>
                </div>
                <div className="space-y-2">
                  {vehicles.slice(0, 3).map(v => (
                    <div key={v.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900/60">
                      <div>
                        <span className="font-bold text-white">{v.name}</span>
                        <span className="text-slate-400 ml-2">₹{v.ratePerKm}/km</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {v.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-white font-heading">Available Chauffeurs</h4>
                  <button onClick={() => setCurrentSection('drivers')} className="text-xs text-amber-400 hover:underline">Manage Drivers</button>
                </div>
                <div className="space-y-2">
                  {drivers.slice(0, 3).map(d => (
                    <div key={d.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900/60">
                      <div>
                        <span className="font-bold text-white">{d.name}</span>
                        <span className="text-slate-400 ml-2">({d.phone})</span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400">{d.vehicleRegNumber || 'On Duty'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: BOOKINGS MANAGER */}
        {currentSection === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white font-heading">Trip Bookings Management</h2>
                <p className="text-xs text-slate-400">Change statuses, assign vehicles & drivers, and manage payments.</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, phone..."
                    value={bookingSearchTerm}
                    onChange={e => setBookingSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500 text-white"
                  />
                </div>

                <select
                  value={bookingFilterStatus}
                  onChange={e => setBookingFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold outline-hidden text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="driver_assigned">Driver Assigned</option>
                  <option value="trip_started">Trip Started</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5">Booking ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Trip Route</th>
                      <th className="p-3.5">Schedule</th>
                      <th className="p-3.5">Vehicle</th>
                      <th className="p-3.5">Driver</th>
                      <th className="p-3.5">Fare & Pay</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-750">
                        <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                          {b.bookingCode}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <a href={`tel:${b.customerPhone}`} className="text-emerald-400 text-[11px] underline">
                            {b.customerPhone}
                          </a>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{b.pickupCity} ➔ {b.dropCity}</div>
                          <div className="text-[11px] text-slate-400">{b.tripType.replace('_', ' ')}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div>{b.pickupDate}</div>
                          <div className="text-slate-400 text-[11px]">{b.pickupTime}</div>
                        </td>
                        <td className="p-3.5">{b.vehicleName}</td>
                        <td className="p-3.5">
                          {b.driverName ? (
                            <div>
                              <span className="font-bold text-white">{b.driverName}</span>
                              <div className="text-[11px] text-slate-400">{b.driverPhone}</div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDriverAssignBooking(b)}
                              className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold cursor-pointer"
                            >
                              + Assign Driver
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-amber-400">₹{b.estimatedTotalFare?.toLocaleString('en-IN')}</div>
                          <span className={`text-[10px] font-bold uppercase ${
                            b.paymentStatus === 'completed' ? 'text-emerald-400' : 'text-amber-300'
                          }`}>
                            {b.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={b.status}
                            onChange={e => handleStatusChange(b.id, e.target.value as BookingStatus)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-white outline-hidden cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="payment_pending">Payment Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="paid">Paid</option>
                            <option value="driver_assigned">Driver Assigned</option>
                            <option value="trip_started">Trip Started</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedBookingForVoucher(b)}
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Print / View Voucher"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDriverAssignBooking(b)}
                              className="p-1.5 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Assign Driver"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: FLEET & PRICING RULES */}
        {currentSection === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white font-heading">Vehicle Fleet Management</h2>
                <p className="text-xs text-slate-400">Control per-km rates, driver allowances, minimum kilometers, and vehicle availability.</p>
              </div>

              <button
                onClick={() => setEditingVehicle({
                  id: `veh-${Date.now()}`,
                  name: '',
                  category: 'sedan',
                  capacityPassengers: 4,
                  capacityLuggage: 2,
                  acAvailable: true,
                  fuelType: 'Diesel',
                  ratePerKm: 12,
                  minKmPerDay: 300,
                  driverAllowancePerDay: 300,
                  nightCharge: 250,
                  image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
                  features: ['AC', 'Fastag', 'Clean & Sanitized'],
                  isAvailable: true,
                  status: 'active',
                  displayOrder: vehicles.length + 1,
                })}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Vehicle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(veh => (
                <div key={veh.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="h-36 rounded-xl overflow-hidden mb-3 bg-slate-900">
                      <img src={veh.image} alt={veh.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{veh.name}</h4>
                        <span className="text-[11px] text-amber-400 uppercase font-semibold">{veh.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        veh.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {veh.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-900/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rate per KM</span>
                        <strong className="text-amber-400">₹{veh.ratePerKm} / km</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Min. KM / Day</span>
                        <strong>{veh.minKmPerDay} km</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Driver Allowance</span>
                        <strong>₹{veh.driverAllowancePerDay} / day</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Capacity</span>
                        <strong>{veh.capacityPassengers}+1 Seater</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <button
                      onClick={() => setEditingVehicle(veh)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Rates</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete ${veh.name}?`)) deleteVehicle(veh.id);
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: TOUR PACKAGES MANAGER */}
        {currentSection === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white font-heading">Holiday Tour Packages</h2>
                <p className="text-xs text-slate-400">Create & customize multi-day tour itineraries, inclusions and package pricing.</p>
              </div>

              <button
                onClick={() => setEditingPackage({
                  id: `pkg-${Date.now()}`,
                  title: '',
                  destination: '',
                  durationDays: 3,
                  durationNights: 2,
                  startingPrice: 8999,
                  vehicleType: 'Sedan / SUV',
                  image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
                  gallery: [],
                  description: '',
                  placesCovered: [],
                  itinerary: [
                    { day: 1, title: 'Arrival & Sightseeing', description: 'Pickup and transfer.' },
                  ],
                  inclusions: ['Dedicated AC vehicle', 'Driver allowance'],
                  exclusions: ['Tolls & parking', 'Personal food'],
                  terms: ['20% advance required'],
                  featured: false,
                  status: 'active',
                })}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tour Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(p => (
                <div key={p.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="h-36 rounded-xl overflow-hidden mb-3 bg-slate-900">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                      <span className="text-xs font-bold text-amber-400 whitespace-nowrap ml-2">₹{p.startingPrice}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{p.destination}</span>
                      <span>•</span>
                      <span>{p.durationDays}D / {p.durationNights}N</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <button
                      onClick={() => setEditingPackage(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Package</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.title}?`)) deleteTourPackage(p.id);
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: DRIVERS POOL */}
        {currentSection === 'drivers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white font-heading">Chauffeur / Driver Pool</h2>
                <p className="text-xs text-slate-400">Driver profiles with licenses, phone numbers, and vehicle assignments.</p>
              </div>

              <button
                onClick={() => setEditingDriver({
                  id: `drv-${Date.now()}`,
                  name: '',
                  phone: '',
                  licenseNumber: '',
                  vehicleAssigned: '',
                  vehicleRegNumber: '',
                  status: 'available',
                  rating: 5.0,
                  totalTrips: 0,
                })}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map(d => (
                <div key={d.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{d.name}</h4>
                        <a href={`tel:${d.phone}`} className="text-emerald-400 text-xs font-mono font-bold">{d.phone}</a>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <div>License: <strong className="font-mono text-slate-200">{d.licenseNumber}</strong></div>
                      <div>Vehicle: <strong>{d.vehicleAssigned || 'Floating Fleet'}</strong></div>
                      <div>Reg No: <strong className="font-mono text-amber-400">{d.vehicleRegNumber || 'N/A'}</strong></div>
                      <div>Completed Trips: <strong>{d.totalTrips || 0}</strong> (★ {d.rating || 5.0})</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <button
                      onClick={() => setEditingDriver(d)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Driver</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove driver ${d.name}?`)) deleteDriver(d.id);
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: REVIEWS MODERATION */}
        {currentSection === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white font-heading">Customer Reviews Moderation</h2>
              <p className="text-xs text-slate-400">Only reviews approved by you will be displayed publicly on the website.</p>
            </div>

            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.customerName}</span>
                      <span className="text-xs text-slate-400">({rev.customerCity || 'Client'})</span>
                      <span className="text-xs font-bold text-amber-400">★ {rev.rating} / 5</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{rev.comment}</p>
                    <div className="text-[11px] text-slate-500">Trip: {rev.tripType} • Vehicle: {rev.vehicleName}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: INQUIRIES & LEADS */}
        {currentSection === 'enquiries' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white font-heading">Trip Inquiries & Leads</h2>
              <p className="text-xs text-slate-400">Customer requests submitted via website contact form.</p>
            </div>

            <div className="space-y-3">
              {enquiries.map(enq => (
                <div key={enq.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{enq.name}</span>
                      <a href={`tel:${enq.phone}`} className="text-emerald-400 text-xs font-mono font-bold underline">
                        {enq.phone}
                      </a>
                      {enq.email && <span className="text-xs text-slate-400">({enq.email})</span>}
                    </div>

                    <select
                      value={enq.status}
                      onChange={e => updateEnquiryStatus(enq.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-hidden cursor-pointer"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted to Booking</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl leading-relaxed">
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: PRICING FORMULA */}
        {currentSection === 'pricing' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-black text-white font-heading">Global Fare Calculation Formula</h2>
              <p className="text-xs text-slate-400">Update baseline per-km rates, daily driver allowances and tax configuration.</p>
            </div>

            <form onSubmit={handleSavePricingRules} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sedan Rate (₹/KM)</label>
                  <input
                    type="number"
                    value={pricingRules.sedanRatePerKm}
                    onChange={e => setPricingRules({ ...pricingRules, sedanRatePerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SUV Rate (₹/KM)</label>
                  <input
                    type="number"
                    value={pricingRules.suvRatePerKm}
                    onChange={e => setPricingRules({ ...pricingRules, suvRatePerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tempo Rate (₹/KM)</label>
                  <input
                    type="number"
                    value={pricingRules.tempoRatePerKm}
                    onChange={e => setPricingRules({ ...pricingRules, tempoRatePerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Minimum Chargeable KM / Day</label>
                  <input
                    type="number"
                    value={pricingRules.minKmPerDay}
                    onChange={e => setPricingRules({ ...pricingRules, minKmPerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GST Percentage (%)</label>
                  <input
                    type="number"
                    value={pricingRules.gstPercentage}
                    onChange={e => setPricingRules({ ...pricingRules, gstPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sedan Driver Allowance (₹/Day)</label>
                  <input
                    type="number"
                    value={pricingRules.sedanDriverAllowancePerDay}
                    onChange={e => setPricingRules({ ...pricingRules, sedanDriverAllowancePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SUV Driver Allowance (₹/Day)</label>
                  <input
                    type="number"
                    value={pricingRules.suvDriverAllowancePerDay}
                    onChange={e => setPricingRules({ ...pricingRules, suvDriverAllowancePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Toll & Parking Policy Notice</label>
                <input
                  type="text"
                  value={pricingRules.tollParkingPolicy}
                  onChange={e => setPricingRules({ ...pricingRules, tollParkingPolicy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wide cursor-pointer"
              >
                Save Global Pricing Configuration
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Driver Assignment Modal */}
      {driverAssignBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white font-heading">
                Assign Driver to {driverAssignBooking.bookingCode}
              </h3>
              <button onClick={() => setDriverAssignBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Trip: {driverAssignBooking.pickupCity} ➔ {driverAssignBooking.dropCity} on {driverAssignBooking.pickupDate} ({driverAssignBooking.vehicleName})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select Driver from Pool</label>
              <select
                value={selectedDriverId}
                onChange={e => setSelectedDriverId(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden"
              >
                <option value="">-- Choose Chauffeur --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone}) - {d.vehicleRegNumber || 'Ready'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDriverAssignBooking(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriverId}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white font-heading">
                {editingVehicle.id ? `Edit Vehicle: ${editingVehicle.name}` : 'Add New Fleet Vehicle'}
              </h3>
              <button onClick={() => setEditingVehicle(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vehicle Model / Name *</label>
                <input
                  type="text"
                  required
                  value={editingVehicle.name}
                  onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rate per KM (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingVehicle.ratePerKm}
                    onChange={e => setEditingVehicle({ ...editingVehicle, ratePerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Min KM per Day</label>
                  <input
                    type="number"
                    value={editingVehicle.minKmPerDay}
                    onChange={e => setEditingVehicle({ ...editingVehicle, minKmPerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Driver Allowance / Day (₹)</label>
                  <input
                    type="number"
                    value={editingVehicle.driverAllowancePerDay}
                    onChange={e => setEditingVehicle({ ...editingVehicle, driverAllowancePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Night Charge (₹)</label>
                  <input
                    type="number"
                    value={editingVehicle.nightCharge}
                    onChange={e => setEditingVehicle({ ...editingVehicle, nightCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    value={editingVehicle.capacityPassengers}
                    onChange={e => setEditingVehicle({ ...editingVehicle, capacityPassengers: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={editingVehicle.category}
                    onChange={e => setEditingVehicle({ ...editingVehicle, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="sedan">Sedan (4+1)</option>
                    <option value="suv">SUV (6+1 / 7+1)</option>
                    <option value="tempo_traveller">Tempo Traveller</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingVehicle.image}
                  onChange={e => setEditingVehicle({ ...editingVehicle, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Save Vehicle Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white font-heading">
                {editingDriver.name ? `Edit Chauffeur: ${editingDriver.name}` : 'Register New Chauffeur'}
              </h3>
              <button onClick={() => setEditingDriver(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={editingDriver.name}
                  onChange={e => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={editingDriver.phone}
                  onChange={e => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Driving License Number *</label>
                <input
                  type="text"
                  required
                  value={editingDriver.licenseNumber}
                  onChange={e => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  value={editingDriver.vehicleRegNumber || ''}
                  onChange={e => setEditingDriver({ ...editingDriver, vehicleRegNumber: e.target.value })}
                  placeholder="e.g. KA 25 MB 4402"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Availability Status</label>
                <select
                  value={editingDriver.status}
                  onChange={e => setEditingDriver({ ...editingDriver, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Save Driver Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Voucher modal */}
      <BookingVoucherModal
        isOpen={!!selectedBookingForVoucher}
        onClose={() => setSelectedBookingForVoucher(null)}
        booking={selectedBookingForVoucher}
      />

    </div>
  );
};
