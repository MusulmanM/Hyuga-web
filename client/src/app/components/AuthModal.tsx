import { useState, useRef, useEffect } from 'react';
import { useSendOtpMutation, useVerifyOtpMutation, getApiErrorMessage } from '../services/api';

interface AuthModalProps {
  onSuccess: (phone: string) => void;
  onClose: () => void;
}

type Phase = 'phone' | 'otp' | 'success';

const OTP_TIMER = 60;

export function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(OTP_TIMER);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  useEffect(() => {
    if (phase === 'otp') {
      setTimer(OTP_TIMER);
      timerRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 9);
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    return formatted;
  };

  const fullPhone = () => `+998${phone.replace(/\D/g, '')}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    setPhoneError('');
  };

  const requestOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setPhoneError("To'liq telefon raqam kiriting");
      return false;
    }

    setLoading(true);
    try {
      await sendOtp({ phone_number: fullPhone() }).unwrap();
      setPhase('otp');
      return true;
    } catch (error) {
      setPhoneError(getApiErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = () => {
    void requestOtp();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError('');
    if (digit && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      setOtp(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ''));
      setTimeout(() => inputRefs.current[Math.min(pasted.length, 5)]?.focus(), 10);
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('6 xonali kodni kiriting');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp({ phone_number: fullPhone(), otp_code: code }).unwrap();
      localStorage.setItem('accessToken', result.access);
      localStorage.setItem('refreshToken', result.refresh);
      setPhase('success');
      setTimeout(() => onSuccess(fullPhone()), 1200);
    } catch (error) {
      setOtpError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    void requestOtp();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(14,30,29,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeInOverlay .2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'slideUpModal .3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0E3A39, #14514F)', padding: '28px 28px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#DCEEEF', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(198,154,62,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            {phase === 'success'
              ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#E3C77E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : phase === 'otp'
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#E3C77E" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#E3C77E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="#E3C77E" strokeWidth="1.8"/></svg>
            }
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '.13em', textTransform: 'uppercase', color: '#7FC2CC', marginBottom: 6 }}>
            {phase === 'success' ? 'Muvaffaqiyat' : phase === 'otp' ? 'Tasdiqlash' : "Ro'yxatdan o'tish"}
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: '#FBF6EB', fontWeight: 600 }}>
            {phase === 'success' ? 'Xush kelibsiz!' : phase === 'otp' ? 'SMS kodni kiriting' : 'Telefon raqamingiz'}
          </h3>
          {phase === 'otp' && (
            <p style={{ fontSize: 13, color: '#DCEEEF', marginTop: 6 }}>
              +998 {phone} raqamiga kod yuborildi
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {phase === 'phone' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5C58', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, fontFamily: "'Manrope',sans-serif" }}>
                  Telefon raqam
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${phoneError ? '#B4523C' : 'rgba(14,58,57,0.2)'}`, borderRadius: 12, overflow: 'hidden', background: '#fff', transition: '.2s' }}>
                  <div style={{ padding: '13px 14px', background: '#F2E8D3', borderRight: '1px solid rgba(14,58,57,0.12)', fontSize: 14, fontWeight: 700, color: '#182422', fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0 }}>
                    +998
                  </div>
                  <input
                    autoFocus
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                    placeholder="90 123 45 67"
                    style={{ flex: 1, padding: '13px 14px', border: 'none', outline: 'none', fontSize: 15, color: '#182422', fontFamily: "'IBM Plex Mono',monospace", background: 'transparent', letterSpacing: '.04em' }}
                  />
                </div>
                {phoneError && <p style={{ fontSize: 12, color: '#B4523C', marginTop: 6, fontWeight: 600 }}>{phoneError}</p>}
              </div>

              <div style={{ background: '#F2E8D3', borderRadius: 12, padding: '12px 14px', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" stroke="#4B5C58" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="#4B5C58" strokeWidth="2" strokeLinecap="round"/></svg>
                <p style={{ fontSize: 12.5, color: '#4B5C58', lineHeight: 1.5 }}>
                  Buyurtma berish uchun bir martalik SMS kod yuboriladi. Demo rejimda kod: <b>111111</b>
                </p>
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 100, fontSize: 14.5, fontWeight: 700, background: loading ? 'rgba(14,58,57,0.5)' : '#0E3A39', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Manrope',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading
                  ? <><LoadingDots/> Yuborilmoqda...</>
                  : 'SMS kodni olish →'}
              </button>
            </>
          )}

          {phase === 'otp' && (
            <>
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }} onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                        fontFamily: "'IBM Plex Mono',monospace",
                        border: `2px solid ${otpError ? '#B4523C' : digit ? '#0E3A39' : 'rgba(14,58,57,0.2)'}`,
                        borderRadius: 12, outline: 'none', color: '#182422',
                        background: digit ? 'rgba(14,58,57,0.04)' : '#fff',
                        transition: '.15s',
                      }}
                    />
                  ))}
                </div>
                {otpError && <p style={{ fontSize: 12, color: '#B4523C', textAlign: 'center', fontWeight: 600 }}>{otpError}</p>}

                <div style={{ background: '#F2E8D3', borderRadius: 10, padding: '8px 12px', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#C69A3E"/></svg>
                  <span style={{ fontSize: 12, color: '#4B5C58' }}>Demo kod: <b style={{ fontFamily: "'IBM Plex Mono',monospace", color: '#0E3A39' }}>111111</b></span>
                </div>
              </div>

              <button
                onClick={() => void handleVerify()}
                disabled={loading || otp.join('').length < 6}
                style={{ width: '100%', padding: '14px', borderRadius: 100, fontSize: 14.5, fontWeight: 700, background: otp.join('').length === 6 && !loading ? '#0E3A39' : 'rgba(14,58,57,0.25)', color: otp.join('').length === 6 && !loading ? '#fff' : '#4B5C58', border: 'none', cursor: otp.join('').length === 6 && !loading ? 'pointer' : 'not-allowed', fontFamily: "'Manrope',sans-serif", marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><LoadingDots/> Tekshirilmoqda...</> : 'Tasdiqlash'}
              </button>

              <div style={{ textAlign: 'center' }}>
                {timer > 0
                  ? <span style={{ fontSize: 13, color: '#4B5C58' }}>Qayta yuborish: <b style={{ fontFamily: "'IBM Plex Mono',monospace", color: '#0E3A39' }}>{timer}s</b></span>
                  : <button onClick={handleResend} style={{ fontSize: 13, color: '#0E3A39', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', fontFamily: "'Manrope',sans-serif" }}>Qayta yuborish</button>
                }
                <span style={{ fontSize: 13, color: '#4B5C58', margin: '0 10px' }}>·</span>
                <button onClick={() => setPhase('phone')} style={{ fontSize: 13, color: '#4B5C58', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }}>Raqamni o'zgartirish</button>
              </div>
            </>
          )}

          {phase === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(76,140,107,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#4C8C6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#182422', fontWeight: 600, marginBottom: 6 }}>Muvaffaqiyatli kirildi!</p>
              <p style={{ fontSize: 13.5, color: '#4B5C58' }}>Endi buyurtma berishingiz mumkin.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: `dotPulse 1.2s ease-in-out ${i * 0.16}s infinite` }}/>
      ))}
    </span>
  );
}
