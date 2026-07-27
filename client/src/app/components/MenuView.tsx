import { useEffect, useMemo, useState } from 'react';
import { useGetMenuQuery } from '../services/api';

interface MenuItem {
  id: string;
  backendId?: number;
  name: string;
  desc: string;
  price: number;
  color: string;
  image?: string | null;
}

interface MenuData {
  [category: string]: MenuItem[];
}

interface CartEntry {
  item: MenuItem;
  qty: number;
}

interface MenuViewProps {
  cart: Record<string, CartEntry>;
  activeOrders: Record<string, CartEntry>;
  orderedTapchan: number | null;
  isLoggedIn: boolean;
  userPhone: string;
  onAddToCart: (item: MenuItem) => void;
  onChangeQty: (id: string, delta: number) => void;
  onPlaceOrderIntent: () => void;
  onCheckOpen: () => void;
  onLogout: () => void;
}

const MENU_DATA: MenuData = {
  "Milliy taomlar": [
    { id: 'm1', name: "Osh (lag'mon qozon)", desc: "Qo'y go'shti, sabzi, no'xat bilan an'anaviy osh", price: 45000, color: '#C69A3E' },
    { id: 'm2', name: "Shashlik (qo'y)", desc: "Ko'mirda pishirilgan, piyoz va nonushta bilan", price: 38000, color: '#BD5B38' },
    { id: 'm3', name: "Manti", desc: "Bug'da pishirilgan, qatiq bilan xizmat qilinadi", price: 32000, color: '#E3C77E' },
    { id: 'm4', name: "Norin", desc: "Yupqa xamir va go'sht bilan sovuq taom", price: 34000, color: '#C69A3E' },
  ],
  "Grill": [
    { id: 'g1', name: "Tovuq lyulya", desc: "Ziravorlangan tovuq go'shti, ko'mirda", price: 36000, color: '#BD5B38' },
    { id: 'g2', name: "Mol biftek", desc: "Grillda o'rtacha pishirilgan biftek", price: 52000, color: '#A14A2C' },
    { id: 'g3', name: "Sabzavot grill", desc: "Baqlajon, qalampir, pomidor ko'mirda", price: 24000, color: '#4C8C6B' },
  ],
  "Ichimliklar": [
    { id: 'i1', name: "Ko'k choy (choynak)", desc: "An'anaviy choynakda, 2 kishilik", price: 12000, color: '#1B7A8C' },
    { id: 'i2', name: "Uzum sharbati", desc: "Yangi siqilgan, muzli", price: 18000, color: '#7FC2CC' },
    { id: 'i3', name: "Ayron", desc: "Sovutilgan, milliy retsept", price: 14000, color: '#DCEEEF' },
  ],
  "Shirinliklar": [
    { id: 's1', name: "Halva assorti", desc: "Yong'oqli va tahin halva to'plami", price: 22000, color: '#C69A3E' },
    { id: 's2', name: "Meva taxti", desc: "Fasldagi mevalar, tarash qilingan", price: 28000, color: '#BD5B38' },
  ],
};

const FOOD_COLORS = ['#C69A3E', '#BD5B38', '#E3C77E', '#4C8C6B', '#1B7A8C', '#7FC2CC'];

export function MenuView({ cart, activeOrders, orderedTapchan, isLoggedIn, userPhone, onAddToCart, onChangeQty, onPlaceOrderIntent, onCheckOpen, onLogout }: MenuViewProps) {
  const [activeCat, setActiveCat] = useState(Object.keys(MENU_DATA)[0]);
  const { data: categories = [], isFetching, isError } = useGetMenuQuery();

  const apiMenuData = useMemo(() => {
    return categories.reduce<MenuData>((acc, category) => {
      const foods = category.foods
        .filter(food => food.is_available)
        .map((food, index) => ({
          id: String(food.id),
          backendId: food.id,
          name: food.name,
          desc: food.description,
          price: Number(food.price),
          color: FOOD_COLORS[index % FOOD_COLORS.length],
          image: food.image,
        }));

      if (foods.length > 0) acc[category.name] = foods;
      return acc;
    }, {});
  }, [categories]);

  const hasApiMenu = Object.keys(apiMenuData).length > 0;
  const menuData = hasApiMenu ? apiMenuData : MENU_DATA;
  const categoryNames = useMemo(() => Object.keys(menuData), [menuData]);

  useEffect(() => {
    if (categoryNames.length > 0 && !menuData[activeCat]) {
      setActiveCat(categoryNames[0]);
    }
  }, [activeCat, categoryNames, menuData]);

  const cartKeys = Object.keys(cart);
  const cartCount = cartKeys.reduce((a, k) => a + cart[k].qty, 0);
  const cartTotal = cartKeys.reduce((a, k) => a + cart[k].item.price * cart[k].qty, 0);

  const activeOrderCount = Object.values(activeOrders).reduce((a, e) => a + e.qty, 0);
  const activeOrderTotal = Object.values(activeOrders).reduce((a, e) => a + e.item.price * e.qty, 0);
  const hasActiveOrders = activeOrderCount > 0;

  return (
    <section style={{ padding: '88px clamp(20px,6vw,80px)', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 44, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#BD5B38', marginBottom: 10, fontWeight: 500 }}>
            {orderedTapchan ? `Tapchan #${orderedTapchan} · Menyu` : 'Menyu'}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.4vw,42px)', color: '#182422', fontWeight: 600 }}>
            Tapchaningizga buyurtma bering
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLoggedIn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(14,58,57,0.08)', borderRadius: 100, padding: '7px 14px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0E3A39', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#E3C77E" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="#E3C77E" strokeWidth="2"/></svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#182422', fontFamily: "'Manrope',sans-serif" }}>{userPhone}</span>
              </div>
              <button onClick={onLogout} style={{ fontSize: 12.5, fontWeight: 700, color: '#B4523C', background: 'transparent', border: '1.5px solid rgba(180,82,60,0.3)', borderRadius: 100, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }}>
                Chiqish
              </button>
            </div>
          )}
          <p style={{ color: '#4B5C58', maxWidth: 320, fontSize: 15, lineHeight: 1.6 }}>
            Tanlangan taomlar to'g'ridan-to'g'ri sizning tapchaningizga olib kelinadi.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="menu-layout-grid">
        {/* ── FOOD GRID ── */}
        <div>
          {(isFetching || isError || !hasApiMenu) && (
            <div style={{ marginBottom: 18, color: isError ? '#B4523C' : '#4B5C58', fontSize: 13, fontWeight: 600 }}>
              {isFetching
                ? 'Menyu backenddan yuklanmoqda...'
                : isError
                  ? "Backend menyu API javob bermadi. Vaqtincha demo menyu ko'rsatilmoqda."
                  : "Backend menyuda taomlar hali yo'q. Vaqtincha demo menyu ko'rsatilmoqda."}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 30, flexWrap: 'wrap' }}>
            {categoryNames.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '9px 18px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, background: activeCat === cat ? '#0E3A39' : '#F2E8D3', color: activeCat === cat ? '#fff' : '#4B5C58', border: '1px solid transparent', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }} className="food-grid-cols">
            {(menuData[activeCat] ?? []).map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(14,58,57,0.08)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 120, background: item.color, position: 'relative', overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.18 }}>
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/></svg>
                    </div>
                  )}
                  {cart[item.id] && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#0E3A39', color: '#fff', borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
                      {cart[item.id].qty}x
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: '#182422', fontWeight: 700 }}>{item.name}</h4>
                  <p style={{ fontSize: 12.5, color: '#4B5C58', lineHeight: 1.5, flex: 1 }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 14, color: '#182422' }}>{item.price.toLocaleString('ru-RU')} so'm</span>
                    <button onClick={() => onAddToCart(item)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#BD5B38', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CART SIDEBAR ── */}
        <div style={{ background: '#0E3A39', color: '#FBF6EB', borderRadius: 22, padding: 26, position: 'sticky', top: 100 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, marginBottom: 4, fontWeight: 600 }}>Buyurtma savati</h3>
          <div style={{ fontSize: 12.5, color: '#DCEEEF', marginBottom: 18 }}>
            {cartCount ? `${cartCount} ta taom tanlandi` : "Taomlarni tanlab qo'shing"}
          </div>

          {orderedTapchan && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18, fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21V10l9-6 9 6v11h-6v-6H9v6H3z" stroke="#E3C77E" strokeWidth="1.6"/></svg>
              <span>Tapchan #{orderedTapchan} ga yetkaziladi</span>
            </div>
          )}

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18, maxHeight: 220, overflowY: 'auto' }}>
            {cartKeys.length === 0 ? (
              <div style={{ fontSize: 13.5, color: '#DCEEEF', padding: '16px 0', textAlign: 'center' }}>Savat hozircha bo'sh</div>
            ) : (
              cartKeys.map(k => {
                const entry = cart[k];
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                    <span>
                      <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 7px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, marginRight: 8 }}>{entry.qty}x</span>
                      {entry.item.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{(entry.item.price * entry.qty).toLocaleString('ru-RU')}</span>
                      <button onClick={() => onChangeQty(k, -1)} style={{ background: 'transparent', color: '#E3C77E', fontSize: 16, border: 'none', cursor: 'pointer' }}>−</button>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.14)', marginBottom: 16 }}>
            <span>Jami</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: '#E3C77E' }}>{cartTotal.toLocaleString('ru-RU')} so'm</span>
          </div>

          {/* PRIMARY: Place order button */}
          <button
            disabled={!(cartCount > 0 && orderedTapchan)}
            onClick={onPlaceOrderIntent}
            style={{
              width: '100%', padding: '14px', borderRadius: 100, fontSize: 14, fontWeight: 700,
              background: cartCount > 0 && orderedTapchan ? '#C69A3E' : 'rgba(198,154,62,0.25)',
              color: cartCount > 0 && orderedTapchan ? '#0E3A39' : 'rgba(198,154,62,0.5)',
              border: 'none', cursor: cartCount > 0 && orderedTapchan ? 'pointer' : 'not-allowed',
              fontFamily: "'Manrope',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 10,
            }}
          >
            {!isLoggedIn && cartCount > 0 && orderedTapchan && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            )}
            Buyurtmani tapchanga yuborish
          </button>

          {/* SECONDARY: Check button */}
          <button
            onClick={hasActiveOrders ? onCheckOpen : undefined}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 100, fontSize: 13.5, fontWeight: 700,
              background: 'transparent',
              color: hasActiveOrders ? '#E3C77E' : 'rgba(220,238,239,0.3)',
              border: `1.5px solid ${hasActiveOrders ? 'rgba(198,154,62,0.5)' : 'rgba(220,238,239,0.12)'}`,
              cursor: hasActiveOrders ? 'pointer' : 'not-allowed',
              fontFamily: "'Manrope',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: '.2s',
            }}
          >
            {/* Receipt icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Check
            {hasActiveOrders && (
              <span style={{ background: '#C69A3E', color: '#0E3A39', borderRadius: 100, fontSize: 10.5, fontWeight: 800, padding: '1px 7px', marginLeft: 2 }}>
                {activeOrderCount} · {activeOrderTotal.toLocaleString('ru-RU')} so'm
              </span>
            )}
          </button>

          {/* Login hint when not logged in */}
          {!isLoggedIn && cartCount > 0 && orderedTapchan && (
            <p style={{ fontSize: 11.5, color: 'rgba(220,238,239,0.55)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              Buyurtma berish uchun telefon raqam talab qilinadi
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) { .menu-layout-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .food-grid-cols { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
