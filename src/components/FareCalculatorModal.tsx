import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Car, 
  MapPin, 
  Calendar, 
  Info, 
  Check, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Vehicle, PricingRules, TripType } from '../types';
import { POPULAR_CITIES, DEFAULT_PRICING_RULES } from '../lib/constants';
import { getEstimatedRouteDistance } from '../utils/routeDistance';
import { calculateTripFare } from '../utils/fareCalculator';

interface FareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  pricingRules?: PricingRules;
  selectedVehicle?: Vehicle;
  onProceedToBooking: (bookingData: any) => void;
}

export const FareCalculatorModal: React.FC<FareCalculatorModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  pricingRules = DEFAULT_PRICING_RULES,
  selectedVehicle,
  onProceedToBooking,
}) => {
  if (!isOpen) return null;

  const [tripType, setTripType] = useState<TripType>('outstation_round');
  const [pickupCity, setPickupCity] = useState('Pune');
  const [dropCity, setDropCity] = useState('Goa');
  const [days, setDays] = useState<number>(3);
  const [manualDistanceKm, setManualDistanceKm] = useState<number>(450);
  const [useAutoDistance, setUseAutoDistance] = useState<boolean>(true);
  const [isNightTravel, setIsNightTravel] = useState<boolean>(false);
  const [vehicleId, setVehicleId] = useState<string>(selectedVehicle?.id || vehicles[0]?.id || 'swift-dzire');

  // Auto calculate distance
  useEffect(() => {
    if (useAutoDistance) {
      getEstimatedRouteDistance(pickupCity, dropCity).then(res => {
        setManualDistanceKm(res.distanceKm);
      });
    }
  }, [pickupCity, dropCity, useAutoDistance]);

  const activeVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  const fareResult = calculateTripFare(
    activeVehicle,
    pricingRules,
    manualDistanceKm,
    tripType,
    days,
    isNightTravel
  );

  const handleBookWithCalculatedFare = () => {
    onClose();
    onProceedToBooking({
      tripType,
      pickupCity,
      dropCity,
      totalDays: days,
      vehicleId: activeVehicle.id,
      vehicleName: activeVehicle.name,
      vehicleCategory: activeVehicle.category,
      fareEstimate: fareResult,
      distanceKm: fareResult.estimatedDistanceKm,
      chargeableKm: fareResult.chargeableKm,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-heading">
                Dynamic Travel Fare Calculator
              </h3>
              <p className="text-xs text-slate-300">
                100% transparent pricing formula with no hidden markups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Trip Type Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'outstation_round', label: 'Outstation Round Trip' },
              { id: 'one_way', label: 'One Way Drop' },
              { id: 'local', label: 'Local City Ride' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTripType(tab.id as TripType)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tripType === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Vehicle Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Vehicle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVehicleId(v.id)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    v.id === vehicleId
                      ? 'border-amber-500 bg-amber-50/50 font-bold text-slate-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate">{v.name}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">₹{v.ratePerKm}/km</div>
                </button>
              ))}
            </div>
          </div>

          {/* City / Distance configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pickup City
              </label>
              <select
                value={pickupCity}
                onChange={e => setPickupCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
              >
                {POPULAR_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Drop / Destination City
              </label>
              <select
                value={dropCity}
                onChange={e => setDropCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
              >
                {POPULAR_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Days & Custom KM Override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trip Duration (Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={e => setDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">Day(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Estimated One-Way KM</span>
                <span className="text-[10px] text-amber-600 font-semibold cursor-pointer" onClick={() => setUseAutoDistance(!useAutoDistance)}>
                  {useAutoDistance ? 'Manual Edit' : 'Auto Route'}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  value={manualDistanceKm}
                  disabled={useAutoDistance}
                  onChange={e => setManualDistanceKm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden disabled:opacity-80"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">KM</span>
              </div>
            </div>
          </div>

          {/* Night charge checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isNightTravel}
              onChange={e => setIsNightTravel(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500"
            />
            <span>Include Night Travel Allowance (Trip touches 10:00 PM – 06:00 AM)</span>
          </label>

          {/* Detailed Calculations Breakdown Table */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exact Fare Calculation:
            </h4>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between pb-1 border-b border-slate-200/60">
                <span>Total Trip Distance:</span>
                <span className="font-semibold text-slate-900">{fareResult.estimatedDistanceKm} KM</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/60">
                <span>Minimum Chargeable Distance ({days} days @ {activeVehicle.minKmPerDay} km/day):</span>
                <span className="font-semibold text-slate-900">{fareResult.minKmTotal} KM</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/60">
                <span>Billed Chargeable KM:</span>
                <span className="font-bold text-amber-700">{fareResult.chargeableKm} KM</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/60">
                <span>Base KM Fare ({fareResult.chargeableKm} km × ₹{activeVehicle.ratePerKm}):</span>
                <span className="font-bold text-slate-900">₹{fareResult.baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/60">
                <span>Driver Day Allowance ({days} days × ₹{activeVehicle.driverAllowancePerDay}):</span>
                <span className="font-bold text-slate-900">₹{fareResult.totalDriverAllowance.toLocaleString('en-IN')}</span>
              </div>
              {isNightTravel && (
                <div className="flex justify-between pb-1 border-b border-slate-200/60 text-purple-700">
                  <span>Night Driving Charges:</span>
                  <span className="font-bold">₹{fareResult.nightCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pb-1 border-b border-slate-200/60 text-slate-500">
                <span>GST (5%):</span>
                <span>₹{fareResult.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-black text-slate-900 font-heading">
                <span>Estimated Total:</span>
                <span className="text-amber-600 text-xl font-bold">₹{fareResult.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Crucial Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Exclusions Notice:</span>
              </div>
              <p>
                Tolls, state entry permits, and airport/mall parking fees are strictly <strong>excluded</strong> and must be paid by the customer at actuals.
              </p>
              <p className="italic text-slate-600">
                "Final fare may vary based on actual route, trip requirements and applicable charges."
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Advance (20% to lock cab):</span>
            <span className="text-lg font-black text-emerald-600 font-heading">
              ₹{fareResult.advancePayable.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleBookWithCalculatedFare}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Proceed with this Fare</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
