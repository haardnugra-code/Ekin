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
  const logoBuffer = await getImageBuffer(inputs.logoSrc);
  const qrBuffer = await getImageBuffer(inputs.qrCodeSrc);
  const ttdBuffer = await getImageBuffer(inputs.ttdSrc);
  const foto1Buffer = await getImageBuffer(inputs.foto1Src);
  const foto2Buffer = await getImageBuffer(inputs.foto2Src);

  // 2. Kop Surat Table
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

  const kopTextCell = new TableCell({
    width: { size: logoBuffer ? 82 : 100, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'KEMENTERIAN SOSIAL REPUBLIK INDONESIA', bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'SEKRETARIAT JENDERAL', bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI', bold: true, size: 20 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG', bold: true, size: 24 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com',
            size: 15,
          }),
        ],
      }),
    ],
  });

  const kopTableCells = logoBuffer
    ? [
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: { width: 75, height: 75 },
                  type: getImageType(inputs.logoSrc),
                }),
              ],
            }),
          ],
        }),
        kopTextCell,
      ]
    : [kopTextCell];

  const kopTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      bottom: { style: BorderStyle.DOUBLE, size: 24, color: '000000' },
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: kopTableCells,
      }),
    ],
  });

  // 3. Body Content
  const bodyParagraphs: Paragraph[] = [];

  // Judul
  bodyParagraphs.push(
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
    bodyParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({ text: `NOMOR: ${inputs.nomorSurat}`, size: 22 }),
        ],
      })
    );
  }

  bodyParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({ text: 'SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG', bold: true, size: 24 }),
      ],
    })
  );

  // A. Pendahuluan
  bodyParagraphs.push(
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
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 720 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })],
      })
    );
  });

  bodyParagraphs.push(
    new Paragraph({
      spacing: { before: 100, after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: 'Dasar Pelaksanaan:\n', bold: true, size: 24 }),
        new TextRun({ text: 'Pelaksanaan kegiatan mengacu pada:', size: 24 }),
      ],
    })
  );

  // List Dasar Pelaksanaan
  DASAR_PELAKSANAAN_LIST.forEach((item, idx) => {
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 720 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 24 })],
      })
    );
  });

  // B. Kegiatan Yang Dilaksanakan
  bodyParagraphs.push(
    new Paragraph({
      spacing: { before: 160, after: 120 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'B. Kegiatan Yang Dilaksanakan\n', bold: true, size: 24 }),
        ...parseHtmlToTextRuns(outputs.kegiatan),
      ],
    })
  );

  // C. Hasil Yang Dicapai
  bodyParagraphs.push(
    new Paragraph({
      spacing: { before: 160, after: 120 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'C. Hasil Yang Dicapai\n', bold: true, size: 24 }),
        ...parseHtmlToTextRuns(outputs.hasil),
      ],
    })
  );

  // D. Simpulan dan Saran
  bodyParagraphs.push(
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
    })
  );

  // E. Rekomendasi
  bodyParagraphs.push(
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
    })
  );

  // F. Penutup
  bodyParagraphs.push(
    new Paragraph({
      spacing: { before: 160, after: 200 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'F. Penutup\n', bold: true, size: 24 }),
        ...parseHtmlToTextRuns(outputs.penutup),
      ],
    })
  );

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
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: '- ', size: 20 }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
          }),
          new TextRun({ text: ' -', size: 20 }),
        ],
      }),
    ],
  });

  // 7. Assemble Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
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
              top: 1134, // ~2 cm
              bottom: 1134,
              left: 1417, // ~2.5 cm
              right: 1417,
            },
          },
        },
        footers: inputs.tampilkanNomorHalaman ? { default: footer } : undefined,
        children: [
          kopTable,
          ...bodyParagraphs,
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

