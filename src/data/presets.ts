import { DailyPreset, RhkCategory } from "../types";

export const DEFAULT_DASAR_HUKUM = `Keputusan Sekretaris Jenderal Nomor 1111/1/HM.01.03/4/2026 tentang Perubahan Kedua atas Keputusan Sekretaris Jenderal Nomor 425/1/HM.01.03/2/2026 tentang Penetapan Tenaga Kependidikan di Sekolah Rakyat Tahun Ajaran 2025/2026.`;

export const DASAR_HUKUM_LIST = [
  "Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.",
  "Undang-Undang Nomor 35 Tahun 2014 tentang Perlindungan Anak.",
  "Undang-Undang Nomor 11 Tahun 2009 tentang Kesejahteraan Sosial.",
  "Peraturan Presiden tentang Penyelenggaraan Sekolah Rakyat.",
  "Pedoman Operasional Penyelenggaraan Sekolah Rakyat.",
  "Tata Tertib Sekolah Rakyat.",
  "Informasi Jabatan Penata Layanan Operasional (Wali Asuh)."
];

export const DASAR_PELAKSANAAN_LIST = [
  "Instruksi Presiden Republik Indonesia Nomor 8 Tahun 2025 tentang Optimalisasi Pelaksanaan Pengentasan Kemiskinan dan Penghapusan Kemiskinan Ekstrem.",
  "Keputusan Menteri Sosial Republik Indonesia Nomor 49/HUK/2025 tentang Tim Formatur Penyelenggaraan Sekolah Rakyat.",
  "Keputusan Menteri Sosial Republik Indonesia Nomor 110/HUK/2025 tentang Perlengkapan Penyelenggaraan Sekolah Rakyat.",
  "Peraturan Menteri Sosial Republik Indonesia Nomor 7 Tahun 2025 tentang Organisasi dan Tata Kerja Sekolah Rakyat.",
  "Pedoman Operasional Pengelolaan Asrama Sekolah Rakyat Tahun 2025.",
  "Peraturan internal dan tata tertib Sekolah Rakyat yang berlaku."
];

export const DAILY_PRESETS: Record<string, DailyPreset> = {
  shalat: {
    targetRhk: "3",
    judul: "PEMBINAAN KEDISIPLINAN IBADAH SHALAT BERJAMAAH PESERTA DIDIK",
    permasalahan: "Siswa kerap terlambat mengikuti shalat berjamaah di musala/masjid asrama dan menunjukkan kecenderungan menunda-nunda panggilan azan.",
    solusi: "Melakukan pembiasaan dan bimbingan spiritual secara konsisten melalui pendampingan langsung menjelang waktu shalat, memberikan motivasi keagamaan, serta menetapkan jadwal piket pengingat shalat."
  },
  mengaji: {
    targetRhk: "3",
    judul: "BIMBINGAN DAN PENGAJARAN BACA TULIS AL-QUR'AN / MENGAJI",
    permasalahan: "Beberapa siswa belum lancar membaca Al-Qur'an/Iqro dan merasa kurang percaya diri saat kegiatan mengaji bersama di asrama.",
    solusi: "Menerapkan bimbingan mengaji secara privat/kelompok kecil (peer tutoring) dengan metode iqro/tajwid yang suportif, serta memberikan reinforcement positif atas setiap peningkatan siswa."
  },
  cuci: {
    targetRhk: "2",
    judul: "PEMBINAAN KEMANDIRIAN CUCI DAN MERAWAT PAKAIAN PESERTA DIDIK",
    permasalahan: "Siswa masih menumpuk pakaian kotor dan bergantung pada orang lain atau pengasuh dalam hal mencuci serta merawat pakaian pribadinya.",
    solusi: "Melakukan pendampingan dan pelatihan cara mencuci, memeras, serta menjemur pakaian dengan benar melalui metode demonstrasi bertahap (chaining) hingga siswa terbiasa mandiri."
  },
  kamar: {
    targetRhk: "2",
    judul: "PEMBINAAN KEMANDIRIAN DAN KEBERSIHAN LINGKUNGAN KAMAR ASRAMA",
    permasalahan: "Siswa kurang peduli terhadap kerapian tempat tidur, membiarkan barang berserakan, dan enggan melaksanakan piket kebersihan kamar.",
    solusi: "Mengimplementasikan jadwal piket harian, mengajarkan teknik penataan tempat tidur yang rapi, serta menerapkan kontrol sosial positif kelompok (group contingency) di asrama."
  },
  belajar: {
    targetRhk: "1",
    judul: "BIMBINGAN DAN PENDAMPINGAN BELAJAR MANDIRI / PEKERJAAN RUMAH",
    permasalahan: "Siswa mengalami kesulitan mengelola waktu belajar malam, mudah terdistraksi, dan bingung menyelesaikan tugas/PR sekolah.",
    solusi: "Menyediakan suasana belajar kondusif, memberikan metode scaffolding (bantuan bertahap) saat mengerjakan tugas, serta melatih manajemen waktu belajar harian."
  },
  keseharian: {
    targetRhk: "2",
    judul: "PEMBINAAN RUTINITAS KESEHARIAN DAN KEDISIPLINAN BANGUN PAGI",
    permasalahan: "Siswa sering bangun terlambat di pagi hari yang berdampak pada ketergesaan persiapan sekolah dan terlewatnya jam piket pagi.",
    solusi: "Melakukan pengaturan jam tidur malam yang disiplin (digital detox malam), pendampingan bangun pagi dengan pendekatan ramah empati, serta edukasi ritme sirkadian tubuh."
  },
  hygiene: {
    targetRhk: "2",
    judul: "PEMBINAAN KEMANDIRIAN PERAWATAN DIRI DAN HYGIENE PRIBADI",
    permasalahan: "Siswa belum terbiasa menjaga kebersihan diri (mandi tidak teratur, lupa sikat gigi, kurang memperhatikan penampilan rapi).",
    solusi: "Memberikan psikoedukasi kesehatan diri, menyusun checklist perawatan diri harian (self-monitoring), serta memberikan motivasi positif untuk meningkatkan percaya diri."
  },
  sosialisasi: {
    targetRhk: "3",
    judul: "PEMBINAAN ETIKA BERKOMUNIKASI DAN INTERAKSI SOSIAL ASRAMA",
    permasalahan: "Siswa kerap terlibat kesalahpahaman saat berinteraksi dengan sesama teman asrama karena nada bicara kasar atau candaan melampaui batas.",
    solusi: "Melakukan bimbingan kelompok (social group work), melatih keterampilan komunikasi asertif, dan mengajarkan norma tata krama kehidupan bersosialisasi."
  }
};

export const RHK_DATA: Record<string, RhkCategory> = {
  "1": {
    judul: "BIMBINGAN DAN PENGAJARAN KEPADA SISWA PESERTA DIDIK",
    scenarios: [
      { label: "Opsi 1: Kesulitan fokus & distraktibilitas tinggi", p: "Siswa menunjukkan gejala kurang konsentrasi, mudah terdistraksi, dan kesulitan memusatkan perhatian saat jam belajar mandiri (indikasi inatensi).", s: "Menerapkan pendekatan modifikasi perilaku (Behavioral) dengan teknik token economy, serta menata lingkungan belajar minim distraksi (Ecological Perspective)." },
      { label: "Opsi 2: Lambat memahami materi (Slow Learner)", p: "Siswa mengalami kelambatan kognitif dalam memahami instruksi atau materi pelajaran yang berdampak pada penurunan rasa percaya diri akademik.", s: "Melakukan casework individu dengan teknik scaffolding, memberikan intervensi remedial teaching, dan pendekatan person-in-environment bersama pihak sekolah." },
      { label: "Opsi 3: Pasif berpendapat & kecemasan sosial", p: "Siswa cenderung pasif, memiliki kecemasan sosial ringan, dan menghindari partisipasi aktif dalam diskusi kelompok belajar asrama.", s: "Menggunakan Social Group Work (terapi kelompok) berfokus pada dinamika kelompok untuk meningkatkan self-efficacy (Teori Bandura) dan keberanian asertif." },
      { label: "Opsi 4: Perilaku menunda tugas (Prokrastinasi)", p: "Siswa memiliki pola habituasi prokrastinasi akademik yang mengindikasikan adanya manajemen waktu yang buruk dan penghindaran tugas.", s: "Mengaplikasikan Cognitive Behavioral Therapy (CBT) dasar untuk merestrukturisasi pola pikir 'penundaan', serta menyusun behavioral contract untuk manajemen waktu." },
      { label: "Opsi 5: Kelelahan mental belajar (Burnout)", p: "Siswa menunjukkan gejala kelelahan mental (burnout), apatis terhadap tugas, dan hilangnya motivasi intrinsik akibat tekanan belajar.", s: "Memberikan intervensi konseling humanistik (Client-Centered) untuk ventilasi emosi, dipadukan dengan psikoedukasi teknik relaksasi dan mindfulness." },
      { label: "Opsi 6: Hambatan membaca & mengeja (Literasi Rendah)", p: "Siswa mengalami hambatan literasi dasar, sering menukar huruf atau lambat mengeja teks bacaan saat pendampingan belajar malam.", s: "Menggunakan metode pengajaran multisensori (VAKT: Visual, Auditory, Kinesthetic, Tactile) serta mendesain media belajar gambar/kartu kata interaktif." },
      { label: "Opsi 7: Apatisme & rendahnya motivasi cita-cita", p: "Siswa enggan belajar dan mengekspresikan ketidakpedulian terhadap pencapaian akademik karena kurangnya dukungan figur keluarga di masa lalu.", s: "Menerapkan teknik Motivational Interviewing (MI) untuk menggali motivasi internal serta mengenalkan program psychoeducation pemetaan cita-cita masa depan." },
      { label: "Opsi 8: Kecemasan materi hitungan (Diskalkulia)", p: "Siswa mengalami hambatan signifikan dalam memahami operasi hitung dasar dan konsep angka yang memicu kecemasan matematis.", s: "Menggunakan alat peraga konkret (pendekatan CPA: Konkret-Gambar-Abstrak) serta pendekatan belajar matematika berbasis permainan interaktif yang menyenangkan." },
      { label: "Opsi 9: Kebiasaan menyontek akibat kurang percaya diri", p: "Siswa menunjukkan perilaku tidak jujur dengan menyontek pekerjaan teman akibat rasa takut gagal dan rendahnya self-esteem akademik.", s: "Melakukan konseling pembentukan integritas diri dan memberikan afirmasi positif atas setiap usaha proses belajar tanpa berfokus hanya pada nilai akhir." },
      { label: "Opsi 10: Ketidakmampuan mengelola buku & jadwal", p: "Siswa sering lupa membawa buku pelajaran, kehilangan alat tulis, dan tidak rapi dalam mencatat pelajaran sekolah.", s: "Menerapkan metode manajemen diri (Self-Management) dengan menyusun jadwal pelajaran visual dan ceklis perlengkapan sekolah harian sebelum tidur." },
      { label: "Opsi 11: Hambatan memahami instruksi tertulis kompleks", p: "Siswa merasa kewalahan saat membaca perintah soal atau tugas yang panjang dan langsung mengalami keputusasaan.", s: "Melakukan teknik penyederhanaan instruksi (Chunking Method) serta membimbing siswa menandai kata kunci penting dalam setiap soal." },
      { label: "Opsi 12: Kecenderungan menyerah pada soal tingkat tinggi (HOTS)", p: "Siswa langsung menolak mencoba mengerjakan soal latihan bernalar tinggi dan menyatakan diri tidak mampu sebelum berusaha.", s: "Menerapkan Growth Mindset Training serta memberikan bimbingan pertanyaan pemantik (Socratic Questioning) secara berjenjang." },
      { label: "Opsi 13: Kesulitan mengekspresikan gagasan tulisan (Disgrafia)", p: "Siswa memiliki ide lisan yang baik namun sangat kesulitan menuangkannya dalam bentuk tulisan tangan yang rapi dan terstruktur.", s: "Memberikan latihan motorik halus (handwriting practice) serta mengizinkan metode dikte lisan awal untuk membangun kepercayaan diri mengekspresikan ide." },
      { label: "Opsi 14: Ketidakseimbangan fokus antar mata pelajaran", p: "Siswa hanya mau mempelajari satu mata pelajaran favorit dan secara total mengabaikan tugas mata pelajaran lainnya.", s: "Mengimplementasikan teknik Premack Principle (menggunakan aktivitas favorit sebagai penguat setelah menyelesaikan tugas yang kurang disukai)." },
      { label: "Opsi 15: Mengobrol & mengganggu kawan saat belajar", p: "Siswa sulit tenang di meja belajar, sering berpindah tempat, dan mengajak kawan mengobrol saat sesi belajar mandiri malam.", s: "Menata penempatan duduk strategis (seating arrangement), menetapkan aturan periode tenang (quiet time), dan menerapkan poin reward kelompok." },
      { label: "Opsi 16: Enggan bertanya saat mengalami kebingungan", p: "Siswa memilih diam atau membiarkan tugas tidak selesai daripada bertanya kepada pengasuh atau kawan karena malu dianggap tidak mampu.", s: "Menciptakan iklim belajar ramah salah (Psychological Safety), serta membuka kotak pertanyaan tertulis anonim atau sesi tanya jawab privat." },
      { label: "Opsi 17: Hambatan daya ingat konsep materi (Memory Retention)", p: "Siswa cepat melupakan materi pelajaran yang baru dipelajari kemarin sore sehingga merasa usahanya sia-sia.", s: "Mengajarkan teknik pemetaan pikiran (Mind Mapping) serta metode pengulangan berkala (Spaced Repetition) dalam jadwal belajar asrama." },
      { label: "Opsi 18: Kesulitan memprioritaskan tugas bertumpuk", p: "Siswa mengalami kebingungan dan kepanikan ketika menghadapi beberapa tenggat waktu tugas sekolah yang bersamaan.", s: "Melatih pengorganisasian tugas menggunakan Matriks Eisenhower (Penting-Mendesak) serta menyusun daftar prioritas kerja harian." },
      { label: "Opsi 19: Penurunan keaktifan akibat kelelahan sore", p: "Siswa sering mengantuk dan kehilangan fokus belajar malam akibat belum terbiasa mengatur jeda istirahat usai aktivitas ekstrakurikuler sore.", s: "Mengatur ulang jadwal manajemen energi siswa (power nap singkat sore hari) dan penyesuaian durasi fokus belajar bertahap." },
      { label: "Opsi 20: Ketergantungan berlebih pada bantuan kawan", p: "Siswa tidak mau mencoba mengerjakan soal sendiri dan selalu meminta kawan membantunya menyalin jawaban.", s: "Memberikan tugas berjenjang dari tingkat paling mudah untuk membangun efikasi diri (Self-Efficacy), serta membatasi bantuan kawan hanya sebagai pembimbing." }
    ]
  },
  "2": {
    judul: "KEMANDIRIAN PESERTA DIDIK",
    scenarios: [
      { label: "Opsi 1: Defisit perawatan diri & kamar", p: "Siswa belum menunjukkan kemandirian dalam merawat kebersihan tempat tidur dan area pribadinya (defisit Activities of Daily Living).", s: "Menerapkan teknik shaping dan chaining (pembentukan perilaku bertahap) dengan role modeling dari pengasuh, serta menyusun jadwal monitoring harian." },
      { label: "Opsi 2: Ketergantungan (Dependency) tinggi", p: "Siswa memiliki pola kelekatan (attachment) yang tidak aman sehingga sangat bergantung pada teman atau pengasuh untuk urusan kebersihan dan kebutuhan pribadi dasar.", s: "Membangun kemandirian melalui pendekatan pemberdayaan (Empowerment), memberikan tanggung jawab bertahap, dan konseling peningkatan kemandirian ego." },
      { label: "Opsi 3: Penumpukan pakaian kotor (Higiene Pakaian)", p: "Siswa membiarkan pakaian kotor menumpuk berhari-hari hingga menimbulkan bau dan ketidaknyamanan di lingkungan kamar asrama.", s: "Melakukan bimbingan praktik langsung (hands-on) tata cara mencuci dan merawat pakaian pribadi serta menyusun kesepakatan rutinitas cuci harian." },
      { label: "Opsi 4: Ketidakmampuan mengelola uang saku (Impulsive Buying)", p: "Siswa menghabiskan uang saku sekaligus dalam waktu singkat tanpa memperhitungkan kebutuhan harian asrama.", s: "Memberikan edukasi literasi keuangan dasar, mendampingi pembuatan buku pencatatan pengeluaran harian, serta menerapkan sistem pencairan uang bertahap." },
      { label: "Opsi 5: Kurang mandiri bangun pagi", p: "Siswa selalu membutuhkan bantuan pengasuh untuk dibangunkan dan sering terlambat melakukan persiapan pribadi di pagi hari.", s: "Melatih regulasi diri (Self-Regulation) melalui penggunaan alarm pribadi, penetapan rutinitas jam tidur malam yang konsisten, dan evaluasi harian." },
      { label: "Opsi 6: Kurangnya rasa tanggung jawab inventaris", p: "Siswa cenderung ceroboh dan tidak bertanggung jawab terhadap barang inventaris asrama seperti lemari, kasur, dan alat mandi.", s: "Melakukan kontrak perilaku (Behavioral Contract) mengenai tanggung jawab pemanfaatan fasilitas asrama dan penghargaan atas perawatan fasilitas secara baik." },
      { label: "Opsi 7: Kebiasaan memilih makanan (Picky Eater)", p: "Siswa sangat pemilih dalam makanan (picky eater) dan sering menyisakan makanan bernutrisi di ruang makan asrama.", s: "Memberikan psikoedukasi kesehatan gizi serta melakukan pendekatan gradual exposure terhadap variasi makanan sehat asrama." },
      { label: "Opsi 8: Kecanduan gadget saat jam bebas", p: "Siswa menghabiskan seluruh waktu luang hanya dengan bermain gadget/game hingga mengabaikan tugas kewajiban mandiri di asrama.", s: "Menerapkan aturan digital detox yang disepakati, mengalihkan energi siswa pada kegiatan ekstrakurikuler fisik, dan sistem kuota waktu layar." },
      { label: "Opsi 9: Kurang peka perawatan kesehatan diri", p: "Siswa mengabaikan kondisi kesehatan pribadi ringan (seperti luka kecil/batuk) dan enggan melaporkan atau merawat diri secara mandiri.", s: "Memberikan pelatihan dasar perawatan kesehatan diri (Self-Care & First Aid dasar) serta pengenalan pola hidup bersih dan sehat (PHBS)." },
      { label: "Opsi 10: Ragu-ragu mengambil keputusan harian", p: "Siswa selalu ragu-ragu dan takut memilih aktivitas harian atau menyelesaikan masalah kecil tanpa arahan langsung dari orang lain.", s: "Melatih kemampuan pemecahan masalah (Problem Solving Skills Training) melalui pemberian pilihan terbatas dan penguatan kepercayaan diri." },
      { label: "Opsi 11: Kecerobohan menyimpan perlengkapan sekolah", p: "Siswa sering kehilangan sepatu, kaos kaki, atau alat tulis pribadi karena meletakkannya sembarangan usai kembali dari sekolah.", s: "Menerapkan sistem pelabelan nama barang pribadi (Labeling System) dan pembiasaan 'Satu Barang Satu Tempat' sebelum masuk kamar." },
      { label: "Opsi 12: Ketidakmampuan mengatur urutan kegiatan harian", p: "Siswa tampak kebingungan menentukan urutan aktivitas dari mandi, makan, hingga belajar sehingga waktunya terbuang efisien.", s: "Membuatkan papan alur jadwal kegiatan visual harian (Visual Routine Chart) di dinding kamar serta pendampingan langsung secara konsisten." },
      { label: "Opsi 13: Ketergantungan diawasi saat piket kebersihan", p: "Siswa baru mau bekerja membersihkan kamar jika terus berdiri diawasi langsung oleh pengasuh asrama.", s: "Menerapkan metode Fading Supervision (pengawasan berkurang secara bertahap) disertai checklist mandiri yang ditandatangani ketua kamar." },
      { label: "Opsi 14: Meletakkan alas kaki dan handuk sembarangan", p: "Siswa membiarkan handuk basah di atas kasur dan sepatu berserakan di depan pintu masuk kamar asrama.", s: "Melakukan edukasi kebersihan lingkungan hidup, menyediakan rak sepatu & jemuran handuk terikat, serta inspeksi kerapian harian." },
      { label: "Opsi 15: Kesulitan antre & tertib di ruang makan", p: "Siswa suka menyerobot antrean makanan atau mengambil porsi berlebihan yang memicu rasa tidak adil bagi kawan asrama.", s: "Melatih kedisiplinan dan budaya antre melalui pembiasaan baris tertib, serta edukasi mengenai nilai keadilan sosial dan tenggang rasa." },
      { label: "Opsi 16: Enggan mandi dan menyikat gigi tepat waktu", p: "Siswa menunjukkan rasa malas mandi sore dan sering melewatkan sikat gigi sebelum tidur malam.", s: "Memberikan edukasi konsekuensi kesehatan mulut/kulit, menyediakan chart kebiasaan mandi (Habit Tracker), dan pujian sosial saat rapi." },
      { label: "Opsi 17: Ketidakmampuan melipat pakaian dan menata lemari", p: "Siswa memasukkan pakaian acak-acakan ke dalam lemari sehingga pakaian selalu kusut dan sulit dicari.", s: "Melakukan workshop singkat 'Keterampilan Menata Lemari' (KonMari method sederhana) dan perlombaan kamar ter-rapi mingguan." },
      { label: "Opsi 18: Keengganan mengganti sprei tempat tidur", p: "Siswa membiarkan sprei tempat tidur kotor berbulan-bulan tanpa pernah dilepas dan dicuci secara berkala.", s: "Menetapkannya sebagai agenda rutin 'Jumat Bersih Sprei' dan bimbingan cara melepas serta memasang sprei kasur dengan kencang." },
      { label: "Opsi 19: Menyisakan makanan kotor di area tempat tidur", p: "Siswa sering membawa makanan ringan ke atas kasur dan menyisakan bungkus/remah yang mengundang semut dan kecoa.", s: "Menetapkan zona bebas makanan (Eating Zone Restriction) hanya di ruang makan, serta psikoedukasi tentang sanitasi lingkungan asrama." },
      { label: "Opsi 20: Kurang inisiatif membantu tugas kelompok", p: "Siswa hanya menonton kawan kamarnya bekerja keras membersihkan lingkungan tanpa ada kesadaran menawarkan bantuan.", s: "Menerapkan pembagian tugas spesifik berkeadilan (Job Description) untuk setiap individu di kamar agar tidak ada yang pasif." }
    ]
  },
  "3": {
    judul: "BIMBINGAN DAN PEMBINAAN PESERTA DIDIK DALAM BERBAGAI ASPEK KEHIDUPAN",
    scenarios: [
      { label: "Opsi 1: Resistensi Ibadah Rutin Berjamaah", p: "Siswa menunjukkan perilaku resisten, menunda, atau melewatkan ibadah sholat berjamaah dengan alasan psikosomatis yang dibuat-buat.", s: "Menggunakan pendekatan Logotherapy (pencarian makna) terkait fungsi ibadah, serta konseling kognitif-spiritual untuk meluruskan pemahaman nilai keagamaan." },
      { label: "Opsi 2: Pelanggaran tata tertib & jam malam", p: "Siswa menunjukkan pola perilaku oposisional ringan berupa pelanggaran jam malam atau aturan asrama secara berulang.", s: "Menerapkan pendekatan Restorative Justice (Keadilan Restoratif); membantu siswa memahami dampak kesalahannya pada harmoni asrama dan memperbaiki perilakunya." },
      { label: "Opsi 3: Perselisihan antarkamar / antarteman", p: "Terjadi perselisihan dan komunikasi tidak sehat antarsiswa di kamar asrama yang mengganggu kedamaian dan suasana kebersamaan.", s: "Melakukan fasilitasi mediation teman sebaya (Peer Mediation) serta memberikan pelatihan keterampilan komunikasi asertif dan empati." },
      { label: "Opsi 4: Penggunaan tutur kata kasar & umpatan", p: "Siswa terbiasa menggunakan tutur kata kasar, nada membentak, atau umpatan saat berinteraksi dengan sesama teman maupun pengasuh.", s: "Menerapkan teknik Assertive Communication Training serta sistem teguran suportif dan penguatan kata santun melalui poin apresiasi." },
      { label: "Opsi 5: Kurangnya toleransi perbedaan latar belakang", p: "Siswa menunjukkan sikap eksklusif atau mengejek perbedaan latar belakang suku, daerah, atau kondisi keluarga teman asrama.", s: "Mendesain kegiatan kebudayaan inklusif (Multicultural Social Work) untuk memupuk nilai toleransi, empati, dan persaudaraan di asrama." },
      { label: "Opsi 6: Keinginan pulang terus-menerus (Homesickness)", p: "Siswa mengurung diri, sering menangis, dan terus merindukan rumah sehingga menghambat adaptasi sosial di lingkungan Sekolah Rakyat.", s: "Memberikan intervensi pendampingan adaptasi sosial, sistem 'buddy system' (pasangan teman akrab), serta konseling suportif emosional." },
      { label: "Opsi 7: Mengambil/meminjam barang tanpa izin", p: "Siswa sering mengambil atau meminjam barang milik teman asrama tanpa izin terlebih dahulu yang memicu kecurigaan dan rasa tidak aman.", s: "Melakukan edukasi batas-batas hak milik pribadi (personal boundaries) serta pembinaan norma kejujuran dan rasa hormat terhadap milik orang lain." },
      { label: "Opsi 8: Mengisolasi diri dari kegiatan bersama", p: "Siswa menarik diri dari kegiatan olahraga, seni, atau kebersamaan asrama dan memilih menyendiri di sudut kamar.", s: "Mengajak siswa terlibat secara bertahap dalam peran-peran kecil kegiatan kelompok (Task-Centered Model) untuk menumbuhkan rasa memiliki." },
      { label: "Opsi 9: Enggan menjalankan piket kebersihan bersama", p: "Siswa enggan menjalankan tugas piket area bersama (mushola, ruang makan, halaman) dan melemparkan tanggung jawab pada teman lain.", s: "Mengimplementasikan sistem piket bergilir terintegrasi, evaluasi kebersihan mingguan, dan pemberian apresiasi kelompok (Group Contingency)." },
      { label: "Opsi 10: Sikap meremehkan arahan pengasuh", p: "Siswa memperlihatkan sikap membangkang, meremehkan arahan pengasuh, dan menolak menjalankan nasihat pembinaan.", s: "Menggunakan pendekatan relasional berlandaskan empati dan rasa saling menghargai (Rapport Building) serta penetapan batas norma yang konsisten." },
      { label: "Opsi 11: Kebiasaan menyebarkan rumor & prasangka", p: "Siswa gemar membicarakan keburukan kawan lain dan menyebarkan kabar burung yang memicu keretakan pertemanan asrama.", s: "Menerapkan konseling kelompok etika pertemanan serta pembiasaan validasi informasi dan saling mendukung (Positive Peer Pressure)." },
      { label: "Opsi 12: Pembentukan kelompok eksklusif (Clique)", p: "Terbentuk kelompok-kelompok kecil eksklusif yang saling bersaing dan menolak menerima kawan baru dalam lingkaran pertemanannya.", s: "Mengadakan kegiatan outbound/ice breaking pembasmi sekat sosial serta perombakan kelompok kerja secara acak dan suportif." },
      { label: "Opsi 13: Kesulitan menyelesaikan konflik tanpa kekerasan", p: "Siswa cepat menggunakan dorongan fisik atau ancaman ketika terjadi perselisihan pendapat kecil di asrama.", s: "Melatih Conflict Resolution Skills (keterampilan resolusi konflik tanpa kekerasan) serta manajemen dorongan amarah (Impulse Control)." },
      { label: "Opsi 14: Perilaku usil & menjahili kawan berlebihan", p: "Siswa berulang kali mengganggu ketenangan kawan dengan keusilan fisik atau menyembunyikan barang milik teman.", s: "Memberikan bimbingan empati dampak keusilan serta penerapan konsekuensi logis edukatif yang disepakati bersama." },
      { label: "Opsi 15: Tidak peduli ketenangan jam tidur malam", p: "Siswa masih gaduh, bermain gitar, atau tertawa keras melampaui jam tidur malam sehingga mengganggu kawan lain yang beristirahat.", s: "Menetapkannya sebagai pelanggaran kesepakatan norma malam dan konseling personal mengenai hak istirahat setiap warga asrama." },
      { label: "Opsi 16: Keengganan meminta maaf atas kesalahan", p: "Siswa bersikap gengsi dan menolak meminta maaf meskipun terbukti telah melakukan kesalahan yang merugikan kawan.", s: "Melatih kebesaran hati (Humility & Apology Skills) melalui konseling pemulihan hubungan interdependen di asrama." },
      { label: "Opsi 17: Sikap tertutup terhadap masalah pribadi", p: "Siswa memendam sendiri masalah besar yang dihadapi dan menolak berbicara kepada wali asuh saat ditanya baik-baik.", s: "Membangun rasa percaya (Trust Building) secara bertahap melalui pendekatan konseling santai di luar jam formal (informal chat)." },
      { label: "Opsi 18: Pelanggaran etika saat makan bersama", p: "Siswa bersikap riuh, berbicara saat mulut penuh makanan, dan meninggalkan piring kotor di meja makan tanpa dicuci.", s: "Memberikan edukasi 'Table Manners' dan tata krama kebersihan ruang makan sebagai bagian dari karakter lulusan Sekolah Rakyat." },
      { label: "Opsi 19: Kebiasaan menyalahkan orang lain (Scapegoating)", p: "Siswa selalu melemparkan kesalahan kepada teman lain saat kamar ditegur pengasuh karena kotor atau tidak rapi.", s: "Melatih pertanggungjawaban pribadi (Personal Accountability) dan pembinaan solidaritas tim di lingkungan kamar asrama." },
      { label: "Opsi 20: Mudah terprovokasi ajakan negatif sebaya", p: "Siswa mudah terbawa arus ajakan kawan untuk melanggar aturan asrama karena takut dianggap tidak setia kawan.", s: "Memberikan Assertiveness Training (keterampilan berani berkata 'Tidak' pada ajakan buruk) untuk memperkuat pendirian moral siswa." }
    ]
  },
  "4": {
    judul: "BIMBINGAN SPIRITUAL DAN EMOSIONAL",
    scenarios: [
      { label: "Opsi 1: Ledakan Emosi (Tantrum/Meltdown)", p: "Siswa mengalami disregulasi emosi berat berupa ledakan amarah, menangis histeris, atau agresivitas saat keinginannya tidak terpenuhi.", s: "Menerapkan teknik De-eskalasi Krisis, memberikan 'Time-Out' atau 'Safe Space', dilanjutkan dengan Anger Management Training dan mindfulness pasca-krisis." },
      { label: "Opsi 2: Kecemasan berlebih (Anxiety) menjelang ujian", p: "Siswa menunjukkan keluhan fisik (pusing, sakit perut) dan kecemasan hebat akibat ketakutan berlebihan akan kegagalan akademik.", s: "Melatih teknik relaksasi napas dalam (Progressive Muscle Relaxation), psikoedukasi pengolahan cemas, dan restrukturisasi kognitif." },
      { label: "Opsi 3: Kesedihan mendalam / trauma keluarga", p: "Siswa sering melamun, menangis di malam hari, dan menunjukkan tanda-tanda depresi ringan akibat kehilangan atau trauma keluarga.", s: "Melakukan konseling duka cita/trauma sensitif (Grief & Trauma-Informed Counseling) serta memfasilitasi ekspresi emosi melalui media katarsis lukis/tulisan." },
      { label: "Opsi 4: Krisis kepercayaan diri (Low Self-Esteem)", p: "Siswa selalu menganggap dirinya tidak berharga, meremehkan potensi pribadi, dan takut mencoba hal baru di depan teman-teman.", s: "Menggunakan teknik afirmasi positif, pemetaan kekuatan diri (Strengths-Based Perspective), dan pemberian peran keberhasilan bertahap." },
      { label: "Opsi 5: Pelaksanaan ibadah sebatas formalitas", p: "Siswa menjalankan kegiatan ibadah secara formalitas tanpa ada penghayatan dan pemahaman nilai keagamaan dalam kehidupan sehari-hari.", s: "Menyelenggarakan kajian/pembinaan spiritual interaktif berbasis diskusi kisah inspiratif dan tadabur makna untuk menumbuhkan kesadaran spiritual." },
      { label: "Opsi 6: Perilaku meluapkan stres fisik (Self-Harm ringan)", p: "Siswa mengekspresikan stres emosional dengan memukul dinding, membenturkan kepala, atau memetik kulit hingga terluka.", s: "Melakukan intervensi krisis keselamatan segera, memberikan pertolongan pertama emosional, dan melatih teknik Dialectical Behavior Therapy (DBT) distress tolerance." },
      { label: "Opsi 7: Kecemburuan & rasa iri antar sesama siswa", p: "Siswa menunjukkan rasa cemburu berlebihan terhadap perhatian pengasuh kepada teman lain yang diekspresikan lewat sindiran atau perilaku pasif-agresif.", s: "Memberikan pemahaman akan kesetaraan kasih sayang pengasuh melalui konseling individu dan memfasilitasi penguatan ikatan persaudaraan asrama." },
      { label: "Opsi 8: Ketakutan/Fobia lingkungan (Gelap/Sepi)", p: "Siswa mengalami fobia atau ketakutan berlebihan terhadap suasana gelap, ruang tertutup, atau kondisi sepi di lingkungan asrama.", s: "Menerapkan teknik desensitisasi sistematis secara bertahap yang didampingi dengan latihan pengelolaan rasa aman dan kontrol napas." },
      { label: "Opsi 9: Rendahnya empati terhadap kemalangan teman", p: "Siswa cenderung bersikap acuh tak acuh, menertawakan, atau kurang memiliki rasa empati saat melihat kawan asrama sedang tertimpa musibah.", s: "Melakukan pembinaan empati melalui permainan peran (Role Playing) dan mengajak siswa terlibat langsung dalam aksi kepedulian sosial asrama." },
      { label: "Opsi 10: Perubahan suasana hati ekstrem (Mood Swing)", p: "Siswa mengalami fluktuasi suasana hati yang drastis dari sangat gembira menjadi sangat murung tanpa alasan jelas yang mengganggu aktivitasnya.", s: "Mendampingi pembuatan jurnal suasana hati (Mood Tracker), melatih stabilitas emosi, serta mengkonsultasikan ke layanan psikologi jika diperlukan." },
      { label: "Opsi 11: Kecemasan berpisah saat keluarga berkunjung", p: "Siswa mengalami guncangan emosional dan menangis histeris setiap kali jam besuk orang tua/keluarga berakhir.", s: "Memberikan penguatan regulasi emosi perpisahan (Separation Anxiety Support), pemahaman tujuan pendidikan, serta hiburan kebersamaan teman." },
      { label: "Opsi 12: Perasaan kesepian di tengah keramaian", p: "Siswa merasa tidak ada yang memahami perasaannya meskipun dikelilingi oleh puluhan kawan asrama.", s: "Melakukan konseling relasional mendalam serta menghubungkan siswa dengan kegiatan minat berbakat yang mempertemukannya dengan kawan sefrekuensi." },
      { label: "Opsi 13: Perilaku perfeksionisme ekstrem", p: "Siswa merasa sangat tertekan jika ada sedikit cela dalam tugasnya dan marah besar pada diri sendiri jika tidak sempurna.", s: "Menggunakan pendekatan CBT untuk meredakan pola pikir dikotomi (All-or-Nothing Thinking) serta belajar menerima ketidaksempurnaan sebagai proses." },
      { label: "Opsi 14: Rasa bersalah berlebihan atas kesalahan lalu", p: "Siswa sering terpaku pada kesalahan masa lalunya sehingga merasa tidak layak mendapatkan kebahagiaan atau prestasi baru.", s: "Mengaplikasikan konseling penerimaan diri (Self-Compassion Therapy) dan pengampunan spiritual untuk membuka lembaran baru kehidupan." },
      { label: "Opsi 15: Ketakutan akan masa depan & karir", p: "Siswa merasa cemas akan nasib pendidikan dan pekerjaannya setelah lulus dari Sekolah Rakyat kelak.", s: "Menyelenggarakan sesi bimbingan karir dan perencanaan hidup (Life-Planning Session) untuk memetakan langkah konkret secara optimis." },
      { label: "Opsi 16: Apatisme emosional (Ekspresi datar)", p: "Siswa tidak menunjukkan respon emosi gembira, sedih, maupun antusias terhadap stimulasi aktivitas asrama.", s: "Melakukan wawancara klinis ringan untuk deteksi awal anhedonia/depresi serta memberikan stimulasi sensorik-afektif yang variatif." },
      { label: "Opsi 17: Penurunan keimanan akibat pengaruh negatif", p: "Siswa mengekspresikan keraguan akan nilai keagamaan setelah terpengaruh tontonan media sosial atau obrolan luar.", s: "Menyediakan ruang dialog spiritual yang terbuka, objektif, dan bernalar tanpa penghakiman (Non-Judgmental Spiritual Counseling)." },
      { label: "Opsi 18: Kebiasaan memendam amarah (Suppression)", p: "Siswa selalu berpura-pura baik-baik saja di depan umum padahal menyimpan amarah besar yang rentan meledak sewaktu-waktu.", s: "Melatih katarsis emosi yang aman (Journaling, ekspresi seni/olahraga) dan teknik penyampaian perasaan jujur secara bertahap." },
      { label: "Opsi 19: Ketidakmampuan mengolah rasa kecewa", p: "Siswa langsung putus asa dan merajuk tidak mau keluar kamar ketika mengalami kekalahan dalam perlombaan asrama.", s: "Memberikan edukasi Resiliensi Emosional (Emotional Resilience) bahwa kegagalan adalah umpan balik pembelajaran yang berharga." },
      { label: "Opsi 20: Tertekan oleh ekspektasi tinggi pribadi", p: "Siswa menetapkan target yang sangat tidak realistis bagi dirinya dan mengalami krisis panik saat tidak mencapainya.", s: "Membimbing pembuatan SMART Goals yang rasional dan terukur serta penataan ekspektasi diri yang sehat." }
    ]
  },
  "5": {
    judul: "PENDAMPINGAN SISWA BERKEBUTUHAN KHUSUS",
    scenarios: [
      { label: "Opsi 1: Tantrum & sensitivitas sensori (Autisme/ASD)", p: "Siswa dengan spektrum autisme (ASD) mengalami tantrum akibat kepekaan berlebih terhadap suara bising atau perubahan rutinitas mendadak.", s: "Memberikan intervensi sensorik (sensory break), menggunakan jadwal visual (visual schedule), dan menyediakan ruang tenang (calm down corner)." },
      { label: "Opsi 2: Impulsivitas & hiperaktivitas tinggi (ADHD)", p: "Siswa menunjukkan gejolak fisik berlebih, tidak bisa duduk tenang, dan bertindak impulsif tanpa memikirkan bahaya saat jam kegiatan asrama.", s: "Merancang aktivitas penyaluran energi terstruktur (olahraga/gerak), memberikan instruksi singkat beruntun, dan menggunakan penguat positif seketika." },
      { label: "Opsi 3: Hambatan penglihatan (Low Vision)", p: "Siswa mengalami keterbatasan penglihatan yang menyulitkannya berorientasi mobilitas di area asrama dan membaca bahan belajar.", s: "Melakukan penataan lingkungan fisik aman minim hambatan (Orientation & Mobility), menyediakan media baca cetak besar (large print), dan pendamping sebaya." },
      { label: "Opsi 4: Hambatan pendengaran (Tunarungu/Kecenderungan tuli)", p: "Siswa mengalami gangguan pendengaran yang memicu isolasi diri karena kesulitan menangkap instruksi lisan dari pengasuh.", s: "Menggunakan papan komunikasi visual, isyarat bahasa sederhana, memastikan posisi berhadapan langsung saat bicara (lip reading), serta dukungan visual." },
      { label: "Opsi 5: Hambatan motorik & koordinasi (Tunadaksa)", p: "Siswa mengalami keterbatasan koordinasi anggota tubuh untuk melakukan tugas perawatan diri seperti menyingkirkan baju atau makan mandiri.", s: "Memfasilitasi alat bantu adaptif sederhana, melatih terapi okupasi dasar untuk motorik, serta memberikan bantuan proporsional tanpa mematikan kemandirian." },
      { label: "Opsi 6: Hambatan intelektual memahami tata tertib", p: "Siswa dengan hambatan intelektual kesulitan memahami tata tertib asrama yang kompleks dan lambat dalam mempelajari kebiasaan baru.", s: "Menggunakan teknik penyederhanaan instruksi (Task Analysis), penggunaan gambar konkret bertahap, dan pengulangan rutin (drill & practice)." },
      { label: "Opsi 7: Gangguan emosi & perilaku (EBD)", p: "Siswa dengan gangguan emosi dan perilaku mudah tersulut konflik verbal maupun fisik saat berinteraksi di lingkungan inklusif.", s: "Menyusun Behavioral Intervention Plan (BIP), mengidentifikasi pemicu perilaku (Antecedent-Behavior-Consequence), dan pendampingan ekstra intensif." },
      { label: "Opsi 8: Hambatan bicara & komunikasi (Speech Delay)", p: "Siswa mengalami kelambatan bicara berat atau kebiasaan gagap yang membuatnya frustrasi saat menyampaikan keinginan kepada pengasuh.", s: "Menggunakan kartu gambar Augmentative and Alternative Communication (AAC), melatih kesabaran menyimak, dan memberikan ruang ekspresi tanpa tekanan." },
      { label: "Opsi 9: Gangguan pemrosesan sensori (Sensory Processing)", p: "Siswa menolak tekstur makanan tertentu, enggan memakai bahan baju tertentu, atau mencari stimulasi sensori secara berlebihan.", s: "Melakukan konsultasi penyesuaian kebutuhan sensori dasar, menciptakan pilihan pakaian/makanan yang nyaman, serta terapi integrasi sensori mandiri." },
      { label: "Opsi 10: Hambatan integrasi sosial inklusif", p: "Terjadi jarak sosial di mana siswa berkebutuhan khusus sering diabaikan atau belum sepenuhnya diterima dalam permainan bersama kawan asrama.", s: "Menggelar program psikoedukasi empati inklusif bagi seluruh siswa asrama, merancang permainan kelompok inklusif, dan membangun budaya saling menolong." },
      { label: "Opsi 11: Stres akibat transisi rutinitas mendadak", p: "Siswa berkebutuhan khusus cemas luar biasa jika jadwal harian diubah mendadak tanpa ada pemberitahuan sebelumnya.", s: "Memberikan peringatan awal transisi (Advance Warning / First-Then Card) sebelum perubahan aktivitas dilakukan." },
      { label: "Opsi 12: Perilaku gerakan berulang (Stimming)", p: "Siswa melakukan kebiasaan meremas tangan atau mengayunkan tubuh secara terus menerus saat cemas di lingkungan ramai.", s: "Menyediakan alat stimulasi sensori pengganti yang aman (fidget toy/stress ball) serta penciptaan kondisi tenang tanpa kecaman." },
      { label: "Opsi 13: Keterbatasan memproses bahasa kiasan", p: "Siswa menafsirkan kata-kata sindiran atau ungkapan kiasan secara harfiah sehingga membingungkannya.", s: "Membiasakan penggunaan bahasa yang konkrit, lugas, langsung, serta tanpa nada metafora saat memberikan arahan." },
      { label: "Opsi 14: Kelelahan sensori (Sensory Overload)", p: "Siswa menunjukkan tanda kelelahan fisik dan menutup telinga rapat-rapat saat berada di ruang makan asrama yang bising.", s: "Mengarahkan siswa ke area istirahat minim stimulasi (Quiet Area) serta pengggunaan penutup telinga peredam bising jika diperlukan." },
      { label: "Opsi 15: Ketergantungan pada media bantuan visual", p: "Siswa tidak dapat memulai langkah persiapan pribadi tanpa melihat urutan foto langkah kerja yang terpasang di dinding.", s: "Mempertahankan penggunaan Papan Panduan Gambar (Visual Schedule Board) dan membimbingnya bertahap menuju kemandirian memori." },
      { label: "Opsi 16: Kesulitan mengukur kekuatan fisik", p: "Siswa sering memeluk atau menepuk kawan terlalu keras tanpa disadari karena keterbatasan persepsi proprioseptif.", s: "Melatih kesadaran tubuh (Body Awareness Exercises) serta memberikan instruksi batas sentuhan fisik yang aman." },
      { label: "Opsi 17: Hambatan melaporkan rasa sakit fisik", p: "Siswa tidak mampu mengekspresikan dengan kata-kata saat merasa demam atau sakit perut hingga keadaannya melemah.", s: "Menggunakan Papan Skala Nyeri Gambar (Wong-Baker FACES) dan inspeksi kondisi fisik harian oleh tim pengasuh." },
      { label: "Opsi 18: Kecemasan pada cahaya atau lampu pijar", p: "Siswa gelisah dan menolak masuk ruang belajar yang menggunakan lampu penerangan sangat terang.", s: "Mengatur pencahayaan hangat (warm/soft lighting) dan memfasilitasi posisi duduk yang tidak silau bagi kenyamanan mata siswa." },
      { label: "Opsi 19: Kebutuhan pendampingan navigasi lokasi baru", p: "Siswa sangat kebingungan dan takut tersesat ketika diajak ke gedung atau ruang aktivitas baru di Sekolah Rakyat.", s: "Melakukan orientasi lokasi pra-kegiatan bersama wali asuh serta penggunaan tanda penunjuk jalan bergambar warna terang." },
      { label: "Opsi 20: Kesulitan dalam kontak mata dan sapaan sosial", p: "Siswa selalu menunduk menghindari kontak mata dan tidak merespon ketika disapa oleh teman atau tamu asrama.", s: "Melatih keterampilan kontak sosial secara perlahan (Social Stories) tanpa paksaan keras, menghargai setiap respon kecil yang diberikan." }
    ]
  }
};
