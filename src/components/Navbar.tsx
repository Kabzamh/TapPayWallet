import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Download,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { TapPayBrandMark } from './Icons';
import { useTapPay } from '../context/TapPayContext';

const NAV_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/personal', label: 'Personal & Wallet' },
  { to: '/business', label: 'SoftPOS Business' },
  { to: '/pricing', label: 'Pricing & Fees' },
  { to: '/security', label: 'Security & SARB' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme, setDownloadModalOpen } = useTapPay();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--tp-border)] bg-[var(--tp-glass-sheet)] backdrop-blur-2xl">
      {/* Top Regulatory Micro-Bar */}
      <div className="border-b border-[var(--tp-border)] bg-emerald-500/[0.06] px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--tp-text-secondary)] truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-[var(--tp-text)]">SARB Open Banking &amp; PayShap RTC:</span>
            <span className="hidden sm:inline">All 7 SA Bank Mandates &amp; STS Vending Switches 99.99% Operational</span>
            <span className="sm:hidden">All SA Rails Live</span>
          </div>
          <div className="hidden md:flex items-center gap-4 font-mono-tabular text-[11px] text-[var(--tp-text-secondary)]">
            <span>ISO/IEC 14443-4 HCE</span>
            <span>•</span>
            <span>EMVCo L2 Certified</span>
            <span>•</span>
            <span className="text-emerald-500 font-semibold">R 0.00 Card Tap Fees</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 group"
        >
          <TapPayBrandMark size={38} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[var(--tp-text)]">
                TapPay Wallet
              </span>
              <span className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                ZA
              </span>
            </div>
            <span className="block text-[11px] text-[var(--tp-text-muted)] leading-none">
              Direct NFC &amp; e-Money Rail
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full tp-muted-box">
          {NAV_LINKS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition ${
                  active
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2.5 rounded-xl tp-muted-box text-[var(--tp-text-secondary)] hover:text-[var(--tp-text)] transition cursor-pointer"
            title={isDark ? 'Switch to Glacier Light Mode' : 'Switch to Obsidian Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/simulator"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
              location.pathname === '/simulator'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                : 'tp-muted-box text-[var(--tp-text)] hover:border-emerald-500/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Web App</span>
          </Link>

          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Get TapPay Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-xl tp-muted-box text-[var(--tp-text)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--tp-border)] bg-[var(--tp-glass-sheet)] px-4 pt-3 pb-5 space-y-2">
          {NAV_LINKS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  active
                    ? 'bg-emerald-500 text-white'
                    : 'text-[var(--tp-text-secondary)] hover:bg-[var(--tp-surface-muted)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/simulator"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 font-bold text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Launch Interactive TapPay Wallet Web App
          </Link>
        </div>
      )}
    </header>
  );
};
