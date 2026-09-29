import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Vehicle, 
  TourPackage, 
  Booking, 
  Driver, 
  PaymentRecord, 
  Review, 
  Enquiry, 
  PricingRules,
  BookingStatus,
  PaymentStatus,
  UserProfile,
} from '../types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_TOUR_PACKAGES, 
  INITIAL_REVIEWS, 
  DEFAULT_PRICING_RULES 
} from '../lib/constants';

// Helper to generate professional Indian Booking ID: ADV-2026-XXXXXX
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ADV-${year}-${randomNum}`;
}

// ---------------- VEHICLES ---------------- //

export async function initVehiclesIfEmpty(): Promise<Vehicle[]> {
  try {
    const colRef = collection(db, 'vehicles');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed initial fleet
      for (const veh of INITIAL_VEHICLES) {
        await setDoc(doc(db, 'vehicles', veh.id), {
          ...veh,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return INITIAL_VEHICLES;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Vehicle));
  } catch (err) {
    console.warn('Vehicles fetch error, returning fallback:', err);
    return INITIAL_VEHICLES;
  }
}

export function subscribeVehicles(callback: (vehicles: Vehicle[]) => void): () => void {
  try {
    const colRef = collection(db, 'vehicles');
    return onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        callback(INITIAL_VEHICLES);
      } else {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Vehicle));
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        callback(list);
      }
    }, (err) => {
      console.warn('Vehicles snapshot error:', err);
      callback(INITIAL_VEHICLES);
    });
  } catch (err) {
    callback(INITIAL_VEHICLES);
    return () => {};
  }
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  const docRef = doc(db, 'vehicles', vehicle.id);
  await setDoc(docRef, {
    ...vehicle,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await deleteDoc(doc(db, 'vehicles', vehicleId));
}

// ---------------- TOUR PACKAGES ---------------- //

export async function initPackagesIfEmpty(): Promise<TourPackage[]> {
  try {
    const colRef = collection(db, 'tourPackages');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const pkg of INITIAL_TOUR_PACKAGES) {
        await setDoc(doc(db, 'tourPackages', pkg.id), {
          ...pkg,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return INITIAL_TOUR_PACKAGES;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as TourPackage));
  } catch (err) {
    console.warn('Packages fetch error, returning fallback:', err);
    return INITIAL_TOUR_PACKAGES;
  }
}

export function subscribeTourPackages(callback: (packages: TourPackage[]) => void): () => void {
  try {
    const colRef = collection(db, 'tourPackages');
    return onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        callback(INITIAL_TOUR_PACKAGES);
      } else {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as TourPackage));
        callback(list);
      }
    }, () => callback(INITIAL_TOUR_PACKAGES));
  } catch {
    callback(INITIAL_TOUR_PACKAGES);
    return () => {};
  }
}

export async function saveTourPackage(pkg: TourPackage): Promise<void> {
  const docRef = doc(db, 'tourPackages', pkg.id);
  await setDoc(docRef, {
    ...pkg,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteTourPackage(pkgId: string): Promise<void> {
  await deleteDoc(doc(db, 'tourPackages', pkgId));
}

// ---------------- PRICING RULES ---------------- //

export async function getPricingRules(): Promise<PricingRules> {
  try {
    const docRef = doc(db, 'pricingRules', 'default_rates');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PricingRules;
    } else {
      await setDoc(docRef, {
        ...DEFAULT_PRICING_RULES,
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_PRICING_RULES;
    }
  } catch {
    return DEFAULT_PRICING_RULES;
  }
}

export async function updatePricingRules(rules: Partial<PricingRules>): Promise<void> {
  const docRef = doc(db, 'pricingRules', 'default_rates');
  await setDoc(docRef, {
    ...rules,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ---------------- BOOKINGS ---------------- //

export async function createBooking(data: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
  const bookingCode = generateBookingCode();
  const docRef = doc(db, 'bookings', bookingCode);
  
  const newBooking: Booking = {
    ...data,
    id: bookingCode,
    bookingCode,
    status: data.status || 'pending',
    paymentStatus: data.paymentStatus || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, {
      ...newBooking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Booking setDoc error, using local fallback:', err);
  }

  // Also save to local storage for instant guest retrieval
  try {
    const saved = JSON.parse(localStorage.getItem('advik_local_bookings') || '[]');
    saved.unshift(newBooking);
    localStorage.setItem('advik_local_bookings', JSON.stringify(saved.slice(0, 20)));
  } catch (e) {
    // Ignore localStorage error
  }

  return newBooking;
}

export function subscribeAllBookings(callback: (bookings: Booking[]) => void): () => void {
  try {
    const colRef = collection(db, 'bookings');
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
      // Sort newest first
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(list);
    }, (err) => {
      console.warn('All bookings snapshot error:', err);
      // Fallback to local bookings
      try {
        const saved = JSON.parse(localStorage.getItem('advik_local_bookings') || '[]');
        callback(saved);
      } catch {
        callback([]);
      }
    });
  } catch {
    return () => {};
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const results: Booking[] = [];
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const snap = await getDocs(q);
    snap.forEach(d => results.push({ ...d.data(), id: d.id } as Booking));
  } catch (e) {
    console.warn('Error fetching user bookings:', e);
  }

  // Merge with local storage bookings
  try {
    const local = JSON.parse(localStorage.getItem('advik_local_bookings') || '[]') as Booking[];
    for (const b of local) {
      if (!results.some(r => r.id === b.id || r.bookingCode === b.bookingCode)) {
        if (b.userId === userId || !b.userId || b.userId === 'guest') {
          results.push(b);
        }
      }
    }
  } catch {}

  results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return results;
}

export async function lookupBooking(bookingCode: string, phone: string): Promise<Booking | null> {
  const cleanCode = bookingCode.trim().toUpperCase();
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const docRef = doc(db, 'bookings', cleanCode);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Booking;
      const bPhone = (data.customerPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || bPhone.endsWith(cleanPhone) || cleanPhone.endsWith(bPhone)) {
        return { ...data, id: snap.id };
      }
    }
  } catch (err) {
    console.warn('Lookup booking error:', err);
  }

  // Check local cache
  try {
    const local = JSON.parse(localStorage.getItem('advik_local_bookings') || '[]') as Booking[];
    const found = local.find(b => b.bookingCode?.toUpperCase() === cleanCode);
    if (found) return found;
  } catch {}

  return null;
}

export async function updateBookingStatus(
  bookingId: string, 
  status: BookingStatus, 
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status,
      ...(notes ? { internalAdminNotes: notes } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Update booking status fallback:', e);
  }

  // Update in local cache as well
  try {
    const local = JSON.parse(localStorage.getItem('advik_local_bookings') || '[]') as Booking[];
    const idx = local.findIndex(b => b.id === bookingId || b.bookingCode === bookingId);
    if (idx !== -1) {
      local[idx].status = status;
      if (notes) local[idx].internalAdminNotes = notes;
      localStorage.setItem('advik_local_bookings', JSON.stringify(local));
    }
  } catch {}
}

export async function assignDriverToBooking(
  bookingId: string,
  driver: { id: string; name: string; phone: string; vehicleRegNumber?: string }
): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      assignedDriverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverVehicleRegNumber: driver.vehicleRegNumber || '',
      status: 'driver_assigned',
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Assign driver error:', e);
  }
}

export async function updateBookingPayment(
  bookingId: string,
  paymentStatus: PaymentStatus,
  advanceAmount: number,
  balanceAmount: number,
  method: string
): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      paymentStatus,
      advanceAmount,
      balanceAmount,
      paymentMethod: method,
      status: paymentStatus === 'completed' ? 'paid' : 'confirmed',
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Update payment error:', e);
  }
}

// ---------------- PAYMENTS ---------------- //

export async function recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<PaymentRecord> {
  const payId = `PAY-ADV-${Date.now().toString().slice(-6)}`;
  const record: PaymentRecord = {
    ...payment,
    id: payId,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'payments', payId), {
      ...record,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Payment record save fallback:', e);
  }

  return record;
}

// ---------------- REVIEWS ---------------- //

export async function initReviewsIfEmpty(): Promise<Review[]> {
  try {
    const colRef = collection(db, 'reviews');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), {
          ...rev,
          createdAt: serverTimestamp(),
        });
      }
      return INITIAL_REVIEWS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Review));
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function subscribeApprovedReviews(callback: (reviews: Review[]) => void): () => void {
  try {
    const q = query(collection(db, 'reviews'), where('status', '==', 'approved'));
    return onSnapshot(q, (snap) => {
      if (snap.empty) {
        callback(INITIAL_REVIEWS);
      } else {
        callback(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
      }
    }, () => callback(INITIAL_REVIEWS));
  } catch {
    callback(INITIAL_REVIEWS);
    return () => {};
  }
}

export function subscribeAllReviews(callback: (reviews: Review[]) => void): () => void {
  try {
    const colRef = collection(db, 'reviews');
    return onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        callback(INITIAL_REVIEWS);
      } else {
        callback(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
      }
    }, () => callback(INITIAL_REVIEWS));
  } catch {
    callback(INITIAL_REVIEWS);
    return () => {};
  }
}

export async function submitReview(data: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<void> {
  const revId = `rev-${Date.now()}`;
  await setDoc(doc(db, 'reviews', revId), {
    ...data,
    id: revId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { status });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

// ---------------- ENQUIRIES / CONTACT LEADS ---------------- //

export async function submitEnquiry(data: Omit<Enquiry, 'id' | 'status' | 'createdAt'>): Promise<void> {
  const enqId = `ENQ-${Date.now()}`;
  await setDoc(doc(db, 'enquiries', enqId), {
    ...data,
    id: enqId,
    status: 'new',
    createdAt: serverTimestamp(),
  });
}

export function subscribeEnquiries(callback: (enquiries: Enquiry[]) => void): () => void {
  try {
    const colRef = collection(db, 'enquiries');
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Enquiry));
      callback(list);
    }, () => callback([]));
  } catch {
    callback([]);
    return () => {};
  }
}

export async function updateEnquiryStatus(enquiryId: string, status: Enquiry['status'], notes?: string): Promise<void> {
  await updateDoc(doc(db, 'enquiries', enquiryId), {
    status,
    ...(notes ? { notes } : {}),
  });
}

// ---------------- DRIVERS ---------------- //

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Ramesh Naik',
    phone: '9845112233',
    alternatePhone: '9448001122',
    licenseNumber: 'KA-25-2018-009841',
    vehicleAssigned: 'Toyota Innova Crysta',
    vehicleRegNumber: 'KA 25 MB 4402',
    address: 'Gokul Road, Hubli',
    status: 'available',
    rating: 4.9,
    totalTrips: 342,
  },
  {
    id: 'drv-2',
    name: 'Sunil Shinde',
    phone: '9822334455',
    alternatePhone: '9860002233',
    licenseNumber: 'MH-12-2016-004312',
    vehicleAssigned: 'Maruti Suzuki Dzire',
    vehicleRegNumber: 'MH 12 QW 8901',
    address: 'Kothrud, Pune',
    status: 'available',
    rating: 4.8,
    totalTrips: 285,
  },
  {
    id: 'drv-3',
    name: 'Basavaraj Patil',
    phone: '9741223344',
    licenseNumber: 'KA-22-2019-001290',
    vehicleAssigned: 'Force Tempo Traveller (12+1)',
    vehicleRegNumber: 'KA 22 TA 6700',
    address: 'Khanapur Road, Belgaum',
    status: 'available',
    rating: 4.9,
    totalTrips: 410,
  },
];

export async function initDriversIfEmpty(): Promise<Driver[]> {
  try {
    const colRef = collection(db, 'drivers');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const d of INITIAL_DRIVERS) {
        await setDoc(doc(db, 'drivers', d.id), {
          ...d,
          createdAt: serverTimestamp(),
        });
      }
      return INITIAL_DRIVERS;
    }
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Driver));
  } catch {
    return INITIAL_DRIVERS;
  }
}

export function subscribeDrivers(callback: (drivers: Driver[]) => void): () => void {
  try {
    const colRef = collection(db, 'drivers');
    return onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        callback(INITIAL_DRIVERS);
      } else {
        callback(snap.docs.map(d => ({ ...d.data(), id: d.id } as Driver)));
      }
    }, () => callback(INITIAL_DRIVERS));
  } catch {
    callback(INITIAL_DRIVERS);
    return () => {};
  }
}

export async function saveDriver(driver: Driver): Promise<void> {
  const docRef = doc(db, 'drivers', driver.id);
  await setDoc(docRef, {
    ...driver,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeUserBookings(userId: string, callback: (bookings: Booking[]) => void): () => void {
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(list);
    }, (err) => {
      console.warn('User bookings snapshot warning:', err);
      getUserBookings(userId).then(callback);
    });
  } catch (err) {
    getUserBookings(userId).then(callback);
    return () => {};
  }
}

// ---------------- USER PROFILES ---------------- //

export async function getUserProfileDoc(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile doc:', err);
    return null;
  }
}

export async function updateUserProfileDoc(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeUserProfileDoc(uid: string, callback: (profile: UserProfile | null) => void): () => void {
  try {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    });
  } catch {
    return () => {};
  }
}

export async function deleteDriver(driverId: string): Promise<void> {
  await deleteDoc(doc(db, 'drivers', driverId));
}
