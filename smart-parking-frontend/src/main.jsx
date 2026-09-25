import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { I18nProvider } from './i18n'
import App from './App.jsx'
import AdminPage from './admin/AdminPage.jsx'
import LandingPage from './LandingPage.jsx'
import ParkingMapPage from './ParkingMapPage.jsx'
import DashboardView from './DashboardView.jsx'
import FindMyCar from './components/FindMyCar.jsx'
import StaffLookup from './staff/StaffLookup.jsx'
import StaffOverride from './staff/StaffOverride.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="/map" element={<ParkingMapPage />} />
        <Route path="/my-car" element={<FindMyCar />} />
        <Route path="/dashboard" element={<DashboardView />} />
        {/* staff tools: unlisted, not linked from driver navigation */}
        <Route path="/staff/lookup" element={<StaffLookup />} />
        <Route path="/staff/override" element={<StaffOverride />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
