import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Menu, Printer, Loader2, BookMarked, SpellCheck, Settings, Wifi, WifiOff, HardDrive, Table } from 'lucide-react';
import { ReportInputs, ReportOutputs, ArchiveItem } from './types';
import { DEFAULT_DASAR_HUKUM, RHK_DATA } from './data/presets';
import { DEFAULT_KEMENSOS_LOGO } from './utils/kemensosLogo';
import { Sidebar } from './components/Sidebar';
import { ReportPreview } from './components/ReportPreview';
import { LoginModal } from './components/LoginModal';
import { EditArchiveModal } from './components/EditArchiveModal';
import { PustakaRhkModal } from './components/PustakaRhkModal';
import { OfflineStatusModal } from './components/OfflineStatusModal';
import { SpellCheckModal } from './components/SpellCheckModal';
import { TokenManagerModal } from './components/TokenManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { MatriksSkpModal } from './components/MatriksSkpModal';
import { Toast } from './components/Toast';
import { saveToGoogleSheet, saveArchiveToGoogleSheet, saveMultipleArchivesToGoogleSheet, DEFAULT_SHEET_URL } from './utils/googleSheet';
import { generateDigitalSignatureQr } from './utils/qrGenerator';
import { saveAutoDraft, loadAutoDraft, clearAutoDraft } from './utils/draftDb';
import { checkActiveTokenSession, clearActiveTokenSession } from './utils/tokenManager';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true' || checkActiveTokenSession().isValid;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPustakaOpen, setIsPustakaOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [isTokenManagerOpen, setIsTokenManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMatriksSkpOpen, setIsMatriksSkpOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isForceOffline, setIsForceOffline] = useState<boolean>(() => {
    return localStorage.getItem('peksos_force_offline') === 'true';
  });

  const isActuallyOffline = !isOnline || isForceOffline;

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('peksos_sheet_url') || DEFAULT_SHEET_URL;
  });

  useEffect(() => {
    if (sheetUrl) {
      localStorage.setItem('peksos_sheet_url', sheetUrl);
    }
  }, [sheetUrl]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Offline status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("🌐 Koneksi terhubung kembali. Mode Online siap.", "info");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("🔌 Koneksi internet terputus. Mengalihkan ke Mode Offline.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const toggleForceOffline = useCallback(() => {
    setIsForceOffline((prev) => {
      const next = !prev;
      localStorage.setItem('peksos_force_offline', String(next));
      if (next) {
        showToast("⚡ Mode Offline Dipaksa Aktif! Semua penyusunan & arsip menggunakan mesin lokal.", "info");
      } else {
        showToast("🌐 Mode Offline Dipaksa Nonaktif.", "info");
      }
      return next;
    });
  }, [showToast]);

  // Default Form Inputs
  const DEFAULT_INPUTS: ReportInputs = {
    rhk: "1",
    customTitle: "",
    dailyPreset: "",
    skenario: "0",
    judul: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
    permasalahan: "Siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi).",
    solusi: "Menerapkan pendekatan modifikasi perilaku (Behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (Ecological Perspective).",
    fontJudul: "'Times New Roman', Times, serif",
    sizeJudul: "18pt",
    fontIsi: "'Times New Roman', Times, serif",
    sizeIsi: "12pt",
    lineHeight: "1.5",
    paragraphSpacing: "0.5rem",
    tempat: "Palembang",
    tanggal: "30 Juli 2026",
    tanggalPicker: "2026-07-30",
    nama: "M Ardian Nugraha",
    nip: "199202042026221001",
    nomorSurat: "B-104/SRT.31/PLM/07/2026",
    logoSrc: "",
    ttdSrc: "",
    qrCodeSrc: "",
    foto1Src: "",
    foto2Src: "",
    foto1Caption: "Foto 1. Pelaksanaan Kegiatan",
    foto2Caption: "Foto 2. Kondisi Lapangan",
    tampilkanNomorHalaman: true,
    formatNomorHalaman: "- {n} -",
    showWatermark: false,
    watermarkOpacity: 0.18,
    watermarkType: 'kemensos',
    customWatermarkText: 'SEKOLAH RAKYAT',
    customWatermarkImg: '',
    hideWatermarkOnLampiran: true,
    watermarkWidth: 450,
    watermarkHeight: 'auto',
    pinWatermarkSize: true
  };

  // Default Report Text Outputs
  const DEFAULT_OUTPUTS: ReportOutputs = {
    judul: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
    umum: "Dalam pelaksanaan tugas sebagai Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan dan pengasuhan kepada peserta didik dilaksanakan merespon dinamika asrama dimana ditemukan indikasi bahwa siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi). Kegiatan pendampingan ini dilakukan sebagai bentuk pengasuhan anak yang terintegrasi di lingkungan sekolah.",
    maksud: "Memberikan gambaran pelaksanaan intervensi pekerjaan sosial dan kegiatan bimbingan harian terkait permasalahan siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi).",
    tujuan: "Untuk mengontrol, membina, dan memberikan pendampingan yang tepat guna menyelesaikan kendala yang dihadapi peserta didik melalui intervensi yang terukur.",
    ruang: "Ruang lingkup kegiatan difokuskan pada upaya menerapkan pendekatan modifikasi perilaku (behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (ecological perspective) dalam kerangka pembinaan karakter dan pengasuhan peserta didik di Sekolah Rakyat.",
    dasar: DEFAULT_DASAR_HUKUM,
    kegiatan: "Kegiatan pendampingan dilaksanakan melalui observasi terarah, pendekatan persuasif, dan implementasi intervensi spesifik, yakni dengan menerapkan pendekatan modifikasi perilaku (behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (ecological perspective). Proses ini melibatkan partisipasi aktif siswa agar menyadari tanggung jawabnya.",
    hasil: "Siswa merespon intervensi dengan kooperatif, menunjukkan perubahan sikap yang lebih adaptif, serta kondisi emosional yang relatif stabil pasca diberikannya pendampingan.",
    simpulan: "Kegiatan intervensi dan pendampingan terkait bimbingan dan pengajaran kepada siswa peserta didik berjalan dengan baik dan berhasil menekan perilaku maladaptif peserta didik.",
    saran: "Diperlukan monitoring lanjutan secara konsisten serta kolaborasi dengan pihak pendidik/sekolah untuk memastikan keberlanjutan perubahan perilaku peserta didik.",
    rekomendasi: "1. Merekomendasikan pendampingan individual secara terprogram oleh Wali Asuh dan tim Pekerja Sosial.\n2. Merekomendasikan koordinasi rutin berkala dengan kepala sekolah, wali kelas, serta orang tua/wali siswa guna menjaga konsistensi pembinaan karakter anak.",
    penutup: "Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang agar dapat dipergunakan sebagaimana mestinya.",
    tempat: "Palembang",
    tanggal: "30 Juli 2026",
    nama: "M Ardian Nugraha",
    nip: "199202042026221001"
  };

  // Form Inputs State (Restored from localStorage draft if available)
  const [inputs, setInputs] = useState<ReportInputs>(() => {
    try {
      const saved = localStorage.getItem('peksos_inputs_draft');
      if (saved) {
        return { ...DEFAULT_INPUTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Gagal memuat draf inputs:", e);
    }
    return DEFAULT_INPUTS;
  });

  // Report Text Outputs State (Restored from localStorage draft if available)
  const [outputs, setOutputs] = useState<ReportOutputs>(() => {
    try {
      const saved = localStorage.getItem('peksos_outputs_draft');
      if (saved) {
        return { ...DEFAULT_OUTPUTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Gagal memuat draf outputs:", e);
    }
    return DEFAULT_OUTPUTS;
  });

  // Autosave State & Effect (Real-time to IndexedDB + Backup to localStorage)
  const [lastAutosaveTime, setLastAutosaveTime] = useState<string | null>(() => {
    return localStorage.getItem('peksos_last_autosave_time') || null;
  });
  const [idbDraftSaved, setIdbDraftSaved] = useState<boolean>(true);

  // Load Auto-Draft from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    loadAutoDraft().then((draft) => {
      if (isMounted && draft && draft.inputs && draft.outputs) {
        setInputs((prev) => ({ ...prev, ...draft.inputs }));
        setOutputs((prev) => ({ ...prev, ...draft.outputs }));
        const timeFormatted = new Date(draft.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAutosaveTime(timeFormatted);
      }
    }).catch((err) => {
      console.error("Gagal memuat Auto-Draft dari IndexedDB:", err);
    });
    return () => { isMounted = false; };
  }, []);

  // Real-time Debounced Auto-Save to IndexedDB (and sync to localStorage)
  useEffect(() => {
    setIdbDraftSaved(false);
    const handler = setTimeout(() => {
      saveAutoDraft(inputs, outputs)
        .then(() => {
          setIdbDraftSaved(true);
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastAutosaveTime(nowStr);
          try {
            localStorage.setItem('peksos_inputs_draft', JSON.stringify(inputs));
            localStorage.setItem('peksos_outputs_draft', JSON.stringify(outputs));
            localStorage.setItem('peksos_last_autosave_time', nowStr);
          } catch (e) {
            console.warn("localStorage penuh, draf tetap aman tersimpan di IndexedDB:", e);
          }
        })
        .catch((err) => {
          console.error("Gagal menyimpan Auto-Draft ke IndexedDB:", err);
        });
    }, 600); // 600ms debounce for real-time responsiveness

    return () => clearTimeout(handler);
  }, [inputs, outputs]);

  const performAutosave = useCallback(() => {
    saveAutoDraft(inputs, outputs);
    try {
      localStorage.setItem('peksos_inputs_draft', JSON.stringify(inputs));
      localStorage.setItem('peksos_outputs_draft', JSON.stringify(outputs));
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem('peksos_last_autosave_time', nowStr);
      setLastAutosaveTime(nowStr);
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage:", e);
    }
  }, [inputs, outputs]);

  const handleManualDraftSave = useCallback(() => {
    performAutosave();
    showToast("Draf formulir tersimpan di IndexedDB & lokal!", "success");
  }, [performAutosave, showToast]);

  const handleResetDraft = useCallback(() => {
    if (window.confirm("Apakah Anda yakin ingin mereset formulir dan mengosongkan draf tersimpan?")) {
      try {
        localStorage.removeItem('peksos_inputs_draft');
        localStorage.removeItem('peksos_outputs_draft');
        localStorage.removeItem('peksos_last_autosave_time');
      } catch {}
      clearAutoDraft();
      setInputs(DEFAULT_INPUTS);
      setOutputs(DEFAULT_OUTPUTS);
      setLastAutosaveTime(null);
      showToast("Formulir berhasil direset ke pengaturan awal.", "info");
    }
  }, [showToast]);

  // Archives State
  const [archives, setArchives] = useState<ArchiveItem[]>(() => {
    try {
      const stored = localStorage.getItem('peksos_archives');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [editingArchive, setEditingArchive] = useState<ArchiveItem | null>(null);

  // Sync Outputs whenever basic inputs change if user hasn't customized outputs manually
  const generateReportText = useCallback(() => {
    if (!inputs.permasalahan || !inputs.solusi) {
      showToast("Harap isi permasalahan dan solusi terlebih dahulu!", "error");
      return;
    }

    const masalah = inputs.permasalahan.trim();
    const solusi = inputs.solusi.trim();
    const judul = inputs.judul.trim();

    const mLower = masalah.toLowerCase();
    const sLower = solusi.toLowerCase();
    const jLower = judul.toLowerCase();

    setOutputs({
      judul: judul,
      umum: `Dalam pelaksanaan tugas sebagai Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan dan pengasuhan kepada peserta didik dilaksanakan merespon dinamika asrama dimana ditemukan indikasi bahwa ${mLower} Kegiatan pendampingan ini dilakukan sebagai bentuk pengasuhan anak yang terintegrasi di lingkungan sekolah.`,
      maksud: `Memberikan gambaran pelaksanaan intervensi pekerjaan sosial dan kegiatan bimbingan harian terkait permasalahan ${mLower}`,
      tujuan: `Untuk mengontrol, membina, dan memberikan pendampingan yang tepat guna menyelesaikan kendala yang dihadapi peserta didik melalui intervensi yang terukur.`,
      ruang: `Ruang lingkup kegiatan difokuskan pada upaya ${sLower} dalam kerangka pembinaan karakter dan pengasuhan peserta didik di Sekolah Rakyat.`,
      dasar: DEFAULT_DASAR_HUKUM,
      kegiatan: `Kegiatan pendampingan dilaksanakan melalui observasi terarah, pendekatan persuasif, dan implementasi intervensi spesifik, yakni dengan ${sLower} Proses ini melibatkan partisipasi aktif siswa agar menyadari tanggung jawabnya.`,
      hasil: `Siswa merespon intervensi dengan kooperatif, menunjukkan perubahan sikap yang lebih adaptif, serta kondisi emosional yang relatif stabil pasca diberikannya pendampingan.`,
      simpulan: `Kegiatan intervensi dan pendampingan terkait ${jLower} berjalan dengan baik dan berhasil menekan perilaku maladaptif peserta didik.`,
      saran: `Diperlukan monitoring lanjutan secara konsisten serta kolaborasi dengan pihak pendidik/sekolah untuk memastikan keberlanjutan perubahan perilaku peserta didik.`,
      rekomendasi: `1. Merekomendasikan pendampingan individual secara terprogram oleh Wali Asuh dan tim Pekerja Sosial.\n2. Merekomendasikan koordinasi rutin berkala dengan kepala sekolah, wali kelas, serta orang tua/wali siswa guna menjaga konsistensi pembinaan karakter anak.`,
      penutup: `Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang dalam rangka ${jLower} agar dapat dipergunakan sebagaimana mestinya.`,
      tempat: inputs.tempat,
      tanggal: inputs.tanggal,
      nama: inputs.nama,
      nip: inputs.nip
    });

    showToast("Laporan berhasil disusun!", "success");
  }, [inputs, showToast]);

  // AI Generation via Gemini API (/api/generate-ai)
  const generateAI = useCallback(async () => {
    if (!inputs.permasalahan || !inputs.solusi) {
      showToast("Harap isi permasalahan dan solusi terlebih dahulu!", "error");
      return;
    }

    if (isActuallyOffline) {
      showToast("⚡ Mode Offline Aktif: Menyusun narasi menggunakan Mesin Penyusun Lokal.", "info");
      generateReportText();
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        })
      });

      if (!res.ok) {
        throw new Error("Respon server gagal");
      }

      const data = await res.json();
      setOutputs((prev) => ({
        ...prev,
        judul: inputs.judul,
        umum: data.umum || prev.umum,
        maksud: data.maksud || prev.maksud,
        tujuan: data.tujuan || prev.tujuan,
        ruang: data.ruang || prev.ruang,
        kegiatan: data.kegiatan || prev.kegiatan,
        hasil: data.hasil || prev.hasil,
        simpulan: data.simpulan || prev.simpulan,
        saran: data.saran || prev.saran,
        rekomendasi: data.rekomendasi || prev.rekomendasi,
        penutup: data.penutup || prev.penutup,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      }));

      showToast("✨ Gemini AI berhasil menyusun narasi Wali Asuh profesional!", "success");
    } catch (err: any) {
      console.error(err);
      // Fallback local text compilation
      generateReportText();
    } finally {
      setIsAiGenerating(false);
    }
  }, [inputs, showToast, generateReportText, isActuallyOffline]);

  // Archives Persistence
  useEffect(() => {
    try {
      localStorage.setItem('peksos_archives', JSON.stringify(archives));
    } catch (err) {
      console.error("Failed to save archives to localStorage", err);
    }
  }, [archives]);

  const saveToArchive = useCallback(() => {
    const newReport: ArchiveItem = {
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

    setArchives((prev) => [newReport, ...prev]);
    showToast("Laporan beserta format font & spasi berhasil disimpan ke Arsip!", "success");
  }, [inputs, outputs, showToast]);

  const handleExportArchivesJson = useCallback(() => {
    if (archives.length === 0) {
      showToast("Belum ada arsip laporan untuk diexport.", "warning");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archives, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("download", `Backup_Arsip_eKinerja_SekolahRakyat_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Berhasil mengexport ${archives.length} arsip laporan ke file JSON!`, "success");
  }, [archives, showToast]);

  const handleImportArchivesJson = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          setArchives((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newItems = imported.filter((a) => a && a.id && !existingIds.has(a.id));
            return [...newItems, ...prev];
          });
          showToast(`Berhasil mengimpor ${imported.length} arsip dari file JSON!`, "success");
        } else {
          showToast("Format file JSON tidak valid (harus berupa daftar arsip).", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal membaca file JSON backup.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast]);

  const loadArchive = useCallback((id: number) => {
    const item = archives.find((a) => a.id === id);
    if (!item) return;

    setInputs({
      rhk: item.rhk || "1",
      customTitle: item.customTitle || "",
      dailyPreset: item.dailyPreset || "",
      skenario: item.skenario || "",
      judul: item.judul || "",
      permasalahan: item.permasalahan || "",
      solusi: item.solusi || "",
      fontJudul: item.fontJudul || "'Times New Roman', Times, serif",
      sizeJudul: item.sizeJudul || "18pt",
      fontIsi: item.fontIsi || "'Times New Roman', Times, serif",
      sizeIsi: item.sizeIsi || "12pt",
      lineHeight: item.lineHeight || "1.5",
      paragraphSpacing: item.paragraphSpacing || "0.5rem",
      tempat: item.tempat || "Palembang",
      tanggal: item.tanggal || "",
      tanggalPicker: item.tanggalPicker || "",
      nama: item.nama || "",
      nip: item.nip || "",
      logoSrc: item.logoSrc || "",
      ttdSrc: item.ttdSrc || "",
      foto1Src: item.foto1Src || "",
      foto2Src: item.foto2Src || "",
      foto1Caption: item.foto1Caption || "Foto 1. Pelaksanaan Kegiatan",
      foto2Caption: item.foto2Caption || "Foto 2. Kondisi Lapangan",
      tampilkanNomorHalaman: item.tampilkanNomorHalaman !== undefined ? item.tampilkanNomorHalaman : true,
      formatNomorHalaman: item.formatNomorHalaman || "- {n} -"
    });

    setOutputs({
      judul: item.judul || "",
      umum: item.umum || "",
      maksud: item.maksud || "",
      tujuan: item.tujuan || "",
      ruang: item.ruang || "",
      dasar: item.dasar || DEFAULT_DASAR_HUKUM,
      kegiatan: item.kegiatan || "",
      hasil: item.hasil || "",
      simpulan: item.simpulan || "",
      saran: item.saran || "",
      rekomendasi: item.rekomendasi || "1. Merekomendasikan pendampingan individual secara terprogram oleh Wali Asuh.\n2. Evaluasi rutin perkembangan perilaku peserta didik.",
      penutup: item.penutup || "",
      tempat: item.tempat || "",
      tanggal: item.tanggal || "",
      nama: item.nama || "",
      nip: item.nip || ""
    });

    showToast("Arsip laporan berhasil dimuat!", "success");
  }, [archives, showToast]);

  const openEditArchive = (id: number) => {
    const item = archives.find((a) => a.id === id);
    if (item) {
      setEditingArchive(item);
    }
  };

  const saveArchiveEdit = (updatedItem: ArchiveItem) => {
    const mLower = (updatedItem.permasalahan || "").toLowerCase();
    const sLower = (updatedItem.solusi || "").toLowerCase();
    const jLower = (updatedItem.judul || "").toLowerCase();

    const recalculatedItem: ArchiveItem = {
      ...updatedItem,
      umum: updatedItem.umum || `Dalam pelaksanaan tugas sebagai Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan dan pengasuhan kepada peserta didik dilaksanakan merespon dinamika asrama dimana ditemukan indikasi bahwa ${mLower} Kegiatan pendampingan ini dilakukan sebagai bentuk pengasuhan anak yang terintegrasi di lingkungan sekolah.`,
      maksud: updatedItem.maksud || `Memberikan gambaran pelaksanaan intervensi pekerjaan sosial dan kegiatan bimbingan harian terkait permasalahan ${mLower}`,
      tujuan: updatedItem.tujuan || `Untuk mengontrol, membina, dan memberikan pendampingan yang tepat guna menyelesaikan kendala yang dihadapi peserta didik melalui intervensi yang terukur.`,
      ruang: updatedItem.ruang || `Ruang lingkup kegiatan difokuskan pada upaya ${sLower} dalam kerangka pembinaan karakter dan pengasuhan peserta didik di Sekolah Rakyat.`,
      kegiatan: updatedItem.kegiatan || `Kegiatan pendampingan dilaksanakan melalui observasi terarah, pendekatan persuasif, dan implementasi intervensi spesifik, yakni dengan ${sLower} Proses ini melibatkan partisipasi aktif siswa agar menyadari tanggung jawabnya.`,
      hasil: updatedItem.hasil || `Siswa merespon intervensi dengan kooperatif, menunjukkan perubahan sikap yang lebih adaptif, serta kondisi emosional yang relatif stabil pasca diberikannya pendampingan.`,
      simpulan: updatedItem.simpulan || `Kegiatan intervensi dan pendampingan terkait ${jLower} berjalan dengan baik dan berhasil menekan perilaku maladaptif peserta didik.`,
      saran: updatedItem.saran || `Diperlukan monitoring lanjutan secara konsisten serta kolaborasi dengan pihak pendidik/sekolah untuk memastikan keberlanjutan perubahan perilaku peserta didik.`,
      rekomendasi: updatedItem.rekomendasi || `1. Merekomendasikan pendampingan individual secara terprogram oleh Wali Asuh.\n2. Evaluasi rutin perkembangan perilaku peserta didik.`,
      penutup: updatedItem.penutup || `Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang dalam rangka ${jLower} agar dapat dipergunakan sebagaimana mestinya.`
    };

    setArchives((prev) => prev.map((a) => (a.id === updatedItem.id ? recalculatedItem : a)));
    setEditingArchive(null);
    showToast("Perubahan arsip berhasil disimpan!", "success");
  };

  const deleteArchive = (id: number) => {
    setArchives((prev) => prev.filter((a) => a.id !== id));
    showToast("Arsip laporan telah dihapus.", "info");
  };

  const handlePrint = useCallback(() => {
    const originalTitle = document.title;

    // Bersihkan nama Wali Asuh & tanggal agar aman sebagai nama file PDF
    const cleanNama = (inputs.nama || 'Wali_Asuh')
      .trim()
      .replace(/[,.]/g, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');

    const cleanTanggal = (inputs.tanggal || 'Terbaru')
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');

    const pdfFileName = `Laporan_Kinerja_${cleanNama}_${cleanTanggal}`;
    document.title = pdfFileName;

    window.print();

    // Kembalikan judul dokumen asli setelah dialog cetak dipanggil
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, [inputs.nama, inputs.tanggal]);

  const handleExportDocx = useCallback(async () => {
    setIsExportingDocx(true);
    try {
      const { exportReportToDocx } = await import('./utils/exportDocx');
      await exportReportToDocx(inputs, outputs);
      showToast("Dokumen .docx berhasil diunduh! Siap diedit di Microsoft Word.", "success");
    } catch (err) {
      console.error("Gagal mengekspor .docx:", err);
      showToast("Gagal mengunduh dokumen .docx. Silakan coba lagi.", "error");
    } finally {
      setIsExportingDocx(false);
    }
  }, [inputs, outputs, showToast]);

  const handleSaveGoogleSheet = useCallback(async () => {
    if (isActuallyOffline) {
      showToast("⚡ Anda sedang dalam Mode Offline. Sambungkan internet untuk ekspor ke Google Sheet.", "info");
      return;
    }

    setIsSavingSheet(true);
    try {
      const result = await saveToGoogleSheet(inputs, outputs, sheetUrl);
      if (result.success) {
        showToast("📊 " + result.message, "success");
      } else {
        showToast("❌ " + result.message, "error");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan ke Google Sheet:", err);
      showToast("❌ Gagal mengirim data ke Google Sheet. Periksa koneksi internet.", "error");
    } finally {
      setIsSavingSheet(false);
    }
  }, [inputs, outputs, sheetUrl, showToast, isActuallyOffline]);

  const handleExportArchivesToGoogleSheet = useCallback(async (archiveIds: number[]) => {
    if (isActuallyOffline) {
      showToast("⚡ Anda sedang dalam Mode Offline. Sambungkan internet untuk ekspor ke Google Sheet.", "info");
      return;
    }

    if (!archiveIds || archiveIds.length === 0) {
      showToast("Pilih setidaknya satu arsip untuk diekspor ke Google Sheet.", "info");
      return;
    }
    const selected = archives.filter((a) => archiveIds.includes(a.id));
    if (selected.length === 0) return;

    setIsSavingSheet(true);
    try {
      const result = await saveMultipleArchivesToGoogleSheet(selected, sheetUrl);
      showToast(`📊 ${result.message}`, result.failCount === 0 ? "success" : "info");
    } catch (err: any) {
      console.error("Gagal mengekspor arsip ke Google Sheet:", err);
      showToast("❌ Gagal mengirim data arsip ke Google Sheet.", "error");
    } finally {
      setIsSavingSheet(false);
    }
  }, [archives, sheetUrl, showToast, isActuallyOffline]);

  const handleExportSingleArchiveToGoogleSheet = useCallback(async (archiveId: number) => {
    if (isActuallyOffline) {
      showToast("⚡ Anda sedang dalam Mode Offline. Sambungkan internet untuk ekspor ke Google Sheet.", "info");
      return;
    }

    const archive = archives.find((a) => a.id === archiveId);
    if (!archive) return;

    setIsSavingSheet(true);
    try {
      const result = await saveArchiveToGoogleSheet(archive, sheetUrl);
      if (result.success) {
        showToast(`📊 Arsip "${(archive.judul || 'Laporan').substring(0, 30)}" tersimpan di Google Sheet!`, "success");
      } else {
        showToast("❌ " + result.message, "error");
      }
    } catch (err: any) {
      console.error("Gagal mengirim arsip ke Google Sheet:", err);
      showToast("❌ Gagal mengirim arsip ke Google Sheet.", "error");
    } finally {
      setIsSavingSheet(false);
    }
  }, [archives, sheetUrl, showToast, isActuallyOffline]);

  const handleSelectPustakaTemplate = useCallback((tpl: {
    rhk: string;
    judul: string;
    permasalahan: string;
    solusi: string;
    skenario?: string;
    dailyPreset?: string;
  }) => {
    setInputs((prev) => ({
      ...prev,
      rhk: tpl.rhk,
      judul: tpl.judul,
      permasalahan: tpl.permasalahan,
      solusi: tpl.solusi,
      skenario: tpl.skenario || '',
      dailyPreset: tpl.dailyPreset || ''
    }));
    showToast("📚 Template RHK berhasil diterapkan ke laporan!", "success");
  }, [showToast]);

  const handleGenerateQr = useCallback(async () => {
    const qrDataUrl = await generateDigitalSignatureQr(inputs.nama, inputs.nip, inputs.tanggal);
    if (qrDataUrl) {
      setInputs((prev) => ({ ...prev, qrCodeSrc: qrDataUrl }));
      showToast("Tanda tangan digital QR Code berhasil dibuat!", "success");
    }
  }, [inputs.nama, inputs.nip, inputs.tanggal, showToast]);

  // Auto-generate QR code if empty on mount or when name/NIP changes
  useEffect(() => {
    if (!inputs.qrCodeSrc) {
      generateDigitalSignatureQr(inputs.nama, inputs.nip, inputs.tanggal).then((qr) => {
        if (qr) {
          setInputs((prev) => ({ ...prev, qrCodeSrc: qr }));
        }
      });
    }
  }, [inputs.nama, inputs.nip, inputs.tanggal, inputs.qrCodeSrc]);

  const handleLogout = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun e-Kinerja?')) {
      sessionStorage.removeItem('isLoggedIn');
      clearActiveTokenSession();
      setIsLoggedIn(false);
      showToast('Berhasil keluar dari akun.', 'info');
    }
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans tracking-tight relative">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Login Modal Overlay if not logged in */}
      {!isLoggedIn && (
        <LoginModal
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            sessionStorage.setItem('isLoggedIn', 'true');
          }}
          showToast={showToast}
        />
      )}

      {/* Top Header - Clean Minimalism Styling */}
      <header id="topbar" className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 z-30 shadow-2xs print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 focus:outline-none flex items-center gap-2 transition-all cursor-pointer border border-gray-200 shadow-2xs bg-white"
            title={isSidebarOpen ? "Sembunyikan Sidebar Panel Input" : "Tampilkan Sidebar Panel Input"}
          >
            <Menu className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-800 hidden md:inline">
              {isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tighter text-blue-600">e-KINERJA <span className="text-gray-900 font-light italic">WALI ASUH</span></span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
              Sekolah Rakyat 31 Palembang
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Badge */}
          <div className="hidden xl:flex items-center gap-2.5 mr-1">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">{inputs.nama || "M Ardian Nugraha"}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Wali Asuh / Peksos</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shadow-2xs">
              {inputs.nama ? inputs.nama.split(' ').map((n) => n[0]).join('').slice(0, 2) : "MN"}
            </div>
          </div>

          {/* 1. Cek Ejaan KBBI */}
          <button
            onClick={() => setIsSpellCheckOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cek Ejaan Bahasa Indonesia & Kata Non-Baku (KBBI)"
          >
            <SpellCheck className="w-4 h-4 text-purple-200" />
            <span className="hidden lg:inline">Cek Ejaan KBBI</span>
          </button>

          {/* 2. Pustaka RHK */}
          <button
            onClick={() => setIsPustakaOpen(true)}
            className="bg-indigo-700 hover:bg-indigo-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Buka Pustaka 100+ Template RHK & Skenario e-Kinerja"
          >
            <BookMarked className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">Pustaka RHK</span>
          </button>

          {/* 3. Matriks SKP Bulanan */}
          <button
            onClick={() => setIsMatriksSkpOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lihat & Cetak Matriks SKP Bulanan e-Kinerja BKN"
          >
            <Table className="w-4 h-4 text-amber-100" />
            <span className="hidden sm:inline">Matriks SKP</span>
          </button>

          {/* 4. Cetak PDF */}
          <button
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak atau simpan Laporan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak PDF</span>
          </button>

          {/* 5. Pengaturan (Setting Panel) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-gray-900 hover:bg-black px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-800"
            title="Buka Panel Pengaturan (Network, Token 1 Bulan, Google Sheet, & Logout)"
          >
            <Settings className="w-4 h-4 text-gray-300" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
          />
        )}

        {/* Sidebar Inputs */}
        <Sidebar
          inputs={inputs}
          setInputs={setInputs}
          onGenerateReport={generateReportText}
          onGenerateAI={generateAI}
          isAiGenerating={isAiGenerating}
          archives={archives}
          onSaveToArchive={saveToArchive}
          onExportArchivesJson={handleExportArchivesJson}
          onImportArchivesJson={handleImportArchivesJson}
          onLoadArchive={loadArchive}
          onEditArchive={openEditArchive}
          onDeleteArchive={deleteArchive}
          onPrint={handlePrint}
          onExportDocx={handleExportDocx}
          isExportingDocx={isExportingDocx}
          onSaveGoogleSheet={handleSaveGoogleSheet}
          onExportArchivesToGoogleSheet={handleExportArchivesToGoogleSheet}
          onExportSingleArchiveToGoogleSheet={handleExportSingleArchiveToGoogleSheet}
          isSavingSheet={isSavingSheet}
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          onGenerateQr={handleGenerateQr}
          onOpenPustakaRhk={() => setIsPustakaOpen(true)}
          lastAutosaveTime={lastAutosaveTime}
          onManualDraftSave={handleManualDraftSave}
          onResetDraft={handleResetDraft}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Document Preview Container */}
        <main id="preview-container" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8 w-full">
          {/* Status KPI Cards Header - Clean Minimalism */}
          <section className={`max-w-[210mm] mx-auto mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden ${isFocusMode ? 'hidden' : ''}`}>
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">RHK Terpilih</p>
              <h2 className="text-sm font-extrabold text-gray-900 truncate">RHK {inputs.rhk === 'custom' ? 'Custom' : inputs.rhk}</h2>
              <p className="text-[11px] text-blue-600 font-semibold mt-1 truncate">{inputs.rhk === 'custom' ? (inputs.customTitle || 'Judul Custom') : 'Kinerja Utama'}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Format Font</p>
              <h2 className="text-sm font-extrabold text-gray-900">{inputs.sizeIsi} ({inputs.fontIsi.includes('Times') ? 'Times' : 'Arial'})</h2>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Spasi {inputs.lineHeight}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Dokumen</p>
              <h2 className="text-sm font-extrabold text-gray-900 truncate">{inputs.tanggal || '30 Juli 2026'}</h2>
              <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">{inputs.tempat || 'Palembang'}</p>
            </div>

            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-indigo-300 transition-all text-left cursor-pointer"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>Status Penyimpanan</span>
                {isActuallyOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </p>
              <h2 className="text-sm font-extrabold text-gray-900 truncate">{archives.length} Arsip Tersimpan</h2>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {isActuallyOffline ? 'Mode Offline Active' : 'Penyimpanan Lokal Ready'}
              </p>
            </button>
          </section>

          <ReportPreview
            inputs={inputs}
            outputs={outputs}
            setOutputs={setOutputs}
            setInputs={setInputs}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
          />
        </main>
      </div>

      {/* Offline Status Modal */}
      <OfflineStatusModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
        isForceOffline={isForceOffline}
        onToggleForceOffline={toggleForceOffline}
        archivesCount={archives.length}
      />

      {/* Spell Check Modal */}
      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        outputs={outputs}
        setOutputs={setOutputs}
        onShowToast={showToast}
      />

      {/* Token Manager Modal */}
      <TokenManagerModal
        isOpen={isTokenManagerOpen}
        onClose={() => setIsTokenManagerOpen(false)}
        onShowToast={showToast}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isActuallyOffline={isActuallyOffline}
        setIsOfflineModalOpen={setIsOfflineModalOpen}
        setIsTokenManagerOpen={setIsTokenManagerOpen}
        handleSaveGoogleSheet={handleSaveGoogleSheet}
        isSavingSheet={isSavingSheet}
        handleExportDocx={handleExportDocx}
        isExportingDocx={isExportingDocx}
        handleLogout={handleLogout}
        inputs={inputs}
        setInputs={setInputs}
        onShowToast={showToast}
        onOpenMatriksSkp={() => setIsMatriksSkpOpen(true)}
      />

      {/* Matriks SKP Bulanan Modal */}
      <MatriksSkpModal
        isOpen={isMatriksSkpOpen}
        onClose={() => setIsMatriksSkpOpen(false)}
        inputs={inputs}
        onShowToast={showToast}
      />

      {/* Archive Edit Modal */}
      {editingArchive && (
        <EditArchiveModal
          item={editingArchive}
          onClose={() => setEditingArchive(null)}
          onSave={saveArchiveEdit}
        />
      )}

      {/* Pustaka RHK & Template Modal */}
      <PustakaRhkModal
        isOpen={isPustakaOpen}
        onClose={() => setIsPustakaOpen(false)}
        onSelectTemplate={handleSelectPustakaTemplate}
        currentInputs={{
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }}
      />
    </div>
  );
}
