export interface ReportInputs {
  rhk: string;
  customTitle: string;
  dailyPreset: string;
  skenario: string;
  judul: string;
  permasalahan: string;
  solusi: string;
  fontJudul: string;
  sizeJudul: string;
  fontIsi: string;
  sizeIsi: string;
  lineHeight: string;
  paragraphSpacing: string;
  tempat: string;
  tanggal: string;
  tanggalPicker: string;
  nama: string;
  nip: string;
  logoSrc: string;
  ttdSrc: string;
  qrCodeSrc: string;
  foto1Src: string;
  foto2Src: string;
  foto1Caption: string;
  foto2Caption: string;
  tampilkanNomorHalaman: boolean;
  formatNomorHalaman: string;
}

export interface ReportOutputs {
  judul: string;
  umum: string;
  maksud: string;
  tujuan: string;
  ruang: string;
  dasar: string;
  kegiatan: string;
  hasil: string;
  simpulan: string;
  saran: string;
  rekomendasi: string;
  penutup: string;
  tempat: string;
  tanggal: string;
  nama: string;
  nip: string;
}

export interface ArchiveItem extends ReportInputs, ReportOutputs {
  id: number;
  timestamp: string;
}

export interface Scenario {
  label: string;
  p: string;
  s: string;
}

export interface RhkCategory {
  judul: string;
  scenarios: Scenario[];
}

export interface DailyPreset {
  targetRhk: string;
  judul: string;
  permasalahan: string;
  solusi: string;
}
