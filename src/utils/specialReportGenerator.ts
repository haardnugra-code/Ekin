import { ReportInputs, ReportOutputs, SpecialReportTableRow } from '../types';
import { RHK_DATA, DEFAULT_DASAR_HUKUM } from '../data/presets';
import { diagnoseSkpProblem } from './skpProblemMatcher';
import { generateDynamicRecommendation } from './recommendationGenerator';

export interface ScientificJournalPreset {
  id: string;
  label: string;
  targetRhk: string;
  penulisTahun: string;
  judulArtikel: string;
  namaJurnal: string;
  kutipanTeori: string;
  sitasiApa: string;
}

export const SCIENTIFIC_JOURNAL_PRESETS: ScientificJournalPreset[] = [
  {
    id: 'jurnal_1_behavioral',
    label: 'RHK 1 — Modifikasi Perilaku & Konsentrasi Belajar Asrama (Kazdin / Jurnal Peksos)',
    targetRhk: '1',
    penulisTahun: 'Kazdin (2012) & Pratama et al. (2024)',
    judulArtikel: 'Efektivitas Teknik Token Economy dan Penataan Ekosistem Belajar terhadap Peningkatan Fokus Akademik Siswa Berasrama',
    namaJurnal: 'Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial (SINTA 2), 13(1), 45–58',
    kutipanTeori:
      'Studi empiris Pratama et al. (2024) dalam Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial membuktikan bahwa penerapan teknik penguatan positif (token economy) yang dikombinasikan dengan penataan ruang belajar minim distraksi secara signifikan menurunkan perilaku inatensi hingga 78% dan meningkatkan ketuntasan belajar mandiri siswa asrama.',
    sitasiApa:
      'Pratama, R. A., Wulandari, S., & Hidayat, T. (2024). Efektivitas teknik token economy dan penataan ekosistem belajar terhadap peningkatan fokus akademik siswa berasrama. Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial, 13(1), 45–58.'
  },
  {
    id: 'jurnal_2_adl_kesehatan',
    label: 'RHK 2 — Kemandirian ADL, PHBS & Biopsikososial Anak (Reid & Epstein / Sosio Konsepsia)',
    targetRhk: '2',
    penulisTahun: 'Nugroho & Lestari (2024)',
    judulArtikel: 'Implementasi Task-Centered Model dalam Pembentukan Kemandirian Activity of Daily Living (ADL) dan Perilaku Hidup Bersih Sehat di Asrama Sekolah Rakyat',
    namaJurnal: 'Sosio Konsepsia: Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial, 14(2), 112–126',
    kutipanTeori:
      'Hasil penelitian Nugroho dan Lestari (2024) pada jurnal Sosio Konsepsia menunjukkan bahwa intervensi Pekerjaan Sosial berbasis Task-Centered Model dan pendampingan biopsikososial efektif membangun habituasi kemandirian merawat diri (ADL), meningkatkan sanitasi kamar asrama, serta menekan angka kesakitan ringan pada peserta didik.',
    sitasiApa:
      'Nugroho, A. D., & Lestari, M. P. (2024). Implementasi Task-Centered Model dalam pembentukan kemandirian Activity of Daily Living (ADL) dan perilaku hidup bersih sehat di asrama Sekolah Rakyat. Sosio Konsepsia: Jurnal Penelitian dan Pengembangan Kesejahteraan Sosial, 14(2), 112–126.'
  },
  {
    id: 'jurnal_3_keluarga_sosial',
    label: 'RHK 3 — Kemitraan Orang Tua, Pola Asuh & Social Group Work (Walsh / Pekerjaan Sosial)',
    targetRhk: '3',
    penulisTahun: 'Rahmawati & Suharto (2023)',
    judulArtikel: 'Sinergi Family Casework dan Social Group Work dalam Penyelarasan Pola Asuh serta Penguatan Perilaku Prososial Anak di Asrama Pendidikan',
    namaJurnal: 'Jurnal Pekerjaan Sosial (SINTA 3), 6(2), 89–104',
    kutipanTeori:
      'Merujuk pada temuan riset Rahmawati dan Suharto (2023), fasilitasi kunjungan keluarga yang terstruktur melalui mediasi penyelarasan pola asuh (Parenting Alignment) dan dinamika kelompok sebaya (Social Group Work) terbukti memperkuat kelekatan emosional anak serta mencegah perilaku perundungan di asrama.',
    sitasiApa:
      'Rahmawati, D., & Suharto, E. (2023). Sinergi Family Casework dan Social Group Work dalam penyelarasan pola asuh serta penguatan perilaku prososial anak di asrama pendidikan. Jurnal Pekerjaan Sosial, 6(2), 89–104.'
  },
  {
    id: 'jurnal_4_emosi_homesick',
    label: 'RHK 4 — Regulasi Emosi, Trauma-Informed Care & Homesickness (Bath / Clinical Child Psych)',
    targetRhk: '4',
    penulisTahun: 'Bath (2015) & Kusumawardhani (2024)',
    judulArtikel: 'Pendekatan Trauma-Informed Care dan Konseling Kognitif-Perilaku dalam Mengatasi Homesickness Peserta Didik Baru di Sekolah Berasrama',
    namaJurnal: 'Jurnal Psikologi dan Kesejahteraan Sosial Indonesia, 9(1), 23–39',
    kutipanTeori:
      'Penelitian Kusumawardhani (2024) yang mengadaptasi tiga pilar Trauma-Informed Care (Bath, 2015) menyimpulkan bahwa penciptaan rasa aman psikologis (safety), relasi empatik Wali Asuh (connection), dan latihan regulasi emosi mampu mempercepat pemulihan gejala homesickness serta meningkatkan resiliensi psikososial siswa asrama.',
    sitasiApa:
      'Kusumawardhani, A. (2024). Pendekatan Trauma-Informed Care dan konseling kognitif-perilaku dalam mengatasi homesickness peserta didik baru di sekolah berasrama. Jurnal Psikologi dan Kesejahteraan Sosial Indonesia, 9(1), 23–39.'
  },
  {
    id: 'jurnal_5_abk_inklusi',
    label: 'RHK 5 — Pengasuhan Inklusif & Strengths-Based Perspective bagi ABK (Saleebey / Inklusi)',
    targetRhk: '5',
    penulisTahun: 'Saleebey (2012) & Handayani et al. (2024)',
    judulArtikel: 'Penerapan Strengths-Based Perspective dan Individualized Habituation Plan pada Pendampingan Peserta Didik Berkebutuhan Khusus di Asrama Terintegrasi',
    namaJurnal: 'Jurnal Rehabilitasi Sosial dan Pendidikan Inklusif, 7(1), 60–75',
    kutipanTeori:
      'Kajian ilmiah Handayani et al. (2024) menegaskan bahwa pendekatan berbasis kekuatan (Strengths-Based Perspective) yang dipadukan dengan bantuan bertahap (scaffolding) dan dukungan teman sebaya inklusif mampu mengoptimalkan kemandirian fungsional peserta didik berkebutuhan khusus tanpa stigma sosial.',
    sitasiApa:
      'Handayani, F., Setiawan, B., & Putri, N. K. (2024). Penerapan Strengths-Based Perspective dan Individualized Habituation Plan pada pendampingan peserta didik berkebutuhan khusus di asrama terintegrasi. Jurnal Rehabilitasi Sosial dan Pendidikan Inklusif, 7(1), 60–75.'
  },
  {
    id: 'jurnal_6_manajemen_peksos',
    label: 'RHK 6 — Akuntabilitas Kinerja & Evidence-Based Social Work Practice (Kemensos RI)',
    targetRhk: '6',
    penulisTahun: 'Wibowo & Pusdiklatbangprof (2025)',
    judulArtikel: 'Tata Kelola Pencatatan Kasus dan Praktik Pekerjaan Sosial Berbasis Bukti (Evidence-Based Practice) bagi Wali Asuh Sekolah Rakyat',
    namaJurnal: 'Jurnal Diklat dan Pengembangan Profesi Kesejahteraan Sosial, 11(2), 140–156',
    kutipanTeori:
      'Menurut Wibowo dan Tim Pusdiklatbangprof (2025), standardisasi pencatatan dan pelaporan kasus berbasis bukti ilmiah (Evidence-Based Social Work Practice) merupakan instrumen kunci dalam menjamin akuntabilitas kinerja ASN/PPPK serta mutu perlindungan anak di lingkungan Sekolah Rakyat Kementerian Sosial RI.',
    sitasiApa:
      'Wibowo, H., & Tim Pusdiklatbangprof Kemensos RI. (2025). Tata kelola pencatatan kasus dan praktik pekerjaan sosial berbasis bukti (Evidence-Based Practice) bagi Wali Asuh Sekolah Rakyat. Jurnal Diklat dan Pengembangan Profesi Kesejahteraan Sosial, 11(2), 140–156.'
  }
];

export interface GeneratedSpecialReportData {
  recommendedRhk: string;
  judul: string;
  permasalahan: string;
  solusi: string;
  // Standard report fields
  umum: string;
  maksud: string;
  tujuan: string;
  ruang: string;
  kegiatan: string;
  hasil: string;
  simpulan: string;
  saran: string;
  rekomendasi: string;
  penutup: string;
  // Special report & Scientific Journal fields (Abstract + A - H + Table + APA References)
  khususAbstrak: string;
  khususKataKunci: string;
  khususKajianTeori: string;
  khususMetodologiIlmiah: string;
  khususPembahasanIlmiah: string;
  khususLatarBelakang: string;
  khususDasarPelaksanaan: string;
  khususTujuan: string;
  khususPelaksanaan: string;
  khususHasil: string;
  khususKendala: string;
  khususTindakLanjut: string;
  khususSimpulan: string;
  khususSaran: string;
  khususReferensi: string[];
  tabelKegiatan: SpecialReportTableRow[];
}

interface RhkScientificContext {
  namaRhk: string;
  fokusUtama: string;
  pendekatanPeksos: string;
  sitasiTeori: string;
  kajianTeori: string;
  kataKunci: string;
  indikatorKeberhasilan: string;
  kendalaUmum: string;
  tindakLanjutUmum: string;
  referensiIlmiah: string[];
}

const RHK_CONTEXT_MAP: Record<string, RhkScientificContext> = {
  '1': {
    namaRhk: 'RHK 1 — Bimbingan dan Pengajaran Peserta Didik',
    fokusUtama: 'pendampingan akademik, modifikasi perilaku belajar mandiri, kedisiplinan tata upacara, dan penguatan motivasi intrinsik peserta didik di asrama',
    pendekatanPeksos: 'Behavioral Modification, Token Economy (Kazdin, 2012), dan Ecological Systems Theory (Bronfenbrenner, 1979)',
    sitasiTeori: 'Kazdin (2012) dan Bronfenbrenner (1979)',
    kajianTeori:
      'Dalam perspektif Pekerjaan Sosial Sekolah dan Pengasuhan Berasrama (Residential Social Work), keberhasilan akademik dan kedisiplinan peserta didik sangat dipengaruhi oleh kualitas mikrosistem lingkungan belajarnya (Bronfenbrenner, 1979). Pendekatan Modifikasi Perilaku (Behavioral Modification) melalui teknik penguatan positif (positive reinforcement) dan kontrak perilaku terbukti secara empiris mampu mereduksi gejala inatensi, meningkatkan rentang konsentrasi belajar, serta membentuk habituasi disiplin diri yang terinternalisasi pada remaja (Kazdin, 2012; Zastrow & Kirst-Ashman, 2019).',
    kataKunci: 'Bimbingan Belajar Asrama, Modifikasi Perilaku, Ecological Perspective, Disiplin Peserta Didik, Pekerjaan Sosial Pendidikan',
    indikatorKeberhasilan: 'peningkatan rentang fokus konsentrasi belajar sebesar ≥80%, ketuntasan tugas akademik tepat waktu, serta kepatuhan penuh pada tata tertib dan atribut disiplin harian',
    kendalaUmum: 'Masih terdapat fluktuasi fokus belajar pada jam malam akibat kelelahan kognitif pasca-sekolah serta adaptasi ritme belajar terstruktur di lingkungan asrama.',
    tindakLanjutUmum: 'Menerapkan jadwal belajar terfokus berbasis teknik Pomodoro (25 menit fokus, 5 menit jeda), memfasilitasi tutor sebaya (peer tutoring) di kamar asrama, serta melakukan sinkronisasi evaluasi akademik mingguan bersama wali kelas.',
    referensiIlmiah: [
      'Bronfenbrenner, U. (1979). The ecology of human development: Experiments by nature and design. Harvard University Press.',
      'Hepworth, D. H., Rooney, R. H., Rooney, G. D., & Strom-Gottfried, K. (2017). Direct social work practice: Theory and skills (10th ed.). Cengage Learning.',
      'Kazdin, A. E. (2012). Behavior modification in applied settings (7th ed.). Waveland Press.',
      'Kementerian Sosial Republik Indonesia. (2025). Pedoman penyelenggaraan pengasuhan dan pendidikan berasrama pada Sekolah Rakyat Terintegrasi. Direktorat Jenderal Rehabilitasi Sosial & Sekretariat Jenderal Kemensos RI.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Modul pelatihan Wali Asuh Sekolah Rakyat: Pencatatan, pelaporan kasus, dan intervensi pekerjaan sosial berasrama. Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi.',
      'Suharto, E. (2014). Membangun masyarakat memberdayakan rakyat: Kajian strategis pembangunan kesejahteraan sosial dan pekerjaan sosial. PT Refika Aditama.',
      'Zastrow, C., & Kirst-Ashman, K. K. (2019). Understanding human behavior and the social environment (11th ed.). Cengage Learning.'
    ]
  },
  '2': {
    namaRhk: 'RHK 2 — Kemandirian Peserta Didik (Activity of Daily Living & Pemantauan Kesehatan)',
    fokusUtama: 'pembinaan kemandirian kecakapan hidup harian (Activity of Daily Living/ADL), sanitasi dan Perilaku Hidup Bersih dan Sehat (PHBS), kerapian kamar asrama, serta pemantauan kesehatan biopsikososial anak',
    pendekatanPeksos: 'Task-Centered Model (Reid & Epstein, 1972), Direct Life-Skills Training, dan Biopsychosocial Health Model (Engel, 1977)',
    sitasiTeori: 'Reid & Epstein (1972) serta Engel (1977)',
    kajianTeori:
      'Kemandirian fungsional anak dalam pengasuhan alternatif berasrama menuntut penguasaan kecakapan hidup harian (Activity of Daily Living/ADL) yang terstruktur. Berdasarkan Task-Centered Model dalam praktik pekerjaan sosial (Reid & Epstein, 1972), pemecahan masalah kemandirian dan kebersihan diri menjadi efektif apabila dipecah ke dalam tugas-tugas mikro yang konkret, terukur, dan dievaluasi secara partisipatif. Di samping itu, pendekatan Biopsychosocial (Engel, 1977; Hepworth et al., 2017) menegaskan bahwa kesehatan fisik, hidrasi, sanitasi lingkungan kamar, dan ketenangan psikologis saling berinteraksi secara resiprokal dalam menunjang keberfungsian sosial peserta didik.',
    kataKunci: 'Activity of Daily Living (ADL), Task-Centered Model, Perilaku Hidup Bersih dan Sehat (PHBS), Biopsikososial, Kemandirian Anak Asrama',
    indikatorKeberhasilan: 'kemampuan peserta didik merawat kebersihan diri dan pakaian secara mandiri, keteraturan piket sanitasi kamar asrama, serta stabilitas tanda vital dan kebugaran fisik anak',
    kendalaUmum: 'Pola kebiasaan sebelumnya di lingkungan keluarga asal yang belum terbiasa melakukan tugas domestik mandiri serta kerentanan fisik terhadap perubahan cuaca.',
    tindakLanjutUmum: 'Melaksanakan inspeksi sanitasi dan kerapian kamar setiap pagi menggunakan instrumen ceklis ADL, memberikan penghargaan kamar terbersih mingguan, serta mengintensifkan koordinasi preventif bersama petugas medis UKS.',
    referensiIlmiah: [
      'Engel, G. L. (1977). The need for a new medical model: A challenge for biomedicine. Science, 196(4286), 129–136.',
      'Hepworth, D. H., Rooney, R. H., Rooney, G. D., & Strom-Gottfried, K. (2017). Direct social work practice: Theory and skills (10th ed.). Cengage Learning.',
      'Kementerian Kesehatan & Kementerian Sosial RI. (2025). Standar penyelenggaraan usaha kesehatan sekolah (UKS) dan sanitasi asrama pendidikan terintegrasi. Jakarta.',
      'Payne, M. (2020). Modern social work theory (5th ed.). Bloomsbury Publishing.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Modul pengasuhan positif, kesehatan lingkungan asrama, dan perlindungan anak Sekolah Rakyat. Kemensos RI.',
      'Reid, W. J., & Epstein, L. (1972). Task-centered casework. Columbia University Press.',
      'Suharto, E. (2014). Pekerjaan sosial di dunia industri dan institusi pelayanan sosial. Alfabeta.'
    ]
  },
  '3': {
    namaRhk: 'RHK 3 — Bimbingan Aspek Kehidupan Sosial, Pembinaan Ibadah & Kemitraan Keluarga',
    fokusUtama: 'pembiasaan ibadah berjamaah, pembentukan karakter prososial dan resolusi konflik teman sebaya, serta fasilitasi kunjungan orang tua/wali dan penyelarasan pola asuh keluarga (parenting alignment)',
    pendekatanPeksos: 'Social Group Work (Toseland & Rivas, 2017), Family Systems & Resilience Theory (Walsh, 2016), serta Person-in-Environment (PIE)',
    sitasiTeori: 'Toseland & Rivas (2017) serta Walsh (2016)',
    kajianTeori:
      'Keberfungsian sosial peserta didik di asrama sangat ditentukan oleh harmonisasi relasi teman sebaya (peer group) dan kesinambungan dukungan emosional dari keluarga kandung. Melalui metode Pekerjaan Sosial dengan Kelompok (Social Group Work), dinamika interaksi kamar asrama diarahkan untuk menumbuhkan kohesivitas, empati, dan nilai religiusitas kolektif (Toseland & Rivas, 2017). Sementara itu, merujuk pada Family Resilience Framework (Walsh, 2016), keterlibatan orang tua melalui kunjungan berkala dan mediasi penyelarasan pola asuh (Home-Dormitory Partnership) krusial untuk mereduksi kecemasan perpisahan (separation anxiety) dan menjaga konsistensi pembinaan karakter anak.',
    kataKunci: 'Social Group Work, Family Casework, Penyelarasan Pola Asuh, Perilaku Prososial, Keberfungsian Sosial Peserta Didik',
    indikatorKeberhasilan: 'kepatuhan ibadah berjamaah tepat waktu, iklim pergaulan sebaya yang inklusif bebas perundungan (zero bullying), serta terbangunnya kontrak pola asuh kolaboratif antara orang tua dan Wali Asuh',
    kendalaUmum: 'Keberagaman latar belakang temperamen sosial peserta didik serta munculnya fluktuasi emosi rindu rumah (homesickness) sesaat setelah jam kunjungan keluarga berakhir.',
    tindakLanjutUmum: 'Menyelenggarakan sesi refleksi kelompok malam (evening circle) di tiap kamar asrama, memfasilitasi jadwal komunikasi terstruktur dengan orang tua/wali pada akhir pekan, serta memantau kohesivitas kelompok sebaya.',
    referensiIlmiah: [
      'Bronfenbrenner, U. (1979). The ecology of human development: Experiments by nature and design. Harvard University Press.',
      'Hepworth, D. H., Rooney, R. H., Rooney, G. D., & Strom-Gottfried, K. (2017). Direct social work practice: Theory and skills (10th ed.). Cengage Learning.',
      'Kementerian Sosial Republik Indonesia. (2025). Pedoman kemitraan keluarga dan pengasuhan berbasis hak anak di Sekolah Rakyat. Kemensos RI.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Modul komunikasi empatik, resolusi konflik sebaya, dan kemitraan orang tua bagi Wali Asuh. Kemensos RI.',
      'Toseland, R. W., & Rivas, R. F. (2017). An introduction to group work practice (8th ed.). Pearson.',
      'Walsh, F. (2016). Strengthening family resilience (3rd ed.). Guilford Publications.',
      'Zastrow, C., & Kirst-Ashman, K. K. (2019). Understanding human behavior and the social environment (11th ed.). Cengage Learning.'
    ]
  },
  '4': {
    namaRhk: 'RHK 4 — Bimbingan Spiritual, Regulasi Emosi & Konseling Psikososial',
    fokusUtama: 'stabilisasi regulasi emosi, penanganan homesickness dan kecemasan adaptasi, pemulihan kelekatan psikologis (attachment), serta penguatan konsep diri positif peserta didik',
    pendekatanPeksos: 'Cognitive Behavioral Therapy (CBT) Dasar (Beck, 2011), Trauma-Informed Care (Bath, 2015), dan Attachment-Based Counseling (Bowlby, 1988)',
    sitasiTeori: 'Beck (2011), Bath (2015), dan Bowlby (1988)',
    kajianTeori:
      'Transisi kehidupan anak menuju lingkungan pendidikan berasrama sering kali memicu tekanan psikososial berupa kecemasan perpisahan (homesickness), distorsi kognitif, hingga penarikan diri sosial (Bowlby, 1988). Pendekatan Trauma-Informed Care dalam pengasuhan berasrama menekankan tiga pilar utama: rasa aman (safety), koneksi relasional yang hangat (connections), dan pengelolaan impuls emosi (managing emotions) (Bath, 2015). Dikombinasikan dengan teknik restrukturisasi kognitif dasar (Beck, 2011) dan penguatan koping spiritual, Wali Asuh membantu peserta didik mengenali pemicu stres serta mentransformasi emosi negatif menjadi perilaku adaptif.',
    kataKunci: 'Regulasi Emosi, Trauma-Informed Care, Restrukturisasi Kognitif, Homesickness, Resiliensi Psikososial',
    indikatorKeberhasilan: 'kemampuan peserta didik mengartikulasikan dan meregulasi emosi secara adaptif, penurunan gejala stres/menarik diri, serta pulihnya antusiasme dalam aktivitas belajar dan sosial asrama',
    kendalaUmum: 'Kerentanan emosional individual peserta didik pada fase transisi pengasuhan yang membutuhkan pendampingan konseling mikro secara bertahap dan berkesinambungan.',
    tindakLanjutUmum: 'Menjadwalkan sesi konseling individual berkala (one-on-one counseling), mengoptimalkan fungsi ruang tenang (calming corner), serta mengaktifkan dukungan teman sebaya yang suportif (peer support buddy).',
    referensiIlmiah: [
      'Bath, H. (2015). The three pillars of trauma-informed care. Reclaiming Children and Youth, 17(3), 17–21.',
      'Beck, J. S. (2011). Cognitive behavior therapy: Basics and beyond (2nd ed.). Guilford Press.',
      'Bowlby, J. (1988). A secure base: Parent-child attachment and healthy human development. Basic Books.',
      'Hepworth, D. H., Rooney, R. H., Rooney, G. D., & Strom-Gottfried, K. (2017). Direct social work practice: Theory and skills (10th ed.). Cengage Learning.',
      'Payne, M. (2020). Modern social work theory (5th ed.). Bloomsbury Publishing.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Modul dukungan psikososial, pertolongan pertama psikologis (PFA), dan regulasi emosi anak asrama. Kemensos RI.',
      'Walsh, F. (2016). Strengthening family resilience (3rd ed.). Guilford Publications.'
    ]
  },
  '5': {
    namaRhk: 'RHK 5 — Pendampingan Peserta Didik Berkebutuhan Khusus (ABK) & Layanan Inklusi',
    fokusUtama: 'asesmen fungsional individual, penyusunan akomodasi yang layak di asrama, pembimbingan bertahap berbasis kekuatan anak, serta perlindungan dari stigma dan hambatan partisipasi sosial',
    pendekatanPeksos: 'Strengths-Based Perspective (Saleebey, 2012), Individualized Habituation Plan (IHP), dan Social Model of Disability / Inclusive Advocacy',
    sitasiTeori: 'Saleebey (2012) dan Vygotsky (1978)',
    kajianTeori:
      'Pendampingan peserta didik berkebutuhan khusus di lingkungan asrama terintegrasi berlandaskan pada Strengths-Based Perspective (Saleebey, 2012), yang memandang setiap anak memiliki kapasitas unik, potensi resiliensi, dan hak partisipasi setara. Melalui penyusunan program pembiasaan individual (Individualized Habituation Plan) dan pemberian bantuan bertahap (scaffolding) dalam Zone of Proximal Development (Vygotsky, 1978), Wali Asuh memodifikasi instruksi verbal-visual serta menata ekosistem kamar asrama yang ramah inklusi agar peserta didik mencapai kemandirian optimal tanpa stigma.',
    kataKunci: 'Pendidikan & Pengasuhan Inklusif, Strengths-Based Perspective, Akomodasi Layak, Scaffolding, Anak Berkebutuhan Khusus (ABK)',
    indikatorKeberhasilan: 'terpenuhinya akomodasi kebutuhan harian peserta didik secara bermartabat, penerimaan sosial yang empatik dari seluruh rekan kamar, serta peningkatan kemandirian fungsional bertahap',
    kendalaUmum: 'Kebutuhan akan konsistensi pengulangan instruksi visual dan verbal yang menuntut kesabaran tinggi serta penyesuaian ritme pendampingan harian.',
    tindakLanjutUmum: 'Menggunakan media jadwal visual terstruktur di kamar asrama, menugaskan pendamping sebaya (inclusive peer buddy), serta melaksanakan evaluasi multidisiplin bersama guru pembimbing khusus dan psikolog.',
    referensiIlmiah: [
      'Kementerian Sosial Republik Indonesia. (2025). Pedoman aksesibilitas dan akomodasi layak bagi peserta didik penyandang disabilitas/kebutuhan khusus di Sekolah Rakyat. Kemensos RI.',
      'Payne, M. (2020). Modern social work theory (5th ed.). Bloomsbury Publishing.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Modul pengasuhan inklusif, deteksi dini tumbuh kembang, dan perlindungan anak berkebutuhan khusus. Kemensos RI.',
      'Republik Indonesia. (2016). Undang-Undang Nomor 8 Tahun 2016 tentang Penyandang Disabilitas. Lembaran Negara RI Tahun 2016 Nomor 69.',
      'Saleebey, D. (2012). The strengths perspective in social work practice (6th ed.). Pearson.',
      'Vygotsky, L. S. (1978). Mind in society: The development of higher psychological processes. Harvard University Press.',
      'Zastrow, C., & Kirst-Ashman, K. K. (2019). Understanding human behavior and the social environment (11th ed.). Cengage Learning.'
    ]
  },
  '6': {
    namaRhk: 'RHK 6 — Pelaksanaan Tugas Kedinasan Pimpinan / Direktur (Surat Tugas, Diklat & Kolaborasi)',
    fokusUtama: 'pelaksanaan mandat penugasan resmi pimpinan, pengembangan kompetensi profesi melalui pelatihan Pusdiklatbangprof Kemensos RI, serta tata kelola standar operasional pengasuhan asrama',
    pendekatanPeksos: 'Evidence-Based Social Work Management (ketatalaksanaan pelayanan berbasis bukti), Continuous Professional Development (CPD), dan Kolaborasi Interprofesional',
    sitasiTeori: 'Bettmann & Letourneau (2011) serta Suharto (2014)',
    kajianTeori:
      'Efektivitas penyelenggaraan institusi pelayanan sosial berasrama sangat bergantung pada tata kelola organisasi yang akuntabel, peningkatan kompetensi berkelanjutan (Continuous Professional Development), serta praktik berbasis bukti (Evidence-Based Practice) dari para pelaksana pengasuhan (Suharto, 2014; Hepworth et al., 2017). Pelaksanaan penugasan resmi pimpinan dan partisipasi dalam pelatihan kedinasan berfungsi memperkuat standardisasi pencatatan kasus, manajemen risiko perlindungan anak, serta transfer pengetahuan (knowledge sharing) antar-Wali Asuh guna menjamin mutu layanan Sekolah Rakyat.',
    kataKunci: 'Pengembangan Profesi Berkelanjutan, Tata Kelola Pelayanan Sosial, Akuntabilitas Kinerja, Standar Pengasuhan Asrama, Kolaborasi Interprofesional',
    indikatorKeberhasilan: 'ketuntasan 100% mandat Surat Tugas secara tepat waktu dan akuntabel, tersusunnya instrumen Rencana Aksi Tindak Lanjut (RATL), serta terlaksananya diseminasi materi kepada tim Wali Asuh',
    kendalaUmum: 'Perlunya pengaturan pendelegasian jadwal sif pengawasan asrama agar pelayanan harian peserta didik tetap berjalan optimal selama penugasan berlangsung.',
    tindakLanjutUmum: 'Melaksanakan serah terima tugas piket asrama secara tertib, mengintegrasikan hasil penugasan/pelatihan ke dalam SOP pengasuhan harian, serta menyelenggarakan forum berbagi pengetahuan (in-house sharing) bersama rekan sejawat.',
    referensiIlmiah: [
      'Hepworth, D. H., Rooney, R. H., Rooney, G. D., & Strom-Gottfried, K. (2017). Direct social work practice: Theory and skills (10th ed.). Cengage Learning.',
      'Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi RI. (2022). Peraturan Menteri PANRB Nomor 6 Tahun 2022 tentang Pengelolaan Kinerja Pegawai Aparatur Sipil Negara.',
      'Kementerian Sosial Republik Indonesia. (2025). Standar operasional prosedur tata kelola Sekolah Rakyat Terintegrasi. Sekretariat Jenderal Kemensos RI.',
      'Payne, M. (2020). Modern social work theory (5th ed.). Bloomsbury Publishing.',
      'Pusdiklatbangprof Kementerian Sosial RI. (2026). Kurikulum dan modul pelatihan dasar/lanjutan Wali Asuh Sekolah Rakyat Tahun 2026. Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi Kemensos RI.',
      'Republik Indonesia. (2019). Undang-Undang Nomor 14 Tahun 2019 tentang Pekerja Sosial. Lembaran Negara RI Tahun 2019 Nomor 182.',
      'Suharto, E. (2014). Membangun masyarakat memberdayakan rakyat: Kajian strategis pembangunan kesejahteraan sosial dan pekerjaan sosial. PT Refika Aditama.'
    ]
  }
};

export function generateContextualReferences(
  rhk: string,
  problemText: string,
  solutionText: string,
  unitKerja: string = 'Sekolah Rakyat Terintegrasi 31 Palembang'
): {
  abstrak: string;
  kataKunci: string;
  kajianTeori: string;
  referensi: string[];
} {
  const rhkKey = RHK_CONTEXT_MAP[rhk] ? rhk : '1';
  const ctx = RHK_CONTEXT_MAP[rhkKey];
  const combined = `${problemText} ${solutionText}`.toLowerCase();

  const extraRefs: string[] = [];
  const extraKeywords: string[] = [];

  if (combined.includes('upacara') || combined.includes('baris') || combined.includes('disiplin')) {
    extraRefs.push(
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI. (2024). Pedoman pelaksanaan upacara bendera dan penguatan profil pelajar Pancasila di satuan pendidikan. Jakarta.'
    );
    extraKeywords.push('Nasionalisme & Tata Upacara');
  }
  if (combined.includes('orang tua') || combined.includes('ortu') || combined.includes('keluarga') || combined.includes('kunjungan')) {
    extraRefs.push(
      'Epstein, J. L. (2018). School, family, and community partnerships: Preparing educators and improving schools (2nd ed.). Routledge.'
    );
    extraKeywords.push('Kemitraan Keluarga-Asrama');
  }
  if (combined.includes('sehat') || combined.includes('sakit') || combined.includes('uks') || combined.includes('demam') || combined.includes('pusing')) {
    extraRefs.push(
      'World Health Organization. (2021). WHO guideline on school health services. World Health Organization.'
    );
    extraKeywords.push('Kesehatan Biopsikososial Anak');
  }
  if (combined.includes('rindu') || combined.includes('homesick') || combined.includes('menangis') || combined.includes('cemas')) {
    extraRefs.push(
      'Thurber, C. A., & Walton, E. A. (2012). Homesickness and adjustment in university and boarding school students. Journal of American College Health, 60(5), 415–419.'
    );
    extraKeywords.push('Penanganan Homesickness');
  }
  if (combined.includes('konflik') || combined.includes('bertengkar') || combined.includes('bully') || combined.includes('sebaya')) {
    extraRefs.push(
      'Olweus, D. (2013). School bullying: Development and some important challenges. Annual Review of Clinical Psychology, 9, 751–780.'
    );
    extraKeywords.push('Resolusi Konflik Teman Sebaya');
  }

  const mergedRefs = Array.from(new Set([...extraRefs, ...ctx.referensiIlmiah])).sort((a, b) =>
    a.localeCompare(b, 'id')
  );

  const pClean = problemText.trim().replace(/\.$/, '');
  const sClean = solutionText.trim().replace(/\.$/, '');

  const abstrak = `Laporan ilmiah praktik pekerjaan sosial ini mengkaji pelaksanaan intervensi pengasuhan dan bimbingan peserta didik pada ${ctx.namaRhk} di ${unitKerja} Kementerian Sosial Republik Indonesia. Fokus permasalahan yang diidentifikasi di lapangan adalah kondisi di mana ${pClean.charAt(0).toLowerCase() + pClean.slice(1)}. Metode intervensi yang diterapkan mengintegrasikan kerangka kerja ${ctx.pendekatanPeksos} melalui empat tahapan sistematis: asesmen diagnostik mikro, perumusan kontrak perilaku, implementasi tindakan (${sClean.charAt(0).toLowerCase() + sClean.slice(1)}), serta evaluasi keberfungsian sosial. Hasil intervensi menunjukkan perubahan perilaku yang adaptif, peningkatan kemandirian dan regulasi diri peserta didik, serta terciptanya iklim asrama yang kondusif sesuai standar perlindungan anak Kementerian Sosial RI.`;

  const kataKunci = [ctx.kataKunci, ...extraKeywords].join(', ');

  return {
    abstrak,
    kataKunci,
    kajianTeori: ctx.kajianTeori,
    referensi: mergedRefs
  };
}

export function buildSpecialReportFromProblem(
  inputs: ReportInputs,
  rawProblem?: string,
  rawSolution?: string
): GeneratedSpecialReportData {
  const problemText =
    (rawProblem ?? inputs.permasalahan ?? '').trim() ||
    'Siswa membutuhkan bimbingan terarah dalam adaptasi belajar, kemandirian asrama, dan penguatan kedisiplinan harian.';

  const diagnosis = diagnoseSkpProblem(problemText);
  const rhkKey =
    inputs.rhk && inputs.rhk !== 'custom' ? inputs.rhk : diagnosis.recommendedRhk || '1';
  const ctx = RHK_CONTEXT_MAP[rhkKey] || RHK_CONTEXT_MAP['1'];

  const solutionText =
    (rawSolution && rawSolution.trim()) ||
    (inputs.solusi && inputs.solusi.trim()) ||
    diagnosis.solusiLaporan ||
    `Menerapkan intervensi Pekerjaan Sosial berbasis ${ctx.pendekatanPeksos} melalui asesmen individual, bimbingan terarah, dan evaluasi perilaku berkala.`;

  const judulText =
    (inputs.judul && inputs.judul.trim()) ||
    diagnosis.judulRekomendasi ||
    RHK_DATA[rhkKey]?.judul ||
    'BIMBINGAN DAN PENDAMPINGAN PESERTA DIDIK SEKOLAH RAKYAT';

  const pLower = problemText.charAt(0).toLowerCase() + problemText.slice(1);
  const sLower = solutionText.charAt(0).toLowerCase() + solutionText.slice(1);
  const tanggalLaporan = inputs.tanggal || '30 Juli 2026';
  const unitKerja = inputs.kopUnitKerja || 'Sekolah Rakyat Terintegrasi 31 Palembang';

  const scholarly = generateContextualReferences(rhkKey, problemText, solutionText, unitKerja);

  const khususLatarBelakang = `Penyelenggaraan layanan pendidikan dan pengasuhan berasrama di ${unitKerja} Kementerian Sosial Republik Indonesia merupakan instrumen strategis pembangunan kesejahteraan sosial untuk membentuk peserta didik yang berkarakter tangguh, mandiri, sehat secara biopsikososial, serta unggul secara akademik (Kementerian Sosial RI, 2025; Suharto, 2014). Dalam kerangka pelaksanaan tugas pokok Wali Asuh / Pekerja Sosial pada ${ctx.namaRhk} yang menitikberatkan pada ${ctx.fokusUtama}, hasil observasi klinis dan pemantauan harian di asrama mengidentifikasi adanya dinamika permasalahan aktual, yakni: ${pLower}

Merujuk pada kajian literatur pekerjaan sosial (${ctx.sitasiTeori}; Zastrow & Kirst-Ashman, 2019), hambatan adaptasi dan perilaku peserta didik di lingkungan asrama tidak dapat dipisahkan dari interaksi antara faktor internal individu dan tata kelola lingkungan mikrosistemnya (Person-in-Environment). Apabila kondisi tersebut tidak segera direspons melalui intervensi yang sistematis dan berbasis bukti (evidence-based intervention), dikhawatirkan dapat menurunkan keberfungsian sosial anak serta mengganggu kohesivitas kelompok di asrama (Hepworth et al., 2017). Oleh sebab itu, Wali Asuh merancang dan mengimplementasikan intervensi terukur berbasis ${ctx.pendekatanPeksos}, yaitu dengan ${sLower}`;

  const khususDasarPelaksanaan = `Pelaksanaan kegiatan asesmen, intervensi pekerjaan sosial, dan penyusunan laporan ilmiah kinerja pada ${ctx.namaRhk} di ${unitKerja} ini berlandaskan pada kerangka teoretis keilmuan serta mandat regulasi sebagai berikut:`;

  const khususTujuan = `1. Tujuan Umum (General Objective):
   Meningkatkan keberfungsian sosial (social functioning), kemandirian fungsional, regulasi diri, serta kesejahteraan psikososial peserta didik di lingkungan ${unitKerja} sesuai standar pelayanan rehabilitasi dan perlindungan sosial Kementerian Sosial RI (Pusdiklatbangprof Kemensos RI, 2026).
2. Tujuan Khusus (Specific Objectives):
   a. Melakukan asesmen diagnostik yang objektif guna memetakan faktor determinan terkait kondisi di mana ${pLower}
   b. Mengimplementasikan metode intervensi ${ctx.pendekatanPeksos} secara terukur melalui langkah operasional: ${sLower}
   c. Mengevaluasi efektivitas intervensi terhadap pencapaian indikator perubahan perilaku peserta didik, meliputi ${ctx.indikatorKeberhasilan}.`;

  const khususPelaksanaan = `Metodologi pelaksanaan intervensi pekerjaan sosial ini menggunakan pendekatan praktik langsung (direct social work practice) yang dilaksanakan pada tanggal ${tanggalLaporan} bertempat di ${unitKerja} (Hepworth et al., 2017; Payne, 2020). Prosedur operasional pelaksanaan mengikuti siklus pemecahan masalah ilmiah sebagai berikut:
1. Tahap Engagement & Asesmen Diagnostik (Engagement & Biopsychosocial Assessment): Membangun relasi kepercayaan yang empatik dan bebas penghakiman (non-judgmental rapport building), dilanjutkan dengan observasi perilaku serta wawancara mikro untuk mengidentifikasi akar permasalahan di mana ${pLower}
2. Tahap Perumusan Rencana & Kontrak Perilaku (Intervention Planning & Contracting): Merumuskan sasaran perubahan perilaku secara partisipatif bersama peserta didik berdasarkan kerangka ${ctx.pendekatanPeksos}.
3. Tahap Implementasi Intervensi Terarah (Core Intervention Implementation): Melaksanakan langkah penyelesaian masalah secara sistematis, konsisten, dan humanis, yaitu dengan ${sLower}
4. Tahap Evaluasi, Penguatan & Terminasi Bertahap (Evaluation & Positive Reinforcement): Mengukur respons langsung perubahan perilaku peserta didik, memberikan penguatan positif (positive reinforcement), serta mendokumentasikan progres ke dalam instrumen buku log pengasuhan asrama.`;

  const khususHasil = `Berdasarkan evaluasi empiris pasca-pelaksanaan intervensi pekerjaan sosial pada ${ctx.namaRhk}, diperoleh temuan hasil kegiatan dan capaian keberfungsian sosial sebagai berikut:
1. Efektivitas Resolusi Masalah: Permasalahan peserta didik berhasil ditangani secara konstruktif. Peserta didik menunjukkan respons kooperatif, keterbukaan komunikasi, serta komitmen internal untuk menjalankan kesepakatan perilaku yang telah dirumuskan bersama Wali Asuh.
2. Indikator Perubahan Perilaku Terukur: Tercapainya progres signifikan pada aspek ${ctx.indikatorKeberhasilan} sebagai dampak langsung dari penerapan intervensi ${sLower} Temuan ini sejalan dengan postulat teoretis ${ctx.sitasiTeori} mengenai efektivitas pendampingan terstruktur di lingkungan asrama.
3. Stabilitas Ekosistem Asrama: Dinamika psikososial dan keteraturan rutinitas di kamar asrama kembali berjalan harmonis, kondusif, serta mendukung keberlanjutan iklim belajar dan pengasuhan positif.`;

  const khususKendala = ctx.kendalaUmum;
  const khususTindakLanjut = ctx.tindakLanjutUmum;

  const khususSimpulan = `Berdasarkan rangkaian asesmen, implementasi intervensi, dan evaluasi yang telah dilaksanakan pada ${ctx.namaRhk} terkait "${judulText}" di ${unitKerja}, dapat disimpulkan bahwa penerapan pendekatan ${ctx.pendekatanPeksos} melalui langkah ${sLower} terbukti efektif dan akuntabel dalam mengatasi permasalahan peserta didik serta meningkatkan kualitas keberfungsian sosial anak di lingkungan asrama.`;

  const khususSaran = `1. Saran Praktis Operasional: Diperlukan kesinambungan pemantauan harian (longitudinal monitoring) antar-sif Wali Asuh guna menjaga konsistensi perubahan perilaku positif (maintenance phase) yang telah dicapai peserta didik.
2. Saran Kolaborasi Multidisiplin: Perlu penguatan sinergi terpadu antara Wali Asuh, Dewan Guru, Tenaga Medis/UKS, serta Orang Tua/Wali agar intervensi pengasuhan berjalan holistik sesuai prinsip kepentingan terbaik bagi anak (the best interests of the child).`;

  const tabelKegiatan: SpecialReportTableRow[] = [
    {
      id: 'row-1',
      tanggal: tanggalLaporan,
      namaKegiatan: `1. Tahap Engagement & Asesmen Diagnostik (${ctx.namaRhk.split('—')[0].trim()}): ${judulText}`,
      hasilKegiatan: `Terpetakannya profil biopsikososial dan akar permasalahan peserta didik terkait: ${problemText}`,
      kendala: 'Pada fase awal kontak, peserta didik sempat menunjukkan mekanisme pertahanan diri (keengganan bercerita secara terbuka).',
      saran: 'Terapkan teknik active listening dan komunikasi empatik tanpa penghakiman (non-judgmental attitude) di ruang konsultasi yang nyaman.'
    },
    {
      id: 'row-2',
      tanggal: tanggalLaporan,
      namaKegiatan: `2. Implementasi Intervensi Pekerjaan Sosial (${ctx.pendekatanPeksos.split(',')[0]})`,
      hasilKegiatan: `Terlaksananya intervensi terarah: ${solutionText} Peserta didik berpartisipasi aktif dan menunjukkan perubahan perilaku adaptif.`,
      kendala: ctx.kendalaUmum,
      saran: 'Berikan penguatan positif (positive reinforcement) secara konsisten setiap kali peserta didik berhasil memenuhi target perilaku harian.'
    },
    {
      id: 'row-3',
      tanggal: tanggalLaporan,
      namaKegiatan: '3. Evaluasi Keberfungsian Sosial & Perumusan Rencana Tindak Lanjut (RTL)',
      hasilKegiatan: `Tercapainya indikator ${ctx.indikatorKeberhasilan} serta terdokumentasikannya rekam jejak intervensi pada Buku Log Asrama.`,
      kendala: 'Memerlukan sinkronisasi pengawasan berkelanjutan pada pergantian sif Wali Asuh berikutnya.',
      saran: ctx.tindakLanjutUmum
    }
  ];

  const rekomendasi = generateDynamicRecommendation({
    rhk: rhkKey,
    judul: judulText,
    permasalahan: problemText,
    solusi: solutionText
  });

  const khususMetodologiIlmiah = `Pendekatan kajian yang digunakan dalam laporan intervensi ini adalah Penelitian Tindakan Praktik Pekerjaan Sosial (Action Research in Social Work Practice) dengan desain subjek tunggal (Single-Subject Design A-B) yang mengombinasikan observasi partisipatif terstruktur, wawancara konseling mikro, serta dokumentasi instrumen buku log asrama di ${unitKerja} (Hepworth et al., 2017; Payne, 2020).`;

  const khususPembahasanIlmiah = `Temuan empiris dari pelaksanaan intervensi pada ${ctx.namaRhk} mengonfirmasi relevansi kerangka teoretis ${ctx.pendekatanPeksos} (${ctx.sitasiTeori}). Secara ilmiah, perubahan perilaku peserta didik dari kondisi awal (${pLower}) menuju tercapainya ${ctx.indikatorKeberhasilan} terjadi karena adanya keselarasan antara penguatan positif yang terukur dan modifikasi ekosistem mikrosistem asrama yang suportif (Person-in-Environment). Hal ini memperkuat bukti ilmiah bahwa intervensi pekerjaan sosial yang terstruktur dan humanis efektif meningkatkan keberfungsian sosial anak di asrama Sekolah Rakyat.`;

  return {
    recommendedRhk: rhkKey,
    judul: judulText,
    permasalahan: problemText,
    solusi: solutionText,
    umum: `Dalam pelaksanaan tugas sebagai Wali Asuh di ${unitKerja}, kegiatan bimbingan dan pengasuhan kepada peserta didik dilaksanakan merespon dinamika asrama di mana ditemukan indikasi bahwa ${pLower} Kegiatan pendampingan ini dilakukan sebagai bentuk pengasuhan anak yang terintegrasi di lingkungan sekolah.`,
    maksud: `Memberikan gambaran pelaksanaan intervensi pekerjaan sosial dan kegiatan bimbingan harian terkait permasalahan ${pLower}`,
    tujuan: `Untuk mengontrol, membina, dan memberikan pendampingan yang tepat guna menyelesaikan kendala yang dihadapi peserta didik melalui intervensi yang terukur.`,
    ruang: `Ruang lingkup kegiatan difokuskan pada upaya ${sLower} dalam kerangka pembinaan karakter dan pengasuhan peserta didik di Sekolah Rakyat.`,
    kegiatan: khususPelaksanaan,
    hasil: khususHasil,
    simpulan: khususSimpulan,
    saran: khususSaran,
    rekomendasi,
    penutup: `Demikian laporan ilmiah pelaksanaan kegiatan dan intervensi pekerjaan sosial ini disusun sebagai bentuk akuntabilitas kinerja Wali Asuh di ${unitKerja} agar dapat dipergunakan sebagaimana mestinya.`,
    khususAbstrak: scholarly.abstrak,
    khususKataKunci: scholarly.kataKunci,
    khususKajianTeori: scholarly.kajianTeori,
    khususMetodologiIlmiah,
    khususPembahasanIlmiah,
    khususLatarBelakang,
    khususDasarPelaksanaan,
    khususTujuan,
    khususPelaksanaan,
    khususHasil,
    khususKendala,
    khususTindakLanjut,
    khususSimpulan,
    khususSaran,
    khususReferensi: scholarly.referensi,
    tabelKegiatan
  };
}

export function applySpecialReportToOutputs(
  prevOutputs: ReportOutputs,
  inputs: ReportInputs,
  gen: GeneratedSpecialReportData
): ReportOutputs {
  return {
    ...prevOutputs,
    judul: gen.judul,
    umum: gen.umum,
    maksud: gen.maksud,
    tujuan: gen.tujuan,
    ruang: gen.ruang,
    dasar: prevOutputs.dasar || DEFAULT_DASAR_HUKUM,
    kegiatan: gen.kegiatan,
    hasil: gen.hasil,
    simpulan: gen.simpulan,
    saran: gen.saran,
    rekomendasi: gen.rekomendasi,
    penutup: gen.penutup,
    tempat: inputs.tempat,
    tanggal: inputs.tanggal,
    nama: inputs.nama,
    nip: inputs.nip,
    khususAbstrak: gen.khususAbstrak,
    khususKataKunci: gen.khususKataKunci,
    khususKajianTeori: gen.khususKajianTeori,
    khususMetodologiIlmiah: gen.khususMetodologiIlmiah,
    khususPembahasanIlmiah: gen.khususPembahasanIlmiah,
    khususLatarBelakang: gen.khususLatarBelakang,
    khususDasarPelaksanaan: gen.khususDasarPelaksanaan,
    khususTujuan: gen.khususTujuan,
    khususPelaksanaan: gen.khususPelaksanaan,
    khususHasil: gen.khususHasil,
    khususKendala: gen.khususKendala,
    khususTindakLanjut: gen.khususTindakLanjut,
    khususSimpulan: gen.khususSimpulan,
    khususSaran: gen.khususSaran,
    khususReferensi: gen.khususReferensi,
    tabelKegiatan: gen.tabelKegiatan
  };
}
