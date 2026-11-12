import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Lock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AccessToken,
  getStoredTokens,
  generateToken,
  toggleTokenStatus,
  toggleTokenPaymentStatus,
  deleteToken,
  getRemainingDays,
  checkActiveTokenSession,
  topUpTokenQuota,
  verifyAdminPassword,
  ActiveTokenSession,
  PACKAGE_PRICE_IDR,
  PACKAGE_QUOTA_GENERATES,
} from '../utils/tokenManager';

interface TokenManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TokenManagerModal: React.FC<TokenManagerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [tokenLabel, setTokenLabel] = useState('');
  const [quotaTotal, setQuotaTotal] = useState(PACKAGE_QUOTA_GENERATES);
  const [durationDays] = useState(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveTokenSession>({ isValid: false });

  // Password protection state for Administrator Panel (Password: License92)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');

  const loadData = () => {
    setTokens(getStoredTokens());
    setActiveSession(checkActiveTokenSession());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      const session = checkActiveTokenSession();
      setIsUnlocked(Boolean(session.isUnlimited));
      setAccessPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(accessPassword)) {
      setIsUnlocked(true);
      onShowToast('Otoritas Administrator (License92) disetujui.', 'success');
    } else {
      onShowToast('Password Administrator tidak sesuai! Gunakan password lisensi resmi.', 'error');
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = generateToken(
      tokenLabel || `Paket ${quotaTotal} Generate Laporan`,
      durationDays,
      quotaTotal,
      PACKAGE_PRICE_IDR,
      tokenLabel || 'Pelanggan e-Kinerja',
      'Verifikasi Admin',
      true
    );
    loadData();
    setTokenLabel('');
    onShowToast(
      `Token Lunas berhasil dibuat: ${created.code} (Kuota ${quotaTotal}x Generate Laporan)`,
      'success'
    );
  };

  const handleTopUp = (id: string, code: string) => {
    topUpTokenQuota(id, PACKAGE_QUOTA_GENERATES, 'Top-Up oleh Admin');
    loadData();
    onShowToast(`Kuota token ${code} berhasil ditambah +25 generate laporan!`, 'success');
  };

  const handleTogglePayment = (id: string) => {
    const updated = toggleTokenPaymentStatus(id);
    setTokens(updated);
    onShowToast('Status konfirmasi pembayaran berhasil diperbarui.', 'info');
  };

  const handleToggle = (id: string) => {
    const updated = toggleTokenStatus(id);
    setTokens(updated);
    onShowToast('Status aktif token berhasil diperbarui.', 'info');
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Hapus token "${code}" dari daftar?`)) {
      const updated = deleteToken(id);
      setTokens(updated);
      onShowToast('Token berhasil dihapus.', 'info');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    onShowToast(`Kode Token "${code}" disalin ke clipboard!`, 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panel Administrator & Verifikasi Pembayaran Token
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kelola konfirmasi pembayaran Rp 25.000 (25x Generate Laporan) dan lisensi pengguna
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isUnlocked ? (
          /* Password Protection Gate (License92) */
          <div className="p-8 text-center max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Otorisasi Administrator</h4>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan Password Administrator untuk memverifikasi pembayaran dan mengelola kuota token:
              </p>
            </div>

            <form onSubmit={handleVerifyAccess} className="space-y-4 pt-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  placeholder="Password Administrator"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono font-semibold focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-center"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Buka Panel Administrator
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Token Manager Interface */
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Active Session Info */}
            {activeSession.isValid && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Sesi Aktif Saat Ini: {activeSession.code}
                    </span>
                    <span className="text-xs text-emerald-800 block">
                      {activeSession.label}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-bold text-emerald-900 tabular-nums">
                  {activeSession.isUnlimited
                    ? 'Unlimited Generate'
                    : `Sisa ${activeSession.quotaRemaining}/${activeSession.quotaTotal} Generate`}
                </div>
              </div>
            )}

            {/* Form Buat Token Baru */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-slate-700" />
                Terbitkan Token Lunas Baru (Rp 25.000 = 25 Generate)
              </h4>

              <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Pelanggan / Label Token
                  </label>
                  <input
                    type="text"
                    value={tokenLabel}
                    onChange={(e) => setTokenLabel(e.target.value)}
                    placeholder="Contoh: Wali Asuh Sdr. Ardian"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kuota Generate Laporan
                  </label>
                  <select
                    value={quotaTotal}
                    onChange={(e) => setQuotaTotal(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:border-slate-900 focus:outline-none"
                  >
                    <option value={25}>25x Generate (Rp 25.000)</option>
                    <option value={50}>50x Generate (Rp 50.000)</option>
                    <option value={100}>100x Generate (Rp 100.000)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Token</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Token yang Ada */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  Daftar Tagihan & Token ({tokens.length})
                </span>
                <span className="text-slate-500">
                  Hanya token berstatus LUNAS yang dapat login
                </span>
              </div>

              {tokens.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  Belum ada tagihan atau token yang dibuat.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tokens.map((tok) => {
                    const remainingDays = getRemainingDays(tok.expiresAt);
                    const isExpired = remainingDays <= 0;
                    const remQuota = Math.max(0, tok.quotaTotal - tok.quotaUsed);

                    return (
                      <div
                        key={tok.id}
                        className="p-3.5 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{tok.label}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            {!tok.isPaid ? (
                              <span className="text-rose-600 text-xs font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> BELUM BAYAR (Login Terkunci)
                              </span>
                            ) : isExpired ? (
                              <span className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Kadaluarsa
                              </span>
                            ) : remQuota <= 0 ? (
                              <span className="text-amber-600 text-xs font-semibold">
                                Kuota Habis (0/{tok.quotaTotal})
                              </span>
                            ) : tok.isActive ? (
                              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 tabular-nums">
                                <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS · Sisa {remQuota}/{tok.quotaTotal} Generate
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs font-semibold">
                                Nonaktif
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <code className="bg-slate-100 text-slate-900 border border-slate-200 font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                              {tok.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(tok.code, tok.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                              title="Salin Kode Token"
                            >
                              {copiedId === tok.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            {tok.paymentRef && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                Ref: {tok.paymentRef}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 tabular-nums">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Buat: {new Date(tok.createdAt).toLocaleDateString('id-ID')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Terpakai: {tok.quotaUsed}x generate
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePayment(tok.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              tok.isPaid
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {tok.isPaid ? 'Batalkan Bayar' : 'Setujui Bayar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTopUp(tok.id, tok.code)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Tambah +25 Generate (Rp 25.000)"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>+25</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(tok.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {tok.isActive ? 'Off' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tok.id, tok.code)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            Pengguna tidak akan bisa login sebelum melakukan konfirmasi pembayaran Rp 25.000.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
