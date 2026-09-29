import React from 'react';
import { 
  Users, 
  Briefcase, 
  Wind, 
  Fuel, 
  ShieldCheck, 
  Check, 
  Calendar, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { Vehicle } from '../types';
import { BUSINESS_INFO } from '../lib/constants';

interface VehicleCardProps {
  vehicle: Vehicle;
  onBookNow: (vehicle: Vehicle) => void;
  onOpenFareCalc: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onBookNow,
  onOpenFareCalc,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* Vehicle Image Container */}
      <div className="relative h-52 sm:h-56 bg-slate-100 overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
          {vehicle.category.replace('_', ' ')}
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>Available Now</span>
        </div>

        {/* Starting Price Strip */}
        <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md text-white flex justify-between items-center shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Outstation Rate</span>
            <span className="text-lg font-black text-amber-400 font-heading">
              ₹{vehicle.ratePerKm} <span className="text-xs font-normal text-slate-300">/ km</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Min Distance</span>
            <span className="text-xs font-bold text-white">{vehicle.minKmPerDay} km / day</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Description */}
          <h3 className="text-xl font-black text-slate-900 font-heading group-hover:text-amber-600 transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {vehicle.description || 'Reliable, fully sanitized AC vehicle for smooth highway travel and city tours.'}
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span><strong>{vehicle.capacityPassengers} Passengers</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span>{vehicle.capacityLuggage} Large Bags</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span>Powerful Chilled AC</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-500" />
              <span>{vehicle.fuelType}</span>
            </div>
          </div>

          {/* Pricing Details Breakdown */}
          <div className="mt-3 bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Driver Allowance:</span>
              <span className="font-bold text-slate-900">₹{vehicle.driverAllowancePerDay} / day</span>
            </div>
            <div className="flex justify-between">
              <span>Night Charges (10 PM - 6 AM):</span>
              <span className="font-bold text-slate-900">₹{vehicle.nightCharge} / night</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px] pt-0.5">
              <span>Tolls & Parking:</span>
              <span>Extra at actuals</span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vehicle.features.slice(0, 4).map((f, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium"
              >
                <Check className="w-3 h-3 text-amber-600" />
                <span>{f}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onOpenFareCalc(vehicle)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-amber-600 font-bold text-xs transition-colors text-center cursor-pointer"
          >
            Calculate Fare
          </button>
          
          <button
            onClick={() => onBookNow(vehicle)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
