import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Edit3,
  Save,
  CheckCircle2,
  Table,
  UserCheck,
  Calendar,
  Building,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { MatriksSkpConfig, ReportInputs } from '../types';

export const DEFAULT_MATRIKS_SKP: MatriksSkpConfig = {
  periode: "Juli 2026",
  namaAtasan: "Dra. Hj. Fitriani, M.Si",
  nipAtasan: "19750812 200003 2 001",
  jabatanAtasan: "Kepala Sekolah Rakyat Terintegrasi 31 Palembang / Pejabat Penilai Kinerja",
  pangkatAtasan: "Pembina Utama Muda / IV/c",
  jabatanPegawai: "Penata Layanan Operasional / Wali Asuh",
  pangkatPegawai: "Penata Muda / III/a",
  unitKerja: "Sekolah Rakyat Terintegrasi 31 Palembang - Kemensos RI",
  lokasiTtd: "Palembang",
  tanggalTtd: "31 Juli 2026",
  items: [
    {
      id: "rhk-1",
      rhkAtasan: "Terwujudnya peningkatan kualitas bimbingan, pengasuhan, dan pelayanan sosial bagi peserta didik Sekolah Rakyat",
      rhkPegawai: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
      ikiKuantitas: "Jumlah Laporan Bimbingan dan Pengajaran Siswa yang Disusun",
      targetKuantitas: "20 Laporan LHK",
      realisasiKuantitas: "20 Laporan LHK",
      ikiKualitas: "Persentase Kesesuaian dan Keberhasilan Intervensi Pembimbingan",
      targetKualitas: "90 - 100 %",
      realisasiKualitas: "98 %",
      ikiWaktu: "Ketepatan Waktu Penyusunan Laporan Kegiatan",
      targetWaktu: "1 Bulan",
      realisasiWaktu: "1 Bulan",
      capaian: "Sesuai Ekspektasi"
    },
    {
      id: "rhk-2",
      rhkAtasan: "Terwujudnya pembentukan karakter mandiri dan budaya hidup bersih sehat bagi siswa asrama",
      rhkPegawai: "KEMANDIRIAN PESERTA DIDIK",
      ikiKuantitas: "Jumlah Laporan Pendampingan Kemandirian dan Perawatan Diri Siswa",
      targetKuantitas: "15 Laporan LHK",
      realisasiKuantitas: "15 Laporan LHK",
      ikiKualitas: "Tingkat Peningkatan Kemandirian dan Kedisiplinan Perilaku Siswa",
      targetKualitas: "85 - 100 %",
      realisasiKualitas: "95 %",
      ikiWaktu: "Ketepatan Waktu Pelaksanaan Pendampingan Harian",
      targetWaktu: "1 Bulan",
      realisasiWaktu: "1 Bulan",
      capaian: "Sesuai Ekspektasi"
    },
    {
      id: "rhk-3",
      rhkAtasan: "Terwujudnya ketertiban, keharmonisan, dan etika bersosialisasi di lingkungan asrama Sekolah Rakyat",
      rhkPegawai: "BIMBINGAN DAN PEMBINAAN PESERTA DIDIK DALAM BERBAGAI ASPEK KEHIDUPAN",
      ikiKuantitas: "Jumlah Kegiatan Pembinaan Etika dan Interaksi Sosial Asrama",
      targetKuantitas: "10 Laporan LHK",
      realisasiKuantitas: "10 Laporan LHK",
      ikiKualitas: "Persentase Penurunan Konflik dan Pelanggaran Tata Tertib Siswa",
      targetKualitas: "90 - 100 %",
      realisasiKualitas: "96 %",
      ikiWaktu: "Ketepatan Waktu Pembinaan Berkala",
      targetWaktu: "1 Bulan",
      realisasiWaktu: "1 Bulan",
      capaian: "Sesuai Ekspektasi"
    },
    {
      id: "rhk-4",
      rhkAtasan: "Terwujudnya pemenuhan bimbingan keagamaan, mental spiritual, dan stabilitas emosi siswa",
      rhkPegawai: "BIMBINGAN SPIRITUAL DAN EMOSIONAL",
      ikiKuantitas: "Jumlah Kegiatan Pembinaan Spiritual, Ibadah, dan Regulasi Emosi",
      targetKuantitas: "15 Laporan LHK",
      realisasiKuantitas: "15 Laporan LHK",
      ikiKualitas: "Tingkat Kedisiplinan Ibadah Berjamaah dan Stabilitas Emosional Siswa",
      targetKualitas: "90 - 100 %",
      realisasiKualitas: "97 %",
      ikiWaktu: "Ketepatan Rutinitas Pendampingan Spiritual",
      targetWaktu: "1 Bulan",
      realisasiWaktu: "1 Bulan",
      capaian: "Sesuai Ekspektasi"
    },
    {
      id: "rhk-5",
      rhkAtasan: "Terwujudnya pelayanan inklusif dan pendampingan khusus bagi siswa berkebutuhan khusus (ABK)",
      rhkPegawai: "PENDAMPINGAN SISWA BERKEBUTUHAN KHUSUS",
      ikiKuantitas: "Jumlah Laporan Pendampingan Khusus Siswa ABK yang Disusun",
      targetKuantitas: "5 Laporan LHK",
      realisasiKuantitas: "5 Laporan LHK",
      ikiKualitas: "Persentase Keberhasilan Penanganan Sensori dan Perilaku ABK",
      targetKualitas: "85 - 100 %",
      realisasiKualitas: "94 %",
      ikiWaktu: "Ketepatan Waktu Intervensi Khusus",
      targetWaktu: "1 Bulan",
      realisasiWaktu: "1 Bulan",
      capaian: "Sesuai Ekspektasi"
    }
  ]
};

interface MatriksSkpModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: ReportInputs;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MatriksSkpModal: React.FC<MatriksSkpModalProps> = ({
  isOpen,
  onClose,
  inputs,
  onShowToast
}) => {
  const [config, setConfig] = useState<MatriksSkpConfig>(() => {
    try {
      const saved = localStorage.getItem('peksos_matriks_skp_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MATRIKS_SKP;
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    try {
      localStorage.setItem('peksos_matriks_skp_config', JSON.stringify(config));
      onShowToast('Matriks SKP Bulanan berhasil disimpan!', 'success');
      setActiveTab('preview');
    } catch {
      onShowToast('Gagal menyimpan Matriks SKP.', 'error');
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_MATRIKS_SKP);
    localStorage.removeItem('peksos_matriks_skp_config');
    onShowToast('Matriks SKP dikembalikan ke pengaturan awal.', 'info');
  };

  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => {
      document.body.classList.add('print-matriks-skp-mode');
      const handleAfterPrint = () => {
        document.body.classList.remove('print-matriks-skp-mode');
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);

      requestAnimationFrame(() => {
        window.print();
      });

      setTimeout(() => {
        document.body.classList.remove('print-matriks-skp-mode');
      }, 3000);
    }, 150);
  };

  const updateItem = (index: number, field: string, value: string) => {
    setConfig((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 matriks-modal-backdrop">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-4 max-h-[95vh] matriks-modal-box">
        {/* Header Modal Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between shrink-0 matriks-non-printable print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Table className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                Matriks SKP Bulanan (e-Kinerja BKN)
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                  {config.periode}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Matriks Peran Hasil & Penilaian Kinerja Bulanan Wali Asuh Sekolah Rakyat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Toggle */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dokumen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Matriks</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="bg-slate-100 border-b border-gray-200 px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 matriks-non-printable print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Periode: {config.periode}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 font-medium">{config.unitKerja}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'edit' ? (
              <>
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Matriks SKP (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 matriks-body-container">
          {activeTab === 'preview' ? (
            /* PRINTABLE DOCUMENT VIEW */
            <div className="max-w-[210mm] mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 font-serif text-gray-900 text-xs leading-relaxed space-y-4 print-area matriks-printable-doc">
              {/* KOP INSTANSI */}
              <div className="border-b-[3px] border-black pb-2 mb-4 text-center">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  className="text-sm font-bold uppercase tracking-tight cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                >
                  KEMENTERIAN SOSIAL REPUBLIK INDONESIA
                </h1>
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs font-bold uppercase cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                >
                  SEKRETARIAT JENDERAL - PUSTIKNAS PROFESI
                </h2>
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs font-bold uppercase text-blue-900 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 block"
                >
                  SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-[10px] font-sans text-gray-600 mt-0.5 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                >
                  Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang 30151
                </p>
              </div>

              {/* JUDUL DOCUMENT */}
              <div className="text-center font-sans">
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  className="text-sm font-extrabold uppercase tracking-wide border-b border-black inline-block pb-0.5 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                >
                  MATRIKS SKP BULANAN & CAPAIAN KINERJA PEGAWAI
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const txt = e.currentTarget.innerText.replace(/^PERIODE PENILAIAN:\s*/i, '');
                    setConfig((prev) => ({ ...prev, periode: txt }));
                  }}
                  className="text-[11px] font-bold text-gray-700 uppercase mt-1 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                >
                  PERIODE PENILAIAN: {config.periode.toUpperCase()}
                </p>
              </div>

              {/* TABEL IDENTITAS PEGAWAI & ATASAN */}
              <div className="font-sans border border-black rounded-xs overflow-hidden">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black text-center font-bold">
                      <th className="p-1.5 border-r border-black w-1/2 uppercase">1. PEGAWAI YANG DINILAI</th>
                      <th className="p-1.5 uppercase">2. PEJABAT PENILAI KINERJA (ATASAN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    <tr>
                      <td className="p-2 border-r border-black align-top">
                        <div className="grid grid-cols-[100px_1fr] gap-1">
                          <span className="font-semibold text-gray-600">Nama</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {inputs.nama || "M Ardian Nugraha"}
                          </span>
                          <span className="font-semibold text-gray-600">NIP</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {inputs.nip || "199202042026221001"}
                          </span>
                          <span className="font-semibold text-gray-600">Pangkat/Gol</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, pangkatPegawai: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.pangkatPegawai || "Penata Muda / III/a"}
                          </span>
                          <span className="font-semibold text-gray-600">Jabatan</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, jabatanPegawai: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.jabatanPegawai || "Penata Layanan Operasional / Wali Asuh"}
                          </span>
                          <span className="font-semibold text-gray-600">Unit Kerja</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, unitKerja: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.unitKerja}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="grid grid-cols-[100px_1fr] gap-1">
                          <span className="font-semibold text-gray-600">Nama</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, namaAtasan: e.currentTarget.innerText }))}
                            className="font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.namaAtasan}
                          </span>
                          <span className="font-semibold text-gray-600">NIP</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, nipAtasan: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.nipAtasan}
                          </span>
                          <span className="font-semibold text-gray-600">Pangkat/Gol</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, pangkatAtasan: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.pangkatAtasan || "Pembina Utama Muda / IV/c"}
                          </span>
                          <span className="font-semibold text-gray-600">Jabatan</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, jabatanAtasan: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.jabatanAtasan}
                          </span>
                          <span className="font-semibold text-gray-600">Unit Kerja</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setConfig((prev) => ({ ...prev, unitKerja: e.currentTarget.innerText }))}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded"
                          >
                            {config.unitKerja}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TABEL MATRIKS SKP RHK */}
              <div className="font-sans border border-black rounded-xs overflow-hidden">
                <table className="w-full text-[10.5px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black text-center font-bold uppercase">
                      <th className="p-1.5 border-r border-black w-8">NO</th>
                      <th className="p-1.5 border-r border-black w-1/4">RHK ATASAN YANG DIINTERVENSI</th>
                      <th className="p-1.5 border-r border-black w-1/4">RENCANA HASIL KERJA (RHK) PEGAWAI</th>
                      <th className="p-1.5 border-r border-black">INDIKATOR KINERJA INDIVIDU (IKI) & ASPEK</th>
                      <th className="p-1.5 border-r border-black w-20">TARGET BULANAN</th>
                      <th className="p-1.5 border-r border-black w-20">REALISASI BULANAN</th>
                      <th className="p-1.5 w-24">CAPAIAN / RATING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {config.items.map((item, idx) => (
                      <tr key={item.id} className="align-top">
                        <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}</td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateItem(idx, 'rhkAtasan', e.currentTarget.innerText)}
                          className="p-1.5 border-r border-black font-medium leading-tight cursor-text hover:bg-amber-50/60 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {item.rhkAtasan}
                        </td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateItem(idx, 'rhkPegawai', e.currentTarget.innerText)}
                          className="p-1.5 border-r border-black font-bold uppercase leading-tight text-blue-950 cursor-text hover:bg-amber-50/60 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {item.rhkPegawai}
                        </td>
                        <td className="p-1.5 border-r border-black space-y-1">
                          <div>
                            <span className="font-bold text-[9.5px] uppercase block text-gray-600">[Kuantitas]</span>
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateItem(idx, 'ikiKuantitas', e.currentTarget.innerText)}
                              className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5 block"
                            >
                              {item.ikiKuantitas}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-1">
                            <span className="font-bold text-[9.5px] uppercase block text-gray-600">[Kualitas]</span>
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateItem(idx, 'ikiKualitas', e.currentTarget.innerText)}
                              className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5 block"
                            >
                              {item.ikiKualitas}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-1">
                            <span className="font-bold text-[9.5px] uppercase block text-gray-600">[Waktu]</span>
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateItem(idx, 'ikiWaktu', e.currentTarget.innerText)}
                              className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5 block"
                            >
                              {item.ikiWaktu}
                            </span>
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-black text-center space-y-1 bg-gray-50/50">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'targetKuantitas', e.currentTarget.innerText)}
                            className="font-semibold text-gray-800 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.targetKuantitas}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'targetKualitas', e.currentTarget.innerText)}
                            className="border-t border-gray-300 pt-1 font-semibold text-gray-800 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.targetKualitas}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'targetWaktu', e.currentTarget.innerText)}
                            className="border-t border-gray-300 pt-1 font-semibold text-gray-800 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.targetWaktu}
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-black text-center space-y-1 bg-emerald-50/30 font-bold text-emerald-950">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'realisasiKuantitas', e.currentTarget.innerText)}
                            className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.realisasiKuantitas}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'realisasiKualitas', e.currentTarget.innerText)}
                            className="border-t border-gray-300 pt-1 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.realisasiKualitas}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'realisasiWaktu', e.currentTarget.innerText)}
                            className="border-t border-gray-300 pt-1 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                          >
                            {item.realisasiWaktu}
                          </div>
                        </td>
                        <td className="p-1.5 text-center font-bold text-emerald-700 align-middle">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateItem(idx, 'capaian', e.currentTarget.innerText)}
                            className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9.5px] cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            {item.capaian}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RATING & UMPAN BALIK SUMMARY */}
              <div className="font-sans bg-gray-50 border border-black p-3 rounded-xs space-y-1 text-[11px]">
                <div className="font-bold uppercase text-gray-800 flex items-center justify-between border-b border-gray-300 pb-1">
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  >
                    HASIL EVALUASI KINERJA PEGAWAI BULAN {config.periode.toUpperCase()}
                  </span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold text-[10px] cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    RATING KINERJA: SESUAI EKSPEKTASI
                  </span>
                </div>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-gray-700 text-[10.5px] italic pt-1 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                >
                  Catatan Pejabat Penilai: "Seluruh Target Rencana Hasil Kerja (RHK) Wali Asuh Sekolah Rakyat Terintegrasi 31 Palembang untuk bulan {config.periode} telah direalisasikan secara optimal, akuntabel, dan sesuai dengan standar pelayanan pengasuhan."
                </p>
              </div>

              {/* TANDA TANGAN SECTION */}
              <div className="font-sans pt-4 grid grid-cols-2 gap-8 text-center text-[11px] avoid-break">
                <div>
                  <p className="font-medium text-gray-600">Pegawai Yang Dinilai,</p>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setConfig((prev) => ({ ...prev, jabatanPegawai: e.currentTarget.innerText }))}
                    className="font-bold uppercase mt-1 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                  >
                    {config.jabatanPegawai}
                  </p>
                  <div className="h-16 flex items-center justify-center my-1">
                    {inputs.qrCodeSrc ? (
                      <img src={inputs.qrCodeSrc} alt="QR TTD Pegawai" className="h-14 w-14 object-contain" />
                    ) : (
                      <div className="w-28 border-b border-dashed border-gray-400 text-[10px] text-gray-400 italic">
                        (Tanda Tangan Digital)
                      </div>
                    )}
                  </div>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="font-bold underline uppercase cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                  >
                    {inputs.nama || "M Ardian Nugraha"}
                  </p>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[10.5px] cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 block"
                  >
                    NIP. {inputs.nip || "199202042026221001"}
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setConfig((prev) => ({ ...prev, lokasiTtd: e.currentTarget.innerText }))}
                      className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                    >
                      {config.lokasiTtd}
                    </span>,{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setConfig((prev) => ({ ...prev, tanggalTtd: e.currentTarget.innerText }))}
                      className="cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5"
                    >
                      {config.tanggalTtd}
                    </span>
                  </p>
                  <p className="font-bold uppercase mt-1">Pejabat Penilai Kinerja,</p>
                  <div className="h-16 flex items-center justify-center my-1">
                    <div className="w-28 border-b border-dashed border-gray-400 text-[10px] text-gray-400 italic">
                      (Tanda Tangan Atasan)
                    </div>
                  </div>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setConfig((prev) => ({ ...prev, namaAtasan: e.currentTarget.innerText }))}
                    className="font-bold underline uppercase cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
                  >
                    {config.namaAtasan}
                  </p>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setConfig((prev) => ({ ...prev, nipAtasan: e.currentTarget.innerText }))}
                    className="text-[10.5px] cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 block"
                  >
                    NIP. {config.nipAtasan}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MATRIKS FORM VIEW */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Informational Header */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-900 font-medium">
                  Atur parameter Matriks SKP Bulanan e-Kinerja BKN, nama Atasan Penilai, serta target & realisasi indikator kinerja untuk laporan bulanan Anda.
                </p>
              </div>

              {/* 1. Pengaturan Informasi Umum & Atasan */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  1. Informasi Periode & Pejabat Penilai (Atasan)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Periode Penilaian SKP
                    </label>
                    <input
                      type="text"
                      value={config.periode}
                      onChange={(e) => setConfig({ ...config, periode: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Juli 2026"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Unit Kerja
                    </label>
                    <input
                      type="text"
                      value={config.unitKerja}
                      onChange={(e) => setConfig({ ...config, unitKerja: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Nama Pejabat Penilai (Atasan)
                    </label>
                    <input
                      type="text"
                      value={config.namaAtasan}
                      onChange={(e) => setConfig({ ...config, namaAtasan: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      NIP Pejabat Penilai (Atasan)
                    </label>
                    <input
                      type="text"
                      value={config.nipAtasan}
                      onChange={(e) => setConfig({ ...config, nipAtasan: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Jabatan Atasan
                    </label>
                    <input
                      type="text"
                      value={config.jabatanAtasan}
                      onChange={(e) => setConfig({ ...config, jabatanAtasan: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Jabatan Pegawai (Wali Asuh)
                    </label>
                    <input
                      type="text"
                      value={config.jabatanPegawai}
                      onChange={(e) => setConfig({ ...config, jabatanPegawai: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Kota Tanda Tangan
                    </label>
                    <input
                      type="text"
                      value={config.lokasiTtd}
                      onChange={(e) => setConfig({ ...config, lokasiTtd: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Tanggal Tanda Tangan
                    </label>
                    <input
                      type="text"
                      value={config.tanggalTtd}
                      onChange={(e) => setConfig({ ...config, tanggalTtd: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Matriks Detail RHK Item (5 RHK) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  2. Matriks Rencana Hasil Kerja (5 RHK SKP Bulanan)
                </h4>

                {config.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-blue-900 uppercase">
                        RHK #{idx + 1}: {item.rhkPegawai}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {item.capaian}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block font-semibold text-gray-600 text-[11px] mb-0.5">
                          RHK Atasan Yang Diintervensi:
                        </label>
                        <input
                          type="text"
                          value={item.rhkAtasan}
                          onChange={(e) => updateItem(idx, 'rhkAtasan', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-0.5">
                            Target Kuantitas Bulanan:
                          </label>
                          <input
                            type="text"
                            value={item.targetKuantitas}
                            onChange={(e) => updateItem(idx, 'targetKuantitas', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-900"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-0.5">
                            Realisasi Kuantitas Bulanan:
                          </label>
                          <input
                            type="text"
                            value={item.realisasiKuantitas}
                            onChange={(e) => updateItem(idx, 'realisasiKuantitas', e.target.value)}
                            className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-950"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
