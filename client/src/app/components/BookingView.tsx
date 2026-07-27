import { useState, useCallback, useMemo } from 'react';
import { useCreateBookingMutation, useGetTapchansQuery } from '../services/api';

type View = 'home' | 'booking' | 'menu' | 'qr';

interface BookingViewProps {
  onNavigate: (view: View) => void;
  onSetCartTapchan: (id: number) => void;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
}

// ─── Layout data ──────────────────────────────────────────────
interface TNode {
  id: number;
  x?: number; y?: number; w?: number; h?: number;
  isBanket?: boolean;
  isCircle?: boolean; cx?: number; cy?: number; r?: number;
}

const NODES: TNode[] = [
  // Top row 1–8
  { id: 1, x: 68,  y: 8, w: 60, h: 42 },
  { id: 2, x: 138, y: 8, w: 60, h: 42 },
  { id: 3, x: 208, y: 8, w: 60, h: 42 },
  { id: 4, x: 278, y: 8, w: 60, h: 42 },
  { id: 5, x: 348, y: 8, w: 60, h: 42 },
  { id: 6, x: 418, y: 8, w: 60, h: 42 },
  { id: 7, x: 488, y: 8, w: 60, h: 42 },
  { id: 8, x: 558, y: 8, w: 60, h: 42 },
  // Right column 9–14
  { id: 9,  x: 618, y: 68,  w: 50, h: 40 },
  { id: 10, x: 618, y: 120, w: 50, h: 40 },
  { id: 11, x: 618, y: 172, w: 50, h: 40 },
  { id: 12, x: 618, y: 224, w: 50, h: 40 },
  { id: 13, x: 618, y: 276, w: 50, h: 40 },
  { id: 14, x: 618, y: 328, w: 50, h: 40 },
  // Left column 15–21 (15 = Banket)
  { id: 15, x: 12, y: 68,  w: 50, h: 82, isBanket: true },
  { id: 16, x: 12, y: 162, w: 50, h: 40 },
  { id: 17, x: 12, y: 214, w: 50, h: 40 },
  { id: 18, x: 12, y: 266, w: 50, h: 40 },
  { id: 19, x: 12, y: 318, w: 50, h: 40 },
  { id: 20, x: 12, y: 370, w: 50, h: 40 },
  { id: 21, x: 12, y: 422, w: 50, h: 40 },
  // Circular tables 22–23 (bottom-left)
  { id: 22, isCircle: true, cx: 135, cy: 456, r: 24 },
  { id: 23, isCircle: true, cx: 195, cy: 456, r: 24 },
];

const ARRIVAL_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function apiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      const payload = data as { error?: string; detail?: string; message?: string };
      return payload.error ?? payload.detail ?? payload.message ?? "API so'rovida xatolik yuz berdi.";
    }
  }
  if (error instanceof Error) return error.message;
  return 'API bilan aloqa qilishda xatolik yuz berdi.';
}

interface Guests { adults: number; children: number; infants: number; }

// ─── helpers ──────────────────────────────────────────────────
function nodeLabel(n: TNode) {
  if (n.isBanket) return 'B';
  return String(n.id);
}

function nodeCx(n: TNode) {
  if (n.isCircle) return n.cx!;
  return n.x! + n.w! / 2;
}
function nodeCy(n: TNode) {
  if (n.isCircle) return n.cy!;
  return n.y! + n.h! / 2;
}

export function BookingView({ onNavigate, onSetCartTapchan, isLoggedIn, onRequireAuth }: BookingViewProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [banketMode, setBanketMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guests>({ adults: 0, children: 0, infants: 0 });
  const [confirmed, setConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: tapchans = [] } = useGetTapchansQuery();
  const [createBooking] = useCreateBookingMutation();

  const busyIds = useMemo(
    () => tapchans.filter(t => t.status === 'booked').map(t => t.number),
    [tapchans],
  );

  const handleSelect = useCallback((id: number) => {
    if (busyIds.includes(id)) return;
    if (banketMode) {
      setSelectedIds(prev =>
        prev.includes(id)
          ? prev.filter(x => x !== id)
          : prev.length < 6 ? [...prev, id] : prev
      );
    } else {
      setSelectedIds(prev => (prev[0] === id ? [] : [id]));
    }
  }, [banketMode, busyIds]);

  const changeGuest = (key: keyof Guests, delta: number) => {
    setGuests(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const primaryId = selectedIds[0] ?? null;
  const primaryNode = NODES.find(n => n.id === primaryId) ?? null;
  const isBusy = (id: number) => busyIds.includes(id);

  const tapchanPrice = selectedIds.reduce((sum, id) => {
    const base = id === 15 ? 300000 : (NODES.find(n => n.id === id)?.isBanket ? 300000 : 150000);
    return sum + base;
  }, 0);
  const guestPrice = guests.adults * 150000 + guests.children * 80000;
  const totalPrice = tapchanPrice + guestPrice;

  const canConfirm = selectedIds.length > 0 && selectedDate && arrivalTime;

  const handleConfirm = async () => {
    if (!canConfirm || !primaryId) return;

    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }

    const tapchanDbIds = selectedIds
      .map(num => tapchans.find(t => t.number === num)?.id)
      .filter((id): id is number => id !== undefined);

    if (tapchanDbIds.length !== selectedIds.length) {
      setBookingError('Tapchan maʼlumotlari yuklanmadi. Sahifani yangilang.');
      return;
    }

    setSubmitting(true);
    setBookingError('');
    try {
      await createBooking({
        tapchans: tapchanDbIds,
        date: selectedDate,
        arrival_time: arrivalTime!,
        kids_under_6: guests.infants,
        kids_6_12: guests.children,
        adults_13_plus: guests.adults,
      }).unwrap();

      setConfirmed(true);
      onSetCartTapchan(primaryId);
      setTimeout(() => {
        setConfirmed(false);
        onNavigate('menu');
      }, 1600);
    } catch (error) {
      setBookingError(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ padding: '88px clamp(20px,6vw,80px)', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 44, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#BD5B38', marginBottom: 10, fontWeight: 500 }}>
            Tapchanlar xaritasi
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.4vw,42px)', color: '#182422', fontWeight: 600 }}>
            Baseyn atrofidan joy tanlang
          </h2>
        </div>
        <p style={{ color: '#4B5C58', maxWidth: 420, fontSize: 15, lineHeight: 1.6 }}>
          Yashil: bo'sh · Qizil: band · Tanlangan: oltin. Bosing va band qiling.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'start' }} className="map-wrap-grid">

        {/* ── SVG MAP ── */}
        <div style={{ background: '#0A2E2D', borderRadius: 24, padding: '18px 18px 24px', overflow: 'hidden' }}>
          <svg viewBox="0 0 680 500" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Background texture dots */}
            {Array.from({ length: 18 }).map((_, i) =>
              Array.from({ length: 12 }).map((__, j) => (
                <circle key={`${i}-${j}`} cx={i * 40 + 20} cy={j * 44 + 22} r="1" fill="rgba(255,255,255,0.04)"/>
              ))
            )}

            {/* ── Pools ── */}
            {/* Small left pool */}
            <rect x="194" y="92" width="96" height="264" rx="46" fill="#1B7A8C" opacity="0.9"/>
            <rect x="194" y="92" width="96" height="264" rx="46" fill="none" stroke="#7FC2CC" strokeWidth="1.5" opacity="0.6"/>
            {/* Lane lines — small pool */}
            {[148, 192, 236, 280].map(ly => (
              <line key={ly} x1="198" y1={ly} x2="286" y2={ly} stroke="#DCEEEF" strokeWidth="1" opacity="0.25" strokeDasharray="4 4"/>
            ))}
            <text x="242" y="232" textAnchor="middle" fill="#DCEEEF" fontSize="11" fontFamily="'IBM Plex Mono',monospace" opacity="0.7" fontWeight="500">KICHIK</text>

            {/* Large right pool */}
            <rect x="312" y="72" width="136" height="292" rx="56" fill="#1B7A8C"/>
            <rect x="312" y="72" width="136" height="292" rx="56" fill="none" stroke="#7FC2CC" strokeWidth="1.5" opacity="0.5"/>
            {/* Lane lines — large pool */}
            {[140, 182, 224, 266, 308].map(ly => (
              <line key={ly} x1="316" y1={ly} x2="444" y2={ly} stroke="#DCEEEF" strokeWidth="1" opacity="0.2" strokeDasharray="4 4"/>
            ))}
            {/* Water wave shimmer */}
            <path d="M320 218 c8 4 8-4 16 0 s8-4 16 0 s8-4 16 0 s8-4 16 0 s8-4 16 0" stroke="#DCEEEF" strokeWidth="1.2" fill="none" opacity="0.3" strokeLinecap="round"/>
            <text x="380" y="228" textAnchor="middle" fill="#DCEEEF" fontSize="11" fontFamily="'IBM Plex Mono',monospace" opacity="0.7" fontWeight="500">ASOSIY</text>

            {/* ── Tapchans ── */}
            {NODES.map(n => {
              const busy = isBusy(n.id);
              const sel = selectedIds.includes(n.id);
              const fill = busy ? '#5C2A22' : sel ? '#C69A3E' : n.isBanket ? '#14514F' : '#163C3A';
              const stroke = busy ? '#B4523C' : sel ? '#E3C77E' : n.isBanket ? '#4C8C6B' : '#2A6058';
              const textColor = busy ? '#8C4A42' : sel ? '#0E3A39' : n.isBanket ? '#E3C77E' : '#DCEEEF';

              if (n.isCircle) {
                return (
                  <g key={n.id} onClick={() => handleSelect(n.id)} style={{ cursor: busy ? 'not-allowed' : 'pointer' }}>
                    <circle cx={n.cx} cy={n.cy} r={n.r} fill={fill} stroke={stroke} strokeWidth="1.8"/>
                    {sel && <circle cx={n.cx} cy={n.cy} r={(n.r ?? 0) + 4} fill="none" stroke="#E3C77E" strokeWidth="1.5" opacity="0.6"/>}
                    <text x={n.cx} y={(n.cy ?? 0) + 4} textAnchor="middle" fontSize="12" fill={textColor} fontFamily="'IBM Plex Mono',monospace" fontWeight="600" style={{ pointerEvents: 'none' }}>{n.id}</text>
                  </g>
                );
              }

              return (
                <g key={n.id} onClick={() => handleSelect(n.id)} style={{ cursor: busy ? 'not-allowed' : 'pointer' }}>
                  {sel && <rect x={(n.x ?? 0) - 3} y={(n.y ?? 0) - 3} width={(n.w ?? 0) + 6} height={(n.h ?? 0) + 6} rx="8" fill="none" stroke="#E3C77E" strokeWidth="1.5" opacity="0.7"/>}
                  <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5"/>
                  {n.isBanket && (
                    <>
                      <text x={nodeCx(n)} y={nodeCy(n) - 8} textAnchor="middle" fontSize="9" fill="#4C8C6B" fontFamily="'IBM Plex Mono',monospace" fontWeight="600" style={{ pointerEvents: 'none' }}>BANKET</text>
                      <text x={nodeCx(n)} y={nodeCy(n) + 8} textAnchor="middle" fontSize="13" fill={textColor} fontFamily="'IBM Plex Mono',monospace" fontWeight="700" style={{ pointerEvents: 'none' }}>{n.id}</text>
                    </>
                  )}
                  {!n.isBanket && (
                    <text x={nodeCx(n)} y={nodeCy(n) + 5} textAnchor="middle" fontSize="13" fill={textColor} fontFamily="'IBM Plex Mono',monospace" fontWeight="600" style={{ pointerEvents: 'none' }}>
                      {nodeLabel(n)}
                    </text>
                  )}
                  {/* Busy X mark */}
                  {busy && (
                    <>
                      <line x1={(n.x ?? 0) + 6} y1={(n.y ?? 0) + 6} x2={(n.x ?? 0) + (n.w ?? 0) - 6} y2={(n.y ?? 0) + (n.h ?? 0) - 6} stroke="#B4523C" strokeWidth="1.5" opacity="0.5"/>
                      <line x1={(n.x ?? 0) + (n.w ?? 0) - 6} y1={(n.y ?? 0) + 6} x2={(n.x ?? 0) + 6} y2={(n.y ?? 0) + (n.h ?? 0) - 6} stroke="#B4523C" strokeWidth="1.5" opacity="0.5"/>
                    </>
                  )}
                </g>
              );
            })}

            {/* Banket mode selection counter badge */}
            {banketMode && selectedIds.length > 0 && (
              <g>
                <rect x="248" y="456" width="184" height="34" rx="17" fill="#C69A3E"/>
                <text x="340" y="478" textAnchor="middle" fontSize="12" fill="#0E3A39" fontFamily="'Manrope',sans-serif" fontWeight="800">
                  {selectedIds.length} / 6 ta tapchan tanlandi
                </text>
              </g>
            )}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap', paddingLeft: 4 }}>
            {[{ color: '#2A6058', stroke: '#4C8C6B', label: "Bo'sh" }, { color: '#5C2A22', stroke: '#B4523C', label: 'Band' }, { color: '#C69A3E', stroke: '#E3C77E', label: 'Tanlangan' }, { color: '#14514F', stroke: '#4C8C6B', label: 'Banket' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#DCEEEF', fontWeight: 600 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `1.5px solid ${l.stroke}`, display: 'inline-block' }}/>
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{ background: '#F2E8D3', borderRadius: 24, padding: 26, border: '1px solid rgba(14,58,57,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Operating hours badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0E3A39', color: '#E3C77E', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E3C77E" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#E3C77E" strokeWidth="2" strokeLinecap="round"/></svg>
              10:00 – 22:00
            </div>
            {/* Banket toggle */}
            <button
              onClick={() => { setBanketMode(p => !p); if (banketMode) setSelectedIds(prev => prev.slice(0, 1)); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 700,
                background: banketMode ? '#C69A3E' : 'transparent',
                color: banketMode ? '#0E3A39' : '#4B5C58',
                border: `1.5px solid ${banketMode ? '#C69A3E' : 'rgba(14,58,57,0.2)'}`,
                cursor: 'pointer', fontFamily: "'Manrope',sans-serif",
                transition: '.2s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Banket
            </button>
          </div>

          {/* Tapchan info */}
          {selectedIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#4B5C58' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }}>
                <path d="M3 21V10l9-6 9 6v11h-6v-6H9v6H3z" stroke="#4B5C58" strokeWidth="1.5"/>
              </svg>
              <p style={{ fontSize: 13.5 }}>Xaritadan tapchan tanlang</p>
              {banketMode && <p style={{ fontSize: 12, color: '#BD5B38', marginTop: 6, fontWeight: 600 }}>Banket rejimi: 6 tagacha tanlov</p>}
            </div>
          ) : (
            <div>
              {confirmed ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(76,140,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#4C8C6B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ color: '#4C8C6B', fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", fontSize: 18 }}>Bron qilindi!</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#182422', fontWeight: 600 }}>
                      {banketMode && selectedIds.length > 1
                        ? `${selectedIds.length} ta tapchan`
                        : `Tapchan #${primaryId}`}
                    </div>
                    {primaryNode?.isBanket && <div style={{ fontSize: 11, color: '#4C8C6B', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Banket zonasi</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: 'rgba(76,140,107,0.12)', color: '#4C8C6B', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Bo'sh
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Date picker */}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#4B5C58', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: "'Manrope',sans-serif" }}>
              Sana
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
                border: '1.5px solid rgba(14,58,57,0.2)', background: '#fff',
                color: '#182422', fontFamily: "'Manrope',sans-serif", outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Arrival time */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#4B5C58', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Manrope',sans-serif" }}>
                Kelish vaqti
              </label>
              {arrivalTime && (
                <span style={{ fontSize: 11.5, color: '#4C8C6B', fontWeight: 600 }}>
                  {arrivalTime} – Kechgacha (22:00)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ARRIVAL_SLOTS.map(s => {
                const sel = arrivalTime === s;
                return (
                  <button key={s} onClick={() => setArrivalTime(s)} style={{
                    padding: '7px 11px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                    background: sel ? '#0E3A39' : '#fff',
                    color: sel ? '#fff' : '#182422',
                    border: `1px solid ${sel ? '#0E3A39' : 'rgba(14,58,57,0.15)'}`,
                    cursor: 'pointer', fontFamily: "'Manrope',sans-serif",
                  }}>
                    {s}
                  </button>
                );
              })}
            </div>
            {!arrivalTime && (
              <p style={{ fontSize: 11.5, color: '#4B5C58', marginTop: 6, fontStyle: 'italic' }}>
                Kelish vaqtini tanlang — kechgacha to'liq kun
              </p>
            )}
          </div>

          {/* Guest counter */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#4B5C58', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Manrope',sans-serif", marginBottom: 2 }}>
              Mehmonlar soni
            </div>
            {[
              { key: 'adults' as keyof Guests, label: '13 yoshdan katta', price: '150 000 so\'m', priceNum: 150000, color: '#0E3A39' },
              { key: 'children' as keyof Guests, label: '6–12 yosh', price: '80 000 so\'m', priceNum: 80000, color: '#14514F' },
              { key: 'infants' as keyof Guests, label: '6 yoshdan kichik', price: 'Tekin', priceNum: 0, color: '#4C8C6B' },
            ].map(row => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#182422', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.label}</div>
                  <div style={{ fontSize: 11.5, color: row.priceNum === 0 ? '#4C8C6B' : '#4B5C58', fontFamily: "'IBM Plex Mono',monospace", fontWeight: row.priceNum === 0 ? 700 : 500 }}>{row.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => changeGuest(row.key, -1)} disabled={guests[row.key] === 0} style={{ width: 28, height: 28, borderRadius: '50%', background: guests[row.key] === 0 ? '#F2E8D3' : '#0E3A39', color: guests[row.key] === 0 ? '#b7ada0' : '#fff', fontSize: 16, border: 'none', cursor: guests[row.key] === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    −
                  </button>
                  <span style={{ width: 24, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 700, color: '#182422' }}>{guests[row.key]}</span>
                  <button onClick={() => changeGuest(row.key, 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#0E3A39', color: '#fff', fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          {(totalPrice > 0 || selectedIds.length > 0) && (
            <div style={{ background: 'linear-gradient(135deg, #0E3A39, #14514F)', borderRadius: 14, padding: '14px 18px', color: '#FBF6EB' }}>
              {selectedIds.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#DCEEEF', marginBottom: 6 }}>
                  <span>Tapchan ({selectedIds.length} ta)</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{tapchanPrice.toLocaleString('ru-RU')} so'm</span>
                </div>
              )}
              {guestPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#DCEEEF', marginBottom: 6 }}>
                  <span>Mehmonlar ({guests.adults + guests.children} kishi)</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{guestPrice.toLocaleString('ru-RU')} so'm</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 4 }}>
                <span>Jami</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#E3C77E' }}>{totalPrice.toLocaleString('ru-RU')} so'm</span>
              </div>
            </div>
          )}

          {/* Confirm button */}
          {bookingError && (
            <p style={{ fontSize: 12.5, color: '#B4523C', fontWeight: 600, textAlign: 'center' }}>{bookingError}</p>
          )}
          <button
            disabled={!canConfirm || submitting}
            onClick={() => void handleConfirm()}
            style={{
              width: '100%', padding: '15px', borderRadius: 100, fontSize: 14.5, fontWeight: 700,
              background: canConfirm && !submitting ? '#0E3A39' : 'rgba(14,58,57,0.25)',
              color: canConfirm && !submitting ? '#fff' : '#4B5C58',
              border: 'none', cursor: canConfirm && !submitting ? 'pointer' : 'not-allowed',
              fontFamily: "'Manrope',sans-serif",
              transition: '.2s',
            }}
          >
            {submitting ? 'Bron qilinmoqda...' : banketMode ? `Banket bron qilish (${selectedIds.length}/6)` : 'Bron qilish'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .map-wrap-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
