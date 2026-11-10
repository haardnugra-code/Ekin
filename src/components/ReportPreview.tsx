import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Bold,
  Italic,
  Underline,
  RemoveFormatting,
  Sparkles,
  Maximize2,
  Minimize2,
  Scissors,
  Upload,
  Plus,
  Trash2,
  BookOpenCheck,
  BookOpen
} from 'lucide-react';
import { ReportInputs, ReportOutputs, SpecialReportTableRow } from '../types';
import { DASAR_HUKUM_LIST, DASAR_PELAKSANAAN_LIST, RHK_DATA } from '../data/presets';
import { getRecommendationVariations, generateDynamicRecommendation } from '../utils/recommendationGenerator';
import {
  buildSpecialReportFromProblem,
  SCIENTIFIC_JOURNAL_PRESETS,
  generateContextualReferences
} from '../utils/specialReportGenerator';
import { compressImage } from '../utils/imageCompressor';

interface ReportPreviewProps {
  inputs: ReportInputs;
  outputs: ReportOutputs;
  setOutputs: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  isFocusMode?: boolean;
  setIsFocusMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenSettings?: () => void;
}

interface EditableContentProps {
  html: string;
  onChange: (newHtml: string) => void;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'div' | 'p';
  isFocusMode?: boolean;
}

const EditableContent: React.FC<EditableContentProps> = ({
  html,
  onChange,
  className,
  style,
  as: Component = 'span',
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== (html || '')) {
        ref.current.innerHTML = html || '';
      }
    }
  }, [html]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    onChange(newHtml);
  };

  return (
    <Component
      ref={ref as any}
      contentEditable={true}
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleInput}
      className={`editable-text cursor-text focus:outline-none focus:ring-1 focus:ring-blue-400 focus:rounded px-0.5 transition-colors ${className || ''}`}
      style={style}
    />
  );
};

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  inputs,
  outputs,
  setOutputs,
  setInputs,
  isFocusMode: externalFocusMode,
  setIsFocusMode: externalSetIsFocusMode,
  onOpenSettings,
}) => {
  const [internalFocusMode, setInternalFocusMode] = useState<boolean>(false);
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);

  const focusActive = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;
  const setFocusActive = externalSetIsFocusMode || setInternalFocusMode;

  const foto1InputRef = useRef<HTMLInputElement>(null);
  const foto2InputRef = useRef<HTMLInputElement>(null);

  const isSpecialMode = Boolean(inputs.modeLaporanKhusus);
  const showResearchCover = inputs.tampilkanCoverPenelitian !== false;
  const isJournalActive = inputs.aktifFiturJurnalIlmiah !== false;
  const coverStyle = inputs.gayaCoverPenelitian || 'penelitian_resmi';

  // Fallback defaults for Special Report & Scientific Journal fields if not yet populated in outputs
  const fallbackSpecial = React.useMemo(
    () => buildSpecialReportFromProblem(inputs, inputs.permasalahan, inputs.solusi),
    [inputs.rhk, inputs.judul, inputs.permasalahan, inputs.solusi, inputs.tanggal, inputs.kopUnitKerja]
  );

  const tableRows: SpecialReportTableRow[] =
    outputs.tabelKegiatan && outputs.tabelKegiatan.length > 0
      ? outputs.tabelKegiatan
      : fallbackSpecial.tabelKegiatan;

  const referencesList: string[] =
    Array.isArray(outputs.khususReferensi) && outputs.khususReferensi.length > 0
      ? outputs.khususReferensi
      : fallbackSpecial.khususReferensi;

  const handleUpdateReference = (idx: number, val: string) => {
    setOutputs((prev) => {
      const current =
        Array.isArray(prev.khususReferensi) && prev.khususReferensi.length > 0
          ? [...prev.khususReferensi]
          : [...fallbackSpecial.khususReferensi];
      current[idx] = val;
      return { ...prev, khususReferensi: current };
    });
  };

  const handleAddReference = () => {
    setOutputs((prev) => {
      const current =
        Array.isArray(prev.khususReferensi) && prev.khususReferensi.length > 0
          ? [...prev.khususReferensi]
          : [...fallbackSpecial.khususReferensi];
      current.push(
        'Penulis, A., & Penulis, B. (2025). Judul artikel penelitian pekerjaan sosial dan pengasuhan peserta didik. Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial, 14(1), 1–15.'
      );
      return { ...prev, khususReferensi: current };
    });
  };

  const handleDeleteReference = (idx: number) => {
    setOutputs((prev) => {
      const current =
        Array.isArray(prev.khususReferensi) && prev.khususReferensi.length > 0
          ? [...prev.khususReferensi]
          : [...fallbackSpecial.khususReferensi];
      if (current.length <= 1) return prev;
      current.splice(idx, 1);
      return { ...prev, khususReferensi: current };
    });
  };

  const handleUpdateTableRow = (
    idx: number,
    field: keyof SpecialReportTableRow,
    val: string
  ) => {
    setOutputs((prev) => {
      const current =
        prev.tabelKegiatan && prev.tabelKegiatan.length > 0
          ? [...prev.tabelKegiatan]
          : [...fallbackSpecial.tabelKegiatan];
      if (current[idx]) {
        current[idx] = { ...current[idx], [field]: val };
      }
      return { ...prev, tabelKegiatan: current };
    });
  };

  const handleAddTableRow = () => {
    setOutputs((prev) => {
      const current =
        prev.tabelKegiatan && prev.tabelKegiatan.length > 0
          ? [...prev.tabelKegiatan]
          : [...fallbackSpecial.tabelKegiatan];
      current.push({
        id: `row-${Date.now()}`,
        tanggal: inputs.tanggal || '30 Juli 2026',
        namaKegiatan: 'Kegiatan Pendampingan Lanjutan Peserta Didik',
        hasilKegiatan: 'Peserta didik mengikuti arahan dengan baik dan menunjukkan progres positif.',
        kendala: 'Memerlukan konsistensi pengawasan harian di asrama.',
        saran: 'Lanjutkan evaluasi berkala bersama Wali Asuh sif berikutnya.'
      });
      return { ...prev, tabelKegiatan: current };
    });
  };

  const handleDeleteTableRow = (idx: number) => {
    setOutputs((prev) => {
      const current =
        prev.tabelKegiatan && prev.tabelKegiatan.length > 0
          ? [...prev.tabelKegiatan]
          : [...fallbackSpecial.tabelKegiatan];
      if (current.length <= 1) return prev;
      current.splice(idx, 1);
      return { ...prev, tabelKegiatan: current };
    });
  };

  const handlePreviewPhotoUpload = async (
    field: 'foto1Src' | 'foto2Src',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      setInputs((prev) => {
        const next = { ...prev, [field]: compressed };
        const activeJudul = prev.judul || prev.customTitle || 'Kegiatan Pengasuhan';
        if (field === 'foto1Src' && (!prev.foto1Caption || prev.foto1Caption === 'Foto 1. Pelaksanaan Kegiatan')) {
          next.foto1Caption = `Foto 1. Pelaksanaan ${activeJudul}`;
        } else if (field === 'foto2Src' && (!prev.foto2Caption || prev.foto2Caption === 'Foto 2. Kondisi Lapangan')) {
          next.foto2Caption = `Foto 2. Evaluasi ${activeJudul}`;
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to compress preview image:', err);
    } finally {
      e.target.value = '';
    }
  };

  const Editable = (props: EditableContentProps) => (
    <EditableContent {...props} isFocusMode={focusActive} />
  );

  const handleContentEdit = (field: keyof ReportOutputs, value: string) => {
    setOutputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFormat = (command: 'bold' | 'italic' | 'underline' | 'removeFormat') => {
    document.execCommand(command, false, undefined);
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl && activeEl.isContentEditable) {
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (focusActive) {
        setSelectionPos(null);
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setSelectionPos(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const previewContainer = document.getElementById('document-preview');
      if (!previewContainer || !previewContainer.contains(range.commonAncestorContainer)) {
        setSelectionPos(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const containerRect = previewContainer.getBoundingClientRect();
        setSelectionPos({
          top: rect.top - containerRect.top - 46,
          left: Math.max(10, rect.left - containerRect.left + rect.width / 2 - 80),
        });
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [focusActive]);

  const getPageNumberText = (pageIndex: number, totalPages: number) => {
    const format = inputs.formatNomorHalaman || '- {n} -';
    return format
      .replace('{n}', String(pageIndex))
      .replace('{total}', String(totalPages));
  };

  const hasPhotos = inputs.foto1Src || inputs.foto2Src;

  const currentPaperSize = inputs.paperSize || 'A4';
  const paperHeightMm = currentPaperSize === 'F4' ? 330 : currentPaperSize === 'Legal' ? 355.6 : 297;
  const showPageBreakLines = inputs.showPageBreakLines !== false;

  // Standar Permensos RI Nomor 8 Tahun 2022:
  // Huruf Arial 12pt, Margin Atas 2 cm, Bawah 2,5 cm, Kiri 3 cm, Kanan 2 cm
  const marginTop = inputs.marginTop || '2cm';
  const marginBottom = inputs.marginBottom || '2.5cm';
  const marginLeft = inputs.marginLeft || '3cm';
  const marginRight = inputs.marginRight || '2cm';
  const activeFontIsi = inputs.fontIsi || 'Arial, sans-serif';
  const activeFontJudul = inputs.fontJudul || activeFontIsi;
  const activeSizeIsi = inputs.sizeIsi || '12pt';
  const activeSizeJudul = inputs.sizeJudul || '12pt';
  const activeLineHeight = inputs.lineHeight || '1.5';

  const paperStyle: React.CSSProperties = {
    fontFamily: activeFontIsi,
    fontSize: activeSizeIsi,
    lineHeight: activeLineHeight,
    paddingTop: marginTop,
    paddingBottom: marginBottom,
    paddingLeft: marginLeft,
    paddingRight: marginRight,
  };

  const paperClass = `a4-paper relative ${
    currentPaperSize === 'F4'
      ? 'paper-size-f4'
      : currentPaperSize === 'Legal'
      ? 'paper-size-legal'
      : 'paper-size-a4'
  }`;

  const renderKopSurat = () => (
    <div
      className="kop-surat avoid-break border-b-[4px] border-black pb-2.5 mb-5 flex items-center justify-between"
      style={{ borderBottomStyle: 'double', fontFamily: activeFontIsi }}
    >
      {inputs.logoSrc ? (
        <div className="w-24 flex-shrink-0 pr-2 flex justify-center">
          <img
            src={inputs.logoSrc}
            alt="Logo Kop Instansi 1"
            referrerPolicy="no-referrer"
            className="max-w-full h-auto max-h-20 object-contain"
          />
        </div>
      ) : inputs.showLogo2 !== false && inputs.logo2Src ? (
        <div className="w-24 flex-shrink-0 pr-2" />
      ) : null}

      <div className="flex-1 text-center px-1">
        {(inputs.kopInstansiUtama ?? 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA') && (
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setInputs((prev) => ({ ...prev, kopInstansiUtama: e.currentTarget.innerText.trim() }))}
            className="text-[12pt] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          >
            {inputs.kopInstansiUtama ?? 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA'}
          </h1>
        )}
        {(inputs.kopEselon1 ?? 'SEKRETARIAT JENDERAL') && (
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setInputs((prev) => ({ ...prev, kopEselon1: e.currentTarget.innerText.trim() }))}
            className="text-[12pt] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          >
            {inputs.kopEselon1 ?? 'SEKRETARIAT JENDERAL'}
          </h2>
        )}
        {(inputs.kopEselon2 ?? 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI') && (
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setInputs((prev) => ({ ...prev, kopEselon2: e.currentTarget.innerText.trim() }))}
            className="text-[11.5pt] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          >
            {inputs.kopEselon2 ?? 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI'}
          </h2>
        )}
        {(inputs.kopUnitKerja ?? 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG') && (
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setInputs((prev) => ({ ...prev, kopUnitKerja: e.currentTarget.innerText.trim() }))}
            className="text-[13pt] font-bold uppercase mt-0.5 leading-snug cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          >
            {inputs.kopUnitKerja ?? 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG'}
          </h2>
        )}
        {(inputs.kopAlamat ?? 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com') && (
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setInputs((prev) => ({ ...prev, kopAlamat: e.currentTarget.innerText.trim() }))}
            className="text-[9pt] mt-0.5 leading-tight cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          >
            {inputs.kopAlamat ?? 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com'}
          </p>
        )}
      </div>

      {inputs.showLogo2 !== false && inputs.logo2Src ? (
        <div className="w-24 flex-shrink-0 pl-2 flex justify-center">
          <img
            src={inputs.logo2Src}
            alt="Logo Kop Instansi 2"
            referrerPolicy="no-referrer"
            className="max-w-full h-auto max-h-20 object-contain"
          />
        </div>
      ) : inputs.logoSrc ? (
        <div className="w-24 flex-shrink-0 pl-2" />
      ) : null}
    </div>
  );

  const renderSignatureSection = () => (
    <div
      className="signature-section avoid-break mt-4 flex justify-end pr-2 shrink-0 font-normal"
      style={{ fontFamily: activeFontIsi, fontSize: activeSizeIsi }}
    >
      <div className="flex flex-col items-start min-w-[14rem]">
        <table className="font-normal mb-0.5" style={{ fontSize: activeSizeIsi }}>
          <tbody>
            <tr>
              <td className="pr-2 whitespace-nowrap">Dibuat di</td>
              <td className="pr-1">:</td>
              <td>
                <Editable
                  html={outputs.tempat || inputs.tempat}
                  onChange={(v) => handleContentEdit('tempat', v)}
                  className="px-1"
                />
              </td>
            </tr>
            <tr>
              <td className="pr-2 whitespace-nowrap">Pada Tanggal</td>
              <td className="pr-1">:</td>
              <td>
                <Editable
                  html={outputs.tanggal || inputs.tanggal}
                  onChange={(v) => handleContentEdit('tanggal', v)}
                  className="px-1"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="min-h-16 my-2 flex items-center gap-3 overflow-hidden">
          {inputs.qrCodeSrc && (
            <div className="flex items-center gap-2 p-1 bg-blue-50/40 rounded-lg border border-blue-100 shrink-0">
              <img
                src={inputs.qrCodeSrc}
                alt="QR Code Tanda Tangan Digital"
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain border border-blue-200 p-0.5 rounded bg-white shadow-2xs"
              />
              <div className="flex flex-col text-left font-sans pr-1">
                <span className="text-[7.5pt] font-bold text-blue-950 uppercase tracking-tight">Ditandatangani Digital</span>
                <span className="text-[6.5pt] text-blue-800 font-bold">{inputs.nama || 'M Ardian Nugraha'}</span>
                <span className="text-[6.5pt] text-gray-500 italic">Terverifikasi Sistem</span>
              </div>
            </div>
          )}

          {inputs.ttdSrc && (
            <div className="h-14 flex items-center justify-start overflow-hidden shrink-0">
              <img
                src={inputs.ttdSrc}
                alt="Tanda Tangan Basah"
                referrerPolicy="no-referrer"
                className="max-h-14 max-w-[9rem] mix-blend-multiply object-contain"
              />
            </div>
          )}

          {!inputs.qrCodeSrc && !inputs.ttdSrc && !focusActive && (
            <div className="h-14 flex items-center text-gray-400 italic text-xs">
              (Unggah Tanda Tangan / Gunakan QR Digital)
            </div>
          )}
        </div>

        <div className="font-bold underline uppercase text-left">
          <Editable
            html={outputs.nama || inputs.nama}
            onChange={(v) => handleContentEdit('nama', v)}
          />
        </div>
        <div className="text-left">
          NIP.{' '}
          <Editable
            html={outputs.nip || inputs.nip}
            onChange={(v) => handleContentEdit('nip', v)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      id="document-preview"
      className={`space-y-8 print:space-y-0 relative w-full flex flex-col items-center ${focusActive ? 'is-focus-mode' : ''}`}
    >
      {/* DYNAMIC PRINT PAGE SIZE & PERMENSOS NO. 8 TAHUN 2022 MARGIN INJECTION */}
      <style>{`
        @media print {
          @page {
            size: ${currentPaperSize === 'F4' ? '215mm 330mm' : currentPaperSize === 'Legal' ? 'legal portrait' : 'A4 portrait'};
            margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important;
          }
        }
      `}</style>

      {/* TOP RICH TEXT & MODE SWITCH TOOLBAR */}
      <div className="print:hidden mb-3 bg-white border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 w-full max-w-[210mm]">
        {!focusActive ? (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* SWITCH FORMAT LAPORAN & FITUR COVER PENELITIAN / JURNAL ILMIAH */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, modeLaporanKhusus: false }))}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    !isSpecialMode
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bab Standar (A–F)
                </button>
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, modeLaporanKhusus: true }))}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                    isSpecialMode
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                  title="Aktifkan Format Laporan Khusus (Bab A s.d. G + Tabel Matriks Kegiatan)"
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>Laporan Khusus</span>
                </button>
              </div>

              {/* TOMBOL TOGGLE COVER PENELITIAN (HAL 1) & DAFTAR ISI (HAL 2) */}
              <button
                type="button"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    tampilkanCoverPenelitian: prev.tampilkanCoverPenelitian === false ? true : false
                  }))
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  showResearchCover
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Tampilkan / Sembunyikan Cover Penelitian di Halaman 1 & Daftar Isi di Halaman 2"
              >
                <span>Cover & Daftar Isi: {showResearchCover ? 'ON' : 'OFF'}</span>
              </button>

              {/* TOMBOL TOGGLE FITUR JURNAL ILMIAH */}
              <button
                type="button"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    aktifFiturJurnalIlmiah: prev.aktifFiturJurnalIlmiah === false ? true : false
                  }))
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  isJournalActive
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Aktifkan / Nonaktifkan Fitur Kajian Jurnal Ilmiah, Abstrak & Daftar Pustaka APA"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Jurnal Ilmiah: {isJournalActive ? 'ON' : 'OFF'}</span>
              </button>

              {/* SELECTOR TATA NASKAH DINAS (PERMENSOS NO. 8 TAHUN 2022) */}
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
                  }
                }}
                title="Standar Tata Naskah Dinas (Permensos RI Nomor 8 Tahun 2022)"
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-[11px] font-semibold cursor-pointer focus:outline-none focus:border-blue-600"
              >
                <option value="permensos_8_2022">Permensos 8/2022 (Arial 12pt · 2/2,5/3/2 cm)</option>
                <option value="produk_hukum">Produk Hukum (Bookman 12pt · 2/2,5/3/2 cm)</option>
                <option value="klasik_tnr">Times New Roman 12pt · 2/2,5/3/2 cm</option>
                {inputs.standarTnd === 'custom' && (
                  <option value="custom">
                    Kustom ({activeSizeIsi} · {marginTop}/{marginBottom}/{marginLeft}/{marginRight})
                  </option>
                )}
              </select>

              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('bold');
                  }}
                  className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs"
                  title="Tebalkan Teks (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('italic');
                  }}
                  className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs"
                  title="Miringkan Teks (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('underline');
                  }}
                  className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs"
                  title="Garis Bawah Teks (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* UKURAN KERTAS SELECTOR */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                {(['A4', 'F4', 'Legal'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, paperSize: sz }))}
                    className={`px-2 py-1 rounded-md transition-colors text-[11px] cursor-pointer whitespace-nowrap shrink-0 ${
                      currentPaperSize === sz
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInputs((prev) => ({ ...prev, showPageBreakLines: !showPageBreakLines }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  showPageBreakLines
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Tampilkan / Sembunyikan Garis Batas Halaman Visual"
              >
                <Scissors className="w-3 h-3" />
                <span className="hidden sm:inline">Batas Hal.</span>
              </button>

              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>
                    Fitur:{' '}
                    {[
                      inputs.aktifFiturUpacara && 'Upacara',
                      inputs.aktifFiturKunjungan && 'Kunjungan',
                      inputs.sertakanDetailSuratTugas && 'Surat Tugas',
                      inputs.aktifFiturPelatihan && 'Pelatihan',
                      isJournalActive && 'Jurnal Ilmiah'
                    ]
                      .filter(Boolean)
                      .join(', ') || 'OFF'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setFocusActive(true)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fokus</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-3 px-1">
            <span className="text-xs font-medium text-slate-600">
              Mode Fokus Aktif · Klik langsung pada teks dokumen untuk mengedit
            </span>
            <button
              type="button"
              onClick={() => setFocusActive(false)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Keluar Mode Fokus</span>
            </button>
          </div>
        )}
      </div>

      {/* FLOATING SELECTION TOOLBAR POPOVER */}
      {selectionPos && !focusActive && (
        <div
          style={{ top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
          className="print:hidden absolute z-40 bg-slate-900 text-white rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1 border border-slate-700"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
            className="p-1 hover:bg-slate-800 rounded text-xs font-bold cursor-pointer text-white"
          >
            <Bold className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
            className="p-1 hover:bg-slate-800 rounded text-xs italic cursor-pointer text-white"
          >
            <Italic className="w-3.5 h-3.5 text-sky-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('underline');
            }}
            className="p-1 hover:bg-slate-800 rounded text-xs underline cursor-pointer text-white"
          >
            <Underline className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <div className="h-3 w-[1px] bg-slate-700 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('removeFormat');
            }}
            className="p-1 hover:bg-slate-800 rounded text-xs cursor-pointer text-slate-300 hover:text-white"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          HALAMAN 1: SAMPUL / COVER PENELITIAN & LAPORAN RESMI (1 HALAMAN PENUH)
         ===================================================================== */}
      {showResearchCover && (
        <div
          className={`${paperClass} flex flex-col justify-between`}
          style={paperStyle}
        >
          <div
            className={`flex-1 min-h-[242mm] flex flex-col justify-between items-center text-center avoid-break ${
              coverStyle === 'kedinasan_klasik'
                ? 'border-[4px] border-double border-black p-7'
                : coverStyle === 'akademis_modern'
                ? 'border-y-[3px] border-black py-7 px-5'
                : 'border-[2px] border-black p-7 relative'
            }`}
          >
            {/* BAGIAN ATAS COVER PENELITIAN: KATEGORI KAJIAN, RHK & JUDUL PENELITIAN */}
            <div className="w-full flex flex-col items-center space-y-2">
              {isJournalActive && (
                <div className="w-full pb-2 mb-1 border-b border-black/80">
                  <p className="text-[9.5pt] font-bold uppercase tracking-widest text-slate-800">
                    <Editable
                      html={
                        inputs.namaJurnalIlmiah ||
                        'SERI KAJIAN PRAKTIK PEKERJAAN SOSIAL & PENGASUHAN TERINTEGRASI — TAHUN 2026'
                      }
                      onChange={(v) => setInputs((prev) => ({ ...prev, namaJurnalIlmiah: v }))}
                    />
                  </p>
                </div>
              )}

              <p
                className="text-[13pt] font-bold uppercase tracking-wider leading-snug"
                style={{ fontFamily: activeFontJudul }}
              >
                <Editable
                  html={
                    inputs.subJudulCoverPenelitian ||
                    'LAPORAN KAJIAN INTERVENSI & PELAKSANAAN TUGAS PEKERJAAN SOSIAL'
                  }
                  onChange={(v) => setInputs((prev) => ({ ...prev, subJudulCoverPenelitian: v }))}
                />
              </p>

              <p className="text-[11pt] font-bold uppercase text-slate-900">
                SASARAN KINERJA PEGAWAI (RHK {inputs.rhk === 'custom' ? 'KHUSUS' : inputs.rhk}) —{' '}
                {RHK_DATA[inputs.rhk]?.judul ||
                  inputs.customTitle ||
                  'BIMBINGAN DAN PENGASUHAN PESERTA DIDIK'}
              </p>

              {/* KOTAK JUDUL UTAMA PENELITIAN / LAPORAN */}
              <div className="mt-3 px-5 py-3.5 border-y-2 border-black w-full max-w-xl bg-slate-50/30">
                <p
                  className="text-[13.5pt] font-bold uppercase leading-snug"
                  style={{ fontFamily: activeFontJudul }}
                >
                  <Editable
                    html={outputs.judul || inputs.judul}
                    onChange={(v) => handleContentEdit('judul', v)}
                  />
                </p>
                {inputs.nomorSurat && (
                  <p className="text-[10.5pt] font-semibold mt-1.5 tracking-wide">
                    NOMOR:{' '}
                    <Editable
                      html={inputs.nomorSurat}
                      onChange={(v) => setInputs((prev) => ({ ...prev, nomorSurat: v }))}
                    />
                  </p>
                )}
              </div>

              {/* KETERANGAN PENGAJUAN PENELITIAN / AKADEMIS */}
              <p className="text-[10.5pt] italic max-w-lg leading-relaxed pt-1 text-slate-800">
                <Editable
                  html={
                    inputs.keteranganCoverPenelitian ||
                    'Disusun sebagai Dokumen Pertanggungjawaban Kinerja dan Kajian Praktik Pekerjaan Sosial Berbasis Bukti (Evidence-Based Social Work Practice)'
                  }
                  onChange={(v) => setInputs((prev) => ({ ...prev, keteranganCoverPenelitian: v }))}
                />
              </p>
            </div>

            {/* BAGIAN TENGAH COVER PENELITIAN: LAMBANG / LOGO INSTANSI RESMI */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-8">
                {inputs.logoSrc && (
                  <img
                    src={inputs.logoSrc}
                    alt="Logo Kementerian Sosial RI"
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 object-contain"
                  />
                )}
                {inputs.showLogo2 && inputs.logo2Src && (
                  <img
                    src={inputs.logo2Src}
                    alt="Logo Instansi Kedua"
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 object-contain"
                  />
                )}
              </div>
            </div>

            {/* BAGIAN TENGAH-BAWAH: IDENTITAS PENELITI / PENYUSUN LAPORAN */}
            <div className="w-full max-w-md flex flex-col items-center">
              <p className="text-[10.5pt] font-bold uppercase tracking-widest mb-1.5">
                DISUSUN OLEH:
              </p>
              <div className="w-full border border-black p-3.5 text-left text-[11pt]">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-bold py-0.5 w-36">Nama Penyusun</td>
                      <td className="w-3">:</td>
                      <td className="font-bold uppercase underline">
                        <Editable
                          html={outputs.nama || inputs.nama}
                          onChange={(v) => handleContentEdit('nama', v)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5">NIP / NI PPPK</td>
                      <td>:</td>
                      <td>
                        <Editable
                          html={outputs.nip || inputs.nip}
                          onChange={(v) => handleContentEdit('nip', v)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5">Jabatan</td>
                      <td>:</td>
                      <td>Wali Asuh / Pekerja Sosial</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5">Tempat, Tanggal</td>
                      <td>:</td>
                      <td>
                        {outputs.tempat || inputs.tempat}, {outputs.tanggal || inputs.tanggal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN BAWAH COVER PENELITIAN: NAMA KEMENTERIAN, UNIT KERJA & TAHUN */}
            <div className="w-full pt-4 border-t-2 border-black flex flex-col items-center space-y-0.5">
              <p className="text-[12pt] font-bold uppercase tracking-wide">
                {inputs.kopInstansiUtama || 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA'}
              </p>
              <p className="text-[11pt] font-bold uppercase">
                {inputs.kopEselon1 || 'SEKRETARIAT JENDERAL'}
              </p>
              <p className="text-[10.5pt] font-bold uppercase">
                {inputs.kopEselon2 || 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI'}
              </p>
              <p className="text-[12.5pt] font-bold uppercase mt-0.5">
                {inputs.kopUnitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG'}
              </p>
              <p className="text-[11pt] font-bold uppercase pt-1 tracking-widest">
                {(outputs.tempat || inputs.tempat || 'PALEMBANG').toUpperCase()} — TAHUN{' '}
                {(inputs.tanggal || '2026').match(/\d{4}/)?.[0] || '2026'}
              </p>
            </div>
          </div>

          {inputs.tampilkanNomorHalaman && (
            <div className="mt-3 pt-1 w-full flex items-center justify-center text-[9pt] text-gray-500 print:text-black avoid-break">
              {getPageNumberText(1, 4)}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          HALAMAN 2: DAFTAR ISI OTOMATIS & ABSTRAK KAJIAN ILMIAH (TERSENDIRI)
         ===================================================================== */}
      {showResearchCover && (
        <div
          className={`${paperClass} page-break-before flex flex-col justify-between`}
          style={paperStyle}
        >
          <div>
            {renderKopSurat()}

            {/* JUDUL HALAMAN 2: DAFTAR ISI */}
            <div className="text-center mb-4 avoid-break">
              <h2
                className="font-bold text-[13pt] uppercase tracking-wider underline underline-offset-4"
                style={{ fontFamily: activeFontJudul }}
              >
                DAFTAR ISI
              </h2>
              <p className="text-[10pt] text-slate-700 mt-0.5">
                Dokumen Laporan Pelaksanaan Tugas & Kajian Intervensi Pekerjaan Sosial (RHK{' '}
                {inputs.rhk === 'custom' ? 'Khusus' : inputs.rhk})
              </p>
            </div>

            {/* ISI DAFTAR ISI OTOMATIS (JUSTIFY RATA KANAN KIRI OTOMATIS) */}
            <div className="w-full border border-black p-4 avoid-break text-justify">
              <div className="w-full flex items-center justify-between font-bold text-[10.5pt] border-b border-black pb-1.5 mb-2.5 uppercase">
                <span className="text-left">Bagian / Struktur Bab Laporan & Kajian Ilmiah</span>
                <span className="text-right shrink-0">Halaman</span>
              </div>

              <div className="w-full space-y-2 text-[11pt] text-justify">
                {(isSpecialMode
                  ? [
                      { label: 'HALAMAN SAMPUL (COVER PENELITIAN & IDENTITAS PELAKSANA)', page: '1' },
                      { label: 'DAFTAR ISI', page: '2' },
                      ...(isJournalActive
                        ? [{ label: 'ABSTRAK KAJIAN ILMIAH & KATA KUNCI (ABSTRACT & KEYWORDS)', page: '2' }]
                        : []),
                      { label: 'A. LATAR BELAKANG MASALAH & KONTEKS INTERVENSI', page: '3' },
                      { label: 'B. DASAR PELAKSANAAN KEGIATAN (LANDASAN HUKUM & OPERASIONAL)', page: '3' },
                      { label: 'C. TUJUAN KEGIATAN & INDIKATOR KEBERFUNGSIAN SOSIAL', page: '3' },
                      ...(isJournalActive
                        ? [
                            { label: '   • TINJAUAN PUSTAKA & KAJIAN JURNAL ILMIAH (LITERATURE REVIEW)', page: '3' },
                            { label: '   • METODOLOGI KAJIAN & DESAIN INTERVENSI PEKERJAAN SOSIAL', page: '3' }
                          ]
                        : []),
                      { label: 'D. PELAKSANAAN KEGIATAN INTERVENSI PEKERJAAN SOSIAL', page: '3' },
                      { label: 'E. HASIL KEGIATAN & PEMBAHASAN ILMIAH (EVIDENCE-BASED DISCUSSION)', page: '3' },
                      { label: 'F. KENDALA LAPANGAN DAN RENCANA TINDAK LANJUT (RTL)', page: '3' },
                      { label: 'G. SIMPULAN DAN SARAN REKOMENDASI', page: '3' },
                      ...(isJournalActive
                        ? [{ label: 'H. DAFTAR PUSTAKA / REFERENSI JURNAL ILMIAH (APA 7TH EDITION)', page: '3' }]
                        : []),
                      { label: 'TABEL MATRIKS PELAKSANAAN KEGIATAN (TANGGAL, NAMA, HASIL, KENDALA, SARAN)', page: '3' },
                      { label: 'LAMPIRAN DOKUMENTASI KEGIATAN', page: '4' }
                    ]
                  : [
                      { label: 'HALAMAN SAMPUL (COVER PENELITIAN & IDENTITAS PELAKSANA)', page: '1' },
                      { label: 'DAFTAR ISI', page: '2' },
                      ...(isJournalActive
                        ? [{ label: 'ABSTRAK KAJIAN ILMIAH & KATA KUNCI (ABSTRACT & KEYWORDS)', page: '2' }]
                        : []),
                      { label: 'A. PENDAHULUAN (UMUM, MAKSUD & TUJUAN, RUANG LINGKUP, DASAR HUKUM)', page: '3' },
                      ...(isJournalActive
                        ? [{ label: '   • TINJAUAN PUSTAKA & KAJIAN JURNAL ILMIAH PEKERJAAN SOSIAL', page: '3' }]
                        : []),
                      { label: 'B. KEGIATAN YANG DILAKSANAKAN & METODOLOGI INTERVENSI', page: '3' },
                      { label: 'C. HASIL YANG DICAPAI & PEMBAHASAN ILMIAH', page: '3' },
                      { label: 'D. SIMPULAN DAN SARAN', page: '3' },
                      { label: 'E. REKOMENDASI TINDAK LANJUT', page: '3' },
                      { label: 'F. PENUTUP & PENGESAHAN', page: '3' },
                      ...(isJournalActive
                        ? [{ label: 'DAFTAR PUSTAKA / REFERENSI JURNAL ILMIAH (APA STYLE)', page: '3' }]
                        : []),
                      { label: 'LAMPIRAN DOKUMENTASI KEGIATAN', page: '4' }
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full flex items-baseline justify-between gap-2 text-justify leading-snug"
                  >
                    <span
                      className={
                        item.label.startsWith('   •')
                          ? 'font-normal pl-4 text-justify'
                          : 'font-semibold text-justify'
                      }
                    >
                      {item.label}
                    </span>
                    <span
                      className="flex-1 min-w-[1.5rem] border-b-[1.5px] border-dotted border-black/80 mx-1.5"
                      aria-hidden="true"
                    />
                    <span className="font-bold shrink-0 text-right tabular-nums min-w-[3.2rem]">
                      Hal. {item.page}
                    </span>
                  </div>
                ))}
              </div>

              {/* DAFTAR TABEL & DAFTAR LAMPIRAN (JUSTIFY RATA KANAN KIRI OTOMATIS) */}
              <div className="w-full mt-3.5 pt-2.5 border-t border-black/60 text-[10.5pt] space-y-1.5 text-justify">
                <p className="font-bold uppercase text-left">Daftar Tabel & Lampiran:</p>
                <div className="w-full flex items-baseline justify-between gap-2 text-justify leading-snug">
                  <span className="text-justify">
                    Tabel 1.1 Matriks Rekapitulasi Pelaksanaan Kegiatan, Hasil, Kendala, dan Saran
                  </span>
                  <span
                    className="flex-1 min-w-[1.5rem] border-b-[1.5px] border-dotted border-black/80 mx-1.5"
                    aria-hidden="true"
                  />
                  <span className="font-bold shrink-0 text-right tabular-nums min-w-[3.2rem]">
                    Hal. 3
                  </span>
                </div>
                <div className="w-full flex items-baseline justify-between gap-2 text-justify leading-snug">
                  <span className="text-justify">
                    Lampiran 1. Dokumentasi Visual Pelaksanaan Intervensi & Bimbingan Peserta Didik
                  </span>
                  <span
                    className="flex-1 min-w-[1.5rem] border-b-[1.5px] border-dotted border-black/80 mx-1.5"
                    aria-hidden="true"
                  />
                  <span className="font-bold shrink-0 text-right tabular-nums min-w-[3.2rem]">
                    Hal. 4
                  </span>
                </div>
              </div>
            </div>

            {/* BAGIAN BAWAH HALAMAN 2: ABSTRAK KAJIAN ILMIAH & KATA KUNCI (JIKA JURNAL ILMIAH AKTIF) */}
            {isJournalActive && (
              <div className="mt-5 border-2 border-black p-4 bg-slate-50/30 avoid-break">
                <div className="text-center border-b border-black pb-2 mb-2.5">
                  <h3 className="font-bold text-[11.5pt] uppercase tracking-wider">
                    ABSTRAK KAJIAN ILMIAH & RINGKASAN EKSEKUTIF (ABSTRACT)
                  </h3>
                  <p className="text-[9.5pt] font-semibold text-slate-800 mt-0.5">
                    {outputs.nama || inputs.nama} (NIP. {outputs.nip || inputs.nip}) —{' '}
                    {inputs.kopUnitKerja || 'Sekolah Rakyat Terintegrasi 31 Palembang'}
                  </p>
                </div>

                <div className="text-[10.5pt] text-justify leading-relaxed italic">
                  <Editable
                    html={outputs.khususAbstrak || fallbackSpecial.khususAbstrak}
                    onChange={(v) => handleContentEdit('khususAbstrak', v)}
                    className="block"
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-black/40 text-[10pt]">
                  <strong>Kata Kunci (Keywords): </strong>
                  <Editable
                    html={outputs.khususKataKunci || fallbackSpecial.khususKataKunci}
                    onChange={(v) => handleContentEdit('khususKataKunci', v)}
                    className="italic font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {inputs.tampilkanNomorHalaman && (
            <div className="mt-4 pt-2 w-full flex items-center justify-center text-[9pt] text-gray-500 print:text-black avoid-break">
              {getPageNumberText(2, 4)}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          HALAMAN 3: ISI LAPORAN (MODE KHUSUS BAB A-G/H vs MODE STANDAR BAB A-F)
         ===================================================================== */}
      {isSpecialMode ? (
        <>
          <div
            className={`${paperClass} ${showResearchCover ? 'page-break-before' : ''}`}
            style={paperStyle}
          >
            {renderKopSurat()}

            {/* JUDUL BAB ISI (2 Spasi di bawah Kop Naskah Dinas sesuai Permensos No. 8 Tahun 2022) */}
            <div
              className="title-section avoid-break text-center font-bold mb-4"
              style={{
                fontFamily: activeFontJudul,
                fontSize: activeSizeJudul,
              }}
            >
              <p className="uppercase m-0">
                {isJournalActive
                  ? 'LAPORAN PELAKSANAAN KEGIATAN & KAJIAN INTERVENSI ILMIAH'
                  : 'LAPORAN PELAKSANAAN KEGIATAN'}
              </p>
              <p className="uppercase m-0 leading-tight mt-0.5">
                <Editable
                  html={outputs.judul || inputs.judul}
                  onChange={(v) => handleContentEdit('judul', v)}
                />
              </p>
              {inputs.nomorSurat && (
                <p className="text-[0.85em] font-normal my-0.5 text-black">
                  NOMOR:{' '}
                  <Editable
                    html={inputs.nomorSurat}
                    onChange={(v) => setInputs((prev) => ({ ...prev, nomorSurat: v }))}
                  />
                </p>
              )}
            </div>

            {/* BAB A s.d. G/H */}
            <div className="laporan-content space-y-3">
              <ol className="list-alpha font-bold pl-6 space-y-3">
                {/* A. Latar Belakang */}
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>Latar Belakang</span>
                  <Editable
                    html={outputs.khususLatarBelakang || fallbackSpecial.khususLatarBelakang}
                    onChange={(v) => handleContentEdit('khususLatarBelakang', v)}
                    className="font-normal block mt-1 text-justify whitespace-pre-line"
                  />
                </li>

                {/* B. Dasar Pelaksanaan Kegiatan */}
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>Dasar Pelaksanaan Kegiatan</span>
                  <div className="font-normal mt-1 text-justify">
                    <Editable
                      html={outputs.khususDasarPelaksanaan || fallbackSpecial.khususDasarPelaksanaan}
                      onChange={(v) => handleContentEdit('khususDasarPelaksanaan', v)}
                      className="block mb-1"
                    />
                    <div className="font-bold mt-1">1. Dasar Hukum:</div>
                    <ol className="list-num pl-5 mt-0.5 mb-1.5 space-y-0.5 font-normal leading-snug">
                      {DASAR_HUKUM_LIST.map((item, idx) => (
                        <li key={idx}>
                          <Editable
                            html={outputs[`dasarHukum_${idx}`] || item}
                            onChange={(v) => handleContentEdit(`dasarHukum_${idx}`, v)}
                          />
                        </li>
                      ))}
                    </ol>
                    <div className="font-bold mt-1">2. Dasar Pelaksanaan Operasional:</div>
                    <ol className="list-num pl-5 mt-0.5 space-y-0.5 font-normal leading-snug">
                      {Boolean(inputs.sertakanDetailSuratTugas) && (
                        <li>
                          Surat Tugas {inputs.pemberiTugas || 'Direktur / Pimpinan'} Nomor:{' '}
                          {inputs.nomorSuratTugas || 'ST-088/SRT.31/PLM/08/2026'} tanggal{' '}
                          {inputs.tanggalSuratTugas || inputs.tanggal || '10 Agustus 2026'}.
                        </li>
                      )}
                      {Boolean(inputs.aktifFiturPelatihan) && (
                        <li>
                          Kurikulum dan Modul Pelatihan Wali Asuh Sekolah Rakyat Tahun 2026,{' '}
                          {inputs.penyelenggaraPelatihan || 'Pusdiklatbangprof Kementerian Sosial RI'}.
                        </li>
                      )}
                      {DASAR_PELAKSANAAN_LIST.map((item, idx) => (
                        <li key={idx}>
                          <Editable
                            html={outputs[`dasarPelaksanaan_${idx}`] || item}
                            onChange={(v) => handleContentEdit(`dasarPelaksanaan_${idx}`, v)}
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                </li>

                {/* C. Tujuan Kegiatan & Tinjauan Pustaka Jurnal Ilmiah */}
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>
                    {isJournalActive
                      ? 'Tujuan Kegiatan & Tinjauan Pustaka Jurnal Ilmiah (Literature Review)'
                      : 'Tujuan Kegiatan'}
                  </span>
                  <Editable
                    html={outputs.khususTujuan || fallbackSpecial.khususTujuan}
                    onChange={(v) => handleContentEdit('khususTujuan', v)}
                    className="font-normal block mt-1 text-justify whitespace-pre-line"
                  />

                  {isJournalActive && (
                    <div className="mt-2 pt-2 border-t border-black/30 font-normal text-justify space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 no-print bg-indigo-50/80 p-2 rounded-lg border border-indigo-200 text-[10.5px]">
                        <span className="font-bold text-indigo-950 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Sisipkan Kutipan Jurnal Ilmiah / Teori Peksos:
                        </span>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const preset = SCIENTIFIC_JOURNAL_PRESETS.find((p) => p.id === e.target.value);
                            if (!preset) return;
                            setOutputs((prev) => {
                              const currentRefs =
                                Array.isArray(prev.khususReferensi) && prev.khususReferensi.length > 0
                                  ? prev.khususReferensi
                                  : fallbackSpecial.khususReferensi;
                              const updatedRefs = currentRefs.includes(preset.sitasiApa)
                                ? currentRefs
                                : [preset.sitasiApa, ...currentRefs];
                              return {
                                ...prev,
                                khususKajianTeori: `${preset.kutipanTeori}\n\n${
                                  prev.khususKajianTeori || fallbackSpecial.khususKajianTeori
                                }`.trim(),
                                khususReferensi: updatedRefs
                              };
                            });
                            e.target.value = '';
                          }}
                          className="p-1 border border-indigo-300 rounded bg-white text-slate-900 font-semibold cursor-pointer"
                        >
                          <option value="">— + Pilih Jurnal SINTA / Internasional —</option>
                          {SCIENTIFIC_JOURNAL_PRESETS.map((jp) => (
                            <option key={jp.id} value={jp.id}>
                              {jp.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <strong className="block">
                          Tinjauan Pustaka & Landasan Teori Jurnal Ilmiah:
                        </strong>
                        <Editable
                          html={outputs.khususKajianTeori || fallbackSpecial.khususKajianTeori}
                          onChange={(v) => handleContentEdit('khususKajianTeori', v)}
                          className="block mt-0.5 whitespace-pre-line"
                        />
                      </div>

                      <div>
                        <strong className="block">
                          Metodologi Kajian & Desain Intervensi Pekerjaan Sosial:
                        </strong>
                        <Editable
                          html={
                            outputs.khususMetodologiIlmiah ||
                            fallbackSpecial.khususMetodologiIlmiah
                          }
                          onChange={(v) => handleContentEdit('khususMetodologiIlmiah', v)}
                          className="block mt-0.5 whitespace-pre-line"
                        />
                      </div>
                    </div>
                  )}
                </li>

                {/* D. Pelaksanaan Kegiatan */}
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>Pelaksanaan Kegiatan</span>
                  <Editable
                    html={outputs.khususPelaksanaan || fallbackSpecial.khususPelaksanaan}
                    onChange={(v) => handleContentEdit('khususPelaksanaan', v)}
                    className="font-normal block mt-1 text-justify whitespace-pre-line"
                  />
                </li>

                {/* E. Hasil Kegiatan & Pembahasan Ilmiah */}
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>
                    {isJournalActive
                      ? 'Hasil Kegiatan & Pembahasan Ilmiah (Evidence-Based Discussion)'
                      : 'Hasil Kegiatan'}
                  </span>
                  <Editable
                    html={outputs.khususHasil || fallbackSpecial.khususHasil}
                    onChange={(v) => handleContentEdit('khususHasil', v)}
                    className="font-normal block mt-1 text-justify whitespace-pre-line"
                  />
                  {isJournalActive && (
                    <div className="mt-1.5 font-normal text-justify">
                      <strong>Analisis & Pembahasan Ilmiah: </strong>
                      <Editable
                        html={
                          outputs.khususPembahasanIlmiah ||
                          fallbackSpecial.khususPembahasanIlmiah
                        }
                        onChange={(v) => handleContentEdit('khususPembahasanIlmiah', v)}
                        className="block mt-0.5 whitespace-pre-line"
                      />
                    </div>
                  )}
                </li>

                {/* F. Kendala dan Tindak Lanjut */}
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>Kendala dan Tindak Lanjut</span>
                  <ol className="list-num font-normal pl-5 mt-1 space-y-1.5 text-justify">
                    <li>
                      <strong>Kendala yang Dihadapi:</strong>
                      <br />
                      <Editable
                        html={outputs.khususKendala || fallbackSpecial.khususKendala}
                        onChange={(v) => handleContentEdit('khususKendala', v)}
                        className="block mt-0.5"
                      />
                    </li>
                    <li>
                      <strong>Tindak Lanjut (Rencana Tindak Lanjut):</strong>
                      <br />
                      <Editable
                        html={outputs.khususTindakLanjut || fallbackSpecial.khususTindakLanjut}
                        onChange={(v) => handleContentEdit('khususTindakLanjut', v)}
                        className="block mt-0.5"
                      />
                    </li>
                  </ol>
                </li>

                {/* G. Simpulan dan Saran */}
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <span>Simpulan dan Saran</span>
                  <ol className="list-num font-normal pl-5 mt-1 space-y-1.5 text-justify">
                    <li>
                      <strong>Simpulan:</strong>
                      <br />
                      <Editable
                        html={outputs.khususSimpulan || fallbackSpecial.khususSimpulan}
                        onChange={(v) => handleContentEdit('khususSimpulan', v)}
                        className="block mt-0.5"
                      />
                    </li>
                    <li>
                      <strong>Saran:</strong>
                      <br />
                      <Editable
                        html={outputs.khususSaran || fallbackSpecial.khususSaran}
                        onChange={(v) => handleContentEdit('khususSaran', v)}
                        className="block mt-0.5 whitespace-pre-line"
                      />
                    </li>
                  </ol>
                </li>

                {/* H. Daftar Pustaka / Referensi Jurnal Ilmiah (APA 7th Edition) */}
                {isJournalActive && (
                  <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>Daftar Pustaka / Referensi Jurnal Ilmiah (APA Style)</span>
                      <button
                        type="button"
                        onClick={handleAddReference}
                        className="no-print px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Referensi APA</span>
                      </button>
                    </div>
                    <div className="font-normal mt-1.5 space-y-1.5 text-[10.5pt] text-justify">
                      {referencesList.map((refItem, refIdx) => (
                        <div
                          key={refIdx}
                          className="pl-6 -indent-6 flex items-start justify-between gap-2 group"
                        >
                          <div className="flex-1">
                            <Editable
                              html={refItem}
                              onChange={(v) => handleUpdateReference(refIdx, v)}
                              className="block"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReference(refIdx)}
                            className="no-print opacity-0 group-hover:opacity-100 p-0.5 text-red-600 hover:bg-red-50 rounded cursor-pointer shrink-0 indent-0"
                            title="Hapus Referensi"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </li>
                )}
              </ol>

              {/* TABEL MATRIKS PELAKSANAAN KEGIATAN */}
              <div className="mt-5 pt-2 avoid-break">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[11.5pt] uppercase">
                    TABEL REKAPITULASI PELAKSANAAN KEGIATAN (RHK {inputs.rhk === 'custom' ? 'KHUSUS' : inputs.rhk})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTableRow}
                    className="no-print px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <table className="w-full border-collapse border border-black text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-8">No</th>
                      <th className="border border-black p-1.5 w-24">Tanggal Kegiatan</th>
                      <th className="border border-black p-1.5 w-36">Nama Kegiatan</th>
                      <th className="border border-black p-1.5">Hasil Kegiatan</th>
                      <th className="border border-black p-1.5 w-32">Kendala</th>
                      <th className="border border-black p-1.5 w-32">Saran</th>
                      <th className="border border-black p-1 w-7 no-print">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, rIdx) => (
                      <tr key={row.id || rIdx} className="align-top">
                        <td className="border border-black p-1.5 text-center font-bold tabular-nums">
                          {rIdx + 1}
                        </td>
                        <td className="border border-black p-1.5">
                          <Editable
                            html={row.tanggal}
                            onChange={(v) => handleUpdateTableRow(rIdx, 'tanggal', v)}
                            className="block"
                          />
                        </td>
                        <td className="border border-black p-1.5 font-semibold">
                          <Editable
                            html={row.namaKegiatan}
                            onChange={(v) => handleUpdateTableRow(rIdx, 'namaKegiatan', v)}
                            className="block"
                          />
                        </td>
                        <td className="border border-black p-1.5">
                          <Editable
                            html={row.hasilKegiatan}
                            onChange={(v) => handleUpdateTableRow(rIdx, 'hasilKegiatan', v)}
                            className="block"
                          />
                        </td>
                        <td className="border border-black p-1.5">
                          <Editable
                            html={row.kendala}
                            onChange={(v) => handleUpdateTableRow(rIdx, 'kendala', v)}
                            className="block"
                          />
                        </td>
                        <td className="border border-black p-1.5">
                          <Editable
                            html={row.saran}
                            onChange={(v) => handleUpdateTableRow(rIdx, 'saran', v)}
                            className="block"
                          />
                        </td>
                        <td className="border border-black p-1 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteTableRow(rIdx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TANDA TANGAN */}
              {renderSignatureSection()}
            </div>

            {inputs.tampilkanNomorHalaman && (
              <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] text-gray-500 print:text-black avoid-break shrink-0">
                {getPageNumberText(showResearchCover ? 3 : 1, showResearchCover ? 4 : 2)}
              </div>
            )}
          </div>
        </>
      ) : (
        /* =====================================================================
           MODE 2: FORMAT LAPORAN STANDAR (DEFAULT PERMENSOS NO. 8 TAHUN 2022)
           ===================================================================== */
        <div
          className={`${paperClass} ${showResearchCover ? 'page-break-before' : ''}`}
          style={paperStyle}
        >
          {showPageBreakLines && (
            <div className="absolute inset-0 pointer-events-none print:hidden overflow-hidden z-20">
              {[1, 2, 3].map((pageNum) => (
                <div
                  key={pageNum}
                  style={{ top: `${pageNum * paperHeightMm}mm` }}
                  className="absolute left-0 right-0 border-b-2 border-dashed border-blue-500/70 flex items-center justify-center -translate-y-1/2"
                >
                  <span className="bg-slate-900 text-white font-mono font-semibold text-[10px] px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5">
                    <Scissors className="w-3 h-3 rotate-90 text-amber-300" />
                    <span>
                      Batas Akhir Halaman {pageNum} ({currentPaperSize} · {pageNum * paperHeightMm}mm)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {renderKopSurat()}

          {/* TITLE SECTION (2 Spasi di bawah Kop Naskah Dinas sesuai Permensos No. 8 Tahun 2022) */}
          <div
            className="title-section avoid-break text-center font-bold mb-3"
            style={{
              fontFamily: activeFontJudul,
              fontSize: activeSizeJudul,
            }}
          >
            <p className="uppercase m-0">LAPORAN TENTANG</p>
            <p className="uppercase m-0 leading-tight mt-0.5 mb-0.5">
              <Editable
                html={outputs.judul || inputs.judul}
                onChange={(v) => handleContentEdit('judul', v)}
              />
            </p>
            {inputs.nomorSurat && (
              <p className="text-[0.85em] font-normal my-0.5 text-black tracking-wider">
                NOMOR:{' '}
                <Editable
                  html={inputs.nomorSurat}
                  onChange={(v) => setInputs((prev) => ({ ...prev, nomorSurat: v }))}
                />
              </p>
            )}
            <p className="uppercase m-0">
              {inputs.kopUnitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG'}
            </p>
          </div>

          {/* CONTENT SECTIONS */}
          <div
            className="laporan-content flex-1 relative"
            style={{
              fontSize: activeSizeIsi,
              lineHeight: inputs.lineHeight || '1.5',
            }}
          >
            <ol className="list-alpha font-bold pl-6 space-y-2">
              {/* A. Pendahuluan */}
              <li style={{ marginBottom: inputs.paragraphSpacing }}>
                <Editable
                  html={outputs.headerPendahuluan || 'Pendahuluan'}
                  onChange={(v) => handleContentEdit('headerPendahuluan', v)}
                />
                <ol className="list-num font-normal pl-6 mt-1 space-y-1">
                  <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerUmum || 'UMUM'}
                        onChange={(v) => handleContentEdit('headerUmum', v)}
                      />
                    </strong>
                    <br />
                    <Editable
                      html={outputs.umum}
                      onChange={(v) => handleContentEdit('umum', v)}
                      className="block mt-0.5 text-justify"
                    />
                  </li>

                  <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerMaksudTujuan || 'Maksud dan tujuan'}
                        onChange={(v) => handleContentEdit('headerMaksudTujuan', v)}
                      />
                    </strong>
                    <ol className="list-num-lower pl-6 mt-0.5 space-y-0.5">
                      <li style={{ marginBottom: inputs.paragraphSpacing }}>
                        <strong>
                          <Editable
                            html={outputs.headerMaksud || 'Maksud'}
                            onChange={(v) => handleContentEdit('headerMaksud', v)}
                          />
                        </strong>
                        <br />
                        <Editable
                          html={outputs.maksud}
                          onChange={(v) => handleContentEdit('maksud', v)}
                          className="block mt-0.5 text-justify"
                        />
                      </li>
                      <li style={{ marginBottom: inputs.paragraphSpacing }}>
                        <strong>
                          <Editable
                            html={outputs.headerTujuan || 'Tujuan'}
                            onChange={(v) => handleContentEdit('headerTujuan', v)}
                          />
                        </strong>
                        <br />
                        <Editable
                          html={outputs.tujuan}
                          onChange={(v) => handleContentEdit('tujuan', v)}
                          className="block mt-0.5 text-justify"
                        />
                      </li>
                    </ol>
                  </li>

                  <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerRuangLingkup || 'Ruang Lingkup'}
                        onChange={(v) => handleContentEdit('headerRuangLingkup', v)}
                      />
                    </strong>
                    <br />
                    <Editable
                      html={outputs.ruang}
                      onChange={(v) => handleContentEdit('ruang', v)}
                      className="block mt-0.5 text-justify"
                    />
                  </li>

                  {/* DASAR HUKUM */}
                  <li style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerDasar || 'Dasar'}
                        onChange={(v) => handleContentEdit('headerDasar', v)}
                      />
                    </strong>
                    <br />
                    <div className="block mt-1 text-justify">
                      <Editable
                        html={outputs.dasar}
                        onChange={(v) => handleContentEdit('dasar', v)}
                      />

                      <div className="mt-1.5 font-bold uppercase">
                        <Editable
                          html={outputs.headerDasarHukum || 'DASAR HUKUM'}
                          onChange={(v) => handleContentEdit('headerDasarHukum', v)}
                        />
                      </div>
                      <ol className="list-num pl-5 mt-0.5 mb-1 space-y-0.5 font-normal leading-snug">
                        {DASAR_HUKUM_LIST.map((item, idx) => (
                          <li key={idx}>
                            <Editable
                              html={outputs[`dasarHukum_${idx}`] || item}
                              onChange={(v) => handleContentEdit(`dasarHukum_${idx}`, v)}
                            />
                          </li>
                        ))}
                      </ol>

                      <div className="font-bold mt-1">
                        <Editable
                          html={outputs.headerDasarPelaksanaan || 'Dasar Pelaksanaan'}
                          onChange={(v) => handleContentEdit('headerDasarPelaksanaan', v)}
                        />
                      </div>
                      <div className="font-normal">Pelaksanaan kegiatan mengacu pada:</div>
                      <ol className="list-num pl-5 mt-0.5 space-y-0.5 font-normal leading-snug">
                        {Boolean(inputs.sertakanDetailSuratTugas) && (
                          <li>
                            <Editable
                              html={
                                outputs.dasarPelaksanaan_st ||
                                `Surat Tugas ${inputs.pemberiTugas || 'Direktur / Pimpinan'} Nomor: ${inputs.nomorSuratTugas || 'ST-088/SRT.31/PLM/08/2026'} tanggal ${inputs.tanggalSuratTugas || inputs.tanggal || '10 Agustus 2026'} perihal ${outputs.judul || inputs.judul}.`
                              }
                              onChange={(v) => handleContentEdit('dasarPelaksanaan_st', v)}
                            />
                          </li>
                        )}
                        {Boolean(inputs.aktifFiturPelatihan) && (
                          <li>
                            <Editable
                              html={
                                outputs.dasarPelaksanaan_modul ||
                                `Kurikulum dan Modul Pelatihan Wali Asuh Sekolah Rakyat Tahun 2026, ${inputs.penyelenggaraPelatihan || 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kementerian Sosial RI'}.`
                              }
                              onChange={(v) => handleContentEdit('dasarPelaksanaan_modul', v)}
                            />
                          </li>
                        )}
                        {DASAR_PELAKSANAAN_LIST.map((item, idx) => (
                          <li key={idx}>
                            <Editable
                              html={outputs[`dasarPelaksanaan_${idx}`] || item}
                              onChange={(v) => handleContentEdit(`dasarPelaksanaan_${idx}`, v)}
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  </li>

                  {/* 5. Tinjauan Pustaka & Kajian Jurnal Ilmiah (jika aktif di Mode Standar) */}
                  {isJournalActive && (
                    <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                      <strong>Tinjauan Pustaka & Kajian Jurnal Ilmiah</strong>
                      <br />
                      <Editable
                        html={outputs.khususKajianTeori || fallbackSpecial.khususKajianTeori}
                        onChange={(v) => handleContentEdit('khususKajianTeori', v)}
                        className="block mt-0.5 text-justify whitespace-pre-line"
                      />
                    </li>
                  )}
                </ol>
              </li>

              {/* B. Kegiatan */}
              <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                <Editable
                  html={outputs.headerKegiatan || 'Kegiatan yang dilaksanakan'}
                  onChange={(v) => handleContentEdit('headerKegiatan', v)}
                />
                <br />
                <Editable
                  html={outputs.kegiatan}
                  onChange={(v) => handleContentEdit('kegiatan', v)}
                  className="font-normal block mt-0.5 text-justify"
                />
              </li>

              {/* C. Hasil */}
              <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                <Editable
                  html={outputs.headerHasil || 'Hasil yang dicapai'}
                  onChange={(v) => handleContentEdit('headerHasil', v)}
                />
                <br />
                <Editable
                  html={outputs.hasil}
                  onChange={(v) => handleContentEdit('hasil', v)}
                  className="font-normal block mt-0.5 text-justify"
                />
                {isJournalActive && (
                  <div className="mt-1 font-normal text-justify">
                    <strong>Pembahasan Ilmiah: </strong>
                    <Editable
                      html={outputs.khususPembahasanIlmiah || fallbackSpecial.khususPembahasanIlmiah}
                      onChange={(v) => handleContentEdit('khususPembahasanIlmiah', v)}
                      className="block mt-0.5"
                    />
                  </div>
                )}
              </li>

              {/* D. Simpulan dan Saran */}
              <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                <Editable
                  html={outputs.headerSimpulanSaran || 'Simpulan dan Saran'}
                  onChange={(v) => handleContentEdit('headerSimpulanSaran', v)}
                />
                <ol className="list-num font-normal pl-6 mt-0.5 space-y-0.5">
                  <li style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerSimpulan || 'Simpulan'}
                        onChange={(v) => handleContentEdit('headerSimpulan', v)}
                      />
                    </strong>
                    <br />
                    <Editable
                      html={outputs.simpulan}
                      onChange={(v) => handleContentEdit('simpulan', v)}
                      className="block mt-0.5 text-justify"
                    />
                  </li>
                  <li style={{ marginBottom: inputs.paragraphSpacing }}>
                    <strong>
                      <Editable
                        html={outputs.headerSaran || 'Saran'}
                        onChange={(v) => handleContentEdit('headerSaran', v)}
                      />
                    </strong>
                    <br />
                    <Editable
                      html={outputs.saran}
                      onChange={(v) => handleContentEdit('saran', v)}
                      className="block mt-0.5 text-justify"
                    />
                  </li>
                </ol>
              </li>

              {/* E. Rekomendasi */}
              <li className="avoid-break group/rekomendasi relative" style={{ marginBottom: inputs.paragraphSpacing }}>
                <div className="flex flex-wrap items-center justify-between no-print mb-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] gap-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Variasi Rekomendasi Dinamis:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {getRecommendationVariations({
                      rhk: inputs.rhk,
                      judul: inputs.judul,
                      permasalahan: inputs.permasalahan,
                      solusi: inputs.solusi
                    }).map((varItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setOutputs((prev) => ({ ...prev, rekomendasi: varItem.text }));
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-slate-900 hover:text-white text-slate-800 text-[10.5px] font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        <span>{varItem.label.split(' ')[0]} {varItem.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Editable
                  html={outputs.headerRekomendasi || 'Rekomendasi Laporan'}
                  onChange={(v) => handleContentEdit('headerRekomendasi', v)}
                />
                <br />
                <Editable
                  html={
                    outputs.rekomendasi ||
                    generateDynamicRecommendation({
                      rhk: inputs.rhk,
                      judul: inputs.judul,
                      permasalahan: inputs.permasalahan,
                      solusi: inputs.solusi
                    })
                  }
                  onChange={(v) => handleContentEdit('rekomendasi', v)}
                  className="font-normal block mt-0.5 text-justify whitespace-pre-line"
                />
              </li>

              {/* F. Penutup + Daftar Pustaka + Tanda Tangan Wali Asuh */}
              <li className="avoid-break penutup-signature-group" style={{ marginBottom: inputs.paragraphSpacing }}>
                <Editable
                  html={outputs.headerPenutup || 'Penutup'}
                  onChange={(v) => handleContentEdit('headerPenutup', v)}
                />
                <br />
                <Editable
                  html={outputs.penutup}
                  onChange={(v) => handleContentEdit('penutup', v)}
                  className="font-normal block mt-0.5 text-justify"
                />

                {isJournalActive && (
                  <div className="mt-3 pt-2 border-t border-black/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase text-[11pt]">
                        Daftar Pustaka / Referensi Jurnal Ilmiah (APA Style)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddReference}
                        className="no-print px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Referensi</span>
                      </button>
                    </div>
                    <div className="font-normal space-y-1 text-[10pt] text-justify">
                      {referencesList.map((refItem, refIdx) => (
                        <div key={refIdx} className="pl-6 -indent-6">
                          <Editable
                            html={refItem}
                            onChange={(v) => handleUpdateReference(refIdx, v)}
                            className="block"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {renderSignatureSection()}
              </li>
            </ol>
          </div>

          {inputs.tampilkanNomorHalaman && (
            <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
              <Editable
                html={getPageNumberText(showResearchCover ? 3 : 1, showResearchCover ? 4 : 2)}
                onChange={(v) => setInputs((prev) => ({ ...prev, formatNomorHalaman: v }))}
                className="font-medium"
              />
            </div>
          )}
        </div>
      )}

      {/* HALAMAN TERAKHIR: LAMPIRAN DOKUMENTASI KEGIATAN */}
      <div
        className={`${paperClass} page-break-before flex flex-col items-center relative`}
        style={paperStyle}
      >
        <div
          className="text-center font-bold mb-6 uppercase w-full avoid-break"
          style={{
            fontFamily: activeFontJudul,
            fontSize: activeSizeJudul,
          }}
        >
          LAMPIRAN DOKUMENTASI KEGIATAN
        </div>

        <input
          type="file"
          ref={foto1InputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePreviewPhotoUpload('foto1Src', e)}
        />
        <input
          type="file"
          ref={foto2InputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePreviewPhotoUpload('foto2Src', e)}
        />

        <div className="space-y-8 flex flex-col items-center justify-center w-full flex-grow">
          {inputs.foto1Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break relative group">
              <div className="relative cursor-pointer" onClick={() => foto1InputRef.current?.click()} title="Klik untuk mengganti Foto 1">
                <img
                  src={inputs.foto1Src}
                  alt="Dokumentasi 1"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-80 object-contain border border-gray-400 p-1 shadow-xs"
                />
                <div className="no-print absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-sans font-semibold">
                  <Upload className="w-3 h-3 text-blue-300" /> Ganti Foto 1
                </div>
              </div>
              <p className="text-sm mt-3 italic text-gray-800 font-bold cursor-text">
                <Editable
                  html={inputs.foto1Caption || 'Foto 1. Pelaksanaan Kegiatan'}
                  onChange={(v) => setInputs((prev) => ({ ...prev, foto1Caption: v }))}
                />
              </p>
            </div>
          )}

          {inputs.foto2Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break relative group">
              <div className="relative cursor-pointer" onClick={() => foto2InputRef.current?.click()} title="Klik untuk mengganti Foto 2">
                <img
                  src={inputs.foto2Src}
                  alt="Dokumentasi 2"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-80 object-contain border border-gray-400 p-1 shadow-xs"
                />
                <div className="no-print absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-sans font-semibold">
                  <Upload className="w-3 h-3 text-blue-300" /> Ganti Foto 2
                </div>
              </div>
              <p className="text-sm mt-3 italic text-gray-800 font-bold cursor-text">
                <Editable
                  html={inputs.foto2Caption || 'Foto 2. Kondisi Lapangan'}
                  onChange={(v) => setInputs((prev) => ({ ...prev, foto2Caption: v }))}
                />
              </p>
            </div>
          )}

          {!hasPhotos && !focusActive && (
            <div className="w-full max-w-2xl p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 bg-slate-50 avoid-break rounded-xl no-print">
              <div className="w-10 h-10 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center mb-2.5">
                <Camera className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-slate-800 mb-1">Upload Foto Dokumentasi Kegiatan</p>
              <p className="text-xs text-slate-500 mb-4 text-center max-w-md">
                Foto akan otomatis dikompresi dan ditampilkan pada halaman Lampiran Dokumentasi.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => foto1InputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Unggah Foto 1
                </button>
                <button
                  type="button"
                  onClick={() => foto2InputRef.current?.click()}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Unggah Foto 2
                </button>
              </div>
            </div>
          )}
        </div>

        {inputs.tampilkanNomorHalaman && (
          <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
            <Editable
              html={getPageNumberText(showResearchCover ? 4 : 2, showResearchCover ? 4 : 2)}
              onChange={(v) => setInputs((prev) => ({ ...prev, formatNomorHalaman: v }))}
              className="font-medium"
            />
          </div>
        )}
      </div>
    </div>
  );
};
