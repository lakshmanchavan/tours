import { Vehicle, PricingRules, TripType } from '../types';

export interface FareCalculationResult {
  estimatedDistanceKm: number;
  chargeableKm: number;
  minKmTotal: number;
  ratePerKm: number;
  baseFare: number;
  driverAllowancePerDay: number;
  totalDriverAllowance: number;
  nightCharges: number;
  subTotal: number;
  gstAmount: number;
  grandTotal: number;
  advancePayable: number; // 20% advance booking deposit
  balanceAtTrip: number;
  totalDays: number;
  notes: string[];
}

export function calculateTripFare(
  vehicle: Vehicle,
  pricingRules: PricingRules,
  distanceOneWayKm: number,
  tripType: TripType,
  totalDays: number = 1,
  isNightTravel: boolean = false
): FareCalculationResult {
  const days = Math.max(1, totalDays);
  let totalTripDistance = distanceOneWayKm;

  if (tripType === 'outstation_round') {
    totalTripDistance = distanceOneWayKm * 2;
  } else if (tripType === 'local') {
    // For local, default to 80 km or 120 km minimum
    totalTripDistance = Math.max(80, distanceOneWayKm);
  } else if (tripType === 'one_way') {
    // One way outstation trips: standard formula accounts for return dead-mileage or flat rate
    // Often 1.5x to 1.8x or min 250-300 km depending on operator policy
    totalTripDistance = Math.max(250, distanceOneWayKm);
  }

  // Minimum chargeable KM per day (default 300 km/day)
  const minKmPerDay = vehicle.minKmPerDay || pricingRules.minKmPerDay || 300;
  const minKmTotal = minKmPerDay * days;
  const chargeableKm = Math.max(totalTripDistance, minKmTotal);

  const ratePerKm = vehicle.ratePerKm || 12;
  const baseFare = Math.round(chargeableKm * ratePerKm);

  // Driver allowance
  const driverAllowancePerDay = vehicle.driverAllowancePerDay || 300;
  const totalDriverAllowance = driverAllowancePerDay * days;

  // Night charges if travel touches 10 PM to 6 AM
  const nightCharges = isNightTravel ? (vehicle.nightCharge || 250) * days : 0;

  const subTotal = baseFare + totalDriverAllowance + nightCharges;
  const gstPercentage = pricingRules.gstPercentage || 5;
  const gstAmount = Math.round((subTotal * gstPercentage) / 100);
  const grandTotal = subTotal + gstAmount;

  // Advance deposit standard 20%
  const advancePayable = Math.round(grandTotal * 0.20);
  const balanceAtTrip = grandTotal - advancePayable;

  const notes = [
    `Minimum chargeable distance is ${minKmPerDay} km/day (${minKmTotal} km for ${days} day${days > 1 ? 's' : ''}).`,
    `Current rate: ₹${ratePerKm}/km for ${vehicle.name}.`,
    `Driver allowance: ₹${driverAllowancePerDay}/day included in calculation.`,
    'Toll taxes, state border permits, and parking fees are NOT included and will be paid at actuals during the journey.',
    'Final fare may vary based on actual route, trip requirements, and applicable odometer readings.',
  ];

  return {
    estimatedDistanceKm: Math.round(totalTripDistance),
    chargeableKm: Math.round(chargeableKm),
    minKmTotal,
    ratePerKm,
    baseFare,
    driverAllowancePerDay,
    totalDriverAllowance,
    nightCharges,
    subTotal,
    gstAmount,
    grandTotal,
    advancePayable,
    balanceAtTrip,
    totalDays: days,
    notes,
  };
}
