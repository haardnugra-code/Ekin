import React, { useState, useEffect, useCallback, ChangeEvent, Suspense } from 'react';
import { Menu, Printer, Loader2, Minimize2, FileDown } from 'lucide-react';
import { ReportInputs, ReportOutputs, ArchiveItem } from './types';
import { DEFAULT_DASAR_HUKUM, RHK_DATA } from './data/presets';
import { DEFAULT_KEMENSOS_LOGO } from './utils/kemensosLogo';
import { Sidebar } from './components/Sidebar';
import { ReportPreview } from './components/ReportPreview';
import { Toast } from './components/Toast';
import { saveToGoogleSheet, saveArchiveToGoogleSheet, saveMultipleArchivesToGoogleSheet, DEFAULT_SHEET_URL } from './utils/googleSheet';
import { generateDigitalSignatureQr } from './utils/qrGenerator';
import { saveAutoDraft, loadAutoDraft, clearAutoDraft } from './utils/draftDb';
import { clearActiveTokenSession } from './utils/tokenManager';
import { generateDynamicRecommendation } from './utils/recommendationGenerator';
import { buildSpecialReportFromProblem } from './utils/specialReportGenerator';

const LoginModal = React.lazy(() => import('./components/LoginModal').then((m) => ({ default: m.LoginModal })));
const EditArchiveModal = React.lazy(() => import('./components/EditArchiveModal').then((m) => ({ default: m.EditArchiveModal })));
const PustakaRhkModal = React.lazy(() => import('./components/PustakaRhkModal').then((m) => ({ default: m.PustakaRhkModal })));
const ReportCalendarModal = React.lazy(() => import('./components/ReportCalendarModal').then((m) => ({ default: m.ReportCalendarModal })));
const OfflineStatusModal = React.lazy(() => import('./components/OfflineStatusModal').then((m) => ({ default: m.OfflineStatusModal })));
const SpellCheckModal = React.lazy(() => import('./components/SpellCheckModal').then((m) => ({ default: m.SpellCheckModal })));
const TokenManagerModal = React.lazy(() => import('./components/TokenManagerModal').then((m) => ({ default: m.TokenManagerModal })));
const SettingsModal = React.lazy(() => import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal })));

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('peksos_logged_out') !== 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPustakaOpen, setIsPustakaOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [isTokenManagerOpen, setIsTokenManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  // Default Form Inputs (Sesuai Permensos RI Nomor 8 Tahun 2022 tentang Tata Naskah Dinas)
  const DEFAULT_INPUTS: ReportInputs = {
    rhk: "1",
    customTitle: "",
    dailyPreset: "",
    skenario: "0",
    judul: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
    permasalahan: "Siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi).",
    solusi: "Menerapkan pendekatan modifikasi perilaku (Behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (Ecological Perspective).",
    standarTnd: "permensos_8_2022",
    fontJudul: "Arial, sans-serif",
    sizeJudul: "12pt",
    fontIsi: "Arial, sans-serif",
    sizeIsi: "12pt",
    lineHeight: "1.5",
    paragraphSpacing: "0.5rem",
    marginTop: "2cm",
    marginBottom: "2.5cm",
    marginLeft: "3cm",
    marginRight: "2cm",
    paperSize: "A4",
    tempat: "Palembang",
    tanggal: "30 Juli 2026",
    tanggalPicker: "2026-07-30",
    nama: "M Ardian Nugraha",
    nip: "199202042026221001",
    nomorSurat: "B-104/SRT.31/PLM/07/2026",
    modeLaporanKhusus: true,
    tampilkanCoverPenelitian: true,
    gayaCoverPenelitian: "penelitian_resmi",
    subJudulCoverPenelitian: "LAPORAN KAJIAN INTERVENSI & PELAKSANAAN TUGAS PEKERJAAN SOSIAL",
    keteranganCoverPenelitian: "Disusun sebagai Dokumen Pertanggungjawaban Kinerja dan Kajian Praktik Pekerjaan Sosial Berbasis Bukti (Evidence-Based Social Work Practice)",
    aktifFiturJurnalIlmiah: true,
    namaJurnalIlmiah: "Jurnal Praktik Pekerjaan Sosial & Pengasuhan Terintegrasi — Vol. 4 No. 2 Tahun 2026",
    metodologiPenelitian: "Penelitian Tindakan Praktik Pekerjaan Sosial (Action Research in Social Work) & Single-Subject Design (A-B)",
    aktifFiturUpacara: false,
    aktifFiturKunjungan: false,
    sertakanDetailSuratTugas: false,
    aktifFiturPelatihan: false,
    nomorSuratTugas: "ST-088/SRT.31/PLM/08/2026",
    tanggalSuratTugas: "10 Agustus 2026",
    pemberiTugas: "Direktur Sekolah Rakyat Terintegrasi 31",
    jenisPenugasan: "pelatihan",
    modulPelatihan: "pencatatan_pelaporan",
    namaPelatihan: "Modul Pencatatan dan Pelaporan Kasus Peserta Didik",
    durasiPelatihan: "2 JP (2 x 45 Menit = 90 Menit)",
    metodePelatihan: "FGD (Focus Group Discussion) 8 Kelompok, Studi Kasus, dan Analisis 5W+1H",
    penyelenggaraPelatihan: "Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026",
    fasilitatorPelatihan: "Tim Fasilitator Pusdiklatbangprof Kemensos RI",
    rencanaAksiPelatihan: "Menerapkan Buku Log Temuan Harian dan Formulir Catatan Kasus di asrama serta koordinasi rutin bersama Satgas SR",
    jenisUpacara: "Upacara Bendera Rutin Hari Senin",
    peranWaliAsuhUpacara: "Pendamping dan Pengawas Barisan Peleton Siswa Asrama",
    lokasiUpacara: "Lapangan Utama Sekolah Rakyat Terintegrasi 31 Palembang",
    pembinaUpacara: "Kepala Sekolah / Direktur Sekolah Rakyat Terintegrasi 31 Palembang",
    amanatUpacara: "Penanaman Nilai Nasionalisme, Integritas, Kedisiplinan, dan Semangat Belajar Pelajar Sekolah Rakyat",
    jumlahPesertaUpacara: "Seluruh Siswa Asrama, Dewan Guru, dan Tenaga Kependidikan",
    catatanKedisiplinanUpacara: "Barisan tertib, khidmat, atribut seragam lengkap (topi, dasi, ikat pinggang, kaos kaki, sepatu hitam); 1 siswa pusing ringan langsung ditangani di posko P3K",
    // Variabel SKP: Kunjungan Orang Tua, Konsultasi Perkembangan & Kesehatan Anak (Peksos)
    subTopikKeluargaKesehatan: "kunjungan_ortu",
    namaOrangTuaWali: "Bapak Hendra Gunawan & Ibu Siti Aminah",
    hubunganKeluarga: "Orang Tua Kandung",
    waktuKunjungan: "Minggu, 09.30 - 11.45 WIB (Jam Besuk Resmi Asrama)",
    fokusKonsultasiPerkembangan: "Adaptasi sosial di asrama, kemandirian mencuci pakaian & merapikan kamar (ADL), serta kestabilan emosi siswa",
    catatanObservasiKeluarga: "Terlihat kelekatan positif antara orang tua dan anak; anak merasa senang dan termotivasi, namun sempat ada kekhawatiran orang tua terkait nafsu makan dan adaptasi belajar",
    kesepakatanPolaAsuh: "Penyelarasan pola asuh suportif tanpa kekerasan (authoritative parenting), pembatasan uang saku jajan berlebih, dan jadwal panggilan video rutin setiap hari Sabtu",
    keluhanKesehatanAnak: "Kondisi fisik anak terpantau bugar; sempat mengalami pusing ringan akibat cuaca terik namun telah pulih pasca istirahat dan hidrasi cukup",
    tindakanKesehatanAwal: "Pemeriksaan suhu tubuh di ruang UKS (36.6°C), edukasi minum air putih 2 liter/hari, serta pembiasaan cuci tangan pakai sabun",
    fasilitasKesehatanRujukan: "Ruang UKS Asrama & Klinik Pratama Sekolah Rakyat Terintegrasi 31",
    statusKondisiAnak: "Sehat, aktif, dan siap melanjutkan seluruh rutinitas bimbingan belajar dan asrama",
    metodeIntervensiPeksos: "Family Casework & Mediation dipadukan dengan Pendekatan Person-in-Environment (PIE)",
    penjelasanIntervensiPeksos: "Pekerja sosial / Wali asuh memfasilitasi dialog konstruktif antara anak dan orang tua untuk menyelaraskan ekspektasi perkembangan, meredakan kecemasan perpisahan (separation anxiety), serta menyepakati kontrak perilaku (Behavioral Contract) agar konsistensi nilai kedisiplinan dan kemandirian tetap terjaga baik di asrama maupun saat kepulangan ke rumah.",
    tahapanIntervensiPeksos: "1. Engagement & Rapport Building di ruang konsultasi asrama; 2. Eksplorasi kebutuhan dan kekhawatiran orang tua; 3. Pemaparan grafik perkembangan kemandirian anak (ADL); 4. Mediasi kesepakatan pola asuh kolaboratif.",
    logoSrc: DEFAULT_KEMENSOS_LOGO,
    logo2Src: DEFAULT_KEMENSOS_LOGO,
    showLogo2: true,
    ttdSrc: "",
    qrCodeSrc: "",
    foto1Src: "",
    foto2Src: "",
    foto1Caption: "Foto 1. Pelaksanaan Kegiatan",
    foto2Caption: "Foto 2. Kondisi Lapangan",
    tampilkanNomorHalaman: true,
    formatNomorHalaman: "- {n} -",
    kopInstansiUtama: "KEMENTERIAN SOSIAL REPUBLIK INDONESIA",
    kopEselon1: "SEKRETARIAT JENDERAL",
    kopEselon2: "PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI",
    kopUnitKerja: "SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG",
    kopAlamat: "Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com"
  };

  const initialSpecial = buildSpecialReportFromProblem(DEFAULT_INPUTS);

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
    saran: `Diperlukan monitoring lanjutan secara konsisten serta kolaborasi dengan pihak pendidik/sekolah untuk memastikan keberlanjutan perubahan perilaku peserta didik.`,
    rekomendasi: generateDynamicRecommendation({
      rhk: "1",
      judul: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
      permasalahan: "siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi)",
      solusi: "menerapkan pendekatan modifikasi perilaku (behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (ecological perspective)"
    }),
    penutup: "Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang agar dapat dipergunakan sebagaimana mestinya.",
    tempat: "Palembang",
    tanggal: "30 Juli 2026",
    nama: "M Ardian Nugraha",
    nip: "199202042026221001",
    khususAbstrak: initialSpecial.khususAbstrak,
    khususKataKunci: initialSpecial.khususKataKunci,
    khususKajianTeori: initialSpecial.khususKajianTeori,
    khususMetodologiIlmiah: initialSpecial.khususMetodologiIlmiah,
    khususPembahasanIlmiah: initialSpecial.khususPembahasanIlmiah,
    khususReferensi: initialSpecial.khususReferensi,
    khususLatarBelakang: initialSpecial.khususLatarBelakang,
    khususDasarPelaksanaan: initialSpecial.khususDasarPelaksanaan,
    khususTujuan: initialSpecial.khususTujuan,
    khususPelaksanaan: initialSpecial.khususPelaksanaan,
    khususHasil: initialSpecial.khususHasil,
    khususKendala: initialSpecial.khususKendala,
    khususTindakLanjut: initialSpecial.khususTindakLanjut,
    khususSimpulan: initialSpecial.khususSimpulan,
    khususSaran: initialSpecial.khususSaran,
    tabelKegiatan: initialSpecial.tabelKegiatan
  };

  const applyPermensos8Migration = (rawInputs: Partial<ReportInputs>): ReportInputs => {
    const merged: ReportInputs = { ...DEFAULT_INPUTS, ...rawInputs };
    if (!rawInputs.standarTnd) {
      merged.standarTnd = "permensos_8_2022";
      merged.fontJudul = "Arial, sans-serif";
      merged.sizeJudul = "12pt";
      merged.fontIsi = "Arial, sans-serif";
      merged.sizeIsi = "12pt";
      merged.marginTop = "2cm";
      merged.marginBottom = "2.5cm";
      merged.marginLeft = "3cm";
      merged.marginRight = "2cm";
      merged.paperSize = merged.paperSize || "A4";
    }
    if (rawInputs.tampilkanCoverPenelitian === undefined) {
      merged.tampilkanCoverPenelitian = true;
      merged.gayaCoverPenelitian = "penelitian_resmi";
      merged.aktifFiturJurnalIlmiah = true;
      merged.modeLaporanKhusus = true;
    }
    return merged;
  };

  // Form Inputs State (Restored from localStorage draft if available)
  const [inputs, setInputs] = useState<ReportInputs>(() => {
    try {
      const saved = localStorage.getItem('peksos_inputs_draft');
      if (saved) {
        return applyPermensos8Migration(JSON.parse(saved));
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
        setInputs((prev) => applyPermensos8Migration({ ...prev, ...draft.inputs }));
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

    // Switch mode ON/OFF untuk fitur khusus (diatur dari Menu Pengaturan)
    const isSuratTugasActive = Boolean(inputs.sertakanDetailSuratTugas);
    const isPelatihanActive = Boolean(inputs.aktifFiturPelatihan);
    const isUpacaraActive = Boolean(inputs.aktifFiturUpacara);
    const isKunjunganActive = Boolean(inputs.aktifFiturKunjungan);

    const isPelatihan = isPelatihanActive;
    const isPenugasanRhk = isSuratTugasActive || isPelatihanActive;

    const stNo = inputs.nomorSuratTugas?.trim() || 'ST-088/SRT.31/PLM/08/2026';
    const stTgl = inputs.tanggalSuratTugas?.trim() || inputs.tanggal || '10 Agustus 2026';
    const stPemberi = inputs.pemberiTugas?.trim() || 'Direktur / Pimpinan';

    const penyelenggara = inputs.penyelenggaraPelatihan?.trim() || 'Pusdiklatbangprof Kemensos RI';
    const fasilitator = inputs.fasilitatorPelatihan?.trim() || 'Tim Widyaiswara & Praktisi Pekerjaan Sosial Kemensos';
    const durasi = inputs.durasiPelatihan?.trim() || '2 JP (90 Menit)';
    const metode = inputs.metodePelatihan?.trim() || 'FGD, Roleplay, dan Simulasi Studi Kasus Asrama';
    const rencanaAksi = inputs.rencanaAksiPelatihan?.trim() || 'Penyusunan instrumen pendampingan siswa dan diseminasi kepada rekan sejawat';

    // Deteksi Kegiatan Upacara (Hanya aktif jika ON di Pengaturan)
    const isUpacara = isUpacaraActive;

    const jenisUpacara = inputs.jenisUpacara?.trim() || 'Upacara Bendera Rutin Hari Senin';
    const peranUpacara = inputs.peranWaliAsuhUpacara?.trim() || 'Pendamping dan Pengawas Barisan Peleton Siswa Asrama';
    const lokasiUpacara = inputs.lokasiUpacara?.trim() || 'Lapangan Utama Sekolah Rakyat Terintegrasi 31 Palembang';
    const pembinaUpacara = inputs.pembinaUpacara?.trim() || 'Kepala Sekolah / Direktur Sekolah Rakyat Terintegrasi 31 Palembang';
    const amanatUpacara = inputs.amanatUpacara?.trim() || 'Penanaman Nilai Nasionalisme, Integritas, Kedisiplinan, dan Semangat Belajar Siswa';
    const jumlahPeserta = inputs.jumlahPesertaUpacara?.trim() || 'Seluruh Siswa Asrama, Dewan Guru, dan Tenaga Kependidikan';
    const catatanUpacara = inputs.catatanKedisiplinanUpacara?.trim() || 'Barisan tertib, khidmat, serta atribut seragam lengkap (topi, dasi, ikat pinggang, dan sepatu hitam)';

    // Deteksi Kunjungan Orang Tua, Konsultasi Perkembangan, dan Kesehatan Anak (Hanya aktif jika ON di Pengaturan)
    const isKesehatanSubtopic =
      inputs.subTopikKeluargaKesehatan === 'kesehatan_anak' ||
      inputs.subTopikKeluargaKesehatan === 'kesehatan' ||
      inputs.dailyPreset === 'kesehatan_anak';

    const isKunjunganOrtu = isKunjunganActive && !isKesehatanSubtopic;
    const isKesehatanAnak = isKunjunganActive && isKesehatanSubtopic;

    const namaOrtu = inputs.namaOrangTuaWali?.trim() || 'Bapak Hendra Gunawan & Ibu Siti Aminah (Orang Tua / Wali)';
    const hubKeluarga = inputs.hubunganKeluarga?.trim() || 'Orang Tua Kandung';
    const waktuBesuk = inputs.waktuKunjungan?.trim() || 'Minggu, 09.30 - 11.45 WIB (Jam Besuk Resmi Asrama)';
    const fokusKonsul = inputs.fokusKonsultasiPerkembangan?.trim() || 'Adaptasi sosial di asrama, kemandirian mencuci pakaian & merapikan kamar (ADL), serta kestabilan emosi siswa';
    const obsKeluarga = inputs.catatanObservasiKeluarga?.trim() || 'Terjalin kelekatan emosional positif; anak merasa senang dan termotivasi, orang tua kooperatif mendukung tata tertib asrama';
    const kesepakatanAsuh = inputs.kesepakatanPolaAsuh?.trim() || 'Penyelarasan pola asuh suportif tanpa kekerasan (authoritative parenting), pembatasan uang saku jajan berlebih, dan jadwal panggilan video rutin';

    const keluhanSehat = inputs.keluhanKesehatanAnak?.trim() || 'Keluhan fisik ringan (demam/pusing/kelelahan psikosomatis)';
    const tindakanAwal = inputs.tindakanKesehatanAwal?.trim() || 'Pemeriksaan suhu tubuh di ruang UKS (36.6°C), edukasi minum air putih 2 liter/hari, serta pembiasaan cuci tangan pakai sabun';
    const faskesRujukan = inputs.fasilitasKesehatanRujukan?.trim() || 'Ruang UKS Asrama & Klinik Pratama / Puskesmas Sekolah Rakyat';
    const statusAnak = inputs.statusKondisiAnak?.trim() || 'Kondisi stabil, bugar, berangsur membaik, dan siap melanjutkan seluruh rutinitas bimbingan belajar dan asrama';

    const metodePeksos = inputs.metodeIntervensiPeksos?.trim() || 'Family Casework & Mediation dipadukan dengan Pendekatan Person-in-Environment (PIE)';
    const penjelasanPeksos = inputs.penjelasanIntervensiPeksos?.trim() || 'Pekerja sosial / Wali asuh memfasilitasi dialog konstruktif antara anak dan orang tua untuk menyelaraskan ekspektasi perkembangan, meredakan kecemasan perpisahan (separation anxiety), serta menyepakati kontrak perilaku (Behavioral Contract) agar konsistensi nilai kedisiplinan dan kemandirian tetap terjaga baik di asrama maupun saat kepulangan ke rumah.';
    const tahapanPeksos = inputs.tahapanIntervensiPeksos?.trim() || '1. Engagement & Rapport Building di ruang konsultasi asrama; 2. Eksplorasi kebutuhan dan kekhawatiran orang tua; 3. Pemaparan grafik perkembangan kemandirian anak (ADL); 4. Mediasi kesepakatan pola asuh kolaboratif.';

    if (isPelatihan) {
      setOutputs({
        judul: judul,
        umum: `Berdasarkan Surat Tugas dari ${stPemberi} Nomor: ${stNo} tanggal ${stTgl}, Wali Asuh Sekolah Rakyat Terintegrasi 31 Palembang telah mengikuti kegiatan pelatihan kedinasan yaitu ${jLower} yang diselenggarakan oleh ${penyelenggara} difasilitasi oleh ${fasilitator}. Kegiatan ini diselenggarakan dengan alokasi waktu ${durasi} guna meningkatkan kompetensi dan standar pelayanan di mana ${mLower}`,
        maksud: `Memberikan laporan pertanggungjawaban keikutsertaan dalam pelatihan kedinasan berdasarkan Surat Tugas Nomor: ${stNo} tentang ${jLower} yang diselenggarakan oleh ${penyelenggara}.`,
        tujuan: `Untuk meningkatkan pengetahuan teoritis, keterampilan teknis terapan, serta kesiapan mental pengasuh dalam mengimplementasikan ${jLower} demi terwujudnya lingkungan asrama yang aman, tertib, dan berorientasi pada kepentingan terbaik peserta didik Sekolah Rakyat.`,
        ruang: `Ruang lingkup kegiatan meliputi pembelajaran materi dengan alokasi waktu ${durasi} menggunakan metode ${metode}, pembahasan studi kasus asrama, pengisian lembar kerja evaluasi, serta perumusan rencana aksi tindak lanjut pasca-pelatihan.`,
        dasar: DEFAULT_DASAR_HUKUM,
        kegiatan: `Kegiatan pelatihan terlaksana dengan baik dan tertib menggunakan model ${metode} selama ${durasi}. Rangkaian kegiatan mencakup pembukaan dan orientasi alur belajar, eksplorasi materi oleh narasumber, pembahasan studi kasus asrama terarah, simulasi/roleplay instrumen, serta perumusan langkah operasional: ${sLower}.`,
        hasil: `Tercapainya peningkatan kompetensi dan penguasaan materi ${jLower} secara optimal. Peserta berhasil menyelesaikan seluruh penugasan lembar kerja, menguasai teknik intervensi yang dilatihkan, serta menyusun komitmen rencana aksi pengimbasan: ${rencanaAksi}.`,
        simpulan: `Pelaksanaan tugas kedinasan mengikuti pelatihan ${jLower} berdasarkan Surat Tugas ${stPemberi} Nomor: ${stNo} berjalan lancar, tuntas, dan menghasilkan dokumen pembelajaran yang siap diimplementasikan.`,
        saran: `Disarankan agar substansi hasil pelatihan ini segera disosialisasikan melalui forum pengimbasan (cascade training) kepada rekan Wali Asuh dan Wali Asrama serta diintegrasikan ke dalam Standar Operasional Prosedur (SOP) pengasuhan di Sekolah Rakyat Terintegrasi 31 Palembang.`,
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan pelaksanaan pelatihan ini disusun berdasarkan Surat Tugas Nomor: ${stNo} sebagai wujud akuntabilitas kinerja kepada ${stPemberi} agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    } else if (isPenugasanRhk) {
      setOutputs({
        judul: judul,
        umum: `Berdasarkan Surat Tugas dari ${stPemberi} Nomor: ${stNo} tanggal ${stTgl}, Wali Asuh / Pegawai Sekolah Rakyat Terintegrasi 31 Palembang telah melaksanakan penugasan kedinasan yaitu ${jLower}. Penugasan ini dilaksanakan merespon instruksi pimpinan di mana ${mLower} Pelaksanaan tugas ini dilakukan sebagai wujud akuntabilitas dan komitmen profesionalisme pelayanan kedinasan.`,
        maksud: `Memberikan laporan pertanggungjawaban pelaksanaan tugas kedinasan lainnya yang diperintahkan oleh atasan / pimpinan sesuai Surat Tugas Nomor: ${stNo} perihal ${jLower}.`,
        tujuan: `Untuk memastikan seluruh rangkaian penugasan ${jLower} dapat terlaksana secara tertib, tepat sasaran, serta menghasilkan dokumen rekapitulasi pelaksanaan tugas yang akuntabel bagi Direktur / Pimpinan.`,
        ruang: `Ruang lingkup kegiatan meliputi persiapan administrasi, pelaksanaan teknis kegiatan, serta pelaporan ${sLower} sesuai dengan petunjuk teknis pada Surat Tugas Nomor: ${stNo}.`,
        dasar: DEFAULT_DASAR_HUKUM,
        kegiatan: `Kegiatan dilaksanakan dengan mematuhi arahan Surat Tugas Nomor: ${stNo}, di mana pelaksana melakukan ${sLower} Seluruh tahapan pelaksanaan didokumentasikan dan dilaporkan secara berkala kepada atasan/pimpinan.`,
        hasil: `Tugas kedinasan ${jLower} telah diselesaikan dengan lancar dan sukses. Seluruh indikator penugasan dari ${stPemberi} terpenuhi secara optimal dan siap ditindaklanjuti.`,
        simpulan: `Pelaksanaan tugas kedinasan lainnya berdasarkan Surat Tugas ${stPemberi} Nomor: ${stNo} berjalan dengan tertib, aman, dan telah diselesaikan sesuai target pimpinan.`,
        saran: `Diperlukan pengarsipan dokumen hasil penugasan serta tindak lanjut integrasi hasil ${jLower} ke dalam standar operasional pengasuhan harian di Sekolah Rakyat.`,
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan pelaksanaan tugas kedinasan ini disusun berdasarkan Surat Tugas Nomor: ${stNo} sebagai bentuk pertanggungjawaban kepada ${stPemberi} agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    } else if (isUpacara) {
      setOutputs({
        judul: judul,
        umum: `Dalam pelaksanaan tugas sebagai Wali Asuh pada RHK 1 (Bimbingan dan Pengajaran Peserta Didik) di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan dan pembinaan kedisiplinan dilaksanakan melalui pendampingan ${jenisUpacara} yang berlangsung di ${lokasiUpacara} dengan Pembina Upacara ${pembinaUpacara}. Pendampingan ini dilaksanakan merespon dinamika perilaku peserta didik asrama di mana ${mLower} Pelaksanaan kegiatan upacara ini bertujuan membangun fondasi nasionalisme, patriotisme, kepatuhan tata tertib, serta kekhidmatan menghormati lambang negara bagi anak asuh di lingkungan asrama dan sekolah terintegrasi.`,
        maksud: `Memberikan laporan pertanggungjawaban pelaksanaan tugas bimbingan kedisiplinan, pengawalan barisan peleton siswa, inspeksi kerapian atribut seragam upacara, serta pendampingan peserta didik selama mengikuti ${jenisUpacara}.`,
        tujuan: `Untuk menumbuhkan rasa cinta tanah air, melatih ketahanan fisik dan konsentrasi baris-berbaris (PBB), membiasakan budaya disiplin waktu, menghormati Sang Merah Putih, serta memastikan ${sLower} terlaksana secara optimal tanpa kendala ketertiban.`,
        ruang: `Ruang lingkup kegiatan mencakup pengondisian siswa sejak persiapan pagi di asrama (pukul 06.30 WIB), inspeksi atribut seragam (topi upacara, dasi, ikat pinggang, kelayakan sepatu hitam dan kaos kaki), pengaturan formasi barisan peleton siswa, pengawalan sikap sempurna selama prosesi pengibaran bendera merah putih dan Mengheningkan Cipta, penyampaian amanat pembina upacara mengenai "${amanatUpacara}", serta penanganan mitigasi kesehatan lapangan: ${catatanUpacara}.`,
        dasar: DEFAULT_DASAR_HUKUM,
        kegiatan: `Kegiatan pendampingan dilaksanakan secara terstruktur oleh Wali Asuh dengan mengemban peran sebagai ${peranUpacara}, melalui tahapan: (1) Mengumpulkan dan mengabsen siswa di titik kumpul asrama sebelum menuju ${lokasiUpacara}; (2) Memeriksa kerapian seragam dan memastikan seluruh atribut terpasang lengkap; (3) Memandu barisan peleton memasuki lapangan upacara secara rapi dan teratur; (4) Melakukan intervensi pembinaan langsung: ${sLower}; (5) Mengawal ketenangan dan fokus siswa selama amanat pembina upacara; dan (6) Melakukan evaluasi barisan serta pencatatan ketertiban pasca-upacara.`,
        hasil: `Pelaksanaan ${jenisUpacara} berjalan dengan tertib, aman, lancar, dan penuh kekhidmatan. Seluruh peserta (${jumlahPeserta}) berpartisipasi aktif dengan sikap tegak dan tertib. Terjadi peningkatan kedisiplinan barisan yang nyata, kesadaran mematuhi tata upacara, serta pemahaman yang mendalam terhadap pesan amanat pembina upacara.`,
        simpulan: `Kegiatan bimbingan kedisiplinan dan pengajaran tata upacara bendera pada RHK 1 berhasil menguatkan karakter kebangsaan, kepatuhan tata tertib, dan kesolidan barisan peserta didik Sekolah Rakyat Terintegrasi 31 Palembang.`,
        saran: `Disarankan untuk mempertahankan pembiasaan disiplin atribut seragam sejak dari kamar asrama, menyelenggarakan latihan baris-berbaris (PBB) terstruktur saat jam kegiatan asrama sore, serta memastikan setiap siswa telah sarapan dan minum air putih yang cukup sebelum mengikuti upacara.`,
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan pelaksanaan bimbingan dan pengajaran kedisiplinan melalui kegiatan upacara bendera ini disusun sebagai bentuk akuntabilitas kinerja Wali Asuh pada RHK 1 di Sekolah Rakyat Terintegrasi 31 Palembang agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    } else if (isKunjunganOrtu) {
      setOutputs({
        judul: judul,
        umum: `Dalam pelaksanaan tugas sebagai Wali Asuh dan Pekerja Sosial di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan kemitraan keluarga dan konsultasi perkembangan anak dilaksanakan bertepatan dengan kunjungan orang tua/wali siswa, yaitu ${namaOrtu} (${hubKeluarga}) pada ${waktuBesuk}. Pertemuan tatap muka dan konsultasi perkembangan ini diselenggarakan merespon dinamika perilaku peserta didik di mana ${mLower} Pelaksanaan kegiatan ini menerapkan intervensi Pekerjaan Sosial ${metodePeksos} guna memfasilitasi komunikasi konstruktif, memantau kemajuan anak secara objektif, mengatasi kecemasan perpisahan (separation anxiety), serta menyelaraskan pola asuh antara keluarga dan asrama.`,
        maksud: `Memberikan laporan pertanggungjawaban pelaksanaan bimbingan kasus keluarga (Family Casework), penerimaan kunjungan orang tua/wali, serta konsultasi evaluasi perkembangan anak terkait ${fokusKonsul}.`,
        tujuan: `Untuk membangun kemitraan kolaboratif (Home-Dormitory Partnership) yang kokoh antara orang tua dan wali asuh, memantau penyesuaian sosial anak di asrama, meredakan kecemasan perpisahan, serta memastikan ${sLower} dapat terlaksana secara berkesinambungan.`,
        ruang: `Ruang lingkup kegiatan mencakup penerimaan kunjungan keluarga di ruang konsultasi asrama, asesmen dinamika relasi dan observasi kelekatan (${obsKeluarga}), evaluasi rekam perkembangan akademik dan kemandirian anak (ADL), pemaparan penjelasan intervensi peksos (${penjelasanPeksos}), serta perumusan kesepakatan bersama: ${kesepakatanAsuh}.`,
        dasar: DEFAULT_DASAR_HUKUM,
        kegiatan: `Kegiatan bimbingan dan konsultasi perkembangan dilaksanakan secara terstruktur melalui tahapan: (1) Engagement & Rapport Building: menyambut ${namaOrtu} dengan hangat dan ramah di ruang tamu asrama; (2) Eksplorasi & Asesmen: mendengarkan aspirasi keluarga dan mengonfirmasi catatan observasi anak; (3) Konsultasi & Mediasi: menerapkan intervensi Pekerjaan Sosial ${metodePeksos} dengan tahapan ${tahapanPeksos}; (4) Solusi Operasional: ${sLower}; dan (5) Perumusan Kontrak Perilaku: menyepakati komitmen pengasuhan suportif (${kesepakatanAsuh}) serta afirmasi motivasi sebelum orang tua berpamitan.`,
        hasil: `Terwujudnya kesepahaman yang harmonis antara orang tua dan pihak Sekolah Rakyat. ${namaOrtu} memberikan dukungan penuh terhadap tata tertib asrama, tingkat kecemasan anak menurun signifikan, dan anak menunjukkan motivasi yang lebih tinggi untuk berprestasi dan mandiri.`,
        simpulan: `Pelaksanaan kunjungan orang tua dan konsultasi perkembangan anak berjalan sukses, menghasilkan komitmen pengasuhan yang selaras (parenting alignment), serta memperkuat kesejahteraan psikososial peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang.`,
        saran: `Disarankan kepada orang tua untuk mempertahankan komunikasi positif melalui jadwal telepon asrama, menerapkan pola asuh suportif tanpa kekerasan saat anak libur di rumah, serta terus menjalin koordinasi terbuka bersama Wali Asuh.`,
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan pelaksanaan bimbingan kemitraan keluarga dan konsultasi perkembangan anak ini disusun sebagai bentuk akuntabilitas kinerja pengasuhan di Sekolah Rakyat Terintegrasi 31 Palembang agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    } else if (isKesehatanAnak) {
      setOutputs({
        judul: judul,
        umum: `Dalam pelaksanaan tugas sebagai Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan pendampingan dan pemantauan kesehatan peserta didik dilaksanakan merespon kondisi di mana ${mLower} Tindakan ini dilaksanakan berlandaskan pendekatan Pekerjaan Sosial ${metodePeksos} yang mengintegrasikan aspek biologis (kesehatan fisik), psikologis (stabilitas mental/ketenangan emosi), dan sosial (kebersihan lingkungan asrama dan dukungan teman sebaya) demi menjamin perlindungan dan keselamatan anak asuh.`,
        maksud: `Memberikan laporan pertanggungjawaban pelaksanaan pemantauan kesehatan harian, tindakan pertolongan pertama (P3K) di asrama, observasi kondisi fisik anak, serta koordinasi layanan medis rujukan.`,
        tujuan: `Untuk memastikan setiap peserta didik yang mengalami keluhan kesehatan mendapatkan penanganan cepat, tepat, dan manusiawi, mencegah penularan penyakit di asrama, serta memastikan ${sLower} terlaksana secara komprehensif.`,
        ruang: `Ruang lingkup kegiatan meliputi deteksi dini keluhan kesehatan (${keluhanSehat}), penanganan awal dan observasi di ruang UKS asrama (${tindakanAwal}), advokasi rujukan medis ke ${faskesRujukan}, pemantauan status pemulihan (${statusAnak}), penjelasan intervensi peksos (${penjelasanPeksos}), serta komunikasi transparan kepada orang tua/wali siswa.`,
        dasar: DEFAULT_DASAR_HUKUM,
        kegiatan: `Kegiatan penanganan kesehatan dilaksanakan melalui langkah-langkah: (1) Mengidentifikasi keluhan fisik anak dan memindahkan siswa ke ruang istirahat UKS yang tenang; (2) Melakukan pemeriksaan tanda vital awal (suhu tubuh, keluhan pusing/lemas) dan memberikan cairan hidrasi hangat; (3) Menerapkan pendekatan intervensi peksos: ${sLower}; (4) Berkoordinasi dengan petugas medis/Puskesmas untuk rekomendasi pengobatan lanjutan; (5) Memberikan pendampingan psikososial agar anak merasa tenang dan tidak cemas; dan (6) Menginformasikan kondisi terkini kepada orang tua dengan menenangkan.`,
        hasil: `Penanganan keluhan kesehatan anak terlaksana dengan baik, kondisi anak terpantau ${statusAnak}, keluhan fisik berangsur reda, dan anak merasa aman serta diperhatikan dengan penuh kasih sayang.`,
        simpulan: `Kegiatan pendampingan dan pemantauan kesehatan peserta didik berjalan optimal, memenuhi standar perlindungan anak asrama, dan mendukung pemulihan fisik maupun psikologis anak.`,
        saran: `Disarankan untuk mempertahankan pengawasan asupan nutrisi dan hidrasi harian, memperketat jadwal sanitasi kamar asrama, serta meningkatkan edukasi Pola Hidup Bersih dan Sehat (PHBS) bagi seluruh peserta didik Sekolah Rakyat.`,
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan pelaksanaan pemantauan dan pendampingan kesehatan peserta didik ini disusun sebagai bentuk pertanggungjawaban pelayanan pengasuhan di Sekolah Rakyat Terintegrasi 31 Palembang agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    } else {
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
        rekomendasi: generateDynamicRecommendation({
          rhk: inputs.rhk,
          judul: inputs.judul,
          permasalahan: inputs.permasalahan,
          solusi: inputs.solusi
        }),
        penutup: `Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang dalam rangka ${jLower} agar dapat dipergunakan sebagaimana mestinya.`,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      });
    }

    // Sync Laporan Khusus & Jurnal Ilmiah fields & Tabel Kegiatan for all RHK
    const specialGen = buildSpecialReportFromProblem(inputs);
    setOutputs((prev) => ({
      ...prev,
      khususAbstrak: specialGen.khususAbstrak,
      khususKataKunci: specialGen.khususKataKunci,
      khususKajianTeori: specialGen.khususKajianTeori,
      khususMetodologiIlmiah: specialGen.khususMetodologiIlmiah,
      khususPembahasanIlmiah: specialGen.khususPembahasanIlmiah,
      khususReferensi: specialGen.khususReferensi,
      khususLatarBelakang: specialGen.khususLatarBelakang,
      khususDasarPelaksanaan: specialGen.khususDasarPelaksanaan,
      khususTujuan: specialGen.khususTujuan,
      khususPelaksanaan: specialGen.khususPelaksanaan,
      khususHasil: specialGen.khususHasil,
      khususKendala: specialGen.khususKendala,
      khususTindakLanjut: specialGen.khususTindakLanjut,
      khususSimpulan: specialGen.khususSimpulan,
      khususSaran: specialGen.khususSaran,
      tabelKegiatan: specialGen.tabelKegiatan
    }));

    showToast("Laporan (Cover Penelitian, Daftar Isi & Kajian Jurnal Ilmiah) berhasil disusun!", "success");
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
          solusi: inputs.solusi,
          tanggal: inputs.tanggal
        })
      });

      if (!res.ok) {
        throw new Error("Respon server gagal");
      }

      const data = await res.json();
      const localSpecial = buildSpecialReportFromProblem(inputs);
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
        khususAbstrak: data.khususAbstrak || localSpecial.khususAbstrak,
        khususKataKunci: data.khususKataKunci || localSpecial.khususKataKunci,
        khususKajianTeori: data.khususKajianTeori || localSpecial.khususKajianTeori,
        khususMetodologiIlmiah: data.khususMetodologiIlmiah || localSpecial.khususMetodologiIlmiah,
        khususPembahasanIlmiah: data.khususPembahasanIlmiah || localSpecial.khususPembahasanIlmiah,
        khususReferensi: localSpecial.khususReferensi,
        khususLatarBelakang: data.khususLatarBelakang || localSpecial.khususLatarBelakang,
        khususDasarPelaksanaan: localSpecial.khususDasarPelaksanaan,
        khususTujuan: data.khususTujuan || localSpecial.khususTujuan,
        khususPelaksanaan: data.khususPelaksanaan || localSpecial.khususPelaksanaan,
        khususHasil: data.khususHasil || localSpecial.khususHasil,
        khususKendala: data.khususKendala || localSpecial.khususKendala,
        khususTindakLanjut: data.khususTindakLanjut || localSpecial.khususTindakLanjut,
        khususSimpulan: data.khususSimpulan || localSpecial.khususSimpulan,
        khususSaran: data.khususSaran || localSpecial.khususSaran,
        tabelKegiatan:
          Array.isArray(data.tabelKegiatan) && data.tabelKegiatan.length > 0
            ? data.tabelKegiatan
            : localSpecial.tabelKegiatan,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      }));

      showToast("✨ AI berhasil menyusun narasi Wali Asuh & Kajian Jurnal Ilmiah profesional!", "success");
    } catch (err: any) {
      console.error(err);
      // Fallback local text compilation
      generateReportText();
    } finally {
      setIsAiGenerating(false);
    }
  }, [inputs, showToast, generateReportText, isActuallyOffline]);

  // Fitur Tulis Masalah -> AI Buat Laporan Sesuai Masalah & Penyelesaian (Seluruh RHK)
  const generateFromProblem = useCallback(
    async (problemText: string, enableSpecialMode?: boolean) => {
      const rawMasalah = (problemText || inputs.permasalahan || "").trim();
      if (!rawMasalah) {
        showToast("Harap tulis deskripsi masalah terlebih dahulu!", "error");
        return;
      }

      // 1. Build instant high-precision baseline (diagnoses RHK 1-6, Peksos solution, A-G, and table)
      const localSpecial = buildSpecialReportFromProblem(inputs, rawMasalah);

      setInputs((prev) => ({
        ...prev,
        rhk: localSpecial.recommendedRhk,
        skenario: "",
        judul: localSpecial.judul,
        permasalahan: localSpecial.permasalahan,
        solusi: localSpecial.solusi,
        modeLaporanKhusus:
          enableSpecialMode !== undefined ? enableSpecialMode : prev.modeLaporanKhusus
      }));

      setOutputs((prev) => ({
        ...prev,
        judul: localSpecial.judul,
        umum: localSpecial.umum,
        maksud: localSpecial.maksud,
        tujuan: localSpecial.tujuan,
        ruang: localSpecial.ruang,
        dasar: prev.dasar || DEFAULT_DASAR_HUKUM,
        kegiatan: localSpecial.kegiatan,
        hasil: localSpecial.hasil,
        simpulan: localSpecial.simpulan,
        saran: localSpecial.saran,
        rekomendasi: localSpecial.rekomendasi,
        penutup: localSpecial.penutup,
        khususAbstrak: localSpecial.khususAbstrak,
        khususKataKunci: localSpecial.khususKataKunci,
        khususKajianTeori: localSpecial.khususKajianTeori,
        khususMetodologiIlmiah: localSpecial.khususMetodologiIlmiah,
        khususPembahasanIlmiah: localSpecial.khususPembahasanIlmiah,
        khususReferensi: localSpecial.khususReferensi,
        khususLatarBelakang: localSpecial.khususLatarBelakang,
        khususDasarPelaksanaan: localSpecial.khususDasarPelaksanaan,
        khususTujuan: localSpecial.khususTujuan,
        khususPelaksanaan: localSpecial.khususPelaksanaan,
        khususHasil: localSpecial.khususHasil,
        khususKendala: localSpecial.khususKendala,
        khususTindakLanjut: localSpecial.khususTindakLanjut,
        khususSimpulan: localSpecial.khususSimpulan,
        khususSaran: localSpecial.khususSaran,
        tabelKegiatan: localSpecial.tabelKegiatan,
        tempat: inputs.tempat,
        tanggal: inputs.tanggal,
        nama: inputs.nama,
        nip: inputs.nip
      }));

      if (isActuallyOffline) {
        showToast(
          `✨ Laporan RHK ${localSpecial.recommendedRhk} berhasil disusun otomatis dari masalah (Mode Lokal)!`,
          "success"
        );
        return;
      }

      setIsAiGenerating(true);
      try {
        const res = await fetch("/api/generate-from-problem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            masalah: rawMasalah,
            rhk: localSpecial.recommendedRhk,
            tanggal: inputs.tanggal,
            tempat: inputs.tempat
          })
        });

        if (!res.ok) {
          throw new Error("Server AI fallback");
        }

        const data = await res.json();
        const resolvedRhk = String(data.rhk || localSpecial.recommendedRhk);
        const resolvedJudul = data.judul || localSpecial.judul;
        const resolvedSolusi = data.solusi || localSpecial.solusi;

        setInputs((prev) => ({
          ...prev,
          rhk: resolvedRhk,
          judul: resolvedJudul,
          permasalahan: data.permasalahan || localSpecial.permasalahan,
          solusi: resolvedSolusi,
          modeLaporanKhusus:
            enableSpecialMode !== undefined ? enableSpecialMode : prev.modeLaporanKhusus
        }));

        setOutputs((prev) => ({
          ...prev,
          judul: resolvedJudul,
          umum: data.umum || localSpecial.umum,
          maksud: data.maksud || localSpecial.maksud,
          tujuan: data.tujuan || localSpecial.tujuan,
          ruang: data.ruang || localSpecial.ruang,
          kegiatan: data.kegiatan || localSpecial.kegiatan,
          hasil: data.hasil || localSpecial.hasil,
          simpulan: data.simpulan || localSpecial.simpulan,
          saran: data.saran || localSpecial.saran,
          rekomendasi: data.rekomendasi || localSpecial.rekomendasi,
          penutup: data.penutup || localSpecial.penutup,
          khususAbstrak: data.khususAbstrak || localSpecial.khususAbstrak,
          khususKataKunci: data.khususKataKunci || localSpecial.khususKataKunci,
          khususKajianTeori: data.khususKajianTeori || localSpecial.khususKajianTeori,
          khususMetodologiIlmiah: data.khususMetodologiIlmiah || localSpecial.khususMetodologiIlmiah,
          khususPembahasanIlmiah: data.khususPembahasanIlmiah || localSpecial.khususPembahasanIlmiah,
          khususReferensi: localSpecial.khususReferensi,
          khususLatarBelakang: data.khususLatarBelakang || localSpecial.khususLatarBelakang,
          khususDasarPelaksanaan: localSpecial.khususDasarPelaksanaan,
          khususTujuan: data.khususTujuan || localSpecial.khususTujuan,
          khususPelaksanaan: data.khususPelaksanaan || localSpecial.khususPelaksanaan,
          khususHasil: data.khususHasil || localSpecial.khususHasil,
          khususKendala: data.khususKendala || localSpecial.khususKendala,
          khususTindakLanjut: data.khususTindakLanjut || localSpecial.khususTindakLanjut,
          khususSimpulan: data.khususSimpulan || localSpecial.khususSimpulan,
          khususSaran: data.khususSaran || localSpecial.khususSaran,
          tabelKegiatan:
            Array.isArray(data.tabelKegiatan) && data.tabelKegiatan.length > 0
              ? data.tabelKegiatan
              : localSpecial.tabelKegiatan,
          tempat: inputs.tempat,
          tanggal: inputs.tanggal,
          nama: inputs.nama,
          nip: inputs.nip
        }));

        showToast(
          `✨ AI berhasil membuat laporan RHK ${resolvedRhk} lengkap sesuai masalah & penyelesaian!`,
          "success"
        );
      } catch {
        showToast(
          `✨ Laporan RHK ${localSpecial.recommendedRhk} berhasil disusun otomatis sesuai masalah & penyelesaian!`,
          "success"
        );
      } finally {
        setIsAiGenerating(false);
      }
    },
    [inputs, isActuallyOffline, showToast]
  );

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

    const fallbackSpecial = buildSpecialReportFromProblem(item, item.permasalahan);

    setInputs((prev) => ({
      ...prev,
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
      modeLaporanKhusus: Boolean(item.modeLaporanKhusus),
      logoSrc: item.logoSrc || prev.logoSrc || "",
      ttdSrc: item.ttdSrc || "",
      foto1Src: item.foto1Src || "",
      foto2Src: item.foto2Src || "",
      foto1Caption: item.foto1Caption || "Foto 1. Pelaksanaan Kegiatan",
      foto2Caption: item.foto2Caption || "Foto 2. Kondisi Lapangan",
      tampilkanNomorHalaman: item.tampilkanNomorHalaman !== undefined ? item.tampilkanNomorHalaman : true,
      formatNomorHalaman: item.formatNomorHalaman || "- {n} -"
    }));

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
      nip: item.nip || "",
      khususLatarBelakang: item.khususLatarBelakang || fallbackSpecial.khususLatarBelakang,
      khususDasarPelaksanaan: item.khususDasarPelaksanaan || fallbackSpecial.khususDasarPelaksanaan,
      khususTujuan: item.khususTujuan || fallbackSpecial.khususTujuan,
      khususPelaksanaan: item.khususPelaksanaan || fallbackSpecial.khususPelaksanaan,
      khususHasil: item.khususHasil || fallbackSpecial.khususHasil,
      khususKendala: item.khususKendala || fallbackSpecial.khususKendala,
      khususTindakLanjut: item.khususTindakLanjut || fallbackSpecial.khususTindakLanjut,
      khususSimpulan: item.khususSimpulan || fallbackSpecial.khususSimpulan,
      khususSaran: item.khususSaran || fallbackSpecial.khususSaran,
      tabelKegiatan:
        Array.isArray(item.tabelKegiatan) && item.tabelKegiatan.length > 0
          ? item.tabelKegiatan
          : fallbackSpecial.tabelKegiatan
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

  const getPdfFileName = useCallback(() => {
    // Bersihkan Nama Pegawai
    const cleanNama = (inputs.nama || 'M_Ardian_Nugraha')
      .trim()
      .replace(/[,.]/g, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');

    // Tanggal & Bulan
    let rawTanggal = (inputs.tanggal || '').trim();
    if (!rawTanggal && inputs.tanggalPicker) {
      const d = new Date(inputs.tanggalPicker);
      if (!isNaN(d.getTime())) {
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        rawTanggal = `${d.getDate()}_${months[d.getMonth()]}_${d.getFullYear()}`;
      }
    }
    if (!rawTanggal) {
      rawTanggal = '30_Juli_2026';
    }
    const cleanTanggalBulan = rawTanggal
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    // Nama SKP / RHK
    const selectedRhkObj = RHK_DATA[inputs.rhk];
    const rawNamaSkp = inputs.customTitle || selectedRhkObj?.judul || inputs.judul || outputs.judul || `SKP_RHK_${inputs.rhk || '1'}`;
    const cleanNamaSkp = rawNamaSkp
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80);

    // Format file PDF: [Nama]_[Tanggal_Bulan]_[Nama_SKP]
    return `${cleanNama}_${cleanTanggalBulan}_${cleanNamaSkp}`;
  }, [inputs.nama, inputs.tanggal, inputs.tanggalPicker, inputs.rhk, inputs.customTitle, inputs.judul, outputs.judul]);

  const handlePrint = useCallback(() => {
    const originalTitle = document.title;
    const pdfFileName = getPdfFileName();
    document.title = pdfFileName;

    window.print();

    // Kembalikan judul dokumen asli setelah dialog cetak dipanggil
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, [getPdfFileName]);

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
      sessionStorage.setItem('peksos_logged_out', 'true');
      clearActiveTokenSession();
      setIsLoggedIn(false);
      showToast('Berhasil keluar dari akun.', 'info');
    }
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Login Modal Overlay if logged out */}
      {!isLoggedIn && (
        <Suspense fallback={null}>
          <LoginModal
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              sessionStorage.removeItem('peksos_logged_out');
              sessionStorage.setItem('isLoggedIn', 'true');
            }}
            showToast={showToast}
          />
        </Suspense>
      )}

      {/* Floating Exit Focus Mode Button */}
      {isFocusMode && (
        <div className="fixed top-4 right-6 z-50 print:hidden">
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Keluar Mode Fokus</span>
          </button>
        </div>
      )}

      {/* Top Bar Contract: 3 Zones (Brand | Nav Links | Primary Actions) */}
      <header
        id="topbar"
        className={`h-14 px-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-8 shrink-0 z-30 print:hidden ${
          isFocusMode ? 'hidden' : ''
        }`}
      >
        {/* Zone 1: Sidebar Toggle + Single-Line Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 bg-white flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title={isSidebarOpen ? 'Sembunyikan Panel Input' : 'Tampilkan Panel Input'}
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-semibold hidden sm:inline">
              {isSidebarOpen ? 'Tutup Panel' : 'Buka Panel'}
            </span>
          </button>
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            e-Kinerja Wali Asuh
          </span>
        </div>

        {/* Zone 2: Clean Single-Line Text Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setIsPustakaOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Pustaka RHK
          </button>
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Kalender Laporan
          </button>
          <button
            type="button"
            onClick={() => setIsSpellCheckOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Cek Ejaan KBBI
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Pengaturan & Fitur ON/OFF
          </button>
        </nav>

        {/* Zone 3: Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="lg:hidden px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Pengaturan
          </button>
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Unduh Dokumen Microsoft Word (.docx)"
          >
            {isExportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="hidden sm:inline">Unduh Word</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 z-30 md:hidden"
          />
        )}

        {/* Sidebar Inputs */}
        <Sidebar
          inputs={inputs}
          setInputs={setInputs}
          outputs={outputs}
          setOutputs={setOutputs}
          onGenerateReport={generateReportText}
          onGenerateAI={generateAI}
          onGenerateFromProblem={generateFromProblem}
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
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          lastAutosaveTime={lastAutosaveTime}
          onManualDraftSave={handleManualDraftSave}
          onResetDraft={handleResetDraft}
          onLogout={handleLogout}
          isOpen={isFocusMode ? false : isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          showToast={showToast}
        />

        {/* Main Document Preview Container */}
        <main
          id="preview-container"
          className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100/70 p-4 md:p-6 w-full"
        >
          {/* Compact Unboxed Status Strip above Document */}
          {!isFocusMode && (
            <div className="max-w-[210mm] mx-auto mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 print:hidden px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800">
                  RHK {inputs.rhk === 'custom' ? 'Custom' : inputs.rhk}
                </span>
                <span aria-hidden="true">·</span>
                <span>{inputs.tempat || 'Palembang'}, {inputs.tanggal || '30 Juli 2026'}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{inputs.nama || 'M Ardian Nugraha'}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(true)}
                  className="hover:text-slate-900 underline-offset-2 hover:underline cursor-pointer"
                >
                  {isActuallyOffline ? 'Mode Offline' : 'Mode Online'}
                </button>
                <span aria-hidden="true">·</span>
                <span>{archives.length} arsip</span>
              </div>
            </div>
          )}

          <ReportPreview
            inputs={inputs}
            outputs={outputs}
            setOutputs={setOutputs}
            setInputs={setInputs}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </main>
      </div>

      {/* Lazy-Loaded Modals (Only mounted when open) */}
      <Suspense fallback={null}>
        {isOfflineModalOpen && (
          <OfflineStatusModal
            isOpen={isOfflineModalOpen}
            onClose={() => setIsOfflineModalOpen(false)}
            isOnline={isOnline}
            isForceOffline={isForceOffline}
            onToggleForceOffline={toggleForceOffline}
            archivesCount={archives.length}
          />
        )}

        {isSpellCheckOpen && (
          <SpellCheckModal
            isOpen={isSpellCheckOpen}
            onClose={() => setIsSpellCheckOpen(false)}
            outputs={outputs}
            setOutputs={setOutputs}
            onShowToast={showToast}
          />
        )}

        {isTokenManagerOpen && (
          <TokenManagerModal
            isOpen={isTokenManagerOpen}
            onClose={() => setIsTokenManagerOpen(false)}
            onShowToast={showToast}
          />
        )}

        {isSettingsOpen && (
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
            onGenerateReport={generateReportText}
            onShowToast={showToast}
          />
        )}

        {editingArchive && (
          <EditArchiveModal
            item={editingArchive}
            onClose={() => setEditingArchive(null)}
            onSave={saveArchiveEdit}
          />
        )}

        {isPustakaOpen && (
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
        )}

        {isCalendarOpen && (
          <ReportCalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            archives={archives}
            inputs={inputs}
            setInputs={setInputs}
            setOutputs={setOutputs}
            onSelectArchive={(archive) => loadArchive(archive.id)}
            showToast={showToast}
          />
        )}
      </Suspense>
    </div>
  );
}
