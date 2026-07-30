import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API endpoint for AI report generation/refinement
app.post("/api/generate-ai", async (req, res) => {
  try {
    const { rhk, judul, permasalahan, solusi } = req.body;

    if (!permasalahan || !solusi) {
      return res.status(400).json({ error: "Permasalahan dan Solusi wajib diisi." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback rule-based structured text generator when API key is missing
      const pLower = permasalahan.toLowerCase();
      const sLower = solusi.toLowerCase();
      const jLower = (judul || "bimbingan dan pengasuhan").toLowerCase();

      return res.json({
        umum: `Dalam pelaksanaan tugas sebagai Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang, kegiatan bimbingan dan pengasuhan kepada peserta didik dilaksanakan merespon dinamika asrama dimana ditemukan indikasi bahwa ${pLower}. Kegiatan pendampingan ini dilakukan sebagai bentuk pengasuhan anak yang terintegrasi di lingkungan sekolah.`,
        maksud: `Memberikan gambaran pelaksanaan intervensi pekerjaan sosial dan kegiatan bimbingan harian terkait permasalahan ${pLower}.`,
        tujuan: `Untuk mengontrol, membina, dan memberikan pendampingan yang tepat guna menyelesaikan kendala yang dihadapi peserta didik melalui intervensi yang terukur.`,
        ruang: `Ruang lingkup kegiatan difokuskan pada upaya ${sLower} dalam kerangka pembinaan karakter dan pengasuhan peserta didik di Sekolah Rakyat.`,
        kegiatan: `Kegiatan pendampingan dilaksanakan melalui observasi terarah, pendekatan persuasif, dan implementasi intervensi spesifik, yakni dengan ${sLower}. Proses ini melibatkan partisipasi aktif siswa agar menyadari tanggung jawabnya.`,
        hasil: `Siswa merespon intervensi dengan kooperatif, menunjukkan perubahan sikap yang lebih adaptif, serta kondisi emosional yang relatif stabil pasca diberikannya pendampingan.`,
        simpulan: `Kegiatan intervensi dan pendampingan terkait ${jLower} berjalan dengan baik dan berhasil menekan perilaku maladaptif peserta didik.`,
        saran: `Diperlukan monitoring lanjutan secara konsisten serta kolaborasi dengan pihak pendidik/sekolah untuk memastikan keberlanjutan perubahan perilaku peserta didik.`,
        rekomendasi: `1. Merekomendasikan pendampingan individual secara terprogram oleh Wali Asuh dan tim Pekerja Sosial.\n2. Merekomendasikan koordinasi rutin berkala dengan kepala sekolah, wali kelas, serta orang tua/wali siswa guna menjaga konsistensi pembinaan karakter anak.`,
        penutup: `Demikian laporan kegiatan harian ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas pendampingan dan pengasuhan peserta didik di Sekolah Rakyat Terintegrasi 31 Palembang dalam rangka ${jLower} agar dapat dipergunakan sebagaimana mestinya.`
      });
    }

    const prompt = `Anda adalah seorang Pekerja Sosial (Peksos) Profesional dan Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang (di bawah Kementerian Sosial RI).
Susunlah narasi laporan e-Kinerja resmi dengan Bahasa Indonesia baku, formal, dan profesional berdasarkan data berikut:

- Judul Kegiatan: ${judul}
- RHK/Kategori: RHK ${rhk}
- Permasalahan Peserta Didik: ${permasalahan}
- Solusi / Intervensi Pekerjaan Sosial: ${solusi}

Buat narasi untuk setiap poin laporan berikut dalam bentuk JSON yang rapi:
1. umum: Narasi Pendahuluan Umum (menyebutkan tugas Wali Asuh di Sekolah Rakyat Terintegrasi 31 Palembang dan menghubungkan ke permasalahan).
2. maksud: Maksud pelaksanaan kegiatan.
3. tujuan: Tujuan pelaksanaan kegiatan.
4. ruang: Ruang lingkup kegiatan intervensi.
5. kegiatan: Kegiatan yang dilaksanakan secara detail dan terstruktur (menguraikan metode intervensi Peksos).
6. hasil: Hasil yang dicapai oleh peserta didik setelah intervensi.
7. simpulan: Simpulan dari laporan.
8. saran: Saran pelaksanaan kegiatan.
9. rekomendasi: Rekomendasi laporan & tindak lanjut konkrit untuk penanganan peserta didik (dapat berbentuk poin-poin terstruktur 1, 2, dsb).
10. penutup: Kalimat penutup laporan pertanggungjawaban resmi.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
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
            penutup: { type: Type.STRING }
          },
          required: ["umum", "maksud", "tujuan", "ruang", "kegiatan", "hasil", "simpulan", "saran", "rekomendasi", "penutup"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Tidak ada respon dari Gemini API.");
    }

    const parsedData = JSON.parse(resultText);
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Gagal menyusun narasi AI. Menggunakan format standar.", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server e-Kinerja Peksos running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
