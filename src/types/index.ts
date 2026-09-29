export type TripType = 'local' | 'outstation_round' | 'one_way' | 'package';

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'payment_pending'
  | 'paid'
  | 'driver_assigned'
  | 'trip_started'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded';

export type VehicleCategory = 'sedan' | 'suv' | 'tempo_traveller' | 'luxury';

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  capacityPassengers: number;
  capacityLuggage: number;
  acAvailable: boolean;
  fuelType: string;
  ratePerKm: number;
  minKmPerDay: number;
  driverAllowancePerDay: number;
  nightCharge: number;
  image: string;
  features: string[];
  isAvailable: boolean;
  status: 'active' | 'maintenance' | 'inactive';
  displayOrder: number;
  description?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  startingPrice: number;
  vehicleType: string;
  image: string;
  gallery: string[];
  description: string;
  placesCovered: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  inclusions: string[];
  exclusions: string[];
  terms: string[];
  featured: boolean;
  status: 'active' | 'inactive';
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tripType: TripType;
  packageId?: string;
  packageName?: string;
  pickupCity: string;
  dropCity: string;
  pickupAddress: string;
  dropAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  totalDays: number;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: VehicleCategory;
  passengers: number;
  luggageCount: number;
  specialRequests?: string;
  estimatedDistanceKm: number;
  chargeableKm: number;
  ratePerKm: number;
  baseFare: number;
  driverAllowance: number;
  nightCharges?: number;
  tollEstimateNote?: string;
  estimatedTotalFare: number;
  finalAgreedFare?: number;
  advanceAmount: number;
  balanceAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  assignedDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicleRegNumber?: string;
  internalAdminNotes?: string;
  cancellationReason?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  licenseNumber: string;
  vehicleAssigned?: string;
  vehicleRegNumber?: string;
  address?: string;
  status: 'available' | 'on_trip' | 'off_duty';
  rating: number;
  totalTrips: number;
  createdAt?: any;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingCode: string;
  userId: string;
  amount: number;
  currency: string;
  paymentType: 'advance' | 'full' | 'balance';
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cash';
  gateway: 'razorpay' | 'upi_qr' | 'manual';
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  status: 'success' | 'pending' | 'failed';
  customerName: string;
  customerPhone: string;
  createdAt: any;
}

export interface Review {
  id: string;
  customerName: string;
  customerCity?: string;
  bookingCode?: string;
  tripType?: string;
  vehicleName?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  tripType?: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  notes?: string;
  createdAt: any;
}

export interface PricingRules {
  id?: string;
  sedanRatePerKm: number;
  suvRatePerKm: number;
  tempoRatePerKm: number;
  minKmPerDay: number;
  sedanDriverAllowancePerDay: number;
  suvDriverAllowancePerDay: number;
  tempoDriverAllowancePerDay: number;
  nightChargePerNight: number;
  tollParkingPolicy: string;
  gstPercentage: number;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  homeCity?: string;
  savedPickupAddress?: string;
  emergencyContact?: string;
  authProvider?: 'google' | 'password';
  createdAt?: any;
  updatedAt?: any;
}
