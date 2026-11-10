import { RHK_DATA } from '../data/presets';

/**
 * SKP Problem Matcher & Intervention Diagnostic Tool
 * Berdasarkan Tupoksi Jabatan Penata Layanan Operasional / Wali Asuh / Pekerja Sosial
 * di Lingkungan Sekolah Rakyat Terintegrasi Kementerian Sosial Republik Indonesia
 * Mendukung 300 Skenario Kasus (50 Kasus per RHK pada RHK 1 s.d. RHK 6)
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
    id: 'tidak_mau_makan',
    tag: '🍽️ Tidak Mau Makan (RHK 2)',
    kategori: 'RHK 2',
    masalah: 'Siswa menolak makan (tidak mau makan / mogok makan) saat jadwal makan di ruang makan asrama dan membiarkan porsi makanannya utuh sehingga berisiko lemas dan kekurangan gizi.'
  },
  {
    id: 'tidak_mau_sekolah',
    tag: '🏫 Tidak Mau Sekolah (RHK 1)',
    kategori: 'RHK 1',
    masalah: 'Siswa tidak mau sekolah (mogok berangkat ke kelas / school refusal) di pagi hari, mengunci diri di kamar asrama, dan mengeluh cemas mengikuti pelajaran.'
  },
  {
    id: 'baju_hilang',
    tag: '👕 Baju Hilang / Tertukar (RHK 2)',
    kategori: 'RHK 2',
    masalah: 'Siswa melaporkan baju seragam atau pakaian hariannya hilang/tertukar di area jemuran dan lemari kamar asrama karena belum diberi label nama dan lupa diangkat saat kering.'
  },
  {
    id: 'atribut_tidak_lengkap',
    tag: '👔 Atribut Sekolah Tidak Lengkap (RHK 1)',
    kategori: 'RHK 1',
    masalah: 'Saat apel pagi keberangkatan sekolah, atribut seragam sekolah siswa tidak lengkap (tidak memakai topi, dasi, ikat pinggang hitam, atau kaos kaki sesuai aturan).'
  },
  {
    id: 'tidak_mau_upacara',
    tag: '🇮🇩 Tidak Mau Upacara (RHK 1)',
    kategori: 'RHK 1',
    masalah: 'Siswa tidak mau mengikuti upacara bendera hari Senin dan bersembunyi di kamar asrama karena malas berbaris di lapangan.'
  },
  {
    id: 'shalat_bolos',
    tag: '🕌 Ibadah & Kedisiplinan (RHK 3)',
    kategori: 'RHK 3',
    masalah: 'Siswa sering bersembunyi di kamar mandi atau pura-pura tidur saat waktu shalat subuh dan maghrib berjamaah, menunjukkan keengganan beribadah dan membantah saat ditegur pengasuh.'
  },
  {
    id: 'kamar_kumuh',
    tag: '🧺 ADL & Kebersihan Kamar (RHK 2)',
    kategori: 'RHK 2',
    masalah: 'Siswa menumpuk pakaian kotor hingga berjamur di bawah tempat tidur, tidak mau mencuci baju sendiri, dan sering memicu bau tidak sedap di kamar asrama.'
  },
  {
    id: 'pr_malas',
    tag: '📚 Akademik & Belajar Mandiri (RHK 1)',
    kategori: 'RHK 1',
    masalah: 'Siswa mengalami frustrasi saat mengerjakan PR matematika sekolah, mudah terdistraksi gawai/teman, dan menunjukkan gejala inatensi serta penurunan prestasi akademik.'
  },
  {
    id: 'sakit_demam',
    tag: '🩺 Kesehatan & Keluhan UKS (RHK 2)',
    kategori: 'RHK 2',
    masalah: 'Siswa mengeluh demam tinggi (38.5°C), pusing, dan mual di asrama, nafsu makan menurun drastis, serta memerlukan tindakan isolasi perawatan UKS dan pemantauan berkala.'
  },
  {
    id: 'rindu_keluarga',
    tag: '👨‍👩‍👧 Kunjungan & Homesickness (RHK 3)',
    kategori: 'RHK 3',
    masalah: 'Pasca kunjungan orang tua di hari Minggu, siswa menangis histeris di kamar, menolak makan malam, dan memohon ingin pulang karena mengalami kecemasan perpisahan (separation anxiety).'
  },
  {
    id: 'emosi_agresif',
    tag: '🧘 Emosi & Perkelahian (RHK 4)',
    kategori: 'RHK 4',
    masalah: 'Siswa terlibat pertengkaran fisik dan memukul teman sekamar karena merasa diejek perihal kondisi ekonomi keluarganya, menunjukkan disregulasi emosi dan impulsivitas tinggi.'
  },
  {
    id: 'siswa_abk',
    tag: '♿ Kebutuhan Khusus / ABK (RHK 5)',
    kategori: 'RHK 5',
    masalah: 'Siswa berkebutuhan khusus (hambatan pendengaran dan lambat belajar) kesulitan memahami arahan tata tertib asrama serta kerap diasingkan oleh teman sebayanya.'
  },
  {
    id: 'surat_pelatihan',
    tag: '📜 Surat Tugas Kedinasan (RHK 6)',
    kategori: 'RHK 6',
    masalah: 'Wali Asuh menerima Surat Tugas resmi dari Direktur Sekolah Rakyat untuk mengikuti Pelatihan Teknis Penanganan Trauma Healing & Kasus Asrama Siswa selama 2 hari.'
  }
];

/**
 * Intelligent Rule-based & Semantic Classifier for SKP Kemensos RI
 * Mencocokkan masalah terhadap 300 Skenario Kasus (50 per RHK) dan kata kunci tupoksi.
 */
export function diagnoseSkpProblem(masalahText: string): SkpDiagnosisResult {
  const text = (masalahText || '').toLowerCase().trim();

  // 1. Direct Special Case Matchers for high-frequency user cases:
  // Kasus A: Tidak Mau Sekolah / Mogok Sekolah -> RHK 1
  if (
    text.includes('tidak mau sekolah') ||
    text.includes('enggan sekolah') ||
    text.includes('mogok sekolah') ||
    text.includes('malas sekolah') ||
    text.includes('bolos sekolah') ||
    text.includes('school refusal') ||
    text.includes('tidak mau masuk kelas')
  ) {
    return {
      recommendedRhk: '1',
      rhkBadge: 'RHK 1 - Bimbingan & Pengajaran Siswa',
      rhkTitle: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK',
      kategoriTupoksi: 'Penanganan Siswa Tidak Mau Sekolah (School Refusal) & Motivasi Akademik',
      confidenceScore: 98,
      alasanKesesuaian:
        'Penanganan siswa yang menolak berangkat sekolah (school refusal), mogok masuk kelas, atau kehilangan motivasi belajar pagi merupakan tupoksi utama Wali Asuh pada RHK 1 (Bimbingan dan Pengajaran kepada Siswa Peserta Didik).',
      judulRekomendasi: 'BIMBINGAN DAN PENANGANAN KASUS SISWA TIDAK MAU SEKOLAH (SCHOOL REFUSAL)',
      gambaranKasus:
        'Siswa menolak berangkat ke sekolah di pagi hari (mogok sekolah / school refusal), mengunci diri di kamar asrama, dan mengeluhkan kecemasan menghadapi pelajaran maupun dinamika pergaulan di kelas.',
      metodeIntervensiPeksos: 'Motivational Interviewing (MI) & Graded Exposure Pendampingan Kelas',
      landasanTeori:
        'Teori Self-Determination (Deci & Ryan) dan Cognitive Behavioral Therapy (CBT) untuk mengidentifikasi akar penghindaran sekolah serta membangun kembali rasa aman dan motivasi intrinsik belajar.',
      tahapanIntervensi: [
        '1. Pendekatan empatik dari hati ke hati di kamar asrama tanpa paksaan kasar',
        '2. Asesmen cepat penyebab penolakan sekolah (kesulitan pelajaran, konflik teman, atau kelelahan)',
        '3. Koordinasi langsung dengan Wali Kelas dan Guru BK untuk menciptakan sambutan kelas yang ramah',
        '4. Mengantar siswa secara suportif hingga masuk ke ruang kelas dan memantau adaptasinya'
      ],
      penyelesaianKonkret:
        'Mendampingi siswa bersiap pagi, memberikan sarapan hangat, mengantar sampai ke pintu kelas bersama wali kelas, serta mendampingi belajar malam agar tidak tertinggal pelajaran.',
      solusiLaporan:
        'Melakukan pendekatan konseling empatik pagi hari (Motivational Interviewing), mengidentifikasi akar penyebab penolakan sekolah bersama wali kelas, memberikan penguatan bertahap (graded exposure), serta mengantar siswa hingga masuk ke ruang kelas dengan rasa aman.',
      rekomendasiTindakLanjut: [
        'Lakukan evaluasi harian bersama wali kelas terkait kehadiran dan kenyamanan siswa di kelas.',
        'Pasangkan siswa dengan teman sebangku yang suportif (Study Buddy) untuk berangkat sekolah bersama.'
      ]
    };
  }

  // Kasus B: Atribut Sekolah Tidak Lengkap -> RHK 1
  if (
    text.includes('atribut') ||
    text.includes('seragam tidak lengkap') ||
    text.includes('tidak pakai dasi') ||
    text.includes('tidak pakai topi') ||
    text.includes('ikat pinggang') ||
    text.includes('sabuk') ||
    (text.includes('kaos kaki') && (text.includes('sekolah') || text.includes('upacara') || text.includes('atribut') || text.includes('lengkap')))
  ) {
    return {
      recommendedRhk: '1',
      rhkBadge: 'RHK 1 - Bimbingan & Pengajaran Siswa',
      rhkTitle: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK',
      kategoriTupoksi: 'Pembinaan Kedisiplinan Atribut Seragam Sekolah & Kesiapan Belajar',
      confidenceScore: 97,
      alasanKesesuaian:
        'Pembinaan kerapian dan kelengkapan atribut seragam sekolah (topi, dasi, ikat pinggang, kaos kaki, papan nama) sebelum berangkat belajar maupun upacara merupakan bagian dari bimbingan kedisiplinan siswa pada RHK 1.',
      judulRekomendasi: 'PEMBINAAN KEDISIPLINAN KELENGKAPAN ATRIBUT SERAGAM SEKOLAH PESERTA DIDIK',
      gambaranKasus:
        'Ditemukan siswa yang berangkat sekolah atau mengikuti apel pagi dengan atribut seragam tidak lengkap (tidak memakai topi, dasi, ikat pinggang hitam, kaos kaki sesuai ketentuan, atau papan nama) akibat kurang tertib menyiapkan perlengkapan sejak malam hari.',
      metodeIntervensiPeksos: 'Self-Management Checklist & Behavioral Contracting',
      landasanTeori:
        'Teori Manajemen Diri (Bandura) dan Operant Conditioning Skinner melalui pembiasaan kesiapan perlengkapan sekolah malam hari serta inspeksi kerapian terstruktur.',
      tahapanIntervensi: [
        '1. Inspeksi barisan apel pagi di halaman asrama sebelum keberangkatan ke sekolah',
        '2. Melengkapi atribut yang tertinggal di lemari kamar dan membimbing cara pemakaian yang rapi',
        '3. Menerapkan Ceklis Persiapan Seragam Malam Hari (sebelum tidur pukul 21.00 WIB)',
        '4. Memberikan apresiasi poin ketertiban bagi kamar dengan kelengkapan atribut 100%'
      ],
      penyelesaianKonkret:
        'Menyediakan gantungan khusus atribut sekolah (dasi, topi, sabuk) di pintu lemari masing-masing siswa serta memeriksa kesiapan atribut setiap malam seusai belajar mandiri.',
      solusiLaporan:
        'Melaksanakan inspeksi kerapian seragam pagi sebelum berangkat sekolah, menerapkan metode Self-Management Checklist perlengkapan seragam di lemari sejak malam hari, serta membina kesadaran disiplin tata tertib sekolah.',
      rekomendasiTindakLanjut: [
        'Pastikan setiap atribut seragam (topi, dasi, sabuk) telah diberi label nama siswa agar tidak tertukar.',
        'Lakukan pengecekan kesiapan seragam setiap Minggu sore untuk jadwal sekolah sepekan ke depan.'
      ]
    };
  }

  // Kasus C: Tidak Mau Upacara / Bolos Upacara -> RHK 1
  if (
    text.includes('tidak mau upacara') ||
    text.includes('enggan upacara') ||
    text.includes('malas upacara') ||
    text.includes('bolos upacara') ||
    text.includes('menolak upacara') ||
    text.includes('sembunyi saat upacara')
  ) {
    return {
      recommendedRhk: '1',
      rhkBadge: 'RHK 1 - Bimbingan & Pengajaran Siswa',
      rhkTitle: 'BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK',
      kategoriTupoksi: 'Pembinaan Nasionalisme & Penanganan Siswa Enggan Mengikuti Upacara',
      confidenceScore: 98,
      alasanKesesuaian:
        'Bimbingan kedisiplinan mengikuti upacara bendera, penanaman karakter nasionalisme, dan pengawalan barisan peleton siswa merupakan variabel utama dalam RHK 1.',
      judulRekomendasi: 'BIMBINGAN KEDISIPLINAN DAN PENANGANAN SISWA ENGGAN MENGIKUTI UPACARA BENDERA',
      gambaranKasus:
        'Siswa menolak atau sengaja bersembunyi di kamar asrama/kamar mandi karena tidak mau mengikuti upacara bendera hari Senin dengan alasan malas berdiri lama di lapangan dan kurang memahami makna upacara kebangsaan.',
      metodeIntervensiPeksos: 'Persuasive Guidance, Civic Psychoeducation & Positive Reinforcement',
      landasanTeori:
        'Pendekatan Bimbingan Karakter Kebangsaan dan Modifikasi Perilaku untuk menumbuhkan kepatuhan tata tertib, penghormatan terhadap lambang negara, dan ketahanan mental-fisik siswa.',
      tahapanIntervensi: [
        '1. Penyisiran kamar asrama pukul 06.45 WIB dan pendekatan persuasif kepada siswa yang menghindar',
        '2. Pemeriksaan kondisi fisik (memastikan siswa sudah sarapan dan minum air putih cukup)',
        '3. Bimbingan nilai nasionalisme, disiplin, dan tanggung jawab sebagai pelajar Sekolah Rakyat',
        '4. Pendampingan langsung siswa di barisan peleton upacara hingga selesai dengan tertib'
      ],
      penyelesaianKonkret:
        'Mengajak siswa bergabung ke lapangan upacara secara persuasif, mengawal di dekat barisan, serta melibatkan siswa secara bertahap dalam latihan petugas upacara agar tumbuh rasa bangga.',
      solusiLaporan:
        'Melakukan pendekatan persuasif dan konseling wawasan kebangsaan, memastikan siswa sudah sarapan dan minum air putih yang cukup, mendampingi langsung siswa menuju barisan peleton, serta memberikan penguatan positif atas kepatuhan mengikuti upacara.',
      rekomendasiTindakLanjut: [
        'Wajibkan seluruh siswa sarapan pagi pukul 06.00 WIB sebelum apel upacara hari Senin.',
        'Kunci pintu kamar asrama selama jam pelaksanaan upacara bendera berlangsung.'
      ]
    };
  }

  // Kasus D: Tidak Mau Makan / Mogok Makan -> RHK 2
  if (
    text.includes('tidak mau makan') ||
    text.includes('mogok makan') ||
    text.includes('susah makan') ||
    text.includes('enggan makan') ||
    text.includes('malas makan') ||
    text.includes('menolak makan') ||
    text.includes('pilih-pilih makanan') ||
    text.includes('picky eater')
  ) {
    return {
      recommendedRhk: '2',
      rhkBadge: 'RHK 2 - Kemandirian Peserta Didik',
      rhkTitle: 'KEMANDIRIAN PESERTA DIDIK',
      kategoriTupoksi: 'Pemenuhan Kebutuhan Dasar Gizi, Perawatan Diri & Kemandirian Makan (ADL)',
      confidenceScore: 98,
      alasanKesesuaian:
        'Kemandirian makan teratur, pemenuhan asupan nutrisi bergizi, serta perawatan kesehatan tubuh merupakan bagian pokok dari Activities of Daily Living (ADL) dan kemandirian fisik peserta didik pada RHK 2.',
      judulRekomendasi: 'PENDAMPINGAN PEMENUHAN GIZI DAN PENANGANAN SISWA TIDAK MAU MAKAN DI ASRAMA',
      gambaranKasus:
        'Siswa menolak makan pada jam makan asrama (tidak mau makan / mogok makan), membiarkan porsi makanan utuh di nampan, atau hanya mengonsumsi jajanan ringan sehingga berisiko mengalami lemas, maag, dan defisiensi nutrisi.',
      metodeIntervensiPeksos: 'Biopsychosocial Nutrition Assessment & Supportive Mealtime Accompaniment',
      landasanTeori:
        'Pendekatan Biopsikososial dan Gradual Exposure untuk mengatasi hambatan nafsu makan melalui suasana makan komunal yang hangat, pemeriksaan kesehatan pencernaan, dan edukasi gizi.',
      tahapanIntervensi: [
        '1. Asesmen penyebab penolakan makan (apakah sariawan/mual, belum terbiasa menu sayur, atau sedang sedih/homesick)',
        '2. Pendampingan makan secara hangat bersama teman semeja dengan porsi bertahap yang tidak membebani',
        '3. Psikoedukasi pentingnya gizi seimbang bagi pertumbuhan fisik dan konsentrasi belajar',
        '4. Koordinasi dengan petugas dapur asrama dan ruang UKS untuk pemberian vitamin penambah nafsu makan'
      ],
      penyelesaianKonkret:
        'Menemani siswa makan dengan sabar di ruang makan asrama, menyajikan makanan dalam kondisi hangat, membatasi jajanan instan sebelum jam makan utama, dan memberikan apresiasi saat porsi makan habis.',
      solusiLaporan:
        'Melakukan asesmen biopsikososial penyebab penolakan makan (faktor selera, kesehatan lambung, atau suasana hati), mendampingi siswa makan secara hangat di ruang makan komunal, memberikan edukasi gizi seimbang, serta berkoordinasi dengan petugas dapur/kesehatan asrama.',
      rekomendasiTindakLanjut: [
        'Pantau berat badan dan habiskan porsi makan harian siswa dalam buku log gizi kamar.',
        'Terapkan aturan tidak jajan makanan ringan 1 jam sebelum jadwal makan utama asrama.'
      ],
      subTopikKeluargaKesehatan: 'kesehatan_anak'
    };
  }

  // Kasus E: Baju Hilang / Pakaian Tertukar di Jemuran -> RHK 2
  if (
    text.includes('baju hilang') ||
    text.includes('pakaian hilang') ||
    text.includes('seragam hilang') ||
    text.includes('celana hilang') ||
    text.includes('tertukar di jemuran') ||
    text.includes('baju tertukar') ||
    text.includes('barang hilang') ||
    text.includes('kaos kaki hilang')
  ) {
    return {
      recommendedRhk: '2',
      rhkBadge: 'RHK 2 - Kemandirian Peserta Didik',
      rhkTitle: 'KEMANDIRIAN PESERTA DIDIK',
      kategoriTupoksi: 'Kemandirian Pengelolaan Pakaian & Manajemen Barang Pribadi (ADL)',
      confidenceScore: 98,
      alasanKesesuaian:
        'Keterampilan mencuci, menjemur, mengangkat jemuran, menata lemari, dan menjaga kepemilikan pakaian pribadi merupakan indikator utama Kemandirian Peserta Didik (Activities of Daily Living / ADL) pada RHK 2.',
      judulRekomendasi: 'PEMBINAAN KEMANDIRIAN MANAJEMEN BARANG PRIBADI DAN PENANGANAN KASUS BAJU HILANG',
      gambaranKasus:
        'Siswa melaporkan baju seragam atau pakaian hariannya hilang/tertukar di area jemuran dan lemari kamar asrama akibat belum memberi label nama pada kerah pakaian serta lupa mengangkat jemuran saat sudah kering.',
      metodeIntervensiPeksos: 'Personal Belongings Self-Management & Name Tagging System',
      landasanTeori:
        'Pelatihan Keterampilan Hidup Mandiri (Independent Living Skills / ADL) melalui pembentukan kebiasaan terstruktur (Behavioral Chaining) dari mencuci, menjemur berpenjepit, hingga melipat ke lemari pribadi.',
      tahapanIntervensi: [
        '1. Menelusuri area jemuran komunal, keranjang pakaian tak bertuan (lost & found), dan lemari kamar bersama siswa',
        '2. Menerapkan penulisan label nama permanen (Name Tagging) menggunakan spidol tekstil pada seluruh pakaian siswa',
        '3. Membagikan gantungan baju (hanger) dan penjepit jemuran berlabel nomor kamar',
        '4. Menetapkan jadwal disiplin angkat dan lipat jemuran setiap sore pukul 16.00 WIB'
      ],
      penyelesaianKonkret:
        'Menemukan kembali pakaian yang tertukar melalui pengecekan bersama antar-kamar, memberi nama pada setiap helai seragam/pakaian, serta melatih siswa mencatat inventaris pakaian di pintu lemarinya.',
      solusiLaporan:
        'Melakukan penelusuran bersama di area jemuran dan kamar asrama, menerapkan sistem pelabelan nama permanen (Name Tagging System) pada seluruh pakaian siswa, menetapkan jadwal angkat jemuran sore, serta melatih tanggung jawab pengelolaan barang pribadi (ADL).',
      rekomendasiTindakLanjut: [
        'Sediakan keranjang khusus "Pakaian Temuan Jemuran" di setiap lorong asrama.',
        'Lakukan inspeksi kerapian lemari dan kelengkapan jumlah seragam setiap hari Sabtu.'
      ]
    };
  }

  // 2. Check similarity against all 300 scenarios in RHK_DATA (50 per RHK)
  const words = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  let bestScenarioMatch: {
    rhk: '1' | '2' | '3' | '4' | '5' | '6';
    label: string;
    p: string;
    s: string;
    matchScore: number;
  } | null = null;

  if (words.length >= 2) {
    (['1', '2', '3', '4', '5', '6'] as const).forEach((rhkKey) => {
      const cat = RHK_DATA[rhkKey];
      if (!cat) return;
      cat.scenarios.forEach((sc) => {
        const targetText = `${sc.label} ${sc.p}`.toLowerCase();
        let mScore = 0;
        words.forEach((w) => {
          if (targetText.includes(w)) {
            mScore += w.length >= 6 ? 3 : 2;
          }
        });
        if (mScore >= 6 && (!bestScenarioMatch || mScore > bestScenarioMatch.matchScore)) {
          bestScenarioMatch = {
            rhk: rhkKey,
            label: sc.label.replace(/^Opsi\s+\d+:\s*/i, ''),
            p: sc.p,
            s: sc.s,
            matchScore: mScore
          };
        }
      });
    });
  }

  // Scoring weights for each RHK
  let score1 = 0; // RHK 1: Bimbingan & Pengajaran Siswa (Akademik, Belajar, Sekolah, Atribut, Upacara)
  let score2 = 0; // RHK 2: Kemandirian Peserta Didik & ADL (Makan, Baju Hilang, Cuci, Kamar, Bangun Pagi, Kebersihan, Kesehatan/UKS)
  let score3 = 0; // RHK 3: Bimbingan Aspek Kehidupan (Ibadah, Mengaji, Etika Komunikasi, Kunjungan Ortu, Pola Asuh)
  let score4 = 0; // RHK 4: Bimbingan Spiritual & Emosional (Kestabilan emosi, marah, trauma, minder, homesick mendalam)
  let score5 = 0; // RHK 5: Pendampingan ABK / Inklusi
  let score6 = 0; // RHK 6: Penugasan Direktur / Pelatihan / Dinas Luar

  // RHK 1 Keywords
  const rhk1Keywords = [
    'belajar', 'pr', 'tugas', 'sekolah', 'masuk kelas', 'pelajaran', 'matematika', 'membaca', 'menulis', 'remedial',
    'lambat belajar', 'slow learner', 'konsentrasi', 'inatensi', 'distraksi', 'nilai', 'akademik', 'ujian',
    'upacara', 'bendera', 'senin', 'nasionalisme', 'pbb', 'baris', 'petugas upacara', 'phbn', 'ikrar',
    'atribut', 'topi', 'dasi', 'sabuk', 'ikat pinggang', 'seragam sekolah', 'prokrastinasi', 'menunda tugas',
    'buku catatan', 'rapor', 'lks', 'buku paket', 'alat tulis', 'menyontek', 'pramuka'
  ];

  // RHK 2 Keywords
  const rhk2Keywords = [
    'makan', 'tidak mau makan', 'mogok makan', 'sayur', 'gizi', 'nasi', 'lapar', 'jajan',
    'baju hilang', 'pakaian hilang', 'tertukar', 'cuci', 'mencuci', 'pakaian', 'baju', 'jemuran', 'setrika',
    'kotor', 'kamar', 'tempat tidur', 'sprei', 'kasur', 'lemari', 'loker', 'kunci', 'piket', 'kebersihan',
    'sampah', 'kumuh', 'berantakan', 'bangun pagi', 'terlambat bangun', 'begadang', 'tidur larut',
    'hygiene', 'mandi', 'sabun', 'handuk', 'sikat gigi', 'bau badan', 'kuku', 'rambut', 'sepatu', 'kaos kaki',
    'adl', 'kemandirian', 'kesehatan', 'sakit', 'demam', 'pusing', 'flu', 'mual', 'muntah', 'diare',
    'gatal', 'mengompol', 'uks', 'p3k', 'obat', 'istirahat baring', 'tirah baring', 'klinik', 'puskesmas', 'phbs',
    'uang saku', 'boros'
  ];

  // RHK 3 Keywords
  const rhk3Keywords = [
    'shalat', 'sholat', 'ibadah', 'subuh', 'maghrib', 'isya', 'zuhur', 'ashar', 'musala', 'masjid',
    'berjamaah', 'azan', 'wudhu', 'mengaji', 'qur\'an', 'al-qur\'an', 'iqro', 'tajwid', 'tadarus',
    'doa', 'sopan', 'santun', 'adab', 'etika', 'tata krama', 'berkomunikasi', 'bicara kasar', 'umpatan',
    'ejek', 'bergaul', 'sosialisasi', 'interaksi sosial', 'kunjungan', 'orang tua', 'ortu', 'wali murid',
    'ayah', 'ibu', 'besuk', 'keluarga', 'pola asuh', 'kontrak perilaku', 'konsultasi perkembangan',
    'senioritas', 'aturan asrama', 'jam malam', 'izin keluar', 'ketua kamar', 'kerja bakti'
  ];

  // RHK 4 Keywords
  const rhk4Keywords = [
    'emosi', 'marah', 'amuk', 'tantrum', 'agresif', 'memukul', 'berkelahi', 'menangis', 'sedih',
    'depresi', 'murung', 'menyendiri', 'mengurung diri', 'anxiety', 'cemas', 'panik', 'trauma',
    'harga diri', 'minder', 'rendah diri', 'percaya diri', 'self-esteem', 'homesick', 'homesickness',
    'rindu rumah', 'kesepian', 'stres', 'regulasi emosi', 'katarsis', 'ventilasi emosi', 'self-harm',
    'mimpi buruk', 'putus asa', 'kecewa', 'dendam', 'takut gelap', 'fobia', 'muhasabah'
  ];

  // RHK 5 Keywords
  const rhk5Keywords = [
    'berkebutuhan khusus', 'abk', 'disabilitas', 'difabel', 'tuna rungu', 'tuna netra', 'tuna daksa',
    'tuna grahita', 'autis', 'autisme', 'adhd', 'hiperaktif', 'inklusi', 'wicara', 'bisu', 'tuli',
    'kursi roda', 'tongkat', 'sensorik', 'aksesibilitas', 'disleksia', 'dispraksia', 'ekolalia', 'stimming', 'iep', 'ppi'
  ];

  // RHK 6 Keywords
  const rhk6Keywords = [
    'surat tugas', 'st-', 'penugasan direktur', 'penugasan pimpinan', 'pelatihan', 'diklat', 'bimtek',
    'workshop', 'seminar', 'webinar', 'rapat koordinasi', 'mpls', 'kepanitiaan', 'piket operasional',
    'dinas luar', 'pengganti piket', 'perintah atasan', 'home visit', 'case conference', 'akreditasi', 'audit'
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

  if (bestScenarioMatch) {
    const matched = bestScenarioMatch as {
      rhk: '1' | '2' | '3' | '4' | '5' | '6';
      label: string;
      p: string;
      s: string;
      matchScore: number;
    };
    if (matched.rhk === '1') score1 += 6;
    if (matched.rhk === '2') score2 += 6;
    if (matched.rhk === '3') score3 += 6;
    if (matched.rhk === '4') score4 += 6;
    if (matched.rhk === '5') score5 += 6;
    if (matched.rhk === '6') score6 += 6;
  }

  // Boost for special indicators
  if (text.includes('upacara') || text.includes('pr') || text.includes('belajar') || text.includes('sekolah') || text.includes('atribut')) score1 += 5;
  if (text.includes('cuci') || text.includes('baju') || text.includes('makan') || text.includes('kamar kotor') || text.includes('demam') || text.includes('sakit') || text.includes('uks')) score2 += 6;
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
  const best = scores[0].score > 0 ? scores[0].rhk : '3';

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore > 0 ? Math.min(99, Math.max(78, Math.round((scores[0].score / totalScore) * 100) + 20)) : 84;

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
        gambaranKasus: bestScenarioMatch?.rhk === '1' ? bestScenarioMatch.p : 'Siswa mengalami kecemasan performa (stage fright) dan kesulitan konsentrasi barisan akibat kurangnya pembiasaan sikap tegap dan penghayatan nilai patriotisme.',
        metodeIntervensiPeksos: 'Behavioral Rehearsal (Gladi Resik Terarah) & Desensitisasi Emosi',
        landasanTeori: 'Teori Modifikasi Perilaku Skinner dan Social Learning Theory Bandura untuk mereduksi kecemasan panggung melalui modeling positif dan penguatan bertahap.',
        tahapanIntervensi: [
          '1. Asesmen kecemasan dan kesiapan fisik siswa sebelum upacara',
          '2. Latihan pernapasan relaksasi (deep breathing) dan afirmasi mental',
          '3. Gladi kotor dan gladi bersih terarah dengan feedback suportif',
          '4. Pengawalan langsung di barisan peleton upacara dan evaluasi bersama'
        ],
        penyelesaianKonkret: 'Melakukan pendampingan gladi intensif, menunjuk pendamping sebaya (peer support), serta memberikan apresiasi verbal pasca-upacara untuk meningkatkan self-efficacy.',
        solusiLaporan: bestScenarioMatch?.rhk === '1' ? bestScenarioMatch.s : 'Melaksanakan bimbingan kesiapan mental dan latihan baris-berbaris terstruktur, mengawal kedisiplinan barisan peleton, serta menanamkan nilai nasionalisme dan ketenangan mental siswa.',
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
      kategoriTupoksi: 'Pendampingan Belajar Mandiri, Kedisiplinan Sekolah & Remedial Akademik',
      confidenceScore: confidence,
      alasanKesesuaian: 'Kendala kehadiran sekolah, kelengkapan atribut, pengerjaan tugas, serta kesulitan memahami materi sekolah berada langsung dalam lingkup tugas bimbingan dan pengajaran (RHK 1) Wali Asuh.',
      judulRekomendasi: bestScenarioMatch?.rhk === '1'
        ? `BIMBINGAN DAN PENGAJARAN: ${bestScenarioMatch.label.toUpperCase()}`
        : 'BIMBINGAN DAN PENDAMPINGAN BELAJAR MANDIRI SERTA KEDISIPLINAN SEKOLAH SISWA',
      gambaranKasus: bestScenarioMatch?.rhk === '1'
        ? bestScenarioMatch.p
        : 'Siswa mengalami beban kognitif (cognitive overload), kesulitan membagi prioritas tugas sekolah, dan rentan mengalami demotivasi belajar saat menghadapi materi yang belum dipahami.',
      metodeIntervensiPeksos: 'Scaffolding Method & Cognitive Restructuring',
      landasanTeori: 'Teori Perkembangan Proksimal Vygotsky (Zone of Proximal Development) dan Cognitive Behavioral Therapy (CBT) dasar untuk merestrukturisasi pola pikir penghindaran tugas.',
      tahapanIntervensi: [
        '1. Identifikasi materi atau kendala sekolah yang menjadi sumber hambatan siswa',
        '2. Membagi tugas besar menjadi subtugas terukur (chunking & step-by-step)',
        '3. Memberikan scaffolding (bantuan bertahap yang perlahan dikurangi)',
        '4. Menetapkan kontrak waktu belajar malam dan persiapan sekolah tanpa distraksi'
      ],
      penyelesaianKonkret: 'Menyediakan lingkungan belajar tenang di ruang bimbingan asrama, memasangkan siswa dengan tutor sebaya yang berprestasi, dan memberikan token reward atas setiap tugas yang tuntas.',
      solusiLaporan: bestScenarioMatch?.rhk === '1'
        ? bestScenarioMatch.s
        : 'Menerapkan bimbingan belajar mandiri dengan teknik scaffolding bertahap, menata jadwal belajar malam tanpa distraksi gawai, dan membimbing penyelesaian tugas sekolah secara tuntas.',
      rekomendasiTindakLanjut: [
        'Koordinasikan perkembangan nilai dan catatan kesulitan belajar siswa dengan wali kelas di sekolah.',
        'Sediakan pojok baca dan lembar evaluasi belajar mandiri (study log) di asrama.'
      ]
    };
  }

  if (best === '2') {
    const isKesehatan = text.includes('sakit') || text.includes('demam') || text.includes('uks') || text.includes('obat') || text.includes('pusing') || text.includes('diare') || text.includes('gatal');
    if (isKesehatan) {
      return {
        recommendedRhk: '2',
        rhkBadge: 'RHK 2 - Kemandirian & Perawatan Diri',
        rhkTitle: 'KEMANDIRIAN PESERTA DIDIK',
        kategoriTupoksi: 'Pemantauan Kesehatan, Penanganan UKS & Perawatan Diri',
        confidenceScore: confidence,
        alasanKesesuaian: 'Pemeliharaan kesehatan fisik, tindakan pertolongan pertama di UKS, dan pembiasaan Pola Hidup Bersih Sehat (PHBS) adalah pilar esensial kemandirian fisik peserta didik (RHK 2).',
        judulRekomendasi: 'PENDAMPINGAN DAN PEMANTAUAN KESEHATAN SERTA PENANGANAN SAKIT SISWA',
        gambaranKasus: bestScenarioMatch?.rhk === '2' ? bestScenarioMatch.p : 'Siswa mengalami penurunan daya tahan tubuh, keletihan fisik, atau keluhan psikosomatis yang memerlukan pemisahan istirahat di ruang UKS guna mencegah transmisi penyakit di lingkungan asrama komunal.',
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
        solusiLaporan: bestScenarioMatch?.rhk === '2' ? bestScenarioMatch.s : 'Memberikan pertolongan pertama di ruang UKS asrama, memantau tanda vital secara berkala, menerapkan pendekatan biopsikososial, dan mengoordinasikan rujukan medis dengan fasilitas kesehatan terdekat.',
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
      kategoriTupoksi: 'Pembiasaan ADL (Activities of Daily Living), Pemenuhan Makan, Pengelolaan Pakaian & Kebersihan Kamar',
      confidenceScore: confidence,
      alasanKesesuaian: 'Kemampuan mengurus diri sendiri, makan teratur bergizi, menjaga pakaian agar tidak hilang/tertukar, mencuci baju, merapikan tempat tidur, dan bangun pagi tepat waktu adalah tugas perkembangan kemandirian hidup (ADL) di asrama yang dibina dalam RHK 2.',
      judulRekomendasi: bestScenarioMatch?.rhk === '2'
        ? `PEMBINAAN KEMANDIRIAN PESERTA DIDIK: ${bestScenarioMatch.label.toUpperCase()}`
        : 'PEMBINAAN KEMANDIRIAN MERAWAT PAKAIAN, BARANG PRIBADI DAN KEBERSIHAN KAMAR ASRAMA',
      gambaranKasus: bestScenarioMatch?.rhk === '2'
        ? bestScenarioMatch.p
        : 'Siswa belum terinternalisasi kebiasaan hidup mandiri akibat pola asuh permisif di rumah sebelumnya, sehingga mengalami ketergantungan dalam mengurus pakaian, makanan, dan barang pribadi.',
      metodeIntervensiPeksos: 'Behavioral Chaining, Self-Monitoring & Token Economy',
      landasanTeori: 'Prinsip Operant Conditioning Skinner: memecah kebiasaan merawat diri menjadi rantai perilaku kecil (chaining) dan memberikan penguatan positif terukur.',
      tahapanIntervensi: [
        '1. Asesmen tingkat kemandirian fungsional siswa (ADL Checklist)',
        '2. Demonstrasi langsung (modeling) cara mengelola pakaian, makan tertib, dan menata lemari',
        '3. Penyusunan jadwal piket harian, pelabelan barang pribadi, dan kartu pantau mandiri',
        '4. Inspeksi kamar harian disertai apresiasi bagi kamar terbersih'
      ],
      penyelesaianKonkret: 'Mendampingi langsung proses perawatan diri dan manajemen barang di asrama, memberikan panduan visual di dinding kamar, dan memberlakukan pembiasaan positif harian.',
      solusiLaporan: bestScenarioMatch?.rhk === '2'
        ? bestScenarioMatch.s
        : 'Melaksanakan bimbingan keterampilan hidup mandiri melalui demonstrasi pengelolaan pakaian dan kebersihan kamar, serta memberlakukan sistem monitoring harian asrama.',
      rekomendasiTindakLanjut: [
        'Terapkan program penghargaan bulanan "Kamar Asrama Teladan" untuk memicu kompetisi positif.',
        'Selaraskan kebiasaan kemandirian ADL saat siswa menjalani masa liburan di rumah.'
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
        gambaranKasus: bestScenarioMatch?.rhk === '3' ? bestScenarioMatch.p : 'Munculnya dinamika emosional saat pertemuan dan perpisahan dengan keluarga (separation anxiety), serta perlunya menyamakan standar disiplin antara lingkungan rumah dan asrama Sekolah Rakyat.',
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
        solusiLaporan: bestScenarioMatch?.rhk === '3' ? bestScenarioMatch.s : 'Melaksanakan sesi family casework bersama orang tua dan anak, menyelaraskan ekspektasi pengasuhan demokratis, serta menyepakati kontrak perilaku terpadu demi kenyamanan tumbuh kembang anak di Sekolah Rakyat.',
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
      judulRekomendasi: bestScenarioMatch?.rhk === '3'
        ? `BIMBINGAN ASPEK KEHIDUPAN: ${bestScenarioMatch.label.toUpperCase()}`
        : 'PEMBINAAN KEDISIPLINAN IBADAH BERJAMAAH DAN ETIKA KOMUNIKASI ASRAMA',
      gambaranKasus: bestScenarioMatch?.rhk === '3'
        ? bestScenarioMatch.p
        : 'Siswa mengalami inkonsistensi motivasi spiritual dan minimnya kesadaran tata krama pergaulan antarteman sebaya di asrama, rentan terpicu perselisihan verbal akibat candaan kasar.',
      metodeIntervensiPeksos: 'Social Group Work & Komunikasi Asertif',
      landasanTeori: 'Teori Pembelajaran Moral Kohlberg dan Social Group Work Konopka untuk membangun kohesi kelompok asrama yang berakhlak mulia dan saling menghormati.',
      tahapanIntervensi: [
        '1. Pembiasaan alarm panggilan adzan dan piket pengingat musala',
        '2. Pendampingan langsung (presence) oleh Wali Asuh dalam shalat berjamaah & halaqah mengaji',
        '3. Sesi lingkaran asrama (dormitory circle) untuk membedah adab bertutur kata sopan',
        '4. Mediasi restoratif bila terjadi kesalahpahaman antarsiswa'
      ],
      penyelesaianKonkret: 'Menjadwalkan bimbingan mengaji kelompok kecil, membimbing praktik wudhu dan shalat yang benar, serta menerapkan aturan denda kebaikan bila menggunakan kata-kata kasar.',
      solusiLaporan: bestScenarioMatch?.rhk === '3'
        ? bestScenarioMatch.s
        : 'Melakukan pendampingan langsung ibadah shalat berjamaah, membina etika bertutur kata melalui bimbingan kelompok suportif, serta menegakkan norma kesantunan hidup bersama di asrama.',
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
      judulRekomendasi: bestScenarioMatch?.rhk === '4'
        ? `BIMBINGAN SPIRITUAL & EMOSIONAL: ${bestScenarioMatch.label.toUpperCase()}`
        : 'BIMBINGAN REGULASI EMOSI DAN STABILISASI PSIKOLOGIS PESERTA DIDIK',
      gambaranKasus: bestScenarioMatch?.rhk === '4'
        ? bestScenarioMatch.p
        : 'Siswa memendam trauma masa lalu, mengalami disregulasi emosi (sulit mengendalikan impuls amarah), atau merasa terisolasi secara emosional dari lingkungan asrama.',
      metodeIntervensiPeksos: 'Client-Centered Counseling & Emotion-Focused Therapy (EFT)',
      landasanTeori: 'Pendekatan Humanistik Carl Rogers (Unconditional Positive Regard) untuk menyediakan ruang aman psikologis (psychological safety) agar anak mampu mengekspresikan perasaannya tanpa takut dihakimi.',
      tahapanIntervensi: [
        '1. Menciptakan suasana tenang di ruang konseling (ventilasi emosi dan katarsis)',
        '2. Mengajarkan teknik grounding 5-4-3-2-1 dan pernapasan diafragma saat emosi memuncak',
        '3. Mengidentifikasi trigger emosi (pemicu rasa marah/sedih)',
        '4. Mengubah respon agresif menjadi respon verbal asertif (I-Statement)'
      ],
      penyelesaianKonkret: 'Memberikan sesi konseling individu intensif, mengajak siswa jalan santai reflektif di taman asrama, serta menjauhkan dari situasi konflik hingga kondisi mental stabil.',
      solusiLaporan: bestScenarioMatch?.rhk === '4'
        ? bestScenarioMatch.s
        : 'Melaksanakan konseling humanistik empatik untuk meredakan gejolak emosi, melatih teknik regulasi diri dan relaksasi pikiran, serta mendampingi pemulihan kestabilan mental siswa.',
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
      judulRekomendasi: bestScenarioMatch?.rhk === '5'
        ? `PENDAMPINGAN SISWA ABK: ${bestScenarioMatch.label.toUpperCase()}`
        : 'PENDAMPINGAN AKSESIBILITAS DAN ADAPTASI SOSIAL SISWA BERKEBUTUHAN KHUSUS',
      gambaranKasus: bestScenarioMatch?.rhk === '5'
        ? bestScenarioMatch.p
        : 'Siswa menghadapi hambatan fisik/sensorik dalam mengakses fasilitas asrama dan rentan mengalami eksklusi sosial atau perundungan dari lingkungan sebaya.',
      metodeIntervensiPeksos: 'Individualized Accommodation Plan & Peer Sensitivity Training',
      landasanTeori: 'Social Model of Disability yang menekankan bahwa hambatan terbesar bukan pada keterbatasan fisik anak, melainkan ketiadaan akses dan prasangka lingkungan sosial.',
      tahapanIntervensi: [
        '1. Asesmen kebutuhan mobilitas dan akomodasi wajar di lingkungan asrama',
        '2. Memodifikasi tata letak kamar, tempat tidur, dan kamar mandi agar ramah disabilitas',
        '3. Psikoedukasi kepekaan inklusi kepada seluruh warga asrama (anti-bullying)',
        '4. Menunjuk rekan pendamping (buddy system) bergilir untuk membantu aktivitas harian'
      ],
      penyelesaianKonkret: 'Memindahkan ranjang siswa ke lantai bawah yang dekat dengan akses pintu dan kamar mandi, serta membimbing siswa lain agar memperlakukan ABK dengan hormat dan setara.',
      solusiLaporan: bestScenarioMatch?.rhk === '5'
        ? bestScenarioMatch.s
        : 'Menyusun rencana akomodasi individual, mengoptimalkan aksesibilitas fisik kamar dan asrama, serta menumbuhkan budaya inklusif yang suportif di kalangan sesama siswa.',
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
    judulRekomendasi: bestScenarioMatch?.rhk === '6'
      ? `PELAKSANAAN PENUGASAN: ${bestScenarioMatch.label.toUpperCase()}`
      : 'LAPORAN PELAKSANAAN PENUGASAN KEDINASAN DARI DIREKTUR SEKOLAH RAKYAT',
    gambaranKasus: bestScenarioMatch?.rhk === '6'
      ? bestScenarioMatch.p
      : 'Pelaksanaan tugas resmi kedinasan di luar jam rutinitas reguler yang membutuhkan akuntabilitas pertanggungjawaban berbasis nomor dan tanggal Surat Tugas.',
    metodeIntervensiPeksos: 'Professional Competency Enhancement & Task Delegation',
    landasanTeori: 'Manajemen Pelayanan Publik dan Kode Etik Pekerjaan Sosial dalam menjaga akuntabilitas kinerja aparatur dan pengasuhan berkualitas.',
    tahapanIntervensi: [
      '1. Verifikasi nomor surat tugas, tanggal, dan substansi perintah pimpinan',
      '2. Pelaksanaan penugasan dengan dedikasi dan standar operasional tinggi',
      '3. Pendokumentasian bukti dukung (absensi, foto, lembar kerja/modul)',
      '4. Penyusunan laporan pertanggungjawaban kedinasan resmi'
    ],
    penyelesaianKonkret: 'Menuntaskan seluruh indikator penugasan sesuai target waktu, menyusun ringkasan output kerja, dan melaporkan kembali hasil pelaksanaan kepada Direktur.',
    solusiLaporan: bestScenarioMatch?.rhk === '6'
      ? bestScenarioMatch.s
      : 'Melaksanakan penugasan kedinasan dengan penuh tanggung jawab sesuai arahan Surat Tugas pimpinan, mendokumentasikan kegiatan secara tertib, dan menyusun laporan pertanggungjawaban hasil penugasan.',
    rekomendasiTindakLanjut: [
      'Segera lakukan diseminasi ilmu/hasil penugasan kepada rekan sejawat Wali Asuh.',
      'Arsipkan salinan Surat Tugas dan laporan kegiatan ke dalam folder portofolio e-Kinerja.'
    ]
  };
}
