export interface RecommendationInputs {
  rhk?: string;
  judul?: string;
  permasalahan?: string;
  solusi?: string;
}

export type RecommendationStyle = 'balanced' | 'technical' | 'collaborative' | 'habituation';

/**
 * Generates dynamic, non-monotonous recommendations based on report inputs (topic, problem, solution, RHK)
 */
export function generateDynamicRecommendation(
  inputs: RecommendationInputs,
  style: RecommendationStyle = 'balanced'
): string {
  const p = (inputs.permasalahan || '').trim();
  const s = (inputs.solusi || '').trim();
  const j = (inputs.judul || 'bimbingan dan pengasuhan peserta didik').trim();

  const mLower = p ? p.toLowerCase() : 'dinamika dan kendala perilaku peserta didik';
  const sLower = s ? s.toLowerCase() : 'pendampingan dan bimbingan pengasuhan harian';
  const jLower = j.toLowerCase();

  // Detect theme category to make contextual nuances sharper
  let category: 'keagamaan' | 'akademik' | 'kebersihan' | 'sosial_emosional' | 'kedisiplinan' | 'umum' = 'umum';
  if (
    jLower.includes('ibadah') ||
    jLower.includes('shalat') ||
    jLower.includes('mengaji') ||
    mLower.includes('shalat') ||
    mLower.includes('mengaji') ||
    mLower.includes('azan') ||
    mLower.includes('ibadah')
  ) {
    category = 'keagamaan';
  } else if (
    jLower.includes('belajar') ||
    jLower.includes('pengajaran') ||
    jLower.includes('konsentrasi') ||
    mLower.includes('belajar') ||
    mLower.includes('konsentrasi') ||
    mLower.includes('pr') ||
    mLower.includes('literasi') ||
    mLower.includes('tugas')
  ) {
    category = 'akademik';
  } else if (
    jLower.includes('cuci') ||
    jLower.includes('kamar') ||
    jLower.includes('kebersihan') ||
    jLower.includes('hygiene') ||
    mLower.includes('pakaian') ||
    mLower.includes('kebersihan') ||
    mLower.includes('piket') ||
    mLower.includes('mandi')
  ) {
    category = 'kebersihan';
  } else if (
    jLower.includes('emosi') ||
    jLower.includes('etika') ||
    jLower.includes('sosialisasi') ||
    mLower.includes('emosi') ||
    mLower.includes('sosial') ||
    mLower.includes('berkelahi') ||
    mLower.includes('marah') ||
    mLower.includes('perilaku')
  ) {
    category = 'sosial_emosional';
  } else if (
    jLower.includes('rutinitas') ||
    jLower.includes('bangun') ||
    jLower.includes('disiplin') ||
    mLower.includes('terlambat') ||
    mLower.includes('bangun')
  ) {
    category = 'kedisiplinan';
  }

  if (style === 'technical') {
    const pt1 = `1. Menerapkan secara konsisten pendekatan intervensi, yakni dengan ${sLower} sebagai langkah terukur penanganan masalah ${mLower}.`;
    let pt2 = `2. Melakukan penataan lingkungan pengasuhan dan pengkondisian iklim asrama yang kondusif (ecological perspective) untuk mendukung perubahan perilaku peserta didik.`;
    if (category === 'akademik') {
      pt2 = `2. Mengoptimalkan teknik modifikasi perilaku (behavioral modification) dan penyediaan ruang belajar minim distraksi saat jam belajar mandiri malam.`;
    } else if (category === 'keagamaan') {
      pt2 = `2. Menetapkan jadwal pembiasaan spiritual terstruktur disertai sistem token/reinforcement positif untuk memotivasi partisipasi ibadah peserta didik.`;
    }
    const pt3 = `3. Mengembangkan instrumen pemantauan mandiri (self-monitoring) dan pencatatan poin perkembangan harian guna mengukur efektivitas intervensi Peksos secara objektif.`;
    return `${pt1}\n${pt2}\n${pt3}`;
  }

  if (style === 'collaborative') {
    const pt1 = `1. Merekomendasikan penguatan tim pendampingan terpadu (Wali Asuh, Pekerja Sosial, dan tim pengasuh asrama) dalam mendukung pelaksanaan ${jLower}.`;
    let pt2 = `2. Mengintensifkan koordinasi dan komunikasi berkala dengan wali kelas, guru pendamping, serta orang tua/wali siswa guna memantau perkembangan ${mLower} secara sinergis.`;
    if (category === 'keagamaan') {
      pt2 = `2. Menggalang sinergi dengan Pembina Asrama, Guru Agama, serta tokoh pengasuh dalam membina kedisiplinan dan kesadaran spiritual peserta didik.`;
    } else if (category === 'kebersihan') {
      pt2 = `2. Menggalang kolaborasi antar-teman sebaya kamar asrama (peer support) serta pengawasan rutin pengasuh dalam menjaga kerapian dan kebersihan lingkungan.`;
    }
    const pt3 = `3. Menyediakan ruang konsultasi dan evaluasi kasus (case conference) secara berkala apabila ditemukan kendala baru dalam pengasuhan peserta didik.`;
    return `${pt1}\n${pt2}\n${pt3}`;
  }

  if (style === 'habituation') {
    const pt1 = `1. Mengoptimalkan program pembiasaan harian yang relevan dengan ${jLower} yang diselaraskan melalui ${sLower} agar menjadi habituasi positif yang melekat.`;
    const pt2 = `2. Memberikan penguatan emosional yang empati dan apresiatif (positive reinforcement) atas setiap peningkatan kecil yang ditunjukkan oleh peserta didik.`;
    const pt3 = `3. Merekomendasikan pelaporan rekam jejak pengasuhan secara berkala kepada pimpinan Sekolah Rakyat Terintegrasi 31 Palembang sebagai wujud akuntabilitas kinerja.`;
    return `${pt1}\n${pt2}\n${pt3}`;
  }

  // Default 'balanced' style
  const p1 = `1. Merekomendasikan keberlanjutan intervensi pengasuhan secara terstruktur, yaitu dengan ${sLower} guna memfasilitasi pengentasan kendala ${mLower} pada peserta didik.`;
  
  let p2 = `2. Merekomendasikan koordinasi dan evaluasi berkala antara Wali Asuh, Pekerja Sosial, dan pimpinan unit/sekolah dalam menjaga konsistensi pembinaan karakter anak.`;
  if (category === 'keagamaan') {
    p2 = `2. Merekomendasikan koordinasi rutin bersama Pembina Asrama dan Wali Kelas dalam memantau konsistensi ibadah serta penguatan motivasi spiritual peserta didik.`;
  } else if (category === 'akademik') {
    p2 = `2. Merekomendasikan kolaborasi berkala antara Wali Asuh, Pekerja Sosial, dan guru pendamping sekolah untuk memantau progress akademis serta daya fokus belajar mandiri siswa.`;
  } else if (category === 'kebersihan') {
    p2 = `2. Merekomendasikan penerapan kontrol sosial kelompok (group contingency) dan piket harian di kamar asrama dengan pendampingan langsung dari pengasuh.`;
  } else if (category === 'sosial_emosional') {
    p2 = `2. Merekomendasikan bimbingan kelompok (social group work) dan konseling suportif secara konsisten guna mengasah regulasi emosi serta etika berinteraksi di asrama.`;
  } else if (category === 'kedisiplinan') {
    p2 = `2. Merekomendasikan pemantauan ritme harian yang konsisten di asrama, penegakan disiplin ramah anak, serta evaluasi keteraturan waktu siswa.`;
  }

  const p3 = `3. Memfasilitasi pendokumentasian rekam perkembangan perilaku anak serta evaluasi berkala sebagai bahan rujukan tindak lanjut pengasuhan lanjutan.`;

  return `${p1}\n${p2}\n${p3}`;
}

/**
 * Returns a list of recommendation variations for UI selection/rotation
 */
export function getRecommendationVariations(inputs: RecommendationInputs): { label: string; text: string; style: RecommendationStyle }[] {
  return [
    {
      label: '🎯 Berimbang & Terstruktur (Standar Peksos)',
      style: 'balanced',
      text: generateDynamicRecommendation(inputs, 'balanced')
    },
    {
      label: '🔬 Teknis Intervensi & Modifikasi Perilaku',
      style: 'technical',
      text: generateDynamicRecommendation(inputs, 'technical')
    },
    {
      label: '🤝 Kolaboratif & Lintas Sektor (Sekolah/Orang Tua)',
      style: 'collaborative',
      text: generateDynamicRecommendation(inputs, 'collaborative')
    },
    {
      label: '🌱 Habituasi & Pembiasaan Karakter Jangka Panjang',
      style: 'habituation',
      text: generateDynamicRecommendation(inputs, 'habituation')
    }
  ];
}
