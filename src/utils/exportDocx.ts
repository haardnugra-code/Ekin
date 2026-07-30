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

/**
 * Helper to convert Image Data URL or HTTP URL to Uint8Array for docx ImageRun
 */
async function getImageBuffer(url?: string): Promise<Uint8Array | null> {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  try {
    if (url.startsWith('data:')) {
      const parts = url.split(',');
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
      const response = await fetch(url);
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

export async function exportReportToDocx(inputs: ReportInputs, outputs: ReportOutputs) {
  // 1. Fetch / Convert images
  const logoBuffer = await getImageBuffer(inputs.logoSrc);
  const qrBuffer = await getImageBuffer(inputs.qrCodeSrc);
  const ttdBuffer = await getImageBuffer(inputs.ttdSrc);
  const foto1Buffer = await getImageBuffer(inputs.foto1Src);
  const foto2Buffer = await getImageBuffer(inputs.foto2Src);

  // 2. Kop Surat Table
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

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
        children: [
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: logoBuffer
              ? [
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
                ]
              : [],
          }),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
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
          }),
        ],
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
      children: [new TextRun({ text: 'LAPORAN', bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({ text: (outputs.judul || inputs.judul).toUpperCase(), bold: true, size: 26 }),
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
        new TextRun({ text: outputs.umum, size: 24 }),
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
        new TextRun({ text: outputs.maksud, size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 720 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: 'b. Tujuan\n', bold: true, size: 24 }),
        new TextRun({ text: outputs.tujuan, size: 24 }),
      ],
    }),
    // 3. Ruang Lingkup
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 360 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: '3. Ruang Lingkup\n', bold: true, size: 24 }),
        new TextRun({ text: outputs.ruang, size: 24 }),
      ],
    }),
    // 4. Dasar
    new Paragraph({
      spacing: { after: 80 },
      indent: { left: 360 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: '4. Dasar\n', bold: true, size: 24 }),
        new TextRun({ text: outputs.dasar, size: 24 }),
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
        new TextRun({ text: outputs.kegiatan, size: 24 }),
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
        new TextRun({ text: outputs.hasil, size: 24 }),
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
        new TextRun({ text: outputs.simpulan, size: 24 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 360 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ text: '2. Saran\n', bold: true, size: 24 }),
        new TextRun({ text: outputs.saran, size: 24 }),
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
        new TextRun({
          text:
            outputs.rekomendasi ||
            '1. Pendampingan berkala oleh Wali Asuh.\n2. Evaluasi perkembangan perilaku peserta didik secara berkelanjutan.',
          size: 24,
        }),
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
        new TextRun({ text: outputs.penutup, size: 24 }),
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

  // 8. Generate & Save Blob
  const blob = await Packer.toBlob(doc);
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Laporan_${sanitize(outputs.nama || inputs.nama)}_${sanitize(outputs.tanggal || inputs.tanggal)}.docx`;
  saveAs(blob, filename);
}
