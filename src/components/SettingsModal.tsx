import React from 'react';
import {
  Settings,
  X,
  Wifi,
  WifiOff,
  Key,
  CloudUpload,
  LogOut,
  User,
  Shield,
  Loader2,
  HardDrive,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { ReportInputs } from '../types';
import { checkActiveTokenSession, getRemainingDays } from '../utils/tokenManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isActuallyOffline: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  setIsTokenManagerOpen: (open: boolean) => void;
  handleSaveGoogleSheet: () => void;
  isSavingSheet: boolean;
  handleLogout: () => void;
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isActuallyOffline,
  setIsOfflineModalOpen,
  setIsTokenManagerOpen,
  handleSaveGoogleSheet,
  isSavingSheet,
  handleLogout,
  inputs,
  setInputs,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const activeTokenSession = checkActiveTokenSession();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-6 h-6 text-slate-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Panel Pengaturan & Sistem
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Kelola jaringan, token akses 1 bulan, Google Sheet, dan akun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* User Profile Summary */}
          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {inputs.nama ? inputs.nama.split(' ').map((n) => n[0]).join('').slice(0, 2) : "MN"}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">{inputs.nama || "M Ardian Nugraha"}</p>
                <p className="text-[10.5px] text-blue-800 font-medium">NIP: {inputs.nip || '19980101 202601 1 001'}</p>
                <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Wali Asuh / Pekerja Sosial</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300 shrink-0">
              Pengguna Aktif
            </span>
          </div>

          {/* 1. Mode Jaringan / Offline */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {isActuallyOffline ? (
                  <WifiOff className="w-4 h-4 text-amber-600" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-bold text-gray-900">
                  Status Jaringan: {isActuallyOffline ? 'Mode Offline' : 'Mode Online'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {isActuallyOffline
                  ? 'Aplikasi berjalan secara lokal tanpa koneksi internet.'
                  : 'Terhubung ke server & Google Sheets secara real-time.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsOfflineModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              Pengaturan
            </button>
          </div>

          {/* 2. Token Akses 1 Bulan */}
          <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold text-purple-950">
                  Token Akses Web 1 Bulan
                </span>
              </div>
              <p className="text-[11px] text-purple-800">
                {activeTokenSession.isValid
                  ? `Sesi Token: ${activeTokenSession.code} (${getRemainingDays(activeTokenSession.expiresAt || '')} hari lagi)`
                  : 'Buat dan bagikan kode token 30 hari untuk pengguna e-Kinerja.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsTokenManagerOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Kelola Token
            </button>
          </div>

          {/* 3. Integrasi Google Sheets */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">
                    Database Google Sheets
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Sinkronkan laporan langsung ke Google Spreadsheet e-Kinerja
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveGoogleSheet}
                disabled={isSavingSheet}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
              >
                {isSavingSheet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Simpan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. Keluar dari Akun */}
          <div className="p-4 bg-red-50/50 border border-red-200/70 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-red-950 block">
                Keluar dari Akun (Logout)
              </span>
              <p className="text-[11px] text-red-700">
                Mengakhiri sesi e-Kinerja dan kembali ke halaman login utama.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                handleLogout();
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10.5px] text-gray-500 font-medium">
            e-Kinerja SRT 31 Palembang v2.5
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
