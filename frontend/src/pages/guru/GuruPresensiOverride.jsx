import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    Search,
    Edit3,
    X,
    Clock,
    BookOpen,
    Filter,
    CheckCircle2,
    AlertCircle,
    UserX,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { apiFetch } from '@/services/api';

export const GuruPresensiOverride = () => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[new Date().getDay()];

    const [presensiSiswaList, setPresensiSiswaList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [dayFilter, setDayFilter] = useState('today'); // 'today' | 'all' | 'Senin' | 'Selasa' | ...
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'hadir' | 'terlambat' | 'izin' | 'alpa'
    const [kelasFilter, setKelasFilter] = useState('all'); // 'all' | '10' | '11' | '12'
    const [searchPresensi, setSearchPresensi] = useState('');

    // State Modal Pop-up Override
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [targetStatus, setTargetStatus] = useState('hadir');
    const [catatanGuru, setCatatanGuru] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load Rekap Presensi Per Mapel Real dari API
    const loadPresensi = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/presensi/today');
            setPresensiSiswaList(data || []);
        } catch (err) {
            console.error('Gagal mengambil data presensi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPresensi();
    }, []);

    // Buka Modal Pop-up untuk Siswa Terpilih
    const openOverrideModal = (siswa) => {
        setSelectedSiswa(siswa);
        setTargetStatus(siswa.status || 'alpa');
        setCatatanGuru(siswa.catatan_guru || '');
        setIsModalOpen(true);
    };

    // Simpan Perubahan Status dari Pop-up (Dapat Diubah Berkali-kali)
    const handleSaveOverride = async (e) => {
        e.preventDefault();
        if (!selectedSiswa) return;

        try {
            setSubmitting(true);
            await apiFetch('/presensi/override', {
                method: 'PATCH',
                body: JSON.stringify({
                    presensi_id: selectedSiswa.presensi_id,
                    siswa_id: selectedSiswa.siswa_id,
                    kurikulum_id: selectedSiswa.kurikulum_id,
                    status: targetStatus,
                    catatan_guru: catatanGuru
                })
            });

            setIsModalOpen(false);
            setSelectedSiswa(null);
            await loadPresensi();
        } catch (err) {
            alert(`Gagal override status: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Daftar Hari untuk Tombol Filter Hari
    const availableDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Ambil daftar kelas unik
    const availableClasses = Array.from(
        new Set(
            presensiSiswaList
                .map((p) => String(p.kelas || ''))
                .filter(Boolean)
        )
    ).sort();

    // Data yang difilter
    const filteredPresensi = presensiSiswaList.filter((p) => {
        // Filter Hari
        const matchDay =
            dayFilter === 'all'
                ? true
                : dayFilter === 'today'
                ? (p.hari || '').toLowerCase() === currentDayName.toLowerCase()
                : (p.hari || '').toLowerCase() === dayFilter.toLowerCase();

        // Filter Kelas
        const matchKelas =
            kelasFilter === 'all'
                ? true
                : String(p.kelas || '') === String(kelasFilter);

        // Filter Status
        let matchStatus = true;
        if (statusFilter === 'hadir') {
            matchStatus = p.status === 'hadir' && !p.is_late;
        } else if (statusFilter === 'terlambat') {
            matchStatus = p.status === 'hadir' && p.is_late;
        } else if (statusFilter === 'izin') {
            matchStatus = p.status === 'izin';
        } else if (statusFilter === 'alpa') {
            matchStatus = p.status === 'alpa' || !p.status;
        }

        // Filter Pencarian Teks
        const q = searchPresensi.toLowerCase().trim();
        const matchSearch =
            !q ||
            (p.nama_siswa || p.nama || '').toLowerCase().includes(q) ||
            (p.nama_mapel || '').toLowerCase().includes(q) ||
            (p.kode_mapel || '').toLowerCase().includes(q) ||
            (p.kelas ? `kelas ${p.kelas}` : '').toLowerCase().includes(q) ||
            (p.catatan_guru || '').toLowerCase().includes(q);

        return matchDay && matchKelas && matchStatus && matchSearch;
    });

    // Statistik berdasarkan hari yang dipilih
    const baseListForStats = presensiSiswaList.filter((p) => {
        if (dayFilter === 'all') return true;
        if (dayFilter === 'today') return (p.hari || '').toLowerCase() === currentDayName.toLowerCase();
        return (p.hari || '').toLowerCase() === dayFilter.toLowerCase();
    });

    const statsHadir = baseListForStats.filter((p) => p.status === 'hadir' && !p.is_late).length;
    const statsTerlambat = baseListForStats.filter((p) => p.status === 'hadir' && p.is_late).length;
    const statsIzin = baseListForStats.filter((p) => p.status === 'izin').length;
    const statsAlpa = baseListForStats.filter((p) => p.status === 'alpa' || !p.status).length;
    const statsTotal = baseListForStats.length;

    const resetFilters = () => {
        setSearchPresensi('');
        setStatusFilter('all');
        setKelasFilter('all');
    };

    const hasActiveFilters = searchPresensi || statusFilter !== 'all' || kelasFilter !== 'all';

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 text-green-700 rounded-lg">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Rekap & Override Presensi Per Mata Pelajaran</h2>
                        <p className="text-xs text-slate-500">Guru dapat memantau dan mengubah status presensi siswa per sesi pelajaran</p>
                    </div>
                </div>

                <button
                    onClick={loadPresensi}
                    disabled={loading}
                    className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Segarkan Data</span>
                </button>
            </div>

            {/* Day Selector Pills */}
            <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Pilih Hari Jadwal Belajar:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                        onClick={() => setDayFilter('today')}
                        className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
                            dayFilter === 'today'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <span>⚡ Hari Ini ({currentDayName})</span>
                    </button>
                    <button
                        onClick={() => setDayFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition cursor-pointer ${
                            dayFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua Hari
                    </button>
                    {availableDays.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDayFilter(d)}
                            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition cursor-pointer ${
                                dayFilter === d
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : d.toLowerCase() === currentDayName.toLowerCase()
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        statusFilter === 'all'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Total Siswa</div>
                    <div className="text-lg font-extrabold mt-0.5">{statsTotal}</div>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'hadir' ? 'all' : 'hadir')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        statusFilter === 'hadir'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                    }`}
                >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-85 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hadir
                    </div>
                    <div className="text-lg font-extrabold mt-0.5">{statsHadir}</div>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'terlambat' ? 'all' : 'terlambat')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        statusFilter === 'terlambat'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100/60'
                    }`}
                >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-85 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Terlambat
                    </div>
                    <div className="text-lg font-extrabold mt-0.5">{statsTerlambat}</div>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'izin' ? 'all' : 'izin')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        statusFilter === 'izin'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-blue-50/60 border-blue-200 text-blue-800 hover:bg-blue-100/60'
                    }`}
                >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-85 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Izin
                    </div>
                    <div className="text-lg font-extrabold mt-0.5">{statsIzin}</div>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'alpa' ? 'all' : 'alpa')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer col-span-2 sm:col-span-1 ${
                        statusFilter === 'alpa'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-rose-50/60 border-rose-200 text-rose-800 hover:bg-rose-100/60'
                    }`}
                >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-85 flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Alpa
                    </div>
                    <div className="text-lg font-extrabold mt-0.5">{statsAlpa}</div>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                {/* Search Input */}
                <div className="sm:col-span-6 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari siswa, mapel, kelas, catatan..."
                        value={searchPresensi}
                        onChange={(e) => setSearchPresensi(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    {searchPresensi && (
                        <button
                            onClick={() => setSearchPresensi('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Kelas */}
                <div className="sm:col-span-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                    <select
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                    >
                        <option value="all">Semua Kelas</option>
                        {availableClasses.map((cls) => (
                            <option key={cls} value={cls}>
                                Kelas {cls}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter Status */}
                <div className="sm:col-span-3 flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                    >
                        <option value="all">Semua Status Presensi</option>
                        <option value="hadir">Hadir (Tepat Waktu)</option>
                        <option value="terlambat">Hadir Terlambat</option>
                        <option value="izin">Izin</option>
                        <option value="alpa">Alpa / Belum Absen</option>
                    </select>
                </div>
            </div>

            {/* Active Filter Indicator & Reset */}
            {hasActiveFilters && (
                <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-slate-600">
                        Menampilkan <strong className="text-slate-800">{filteredPresensi.length}</strong> hasil pencarian/filter
                    </span>
                    <button
                        onClick={resetFilters}
                        className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Reset Semua Filter
                    </button>
                </div>
            )}

            {/* Table or States */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                    <p className="text-xs font-medium">Memuat data presensi siswa...</p>
                </div>
            ) : filteredPresensi.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                        Tidak ada data presensi yang sesuai dengan kriteria filter.
                    </p>
                    <p className="text-xs text-slate-400">
                        Coba ubah filter hari, status, atau bersihkan kata kunci pencarian.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                            Reset Filter Sekarang
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="p-3.5">Nama Siswa</th>
                                <th className="p-3.5">Mata Pelajaran & Jadwal Belajar</th>
                                <th className="p-3.5">Waktu Absen</th>
                                <th className="p-3.5">Status Presensi</th>
                                <th className="p-3.5">Catatan Guru</th>
                                <th className="p-3.5 text-right">Aksi Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredPresensi.map((s, idx) => (
                                <tr key={s.presensi_id || `item-${idx}`} className="hover:bg-slate-50/60 transition">
                                    <td className="p-3.5 font-semibold text-slate-800">
                                        {s.nama_siswa || s.nama}
                                        <div className="text-xs text-slate-400 font-normal">Kelas {s.kelas || '10'}</div>
                                        {s.diubah_oleh_guru && (
                                            <div className="text-[10px] text-indigo-600 font-medium pt-0.5">
                                                ✏️ Override oleh: {s.diubah_oleh_guru}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3.5 text-xs text-slate-700">
                                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                            {s.nama_mapel}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {s.hari} ({s.waktu_mulai ? s.waktu_mulai.substring(0, 5) : '07:30'} - {s.waktu_selesai ? s.waktu_selesai.substring(0, 5) : '09:00'} WIB)
                                        </div>
                                    </td>
                                    <td className="p-3.5 text-slate-600 text-xs font-mono">
                                        {s.waktu_absen
                                            ? new Date(s.waktu_absen).toLocaleTimeString('id-ID', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                              }) + ' WIB'
                                            : '-'}
                                        {s.is_late && (
                                            <span className="ml-1 text-amber-600 font-bold text-[10px]">
                                                (Terlambat)
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3.5">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 ${
                                                s.status === 'hadir'
                                                    ? s.is_late
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                    : s.status === 'izin'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                            {s.status === 'hadir' && !s.is_late && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                            {s.status === 'hadir' && s.is_late && <Clock className="w-3 h-3 text-amber-600" />}
                                            {s.status === 'izin' && <AlertCircle className="w-3 h-3 text-blue-600" />}
                                            {(!s.status || s.status === 'alpa') && <UserX className="w-3 h-3 text-rose-600" />}
                                            <span>{s.status === 'hadir' && s.is_late ? 'Terlambat' : s.status || 'alpa'}</span>
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-xs text-slate-500 italic">
                                        {s.catatan_guru ? `"${s.catatan_guru}"` : '-'}
                                    </td>
                                    <td className="p-3.5 text-right">
                                        <button
                                            onClick={() => openOverrideModal(s)}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition border border-indigo-200 cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Ubah Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL POP-UP OVERRIDE PRESENSI */}
            {isModalOpen && selectedSiswa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Override Status Presensi Mapel</h3>
                                <p className="text-xs text-slate-500">Ubah status presensi per mata pelajaran</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveOverride} className="p-5 space-y-4">
                            {/* Info Siswa & Mapel */}
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800">{selectedSiswa.nama_siswa || selectedSiswa.nama}</span>
                                    <span className="px-2 py-0.5 bg-white rounded font-mono text-[11px] font-semibold text-indigo-700">
                                        Kelas {selectedSiswa.kelas || '10'}
                                    </span>
                                </div>
                                <div className="text-xs font-semibold text-indigo-800">
                                    📘 {selectedSiswa.nama_mapel} ({selectedSiswa.hari})
                                </div>
                            </div>

                            {/* Option Radio Status Baru */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Status Presensi Baru:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <label
                                        className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${
                                            targetStatus === 'hadir'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value="hadir"
                                            checked={targetStatus === 'hadir'}
                                            onChange={() => setTargetStatus('hadir')}
                                            className="sr-only"
                                        />
                                        ✓ HADIR
                                    </label>

                                    <label
                                        className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${
                                            targetStatus === 'izin'
                                                ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value="izin"
                                            checked={targetStatus === 'izin'}
                                            onChange={() => setTargetStatus('izin')}
                                            className="sr-only"
                                        />
                                        ✉ IZIN
                                    </label>

                                    <label
                                        className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${
                                            targetStatus === 'alpa'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value="alpa"
                                            checked={targetStatus === 'alpa'}
                                            onChange={() => setTargetStatus('alpa')}
                                            className="sr-only"
                                        />
                                        ✕ ALPA
                                    </label>
                                </div>
                            </div>

                            {/* Input Catatan Guru */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Guru (Opsional):</label>
                                <textarea
                                    rows="2"
                                    placeholder="misal: Siswa melapor lupa absen karena masalah koneksi HP"
                                    value={catatanGuru}
                                    onChange={(e) => setCatatanGuru(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};