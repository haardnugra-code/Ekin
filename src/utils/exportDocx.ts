import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  ImageRun,
  Footer,
  PageNumber,
  PageBreak,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { ReportInputs, ReportOutputs } from '../types';
import { DASAR_HUKUM_LIST, DASAR_PELAKSANAAN_LIST } from '../data/presets';
import { DEFAULT_KEMENSOS_LOGO } from './kemensosLogo';

/**
 * Helper to convert Image Data URL or HTTP URL to Uint8Array for docx ImageRun
 */
async function getImageBuffer(url?: string): Promise<Uint8Array | null> {
  const targetUrl = url;
  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) return null;
  try {
    if (targetUrl.startsWith('data:image/svg+xml')) {
      return await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, 300, 300);
          const pngDataUrl = canvas.toDataURL('image/png');
          const base64 = pngDataUrl.split(',')[1];
          const binary = window.atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          resolve(bytes);
        };
        img.onerror = () => resolve(null);
        img.src = targetUrl;
      });
    } else if (targetUrl.startsWith('data:')) {
      const parts = targetUrl.split(',');
      if (parts.length < 2) return null;
      const base64Data = parts[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      const response = await fetch(targetUrl);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  } catch (err) {
    console.error('Gagal memproses gambar untuk docx:', err);
    return null;
  }
}

function getImageType(dataUrl?: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  if (dataUrl && (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg'))) {
    return 'jpg';
  }
  return 'png';
}

function parseHtmlToTextRuns(htmlString: string, baseOptions: { size?: number; font?: string } = {}): TextRun[] {
  if (!htmlString) return [];
  const size = baseOptions.size || 24;

  if (!/<[a-z][\s\S]*>/i.test(htmlString)) {
    return [new TextRun({ text: htmlString, size, font: baseOptions.font })];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${htmlString}</body>`, 'text/html');
    const runs: TextRun[] = [];

    function traverse(node: Node, currentFormat: { bold?: boolean; italics?: boolean; underline?: boolean }) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          runs.push(
            new TextRun({
              text,
              bold: currentFormat.bold,
              italics: currentFormat.italics,
              underline: currentFormat.underline ? {} : undefined,
              size,
              font: baseOptions.font,
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const newFormat = { ...currentFormat };

        if (tag === 'b' || tag === 'strong') newFormat.bold = true;
        if (tag === 'i' || tag === 'em') newFormat.italics = true;
        if (tag === 'u') newFormat.underline = true;

        if (tag === 'br') {
          runs.push(new TextRun({ text: '\n', size }));
        } else {
          el.childNodes.forEach((child) => traverse(child, newFormat));
        }
      }
    }

    doc.body.childNodes.forEach((child) => traverse(child, {}));
    return runs.length > 0 ? runs : [new TextRun({ text: htmlString, size })];
  } catch {
    return [new TextRun({ text: htmlString.replace(/<[^>]+>/g, ''), size })];
  }
}

export async function generateDocxBlob(inputs: ReportInputs, outputs: ReportOutputs) {
  // 1. Fetch / Convert images
  // 1. Fetch / Convert images
  const logoBuffer = await getImageBuffer(inputs.logoSrc);
  const logo2Buffer = (inputs.showLogo2 !== false && inputs.logo2Src) ? await getImageBuffer(inputs.logo2Src) : null;
  const qrBuffer = await getImageBuffer(inputs.qrCodeSrc);
  const ttdBuffer = await getImageBuffer(inputs.ttdSrc);
  const foto1Buffer = await getImageBuffer(inputs.foto1Src);
  const foto2Buffer = await getImageBuffer(inputs.foto2Src);

  // 2. Kop Surat Table
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const thinBorder = { style: BorderStyle.SINGLE, size: 8, color: '000000' };

  const hasLogo1 = !!logoBuffer;
  const hasLogo2 = !!logo2Buffer;
  const textWidth = (hasLogo1 && hasLogo2) ? 68 : (hasLogo1 || hasLogo2) ? 84 : 100;

  const kopTextCell = new TableCell({
    width: { size: textWidth, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: inputs.kopInstansiUtama || 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA', bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: inputs.kopEselon1 || 'SEKRETARIAT JENDERAL', bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: inputs.kopEselon2 || 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', bold: true, size: 20 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: inputs.kopUnitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG', bold: true, size: 24 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: inputs.kopAlamat || 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com',
            size: 15,
          }),
        ],
      }),
    ],
  });

  const kopTableCells: TableCell[] = [];
  if (hasLogo1) {
    kopTableCells.push(
      new TableCell({
        width: { size: 16, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: logoBuffer!,
                transformation: { width: 70, height: 70 },
                type: getImageType(inputs.logoSrc),
              }),
            ],
          }),
        ],
      })
    );
  }
  kopTableCells.push(kopTextCell);
  if (hasLogo2) {
    kopTableCells.push(
      new TableCell({
        width: { size: 16, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        borders: { top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: logo2Buffer!,
                transformation: { width: 70, height: 70 },
                type: getImageType(inputs.logo2Src),
              }),
            ],
          }),
        ],
      })
    );
  }

  const kopTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      bottom: thinBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: kopTableCells,
      }),
    ],
  });

  // 3. Body Content (Standar vs Mode Laporan Khusus)
  const bodyElements: (Paragraph | Table)[] = [];

  const isSpecialMode = Boolean(inputs.modeLaporanKhusus);

  // List Dasar Pelaksanaan (shared)
  const dasarPelaksanaanItems: string[] = [];
  if (Boolean(inputs.sertakanDetailSuratTugas)) {
    dasarPelaksanaanItems.push(
      `Surat Tugas ${inputs.pemberiTugas || 'Direktur / Pimpinan'} Nomor: ${inputs.nomorSuratTugas || 'ST-088/SRT.31/PLM/08/2026'} tanggal ${inputs.tanggalSuratTugas || inputs.tanggal || '10 Agustus 2026'} perihal ${outputs.judul || inputs.judul}.`
    );
  }
  if (Boolean(inputs.aktifFiturPelatihan)) {
    dasarPelaksanaanItems.push(
      `Kurikulum dan Modul Pelatihan Wali Asuh Sekolah Rakyat Tahun 2026, ${inputs.penyelenggaraPelatihan || 'Pusat Pendidikan, Pelatihan, dan Pengembangan Profesi (Pusdiklatbangprof) Kementerian Sosial RI'}.`
    );
  }
  dasarPelaksanaanItems.push(...DASAR_PELAKSANAAN_LIST);

  const showCoverPenelitian = inputs.tampilkanCoverPenelitian !== false;
  const showJurnalIlmiah = inputs.aktifFiturJurnalIlmiah !== false;
  const rhkLabelText =
    inputs.rhk === 'custom'
      ? `RHK KHUSUS (${inputs.customTitle || 'RENCANA HASIL KERJA TAMBAHAN'})`
      : `RHK ${inputs.rhk} — ${
          inputs.rhk === '1'
            ? 'RENCANA KERJA PENGASUHAN'
            : inputs.rhk === '2'
              ? 'ASSESMEN HOLISTIK & PEMETAAN MASALAH'
              : inputs.rhk === '3'
                ? 'INTERVENSI PENDAMPINGAN KASUS'
                : inputs.rhk === '4'
                  ? 'MONITORING PERKEMBANGAN PESERTA DIDIK'
                  : inputs.rhk === '5'
                    ? 'TERMINASI & RUJUKAN LAYANAN'
                    : 'EVALUASI & PENCATATAN PELAPORAN'
        }`;

  // =========================================================================
  // HALAMAN 1: COVER PENELITIAN & LAPORAN KAJIAN (BERDIRI SENDIRI)
  // =========================================================================
  if (showCoverPenelitian || isSpecialMode) {
    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({
            text: (
              inputs.namaJurnalIlmiah ||
              'Jurnal Praktik Pekerjaan Sosial & Pengasuhan Sekolah Rakyat (JPPS-SR)'
            ).toUpperCase(),
            bold: true,
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'DOKUMEN KAJIAN ILMIAH & LAPORAN PELAKSANAAN TUGAS KEDINASAN',
            italics: true,
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text:
              inputs.gayaCoverPenelitian === 'akademis_modern'
                ? 'LAPORAN KAJIAN ILMIAH & PRAKTIK PEKERJAAN SOSIAL'
                : inputs.gayaCoverPenelitian === 'kedinasan_klasik'
                  ? 'LAPORAN PELAKSANAAN TUGAS PEKERJA SOSIAL / WALI ASUH'
                  : 'LAPORAN KAJIAN INTERVENSI & PELAKSANAAN TUGAS PEKERJAAN SOSIAL',
            bold: true,
            size: 28
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: rhkLabelText,
            bold: true,
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: (outputs.judul || inputs.judul).toUpperCase(),
            bold: true,
            size: 28
          })
        ]
      })
    );

    if (inputs.subJudulCoverPenelitian) {
      bodyElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: inputs.subJudulCoverPenelitian,
              italics: true,
              size: 22
            })
          ]
        })
      );
    }

    if (inputs.nomorSurat) {
      bodyElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: `NOMOR DOKUMEN: ${inputs.nomorSurat}`,
              bold: true,
              size: 20
            })
          ]
        })
      );
    }

    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 180 },
        children: [
          new TextRun({
            text:
              inputs.keteranganCoverPenelitian ||
              'Disusun sebagai Dokumen Pertanggungjawaban Kinerja Aparatur Sipil Negara (SKP) dan Kajian Praktik Pekerjaan Sosial Berbasis Bukti (Evidence-Based Social Work Practice)',
            italics: true,
            size: 20
          })
        ]
      })
    );

    // Logo Tengah Cover Penelitian
    if (hasLogo1 && logoBuffer) {
      bodyElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 200 },
          children: [
            new ImageRun({
              data: logoBuffer,
              transformation: { width: 105, height: 105 },
              type: getImageType(inputs.logoSrc)
            })
          ]
        })
      );
    }

    // Kotak Identitas Penyusun / Peneliti
    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 40 },
        children: [
          new TextRun({
            text: 'DISUSUN OLEH PENELITI / PELAKSANA INTERVENSI:',
            bold: true,
            size: 20
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: outputs.nama || inputs.nama,
            bold: true,
            underline: {},
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: `NIP. ${outputs.nip || inputs.nip}`,
            bold: true,
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 220 },
        children: [
          new TextRun({
            text: outputs.jabatan || 'Pekerja Sosial Ahli Pertama / Wali Asuh',
            italics: true,
            size: 20
          })
        ]
      }),
      // Footer Instansi Cover Penelitian
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 40 },
        children: [
          new TextRun({
            text: (inputs.kopInstansiUtama || 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA').toUpperCase(),
            bold: true,
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: (inputs.kopEselon1 || 'SEKRETARIAT JENDERAL').toUpperCase(),
            bold: true,
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: (inputs.kopUnitKerja || 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG').toUpperCase(),
            bold: true,
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `${(outputs.tempat || inputs.tempat || 'PALEMBANG').toUpperCase()} — ${outputs.tanggal || inputs.tanggal || 'TAHUN 2026'}`,
            bold: true,
            size: 22
          })
        ]
      }),
      // Page Break ke Halaman 2 (Daftar Isi)
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    // =========================================================================
    // HALAMAN 2: DAFTAR ISI OTOMATIS & ABSTRAK KAJIAN ILMIAH (BERDIRI SENDIRI)
    // =========================================================================
    bodyElements.push(
      kopTable,
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({ text: 'DAFTAR ISI', bold: true, underline: {}, size: 28 })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: 'Sistematika Laporan Pelaksanaan Tugas & Kajian Ilmiah Pekerjaan Sosial',
            italics: true,
            size: 20
          })
        ]
      })
    );

    const tocEntries = isSpecialMode
      ? [
          ['HALAMAN SAMPUL PENELITIAN (COVER)', '1'],
          ['DAFTAR ISI & ABSTRAK KAJIAN ILMIAH', '2'],
          ...(showJurnalIlmiah
            ? [['ABSTRAK EKSEKUTIF & KATA KUNCI (ABSTRACT & KEYWORDS)', '2']]
            : []),
          ['BAB I — A. LATAR BELAKANG PERMASALAHAN', '3'],
          ['BAB II — B. DASAR PELAKSANAAN & LANDASAN HUKUM', '3'],
          ['BAB III — C. TUJUAN KEGIATAN & TARGET CAPAIAN', '3'],
          ...(showJurnalIlmiah
            ? [
                ['   1. Tinjauan Pustaka & Landasan Teori Jurnal Ilmiah (Literature Review)', '3'],
                ['   2. Metodologi Kajian & Desain Intervensi Pekerjaan Sosial', '4']
              ]
            : []),
          ['BAB IV — D. PELAKSANAAN KEGIATAN & PROSEDUR INTERVENSI', '4'],
          ['BAB V — E. HASIL KEGIATAN & PEMBAHASAN ILMIAH', '4'],
          ['BAB VI — F. KENDALA LAPANGAN DAN TINDAK LANJUT', '5'],
          ['BAB VII — G. SIMPULAN DAN REKOMENDASI KEBIJAKAN', '5'],
          ...(showJurnalIlmiah
            ? [['DAFTAR PUSTAKA / REFERENSI JURNAL ILMIAH (APA STYLE)', '5']]
            : []),
          ['TABEL MATRIKS PELAKSANAAN KEGIATAN, HASIL, KENDALA, DAN SARAN', '6'],
          ['LAMPIRAN DOKUMENTASI VISUAL KEGIATAN', '7']
        ]
      : [
          ['HALAMAN SAMPUL PENELITIAN (COVER)', '1'],
          ['DAFTAR ISI & ABSTRAK KAJIAN ILMIAH', '2'],
          ['A. PENDAHULUAN (Umum, Maksud & Tujuan, Ruang Lingkup, Dasar)', '3'],
          ...(showJurnalIlmiah
            ? [['   5. Tinjauan Pustaka & Kajian Literatur Jurnal Ilmiah', '3']]
            : []),
          ['B. KEGIATAN YANG DILAKSANAKAN', '4'],
          ['C. HASIL YANG DICAPAI & PEMBAHASAN ILMIAH', '4'],
          ['D. SIMPULAN DAN SARAN', '5'],
          ...(showJurnalIlmiah
            ? [['E. DAFTAR PUSTAKA / REFERENSI JURNAL ILMIAH (APA STYLE)', '5']]
            : []),
          ['F. PENUTUP & PENGESAHAN', '5'],
          ['LAMPIRAN DOKUMENTASI VISUAL KEGIATAN', '6']
        ];

    tocEntries.forEach(([title, page]) => {
      bodyElements.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({
              text: `${title} `,
              bold: !title.startsWith('   '),
              size: 22
            }),
            new TextRun({
              text: `........................................................ Hal. ${page}`,
              size: 22
            })
          ]
        })
      );
    });

    // ABSTRAK KAJIAN ILMIAH & KATA KUNCI DI HALAMAN 2
    if (showJurnalIlmiah) {
      bodyElements.push(
        new Paragraph({
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: 'ABSTRAK KAJIAN ILMIAH (EXECUTIVE ABSTRACT)',
              bold: true,
              underline: {},
              size: 24
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            ...parseHtmlToTextRuns(
              outputs.khususAbstrak ||
                `Laporan kajian ilmiah dan pelaksanaan tugas ini mendokumentasikan praktik pekerjaan sosial pada ${inputs.kopUnitKerja || 'Sekolah Rakyat Terintegrasi 31 Palembang'} dengan fokus pada ${outputs.judul || inputs.judul}.`
            )
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({ text: 'Kata Kunci (Keywords): ', bold: true, size: 22 }),
            new TextRun({
              text:
                outputs.khususKataKunci ||
                'Pekerjaan Sosial, Pengasuhan Asrama, Sekolah Rakyat, Intervensi Sosial, Permensos No. 8 Tahun 2022',
              italics: true,
              size: 22
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({ text: 'Metodologi Kajian: ', bold: true, size: 22 }),
            new TextRun({
              text:
                inputs.metodologiPenelitian ||
                'Penelitian Tindakan Praktik Pekerjaan Sosial (Social Work Action Research) & Single-Subject Design (A-B)',
              size: 22
            })
          ]
        })
      );
    }

    // Page Break ke Halaman 3 (Isi Laporan Utama)
    bodyElements.push(
      new Paragraph({
        children: [new PageBreak()]
      })
    );
  }

  if (isSpecialMode) {
    bodyElements.push(
      kopTable,
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: 'LAPORAN KHUSUS PELAKSANAAN KEGIATAN', bold: true, size: 28 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: inputs.nomorSurat ? 80 : 180 },
        children: [
          new TextRun({ text: (outputs.judul || inputs.judul).toUpperCase(), bold: true, size: 26 })
        ]
      })
    );

    if (inputs.nomorSurat) {
      bodyElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [new TextRun({ text: `NOMOR: ${inputs.nomorSurat}`, size: 22 })]
        })
      );
    }

    // A. Latar Belakang
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 100 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'A. Latar Belakang\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususLatarBelakang || outputs.umum)
        ]
      })
    );

    // B. Dasar Pelaksanaan Kegiatan
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 80 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'B. Dasar Pelaksanaan Kegiatan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususDasarPelaksanaan || outputs.dasar)
        ]
      }),
      new Paragraph({
        spacing: { before: 60, after: 40 },
        indent: { left: 360 },
        children: [new TextRun({ text: '1. Landasan Hukum:', bold: true, size: 24 })]
      })
    );

    DASAR_HUKUM_LIST.forEach((item, idx) => {
      bodyElements.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 720 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })]
        })
      );
    });

    bodyElements.push(
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 360 },
        children: [new TextRun({ text: '2. Dasar Operasional Pelaksanaan:', bold: true, size: 24 })]
      })
    );

    dasarPelaksanaanItems.forEach((item, idx) => {
      bodyElements.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 720 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })]
        })
      );
    });

    // C. Tujuan Kegiatan (+ Tinjauan Pustaka & Metodologi Kajian Ilmiah jika aktif)
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 100 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'C. Tujuan Kegiatan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususTujuan || outputs.tujuan)
        ]
      })
    );

    if (showJurnalIlmiah) {
      bodyElements.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          indent: { left: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: '1. Tinjauan Pustaka & Landasan Teori Jurnal Ilmiah (Literature Review)\n',
              bold: true,
              size: 24
            }),
            ...parseHtmlToTextRuns(
              outputs.khususKajianTeori ||
                'Intervensi mengacu pada pendekatan Ecological Systems Theory (Bronfenbrenner) serta Strengths-Based Perspective dalam pekerjaan sosial (Saleebey, 2013).'
            )
          ]
        }),
        new Paragraph({
          spacing: { before: 60, after: 100 },
          indent: { left: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: '2. Metodologi Kajian & Desain Intervensi Pekerjaan Sosial\n',
              bold: true,
              size: 24
            }),
            ...parseHtmlToTextRuns(
              outputs.khususMetodologiIlmiah ||
                `Kajian ini menggunakan pendekatan ${inputs.metodologiPenelitian || 'Penelitian Tindakan Praktik Pekerjaan Sosial (Action Research) & Single-Subject Design (A-B)'}.`
            )
          ]
        })
      );
    }

    // D. Pelaksanaan Kegiatan
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 100 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'D. Pelaksanaan Kegiatan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususPelaksanaan || outputs.kegiatan)
        ]
      })
    );

    // E. Hasil Kegiatan (+ Pembahasan Ilmiah jika aktif)
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 100 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: showJurnalIlmiah ? 'E. Hasil Kegiatan dan Pembahasan Ilmiah\n' : 'E. Hasil Kegiatan\n',
            bold: true,
            size: 24
          }),
          ...parseHtmlToTextRuns(outputs.khususHasil || outputs.hasil)
        ]
      })
    );

    if (showJurnalIlmiah && outputs.khususPembahasanIlmiah) {
      bodyElements.push(
        new Paragraph({
          spacing: { before: 60, after: 100 },
          indent: { left: 360 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: 'Pembahasan Ilmiah (Evidence-Based Discussion):\n',
              bold: true,
              size: 24
            }),
            ...parseHtmlToTextRuns(outputs.khususPembahasanIlmiah)
          ]
        })
      );
    }

    // F. Kendala dan Tindak Lanjut
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: 'F. Kendala dan Tindak Lanjut', bold: true, size: 24 })]
      }),
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '1. Kendala Lapangan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(
            outputs.khususKendala ||
              `Terdapat dinamika adaptasi dan hambatan konsentrasi awal peserta didik terkait ${inputs.permasalahan}.`
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 100 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '2. Tindak Lanjut Penyelesaian\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(
            outputs.khususTindakLanjut ||
              `Melaksanakan tindak lanjut pendampingan terstruktur: ${inputs.solusi}.`
          )
        ]
      })
    );

    // G. Simpulan dan Saran
    bodyElements.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: 'G. Simpulan dan Saran', bold: true, size: 24 })]
      }),
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '1. Simpulan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususSimpulan || outputs.simpulan)
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '2. Saran\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.khususSaran || outputs.saran)
        ]
      })
    );

    // DAFTAR PUSTAKA / REFERENSI JURNAL ILMIAH (APA STYLE)
    if (showJurnalIlmiah && outputs.khususReferensi && outputs.khususReferensi.length > 0) {
      bodyElements.push(
        new Paragraph({
          spacing: { before: 140, after: 80 },
          children: [
            new TextRun({
              text: 'H. Daftar Pustaka / Referensi Jurnal Ilmiah (APA 7th Edition)',
              bold: true,
              size: 24
            })
          ]
        })
      );

      outputs.khususReferensi.forEach((ref, idx) => {
        bodyElements.push(
          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 720, hanging: 360 },
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: `[${idx + 1}] ${ref}`, size: 22 })]
          })
        );
      });
    }

    // TABEL PELAKSANAAN KEGIATAN (Tanggal Kegiatan | Nama Kegiatan | Hasil Kegiatan | Kendala | Saran)
    bodyElements.push(
      new Paragraph({
        spacing: { before: 160, after: 100 },
        children: [
          new TextRun({
            text: 'TABEL MATRIKS PELAKSANAAN KEGIATAN, HASIL, KENDALA, DAN SARAN',
            bold: true,
            size: 24
          })
        ]
      })
    );

    const cellBorder = {
      top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '000000' }
    };

    const tableRowsData =
      outputs.tabelKegiatan && outputs.tabelKegiatan.length > 0
        ? outputs.tabelKegiatan
        : [
            {
              id: '1',
              tanggal: outputs.tanggal || inputs.tanggal || '30 Juli 2026',
              namaKegiatan: outputs.judul || inputs.judul,
              hasilKegiatan: outputs.khususHasil || outputs.hasil,
              kendala: outputs.khususKendala || inputs.permasalahan,
              saran: outputs.khususSaran || outputs.saran
            }
          ];

    const activityTableRows: TableRow[] = [
      new TableRow({
        children: [
          { label: 'No', width: 6 },
          { label: 'Tanggal Kegiatan', width: 15 },
          { label: 'Nama Kegiatan', width: 21 },
          { label: 'Hasil Kegiatan', width: 22 },
          { label: 'Kendala', width: 18 },
          { label: 'Saran', width: 18 }
        ].map(
          (col) =>
            new TableCell({
              width: { size: col.width, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: col.label, bold: true, size: 20 })]
                })
              ]
            })
        )
      }),
      ...tableRowsData.map(
        (row, idx) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 6, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `${idx + 1}.`, size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.tanggal || '-', size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 21, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.namaKegiatan || '-', bold: true, size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 22, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.hasilKegiatan || '-', size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 18, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.kendala || '-', size: 20 })]
                  })
                ]
              }),
              new TableCell({
                width: { size: 18, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: row.saran || '-', size: 20 })]
                  })
                ]
              })
            ]
          })
      )
    ];

    bodyElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: activityTableRows
      }),
      new Paragraph({
        spacing: { before: 160, after: 180 },
        alignment: AlignmentType.JUSTIFIED,
        children: [...parseHtmlToTextRuns(outputs.penutup)]
      })
    );
  } else {
    // FORMAT STANDAR
    bodyElements.push(kopTable);

    // Judul
    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: 'LAPORAN TENTANG', bold: true, size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: inputs.nomorSurat ? 80 : 180 },
        children: [
          new TextRun({ text: (outputs.judul || inputs.judul).toUpperCase(), bold: true, size: 26 }),
        ],
      })
    );

    if (inputs.nomorSurat) {
      bodyElements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({ text: `NOMOR: ${inputs.nomorSurat}`, size: 22 }),
          ],
        })
      );
    }

    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
        children: [
          new TextRun({ text: 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG', bold: true, size: 24 }),
        ],
      }),
      // A. Pendahuluan
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: 'A. Pendahuluan', bold: true, size: 24 })],
      }),
      // 1. Umum
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '1. Umum\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.umum),
        ],
      }),
      // 2. Maksud dan Tujuan
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: '2. Maksud dan Tujuan', bold: true, size: 24 })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 720 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'a. Maksud\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.maksud),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 720 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'b. Tujuan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.tujuan),
        ],
      }),
      // 3. Ruang Lingkup
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '3. Ruang Lingkup\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.ruang),
        ],
      }),
      // 4. Dasar
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '4. Dasar\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.dasar),
        ],
      }),
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 360 },
        children: [new TextRun({ text: 'DASAR HUKUM:', bold: true, size: 24 })],
      })
    );

    // List Dasar Hukum
    DASAR_HUKUM_LIST.forEach((item, idx) => {
      bodyElements.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 720 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })],
        })
      );
    });

    bodyElements.push(
      new Paragraph({
        spacing: { before: 100, after: 40 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: 'Dasar Pelaksanaan:\n', bold: true, size: 24 }),
          new TextRun({ text: 'Pelaksanaan kegiatan mengacu pada:', size: 24 }),
        ],
      })
    );

    dasarPelaksanaanItems.forEach((item, idx) => {
      bodyElements.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 720 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })],
        })
      );
    });

    // B. Kegiatan Yang Dilaksanakan
    bodyElements.push(
      new Paragraph({
        spacing: { before: 160, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'B. Kegiatan Yang Dilaksanakan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.kegiatan),
        ],
      }),
      // C. Hasil Yang Dicapai
      new Paragraph({
        spacing: { before: 160, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'C. Hasil Yang Dicapai\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.hasil),
        ],
      }),
      // D. Simpulan dan Saran
      new Paragraph({
        spacing: { before: 160, after: 60 },
        children: [new TextRun({ text: 'D. Simpulan dan Saran', bold: true, size: 24 })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '1. Simpulan\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.simpulan),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        indent: { left: 360 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: '2. Saran\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.saran),
        ],
      }),
      // E. Rekomendasi
      new Paragraph({
        spacing: { before: 160, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'E. Rekomendasi\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(
            outputs.rekomendasi ||
            '1. Pendampingan berkala oleh Wali Asuh.\n2. Evaluasi perkembangan perilaku peserta didik secara berkelanjutan.'
          ),
        ],
      }),
      // F. Penutup
      new Paragraph({
        spacing: { before: 160, after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'F. Penutup\n', bold: true, size: 24 }),
          ...parseHtmlToTextRuns(outputs.penutup),
        ],
      })
    );
  }

  // 4. Signature Section
  const signatureCellChildren: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({ text: `Dibuat di       : ${outputs.tempat || inputs.tempat}`, size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `Pada Tanggal : ${outputs.tanggal || inputs.tanggal}`, size: 24 }),
      ],
    }),
  ];

  const sigImages: ImageRun[] = [];
  if (qrBuffer) {
    sigImages.push(
      new ImageRun({
        data: qrBuffer,
        transformation: { width: 55, height: 55 },
        type: getImageType(inputs.qrCodeSrc),
      })
    );
  }
  if (ttdBuffer) {
    sigImages.push(
      new ImageRun({
        data: ttdBuffer,
        transformation: { width: 100, height: 45 },
        type: getImageType(inputs.ttdSrc),
      })
    );
  }

  if (sigImages.length > 0) {
    signatureCellChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 80 },
        children: sigImages,
      })
    );
  } else {
    signatureCellChildren.push(
      new Paragraph({
        spacing: { before: 400, after: 400 },
        children: [new TextRun({ text: ' ', size: 24 })],
      })
    );
  }

  signatureCellChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: outputs.nama || inputs.nama,
          bold: true,
          underline: {},
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `NIP. ${outputs.nip || inputs.nip}`,
          size: 24,
        }),
      ],
    })
  );

  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: signatureCellChildren,
          }),
        ],
      }),
    ],
  });

  // 5. Lampiran Dokumentasi Table (if any photo exists)
  const docElements: (Paragraph | Table)[] = [];

  if (foto1Buffer || foto2Buffer) {
    docElements.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 200 },
        children: [
          new TextRun({ text: 'LAMPIRAN DOKUMENTASI KEGIATAN', bold: true, size: 26 }),
        ],
      })
    );

    const photoRows: TableRow[] = [];

    if (foto1Buffer) {
      photoRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 80 },
                  children: [
                    new ImageRun({
                      data: foto1Buffer,
                      transformation: { width: 340, height: 220 },
                      type: getImageType(inputs.foto1Src),
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 120 },
                  children: [
                    new TextRun({
                      text: inputs.foto1Caption || 'Foto 1. Pelaksanaan Kegiatan',
                      italics: true,
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    if (foto2Buffer) {
      photoRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 80 },
                  children: [
                    new ImageRun({
                      data: foto2Buffer,
                      transformation: { width: 340, height: 220 },
                      type: getImageType(inputs.foto2Src),
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 120 },
                  children: [
                    new TextRun({
                      text: inputs.foto2Caption || 'Foto 2. Kondisi Lapangan',
                      italics: true,
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    docElements.push(
      new Table({
        width: { size: 85, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: photoRows,
      })
    );
  }

  // 6. Footer (Page numbers)
  // Resolve clean font family name for Word (Permensos No. 8 Tahun 2022 default: Arial)
  const rawFont = (inputs.fontIsi || 'Arial, sans-serif').split(',')[0].replace(/['"]/g, '').trim();
  const docxFontName = rawFont || 'Arial';

  // Convert CSS font size (e.g. "12pt") to Word half-points (12pt = 24)
  const parsedPt = parseFloat((inputs.sizeIsi || '12pt').replace(/[^0-9.]/g, ''));
  const docxFontSizeHalfPt = !isNaN(parsedPt) && parsedPt > 0 ? Math.round(parsedPt * 2) : 24;

  // Convert CSS margin (e.g. "2cm", "2.5cm", "3cm", "25mm") to Word twips (1 cm = 567 twips, 1 mm = 56.7 twips)
  const parseMarginToTwips = (val: string | undefined, fallbackCm: number): number => {
    if (!val) return Math.round(fallbackCm * 567);
    const trimmed = val.trim().toLowerCase();
    const num = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) return Math.round(fallbackCm * 567);
    if (trimmed.endsWith('mm')) return Math.round(num * 56.7);
    return Math.round(num * 567);
  };

  // Permensos RI No. 8 Tahun 2022 Default Margins: Top 2cm (1134), Bottom 2.5cm (1418), Left 3cm (1701), Right 2cm (1134)
  const marginTopTwips = parseMarginToTwips(inputs.marginTop, 2.0);
  const marginBottomTwips = parseMarginToTwips(inputs.marginBottom, 2.5);
  const marginLeftTwips = parseMarginToTwips(inputs.marginLeft, 3.0);
  const marginRightTwips = parseMarginToTwips(inputs.marginRight, 2.0);

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: '- ', size: 20, font: docxFontName }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            font: docxFontName,
          }),
          new TextRun({ text: ' -', size: 20, font: docxFontName }),
        ],
      }),
    ],
  });

  // 7. Assemble Document (Sesuai Permensos RI Nomor 8 Tahun 2022)
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: docxFontName,
            size: docxFontSizeHalfPt, // Default 24 = 12pt
            color: '000000',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginTopTwips,       // Default 2 cm (1134 twips)
              bottom: marginBottomTwips, // Default 2.5 cm (1418 twips)
              left: marginLeftTwips,     // Default 3 cm (1701 twips)
              right: marginRightTwips,   // Default 2 cm (1134 twips)
            },
          },
        },
        footers: inputs.tampilkanNomorHalaman ? { default: footer } : undefined,
        children: [
          ...bodyElements,
          signatureTable,
          ...docElements,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = getSkpFileName(inputs, outputs);
  return { blob, filename };
}

/**
 * Generate automatic SKP filename format: SKP_[Bulan_Tahun]_[Tanggal]_[RHK]_[Nama].docx
 */
export function getSkpFileName(inputs: ReportInputs, outputs: ReportOutputs): string {
  // Determine Month and Year from tanggalPicker or outputs.tanggal
  let monthYear = '';
  if (inputs.tanggalPicker) {
    const d = new Date(inputs.tanggalPicker);
    if (!isNaN(d.getTime())) {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      monthYear = `${months[d.getMonth()]}_${d.getFullYear()}`;
    }
  }

  if (!monthYear) {
    monthYear = 'Bulan_Ini';
  }

  // Clean Tanggal
  const rawTanggal = outputs.tanggal || inputs.tanggal || inputs.tanggalPicker || 'Tanggal';
  const cleanTanggal = rawTanggal
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '_')
    .replace(/_+/g, '_');

  // Clean RHK
  const rawRhk = (inputs.rhk || '1').toString().trim();
  const cleanRhk = `RHK_${rawRhk.replace(/[^a-zA-Z0-9-]/g, '_')}`;

  // Clean Nama
  const rawNama = (inputs.nama || '').trim();
  const cleanNama = rawNama ? `_${rawNama.replace(/[^a-zA-Z0-9-]/g, '_')}` : '';

  return `SKP_${monthYear}_Tgl_${cleanTanggal}_${cleanRhk}${cleanNama}.docx`;
}

/**
 * Generate & Save Blob locally
 */
export async function exportReportToDocx(inputs: ReportInputs, outputs: ReportOutputs): Promise<string> {
  const { blob, filename } = await generateDocxBlob(inputs, outputs);
  saveAs(blob, filename);
  return filename;
}

