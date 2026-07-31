import logoImg from '../../assets/Logo.jpg';

type View = 'home' | 'booking' | 'menu';

interface FooterProps {
  onNavigate: (view: View) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: '#0E3A39', color: '#DCEEEF', padding: '56px clamp(20px,6vw,80px) 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 30, maxWidth: 1280, margin: '0 auto 40px', paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <img src={logoImg} alt="Hyuga Swimming Pool" style={{ height: 56, width: 'auto', objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.9)', padding: '3px 8px' }} />
          <p style={{ fontSize: 13.5, marginTop: 10, maxWidth: 280, lineHeight: 1.6 }}>
            Toshkent shahridagi Hyuga Swimming Pool — bron qiling, buyurtma bering, dam oling.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: '#E3C77E', marginBottom: 14, fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>
              Xizmatlar
            </h4>
            {[
              { label: 'Tapchan band qilish', view: 'booking' as View },
              { label: 'Taom buyurtma', view: 'menu' as View },
              { label: 'QR skaner', view: 'qr' as View },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.view)}
                style={{ display: 'block', fontSize: 13.5, marginBottom: 10, color: '#DCEEEF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Manrope', sans-serif", textAlign: 'left' }}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: '#E3C77E', marginBottom: 14, fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>
              Aloqa
            </h4>
            <a href="tel:+998958011060" style={{ display: 'block', fontSize: 13.5, marginBottom: 10, color: '#DCEEEF', textDecoration: 'none' }}>
              +998 95 801 10 60
            </a>
            <span style={{ display: 'block', fontSize: 13.5, color: '#DCEEEF' }}>Chilonzor, Toshkent</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', fontSize: 12, color: 'rgba(220,238,239,0.5)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span>© 2026 Hyuga Swimming Pool</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '0.03em' }}>Dizayn maketi — demo</span>
      </div>
    </footer>
  );
}
