export interface AccessToken {
  id: string;
  code: string;
  label: string;
  createdAt: string; // ISO String
  expiresAt: string; // ISO String (30 days from creation or activation)
  durationDays: number; // default 30
  isActive: boolean;
  usedCount: number;
  lastUsedAt?: string;
}

const TOKEN_STORAGE_KEY = 'peksos_access_tokens_v1';
const ACTIVE_SESSION_TOKEN_KEY = 'peksos_active_session_token';

// Seed initial 1-month tokens if empty
export const DEFAULT_TOKENS: AccessToken[] = [
  {
    id: 'tok-default-1month-1',
    code: 'SRT31-1MONTH-AKSES-2026',
    label: 'Token Akses 1 Bulan Utama - Wali Asuh',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 30,
    isActive: true,
    usedCount: 0,
  },
  {
    id: 'tok-default-1month-2',
    code: 'PEKSOS-30HARI-PAS-2026',
    label: 'Token Uji Akses 30 Hari - e-Kinerja',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 30,
    isActive: true,
    usedCount: 0,
  }
];

export function getStoredTokens(): AccessToken[] {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(DEFAULT_TOKENS));
      return DEFAULT_TOKENS;
    }
    const tokens: AccessToken[] = JSON.parse(raw);
    return tokens;
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

export function generateToken(label: string, durationDays: number = 30): AccessToken {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `SRT31-${durationDays}D-${randomHex}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const newToken: AccessToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    code,
    label: label.trim() || `Token Akses ${durationDays} Hari`,
    createdAt: now.toISOString(),
    expiresAt,
    durationDays,
    isActive: true,
    usedCount: 0,
  };

  const currentTokens = getStoredTokens();
  const updated = [newToken, ...currentTokens];
  saveTokens(updated);
  return newToken;
}

export function validateAndUseToken(code: string): { valid: boolean; message: string; token?: AccessToken } {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Kode token tidak boleh kosong.' };
  }

  const tokens = getStoredTokens();
  const found = tokens.find((t) => t.code.toUpperCase() === cleanCode);

  if (!found) {
    return { valid: false, message: 'Kode token tidak ditemukan atau tidak valid.' };
  }

  if (!found.isActive) {
    return { valid: false, message: 'Token ini telah dinonaktifkan / dicabut.' };
  }

  const now = new Date();
  const expiry = new Date(found.expiresAt);

  if (now > expiry) {
    return { valid: false, message: `Token telah kadaluarsa pada ${expiry.toLocaleDateString('id-ID')}.` };
  }

  // Update usage count & last used
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

  // Store active session token with expiration time in persistent localStorage
  localStorage.setItem(
    ACTIVE_SESSION_TOKEN_KEY,
    JSON.stringify({
      code: found.code,
      label: found.label,
      expiresAt: found.expiresAt,
      authenticatedAt: now.toISOString(),
    })
  );

  return {
    valid: true,
    message: `Token valid! Akses disetujui hingga ${expiry.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    token: found,
  };
}

export function checkActiveTokenSession(): { isValid: boolean; expiresAt?: string; code?: string; label?: string } {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
    if (!raw) return { isValid: false };

    const session = JSON.parse(raw);
    if (!session || !session.expiresAt) return { isValid: false };

    const now = new Date();
    const expiry = new Date(session.expiresAt);

    if (now > expiry) {
      // Session token expired!
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      return { isValid: false };
    }

    return {
      isValid: true,
      expiresAt: session.expiresAt,
      code: session.code,
      label: session.label,
    };
  } catch {
    return { isValid: false };
  }
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
