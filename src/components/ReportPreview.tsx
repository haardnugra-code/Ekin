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
  Eye,
  Scissors,
  Layers,
  Ruler,
  FileText,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { ReportInputs, ReportOutputs } from '../types';
import { DASAR_HUKUM_LIST, DASAR_PELAKSANAAN_LIST } from '../data/presets';
import { getRecommendationVariations, generateDynamicRecommendation } from '../utils/recommendationGenerator';
import { compressImage } from '../utils/imageCompressor';

interface ReportPreviewProps {
  inputs: ReportInputs;
  outputs: ReportOutputs;
  setOutputs: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  isFocusMode?: boolean;
  setIsFocusMode?: React.Dispatch<React.SetStateAction<boolean>>;
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
  isFocusMode = false,
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
      className={`editable-text cursor-text focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:rounded px-0.5 transition-all ${className || ''}`}
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
}) => {
  const [internalFocusMode, setInternalFocusMode] = useState<boolean>(false);
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);

  const focusActive = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;
  const setFocusActive = externalSetIsFocusMode || setInternalFocusMode;

  const foto1InputRef = useRef<HTMLInputElement>(null);
  const foto2InputRef = useRef<HTMLInputElement>(null);

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

  // Detect text selection inside document preview for floating format toolbar
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

  const handleContainerFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && (target.isContentEditable || target.getAttribute('contenteditable') === 'true')) {
      if (!focusActive && setFocusActive) {
        setFocusActive(true);
      }
    }
  };

  const getPageNumberText = (pageIndex: number, totalPages: number) => {
    const format = inputs.formatNomorHalaman || '- {n} -';
    return format
      .replace('{n}', String(pageIndex))
      .replace('{total}', String(totalPages));
  };

  const hasPhotos = inputs.foto1Src || inputs.foto2Src;

  // Paper Size & Visual Page Break Configurations
  const currentPaperSize = inputs.paperSize || 'A4';
  const paperHeightMm = currentPaperSize === 'F4' ? 330 : currentPaperSize === 'Legal' ? 355.6 : 297;
  const paperWidthMm = currentPaperSize === 'F4' ? 215 : currentPaperSize === 'Legal' ? 215.9 : 210;
  const showPageBreakLines = inputs.showPageBreakLines !== false;

  return (
    <div
      id="document-preview"
      onFocusCapture={handleContainerFocus}
      className={`space-y-8 print:space-y-0 relative w-full flex flex-col items-center ${focusActive ? 'is-focus-mode' : ''}`}
    >
      {/* DYNAMIC PRINT PAGE SIZE INJECTION */}
      <style>{`
        @media print {
          @page {
            size: ${currentPaperSize === 'F4' ? '215mm 330mm' : currentPaperSize === 'Legal' ? 'legal portrait' : 'A4 portrait'};
            margin: 12mm 15mm 15mm 15mm !important;
          }
        }
      `}</style>

      {/* TOP RICH TEXT & FOCUS MODE TOOLBAR */}
      <div className="print:hidden mb-2 bg-white border border-gray-200/90 shadow-xs rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 max-w-3xl w-full transition-all">
        {!focusActive ? (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-1">
                Format:
              </span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('bold');
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-black transition-all cursor-pointer font-bold flex items-center gap-1 text-xs"
                title="Tebalkan Teks (Ctrl+B)"
              >
                <Bold className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Tebal</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('italic');
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-black transition-all cursor-pointer italic flex items-center gap-1 text-xs"
                title="Miringkan Teks (Ctrl+I)"
              >
                <Italic className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Miring</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('underline');
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-black transition-all cursor-pointer underline flex items-center gap-1 text-xs"
                title="Garis Bawahteks (Ctrl+U)"
              >
                <Underline className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Garis Bawah</span>
              </button>
              <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

              {/* UKURAN KERTAS SELECTOR */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                <Ruler className="w-3.5 h-3.5 text-indigo-600 ml-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, paperSize: 'A4' }))}
                  className={`px-2 py-0.5 rounded-lg transition-all text-[11px] cursor-pointer ${
                    currentPaperSize === 'A4'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="A4 (210 x 297 mm)"
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, paperSize: 'F4' }))}
                  className={`px-2 py-0.5 rounded-lg transition-all text-[11px] cursor-pointer ${
                    currentPaperSize === 'F4'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="F4 / Folio (215 x 330 mm)"
                >
                  F4
                </button>
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, paperSize: 'Legal' }))}
                  className={`px-2 py-0.5 rounded-lg transition-all text-[11px] cursor-pointer ${
                    currentPaperSize === 'Legal'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Legal (215.9 x 355.6 mm)"
                >
                  Legal
                </button>
              </div>

              {/* BATAS HALAMAN VISUAL TOGGLE */}
              <button
                type="button"
                onClick={() => setInputs((prev) => ({ ...prev, showPageBreakLines: !showPageBreakLines }))}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  showPageBreakLines
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
                title="Tampilkan / Sembunyikan Garis Batas Halaman Visual pada Pratinjau"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">Batas Halaman</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-Draft Saved
              </div>

              {/* Mode Switch Detail Surat Tugas & Pelatihan */}
              <button
                type="button"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    sertakanDetailSuratTugas: prev.sertakanDetailSuratTugas === false ? true : false,
                  }))
                }
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  inputs.sertakanDetailSuratTugas !== false
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                }`}
                title={
                  inputs.sertakanDetailSuratTugas !== false
                    ? 'Mode Surat Tugas & Pelatihan: AKTIF (ON). Klik untuk menonaktifkan (OFF)'
                    : 'Mode Surat Tugas & Pelatihan: NONAKTIF (OFF). Klik untuk mengaktifkan (ON)'
                }
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    inputs.sertakanDetailSuratTugas !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>Surat Tugas: {inputs.sertakanDetailSuratTugas !== false ? 'ON' : 'OFF'}</span>
              </button>

              {/* Mode Fokus Toggle Button */}
              <button
                type="button"
                onClick={() => setFocusActive(true)}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Aktifkan Mode Fokus untuk menyembunyikan header & sidebar saat mengetik"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mode Fokus</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-3 px-1 py-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
              <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Mode Fokus Aktif (Mengetik Bebas Gangguan — Header & Sidebar Disembunyikan)</span>
            </div>

            <button
              type="button"
              onClick={() => setFocusActive(false)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Keluar dari Mode Fokus dan kembali ke mode pengeditan penuh"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Kembali ke Mode Edit Penuh</span>
            </button>
          </div>
        )}
      </div>

      {/* FLOATING SELECTION TOOLBAR POPOVER */}
      {selectionPos && !focusActive && (
        <div
          style={{ top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
          className="print:hidden absolute z-40 bg-gray-900 text-white rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150 border border-gray-700"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
            className="p-1 hover:bg-gray-800 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 text-white"
            title="Tebal (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
            className="p-1 hover:bg-gray-800 rounded text-xs italic transition-colors cursor-pointer flex items-center gap-1 text-white"
            title="Miring (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5 text-sky-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('underline');
            }}
            className="p-1 hover:bg-gray-800 rounded text-xs underline transition-colors cursor-pointer flex items-center gap-1 text-white"
            title="Garis Bawah (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <div className="h-3 w-[1px] bg-gray-700 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('removeFormat');
            }}
            className="p-1 hover:bg-gray-800 rounded text-xs transition-colors cursor-pointer text-gray-300 hover:text-white"
            title="Hapus Format"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HALAMAN 1: ISI LAPORAN */}
      <div
        className={`a4-paper relative ${
          currentPaperSize === 'F4'
            ? 'paper-size-f4'
            : currentPaperSize === 'Legal'
            ? 'paper-size-legal'
            : 'paper-size-a4'
        }`}
        style={{
          fontFamily: inputs.fontIsi,
          fontSize: inputs.sizeIsi,
        }}
      >
        {/* VISUAL PAGE BREAK PREVIEW INDICATOR LINES */}
        {showPageBreakLines && (
          <div className="absolute inset-0 pointer-events-none print:hidden overflow-hidden z-20">
            {[1, 2, 3].map((pageNum) => (
              <div
                key={pageNum}
                style={{ top: `${pageNum * paperHeightMm}mm` }}
                className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-500/80 flex items-center justify-center -translate-y-1/2"
              >
                <span className="bg-indigo-700 text-white font-mono font-bold text-[10px] px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 opacity-95 border border-indigo-300">
                  <Scissors className="w-3.5 h-3.5 rotate-90 text-amber-300" />
                  <span>
                    Batas Akhir Halaman {pageNum} ({currentPaperSize} • {pageNum * paperHeightMm}mm)
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
        {/* KOP SURAT */}
        <div
          className="kop-surat avoid-break border-b-[4px] border-black pb-2.5 mb-3 flex items-center justify-between"
          style={{ borderBottomStyle: 'double' }}
        >
          {inputs.logoSrc ? (
            <div className="w-24 flex-shrink-0 pr-2 flex justify-center">
              <img
                id="out-logo"
                src={inputs.logoSrc}
                alt="Logo Kop Instansi 1"
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
                className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              >
                {inputs.kopInstansiUtama ?? 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA'}
              </h1>
            )}
            {(inputs.kopEselon1 ?? 'SEKRETARIAT JENDERAL') && (
              <h2
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, kopEselon1: e.currentTarget.innerText.trim() }))}
                className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              >
                {inputs.kopEselon1 ?? 'SEKRETARIAT JENDERAL'}
              </h2>
            )}
            {(inputs.kopEselon2 ?? 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI') && (
              <h2
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, kopEselon2: e.currentTarget.innerText.trim() }))}
                className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              >
                {inputs.kopEselon2 ?? 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI'}
              </h2>
            )}
            {(inputs.kopUnitKerja ?? 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG') && (
              <h2
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, kopUnitKerja: e.currentTarget.innerText.trim() }))}
                className="text-[1.1rem] font-bold uppercase mt-0.5 leading-snug cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              >
                {inputs.kopUnitKerja ?? 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG'}
              </h2>
            )}
            {(inputs.kopAlamat ?? 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com') && (
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, kopAlamat: e.currentTarget.innerText.trim() }))}
                className="text-[0.78rem] mt-0.5 font-serif leading-tight cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              >
                {inputs.kopAlamat ?? 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com'}
              </p>
            )}
          </div>

          {(inputs.showLogo2 !== false && inputs.logo2Src) ? (
            <div className="w-24 flex-shrink-0 pl-2 flex justify-center">
              <img
                id="out-logo-2"
                src={inputs.logo2Src}
                alt="Logo Kop Instansi 2"
                className="max-w-full h-auto max-h-20 object-contain"
              />
            </div>
          ) : inputs.logoSrc ? (
            <div className="w-24 flex-shrink-0 pl-2" />
          ) : null}
        </div>

        {/* TITLE SECTION */}
        <div
          className="title-section avoid-break text-center font-bold mb-3"
          style={{
            fontFamily: inputs.fontJudul,
            fontSize: inputs.sizeJudul,
          }}
        >
          <p
            contentEditable
            suppressContentEditableWarning
            className="uppercase m-0 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
          >
            LAPORAN TENTANG
          </p>
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
          <p
            contentEditable
            suppressContentEditableWarning
            className="uppercase m-0 cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 inline-block"
          >
            SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG
          </p>
        </div>

        {/* CONTENT SECTIONS */}
        <div
          className="laporan-content flex-1 relative"
          style={{
            fontSize: inputs.sizeIsi,
            lineHeight: inputs.lineHeight,
          }}
        >
          <ol className="list-alpha font-bold pl-6 space-y-2">
            {/* A. Pendahuluan */}
            <li style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerPendahuluan || "Pendahuluan"}
                onChange={(v) => handleContentEdit('headerPendahuluan', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <ol className="list-num font-normal pl-6 mt-1 space-y-1">
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerUmum || "UMUM"}
                      onChange={(v) => handleContentEdit('headerUmum', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <br />
                  <Editable
                    html={outputs.umum}
                    onChange={(v) => handleContentEdit('umum', v)}
                    className="block mt-0.5 font-serif text-justify"
                  />
                </li>

                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerMaksudTujuan || "Maksud dan tujuan"}
                      onChange={(v) => handleContentEdit('headerMaksudTujuan', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <ol className="list-num-lower pl-6 mt-0.5 space-y-0.5">
                    <li style={{ marginBottom: inputs.paragraphSpacing }}>
                      <strong>
                        <Editable
                          html={outputs.headerMaksud || "Maksud"}
                          onChange={(v) => handleContentEdit('headerMaksud', v)}
                          className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                        />
                      </strong>
                      <br />
                      <Editable
                        html={outputs.maksud}
                        onChange={(v) => handleContentEdit('maksud', v)}
                        className="block mt-0.5 font-serif text-justify"
                      />
                    </li>
                    <li style={{ marginBottom: inputs.paragraphSpacing }}>
                      <strong>
                        <Editable
                          html={outputs.headerTujuan || "Tujuan"}
                          onChange={(v) => handleContentEdit('headerTujuan', v)}
                          className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                        />
                      </strong>
                      <br />
                      <Editable
                        html={outputs.tujuan}
                        onChange={(v) => handleContentEdit('tujuan', v)}
                        className="block mt-0.5 font-serif text-justify"
                      />
                    </li>
                  </ol>
                </li>

                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerRuangLingkup || "Ruang Lingkup"}
                      onChange={(v) => handleContentEdit('headerRuangLingkup', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <br />
                  <Editable
                    html={outputs.ruang}
                    onChange={(v) => handleContentEdit('ruang', v)}
                    className="block mt-0.5 font-serif text-justify"
                  />
                </li>

                {/* DASAR HUKUM */}
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerDasar || "Dasar"}
                      onChange={(v) => handleContentEdit('headerDasar', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <br />
                  <div className="block mt-1 text-justify font-serif">
                    <Editable
                      html={outputs.dasar}
                      onChange={(v) => handleContentEdit('dasar', v)}
                    />

                    <div className="mt-1.5 font-bold uppercase">
                      <Editable
                        html={outputs.headerDasarHukum || "DASAR HUKUM"}
                        onChange={(v) => handleContentEdit('headerDasarHukum', v)}
                        className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
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
                        html={outputs.headerDasarPelaksanaan || "Dasar Pelaksanaan"}
                        onChange={(v) => handleContentEdit('headerDasarPelaksanaan', v)}
                        className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                      />
                    </div>
                    <div className="font-normal">Pelaksanaan kegiatan mengacu pada:</div>
                    <ol className="list-num pl-5 mt-0.5 space-y-0.5 font-normal leading-snug">
                      {inputs.sertakanDetailSuratTugas !== false && (inputs.nomorSuratTugas || inputs.rhk === '6') && (
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
                      {inputs.sertakanDetailSuratTugas !== false && (inputs.jenisPenugasan === 'pelatihan' || inputs.modulPelatihan) && (
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
              </ol>
            </li>

            {/* B. Kegiatan */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerKegiatan || "Kegiatan yang dilaksanakan"}
                onChange={(v) => handleContentEdit('headerKegiatan', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <br />
              <Editable
                html={outputs.kegiatan}
                onChange={(v) => handleContentEdit('kegiatan', v)}
                className="font-normal block mt-0.5 font-serif text-justify"
              />
            </li>

            {/* C. Hasil */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerHasil || "Hasil yang dicapai"}
                onChange={(v) => handleContentEdit('headerHasil', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <br />
              <Editable
                html={outputs.hasil}
                onChange={(v) => handleContentEdit('hasil', v)}
                className="font-normal block mt-0.5 font-serif text-justify"
              />
            </li>

            {/* D. Simpulan dan Saran */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerSimpulanSaran || "Simpulan dan Saran"}
                onChange={(v) => handleContentEdit('headerSimpulanSaran', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <ol className="list-num font-normal pl-6 mt-0.5 space-y-0.5">
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerSimpulan || "Simpulan"}
                      onChange={(v) => handleContentEdit('headerSimpulan', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <br />
                  <Editable
                    html={outputs.simpulan}
                    onChange={(v) => handleContentEdit('simpulan', v)}
                    className="block mt-0.5 font-serif text-justify"
                  />
                </li>
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>
                    <Editable
                      html={outputs.headerSaran || "Saran"}
                      onChange={(v) => handleContentEdit('headerSaran', v)}
                      className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </strong>
                  <br />
                  <Editable
                    html={outputs.saran}
                    onChange={(v) => handleContentEdit('saran', v)}
                    className="block mt-0.5 font-serif text-justify"
                  />
                </li>
              </ol>
            </li>

            {/* E. Rekomendasi */}
            <li className="avoid-break group/rekomendasi relative" style={{ marginBottom: inputs.paragraphSpacing }}>
              <div className="flex flex-wrap items-center justify-between no-print mb-1.5 bg-blue-50/90 p-2 rounded-xl border border-blue-200/80 text-[11px] gap-1.5 shadow-2xs">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-100" /> Variasi Rekomendasi Dinamis (Menyesuaikan Tema):
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
                      className="px-2 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-[10.5px] font-bold rounded-lg border border-blue-300/80 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      title={`Ganti rekomendasi ke gaya ${varItem.label}:\n\n${varItem.text}`}
                    >
                      <span>{varItem.label.split(' ')[0]} {varItem.label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Editable
                html={outputs.headerRekomendasi || "Rekomendasi Laporan"}
                onChange={(v) => handleContentEdit('headerRekomendasi', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
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
                className="font-normal block mt-0.5 font-serif text-justify whitespace-pre-line"
              />
            </li>

            {/* F. Penutup + Tanda Tangan Wali Asuh */}
            <li className="avoid-break penutup-signature-group" style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerPenutup || "Penutup"}
                onChange={(v) => handleContentEdit('headerPenutup', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <br />
              <Editable
                html={outputs.penutup}
                onChange={(v) => handleContentEdit('penutup', v)}
                className="font-normal block mt-0.5 font-serif text-justify"
              />

              {/* SIGNATURE SECTION */}
              <div className="signature-section avoid-break mt-3 flex justify-end pr-2 shrink-0 font-normal">
                <div className="flex flex-col items-start min-w-[14rem]">
                  <table className="text-[12pt] font-normal mb-0.5 font-serif">
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

                  {/* SIGNATURE IMAGES (DIGITAL / BASAH) */}
                  <div className="min-h-16 my-2 flex items-center gap-3 overflow-hidden">
                    {/* QR Code Tanda Tangan Digital */}
                    {inputs.qrCodeSrc && (
                      <div className="flex items-center gap-2 p-1 bg-blue-50/40 rounded-lg border border-blue-100 shrink-0">
                        <img
                          src={inputs.qrCodeSrc}
                          alt="QR Code Tanda Tangan Digital"
                          className="w-14 h-14 object-contain border border-blue-200 p-0.5 rounded bg-white shadow-2xs"
                        />
                        <div className="flex flex-col text-left font-sans pr-1">
                          <span className="text-[7.5pt] font-bold text-blue-950 uppercase tracking-tight">Ditandatangani Digital</span>
                          <span className="text-[6.5pt] text-blue-800 font-bold">{inputs.nama || 'M Ardian Nugraha'}</span>
                          <span className="text-[6.5pt] text-gray-500 italic">Terverifikasi Sistem</span>
                        </div>
                      </div>
                    )}

                    {/* Tanda Tangan Basah */}
                    {inputs.ttdSrc && (
                      <div className="h-14 flex items-center justify-start overflow-hidden shrink-0">
                        <img
                          src={inputs.ttdSrc}
                          alt="Tanda Tangan Basah"
                          className="max-h-14 max-w-[9rem] mix-blend-multiply object-contain"
                        />
                      </div>
                    )}

                    {/* Placeholder jika belum ada tanda tangan/QR */}
                    {!inputs.qrCodeSrc && !inputs.ttdSrc && !focusActive && (
                      <div className="h-14 flex items-center text-gray-400 italic text-xs">
                        (Unggah Tanda Tangan / Gunakan QR Digital)
                      </div>
                    )}
                  </div>

                  <div className="font-bold underline uppercase font-serif text-left">
                    <Editable
                      html={outputs.nama || inputs.nama}
                      onChange={(v) => handleContentEdit('nama', v)}
                    />
                  </div>
                  <div className="font-serif text-left">
                    NIP.{' '}
                    <Editable
                      html={outputs.nip || inputs.nip}
                      onChange={(v) => handleContentEdit('nip', v)}
                    />
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Page Footer / Page Number Halaman 1 */}
        {inputs.tampilkanNomorHalaman && (
          <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] font-serif text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
            <Editable
              html={getPageNumberText(1, 2)}
              onChange={(v) => setInputs((prev) => ({ ...prev, formatNomorHalaman: v }))}
              className="font-serif font-medium"
            />
          </div>
        )}
      </div>

      {/* HALAMAN 2: LAMPIRAN DOKUMENTASI */}
      <div className="a4-paper page-break-before flex flex-col items-center relative">
        <div className="text-center font-bold text-lg mb-6 uppercase w-full avoid-break font-serif">
          LAMPIRAN DOKUMENTASI
        </div>

        {/* Hidden inputs for direct photo upload from preview */}
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
                  className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm transition-opacity group-hover:opacity-90"
                />
                <div className="no-print absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-sans font-semibold">
                  <Upload className="w-3 h-3 text-blue-300" /> Ganti Foto 1
                </div>
              </div>
              <p className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text">
                <Editable
                  html={inputs.foto1Caption || "Foto 1. Pelaksanaan Kegiatan"}
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
                  className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm transition-opacity group-hover:opacity-90"
                />
                <div className="no-print absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-sans font-semibold">
                  <Upload className="w-3 h-3 text-blue-300" /> Ganti Foto 2
                </div>
              </div>
              <p className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text">
                <Editable
                  html={inputs.foto2Caption || "Foto 2. Kondisi Lapangan"}
                  onChange={(v) => setInputs((prev) => ({ ...prev, foto2Caption: v }))}
                />
              </p>
            </div>
          )}

          {!hasPhotos && !focusActive && (
            <div className="w-full max-w-2xl p-8 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-gray-500 bg-blue-50/30 avoid-break rounded-2xl no-print">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-gray-800 mb-1">Upload Foto Dokumentasi Laporan</p>
              <p className="text-xs text-gray-500 mb-4 text-center max-w-md">
                Foto akan otomatis diompres agar ringan dan langsung disisipkan di Halaman 2 Laporan.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => foto1InputRef.current?.click()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Unggah Foto 1
                </button>
                <button
                  type="button"
                  onClick={() => foto2InputRef.current?.click()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Unggah Foto 2
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Page Footer / Page Number Halaman 2 */}
        {inputs.tampilkanNomorHalaman && (
          <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] font-serif text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
            <Editable
              html={getPageNumberText(2, 2)}
              onChange={(v) => setInputs((prev) => ({ ...prev, formatNomorHalaman: v }))}
              className="font-serif font-medium"
            />
          </div>
        )}
      </div>
    </div>
  );
};

