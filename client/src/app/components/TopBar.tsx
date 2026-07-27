import { useState } from 'react';
import logoImg from '../../imports/logo.svg';

type View = 'home' | 'booking' | 'menu' | 'qr';

interface TopBarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  cartCount: number;
}

export function TopBar({ activeView, onNavigate, cartCount }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { key: View; label: string }[] = [
    { key: 'home', label: 'Bosh sahifa' },
    { key: 'booking', label: 'Tapchanlar' },
    { key: 'menu', label: 'Menyu' },
    { key: 'qr', label: 'QR skaner' },
  ];

  const goTo = (view: View) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px clamp(20px,5vw,56px)',
      background: 'rgba(14,58,57,0.94)',
      backdropFilter: 'blur(12px)',
      color: '#FBF6EB',
      borderBottom: '1px solid rgba(230,199,126,0.18)',
      gap: 16,
    }}>
      {/* Brand */}
      <button
        onClick={() => goTo('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        <img
          src={logoImg}
          alt="Hyuga Swimming Pool"
          style={{ height: 42, width: 'auto', objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.94)', padding: '2px 6px' }}
        />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#FBF6EB', letterSpacing: '0.02em', lineHeight: 1.15 }}>
            Hyuga
          </div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10.5, fontWeight: 600, color: '#7FC2CC', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>
            Swimming Pool
          </div>
        </div>
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hyuga-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => goTo(item.key)}
            style={{
              background: activeView === item.key ? '#C69A3E' : 'transparent',
              color: activeView === item.key ? '#0E3A39' : '#DCEEEF',
              fontSize: 13.5, fontWeight: 600,
              padding: '9px 15px', borderRadius: 100,
              border: 'none', cursor: 'pointer', transition: '.22s',
              fontFamily: "'Manrope', sans-serif", whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="hyuga-menu-btn"
        aria-label="Menyu"
        style={{
          display: 'none', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          {menuOpen
            ? <path d="M6 6l12 12M18 6L6 18" stroke="#DCEEEF" strokeWidth="2" strokeLinecap="round"/>
            : <path d="M4 7h16M4 12h16M4 17h16" stroke="#DCEEEF" strokeWidth="2" strokeLinecap="round"/>}
        </svg>
      </button>

      {/* Cart badge */}
      <button
        onClick={() => goTo('menu')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.08)', color: '#fff',
          padding: '9px 14px', borderRadius: 100, fontSize: 13.5, fontWeight: 600,
          border: 'none', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#DCEEEF" strokeWidth="1.8"/>
          <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#DCEEEF" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span>Savat</span>
        {cartCount > 0 && (
          <span style={{ background: '#BD5B38', color: '#fff', fontSize: 10.5, fontWeight: 800, width: 19, height: 19, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cartCount}
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="hyuga-mobile-nav" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(14,58,57,0.98)', backdropFilter: 'blur(12px)',
          padding: '12px clamp(20px,5vw,56px) 20px',
          borderBottom: '1px solid rgba(230,199,126,0.18)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => goTo(item.key)}
              style={{
                background: activeView === item.key ? '#C69A3E' : 'transparent',
                color: activeView === item.key ? '#0E3A39' : '#DCEEEF',
                fontSize: 14, fontWeight: 600,
                padding: '12px 16px', borderRadius: 12,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .hyuga-nav { display: flex; }
        @media (max-width: 960px) {
          .hyuga-nav { display: none !important; }
          .hyuga-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
