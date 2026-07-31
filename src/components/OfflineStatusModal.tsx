import React from 'react';
import { Wifi, WifiOff, HardDrive, ShieldCheck, CheckCircle2, XCircle, FileText, Download, X, HelpCircle } from 'lucide-react';

interface OfflineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isForceOffline: boolean;
  onToggleForceOffline: () => void;
  archivesCount: number;
}

export const OfflineStatusModal: React.FC<OfflineStatusModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isForceOffline,
  onToggleForceOffline,
  archivesCount,
}) => {
  if (!isOpen) return null;

  const isActuallyOffline = !isOnline || isForceOffline;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isActuallyOffline ? 'bg-amber-500/10 border-amber-200/80' : 'bg-emerald-500/10 border-emerald-200/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
              isActuallyOffline ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isActuallyOffline ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {isActuallyOffline ? 'Mode Offline Aktif' : 'Status Mode Online'}
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {isActuallyOffline
                  ? 'Aplikasi berjalan menggunakan Penyimpanan Lokal Browser'
                  : 'Terhubung ke jaringan internet dan cloud'}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Switch Box */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-900">Paksa Mode Offline (Force Offline)</div>
              <div className="text-[11px] text-gray-500 mt-0.5 max-w-xs">
                Aktifkan jika ingin menyimulasikan atau bekerja tanpa akses internet sama sekali.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
              <input
                type="checkbox"
                checked={isForceOffline}
                onChange={onToggleForceOffline}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Real Network Status */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Koneksi Internet</div>
              <div className="flex items-center gap-1.5 font-bold">
                {isOnline ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Terputus
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penyimpanan Lokal</div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                <HardDrive className="w-3.5 h-3.5" /> {archivesCount} Arsip Tersimpan
              </div>
            </div>
          </div>

          {/* Features Capability Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Kemampuan Mode Offline:
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Auto-Draft IndexedDB (Real-time)</span>
                  <p className="text-[11px] text-emerald-700">Setiap perubahan input disimpan otomatis ke IndexedDB (idb) agar data tidak hilang walau browser tertutup atau localStorage penuh.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Pembuatan & Edit Laporan</span>
                  <p className="text-[11px] text-emerald-700">Penyusunan narasi otomatis, pengeditan teks, dan format spasi/font 100% lokal.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Ekspor Word (.docx) & Cetak PDF</span>
                  <p className="text-[11px] text-emerald-700">Dapat mengunduh file Microsoft Word dan cetak PDF langsung tanpa internet.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Pustaka Template & Backup JSON</span>
                  <p className="text-[11px] text-emerald-700">Lebih dari 100 template RHK dan fitur ekspor/impor file backup JSON bekerja 100% offline.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-xl">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">Sinkronisasi Google Sheets</span>
                  <p className="text-[11px] text-amber-800">
                    {isActuallyOffline
                      ? 'Membutuhkan akses internet. Saat ini ditangguhkan dalam Mode Offline.'
                      : 'Tersedia saat terhubung internet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
