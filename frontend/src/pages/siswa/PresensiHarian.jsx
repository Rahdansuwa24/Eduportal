import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building,
    BookOpen,
    RefreshCw,
    Loader2,
    Calendar,
    UserCheck,
    Check,
    Search,
    Filter,
    X
} from 'lucide-react';
import { apiFetch } from '@/services/api';

export const PresensiHarian = () => {
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = indonesianDays[new Date().getDay()]; // e.g. 'Rabu'

    const [jadwalTodayList, setJadwalTodayList] = useState([]);
    const [historyPresensi, setHistoryPresensi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingMapelId, setSubmittingMapelId] = useState(null);
    const [presensiMsgMap, setPresensiMsgMap] = useState({});
    const [toastMessage, setToastMessage] = useState('');

    // Filter & Search Jadwal (Bagian Atas)
    const [dayFilter, setDayFilter] = useState('today'); // 'today' | 'all' | 'Senin' | 'Selasa' | ...
    const [searchJadwal, setSearchJadwal] = useState('');
    const [tipeMapelFilter, setTipeMapelFilter] = useState('all'); // 'all' | 'wajib' | 'peminatan'

    // Filter & Search Riwayat (Bagian Bawah)
    const [historySearch, setHistorySearch] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('all'); // 'all' | 'hadir' | 'terlambat' | 'izin' | 'alpa'

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 5000);
    };

    // Load Jadwal Kurikulum Hari Ini & Riwayat Presensi Siswa
    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [jadwalData, myPresensiData] = await Promise.all([
                apiFetch('/kurikulum'),
                apiFetch('/presensi/my')
            ]);
            setJadwalTodayList(jadwalData || []);
            setHistoryPresensi(myPresensiData || []);

            // Petakan status presensi hari ini jika sudah absen
            // Menggunakan pemformatan tanggal lokal (YYYY-MM-DD) agar akurat terlepas dari timezone UTC
            const toLocalDateStr = (d) => {
                if (!d) return '';
                const date = new Date(d);
                if (isNaN(date.getTime())) return '';
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };

            const todayLocal = toLocalDateStr(new Date());
            const map = {};

            (myPresensiData || []).forEach((p) => {
                const dateFromDb = p.tanggal_str || toLocalDateStr(p.tanggal);
                const dateFromAbsen = p.waktu_absen ? toLocalDateStr(p.waktu_absen) : '';

                // Cocok jika tanggal DB atau tanggal waktu_absen sama dengan hari ini
                const isToday = (dateFromDb === todayLocal) || (dateFromAbsen === todayLocal);

                if (isToday && p.kurikulum_id) {
                    const jamStr = p.waktu_absen
                        ? new Date(p.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '';
                    map[p.kurikulum_id] = {
                        is_late: Boolean(p.is_late),
                        status: p.status || 'hadir',
                        waktu: jamStr,
                        label: p.is_late
                            ? `Sudah Absen (Terlambat - Jam ${jamStr} WIB)`
                            : `Sudah Hadir Tepat Waktu (Jam ${jamStr} WIB)`
                    };
                }
            });
            setPresensiMsgMap(map);
        } catch (err) {
            console.error('Error fetching presensi siswa data:', err);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Submit Presensi Per Mapel
    const handlePresensiMapel = async (kurikulumId, namaMapel) => {
        setSubmittingMapelId(kurikulumId);
        try {
            const res = await apiFetch('/presensi/submit', {
                method: 'POST',
                body: JSON.stringify({ kurikulum_id: kurikulumId })
            });

            showToast(res.message);
            fetchData();
        } catch (err) {
            alert(`Gagal melakukan presensi: ${err.message}`);
        } finally {
            setSubmittingMapelId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Alert */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Presensi Sesuai Jadwal Hari Ini */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Presensi Kehadiran Per Mata Pelajaran</h2>
                            <p className="text-xs text-slate-500">Absensi mandiri dilakukan sesuai jadwal waktu belajar masing-masing kelas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                            📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </div>

                {/* Filter Tab Hari (Default: Hari Ini Saja) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setDayFilter('today')}
                        className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                            dayFilter === 'today'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <span>⚡ Hari Ini ({currentDayName})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDayFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                            dayFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua Hari
                    </button>
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => setDayFilter(day)}
                            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                dayFilter === day
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Search & Kategori Filter Bar Jadwal */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari mata pelajaran, kode mapel, atau ruangan..."
                            value={searchJadwal}
                            onChange={(e) => setSearchJadwal(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                        {searchJadwal && (
                            <button
                                onClick={() => setSearchJadwal('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="sm:col-span-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                        <select
                            value={tipeMapelFilter}
                            onChange={(e) => setTipeMapelFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                            <option value="all">Semua Kategori Mapel</option>
                            <option value="wajib">Mapel Wajib</option>
                            <option value="peminatan">Mapel Peminatan</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <span className="text-xs">Memuat jadwal mata pelajaran...</span>
                    </div>
                ) : (() => {
                    const displayedJadwal = (jadwalTodayList || []).filter((j) => {
                        // Filter Hari
                        const matchDay =
                            dayFilter === 'all'
                                ? true
                                : dayFilter === 'today'
                                ? (j.hari || '').toLowerCase() === currentDayName.toLowerCase()
                                : (j.hari || '').toLowerCase() === dayFilter.toLowerCase();

                        // Filter Tipe Mapel (Wajib / Peminatan)
                        const matchTipe =
                            tipeMapelFilter === 'all'
                                ? true
                                : (j.tipe_mapel || '').toLowerCase() === tipeMapelFilter.toLowerCase();

                        // Filter Pencarian Teks
                        const matchSearch =
                            !searchJadwal.trim() ||
                            (j.nama_mapel || '').toLowerCase().includes(searchJadwal.toLowerCase()) ||
                            (j.kode_mapel || '').toLowerCase().includes(searchJadwal.toLowerCase()) ||
                            (j.ruangan || '').toLowerCase().includes(searchJadwal.toLowerCase());

                        return matchDay && matchTipe && matchSearch;
                    });

                    if (displayedJadwal.length === 0) {
                        return (
                            <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                                <p className="text-sm font-semibold text-slate-700">
                                    Tidak ada jadwal mata pelajaran untuk {dayFilter === 'today' ? `hari ini (${currentDayName})` : `hari ${dayFilter}`}.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Silakan klik tab hari lain atau hubungi Waka Kurikulum jika jadwal kelas belum dikonfigurasi.
                                </p>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayedJadwal.map((j) => {
                                const isSubmitted = presensiMsgMap[j.id];
                                const isSubmitting = submittingMapelId === j.id;
                                const isTodaySchedule = (j.hari || '').toLowerCase() === currentDayName.toLowerCase();

                                return (
                                    <div
                                        key={j.id}
                                        className={`p-5 border rounded-xl transition space-y-3 shadow-2xs ${
                                            isSubmitted
                                                ? 'bg-emerald-50/40 border-emerald-200'
                                                : isTodaySchedule
                                                ? 'bg-white border-slate-200 hover:border-indigo-300'
                                                : 'bg-slate-50/70 border-slate-200 opacity-90'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <span className={`px-2.5 py-0.5 font-bold text-[10px] uppercase rounded ${
                                                    isTodaySchedule
                                                        ? 'bg-indigo-100 text-indigo-800'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {j.hari} {isTodaySchedule ? '• Hari Ini' : ''} • {j.tipe_mapel}
                                                </span>
                                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 pt-1">
                                                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                                                    <span>{j.nama_mapel}</span>
                                                </h3>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {j.kode_mapel} • Kelas {j.tingkat_kelas} ({j.jurusan || 'Semua'})
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono font-bold text-slate-700 flex items-center justify-end gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>
                                                        {j.waktu_mulai ? j.waktu_mulai.substring(0, 5) : '07:30'} - {j.waktu_selesai ? j.waktu_selesai.substring(0, 5) : '09:00'} WIB
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                                                    <Building className="w-3 h-3 text-slate-400" />
                                                    <span>{j.ruangan || 'Ruang Kelas'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isSubmitted ? (
                                            <div className="space-y-2 pt-1">
                                                <div
                                                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                                                        isSubmitted.is_late
                                                            ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                                                            : 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isSubmitted.is_late ? (
                                                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                        )}
                                                        <span>{isSubmitted.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                                                        Tercatat
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full py-2 bg-slate-100 text-slate-400 rounded-lg font-semibold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-80"
                                                >
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Anda Sudah Presensi Hari Ini</span>
                                                </button>
                                            </div>
                                        ) : !isTodaySchedule ? (
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full py-2 bg-slate-100 text-slate-400 rounded-lg font-semibold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-70"
                                                >
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Presensi Hanya Dibuka Hari {j.hari}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => handlePresensiMapel(j.id, j.nama_mapel)}
                                                    disabled={isSubmitting}
                                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isSubmitting ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                    <span>{isSubmitting ? 'Mencatat Kehadiran...' : 'Konfirmasi Kehadiran Mapel Ini'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* Riwayat Presensi Kehadiran Siswa */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {(() => {
                    const filteredHistory = historyPresensi.filter((p) => {
                        // Status filter
                        let matchStatus = true;
                        if (historyStatusFilter === 'hadir') {
                            matchStatus = p.status === 'hadir' && !p.is_late;
                        } else if (historyStatusFilter === 'terlambat') {
                            matchStatus = p.status === 'hadir' && p.is_late;
                        } else if (historyStatusFilter === 'izin') {
                            matchStatus = p.status === 'izin';
                        } else if (historyStatusFilter === 'alpa') {
                            matchStatus = p.status === 'alpa';
                        }

                        // Search text
                        let matchSearch = true;
                        if (historySearch.trim()) {
                            const q = historySearch.toLowerCase();
                            const dateStr = p.tanggal
                                ? new Date(p.tanggal).toLocaleDateString('id-ID', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                  }).toLowerCase()
                                : '';
                            matchSearch =
                                (p.nama_mapel || '').toLowerCase().includes(q) ||
                                (p.kode_mapel || '').toLowerCase().includes(q) ||
                                (p.hari || '').toLowerCase().includes(q) ||
                                (p.catatan_guru || '').toLowerCase().includes(q) ||
                                dateStr.includes(q);
                        }

                        return matchStatus && matchSearch;
                    });

                    return (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">Riwayat Presensi Siswa</h3>
                                    <p className="text-xs text-slate-500">Daftar rekaman kehadiran Anda pada seluruh sesi belajar</p>
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    Total {filteredHistory.length} dari {historyPresensi.length} Catatan
                                </span>
                            </div>

                            {/* Filter & Search Bar Riwayat */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                                <div className="sm:col-span-8 relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Cari riwayat (mapel, kode, catatan, atau hari)..."
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                    {historySearch && (
                                        <button
                                            onClick={() => setHistorySearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="sm:col-span-4 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                                    <select
                                        value={historyStatusFilter}
                                        onChange={(e) => setHistoryStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                                    >
                                        <option value="all">Semua Status Kehadiran</option>
                                        <option value="hadir">Hadir (Tepat Waktu)</option>
                                        <option value="terlambat">Hadir Terlambat</option>
                                        <option value="izin">Izin</option>
                                        <option value="alpa">Alpa / Belum Hadir</option>
                                    </select>
                                </div>
                            </div>

                            {historyPresensi.length === 0 ? (
                                <div className="py-8 text-center text-slate-500 text-xs">
                                    Belum ada rekaman kehadiran. Presensi yang Anda lakukan akan dicatat secara otomatis di sini.
                                </div>
                            ) : filteredHistory.length === 0 ? (
                                <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg space-y-2">
                                    <p className="font-semibold text-slate-600">
                                        Tidak ada riwayat presensi yang sesuai dengan kriteria pencarian atau filter.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setHistorySearch('');
                                            setHistoryStatusFilter('all');
                                        }}
                                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                                    >
                                        Reset Filter & Pencarian
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                                            <tr>
                                                <th className="p-3.5">Tanggal</th>
                                                <th className="p-3.5">Mata Pelajaran</th>
                                                <th className="p-3.5">Jadwal Kelas</th>
                                                <th className="p-3.5">Waktu Pencatatan</th>
                                                <th className="p-3.5">Status Kehadiran</th>
                                                <th className="p-3.5">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 text-xs">
                                            {filteredHistory.map((p) => (
                                                <tr key={p.presensi_id} className="hover:bg-slate-50/70 transition">
                                                    <td className="p-3.5 font-medium text-slate-800">
                                                        {p.tanggal
                                                            ? new Date(p.tanggal).toLocaleDateString('id-ID', {
                                                                  weekday: 'long',
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric'
                                                              })
                                                            : '-'}
                                                    </td>
                                                    <td className="p-3.5 font-semibold text-slate-800">
                                                        {p.nama_mapel} ({p.kode_mapel})
                                                    </td>
                                                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                                        {p.hari}, {p.waktu_mulai ? p.waktu_mulai.substring(0, 5) : ''} - {p.waktu_selesai ? p.waktu_selesai.substring(0, 5) : ''}
                                                    </td>
                                                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                                                        {p.waktu_absen
                                                            ? new Date(p.waktu_absen).toLocaleTimeString('id-ID', {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit'
                                                              }) + ' WIB'
                                                            : '-'}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 ${
                                                                p.status === 'hadir'
                                                                    ? p.is_late
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : 'bg-emerald-100 text-emerald-800'
                                                                    : p.status === 'izin'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                            }`}
                                                        >
                                                            {p.status === 'hadir' && !p.is_late && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                            {p.status === 'hadir' && p.is_late && <Clock className="w-3 h-3 text-amber-600" />}
                                                            <span>{p.is_late ? 'Terlambat' : p.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-slate-500 text-[11px] italic">
                                                        {p.catatan_guru ? `Catatan Guru: ${p.catatan_guru}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
};
