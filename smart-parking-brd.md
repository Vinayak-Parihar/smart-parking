# Smart Parking Allocation System — Business Requirements Document (BRD)

**Document Type:** Business Requirements Document (BRD)
**Project Stage:** Demo / Presentation
**Prepared for:** Internal presentation

---

## 1. Idea Summary

A smart parking system for private vehicles, organized around **geo-fenced areas → parking zones → parking lots**, with **automatic number plate recognition (ANPR)** handling allocation and de-allocation — no manual booking or ticket required.

### Core Concept
- The city/region is divided into **Areas**.
- When a user's vehicle comes within **1 km** of an Area, that Area becomes visible on their app screen.
- Each Area contains one or more **Parking Zones**.
- Each Zone contains one or more **Parking Lots**, with each lot holding roughly **200 four-wheeler parking spaces**.
- When a vehicle physically enters a Zone, its **number plate is scanned (ANPR)** at the zone entry point, and a specific parking space is **automatically allocated** within one of the lots in that zone.
- Each Zone has a designated **Exit point**. When the vehicle exits, its number plate is scanned again, and the previously allocated space is **automatically unallocated** — freeing it for the next vehicle.

### Key Differentiator
Most existing solutions either:
- Show only the single nearest parking spot (no area/zone hierarchy), or
- Require manual booking / OTP-based entry-exit confirmation.

This idea combines a **geofence-triggered area/zone hierarchy** with a **fully ANPR-driven, ticket-less entry-exit flow** — a combination not commonly found as a single existing product.

---

## 2. Prior Art / Market Research Summary

Before implementation, existing solutions were researched:

| Category | Examples | Notes |
|---|---|---|
| ANPR-based entry/exit parking | Smart Parking (UK/EU), ANPR academic prototypes | Common at facility level, mostly single-lot, not area/zone hierarchy |
| Geofence-based parking alerts | Get My Parking, IndianRFID | Geofence range typically accurate only up to ~50m; city-wide single geofence not feasible |
| Zone/nearby parking discovery apps (India) | ParkingMudde, sParking (Kolkata), ParkingPal | Closest existing matches — but mostly use booking + OTP for entry/exit rather than pure ANPR |

**Conclusion:** The individual components (ANPR, geofencing, zone-based discovery) all exist separately and are mature technologies. The specific combination — geofence-triggered area view → zone → auto-allocated lot → pure ANPR-only exit unallocation — is a differentiated approach, not a commodity/off-the-shelf product.

---

## 3. Functional Flow

1. User's device detects proximity (within 1 km) to a defined **Area** → Area becomes visible in the app.
2. User (physically driving) enters a **Zone** within that Area.
3. Zone entry point camera performs **ANPR scan** of the vehicle's number plate.
4. System finds an available **Lot** within the Zone and **allocates a specific parking space**.
5. Vehicle parks in the allocated space.
6. On leaving, the vehicle passes the Zone's **Exit point**, where the plate is scanned again.
7. System matches the plate to the active allocation and **unallocates** the space, making it available for the next vehicle.

---

## 4. Scope for Demo / Presentation

The demo is a **proof-of-concept web app**, intended to visually and functionally demonstrate the above flow — not a production deployment.

**In scope for demo:**
- Area / Zone / Lot visualization (map or list-based)
- Simulated/actual ANPR scan (image upload, self-hosted recognition)
- Auto-allocation logic (assigning a space within a zone's lots)
- Auto-unallocation logic on exit scan
- Live UI updates (no manual refresh) showing occupancy changes

**Out of scope for demo:**
- Payment/billing integration
- Multi-city / large-scale data
- Production-grade database and concurrency handling
- Native mobile apps (planned for a later phase)

---

## 5. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Frontend** | React | No full page reloads, smoother UX for live status updates, and shares code/concepts with React Native for future mobile conversion |
| **Backend** | Node.js | Same language (JS) across frontend and backend, simplifies development and API integration |
| **Real-time updates** | Socket.io (WebSocket) | Live occupancy/allocation status without polling |
| **Database (demo stage)** | lowdb (JSON file-based) | Zero-setup, sufficient for demo data volume; easy to later migrate to MongoDB/PostgreSQL since structure is already JSON-based |
| **ANPR (plate recognition)** | Self-hosted OpenALPR (via Docker) | Free/no per-scan cost, suitable for testing and demo; avoids paid per-lookup APIs like Plate Recognizer during testing phase |
| **ANPR integration** | Small wrapper service (Node child_process or Python Flask) exposing OpenALPR as a REST endpoint | OpenALPR is a native C++ library; a wrapper service lets the Node backend call it over HTTP |
| **Future mobile** | React Native | Chosen to stay within the JS ecosystem; maximizes code/logic reuse from the React frontend |

### High-Level Architecture

```
┌──────────────────┐      REST / WebSocket      ┌───────────────────┐
│  React Frontend   │ ◄────────────────────────► │   Node.js Backend  │
│ (Zones, Map, UI)  │                             │ (Express/Fastify)  │
└──────────────────┘                             └─────────┬──────────┘
                                                              │ REST call
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │ ANPR Microservice        │
                                                  │ (OpenALPR via Docker)    │
                                                  └────────────────────────┘
                                                              │
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │  lowdb (JSON storage)    │
                                                  │  zones / lots /          │
                                                  │  allocations              │
                                                  └────────────────────────┘
```

---

## 6. Data Structure (Demo — lowdb)

```json
{
  "zones": [
    { "id": "z1", "name": "MG Road Zone", "lat": 18.52, "lng": 73.85 }
  ],
  "lots": [
    { "id": "l1", "zoneId": "z1", "totalSpaces": 200, "occupiedSpaces": 45 }
  ],
  "allocations": [
    {
      "id": "a1",
      "lotId": "l1",
      "spaceNumber": 46,
      "plateNumber": "MH12AB1234",
      "status": "occupied",
      "entryTime": "2026-09-19T10:00:00Z",
      "exitTime": null
    }
  ]
}
```

---

## 7. Future Scope (Post-Demo)

- Migrate database from lowdb to MongoDB/PostgreSQL for concurrency and scale.
- Build native mobile apps using **React Native** (Android/iOS), reusing frontend logic.
- Evaluate cloud/paid ANPR (e.g., Plate Recognizer) if self-hosted scanning cannot meet accuracy/throughput needs at production scale.
- Add payment/billing layer for paid parking zones.
- Add dynamic pricing for high-demand zones or premium spots (entrance-adjacent, EV charging, etc.).

---

*This document reflects decisions made during initial planning discussions and is intended to guide the demo build for the upcoming presentation.*
