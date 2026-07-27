/**
 * @deprecated Endi QR kodni skanerlash telefon kamerasi orqali amalga oshiriladi.
 * Sayt URL'dan ?tapchan=N ni o'qib, avtomatik menu ga o'tadi.
 * Bu funksiya eski skaner mantiqi bilan ishlatilgan edi.
 */
export function parseTapchanFromQr(qrText: string): number | null {
  if (!qrText || typeof qrText !== 'string') return null;

  const match = qrText.match(/\d+/);
  if (!match) return null;

  const num = Number(match[0]);
  if (Number.isFinite(num) && num >= 1 && num <= 23) {
    return num;
  }

  return null;
}
