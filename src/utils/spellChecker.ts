export interface SpellIssue {
  id: string;
  word: string;
  suggestion: string;
  reason: string;
  field?: string;
  fieldLabel?: string;
}

export interface SpellRule {
  pattern: RegExp;
  suggestion: string;
  reason: string;
}

export const INDONESIAN_SPELL_RULES: SpellRule[] = [
  // Ejaan Baku KBBI
  { pattern: /\bpraktek\b/gi, suggestion: 'praktik', reason: 'Sesuai KBBI: kata baku adalah "praktik"' },
  { pattern: /\bapotik\b/gi, suggestion: 'apotek', reason: 'Sesuai KBBI: kata baku adalah "apotek"' },
  { pattern: /\bresiko\b/gi, suggestion: 'risiko', reason: 'Sesuai KBBI: kata baku adalah "risiko"' },
  { pattern: /\bijin\b/gi, suggestion: 'izin', reason: 'Sesuai KBBI: kata baku adalah "izin"' },
  { pattern: /\banalisa\b/gi, suggestion: 'analisis', reason: 'Sesuai KBBI: kata baku adalah "analisis"' },
  { pattern: /\bdianalisa\b/gi, suggestion: 'dianalisis', reason: 'Sesuai KBBI: kata baku adalah "dianalisis"' },
  { pattern: /\bmenganalisa\b/gi, suggestion: 'menganalisis', reason: 'Sesuai KBBI: kata baku adalah "menganalisis"' },
  { pattern: /\bsistim\b/gi, suggestion: 'sistem', reason: 'Sesuai KBBI: kata baku adalah "sistem"' },
  { pattern: /\bhirarki\b/gi, suggestion: 'hierarki', reason: 'Sesuai KBBI: kata baku adalah "hierarki"' },
  { pattern: /\bkatagori\b/gi, suggestion: 'kategori', reason: 'Sesuai KBBI: kata baku adalah "kategori"' },
  { pattern: /\baktifitas\b/gi, suggestion: 'aktivitas', reason: 'Sesuai KBBI: kata baku adalah "aktivitas"' },
  { pattern: /\befektip\b/gi, suggestion: 'efektif', reason: 'Sesuai KBBI: kata baku adalah "efektif"' },
  { pattern: /\bkreatip\b/gi, suggestion: 'kreatif', reason: 'Sesuai KBBI: kata baku adalah "kreatif"' },
  { pattern: /\bsekedar\b/gi, suggestion: 'sekadar', reason: 'Sesuai KBBI: kata baku adalah "sekadar"' },
  { pattern: /\bsilahkan\b/gi, suggestion: 'silakan', reason: 'Sesuai KBBI: kata baku adalah "silakan"' },
  { pattern: /\bobyek\b/gi, suggestion: 'objek', reason: 'Sesuai KBBI: kata baku adalah "objek"' },
  { pattern: /\bsubyek\b/gi, suggestion: 'subjek', reason: 'Sesuai KBBI: kata baku adalah "subjek"' },
  { pattern: /\bterimakasih\b/gi, suggestion: 'terima kasih', reason: 'Penulisan dipisah: "terima kasih"' },
  { pattern: /\borangtua\b/gi, suggestion: 'orang tua', reason: 'Penulisan dipisah: "orang tua"' },
  { pattern: /\bertanggungjawab\b/gi, suggestion: 'bertanggung jawab', reason: 'Penulisan dipisah: "bertanggung jawab"' },
  { pattern: /\bantrian\b/gi, suggestion: 'antrean', reason: 'Sesuai KBBI: kata baku adalah "antrean"' },
  { pattern: /\bkwalitas\b/gi, suggestion: 'kualitas', reason: 'Sesuai KBBI: kata baku adalah "kualitas"' },
  { pattern: /\bkwantitas\b/gi, suggestion: 'kuantitas', reason: 'Sesuai KBBI: kata baku adalah "kuantitas"' },
  { pattern: /\bmerubah\b/gi, suggestion: 'mengubah', reason: 'Bentuk baku turunan dari "ubah" adalah "mengubah"' },
  { pattern: /\bmempesona\b/gi, suggestion: 'memesona', reason: 'Huruf "p" luluh setelah awalan "me-": "memesona"' },
  { pattern: /\bmempengaruhi\b/gi, suggestion: 'memengaruhi', reason: 'Huruf "p" luluh setelah awalan "me-": "memengaruhi"' },

  // Kata Depan "di" (Preposisi Tempat) yang salah disambung
  { pattern: /\bdiantara\b/gi, suggestion: 'di antara', reason: 'Kata depan "di" menunjukkan tempat/posisi ditulis terpisah' },
  { pattern: /\bdiatas\b/gi, suggestion: 'di atas', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdibawah\b/gi, suggestion: 'di bawah', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdidepan\b/gi, suggestion: 'di depan', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdibelakang\b/gi, suggestion: 'di belakang', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdisamping\b/gi, suggestion: 'di samping', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdiluar\b/gi, suggestion: 'di luar', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdidalam\b/gi, suggestion: 'di dalam', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdisana\b/gi, suggestion: 'di sana', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdisini\b/gi, suggestion: 'di sini', reason: 'Kata depan "di" menunjukkan tempat ditulis terpisah' },
  { pattern: /\bdimana\b/gi, suggestion: 'di mana', reason: 'Penulisan kata tanya/penghubung tempat dipisah: "di mana"' },
  { pattern: /\bkemana\b/gi, suggestion: 'ke mana', reason: 'Penulisan kata tempat dipisah: "ke mana"' },
  { pattern: /\bdarimana\b/gi, suggestion: 'dari mana', reason: 'Penulisan kata tempat dipisah: "dari mana"' },

  // Awalan pasif "di-" (Verba Pasif) yang salah dipisah
  { pattern: /\bdi lakukan\b/gi, suggestion: 'dilakukan', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi laksanakan\b/gi, suggestion: 'dilaksanakan', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi buat\b/gi, suggestion: 'dibuat', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi berikan\b/gi, suggestion: 'diberikan', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi dapat\b/gi, suggestion: 'didapat', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi peroleh\b/gi, suggestion: 'diperoleh', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi lihat\b/gi, suggestion: 'dilihat', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi catat\b/gi, suggestion: 'dicatat', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi temukan\b/gi, suggestion: 'ditemukan', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi susun\b/gi, suggestion: 'disusun', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi dampingi\b/gi, suggestion: 'didampingi', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi fasilitasi\b/gi, suggestion: 'difasilitasi', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi bina\b/gi, suggestion: 'dibina', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
  { pattern: /\bdi simpulkan\b/gi, suggestion: 'disimpulkan', reason: 'Awalan "di-" pembentuk kata kerja pasif ditulis serangkai' },
];

export function checkTextSpelling(
  text: string,
  fieldKey?: string,
  fieldLabel?: string
): SpellIssue[] {
  if (!text) return [];

  // Clean HTML tags first to analyze text content
  const cleanText = text.replace(/<[^>]+>/g, ' ');
  const issues: SpellIssue[] = [];
  let idCounter = 1;

  INDONESIAN_SPELL_RULES.forEach((rule) => {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(cleanText)) !== null) {
      issues.push({
        id: `${fieldKey || 'field'}-${idCounter++}`,
        word: match[0],
        suggestion: rule.suggestion,
        reason: rule.reason,
        field: fieldKey,
        fieldLabel,
      });
    }
  });

  return issues;
}

export function autoCorrectText(text: string): { correctedText: string; replacementsCount: number } {
  if (!text) return { correctedText: text, replacementsCount: 0 };

  let current = text;
  let replacementsCount = 0;

  INDONESIAN_SPELL_RULES.forEach((rule) => {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    const matches = current.match(regex);
    if (matches && matches.length > 0) {
      replacementsCount += matches.length;
      current = current.replace(regex, (match) => {
        // preserve capitalization if word starts uppercase
        if (match[0] === match[0].toUpperCase()) {
          return rule.suggestion.charAt(0).toUpperCase() + rule.suggestion.slice(1);
        }
        return rule.suggestion;
      });
    }
  });

  return { correctedText: current, replacementsCount };
}
