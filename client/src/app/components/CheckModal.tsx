import { useState } from 'react';

type View = 'home' | 'booking' | 'menu';

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  color: string;
}

interface CartEntry {
  item: MenuItem;
  qty: number;
}

interface CheckModalProps {
  activeOrders: Record<string, CartEntry>;
  orderedTapchan: number | null;
  onClose: () => void;
  onNavigate: (view: View) => void;
  onPaymentComplete: (method: 'click' | 'terminal' | 'cash') => void | Promise<void>;
}

type PayScreen = 'bill' | 'payment';

const PAYMENT_METHODS = [
  {
    key: 'click',
    label: 'Click',
    sub: "Ilova orqali to'lash",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#00A3E0"/>
        <path d="M8 16.5l5 5 11-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'terminal',
    label: 'Terminal',
    sub: 'Bank kartasi orqali',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0E3A39"/>
        <rect x="6" y="10" width="20" height="14" rx="3" stroke="#E3C77E" strokeWidth="1.8"/>
        <path d="M6 15h20" stroke="#E3C77E" strokeWidth="1.8"/>
        <rect x="9" y="18" width="5" height="3" rx="1" fill="#E3C77E"/>
      </svg>
    ),
  },
  {
    key: 'cash',
    label: 'Naqd pul',
    sub: "Ofitsiantga to'lash",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#4C8C6B"/>
        <rect x="5" y="11" width="22" height="14" rx="3" stroke="#fff" strokeWidth="1.8"/>
        <circle cx="16" cy="18" r="3" stroke="#fff" strokeWidth="1.8"/>
        <path d="M5 15h22" stroke="#fff" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    ),
  },
];

export function CheckModal({ activeOrders, orderedTapchan, onClose, onNavigate, onPaymentComplete }: CheckModalProps) {
  const [screen, setScreen] = useState<PayScreen>('bill');
  const [selectedPay, setSelectedPay] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const orderKeys = Object.keys(activeOrders);
  const total = orderKeys.reduce((a, k) => a + activeOrders[k].item.price * activeOrders[k].qty, 0);
  const hasOrders = orderKeys.length > 0;

  const handleConfirmPay = async () => {
    if (!selectedPay) return;
    setPaying(true);
    setPayError('');
    try {
      await onPaymentComplete(selectedPay as 'click' | 'terminal' | 'cash');
      setPaid(true);
      setTimeout(() => onClose(), 1800);
    } catch {
      setPayError("To'lovni amalga oshirib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(14,30,29,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeInOverlay .25s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.28)', overflow: 'hidden', animation: 'slideUpModal .3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Header */}
        <div style={{ background: '#0E3A39', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7FC2CC', marginBottom: 4 }}>
              {screen === 'bill'
                ? (orderedTapchan ? `Tapchan #${orderedTapchan} · Faol buyurtmalar` : 'Faol buyurtmalar')
                : "To'lov usuli"}
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: '#FBF6EB', fontWeight: 600 }}>
              {screen === 'bill' ? 'Hisobingiz' : "Qanday to'lasiz?"}
            </h3>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#DCEEEF', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Bill screen */}
        {screen === 'bill' && (
          <div style={{ padding: '24px 28px' }}>
            {!hasOrders ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#4B5C58' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>Hali faol buyurtma yo'q.<br/>Avval taom tanlang va yuborish tugmasini bosing.</p>
              </div>
            ) : (
              <>
                {/* Active orders badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(76,140,107,0.08)', border: '1px solid rgba(76,140,107,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4C8C6B', animation: 'pulse 2s ease infinite' }}/>
                  <span style={{ fontSize: 13, color: '#4C8C6B', fontWeight: 700 }}>Oshxona buyurtmani qabul qildi</span>
                </div>

                {/* Item list */}
                <div style={{ marginBottom: 20 }}>
                  {orderKeys.map((k, i) => {
                    const e = activeOrders[k];
                    return (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < orderKeys.length - 1 ? '1px solid rgba(14,58,57,0.08)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: e.item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'IBM Plex Mono',monospace" }}>{e.qty}</span>
                          <span style={{ fontSize: 14, color: '#182422', fontWeight: 500 }}>{e.item.name}</span>
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5, color: '#182422', fontWeight: 600 }}>{(e.item.price * e.qty).toLocaleString('ru-RU')} so'm</span>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div style={{ background: 'linear-gradient(135deg, #0E3A39, #14514F)', borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7FC2CC', marginBottom: 3 }}>Jami summa</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: '#E3C77E', fontWeight: 700 }}>{total.toLocaleString('ru-RU')} so'm</div>
                  </div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" opacity="0.35"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#E3C77E" strokeWidth="1.5"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#E3C77E" strokeWidth="1.5"/><path d="M9 12h6M9 16h4" stroke="#E3C77E" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { onNavigate('menu'); onClose(); }} style={{ flex: 1, padding: '14px 16px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, background: 'transparent', border: '1.5px solid rgba(14,58,57,0.2)', color: '#0E3A39', cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }}>
                Yana taom buyurtirish
              </button>
              <button disabled={!hasOrders} onClick={() => setScreen('payment')} style={{ flex: 1, padding: '14px 16px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, background: hasOrders ? '#BD5B38' : '#ccc', color: '#fff', border: 'none', cursor: hasOrders ? 'pointer' : 'not-allowed', fontFamily: "'Manrope',sans-serif" }}>
                Pul to'lash →
              </button>
            </div>
          </div>
        )}

        {/* Payment screen */}
        {screen === 'payment' && (
          <div style={{ padding: '24px 28px' }}>
            {paid ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(76,140,107,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#4C8C6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: '#182422', fontWeight: 600 }}>To'lov qabul qilindi!</p>
                <p style={{ fontSize: 13, color: '#4B5C58', marginTop: 6 }}>Rahmat, yaxshi dam oling.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 14, color: '#4B5C58', marginBottom: 20 }}>To'lov usulini tanlang:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {PAYMENT_METHODS.map(method => (
                    <button key={method.key} onClick={() => setSelectedPay(method.key)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, border: selectedPay === method.key ? '2px solid #0E3A39' : '1.5px solid rgba(14,58,57,0.12)', background: selectedPay === method.key ? 'rgba(14,58,57,0.04)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: '.18s', fontFamily: "'Manrope',sans-serif" }}>
                      {method.icon}
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#182422' }}>{method.label}</div>
                        <div style={{ fontSize: 12, color: '#4B5C58', marginTop: 1 }}>{method.sub}</div>
                      </div>
                      {selectedPay === method.key && (
                        <div style={{ marginLeft: 'auto' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#0E3A39" strokeWidth="1.8"/><path d="M8 12l3 3 5-5" stroke="#0E3A39" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F2E8D3', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: '#4B5C58' }}>Jami:</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 15, color: '#0E3A39' }}>{total.toLocaleString('ru-RU')} so'm</span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setScreen('bill')} style={{ padding: '14px 18px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, background: 'transparent', border: '1.5px solid rgba(14,58,57,0.2)', color: '#0E3A39', cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }}>← Orqaga</button>
                  <button disabled={!selectedPay || paying} onClick={() => void handleConfirmPay()} style={{ flex: 1, padding: '14px 16px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, background: selectedPay && !paying ? '#0E3A39' : '#ccc', color: '#fff', border: 'none', cursor: selectedPay && !paying ? 'pointer' : 'not-allowed', fontFamily: "'Manrope',sans-serif" }}>
                    {paying ? 'Jarayonda...' : 'Tasdiqlash'}
                  </button>
                </div>
                {payError && <p style={{ fontSize: 12, color: '#B4523C', marginTop: 12, textAlign: 'center', fontWeight: 600 }}>{payError}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
