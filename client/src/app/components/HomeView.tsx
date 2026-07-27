import { useMemo } from 'react';
import { useGetGalleryQuery, mediaUrl } from '../services/api';

type View = 'home' | 'booking' | 'menu' | 'qr';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

const FALLBACK_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1645447556616-e9d1c52e8037?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Pool with palm tree',
  },
  {
    url: 'https://images.unsplash.com/photo-1762279938689-1316c6dc67df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    alt: 'Empty pool with lounge chairs',
  },
  {
    url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    alt: 'Lounge chairs by pool',
  },
  {
    url: 'https://images.unsplash.com/photo-1780287857843-b461b70a9b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    alt: 'Outdoor pool with tropical foliage',
  },
];

export function HomeView({ onNavigate }: HomeViewProps) {
  const { data: gallery = [] } = useGetGalleryQuery();

  const galleryPhotos = useMemo(() => {
    if (gallery.length === 0) return FALLBACK_PHOTOS;
    return gallery.map((photo, index) => ({
      url: mediaUrl(photo.image),
      alt: `Hyuga Swimming Pool ${index + 1}`,
    }));
  }, [gallery]);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', color: '#FBF6EB', padding: '96px clamp(20px,6vw,80px) 0' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url('${galleryPhotos[0]?.url ?? FALLBACK_PHOTOS[0].url}')`, backgroundSize: 'cover', backgroundPosition: 'center 60%' }}/>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(110deg, rgba(10,30,29,0.84) 0%, rgba(14,58,57,0.72) 50%, rgba(10,30,29,0.62) 100%)' }}/>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto', paddingBottom: 70 }} className="hero-inner-grid">
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E3C77E', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <span style={{ width: 26, height: 1, background: '#E3C77E', display: 'inline-block' }}/>
                Hyuga Swimming Pool · Suv bo'yidagi dam olish
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,5.2vw,68px)', lineHeight: 1.04, fontWeight: 700, maxWidth: 600 }}>
                Tapchaningizni oldindan tanlang,{' '}
                <em style={{ fontStyle: 'normal', color: '#7FC2CC' }}>qolganini biz tayyorlaymiz.</em>
              </h1>
              <p style={{ marginTop: 22, fontSize: 17, lineHeight: 1.65, color: '#DCEEEF', maxWidth: 460, fontWeight: 400 }}>
                Baseyn bo'yidagi tapchanni onlayn band qiling, o'tirgan joyingizdan taom buyurtma bering yoki tapchandagi QR kodni skanerlab, bir zumda menyuga o'ting.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
                <button onClick={() => onNavigate('booking')} style={{ padding: '15px 26px', borderRadius: 100, fontWeight: 700, fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#BD5B38', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>
                  Tapchan band qilish →
                </button>
                <button onClick={() => onNavigate('qr')} style={{ padding: '15px 26px', borderRadius: 100, fontWeight: 700, fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#FBF6EB', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>
                  QR kodni sinab ko'rish
                </button>
              </div>
              <div style={{ display: 'flex', gap: 28, marginTop: 48, flexWrap: 'wrap' }}>
                {[{ val: '24', label: 'Tapchan' }, { val: '10:00–22:00', label: 'Ish vaqti' }, { val: '~12 min', label: 'Buyurtma yetkazish' }].map(s => (
                  <div key={s.label}>
                    <b style={{ display: 'block', fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: '#E3C77E', fontWeight: 700 }}>{s.val}</b>
                    <span style={{ fontSize: 12.5, color: '#DCEEEF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <svg viewBox="0 0 480 420" fill="none">
                <ellipse cx="240" cy="230" rx="200" ry="130" fill="#0F4644"/>
                <ellipse cx="240" cy="220" rx="175" ry="112" fill="#1B7A8C" opacity="0.9"/>
                <path d="M90 200c15 8 15-8 30 0s15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0" stroke="#7FC2CC" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M90 235c15 8 15-8 30 0s15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0 15-8 30 0" stroke="#DCEEEF" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <g transform="translate(30,50)"><rect x="0" y="30" width="86" height="46" rx="6" fill="#C69A3E"/><path d="M-8 30 L43 0 L94 30 Z" fill="#BD5B38"/></g>
                <g transform="translate(360,110)"><rect x="0" y="30" width="86" height="46" rx="6" fill="#C69A3E"/><path d="M-8 30 L43 0 L94 30 Z" fill="#BD5B38"/></g>
                <g transform="translate(190,320)"><rect x="0" y="30" width="86" height="46" rx="6" fill="#E3C77E"/><path d="M-8 30 L43 0 L94 30 Z" fill="#C69A3E"/></g>
              </svg>
            </div>
          </div>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 70, marginTop: 60 }}>
            <path d="M0,40 C240,90 480,0 720,35 C960,70 1200,10 1440,45 L1440,90 L0,90 Z" fill="#FBF6EB"/>
          </svg>
        </div>
      </section>

      {/* ── GALLERY + MAP ── */}
      <section style={{ padding: '88px clamp(20px,6vw,80px)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#BD5B38', marginBottom: 10, fontWeight: 500 }}>
            Galereya & Manzil
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.4vw,42px)', color: '#182422', fontWeight: 600 }}>
              Hyuga Swimming Pool bilan tanishing
            </h2>
            <p style={{ color: '#4B5C58', maxWidth: 380, fontSize: 15, lineHeight: 1.6 }}>
              Zamonaviy infratuzilma, toza havosi va sifatli xizmat bilan ajralib turuvchi dam olish maskani.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '280px 240px', gap: 14, marginBottom: 14 }} className="gallery-grid">
          <div style={{ gridColumn: '1', gridRow: '1 / 3', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
            <img src={galleryPhotos[0]?.url} alt={galleryPhotos[0]?.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,58,57,0.4) 0%, transparent 50%)' }}/>
            <div style={{ position: 'absolute', bottom: 18, left: 18, color: '#FBF6EB' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#E3C77E' }}>Asosiy baseyn</div>
            </div>
          </div>
          <div style={{ gridColumn: '2', gridRow: '1', borderRadius: 20, overflow: 'hidden' }}>
            <img src={galleryPhotos[1]?.url ?? galleryPhotos[0]?.url} alt={galleryPhotos[1]?.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
          </div>
          <div style={{ gridColumn: '3', gridRow: '1', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
            <img src={galleryPhotos[2]?.url ?? galleryPhotos[0]?.url} alt={galleryPhotos[2]?.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(14,58,57,0.8)', backdropFilter: 'blur(8px)', color: '#E3C77E', borderRadius: 100, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, fontFamily: "'Manrope',sans-serif", letterSpacing: '.04em' }}>
              Tapchanlar
            </div>
          </div>
          <div style={{ gridColumn: '2 / 4', gridRow: '2', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
            <img src={galleryPhotos[3]?.url ?? galleryPhotos[0]?.url} alt={galleryPhotos[3]?.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,58,57,0.55) 0%, transparent 60%)' }}/>
            <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#FBF6EB' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Dam olish zonasi</div>
              <div style={{ fontSize: 13, color: '#DCEEEF' }}>Tropik o'simliklar bilan o'ralgan</div>
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(14,58,57,0.12)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 10, background: 'rgba(14,58,57,0.88)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '12px 18px', color: '#FBF6EB' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7FC2CC', marginBottom: 4 }}>Manzilimiz</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600 }}>Chilonzor tumani, Toshkent</div>
            <div style={{ fontSize: 12.5, color: '#DCEEEF', marginTop: 2 }}>+998 90 123 45 67</div>
          </div>
          <iframe
            title="Hyuga Swimming Pool — Manzil"
            src="https://maps.google.com/maps?q=Chilonzor,+Tashkent,+Uzbekistan&output=embed&z=14"
            width="100%"
            height="380"
            style={{ display: 'block', border: 'none', filter: 'saturate(0.9)' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <style>{`
        @media (max-width: 920px) {
          .hero-inner-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr 1fr !important; grid-template-rows: 200px 200px 200px !important; }
          .gallery-grid > div:first-child { grid-column: 1 / 3 !important; grid-row: 1 !important; }
          .gallery-grid > div:nth-child(4) { grid-column: 1 / 3 !important; }
        }
        @media (max-width: 560px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
          .gallery-grid > div { grid-column: 1 !important; grid-row: auto !important; }
        }
      `}</style>
    </div>
  );
}
