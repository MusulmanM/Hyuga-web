import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const DEFAULT_API_URL = 'http://127.0.0.1:8000/api/v1/';

// ✅ Vite env xatosini oldini olish
const getApiUrl = (): string => {
  try {
    const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envUrl) return envUrl.replace(/\/?$/, '/');
  } catch {
    // ignore
  }
  return DEFAULT_API_URL;
};

export const API_BASE_URL = getApiUrl();

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function mediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getApiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const payload = error as { status?: string | number; error?: string; data?: unknown };
    if (payload.status === 'FETCH_ERROR' || payload.error === 'Failed to fetch') {
      return "Backend server ishlamayapti. Avval 'python manage.py runserver' ni ishga tushiring (port 8000).";
    }
    if ('data' in payload) {
      const data = payload.data;
      if (typeof data === 'string') return data;
      if (typeof data === 'object' && data !== null) {
        const body = data as { error?: string; detail?: string; message?: string };
        return body.error ?? body.detail ?? body.message ?? "API so'rovida xatolik yuz berdi.";
      }
    }
  }
  if (error instanceof Error) return error.message;
  return 'API bilan aloqa qilishda xatolik yuz berdi.';
}

function getStoredToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  foods: FoodItem[];
}

export interface CartItem {
  id: number;
  food: number;
  food_name: string;
  food_price: string;
  quantity: number;
  total_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
}

export interface OrderItem {
  id: number;
  food_name: string;
  price: string;
  quantity: number;
  total_price: string;
}

export interface Order {
  id: number;
  tapchan_number: number | null;
  status: 'pending' | 'preparing' | 'delivered';
  payment_method: 'click' | 'terminal' | 'cash' | null;
  is_paid: boolean;
  order_items: OrderItem[];
  total_amount: string;
  created_at: string;
}

export interface TapchanTable {
  id: number;
  number: number;
  item_type: 'tapchan' | 'table';
  status: 'free' | 'booked';
  is_banket_zone: boolean;
}

export interface BookingPayload {
  tapchans: number[];
  date: string;
  arrival_time: string;
  kids_under_6: number;
  kids_6_12: number;
  adults_13_plus: number;
}

export interface Booking {
  id: number;
  tapchans: number[];
  date: string;
  arrival_time: string;
  kids_under_6: number;
  kids_6_12: number;
  adults_13_plus: number;
  total_booking_price: string;
}

export interface GalleryPhoto {
  id: number;
  image: string;
}

export interface VerifyOtpResponse {
  access: string;
  refresh: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getStoredToken();
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Menu', 'Cart', 'Orders', 'Tapchans', 'Gallery'],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<{ message: string; phone_number: string }, { phone_number: string }>({
      query: (body) => ({
        url: 'users/send-otp/',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, { phone_number: string; otp_code: string }>({
      query: (body) => ({
        url: 'users/verify-otp/',
        method: 'POST',
        body,
      }),
    }),
    getMenu: builder.query<MenuCategory[], void>({
      query: () => 'kitchen/categories/',
      providesTags: ['Menu'],
    }),
    getCart: builder.query<Cart, void>({
      query: () => 'kitchen/cart/me/',
      providesTags: ['Cart'],
    }),
    addCartItem: builder.mutation<Cart, { food_id: number; quantity?: number }>({
      query: (body) => ({
        url: 'kitchen/cart/add-item/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    changeCartItemQuantity: builder.mutation<Cart, { food_id: number; delta: number }>({
      query: (body) => ({
        url: 'kitchen/cart/change-quantity/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<Cart, void>({
      query: () => ({
        url: 'kitchen/cart/clear/',
        method: 'POST',
      }),
      invalidatesTags: ['Cart'],
    }),
    submitCartToTapchan: builder.mutation<{ message: string; order_id: number }, { tapchan_number: number }>({
      query: (body) => ({
        url: 'kitchen/cart/submit-to-tapchan/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart', 'Orders'],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => 'kitchen/check/',
      providesTags: ['Orders'],
    }),
    payOrder: builder.mutation<{ message: string }, { orderId: number; payment_method: 'click' | 'terminal' | 'cash' }>({
      query: ({ orderId, payment_method }) => ({
        url: `kitchen/check/${orderId}/pay/`,
        method: 'POST',
        body: { payment_method },
      }),
      invalidatesTags: ['Orders'],
    }),
    getTapchans: builder.query<TapchanTable[], void>({
      query: () => 'map/zones/',
      providesTags: ['Tapchans'],
    }),
    createBooking: builder.mutation<Booking, BookingPayload>({
      query: (body) => ({
        url: 'map/reserve/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tapchans'],
    }),
    getGallery: builder.query<GalleryPhoto[], void>({
      query: () => 'home/photos/',
      providesTags: ['Gallery'],
    }),
      // ✅ QR kodni skanerlash (GET mutation)
    scanQr: builder.mutation<{ message: string; tapchan_number: number; tapchan_id?: number; qr_code?: string }, { tapchan: number }>({
      query: ({ tapchan }) => ({
        url: `qr/codes/scan/?tapchan=${tapchan}`,
        method: 'GET',
      }),
    }),

    // ✅ ADMIN: Barcha QR kodlarni generatsiya qilish
    generateAllQr: builder.query<{
      message: string;
      count: number;
      qr_codes: Array<{
        tapchan_number: number;
        tapchan_id: number;
        qr_url: string;
        qr_text: string;
        svg_base64: string;
        created: boolean;
      }>;
    }, void>({
      query: () => 'qr/codes/generate-all/',
    }),

    // ✅ ADMIN: Bitta QR kodni olish
    getQrImage: builder.query<{
      tapchan_number: number;
      qr_url: string;
      qr_text: string;
      svg_base64: string;
    }, number>({
      query: (id) => `qr/codes/${id}/image/`,
    }),
  }),
});

export const {
  useAddCartItemMutation,
  useChangeCartItemQuantityMutation,
  useClearCartMutation,
  useCreateBookingMutation,
  useGetCartQuery,
  useGetGalleryQuery,
  useGetMenuQuery,
  useGetOrdersQuery,
  useGetTapchansQuery,
  usePayOrderMutation,
  useScanQrMutation,        // ✅ QR skanerlash
  useSendOtpMutation,
  useSubmitCartToTapchanMutation,
  useVerifyOtpMutation,
  useGenerateAllQrQuery,    // ✅ ADMIN: barcha QR
  useGetQrImageQuery,       // ✅ ADMIN: bitta QR
} = api;
