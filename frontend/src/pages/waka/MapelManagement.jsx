import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, Check, ExternalLink, Search, Filter, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/services/api';

export const MapelManagement = () => {
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [tipeFilter, setTipeFilter] = useState('all');

    // Form State untuk Tambah Mapel Baru
    const [newMapelNama, setNewMapelNama] = useState('');
    const [newMapelKode, setNewMapelKode] = useState('');
    const [newMapelTipe, setNewMapelTipe] = useState('wajib');
    const [newMapelKelas, setNewMapelKelas] = useState('10');
    const [newMapelJurusan, setNewMapelJurusan] = useState('UMUM');

    // State untuk Popup Detail & Edit Mapel
    const [selectedMapel, setSelectedMapel] = useState(null);
    const [editNama, setEditNama] = useState('');
    const [editKode, setEditKode] = useState('');
    const [editTipe, setEditTipe] = useState('wajib');
    const [editKelas, setEditKelas] = useState('10');
    const [editJurusan, setEditJurusan] = useState('UMUM');

    // Notification State
    const [successMsg, setSuccessMsg] = useState('');

    // Fetch Mapel dari API Backend
    const loadMapel = async () => {
        try {
            const data = await apiFetch('/mapel');
            setMapelList(data);
        } catch (err) {
            console.error('Gagal mengambil data mapel:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMapel();
    }, []);

    const handleAddMapel = async (e) => {
        e.preventDefault();
        if (!newMapelNama || !newMapelKode) return;

        try {
            const res = await apiFetch('/mapel', {
                method: 'POST',
                body: JSON.stringify({
                    nama_mapel: newMapelNama,
                    kode_mapel: newMapelKode.toUpperCase(),
                    tingkat_kelas: newMapelKelas,
                    jurusan: newMapelJurusan,
                    tipe_mapel: newMapelTipe
                })
            });

            setSuccessMsg(`Mata Pelajaran "${newMapelNama}" berhasil ditambahkan!`);
            setNewMapelNama('');
            setNewMapelKode('');
            setNewMapelTipe('wajib');
            loadMapel();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert(`Gagal menambah mapel: ${err.message}`);
        }
    };

    const handleDeleteMapel = async (id, nama) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus Mata Pelajaran "${nama}"?`)) {
            try {
                await apiFetch(`/mapel/${id}`, { method: 'DELETE' });
                setSuccessMsg(`Mata Pelajaran "${nama}" berhasil dihapus.`);
                setMapelList(mapelList.filter(m => m.id !== id));
                setTimeout(() => setSuccessMsg(''), 4000);
            } catch (err) {
                alert(`Gagal menghapus mapel: ${err.message}`);
            }
        }
    };

    const handleOpenEditModal = (mapel) => {
        setSelectedMapel(mapel);
        setEditNama(mapel.nama_mapel);
        setEditKode(mapel.kode_mapel);
        setEditTipe(mapel.tipe_mapel);
        setEditKelas(mapel.tingkat_kelas || '10');
        setEditJurusan(mapel.jurusan || 'UMUM');
    };

    const handleSaveEditMapel = async (e) => {
        e.preventDefault();
        if (!editNama || !editKode || !selectedMapel) return;

        try {
            const res = await apiFetch(`/mapel/${selectedMapel.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nama_mapel: editNama,
                    kode_mapel: editKode.toUpperCase(),
                    tingkat_kelas: editKelas,
                    jurusan: editJurusan,
                    tipe_mapel: editTipe
                })
            });

            setSelectedMapel(null);
            setSuccessMsg(`Perubahan Mata Pelajaran "${editNama}" berhasil disimpan!`);
            loadMapel();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert(`Gagal menyimpan perubahan: ${err.message}`);
        }
    };

    // Filter Logic
    const filteredMapel = mapelList.filter(m => {
        const matchesSearch = (m.nama_mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.kode_mapel || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTipe = tipeFilter === 'all' || m.tipe_mapel === tipeFilter;
        return matchesSearch && matchesTipe;
    });

    const resetFilters = () => {
        setSearchQuery('');
        setTipeFilter('all');
    };

    return (
        <div className="space-y-6">
            {/* Notification Success Toast */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        {successMsg}
                    </div>
                    <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Container Kelola Mapel */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Kelola Mata Pelajaran (Mapel)</h2>
                        <p className="text-xs text-slate-500">Tambah, cari, filter, ubah (edit via popup), dan hapus mata pelajaran Wajib & Peminatan</p>
                    </div>
                </div>

                {/* Form Tambah Mapel Baru */}
                <form onSubmit={handleAddMapel} className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input
                        type="text"
                        placeholder="Nama Mapel (misal: Biologi)"
                        value={newMapelNama}
                        onChange={e => setNewMapelNama(e.target.value)}
                        className="flex-1 min-w-[200px] px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Kode (misal: BIO-10)"
                        value={newMapelKode}
                        onChange={e => setNewMapelKode(e.target.value)}
                        className="w-36 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono uppercase"
                        required
                    />
                    <select
                        value={newMapelKelas}
                        onChange={e => setNewMapelKelas(e.target.value)}
                        className="w-28 px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                    >
                        <option value="10">Kelas 10</option>
                        <option value="11">Kelas 11</option>
                        <option value="12">Kelas 12</option>
                        <option value="semua">Semua</option>
                    </select>
                    <select
                        value={newMapelJurusan}
                        onChange={e => setNewMapelJurusan(e.target.value)}
                        className="w-28 px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                    >
                        <option value="UMUM">UMUM</option>
                        <option value="IPA">IPA</option>
                        <option value="IPS">IPS</option>
                    </select>
                    <select
                        value={newMapelTipe}
                        onChange={e => setNewMapelTipe(e.target.value)}
                        className="w-36 px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                    >
                        <option value="wajib">📘 Wajib</option>
                        <option value="peminatan">🔬 Peminatan</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
                        <Plus className="w-4 h-4" /> Tambah Mapel
                    </button>
                </form>

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    {/* Search Input */}
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau kode mapel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Tipe */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                        <select
                            value={tipeFilter}
                            onChange={(e) => setTipeFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                            <option value="all">Semua Kategori Kurikulum</option>
                            <option value="wajib">📘 Kategori Wajib</option>
                            <option value="peminatan">🔬 Kategori Peminatan</option>
                        </select>
                    </div>
                </div>

                {/* Filter info indicator */}
                {(searchQuery || tipeFilter !== 'all') && (
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-600">
                        <span>Menampilkan <strong>{filteredMapel.length}</strong> dari <strong>{mapelList.length}</strong> mata pelajaran</span>
                        <button onClick={resetFilters} className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                            <RotateCcw className="w-3 h-3" /> Reset Filter
                        </button>
                    </div>
                )}

                {/* Tabel Daftar Mapel */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">ID</th>
                                <th className="p-3.5">Nama Mata Pelajaran</th>
                                <th className="p-3.5">Kode</th>
                                <th className="p-3.5">Kelas & Jurusan</th>
                                <th className="p-3.5">Kategori</th>
                                <th className="p-3.5 text-right">Aksi Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredMapel.length > 0 ? (
                                filteredMapel.map((m) => (
                                    <tr key={m.id} className="hover:bg-indigo-50/30 transition">
                                        <td className="p-3.5 font-mono text-xs text-slate-500">#{m.id}</td>
                                        <td className="p-3.5 font-semibold text-slate-800">
                                            <button
                                                onClick={() => handleOpenEditModal(m)}
                                                className="font-semibold text-indigo-600 hover:text-indigo-900 hover:underline text-left inline-flex items-center gap-1.5 group"
                                            >
                                                {m.nama_mapel}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </td>
                                        <td className="p-3.5"><span className="px-2.5 py-1 bg-slate-100 font-mono text-xs rounded font-bold text-slate-700">{m.kode_mapel}</span></td>
                                        <td className="p-3.5 text-xs text-slate-600 font-medium">Kelas {m.tingkat_kelas} ({m.jurusan})</td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                                                m.tipe_mapel === 'peminatan' 
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                                {m.tipe_mapel === 'peminatan' ? '🔬 Peminatan' : '📘 Wajib'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenEditModal(m)}
                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMapel(m.id, m.nama_mapel)}
                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                                        Tidak ada mata pelajaran yang cocok dengan kriteria pencarian/filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup Detail & Edit Mapel Modal */}
            {selectedMapel && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-in fade-in zoom-in duration-200">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">Detail & Edit Mata Pelajaran</h3>
                                    <p className="text-[11px] text-slate-500">ID Mapel: #{selectedMapel.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMapel(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Edit Mapel */}
                        <form onSubmit={handleSaveEditMapel} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                                <input
                                    type="text"
                                    required
                                    value={editNama}
                                    onChange={(e) => setEditNama(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Mapel</label>
                                <input
                                    type="text"
                                    required
                                    value={editKode}
                                    onChange={(e) => setEditKode(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono uppercase font-bold text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori / Tipe Kurikulum</label>
                                <select
                                    value={editTipe}
                                    onChange={(e) => setEditTipe(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="wajib">📘 Wajib</option>
                                    <option value="peminatan">🔬 Peminatan</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMapel(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Check className="w-4 h-4" /> Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
