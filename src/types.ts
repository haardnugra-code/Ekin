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
  logo2Src?: string;
  showLogo2?: boolean;
  ttdSrc: string;
  qrCodeSrc: string;
  foto1Src: string;
  foto2Src: string;
  foto1Caption: string;
  foto2Caption: string;
  tampilkanNomorHalaman: boolean;
  formatNomorHalaman: string;
  aktifFiturUpacara?: boolean;
  aktifFiturKunjungan?: boolean;
  sertakanDetailSuratTugas?: boolean;
  aktifFiturPelatihan?: boolean;
  nomorSuratTugas?: string;
  tanggalSuratTugas?: string;
  pemberiTugas?: string;
  jenisPenugasan?: 'pelatihan' | 'operasional' | 'mpls' | 'lainnya';
  modulPelatihan?: string;
  namaPelatihan?: string;
  durasiPelatihan?: string;
  metodePelatihan?: string;
  penyelenggaraPelatihan?: string;
  fasilitatorPelatihan?: string;
  rencanaAksiPelatihan?: string;
  // Variabel Khusus Upacara (RHK 1)
  jenisUpacara?: string;
  peranWaliAsuhUpacara?: string;
  lokasiUpacara?: string;
  pembinaUpacara?: string;
  amanatUpacara?: string;
  jumlahPesertaUpacara?: string;
  catatanKedisiplinanUpacara?: string;
  // Variabel SKP: Kunjungan Orang Tua, Konsultasi Perkembangan & Kesehatan Anak (Peksos)
  subTopikKeluargaKesehatan?: 'kunjungan_ortu' | 'konsultasi_perkembangan' | 'kesehatan_anak' | 'gabungan' | 'kunjungan' | 'konsultasi' | 'kesehatan';
  namaOrangTuaWali?: string;
  hubunganKeluarga?: string;
  waktuKunjungan?: string;
  fokusKonsultasiPerkembangan?: string;
  catatanObservasiKeluarga?: string;
  kesepakatanPolaAsuh?: string;
  keluhanKesehatanAnak?: string;
  tindakanKesehatanAwal?: string;
  fasilitasKesehatanRujukan?: string;
  statusKondisiAnak?: string;
  metodeIntervensiPeksos?: string;
  penjelasanIntervensiPeksos?: string;
  tahapanIntervensiPeksos?: string;
  kopInstansiUtama?: string;
  kopEselon1?: string;
  kopEselon2?: string;
  kopUnitKerja?: string;
  kopAlamat?: string;
  paperSize?: 'A4' | 'F4' | 'Legal';
  showPageBreakLines?: boolean;
  modeLaporanKhusus?: boolean;
  // Pengaturan Cover Penelitian (Hal. 1), Daftar Isi (Hal. 2) & Fitur Jurnal Ilmiah
  tampilkanCoverPenelitian?: boolean;
  gayaCoverPenelitian?: 'penelitian_resmi' | 'akademis_modern' | 'kedinasan_klasik';
  subJudulCoverPenelitian?: string;
  keteranganCoverPenelitian?: string;
  aktifFiturJurnalIlmiah?: boolean;
  namaJurnalIlmiah?: string;
  metodologiPenelitian?: string;
  // Pengaturan Tata Naskah Dinas (Permensos RI Nomor 8 Tahun 2022)
  standarTnd?: 'permensos_8_2022' | 'produk_hukum' | 'klasik_tnr' | 'custom';
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
}

export interface SpecialReportTableRow {
  id: string;
  tanggal: string;
  namaKegiatan: string;
  hasilKegiatan: string;
  kendala: string;
  saran: string;
}

export interface CustomJournalEntry {
  id: string;
  penulisTahun: string;
  judulArtikel: string;
  namaJurnalVolume: string;
  kutipanTemuan?: string;
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
  // Variabel Laporan Khusus & Jurnal Ilmiah (Cover Hal 1 + Daftar Isi Hal 2 + Bab A s.d. H + Tabel Matriks Kegiatan)
  khususAbstrak?: string;
  khususKataKunci?: string;
  khususKajianTeori?: string;
  khususMetodologiIlmiah?: string;
  khususPembahasanIlmiah?: string;
  khususReferensi?: string[];
  khususLatarBelakang?: string;
  khususDasarPelaksanaan?: string;
  khususTujuan?: string;
  khususPelaksanaan?: string;
  khususHasil?: string;
  khususKendala?: string;
  khususTindakLanjut?: string;
  khususSimpulan?: string;
  khususSaran?: string;
  tabelKegiatan?: SpecialReportTableRow[];
  headerPendahuluan?: string;
  headerUmum?: string;
  headerMaksudTujuan?: string;
  headerMaksud?: string;
  headerTujuan?: string;
  headerRuangLingkup?: string;
  headerDasar?: string;
  headerDasarHukum?: string;
  headerDasarPelaksanaan?: string;
  headerKegiatan?: string;
  headerHasil?: string;
  headerSimpulanSaran?: string;
  headerSimpulan?: string;
  headerSaran?: string;
  headerRekomendasi?: string;
  headerPenutup?: string;
  [key: string]: any;
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

export interface TrainingModule {
  id: string;
  kodeModul: string;
  namaModul: string;
  topikUtama: string;
  durasi: string;
  metode: string;
  penyelenggara: string;
  fasilitator: string;
  judulLaporan: string;
  permasalahan: string;
  solusi: string;
  pokokBahasan: string[];
  kegiatanDetail: string;
  hasilCapaian: string;
  simpulan: string;
  saranTindakLanjut: string;
}
