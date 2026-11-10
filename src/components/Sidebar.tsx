import React, { useState, useEffect, Suspense } from 'react';
import {
  Wand2,
  Type,
  Bookmark,
  Printer,
  Trash2,
  FolderInput,
  Edit,
  Sparkles,
  Loader2,
  QrCode,
  X,
  FileSpreadsheet,
  CloudUpload,
  BookMarked,
  Sliders,
  Plus,
  Download,
  Upload,
  Save,
  RotateCcw,
  LogOut,
  Calendar,
  Building2,
  Settings,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { ReportInputs, ReportOutputs, ArchiveItem, CustomRhkTemplate } from '../types';
import { RHK_DATA, DAILY_PRESETS } from '../data/presets';
import { DEFAULT_KEMENSOS_LOGO } from '../utils/kemensosLogo';
import { compressImage } from '../utils/imageCompressor';
import { SkpDiagnosisResult } from '../utils/skpProblemMatcher';
import { SCIENTIFIC_JOURNAL_PRESETS, generateContextualReferences } from '../utils/specialReportGenerator';
import { downloadReportJsonFile } from '../utils/autoNumberAndJson';

const SkpDiagnosisModal = React.lazy(() =>
  import('./SkpDiagnosisModal').then((m) => ({ default: m.SkpDiagnosisModal }))
);

interface SidebarProps {
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  outputs?: ReportOutputs;
  setOutputs?: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  onGenerateReport: () => void;
  onGenerateAI: () => void;
  onGenerateFromProblem?: (problemText: string, enableSpecialMode?: boolean) => void;
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
  onOpenCalendar?: () => void;
  onOpenSettings?: () => void;
  lastAutosaveTime?: string | null;
  onManualDraftSave?: () => void;
  onResetDraft?: () => void;
  onLogout?: () => void;
  isOpen: boolean;
  onToggleSidebar?: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type SidebarTab = 'isi' | 'identitas' | 'foto' | 'arsip';

export const Sidebar: React.FC<SidebarProps> = ({
  inputs,
  setInputs,
  outputs,
  setOutputs,
  onGenerateReport,
  onGenerateAI,
  onGenerateFromProblem,
  isAiGenerating,
  archives,
  onSaveToArchive,
  onExportArchivesJson,
  onImportArchivesJson,
  onLoadArchive,
  onEditArchive,
  onDeleteArchive,
  onPrint,
  onSaveGoogleSheet,
  onExportArchivesToGoogleSheet,
  onExportSingleArchiveToGoogleSheet,
  isSavingSheet,
  sheetUrl,
  setSheetUrl,
  onGenerateQr,
  onOpenPustakaRhk,
  onOpenCalendar,
  onOpenSettings,
  lastAutosaveTime,
  onManualDraftSave,
  onResetDraft,
  onLogout,
  isOpen,
  onToggleSidebar,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('isi');
  const [showKopEditor, setShowKopEditor] = useState<boolean>(false);
  const [showTypoEditor, setShowTypoEditor] = useState<boolean>(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState<boolean>(false);
  const [quickProblemInput, setQuickProblemInput] = useState<string>('');
  const [showAddJournalForm, setShowAddJournalForm] = useState<boolean>(false);
  const [customJournalAuthor, setCustomJournalAuthor] = useState<string>('');
  const [customJournalTitle, setCustomJournalTitle] = useState<string>('');
  const [customJournalSource, setCustomJournalSource] = useState<string>('');
  const [customJournalQuote, setCustomJournalQuote] = useState<string>('');

  const [customTemplates, setCustomTemplates] = useState<CustomRhkTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('peksos_custom_rhk_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatic Letter Numbering States
  const [suratPattern, setSuratPattern] = useState<string>(() => {
    try {
      return localStorage.getItem('peksos_surat_pattern') || 'B-{XXX}/SRT.31/PLM/{MM}/{YYYY}';
    } catch {
      return 'B-{XXX}/SRT.31/PLM/{MM}/{YYYY}';
    }
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
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const getRomanMonth = (monthIndex: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romans[monthIndex] || 'I';
  };

  const formatSuratNumber = (seq: number, pattern: string, datePickerVal: string): string => {
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

    return pattern
      .replace(/\{XXX\}/g, paddedSeq)
      .replace(/\{SEQ\}/g, paddedSeq)
      .replace(/\{MM\}/g, month2Str)
      .replace(/\{ROMAN\}/g, romanMonth)
      .replace(/\{YYYY\}/g, yearStr)
      .replace(/\{YY\}/g, year2Str)
      .replace(/\{DD\}/g, day2Str);
  };

  const [autoDownloadJson, setAutoDownloadJson] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peksos_auto_download_json') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isAutoSuratEnabled) {
      const computed = formatSuratNumber(suratSeq, suratPattern, inputs.tanggalPicker);
      setInputs((prev) => (prev.nomorSurat !== computed ? { ...prev, nomorSurat: computed } : prev));
    }
  }, [suratSeq, suratPattern, inputs.tanggalPicker, isAutoSuratEnabled, setInputs]);

  useEffect(() => {
    try {
      localStorage.setItem('peksos_surat_pattern', suratPattern);
      localStorage.setItem('peksos_surat_seq', suratSeq.toString());
      localStorage.setItem('peksos_surat_auto', isAutoSuratEnabled ? 'true' : 'false');
    } catch {}
  }, [suratPattern, suratSeq, isAutoSuratEnabled]);

  useEffect(() => {
    const handleSeqUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<{ seq: number; nomorSurat: string }>;
      if (customEvt.detail && typeof customEvt.detail.seq === 'number') {
        setSuratSeq(customEvt.detail.seq);
      }
    };
    window.addEventListener('peksos_surat_seq_updated', handleSeqUpdated);
    return () => window.removeEventListener('peksos_surat_seq_updated', handleSeqUpdated);
  }, []);

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

  const handleApplyDiagnosis = (diag: SkpDiagnosisResult) => {
    setInputs((prev) => {
      const next: ReportInputs = {
        ...prev,
        rhk: diag.recommendedRhk,
        skenario: '',
        judul: diag.judulRekomendasi,
        permasalahan: prev.permasalahan && prev.permasalahan.trim() ? prev.permasalahan : diag.gambaranKasus,
        solusi: diag.solusiLaporan,
        metodeIntervensiPeksos: diag.metodeIntervensiPeksos,
        penjelasanIntervensiPeksos: `${diag.landasanTeori} Prosedur penanganan: ${diag.tahapanIntervensi.join(' ')}`
      };

      if (diag.subTopikKeluargaKesehatan) {
        next.subTopikKeluargaKesehatan = diag.subTopikKeluargaKesehatan;
        next.aktifFiturKunjungan = true;
      }
      return next;
    });

    setTimeout(() => {
      onGenerateReport();
    }, 50);
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
    if (!key || !DAILY_PRESETS[key]) {
      setInputs((prev) => ({ ...prev, dailyPreset: '' }));
      return;
    }

    const preset = DAILY_PRESETS[key];
    const upacaraName =
      key === 'upacara' || key === 'tidak_mau_upacara'
        ? 'Upacara Bendera Rutin Hari Senin'
        : key === 'upacara_phbn'
        ? 'Upacara Peringatan Hari Besar Nasional (PHBN)'
        : key === 'upacara_petugas'
        ? 'Upacara Bendera (Pelatihan Petugas Upacara)'
        : undefined;

    setInputs((prev) => {
      const next: ReportInputs = {
        ...prev,
        dailyPreset: key,
        rhk: preset.targetRhk,
        skenario: '',
        judul: preset.judul,
        permasalahan: preset.permasalahan,
        solusi: preset.solusi,
        ...(upacaraName ? { jenisUpacara: upacaraName, aktifFiturUpacara: true } : {})
      };

      if (key === 'kunjungan_ortu') {
        next.aktifFiturKunjungan = true;
        next.subTopikKeluargaKesehatan = 'kunjungan';
      } else if (key === 'kesehatan_anak') {
        next.aktifFiturKunjungan = true;
        next.subTopikKeluargaKesehatan = 'kesehatan';
      } else if (key === 'konsultasi_perkembangan') {
        next.aktifFiturKunjungan = true;
        next.subTopikKeluargaKesehatan = 'konsultasi';
      }

      return next;
    });
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
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      setInputs((prev) => ({
        ...prev,
        tanggalPicker: dateVal,
        tanggal: `${day} ${monthsIndo[monthIndex]} ${year}`
      }));
    }
  };

  const formatTitleForCaption = (rawTitle: string): string => {
    if (!rawTitle) return '';
    const cleaned = rawTitle.replace(/^(BIMBINGAN DAN PENGAJARAN KEPADA|PELAKSANAAN|LAPORAN)\s+/i, '');
    const words = (cleaned || rawTitle).trim().toLowerCase().split(/\s+/);
    return words
      .map((w, idx) => {
        if (idx > 0 && ['dan', 'ke', 'di', 'dari', 'yang', 'pada', 'atau', 'untuk', 'dengan'].includes(w)) {
          return w;
        }
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  };

  const getCaptionSuggestions = (judul: string, photoIndex: 1 | 2): string[] => {
    const titleFormatted = formatTitleForCaption(judul) || 'Kegiatan Pengasuhan';
    if (photoIndex === 1) {
      return [
        `Foto 1. Pelaksanaan ${titleFormatted}`,
        `Foto 1. Dokumentasi Kegiatan ${titleFormatted}`,
        `Foto 1. Pendampingan & Pembinaan Peserta Didik`
      ];
    }
    return [
      `Foto 2. Evaluasi & Pendampingan ${titleFormatted}`,
      `Foto 2. Respons & Perkembangan Peserta Didik`,
      `Foto 2. Hasil Pembinaan & Intervensi Lapangan`
    ];
  };

  const handleImageUpload = async (field: keyof ReportInputs, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState((prev) => ({ ...prev, [field]: true }));
    try {
      const resultData = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      setInputs((prev) => {
        const next = { ...prev, [field]: resultData };
        const cleanTitle = formatTitleForCaption(prev.judul || prev.customTitle || 'Kegiatan Pengasuhan');
        if (field === 'foto1Src' && (!prev.foto1Caption || prev.foto1Caption === 'Foto 1. Pelaksanaan Kegiatan')) {
          next.foto1Caption = `Foto 1. Pelaksanaan ${cleanTitle}`;
        } else if (field === 'foto2Src' && (!prev.foto2Caption || prev.foto2Caption === 'Foto 2. Kondisi Lapangan')) {
          next.foto2Caption = `Foto 2. Evaluasi & Pendampingan ${cleanTitle}`;
        }
        return next;
      });
      if (showToast) showToast('Gambar berhasil diunggah dan dikompresi.', 'success');
    } catch (err) {
      console.error('Error uploading image:', err);
      if (showToast) showToast('Gagal memproses unggahan gambar.', 'error');
    } finally {
      setUploadingState((prev) => ({ ...prev, [field]: false }));
      e.target.value = '';
    }
  };

  const toggleSelectArchive = (id: number) => {
    setSelectedArchiveIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const activeSpecialCount = [
    inputs.aktifFiturUpacara,
    inputs.aktifFiturKunjungan,
    inputs.sertakanDetailSuratTugas,
    inputs.aktifFiturPelatihan
  ].filter(Boolean).length;

  return (
    <>
      <aside
        id="sidebar"
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col h-full print:hidden transition-transform duration-150 ease-out shrink-0 ${
          isOpen
            ? 'w-[88vw] sm:w-[360px] translate-x-0'
            : 'w-0 -translate-x-full overflow-hidden pointer-events-none border-none'
        }`}
      >
        {/* Top Segmented Navigation Tabs */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="text-xs font-semibold text-slate-700">Panel Input Laporan</span>
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('isi')}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'isi'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Isi & RHK
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'identitas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surat & Kop
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('foto')}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'foto'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Foto {(inputs.foto1Src || inputs.foto2Src) ? '•' : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arsip')}
              className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                activeTab === 'arsip'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arsip ({archives.length})
            </button>
          </div>
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: ISI & RHK */}
          {activeTab === 'isi' && (
            <div className="space-y-4">
              {/* Switch Tombol Laporan Khusus + Cover Penelitian (Hal. 1) & Daftar Isi (Hal. 2) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Cover Penelitian (Hal. 1) & Daftar Isi (Hal. 2)
                    </span>
                    <span className="block text-[10.5px] text-slate-500 leading-tight mt-0.5">
                      Hal. 1 Cover Penelitian · Hal. 2 Daftar Isi & Abstrak · Hal. 3+ Isi Laporan
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inputs.tampilkanCoverPenelitian !== false}
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        tampilkanCoverPenelitian: prev.tampilkanCoverPenelitian === false ? true : false
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
                      inputs.tampilkanCoverPenelitian !== false ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out ${
                        inputs.tampilkanCoverPenelitian !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {inputs.tampilkanCoverPenelitian !== false && (
                  <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-200/80">
                    <label className="text-[10.5px] font-semibold text-slate-700">
                      Pilihan Gaya Cover Penelitian (Halaman 1):
                    </label>
                    <select
                      value={inputs.gayaCoverPenelitian || 'penelitian_resmi'}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          gayaCoverPenelitian: e.target.value as ReportInputs['gayaCoverPenelitian']
                        }))
                      }
                      className="w-full text-[11px] p-1.5 border border-slate-200 rounded-md bg-white text-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="penelitian_resmi">
                        Cover Penelitian & Kajian Ilmiah Resmi (Standar Kemensos RI)
                      </option>
                      <option value="akademis_modern">
                        Cover Karya Tulis Ilmiah & Jurnal Terapan (Akademis Modern)
                      </option>
                      <option value="kedinasan_klasik">
                        Cover Naskah Dinas Bingkai Ganda (Klasik Formal)
                      </option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/80">
                  <span className="text-slate-600 font-medium">
                    Format Bab:{' '}
                    <strong className={inputs.modeLaporanKhusus ? 'text-blue-700' : 'text-slate-800'}>
                      {inputs.modeLaporanKhusus ? 'BAB A–G + TABEL KEGIATAN' : 'BAB STANDAR (A–F)'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        modeLaporanKhusus: !prev.modeLaporanKhusus
                      }))
                    }
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {inputs.modeLaporanKhusus ? 'Ubah ke Bab A–F →' : 'Ubah ke Bab A–G + Tabel →'}
                  </button>
                </div>
              </div>

              {/* FITUR TAMBAHAN: JURNAL ILMIAH & KAJIAN LITERATUR PEKERJAAN SOSIAL */}
              <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Fitur Jurnal Ilmiah & Kajian Literatur
                      </span>
                      <span className="block text-[10.5px] text-slate-500 leading-tight">
                        Abstrak, Kata Kunci, Tinjauan Pustaka, Pembahasan Ilmiah & Daftar Pustaka APA
                      </span>
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
                        aktifFiturJurnalIlmiah: nextVal
                      }));
                      if (showToast) {
                        showToast(
                          nextVal
                            ? 'Fitur Jurnal Ilmiah & Kajian Literatur diaktifkan!'
                            : 'Fitur Jurnal Ilmiah dinonaktifkan.',
                          nextVal ? 'success' : 'info'
                        );
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
                      inputs.aktifFiturJurnalIlmiah !== false ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out ${
                        inputs.aktifFiturJurnalIlmiah !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {inputs.aktifFiturJurnalIlmiah !== false && (
                  <div className="space-y-2 pt-1.5 border-t border-indigo-200/70">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">
                        Pilih Preset Kutipan Jurnal Ilmiah & Teori Peksos:
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const preset = SCIENTIFIC_JOURNAL_PRESETS.find((p) => p.id === e.target.value);
                          if (!preset) return;
                          if (setOutputs) {
                            setOutputs((prev) => {
                              const currentRefs = Array.isArray(prev.khususReferensi) ? prev.khususReferensi : [];
                              const updatedRefs = currentRefs.includes(preset.sitasiApa)
                                ? currentRefs
                                : [preset.sitasiApa, ...currentRefs];
                              return {
                                ...prev,
                                khususKajianTeori: `${preset.kutipanTeori}\n\n${prev.khususKajianTeori || ''}`.trim(),
                                khususReferensi: updatedRefs
                              };
                            });
                          }
                          if (showToast) {
                            showToast(`Jurnal "${preset.penulisTahun}" ditambahkan ke Kajian Teori & Daftar Pustaka!`, 'success');
                          }
                          e.target.value = '';
                        }}
                        className="w-full text-[11px] p-1.5 border border-indigo-200 rounded-md bg-white text-slate-900 font-medium cursor-pointer"
                      >
                        <option value="">— + Sisipkan Kutipan Jurnal Ilmiah Sesuai RHK —</option>
                        {SCIENTIFIC_JOURNAL_PRESETS.map((jp) => (
                          <option key={jp.id} value={jp.id}>
                            {jp.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const scholarly = generateContextualReferences(
                            inputs.rhk || '1',
                            inputs.permasalahan || '',
                            inputs.solusi || '',
                            inputs.kopUnitKerja
                          );
                          if (setOutputs) {
                            setOutputs((prev) => ({
                              ...prev,
                              khususAbstrak: scholarly.abstrak,
                              khususKataKunci: scholarly.kataKunci,
                              khususKajianTeori: scholarly.kajianTeori,
                              khususReferensi: scholarly.referensi
                            }));
                          }
                          if (showToast) {
                            showToast('Kajian Jurnal Ilmiah, Abstrak & Daftar Pustaka berhasil diperbarui sesuai masalah!', 'success');
                          }
                        }}
                        className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Susun Kajian Jurnal Otomatis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddJournalForm(!showAddJournalForm)}
                        className="py-1.5 px-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-md font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Jurnal</span>
                      </button>
                    </div>

                    {showAddJournalForm && (
                      <div className="p-2.5 rounded-md bg-white border border-indigo-200 space-y-2">
                        <span className="block text-[10.5px] font-bold text-indigo-950">
                          Tambah Referensi & Kutipan Jurnal Ilmiah Baru
                        </span>
                        <input
                          type="text"
                          value={customJournalAuthor}
                          onChange={(e) => setCustomJournalAuthor(e.target.value)}
                          placeholder="Penulis & Tahun (cth: Suharto, E., 2024)"
                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded bg-slate-50"
                        />
                        <input
                          type="text"
                          value={customJournalTitle}
                          onChange={(e) => setCustomJournalTitle(e.target.value)}
                          placeholder="Judul Artikel Jurnal / Penelitian Ilmiah"
                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded bg-slate-50"
                        />
                        <input
                          type="text"
                          value={customJournalSource}
                          onChange={(e) => setCustomJournalSource(e.target.value)}
                          placeholder="Nama Jurnal, Vol(No), Halaman (cth: Sosio Konsepsia, 14(2), 90-102)"
                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded bg-slate-50"
                        />
                        <textarea
                          rows={2}
                          value={customJournalQuote}
                          onChange={(e) => setCustomJournalQuote(e.target.value)}
                          placeholder="Ringkasan temuan / kutipan teori jurnal untuk dimasukkan ke bab kajian..."
                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customJournalAuthor.trim() && !customJournalTitle.trim()) {
                              if (showToast) showToast('Isi minimal Penulis/Tahun dan Judul Jurnal.', 'error');
                              return;
                            }
                            const apaCitation = `${customJournalAuthor.trim() || 'Penulis. (2025)'}. ${customJournalTitle.trim() || 'Judul kajian ilmiah pekerjaan sosial'}. ${customJournalSource.trim() || 'Jurnal Kesejahteraan Sosial Kemensos RI'}.`;
                            if (setOutputs) {
                              setOutputs((prev) => {
                                const currentRefs = Array.isArray(prev.khususReferensi) ? prev.khususReferensi : [];
                                const nextTheory = customJournalQuote.trim()
                                  ? `${prev.khususKajianTeori || ''}\n\nMerujuk pada penelitian ${customJournalAuthor.trim() || 'terdahulu'} mengenai "${customJournalTitle.trim()}", dijelaskan bahwa: ${customJournalQuote.trim()}`.trim()
                                  : prev.khususKajianTeori;
                                return {
                                  ...prev,
                                  khususKajianTeori: nextTheory,
                                  khususReferensi: [apaCitation, ...currentRefs]
                                };
                              });
                            }
                            setCustomJournalAuthor('');
                            setCustomJournalTitle('');
                            setCustomJournalSource('');
                            setCustomJournalQuote('');
                            setShowAddJournalForm(false);
                            if (showToast) {
                              showToast('Referensi & kutipan jurnal ilmiah berhasil ditambahkan ke laporan!', 'success');
                            }
                          }}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-[11px] cursor-pointer"
                        >
                          + Masukkan ke Bab Kajian & Daftar Pustaka
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Standar Tata Naskah Dinas (Permensos RI Nomor 8 Tahun 2022) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Tata Naskah Dinas (Permensos No. 8/2022)
                    </span>
                    <span className="block text-[10.5px] text-slate-500 mt-0.5">
                      Huruf {inputs.fontIsi?.includes('Arial') ? 'Arial' : inputs.fontIsi?.includes('Bookman') ? 'Bookman Old Style' : inputs.fontIsi?.includes('Times') ? 'Times New Roman' : 'Calibri'} {inputs.sizeIsi || '12pt'} · Margin A:{inputs.marginTop || '2cm'} B:{inputs.marginBottom || '2.5cm'} Ki:{inputs.marginLeft || '3cm'} Ka:{inputs.marginRight || '2cm'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('identitas');
                      setShowTypoEditor(true);
                    }}
                    className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-blue-700 cursor-pointer shrink-0"
                  >
                    Atur Margin & Huruf
                  </button>
                </div>
                <select
                  value={inputs.standarTnd || 'permensos_8_2022'}
                  onChange={(e) => {
                    const val = e.target.value as ReportInputs['standarTnd'];
                    if (val === 'permensos_8_2022') {
                      setInputs((prev) => ({
                        ...prev,
                        standarTnd: 'permensos_8_2022',
                        fontIsi: 'Arial, sans-serif',
                        fontJudul: 'Arial, sans-serif',
                        sizeIsi: '12pt',
                        sizeJudul: '12pt',
                        lineHeight: '1.5',
                        marginTop: '2cm',
                        marginBottom: '2.5cm',
                        marginLeft: '3cm',
                        marginRight: '2cm',
                        paperSize: 'A4'
                      }));
                      if (showToast) {
                        showToast('Standar Permensos No. 8 Tahun 2022 diterapkan (Arial 12pt, Margin 2 / 2,5 / 3 / 2 cm).', 'success');
                      }
                    } else if (val === 'produk_hukum') {
                      setInputs((prev) => ({
                        ...prev,
                        standarTnd: 'produk_hukum',
                        fontIsi: "'Bookman Old Style', Georgia, serif",
                        fontJudul: "'Bookman Old Style', Georgia, serif",
                        sizeIsi: '12pt',
                        sizeJudul: '12pt',
                        lineHeight: '1.5',
                        marginTop: '2cm',
                        marginBottom: '2.5cm',
                        marginLeft: '3cm',
                        marginRight: '2cm',
                        paperSize: 'A4'
                      }));
                      if (showToast) {
                        showToast('Standar Produk Hukum Kemensos diterapkan (Bookman Old Style 12pt).', 'info');
                      }
                    } else if (val === 'klasik_tnr') {
                      setInputs((prev) => ({
                        ...prev,
                        standarTnd: 'klasik_tnr',
                        fontIsi: "'Times New Roman', Times, serif",
                        fontJudul: "'Times New Roman', Times, serif",
                        sizeIsi: '12pt',
                        sizeJudul: '14pt',
                        lineHeight: '1.5',
                        marginTop: '2cm',
                        marginBottom: '2.5cm',
                        marginLeft: '3cm',
                        marginRight: '2cm',
                        paperSize: 'A4'
                      }));
                      if (showToast) {
                        showToast('Format Klasik Times New Roman 12pt diterapkan.', 'info');
                      }
                    } else {
                      setInputs((prev) => ({ ...prev, standarTnd: 'custom' }));
                      setActiveTab('identitas');
                      setShowTypoEditor(true);
                    }
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="permensos_8_2022">
                    Permensos No. 8 Tahun 2022 — Arial 12pt & Margin Resmi (2 / 2,5 / 3 / 2 cm)
                  </option>
                  <option value="produk_hukum">
                    Permensos No. 8 Tahun 2022 (Produk Hukum) — Bookman Old Style 12pt
                  </option>
                  <option value="klasik_tnr">
                    Format Klasik — Times New Roman 12pt (Margin 2 / 2,5 / 3 / 2 cm)
                  </option>
                  <option value="custom">
                    Kustom — Pilih Sendiri Huruf, Ukuran & Margin Kertas
                  </option>
                </select>
              </div>

              {/* Fitur Tulis Masalah -> AI Buat Laporan Sesuai Masalah & Penyelesaian */}
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Tulis Masalah → AI Buat Laporan</span>
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                    Semua RHK 1–6
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Ketik masalah siswa/kegiatan di bawah, AI otomatis menentukan RHK, solusi intervensi Peksos, Bab A–G, dan Tabel Kegiatan:
                </p>
                <textarea
                  rows={2}
                  value={quickProblemInput}
                  onChange={(e) => setQuickProblemInput(e.target.value)}
                  placeholder="Contoh: Siswa rindu rumah (homesick) dan menangis malam hari di kamar asrama..."
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={() => {
                      const textToUse = quickProblemInput.trim() || inputs.permasalahan;
                      if (onGenerateFromProblem) {
                        onGenerateFromProblem(textToUse, true);
                      }
                    }}
                    className="py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Menyusun...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>AI → Laporan Khusus</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={() => {
                      const textToUse = quickProblemInput.trim() || inputs.permasalahan;
                      if (onGenerateFromProblem) {
                        onGenerateFromProblem(textToUse, false);
                      }
                    }}
                    className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>AI → Sesuai Mode</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions: Diagnosis SKP & Pustaka RHK */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiagnosisModal(true)}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Diagnosis SKP</span>
                </button>
                {onOpenPustakaRhk && (
                  <button
                    type="button"
                    onClick={onOpenPustakaRhk}
                    className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Pustaka RHK</span>
                  </button>
                )}
              </div>

              {/* Kategori RHK & Skenario */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori RHK Utama
                  </label>
                  <select
                    value={inputs.rhk}
                    onChange={handleRhkChange}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="1">RHK 1 — Bimbingan & Pengajaran Siswa</option>
                    <option value="2">RHK 2 — Kemandirian Peserta Didik</option>
                    <option value="3">RHK 3 — Bimbingan Aspek Kehidupan</option>
                    <option value="4">RHK 4 — Bimbingan Spiritual & Emosional</option>
                    <option value="5">RHK 5 — Pendampingan Siswa ABK</option>
                    <option value="6">RHK 6 — Penugasan Direktur / Pimpinan</option>
                    <option value="custom">Custom RHK (Input Manual)</option>
                  </select>
                </div>

                {inputs.rhk === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul Custom RHK
                    </label>
                    <input
                      type="text"
                      value={inputs.customTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputs((prev) => ({
                          ...prev,
                          customTitle: val,
                          judul: val.trim().toUpperCase() || 'BIMBINGAN KHUSUS / CUSTOM'
                        }));
                      }}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                      placeholder="Contoh: Bimbingan Karakter & Etika Harian"
                    />
                  </div>
                )}

                {inputs.rhk !== 'custom' && RHK_DATA[inputs.rhk] && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Skenario Kasus RHK {inputs.rhk}
                      </label>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {RHK_DATA[inputs.rhk]?.scenarios?.length || 50} opsi
                      </span>
                    </div>
                    <select
                      value={inputs.skenario}
                      onChange={handleScenarioChange}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="">— Pilih Skenario Kasus Siap Pakai (50 Opsi / RHK) —</option>
                      {RHK_DATA[inputs.rhk].scenarios.map((sc, i) => (
                        <option key={i} value={i}>
                          {sc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Autofill Kegiatan & Kasus Harian Cepat
                  </label>
                  <select
                    value={inputs.dailyPreset}
                    onChange={handleDailyPresetChange}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="">— Pilih Preset Kasus / Kegiatan Harian Cepat —</option>
                    <optgroup label="Kasus Sering Terjadi (Otomatis Tentukan RHK)">
                      <option value="tidak_mau_makan">Kasus: Tidak Mau Makan / Mogok Makan di Asrama (→ RHK 2)</option>
                      <option value="tidak_mau_sekolah">Kasus: Tidak Mau Sekolah / Mogok Masuk Kelas (→ RHK 1)</option>
                      <option value="baju_hilang">Kasus: Baju Hilang / Pakaian Tertukar di Jemuran (→ RHK 2)</option>
                      <option value="atribut_tidak_lengkap">Kasus: Atribut Sekolah Tidak Lengkap (Topi/Dasi/Sabuk) (→ RHK 1)</option>
                      <option value="tidak_mau_upacara">Kasus: Tidak Mau Upacara / Sembunyi di Kamar (→ RHK 1)</option>
                    </optgroup>
                    <optgroup label="Kegiatan Rutin & Pembinaan">
                      <option value="upacara">Upacara Bendera Hari Senin (→ RHK 1)</option>
                      <option value="upacara_phbn">Upacara Hari Besar Nasional / PHBN (→ RHK 1)</option>
                      <option value="upacara_petugas">Pelatihan Petugas Upacara Siswa (→ RHK 1)</option>
                      <option value="kunjungan_ortu">Kunjungan Orang Tua & Konsultasi (→ RHK 3)</option>
                      <option value="kesehatan_anak">Pemantauan Kesehatan & UKS Siswa (→ RHK 2)</option>
                      <option value="konsultasi_perkembangan">Penyelarasan Pola Asuh Keluarga (→ RHK 3)</option>
                      <option value="shalat">Shalat Berjamaah & Pembinaan Ibadah (→ RHK 1)</option>
                      <option value="mengaji">Bimbingan Mengaji / Al-Qur'an (→ RHK 1)</option>
                      <option value="cuci">Mencuci & Merawat Pakaian Mandiri (→ RHK 2)</option>
                      <option value="kamar">Membersihkan & Merapikan Kamar Asrama (→ RHK 2)</option>
                      <option value="belajar">Pendampingan Belajar Mandiri / PR (→ RHK 1)</option>
                      <option value="keseharian">Rutinitas Keseharian & Bangun Pagi (→ RHK 2)</option>
                      <option value="hygiene">Perawatan Diri & Kebersihan / PHBS (→ RHK 2)</option>
                      <option value="sosialisasi">Sosialisasi & Etika Interaksi Asrama (→ RHK 1)</option>
                    </optgroup>
                  </select>
                </div>

                {customTemplates.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Template Kustom Tersimpan ({customTemplates.length})
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const found = customTemplates.find((t) => t.id === e.target.value);
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
                      }}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="">— Pilih Template Kustom —</option>
                      {customTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.judul} (RHK {t.targetRhk || '1'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Core Inputs: Judul, Permasalahan, Solusi */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Laporan / Kegiatan
                  </label>
                  <input
                    type="text"
                    value={inputs.judul}
                    onChange={(e) => setInputs((prev) => ({ ...prev, judul: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Permasalahan / Dinamika Lapangan
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDiagnosisModal(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Analisis Masalah →
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={inputs.permasalahan}
                    onChange={(e) => setInputs((prev) => ({ ...prev, permasalahan: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Solusi / Intervensi Pekerjaan Sosial
                  </label>
                  <textarea
                    rows={3}
                    value={inputs.solusi}
                    onChange={(e) => setInputs((prev) => ({ ...prev, solusi: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Primary Generate Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onGenerateReport}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Susun Laporan</span>
                  </button>
                  <button
                    type="button"
                    onClick={onGenerateAI}
                    disabled={isAiGenerating}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Menyusun...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Perhalus AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status Nomor Surat Otomatis (+1 Setiap Generate) & Auto-Save JSON */}
                <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="block text-[11px] font-bold text-emerald-950">
                        Nomor Surat & Auto-Simpan JSON Aktif
                      </span>
                      <span className="block text-[10px] text-emerald-800 font-mono mt-0.5">
                        No. Saat Ini: {inputs.nomorSurat || 'B-104/SRT.31/PLM/07/2026'} (Otomatis +1 setiap Generate)
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[9.5px] font-bold shrink-0 tabular-nums">
                      {archives.length} JSON Tersimpan
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-emerald-200/80">
                    <label className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDownloadJson}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setAutoDownloadJson(next);
                          try {
                            localStorage.setItem('peksos_auto_download_json', next ? 'true' : 'false');
                          } catch {}
                          if (showToast) {
                            showToast(
                              next
                                ? 'Unduh file .JSON otomatis setiap Generate: AKTIF'
                                : 'Data tetap tersimpan otomatis di Arsip JSON (tanpa unduh file otomatis).',
                              'info'
                            );
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>Auto-unduh file .json tiap Generate</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (outputs) {
                          const snapshot: ArchiveItem = {
                            ...inputs,
                            ...outputs,
                            id: Date.now(),
                            timestamp: new Date().toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          };
                          downloadReportJsonFile(snapshot, 'Laporan_JSON');
                          if (showToast) {
                            showToast(`File JSON (${inputs.nomorSurat}) berhasil diunduh!`, 'success');
                          }
                        } else if (onExportArchivesJson) {
                          onExportArchivesJson();
                        }
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      title="Unduh laporan ini dalam format file .json"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh .JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Special Features Summary -> Opens SettingsModal */}
              {onOpenSettings && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Fitur Variabel Khusus ({activeSpecialCount} Aktif)
                    </span>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Pengaturan ON/OFF</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        inputs.aktifFiturUpacara
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">Upacara</span>
                      <span className="font-mono text-[10px] font-semibold">
                        {inputs.aktifFiturUpacara ? 'ON' : 'OFF'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        inputs.aktifFiturKunjungan
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">Kunjungan Ortu</span>
                      <span className="font-mono text-[10px] font-semibold">
                        {inputs.aktifFiturKunjungan ? 'ON' : 'OFF'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        inputs.sertakanDetailSuratTugas
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">Surat Tugas</span>
                      <span className="font-mono text-[10px] font-semibold">
                        {inputs.sertakanDetailSuratTugas ? 'ON' : 'OFF'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        inputs.aktifFiturPelatihan
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">Modul Diklat</span>
                      <span className="font-mono text-[10px] font-semibold">
                        {inputs.aktifFiturPelatihan ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Draft Save / Reset Controls */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="truncate tabular-nums">
                  {lastAutosaveTime ? `Draf tersimpan ${lastAutosaveTime}` : 'Penyimpanan otomatis aktif'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onManualDraftSave}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={onResetDraft}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURAT, KOP & IDENTITAS */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              {/* Nomor Surat & Penandatangan */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Nomor Surat Laporan</label>
                    <button
                      type="button"
                      onClick={() => setShowSuratSettings(!showSuratSettings)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{showSuratSettings ? 'Tutup Format' : 'Format Otomatis'}</span>
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inputs.nomorSurat || ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, nomorSurat: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono bg-white tabular-nums"
                      placeholder="B-104/SRT.31/PLM/07/2026"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextSeq = suratSeq + 1;
                        setSuratSeq(nextSeq);
                        const computed = formatSuratNumber(nextSeq, suratPattern, inputs.tanggalPicker);
                        setInputs((prev) => ({ ...prev, nomorSurat: computed }));
                      }}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1 border border-slate-200 cursor-pointer shrink-0 tabular-nums"
                      title="Naikkan nomor urut (+1)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1</span>
                    </button>
                  </div>

                  {showSuratSettings && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">Pola Nomor Otomatis</span>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAutoSuratEnabled}
                            onChange={(e) => setIsAutoSuratEnabled(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <span>Auto-Sync Tanggal</span>
                        </label>
                      </div>
                      <select
                        value={suratPattern}
                        onChange={(e) => setSuratPattern(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-mono"
                      >
                        <option value="B-{XXX}/SRT.31/PLM/{MM}/{YYYY}">B-104/SRT.31/PLM/07/2026</option>
                        <option value="B-{XXX}/SRT.31/PLM/{ROMAN}/{YYYY}">B-104/SRT.31/PLM/VII/2026</option>
                        <option value="LAP-{XXX}/SRT.31/{MM}/{YYYY}">LAP-104/SRT.31/07/2026</option>
                      </select>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-600">Nomor Urut Saat Ini:</span>
                        <input
                          type="number"
                          value={suratSeq}
                          onChange={(e) => setSuratSeq(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-20 text-center font-mono text-xs p-1 border border-slate-200 rounded bg-white tabular-nums"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat</label>
                    <input
                      type="text"
                      value={inputs.tempat}
                      onChange={(e) => setInputs((prev) => ({ ...prev, tempat: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      placeholder="Palembang"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Tanggal</label>
                    <input
                      type="date"
                      value={inputs.tanggalPicker}
                      onChange={handleDatePickerChange}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white cursor-pointer tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tanggal Laporan
                  </label>
                  <input
                    type="text"
                    value={inputs.tanggal}
                    onChange={(e) => setInputs((prev) => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali Asuh</label>
                    <input
                      type="text"
                      value={inputs.nama}
                      onChange={(e) => setInputs((prev) => ({ ...prev, nama: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / NI PPPK</label>
                    <input
                      type="text"
                      value={inputs.nip}
                      onChange={(e) => setInputs((prev) => ({ ...prev, nip: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Kop Surat (1 Logo / 2 Logo) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Logo Kop Surat</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInputs((prev) => ({
                        ...prev,
                        logoSrc: prev.logo2Src || DEFAULT_KEMENSOS_LOGO,
                        logo2Src: prev.logoSrc || DEFAULT_KEMENSOS_LOGO,
                        showLogo2: true
                      }));
                      if (showToast) showToast('Posisi Logo Kiri & Kanan ditukar.', 'info');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Tukar Kiri/Kanan
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, showLogo2: false }))}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      !inputs.showLogo2 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    1 Logo (Kiri)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        showLogo2: true,
                        logo2Src: prev.logo2Src || DEFAULT_KEMENSOS_LOGO
                      }))
                    }
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      inputs.showLogo2 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    2 Logo (Kiri & Kanan)
                  </button>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">Logo 1 (Kiri)</span>
                    <button
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, logoSrc: DEFAULT_KEMENSOS_LOGO }))}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logoSrc', e)}
                    disabled={uploadingState['logoSrc']}
                    className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-white file:text-slate-800 file:font-semibold cursor-pointer"
                  />
                </div>

                {inputs.showLogo2 && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700">Logo 2 (Kanan)</span>
                      <button
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, logo2Src: DEFAULT_KEMENSOS_LOGO }))}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                      >
                        Reset Default
                      </button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logo2Src', e)}
                      disabled={uploadingState['logo2Src']}
                      className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-white file:text-slate-800 file:font-semibold cursor-pointer"
                    />
                  </div>
                )}

                {/* Collapsible Teks Kop Surat */}
                <button
                  type="button"
                  onClick={() => setShowKopEditor(!showKopEditor)}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Teks Kop Surat & Alamat Instansi</span>
                  </span>
                  {showKopEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showKopEditor && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={inputs.kopInstansiUtama ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, kopInstansiUtama: e.target.value }))}
                      placeholder="Baris 1: Kementerian / Instansi"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={inputs.kopEselon1 ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, kopEselon1: e.target.value }))}
                      placeholder="Baris 2: Sekretariat Jenderal / Eselon I"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={inputs.kopEselon2 ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, kopEselon2: e.target.value }))}
                      placeholder="Baris 3: Pusdiklatbangprof / Eselon II"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={inputs.kopUnitKerja ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, kopUnitKerja: e.target.value }))}
                      placeholder="Baris 4: Sekolah Rakyat Terintegrasi 31 Palembang"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <textarea
                      rows={2}
                      value={inputs.kopAlamat ?? ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, kopAlamat: e.target.value }))}
                      placeholder="Alamat Lengkap Instansi"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Tanda Tangan & QR Code */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tanda Tangan & QR Digital</span>
                  </span>
                  {onGenerateQr && (
                    <button
                      type="button"
                      onClick={onGenerateQr}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Perbarui QR Otomatis
                    </button>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-700">Upload Tanda Tangan Basah (Opsional)</span>
                    {inputs.ttdSrc && (
                      <button
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, ttdSrc: '' }))}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('ttdSrc', e)}
                    className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-white file:text-slate-800 file:font-semibold cursor-pointer"
                  />
                </div>

                {/* Collapsible Tipografi, Margin & Tata Naskah Dinas (Permensos No. 8 Tahun 2022) */}
                <button
                  type="button"
                  onClick={() => setShowTypoEditor(!showTypoEditor)}
                  className="w-full py-2 px-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    <span>Margin & Huruf (Permensos No. 8 Tahun 2022)</span>
                  </span>
                  {showTypoEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTypoEditor && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    {/* Preset Standar Tata Naskah Dinas */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-800">
                          Standar Tata Naskah Dinas (TND)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setInputs((prev) => ({
                              ...prev,
                              standarTnd: 'permensos_8_2022',
                              fontIsi: 'Arial, sans-serif',
                              fontJudul: 'Arial, sans-serif',
                              sizeIsi: '12pt',
                              sizeJudul: '12pt',
                              lineHeight: '1.5',
                              paragraphSpacing: '0.5rem',
                              marginTop: '2cm',
                              marginBottom: '2.5cm',
                              marginLeft: '3cm',
                              marginRight: '2cm',
                              paperSize: 'A4'
                            }));
                            if (showToast) {
                              showToast('Diterapkan: Standar Permensos RI No. 8 Tahun 2022 (Arial 12pt, Margin 2 / 2,5 / 3 / 2 cm).', 'success');
                            }
                          }}
                          className="text-[10.5px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Reset ke Permensos 8/2022
                        </button>
                      </div>
                      <select
                        value={inputs.standarTnd || 'permensos_8_2022'}
                        onChange={(e) => {
                          const val = e.target.value as ReportInputs['standarTnd'];
                          if (val === 'permensos_8_2022') {
                            setInputs((prev) => ({
                              ...prev,
                              standarTnd: 'permensos_8_2022',
                              fontIsi: 'Arial, sans-serif',
                              fontJudul: 'Arial, sans-serif',
                              sizeIsi: '12pt',
                              sizeJudul: '12pt',
                              lineHeight: '1.5',
                              marginTop: '2cm',
                              marginBottom: '2.5cm',
                              marginLeft: '3cm',
                              marginRight: '2cm',
                              paperSize: 'A4'
                            }));
                          } else if (val === 'produk_hukum') {
                            setInputs((prev) => ({
                              ...prev,
                              standarTnd: 'produk_hukum',
                              fontIsi: "'Bookman Old Style', Georgia, serif",
                              fontJudul: "'Bookman Old Style', Georgia, serif",
                              sizeIsi: '12pt',
                              sizeJudul: '12pt',
                              lineHeight: '1.5',
                              marginTop: '2cm',
                              marginBottom: '2.5cm',
                              marginLeft: '3cm',
                              marginRight: '2cm',
                              paperSize: 'A4'
                            }));
                          } else if (val === 'klasik_tnr') {
                            setInputs((prev) => ({
                              ...prev,
                              standarTnd: 'klasik_tnr',
                              fontIsi: "'Times New Roman', Times, serif",
                              fontJudul: "'Times New Roman', Times, serif",
                              sizeIsi: '12pt',
                              sizeJudul: '14pt',
                              lineHeight: '1.5',
                              marginTop: '2cm',
                              marginBottom: '2.5cm',
                              marginLeft: '3cm',
                              marginRight: '2cm',
                              paperSize: 'A4'
                            }));
                          } else {
                            setInputs((prev) => ({ ...prev, standarTnd: 'custom' }));
                          }
                        }}
                        className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-medium text-slate-900"
                      >
                        <option value="permensos_8_2022">
                          Permensos No. 8 Tahun 2022 (Laporan: Arial 12pt, Margin 2/2,5/3/2 cm)
                        </option>
                        <option value="produk_hukum">
                          Permensos No. 8 Tahun 2022 (Produk Hukum: Bookman Old Style 12pt)
                        </option>
                        <option value="klasik_tnr">
                          Format Klasik (Times New Roman 12pt, Margin 2/2,5/3/2 cm)
                        </option>
                        <option value="custom">Kustom (Atur Sendiri)</option>
                      </select>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                        Sesuai Permensos RI No. 8 Tahun 2022 tentang Tata Naskah Dinas di Lingkungan Kementerian Sosial: Huruf <strong>Arial 12pt</strong>, Tepi Atas <strong>2 cm</strong>, Bawah <strong>2,5 cm</strong>, Kiri <strong>3 cm</strong>, Kanan <strong>2 cm</strong>.
                      </p>
                    </div>

                    {/* Jenis & Ukuran Huruf */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Jenis Huruf (Font Naskah Dinas)
                        </label>
                        <select
                          value={inputs.fontIsi}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              standarTnd: 'custom',
                              fontIsi: e.target.value,
                              fontJudul: e.target.value
                            }))
                          }
                          className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                        >
                          <option value="Arial, sans-serif">Arial (Standar Permensos No. 8 Tahun 2022)</option>
                          <option value="'Bookman Old Style', Georgia, serif">Bookman Old Style (Produk Hukum Kemensos)</option>
                          <option value="'Times New Roman', Times, serif">Times New Roman</option>
                          <option value="Calibri, sans-serif">Calibri</option>
                          <option value="Tahoma, sans-serif">Tahoma</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Ukuran Huruf Isi</label>
                          <select
                            value={inputs.sizeIsi}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                sizeIsi: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                          >
                            <option value="11pt">11pt</option>
                            <option value="12pt">12pt (Standar Permensos 8/2022)</option>
                            <option value="13pt">13pt</option>
                            <option value="14pt">14pt</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Ukuran Huruf Judul</label>
                          <select
                            value={inputs.sizeJudul}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                sizeJudul: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                          >
                            <option value="12pt">12pt (Standar Permensos 8/2022)</option>
                            <option value="13pt">13pt</option>
                            <option value="14pt">14pt</option>
                            <option value="16pt">16pt</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Batas Tepi (Margin Kertas) Sesuai Permensos No. 8 Tahun 2022 */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="block text-[11px] font-semibold text-slate-700">
                        Batas Tepi Kertas (Margin Naskah Dinas)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] text-slate-600 mb-0.5">
                            Tepi Atas (Top)
                          </label>
                          <select
                            value={inputs.marginTop || '2cm'}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                marginTop: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white tabular-nums"
                          >
                            <option value="1.5cm">1,5 cm</option>
                            <option value="2cm">2 cm (Permensos 8/2022)</option>
                            <option value="2.5cm">2,5 cm</option>
                            <option value="3cm">3 cm</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-slate-600 mb-0.5">
                            Tepi Bawah (Bottom)
                          </label>
                          <select
                            value={inputs.marginBottom || '2.5cm'}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                marginBottom: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white tabular-nums"
                          >
                            <option value="2cm">2 cm</option>
                            <option value="2.5cm">2,5 cm (Permensos 8/2022)</option>
                            <option value="3cm">3 cm</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-slate-600 mb-0.5">
                            Tepi Kiri (Left / Ordner)
                          </label>
                          <select
                            value={inputs.marginLeft || '3cm'}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                marginLeft: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white tabular-nums"
                          >
                            <option value="2.5cm">2,5 cm</option>
                            <option value="3cm">3 cm (Permensos 8/2022)</option>
                            <option value="3.5cm">3,5 cm</option>
                            <option value="4cm">4 cm</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-slate-600 mb-0.5">
                            Tepi Kanan (Right)
                          </label>
                          <select
                            value={inputs.marginRight || '2cm'}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                standarTnd: 'custom',
                                marginRight: e.target.value
                              }))
                            }
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white tabular-nums"
                          >
                            <option value="1.5cm">1,5 cm</option>
                            <option value="2cm">2 cm (Permensos 8/2022)</option>
                            <option value="2.5cm">2,5 cm</option>
                            <option value="3cm">3 cm</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Spasi Baris & Jarak Paragraf */}
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Spasi Baris</label>
                        <select
                          value={inputs.lineHeight}
                          onChange={(e) => setInputs((prev) => ({ ...prev, lineHeight: e.target.value }))}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                        >
                          <option value="1.0">1.0 (Tunggal)</option>
                          <option value="1.15">1.15 (Rapat / Resmi)</option>
                          <option value="1.5">1.5 (Standar Laporan)</option>
                          <option value="2.0">2.0 (Ganda)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Jarak Paragraf</label>
                        <select
                          value={inputs.paragraphSpacing}
                          onChange={(e) => setInputs((prev) => ({ ...prev, paragraphSpacing: e.target.value }))}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                        >
                          <option value="0.25rem">Rapat</option>
                          <option value="0.5rem">Standar (2 Spasi Kop)</option>
                          <option value="0.75rem">Renggang</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FOTO DOKUMENTASI */}
          {activeTab === 'foto' && (
            <div className="space-y-4">
              {/* Foto 1 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Foto Dokumentasi 1</span>
                  </span>
                  {inputs.foto1Src && (
                    <button
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, foto1Src: '' }))}
                      className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('foto1Src', e)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-slate-800 file:font-semibold cursor-pointer"
                />

                {inputs.foto1Src && (
                  <img
                    src={inputs.foto1Src}
                    alt="Preview Foto 1"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-lg border border-slate-200 bg-white"
                  />
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Caption Foto 1
                  </label>
                  <input
                    type="text"
                    value={inputs.foto1Caption || ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, foto1Caption: e.target.value }))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    placeholder="Foto 1. Pelaksanaan Kegiatan"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Saran Caption Cepat:</span>
                  {getCaptionSuggestions(inputs.judul || inputs.customTitle || '', 1).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, foto1Caption: sugg }))}
                      className="w-full text-left text-[11px] px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 truncate cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto 2 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Foto Dokumentasi 2</span>
                  </span>
                  {inputs.foto2Src && (
                    <button
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, foto2Src: '' }))}
                      className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('foto2Src', e)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-slate-800 file:font-semibold cursor-pointer"
                />

                {inputs.foto2Src && (
                  <img
                    src={inputs.foto2Src}
                    alt="Preview Foto 2"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-lg border border-slate-200 bg-white"
                  />
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Caption Foto 2
                  </label>
                  <input
                    type="text"
                    value={inputs.foto2Caption || ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, foto2Caption: e.target.value }))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    placeholder="Foto 2. Evaluasi Kegiatan"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Saran Caption Cepat:</span>
                  {getCaptionSuggestions(inputs.judul || inputs.customTitle || '', 2).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, foto2Caption: sugg }))}
                      className="w-full text-left text-[11px] px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 truncate cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARSIP & GOOGLE SHEET */}
          {activeTab === 'arsip' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onSaveToArchive}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span>Simpan Arsip</span>
                </button>
                {onOpenCalendar && (
                  <button
                    type="button"
                    onClick={onOpenCalendar}
                    className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kalender</span>
                  </button>
                )}
              </div>

              {/* Google Sheet Sync */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sinkronisasi Google Sheet</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSaveGoogleSheet}
                  disabled={isSavingSheet}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSheet ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Kirim Laporan Aktif ke Sheet</span>
                    </>
                  )}
                </button>
                <input
                  type="text"
                  value={sheetUrl || ''}
                  onChange={(e) => setSheetUrl && setSheetUrl(e.target.value)}
                  className="w-full text-[10px] font-mono p-1.5 border border-slate-200 rounded bg-white text-slate-600 truncate"
                  placeholder="URL Web App Google Script"
                />
              </div>

              {/* JSON Backup / Restore */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onExportArchivesJson}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <label className="py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={onImportArchivesJson}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedArchiveIds.length > 0 && onExportArchivesToGoogleSheet && (
                <button
                  type="button"
                  onClick={() => onExportArchivesToGoogleSheet(selectedArchiveIds)}
                  disabled={isSavingSheet}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Ekspor {selectedArchiveIds.length} Arsip Terpilih ke Sheet</span>
                </button>
              )}

              {/* Daftar Arsip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Daftar Arsip Tersimpan ({archives.length})</span>
                  {archives.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedArchiveIds(
                          selectedArchiveIds.length === archives.length ? [] : archives.map((a) => a.id)
                        )
                      }
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      {selectedArchiveIds.length === archives.length ? 'Batal Pilih' : 'Pilih Semua'}
                    </button>
                  )}
                </div>

                {archives.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500 space-y-2">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-700">Belum ada arsip laporan</p>
                    <p className="text-[11px] text-slate-500">
                      Simpan laporan harian Anda agar tercatat di kalender dan siap dicetak kapan saja.
                    </p>
                    <button
                      type="button"
                      onClick={onSaveToArchive}
                      className="mt-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Simpan Laporan Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {archives.map((item) => {
                      const isSelected = selectedArchiveIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isSelected ? 'bg-blue-50/40 border-blue-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectArchive(item.id)}
                              className="mt-0.5 rounded text-blue-600 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate" title={item.judul}>
                                {item.judul || 'Laporan Tanpa Judul'}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 tabular-nums">
                                <span>RHK {item.rhk || '1'}</span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{item.tanggal || item.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onLoadArchive(item.id)}
                              className="py-1 px-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FolderInput className="w-3 h-3" />
                              <span>Muat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditArchive(item.id)}
                              className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onLoadArchive(item.id);
                                setTimeout(() => onPrint(), 250);
                              }}
                              className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center justify-center cursor-pointer"
                              title="Cetak PDF"
                            >
                              <Printer className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onExportSingleArchiveToGoogleSheet && onExportSingleArchiveToGoogleSheet(item.id)
                              }
                              disabled={isSavingSheet}
                              className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded text-[11px] font-medium flex items-center justify-center cursor-pointer"
                              title="Kirim ke Sheet"
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteArchive(item.id);
                                setSelectedArchiveIds((prev) => prev.filter((i) => i !== item.id));
                              }}
                              className="py-1 px-1.5 bg-slate-100 hover:bg-red-50 text-red-600 rounded text-[11px] font-medium flex items-center justify-center cursor-pointer"
                              title="Hapus Arsip"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {onLogout && (
                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Lazy-Loaded Modal Diagnosis Masalah & Rekomendasi SKP */}
      {showDiagnosisModal && (
        <Suspense fallback={null}>
          <SkpDiagnosisModal
            isOpen={showDiagnosisModal}
            onClose={() => setShowDiagnosisModal(false)}
            initialProblem={inputs.permasalahan}
            onApplyDiagnosis={handleApplyDiagnosis}
            showToast={showToast}
          />
        </Suspense>
      )}
    </>
  );
};
