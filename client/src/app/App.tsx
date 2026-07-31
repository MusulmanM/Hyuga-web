import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { BookingView } from './components/BookingView';
import { MenuView } from './components/MenuView';
import { QRView } from './components/QRView';
import { AdminQRView } from './components/AdminQRView';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CheckModal } from './components/CheckModal';
import {
  useAddCartItemMutation,
  useChangeCartItemQuantityMutation,
  useGetCartQuery,
  useGetOrdersQuery,
  usePayOrderMutation,
  useSubmitCartToTapchanMutation,
  getApiErrorMessage,
  type Cart,
  type Order,
} from './services/api';

type View = 'home' | 'booking' | 'menu' | 'qr' | 'adminQR';
type ToastKind = 'success' | 'error';

interface MenuItem {
  id: string;
  backendId?: number;
  name: string;
  desc: string;
  price: number;
  color: string;
  image?: string | null;
}

interface CartEntry {
  item: MenuItem;
  qty: number;
}

const FOOD_COLORS = ['#C69A3E', '#BD5B38', '#E3C77E', '#4C8C6B', '#1B7A8C', '#7FC2CC'];

function numberFromApi(value: string | number | undefined) {
  if (value === undefined) return 0;
  return Number(value);
}

function apiErrorMessage(error: unknown) {
  return getApiErrorMessage(error);
}

function cartFromApi(cart?: Cart): Record<string, CartEntry> {
  if (!cart) return {};

  return cart.items.reduce<Record<string, CartEntry>>((acc, entry, index) => {
    const id = String(entry.food);
    acc[id] = {
      item: {
        id,
        backendId: entry.food,
        name: entry.food_name,
        desc: '',
        price: numberFromApi(entry.food_price),
        color: FOOD_COLORS[index % FOOD_COLORS.length],
      },
      qty: entry.quantity,
    };
    return acc;
  }, {});
}

function ordersFromApi(orders: Order[]): Record<string, CartEntry> {
  return orders
    .filter(order => !order.is_paid)
    .flatMap(order => order.order_items.map((item, index) => ({ order, item, index })))
    .reduce<Record<string, CartEntry>>((acc, { order, item, index }) => {
      const id = `order-${order.id}-${item.id}`;
      acc[id] = {
        item: {
          id,
          name: item.food_name,
          desc: '',
          price: numberFromApi(item.price),
          color: FOOD_COLORS[index % FOOD_COLORS.length],
        },
        qty: item.quantity,
      };
      return acc;
    }, {});
}

function updateLocalCart(prev: Record<string, CartEntry>, id: string, delta: number) {
  const entry = prev[id];
  if (!entry) return prev;

  const nextQty = entry.qty + delta;
  if (nextQty <= 0) {
    const next = { ...prev };
    delete next[id];
    return next;
  }

  return { ...prev, [id]: { ...entry, qty: nextQty } };
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('home');
  const [localCart, setLocalCart] = useState<Record<string, CartEntry>>({});
  const [orderedTapchan, setOrderedTapchan] = useState<number | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('accessToken')));
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('userPhone') ?? '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const [showCheckModal, setShowCheckModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastKind, setToastKind] = useState<ToastKind>('success');

  const { data: apiCart } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const { data: orders = [] } = useGetOrdersQuery(undefined, {
    skip: !isLoggedIn,
    pollingInterval: isLoggedIn ? 15000 : 0,
  });

  const [addCartItem] = useAddCartItemMutation();
  const [changeCartItemQuantity] = useChangeCartItemQuantityMutation();
  const [submitCartToTapchan] = useSubmitCartToTapchanMutation();
  const [payOrder] = usePayOrderMutation();

  const cart = useMemo(() => (isLoggedIn ? cartFromApi(apiCart) : localCart), [apiCart, isLoggedIn, localCart]);
  const activeOrders = useMemo(() => (isLoggedIn ? ordersFromApi(orders) : {}), [isLoggedIn, orders]);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToastKind(kind);
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const navigate = useCallback((view: View) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToCart = useCallback(async (item: MenuItem) => {
    if (isLoggedIn) {
      if (!item.backendId) {
        showToast("Bu taom backend menyudan kelmagan, savatga qo'shib bo'lmadi.", 'error');
        return;
      }

      try {
        await addCartItem({ food_id: item.backendId, quantity: 1 }).unwrap();
      } catch (error) {
        showToast(apiErrorMessage(error), 'error');
      }
      return;
    }

    setLocalCart(prev => {
      const entry = prev[item.id];
      return { ...prev, [item.id]: { item, qty: (entry?.qty ?? 0) + 1 } };
    });
  }, [addCartItem, isLoggedIn, showToast]);

  const changeQty = useCallback(async (id: string, delta: number) => {
    const entry = cart[id];
    if (!entry) return;

    if (isLoggedIn) {
      if (!entry.item.backendId) {
        showToast("Bu savat elementi backend bilan bog'lanmagan.", 'error');
        return;
      }

      try {
        await changeCartItemQuantity({ food_id: entry.item.backendId, delta }).unwrap();
      } catch (error) {
        showToast(apiErrorMessage(error), 'error');
      }
      return;
    }

    setLocalCart(prev => updateLocalCart(prev, id, delta));
  }, [cart, changeCartItemQuantity, isLoggedIn, showToast]);

  const syncLocalCartToBackend = useCallback(async () => {
    const entries = Object.values(localCart);
    for (const entry of entries) {
      if (!entry.item.backendId) {
        throw new Error("Demo taomni backend savatiga yuborib bo'lmadi. Menyu API ishlayotganini tekshiring.");
      }
      await addCartItem({ food_id: entry.item.backendId, quantity: entry.qty }).unwrap();
    }
    setLocalCart({});
  }, [addCartItem, localCart]);

  const submitCurrentCart = useCallback(async () => {
    if (!orderedTapchan) {
      showToast('Avval tapchan tanlang yoki QR orqali aniqlang.', 'error');
      return;
    }

    try {
      const result = await submitCartToTapchan({ tapchan_number: orderedTapchan }).unwrap();
      showToast(result.message ?? `Buyurtma Tapchan #${orderedTapchan} ga yuborildi.`);
    } catch (error) {
      showToast(apiErrorMessage(error), 'error');
    }
  }, [orderedTapchan, showToast, submitCartToTapchan]);

  const handlePlaceOrderIntent = useCallback(() => {
    if (!isLoggedIn) {
      setPendingSubmit(true);
      setShowAuthModal(true);
      return;
    }

    void submitCurrentCart();
  }, [isLoggedIn, submitCurrentCart]);

  const handleAuthSuccess = useCallback(async (phone: string) => {
    setIsLoggedIn(true);
    setUserPhone(phone);
    localStorage.setItem('userPhone', phone);
    setShowAuthModal(false);

    if (pendingSubmit) {
      setPendingSubmit(false);
      try {
        await syncLocalCartToBackend();
        await submitCurrentCart();
      } catch (error) {
        showToast(apiErrorMessage(error), 'error');
      }
    }
  }, [pendingSubmit, showToast, submitCurrentCart, syncLocalCartToBackend]);

  const requestAuth = useCallback(() => {
    setPendingSubmit(false);
    setShowAuthModal(true);
    showToast('Davom etish uchun telefon raqam orqali kiring.', 'error');
  }, [showToast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userPhone');
    setIsLoggedIn(false);
    setUserPhone('');
    setLocalCart({});
    showToast('Tizimdan chiqdingiz.');
  }, [showToast]);

  const handlePaymentComplete = useCallback(async (paymentMethod: 'click' | 'terminal' | 'cash') => {
    const unpaidOrders = orders.filter(order => !order.is_paid);
    await Promise.all(unpaidOrders.map(order => payOrder({ orderId: order.id, payment_method: paymentMethod }).unwrap()));
    showToast("To'lov muvaffaqiyatli amalga oshirildi.");
  }, [orders, payOrder, showToast]);

  const cartCount = Object.values(cart).reduce((sum, entry) => sum + entry.qty, 0);

  // URL path-based routing: /admin/qr -> adminQR, ?tapchan=N -> qr
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();

    if (path === '/admin-1324' || path === '/admin-1324/') {
      setActiveView('adminQR');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tapchan = Number(params.get('tapchan'));
    if (Number.isFinite(tapchan) && tapchan >= 1 && tapchan <= 23) {
      setOrderedTapchan(tapchan);
      setActiveView('qr');
    }
  }, []);

  const isAdminView = activeView === 'adminQR';

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: '#FBF6EB', color: '#182422', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      {!isAdminView && <TopBar activeView={activeView as any} onNavigate={navigate as any} cartCount={cartCount} />}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toastKind === 'success' ? '#4C8C6B' : '#B4523C',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 100,
          fontWeight: 700,
          fontSize: 14.5,
          zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontFamily: "'Manrope', sans-serif",
          animation: 'toastIn .4s ease',
          whiteSpace: 'nowrap',
        }}>
          {toastMessage}
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => { setShowAuthModal(false); setPendingSubmit(false); }}
        />
      )}

      {showCheckModal && (
        <CheckModal
          activeOrders={activeOrders}
          orderedTapchan={orderedTapchan}
          onClose={() => setShowCheckModal(false)}
          onNavigate={(view) => { navigate(view); setShowCheckModal(false); }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <div style={{ display: activeView === 'home' ? 'block' : 'none' }}>
        <HomeView onNavigate={navigate} />
      </div>
      <div style={{ display: activeView === 'booking' ? 'block' : 'none' }}>
        <BookingView
          isLoggedIn={isLoggedIn}
          onNavigate={navigate}
          onRequireAuth={requestAuth}
          onSetCartTapchan={setOrderedTapchan}
        />
      </div>
      <div style={{ display: activeView === 'menu' ? 'block' : 'none' }}>
        <MenuView
          cart={cart}
          activeOrders={activeOrders}
          orderedTapchan={orderedTapchan}
          isLoggedIn={isLoggedIn}
          userPhone={userPhone}
          onAddToCart={addToCart}
          onChangeQty={changeQty}
          onPlaceOrderIntent={handlePlaceOrderIntent}
          onCheckOpen={() => setShowCheckModal(true)}
          onLogout={handleLogout}
        />
      </div>
      <div style={{ display: activeView === 'qr' ? 'block' : 'none' }}>
        <QRView onSetCartTapchan={setOrderedTapchan} onNavigate={navigate} />
      </div>
      <div style={{ display: isAdminView ? 'block' : 'none' }}>
        <AdminQRView />
      </div>

      {!isAdminView && <Footer onNavigate={navigate} />}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; }
        ::selection { background: #E3C77E; color: #0E3A39; }
        @keyframes toastIn { from{opacity:0;transform:translateY(8px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
      `}</style>
    </div>
  );
}
