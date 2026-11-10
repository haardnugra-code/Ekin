import { ArchiveItem, ReportInputs, ReportOutputs } from '../types';

export const getRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'I';
};

export const formatSuratNumber = (seq: number, pattern: string, datePickerVal: string): string => {
  let d = datePickerVal ? new Date(datePickerVal) : new Date();
  if (isNaN(d.getTime())) d = new Date();

  const yearStr = d.getFullYear().toString();
  const year2Str = yearStr.slice(-2);
  const monthIdx = d.getMonth();
  const monthNum = monthIdx + 1;
  const month2Str = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
  const romanMonth = getRomanMonth(monthIdx);
  const dayNum = d.getDate();
  const day2Str = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
  const paddedSeq = seq.toString().padStart(3, '0');

  return pattern
    .replace(/\{XXX\}/g, paddedSeq)
    .replace(/\{SEQ\}/g, paddedSeq)
    .replace(/\{MM\}/g, month2Str)
    .replace(/\{ROMAN\}/g, romanMonth)
    .replace(/\{YYYY\}/g, yearStr)
    .replace(/\{YY\}/g, year2Str)
    .replace(/\{DD\}/g, day2Str);
};

/**
 * Increments the sequence number by +1 every time a report is generated,
 * persists it to localStorage, notifies Sidebar listeners, and returns the new Nomor Surat.
 */
export const incrementAndFormatNomorSurat = (inputs: ReportInputs): {
  nextSeq: number;
  nextNomorSurat: string;
  nextNomorSuratTugas: string;
} => {
  let currentSeq = 104;
  let pattern = 'B-{XXX}/SRT.31/PLM/{MM}/{YYYY}';

  try {
    const savedPattern = localStorage.getItem('peksos_surat_pattern');
    if (savedPattern) pattern = savedPattern;

    const savedSeq = localStorage.getItem('peksos_surat_seq');
    if (savedSeq) {
      const parsed = parseInt(savedSeq, 10);
      if (!isNaN(parsed)) currentSeq = parsed;
    }
  } catch {
    // ignore storage errors
  }

  // Also check if current inputs.nomorSurat has a larger number
  if (inputs.nomorSurat) {
    const match = inputs.nomorSurat.match(/\d+/);
    if (match) {
      const parsedFromInput = parseInt(match[0], 10);
      if (!isNaN(parsedFromInput) && parsedFromInput > currentSeq) {
        currentSeq = parsedFromInput;
      }
    }
  }

  const nextSeq = currentSeq + 1;
  const nextNomorSurat = formatSuratNumber(nextSeq, pattern, inputs.tanggalPicker);

  // Also increment nomorSuratTugas if present
  let nextNomorSuratTugas = inputs.nomorSuratTugas || 'ST-088/SRT.31/PLM/08/2026';
  const stMatch = nextNomorSuratTugas.match(/\d+/);
  if (stMatch) {
    const stNum = parseInt(stMatch[0], 10);
    if (!isNaN(stNum)) {
      const nextStPadded = (stNum + 1).toString().padStart(stMatch[0].length, '0');
      nextNomorSuratTugas = nextNomorSuratTugas.replace(/\d+/, nextStPadded);
    }
  }

  try {
    localStorage.setItem('peksos_surat_seq', String(nextSeq));
    window.dispatchEvent(
      new CustomEvent('peksos_surat_seq_updated', {
        detail: { seq: nextSeq, nomorSurat: nextNomorSurat }
      })
    );
  } catch {
    // ignore storage errors
  }

  return {
    nextSeq,
    nextNomorSurat,
    nextNomorSuratTugas
  };
};

/**
 * Triggers browser download of a JSON file for a single generated report or full archive list.
 */
export const downloadReportJsonFile = (item: ArchiveItem, customPrefix = 'Laporan_Otomatis') => {
  try {
    const payload = {
      meta: {
        app: 'e-Kinerja Wali Asuh Sekolah Rakyat Terintegrasi 31 Palembang',
        standar: 'Permensos RI Nomor 8 Tahun 2022',
        savedAt: new Date().toISOString(),
        nomorSurat: item.nomorSurat,
        rhk: item.rhk
      },
      data: item
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeNoSurat = (item.nomorSurat || 'NOSURAT')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `${customPrefix}_${safeNoSurat}_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Gagal mengunduh file JSON otomatis:', e);
  }
};
