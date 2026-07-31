import React, { useMemo } from 'react';
import { SpellCheck, CheckCircle2, AlertTriangle, Sparkles, X, Wand2, ArrowRight } from 'lucide-react';
import { ReportOutputs } from '../types';
import { checkTextSpelling, autoCorrectText, SpellIssue } from '../utils/spellChecker';

interface SpellCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  outputs: ReportOutputs;
  setOutputs: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

const FIELD_LABELS: Record<keyof ReportOutputs, string> = {
  judul: 'Judul Laporan',
  umum: '1. Pendahuluan - Umum',
  maksud: '2. Maksud',
  tujuan: '3. Tujuan',
  ruang: '4. Ruang Lingkup',
  dasar: '5. Dasar Hukum & Pelaksanaan',
  kegiatan: 'B. Kegiatan Yang Dilaksanakan',
  hasil: 'C. Hasil Yang Dicapai',
  simpulan: 'D.1. Simpulan',
  saran: 'D.2. Saran',
  rekomendasi: 'E. Rekomendasi',
  penutup: 'F. Penutup',
  tempat: 'Tempat Pembuatan',
  tanggal: 'Tanggal Pembuatan',
  nama: 'Nama Wali Asuh',
  nip: 'NIP Wali Asuh',
};

export const SpellCheckModal: React.FC<SpellCheckModalProps> = ({
  isOpen,
  onClose,
  outputs,
  setOutputs,
  onShowToast,
}) => {
  if (!isOpen) return null;

  // Scan all fields for issues
  const allIssues = useMemo(() => {
    const list: SpellIssue[] = [];
    (Object.keys(FIELD_LABELS) as Array<keyof ReportOutputs>).forEach((fieldKey) => {
      const val = outputs[fieldKey];
      if (typeof val === 'string' && val.trim().length > 0) {
        const issues = checkTextSpelling(val, fieldKey, FIELD_LABELS[fieldKey]);
        list.push(...issues);
      }
    });
    return list;
  }, [outputs]);

  // Fix a single word in a specific field
  const handleFixIssue = (issue: SpellIssue) => {
    if (!issue.field) return;
    const fieldKey = issue.field as keyof ReportOutputs;
    const currentVal = outputs[fieldKey] || '';

    // Replace word preserving boundary/case
    const regex = new RegExp(`\\b${issue.word}\\b`, 'gi');
    const updatedVal = currentVal.replace(regex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return issue.suggestion.charAt(0).toUpperCase() + issue.suggestion.slice(1);
      }
      return issue.suggestion;
    });

    setOutputs((prev) => ({
      ...prev,
      [fieldKey]: updatedVal,
    }));

    onShowToast(`Disempurnakan: "${issue.word}" → "${issue.suggestion}"`, 'success');
  };

  // Fix ALL fields automatically
  const handleFixAll = () => {
    let totalFixes = 0;
    const updatedOutputs = { ...outputs };

    (Object.keys(FIELD_LABELS) as Array<keyof ReportOutputs>).forEach((fieldKey) => {
      const val = updatedOutputs[fieldKey];
      if (typeof val === 'string' && val.trim().length > 0) {
        const { correctedText, replacementsCount } = autoCorrectText(val);
        if (replacementsCount > 0) {
          updatedOutputs[fieldKey] = correctedText;
          totalFixes += replacementsCount;
        }
      }
    });

    setOutputs(updatedOutputs);
    if (totalFixes > 0) {
      onShowToast(`✨ Berhasil memperbaiki ${totalFixes} kesalahan ejaan secara otomatis!`, 'success');
    } else {
      onShowToast('Tidak ada kesalahan ejaan yang perlu diperbaiki.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-indigo-100 bg-indigo-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <SpellCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Pengecekan Ejaan & Tata Bahasa (KBBI)
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Pemeriksaan otomatis kata non-baku, kata depan, dan ejaan resmi bahasa Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Summary Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            allIssues.length > 0
              ? 'bg-amber-50 border-amber-200/80 text-amber-900'
              : 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {allIssues.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="font-extrabold text-xs block">
                  {allIssues.length > 0
                    ? `Ditemukan ${allIssues.length} Potensi Kesalahan Ejaan`
                    : 'Semua Ejaan Laporan Sesuai Kaidah Baku (KBBI)'}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {allIssues.length > 0
                    ? 'Tinjau rekomendasi perbaikan di bawah atau perbaiki semua sekaligus.'
                    : 'Laporan Anda rapi dan siap diunduh ke Word / PDF.'}
                </span>
              </div>
            </div>

            {allIssues.length > 0 && (
              <button
                type="button"
                onClick={handleFixAll}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Perbaiki Semua ({allIssues.length})
              </button>
            )}
          </div>

          {/* Issues List */}
          {allIssues.length > 0 ? (
            <div className="space-y-2.5">
              {allIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                        {issue.fieldLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono line-through">
                        {issue.word}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                        {issue.suggestion}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{issue.reason}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFixIssue(issue)}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Terapkan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
              <p className="text-xs font-medium text-gray-600">
                Tidak ada kesalahan kata non-baku atau tata bahasa yang terdeteksi.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
