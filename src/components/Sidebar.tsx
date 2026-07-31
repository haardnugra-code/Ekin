import React, { useState, useEffect } from 'react';
import {
  FileDown,
  FileSignature,
  Zap,
  Wand2,
  Type,
  Bookmark,
  Printer,
  Info,
  Clock,
  User,
  Trash2,
  FolderInput,
  Edit,
  Sparkles,
  Loader2,
  QrCode,
  X,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  BookMarked,
  Layers,
  Droplets,
  Eye,
  EyeOff,
  Sliders,
  Star,
  Plus,
  Download,
  Upload,
  FileJson,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Pin,
  Maximize2
} from 'lucide-react';
import { ReportInputs, ArchiveItem, CustomRhkTemplate } from '../types';
import { RHK_DATA, DAILY_PRESETS } from '../data/presets';
import { DEFAULT_KEMENSOS_LOGO } from '../utils/kemensosLogo';

interface SidebarProps {
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  onGenerateReport: () => void;
  onGenerateAI: () => void;
  isAiGenerating: boolean;
  archives: ArchiveItem[];
  onSaveToArchive: () => void;
  onExportArchivesJson?: () => void;
  onImportArchivesJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadArchive: (id: number) => void;
  onEditArchive: (id: number) => void;
  onDeleteArchive: (id: number) => void;
  onPrint: () => void;
  onExportDocx?: () => void;
  isExportingDocx?: boolean;
  onSaveGoogleSheet?: () => void;
  onExportArchivesToGoogleSheet?: (selectedIds: number[]) => void;
  onExportSingleArchiveToGoogleSheet?: (id: number) => void;
  isSavingSheet?: boolean;
  sheetUrl?: string;
  setSheetUrl?: (url: string) => void;
  onGenerateQr?: () => void;
  onOpenPustakaRhk?: () => void;
  lastAutosaveTime?: string | null;
  onManualDraftSave?: () => void;
  onResetDraft?: () => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  inputs,
  setInputs,
  onGenerateReport,
  onGenerateAI,
  isAiGenerating,
  archives,
  onSaveToArchive,
  onExportArchivesJson,
  onImportArchivesJson,
  onLoadArchive,
  onEditArchive,
  onDeleteArchive,
  onPrint,
  onExportDocx,
  isExportingDocx,
  onSaveGoogleSheet,
  onExportArchivesToGoogleSheet,
  onExportSingleArchiveToGoogleSheet,
  isSavingSheet,
  sheetUrl,
  setSheetUrl,
  onGenerateQr,
  onOpenPustakaRhk,
  lastAutosaveTime,
  onManualDraftSave,
  onResetDraft,
  isOpen
}) => {
  const [customTemplates, setCustomTemplates] = useState<CustomRhkTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('peksos_custom_rhk_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatic Letter Numbering States with LocalStorage Persistence
  const [suratPattern, setSuratPattern] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('peksos_surat_pattern');
      if (saved) return saved;
    } catch {}
    return 'B-{XXX}/SRT.31/PLM/{MM}/{YYYY}';
  });

  const [suratSeq, setSuratSeq] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('peksos_surat_seq');
      if (saved) return parseInt(saved, 10) || 104;
    } catch {}
    if (inputs.nomorSurat) {
      const match = inputs.nomorSurat.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 104;
  });

  const [isAutoSuratEnabled, setIsAutoSuratEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('peksos_surat_auto');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [showSuratSettings, setShowSuratSettings] = useState<boolean>(false);
  const [suratSavedNotice, setSuratSavedNotice] = useState<boolean>(false);

  // Helper for Roman numerals
  const getRomanMonth = (monthIndex: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romans[monthIndex] || 'I';
  };

  // Helper to generate formatted letter number
  const formatSuratNumber = (
    seq: number,
    pattern: string,
    datePickerVal: string
  ): string => {
    let d = datePickerVal ? new Date(datePickerVal) : new Date();
    if (isNaN(d.getTime())) d = new Date();

    const yearStr = d.getFullYear().toString();
    const year2Str = yearStr.slice(-2);
    const monthIdx = d.getMonth();
    const monthNum = monthIdx + 1;
    const month2Str = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const romanMonth = getRomanMonth(monthIdx);
    const dayNum = d.getDate();
    const day2Str = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const paddedSeq = seq.toString().padStart(3, '0');

    let res = pattern;
    res = res.replace(/\{XXX\}/g, paddedSeq);
    res = res.replace(/\{SEQ\}/g, paddedSeq);
    res = res.replace(/\{MM\}/g, month2Str);
    res = res.replace(/\{ROMAN\}/g, romanMonth);
    res = res.replace(/\{YYYY\}/g, yearStr);
    res = res.replace(/\{YY\}/g, year2Str);
    res = res.replace(/\{DD\}/g, day2Str);

    return res;
  };

  // Selected Archive IDs state for batch operations (Google Sheet export, etc.)
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);

  const toggleSelectArchive = (id: number) => {
    setSelectedArchiveIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllArchives = () => {
    if (selectedArchiveIds.length === archives.length) {
      setSelectedArchiveIds([]);
    } else {
      setSelectedArchiveIds(archives.map((a) => a.id));
    }
  };

  // Auto update inputs.nomorSurat when dependencies change if auto mode is on
  useEffect(() => {
    if (isAutoSuratEnabled) {
      const computed = formatSuratNumber(suratSeq, suratPattern, inputs.tanggalPicker);
      setInputs((prev) => {
        if (prev.nomorSurat !== computed) {
          return { ...prev, nomorSurat: computed };
        }
        return prev;
      });
    }
  }, [suratSeq, suratPattern, inputs.tanggalPicker, isAutoSuratEnabled, setInputs]);

  // Persist preferences to LocalStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('peksos_surat_pattern', suratPattern);
      localStorage.setItem('peksos_surat_seq', suratSeq.toString());
      localStorage.setItem('peksos_surat_auto', isAutoSuratEnabled ? 'true' : 'false');
    } catch {}
  }, [suratPattern, suratSeq, isAutoSuratEnabled]);

  // Save manual trigger with confirmation notification
  const handleSaveSuratPreferences = () => {
    try {
      localStorage.setItem('peksos_surat_pattern', suratPattern);
      localStorage.setItem('peksos_surat_seq', suratSeq.toString());
      localStorage.setItem('peksos_surat_auto', isAutoSuratEnabled ? 'true' : 'false');
      const computed = formatSuratNumber(suratSeq, suratPattern, inputs.tanggalPicker);
      setInputs((prev) => ({ ...prev, nomorSurat: computed }));
      setSuratSavedNotice(true);
      setTimeout(() => setSuratSavedNotice(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Apply manual trigger
  const handleApplyAutoSurat = () => {
    const computed = formatSuratNumber(suratSeq, suratPattern, inputs.tanggalPicker);
    setInputs((prev) => ({ ...prev, nomorSurat: computed }));
  };

  useEffect(() => {
    const loadCustoms = () => {
      try {
        const saved = localStorage.getItem('peksos_custom_rhk_templates');
        setCustomTemplates(saved ? JSON.parse(saved) : []);
      } catch {
        setCustomTemplates([]);
      }
    };

    window.addEventListener('peksos_custom_rhk_updated', loadCustoms);
    window.addEventListener('storage', loadCustoms);
    return () => {
      window.removeEventListener('peksos_custom_rhk_updated', loadCustoms);
      window.removeEventListener('storage', loadCustoms);
    };
  }, []);

  const handleSelectCustomTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const found = customTemplates.find((t) => t.id === id);
    if (found) {
      setInputs((prev) => ({
        ...prev,
        rhk: found.targetRhk || '1',
        judul: RHK_DATA[found.targetRhk]?.judul || found.judul || 'TEMPLATE RHK KUSTOM',
        permasalahan: found.permasalahan,
        solusi: found.solusi,
        skenario: '',
        dailyPreset: ''
      }));
    }
  };

  const handleRhkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rhkVal = e.target.value;
    if (rhkVal === 'custom') {
      setInputs((prev) => ({
        ...prev,
        rhk: rhkVal,
        skenario: '',
        judul: prev.customTitle ? prev.customTitle.toUpperCase() : 'BIMBINGAN KHUSUS / CUSTOM'
      }));
    } else if (RHK_DATA[rhkVal]) {
      setInputs((prev) => ({
        ...prev,
        rhk: rhkVal,
        skenario: '',
        judul: RHK_DATA[rhkVal].judul
      }));
    }
  };

  const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputs((prev) => ({
      ...prev,
      customTitle: val,
      judul: prev.rhk === 'custom' ? (val.trim().toUpperCase() || 'BIMBINGAN KHUSUS / CUSTOM') : prev.judul
    }));
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const indexStr = e.target.value;
    if (inputs.rhk !== 'custom' && indexStr !== '' && RHK_DATA[inputs.rhk]) {
      const scenario = RHK_DATA[inputs.rhk].scenarios[parseInt(indexStr, 10)];
      if (scenario) {
        setInputs((prev) => ({
          ...prev,
          skenario: indexStr,
          permasalahan: scenario.p,
          solusi: scenario.s,
          judul: RHK_DATA[inputs.rhk].judul
        }));
      }
    } else {
      setInputs((prev) => ({ ...prev, skenario: indexStr }));
    }
  };

  const handleDailyPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    if (!key || !DAILY_PRESETS[key]) return;

    const preset = DAILY_PRESETS[key];
    setInputs((prev) => ({
      ...prev,
      dailyPreset: key,
      rhk: preset.targetRhk,
      skenario: '',
      judul: preset.judul,
      permasalahan: preset.permasalahan,
      solusi: preset.solusi
    }));
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    if (!dateVal) return;

    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthsIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const formattedDate = `${day} ${monthsIndo[monthIndex]} ${year}`;
      setInputs((prev) => ({
        ...prev,
        tanggalPicker: dateVal,
        tanggal: formattedDate
      }));
    }
  };

  const handleImageUpload = (field: keyof ReportInputs, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputs((prev) => ({
            ...prev,
            [field]: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 w-[85%] sm:w-96 bg-white border-r border-gray-200 flex flex-col h-full z-40 shadow-2xl md:shadow-none print:hidden`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white items-center justify-between hidden md:flex">
        <div>
          <h1 className="font-extrabold text-base text-gray-900 tracking-tight flex items-center gap-1.5">
            <span className="text-blue-600">e-KINERJA</span> WALI ASUH
          </h1>
          <p className="text-[11px] text-gray-500 font-medium">BKN / Wali Asuh SRT 31 Palembang</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
          <FileSignature className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs font-sans">
        {/* Section 1: Data Laporan */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100 flex items-center justify-between">
            <span>1. Informasi & Custom RHK</span>
          </h2>

          {/* Auto-Draft IndexedDB Status Card */}
          <div className="bg-slate-900 text-slate-100 p-3 rounded-2xl border border-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-slate-100 text-[11px] tracking-wide">
                  Auto-Draft Real-time (IndexedDB)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {lastAutosaveTime ? `Aktif ${lastAutosaveTime}` : 'Simpan Otomatis'}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-normal">
              Menggunakan penyimpanan terenkripsi IndexedDB (idb) agar data input & narasi selalu tersimpan aman walau localStorage penuh.
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={onManualDraftSave}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1 px-2 rounded-lg text-[10.5px] transition-colors flex justify-center items-center gap-1 cursor-pointer"
                title="Simpan draf isi formulir saat ini ke IndexedDB & localStorage"
              >
                <Save className="w-3 h-3 text-emerald-400" />
                <span>Simpan Draf</span>
              </button>

              <button
                type="button"
                onClick={onResetDraft}
                className="w-full bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 font-semibold py-1 px-2 rounded-lg text-[10.5px] transition-colors flex justify-center items-center gap-1 cursor-pointer"
                title="Reset dan hapus draf dari IndexedDB dan memori lokal"
              >
                <RotateCcw className="w-3 h-3 text-slate-400 hover:text-red-400" />
                <span>Reset Draf</span>
              </button>
            </div>
          </div>

          {/* Prominent Pustaka RHK Modal Button */}
          {onOpenPustakaRhk && (
            <button
              type="button"
              onClick={onOpenPustakaRhk}
              className="w-full bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow-2xs cursor-pointer border border-blue-600/50 hover:shadow-md group"
            >
              <BookMarked className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Buka Pustaka RHK & Template</span>
              <span className="text-[9.5px] bg-blue-500/40 text-blue-100 px-2 py-0.5 rounded-full font-semibold border border-blue-400/30">
                100+ Template
              </span>
            </button>
          )}

          {/* Quick Autofill Preset */}
          <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100/80 space-y-2">
            <label className="block text-xs font-bold text-blue-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Autofill Kegiatan Harian
              </span>
              <span className="text-[10px] bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                Pilih & Edit
              </span>
            </label>
            <select
              value={inputs.dailyPreset}
              onChange={handleDailyPresetChange}
              className="w-full text-xs p-2 border border-blue-200/80 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-medium cursor-pointer shadow-2xs"
            >
              <option value="">-- Pilih Kegiatan Harian (Shalat, Mengaji, Kebersihan, dll) --</option>
              <option value="shalat">🕌 Shalat Berjamaah & Pembinaan Ibadah</option>
              <option value="mengaji">📖 Bimbingan Mengaji / Al-Qur'an (Iqro)</option>
              <option value="cuci">🧺 Mencuci & Merawat Pakaian Mandiri</option>
              <option value="kamar">🧹 Membersihkan & Merapikan Kamar / Piket</option>
              <option value="belajar">📚 Pendampingan Belajar Mandiri / PR</option>
              <option value="keseharian">🌞 Rutinitas Keseharian & Bangun Pagi</option>
              <option value="hygiene">🍲 Perawatan Diri & Kebersihan (Hygiene)</option>
              <option value="sosialisasi">🤝 Sosialisasi & Etika Interaksi Asrama</option>
            </select>
          </div>

          {/* Quick Custom Templates Selector if user has any custom templates */}
          {customTemplates.length > 0 && (
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2">
              <label className="block text-xs font-bold text-emerald-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Template Kustom Saya ({customTemplates.length})
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Personal
                </span>
              </label>
              <select
                onChange={handleSelectCustomTemplate}
                defaultValue=""
                className="w-full text-xs p-2 border border-emerald-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-medium cursor-pointer shadow-2xs"
              >
                <option value="">-- Pilih Template Kustom Tersimpan --</option>
                {customTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    ⭐ {t.judul} (RHK {t.targetRhk || '1'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kategori RHK Utama */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Pilih Kategori RHK Utama</label>
              <select
                value={inputs.rhk}
                onChange={handleRhkChange}
                className="w-full text-xs p-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="1">RHK 1 - Bimbingan dan Pengajaran Peserta Didik</option>
                <option value="2">RHK 2 - Kemandirian Peserta Didik</option>
                <option value="3">RHK 3 - Bimbingan Aspek Kehidupan (Ibadah, Belajar, dll)</option>
                <option value="4">RHK 4 - Bimbingan Spiritual & Emosional</option>
                <option value="5">RHK 5 - Pendampingan Siswa Berkebutuhan Khusus</option>
                <option value="custom">✨ Custom RHK / Input Manual Bebas</option>
              </select>
            </div>

            {/* Custom RHK Title Input */}
            {inputs.rhk === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1">Judul Custom RHK Anda</label>
                <input
                  type="text"
                  value={inputs.customTitle}
                  onChange={handleCustomTitleChange}
                  className="w-full text-xs p-2 border border-purple-200 rounded-xl bg-purple-50/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="misal: Bimbingan Karakter & Etika Harian"
                />
              </div>
            )}

            {/* Skenario Kasus */}
            {inputs.rhk !== 'custom' && RHK_DATA[inputs.rhk] && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-800">Skenario Kasus / Opsi</label>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    20 Opsi
                  </span>
                </div>
                <select
                  value={inputs.skenario}
                  onChange={handleScenarioChange}
                  className="w-full text-xs p-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium text-gray-900"
                >
                  <option value="">-- Pilih Skenario (20 Opsi Siap Pakai) --</option>
                  {RHK_DATA[inputs.rhk].scenarios.map((sc, i) => (
                    <option key={i} value={i}>
                      {sc.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Judul Laporan / Kegiatan</label>
              <input
                type="text"
                value={inputs.judul}
                onChange={(e) => setInputs((prev) => ({ ...prev, judul: e.target.value }))}
                className="w-full text-xs p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Permasalahan</label>
              <textarea
                rows={2}
                value={inputs.permasalahan}
                onChange={(e) => setInputs((prev) => ({ ...prev, permasalahan: e.target.value }))}
                className="w-full text-xs p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">Solusi / Intervensi Peksos</label>
              <textarea
                rows={2}
                value={inputs.solusi}
                onChange={(e) => setInputs((prev) => ({ ...prev, solusi: e.target.value }))}
                className="w-full text-xs p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Font & Typo Controls */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80 space-y-2.5 mt-3 shadow-2xs">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-600" /> Font, Ukuran & Opsi Spasi
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Font Judul</label>
                <select
                  value={inputs.fontJudul}
                  onChange={(e) => setInputs((prev) => ({ ...prev, fontJudul: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Ukuran Judul</label>
                <select
                  value={inputs.sizeJudul}
                  onChange={(e) => setInputs((prev) => ({ ...prev, sizeJudul: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="14pt">14pt</option>
                  <option value="16pt">16pt</option>
                  <option value="18pt">18pt (Standar)</option>
                  <option value="20pt">20pt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Font Paragraf / Isi</label>
                <select
                  value={inputs.fontIsi}
                  onChange={(e) => setInputs((prev) => ({ ...prev, fontIsi: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Ukuran Paragraf</label>
                <select
                  value={inputs.sizeIsi}
                  onChange={(e) => setInputs((prev) => ({ ...prev, sizeIsi: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt (Standar)</option>
                  <option value="14pt">14pt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Spasi Baris</label>
                <select
                  value={inputs.lineHeight}
                  onChange={(e) => setInputs((prev) => ({ ...prev, lineHeight: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="1.15">1.15 (Rapat)</option>
                  <option value="1.3">1.3 (Sedang)</option>
                  <option value="1.5">1.5 (Standar)</option>
                  <option value="1.75">1.75 (Renggang)</option>
                  <option value="2.0">2.0 (Ganda)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Jarak Paragraf</label>
                <select
                  value={inputs.paragraphSpacing}
                  onChange={(e) => setInputs((prev) => ({ ...prev, paragraphSpacing: e.target.value }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                >
                  <option value="0.25rem">Sangat Rapat</option>
                  <option value="0.375rem">Rapat</option>
                  <option value="0.5rem">Standar (0.5rem)</option>
                  <option value="0.75rem">Renggang</option>
                  <option value="1rem">Luas (1.0rem)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.tampilkanNomorHalaman}
                  onChange={(e) => setInputs((prev) => ({ ...prev, tampilkanNomorHalaman: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>Tampilkan Nomor Halaman</span>
              </label>

              {inputs.tampilkanNomorHalaman && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Format Nomor Halaman</label>
                  <select
                    value={inputs.formatNomorHalaman}
                    onChange={(e) => setInputs((prev) => ({ ...prev, formatNomorHalaman: e.target.value }))}
                    className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="- {n} -">- 1 - (Angka Tengah)</option>
                    <option value="Halaman {n}">Halaman 1</option>
                    <option value="Hal. {n} dari {total}">Hal. 1 dari 2 (Lengkap)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={onGenerateAI}
              disabled={isAiGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyusun Narasi Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" /> ✨ AI Auto-Refine Narasi Peksos
                </>
              )}
            </button>

            <button
              onClick={onGenerateReport}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-blue-600" /> Generate & Susun Laporan
            </button>
          </div>
        </div>

        {/* Section 2: Data Penandatangan & Identitas Surat */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">2. Data Surat & Penandatangan</h2>
          {/* Nomor Surat & Generator Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-800">
                Nomor Surat / Kode Laporan
              </label>
              <button
                type="button"
                onClick={() => setShowSuratSettings(!showSuratSettings)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>{showSuratSettings ? 'Tutup Format' : 'Atur Otomatis'}</span>
              </button>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputs.nomorSurat || ''}
                onChange={(e) => {
                  setInputs((prev) => ({ ...prev, nomorSurat: e.target.value }));
                }}
                className="w-full text-xs p-2 border border-gray-200 rounded-xl font-mono bg-gray-50/50"
                placeholder="Contoh: B-104/SRT.31/PLM/07/2026"
              />
              <button
                type="button"
                onClick={() => {
                  setSuratSeq((prev) => prev + 1);
                  handleApplyAutoSurat();
                }}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                title="Naikkan nomor urut (+1)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1</span>
              </button>
            </div>

            {/* Expandable Auto-Numbering Settings Card */}
            {showSuratSettings && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2.5 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Logika Penomoran Surat
                    </span>
                    <span className="text-[10px] text-slate-500 block font-normal">
                      Atur & simpan logika posisi bulan/tahun dari Datepicker
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700 shrink-0" title="Otomatis update nomor surat ketika tanggal/bulan diubah di datepicker">
                    <input
                      type="checkbox"
                      checked={isAutoSuratEnabled}
                      onChange={(e) => setIsAutoSuratEnabled(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Auto-Sync</span>
                  </label>
                </div>

                {/* Preset Format Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Format Presets (Posisi Bulan & Tahun)
                  </label>
                  <select
                    value={suratPattern}
                    onChange={(e) => setSuratPattern(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
                  >
                    <option value="B-{XXX}/SRT.31/PLM/{MM}/{YYYY}">
                      B-104/SRT.31/PLM/07/2026 (Bulan Angka / Tahun)
                    </option>
                    <option value="B-{XXX}/SRT.31/PLM/{ROMAN}/{YYYY}">
                      B-104/SRT.31/PLM/VII/2026 (Bulan Romawi / Tahun)
                    </option>
                    <option value="{MM}/{YYYY}/SRT.31/B-{XXX}">
                      07/2026/SRT.31/B-104 (Bulan & Tahun di Depan)
                    </option>
                    <option value="LAP-{XXX}/SRT.31/{MM}/{YYYY}">
                      LAP-104/SRT.31/07/2026 (Laporan Internal)
                    </option>
                    <option value="{XXX}/SRT.31/PLM/{MM}/{YYYY}">
                      104/SRT.31/PLM/07/2026 (Kode Murni)
                    </option>
                  </select>
                </div>

                {/* Custom Format Text Box */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Atur Logika Pattern Kustom
                  </label>
                  <input
                    type="text"
                    value={suratPattern}
                    onChange={(e) => setSuratPattern(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
                    placeholder="Contoh: B-{XXX}/SRT.31/PLM/{MM}/{YYYY}"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Tag Logika: <code className="bg-slate-200 px-1 rounded">{'{XXX}'}</code>=Urut, <code className="bg-slate-200 px-1 rounded">{'{MM}'}</code>=Bulan, <code className="bg-slate-200 px-1 rounded">{'{ROMAN}'}</code>=Romawi, <code className="bg-slate-200 px-1 rounded">{'{YYYY}'}</code>=Tahun, <code className="bg-slate-200 px-1 rounded">{'{DD}'}</code>=Tgl
                  </p>
                </div>

                {/* Sequence Number Controls */}
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 text-[11px]">Nomor Urut (Sequence):</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSuratSeq((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={suratSeq}
                      onChange={(e) => setSuratSeq(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-14 text-center font-bold text-xs p-1 border border-slate-300 rounded bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => setSuratSeq((prev) => prev + 1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Save Logic Preference & Apply Action */}
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Preview Sesuai Datepicker:</span>
                    <span className="font-mono font-bold text-blue-700 text-xs">
                      {formatSuratNumber(suratSeq, suratPattern, inputs.tanggalPicker)}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveSuratPreferences}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-colors flex justify-center items-center gap-1 cursor-pointer"
                    >
                      {suratSavedNotice ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tersimpan!</span>
                        </>
                      ) : (
                        <span>Simpan Logika Format</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyAutoSurat}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">Tempat & Tanggal Laporan</label>
            <div className="flex gap-2 mb-1.5">
              <input
                type="text"
                value={inputs.tempat}
                onChange={(e) => setInputs((prev) => ({ ...prev, tempat: e.target.value }))}
                className="w-1/2 text-xs p-2 border border-gray-200 rounded-xl"
                placeholder="Kota"
              />
              <input
                type="date"
                value={inputs.tanggalPicker}
                onChange={handleDatePickerChange}
                className="w-1/2 text-xs p-2 border border-gray-200 rounded-xl cursor-pointer"
                title="Pilih Tanggal"
              />
            </div>
            <input
              type="text"
              value={inputs.tanggal}
              onChange={(e) => setInputs((prev) => ({ ...prev, tanggal: e.target.value }))}
              className="w-full text-xs p-2 border border-gray-200 rounded-xl"
              placeholder="Format Terbilang"
            />
          </div>
          <input
            type="text"
            value={inputs.nama}
            onChange={(e) => setInputs((prev) => ({ ...prev, nama: e.target.value }))}
            className="w-full text-xs p-2 border border-gray-200 rounded-xl"
            placeholder="Nama Lengkap"
          />
          <input
            type="text"
            value={inputs.nip}
            onChange={(e) => setInputs((prev) => ({ ...prev, nip: e.target.value }))}
            className="w-full text-xs p-2 border border-gray-200 rounded-xl"
            placeholder="NIP"
          />
        </div>

        {/* Section 3: Lampiran & Tanda Tangan */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">3. Lampiran & Tanda Tangan</h2>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700">Logo Kop Instansi (Opsional)</label>
              {inputs.logoSrc && (
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, logoSrc: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus Logo Kop
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('logoSrc', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
            <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
              <span className="font-medium">Pilih / upload gambar jika ingin menyisipkan logo pada Kop Surat.</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700">Tanda Tangan (Basah)</label>
              {inputs.ttdSrc && (
                <button
                  onClick={() => setInputs((prev) => ({ ...prev, ttdSrc: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('ttdSrc', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> QR Code Tanda Tangan Digital
              </label>
              {inputs.qrCodeSrc && (
                <button
                  onClick={() => setInputs((prev) => ({ ...prev, qrCodeSrc: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>

            {onGenerateQr && (
              <button
                type="button"
                onClick={onGenerateQr}
                className="w-full mb-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-2.5 rounded-xl text-[11px] transition-colors flex justify-center items-center gap-1.5 border border-blue-200 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Buat / Perbarui QR Ttd Digital Otomatis
              </button>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('qrCodeSrc', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
            {inputs.qrCodeSrc && (
              <div className="mt-2 p-2 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                <img src={inputs.qrCodeSrc} alt="Preview QR" className="w-10 h-10 object-contain bg-white border border-gray-200 rounded p-0.5" />
                <span className="text-[10px] font-semibold text-blue-800">QR Code Siap Disisipkan di Laporan</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700">Foto Dokumentasi 1</label>
              {inputs.foto1Src && (
                <button
                  onClick={() => setInputs((prev) => ({ ...prev, foto1Src: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('foto1Src', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700">Foto Dokumentasi 2</label>
              {inputs.foto2Src && (
                <button
                  onClick={() => setInputs((prev) => ({ ...prev, foto2Src: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('foto2Src', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: Watermark Laporan (Sekolah Rakyat) */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> 4. Watermark Latar Belakang
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inputs.showWatermark ?? true}
                onChange={(e) => setInputs((prev) => ({ ...prev, showWatermark: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-1.5 text-[11px] font-bold text-gray-700">
                {(inputs.showWatermark ?? true) ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          {(inputs.showWatermark ?? true) && (
            <div className="space-y-3 pt-1 animate-fade-in">
              {/* Opacity Slider */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-600" /> Transparansi / Opacity:
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[10px]">
                    {Math.round((inputs.watermarkOpacity ?? 0.18) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.00"
                  step="0.01"
                  value={inputs.watermarkOpacity ?? 0.18}
                  onChange={(e) => setInputs((prev) => ({ ...prev, watermarkOpacity: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                  <span>Samar (5%)</span>
                  <span>Default (18%)</span>
                  <span>Penuh (100%)</span>
                </div>
              </div>

              {/* Ukuran Dimensi (Lebar & Tinggi) + Pin Ukuran */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-blue-600" /> Dimensi & Pin Ukuran:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        pinWatermarkSize: !(prev.pinWatermarkSize ?? true),
                        watermarkHeight: !(prev.pinWatermarkSize ?? true) ? 'auto' : 400
                      }))
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      (inputs.pinWatermarkSize ?? true)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                    title="Klik untuk mengunci/membuka kunci rasio aspek watermark"
                  >
                    {(inputs.pinWatermarkSize ?? true) ? (
                      <>
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Pinned (Rasio Asli)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-amber-600" />
                        <span>Bebas (Tinggi Custom)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Pin Ukuran Quick Buttons */}
                <div>
                  <span className="block text-[10px] text-gray-500 font-medium mb-1">
                    Pin Presets Ukuran:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Kecil', w: 300 },
                      { label: 'Standar', w: 450 },
                      { label: 'Besar', w: 550 },
                      { label: 'Maks', w: 650 }
                    ].map((preset) => (
                      <button
                        key={preset.w}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            watermarkWidth: preset.w,
                            pinWatermarkSize: true,
                            watermarkHeight: 'auto'
                          }))
                        }
                        className={`py-1 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                          (inputs.watermarkWidth ?? 450) === preset.w && (inputs.pinWatermarkSize ?? true)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label} ({preset.w}px)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lebar Slider & Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5 text-slate-500" /> Lebar (Width):
                    </span>
                    <span className="font-mono font-bold text-blue-700 text-[10px]">
                      {inputs.watermarkWidth ?? 450} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="700"
                    step="10"
                    value={inputs.watermarkWidth ?? 450}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, watermarkWidth: parseInt(e.target.value, 10) }))
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Tinggi Slider & Input */}
                <div className="space-y-1 pt-0.5 border-t border-gray-200/60">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      Tinggi (Height):
                    </span>
                    <span className="font-mono font-bold text-blue-700 text-[10px]">
                      {(inputs.pinWatermarkSize ?? true) || inputs.watermarkHeight === 'auto'
                        ? 'Otomatis (Pin)'
                        : `${inputs.watermarkHeight ?? 400} px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="650"
                    step="10"
                    disabled={inputs.pinWatermarkSize ?? true}
                    value={
                      typeof inputs.watermarkHeight === 'number'
                        ? inputs.watermarkHeight
                        : 400
                    }
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        watermarkHeight: parseInt(e.target.value, 10)
                      }))
                    }
                    className={`w-full h-1.5 rounded-lg appearance-none ${
                      (inputs.pinWatermarkSize ?? true)
                        ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                        : 'bg-gray-200 cursor-pointer accent-blue-600'
                    }`}
                  />
                  {(inputs.pinWatermarkSize ?? true) && (
                    <p className="text-[9.5px] text-emerald-700 font-medium italic">
                      *Tinggi menyesuaikan secara proporsional sesuai pin rasio aspek.
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Watermark Kustom */}
              <div className="space-y-1.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-gray-700">
                    Ganti Gambar Watermark (Upload):
                  </label>
                  {inputs.customWatermarkImg && (
                    <button
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, customWatermarkImg: '' }))}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('customWatermarkImg', e)}
                  className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
                />
                <div className="text-[10px] text-gray-500">
                  <span className="font-medium">Watermark Default:</span> <span className="font-bold text-emerald-800">Sekolah Rakyat</span> (Tampil di isi laporan)
                </div>
              </div>

              {/* Sembunyikan Watermark di Lampiran Dokumentasi */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] font-semibold text-gray-700">
                    Sembunyikan Watermark di Lampiran Foto
                  </span>
                  <input
                    type="checkbox"
                    checked={inputs.hideWatermarkOnLampiran ?? true}
                    onChange={(e) => setInputs((prev) => ({ ...prev, hideWatermarkOnLampiran: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                  />
                </label>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                  Watermark aktif di Halaman 1-5 (isi laporan utama) dan otomatis hilang pada Halaman Lampiran Dokumentasi Foto.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Arsip Laporan */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">5. Arsip Laporan</h2>
            <div className="flex items-center gap-1.5">
              {archives.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllArchives}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {selectedArchiveIds.length === archives.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              )}
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                {archives.length} Arsip
              </span>
            </div>
          </div>

          <button
            onClick={onSaveToArchive}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" /> Simpan Laporan Ini ke Arsip Lokal
          </button>

          {/* Batch Action Bar for Google Sheets Sync */}
          {selectedArchiveIds.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300/80 p-2.5 rounded-xl space-y-1.5 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedArchiveIds.length} Arsip Terpilih
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArchiveIds([])}
                  className="text-[10px] text-emerald-700 font-medium hover:underline cursor-pointer"
                >
                  Bersihkan
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onExportArchivesToGoogleSheet) {
                    onExportArchivesToGoogleSheet(selectedArchiveIds);
                  }
                }}
                disabled={isSavingSheet}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {isSavingSheet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengekspor {selectedArchiveIds.length} Arsip...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Ekspor {selectedArchiveIds.length} Arsip ke Google Sheet</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Backup & Restore JSON Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <button
              onClick={onExportArchivesJson}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-1.5 px-2 rounded-xl text-[11px] transition-colors flex justify-center items-center gap-1 cursor-pointer"
              title="Download semua arsip laporan ke file JSON untuk cadangan/backup"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export JSON</span>
            </button>

            <label className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-1.5 px-2 rounded-xl text-[11px] transition-colors flex justify-center items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-gray-600" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={onImportArchivesJson}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {archives.length === 0 ? (
              <div className="text-[11px] text-gray-400 italic text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                Belum ada laporan tersimpan.
              </div>
            ) : (
              archives.map((item) => {
                const isSelected = selectedArchiveIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectArchive(item.id)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5 shrink-0"
                        title="Pilih arsip ini untuk ekspor batch"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate mb-0.5" title={item.judul}>
                          {item.judul || 'Laporan tanpa judul'}
                        </div>
                        <div className="text-gray-500 text-[10px] flex justify-between">
                          <span className="truncate max-w-[100px] flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {item.nama}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-gray-200/80">
                      <button
                        onClick={() => onEditArchive(item.id)}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 cursor-pointer"
                        title="Edit Arsip Ini"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => onLoadArchive(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 cursor-pointer"
                        title="Muat ke Dokumen Utama"
                      >
                        <FolderInput className="w-3 h-3" /> Muat
                      </button>
                      <button
                        onClick={() => {
                          onLoadArchive(item.id);
                          setTimeout(() => onPrint(), 300);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 cursor-pointer"
                        title="Cetak Langsung"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (onExportSingleArchiveToGoogleSheet) {
                            onExportSingleArchiveToGoogleSheet(item.id);
                          }
                        }}
                        disabled={isSavingSheet}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                        title="Ekspor Arsip Ini ke Google Sheet"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-teal-100" /> Sheet
                      </button>
                      <button
                        onClick={() => {
                          onDeleteArchive(item.id);
                          setSelectedArchiveIds((prev) => prev.filter((i) => i !== item.id));
                        }}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 cursor-pointer"
                        title="Hapus Arsip"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 5: Integrasi Google Sheet */}
        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 uppercase tracking-widest">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>5. Google Sheet</span>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terhubung
            </span>
          </div>

          <button
            onClick={onSaveGoogleSheet}
            disabled={isSavingSheet}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSavingSheet ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Mengirim ke Google Sheet...
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-emerald-100" /> Simpan ke Google Sheet
              </>
            )}
          </button>

          <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 text-[11px] space-y-1">
            <label className="block text-[10px] font-bold text-gray-600">
              Web App Script URL
            </label>
            <input
              type="text"
              value={sheetUrl || ''}
              onChange={(e) => setSheetUrl && setSheetUrl(e.target.value)}
              className="w-full text-[10px] font-mono p-1.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white text-gray-700 truncate"
              title={sheetUrl}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            <p className="text-[9.5px] text-gray-500 italic">
              Data laporan dikirim langsung ke spreadsheet Google Apps Script.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-2">
        <button
          onClick={onExportDocx}
          disabled={isExportingDocx}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-3 rounded-xl flex justify-center items-center gap-1.5 shadow-2xs text-xs cursor-pointer transition-colors disabled:opacity-50"
        >
          {isExportingDocx ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Menyusun Dokumen .docx...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-blue-200" /> Unduh Laporan (.docx Word)
            </>
          )}
        </button>

        <button
          onClick={onPrint}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex justify-center items-center gap-1.5 shadow-2xs text-xs cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
        </button>

        <p className="text-[10px] text-gray-500 text-center mt-0.5 flex items-center justify-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0 text-gray-400" /> Klik teks di preview sebelah kanan untuk mengedit isi laporan secara langsung.
        </p>
      </div>
    </aside>
  );
};
