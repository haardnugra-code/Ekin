import { useState, useEffect, useCallback } from 'react';
import { Menu, Printer, FileDown, Loader2, CloudUpload } from 'lucide-react';
import { ReportInputs, ReportOutputs, ArchiveItem } from './types';
import { DEFAULT_DASAR_HUKUM } from './data/presets';
import { Sidebar } from './components/Sidebar';
import { ReportPreview } from './components/ReportPreview';
import { LoginModal } from './components/LoginModal';
import { EditArchiveModal } from './components/EditArchiveModal';
import { Toast } from './components/Toast';
import { saveToGoogleSheet, DEFAULT_SHEET_URL } from './utils/googleSheet';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Form Inputs State
  const [inputs, setInputs] = useState<ReportInputs>({
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
    logoSrc: "",
    ttdSrc: "",
    foto1Src: "",
    foto2Src: "",
    foto1Caption: "Foto 1. Pelaksanaan Kegiatan",
    foto2Caption: "Foto 2. Kondisi Lapangan",
    tampilkanNomorHalaman: true,
    formatNomorHalaman: "- {n} -"
  });

  // Report Text Outputs State
  const [outputs, setOutputs] = useState<ReportOutputs>({
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
  });

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
  }, [inputs, showToast, generateReportText]);

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
    window.print();
  }, []);

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
  }, [inputs, outputs, sheetUrl, showToast]);

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tighter text-blue-600">e-KINERJA <span className="text-gray-900 font-light italic">WALI ASUH</span></span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
              Sekolah Rakyat 31 Palembang
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2.5 mr-1">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">{inputs.nama || "M Ardian Nugraha"}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Wali Asuh / Peksos</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shadow-2xs">
              {inputs.nama ? inputs.nama.split(' ').map((n) => n[0]).join('').slice(0, 2) : "MN"}
            </div>
          </div>

          <button
            onClick={handleSaveGoogleSheet}
            disabled={isSavingSheet}
            className="bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Simpan data laporan ini langsung ke Google Sheet"
          >
            {isSavingSheet ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="hidden sm:inline">Menyimpan Sheet...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">Simpan ke Google Sheet</span>
                <span className="sm:hidden">Sheet</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="bg-blue-700 hover:bg-blue-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Unduh Laporan sebagai Dokumen Microsoft Word (.docx)"
          >
            {isExportingDocx ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="hidden sm:inline">Menyusun .docx...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-blue-100" />
                <span>Unduh Word (.docx)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Inputs */}
        <Sidebar
          inputs={inputs}
          setInputs={setInputs}
          onGenerateReport={generateReportText}
          onGenerateAI={generateAI}
          isAiGenerating={isAiGenerating}
          archives={archives}
          onSaveToArchive={saveToArchive}
          onLoadArchive={loadArchive}
          onEditArchive={openEditArchive}
          onDeleteArchive={deleteArchive}
          onPrint={handlePrint}
          onExportDocx={handleExportDocx}
          isExportingDocx={isExportingDocx}
          onSaveGoogleSheet={handleSaveGoogleSheet}
          isSavingSheet={isSavingSheet}
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          isOpen={isSidebarOpen}
        />

        {/* Main Document Preview Container */}
        <main id="preview-container" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8 w-full">
          {/* Status KPI Cards Header - Clean Minimalism */}
          <section className="max-w-[210mm] mx-auto mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
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

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Arsip</p>
              <h2 className="text-sm font-extrabold text-gray-900">{archives.length} Dokumen</h2>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Tersimpan lokal</p>
            </div>
          </section>

          <ReportPreview
            inputs={inputs}
            outputs={outputs}
            setOutputs={setOutputs}
            setInputs={setInputs}
          />
        </main>
      </div>

      {/* Archive Edit Modal */}
      {editingArchive && (
        <EditArchiveModal
          item={editingArchive}
          onClose={() => setEditingArchive(null)}
          onSave={saveArchiveEdit}
        />
      )}
    </div>
  );
}
