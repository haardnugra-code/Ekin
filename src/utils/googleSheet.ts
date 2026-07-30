import { ReportInputs, ReportOutputs } from '../types';

export const DEFAULT_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbyeXGSdxgEsrapxabkj-ti2XXdx6g_Nu-9PG-c4iy52M3PQR14cMrIqCAOQFm6YFEfEjg/exec';

export async function saveToGoogleSheet(
  inputs: ReportInputs,
  outputs: ReportOutputs,
  customSheetUrl?: string
): Promise<{ success: boolean; message: string }> {
  const url = customSheetUrl || DEFAULT_SHEET_URL;

  const payload = {
    action: 'add_report',
    timestamp: new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    judul: outputs.judul || inputs.judul,
    tanggal: outputs.tanggal || inputs.tanggal,
    tempat: outputs.tempat || inputs.tempat,
    nama: outputs.nama || inputs.nama,
    nip: outputs.nip || inputs.nip,
    rhk: inputs.rhk,
    skenario: inputs.skenario,
    permasalahan: inputs.permasalahan,
    solusi: inputs.solusi,
    umum: outputs.umum,
    maksud: outputs.maksud,
    tujuan: outputs.tujuan,
    ruang: outputs.ruang,
    dasar: outputs.dasar,
    kegiatan: outputs.kegiatan,
    hasil: outputs.hasil,
    simpulan: outputs.simpulan,
    saran: outputs.saran,
    rekomendasi: outputs.rekomendasi,
    penutup: outputs.penutup,
    foto1Caption: inputs.foto1Caption,
    foto2Caption: inputs.foto2Caption
  };

  try {
    // We send a POST request to the Google Apps Script Web App.
    // Using 'text/plain' ensures CORS preflight is bypassed if the Apps Script accepts raw POST body.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      try {
        const json = await response.json();
        if (json.status === 'error') {
          return { success: false, message: json.message || 'Google Sheet mengembalikan status error.' };
        }
      } catch {
        // If Google Apps Script returns non-JSON or redirects
      }
      return { success: true, message: 'Laporan berhasil tersimpan di Google Sheet!' };
    }

    // Fallback mode 'no-cors' if standard fetch fails due to redirect/CORS constraints
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true, message: 'Laporan berhasil dikirim ke Google Sheet!' };
  } catch (err: any) {
    console.error('Error saving to Google Sheet:', err);
    
    // Attempt no-cors mode as secondary fallback
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return { success: true, message: 'Laporan berhasil dikirim ke Google Sheet!' };
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: 'Gagal menghubungkan ke Google Sheet: ' + (fallbackErr.message || 'Periksa koneksi internet')
      };
    }
  }
}
