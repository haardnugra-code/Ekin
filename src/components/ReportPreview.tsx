import React from 'react';
import { Camera } from 'lucide-react';
import { ReportInputs, ReportOutputs } from '../types';
import { DASAR_HUKUM_LIST, DASAR_PELAKSANAAN_LIST } from '../data/presets';
import { SekolahRakyatWatermark } from './SekolahRakyatWatermark';
import { DEFAULT_KEMENSOS_LOGO } from '../utils/kemensosLogo';

interface ReportPreviewProps {
  inputs: ReportInputs;
  outputs: ReportOutputs;
  setOutputs: React.Dispatch<React.SetStateAction<ReportOutputs>>;
  setInputs: React.Dispatch<React.SetStateAction<ReportInputs>>;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  inputs,
  outputs,
  setOutputs,
  setInputs
}) => {
  const handleContentEdit = (field: keyof ReportOutputs, value: string) => {
    setOutputs((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getPageNumberText = (pageIndex: number, totalPages: number) => {
    const format = inputs.formatNomorHalaman || '- {n} -';
    return format
      .replace('{n}', String(pageIndex))
      .replace('{total}', String(totalPages));
  };

  const hasPhotos = inputs.foto1Src || inputs.foto2Src;

  return (
    <div id="document-preview" className="space-y-8 print:space-y-0 relative w-full flex flex-col items-center">
      {/* HALAMAN 1: ISI LAPORAN */}
      <div
        className="a4-paper relative"
        style={{
          fontFamily: inputs.fontIsi,
          fontSize: inputs.sizeIsi
        }}
      >
        {/* WATERMARK BACKGROUND */}
        <SekolahRakyatWatermark
          show={inputs.showWatermark ?? true}
          opacity={inputs.watermarkOpacity ?? 0.18}
          type={inputs.watermarkType || 'kemensos'}
          customText={inputs.customWatermarkText}
          customImg={inputs.customWatermarkImg}
          width={inputs.watermarkWidth ?? 450}
          height={inputs.watermarkHeight ?? 'auto'}
          isSizePinned={inputs.pinWatermarkSize ?? true}
        />
        {/* KOP SURAT */}
        <div
          className="kop-surat avoid-break border-b-[4px] border-black pb-2.5 mb-3 flex items-center"
          style={{ borderBottomStyle: 'double' }}
        >
          {inputs.logoSrc ? (
            <div className="w-28 flex-shrink-0 pr-3 flex justify-center">
              <img
                id="out-logo"
                src={inputs.logoSrc}
                alt="Logo Kop Instansi"
                className="max-w-full h-auto max-h-20 object-contain"
              />
            </div>
          ) : null}
          <div className="flex-1 text-center">
            <h1 className="text-[1.05rem] uppercase leading-snug font-bold">KEMENTERIAN SOSIAL REPUBLIK INDONESIA</h1>
            <h2 className="text-[1.05rem] uppercase leading-snug font-bold">SEKRETARIAT JENDERAL</h2>
            <h2 className="text-[1.05rem] uppercase leading-snug font-bold">PUSAT PENDIDIKAN PELATIHAN DAN PENGEMBANGAN PROFESI</h2>
            <h2 className="text-[1.1rem] font-bold uppercase mt-0.5 leading-snug">SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG</h2>
            <p className="text-[0.78rem] mt-0.5 font-serif leading-tight">
              Jl. Komp. Sosial, Km. 5, Kel. Sukabangun, Kec. Sukarami, Kota Palembang, Prov. Sumatera Selatan, Kode Pos 30151, email: srt31palembang@gmail.com
            </p>
          </div>
        </div>

        {/* TITLE SECTION */}
        <div
          className="title-section avoid-break text-center font-bold mb-3"
          style={{
            fontFamily: inputs.fontJudul,
            fontSize: inputs.sizeJudul
          }}
        >
          <p className="uppercase m-0">LAPORAN TENTANG</p>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentEdit('judul', e.currentTarget.innerText)}
            className="uppercase m-0 leading-tight mt-0.5 mb-0.5 editable-text cursor-text"
          >
            {outputs.judul || inputs.judul}
          </p>
          {inputs.nomorSurat && (
            <p className="text-[0.85em] font-normal my-0.5 text-black tracking-wider">
              NOMOR: {inputs.nomorSurat}
            </p>
          )}
          <p className="uppercase m-0">SEKOLAH RAKYAT TERINTEGRASI 31 PALEMBANG</p>
        </div>

        {/* CONTENT SECTIONS */}
        <div
          className="laporan-content flex-1 relative"
          style={{
            fontSize: inputs.sizeIsi,
            lineHeight: inputs.lineHeight
          }}
        >
          <ol className="list-alpha font-bold pl-6 space-y-2">
            {/* A. Pendahuluan */}
            <li style={{ marginBottom: inputs.paragraphSpacing }}>
              Pendahuluan
              <ol className="list-num font-normal pl-6 mt-1 space-y-1">
                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>UMUM</strong>
                  <br />
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit('umum', e.currentTarget.innerText)}
                    className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                  >
                    {outputs.umum}
                  </span>
                </li>

                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>Maksud dan tujuan</strong>
                  <ol className="list-num-lower pl-6 mt-0.5 space-y-0.5">
                    <li style={{ marginBottom: inputs.paragraphSpacing }}>
                      <strong>Maksud</strong>
                      <br />
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentEdit('maksud', e.currentTarget.innerText)}
                        className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                      >
                        {outputs.maksud}
                      </span>
                    </li>
                    <li style={{ marginBottom: inputs.paragraphSpacing }}>
                      <strong>Tujuan</strong>
                      <br />
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentEdit('tujuan', e.currentTarget.innerText)}
                        className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                      >
                        {outputs.tujuan}
                      </span>
                    </li>
                  </ol>
                </li>

                <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>Ruang Lingkup</strong>
                  <br />
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit('ruang', e.currentTarget.innerText)}
                    className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                  >
                    {outputs.ruang}
                  </span>
                </li>

                {/* DASAR HUKUM */}
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>Dasar</strong>
                  <br />
                  <div className="editable-text block mt-1 text-justify font-serif">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentEdit('dasar', e.currentTarget.innerText)}
                      className="cursor-text"
                    >
                      {outputs.dasar}
                    </p>

                    <div className="mt-1.5 font-bold uppercase">DASAR HUKUM</div>
                    <ol className="list-num pl-5 mt-0.5 mb-1 space-y-0.5 font-normal leading-snug">
                      {DASAR_HUKUM_LIST.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>

                    <div className="font-bold mt-1">Dasar Pelaksanaan</div>
                    <div className="font-normal">Pelaksanaan kegiatan mengacu pada:</div>
                    <ol className="list-num pl-5 mt-0.5 space-y-0.5 font-normal leading-snug">
                      {DASAR_PELAKSANAAN_LIST.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </li>
              </ol>
            </li>

            {/* B. Kegiatan */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              Kegiatan yang dilaksanakan
              <br />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('kegiatan', e.currentTarget.innerText)}
                className="editable-text font-normal block mt-0.5 font-serif text-justify cursor-text"
              >
                {outputs.kegiatan}
              </span>
            </li>

            {/* C. Hasil */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              Hasil yang dicapai
              <br />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('hasil', e.currentTarget.innerText)}
                className="editable-text font-normal block mt-0.5 font-serif text-justify cursor-text"
              >
                {outputs.hasil}
              </span>
            </li>

            {/* D. Simpulan dan Saran */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              Simpulan dan Saran
              <ol className="list-num font-normal pl-6 mt-0.5 space-y-0.5">
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>Simpulan</strong>
                  <br />
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit('simpulan', e.currentTarget.innerText)}
                    className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                  >
                    {outputs.simpulan}
                  </span>
                </li>
                <li style={{ marginBottom: inputs.paragraphSpacing }}>
                  <strong>Saran</strong>
                  <br />
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit('saran', e.currentTarget.innerText)}
                    className="editable-text block mt-0.5 font-serif text-justify cursor-text"
                  >
                    {outputs.saran}
                  </span>
                </li>
              </ol>
            </li>

            {/* E. Rekomendasi */}
            <li className="avoid-break" style={{ marginBottom: inputs.paragraphSpacing }}>
              Rekomendasi Laporan
              <br />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('rekomendasi', e.currentTarget.innerText)}
                className="editable-text font-normal block mt-0.5 font-serif text-justify cursor-text whitespace-pre-line"
              >
                {outputs.rekomendasi || "1. Pendampingan berkala oleh Wali Asuh.\n2. Evaluasi perkembangan perilaku peserta didik secara berkelanjutan."}
              </span>
            </li>

            {/* F. Penutup + Tanda Tangan Wali Asuh */}
            <li className="avoid-break penutup-signature-group" style={{ marginBottom: inputs.paragraphSpacing }}>
              Penutup
              <br />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('penutup', e.currentTarget.innerText)}
                className="editable-text font-normal block mt-0.5 font-serif text-justify cursor-text"
              >
                {outputs.penutup}
              </span>

              {/* SIGNATURE SECTION */}
              <div className="signature-section avoid-break mt-3 flex justify-end pr-2 shrink-0 font-normal">
                <div className="flex flex-col items-start min-w-[14rem]">
                  <table className="text-[12pt] font-normal mb-0.5 font-serif">
                    <tbody>
                      <tr>
                        <td className="pr-2 whitespace-nowrap">Dibuat di</td>
                        <td className="pr-1">:</td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleContentEdit('tempat', e.currentTarget.innerText)}
                          className="cursor-text px-1"
                        >
                          {outputs.tempat || inputs.tempat}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-2 whitespace-nowrap">Pada Tanggal</td>
                        <td className="pr-1">:</td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleContentEdit('tanggal', e.currentTarget.innerText)}
                          className="cursor-text px-1"
                        >
                          {outputs.tanggal || inputs.tanggal}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* SIGNATURE IMAGES (DIGITAL / BASAH) - CLEAN & NO OVERLAP */}
                  <div className="min-h-16 my-2 flex items-center gap-3 overflow-hidden">
                    {/* QR Code Tanda Tangan Digital */}
                    {inputs.qrCodeSrc && (
                      <div className="flex items-center gap-2 p-1 bg-blue-50/40 rounded-lg border border-blue-100 shrink-0">
                        <img
                          src={inputs.qrCodeSrc}
                          alt="QR Code Tanda Tangan Digital"
                          className="w-14 h-14 object-contain border border-blue-200 p-0.5 rounded bg-white shadow-2xs"
                        />
                        <div className="flex flex-col text-left font-sans pr-1">
                          <span className="text-[7.5pt] font-bold text-blue-950 uppercase tracking-tight">Ditandatangani Digital</span>
                          <span className="text-[6.5pt] text-blue-800 font-bold">{inputs.nama || 'M Ardian Nugraha'}</span>
                          <span className="text-[6.5pt] text-gray-500 italic">Terverifikasi Sistem</span>
                        </div>
                      </div>
                    )}

                    {/* Tanda Tangan Basah */}
                    {inputs.ttdSrc && (
                      <div className="h-14 flex items-center justify-start overflow-hidden shrink-0">
                        <img
                          src={inputs.ttdSrc}
                          alt="Tanda Tangan Basah"
                          className="max-h-14 max-w-[9rem] mix-blend-multiply object-contain"
                        />
                      </div>
                    )}

                    {/* Placeholder jika belum ada tanda tangan/QR */}
                    {!inputs.qrCodeSrc && !inputs.ttdSrc && (
                      <div className="h-14 flex items-center text-gray-400 italic text-xs">
                        (Unggah Tanda Tangan / Gunakan QR Digital)
                      </div>
                    )}
                  </div>

                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEdit('nama', e.currentTarget.innerText)}
                    className="font-bold underline uppercase editable-text font-serif cursor-text text-left"
                  >
                    {outputs.nama || inputs.nama}
                  </div>
                  <div className="font-serif text-left">
                    NIP.{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentEdit('nip', e.currentTarget.innerText)}
                      className="editable-text cursor-text"
                    >
                      {outputs.nip || inputs.nip}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Page Footer / Page Number Halaman 1 */}
        {inputs.tampilkanNomorHalaman && (
          <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] font-serif text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setInputs((prev) => ({ ...prev, formatNomorHalaman: e.currentTarget.innerText }))}
              className="editable-text font-serif cursor-text font-medium"
            >
              {getPageNumberText(1, 2)}
            </span>
          </div>
        )}
      </div>

      {/* HALAMAN 2: LAMPIRAN DOKUMENTASI */}
      <div className="a4-paper page-break-before flex flex-col items-center relative">
        {/* WATERMARK BACKGROUND HALAMAN 2 (Hanya tampil jika hideWatermarkOnLampiran !== true) */}
        {!(inputs.hideWatermarkOnLampiran ?? true) && (
          <SekolahRakyatWatermark
            show={inputs.showWatermark ?? true}
            opacity={inputs.watermarkOpacity ?? 0.18}
            type={inputs.watermarkType || 'kemensos'}
            customText={inputs.customWatermarkText}
            customImg={inputs.customWatermarkImg}
            width={inputs.watermarkWidth ?? 450}
            height={inputs.watermarkHeight ?? 'auto'}
            isSizePinned={inputs.pinWatermarkSize ?? true}
          />
        )}
        <div className="text-center font-bold text-lg mb-6 uppercase w-full avoid-break font-serif">
          LAMPIRAN DOKUMENTASI
        </div>

        <div className="space-y-8 flex flex-col items-center justify-center w-full flex-grow">
          {inputs.foto1Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break">
              <img
                src={inputs.foto1Src}
                alt="Dokumentasi 1"
                className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm"
              />
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, foto1Caption: e.currentTarget.innerText }))}
                className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text"
              >
                {inputs.foto1Caption || "Foto 1. Pelaksanaan Kegiatan"}
              </p>
            </div>
          )}

          {inputs.foto2Src && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center avoid-break">
              <img
                src={inputs.foto2Src}
                alt="Dokumentasi 2"
                className="max-w-full max-h-80 object-contain border-[1px] border-gray-400 p-1 shadow-sm"
              />
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInputs((prev) => ({ ...prev, foto2Caption: e.currentTarget.innerText }))}
                className="text-sm mt-3 italic text-gray-800 font-serif font-bold cursor-text"
              >
                {inputs.foto2Caption || "Foto 2. Kondisi Lapangan"}
              </p>
            </div>
          )}

          {!hasPhotos && (
            <div className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 avoid-break rounded-xl">
              <p className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-400" /> Belum ada foto dokumentasi yang diunggah.
              </p>
            </div>
          )}
        </div>

        {/* Page Footer / Page Number Halaman 2 */}
        {inputs.tampilkanNomorHalaman && (
          <div className="mt-auto pt-6 w-full flex items-center justify-center text-[9pt] font-serif text-gray-500 print:text-black border-t border-gray-100 print:border-none avoid-break shrink-0">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setInputs((prev) => ({ ...prev, formatNomorHalaman: e.currentTarget.innerText }))}
              className="editable-text font-serif cursor-text font-medium"
            >
              {getPageNumberText(2, 2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
