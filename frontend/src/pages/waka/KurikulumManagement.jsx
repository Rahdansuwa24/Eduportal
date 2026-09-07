import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, X, Check, Search, Filter, Building, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/services/api';

export const KurikulumManagement = () => {
    const [kurikulumList, setKurikulumList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [hariFilter, setHariFilter] = useState('all');

    // Form State Tambah Jadwal Kurikulum Baru
    const [newMapelId, setNewMapelId] = useState('');
    const [newHari, setNewHari] = useState('Senin');
    const [newWaktuMulai, setNewWaktuMulai] = useState('07:30');
    const [newWaktuSelesai, setNewWaktuSelesai] = useState('09:00');
    const [newRuangan, setNewRuangan] = useState('Ruang 10 IPA 1');
    const [newTahunAjaran, setNewTahunAjaran] = useState('2026/2027');
    const [newSemester, setNewSemester] = useState('Ganjil');

    // Modal Edit State
    const [selectedKurikulum, setSelectedKurikulum] = useState(null);
    const [editMapelId, setEditMapelId] = useState('');
    const [editHari, setEditHari] = useState('Senin');
    const [editWaktuMulai, setEditWaktuMulai] = useState('07:30');
    const [editWaktuSelesai, setEditWaktuSelesai] = useState('09:00');
    const [editRuangan, setEditRuangan] = useState('');

    const [successMsg, setSuccessMsg] = useState('');

    // Fetch Real Data Kurikulum & Mapel dari Backend
    const loadData = async () => {
        try {
            const [kurikulumData, mapelData] = await Promise.all([
                apiFetch('/kurikulum'),
                apiFetch('/mapel')
            ]);
            setKurikulumList(kurikulumData);
            setMapelList(mapelData);
            if (mapelData.length > 0) {
                setNewMapelId(mapelData[0].id);
            }
        } catch (err) {
            console.error('Gagal memuat kurikulum & mapel:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddKurikulum = async (e) => {
        e.preventDefault();
        if (!newMapelId || !newHari || !newWaktuMulai || !newWaktuSelesai) return;

        try {
            const res = await apiFetch('/kurikulum', {
                method: 'POST',
                body: JSON.stringify({
                    mapel_id: newMapelId,
                    hari: newHari,
                    waktu_mulai: newWaktuMulai,
                    waktu_selesai: newWaktuSelesai,
                    ruangan: newRuangan,
                    tahun_ajaran: newTahunAjaran,
                    semester: newSemester
                })
            });

            setSuccessMsg('✅ Jadwal waktu mapel kurikulum berhasil ditambahkan!');
            loadData();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert(`Gagal menambah kurikulum: ${err.message}`);
        }
    };

    const handleDeleteKurikulum = async (id, namaMapel, hari) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal "${namaMapel}" di hari ${hari}?`)) {
            try {
                await apiFetch(`/kurikulum/${id}`, { method: 'DELETE' });
                setSuccessMsg(`Jadwal "${namaMapel}" berhasil dihapus.`);
                setKurikulumList(kurikulumList.filter(k => k.id !== id));
                setTimeout(() => setSuccessMsg(''), 4000);
            } catch (err) {
                alert(`Gagal menghapus jadwal: ${err.message}`);
            }
        }
    };

    const handleOpenEditModal = (item) => {
        setSelectedKurikulum(item);
        setEditMapelId(item.mapel_id);
        setEditHari(item.hari);
        setEditWaktuMulai(item.waktu_mulai ? item.waktu_mulai.substring(0, 5) : '07:30');
        setEditWaktuSelesai(item.waktu_selesai ? item.waktu_selesai.substring(0, 5) : '09:00');
        setEditRuangan(item.ruangan || 'Ruang 10 IPA 1');
    };

    const handleSaveEditKurikulum = async (e) => {
        e.preventDefault();
        if (!selectedKurikulum) return;

        try {
            await apiFetch(`/kurikulum/${selectedKurikulum.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    mapel_id: editMapelId,
                    hari: editHari,
                    waktu_mulai: editWaktuMulai,
                    waktu_selesai: editWaktuSelesai,
                    ruangan: editRuangan,
                    tahun_ajaran: selectedKurikulum.tahun_ajaran || '2026/2027',
                    semester: selectedKurikulum.semester || 'Ganjil'
                })
            });

            setSelectedKurikulum(null);
            setSuccessMsg('✅ Perubahan jadwal kurikulum berhasil disimpan!');
            loadData();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert(`Gagal memperbarui jadwal: ${err.message}`);
        }
    };

    const filteredKurikulum = kurikulumList.filter(k => {
        const matchesSearch = (k.nama_mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (k.kode_mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (k.ruangan || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesHari = hariFilter === 'all' || k.hari === hariFilter;
        return matchesSearch && matchesHari;
    });

    return (
        <div className="space-y-6">
            {/* Notification Success */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        {successMsg}
                    </div>
                    <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Container Manajemen Jadwal & Kurikulum */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Kelola Kurikulum & Jadwal Waktu Mapel</h2>
                        <p className="text-xs text-slate-500">Tabel jadwal mata pelajaran, alokasi jam/waktu belajar, dan ruangan kelas</p>
                    </div>
                </div>

                {/* Form Tambah Jadwal Kurikulum */}
                <form onSubmit={handleAddKurikulum} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Mata Pelajaran</label>
                        <select
                            value={newMapelId}
                            onChange={e => setNewMapelId(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        >
                            {mapelList.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.nama_mapel} ({m.kode_mapel}) - Kelas {m.tingkat_kelas}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Hari Belajar</label>
                        <select
                            value={newHari}
                            onChange={e => setNewHari(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Sabtu">Sabtu</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Mulai & Selesai</label>
                        <div className="flex items-center gap-1">
                            <input
                                type="time"
                                required
                                value={newWaktuMulai}
                                onChange={e => setNewWaktuMulai(e.target.value)}
                                className="w-1/2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="time"
                                required
                                value={newWaktuSelesai}
                                onChange={e => setNewWaktuSelesai(e.target.value)}
                                className="w-1/2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Ruangan Kelas</label>
                        <input
                            type="text"
                            placeholder="misal: Ruang 10 IPA 1"
                            value={newRuangan}
                            onChange={e => setNewRuangan(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm">
                            <Plus className="w-4 h-4" /> Tambah Jadwal
                        </button>
                    </div>
                </form>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari Mata Pelajaran / Ruangan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={hariFilter}
                            onChange={e => setHariFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 font-medium"
                        >
                            <option value="all">Semua Hari Belajar</option>
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Sabtu">Sabtu</option>
                        </select>
                    </div>
                </div>

                {/* Tabel Jadwal Kurikulum Mapel */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="p-3.5">Hari</th>
                                <th className="p-3.5">Waktu Belajar</th>
                                <th className="p-3.5">Mata Pelajaran</th>
                                <th className="p-3.5">Kelas & Jurusan</th>
                                <th className="p-3.5">Ruangan</th>
                                <th className="p-3.5 text-right">Aksi Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredKurikulum.length > 0 ? (
                                filteredKurikulum.map((k) => (
                                    <tr key={k.id} className="hover:bg-indigo-50/30 transition">
                                        <td className="p-3.5">
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs">
                                                {k.hari}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-mono text-xs text-slate-700 font-semibold">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {k.waktu_mulai ? k.waktu_mulai.substring(0, 5) : '07:30'} - {k.waktu_selesai ? k.waktu_selesai.substring(0, 5) : '09:00'} WIB
                                            </div>
                                        </td>
                                        <td className="p-3.5 font-semibold text-slate-800">
                                            {k.nama_mapel}
                                            <div className="text-[11px] text-slate-400 font-normal font-mono">{k.kode_mapel}</div>
                                        </td>
                                        <td className="p-3.5 text-xs text-slate-600">
                                            Kelas {k.tingkat_kelas} ({k.jurusan})
                                        </td>
                                        <td className="p-3.5 text-xs text-slate-700 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                                {k.ruangan}
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenEditModal(k)}
                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteKurikulum(k.id, k.nama_mapel, k.hari)}
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
                                        Belum ada jadwal kurikulum yang ditambahkan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup Edit Modal Kurikulum */}
            {selectedKurikulum && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-base">Edit Jadwal Kurikulum</h3>
                            <button onClick={() => setSelectedKurikulum(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditKurikulum} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                                <select
                                    value={editMapelId}
                                    onChange={e => setEditMapelId(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    {mapelList.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama_mapel} ({m.kode_mapel})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Hari Belajar</label>
                                <select
                                    value={editHari}
                                    onChange={e => setEditHari(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="Senin">Senin</option>
                                    <option value="Selasa">Selasa</option>
                                    <option value="Rabu">Rabu</option>
                                    <option value="Kamis">Kamis</option>
                                    <option value="Jumat">Jumat</option>
                                    <option value="Sabtu">Sabtu</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Mulai</label>
                                    <input
                                        type="time"
                                        required
                                        value={editWaktuMulai}
                                        onChange={e => setEditWaktuMulai(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Selesai</label>
                                    <input
                                        type="time"
                                        required
                                        value={editWaktuSelesai}
                                        onChange={e => setEditWaktuSelesai(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Ruangan Kelas</label>
                                <input
                                    type="text"
                                    required
                                    value={editRuangan}
                                    onChange={e => setEditRuangan(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedKurikulum(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
