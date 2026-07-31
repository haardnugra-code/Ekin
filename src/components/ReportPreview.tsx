import React, { useState, useEffect, useRef } from 'react';
import { Camera, Bold, Italic, Underline, RemoveFormatting, Sparkles, Maximize2, Minimize2, Eye } from 'lucide-react';
import { ReportInputs, ReportOutputs } from '../types';
import { DASAR_HUKUM_LIST, DASAR_PELAKSANAAN_LIST } from '../data/presets';
import { SekolahRakyatWatermark } from './SekolahRakyatWatermark';

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
    if (isFocusMode) return;
    const newHtml = e.currentTarget.innerHTML;
    onChange(newHtml);
  };

  return (
    <Component
      ref={ref as any}
      contentEditable={!isFocusMode}
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleInput}
      className={`${
        isFocusMode
          ? 'cursor-default select-text focus:outline-none focus:ring-0'
          : 'editable-text cursor-text focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:rounded px-0.5 transition-all'
      } ${className || ''}`}
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

  const getPageNumberText = (pageIndex: number, totalPages: number) => {
    const format = inputs.formatNomorHalaman || '- {n} -';
    return format
      .replace('{n}', String(pageIndex))
      .replace('{total}', String(totalPages));
  };

  const hasPhotos = inputs.foto1Src || inputs.foto2Src;

  return (
    <div id="document-preview" className={`space-y-8 print:space-y-0 relative w-full flex flex-col items-center ${focusActive ? 'is-focus-mode' : ''}`}>
      {/* TOP RICH TEXT & FOCUS MODE TOOLBAR */}
      <div className="print:hidden mb-2 bg-white border border-gray-200/90 shadow-xs rounded-2xl p-2 flex flex-wrap items-center justify-between gap-3 max-w-2xl w-full transition-all">
        {!focusActive ? (
          <>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-2">
                Format Teks:
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
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('removeFormat');
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-all cursor-pointer flex items-center gap-1 text-xs"
                title="Hapus Format Teks"
              >
                <RemoveFormatting className="w-4 h-4" />
                <span className="hidden sm:inline">Normal</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-Draft Saved
              </div>

              {/* Mode Fokus Toggle Button */}
              <button
                type="button"
                onClick={() => setFocusActive(true)}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Aktifkan Mode Fokus untuk menyembunyikan elemen/tombol edit dan melihat hasil pratinjau cetak bersih"
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
              <span>Mode Fokus Aktif (Elemen & Tombol Edit Disembunyikan)</span>
            </div>

            <button
              type="button"
              onClick={() => setFocusActive(false)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Keluar dari Mode Fokus dan kembali ke mode pengeditan"
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
        className="a4-paper relative"
        style={{
          fontFamily: inputs.fontIsi,
          fontSize: inputs.sizeIsi,
        }}
      >
        {/* WATERMARK BACKGROUND */}
        <SekolahRakyatWatermark
          show={inputs.showWatermark ?? false}
          opacity={inputs.watermarkOpacity ?? 0.18}
          type={inputs.watermarkType || 'kemensos'}
          customText={inputs.customWatermarkText}
          customImg={inputs.customWatermarkImg}
          width={inputs.watermarkWidth ?? 450}
          height={inputs.watermarkHeight ?? 'auto'}
          isSizePinned={inputs.pinWatermarkSize ?? true}
        />

        {/* KOP SURAT */}
        <div
          className="kop-surat avoid-break border-b-[4px] border-black pb-2.5 mb-3 flex items-center"
          style={{ borderBottomStyle: 'double' }}
        >
          {inputs.logoSrc ? (
            <div className="w-28 flex-shrink-0 pr-3 flex justify-center">
              <img
                id="out-logo"
                src={inputs.logoSrc}
                alt="Logo Kop Instansi"
                className="max-w-full h-auto max-h-20 object-contain"
              />
            </div>
          ) : null}
          <div className="flex-1 text-center">
            <h1
              contentEditable
              suppressContentEditableWarning
              className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              KEMENTERIAN SOSIAL REPUBLIK INDONESIA
            </h1>
            <h2
              contentEditable
              suppressContentEditableWarning
              className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              SEKRETARIAT JENDERAL
            </h2>
            <h2
              contentEditable
              suppressContentEditableWarning
              className="text-[1.05rem] uppercase leading-snug font-bold cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI
            </h2>
            <h2
              contentEditable
              suppressContentEditableWarning
              className="text-[1.1rem] font-bold uppercase mt-0.5 leading-snug cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG
            </h2>
            <p
              contentEditable
              suppressContentEditableWarning
              className="text-[0.78rem] mt-0.5 font-serif leading-tight cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
            >
              Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com
            </p>
          </div>
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
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              <Editable
                html={outputs.headerRekomendasi || "Rekomendasi Laporan"}
                onChange={(v) => handleContentEdit('headerRekomendasi', v)}
                className="inline-block cursor-text hover:bg-amber-50 focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <br />
              <Editable
                html={
                  outputs.rekomendasi ||
                  "1. Pendampingan berkala oleh Wali Asuh.\n2. Evaluasi perkembangan perilaku peserta didik secara berkelanjutan."
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
        {/* WATERMARK BACKGROUND HALAMAN 2 */}
        {!(inputs.hideWatermarkOnLampiran ?? true) && (
          <SekolahRakyatWatermark
            show={inputs.showWatermark ?? false}
            opacity={inputs.watermarkOpacity ?? 0.18}
            type={inputs.watermarkType || 'kemensos'}
            customText={inputs.customWatermarkText}
            customImg={inputs.customWatermarkImg}
            width={inputs.watermarkWidth ?? 450}
            height={inputs.watermarkHeight ?? 'auto'}
            isSizePinned={inputs.pinWatermarkSize ?? true}
          />
        )}
        <div className="text-center font-bold text-lg mb-6 uppercase w-full avoid-break font-serif">
          LAMPIRAN DOKUMENTASI
        </div>

        <div className="space-y-8 flex flex-col items-center justify-center w-full flex-grow">
          {inputs.foto1Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break">
              <img
                src={inputs.foto1Src}
                alt="Dokumentasi 1"
                className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm"
              />
              <p className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text">
                <Editable
                  html={inputs.foto1Caption || "Foto 1. Pelaksanaan Kegiatan"}
                  onChange={(v) => setInputs((prev) => ({ ...prev, foto1Caption: v }))}
                />
              </p>
            </div>
          )}

          {inputs.foto2Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break">
              <img
                src={inputs.foto2Src}
                alt="Dokumentasi 2"
                className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm"
              />
              <p className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text">
                <Editable
                  html={inputs.foto2Caption || "Foto 2. Kondisi Lapangan"}
                  onChange={(v) => setInputs((prev) => ({ ...prev, foto2Caption: v }))}
                />
              </p>
            </div>
          )}

          {!hasPhotos && !focusActive && (
            <div className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 avoid-break rounded-xl">
              <p className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-400" /> Belum ada foto dokumentasi yang diunggah.
              </p>
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

