import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { ArchiveItem } from '../types';

interface EditArchiveModalProps {
  item: ArchiveItem | null;
  onClose: () => void;
  onSave: (updatedItem: ArchiveItem) => void;
}

export const EditArchiveModal: React.FC<EditArchiveModalProps> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState<ArchiveItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!item || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto font-sans tracking-tight">
        <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 leading-tight">Edit Data Arsip Laporan</h3>
              <p className="text-xs text-gray-500 font-medium">Ubah isi, data penandatangan, atau format spasi arsip ini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Judul Laporan</label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Tempat / Kota</label>
              <input
                type="text"
                value={formData.tempat}
                onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">Tanggal (Terbilang)</label>
              <input
                type="text"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Nama Penandatangan</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">NIP</label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Permasalahan</label>
            <textarea
              rows={3}
              value={formData.permasalahan}
              onChange={(e) => setFormData({ ...formData, permasalahan: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Solusi / Intervensi Peksos</label>
            <textarea
              rows={3}
              value={formData.solusi}
              onChange={(e) => setFormData({ ...formData, solusi: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Rekomendasi Laporan / Catatan Peksos</label>
            <textarea
              rows={3}
              value={formData.rekomendasi || ''}
              onChange={(e) => setFormData({ ...formData, rekomendasi: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Catatan rekomendasi laporan..."
            />
          </div>

          <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl space-y-2.5">
            <span className="font-bold text-gray-800 uppercase text-[10px] tracking-widest block">Pengaturan Tipografi & Spasi Arsip Ini</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Font Judul</label>
                <select
                  value={formData.fontJudul}
                  onChange={(e) => setFormData({ ...formData, fontJudul: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Ukuran Judul</label>
                <select
                  value={formData.sizeJudul}
                  onChange={(e) => setFormData({ ...formData, sizeJudul: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="14pt">14pt</option>
                  <option value="16pt">16pt</option>
                  <option value="18pt">18pt</option>
                  <option value="20pt">20pt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Font Paragraf / Isi</label>
                <select
                  value={formData.fontIsi}
                  onChange={(e) => setFormData({ ...formData, fontIsi: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Ukuran Paragraf</label>
                <select
                  value={formData.sizeIsi}
                  onChange={(e) => setFormData({ ...formData, sizeIsi: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                  <option value="14pt">14pt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Spasi Baris (Line Height)</label>
                <select
                  value={formData.lineHeight}
                  onChange={(e) => setFormData({ ...formData, lineHeight: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="1.15">1.15 (Rapat)</option>
                  <option value="1.3">1.3 (Sedang)</option>
                  <option value="1.5">1.5 (Standar)</option>
                  <option value="1.75">1.75 (Renggang)</option>
                  <option value="2.0">2.0 (Ganda)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5 font-medium">Jarak Poin / Paragraf</label>
                <select
                  value={formData.paragraphSpacing}
                  onChange={(e) => setFormData({ ...formData, paragraphSpacing: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="0.25rem">Sangat Rapat</option>
                  <option value="0.375rem">Rapat</option>
                  <option value="0.5rem">Standar (0.5rem)</option>
                  <option value="0.75rem">Renggang</option>
                  <option value="1rem">Luas (1.0rem)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/80 p-4 -mx-6 -mb-6 border-t border-gray-100 flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs text-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan Arsip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
