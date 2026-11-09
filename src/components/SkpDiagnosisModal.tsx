import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  BookOpen,
  Award,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Check,
  Zap,
  Bookmark
} from 'lucide-react';
import {
  SkpDiagnosisResult,
  SAMPLE_PROBLEM_PROMPTS,
  diagnoseSkpProblem
} from '../utils/skpProblemMatcher';

interface SkpDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProblem?: string;
  onApplyDiagnosis: (diagnosis: SkpDiagnosisResult) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SkpDiagnosisModal: React.FC<SkpDiagnosisModalProps> = ({
  isOpen,
  onClose,
  initialProblem = '',
  onApplyDiagnosis,
  showToast
}) => {
  const [problemInput, setProblemInput] = useState<string>(initialProblem);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<SkpDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initialProblem when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialProblem && initialProblem.trim()) {
        setProblemInput(initialProblem);
        handleAnalyze(initialProblem);
      } else if (!diagnosis) {
        // Run diagnosis on first sample if empty
        const defaultSample = SAMPLE_PROBLEM_PROMPTS[0].masalah;
        setProblemInput(defaultSample);
        handleAnalyze(defaultSample);
      }
    }
  }, [isOpen, initialProblem]);

  if (!isOpen) return null;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const query = (textToAnalyze ?? problemInput).trim();
    if (!query) {
      setErrorMsg('Harap masukkan deskripsi masalah atau insiden siswa terlebih dahulu.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Attempt API call to server-side Gemini
      const res = await fetch('/api/diagnose-skp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masalah: query })
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data);
      } else {
        // Fallback to local intelligence
        const local = diagnoseSkpProblem(query);
        setDiagnosis(local);
      }
    } catch {
      // Offline fallback
      const local = diagnoseSkpProblem(query);
      setDiagnosis(local);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setProblemInput(sampleText);
    handleAnalyze(sampleText);
  };

  const handleApply = () => {
    if (!diagnosis) return;
    onApplyDiagnosis(diagnosis);
    if (showToast) {
      showToast(
        `Berhasil menerapkan diagnosis ke RHK ${diagnosis.recommendedRhk} (${diagnosis.judulRekomendasi})!`,
        'success'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Diagnosis Masalah & Rekomendasi Penempatan SKP
                </h3>
                <span className="text-[10px] bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Asisten Cerdas Peksos
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Masukkan masalah siswa asrama: sistem akan memilihkan RHK yang tepat, memberikan gambaran kasus, metode intervensi Peksos, dan penyelesaiannya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Input Section */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-700" />
                Tuliskan Permasalahan atau Kasus Siswa Asrama:
              </label>
              <span className="text-[10px] text-blue-700 font-semibold">
                {problemInput.length} karakter
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Contoh: Siswa sering kabur dari asrama saat shalat maghrib dan menolak membersihkan kamar tidur karena merasa tidak betah..."
                className="w-full text-xs p-3 border border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-medium placeholder-gray-400 shadow-inner"
              />
              {problemInput && (
                <button
                  type="button"
                  onClick={() => setProblemInput('')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
                  title="Hapus Teks"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Sample Chips */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-blue-900 block">
                Pilih Contoh Kasus Cepat (Klik untuk Mencoba):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROBLEM_PROMPTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.masalah)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100/80 text-blue-950 border border-blue-200 rounded-lg text-[10.5px] font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{sample.tag}</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                      {sample.kategori}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isLoading || !problemInput.trim()}
                onClick={() => handleAnalyze()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mendiagnosis Masalah & Menentukan SKP...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Analisis & Rekomendasikan SKP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {diagnosis && (
            <div className="space-y-4 animate-fade-in">
              {/* Highlight Banner of Target RHK */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl shadow-sm border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white text-[10.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                      Rekomendasi Penempatan SKP
                    </span>
                    <span className="bg-amber-400 text-blue-950 text-[10.5px] font-black px-2.5 py-0.5 rounded-full">
                      Kecocokan: {diagnosis.confidenceScore}%
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black tracking-tight">
                    {diagnosis.rhkBadge}
                  </h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    Tupoksi Kemensos: {diagnosis.kategoriTupoksi}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-white hover:bg-emerald-50 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Terapkan ke Laporan SKP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              </div>

              {/* Grid of Case Breakdown & Interventions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alasan Kesesuaian RHK */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                  <h5 className="font-extrabold text-gray-900 flex items-center gap-1.5 text-xs text-blue-950">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    Mengapa Diletakkan di {diagnosis.rhkBadge.split(' - ')[0]}?
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-[11.5px]">
                    {diagnosis.alasanKesesuaian}
                  </p>
                  <div className="pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-gray-500 font-semibold block">
                      Rekomendasi Judul Kegiatan:
                    </span>
                    <span className="font-bold text-gray-900 text-[11px] block text-blue-900">
                      {diagnosis.judulRekomendasi}
                    </span>
                  </div>
                </div>

                {/* Gambaran Kasus (Case Dynamic Assessment) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                  <h5 className="font-extrabold text-gray-900 flex items-center gap-1.5 text-xs text-indigo-950">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Gambaran Kasus (Case Assessment)
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-[11.5px]">
                    {diagnosis.gambaranKasus}
                  </p>
                </div>
              </div>

              {/* Metode & Teori Intervensi Peksos */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-100 pb-2">
                  <h5 className="font-extrabold text-gray-900 flex items-center gap-1.5 text-xs text-teal-950">
                    <Award className="w-4 h-4 text-teal-600" />
                    Metode & Landasan Teori Intervensi Pekerjaan Sosial (Peksos)
                  </h5>
                  <span className="text-[10.5px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {diagnosis.metodeIntervensiPeksos}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-[11.5px]">
                  {diagnosis.landasanTeori}
                </p>

                {/* Langkah-Langkah Praktis */}
                <div className="pt-1 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-gray-800 block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    Langkah-Langkah Praktis Penanganan Kasus (SOP Peksos):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {diagnosis.tahapanIntervensi.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-200 text-gray-800 text-[11px] leading-relaxed flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Penyelesaian & Solusi Terukur */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                <h5 className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Penyelesaian Konkret & Narasi Solusi (Siap Masuk ke Formulir Laporan)
                </h5>
                <p className="text-gray-800 leading-relaxed text-[11.5px] bg-white p-3 rounded-xl border border-amber-200 font-medium">
                  {diagnosis.solusiLaporan}
                </p>

                {diagnosis.rekomendasiTindakLanjut && diagnosis.rekomendasiTindakLanjut.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10.5px] font-bold text-amber-900 block mb-1">
                      Rencana Tindak Lanjut & Monitoring:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-0.5">
                      {diagnosis.rekomendasiTindakLanjut.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-medium">
            Standar Kompetensi Pekerja Sosial & Wali Asuh - Kemensos RI
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs cursor-pointer"
            >
              Tutup
            </button>
            {diagnosis && (
              <button
                type="button"
                onClick={handleApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terapkan ke Laporan SKP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
