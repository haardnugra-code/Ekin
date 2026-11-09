/**
 * SKP Problem Matcher & Intervention Diagnostic Tool
 * Berdasarkan Tupoksi Jabatan Penata Layanan Operasional / Wali Asuh / Pekerja Sosial
 * di Lingkungan Sekolah Rakyat Terintegrasi Kementerian Sosial Republik Indonesia
 */

export interface SkpDiagnosisResult {
  recommendedRhk: '1' | '2' | '3' | '4' | '5' | '6';
  rhkBadge: string;
  rhkTitle: string;
  kategoriTupoksi: string;
  confidenceScore: number; // 0 - 100
  alasanKesesuaian: string;
  judulRekomendasi: string;
  gambaranKasus: string;
  metodeIntervensiPeksos: string;
  landasanTeori: string;
  tahapanIntervensi: string[];
  penyelesaianKonkret: string;
  solusiLaporan: string;
  rekomendasiTindakLanjut: string[];
  subTopikKeluargaKesehatan?: 'kunjungan_ortu' | 'konsultasi_perkembangan' | 'kesehatan_anak' | 'gabungan';
}

export interface SampleProblemPrompt {
  id: string;
  tag: string;
  kategori: string;
  masalah: string;
}

export const SAMPLE_PROBLEM_PROMPTS: SampleProblemPrompt[] = [
  {
    id: 'shalat_bolos',
    tag: '🕌 Ibadah & Kedisiplinan',
    kategori: 'RHK 3',
    masalah: 'Siswa sering bersembunyi di kamar mandi atau pura-pura tidur saat waktu shalat subuh dan maghrib berjamaah, menunjukkan keengganan beribadah dan membantah saat ditegur pengasuh.'
  },
  {
    id: 'kamar_kumuh',
    tag: '🧺 ADL & Kebersihan Kamar',
    kategori: 'RHK 2',
    masalah: 'Siswa menumpuk pakaian kotor hingga berjamur di bawah tempat tidur, tidak mau mencuci baju sendiri, dan sering memicu bau tidak sedap di kamar asrama.'
  },
  {
    id: 'pr_malas',
    tag: '📚 Akademik & Belajar Mandiri',
    kategori: 'RHK 1',
    masalah: 'Siswa mengalami frustrasi saat mengerjakan PR matematika sekolah, mudah terdistraksi gawai/teman, dan menunjukkan gejala inatensi serta penurunan prestasi akademik.'
  },
  {
    id: 'sakit_demam',
    tag: '🩺 Kesehatan & Keluhan UKS',
    kategori: 'RHK 2',
    masalah: 'Siswa mengeluh demam tinggi (38.5°C), pusing, dan mual di asrama, nafsu makan menurun drastis, serta memerlukan tindakan isolasi perawatan UKS dan pemantauan berkala.'
  },
  {
    id: 'rindu_keluarga',
    tag: '👨‍👩‍👧 Kunjungan & Homesickness',
    kategori: 'RHK 3',
    masalah: 'Pasca kunjungan orang tua di hari Minggu, siswa menangis histeris di kamar, menolak makan malam, dan memohon ingin pulang karena mengalami kecemasan perpisahan (separation anxiety).'
  },
  {
    id: 'emosi_agresif',
    tag: '🧘 Emosi & Perkelahian',
    kategori: 'RHK 4',
    masalah: 'Siswa terlibat pertengkaran fisik dan memukul teman sekamar karena merasa diejek perihal kondisi ekonomi keluarganya, menunjukkan disregulasi emosi dan impulsivitas tinggi.'
  },
  {
    id: 'upacara_grogi',
    tag: '🇮🇩 Upacara & Kedisiplinan',
    kategori: 'RHK 1',
    masalah: 'Siswa yang ditunjuk menjadi petugas pengibar bendera upacara hari Senin mengalami kegugupan ekstrem (stage fright), tangan gemetar, dan barisan peleton siswa kurang khidmat.'
  },
  {
    id: 'siswa_abk',
    tag: '♿ Kebutuhan Khusus / ABK',
    kategori: 'RHK 5',
    masalah: 'Siswa berkebutuhan khusus (hambatan pendengaran dan lambat belajar) kesulitan memahami arahan tata tertib asrama serta kerap diasingkan oleh teman sebayanya.'
  },
  {
    id: 'surat_pelatihan',
    tag: '📜 Surat Tugas Kedinasan',
    kategori: 'RHK 6',
    masalah: 'Wali Asuh menerima Surat Tugas resmi dari Direktur Sekolah Rakyat untuk mengikuti Pelatihan Teknis Penanganan Trauma Healing & Kasus Asrama Siswa selama 2 hari.'
  }
];

/**
 * Intelligent Rule-based & Semantic Classifier for SKP Kemensos RI
 */
export function diagnoseSkpProblem(masalahText: string): SkpDiagnosisResult {
  const text = (masalahText || '').toLowerCase().trim();

  // Scoring weights for each RHK
  let score1 = 0; // RHK 1: Bimbingan & Pengajaran Siswa (Akademik, Belajar, Upacara)
  let score2 = 0; // RHK 2: Kemandirian Peserta Didik & ADL (Cuci, Kamar, Bangun Pagi, Kebersihan, Kesehatan/UKS)
  let score3 = 0; // RHK 3: Bimbingan Aspek Kehidupan (Ibadah, Mengaji, Etika Komunikasi, Kunjungan Ortu, Pola Asuh)
  let score4 = 0; // RHK 4: Bimbingan Spiritual & Emosional (Kestabilan emosi, marah, trauma, minder, homesick mendalam)
  let score5 = 0; // RHK 5: Pendampingan ABK / Inklusi
  let score6 = 0; // RHK 6: Penugasan Direktur / Pelatihan / Dinas Luar

  // RHK 1 Keywords
  const rhk1Keywords = [
    'belajar', 'pr', 'tugas', 'sekolah', 'pelajaran', 'matematika', 'membaca', 'menulis', 'remedial',
    'lambat belajar', 'slow learner', 'konsentrasi', 'inatensi', 'distraksi', 'nilai', 'akademik',
    'upacara', 'bendera', 'senin', 'nasionalisme', 'pbb', 'baris', 'petugas upacara', 'phbn', 'ikrar',
    'prokrastinasi', 'menunda tugas', 'buku catatan', 'rapor'
  ];

  // RHK 2 Keywords
  const rhk2Keywords = [
    'cuci', 'mencuci', 'pakaian', 'baju', 'jemuran', 'setrika', 'kotor', 'kamar', 'tempat tidur',
    'sprei', 'lemari', 'piket', 'kebersihan', 'sampah', 'kumuh', 'berantakan', 'bangun pagi',
    'terlambat bangun', 'begadang', 'tidur larut', 'hygiene', 'mandi', 'sikat gigi', 'bau badan',
    'kuku', 'rambut', 'makan', 'adl', 'kemandirian', 'kesehatan', 'sakit', 'demam', 'pusing', 'flu',
    'mual', 'muntah', 'diare', 'uks', 'p3k', 'obat', 'istirahat baring', 'tirah baring', 'klinik',
    'puskesmas', 'phbs'
  ];

  // RHK 3 Keywords
  const rhk3Keywords = [
    'shalat', 'sholat', 'ibadah', 'subuh', 'maghrib', 'isya', 'zuhur', 'ashar', 'musala', 'masjid',
    'berjamaah', 'azan', 'wudhu', 'mengaji', 'qur\'an', 'al-qur\'an', 'iqro', 'tajwid', 'tadarus',
    'doa', 'sopan', 'santun', 'adab', 'etika', 'tata krama', 'berkomunikasi', 'bicara kasar',
    'ejek', 'bergaul', 'sosialisasi', 'interaksi sosial', 'kunjungan', 'orang tua', 'ortu', 'wali murid',
    'ayah', 'ibu', 'besuk', 'keluarga', 'pola asuh', 'kontrak perilaku', 'konsultasi perkembangan'
  ];

  // RHK 4 Keywords
  const rhk4Keywords = [
    'emosi', 'marah', 'amuk', 'tantrum', 'agresif', 'memukul', 'berkelahi', 'menangis', 'sedih',
    'depresi', 'murung', 'menyendiri', 'mengurung diri', 'anxiety', 'cemas', 'panik', 'trauma',
    'harga diri', 'minder', 'rendah diri', 'percaya diri', 'self-esteem', 'homesick', 'homesickness',
    'rindu rumah', 'kesepian', 'stres', 'regulasi emosi', 'katarsis', 'ventilasi emosi', 'self-harm'
  ];

  // RHK 5 Keywords
  const rhk5Keywords = [
    'berkebutuhan khusus', 'abk', 'disabilitas', 'difabel', 'tuna rungu', 'tuna netra', 'tuna daksa',
    'tuna grahita', 'autis', 'autisme', 'adhd', 'hiperaktif', 'inklusi', 'wicara', 'bisu', 'tuli',
    'kursi roda', 'tongkat', 'sensorik', 'aksesibilitas'
  ];

  // RHK 6 Keywords
  const rhk6Keywords = [
    'surat tugas', 'st-', 'penugasan direktur', 'penugasan pimpinan', 'pelatihan', 'diklat', 'bimtek',
    'workshop', 'seminar', 'webinar', 'rapat koordinasi', 'mpls', 'kepanitiaan', 'piket operasional',
    'dinas luar', 'pengganti piket', 'perintah atasan'
  ];

  // Calculate Matches
  rhk1Keywords.forEach((kw) => {
    if (text.includes(kw)) score1 += kw.length > 5 ? 3 : 2;
  });
  rhk2Keywords.forEach((kw) => {
    if (text.includes(kw)) score2 += kw.length > 5 ? 3 : 2;
  });
  rhk3Keywords.forEach((kw) => {
    if (text.includes(kw)) score3 += kw.length > 5 ? 3 : 2;
  });
  rhk4Keywords.forEach((kw) => {
    if (text.includes(kw)) score4 += kw.length > 5 ? 3 : 2;
  });
  rhk5Keywords.forEach((kw) => {
    if (text.includes(kw)) score5 += kw.length > 5 ? 4 : 3;
  });
  rhk6Keywords.forEach((kw) => {
    if (text.includes(kw)) score6 += kw.length > 5 ? 4 : 3;
  });

  // Boost for special indicators
  if (text.includes('upacara') || text.includes('pr') || text.includes('belajar')) score1 += 5;
  if (text.includes('cuci') || text.includes('kamar kotor') || text.includes('demam') || text.includes('sakit') || text.includes('uks')) score2 += 6;
  if (text.includes('shalat') || text.includes('mengaji') || text.includes('kunjungan orang tua') || text.includes('pola asuh')) score3 += 6;
  if (text.includes('menangis histeris') || text.includes('trauma') || text.includes('pukul') || text.includes('marah')) score4 += 5;
  if (text.includes('abk') || text.includes('disabilitas')) score5 += 10;
  if (text.includes('surat tugas') || text.includes('pelatihan')) score6 += 10;

  // Determine Winner
  const scores = [
    { rhk: '1' as const, score: score1 },
    { rhk: '2' as const, score: score2 },
    { rhk: '3' as const, score: score3 },
    { rhk: '4' as const, score: score4 },
    { rhk: '5' as const, score: score5 },
    { rhk: '6' as const, score: score6 }
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0].score > 0 ? scores[0].rhk : '3'; // Default to RHK 3 if generic

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore > 0 ? Math.min(99, Math.max(75, Math.round((scores[0].score / totalScore) * 100) + 20)) : 82;

  // Build specific diagnostic profiles based on target RHK and problem keywords
  if (best === '1') {
    const isUpacara = text.includes('upacara') || text.includes('bendera');
    if (isUpacara) {
      return {
        recommendedRhk: '1',
        rhkBadge: 'RHK 1 - Pengajaran & Pembinaan Siswa',
        rhkTitle: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK',
        kategoriTupoksi: 'Pembinaan Kedisiplinan Upacara & Karakter Nasionalisme',
        confidenceScore: confidence,
        alasanKesesuaian: 'Upacara bendera dan pelatihan petugas upacara merupakan instrumen formal pengajaran karakter kebangsaan, kedisiplinan baris-berbaris (PBB), dan kepatuhan tata tertib yang menjadi tugas pokok Wali Asuh dalam RHK 1.',
        judulRekomendasi: 'BIMBINGAN KEDISIPLINAN DAN KESIAPAN MENTAL UPACARA BENDERA SISWA',
        gambaranKasus: 'Siswa mengalami kecemasan performa (stage fright) dan kesulitan konsentrasi barisan akibat kurangnya pembiasaan sikap tegap dan penghayatan nilai patriotisme.',
        metodeIntervensiPeksos: 'Behavioral Rehearsal (Gladi Resik Terarah) & Desensitisasi Emosi',
        landasanTeori: 'Teori Modifikasi Perilaku Skinner dan Social Learning Theory Bandura untuk mereduksi kecemasan panggung melalui modeling positif dan penguatan bertahap.',
        tahapanIntervensi: [
          '1. Asesmen kecemasan dan kesiapan fisik siswa sebelum upacara',
          '2. Latihan pernapasan relaksasi (deep breathing) dan afirmasi mental',
          '3. Gladi kotor dan gladi bersih terarah dengan feedback suportif',
          '4. Pengawalan langsung di barisan peleton upacara dan evaluasi bersama'
        ],
        penyelesaianKonkret: 'Melakukan pendampingan gladi intensif, menunjuk pendamping sebaya (peer support), serta memberikan apresiasi verbal pasca-upacara untuk meningkatkan self-efficacy.',
        solusiLaporan: 'Melaksanakan bimbingan kesiapan mental dan latihan baris-berbaris terstruktur, mengawal kedisiplinan barisan peleton, serta menanamkan nilai nasionalisme dan ketenangan mental siswa.',
        rekomendasiTindakLanjut: [
          'Jadwalkan rotasi petugas upacara secara bertahap agar seluruh siswa memiliki kepercayaan diri.',
          'Lakukan evaluasi briefing singkat setiap hari Senin pagi sebelum bel upacara berbunyi.'
        ]
      };
    }

    return {
      recommendedRhk: '1',
      rhkBadge: 'RHK 1 - Bimbingan & Pengajaran Siswa',
      rhkTitle: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK',
      kategoriTupoksi: 'Pendampingan Belajar Mandiri & Remedial Akademik',
      confidenceScore: confidence,
      alasanKesesuaian: 'Kendala pengerjaan tugas, kesulitan memahami materi sekolah, dan prokrastinasi belajar malam berada langsung dalam lingkup tugas bimbingan belajar harian (RHK 1) Wali Asuh.',
      judulRekomendasi: 'BIMBINGAN DAN PENDAMPINGAN BELAJAR MANDIRI SERTA REMEDIAL TUGAS SISWA',
      gambaranKasus: 'Siswa mengalami beban kognitif (cognitive overload), kesulitan membagi prioritas tugas sekolah, dan rentan mengalami demotivasi belajar saat menghadapi materi yang belum dipahami.',
      metodeIntervensiPeksos: 'Scaffolding Method & Cognitive Restructuring',
      landasanTeori: 'Teori Perkembangan Proksimal Vygotsky (Zone of Proximal Development) dan Cognitive Behavioral Therapy (CBT) dasar untuk merestrukturisasi pola pikir penghindaran tugas.',
      tahapanIntervensi: [
        '1. Identifikasi materi atau tugas yang menjadi sumber hambatan siswa',
        '2. Membagi tugas besar menjadi subtugas terukur (chunking & step-by-step)',
        '3. Memberikan scaffolding (bantuan bertahap yang perlahan dikurangi)',
        '4. Menetapkan kontrak waktu belajar malam dengan jeda istirahat (Teknik Pomodoro)'
      ],
      penyelesaianKonkret: 'Menyediakan lingkungan belajar tenang di ruang bimbingan asrama, memasangkan siswa dengan tutor sebaya yang berprestasi, dan memberikan token reward atas setiap PR yang tuntas.',
      solusiLaporan: 'Menerapkan bimbingan belajar mandiri dengan teknik scaffolding bertahap, menata jadwal belajar malam tanpa distraksi gawai, dan membimbing penyelesaian tugas sekolah secara tuntas.',
      rekomendasiTindakLanjut: [
        'Koordinasikan perkembangan nilai dan catatan kesulitan belajar siswa dengan wali kelas di sekolah.',
        'Sediakan pojok baca dan lembar evaluasi belajar mandiri (study log) di asrama.'
      ]
    };
  }

  if (best === '2') {
    const isKesehatan = text.includes('sakit') || text.includes('demam') || text.includes('uks') || text.includes('obat') || text.includes('pusing');
    if (isKesehatan) {
      return {
        recommendedRhk: '2',
        rhkBadge: 'RHK 2 - Kemandirian & Perawatan Diri',
        rhkTitle: 'KEMANDIRIAN PESERTA DIDIK',
        kategoriTupoksi: 'Pemantauan Kesehatan, Penanganan UKS & Perawatan Diri',
        confidenceScore: confidence,
        alasanKesesuaian: 'Pemeliharaan kesehatan fisik, tindakan pertolongan pertama di UKS, dan pembiasaan Pola Hidup Bersih Sehat (PHBS) adalah pilar esensial kemandirian fisik peserta didik (RHK 2).',
        judulRekomendasi: 'PENDAMPINGAN DAN PEMANTAUAN KESEHATAN SERTA PENANGANAN SAKIT SISWA',
        gambaranKasus: 'Siswa mengalami penurunan daya tahan tubuh, keletihan fisik, atau keluhan psikosomatis yang memerlukan pemisahan istirahat di ruang UKS guna mencegah transmisi penyakit di lingkungan asrama komunal.',
        metodeIntervensiPeksos: 'Biopsychosocial Support & Health Advocacy',
        landasanTeori: 'Model Biopsikososial Engel yang mengintegrasikan penanganan medis dasar, pemulihan ketenangan mental siswa yang cemas saat sakit jauh dari orang tua, dan dukungan sosial asrama.',
        tahapanIntervensi: [
          '1. Pemeriksaan tanda vital (suhu tubuh, keluhan fisik, saturasi) di ruang UKS',
          '2. Tindakan perawatan awal (tirah baring, hidrasi hangat, nutrisi lembut, obat standar)',
          '3. Eksplorasi kecemasan psikosomatis dan pemberian afirmasi menenangkan',
          '4. Pemantauan berkala dan rujukan ke Puskesmas/Klinik Pratama bila gejala berlanjut',
          '5. Memberikan laporan kondisi transparan kepada orang tua/wali siswa'
        ],
        penyelesaianKonkret: 'Mengistirahatkan siswa di ruang isolasi UKS ber-SOP, memastikan asupan gizi dan obat teratur, serta mendampingi kepulangan sementara atau rujukan medis jika suhu >38.5°C.',
        solusiLaporan: 'Memberikan pertolongan pertama di ruang UKS asrama, memantau tanda vital secara berkala, menerapkan pendekatan biopsikososial, dan mengoordinasikan rujukan medis dengan fasilitas kesehatan terdekat.',
        rekomendasiTindakLanjut: [
          'Lakukan disinfeksi berkala di kamar asrama tempat tidur siswa yang sakit.',
          'Tingkatkan edukasi minum air putih minimal 2 liter/hari dan konsumsi vitamin daya tahan tubuh.'
        ],
        subTopikKeluargaKesehatan: 'kesehatan_anak'
      };
    }

    return {
      recommendedRhk: '2',
      rhkBadge: 'RHK 2 - Kemandirian Peserta Didik',
      rhkTitle: 'KEMANDIRIAN PESERTA DIDIK',
      kategoriTupoksi: 'Pembiasaan ADL (Activities of Daily Living) & Kebersihan Kamar',
      confidenceScore: confidence,
      alasanKesesuaian: 'Kemampuan mengurus diri sendiri, mencuci baju, merapikan tempat tidur, dan bangun pagi tepat waktu adalah tugas perkembangan kemandirian hidup (ADL) di asrama yang dibina dalam RHK 2.',
      judulRekomendasi: 'PEMBINAAN KEMANDIRIAN MERAWAT PAKAIAN DAN KEBERSIHAN KAMAR ASRAMA',
      gambaranKasus: 'Siswa belum terinternalisasi kebiasaan hidup mandiri akibat pola asuh permisif di rumah sebelumnya, sehingga mengalami learned helplessness (ketergantungan pasif) dalam mengurus barang pribadi.',
      metodeIntervensiPeksos: 'Behavioral Chaining & Token Economy',
      landasanTeori: 'Prinsip Operant Conditioning Skinner: memecah kebiasaan merawat diri menjadi rantai perilaku kecil (chaining) dan memberikan penguatan positif terukur.',
      tahapanIntervensi: [
        '1. Asesmen tingkat kemandirian fungsional siswa (ADL Checklist)',
        '2. Demonstrasi langsung (modeling) cara mencuci, memeras, menjemur, dan menata lemari',
        '3. Penyusunan jadwal piket harian dan kartu pantau mandiri (self-monitoring)',
        '4. Inspeksi kamar harian disertai apresiasi bagi kamar terbersih'
      ],
      penyelesaianKonkret: 'Mendampingi langsung proses mencuci pakaian di area laundry, memberikan panduan visual di dinding kamar, dan memberlakukan konsekuensi edukatif yang mendidik.',
      solusiLaporan: 'Melaksanakan bimbingan keterampilan hidup mandiri melalui demonstrasi mencuci pakaian, menegakkan jadwal piket kebersihan kamar, serta memberlakukan sistem monitoring harian asrama.',
      rekomendasiTindakLanjut: [
        'Terapkan program penghargaan bulanan "Kamar Asrama Teladan" untuk memicu kompetisi positif.',
        'Selaraskan kebiasaan mencuci dan merapikan kamar saat siswa menjalani masa liburan di rumah.'
      ]
    };
  }

  if (best === '3') {
    const isKeluarga = text.includes('kunjungan') || text.includes('orang tua') || text.includes('ortu') || text.includes('pola asuh') || text.includes('ayah') || text.includes('ibu');
    if (isKeluarga) {
      return {
        recommendedRhk: '3',
        rhkBadge: 'RHK 3 - Bimbingan Aspek Kehidupan',
        rhkTitle: 'BIMBINGAN ASPEK KEHIDUPAN PESERTA DIDIK',
        kategoriTupoksi: 'Konsultasi Perkembangan & Bimbingan Keluarga (Family Casework)',
        confidenceScore: confidence,
        alasanKesesuaian: 'Hari kunjungan orang tua, mediasi hubungan anak-keluarga, serta penyelarasan pola asuh adalah bagian fundamental dari pembinaan aspek kehidupan sosial dan relasional anak asrama (RHK 3).',
        judulRekomendasi: 'KUNJUNGAN ORANG TUA DAN KONSULTASI PERKEMBANGAN ADAPTASI PESERTA DIDIK',
        gambaranKasus: 'Munculnya dinamika emosional saat pertemuan dan perpisahan dengan keluarga (separation anxiety), serta perlunya menyamakan standar disiplin antara lingkungan rumah dan asrama Sekolah Rakyat.',
        metodeIntervensiPeksos: 'Family Casework & Mediation dipadukan dengan Parenting Alignment',
        landasanTeori: 'Teori Sistem Keluarga (Bowen) dan Teori Kelekatan (Bowlby), memposisikan keluarga sebagai mikrosistem utama yang harus selaras dengan makrosistem asrama.',
        tahapanIntervensi: [
          '1. Menyambut orang tua di ruang konsultasi asrama dengan empati (Rapport Building)',
          '2. Memaparkan catatan perkembangan akademik dan karakter anak secara transparan',
          '3. Mendengarkan kekhawatiran orang tua dengan teknik active listening (OARS)',
          '4. Memfasilitasi dialog rekonsiliasi antara anak dan orang tua',
          '5. Merumuskan kontrak pola asuh bersama (Behavioral Contract) selama anak di asrama/rumah'
        ],
        penyelesaianKonkret: 'Memfasilitasi sesi tatap muka berkualitas di jam kunjung resmi, memberikan penguatan psikologis kepada anak pasca-perpisahan, dan membuat grup komunikasi wali asuh-orang tua.',
        solusiLaporan: 'Melaksanakan sesi family casework bersama orang tua dan anak, menyelaraskan ekspektasi pengasuhan demokratis, serta menyepakati kontrak perilaku terpadu demi kenyamanan tumbuh kembang anak di Sekolah Rakyat.',
        rekomendasiTindakLanjut: [
          'Jadwalkan panggilan video terjadwal (video call asrama) 1 kali seminggu untuk memelihara kedekatan emosional.',
          'Kirimkan laporan rekam jejak mutaba\'ah berkala kepada orang tua secara transparan.'
        ],
        subTopikKeluargaKesehatan: 'kunjungan_ortu'
      };
    }

    return {
      recommendedRhk: '3',
      rhkBadge: 'RHK 3 - Bimbingan Aspek Kehidupan',
      rhkTitle: 'BIMBINGAN ASPEK KEHIDUPAN PESERTA DIDIK',
      kategoriTupoksi: 'Pembinaan Ibadah, Nilai Keagamaan & Etika Pergaulan Asrama',
      confidenceScore: confidence,
      alasanKesesuaian: 'Pembiasaan shalat berjamaah, mengaji/tahsin, etika berkomunikasi santun, dan pencegahan perkelahian/ejek-ejekan merupakan inti dari pembinaan aspek spiritual-sosial kehidupan asrama (RHK 3).',
      judulRekomendasi: 'PEMBINAAN KEDISIPLINAN IBADAH BERJAMAAH DAN ETIKA KOMUNIKASI ASRAMA',
      gambaranKasus: 'Siswa mengalami inkonsistensi motivasi spiritual dan minimnya kesadaran tata krama pergaulan antarteman sebaya di asrama, rentan terpicu perselisihan verbal akibat candaan kasar.',
      metodeIntervensiPeksos: 'Social Group Work & Komunikasi Asertif',
      landasanTeori: 'Teori Pembelajaran Moral Kohlberg dan Social Group Work Konopka untuk membangun kohesi kelompok asrama yang berakhlak mulia dan saling menghormati.',
      tahapanIntervensi: [
        '1. Pembiasaan alarm panggilan adzan dan piket pengingat musala',
        '2. Pendampingan langsung (presence) oleh Wali Asuh dalam shalat berjamaah & halaqah mengaji',
        '3. Sesi lingkaran asrama (dormitory circle) untuk membedah adab bertutur kata sopan',
        '4. Mediasi restoratif bila terjadi kesalahpahaman antarsiswa'
      ],
      penyelesaianKonkret: 'Menjadwalkan bimbingan mengaji kelompok kecil, membimbing praktik wudhu dan shalat yang benar, serta menerapkan aturan denda kebaikan bila menggunakan kata-kata kasar.',
      solusiLaporan: 'Melakukan pendampingan langsung ibadah shalat berjamaah, membina etika bertutur kata melalui bimbingan kelompok suportif, serta menegakkan norma kesantunan hidup bersama di asrama.',
      rekomendasiTindakLanjut: [
        'Bentuk sistem kakak-adik asuh (mentoring sebaya) untuk saling mengingatkan waktu ibadah.',
        'Adakan kultum singkat bergilir yang dibawakan oleh siswa sehabis shalat maghrib.'
      ]
    };
  }

  if (best === '4') {
    return {
      recommendedRhk: '4',
      rhkBadge: 'RHK 4 - Bimbingan Spiritual & Emosional',
      rhkTitle: 'BIMBINGAN SPIRITUAL & EMOSIONAL PESERTA DIDIK',
      kategoriTupoksi: 'Stabilisasi Emosi, Konseling Krisis & Penanganan Homesickness',
      confidenceScore: confidence,
      alasanKesesuaian: 'Masalah ledakan amarah (tantrum), agresi fisik, perasaan minder, depresi, atau kesedihan mendalam akibat rindu keluarga masuk ke dalam ranah bimbingan kesehatan mental & emosional (RHK 4).',
      judulRekomendasi: 'BIMBINGAN REGULASI EMOSI DAN STABILISASI PSIKOLOGIS PESERTA DIDIK',
      gambaranKasus: 'Siswa memendam trauma masa lalu, mengalami disregulasi emosi (sulit mengendalikan impuls amarah), atau merasa terisolasi secara emosional dari lingkungan asrama.',
      metodeIntervensiPeksos: 'Client-Centered Counseling & Emotion-Focused Therapy (EFT)',
      landasanTeori: 'Pendekatan Humanistik Carl Rogers (Unconditional Positive Regard) untuk menyediakan ruang aman psikologis (psychological safety) agar anak mampu mengekspresikan perasaannya tanpa takut dihakimi.',
      tahapanIntervensi: [
        '1. Menciptakan suasana tenang di ruang konseling (ventilasi emosi dan katarsis)',
        '2. Mengajarkan teknik grounding 5-4-3-2-1 dan pernapasan diafragma saat emosi memuncak',
        '3. Mengidentifikasi trigger emosi (pemicu rasa marah/sedih)',
        '4. Mengubah respon agresif menjadi respon verbal asertif (I-Statement)'
      ],
      penyelesaianKonkret: 'Memberikan sesi konseling individu intensif, mengajak siswa jalan santai reflektif di taman asrama, serta menjauhkan dari situasi konflik hingga kondisi mental stabil.',
      solusiLaporan: 'Melaksanakan konseling humanistik empatik untuk meredakan gejolak emosi, melatih teknik regulasi diri dan relaksasi pikiran, serta mendampingi pemulihan kestabilan mental siswa.',
      rekomendasiTindakLanjut: [
        'Pantau grafik suasana hati (mood tracker) harian siswa selama 14 hari ke depan.',
        'Rujuk ke psikolog klinis / lembaga profesional bila ditemukan tanda-tanda trauma berat atau kecenderungan melukai diri.'
      ]
    };
  }

  if (best === '5') {
    return {
      recommendedRhk: '5',
      rhkBadge: 'RHK 5 - Pendampingan Siswa ABK / Inklusi',
      rhkTitle: 'PENDAMPINGAN SISWA BERKEBUTUHAN KHUSUS',
      kategoriTupoksi: 'Aksesibilitas, Individualized Support & Edukasi Inklusi Sebaya',
      confidenceScore: confidence,
      alasanKesesuaian: 'Setiap pendampingan khusus bagi siswa dengan disabilitas fisik, sensorik, neurodivergen (ADHD/Autis), atau hambatan perkembangan spesifik merupakan mandat langsung RHK 5.',
      judulRekomendasi: 'PENDAMPINGAN AKSESIBILITAS DAN ADAPTASI SOSIAL SISWA BERKEBUTUHAN KHUSUS',
      gambaranKasus: 'Siswa menghadapi hambatan fisik/sensorik dalam mengakses fasilitas asrama dan rentan mengalami eksklusi sosial atau perundungan dari lingkungan sebaya.',
      metodeIntervensiPeksos: 'Individualized Accommodation Plan & Peer Sensitivity Training',
      landasanTeori: 'Social Model of Disability yang menekankan bahwa hambatan terbesar bukan pada keterbatasan fisik anak, melainkan ketiadaan akses dan prasangka lingkungan sosial.',
      tahapanIntervensi: [
        '1. Asesmen kebutuhan mobilitas dan akomodasi wajar di lingkungan asrama',
        '2. Memodifikasi tata letak kamar, tempat tidur, dan kamar mandi agar ramah disabilitas',
        '3. Psikoedukasi kepekaan inklusi kepada seluruh warga asrama (anti-bullying)',
        '4. Menunjuk rekan pendamping (buddy system) bergilir untuk membantu aktivitas harian'
      ],
      penyelesaianKonkret: 'Memindahkan ranjang siswa ke lantai bawah yang dekat dengan akses pintu dan kamar mandi, serta membimbing siswa lain agar memperlakukan ABK dengan hormat dan setara.',
      solusiLaporan: 'Menyusun rencana akomodasi individual, mengoptimalkan aksesibilitas fisik kamar dan asrama, serta menumbuhkan budaya inklusif yang suportif di kalangan sesama siswa.',
      rekomendasiTindakLanjut: [
        'Berkala periksa kelayakan alat bantu fisik atau komunikasi siswa.',
        'Lakukan koordinasi dengan guru pembimbing khusus (GPK) di sekolah.'
      ]
    };
  }

  // Fallback to RHK 6: Penugasan Kedinasan Lainnya
  return {
    recommendedRhk: '6',
    rhkBadge: 'RHK 6 - Penugasan Direktur / Pimpinan',
    rhkTitle: 'PENUGASAN DIREKTUR / PIMPINAN (SURAT TUGAS)',
    kategoriTupoksi: 'Pelaksanaan Tugas Kedinasan Lainnya, Pelatihan & Penggantian Piket',
    confidenceScore: confidence,
    alasanKesesuaian: 'Pelaksanaan kegiatan berdasarkan Surat Tugas resmi dari Direktur/Pimpinan (seperti bimtek, pelatihan teknis, kepanitiaan MPLS, dinas luar) dicatat dalam RHK 6.',
    judulRekomendasi: 'LAPORAN PELAKSANAAN PENUGASAN KEDINASAN DARI DIREKTUR SEKOLAH RAKYAT',
    gambaranKasus: 'Pelaksanaan tugas resmi kedinasan di luar jam rutinitas reguler yang membutuhkan akuntabilitas pertanggungjawaban berbasis nomor dan tanggal Surat Tugas.',
    metodeIntervensiPeksos: 'Professional Competency Enhancement & Task Delegation',
    landasanTeori: 'Manajemen Pelayanan Publik dan Kode Etik Pekerjaan Sosial dalam menjaga akuntabilitas kinerja aparatur dan pengasuhan berkualitas.',
    tahapanIntervensi: [
      '1. Verifikasi nomor surat tugas, tanggal, dan substansi perintah pimpinan',
      '2. Pelaksanaan penugasan dengan dedikasi dan standar operasional tinggi',
      '3. Pendokumentasian bukti dukung (absensi, foto, lembar kerja/modul)',
      '4. Penyusunan laporan pertanggungjawaban kedinasan resmi'
    ],
    penyelesaianKonkret: 'Menuntaskan seluruh indikator penugasan sesuai target waktu, menyusun ringkasan output kerja, dan melaporkan kembali hasil pelaksanaan kepada Direktur.',
    solusiLaporan: 'Melaksanakan penugasan kedinasan dengan penuh tanggung jawab sesuai arahan Surat Tugas pimpinan, mendokumentasikan kegiatan secara tertib, dan menyusun laporan pertanggungjawaban hasil penugasan.',
    rekomendasiTindakLanjut: [
      'Segera lakukan diseminasi ilmu/hasil penugasan kepada rekan sejawat Wali Asuh.',
      'Arsipkan salinan Surat Tugas dan laporan kegiatan ke dalam folder portofolio e-Kinerja.'
    ]
  };
}
