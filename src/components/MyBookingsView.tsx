import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  ShieldCheck, 
  FileText, 
  X, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { getUserBookings, updateBookingStatus, subscribeUserBookings } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { BookingVoucherModal } from './BookingVoucherModal';
import { BUSINESS_INFO } from '../lib/constants';

interface MyBookingsViewProps {
  onOpenBookingModal: (prefill?: any) => void;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ 
  onOpenBookingModal,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const { user, profile, loginWithGoogle } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    const list = await getUserBookings(user?.uid || 'guest');
    setBookings(list);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      const unsub = subscribeUserBookings(user.uid, (list) => {
        setBookings(list);
        setLoading(false);
      });
      return () => unsub();
    } else {
      loadBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking request?')) {
      await updateBookingStatus(bookingId, 'cancelled', 'Cancelled by customer via My Bookings');
      await loadBookings();
    }
  };

  const filtered = bookings.filter(b => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickupCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            My Bookings & Travel History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking, driver details, and downloadable trip vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBookings}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenBookingModal()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Car className="w-4 h-4" />
            <span>Book New Cab</span>
          </button>
        </div>
      </div>

      {/* User Auth & Firestore UID isolation status strip */}
      {user ? (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
          <div className="flex items-center gap-3">
            {profile?.photoURL || user.photoURL ? (
              <img
                src={profile?.photoURL || user.photoURL || ''}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover border border-amber-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center">
                {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {profile?.displayName || user.displayName || user.email}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Isolated UID: <span className="text-amber-400 font-semibold">{user.uid}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Manage Profile</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Sync & Protect Your Bookings with Google Sign-In
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sign in to securely isolate and query your trips from Cloud Firestore across all your devices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => loginWithGoogle()}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>

            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <span>Email Login</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, city, car..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex overflow-x-auto gap-1.5 w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'driver_assigned', label: 'Driver Assigned' },
            { id: 'completed', label: 'Completed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching your bookings from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">No Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven't made any bookings yet or none match your selected filter.
            </p>
          </div>
          <button
            onClick={() => onOpenBookingModal()}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-amber-600 transition-colors"
          >
            Plan Your Journey Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <div 
              key={b.id || b.bookingCode}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header with Booking ID & Status */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Booking ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{b.bookingCode}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    b.status === 'confirmed' || b.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'driver_assigned'
                      ? 'bg-blue-100 text-blue-800'
                      : b.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Route & Vehicle */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{b.pickupCity} ➔ {b.dropCity}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.pickupDate} at {b.pickupTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" />
                      <span>{b.vehicleName}</span>
                    </span>
                  </div>

                  {b.driverName && (
                    <div className="mt-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-bold block">Assigned Chauffeur</span>
                        <span className="font-bold text-slate-900">{b.driverName}</span>
                        {b.driverVehicleRegNumber && (
                          <span className="text-slate-500 ml-1 font-mono">({b.driverVehicleRegNumber})</span>
                        )}
                      </div>
                      {b.driverPhone && (
                        <a 
                          href={`tel:${b.driverPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Est. Fare</span>
                  <span className="text-base font-black text-amber-600 font-heading">
                    ₹{b.estimatedTotalFare?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedBookingForVoucher(b)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Voucher</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
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
