import express from "express";
import path from "path";
import dotenv from "dotenv";
import { generateDynamicRecommendation } from "./src/utils/recommendationGenerator";
import { diagnoseSkpProblem } from "./src/utils/skpProblemMatcher";
import { buildSpecialReportFromProblem, generateContextualReferences } from "./src/utils/specialReportGenerator";

dotenv.config();

const app = express();

function getCliArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}

const PORT = parseInt(getCliArg("--port") || process.env.PORT || "3000", 10);
const HOST = getCliArg("--host") || process.env.HOST || "0.0.0.0";

app.use(express.json({ limit: "50mb" }));

// Lazy load @google/genai so cold startup of Express server is instantaneous
let genaiModulePromise: Promise<typeof import("@google/genai")> | null = null;
function loadGenAI() {
  if (!genaiModulePromise) {
    genaiModulePromise = import("@google/genai");
  }
  return genaiModulePromise;
}

async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const { GoogleGenAI, Type } = await loadGenAI();
  return {
    ai: new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    }),
    Type,
  };
}

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API endpoint: Perbaiki & Perkaya Referensi Ilmiah + Kajian Teori + Abstrak dengan AI
app.post("/api/refine-references", async (req, res) => {
  try {
    const { rhk, judul, permasalahan, solusi, unitKerja } = req.body;
    const rawProblem = (permasalahan || "").trim() || "Pendampingan dan pembinaan karakter peserta didik di asrama";
    const rawSolution = (solusi || "").trim() || "Intervensi pekerjaan sosial terarah dan modifikasi perilaku";
    const targetRhk = String(rhk || "1");

    const localContext = generateContextualReferences(
      targetRhk,
      rawProblem,
      rawSolution,
      unitKerja || "Sekolah Rakyat Terintegrasi 31 Palembang"
    );

    const gemini = await getGeminiClient();
    if (!gemini) {
      return res.json({
        khususAbstrak: localContext.abstrak,
        khususKataKunci: localContext.kataKunci,
        khususKajianTeori: localContext.kajianTeori,
        khususReferensi: localContext.referensi,
      });
    }

    const { ai, Type } = gemini;

    const prompt = `Anda adalah Profesor dan Peneliti Utama Pekerjaan Sosial (Social Work) serta Konsultan Akademik Kementerian Sosial Republik Indonesia.
Berdasarkan data laporan praktik pekerjaan sosial berikut:
- Kategori RHK: RHK ${targetRhk}
- Judul Laporan: "${judul || "Laporan Intervensi Pekerjaan Sosial"}"
- Permasalahan Lapangan: "${rawProblem}"
- Solusi / Intervensi Peksos: "${rawSolution}"
- Unit Kerja: "${unitKerja || "Sekolah Rakyat Terintegrasi 31 Palembang"}"

Tugas Anda adalah menyempurnakan kualitas ilmiah laporan ini setara Jurnal Ilmiah Terakreditasi (SINTA / Scopus) di bidang Pekerjaan Sosial (Social Work), Psikologi Pendidikan, dan Kesejahteraan Sosial:
1. khususAbstrak: Susun Abstrak Ilmiah (140-180 kata) yang memuat latar belakang masalah, tujuan kajian/intervensi, metodologi praktik pekerjaan sosial yang digunakan, serta temuan hasil keberfungsian sosial peserta didik.
2. khususKataKunci: 5 sampai 6 kata kunci ilmiah yang dipisahkan koma.
3. khususKajianTeori: Kajian literatur & kerangka teori pekerjaan sosial (1-2 paragraf padat) dilengkapi sitasi in-text gaya APA 7th Edition (misal: Bronfenbrenner, 1979; Kazdin, 2012; Hepworth et al., 2017; Zastrow & Kirst-Ashman, 2019; Suharto, 2014; Pusdiklatbangprof Kemensos RI, 2026) yang relevan langsung dengan masalah dan solusi di atas.
4. khususLatarBelakang: Perbaiki narasi Bab A. Latar Belakang (2 paragraf ilmiah) agar memuat sitasi akademik in-text APA 7th Edition dan argumen urgensi intervensi yang tajam.
5. khususReferensi: Susun 7 hingga 8 Daftar Pustaka / Referensi Ilmiah nyata dan kredibel dalam format baku APA 7th Edition (urut alfabetis A-Z), memadukan buku teks utama Social Work internasional, jurnal ilmiah terkait masalah anak/asrama, literatur pekerjaan sosial Indonesia, serta regulasi/modul resmi Kementerian Sosial RI.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            khususAbstrak: { type: Type.STRING },
            khususKataKunci: { type: Type.STRING },
            khususKajianTeori: { type: Type.STRING },
            khususLatarBelakang: { type: Type.STRING },
            khususReferensi: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "khususAbstrak",
            "khususKataKunci",
            "khususKajianTeori",
            "khususLatarBelakang",
            "khususReferensi",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.json({
        khususAbstrak: localContext.abstrak,
        khususKataKunci: localContext.kataKunci,
        khususKajianTeori: localContext.kajianTeori,
        khususReferensi: localContext.referensi,
      });
    }

    const aiData = JSON.parse(resultText);
    return res.json({
      khususAbstrak: aiData.khususAbstrak || localContext.abstrak,
      khususKataKunci: aiData.khususKataKunci || localContext.kataKunci,
      khususKajianTeori: aiData.khususKajianTeori || localContext.kajianTeori,
      khususLatarBelakang: aiData.khususLatarBelakang || undefined,
      khususReferensi:
        Array.isArray(aiData.khususReferensi) && aiData.khususReferensi.length > 0
          ? aiData.khususReferensi
          : localContext.referensi,
    });
  } catch (err) {
    console.error("Refine references error:", err);
    const fallback = generateContextualReferences(
      String(req.body?.rhk || "1"),
      req.body?.permasalahan || "",
      req.body?.solusi || ""
    );
    return res.json({
      khususAbstrak: fallback.abstrak,
      khususKataKunci: fallback.kataKunci,
      khususKajianTeori: fallback.kajianTeori,
      khususReferensi: fallback.referensi,
    });
  }
});

// API endpoint: Tulis Masalah -> AI Buat Laporan Lengkap (Standar & Laporan Khusus Jurnal Ilmiah A-H + Tabel + Referensi APA) untuk seluruh RHK
app.post("/api/generate-from-problem", async (req, res) => {
  try {
    const { masalah, solusi, rhk, tanggal, unitKerja, autoDetectRhk } = req.body;

    if (!masalah || typeof masalah !== "string" || !masalah.trim()) {
      return res.status(400).json({ error: "Tuliskan permasalahan terlebih dahulu." });
    }

    const diagnosis = diagnoseSkpProblem(masalah);
    const targetRhk = autoDetectRhk !== false ? diagnosis.recommendedRhk : (rhk || diagnosis.recommendedRhk || "1");

    const localReport = buildSpecialReportFromProblem(
      {
        rhk: targetRhk,
        customTitle: "",
        dailyPreset: "",
        skenario: "",
        judul: diagnosis.judulRekomendasi,
        permasalahan: masalah,
        solusi: solusi || diagnosis.solusiLaporan,
        fontJudul: "'Times New Roman', Times, serif",
        sizeJudul: "18pt",
        fontIsi: "'Times New Roman', Times, serif",
        sizeIsi: "12pt",
        lineHeight: "1.5",
        paragraphSpacing: "0.5rem",
        tempat: "Palembang",
        tanggal: tanggal || "30 Juli 2026",
        tanggalPicker: "2026-07-30",
        nama: "M Ardian Nugraha",
        nip: "199202042026221001",
        logoSrc: "",
        ttdSrc: "",
        qrCodeSrc: "",
        foto1Src: "",
        foto2Src: "",
        foto1Caption: "",
        foto2Caption: "",
        tampilkanNomorHalaman: true,
        formatNomorHalaman: "- {n} -",
        kopUnitKerja: unitKerja || "Sekolah Rakyat Terintegrasi 31 Palembang",
      },
      masalah,
      solusi || diagnosis.solusiLaporan
    );

    const gemini = await getGeminiClient();
    if (!gemini) {
      return res.json(localReport);
    }

    const { ai, Type } = gemini;

    const prompt = `Anda adalah seorang Pekerja Sosial (Peksos) Ahli, Akademisi Kesejahteraan Sosial, dan Wali Asuh di ${unitKerja || "Sekolah Rakyat Terintegrasi 31 Palembang"} Kementerian Sosial Republik Indonesia.
Berdasarkan deskripsi permasalahan peserta didik berikut:
- Permasalahan: "${masalah}"
- Solusi / Penyelesaian Awal (jika ada): "${solusi || diagnosis.solusiLaporan}"
- Tanggal Kegiatan: "${tanggal || "30 Juli 2026"}"
- Kategori RHK Sasaran: RHK ${targetRhk} (1: Bimbingan & Pengajaran Akademik/Upacara, 2: Kemandirian ADL & Kesehatan Anak, 3: Bimbingan Kehidupan Sosial/Ibadah/Kunjungan Ortu, 4: Bimbingan Spiritual & Regulasi Emosi, 5: Pendampingan Siswa Berkebutuhan Khusus/ABK, 6: Penugasan Direktur/Pimpinan/Pelatihan).

Tugas Anda adalah menyusun Laporan Lengkap & Profesional bergaya Jurnal Ilmiah Praktik Pekerjaan Sosial Terapan (mencakup Format Standar maupun Format Laporan Khusus Bab A s.d. H beserta Abstrak, Sitasi In-Text APA 7th, Tabel Pelaksanaan Kegiatan, dan Daftar Pustaka Ilmiah):
1. recommendedRhk: Pilih angka "1", "2", "3", "4", "5", atau "6" yang paling tepat.
2. judul: Judul resmi laporan ilmiah dalam HURUF KAPITAL.
3. permasalahan: Rumusan masalah profesional dan jelas.
4. solusi: Rumusan intervensi dan penyelesaian Pekerjaan Sosial berbasis bukti (evidence-based practice).
5. umum, maksud, tujuan, ruang, kegiatan, hasil, simpulan, saran, rekomendasi, penutup: Narasi laporan standar.
6. khususAbstrak: Abstrak Ilmiah (130-170 kata) merangkum latar belakang kasus, metode intervensi Peksos, dan hasil perubahan perilaku.
7. khususKataKunci: 5 kata kunci ilmiah relevan dipisahkan koma.
8. khususKajianTeori: Kajian literatur & kerangka teori Pekerjaan Sosial lengkap dengan sitasi in-text APA 7th Edition.
9. khususLatarBelakang: Narasi Bab A. Latar Belakang (2 paragraf mendalam dengan sitasi ilmiah APA menghubungkan tupoksi RHK, fenomena masalah anak di asrama, dan urgensi intervensi Peksos).
10. khususDasarPelaksanaan: Narasi pengantar Bab B. Dasar Pelaksanaan Kegiatan.
11. khususTujuan: Narasi Bab C. Tujuan Kegiatan (Tujuan Umum & Tujuan Khusus terperinci).
12. khususPelaksanaan: Narasi Bab D. Pelaksanaan Kegiatan (tahapan ilmiah Engagement & Assessment, Planning, Intervention, Evaluation Peksos).
13. khususHasil: Narasi Bab E. Hasil Kegiatan (analisis perubahan perilaku/keberfungsian sosial anak secara terukur beserta rujukan teori).
14. khususKendala: Narasi Bab F poin 1 (Kendala yang dihadapi di lapangan).
15. khususTindakLanjut: Narasi Bab F poin 2 (Rencana Tindak Lanjut / RTL).
16. khususSimpulan: Narasi Bab G poin 1 (Simpulan).
17. khususSaran: Narasi Bab G poin 2 (Saran).
18. khususReferensi: Array berisi 7 referensi ilmiah nyata dan kredibel dalam format APA 7th Edition (buku teks Social Work, jurnal ilmiah, dan regulasi/modul Kemensos RI).
19. tabelKegiatan: Array berisi 3 baris tahapan kegiatan nyata (Asesmen Awal, Implementasi Intervensi Peksos, Evaluasi & Tindak Lanjut), masing-masing memiliki: tanggal, namaKegiatan, hasilKegiatan, kendala, saran.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedRhk: { type: Type.STRING, enum: ["1", "2", "3", "4", "5", "6"] },
            judul: { type: Type.STRING },
            permasalahan: { type: Type.STRING },
            solusi: { type: Type.STRING },
            umum: { type: Type.STRING },
            maksud: { type: Type.STRING },
            tujuan: { type: Type.STRING },
            ruang: { type: Type.STRING },
            kegiatan: { type: Type.STRING },
            hasil: { type: Type.STRING },
            simpulan: { type: Type.STRING },
            saran: { type: Type.STRING },
            rekomendasi: { type: Type.STRING },
            penutup: { type: Type.STRING },
            khususAbstrak: { type: Type.STRING },
            khususKataKunci: { type: Type.STRING },
            khususKajianTeori: { type: Type.STRING },
            khususLatarBelakang: { type: Type.STRING },
            khususDasarPelaksanaan: { type: Type.STRING },
            khususTujuan: { type: Type.STRING },
            khususPelaksanaan: { type: Type.STRING },
            khususHasil: { type: Type.STRING },
            khususKendala: { type: Type.STRING },
            khususTindakLanjut: { type: Type.STRING },
            khususSimpulan: { type: Type.STRING },
            khususSaran: { type: Type.STRING },
            khususReferensi: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tabelKegiatan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tanggal: { type: Type.STRING },
                  namaKegiatan: { type: Type.STRING },
                  hasilKegiatan: { type: Type.STRING },
                  kendala: { type: Type.STRING },
                  saran: { type: Type.STRING },
                },
                required: ["tanggal", "namaKegiatan", "hasilKegiatan", "kendala", "saran"],
              },
            },
          },
          required: [
            "recommendedRhk",
            "judul",
            "permasalahan",
            "solusi",
            "umum",
            "maksud",
            "tujuan",
            "ruang",
            "kegiatan",
            "hasil",
            "simpulan",
            "saran",
            "rekomendasi",
            "penutup",
            "khususAbstrak",
            "khususKataKunci",
            "khususKajianTeori",
            "khususLatarBelakang",
            "khususDasarPelaksanaan",
            "khususTujuan",
            "khususPelaksanaan",
            "khususHasil",
            "khususKendala",
            "khususTindakLanjut",
            "khususSimpulan",
            "khususSaran",
            "khususReferensi",
            "tabelKegiatan",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.json(localReport);
    }

    const aiData = JSON.parse(resultText);
    const formattedRows = Array.isArray(aiData.tabelKegiatan)
      ? aiData.tabelKegiatan.map((r: any, idx: number) => ({
          id: `row-${Date.now()}-${idx}`,
          tanggal: r.tanggal || tanggal || "30 Juli 2026",
          namaKegiatan: r.namaKegiatan || "",
          hasilKegiatan: r.hasilKegiatan || "",
          kendala: r.kendala || "",
          saran: r.saran || "",
        }))
      : localReport.tabelKegiatan;

    return res.json({
      ...localReport,
      ...aiData,
      khususReferensi:
        Array.isArray(aiData.khususReferensi) && aiData.khususReferensi.length > 0
          ? aiData.khususReferensi
          : localReport.khususReferensi,
      tabelKegiatan: formattedRows,
    });
  } catch (err: any) {
    console.error("Generate from problem error:", err);
    try {
      const fallback = buildSpecialReportFromProblem(
        {
          rhk: req.body?.rhk || "1",
          customTitle: "",
          dailyPreset: "",
          skenario: "",
          judul: "",
          permasalahan: req.body?.masalah || "",
          solusi: req.body?.solusi || "",
          fontJudul: "'Times New Roman', Times, serif",
          sizeJudul: "18pt",
          fontIsi: "'Times New Roman', Times, serif",
          sizeIsi: "12pt",
          lineHeight: "1.5",
          paragraphSpacing: "0.5rem",
          tempat: "Palembang",
          tanggal: req.body?.tanggal || "30 Juli 2026",
          tanggalPicker: "2026-07-30",
          nama: "M Ardian Nugraha",
          nip: "199202042026221001",
          logoSrc: "",
          ttdSrc: "",
          qrCodeSrc: "",
          foto1Src: "",
          foto2Src: "",
          foto1Caption: "",
          foto2Caption: "",
          tampilkanNomorHalaman: true,
          formatNomorHalaman: "- {n} -",
        },
        req.body?.masalah,
        req.body?.solusi
      );
      return res.json(fallback);
    } catch {
      return res.status(500).json({ error: "Gagal menyusun laporan dari masalah." });
    }
  }
});

// API endpoint for AI report generation/refinement
app.post("/api/generate-ai", async (req, res) => {
  try {
    const { rhk, judul, permasalahan, solusi, tanggal } = req.body;

    if (!permasalahan || !solusi) {
      return res.status(400).json({ error: "Permasalahan dan Solusi wajib diisi." });
    }

    const localReport = buildSpecialReportFromProblem(
      {
        rhk: rhk || "1",
        customTitle: "",
        dailyPreset: "",
        skenario: "",
        judul: judul || "",
        permasalahan,
        solusi,
        fontJudul: "'Times New Roman', Times, serif",
        sizeJudul: "18pt",
        fontIsi: "'Times New Roman', Times, serif",
        sizeIsi: "12pt",
        lineHeight: "1.5",
        paragraphSpacing: "0.5rem",
        tempat: "Palembang",
        tanggal: tanggal || "30 Juli 2026",
        tanggalPicker: "2026-07-30",
        nama: "M Ardian Nugraha",
        nip: "199202042026221001",
        logoSrc: "",
        ttdSrc: "",
        qrCodeSrc: "",
        foto1Src: "",
        foto2Src: "",
        foto1Caption: "",
        foto2Caption: "",
        tampilkanNomorHalaman: true,
        formatNomorHalaman: "- {n} -",
      },
      permasalahan,
      solusi
    );

    const gemini = await getGeminiClient();

    if (!gemini) {
      return res.json(localReport);
    }

    const { ai, Type } = gemini;

    const prompt = `Anda adalah seorang Pekerja Sosial (Peksos) Profesional, Akademisi Kesejahteraan Sosial, dan Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang (di bawah Kementerian Sosial RI).
Susunlah narasi laporan e-Kinerja resmi bergaya Jurnal Ilmiah Praktik Pekerjaan Sosial (baik format standar maupun format Laporan Khusus Bab A s.d. H beserta Abstrak, Kajian Teori dengan sitasi in-text APA 7th Edition, dan Daftar Pustaka Ilmiah) dengan Bahasa Indonesia baku, formal, dan akademis berdasarkan data berikut:

- Judul Kegiatan: ${judul}
- RHK/Kategori: RHK ${rhk}
- Permasalahan Peserta Didik: ${permasalahan}
- Solusi / Intervensi Pekerjaan Sosial: ${solusi}
- Tanggal: ${tanggal || "30 Juli 2026"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            umum: { type: Type.STRING },
            maksud: { type: Type.STRING },
            tujuan: { type: Type.STRING },
            ruang: { type: Type.STRING },
            kegiatan: { type: Type.STRING },
            hasil: { type: Type.STRING },
            simpulan: { type: Type.STRING },
            saran: { type: Type.STRING },
            rekomendasi: { type: Type.STRING },
            penutup: { type: Type.STRING },
            khususAbstrak: { type: Type.STRING },
            khususKataKunci: { type: Type.STRING },
            khususKajianTeori: { type: Type.STRING },
            khususLatarBelakang: { type: Type.STRING },
            khususDasarPelaksanaan: { type: Type.STRING },
            khususTujuan: { type: Type.STRING },
            khususPelaksanaan: { type: Type.STRING },
            khususHasil: { type: Type.STRING },
            khususKendala: { type: Type.STRING },
            khususTindakLanjut: { type: Type.STRING },
            khususSimpulan: { type: Type.STRING },
            khususSaran: { type: Type.STRING },
            khususReferensi: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "umum",
            "maksud",
            "tujuan",
            "ruang",
            "kegiatan",
            "hasil",
            "simpulan",
            "saran",
            "rekomendasi",
            "penutup",
            "khususAbstrak",
            "khususKataKunci",
            "khususKajianTeori",
            "khususLatarBelakang",
            "khususDasarPelaksanaan",
            "khususTujuan",
            "khususPelaksanaan",
            "khususHasil",
            "khususKendala",
            "khususTindakLanjut",
            "khususSimpulan",
            "khususSaran",
            "khususReferensi",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.json(localReport);
    }

    const parsedData = JSON.parse(resultText);
    return res.json({
      ...localReport,
      ...parsedData,
      khususReferensi:
        Array.isArray(parsedData.khususReferensi) && parsedData.khususReferensi.length > 0
          ? parsedData.khususReferensi
          : localReport.khususReferensi,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Gagal menyusun narasi AI. Menggunakan format standar.", details: error.message });
  }
});

// API endpoint for SKP problem matcher, case diagnosis, and intervention planning
app.post("/api/diagnose-skp", async (req, res) => {
  try {
    const { masalah } = req.body;
    if (!masalah || typeof masalah !== "string" || !masalah.trim()) {
      return res.status(400).json({ error: "Deskripsi permasalahan siswa wajib diisi." });
    }

    const localDiagnosis = diagnoseSkpProblem(masalah);
    const gemini = await getGeminiClient();

    if (!gemini) {
      return res.json(localDiagnosis);
    }

    const { ai, Type } = gemini;

    const prompt = `Anda adalah seorang Pekerja Sosial (Peksos) Ahli dan Asesor e-Kinerja di Sekolah Rakyat Terintegrasi Kementerian Sosial Republik Indonesia.
Diberikan deskripsi permasalahan atau dinamika kasus anak asrama Sekolah Rakyat:
"${masalah}"

Tugas Anda:
1. Analisis masalah ini secara mendalam dan tentukan diletakkan di SKP / RHK mana yang paling tepat ("1" s.d. "6").
2. Berikan skor kecocokan (confidenceScore 75 - 99), alasan kesesuaian tupoksi, judul rekomendasi (HURUF KAPITAL), gambaran kasus menyeluruh, metode & teori intervensi Peksos, 4 tahapan intervensi praktis, penyelesaian konkret, dan 2 rekomendasi tindak lanjut.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedRhk: { type: Type.STRING, enum: ["1", "2", "3", "4", "5", "6"] },
            rhkBadge: { type: Type.STRING },
            rhkTitle: { type: Type.STRING },
            kategoriTupoksi: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            alasanKesesuaian: { type: Type.STRING },
            judulRekomendasi: { type: Type.STRING },
            gambaranKasus: { type: Type.STRING },
            metodeIntervensiPeksos: { type: Type.STRING },
            landasanTeori: { type: Type.STRING },
            tahapanIntervensi: { type: Type.ARRAY, items: { type: Type.STRING } },
            penyelesaianKonkret: { type: Type.STRING },
            solusiLaporan: { type: Type.STRING },
            rekomendasiTindakLanjut: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "recommendedRhk",
            "rhkBadge",
            "rhkTitle",
            "kategoriTupoksi",
            "confidenceScore",
            "alasanKesesuaian",
            "judulRekomendasi",
            "gambaranKasus",
            "metodeIntervensiPeksos",
            "landasanTeori",
            "tahapanIntervensi",
            "penyelesaianKonkret",
            "solusiLaporan",
            "rekomendasiTindakLanjut"
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      return res.json(localDiagnosis);
    }

    const aiDiagnosis = JSON.parse(resultText);
    return res.json({
      ...localDiagnosis,
      ...aiDiagnosis
    });
  } catch (err: any) {
    console.error("Diagnosis SKP Error:", err);
    try {
      const localResult = diagnoseSkpProblem(req.body.masalah || "");
      return res.json(localResult);
    } catch {
      return res.status(500).json({ error: "Gagal menganalisis masalah SKP." });
    }
  }
});

function startServer() {
  if (process.env.NODE_ENV !== "production") {
    let viteMiddleware: any = null;
    const viteReady = import("vite")
      .then(({ createServer }) =>
        createServer({
          server: {
            middlewareMode: true,
            hmr: false,
            allowedHosts: true,
          },
          appType: "spa",
        })
      )
      .then((vite) => {
        viteMiddleware = vite.middlewares;
        return vite;
      })
      .catch((err) => {
        console.error("Failed to initialize Vite server:", err);
        throw err;
      });

    app.use(async (req, res, next) => {
      try {
        if (!viteMiddleware) {
          await viteReady;
        }
        return viteMiddleware(req, res, next);
      } catch (err) {
        return next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind port immediately so readiness checks never wait on Vite compilation
  const server = app.listen(PORT, HOST, () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} is in use, retrying in 300ms...`);
      setTimeout(() => {
        try {
          server.close();
        } catch {}
        server.listen(PORT, HOST);
      }, 300);
    } else {
      console.error("Server listen error:", err);
    }
  });

  const cleanup = () => {
    try {
      server.close(() => process.exit(0));
    } catch {
      process.exit(0);
    }
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

startServer();
