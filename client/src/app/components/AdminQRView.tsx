import { useState } from 'react';
import { useGenerateAllQrQuery } from '../services/api';

export function AdminQRView() {
  const [showQR, setShowQR] = useState(false);

  const { data, isLoading, error, isError } = useGenerateAllQrQuery(undefined, {
    skip: !showQR,
  });

  // Xatolikni aniqroq ko'rsatish
  const getErrorMessage = () => {
    if (!isError) return null;

    const err = error as any;

    if (err?.status === 'FETCH_ERROR') {
      return "❌ Backend server ishlamayapti. Iltimos, serverni tekshiring.";
    }

    if (err?.status === 401) {
      return "🔒 Avtorizatsiya talab qilinadi. Iltimos, login qiling.";
    }

    if (err?.status === 403) {
      return "🚫 Sizda ruxsat yo'q. Faqat adminlar ko'rishi mumkin.";
    }

    if (err?.status >= 500) {
      return "⚠️ Server xatosi. Iltimos, keyinroq qayta urinib ko'ring.";
    }

    return "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
  };

  return (
    <section style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: 32,
        color: '#182422',
        marginBottom: 12
      }}>
        🏊‍♂️ Admin Panel — QR Kodlar
      </h1>

      <p style={{ color: '#4B5C58', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Barcha 23 ta tapchan uchun QR kodlarni generatsiya qiling va chop eting.
        Har bir QR kod telefon kamerasi bilan skanerlansa, avtomatik menu sahifasiga yo'naltiradi.
      </p>

      <button
        onClick={() => setShowQR(!showQR)}
        style={{
          padding: '12px 24px',
          background: showQR ? '#BD5B38' : '#0E3A39',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 30,
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        {showQR ? '🔼 QR kodlarni yashirish' : "🔽 Barcha QR kodlarni ko'rsatish"}
      </button>

      {isLoading && (
        <p style={{ color: '#4B5C58', fontSize: 14 }}>
          ⏳ QR kodlar yuklanmoqda...
        </p>
      )}

      {isError && (
        <div style={{
          padding: '16px 20px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 12,
          color: '#B4523C',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 20,
        }}>
          {getErrorMessage()}
        </div>
      )}

      {data?.qr_codes && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 24
        }}>
          {data.qr_codes.map((qr: any) => (
            <div
              key={qr.tapchan_number}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                border: '1px solid rgba(14,58,57,0.1)',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 24,
                color: '#182422',
                marginBottom: 16
              }}>
                Tapchan #{qr.tapchan_number}
              </h3>

              {/* QR kod rasm */}
              <img
                src={qr.svg_base64}
                alt={`QR kod ${qr.tapchan_number}`}
                style={{
                  width: 180,
                  height: 180,
                  margin: '0 auto 16px',
                  display: 'block',
                }}
              />

              {/* URL */}
              <p style={{
                fontSize: 11,
                color: '#4B5C58',
                fontFamily: "'IBM Plex Mono',monospace",
                wordBreak: 'break-all',
                marginBottom: 12,
                padding: '8px 12px',
                background: '#F2E8D3',
                borderRadius: 8,
              }}>
                {qr.qr_url}
              </p>

              {/* QR matn */}
              <p style={{
                fontSize: 12,
                color: '#BD5B38',
                fontFamily: "'IBM Plex Mono',monospace",
                marginBottom: 16,
              }}>
                {qr.qr_text}
              </p>

              {/* Chop etish tugmasi */}
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Tapchan #${qr.tapchan_number}</title>
                          <style>
                            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                            .qr-container { text-align: center; }
                            h2 { color: #182422; margin-bottom: 20px; }
                            img { width: 300px; height: 300px; }
                            p { color: #4B5C58; font-size: 12px; margin-top: 16px; }
                          </style>
                        </head>
                        <body>
                          <div class="qr-container">
                            <h2>Hyuga Swimming Pool</h2>
                            <h3>Tapchan #${qr.tapchan_number}</h3>
                            <img src="${qr.svg_base64}" />
                            <p>${qr.qr_url}</p>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#BD5B38',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                🖨️ Chop etish
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
