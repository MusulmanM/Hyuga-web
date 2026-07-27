import { useCallback, useEffect, useState } from 'react';
import { useScanQrMutation } from '../services/api';

type View = 'home' | 'booking' | 'menu' | 'qr';

interface QRViewProps {
  onSetCartTapchan: (id: number) => void;
  onNavigate: (view: View) => void;
}

export function QRView({ onSetCartTapchan, onNavigate }: QRViewProps) {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [resultId, setResultId] = useState<number | null>(null);

  const [scanQr] = useScanQrMutation();

  const runScan = useCallback(async (tapchanNumber: number) => {
    setScanning(true);
    setError('');
    setResultId(null);

    try {
      const response = await scanQr({ tapchan: tapchanNumber }).unwrap();
      console.log('✅ Scan muvaffaqiyatli:', response);

      setResultId(tapchanNumber);
      onSetCartTapchan(tapchanNumber);

      // URL ni yangilash
      const url = new URL(window.location.href);
      url.searchParams.set('tapchan', String(tapchanNumber));
      window.history.replaceState({}, '', url.toString());

      // 1.2 soniyadan keyin menu ga o'tish
      setTimeout(() => {
        onNavigate('menu');
      }, 1200);

    } catch (err: any) {
      console.error('❌ Scan xatosi:', err);

      let errorMsg =
        err?.data?.error ||
        err?.error ||
        `Tapchan #${tapchanNumber} topilmadi.`;

      if (err?.status === 'FETCH_ERROR') {
        errorMsg = "Backend server ishlamayapti. Iltimos, serverni tekshiring.";
      }

      setError(errorMsg);
      setScanning(false);
    }
  }, [onSetCartTapchan, onNavigate, scanQr]);

  // URL'dan ?tapchan=7 ni avtomatik o'qish
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('tapchan');

    if (!raw) return;

    const num = Number(raw);
    if (Number.isFinite(num) && num >= 1 && num <= 23) {
      void runScan(num);
    } else {
      setError("Noto'g'ri tapchan raqami. 1 dan 23 gacha bo'lishi kerak.");
    }
  }, [runScan]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scanning) return;

    const manual = Number(manualInput);
    if (manualInput && Number.isFinite(manual) && manual >= 1 && manual <= 23) {
      void runScan(manual);
    } else {
      setError("Iltimos, 1 dan 23 gacha raqam kiriting.");
    }
  };

  // Agar avtomatik skanerlanayotgan bo'lsa - loading ko'rsatish
  if (scanning && resultId === null) {
    return (
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F2E8D3, #FBF6EB)',
        padding: 40
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(14,58,57,0.1)',
            borderTop: '4px solid #0E3A39',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 28,
            color: '#182422',
            marginBottom: 8
          }}>
            Tapchan aniqlanmoqda...
          </h2>
          <p style={{ color: '#4B5C58', fontSize: 14 }}>
            Iltimos, kuting. Tez orada menyuga o'tkazilasiz.
          </p>
          <style>{`
            @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
          `}</style>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '88px clamp(20px,6vw,80px)',
      maxWidth: 600,
      margin: '0 auto',
      background: 'linear-gradient(180deg, #F2E8D3, #FBF6EB)',
      minHeight: '60vh'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 12,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: '#BD5B38',
          marginBottom: 10,
          fontWeight: 500
        }}>
          QR orqali buyurtma
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 'clamp(26px,3.2vw,38px)',
          color: '#182422',
          marginBottom: 14,
          fontWeight: 600
        }}>
          Tapchangizni tanlang
        </h2>
        <p style={{ color: '#4B5C58', fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 30px' }}>
          Telefon kamerasi bilan QR stikerni skanerlang yoki tapchan raqamini qo'lda kiriting.
        </p>
      </div>

      {/* Muvaffaqiyatli skanerlangan xabar */}
      {resultId && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid rgba(14,58,57,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          animation: 'fadein .4s ease',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(76,140,107,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#4C8C6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <b style={{
              display: 'block',
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              color: '#182422'
            }}>
              Tapchan #{resultId}
            </b>
            <span style={{ fontSize: 13, color: '#4B5C58' }}>
              Aniqlandi — menyuga o'tkazilmoqda...
            </span>
          </div>
        </div>
      )}

      {/* Qo'lda kiritish formasi */}
      {!resultId && (
        <form onSubmit={handleManualSubmit} style={{ textAlign: 'center' }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: '#4B5C58',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            marginBottom: 10
          }}>
            Tapchan raqamini kiriting (1–23)
          </label>
          <input
            type="number"
            min={1}
            max={23}
            value={manualInput}
            onChange={e => {
              setManualInput(e.target.value);
              setError('');
            }}
            placeholder="Masalan: 7"
            disabled={scanning}
            style={{
              width: '100%',
              maxWidth: 280,
              padding: '14px 18px',
              borderRadius: 14,
              fontSize: 16,
              border: error ? '2px solid #B4523C' : '1.5px solid rgba(14,58,57,0.2)',
              background: '#fff',
              color: '#182422',
              fontFamily: "'IBM Plex Mono',monospace",
              outline: 'none',
              textAlign: 'center',
              marginBottom: 16,
              transition: 'border-color 0.2s',
            }}
          />

          <button
            type="submit"
            disabled={scanning || !manualInput}
            style={{
              padding: '15px 32px',
              borderRadius: 100,
              fontWeight: 700,
              fontSize: 15,
              background: scanning ? '#BD5B38cc' : '#BD5B38',
              color: '#fff',
              border: 'none',
              cursor: scanning ? 'not-allowed' : 'pointer',
              fontFamily: "'Manrope', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              opacity: !manualInput ? 0.7 : 1,
            }}
          >
            {scanning ? 'Tekshirilmoqda...' : "Menyuga o'tish"}
          </button>
        </form>
      )}

      {/* Xato xabari */}
      {error && (
        <div style={{
          marginTop: 20,
          padding: '14px 18px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#B4523C', fontWeight: 600, margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadein { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
      `}</style>
    </section>
  );
}
