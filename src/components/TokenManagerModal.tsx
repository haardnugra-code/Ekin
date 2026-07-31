import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, Trash2, ShieldAlert, Calendar, Clock, CheckCircle2, XCircle, X, Sparkles, UserCheck } from 'lucide-react';
import {
  AccessToken,
  getStoredTokens,
  generateToken,
  toggleTokenStatus,
  deleteToken,
  getRemainingDays,
  checkActiveTokenSession,
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
  const [durationDays, setDurationDays] = useState(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<{ isValid: boolean; code?: string; expiresAt?: string; label?: string }>({ isValid: false });

  const loadData = () => {
    setTokens(getStoredTokens());
    setActiveSession(checkActiveTokenSession());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = generateToken(tokenLabel || 'Token Akses 1 Bulan', durationDays);
    setTokens(getStoredTokens());
    setTokenLabel('');
    onShowToast(`🔑 Token baru berhasil dibuat: ${created.code} (Aktif ${durationDays} Hari)`, 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-purple-100 bg-purple-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Manajemen Token Akses Web 1 Bulan
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Buat, bagikan, dan kelola kunci token akses 30 hari untuk pengguna e-Kinerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Active Session Info if logged in with token */}
          {activeSession.isValid && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-emerald-950 block">
                    Sesi Aktif: Akses Menggunakan Token
                  </span>
                  <span className="text-[11px] text-emerald-800 font-mono font-bold block">
                    {activeSession.code} ({activeSession.label})
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Berlaku hingga: {new Date(activeSession.expiresAt || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ({getRemainingDays(activeSession.expiresAt || '')} hari lagi)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Terverifikasi
              </span>
            </div>
          )}

          {/* Form Buat Token Baru */}
          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Buat Token Akses Baru (30 Hari / 1 Bulan)
            </h4>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama / Label Token</label>
                <input
                  type="text"
                  value={tokenLabel}
                  onChange={(e) => setTokenLabel(e.target.value)}
                  placeholder="Contoh: Token Wali Asuh Sdr. Ardian"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Masa Akses</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value={30}>30 Hari (1 Bulan)</option>
                  <option value={60}>60 Hari (2 Bulan)</option>
                  <option value={90}>90 Hari (3 Bulan)</option>
                  <option value={7}>7 Hari (1 Minggu)</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Buat Token
                </button>
              </div>
            </form>
          </div>

          {/* List Token yang Ada */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Token Akses Tersedia ({tokens.length})</span>
              <span className="text-[11px] text-gray-500 font-normal">Sistem Otomatis Kadaluarsa</span>
            </h4>

            {tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                <Key className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-medium">Belum ada token akses yang dibuat.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tokens.map((tok) => {
                  const remainingDays = getRemainingDays(tok.expiresAt);
                  const isExpired = remainingDays <= 0;

                  return (
                    <div
                      key={tok.id}
                      className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isExpired
                          ? 'bg-red-50/50 border-red-200 text-gray-500'
                          : tok.isActive
                          ? 'bg-white border-gray-200 hover:border-purple-300 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{tok.label}</span>
                          {isExpired ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Kadaluarsa
                            </span>
                          ) : tok.isActive ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Aktif ({remainingDays} Hari)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-md">
                              Nonaktif
                            </span>
                          )}
                        </div>

                        {/* Code badge */}
                        <div className="flex items-center gap-2">
                          <code className="bg-purple-50 text-purple-900 border border-purple-200 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                            {tok.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(tok.code, tok.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer"
                            title="Salin Kode Token"
                          >
                            {copiedId === tok.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-purple-600" />
                            )}
                          </button>
                        </div>

                        {/* Dates info */}
                        <div className="flex items-center gap-3 text-[10.5px] text-gray-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            Buat: {new Date(tok.createdAt).toLocaleDateString('id-ID')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            Batas: {new Date(tok.expiresAt).toLocaleDateString('id-ID')}
                          </span>
                          {tok.usedCount > 0 && (
                            <span className="text-purple-700 font-medium">
                              Digunakan {tok.usedCount}x
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(tok.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            tok.isActive
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {tok.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tok.id, tok.code)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Token yang dibuat memberikan hak akses penuh ke website e-Kinerja selama 30 hari.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
