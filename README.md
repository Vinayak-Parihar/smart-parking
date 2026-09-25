# Smart Parking System — Setup & Run Guide

The project has three parts, and each one runs in its own terminal:

| Part | Folder | Tech | Runs on |
|---|---|---|---|
| Backend API | `smart-parking-backend/` | Node.js + Express + lowdb + Socket.io | http://localhost:4000 |
| Frontend | `smart-parking-frontend/` | React + Vite | http://localhost:5173 |
| ANPR service (plate reading) | `anpr-service/` | Python + FastAPI + fast-alpr | http://localhost:5001 |

The ANPR service is **optional**. It is only needed for the camera "Scan at Entry / Scan at Exit" buttons. Everything else works without it, including manual entry, Find My Car, the dashboard and the staff tools.

---

## 1. Install the required software (one time)

| Software | Version | Check with | Download |
|---|---|---|---|
| Node.js (includes npm) | **20.19+** or **22.12+** | `node -v` | https://nodejs.org (pick the LTS version) |
| Python (only for ANPR) | **3.10+** | `python --version` | https://www.python.org/downloads/ |
| Git (optional) | any | `git --version` | https://git-scm.com |

When installing Python on Windows, tick **"Add python.exe to PATH"** on the first installer screen.

After installing, **close and reopen** your terminal, then check the versions:

```powershell
node -v
npm -v
python --version
```

---

## 2. Install project dependencies (one time)

Open a terminal in the project root folder (the folder that contains this README).

### 2.1 Backend

```powershell
cd smart-parking-backend
npm install
cd ..
```

### 2.2 Frontend

```powershell
cd smart-parking-frontend
npm install
cd ..
```

### 2.3 ANPR service (optional — only for camera scanning)

A virtual environment (`.venv`) keeps this project's Python packages separate from the rest of your system.

**Windows (PowerShell):**

```powershell
cd anpr-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

**macOS / Linux:**

```bash
cd anpr-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

Once the venv is active, your prompt starts with `(.venv)`. The install downloads several hundred MB (OpenCV and ONNX runtime), so it can take a few minutes.

> **"running scripts is disabled on this system" error on Windows?** Run this once, then try `Activate.ps1` again:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

---

## 3. Run the project

Open **three separate terminals**, all starting in the project root. Keep all three running while you use the app.

### Terminal 1 — Backend

```powershell
cd smart-parking-backend
npm run dev
```

Wait for: `Smart Parking backend running on http://localhost:4000`

(`npm run dev` restarts automatically when you edit backend code. Use `npm start` for a plain run.)

### Terminal 2 — Frontend

```powershell
cd smart-parking-frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`, then open that link in your browser.

### Terminal 3 — ANPR service (optional)

**Windows:**

```powershell
cd anpr-service
.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 5001
```

**macOS / Linux:**

```bash
cd anpr-service
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 5001
```

Wait for: `Uvicorn running on http://0.0.0.0:5001`

The **first start needs internet**, because it downloads the plate-detection models. Later starts use the downloaded copy. To check it is up, open http://localhost:5001/health — you should see `{"status":"ok"}`.

### To stop

Press **Ctrl + C** in each terminal.

---

## 4. Pages in the app

Open these in the browser while the backend and frontend are running:

| URL | What it is | Who uses it |
|---|---|---|
| http://localhost:5173/ | Landing page | Drivers |
| http://localhost:5173/app | Zone list, live occupancy, scan entry/exit, manual entry | Drivers / demo |
| http://localhost:5173/map | Map of all parking locations | Drivers |
| http://localhost:5173/my-car | Find My Car — shows where your vehicle is parked | Drivers |
| http://localhost:5173/dashboard | Big-screen live dashboard (for a TV or projector) | Public display |
| http://localhost:5173/staff/lookup | Look up any vehicle by plate number | Staff |
| http://localhost:5173/staff/override | Manually allocate or free a space when a scan fails | Staff |
| http://localhost:5173/admin | Add new parking locations | Admin |

The staff pages are not linked from anywhere in the app. Share their URLs only with staff. When the backend has `STAFF_PIN` set (see section 7), the staff pages and `/admin` ask for that PIN first. Without it, locally, they open directly.

The language toggle (EN / मरा / हिं) is in the header of the driver pages.

---

## 5. Quick test (without a camera)

1. Open http://localhost:5173/app and pick a zone on the left.
2. Under **Manual Entry**, type a plate such as `MH12AB1234` and click **Allocate**.
3. Open http://localhost:5173/my-car. It should show the zone, lot and space number.
4. Open http://localhost:5173/dashboard in another tab. Allocate or unallocate a plate, and the dashboard card updates within a second or two.
5. Click **Unallocate** for the same plate. Find My Car now says the vehicle is not parked.

### Backend self-check

This checks the allocation rules: priority spaces, spillover, zone full, the nearby-zone suggestion and plate lookup. It uses a temporary database file and never touches your real data.

```powershell
cd smart-parking-backend
node src/services/allocation.check.js
```

Expected output: `allocation checks passed`

---

## 6. Data

- All data (zones, lots, allocations and parkings) is stored in `smart-parking-backend/src/data/db.json`.
- **To reset to the starting data:** stop the backend, delete `db.json`, then start the backend again. It re-creates the file with two default zones (MG Road and FC Road).
- Back up `db.json` first if you want to keep the current data.

---

## 7. Settings (optional)

| Setting | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | Backend environment variable | `4000` | Backend port |
| `ANPR_SERVICE_URL` | Backend environment variable | `http://localhost:5001` | Where the backend finds the ANPR service |
| `DB_FILE` | Backend environment variable | `src/data/db.json` | Use a different data file |
| `STAFF_PIN` | Backend environment variable | not set (no PIN) | When set, the staff pages, `/admin`, manual allocate/unallocate and the parked-plates list all require this PIN. **Always set it on a public deployment.** Use a long passphrase, not a 4-digit number. |
| `ALLOW_RESERVED_SPILLOVER` | `smart-parking-backend/src/services/allocationService.js` | `true` | Whether normal vehicles may use priority spaces once general spaces are full |

The frontend calls the backend on the same address it was opened from (`/api`). In development, Vite forwards those calls to `http://localhost:4000` (see `smart-parking-frontend/vite.config.js`). If you change the backend `PORT` for local development, update that file too.

Setting an environment variable for one run in PowerShell:

```powershell
$env:ANPR_SERVICE_URL = "http://192.168.1.20:5001"; npm run dev
```

---

## 8. Deploy on Hostinger (Node.js Web App)

In production the backend also serves the built frontend, so the whole project runs as **one Node.js app on one URL**. The repo root `package.json` and `server.js` exist for this.

### What works on Hostinger Web App hosting

| Feature | Works? |
|---|---|
| All pages, manual entry, Find My Car, staff tools, admin, languages | ✅ Yes |
| Live updates (dashboard, zone screen) | ✅ Yes, but a bit slower. Hostinger's Web/Cloud plans block incoming WebSockets, so Socket.io falls back to HTTP polling. The dashboard also refreshes every 30 seconds on its own. |
| Camera scan (ANPR) | ❌ No. The ANPR service is Python, and Web App hosting only runs Node.js. Use manual entry / staff override, or run ANPR on a VPS (see below). |

**Plan needed:** a **Business** web hosting plan or any **Cloud** plan. Single/Premium plans don't support Node.js apps.

### Steps

1. Push the latest code to GitHub.
2. In **hPanel → Websites → Add Website → Node.js Apps**, choose **Import Git Repository** and connect `smart-parking`.
3. Fill in the settings:

   | Setting | Value |
   |---|---|
   | Framework preset | Express (or "Other") |
   | Branch | `main` |
   | Node.js version | 22 |
   | Build command | `npm run build` |
   | Entry file | `server.js` |
   | Package manager | npm |

4. Add the **environment variables**:

   | Name | Value |
   |---|---|
   | `STAFF_PIN` | a long passphrase that only staff know |
   | `DB_FILE` | `/home/<your-hostinger-user>/smart-parking-data/db.json` |

   **`DB_FILE` is required.** Hostinger overwrites the app folder on every deploy, and with GitHub connected that means every push. If the data file lives inside the app folder, all parkings and allocations are wiped on each push. Your Hostinger username (starting with `u`) is shown in hPanel under the SSH / File Manager details. The folder is created automatically on first start.

5. Click **Deploy**. When it finishes, open your domain. Test `/app` (manual allocate), `/my-car`, `/dashboard` and `/staff/override` (it should ask for the PIN).

### Keeping your current data

On first start the app creates a fresh data file with the two default zones. To keep the data you have locally instead, upload `smart-parking-backend/src/data/db.json` with File Manager to the `DB_FILE` path **before** the first deploy (or restart the app after uploading).

### Updating later

Push to `main`. Hostinger rebuilds and redeploys automatically, and your data stays safe in `DB_FILE`.

### Want camera scanning too?

Get a Hostinger **VPS** (KVM 2 or higher, about 2 GB RAM) and run the ANPR service there with the section 2.3 / 3 commands. Then set `ANPR_SERVICE_URL` on the web app to `http://<vps-ip>:5001`. The VPS can also host the whole project on its own if you'd rather have everything in one place.

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `'node' is not recognized` / `'python' is not recognized` | The software isn't installed or isn't on PATH. Reinstall it (tick "Add to PATH" for Python), then reopen the terminal. |
| `EADDRINUSE: address already in use :::4000` | Another copy of the backend is already running. Close the other terminal, or find and stop it: `Get-NetTCPConnection -LocalPort 4000` → `Stop-Process -Id <OwningProcess>` |
| Frontend loads but shows no zones / "Failed to fetch" | The backend isn't running. Start Terminal 1. |
| Scan gives `ANPR service error` or `fetch failed` | The ANPR service isn't running. Start Terminal 3, or use Manual Entry instead. |
| `No plate detected in image` | The plate wasn't clear. Retake the photo closer, with better light and the plate straight on. |
| Camera doesn't open | The browser blocked camera permission. Allow it in the address bar. Browsers only allow the camera on `localhost` or `https://`, so a phone opening your laptop's IP address won't get the camera. |
| `pip install` fails on Windows | Make sure you are on Python 3.10 or newer and that the venv is active (`(.venv)` in the prompt), then run `python -m pip install --upgrade pip` and retry. |
| Vite says Node version is too old | Install Node 20.19+ or 22.12+ from nodejs.org. |
