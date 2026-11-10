export interface AccessToken {
  id: string;
  code: string;
  label: string;
  createdAt: string; // ISO String
  expiresAt: string; // ISO String
  durationDays: number; // default 30
  isActive: boolean;
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
}

export const ADMIN_LICENSE_PASSWORD = 'License92';
export const PACKAGE_PRICE_IDR = 25000;
export const PACKAGE_QUOTA_GENERATES = 25;

const TOKEN_STORAGE_KEY = 'peksos_access_tokens_v2';
const ACTIVE_SESSION_TOKEN_KEY = 'peksos_active_session_token_v2';

// Seed initial 25-generate tokens if empty
export const DEFAULT_TOKENS: AccessToken[] = [
  {
    id: 'tok-default-25gen-1',
    code: 'SRT31-25GEN-PRO26',
    label: 'Paket Reguler 25 Laporan - Wali Asuh',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 30,
    isActive: true,
    usedCount: 0,
    quotaTotal: 25,
    quotaUsed: 0,
    pricePaid: 25000,
    buyerName: 'Wali Asuh SRT 31',
    paymentMethod: 'QRIS Otomatis',
  },
  {
    id: 'tok-default-25gen-2',
    code: 'PEKSOS-25LAP-2026',
    label: 'Token Paket Hemat Rp 25.000 (25 Generate)',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 30,
    isActive: true,
    usedCount: 0,
    quotaTotal: 25,
    quotaUsed: 0,
    pricePaid: 25000,
    buyerName: 'Pekerja Sosial',
    paymentMethod: 'Transfer Bank',
  },
];

function normalizeToken(t: Partial<AccessToken>): AccessToken {
  const quotaTotal = typeof t.quotaTotal === 'number' && t.quotaTotal > 0 ? t.quotaTotal : PACKAGE_QUOTA_GENERATES;
  const quotaUsed = typeof t.quotaUsed === 'number' && t.quotaUsed >= 0 ? t.quotaUsed : 0;
  return {
    id: t.id || `tok-${Date.now()}`,
    code: (t.code || 'SRT31-25GEN-DEFAULT').toUpperCase(),
    label: t.label || 'Paket 25 Generate Laporan',
    createdAt: t.createdAt || new Date().toISOString(),
    expiresAt: t.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: t.durationDays || 30,
    isActive: t.isActive !== undefined ? t.isActive : true,
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
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(DEFAULT_TOKENS));
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

export function generateToken(
  label: string,
  durationDays: number = 30,
  quotaTotal: number = PACKAGE_QUOTA_GENERATES,
  pricePaid: number = PACKAGE_PRICE_IDR,
  buyerName?: string,
  paymentMethod?: string
): AccessToken {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `SRT31-${quotaTotal}G-${randomHex}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const newToken: AccessToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    code,
    label: label.trim() || `Paket ${quotaTotal} Generate Laporan`,
    createdAt: now.toISOString(),
    expiresAt,
    durationDays,
    isActive: true,
    usedCount: 0,
    quotaTotal,
    quotaUsed: 0,
    pricePaid,
    buyerName: buyerName?.trim() || 'Pengguna e-Kinerja',
    paymentMethod: paymentMethod || 'QRIS Otomatis',
  };

  const currentTokens = getStoredTokens();
  const updated = [newToken, ...currentTokens];
  saveTokens(updated);
  return newToken;
}

/**
 * Simulasi / Aktivasi Pembayaran Rp 25.000 -> Otomatis menerbitkan token 25x Generate
 * dan langsung mengaktifkan sesi login.
 */
export function purchaseAutoToken25k(
  buyerName: string,
  paymentMethod: string = 'QRIS Instan'
): AccessToken {
  const cleanBuyer = buyerName.trim() || 'Wali Asuh / Peksos';
  const token = generateToken(
    `Paket Rp 25.000 (25 Generate) — ${cleanBuyer}`,
    30,
    PACKAGE_QUOTA_GENERATES,
    PACKAGE_PRICE_IDR,
    cleanBuyer,
    paymentMethod
  );
  validateAndUseToken(token.code);
  return token;
}

/**
 * Isi ulang (Top-Up) kuota generate laporan (+25 generate) untuk token yang sudah ada.
 */
export function topUpTokenQuota(
  tokenIdOrCode: string,
  additionalQuota: number = PACKAGE_QUOTA_GENERATES
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return updatedToken;
    }
    return t;
  });

  if (updatedToken) {
    saveTokens(updatedList);
    validateAndUseToken((updatedToken as AccessToken).code);
  }
  return updatedToken;
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
    return { valid: false, message: 'Kode token tidak ditemukan. Silakan beli token otomatis Rp 25.000 untuk 25x generate.' };
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
      message: `Kuota ${found.quotaTotal}x Generate Laporan pada token ${found.code} telah habis! Silakan bayar Rp 25.000 untuk mendapat 25 generate laporan lagi.`,
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
    })
  );

  return {
    valid: true,
    message: `Token aktif! Tersisa ${remaining} dari ${found.quotaTotal} kuota generate laporan.`,
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

    // Sinkronkan dengan daftar token terbaru di localStorage
    const tokens = getStoredTokens();
    const found = tokens.find((t) => t.code.toUpperCase() === String(session.code).toUpperCase());

    if (!found || !found.isActive) {
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      return { isValid: false };
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

/**
 * Dipanggil setiap kali pengguna menekan tombol Generate Laporan / AI Generate.
 * Mengurangi 1 kuota dari 25 kuota. Jika habis, memblokir generate dan meminta pembayaran ulang Rp 25.000.
 */
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
        ? `Kuota ${session.quotaTotal || 25}x Generate Laporan Anda telah habis! Silakan bayar Rp 25.000 untuk mendapat 25 generate laporan lagi.`
        : 'Sesi token belum aktif atau kuota telah habis. Silakan masuk atau aktivasi token Rp 25.000 (25x Generate).',
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

  if (!found) {
    return {
      allowed: false,
      remaining: 0,
      total: PACKAGE_QUOTA_GENERATES,
      message: 'Token tidak ditemukan. Silakan aktivasi token kembali.',
    };
  }

  const currentRemaining = Math.max(0, found.quotaTotal - found.quotaUsed);
  if (currentRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      total: found.quotaTotal,
      code: found.code,
      message: `Kuota ${found.quotaTotal}x Generate Laporan Anda telah habis! Silakan bayar Rp 25.000 untuk mendapat 25 generate laporan lagi.`,
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

  // Perbarui data di ACTIVE_SESSION_TOKEN_KEY
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
