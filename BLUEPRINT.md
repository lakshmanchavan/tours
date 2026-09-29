# ADVIK TOURS AND TRAVELS - ARCHITECTURE & SPECIFICATION BLUEPRINT

## 1. Overview & Business Identity
- **Business Name**: ADVIK TOURS AND TRAVELS
- **Tagline**: Reliable Travel. Comfortable Journeys.
- **Primary Contacts**: +91 7760466777 / +91 7066651024
- **Headquarters / Base**: Hubli-Dharwad / Pune / Western & Southern India Corridors with nationwide intercity coverage.
- **Core Services**: Local Rentals, Outstation (Round Trip & Multi-day), One-Way Drops, Custom Holiday Tour Packages, Airport Transfers, Corporate Fleet.

---

## 2. User Roles & Access Control
1. **Public / Guest**:
   - Browse vehicles, tour packages, reviews, FAQs, company info.
   - Use dynamic fare calculator, route planner with distance calculation.
   - Submit booking inquiries / requests, contact form submissions.
   - Track booking status by Booking ID or phone number.
2. **Registered Customer (Authenticated via Firebase Auth - Email/Password, Google, Phone)**:
   - All Guest capabilities.
   - Access "My Bookings" with real-time status updates and trip vouchers.
   - Submit verified customer reviews for completed trips.
   - Make online advance payments and download invoices/vouchers.
   - Manage saved profile, addresses, emergency contacts.
3. **Administrator / Business Owner (Role: `admin` in Firestore / Auth)**:
   - Full access to Admin Dashboard.
   - Booking Management: Search, filter, approve/confirm/reject/cancel bookings, change trip status.
   - Resource Assignment: Assign vehicle and driver (with driver contact and license details).
   - Vehicle Fleet Management: Add, update rates, toggle availability, edit specs.
   - Tour Packages Management: Add/edit itineraries, pricing, images, inclusions.
   - Pricing Rules Engine: Set per-km rates, min km, night allowances, driver allowances, toll rules.
   - Reviews Moderation: Approve or reject customer reviews.
   - Customer Enquiries: Manage leads from contact and quote forms.
   - Financials: Track payments, revenue, pending dues, generate receipt vouchers.
   - System Audit Logs: Full traceability of status changes and resource assignments.

---

## 3. Database Schema & Firestore Collections

### Collection 1: `vehicles`
- **Document ID**: Auto-generated or slug (e.g., `swift-dzire`, `innova-crysta`, `tempo-traveller-12`)
- **Fields**:
  - `id`: string (doc ID)
  - `name`: string (e.g. "Swift Dzire / Toyota Etios")
  - `category`: string ("sedan" | "suv" | "tempo_traveller" | "luxury")
  - `capacityPassengers`: number (e.g., 4)
  - `capacityLuggage`: number (e.g., 3)
  - `acAvailable`: boolean (true)
  - `fuelType`: string ("Diesel" | "Petrol" | "CNG" | "Electric")
  - `ratePerKm`: number (e.g., 12 for sedan, 15 for suv)
  - `minKmPerDay`: number (e.g., 300)
  - `driverAllowancePerDay`: number (e.g., 300 for sedan, 400 for suv)
  - `nightCharge`: number (e.g., 250)
  - `image`: string (vehicle image URL)
  - `features`: array of strings (e.g., ["AC", "Music System", "Sanitized", "Fastag Enabled", "First Aid"])
  - `isAvailable`: boolean (true/false)
  - `status`: string ("active" | "maintenance" | "inactive")
  - `displayOrder`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
- **Relationships**: Referenced by `bookings.vehicleId` and `drivers.vehicleId`.
- **Permissions**:
  - Read: Public (anyone)
  - Create/Update/Delete: Admin only

### Collection 2: `tourPackages`
- **Document ID**: Auto-generated or slug (e.g., `goa-beach-bliss`, `shirdi-pilgrimage-2d`)
- **Fields**:
  - `id`: string
  - `title`: string
  - `destination`: string (e.g., "Goa", "Shirdi", "Mahabaleshwar", "Mysore-Coorg")
  - `durationDays`: number (e.g., 3)
  - `durationNights`: number (e.g., 2)
  - `startingPrice`: number (e.g., 8999)
  - `vehicleType`: string (e.g., "Sedan / SUV / Tempo")
  - `image`: string
  - `gallery`: array of strings
  - `description`: string
  - `placesCovered`: array of strings
  - `itinerary`: array of objects `[{ day: number, title: string, description: string }]`
  - `inclusions`: array of strings
  - `exclusions`: array of strings
  - `terms`: array of strings
  - `featured`: boolean
  - `status`: string ("active" | "inactive")
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
- **Permissions**:
  - Read: Public
  - Create/Update/Delete: Admin only

### Collection 3: `bookings`
- **Document ID**: Unique Booking ID (e.g., `ADV-2026-000101`)
- **Fields**:
  - `id`: string (matches doc ID)
  - `bookingCode`: string (e.g. `ADV-2026-000101`)
  - `userId`: string (Firebase Auth UID or "guest")
  - `customerName`: string
  - `customerPhone`: string
  - `customerEmail`: string
  - `tripType`: string ("local" | "outstation_round" | "one_way" | "package")
  - `packageId`: string (optional, if tour package)
  - `packageName`: string (optional)
  - `pickupCity`: string
  - `dropCity`: string
  - `pickupAddress`: string
  - `dropAddress`: string
  - `pickupDate`: string (YYYY-MM-DD)
  - `pickupTime`: string (HH:mm)
  - `returnDate`: string (optional, YYYY-MM-DD)
  - `returnTime`: string (optional)
  - `totalDays`: number (e.g., 1, 2, 3...)
  - `vehicleId`: string
  - `vehicleName`: string
  - `passengers`: number
  - `luggageCount`: number
  - `specialRequests`: string
  - `estimatedDistanceKm`: number
  - `chargeableKm`: number
  - `ratePerKm`: number
  - `baseFare`: number
  - `driverAllowance`: number
  - `estimatedTotalFare`: number
  - `finalAgreedFare`: number
  - `advanceAmount`: number
  - `balanceAmount`: number
  - `status`: string ("pending" | "confirmed" | "payment_pending" | "paid" | "driver_assigned" | "trip_started" | "completed" | "cancelled" | "rejected")
  - `paymentStatus`: string ("pending" | "partial" | "completed" | "refunded")
  - `paymentMethod`: string ("online_upi" | "card" | "cash_to_driver" | "netbanking")
  - `assignedDriverId`: string (optional)
  - `driverName`: string (optional)
  - `driverPhone`: string (optional)
  - `driverVehicleRegNumber`: string (optional)
  - `internalAdminNotes`: string (admin only)
  - `cancellationReason`: string (optional)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
- **Permissions**:
  - Read: Owner (`resource.data.userId == request.auth.uid` OR request with matching Booking Code & Phone for guest lookup) OR Admin.
  - Create: Anyone (guest or authenticated customer). Validated fields.
  - Update: Admin can update all fields; Customer can only cancel their own pending booking (`status: 'cancelled'`) if trip hasn't started.
  - Delete: Admin only.

### Collection 4: `drivers`
- **Document ID**: Auto-generated
- **Fields**:
  - `id`: string
  - `name`: string
  - `phone`: string
  - `alternatePhone`: string
  - `licenseNumber`: string
  - `vehicleAssigned`: string
  - `vehicleRegNumber`: string
  - `address`: string
  - `status`: string ("available" | "on_trip" | "off_duty")
  - `rating`: number
  - `totalTrips`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
- **Permissions**:
  - Read: Admin (or public display of assigned driver name/phone on confirmed booking voucher)
  - Create/Update/Delete: Admin only

### Collection 5: `payments`
- **Document ID**: Auto-generated transaction ID (e.g. `PAY-ADV-983142`)
- **Fields**:
  - `id`: string
  - `bookingId`: string
  - `bookingCode`: string
  - `userId`: string
  - `amount`: number
  - `currency`: string ("INR")
  - `paymentType`: string ("advance" | "full" | "balance")
  - `paymentMethod`: string ("upi" | "card" | "netbanking" | "wallet")
  - `gateway`: string ("razorpay" | "direct_upi")
  - `gatewayPaymentId`: string
  - `gatewayOrderId`: string
  - `status`: string ("success" | "pending" | "failed")
  - `customerName`: string
  - `customerPhone`: string
  - `createdAt`: timestamp
- **Permissions**:
  - Read: Customer owner of `userId` or Admin
  - Create: Authenticated customer or server gateway webhook
  - Update/Delete: Admin only

### Collection 6: `reviews`
- **Document ID**: Auto-generated
- **Fields**:
  - `id`: string
  - `customerName`: string
  - `customerCity`: string
  - `bookingCode`: string (optional)
  - `tripType`: string (e.g. "Outstation to Goa")
  - `vehicleName`: string
  - `rating`: number (1 to 5)
  - `comment`: string
  - `status`: string ("pending" | "approved" | "rejected")
  - `createdAt`: timestamp
- **Permissions**:
  - Read: Public can read documents where `status == "approved"`; Admin can read all.
  - Create: Anyone can create with default `status: "pending"`.
  - Update/Delete: Admin only.

### Collection 7: `enquiries`
- **Document ID**: Auto-generated
- **Fields**:
  - `id`: string
  - `name`: string
  - `phone`: string
  - `email`: string
  - `subject`: string
  - `tripType`: string
  - `message`: string
  - `status`: string ("new" | "contacted" | "converted" | "closed")
  - `notes`: string
  - `createdAt`: timestamp
- **Permissions**:
  - Read: Admin only
  - Create: Public (anyone)
  - Update/Delete: Admin only

### Collection 8: `pricingRules`
- **Document ID**: e.g., `default_rates`
- **Fields**:
  - `sedanRatePerKm`: number (12)
  - `suvRatePerKm`: number (15)
  - `tempoRatePerKm`: number (24)
  - `minKmPerDay`: number (300)
  - `sedanDriverAllowancePerDay`: number (300)
  - `suvDriverAllowancePerDay`: number (400)
  - `tempoDriverAllowancePerDay`: number (600)
  - `nightChargePerNight`: number (250)
  - `tollParkingPolicy`: string ("Excluded - to be paid at actuals")
  - `gstPercentage`: number (5)
  - `updatedAt`: timestamp
- **Permissions**:
  - Read: Public
  - Update: Admin only

### Collection 9: `auditLogs`
- **Document ID**: Auto-generated
- **Fields**:
  - `id`: string
  - `action`: string (e.g. "STATUS_CHANGE", "DRIVER_ASSIGNED", "PRICE_UPDATED")
  - `actorEmail`: string
  - `targetType`: string ("booking" | "vehicle" | "driver")
  - `targetId`: string
  - `details`: map / string
  - `timestamp`: timestamp
- **Permissions**: Admin only.

---

## 4. Booking & Double-Booking Prevention Logic
1. **Dynamic Availability Checking**:
   - Each booking has `pickupDate` and `returnDate` (or `pickupDate` + `totalDays`).
   - When a booking request is made, the system queries active bookings for the specified `vehicleId` (or vehicle category) whose trip range `[pickupDate, returnDate]` overlaps with the requested range and whose status is `['confirmed', 'driver_assigned', 'trip_started']`.
   - If all vehicles in that category are booked, the system alerts the customer: *"Selected vehicle is fully booked for these dates. Would you like to select an SUV or request manual allocation?"*
   - Furthermore, Admin manual confirmation workflow ensures that before any booking is marked as "Confirmed", the Admin checks fleet allocation and marks conflicting dates as blocked.

---

## 5. Payment Flow (Razorpay / UPI / Secure Card Mock & Gateway Ready)
1. Customer reviews calculated fare: Base KM Fare + Driver Allowance + GST.
2. Advance payment selection:
   - 20% advance booking deposit (standard Indian travel operator practice)
   - Or 100% full prepayment.
3. Secure modal opens with Indian payment gateway styling (UPI apps like GPay, PhonePe, Paytm, QR code, Debit/Credit Card, Net Banking).
4. On authorization, a verified payment record is stored in `payments`, booking is updated to `paid` or `confirmed`, and an official printable Voucher / Tax Invoice is generated with unique Booking Code (`ADV-2026-XXXXXX`).

---

## 6. Admin Workflow
1. Secure login (email/pass or Admin credential token).
2. Live Metrics: Total Bookings, Pending Action, Confirmed Trips, Revenue Collected, Unread Enquiries, Fleet Utilization.
3. Instant Actions: Confirm booking with 1-click, assign driver from pool, send WhatsApp confirmation link, update payment received.
4. CRUD controls for Vehicles, Packages, Pricing Rules, Customer Enquiries, and Testimonial Reviews.

---

## 7. Responsive Navigation Structure
- **Navbar**: Logo, Home, Vehicles, Tour Packages, Outstation, One Way, About Us, Reviews, Contact, My Bookings, Call & WhatsApp CTAs, Admin Portal access.
- **Mobile Drawer**: Easy touch targets, instant call/WhatsApp buttons, collapsible trip selectors.
- **Mobile Bottom Bar**: Sticky Quick Booking CTA, Direct Call (`tel:7760466777`), Direct WhatsApp (`wa.me/917760466777`).
