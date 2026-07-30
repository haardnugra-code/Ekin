import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { ReportInputs, ArchiveItem } from '../types';
import { RHK_DATA, DAILY_PRESETS } from '../data/presets';

interface SidebarProps {
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  onGenerateReport: () => void;
  onGenerateAI: () => void;
  isAiGenerating: boolean;
  archives: ArchiveItem[];
  onSaveToArchive: () => void;
  onLoadArchive: (id: number) => void;
  onEditArchive: (id: number) => void;
  onDeleteArchive: (id: number) => void;
  onPrint: () => void;
  onExportDocx?: () => void;
  isExportingDocx?: boolean;
  onSaveGoogleSheet?: () => void;
  isSavingSheet?: boolean;
  sheetUrl?: string;
  setSheetUrl?: (url: string) => void;
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
  onLoadArchive,
  onEditArchive,
  onDeleteArchive,
  onPrint,
  onExportDocx,
  isExportingDocx,
  onSaveGoogleSheet,
  isSavingSheet,
  sheetUrl,
  setSheetUrl,
  isOpen
}) => {
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
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
            1. Informasi & Custom RHK
          </h2>

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

        {/* Section 2: Data Penandatangan */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">2. Data Penandatangan</h2>
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
              <label className="block text-[11px] font-semibold text-gray-700">Logo Kop Instansi</label>
              {inputs.logoSrc && (
                <button
                  onClick={() => setInputs((prev) => ({ ...prev, logoSrc: '' }))}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('logoSrc', e)}
              className="w-full text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
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

        {/* Section 4: Arsip Laporan */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">4. Arsip Laporan</h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {archives.length} Arsip
            </span>
          </div>
          <button
            onClick={onSaveToArchive}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" /> Simpan Laporan Ini ke Arsip Lokal
          </button>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {archives.length === 0 ? (
              <div className="text-[11px] text-gray-400 italic text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                Belum ada laporan tersimpan.
              </div>
            ) : (
              archives.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 transition-all text-xs"
                >
                  <div className="font-bold text-gray-900 truncate mb-0.5" title={item.judul}>
                    {item.judul || 'Laporan tanpa judul'}
                  </div>
                  <div className="text-gray-500 text-[10px] flex justify-between mb-2">
                    <span className="truncate max-w-[110px] flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.nama}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-gray-200/80">
                    <button
                      onClick={() => onEditArchive(item.id)}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      title="Edit Arsip Ini"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => onLoadArchive(item.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      title="Muat ke Dokumen Utama"
                    >
                      <FolderInput className="w-3 h-3" /> Muat
                    </button>
                    <button
                      onClick={() => {
                        onLoadArchive(item.id);
                        setTimeout(() => onPrint(), 300);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      title="Cetak Langsung"
                    >
                      <Printer className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteArchive(item.id)}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-1 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      title="Hapus Arsip"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
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
