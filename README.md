# 🏟️ TurfBook - Premium Sports Turf Booking Platform

TurfBook is a modern, high-end MERN (MongoDB, Express, React, Node.js) SaaS application designed for sports turf booking, venue management, and scheduling. It features a stunning visual layout, real-time concurrency slot-locking via WebSockets, online payment flow integration, and a comprehensive Partner/Owner dashboard to manage venues, operating hours, slot pricing, and earnings payouts.

---

## 🚀 Key Features

### 👤 User Portal (Client Front-End)
* **Premium Design Aesthetics**: Tailored color palette featuring `#AAEE00` (Neon Lime Green), `#1A1A1A` (Near Black), `#FFD700` (Gold), and rich dark mode widgets aligned with modern premium sports branding.
* **Redesigned Turf Detail View**: 
  * Responsive, structured image gallery featuring a bottom-gradient overlay, cover photo indicators, and "+X More Photo" badges.
  * Sticky sub-navigation bar tracking Overview, Amenities, Reviews, and Location dynamically.
  * Beautiful clock & clock-pulse badges indicating `"Open Now"` or `"Closed"` status based on operating hours.
  * **Sport Selector Dropdown**: Custom dark selector with automatic deduplication of unique sport offers and outside-click auto-close.
* **Checkout & Booking Summary**: Smooth payment confirmation flows utilizing animated step-wizards via Framer Motion.

### 🔌 Real-Time Concurrency (WebSockets)
* **Double Booking Prevention**:
  * As soon as a user clicks a slot to checkout, a **`lock-slot`** WebSocket event is triggered, locking the slot for **5 minutes** in the database.
  * Serves as an atomic lock, broadcasting a **`slot-locked`** socket event to all online clients in that specific turf room, disabling selection for others.
  * Releases instantly on transaction cancellation/dismissal via **`unlock-slot`** or upon lock expiry.
  * Once the Razorpay payment is validated, a **`slot-booked`** event is broadcasted, converting the lock into a permanent booked state real-time.

### 🏢 Partner Desk (Owner Dashboard)
* **Logo & PRO Account Branding**: Redesigned dark-themed sidebar (`#12141C`) matching professional manager mockups.
* **My Arenas Sub-Dashboard**:
  * **Live Cover Header**: Visual cover banner with gradient filters, stars, reviews, and quick live preview links.
  * **Performance Metrics**: Analytical tiles tracking Total Bookings (+12% ↑ trend), Revenue (+8% ↑ trend), Ratings, and Occupancy Rate.
  * **Tabbed Controls**: Overview, Pricing, Slots & Availability (with integrated schedule builders), Bookings ledger, Reviews, and Settings.
  * **Floating Changes Footer**: Bottom drawer warning users of unsaved edits with instant `"Discard"` or `"Save Changes"` options.
  * **Listing Duplication**: Clones existing turf properties into pending drafts with one click.

### 🛡️ Robust Backend Server
* **Sanitized Queries & Inputs**: Automatic `escapeRegExp` utility wrapping on City and Search parameters to prevent regular expression query injection crashes.
* **Input Validation Guards**: Mongoose CastErrors and range check failures are prevented via validation guards checking for valid ObjectIds and Date timestamps before hitting database transactions.
* **Standalone MongoDB Fallback**:
  * Startup script queries replica-set metadata to dynamically toggle transaction sessions.
  * Gracefully falls back to single-document updates when transactions are unsupported on local standalone instances, avoiding MongoDB transaction errors in development setups.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js (v18), Redux Toolkit (State Management), TailwindCSS, Framer Motion (Animations), Lucide React (Icons), Socket.io-client |
| **Backend** | Node.js (ESM Module), Express.js, Socket.io, JSON Web Token (JWT), bcryptjs, express-rate-limit, express-mongo-sanitize, hpp |
| **Database** | MongoDB, Mongoose ODM (Data modeling) |
| **SaaS Services** | Razorpay SDK (Payments), Twilio (SMS/Notifications), Cloudinary (Image Hosting) |

---

## 📁 Project Structure

```
turfbook/
├── package.json               # Root scripts to install and run client & server concurrently
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI widgets & selectors
│   │   ├── hooks/             # useSocket and state hooks
│   │   ├── pages/
│   │   │   ├── owner/         # Owner Dashboard pages (OwnerDashboard.jsx)
│   │   │   └── public/        # Public listing & detail pages (TurfDetail.jsx)
│   │   ├── services/          # api.js Axios configuration & request methods
│   │   ├── store/             # Redux Slice setup (authSlice, bookingSlice)
│   │   ├── App.jsx            # React client routing
│   │   └── main.jsx           # App entrypoint
│   └── vite.config.js         # Client proxy configs to forward requests to 127.0.0.1:5001
└── server/                    # Express Node Backend
    ├── config/                # db.js connection & transaction flags setup
    ├── controllers/           # auth, turf, booking, payment, and admin logics
    ├── models/                # MongoDB Schema specifications (User, Turf, Booking)
    ├── routes/                # api.js endpoint mapping
    ├── utils/                 # socket.js events and slotGenerator.js builders
    ├── .env                   # Environment variables configurations
    ├── seed.js                # Database seeder script
    └── server.js              # Server bootstrapper
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

### Installation & Set Up

1. **Install Dependencies** (from root directory):
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory and configure the variables:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/turfbook
   JWT_SECRET=secret_key_tb_123
   CLOUDINARY_URL=your_cloudinary_url
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

3. **Seed Default Database Data**:
   Navigate to the `server/` directory and run the seeder:
   ```bash
   cd server
   node seed.js
   ```
   *This seeds mock users, admins, turfs, and availability slots for testing.*
   
   **Default Login Accounts:**
   * **Admin User**: `admin@turfbook.com` / `Admin@123`
   * **Owner User**: `rahul@owner.com` / `  `
   * **Regular User**: `kabir@gmail.com` / `User@123`

---

## 🏃 Running the Application

To run both client and server concurrently from the root folder:

* **Start Backend Server** (starts on port `5001`):
  ```bash
  npm run dev:server
  ```
  *(Launches using Node.js file watcher: `node --watch server.js`)*

* **Start Frontend Client** (starts on port `5173`):
  ```bash
  npm run dev:client
  ```

Once both servers are running:
* Frontend Client: `http://localhost:5173/`
* Backend API Server: `http://127.0.0.1:5001/`
* Health Check: `http://127.0.0.1:5001/health`

---

## 🎯 Verification Checks
* **Health Check Endpoint**: Hitting `http://127.0.0.1:5001/health` should return `{"status":"active"}`.
* **Safety from Regex Injection**: Hitting `http://127.0.0.1:5001/api/turfs?search=(` will successfully execute without throwing syntax regex errors.
* **Availability Checker Guard**: Passing invalid IDs (`/api/turfs/abc/slots/date`) or non-date strings (`/api/turfs/id/slots/abc`) returns `400 Bad Request` instead of `500 CastError/RangeError`.
