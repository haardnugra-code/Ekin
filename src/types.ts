export interface SkpItem {
  id: string;
  rhkAtasan: string;
  rhkPegawai: string;
  ikiKuantitas: string;
  targetKuantitas: string;
  realisasiKuantitas: string;
  ikiKualitas: string;
  targetKualitas: string;
  realisasiKualitas: string;
  ikiWaktu: string;
  targetWaktu: string;
  realisasiWaktu: string;
  capaian: 'Sesuai Ekspektasi' | 'Diatas Ekspektasi' | 'Dibawah Ekspektasi';
}

export interface MatriksSkpConfig {
  periode: string;
  namaAtasan: string;
  nipAtasan: string;
  jabatanAtasan: string;
  pangkatAtasan?: string;
  jabatanPegawai: string;
  pangkatPegawai?: string;
  unitKerja: string;
  lokasiTtd: string;
  tanggalTtd: string;
  items: SkpItem[];
}

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
  nomorSurat?: string;
  logoSrc: string;
  ttdSrc: string;
  qrCodeSrc: string;
  foto1Src: string;
  foto2Src: string;
  foto1Caption: string;
  foto2Caption: string;
  tampilkanNomorHalaman: boolean;
  formatNomorHalaman: string;
  showWatermark?: boolean;
  watermarkOpacity?: number;
  watermarkType?: 'sekolah_rakyat' | 'kemensos' | 'custom_text' | 'custom_image';
  customWatermarkText?: string;
  customWatermarkImg?: string;
  hideWatermarkOnLampiran?: boolean;
  watermarkWidth?: number;
  watermarkHeight?: number | 'auto';
  pinWatermarkSize?: boolean;
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

export interface CustomRhkTemplate {
  id: string;
  targetRhk: string;
  judul: string;
  permasalahan: string;
  solusi: string;
  categoryName?: string;
  createdAt: string;
}
