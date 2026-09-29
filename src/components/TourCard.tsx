import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Check, 
  Car, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { TourPackage } from '../types';

interface TourCardProps {
  pkg: TourPackage;
  onViewDetails: (pkg: TourPackage) => void;
  onBookTour: (pkg: TourPackage) => void;
}

export const TourCard: React.FC<TourCardProps> = ({
  pkg,
  onViewDetails,
  onBookTour,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* Tour Image */}
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {pkg.featured && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Best Seller</span>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
        </div>

        {/* Price Strip */}
        <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md text-white flex justify-between items-center shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Starting Package Price</span>
            <span className="text-xl font-black text-amber-400 font-heading">
              ₹{pkg.startingPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium">Per Cab / Group</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{pkg.destination}</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 font-heading mt-1 group-hover:text-amber-600 transition-colors">
            {pkg.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {pkg.description}
          </p>

          {/* Places Covered Tags */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Top Sightseeing Spots:
            </span>
            <div className="flex flex-wrap gap-1">
              {pkg.placesCovered.slice(0, 4).map((place, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                >
                  {place}
                </span>
              ))}
              {pkg.placesCovered.length > 4 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  +{pkg.placesCovered.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Vehicle & Key Inclusion */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>{pkg.vehicleType}</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Doorstep Pickup
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(pkg)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors text-center cursor-pointer"
          >
            View Itinerary
          </button>
          
          <button
            onClick={() => onBookTour(pkg)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Tour</span>
          </button>
        </div>

      </div>
    </div>
  );
};
