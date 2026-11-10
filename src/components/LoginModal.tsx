import React, { useState, useEffect } from 'react';
import {
  Key,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Plus,
  Trash2,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  AccessToken,
  getStoredTokens,
  validateAndUseToken,
  purchaseAutoToken25k,
  topUpTokenQuota,
  verifyAdminPassword,
  loginAsAdmin,
  generateToken,
  toggleTokenStatus,
  deleteToken,
  PACKAGE_PRICE_IDR,
  PACKAGE_QUOTA_GENERATES,
} from '../utils/tokenManager';

interface LoginModalProps {
  onLoginSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  exhaustedMessage?: string | null;
}

const HERO_IMAGE_URL = '/src/assets/images/hero_laporan_ekinerja_1794262673132.jpg';
const DOC_PREVIEW_IMAGE_URL = '/src/assets/images/preview_dokumen_resmi_1794262673907.jpg';

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  showToast,
  exhaustedMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'buy_token' | 'use_token'>(
    exhaustedMessage ? 'buy_token' : 'use_token'
  );
  const [tokenCode, setTokenCode] = useState('');
  const [exhaustedTokenCode, setExhaustedTokenCode] = useState<string | null>(null);

  // Automatic Token Purchase (Rp 25.000 = 25 Generate)
  const [buyerName, setBuyerName] = useState('M Ardian Nugraha');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS Instan' | 'Transfer Bank' | 'GoPay / DANA / OVO'>('QRIS Instan');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [newlyIssuedToken, setNewlyIssuedToken] = useState<AccessToken | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Hidden Administrator Panel State (Password: License92)
  const [showHiddenAdmin, setShowHiddenAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [allTokens, setAllTokens] = useState<AccessToken[]>([]);
  const [newAdminTokenLabel, setNewAdminTokenLabel] = useState('');
  const [newAdminTokenQuota, setNewAdminTokenQuota] = useState(25);

  // Image error fallbacks (Zero-Broken-Image Policy)
  const [heroImgError, setHeroImgError] = useState(false);
  const [docImgError, setDocImgError] = useState(false);

  const refreshTokensList = () => {
    setAllTokens(getStoredTokens());
  };

  useEffect(() => {
    refreshTokensList();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Kode Token ${code} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenCode.trim();
    if (!trimmed) {
      showToast('Masukkan kode token akses Anda terlebih dahulu.', 'error');
      return;
    }

    const result = validateAndUseToken(trimmed);
    if (result.valid) {
      showToast(result.message, 'success');
      onLoginSuccess();
    } else {
      if (result.isExhausted && result.token) {
        setExhaustedTokenCode(result.token.code);
      }
      showToast(result.message, 'error');
    }
  };

  const handleInstantPurchase25k = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      const issued = purchaseAutoToken25k(buyerName, paymentMethod);
      setNewlyIssuedToken(issued);
      setTokenCode(issued.code);
      setExhaustedTokenCode(null);
      refreshTokensList();
      setIsProcessingPayment(false);
      showToast(
        `Pembayaran Rp 25.000 terverifikasi! Token otomatis ${issued.code} (25x Generate Laporan) telah aktif.`,
        'success'
      );
    }, 350);
  };

  const handleTopUpExistingToken = (codeToTopUp: string) => {
    const updated = topUpTokenQuota(codeToTopUp, PACKAGE_QUOTA_GENERATES);
    if (updated) {
      refreshTokensList();
      setExhaustedTokenCode(null);
      showToast(
        `Pembayaran Rp 25.000 berhasil! Token ${updated.code} telah diisi ulang +25 kuota generate laporan.`,
        'success'
      );
      onLoginSuccess();
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(adminPassword)) {
      setIsAdminUnlocked(true);
      refreshTokensList();
      showToast('Hidden Panel Administrator berhasil dibuka.', 'success');
    } else {
      showToast('Password Administrator salah! Gunakan password lisensi resmi.', 'error');
    }
  };

  const handleAdminUnlimitedLogin = () => {
    const res = loginAsAdmin(adminPassword || 'License92');
    if (res.valid) {
      showToast(res.message, 'success');
      onLoginSuccess();
    }
  };

  const handleAdminCreateCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    const created = generateToken(
      newAdminTokenLabel || `Token Khusus (${newAdminTokenQuota} Generate)`,
      30,
      newAdminTokenQuota,
      PACKAGE_PRICE_IDR,
      newAdminTokenLabel || 'Pelanggan Jasa Laporan',
      'Lisensi Admin'
    );
    setNewAdminTokenLabel('');
    refreshTokensList();
    showToast(`Token baru ${created.code} (${newAdminTokenQuota}x Generate) berhasil dibuat!`, 'success');
  };

  const handleAdminTopUpToken = (id: string, code: string) => {
    topUpTokenQuota(id, 25);
    refreshTokensList();
    showToast(`Kuota token ${code} berhasil ditambah +25 generate!`, 'success');
  };

  const handleAdminToggleStatus = (id: string) => {
    toggleTokenStatus(id);
    refreshTokensList();
    showToast('Status aktif token diperbarui.', 'info');
  };

  const handleAdminDeleteToken = (id: string, code: string) => {
    deleteToken(id);
    refreshTokensList();
    showToast(`Token ${code} telah dihapus.`, 'info');
  };

  const totalRevenue = allTokens.reduce((acc, t) => acc + (t.pricePaid || PACKAGE_PRICE_IDR), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 overflow-y-auto no-print">
      <div className="min-h-screen w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN (7 Cols): Iklan Jasa Laporan e-Kinerja & Kajian Intervensi */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950">
          <div className="space-y-6">
            {/* Top Unboxed Kicker Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-400">Jasa & Generator Laporan Resmi</span>
              <span aria-hidden="true">·</span>
              <span>Standar Permensos RI No. 8 Tahun 2022</span>
              <span aria-hidden="true">·</span>
              <span>300 Skenario Kasus RHK 1–6</span>
            </div>

            {/* Expressive Hook Headline in Fraunces Display Serif */}
            <div className="space-y-3 max-w-2xl">
              <h1
                style={{ fontFamily: "'Fraunces', Georgia, serif", textWrap: 'balance' }}
                className="text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-white leading-[1.15]"
              >
                Selesaikan Laporan e-Kinerja & Kajian Ilmiah Pekerjaan Sosial dalam 30 Detik — Bukan 3 Hari.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-[65ch]">
                Solusi praktis bagi Wali Asuh dan Pekerja Sosial. Cukup ketik masalah siswa di asrama—seperti tidak mau makan, mogok sekolah, baju hilang, atau menolak upacara—sistem otomatis menentukan RHK, menyusun intervensi ilmiah, menaikkan nomor surat, dan menyiapkan dokumen siap cetak.
              </p>
            </div>

            {/* Reference Visual Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1 items-stretch">
              {/* Primary 16:9 Editorial Reference Image */}
              <div className="sm:col-span-7 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[210px] flex flex-col justify-end">
                {!heroImgError ? (
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Referensi meja kerja profesional dengan dokumen Laporan e-Kinerja resmi"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-700" />
                  </div>
                )}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <p className="text-xs font-semibold text-white">
                    Format Naskah Dinas & Kajian Tindakan Kelas/Asrama
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Otomatisasi Bab A–G · Tabel Kegiatan · Dokumentasi & QR Tanda Tangan
                  </p>
                </div>
              </div>

              {/* Secondary 4:3 Document Reference Image */}
              <div className="sm:col-span-5 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[210px] flex flex-col justify-end">
                {!docImgError ? (
                  <img
                    src={DOC_PREVIEW_IMAGE_URL}
                    alt="Preview cetakan halaman laporan penelitian dan evaluasi kinerja"
                    referrerPolicy="no-referrer"
                    onError={() => setDocImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-700" />
                  </div>
                )}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <p className="text-xs font-semibold text-amber-300 tabular-nums">
                    Rp 1.000 / Laporan Lengkap
                  </p>
                  <p className="text-[11px] text-slate-200 mt-0.5">
                    Cover Penelitian Hal. 1 · Daftar Isi Rata Kanan-Kiri Hal. 2 · Ekspor Word (.docx)
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial Numbered Service Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">
                  01. 300 Kasus Asrama Siap Pakai
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  50 variabel kasus untuk setiap RHK (RHK 1 s.d. RHK 6) lengkap dengan teori dan tahapan intervensi Pekerjaan Sosial.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">
                  02. Tata Naskah Permensos 8/2022
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Margin resmi (Kiri 3cm, Atas 2cm, Kanan 2cm, Bawah 2.5cm), nomor surat otomatis naik, dan arsip JSON tersimpan otomatis.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">
                  03. Sistem Token Kuota Transparan
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cukup bayar <span className="text-amber-300 font-semibold tabular-nums">Rp 25.000</span> langsung dapat token otomatis untuk <span className="text-white font-semibold tabular-nums">25x Generate Laporan</span>. Habis baru isi ulang.
                </p>
              </div>
            </div>
          </div>

          {/* Left Column Footer Proof & Pricing Summary */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium">Layanan Dokumen e-Kinerja Wali Asuh & Peksos</span>
              <span aria-hidden="true">·</span>
              <span>Siap Cetak PDF & Microsoft Word (.docx)</span>
            </div>
            <div className="font-mono text-xs text-amber-400 font-semibold tabular-nums">
              Paket Hemat: Rp 25.000 / 25 Generate
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Simple Login & Token Otomatis Panel */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 bg-slate-900/70 flex flex-col justify-between">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Panel Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400">
                  Akses Portal Generator Laporan
                </span>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Rp 25.000 = 25 Laporan
                </span>
              </div>
              <h2
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                className="text-2xl font-bold text-white tracking-tight"
              >
                Masuk atau Ambil Token Otomatis
              </h2>
              <p className="text-xs text-slate-400">
                Gunakan kode token Anda atau bayar Rp 25.000 untuk menerbitkan token otomatis berisi 25 kuota generate laporan.
              </p>
            </div>

            {/* Banner if redirected due to exhausted quota */}
            {(exhaustedMessage || exhaustedTokenCode) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <p className="font-semibold text-amber-300">
                  Kuota 25x Generate Laporan Anda Telah Habis
                </p>
                <p className="text-amber-100/90 leading-relaxed">
                  {exhaustedMessage ||
                    `Seluruh 25 kuota generate pada token ${exhaustedTokenCode} telah terpakai. Silakan bayar Rp 25.000 untuk mendapat 25 generate laporan lagi.`}
                </p>
                {exhaustedTokenCode && (
                  <button
                    type="button"
                    onClick={() => handleTopUpExistingToken(exhaustedTokenCode)}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Bayar Rp 25.000 & Isi Ulang +25 Kuota ({exhaustedTokenCode})</span>
                  </button>
                )}
              </div>
            )}

            {/* Interactive Segmented Control (Beli Token Otomatis vs Pakai Token) */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('use_token')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'use_token'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Masuk dengan Token</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('buy_token')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'buy_token'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Beli Token (Rp 25.000)</span>
              </button>
            </div>

            {activeTab === 'use_token' ? (
              /* TAB 1: MASUK DENGAN KODE TOKEN */
              <div className="space-y-5">
                <form onSubmit={handleTokenSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Kode Token Akses (25 Generate)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Otomatis potong 1 kuota / generate
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={tokenCode}
                        onChange={(e) => setTokenCode(e.target.value)}
                        placeholder="Contoh: SRT31-25GEN-PRO26"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-sm font-mono font-semibold tracking-wider focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masuk & Aktifkan Sesi Laporan</span>
                  </button>
                </form>

                {/* Daftar Token Aktif Siap Pakai (Klik untuk Autofill) */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Token Tersedia di Perangkat Anda
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('buy_token')}
                      className="text-amber-400 hover:underline text-[11px] font-medium cursor-pointer"
                    >
                      + Beli Token Baru (Rp 25.000)
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {allTokens.slice(0, 4).map((tok) => {
                      const rem = Math.max(0, tok.quotaTotal - tok.quotaUsed);
                      const isZero = rem <= 0;
                      return (
                        <div
                          key={tok.id}
                          className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-white truncate">
                                {tok.code}
                              </span>
                              <span className="text-slate-500" aria-hidden="true">·</span>
                              <span
                                className={`font-mono tabular-nums text-[11px] ${
                                  isZero ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                Sisa {rem}/{tok.quotaTotal} generate
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {tok.label}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isZero ? (
                              <button
                                type="button"
                                onClick={() => handleTopUpExistingToken(tok.code)}
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer whitespace-nowrap"
                              >
                                Top-Up Rp 25rb
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const res = validateAndUseToken(tok.code);
                                  if (res.valid) {
                                    showToast(res.message, 'success');
                                    onLoginSuccess();
                                  } else {
                                    showToast(res.message, 'error');
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] rounded-lg cursor-pointer whitespace-nowrap flex items-center gap-1"
                              >
                                <span>Pakai</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: BELI / AKTIVASI TOKEN OTOMATIS (RP 25.000 = 25 GENERATE) */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Paket 25x Generate Laporan Lengkap
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Aktif otomatis setelah konfirmasi pembayaran
                      </span>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-lg font-bold text-amber-400 block">
                        Rp {PACKAGE_PRICE_IDR.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Rp 1.000 / laporan
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleInstantPurchase25k} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Pemesan / Pegawai
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Metode Pembayaran Otomatis
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['QRIS Instan', 'Transfer Bank', 'GoPay / DANA / OVO'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-2 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer truncate ${
                              paymentMethod === method
                                ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Simulasi Kode Bayar / QRIS */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white text-slate-950 flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <p className="font-semibold text-white">
                          Nominal Tagihan: <span className="font-mono text-amber-400 tabular-nums">Rp 25.000</span>
                        </p>
                        <p className="text-slate-400">
                          Sistem otomatis menerbitkan kode token berisi <strong>25 kuota generate laporan</strong> begitu tombol konfirmasi ditekan.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isProcessingPayment
                          ? 'Memproses Token Otomatis...'
                          : 'Bayar Rp 25.000 & Terbitkan Token (25 Generate)'}
                      </span>
                    </button>
                  </form>
                </div>

                {/* Box Token Baru yang Baru Saja Diterbitkan */}
                {newlyIssuedToken && (
                  <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">
                        Token Otomatis Berhasil Diterbitkan!
                      </span>
                      <span className="text-xs font-mono text-emerald-400 tabular-nums">
                        Kuota: {newlyIssuedToken.quotaTotal}x Generate
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30">
                      <code className="font-mono font-bold text-sm text-white tracking-wider">
                        {newlyIssuedToken.code}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(newlyIssuedToken.code)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === newlyIssuedToken.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={onLoginSuccess}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Langsung Masuk ke Aplikasi Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HIDDEN ADMINISTRATOR PANEL (Triggered subtly at the bottom) */}
            {showHiddenAdmin && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-white">
                        Hidden Panel Administrator
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHiddenAdmin(false)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Tutup Panel
                    </button>
                  </div>

                  {!isAdminUnlocked ? (
                    <form onSubmit={handleUnlockAdmin} className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Masukkan Password Lisensi Administrator
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswordText ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Password Administrator..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white rounded-lg py-2 pl-3 pr-9 text-xs font-mono focus:outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordText(!showPasswordText)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showPasswordText ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Buka Otoritas Administrator</span>
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {/* Admin Quick Stats */}
                      <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 tabular-nums">
                        <span className="text-slate-300">
                          Total Token: <strong className="text-white">{allTokens.length}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-amber-400 font-mono font-semibold">
                          Omzet: Rp {totalRevenue.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* 1-Click Admin Unlimited Access */}
                      <button
                        type="button"
                        onClick={handleAdminUnlimitedLogin}
                        className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Masuk Sebagai Admin (Unlimited Generate)</span>
                      </button>

                      {/* Create Custom Token Form */}
                      <form onSubmit={handleAdminCreateCustomToken} className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Buat Token Baru untuk Pelanggan
                        </label>
                        <div className="grid grid-cols-12 gap-2">
                          <input
                            type="text"
                            value={newAdminTokenLabel}
                            onChange={(e) => setNewAdminTokenLabel(e.target.value)}
                            placeholder="Nama pengguna / instansi"
                            className="col-span-7 bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                          />
                          <select
                            value={newAdminTokenQuota}
                            onChange={(e) => setNewAdminTokenQuota(Number(e.target.value))}
                            className="col-span-3 bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none"
                          >
                            <option value={25}>25 Gen</option>
                            <option value={50}>50 Gen</option>
                            <option value={100}>100 Gen</option>
                          </select>
                          <button
                            type="submit"
                            className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center cursor-pointer"
                            title="Terbitkan Token"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </form>

                      {/* Manage All Tokens List */}
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {allTokens.map((t) => {
                          const rem = Math.max(0, t.quotaTotal - t.quotaUsed);
                          return (
                            <div
                              key={t.id}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-white truncate">
                                    {t.code}
                                  </span>
                                  <span className="font-mono tabular-nums text-emerald-400">
                                    ({rem}/{t.quotaTotal})
                                  </span>
                                </div>
                                <div className="text-slate-400 truncate">{t.label}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAdminTopUpToken(t.id, t.code)}
                                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded cursor-pointer"
                                  title="Tambah +25 Generate"
                                >
                                  +25
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(t.code)}
                                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                  title="Salin Token"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdminToggleStatus(t.id)}
                                  className="px-1.5 py-1 bg-slate-800 text-slate-300 hover:text-white rounded cursor-pointer"
                                >
                                  {t.isActive ? 'Aktif' : 'Off'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdminDeleteToken(t.id, t.code)}
                                  className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                  title="Hapus Token"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column Quiet Footer with Discreet Hidden Admin Trigger */}
          <div className="max-w-md w-full mx-auto pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sistem Lisensi Token Otomatis · Rp 25.000 / 25 Laporan</span>
            <button
              type="button"
              onClick={() => setShowHiddenAdmin((prev) => !prev)}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Akses Administrator"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
