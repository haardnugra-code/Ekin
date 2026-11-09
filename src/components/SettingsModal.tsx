import React, { useState } from 'react';
import {
  Settings,
  X,
  Wifi,
  WifiOff,
  Key,
  CloudUpload,
  LogOut,
  Loader2,
  FileSpreadsheet,
  FileDown,
  Flag,
  HeartHandshake,
  FileSignature,
  GraduationCap,
  Sparkles,
  BookOpenCheck,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ReportInputs } from '../types';
import { TRAINING_MODULES, PEKSOS_INTERVENTION_GUIDES } from '../data/presets';
import { checkActiveTokenSession, getRemainingDays } from '../utils/tokenManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isActuallyOffline: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  setIsTokenManagerOpen: (open: boolean) => void;
  handleSaveGoogleSheet: () => void;
  isSavingSheet: boolean;
  handleExportDocx: () => void;
  isExportingDocx: boolean;
  handleLogout: () => void;
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  onGenerateReport?: () => void;
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
  handleExportDocx,
  isExportingDocx,
  handleLogout,
  inputs,
  setInputs,
  onGenerateReport,
  onShowToast,
}) => {
  const [activeKeluargaTab, setActiveKeluargaTab] = useState<'kunjungan' | 'konsultasi' | 'kesehatan' | 'intervensi'>(
    inputs.subTopikKeluargaKesehatan === 'kesehatan' || inputs.subTopikKeluargaKesehatan === 'kesehatan_anak'
      ? 'kesehatan'
      : inputs.subTopikKeluargaKesehatan === 'konsultasi' || inputs.subTopikKeluargaKesehatan === 'konsultasi_perkembangan'
      ? 'konsultasi'
      : 'kunjungan'
  );
  const [showPeksosGuide, setShowPeksosGuide] = useState<boolean>(false);
  const [selectedGuideIndex, setSelectedGuideIndex] = useState<number>(0);

  if (!isOpen) return null;

  const activeTokenSession = checkActiveTokenSession();

  const handleApplyAndGenerate = (featureName: string) => {
    if (onGenerateReport) {
      setTimeout(() => {
        onGenerateReport();
      }, 50);
    }
    onShowToast(`Variabel ${featureName} berhasil diterapkan ke laporan!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Menu Pengaturan Fitur & Sistem
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Aktifkan (ON/OFF) fitur Upacara, Kunjungan Ortu, Surat Tugas, Modul Pelatihan & Sistem
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
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* SECTION A: PENGATURAN FITUR TAMBAHAN LAPORAN (ON / OFF) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Fitur Variabel Khusus Laporan (Mode ON / OFF)
                </h4>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                Klik ON untuk Membuka Variabel
              </span>
            </div>

            {/* 1. FITUR UPACARA BENDERA (RHK 1) */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                inputs.aktifFiturUpacara
                  ? 'bg-red-50/60 border-red-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      inputs.aktifFiturUpacara
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-900">
                        1. Variabel Laporan Upacara Bendera (RHK 1)
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          inputs.aktifFiturUpacara
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inputs.aktifFiturUpacara ? 'ON (Aktif)' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Jenis upacara, pembina, peran wali asuh, amanat, dan ketertiban barisan
                    </p>
                  </div>
                </div>

                {/* Switch ON / OFF */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(inputs.aktifFiturUpacara)}
                  onClick={() => {
                    const nextVal = !inputs.aktifFiturUpacara;
                    setInputs((prev) => ({
                      ...prev,
                      aktifFiturUpacara: nextVal,
                      ...(nextVal ? { rhk: '1' } : {}),
                    }));
                    onShowToast(
                      nextVal
                        ? 'Fitur Upacara Bendera diaktifkan (ON)'
                        : 'Fitur Upacara Bendera dinonaktifkan (OFF)',
                      nextVal ? 'success' : 'info'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    inputs.aktifFiturUpacara ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      inputs.aktifFiturUpacara ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Detail Variabel Upacara (Hanya muncul saat ON) */}
              {inputs.aktifFiturUpacara && (
                <div className="p-3.5 pt-2 border-t border-red-200/80 space-y-2.5 text-xs bg-white/80">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-red-900 uppercase tracking-wider">
                      Preset Cepat Laporan Upacara:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInputs((prev) => ({
                            ...prev,
                            rhk: '1',
                            aktifFiturUpacara: true,
                            dailyPreset: 'upacara',
                            skenario: '20',
                            jenisUpacara: 'Upacara Bendera Rutin Hari Senin',
                            judul: 'BIMBINGAN KEDISIPLINAN DAN KETERTIBAN UPACARA BENDERA HARI SENIN',
                            permasalahan:
                              'Siswa asrama menunjukkan kecenderungan kurang fokus, mengobrol di barisan peleton, dan beberapa atribut seragam upacara (topi/dasi) belum tertib saat upacara bendera hari Senin.',
                            solusi:
                              'Melakukan pengawalan langsung peleton barisan, melatih konsentrasi sikap tegap PBB, menginspeksi kelengkapan atribut seragam, serta menanamkan nilai nasionalisme dan kepatuhan tata upacara bendera.',
                          }));
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[10.5px] font-bold text-red-950 transition-colors cursor-pointer"
                      >
                        🇮🇩 Upacara Senin
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInputs((prev) => ({
                            ...prev,
                            rhk: '1',
                            aktifFiturUpacara: true,
                            dailyPreset: 'upacara_phbn',
                            skenario: '22',
                            jenisUpacara: 'Upacara Peringatan Hari Besar Nasional (PHBN)',
                            judul: 'PENDAMPINGAN DAN BIMBINGAN UPACARA PERINGATAN HARI BESAR NASIONAL (PHBN)',
                            permasalahan:
                              'Siswa kurang menghayati momentum upacara peringatan hari besar nasional (HUT RI/Hari Pahlawan/Sumpah Pemuda/Hardiknas) dan pasif saat mengheningkan cipta.',
                            solusi:
                              'Memberikan bimbingan refleksi historis nilai perjuangan pahlawan, memandu sikap khidmat penghormatan lambang negara, dan menumbuhkan rasa bangga sebagai tunas bangsa.',
                          }));
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[10.5px] font-bold text-red-950 transition-colors cursor-pointer"
                      >
                        🎖️ Upacara PHBN
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInputs((prev) => ({
                            ...prev,
                            rhk: '1',
                            aktifFiturUpacara: true,
                            dailyPreset: 'upacara_petugas',
                            skenario: '21',
                            jenisUpacara: 'Upacara Bendera (Pelatihan Petugas Upacara)',
                            judul: 'BIMBINGAN DAN PELATIHAN KESIAPAN MENTAL PETUGAS UPACARA BENDERA SISWA',
                            permasalahan:
                              'Petugas upacara siswa mengalami kecemasan performa (performance anxiety), grogi saat melangkah, dan kesulitan sinkronisasi tempo pengibaran bendera merah putih.',
                            solusi:
                              'Melaksanakan gladi kotor dan gladi bersih terarah, melatih teknik visualisasi positif serta regulasi emosi, dan mendampingi kekompakan tim petugas upacara.',
                          }));
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[10.5px] font-bold text-red-950 transition-colors cursor-pointer"
                      >
                        ⭐ Petugas Upacara
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                      Pilihan Jenis Upacara
                    </label>
                    <select
                      value={inputs.jenisUpacara || 'Upacara Bendera Rutin Hari Senin'}
                      onChange={(e) => setInputs((prev) => ({ ...prev, jenisUpacara: e.target.value }))}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-medium text-gray-900 cursor-pointer"
                    >
                      <option value="Upacara Bendera Rutin Hari Senin">Upacara Bendera Rutin Hari Senin</option>
                      <option value="Upacara Peringatan Hari Kemerdekaan RI (17 Agustus)">Upacara Peringatan Hari Kemerdekaan RI (17 Agustus)</option>
                      <option value="Upacara Peringatan Hari Pahlawan (10 November)">Upacara Peringatan Hari Pahlawan (10 November)</option>
                      <option value="Upacara Peringatan Hari Sumpah Pemuda (28 Oktober)">Upacara Peringatan Hari Sumpah Pemuda (28 Oktober)</option>
                      <option value="Upacara Peringatan Hari Kesaktian Pancasila (1 Oktober)">Upacara Peringatan Hari Kesaktian Pancasila (1 Oktober)</option>
                      <option value="Upacara Peringatan Hari Pendidikan Nasional (2 Mei)">Upacara Peringatan Hari Pendidikan Nasional (2 Mei)</option>
                      <option value="Upacara Peringatan Hari Lahir Pancasila (1 Juni)">Upacara Peringatan Hari Lahir Pancasila (1 Juni)</option>
                      <option value="Upacara Peringatan Hari Santri Nasional">Upacara Peringatan Hari Santri Nasional</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Peran Wali Asuh
                      </label>
                      <input
                        type="text"
                        value={inputs.peranWaliAsuhUpacara ?? 'Pendamping dan Pengawas Barisan Peleton Siswa Asrama'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, peranWaliAsuhUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Pembina Upacara
                      </label>
                      <input
                        type="text"
                        value={inputs.pembinaUpacara ?? 'Kepala Sekolah / Direktur Sekolah Rakyat Terintegrasi 31 Palembang'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, pembinaUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Lokasi Upacara
                      </label>
                      <input
                        type="text"
                        value={inputs.lokasiUpacara ?? 'Lapangan Utama Sekolah Rakyat Terintegrasi 31 Palembang'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, lokasiUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Inti Amanat / Nilai Karakter
                      </label>
                      <input
                        type="text"
                        value={inputs.amanatUpacara ?? 'Penanaman Nilai Nasionalisme, Integritas, Kedisiplinan, dan Semangat Belajar Siswa'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, amanatUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Peserta Upacara
                      </label>
                      <input
                        type="text"
                        value={inputs.jumlahPesertaUpacara ?? 'Seluruh Siswa Asrama, Dewan Guru, dan Tenaga Kependidikan'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, jumlahPesertaUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Catatan Ketertiban & P3K
                      </label>
                      <input
                        type="text"
                        value={inputs.catatanKedisiplinanUpacara ?? 'Barisan tertib, atribut lengkap, 1 siswa ditangani di pos P3K'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, catatanKedisiplinanUpacara: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyAndGenerate('Upacara Bendera')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-red-100" />
                      <span>Terapkan & Susun Laporan Upacara</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. FITUR KUNJUNGAN ORANG TUA, KONSULTASI & KESEHATAN ANAK */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                inputs.aktifFiturKunjungan
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      inputs.aktifFiturKunjungan
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-900">
                        2. Kunjungan Orang Tua, Konsultasi & Kesehatan Anak
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          inputs.aktifFiturKunjungan
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inputs.aktifFiturKunjungan ? 'ON (Aktif)' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Data besuk orang tua, konsultasi pola asuh, penanganan UKS & penjelasan intervensi Peksos
                    </p>
                  </div>
                </div>

                {/* Switch ON / OFF */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(inputs.aktifFiturKunjungan)}
                  onClick={() => {
                    const nextVal = !inputs.aktifFiturKunjungan;
                    setInputs((prev) => ({
                      ...prev,
                      aktifFiturKunjungan: nextVal,
                    }));
                    onShowToast(
                      nextVal
                        ? 'Fitur Kunjungan Ortu & Kesehatan Anak diaktifkan (ON)'
                        : 'Fitur Kunjungan Ortu & Kesehatan Anak dinonaktifkan (OFF)',
                      nextVal ? 'success' : 'info'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    inputs.aktifFiturKunjungan ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      inputs.aktifFiturKunjungan ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Detail Variabel Kunjungan Ortu & Kesehatan (Hanya muncul saat ON) */}
              {inputs.aktifFiturKunjungan && (
                <div className="p-3.5 pt-2 border-t border-emerald-200/80 space-y-3 text-xs bg-white/80">
                  {/* Preset Cepat */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '3',
                          aktifFiturKunjungan: true,
                          dailyPreset: 'kunjungan_ortu',
                          skenario: '20',
                          subTopikKeluargaKesehatan: 'kunjungan',
                          judul: 'KUNJUNGAN ORANG TUA DAN KONSULTASI PERKEMBANGAN ADAPTASI PESERTA DIDIK',
                          permasalahan:
                            'Orang tua berkunjung ke asrama untuk mengetahui perkembangan belajar dan penyesuaian perilaku anak, di mana siswa sempat mengalami kecemasan perpisahan (separation anxiety) dan perbedaan persepsi pola asuh antara keluarga dan asrama.',
                          solusi:
                            'Melaksanakan bimbingan kasus keluarga (Family Casework & Mediation), memaparkan catatan perkembangan anak secara objektif dengan pendekatan Person-in-Environment (PIE), serta menyepakati komitmen pola asuh kolaboratif (Parenting Alignment) demi kenyamanan anak di Sekolah Rakyat.',
                        }));
                        setActiveKeluargaTab('kunjungan');
                      }}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10.5px] font-bold text-emerald-950 cursor-pointer"
                    >
                      👨‍👩‍👧 Kunjungan Ortu
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '2',
                          aktifFiturKunjungan: true,
                          dailyPreset: 'kesehatan_anak',
                          skenario: '22',
                          subTopikKeluargaKesehatan: 'kesehatan',
                          judul: 'PENDAMPINGAN DAN PEMANTAUAN KESEHATAN SERTA PERAWATAN DIRI PESERTA DIDIK',
                          permasalahan:
                            'Siswa asrama mengalami keluhan kesehatan fisik (demam subfebris/pusing/kelelahan psikosomatis) serta membutuhkan penanganan UKS dan pembiasaan hidup bersih dan sehat.',
                          solusi:
                            'Memberikan pertolongan pertama dan observasi di ruang UKS, menerapkan intervensi dukungan biopsikososial (Biopsychosocial Support & Health Advocacy), berkoordinasi dengan tenaga medis/Puskesmas, serta mengedukasi Pola Hidup Bersih dan Sehat (PHBS).',
                        }));
                        setActiveKeluargaTab('kesehatan');
                      }}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10.5px] font-bold text-blue-950 cursor-pointer"
                    >
                      🩺 Kesehatan Siswa
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '3',
                          aktifFiturKunjungan: true,
                          dailyPreset: 'konsultasi_perkembangan',
                          skenario: '21',
                          subTopikKeluargaKesehatan: 'konsultasi',
                          judul: 'KONSULTASI PERKEMBANGAN AKADEMIK, KEMANDIRIAN, DAN KARAKTER ANAK BERSAMA ORANG TUA',
                          permasalahan:
                            'Dibutuhkan penyelarasan evaluasi perkembangan belajar, kemandirian harian (ADL), serta dinamika emosional anak antara lingkungan asrama dan ekspektasi orang tua siswa.',
                          solusi:
                            'Mengadakan sesi konsultasi tatap muka menggunakan teknik komunikasi terapeutik OARS, memaparkan rekam jejak pengasuhan, menyusun kontrak perilaku bersama (Behavioral Contract), dan merumuskan rencana tindak lanjut pengasuhan terintegrasi.',
                        }));
                        setActiveKeluargaTab('konsultasi');
                      }}
                      className="p-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-[10.5px] font-bold text-teal-950 cursor-pointer"
                    >
                      🤝 Pola Asuh
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveKeluargaTab('kunjungan');
                        setInputs((p) => ({ ...p, subTopikKeluargaKesehatan: 'kunjungan' }));
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        activeKeluargaTab === 'kunjungan' ? 'bg-emerald-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      👨‍👩‍👧 Kunjungan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveKeluargaTab('konsultasi');
                        setInputs((p) => ({ ...p, subTopikKeluargaKesehatan: 'konsultasi' }));
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        activeKeluargaTab === 'konsultasi' ? 'bg-teal-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      🤝 Konsultasi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveKeluargaTab('kesehatan');
                        setInputs((p) => ({ ...p, subTopikKeluargaKesehatan: 'kesehatan' }));
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        activeKeluargaTab === 'kesehatan' ? 'bg-blue-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      🩺 Kesehatan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveKeluargaTab('intervensi')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        activeKeluargaTab === 'intervensi' ? 'bg-indigo-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      🧠 Teori Peksos
                    </button>
                  </div>

                  {activeKeluargaTab === 'kunjungan' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                            Nama Orang Tua / Wali
                          </label>
                          <input
                            type="text"
                            value={inputs.namaOrangTuaWali ?? 'Bpk. Hendra & Ibu Suryani'}
                            onChange={(e) => setInputs((prev) => ({ ...prev, namaOrangTuaWali: e.target.value }))}
                            className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                            Hubungan Keluarga
                          </label>
                          <select
                            value={inputs.hubunganKeluarga ?? 'Orang Tua Kandung'}
                            onChange={(e) => setInputs((prev) => ({ ...prev, hubunganKeluarga: e.target.value }))}
                            className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer"
                          >
                            <option value="Orang Tua Kandung">Orang Tua Kandung</option>
                            <option value="Wali Murid Resmi">Wali Murid Resmi</option>
                            <option value="Kakek / Nenek">Kakek / Nenek</option>
                            <option value="Paman / Bibi">Paman / Bibi</option>
                            <option value="Kerabat Keluarga">Kerabat Keluarga</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Waktu & Sesi Kunjungan
                        </label>
                        <input
                          type="text"
                          value={inputs.waktuKunjungan ?? 'Minggu, 10.00 - 12.30 WIB (Jam Kunjung Resmi)'}
                          onChange={(e) => setInputs((prev) => ({ ...prev, waktuKunjungan: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Catatan Observasi Interaksi & Respon Anak
                        </label>
                        <textarea
                          rows={2}
                          value={
                            inputs.catatanObservasiKeluarga ??
                            'Interaksi berlangsung hangat dan penuh keharuan. Siswa antusias menceritakan prestasinya di asrama, kecemasan perpisahan berangsur menurun.'
                          }
                          onChange={(e) => setInputs((prev) => ({ ...prev, catatanObservasiKeluarga: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {activeKeluargaTab === 'konsultasi' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Fokus Konsultasi Perkembangan (Akademik, ADL & Karakter)
                        </label>
                        <textarea
                          rows={2}
                          value={
                            inputs.fokusKonsultasiPerkembangan ??
                            'Kemandirian ibadah, kedisiplinan belajar malam, adaptasi pertemanan asrama, dan regulasi rindu keluarga.'
                          }
                          onChange={(e) => setInputs((prev) => ({ ...prev, fokusKonsultasiPerkembangan: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Kesepakatan Pola Asuh & Komitmen Keluarga (Parenting Alignment)
                        </label>
                        <textarea
                          rows={2}
                          value={
                            inputs.kesepakatanPolaAsuh ??
                            'Orang tua mendukung pembatasan gawai saat di rumah, memperkuat motivasi belajar anak, dan konsisten mematuhi jam kunjung asrama.'
                          }
                          onChange={(e) => setInputs((prev) => ({ ...prev, kesepakatanPolaAsuh: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {activeKeluargaTab === 'kesehatan' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Keluhan Kesehatan / Gejala Fisik Anak
                        </label>
                        <textarea
                          rows={2}
                          value={
                            inputs.keluhanKesehatanAnak ??
                            'Demam subfebris (38.1°C), pusing kepala, dan rasa lesu akibat kelelahan aktivitas belajar.'
                          }
                          onChange={(e) => setInputs((prev) => ({ ...prev, keluhanKesehatanAnak: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Tindakan Penanganan Awal UKS / P3K
                        </label>
                        <textarea
                          rows={2}
                          value={
                            inputs.tindakanKesehatanAwal ??
                            'Istirahat di ruang isolasi UKS, kompres hangat, pemberian paracetamol sesuai SOP medis, dan pemenuhan hidrasi air putih hangat.'
                          }
                          onChange={(e) => setInputs((prev) => ({ ...prev, tindakanKesehatanAwal: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                            Fasilitas Rujukan Medis
                          </label>
                          <input
                            type="text"
                            value={inputs.fasilitasKesehatanRujukan ?? 'Klinik Pratama / UKS Asrama Sekolah Rakyat Kemensos RI'}
                            onChange={(e) => setInputs((prev) => ({ ...prev, fasilitasKesehatanRujukan: e.target.value }))}
                            className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                            Status Kondisi Anak
                          </label>
                          <select
                            value={inputs.statusKondisiAnak ?? 'Istirahat Tirah Baring di UKS (Dalam Observasi Berkala)'}
                            onChange={(e) => setInputs((prev) => ({ ...prev, statusKondisiAnak: e.target.value }))}
                            className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer"
                          >
                            <option value="Istirahat Tirah Baring di UKS (Dalam Observasi Berkala)">
                              Istirahat Tirah Baring di UKS
                            </option>
                            <option value="Rawat Jalan & Observasi di Kamar Asrama">
                              Rawat Jalan di Kamar Asrama
                            </option>
                            <option value="Dirujuk ke Puskesmas Pembantu / RSUD Terdekat">
                              Dirujuk ke Puskesmas / RSUD
                            </option>
                            <option value="Kondisi Membaik / Sembuh & Kembali Beraktivitas">
                              Sembuh & Kembali Beraktivitas
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeKeluargaTab === 'intervensi' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Metode Intervensi Pekerjaan Sosial (Peksos)
                        </label>
                        <select
                          value={inputs.metodeIntervensiPeksos ?? 'Family Casework & Mediation'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matchedGuide = PEKSOS_INTERVENTION_GUIDES.find((g) => g.nama === val);
                            setInputs((prev) => ({
                              ...prev,
                              metodeIntervensiPeksos: val,
                              penjelasanIntervensiPeksos: matchedGuide
                                ? `${matchedGuide.definisiTeori} Tujuan intervensi: ${matchedGuide.tujuanUtama}. Langkah praktis: ${matchedGuide.langkahPraktis.join(' ')}`
                                : prev.penjelasanIntervensiPeksos,
                            }));
                          }}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer font-semibold"
                        >
                          {PEKSOS_INTERVENTION_GUIDES.map((g) => (
                            <option key={g.id} value={g.nama}>
                              {g.singkatan} - {g.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                          Penjelasan Intervensi Peksos (Teori & Langkah Praktis)
                        </label>
                        <textarea
                          rows={3}
                          value={inputs.penjelasanIntervensiPeksos ?? ''}
                          onChange={(e) => setInputs((prev) => ({ ...prev, penjelasanIntervensiPeksos: e.target.value }))}
                          className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>

                      {/* Collapsible Panduan Teori Lengkap */}
                      <button
                        type="button"
                        onClick={() => setShowPeksosGuide(!showPeksosGuide)}
                        className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-bold text-[11px] flex items-center justify-between cursor-pointer border border-indigo-200"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpenCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Baca Panduan 5 Teori Intervensi Peksos & Studi Kasus
                        </span>
                        {showPeksosGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showPeksosGuide && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                          <div className="flex flex-wrap gap-1">
                            {PEKSOS_INTERVENTION_GUIDES.map((g, idx) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => setSelectedGuideIndex(idx)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                                  selectedGuideIndex === idx
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700'
                                }`}
                              >
                                {g.singkatan}
                              </button>
                            ))}
                          </div>
                          {(() => {
                            const g = PEKSOS_INTERVENTION_GUIDES[selectedGuideIndex] || PEKSOS_INTERVENTION_GUIDES[0];
                            return (
                              <div className="space-y-1.5 text-[11px]">
                                <p className="font-bold text-emerald-950">{g.nama}</p>
                                <p className="text-gray-700">{g.definisiTeori}</p>
                                <div className="space-y-1 pt-1">
                                  {g.langkahPraktis.map((st, i) => (
                                    <div key={i} className="bg-white p-1.5 rounded border border-gray-200 text-gray-800">
                                      {st}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyAndGenerate('Kunjungan & Kesehatan')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                      <span>Terapkan & Susun Laporan Peksos</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. FITUR SURAT TUGAS PIMPINAN / DIREKTUR (RHK 6) */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                inputs.sertakanDetailSuratTugas
                  ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      inputs.sertakanDetailSuratTugas
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-900">
                        3. Detail Surat Tugas Direktur / Pimpinan (RHK 6)
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          inputs.sertakanDetailSuratTugas
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inputs.sertakanDetailSuratTugas ? 'ON (Aktif)' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Nomor Surat Tugas, Tanggal ST, Pemberi Tugas & Dasar Pelaksanaan Penugasan
                    </p>
                  </div>
                </div>

                {/* Switch ON / OFF */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(inputs.sertakanDetailSuratTugas)}
                  onClick={() => {
                    const nextVal = !inputs.sertakanDetailSuratTugas;
                    setInputs((prev) => ({
                      ...prev,
                      sertakanDetailSuratTugas: nextVal,
                    }));
                    onShowToast(
                      nextVal
                        ? 'Fitur Detail Surat Tugas diaktifkan (ON)'
                        : 'Fitur Detail Surat Tugas dinonaktifkan (OFF)',
                      nextVal ? 'success' : 'info'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    inputs.sertakanDetailSuratTugas ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      inputs.sertakanDetailSuratTugas ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Detail Input Surat Tugas (Hanya muncul saat ON) */}
              {inputs.sertakanDetailSuratTugas && (
                <div className="p-3.5 pt-2 border-t border-indigo-200/80 space-y-2.5 text-xs bg-white/80">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '6',
                          sertakanDetailSuratTugas: true,
                          jenisPenugasan: 'pelatihan',
                          judul: 'PELATIHAN PENINGKATAN KAPASITAS PENGASUHAN DAN KESEJAHTERAAN SOSIAL',
                          permasalahan:
                            'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Peningkatan Kapasitas Layanan Pengasuhan dan Kesejahteraan Sosial Peserta Didik.',
                          solusi:
                            'Mengikuti seluruh rangkaian sesi pelatihan secara aktif, menyusun resume materi, menerapkan modul pengasuhan terbaru, serta menyusun rencana aksi pengimbasan (cascade training) di lingkungan Sekolah Rakyat.',
                        }));
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[10.5px] font-bold text-indigo-950 cursor-pointer"
                    >
                      🎓 Penugasan Diklat
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '6',
                          sertakanDetailSuratTugas: true,
                          jenisPenugasan: 'operasional',
                          judul: 'PERGANTIAN TUGAS OPERASIONAL DAN SHIFT PIKET PENGASUHAN ASRAMA',
                          permasalahan:
                            'Penugasan pergantian tugas operasional dan shift piket pengasuhan asrama secara mendadak akibat berhalangannya petugas utama demi menjaga kontinuitas layanan dan keamanan peserta didik.',
                          solusi:
                            'Melaksanakan serah terima tugas (handover) operasional secara cermat, mengendalikan pengawasan penuh kegiatan asrama, serta mencatat logbook aktivitas layanan siswa selama masa pergantian tugas.',
                        }));
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[10.5px] font-bold text-indigo-950 cursor-pointer"
                    >
                      🔄 Piket Operasional
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputs((prev) => ({
                          ...prev,
                          rhk: '6',
                          sertakanDetailSuratTugas: true,
                          jenisPenugasan: 'mpls',
                          judul: 'PENDAMPINGAN KEGIATAN MASA PENGENALAN LINGKUNGAN SEKOLAH (MPLS) DAN ORIENTASI ASRAMA',
                          permasalahan:
                            'Penugasan khusus dari Direktur/Pimpinan sebagai Tim Panitia dan Pendamping Kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS) dan Orientasi Kehidupan Asrama bagi Peserta Didik Baru.',
                          solusi:
                            'Mendampingi siswa baru dalam pengenalan tata tertib, fasilitas asrama, simulasi rutinitas harian, serta melaksanakan pendampingan awal cegah homesickness dan adaptasi psikososial.',
                        }));
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[10.5px] font-bold text-indigo-950 cursor-pointer"
                    >
                      🏫 Panitia MPLS
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                      Nomor Surat Tugas Penugasan
                    </label>
                    <input
                      type="text"
                      value={inputs.nomorSuratTugas ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, nomorSuratTugas: e.target.value }))}
                      placeholder="misal: ST-088/SRT.31/PLM/08/2026"
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Tanggal Surat Tugas
                      </label>
                      <input
                        type="text"
                        value={inputs.tanggalSuratTugas ?? ''}
                        onChange={(e) => setInputs((prev) => ({ ...prev, tanggalSuratTugas: e.target.value }))}
                        placeholder="misal: 10 Agustus 2026"
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-gray-800 mb-0.5">
                        Pemberi Tugas / Atasan
                      </label>
                      <input
                        type="text"
                        value={inputs.pemberiTugas ?? ''}
                        onChange={(e) => setInputs((prev) => ({ ...prev, pemberiTugas: e.target.value }))}
                        placeholder="Direktur Sekolah Rakyat Terintegrasi 31"
                        className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyAndGenerate('Surat Tugas')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-100" />
                      <span>Terapkan & Susun Laporan Surat Tugas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. FITUR VARIABEL MODUL PELATIHAN PUSDIKLATBANGPROF */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                inputs.aktifFiturPelatihan
                  ? 'bg-purple-50/60 border-purple-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      inputs.aktifFiturPelatihan
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-900">
                        4. Variabel Modul Pelatihan Pusdiklatbangprof
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          inputs.aktifFiturPelatihan
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inputs.aktifFiturPelatihan ? 'ON (Aktif)' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Pilihan modul diklat Kemensos, alokasi JP, metode FGD, penyelenggara & rencana aksi
                    </p>
                  </div>
                </div>

                {/* Switch ON / OFF */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(inputs.aktifFiturPelatihan)}
                  onClick={() => {
                    const nextVal = !inputs.aktifFiturPelatihan;
                    setInputs((prev) => ({
                      ...prev,
                      aktifFiturPelatihan: nextVal,
                      ...(nextVal ? { sertakanDetailSuratTugas: true, rhk: '6', jenisPenugasan: 'pelatihan' } : {}),
                    }));
                    onShowToast(
                      nextVal
                        ? 'Fitur Variabel Modul Pelatihan diaktifkan (ON)'
                        : 'Fitur Variabel Modul Pelatihan dinonaktifkan (OFF)',
                      nextVal ? 'success' : 'info'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    inputs.aktifFiturPelatihan ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      inputs.aktifFiturPelatihan ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Detail Variabel Modul Pelatihan (Hanya muncul saat ON) */}
              {inputs.aktifFiturPelatihan && (
                <div className="p-3.5 pt-2 border-t border-purple-200/80 space-y-2.5 text-xs bg-white/80">
                  <div>
                    <label className="block text-[10.5px] font-bold text-gray-800 mb-1">
                      Pilih Modul Pelatihan Resmi Pusdiklatbangprof Kemensos:
                    </label>
                    <select
                      value={inputs.modulPelatihan || ''}
                      onChange={(e) => {
                        const modKey = e.target.value;
                        if (modKey && TRAINING_MODULES[modKey]) {
                          const mod = TRAINING_MODULES[modKey];
                          setInputs((prev) => ({
                            ...prev,
                            rhk: '6',
                            aktifFiturPelatihan: true,
                            sertakanDetailSuratTugas: true,
                            jenisPenugasan: 'pelatihan',
                            modulPelatihan: mod.id,
                            namaPelatihan: mod.namaModul,
                            durasiPelatihan: mod.durasi,
                            metodePelatihan: mod.metode,
                            penyelenggaraPelatihan: mod.penyelenggara,
                            fasilitatorPelatihan: mod.fasilitator,
                            rencanaAksiPelatihan: mod.saranTindakLanjut,
                            judul: mod.judulLaporan,
                            permasalahan: mod.permasalahan,
                            solusi: mod.solusi,
                          }));
                        }
                      }}
                      className="w-full text-xs p-1.5 border border-purple-300 rounded-lg bg-white text-gray-900 font-semibold cursor-pointer"
                    >
                      <option value="">-- Pilih Modul Pelatihan Pusdiklatbangprof Kemensos --</option>
                      <option value="pencatatan_pelaporan">📋 Modul 7: Pencatatan & Pelaporan Kasus (5W+1H & Satgas SR)</option>
                      <option value="self_care">🛡️ Modul 7: Self-Care Pengasuh & Pencegahan Burnout (Agenda 30-60-90 Hari)</option>
                      <option value="helping_skills">🤝 Modul 7: Helping Skills & Komunikasi Empatik OARS (Active Listening)</option>
                      <option value="problem_solving">🧩 Modul 7: Pemecahan Masalah Partisipatif (Problem Solving Anak)</option>
                      <option value="modifikasi_perilaku">📈 Modul 5: Modifikasi Perilaku & Analisis ABC (Token Economy)</option>
                      <option value="pfa_trauma">🩺 Modul Khusus: Psychological First Aid (PFA) & Sensitif Trauma</option>
                      <option value="monitoring_adl">📊 Modul Instrumen: Monitoring Kemandirian Harian (ADL) Lampiran 4</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                        Alokasi Waktu / Durasi
                      </label>
                      <input
                        type="text"
                        value={inputs.durasiPelatihan ?? '2 JP (2 x 45 Menit = 90 Menit)'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, durasiPelatihan: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                        Metode & Model Pembelajaran
                      </label>
                      <input
                        type="text"
                        value={inputs.metodePelatihan ?? 'FGD & Ceramah Interaktif'}
                        onChange={(e) => setInputs((prev) => ({ ...prev, metodePelatihan: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                      Instansi Penyelenggara & Fasilitator
                    </label>
                    <input
                      type="text"
                      value={
                        inputs.penyelenggaraPelatihan ??
                        'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026'
                      }
                      onChange={(e) => setInputs((prev) => ({ ...prev, penyelenggaraPelatihan: e.target.value }))}
                      className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                      Rencana Pengimbasan & Tindak Lanjut Pasca-Diklat
                    </label>
                    <textarea
                      rows={2}
                      value={inputs.rencanaAksiPelatihan ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, rencanaAksiPelatihan: e.target.value }))}
                      className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyAndGenerate('Modul Pelatihan')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-100" />
                      <span>Terapkan & Susun Laporan Pelatihan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. FITUR JURNAL ILMIAH, KAJIAN LITERATUR & COVER PENELITIAN */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                inputs.aktifFiturJurnalIlmiah !== false
                  ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      inputs.aktifFiturJurnalIlmiah !== false
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-900">
                        5. Jurnal Ilmiah, Kajian Literatur & Cover Penelitian
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${
                          inputs.aktifFiturJurnalIlmiah !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inputs.aktifFiturJurnalIlmiah !== false ? 'ON (Aktif)' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Hal. 1 Cover Penelitian, Hal. 2 Daftar Isi & Abstrak, Tinjauan Pustaka & Daftar Pustaka APA
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={inputs.aktifFiturJurnalIlmiah !== false}
                  onClick={() => {
                    const nextVal = inputs.aktifFiturJurnalIlmiah === false ? true : false;
                    setInputs((prev) => ({
                      ...prev,
                      aktifFiturJurnalIlmiah: nextVal,
                      ...(nextVal ? { tampilkanCoverPenelitian: true } : {})
                    }));
                    onShowToast(
                      nextVal
                        ? 'Fitur Jurnal Ilmiah & Cover Penelitian diaktifkan (ON)'
                        : 'Fitur Jurnal Ilmiah dinonaktifkan (OFF)',
                      nextVal ? 'success' : 'info'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    inputs.aktifFiturJurnalIlmiah !== false ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      inputs.aktifFiturJurnalIlmiah !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {inputs.aktifFiturJurnalIlmiah !== false && (
                <div className="p-3.5 pt-2 border-t border-indigo-200/80 space-y-2.5 text-xs bg-white/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                        Gaya Cover Penelitian (Halaman 1)
                      </label>
                      <select
                        value={inputs.gayaCoverPenelitian || 'penelitian_resmi'}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            gayaCoverPenelitian: e.target.value as ReportInputs['gayaCoverPenelitian']
                          }))
                        }
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white font-semibold"
                      >
                        <option value="penelitian_resmi">Cover Penelitian & Kajian Ilmiah Resmi</option>
                        <option value="akademis_modern">Cover Karya Tulis Ilmiah Modern</option>
                        <option value="kedinasan_klasik">Cover Naskah Dinas Bingkai Ganda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                        Identitas Terbitan / Nama Seri Kajian Ilmiah
                      </label>
                      <input
                        type="text"
                        value={
                          inputs.namaJurnalIlmiah ??
                          'Jurnal Praktik Pekerjaan Sosial & Pengasuhan Terintegrasi — Vol. 4 No. 2 Tahun 2026'
                        }
                        onChange={(e) => setInputs((prev) => ({ ...prev, namaJurnalIlmiah: e.target.value }))}
                        className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                      Metodologi Kajian / Desain Penelitian Tindakan Peksos
                    </label>
                    <input
                      type="text"
                      value={
                        inputs.metodologiPenelitian ??
                        'Penelitian Tindakan Praktik Pekerjaan Sosial (Action Research in Social Work) & Single-Subject Design (A-B)'
                      }
                      onChange={(e) => setInputs((prev) => ({ ...prev, metodologiPenelitian: e.target.value }))}
                      className="w-full text-[11px] p-1.5 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyAndGenerate('Jurnal Ilmiah & Cover Penelitian')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-100" />
                      <span>Terapkan & Perbarui Kajian Jurnal Ilmiah</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION B: PENGATURAN SISTEM, JARINGAN & AKUN */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Pengaturan Sistem, Jaringan & Akun
              </h4>
            </div>

            {/* User Profile Summary */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {inputs.nama
                    ? inputs.nama
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : 'MN'}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-950">{inputs.nama || 'M Ardian Nugraha'}</p>
                  <p className="text-[10.5px] text-blue-800 font-medium">
                    NIP: {inputs.nip || '19980101 202601 1 001'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">
                    Wali Asuh / Pekerja Sosial
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300 shrink-0">
                Pengguna Aktif
              </span>
            </div>

            {/* 1. Mode Jaringan / Offline */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3">
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
                Atur Jaringan
              </button>
            </div>

            {/* 2. Token Akses 1 Bulan */}
            <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-950">Token Akses Web 1 Bulan</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  {activeTokenSession.isValid
                    ? `Sesi Token: ${activeTokenSession.code} (${getRemainingDays(
                        activeTokenSession.expiresAt || ''
                      )} hari lagi)`
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

            {/* 3. Unduh Word (.docx) & Google Sheets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-950 block">Unduh Word (.docx)</span>
                  <span className="text-[10.5px] text-blue-800">Ekspor dokumen laporan</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportDocx}
                  disabled={isExportingDocx}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {isExportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  <span>.docx</span>
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Google Sheets</span>
                  <span className="text-[10.5px] text-emerald-800">Sinkronisasi spreadsheet</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveGoogleSheet}
                  disabled={isSavingSheet}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {isSavingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>

            {/* 4. Keluar dari Akun */}
            <div className="p-3.5 bg-red-50/50 border border-red-200/70 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-950 block">Keluar dari Akun (Logout)</span>
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-[10.5px] text-gray-500 font-medium">
            e-Kinerja SRT 31 Palembang v2.6
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
