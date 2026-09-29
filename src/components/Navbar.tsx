import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Car, 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  Search, 
  LogOut,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenBookingModal: (prefill?: any) => void;
  onOpenAuthModal: () => void;
  onOpenTrackModal: () => void;
  onOpenProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenBookingModal,
  onOpenAuthModal,
  onOpenTrackModal,
  onOpenProfileModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, logout, toggleAdminMode, isAdminOverride } = useAuth();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'packages', label: 'Tour Packages' },
    { id: 'outstation', label: 'Outstation' },
    { id: 'oneway', label: 'One Way' },
    { id: 'about', label: 'About Us' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
    { id: 'my-bookings', label: 'My Bookings' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top emergency contact & WhatsApp strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              24x7 Cab Booking & Customer Support:
            </span>
            <a 
              href={`tel:${BUSINESS_INFO.phone1}`} 
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{BUSINESS_INFO.displayPhone1}</span>
            </a>
            <span className="text-slate-600">|</span>
            <a 
              href={`tel:${BUSINESS_INFO.phone2}`} 
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{BUSINESS_INFO.displayPhone2}</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Advik%20Tours%20and%20Travels,%20I%20want%20to%20inquire%20about%20cab%20booking`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenTrackModal} 
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Booking</span>
            </button>
            <span className="text-slate-600">|</span>
            {/* Quick Admin Toggle / Status */}
            <button
              onClick={toggleAdminMode}
              title={isAdminOverride ? 'Admin preview enabled (Click to toggle)' : 'Switch to Admin View'}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{isAdmin ? 'Admin Mode (Active)' : 'Owner Access'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleLinkClick('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  ADVIK
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 tracking-wider">
                  TOURS & TRAVELS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Reliable Travel. Comfortable Journeys.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === link.id
                    ? 'text-amber-600 bg-amber-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => handleLinkClick('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Direct Call Button */}
            <a
              href={`tel:${BUSINESS_INFO.phone1}`}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold text-xs tracking-wide transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Now</span>
            </a>

            {/* Auth or Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenProfileModal ? onOpenProfileModal() : handleLinkClick('my-bookings')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200/60"
                  title="Manage Profile & UID"
                >
                  {profile?.photoURL || user.photoURL ? (
                    <img 
                      src={profile?.photoURL || user.photoURL || ''} 
                      alt="Avatar" 
                      className="w-5 h-5 rounded-full object-cover border border-amber-500" 
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className="max-w-[110px] truncate">{profile?.displayName || user.email?.split('@')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Primary Book Now CTA */}
            <button
              onClick={() => onOpenBookingModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-amber-600/25 hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Cab</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onOpenBookingModal()}
              className="px-3.5 py-2 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs"
            >
              Book Cab
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3 duration-200 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <a
              href={`tel:${BUSINESS_INFO.phone1}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Support</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-green-500 text-white text-xs font-bold shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentTab === link.id
                    ? 'text-amber-700 bg-amber-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => handleLinkClick('admin')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center justify-between bg-slate-900 text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Dashboard
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            <button
              onClick={() => {
                onOpenTrackModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-600 hover:bg-slate-50"
            >
              <Search className="w-4 h-4 text-amber-500" />
              <span>Track Booking Status</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenProfileModal) onOpenProfileModal();
                    else handleLinkClick('my-bookings');
                  }}
                  className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80"
                >
                  {profile?.photoURL || user.photoURL ? (
                    <img
                      src={profile?.photoURL || user.photoURL || ''}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-amber-500"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                      {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[150px]">
                      {profile?.displayName || user.email}
                    </span>
                    <span className="text-[10px] text-amber-600 font-medium">Manage Profile & UID</span>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs text-center"
              >
                Customer Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
