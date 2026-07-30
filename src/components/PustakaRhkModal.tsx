import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  X,
  Zap,
  Check,
  Plus,
  Trash2,
  Sparkles,
  BookMarked,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Download,
  Upload,
  BookmarkPlus,
  Save,
  FolderPlus
} from 'lucide-react';
import { RHK_DATA, DAILY_PRESETS } from '../data/presets';
import { CustomRhkTemplate } from '../types';

interface PustakaRhkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: {
    rhk: string;
    judul: string;
    permasalahan: string;
    solusi: string;
    skenario?: string;
    dailyPreset?: string;
  }) => void;
  currentInputs?: {
    rhk: string;
    judul: string;
    permasalahan: string;
    solusi: string;
  };
}

export const PustakaRhkModal: React.FC<PustakaRhkModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentInputs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTemplates, setCustomTemplates] = useState<CustomRhkTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('peksos_custom_rhk_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drawer / Form state for creating or editing custom template
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formTargetRhk, setFormTargetRhk] = useState<string>('1');
  const [formJudul, setFormJudul] = useState('');
  const [formPermasalahan, setFormPermasalahan] = useState('');
  const [formSolusi, setFormSolusi] = useState('');

  // Quick save from current inputs state
  const [showQuickSaveCurrent, setShowQuickSaveCurrent] = useState(false);
  const [quickSaveLabel, setQuickSaveLabel] = useState('');

  // Sync custom templates to localStorage & dispatch custom event
  useEffect(() => {
    try {
      localStorage.setItem('peksos_custom_rhk_templates', JSON.stringify(customTemplates));
      window.dispatchEvent(new CustomEvent('peksos_custom_rhk_updated'));
    } catch (e) {
      console.error('Gagal menyimpan template RHK kustom:', e);
    }
  }, [customTemplates]);

  // Reset form fields
  const resetForm = () => {
    setEditingTemplateId(null);
    setFormTargetRhk(currentInputs?.rhk || '1');
    setFormJudul('');
    setFormPermasalahan('');
    setFormSolusi('');
    setShowAddCustom(false);
  };

  // Open Form to Create New Custom Template from scratch
  const handleOpenCreateNew = () => {
    setEditingTemplateId(null);
    setFormTargetRhk('1');
    setFormJudul('');
    setFormPermasalahan('');
    setFormSolusi('');
    setShowAddCustom(true);
    setShowQuickSaveCurrent(false);
  };

  // Open Form to Edit existing Custom Template
  const handleOpenEdit = (item: {
    rawCustomId: string;
    rhkTarget: string;
    title: string;
    permasalahan: string;
    solusi: string;
  }) => {
    setEditingTemplateId(item.rawCustomId);
    setFormTargetRhk(item.rhkTarget || '1');
    setFormJudul(item.title);
    setFormPermasalahan(item.permasalahan);
    setFormSolusi(item.solusi);
    setShowAddCustom(true);
    setShowQuickSaveCurrent(false);
  };

  // Save (Create or Update) Custom Template
  const handleSaveCustomForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formPermasalahan.trim() || !formSolusi.trim()) {
      alert('Mohon lengkapi Nama Template, Permasalahan, dan Solusi.');
      return;
    }

    if (editingTemplateId) {
      // Update existing
      setCustomTemplates((prev) =>
        prev.map((item) =>
          item.id === editingTemplateId
            ? {
                ...item,
                targetRhk: formTargetRhk,
                judul: formJudul.trim(),
                permasalahan: formPermasalahan.trim(),
                solusi: formSolusi.trim()
              }
            : item
        )
      );
    } else {
      // Add new
      const newCustom: CustomRhkTemplate = {
        id: Date.now().toString(),
        targetRhk: formTargetRhk,
        judul: formJudul.trim(),
        permasalahan: formPermasalahan.trim(),
        solusi: formSolusi.trim(),
        createdAt: new Date().toISOString()
      };
      setCustomTemplates((prev) => [newCustom, ...prev]);
    }

    resetForm();
    setSelectedCategory('custom');
  };

  // Quick Save from current report inputs
  const handleSaveCurrentAsCustom = () => {
    if (!currentInputs || !currentInputs.permasalahan.trim()) return;

    const newCustom: CustomRhkTemplate = {
      id: Date.now().toString(),
      targetRhk: currentInputs.rhk || '1',
      judul: quickSaveLabel.trim() || currentInputs.judul || 'Template RHK Kustom Saya',
      permasalahan: currentInputs.permasalahan,
      solusi: currentInputs.solusi,
      createdAt: new Date().toISOString()
    };

    setCustomTemplates((prev) => [newCustom, ...prev]);
    setQuickSaveLabel('');
    setShowQuickSaveCurrent(false);
    setSelectedCategory('custom');
  };

  // Delete Custom Template
  const handleDeleteCustom = (rawId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus template kustom ini dari penyimpanan lokal?')) {
      setCustomTemplates((prev) => prev.filter((t) => t.id !== rawId));
    }
  };

  // Export Custom Templates as JSON File
  const handleExportJSON = () => {
    if (customTemplates.length === 0) {
      alert('Belum ada template kustom yang tersimpan untuk diexport.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customTemplates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `template-rhk-kustom-peksos-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Custom Templates from JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed)) {
          let addedCount = 0;
          const newTemplates = [...customTemplates];

          parsed.forEach((item) => {
            if (item && item.judul && item.permasalahan && item.solusi) {
              const id = item.id ? String(item.id) : Date.now().toString() + Math.random().toString().slice(2, 6);
              if (!newTemplates.some((t) => t.id === id)) {
                newTemplates.unshift({
                  id,
                  targetRhk: item.targetRhk || '1',
                  judul: item.judul,
                  permasalahan: item.permasalahan,
                  solusi: item.solusi,
                  createdAt: item.createdAt || new Date().toISOString()
                });
                addedCount++;
              }
            }
          });

          setCustomTemplates(newTemplates);
          setSelectedCategory('custom');
          alert(`Berhasil mengimpor ${addedCount} template RHK kustom!`);
        } else {
          alert('Format file JSON tidak valid. Harus berisi array template.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON template. Pastikan file valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Combine all items into a unified list
  const allItems = useMemo(() => {
    const list: Array<{
      id: string;
      rawCustomId?: string;
      categoryKey: string;
      categoryLabel: string;
      rhkTarget: string;
      title: string;
      permasalahan: string;
      solusi: string;
      isDailyPreset?: boolean;
      dailyPresetKey?: string;
      skenarioIndex?: string;
      isCustom?: boolean;
    }> = [];

    // 1. Add Daily Presets
    Object.entries(DAILY_PRESETS).forEach(([key, preset]) => {
      const rhkObj = RHK_DATA[preset.targetRhk];
      list.push({
        id: `preset-${key}`,
        categoryKey: 'daily',
        categoryLabel: '⚡ Presets Harian',
        rhkTarget: preset.targetRhk,
        title: preset.judul,
        permasalahan: preset.permasalahan,
        solusi: preset.solusi,
        isDailyPreset: true,
        dailyPresetKey: key,
        skenarioIndex: ''
      });
    });

    // 2. Add Standard RHK 1-5 Scenarios (100 total)
    Object.entries(RHK_DATA).forEach(([rhkKey, rhkObj]) => {
      rhkObj.scenarios.forEach((scenario, idx) => {
        list.push({
          id: `rhk-${rhkKey}-${idx}`,
          categoryKey: rhkKey,
          categoryLabel: `RHK ${rhkKey}: ${rhkObj.judul}`,
          rhkTarget: rhkKey,
          title: scenario.label,
          permasalahan: scenario.p,
          solusi: scenario.s,
          skenarioIndex: idx.toString()
        });
      });
    });

    // 3. Add Custom Templates
    customTemplates.forEach((item) => {
      list.push({
        id: `custom-${item.id}`,
        rawCustomId: item.id,
        categoryKey: 'custom',
        categoryLabel: '⭐ Template Kustom Saya',
        rhkTarget: item.targetRhk || '1',
        title: item.judul,
        permasalahan: item.permasalahan,
        solusi: item.solusi,
        isCustom: true
      });
    });

    return list;
  }, [customTemplates]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === item.categoryKey;

      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.permasalahan.toLowerCase().includes(q) ||
        item.solusi.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [allItems, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  const handleApply = (item: (typeof allItems)[0]) => {
    onSelectTemplate({
      rhk: item.rhkTarget,
      judul: item.isDailyPreset ? item.title : (RHK_DATA[item.rhkTarget]?.judul || item.title),
      permasalahan: item.permasalahan,
      solusi: item.solusi,
      skenario: item.skenarioIndex || '',
      dailyPreset: item.dailyPresetKey || ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <BookMarked className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Pustaka RHK & Template Kegiatan
                <span className="text-[10px] bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full font-medium">
                  100+ Template Standar
                </span>
              </h2>
              <p className="text-xs text-blue-200/80">
                Pilih skenario atau preset kegiatan e-Kinerja untuk otomatis mengisi data laporan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 space-y-3">
          <div className="flex flex-col md:flex-row gap-2.5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kata kunci (misal: shalat, autisme, kebersihan, CBT, disiplin)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Template Action Buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0 overflow-x-auto pb-0.5">
              <button
                onClick={handleOpenCreateNew}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                title="Buat template RHK kustom baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Template</span>
              </button>

              {currentInputs && currentInputs.permasalahan.trim() && (
                <button
                  onClick={() => {
                    setShowQuickSaveCurrent(!showQuickSaveCurrent);
                    setShowAddCustom(false);
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                  title="Simpan input laporan saat ini sebagai template kustom"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Simpan Teks Ini</span>
                </button>
              )}

              <button
                onClick={handleExportJSON}
                className="px-2.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                title="Export template kustom ke file JSON"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <label
                className="px-2.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                title="Import template kustom dari file JSON"
              >
                <Upload className="w-3.5 h-3.5 text-gray-600" />
                <span className="hidden sm:inline">Import</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Form Drawer: Create / Edit Custom Template Form */}
          {showAddCustom && (
            <form onSubmit={handleSaveCustomForm} className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {editingTemplateId ? 'Edit Template RHK Kustom' : 'Buat Template RHK Kustom Baru'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">Target RHK:</label>
                  <select
                    value={formTargetRhk}
                    onChange={(e) => setFormTargetRhk(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="1">RHK 1: Bimbingan & Pengajaran</option>
                    <option value="2">RHK 2: Kemandirian Peserta Didik</option>
                    <option value="3">RHK 3: Bimbingan Aspek Kehidupan</option>
                    <option value="4">RHK 4: Spiritual & Emosional</option>
                    <option value="5">RHK 5: Peserta Didik Berkebutuhan Khusus</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">Nama / Judul Template:</label>
                  <input
                    type="text"
                    placeholder="misal: Pendampingan Kebersihan Diri & Kamar Asrama"
                    value={formJudul}
                    onChange={(e) => setFormJudul(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">Permasalahan / Kendala:</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan uraian permasalahan atau kasus umum..."
                    value={formPermasalahan}
                    onChange={(e) => setFormPermasalahan(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">Solusi / Intervensi Sosial:</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan langkah penanganan, bimbingan, atau intervensi..."
                    value={formSolusi}
                    onChange={(e) => setFormSolusi(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingTemplateId ? 'Simpan Perubahan' : 'Simpan Template Kustom'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Drawer: Quick Save Current Report Inputs */}
          {showQuickSaveCurrent && currentInputs && (
            <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-2.5 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" /> Simpan Input Laporan Saat Ini Sebagai Template
                </span>
                <button
                  onClick={() => setShowQuickSaveCurrent(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama / Label Template (misal: Bimbingan Sholat Maghrib Asrama)"
                  value={quickSaveLabel}
                  onChange={(e) => setQuickSaveLabel(e.target.value)}
                  className="flex-1 text-xs p-2 bg-white border border-blue-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  onClick={handleSaveCurrentAsCustom}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
              <div className="text-[11px] text-blue-900 bg-white/80 p-2 rounded-xl border border-blue-200/60 space-y-1">
                <p className="font-semibold text-blue-950 truncate">Preview Permasalahan:</p>
                <p className="line-clamp-2 italic text-gray-700 leading-snug">{currentInputs.permasalahan}</p>
              </div>
            </div>
          )}

          {/* Category Badges / Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Semua ({allItems.length})
            </button>
            <button
              onClick={() => setSelectedCategory('daily')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1 ${
                selectedCategory === 'daily'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> Presets Harian (8)
            </button>
            <button
              onClick={() => setSelectedCategory('1')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === '1'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              RHK 1: Pengajaran (20)
            </button>
            <button
              onClick={() => setSelectedCategory('2')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === '2'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              RHK 2: Kemandirian (20)
            </button>
            <button
              onClick={() => setSelectedCategory('3')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === '3'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              RHK 3: Pembinaan (20)
            </button>
            <button
              onClick={() => setSelectedCategory('4')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === '4'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              RHK 4: Spiritual/Emosional (20)
            </button>
            <button
              onClick={() => setSelectedCategory('5')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                selectedCategory === '5'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              RHK 5: Berkebutuhan Khusus (20)
            </button>
            <button
              onClick={() => setSelectedCategory('custom')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1 ${
                selectedCategory === 'custom'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              ⭐ Kustom Saya ({customTemplates.length})
            </button>
          </div>
        </div>

        {/* Content List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gray-50/50">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-2xl border border-gray-200 p-6">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Tidak ada template RHK yang cocok</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {selectedCategory === 'custom'
                  ? 'Anda belum memiliki template kustom tersimpan. Klik "+ Buat Template" di atas untuk menambahkan pustaka personal Anda.'
                  : 'Coba gunakan kata kunci lain seperti "shalat", "belajar", "kebersihan", "CBT", atau bersihkan kolom pencarian.'}
              </p>
              {selectedCategory === 'custom' && (
                <button
                  onClick={handleOpenCreateNew}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Buat Template Kustom Pertama Anda
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  {/* Category & Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        item.isDailyPreset
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : item.isCustom
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {item.isDailyPreset ? '⚡ Preset Harian' : item.isCustom ? '⭐ Template Kustom' : `RHK ${item.rhkTarget}`}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 truncate max-w-md">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* Permasalahan & Solusi Snippets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 space-y-1">
                      <span className="font-bold text-red-900 block text-[10px] uppercase tracking-wider">
                        ⚠️ Permasalahan:
                      </span>
                      <p className="text-gray-700 leading-snug line-clamp-3 whitespace-pre-line">
                        {item.permasalahan}
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-900 block text-[10px] uppercase tracking-wider">
                        💡 Solusi / Intervensi:
                      </span>
                      <p className="text-gray-700 leading-snug line-clamp-3 whitespace-pre-line">
                        {item.solusi}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Apply Button & Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <button
                    onClick={() => handleApply(item)}
                    className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer group-hover:scale-102"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gunakan Template</span>
                  </button>

                  {item.isCustom && item.rawCustomId && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleOpenEdit({
                            rawCustomId: item.rawCustomId!,
                            rhkTarget: item.rhkTarget,
                            title: item.title,
                            permasalahan: item.permasalahan,
                            solusi: item.solusi
                          })
                        }
                        className="px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-blue-200"
                        title="Edit template kustom ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustom(item.rawCustomId!)}
                        className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                        title="Hapus template kustom ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Memilih template akan otomatis mengisi <b>RHK Target</b>, <b>Permasalahan</b>, dan <b>Solusi</b> di form laporan.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup Pustaka
          </button>
        </div>

      </div>
    </div>
  );
};
