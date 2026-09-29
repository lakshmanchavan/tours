import React, { useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Check, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { TripType, Vehicle, PricingRules } from '../types';
import { POPULAR_CITIES, DEFAULT_PRICING_RULES } from '../lib/constants';
import { getEstimatedRouteDistance } from '../utils/routeDistance';
import { calculateTripFare } from '../utils/fareCalculator';

interface BookingWidgetProps {
  vehicles: Vehicle[];
  pricingRules?: PricingRules;
  onProceedToBooking: (bookingData: any) => void;
  defaultTripType?: TripType;
  className?: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  vehicles,
  pricingRules = DEFAULT_PRICING_RULES,
  onProceedToBooking,
  defaultTripType = 'outstation_round',
  className = '',
}) => {
  const [tripType, setTripType] = useState<TripType>(defaultTripType);
  const [pickupCity, setPickupCity] = useState('Pune');
  const [dropCity, setDropCity] = useState('Goa');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('06:00');
  const [returnDate, setReturnDate] = useState(() => {
    const afterTomorrow = new Date();
    afterTomorrow.setDate(afterTomorrow.getDate() + 3);
    return afterTomorrow.toISOString().split('T')[0];
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('swift-dzire');
  const [passengers, setPassengers] = useState<number>(4);

  // Autocomplete suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDropList, setShowDropList] = useState(false);

  // Route & Fare calculation
  const [distanceKm, setDistanceKm] = useState<number>(150);
  const [durationText, setDurationText] = useState<string>('3 hrs 30 mins');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Sync selected vehicle if vehicles load
  useEffect(() => {
    if (vehicles.length > 0 && !vehicles.some(v => v.id === selectedVehicleId)) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Recalculate distance when cities change
  useEffect(() => {
    let isCurrent = true;
    setIsCalculatingDistance(true);
    
    getEstimatedRouteDistance(pickupCity, dropCity).then((res) => {
      if (isCurrent) {
        setDistanceKm(res.distanceKm);
        setDurationText(res.durationText);
        setIsCalculatingDistance(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [pickupCity, dropCity]);

  // Calculate days between dates
  const calculateTotalDays = (): number => {
    if (tripType === 'one_way' || tripType === 'local') return 1;
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start & end day
    return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
  };

  const totalDays = calculateTotalDays();
  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || {
    id: 'swift-dzire',
    name: 'Maruti Suzuki Dzire',
    category: 'sedan',
    ratePerKm: 12,
    minKmPerDay: 300,
    driverAllowancePerDay: 300,
    nightCharge: 250,
  } as Vehicle;

  const fareEstimate = calculateTripFare(
    activeVehicle,
    pricingRules,
    distanceKm,
    tripType,
    totalDays
  );

  const handleCityInput = (val: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupCity(val);
      if (val.length > 0) {
        setPickupSuggestions(POPULAR_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())));
        setShowPickupList(true);
      } else {
        setShowPickupList(false);
      }
    } else {
      setDropCity(val);
      if (val.length > 0) {
        setDropSuggestions(POPULAR_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())));
        setShowDropList(true);
      } else {
        setShowDropList(false);
      }
    }
  };

  const handleSelectCity = (city: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupCity(city);
      setShowPickupList(false);
    } else {
      setDropCity(city);
      setShowDropList(false);
    }
  };

  const handleProceed = () => {
    onProceedToBooking({
      tripType,
      pickupCity,
      dropCity,
      pickupDate,
      pickupTime,
      returnDate: tripType === 'outstation_round' ? returnDate : undefined,
      totalDays,
      vehicleId: activeVehicle.id,
      vehicleName: activeVehicle.name,
      vehicleCategory: activeVehicle.category,
      passengers,
      distanceKm: fareEstimate.estimatedDistanceKm,
      chargeableKm: fareEstimate.chargeableKm,
      fareEstimate,
    });
  };

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ${className}`}>
      {/* Trip Type Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-1.5 overflow-x-auto">
        {[
          { id: 'outstation_round', label: 'Outstation Round Trip', icon: Compass },
          { id: 'one_way', label: 'One Way Drop', icon: ArrowRight },
          { id: 'local', label: 'Local City Rental', icon: Car },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tripType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTripType(tab.id as TripType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Row 1: Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* Pickup City */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pickup Location / City
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input
                type="text"
                value={pickupCity}
                onChange={(e) => handleCityInput(e.target.value, true)}
                onFocus={() => setShowPickupList(true)}
                placeholder="Enter pickup city (e.g. Pune, Hubli, Bangalore)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-slate-900 transition-all outline-hidden"
              />
            </div>

            {/* Suggestions dropdown */}
            {showPickupList && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Hubs & Airports
                </div>
                {(pickupSuggestions.length > 0 ? pickupSuggestions : POPULAR_CITIES).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city, true)}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{city}</span>
                    <span className="text-[10px] text-slate-400">Available</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drop City */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {tripType === 'local' ? 'Local Destination / Sightseeing' : 'Drop Location / City'}
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
              <input
                type="text"
                value={dropCity}
                onChange={(e) => handleCityInput(e.target.value, false)}
                onFocus={() => setShowDropList(true)}
                placeholder={tripType === 'local' ? 'E.g. Full City Sightseeing / 80 KM' : 'Enter destination city (e.g. Goa, Shirdi)'}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-slate-900 transition-all outline-hidden"
              />
            </div>

            {showDropList && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Tourist Destinations
                </div>
                {(dropSuggestions.length > 0 ? dropSuggestions : POPULAR_CITIES).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city, false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{city}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Instant Route</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Dates & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pickup Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 text-xs font-semibold text-slate-900 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pickup Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 text-xs font-semibold text-slate-900 outline-hidden"
              />
            </div>
          </div>

          {tripType === 'outstation_round' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Return Date ({totalDays} Days)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  min={pickupDate}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 text-xs font-semibold text-slate-900 outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Passengers
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 text-xs font-semibold text-slate-900 outline-hidden"
              >
                <option value={1}>1 Passenger</option>
                <option value={2}>2 Passengers</option>
                <option value={3}>3 Passengers</option>
                <option value={4}>4 Passengers (Sedan)</option>
                <option value={6}>6 Passengers (SUV/Ertiga)</option>
                <option value={7}>7 Passengers (Innova Crysta)</option>
                <option value={12}>12 Passengers (Tempo 12+1)</option>
                <option value={17}>17 Passengers (Tempo 17+1)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Row 3: Vehicle Selection Chips */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Vehicle Category
            </label>
            <span className="text-[11px] text-slate-500">
              Clean AC Cabs with Verified Highway Drivers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {vehicles.slice(0, 4).map((veh) => {
              const isSelected = veh.id === selectedVehicleId;
              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicleId(veh.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="text-xs font-bold text-slate-900 truncate pr-5">
                    {veh.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {veh.capacityPassengers}+1 Seater • AC
                  </div>
                  <div className="mt-2 text-sm font-black text-amber-600 font-heading">
                    ₹{veh.ratePerKm} <span className="text-[11px] font-normal text-slate-500">/ km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fare Calculation & Summary Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Route Stats */}
            <div className="space-y-1 md:border-r border-slate-700/80 pr-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Estimated Highway Route</span>
              </div>
              <div className="text-lg font-bold text-white font-heading">
                {pickupCity} ➔ {dropCity}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Dist: <strong className="text-white">{fareEstimate.estimatedDistanceKm} KM</strong></span>
                <span>•</span>
                <span>Time: <strong className="text-white">{durationText}</strong></span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1 md:border-r border-slate-700/80 pr-4">
              <div className="text-xs text-slate-400">
                Transparent Fare Breakdown:
              </div>
              <div className="text-xs text-slate-300 space-y-0.5">
                <div className="flex justify-between">
                  <span>Base Rate ({fareEstimate.chargeableKm} km @ ₹{activeVehicle.ratePerKm}/km):</span>
                  <span className="font-semibold text-white">₹{fareEstimate.baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Allowance ({totalDays} day{totalDays > 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-white">₹{fareEstimate.totalDriverAllowance.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="text-[11px] text-amber-300/90 pt-1">
                *Tolls & parking paid at actuals during journey.
              </div>
            </div>

            {/* Total Fare & CTA */}
            <div className="flex flex-col sm:flex-row md:flex-col justify-between md:justify-center items-start md:items-end gap-3">
              <div>
                <div className="text-xs text-slate-400 font-medium md:text-right">
                  Estimated Total ({totalDays} Day{totalDays > 1 ? 's' : ''}):
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-heading md:text-right">
                  ₹{fareEstimate.grandTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400 md:text-right font-medium">
                  Pay only ₹{fareEstimate.advancePayable.toLocaleString('en-IN')} (20%) to confirm
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
              >
                <span>Book Cab Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
