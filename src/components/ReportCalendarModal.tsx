import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  FileText,
  Filter,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { ArchiveItem, ReportInputs, ReportOutputs } from '../types';

interface ReportCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: ArchiveItem[];
  inputs: ReportInputs;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
  setOutputs: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  onSelectArchive: (archive: ArchiveItem) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'];

export const ReportCalendarModal: React.FC<ReportCalendarModalProps> = ({
  isOpen,
  onClose,
  archives = [],
  inputs,
  setInputs,
  setOutputs,
  onSelectArchive,
  showToast,
}) => {
  // Initialize view date from active input or current date
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (inputs?.tanggalPicker) {
      const parsed = new Date(inputs.tanggalPicker);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const [filterMode, setFilterMode] = useState<'all' | 'workdays' | 'reported' | 'missing'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to format date object to YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to format date into Indonesian string: "15 Agustus 2026"
  const formatIndonesianDate = (d: Date): string => {
    const day = d.getDate();
    const monthName = NAMA_BULAN[d.getMonth()];
    const fullYear = d.getFullYear();
    return `${day} ${monthName} ${fullYear}`;
  };

  // Map archives by YYYY-MM-DD key
  const archiveMap = useMemo(() => {
    const map: Record<string, ArchiveItem[]> = {};
    archives.forEach((item) => {
      let key = item.tanggalPicker;
      if (!key && item.tanggal) {
        // Fallback attempt to parse tanggal if missing picker
        try {
          const parts = item.tanggal.trim().split(' ');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const mIdx = NAMA_BULAN.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
            if (mIdx !== -1) {
              key = `${parts[2]}-${String(mIdx + 1).padStart(2, '0')}-${day}`;
            }
          }
        } catch {}
      }
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    });
    return map;
  }, [archives]);

  // Generate days grid for current month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday-based index: 0=Senin, 1=Selasa, ..., 6=Minggu
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday is 6

    const daysArray = [];

    // Padding previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dateObj = new Date(year, month - 1, dayNum);
      daysArray.push({
        dateObj,
        dateKey: formatDateKey(dateObj),
        isCurrentMonth: false,
        dayNum,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      daysArray.push({
        dateObj,
        dateKey: formatDateKey(dateObj),
        isCurrentMonth: true,
        dayNum: d,
      });
    }

    // Padding next month to fill grid row of 7
    const remaining = 7 - (daysArray.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const dateObj = new Date(year, month + 1, d);
        daysArray.push({
          dateObj,
          dateKey: formatDateKey(dateObj),
          isCurrentMonth: false,
          dayNum: d,
        });
      }
    }

    return daysArray;
  }, [year, month]);

  // Monthly stats calculation
  const monthlyStats = useMemo(() => {
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    let workdaysCount = 0;
    let reportedWorkdays = 0;
    let reportedTotal = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const key = formatDateKey(dateObj);
      const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat
      const isWorkday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const hasReport = (archiveMap[key] && archiveMap[key].length > 0) || (inputs?.tanggalPicker === key);

      if (isWorkday) {
        workdaysCount++;
        if (hasReport) reportedWorkdays++;
      }
      if (hasReport) reportedTotal++;
    }

    const missingWorkdays = workdaysCount - reportedWorkdays;
    const compliancePercent = workdaysCount > 0 ? Math.round((reportedWorkdays / workdaysCount) * 100) : 0;

    return {
      workdaysCount,
      reportedWorkdays,
      reportedTotal,
      missingWorkdays,
      compliancePercent,
    };
  }, [year, month, archiveMap, inputs.tanggalPicker]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectDateForNewReport = (dateObj: Date) => {
    const dateKey = formatDateKey(dateObj);
    const indoDateStr = formatIndonesianDate(dateObj);

    if (setInputs) {
      setInputs((prev) => ({
        ...prev,
        tanggalPicker: dateKey,
        tanggal: indoDateStr,
      }));
    }

    if (setOutputs) {
      setOutputs((prev) => ({
        ...prev,
        tanggal: indoDateStr,
      }));
    }

    if (showToast) {
      showToast(`Tanggal laporan aktif diubah ke ${indoDateStr}`, 'info');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Kalender Laporan e-Kinerja Peksos
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                  Tracking Kehadiran
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Pantau tanggal yang sudah dan belum dibuatkan laporan kinerja harian
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MONTH CONTROLS & REKAP BAR */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-gray-200 space-y-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-2xs transition-all cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-extrabold text-gray-900 w-48 text-center">
                {NAMA_BULAN[month]} {year}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-2xs transition-all cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-all cursor-pointer ml-1"
              >
                Hari Ini
              </button>
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs text-xs font-bold">
              <span className="text-gray-400 px-2 flex items-center gap-1 text-[11px]">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('workdays')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  filterMode === 'workdays'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Hari Kerja
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('reported')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  filterMode === 'reported'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sudah Lapor
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('missing')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  filterMode === 'missing'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Belum Lapor
              </button>
            </div>
          </div>

          {/* STATS SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Hari Kerja</p>
                <p className="text-sm font-extrabold text-gray-900">{monthlyStats.workdaysCount} Hari</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200/90 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-semibold uppercase">Sudah Terlapor</p>
                <p className="text-sm font-extrabold text-emerald-950">{monthlyStats.reportedWorkdays} Hari</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-rose-200/90 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-rose-700 font-semibold uppercase">Belum Laporan</p>
                <p className="text-sm font-extrabold text-rose-950">{monthlyStats.missingWorkdays} Hari Kerja</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-2xs flex items-center gap-3 border border-indigo-800">
              <div className="p-2.5 bg-indigo-800 text-indigo-200 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 font-semibold uppercase">Capaian Bulan Ini</p>
                <p className="text-sm font-extrabold text-white">{monthlyStats.compliancePercent}% Terlapor</p>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* DAY NAMES HEADER */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {NAMA_HARI.map((hari, idx) => (
              <div
                key={hari}
                className={`py-1.5 text-xs font-bold rounded-xl ${
                  idx >= 5 ? 'text-amber-700 bg-amber-50' : 'text-gray-700 bg-gray-100'
                }`}
              >
                {hari}
              </div>
            ))}
          </div>

          {/* CALENDAR DAYS GRID */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map(({ dateObj, dateKey, isCurrentMonth, dayNum }, idx) => {
              const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isWorkday = !isWeekend;
              const archivesForDate = archiveMap[dateKey] || [];
              const hasArchives = archivesForDate.length > 0;
              const isCurrentActiveFormDate = inputs?.tanggalPicker === dateKey;
              const isToday = formatDateKey(new Date()) === dateKey;

              // Filter check
              if (filterMode === 'workdays' && isWeekend) return <div key={idx} className="opacity-30 p-2 border border-dashed border-gray-200 rounded-2xl min-h-[90px]" />;
              if (filterMode === 'reported' && !hasArchives && !isCurrentActiveFormDate) return <div key={idx} className="opacity-30 p-2 border border-dashed border-gray-200 rounded-2xl min-h-[90px]" />;
              if (filterMode === 'missing' && (hasArchives || isCurrentActiveFormDate || isWeekend)) return <div key={idx} className="opacity-30 p-2 border border-dashed border-gray-200 rounded-2xl min-h-[90px]" />;

              return (
                <div
                  key={dateKey + idx}
                  className={`p-2 rounded-2xl border transition-all flex flex-col justify-between min-h-[95px] sm:min-h-[110px] relative group ${
                    !isCurrentMonth
                      ? 'bg-gray-50/50 border-gray-100 text-gray-300'
                      : isCurrentActiveFormDate
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/30 text-gray-900 shadow-xs'
                      : hasArchives
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/80 shadow-2xs'
                      : isWorkday
                      ? 'bg-rose-50/40 border-rose-200/80 text-gray-900 hover:border-rose-300 hover:bg-rose-50'
                      : 'bg-white border-gray-200/80 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {/* DAY NUMBER HEADER */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : !isCurrentMonth
                          ? 'text-gray-300'
                          : isWeekend
                          ? 'text-amber-700'
                          : 'text-gray-900'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* STATUS PILL BADGE */}
                    {isCurrentMonth && (
                      <div className="flex items-center gap-1">
                        {isCurrentActiveFormDate && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Sedang Aktif di Form" />
                        )}
                        {hasArchives ? (
                          <span className="p-1 bg-emerald-600 text-white rounded-full" title={`${archivesForDate.length} Laporan Tersimpan`}>
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        ) : isWorkday ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold text-rose-700 bg-rose-100 rounded-md border border-rose-200">
                            Belum
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold text-gray-400 bg-gray-100 rounded-md">
                            Libur
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* REPORT PREVIEWS & BUTTONS */}
                  {isCurrentMonth && (
                    <div className="mt-1 space-y-1 w-full">
                      {hasArchives ? (
                        <div className="space-y-1">
                          {archivesForDate.slice(0, 1).map((arch) => (
                            <button
                              key={arch.id}
                              type="button"
                              onClick={() => {
                                onSelectArchive(arch);
                                onClose();
                              }}
                              className="w-full text-left p-1.5 bg-white hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-200/90 text-[10px] font-bold text-emerald-900 line-clamp-2 transition-all cursor-pointer shadow-2xs flex items-center gap-1 group/item"
                              title={`Buka Laporan: ${arch.judul}`}
                            >
                              <FileText className="w-3 h-3 text-emerald-600 group-hover/item:text-white shrink-0" />
                              <span className="truncate">{arch.judul}</span>
                            </button>
                          ))}
                          {archivesForDate.length > 1 && (
                            <p className="text-[9px] text-emerald-700 font-bold px-1">
                              +{archivesForDate.length - 1} laporan lagi
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectDateForNewReport(dateObj)}
                          className={`w-full py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                            isCurrentActiveFormDate
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : isWorkday
                              ? 'bg-white hover:bg-rose-600 hover:text-white text-rose-700 border-rose-200 shadow-2xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                          }`}
                          title={`Buat/Set Laporan di Tanggal ${formatIndonesianDate(dateObj)}`}
                        >
                          {isCurrentActiveFormDate ? (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Buat Lapor</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-4 text-gray-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Sudah Ada Laporan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Belum Laporan (Hari Kerja)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Tanggal Aktif Form
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Tutup Kalender
          </button>
        </div>
      </div>
    </div>
  );
};
