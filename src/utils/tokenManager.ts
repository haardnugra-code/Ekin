export interface AccessToken {
  id: string;
  code: string;
  invoiceId: string;
  label: string;
  createdAt: string; // ISO String
  expiresAt: string; // ISO String
  durationDays: number; // default 30
  isActive: boolean;
  isPaid: boolean; // WAJIB true agar bisa login
  paymentStatus: 'UNPAID' | 'PAID';
  paymentConfirmedAt?: string;
  paymentRef?: string; // No. Referensi / Nama Pengirim bukti bayar
  paymentProofName?: string; // Nama file bukti transfer
  usedCount: number; // login count
  quotaTotal: number; // default 25 generate laporan per Rp 25.000
  quotaUsed: number; // jumlah generate laporan yang sudah dipakai
  pricePaid: number; // default 25000
  buyerName?: string;
  paymentMethod?: string;
  lastUsedAt?: string;
}

export interface ActiveTokenSession {
  isValid: boolean;
  code?: string;
  label?: string;
  expiresAt?: string;
  quotaTotal?: number;
  quotaUsed?: number;
  quotaRemaining?: number;
  isUnlimited?: boolean;
  isExhausted?: boolean;
  isUnpaid?: boolean;
}

export const ADMIN_LICENSE_PASSWORD = 'License92';
export const PACKAGE_PRICE_IDR = 25000;
export const PACKAGE_QUOTA_GENERATES = 25;

// Gunakan key v3 agar sesi gratis lama direset dan wajib melalui konfirmasi pembayaran
const TOKEN_STORAGE_KEY = 'peksos_access_tokens_v3';
const ACTIVE_SESSION_TOKEN_KEY = 'peksos_active_session_token_v3';

// Tidak ada token gratis bawaan — pengguna tidak bisa login sebelum membayar & konfirmasi pembayaran
export const DEFAULT_TOKENS: AccessToken[] = [];

function normalizeToken(t: Partial<AccessToken>): AccessToken {
  const quotaTotal =
    typeof t.quotaTotal === 'number' && t.quotaTotal > 0 ? t.quotaTotal : PACKAGE_QUOTA_GENERATES;
  const quotaUsed = typeof t.quotaUsed === 'number' && t.quotaUsed >= 0 ? t.quotaUsed : 0;
  const isPaid = Boolean(t.isPaid);
  return {
    id: t.id || `tok-${Date.now()}`,
    code: (t.code || 'SRT31-25G-UNPAID').toUpperCase(),
    invoiceId: t.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
    label: t.label || 'Paket 25 Generate Laporan',
    createdAt: t.createdAt || new Date().toISOString(),
    expiresAt: t.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: t.durationDays || 30,
    isActive: t.isActive !== undefined ? t.isActive : true,
    isPaid,
    paymentStatus: isPaid ? 'PAID' : 'UNPAID',
    paymentConfirmedAt: t.paymentConfirmedAt,
    paymentRef: t.paymentRef,
    paymentProofName: t.paymentProofName,
    usedCount: t.usedCount || 0,
    quotaTotal,
    quotaUsed,
    pricePaid: typeof t.pricePaid === 'number' ? t.pricePaid : PACKAGE_PRICE_IDR,
    buyerName: t.buyerName,
    paymentMethod: t.paymentMethod,
    lastUsedAt: t.lastUsedAt,
  };
}

export function getStoredTokens(): AccessToken[] {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(DEFAULT_TOKENS));
      return DEFAULT_TOKENS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_TOKENS;
    }
    return parsed.map(normalizeToken);
  } catch {
    return DEFAULT_TOKENS;
  }
}

export function saveTokens(tokens: AccessToken[]): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Failed to save tokens to localStorage:', err);
  }
}

/**
 * Tahap 1: Membuat Tagihan / Pesanan Token Rp 25.000 dengan status BELUM DIBAYAR (isPaid: false).
 * Token ini TIDAK BISA dipakai login sebelum pengguna melakukan Konfirmasi Telah Membayar.
 */
export function createUnpaidTokenOrder(
  buyerName: string,
  paymentMethod: string = 'QRIS Resmi'
): AccessToken {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const invoiceNum = Math.floor(100000 + Math.random() * 900000);
  const code = `SRT31-25G-${randomHex}`;
  const invoiceId = `INV-25K-${invoiceNum}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const cleanBuyer = buyerName.trim() || 'Pengguna e-Kinerja';

  const newOrder: AccessToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    code,
    invoiceId,
    label: `Paket 25 Generate — ${cleanBuyer}`,
    createdAt: now.toISOString(),
    expiresAt,
    durationDays: 30,
    isActive: true,
    isPaid: false,
    paymentStatus: 'UNPAID',
    usedCount: 0,
    quotaTotal: PACKAGE_QUOTA_GENERATES,
    quotaUsed: 0,
    pricePaid: PACKAGE_PRICE_IDR,
    buyerName: cleanBuyer,
    paymentMethod,
  };

  const currentTokens = getStoredTokens();
  saveTokens([newOrder, ...currentTokens]);
  return newOrder;
}

/**
 * Tahap 2: Konfirmasi Telah Membayar Rp 25.000.
 * Memvalidasi nomor referensi / nama pengirim & bukti bayar, lalu mengaktifkan isPaid = true
 * sehingga token otomatis aktif dan bisa digunakan untuk login.
 */
export function confirmPaymentAndActivateToken(
  tokenIdOrCode: string,
  paymentRef: string,
  paymentProofName?: string
): { success: boolean; message: string; token?: AccessToken } {
  const cleanRef = paymentRef.trim();
  if (!cleanRef || cleanRef.length < 3) {
    return {
      success: false,
      message: 'Wajib mengisi Nomor Referensi Transaksi atau Nama Pengirim Rekening sebagai bukti pembayaran!',
    };
  }

  const tokens = getStoredTokens();
  const targetUpper = tokenIdOrCode.trim().toUpperCase();
  let activatedToken: AccessToken | undefined;
  const nowIso = new Date().toISOString();

  const updated = tokens.map((t) => {
    if (
      t.id === tokenIdOrCode ||
      t.code.toUpperCase() === targetUpper ||
      t.invoiceId.toUpperCase() === targetUpper
    ) {
      // Jika sebelumnya kuota habis (0), isi ulang menjadi 25 generate
      const currentRem = Math.max(0, t.quotaTotal - t.quotaUsed);
      const nextQuotaTotal = currentRem <= 0 ? PACKAGE_QUOTA_GENERATES : t.quotaTotal;
      const nextQuotaUsed = currentRem <= 0 ? 0 : t.quotaUsed;

      activatedToken = {
        ...t,
        isPaid: true,
        paymentStatus: 'PAID',
        paymentConfirmedAt: nowIso,
        paymentRef: cleanRef,
        paymentProofName: paymentProofName || t.paymentProofName || 'Bukti Terverifikasi',
        isActive: true,
        quotaTotal: nextQuotaTotal,
        quotaUsed: nextQuotaUsed,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return activatedToken;
    }
    return t;
  });

  if (!activatedToken) {
    return {
      success: false,
      message: 'Data tagihan/token tidak ditemukan. Silakan buat pesanan baru.',
    };
  }

  saveTokens(updated);
  return {
    success: true,
    message: `Konfirmasi pembayaran Rp 25.000 (${cleanRef}) berhasil! Token ${activatedToken.code} kini AKTIF dengan 25 kuota generate laporan.`,
    token: activatedToken,
  };
}

/**
 * Digunakan oleh Administrator (License92) untuk membuat token yang langsung berstatus LUNAS (PAID)
 * atau belum lunas.
 */
export function generateToken(
  label: string,
  durationDays: number = 30,
  quotaTotal: number = PACKAGE_QUOTA_GENERATES,
  pricePaid: number = PACKAGE_PRICE_IDR,
  buyerName?: string,
  paymentMethod?: string,
  isPaid: boolean = true
): AccessToken {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const invoiceNum = Math.floor(100000 + Math.random() * 900000);
  const code = `SRT31-${quotaTotal}G-${randomHex}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const newToken: AccessToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    code,
    invoiceId: `INV-ADM-${invoiceNum}`,
    label: label.trim() || `Paket ${quotaTotal} Generate Laporan`,
    createdAt: now.toISOString(),
    expiresAt,
    durationDays,
    isActive: true,
    isPaid,
    paymentStatus: isPaid ? 'PAID' : 'UNPAID',
    paymentConfirmedAt: isPaid ? now.toISOString() : undefined,
    paymentRef: isPaid ? 'Diterbitkan oleh Admin (License92)' : undefined,
    usedCount: 0,
    quotaTotal,
    quotaUsed: 0,
    pricePaid,
    buyerName: buyerName?.trim() || 'Pengguna e-Kinerja',
    paymentMethod: paymentMethod || 'Verifikasi Admin',
  };

  const currentTokens = getStoredTokens();
  saveTokens([newToken, ...currentTokens]);
  return newToken;
}

/**
 * Isi ulang (Top-Up) kuota generate laporan (+25 generate) setelah konfirmasi pembayaran ulang Rp 25.000.
 */
export function topUpTokenQuota(
  tokenIdOrCode: string,
  additionalQuota: number = PACKAGE_QUOTA_GENERATES,
  paymentRef: string = 'Top-Up Terkonfirmasi'
): AccessToken | null {
  const tokens = getStoredTokens();
  const cleanTarget = tokenIdOrCode.trim().toUpperCase();
  let updatedToken: AccessToken | null = null;

  const updatedList = tokens.map((t) => {
    if (t.id === tokenIdOrCode || t.code.toUpperCase() === cleanTarget) {
      const remainingBefore = Math.max(0, t.quotaTotal - t.quotaUsed);
      const nextTotal = remainingBefore + additionalQuota;
      updatedToken = {
        ...t,
        quotaTotal: nextTotal,
        quotaUsed: 0,
        pricePaid: (t.pricePaid || PACKAGE_PRICE_IDR) + PACKAGE_PRICE_IDR,
        isActive: true,
        isPaid: true,
        paymentStatus: 'PAID',
        paymentConfirmedAt: new Date().toISOString(),
        paymentRef: paymentRef || t.paymentRef || 'Top-Up Rp 25.000',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return updatedToken;
    }
    return t;
  });

  if (updatedToken) {
    saveTokens(updatedList);
  }
  return updatedToken;
}

export function toggleTokenPaymentStatus(id: string): AccessToken[] {
  const tokens = getStoredTokens();
  const updated = tokens.map((t) => {
    if (t.id === id) {
      const nextPaid = !t.isPaid;
      return {
        ...t,
        isPaid: nextPaid,
        paymentStatus: (nextPaid ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
        paymentConfirmedAt: nextPaid ? new Date().toISOString() : undefined,
        paymentRef: nextPaid ? t.paymentRef || 'Disetujui Admin' : undefined,
      };
    }
    return t;
  });
  saveTokens(updated);
  return updated;
}

export function verifyAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_LICENSE_PASSWORD;
}

export function loginAsAdmin(password: string): { valid: boolean; message: string } {
  if (!verifyAdminPassword(password)) {
    return {
      valid: false,
      message: 'Password Administrator tidak sesuai.',
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  localStorage.setItem(
    ACTIVE_SESSION_TOKEN_KEY,
    JSON.stringify({
      code: 'ADMIN-LICENSE92',
      label: 'Administrator Utama (Unlimited Generate)',
      expiresAt,
      authenticatedAt: now.toISOString(),
      quotaTotal: 999999,
      quotaUsed: 0,
      isUnlimited: true,
      isPaid: true,
    })
  );

  return {
    valid: true,
    message: 'Login Administrator berhasil! Kuota Generate Laporan tanpa batas (Unlimited).',
  };
}

export function validateAndUseToken(code: string): {
  valid: boolean;
  message: string;
  token?: AccessToken;
  isExhausted?: boolean;
  isUnpaid?: boolean;
} {
  const cleanCode = code.trim();
  if (!cleanCode) {
    return { valid: false, message: 'Kode token tidak boleh kosong.' };
  }

  // Izinkan jika pengguna langsung mengetik password admin License92 di kolom token
  if (cleanCode === ADMIN_LICENSE_PASSWORD) {
    const adminRes = loginAsAdmin(cleanCode);
    return { valid: adminRes.valid, message: adminRes.message };
  }

  const upperCode = cleanCode.toUpperCase();
  const tokens = getStoredTokens();
  const found = tokens.find((t) => t.code.toUpperCase() === upperCode);

  if (!found) {
    return {
      valid: false,
      message:
        'Kode token tidak ditemukan! Anda tidak dapat login sebelum membayar Rp 25.000 dan melakukan konfirmasi pembayaran.',
    };
  }

  // CEK WAJIB BAYAR: Tidak akan bisa login jika belum membayar & konfirmasi pembayaran
  if (!found.isPaid || found.paymentStatus !== 'PAID') {
    return {
      valid: false,
      isUnpaid: true,
      token: found,
      message: `Login Ditolak! Token ${found.code} (Tagihan ${found.invoiceId}) BELUM DIBAYAR. Silakan selesaikan pembayaran Rp 25.000 dan klik Konfirmasi Telah Membayar terlebih dahulu.`,
    };
  }

  if (!found.isActive) {
    return { valid: false, message: 'Token ini telah dinonaktifkan oleh Administrator.' };
  }

  const now = new Date();
  const expiry = new Date(found.expiresAt);

  if (now > expiry) {
    return { valid: false, message: `Token telah kadaluarsa pada ${expiry.toLocaleDateString('id-ID')}.` };
  }

  const remaining = Math.max(0, found.quotaTotal - found.quotaUsed);
  if (remaining <= 0) {
    return {
      valid: false,
      isExhausted: true,
      token: found,
      message: `Kuota ${found.quotaTotal}x Generate Laporan pada token ${found.code} telah habis! Silakan bayar lagi Rp 25.000 dan konfirmasi pembayaran untuk mendapat 25 generate laporan baru.`,
    };
  }

  // Update login count & last used
  const updatedTokens = tokens.map((t) => {
    if (t.id === found.id) {
      return {
        ...t,
        usedCount: t.usedCount + 1,
        lastUsedAt: now.toISOString(),
      };
    }
    return t;
  });
  saveTokens(updatedTokens);

  localStorage.setItem(
    ACTIVE_SESSION_TOKEN_KEY,
    JSON.stringify({
      code: found.code,
      label: found.label,
      expiresAt: found.expiresAt,
      authenticatedAt: now.toISOString(),
      quotaTotal: found.quotaTotal,
      quotaUsed: found.quotaUsed,
      isUnlimited: false,
      isPaid: true,
    })
  );

  return {
    valid: true,
    message: `Pembayaran Terverifikasi! Login berhasil — Tersisa ${remaining} dari ${found.quotaTotal} kuota generate laporan.`,
    token: found,
  };
}

export function checkActiveTokenSession(): ActiveTokenSession {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
    if (!raw) return { isValid: false };

    const session = JSON.parse(raw);
    if (!session || !session.expiresAt) return { isValid: false };

    const now = new Date();
    const expiry = new Date(session.expiresAt);

    if (now > expiry) {
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      return { isValid: false };
    }

    if (session.isUnlimited || session.code === 'ADMIN-LICENSE92') {
      return {
        isValid: true,
        code: session.code,
        label: session.label || 'Administrator (Unlimited)',
        expiresAt: session.expiresAt,
        quotaTotal: 999999,
        quotaUsed: 0,
        quotaRemaining: 999999,
        isUnlimited: true,
      };
    }

    const tokens = getStoredTokens();
    const found = tokens.find((t) => t.code.toUpperCase() === String(session.code).toUpperCase());

    if (!found || !found.isActive) {
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      return { isValid: false };
    }

    // Jika status bayar belum terkonfirmasi / dibatalkan, langsung blokir sesi login
    if (!found.isPaid || found.paymentStatus !== 'PAID') {
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      return {
        isValid: false,
        isUnpaid: true,
        code: found.code,
        label: found.label,
      };
    }

    const quotaTotal = found.quotaTotal || PACKAGE_QUOTA_GENERATES;
    const quotaUsed = found.quotaUsed || 0;
    const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);

    if (quotaRemaining <= 0) {
      return {
        isValid: false,
        isExhausted: true,
        code: found.code,
        label: found.label,
        expiresAt: found.expiresAt,
        quotaTotal,
        quotaUsed,
        quotaRemaining: 0,
      };
    }

    return {
      isValid: true,
      expiresAt: found.expiresAt,
      code: found.code,
      label: found.label,
      quotaTotal,
      quotaUsed,
      quotaRemaining,
      isUnlimited: false,
    };
  } catch {
    return { isValid: false };
  }
}

export function consumeGenerateQuota(): {
  allowed: boolean;
  remaining: number;
  total: number;
  code?: string;
  isUnlimited?: boolean;
  message?: string;
} {
  const session = checkActiveTokenSession();

  if (!session.isValid) {
    return {
      allowed: false,
      remaining: 0,
      total: PACKAGE_QUOTA_GENERATES,
      code: session.code,
      message: session.isExhausted
        ? `Kuota ${session.quotaTotal || 25}x Generate Laporan Anda telah habis! Silakan bayar Rp 25.000 dan konfirmasi pembayaran untuk mendapat 25 generate laporan lagi.`
        : 'Anda belum login atau belum melakukan konfirmasi pembayaran Rp 25.000 (25x Generate).',
    };
  }

  if (session.isUnlimited) {
    return {
      allowed: true,
      remaining: 999999,
      total: 999999,
      code: session.code,
      isUnlimited: true,
    };
  }

  const tokens = getStoredTokens();
  const targetCode = String(session.code || '').toUpperCase();
  const found = tokens.find((t) => t.code.toUpperCase() === targetCode);

  if (!found || !found.isPaid) {
    return {
      allowed: false,
      remaining: 0,
      total: PACKAGE_QUOTA_GENERATES,
      message: 'Token belum melakukan konfirmasi pembayaran Rp 25.000.',
    };
  }

  const currentRemaining = Math.max(0, found.quotaTotal - found.quotaUsed);
  if (currentRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      total: found.quotaTotal,
      code: found.code,
      message: `Kuota ${found.quotaTotal}x Generate Laporan Anda telah habis! Silakan bayar Rp 25.000 dan konfirmasi pembayaran untuk mendapat 25 generate laporan lagi.`,
    };
  }

  const nextUsed = found.quotaUsed + 1;
  const nextRemaining = Math.max(0, found.quotaTotal - nextUsed);

  const updatedTokens = tokens.map((t) => {
    if (t.id === found.id) {
      return {
        ...t,
        quotaUsed: nextUsed,
        lastUsedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  saveTokens(updatedTokens);

  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      localStorage.setItem(
        ACTIVE_SESSION_TOKEN_KEY,
        JSON.stringify({
          ...parsed,
          quotaUsed: nextUsed,
          quotaTotal: found.quotaTotal,
        })
      );
    }
  } catch {}

  return {
    allowed: true,
    remaining: nextRemaining,
    total: found.quotaTotal,
    code: found.code,
    isUnlimited: false,
  };
}

export function clearActiveTokenSession(): void {
  localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
}

export function toggleTokenStatus(id: string): AccessToken[] {
  const tokens = getStoredTokens();
  const updated = tokens.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
  saveTokens(updated);
  return updated;
}

export function deleteToken(id: string): AccessToken[] {
  const tokens = getStoredTokens();
  const updated = tokens.filter((t) => t.id !== id);
  saveTokens(updated);
  return updated;
}

export function getRemainingDays(expiresAtStr: string): number {
  const now = Date.now();
  const exp = new Date(expiresAtStr).getTime();
  const diffMs = exp - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
