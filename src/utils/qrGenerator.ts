import QRCode from 'qrcode';

export async function generateDigitalSignatureQr(nama: string, nip: string, tanggal: string): Promise<string> {
  const verificationText = `DOKUMEN DITANDATANGANI SECARA DIGITAL\nKementerian Sosial Republik Indonesia\nPusdiklatbangprof SRT 31 Palembang\n\nNama: ${nama || 'M Ardian Nugraha'}\nNIP: ${nip || '199202042026221001'}\nTanggal: ${tanggal || '30 Juli 2026'}\nStatus: VALID & TERVERIFIKASI SISTEM`;

  try {
    const dataUrl = await QRCode.toDataURL(verificationText, {
      width: 300,
      margin: 1,
      color: {
        dark: '#1e3a8a', // Deep navy blue
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
