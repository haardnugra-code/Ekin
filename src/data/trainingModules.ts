import { TrainingModule } from '../types';

/**
 * Daftar Modul Pelatihan Resmi Pusdiklatbangprof Kementerian Sosial RI 2026
 * untuk Wali Asuh dan Wali Asrama Sekolah Rakyat
 * Berdasarkan dokumen kurikulum resmi Pusdiklatbangprof Kemensos 2026
 */
export const TRAINING_MODULES: Record<string, TrainingModule> = {
  pencatatan_pelaporan: {
    id: 'pencatatan_pelaporan',
    kodeModul: 'MODUL 7: PENCATATAN & PELAPORAN',
    namaModul: 'Modul Pencatatan dan Pelaporan Kasus Peserta Didik',
    topikUtama: 'Pencatatan Objektif 5W+1H, Kerahasiaan, dan Alur Pelaporan ke Satgas Sekolah Rakyat',
    durasi: '2 JP (2 x 45 Menit = 90 Menit)',
    metode: 'FGD (Focus Group Discussion) 8 Kelompok, Studi Kasus, dan Analisis 5W+1H',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN KETERAMPILAN DASAR PENCATATAN DAN PELAPORAN KASUS PESERTA DIDIK SEKOLAH RAKYAT',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Modul 7 Pencatatan dan Pelaporan Kasus guna menstandarisasi tata kelola pendokumentasian temuan, aduan, serta eskalasi pelaporan kasus peserta didik asrama ke Satgas Sekolah Rakyat secara objektif dan rahasia.',
    solusi: 'Mengikuti sesi pelatihan secara aktif, menguasai prinsip objektivitas dan kerahasiaan anak, menerapkan pisau analisis 5W+1H untuk membedakan fakta vs opini, serta mempraktikkan pengisian Formulir Catatan Penanganan Kasus dan alur pelaporan ke Satgas Sekolah Rakyat (Satgas SR).',
    pokokBahasan: [
      'Tujuan dan Prinsip Pencatatan (Objektivitas, Kerahasiaan, Respon Cepat, Akuntabilitas)',
      'Peran Wali Asuh dalam Pengamatan Harian dan Penerimaan Informasi Awal',
      'Teknik Pencatatan 5W+1H dan Pemisahan Fakta Lapangan dari Dugaan/Opini Pribadi',
      'Mekanisme Pelaporan Hasil ke Satgas SR (Guru BK, Wali Asuh, Wali Asrama, Wakasek, Peksos)',
      'Pemanfaatan Instrumen Formulir Penanganan Kasus, Rapid Assessment, dan Monitoring ADL'
    ],
    kegiatanDetail: 'Kegiatan pelatihan dilaksanakan selama 2 JP (90 menit) dengan metode ceramah interaktif, brainstorming studi kasus psikososial siswa, serta diskusi kelompok FGD (8 kelompok). Setiap kelompok menganalisis kasus asrama berbeda, membedakan fakta vs opini dengan prinsip 5W+1H, menyusun draft formulir pelaporan ke Satgas SR, melakukan presentasi hasil, serta mengerjakan evaluasi akhir pemahaman peran strategis wali asuh.',
    hasilCapaian: 'Wali Asuh menguasai teknik pencatatan temuan kasus secara tertib dan objektif tanpa bias asumsi pribadi, memahami batas kerahasiaan data anak, serta menguasai alur koordinasi eskalasi kasus ke Tim Satgas Sekolah Rakyat.',
    simpulan: 'Pelatihan Pencatatan dan Pelaporan Modul 7 Pusdiklatbangprof Kemensos RI berhasil memperkuat kompetensi administratif dan perlindungan hukum bagi Wali Asuh Sekolah Rakyat.',
    saranTindakLanjut: 'Menerapkan Buku Log Temuan Harian dan Formulir Catatan Kasus terstandar di asrama Sekolah Rakyat Terintegrasi 31 Palembang serta menyelenggarakan rapat koordinasi bulanan bersama Satgas SR.'
  },
  self_care: {
    id: 'self_care',
    kodeModul: 'MODUL 7: SELF-CARE PENGASUH',
    namaModul: 'Modul Keterampilan Perawatan Diri (Self-Care) & Pencegahan Burnout',
    topikUtama: 'Survival Kit Ketahanan Profesi, Manajemen Burnout, dan Penanganan Vicarious Trauma',
    durasi: '2 JP (2 x 45 Menit = 90 Menit)',
    metode: 'Ceramah Interaktif, Lembar Kerja Agenda 30-60-90 Hari, dan Simulasi Jurnal Syukur (Gratitude Journaling)',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN KETERAMPILAN PERAWATAN DIRI (SELF-CARE) DAN PENCEGAHAN BURNOUT WALI ASUH SEKOLAH RAKYAT',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Modul 7 Self-Care Pengasuh guna membekali wali asuh dengan survival kit ketahanan mental dalam menghadapi stres kerja berkepanjangan dan mencegah risiko kelelahan emosional (burnout) maupun trauma sekunder (vicarious trauma).',
    solusi: 'Mempelajari konsep self-care sebagai tameng profesional pengasuh ("gelas yang kosong tidak bisa mengisi gelas orang lain"), mengenali ciri fisik/psikologis/sosial burnout, mempraktikkan Psychological First Aid (PFA: Look, Listen, Comfort, Connect, Activate, Hope), serta menyusun Lembar Kerja Agenda Self-Care 30-60-90 Hari dan Jurnal Syukur.',
    pokokBahasan: [
      'Burnout Sebagai Risiko Profesi: Definisi, Beda Stres vs Burnout, Faktor Pemicu Internal & Eksternal',
      'Identifikasi Ciri-Ciri Burnout (Fisik, Psikologis, Perilaku Sosial) dan Langkah Penanganannya',
      'Risiko Vicarious Trauma (Trauma Sekunder) dan Strategi Psychological First Aid (PFA)',
      '10 Dimensi Self-Care (Physical, Emotional, Spiritual, Personal, Intellectual, Sensory, Financial, Work, Space, Social)',
      'Pengisian Lembar Kerja: Agenda Self-Care 30-60-90 Hari dan Jurnal Syukur (Gratitude Journaling)'
    ],
    kegiatanDetail: 'Pelatihan diawali dengan eksplorasi pemicu stres kerja dan refleksi kelelahan emosional pengasuh asrama. Fasilitator memaparkan 10 dimensi self-care dan langkah penanganan vicarious trauma dengan PFA. Peserta kemudian menyusun target pemulihan diri pada Lembar Kerja Agenda 30-60-90 Hari dan melakukan simulasi Gratitude Journaling (Jurnal Syukur), dilanjutkan latihan relaksasi mindfulness pernapasan dan evaluasi tes mandiri.',
    hasilCapaian: 'Wali Asuh memiliki instrumen rencana perawatan diri terstruktur (Agenda 30-60-90 Hari), memahami tanda-tanda awal kejenuhan mental (burnout), serta mampu menerapkan regulasi emosi mandiri sebelum mendampingi peserta didik.',
    simpulan: 'Self-care merupakan investasi jangka panjang bagi ketahanan psikologis Wali Asuh agar tetap mampu menghadirkan pengasuhan yang hangat, sabar, stabil, dan profesional.',
    saranTindakLanjut: 'Mengimplementasikan rutinitas self-care teratur (olahraga peregangan, tidur cukup, digital detox malam, jurnal syukur harian) dan mengadakan forum dukungan sebaya (peer-support) antar pengasuh asrama.'
  },
  helping_skills: {
    id: 'helping_skills',
    kodeModul: 'MODUL 7: HELPING SKILLS',
    namaModul: 'Modul Keterampilan Membantu (Helping Skills) & Komunikasi Empatik',
    topikUtama: 'Active Listening, Komunikasi Empatik (Teknik OARS), dan Pembentukan Figur Lekat (Attachment Figure)',
    durasi: '3 JP (3 x 45 Menit = 135 Menit)',
    metode: 'Ceramah Andragogi, Diskusi Kasus, Game "Pick a Side", Roleplay Skenario & Lembar Observasi',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN KETERAMPILAN MEMBANTU (HELPING SKILLS) DAN KOMUNIKASI EMPATIK WALI ASUH SEKOLAH RAKYAT',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Modul 7 Helping Skills guna meningkatkan keterampilan komunikasi dua arah yang menumbuhkan rasa percaya (trust) peserta didik dan mentransformasi peran wali asuh menjadi figur lekat (attachment figure) yang aman.',
    solusi: 'Menguasai keterampilan Mendengar Aktif (Attending, Observing bahasa tubuh, Listening, Empathic Responding, Paraphrasing, Summarizing), menerapkan teknik komunikasi empatik OARS (Open-ended questions, Affirmations, Reflective listening, Summarizing), serta mempraktikkan simulasi studi kasus asrama (kasus Dewa, Sinta, Fajar, Ardi).',
    pokokBahasan: [
      'Konsep Figur Lekat (Attachment Figure) dan Ruang Aman (Safe Haven & Secure Base) Anak Asrama',
      'Mendengar Aktif (Active Listening): Perbedaan Hearing vs Listening, Attending dan Observing Non-Verbal',
      'Teknik Komunikasi Empatik OARS (Open-ended Questions, Affirmations, Reflective Listening, Summarizing)',
      'Game "Pick a Side": Membedakan Respon Mendukung vs Respon Menghakimi/Menyepelekan',
      'Roleplay Simulasi Kasus Nyata (Dewa, Sinta, Fajar, Ardi) Menggunakan Lembar Observasi Khusus'
    ],
    kegiatanDetail: 'Pelatihan dilaksanakan secara partisipatif selama 3 JP (135 menit). Peserta mendalami konsep active listening dan OARS melalui paparan materi dan simulasi game "Pick a Side". Selanjutnya peserta melakukan roleplay studi kasus riil (seperti kasus Dewa yang mengalami perundungan fisik/suara dan kasus Ardi yang terlibat dorong-dorongan), dinilai oleh observer kelompok menggunakan Lembar Observasi Helping Skills, dan diakhiri dengan refleksi mendalam bersama fasilitator.',
    hasilCapaian: 'Wali Asuh mampu mendengar secara penuh tanpa memotong pembicaraan, mahir memvalidasi emosi anak dengan teknik OARS, serta mampu menciptakan iklim aman yang mendorong anak bercerita secara jujur tanpa rasa takut.',
    simpulan: 'Penerapan helping skills memampukan pengasuh hadir secara bermakna, mendengarkan untuk memahami, dan mendampingi agar anak bertumbuh mandiri.',
    saranTindakLanjut: 'Membiasakan penggunaan pertanyaan terbuka dan validasi emosi dalam sesi bimbingan malam asrama serta menghindari kalimat menceramahi atau menyepelekan perasaan siswa.'
  },
  problem_solving: {
    id: 'problem_solving',
    kodeModul: 'MODUL 7: PROBLEM SOLVING',
    namaModul: 'Modul Pemecahan Masalah Partisipatif (Problem Solving) Anak Asrama',
    topikUtama: 'Pemberdayaan Anak Berpikir Kritis Menyelesaikan Masalah Sendiri Tanpa Didikte',
    durasi: '2 JP (2 x 45 Menit = 90 Menit)',
    metode: 'Studi Kasus Asrama, Analisis Konsekuensi, Simulasi Dialog Pendampingan, dan Diskusi Terarah',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN TEKNIK PEMECAHAN MASALAH PARTISIPATIF (PROBLEM SOLVING) BAGI WALI ASUH SEKOLAH RAKYAT',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Teknik Problem Solving Partisipatif agar wali asuh tidak serta-merta mengambil alih atau mendikte solusi masalah anak, melainkan memandu anak belajar memecahkan masalahnya sendiri.',
    solusi: 'Mempelajari 6 tahapan pemecahan masalah partisipatif: Memahami masalah (5W+1H), Menentukan tujuan yang ingin dicapai, Menghasilkan alternatif solusi, Menilai konsekuensi pilihan, Menentukan langkah paling realistis, serta Mengevaluasi hasil yang dicapai.',
    pokokBahasan: [
      'Filosofi Problem Solving Partisipatif: Membantu Anak Menemukan Solusinya Sendiri',
      '6 Tahapan Problem Solving (Pahami Masalah, Tujuan, Alternatif, Konsekuensi, Pilih Solusi, Evaluasi)',
      'Keterampilan Memvalidasi Perasaan Anak Sebelum Memulai Pemecahan Masalah',
      'Teknik Mengajukan Pertanyaan Eksploratif untuk Memancing Ide Kreatif Siswa',
      'Penanganan Konflik Antar-Siswa Asrama Melalui Mediasi Partisipatif Ramah Anak'
    ],
    kegiatanDetail: 'Peserta menelaah alur pendampingan 6 langkah pemecahan masalah dengan studi kasus anak yang dituduh mengambil barang teman (kasus Fajar). Peserta mempraktikkan cara mendengarkan, memvalidasi emosi kemarahan anak, membantu anak mendefinisikan apa yang sebenarnya terjadi, menggali opsi respon yang tidak merugikan dirinya, serta menyepakati rencana tindak lanjut mandiri.',
    hasilCapaian: 'Wali Asuh terampil memandu proses problem solving secara kolaboratif sehingga anak merasa dilibatkan, bertanggung jawab, dan memiliki keterampilan memecahkan konflik sosialnya secara matang.',
    simpulan: 'Problem solving partisipatif meningkatkan rasa kepemilikan (ownership) dan kemandirian peserta didik dalam menghadapi tantangan pergaulan di asrama.',
    saranTindakLanjut: 'Menerapkan tahapan problem solving partisipatif pada setiap penanganan insiden kedisiplinan dan konflik antarteman di asrama Sekolah Rakyat.'
  },
  modifikasi_perilaku: {
    id: 'modifikasi_perilaku',
    kodeModul: 'MODUL 5: MODIFIKASI PERILAKU',
    namaModul: 'Modul Modifikasi Perilaku & Analisis ABC (Antecedent-Behavior-Consequence)',
    topikUtama: 'Penguatan Perilaku Adaptif, Eliminasi Maladaptif, Token Economy, dan Role Modeling',
    durasi: '2 JP (2 x 45 Menit = 90 Menit)',
    metode: 'Review Modul, Analisis Tabel ABC, Perancangan Sistem Token Economy, dan Studi Komparasi',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN MODIFIKASI PERILAKU DAN TEKNIK ANALISIS ABC PESERTA DIDIK ASRAMA SEKOLAH RAKYAT',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mendalami Modul 5 Modifikasi Perilaku guna menyusun strategi pembentukan kebiasaan adaptif (sesuai norma asrama) dan mengikis perilaku maladaptif siswa secara terencana dan terstruktur.',
    solusi: 'Menguasai konsep perilaku terukur dan dapat diamati, melakukan asesmen awal menggunakan analisis ABC (Antecedent-Behavior-Consequence), menerapkan teknik penguatan (reinforcement materi/sosial/token/intrinsik), pembentukan bertahap (shaping), pemodelan (modeling), serta konsistensi teladan wali asuh.',
    pokokBahasan: [
      'Konsep Dasar Perilaku Nyata yang Dapat Diukur dan Diamati (Adaptif vs Maladaptif)',
      'Asesmen Perilaku Mendalam Menggunakan Analisis ABC (Antecedent-Behavior-Consequence)',
      'Teknik Penguatan (Reinforcement), Pembentukan Bertahap (Shaping), dan Pemodelan (Modeling)',
      'Penerapan Sistem Token Economy di Lingkungan Kamar dan Aktivitas Asrama',
      'Peran Wali Asuh Sebagai Role Model / Teladan Utama dan Prinsip Evaluasi Berkelanjutan'
    ],
    kegiatanDetail: 'Pelatihan mengkaji telaah instrumen analisis ABC terhadap perilaku terlambat bangun dan penumpukan pakaian kotor siswa. Peserta merancang matriks token economy terintegrasi dengan pembiasaan shalat berjamaah, piket kamar, dan jam belajar malam, menetapkan aturan main yang adil, serta merumuskan evaluasi berkala tanpa hukuman yang menghakimi.',
    hasilCapaian: 'Wali Asuh memahami pemicu anteseden di balik perilaku siswa serta terampil menyusun program modifikasi perilaku berbasis penguatan positif yang manusiawi.',
    simpulan: 'Modifikasi perilaku berbasis asesmen ABC dan token economy merupakan instrumen efektif dalam membentuk karakter kedisiplinan dan kemandirian siswa asrama Sekolah Rakyat.',
    saranTindakLanjut: 'Menerapkan lembar pemantauan ABC dan papan token prestasi positif di tiap asrama Sekolah Rakyat Terintegrasi 31 Palembang.'
  },
  pfa_trauma: {
    id: 'pfa_trauma',
    kodeModul: 'MODUL KHUSUS: PFA & TRAUMA',
    namaModul: 'Modul Psychological First Aid (PFA) & Pendampingan Sensitif Trauma',
    topikUtama: 'Pertolongan Pertama Psikologis bagi Anak Krisis Emosional dan Deteksi Dini Trauma',
    durasi: '3 JP (3 x 45 Menit = 135 Menit)',
    metode: 'Simulasi Krisis Emosional, De-eskalasi Amarah, Roleplay Prinsip PFA, dan Bedah SOP Rujukan',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN PERTOLONGAN PERTAMA PSIKOLOGIS (PSYCHOLOGICAL FIRST AID - PFA) DAN PENDAMPINGAN SENSITIF TRAUMA',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Pelatihan Psychological First Aid (PFA) guna meningkatkan kesiapsiagaan wali asuh dalam menangani krisis psikologis, kepanikan, homesickness berat, atau perilaku menyakiti diri pada peserta didik rentan.',
    solusi: 'Menguasai prinsip PFA (non-diskriminasi, empati, kerahasiaan, memberdayakan) serta 6 langkah aksi: Look (observasi aman), Listen (mendengarkan aktif), Comfort and Care (menenangkan), Connect and Protect (menghubungkan dukungan), Activate Action (langkah realistis), dan Instilling Hope (menumbuhkan harapan).',
    pokokBahasan: [
      'Prinsip Dasar PFA: Non-diskriminasi, Empati, Kerahasiaan, Memberdayakan, Bukan Penanganan Klinis',
      'Langkah Inti PFA: Look, Listen, Comfort & Care, Connect & Protect, Activate Action, Instilling Hope',
      'Teknik De-eskalasi Krisis Emosional Anak (Tantrum, Panik, Menangis Histeris)',
      'Pencegahan dan Penanganan Awal Perilaku Melukai Diri (Self-Harm)',
      'SOP Rujukan Cepat Kasus Gawat Darurat Psikologis ke Pekerja Sosial dan Psikolog'
    ],
    kegiatanDetail: 'Peserta mempraktikkan simulasi de-eskalasi mendalam saat menghadapi anak asrama yang menangis histeris pasca jam besuk orang tua atau mengalami syok trauma. Fasilitator melatih penerapan sentuhan menenangkan, nada bicara stabil, serta penyusunan lembar rujukan darurat ke Pekerja Sosial dan layanan medis.',
    hasilCapaian: 'Wali Asuh memiliki kesiapan psikologis untuk meredakan krisis emosional siswa tanpa memperburuk trauma serta memahami batasan peran dan alur rujukan medis.',
    simpulan: 'Penerapan PFA menciptakan rasa aman mendasar (psychological safety) di asrama dan melindungi kesejahteraan mental peserta didik Sekolah Rakyat.',
    saranTindakLanjut: 'Menyediakan pojok pemulihan emosi (safe space corner) di asrama dan menyosialisasikan kontak darurat Satgas SR & Pekerja Sosial.'
  },
  monitoring_adl: {
    id: 'monitoring_adl',
    kodeModul: 'MODUL INSTRUMEN: MONITORING ADL',
    namaModul: 'Modul Monitoring Perkembangan Anak Asuh & Asesmen ADL (Activities Daily Living)',
    topikUtama: 'Pengukuran Kemandirian Harian (ADL), Aspek Sosial, Mental Spiritual, dan Vokasional',
    durasi: '2 JP (2 x 45 Menit = 90 Menit)',
    metode: 'Workshop Pengisian Form Lampiran 4 Pusdiklatbangprof, Studi Kasus Skoring, dan Verifikasi Lapangan',
    penyelenggara: 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kemensos RI 2026',
    fasilitator: 'Tim Fasilitator Pusdiklatbangprof Kemensos RI',
    judulLaporan: 'PELATIHAN INSTRUMENTASI MONITORING PERKEMBANGAN ANAK ASUH (ADL) DAN PENGKAJIAN CEPAT PEKSOS',
    permasalahan: 'Adanya penugasan resmi dari Direktur / Pimpinan untuk mengikuti Bimbingan Teknis Standarisasi Instrumen Monitoring Perkembangan Anak Asuh dan Rapid Assessment Peksos di Sekolah Rakyat.',
    solusi: 'Menguasai tata cara skoring instrumen Lampiran 4 Pusdiklatbangprof (9 butir ADL, 6 butir Sosial, 10 butir Mental Psikologis/Spiritual, 5 butir Vokasional) dan Lampiran 3 (Rapid Assessment Form) untuk pemantauan berbasis data.',
    pokokBahasan: [
      'Pengenalan Instrumen Monitoring Perkembangan Anak Asuh Lampiran 4 Pusdiklatbangprof',
      '9 Indikator Activities Daily Living (ADL): Bangun Tidur, Kebersihan Diri, Pakaian, Makan, Tidur, Kesehatan',
      'Pengukuran Aspek Sosial, Mental Spiritual, Ideologi Pancasila, dan Ketahanan Psikologis',
      'Skoring Evaluasi Berkala (Sangat Kurang, Kurang, Cukup, Baik, Sangat Baik)',
      'Pemanfaatan Formulir Rapid Assessment Form untuk Pemetaan Hak dan Kebutuhan Anak'
    ],
    kegiatanDetail: 'Peserta melakukan workshop praktik skoring lembar pemantauan ADL terhadap profil siswa asrama. Peserta menghitung agregat skor perkembangan kemandirian anak, memetakan indikator yang masih berkategori "kurang", dan menyusun rencana bimbingan remedial kebiasaan harian.',
    hasilCapaian: 'Wali Asuh mampu mengisi dan menganalisis instrumen perkembangan anak asuh secara presisi dan objektif sebagai basis evaluasi kinerja bulanan.',
    simpulan: 'Instrumen monitoring perkembangan anak asuh menjamin akuntabilitas pengasuhan berbasis data (evidence-based childcare) di Sekolah Rakyat.',
    saranTindakLanjut: 'Menerapkan rekapitulasi penilaian perkembangan ADL setiap akhir bulan dan mengarsipkannya dalam dokumen portofolio rekam jejak siswa.'
  }
};
