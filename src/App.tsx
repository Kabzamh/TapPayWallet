import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { TapPayProvider, useTapPay } from './context/TapPayContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ReceiptModal } from './components/ReceiptModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { HomePage } from './pages/HomePage';
import { PersonalPage } from './pages/PersonalPage';
import { BusinessPage } from './pages/BusinessPage';
import { PricingPage } from './pages/PricingPage';
import { SecurityPage } from './pages/SecurityPage';
import { SimulatorPage } from './pages/SimulatorPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

/** Mirrors TapPay App AmbientGlassBackground (Glacier-Emerald & Sky-Cyan mesh) */
const AmbientGlassBackground: React.FC = () => {
  const { isDark } = useTapPay();
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #050B14 0%, #091526 50%, #06111D 100%)'
          : 'linear-gradient(135deg, #E6F0FA 0%, #EFF5FB 50%, #E6F4EE 100%)',
      }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <radialGradient id="tpGlowEmerald" cx="85%" cy="12%" rx="58%" ry="38%">
            <stop offset="0%" stopColor="#10B981" stopOpacity={isDark ? '0.26' : '0.22'} />
            <stop offset="55%" stopColor="#10B981" stopOpacity={isDark ? '0.08' : '0.07'} />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tpGlowCyan" cx="12%" cy="48%" rx="55%" ry="36%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={isDark ? '0.20' : '0.17'} />
            <stop offset="55%" stopColor="#0EA5E9" stopOpacity={isDark ? '0.06' : '0.05'} />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tpGlowBottom" cx="65%" cy="92%" rx="65%" ry="34%">
            <stop
              offset="0%"
              stopColor={isDark ? '#10B981' : '#059669'}
              stopOpacity={isDark ? '0.22' : '0.16'}
            />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#tpGlowEmerald)" />
        <rect x="0" y="0" width="100%" height="100%" fill="url(#tpGlowCyan)" />
        <rect x="0" y="0" width="100%" height="100%" fill="url(#tpGlowBottom)" />
      </svg>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <TapPayProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col text-[var(--tp-text)] transition-colors duration-200 relative">
          <AmbientGlassBackground />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/personal" element={<PersonalPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ReceiptModal />
          <DownloadAppModal />
        </div>
      </TapPayProvider>
    </BrowserRouter>
  );
}

export default App;
