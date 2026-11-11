import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    Check,
    X,
    Clock,
    Search,
    Filter,
    BookOpen,
    Eye,
    MessageSquare,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    User,
    Calendar,
    HelpCircle
} from 'lucide-react';
import { apiFetch } from '@/services/api';

export const AccSoalUjian = () => {
    const [ujianList, setUjianList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal State untuk Review Detail Soal
    const [selectedUjian, setSelectedUjian] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [catatanReview, setCatatanReview] = useState('');
    const [submittingAcc, setSubmittingAcc] = useState(false);

    // Modal State untuk Penolakan Cepat dengan Catatan
    const [rejectModalUjian, setRejectModalUjian] = useState(null);
    const [alasanReject, setAlasanReject] = useState('');

    // Load data ujian dari API Backend
    const loadUjianData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiFetch('/ujian');
            setUjianList(data);
        } catch (err) {
            console.error('Gagal mengambil data ujian:', err);
            setToastMessage('Gagal mengambil daftar ujian: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUjianData();
    }, []);

    // Buka Modal Detail Soal
    const handleOpenDetail = async (ujianId) => {
        setLoadingDetail(true);
        setSelectedUjian(null);
        setCatatanReview('');
        try {
            const detail = await apiFetch(`/ujian/${ujianId}`);
            setSelectedUjian(detail);
            setCatatanReview(detail.catatan_waka || '');
        } catch (err) {
            alert('Gagal mengambil butir soal: ' + err.message);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Eksekusi Konfirmasi Status ACC (Approve / Reject)
    const handleAccAction = async (id, status, catatan = '') => {
        setSubmittingAcc(true);
        try {
            const res = await apiFetch(`/ujian/${id}/acc`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status_acc: status,
                    catatan_waka: catatan
                })
            });

            setToastMessage(res.message || `Status ujian berhasil diubah menjadi ${status.toUpperCase()}!`);
            setTimeout(() => setToastMessage(''), 4500);

            // Tutup modal jika sedang terbuka
            if (selectedUjian && selectedUjian.id === id) {
                setSelectedUjian(null);
            }
            if (rejectModalUjian && rejectModalUjian.id === id) {
                setRejectModalUjian(null);
                setAlasanReject('');
            }

            // Muat ulang data terbaru
            loadUjianData();
        } catch (err) {
            alert('Gagal memproses verifikasi ACC: ' + err.message);
        } finally {
            setSubmittingAcc(false);
        }
    };

    // Filter Logic
    const filteredUjian = ujianList.filter((item) => {
        const matchesSearch =
            (item.judul_ujian || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.nama_guru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.nama_mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.kode_mapel || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status_acc === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = ujianList.filter(u => u.status_acc === 'pending').length;
    const approvedCount = ujianList.filter(u => u.status_acc === 'approved').length;
    const rejectedCount = ujianList.filter(u => u.status_acc === 'rejected').length;

    return (
        <div className="space-y-6">
            {/* Toast Notifikasi Sukses */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold">
                        ✕ Tutup
                    </button>
                </div>
            )}

            {/* Header Utama & Kartu Ringkasan Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Persetujuan (ACC) Draft Soal Ujian Guru</h2>
                            <p className="text-xs text-slate-500">
                                Verifikasi kualitas materi, durasi waktu, dan butir soal ujian sebelum dapat diakses oleh Siswa
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => loadUjianData(true)}
                        disabled={refreshing}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto disabled:opacity-50"
                        title="Perbarui Data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-700' : ''}`} />
                        {refreshing ? 'Memperbarui...' : 'Refresh'}
                    </button>
                </div>

                {/* 4 Kartu Metrik Ringkasan Status Ujian */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Draft Masuk</span>
                            <div className="text-xl font-bold text-slate-800 mt-0.5">{ujianList.length} Paket</div>
                        </div>
                        <div className="p-2 bg-slate-200 text-slate-600 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-amber-800 uppercase">Menunggu ACC</span>
                            <div className="text-xl font-bold text-amber-900 mt-0.5">{pendingCount} Paket</div>
                        </div>
                        <div className="p-2 bg-amber-200 text-amber-800 rounded-lg"><Clock className="w-4 h-4" /></div>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-emerald-800 uppercase">Telah Disetujui</span>
                            <div className="text-xl font-bold text-emerald-900 mt-0.5">{approvedCount} Paket</div>
                        </div>
                        <div className="p-2 bg-emerald-200 text-emerald-800 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
                    </div>

                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-rose-800 uppercase">Ditolak / Revisi</span>
                            <div className="text-xl font-bold text-rose-900 mt-0.5">{rejectedCount} Paket</div>
                        </div>
                        <div className="p-2 bg-rose-200 text-rose-800 rounded-lg"><XCircle className="w-4 h-4" /></div>
                    </div>
                </div>
            </div>

            {/* TABEL DATA & FILTER */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start overflow-x-auto max-w-full">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                statusFilter === 'all'
                                    ? 'bg-white text-slate-800 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Semua ({ujianList.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Menunggu ACC ({pendingCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                statusFilter === 'approved'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Disetujui ({approvedCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                statusFilter === 'rejected'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Ditolak ({rejectedCount})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari judul ujian, guru, mapel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabel Ujian */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Judul Ujian & Mapel</th>
                                <th className="p-3.5">Guru Pengaju</th>
                                <th className="p-3.5">Durasi & Soal</th>
                                <th className="p-3.5">Status ACC</th>
                                <th className="p-3.5">Catatan Review Waka</th>
                                <th className="p-3.5 text-right">Aksi Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-600 mb-2" />
                                        Memuat data draft soal ujian...
                                    </td>
                                </tr>
                            ) : filteredUjian.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                        Tidak ada draft soal ujian yang sesuai dengan kriteria filter saat ini.
                                    </td>
                                </tr>
                            ) : (
                                filteredUjian.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-800 text-sm">{u.judul_ujian}</div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                                    {u.nama_mapel}
                                                </span>
                                                <span>Kelas {u.tingkat_kelas}</span>
                                                <span>•</span>
                                                <span className="uppercase">{u.jurusan}</span>
                                            </div>
                                        </td>

                                        <td className="p-3.5">
                                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {u.nama_guru}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono pl-5">
                                                {u.email_guru}
                                            </div>
                                        </td>

                                        <td className="p-3.5 font-mono">
                                            <div className="text-slate-800 font-semibold flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {u.durasi_menit} Menit
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                {u.jumlah_soal || 0} Butir Soal
                                            </div>
                                        </td>

                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                                u.status_acc === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                u.status_acc === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                                'bg-amber-100 text-amber-900 border border-amber-200'
                                            }`}>
                                                {u.status_acc === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {u.status_acc === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                                                {u.status_acc === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                                                {u.status_acc === 'pending' ? 'Menunggu ACC' : u.status_acc}
                                            </span>
                                        </td>

                                        <td className="p-3.5 text-[11px] text-slate-500 max-w-xs truncate">
                                            {u.catatan_waka ? (
                                                <span className="italic" title={u.catatan_waka}>
                                                    "{u.catatan_waka}"
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                            {/* Tombol Lihat & Review Butir Soal */}
                                            <button
                                                onClick={() => handleOpenDetail(u.id)}
                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 transition"
                                                title="Lihat Butir Soal Ujian"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-slate-500" /> Review Soal
                                            </button>

                                            {/* Tombol Cepat Approve */}
                                            {u.status_acc !== 'approved' && (
                                                <button
                                                    onClick={() => handleAccAction(u.id, 'approved', 'Disetujui oleh Waka Kurikulum')}
                                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-1 transition shadow-2xs"
                                                    title="Setujui Paket Ujian"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> ACC
                                                </button>
                                            )}

                                            {/* Tombol Cepat Reject */}
                                            {u.status_acc !== 'rejected' && (
                                                <button
                                                    onClick={() => {
                                                        setRejectModalUjian(u);
                                                        setAlasanReject('');
                                                    }}
                                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg text-xs inline-flex items-center gap-1 transition"
                                                    title="Tolak / Minta Revisi"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Tolak
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: PREVIEW & REVIEW DETAIL BUTIR SOAL */}
            {selectedUjian && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                    Review Soal Ujian
                                </span>
                                <h3 className="font-bold text-slate-800 text-base mt-1">{selectedUjian.judul_ujian}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pengampu: {selectedUjian.nama_guru} • Mapel: {selectedUjian.nama_mapel} • Durasi: {selectedUjian.durasi_menit} Menit
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedUjian(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: Daftar Butir Soal */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Daftar Pertanyaan ({selectedUjian.soal?.length || 0} Butir Soal)
                                </h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    selectedUjian.status_acc === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                    selectedUjian.status_acc === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                    Status: {selectedUjian.status_acc}
                                </span>
                            </div>

                            {(!selectedUjian.soal || selectedUjian.soal.length === 0) ? (
                                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                    Belum ada butir soal yang diinput pada paket ujian ini.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedUjian.soal.map((s, idx) => (
                                        <div key={s.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs">
                                            <div className="font-semibold text-slate-800 flex items-start gap-2">
                                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <span className="flex-1 text-slate-800 font-medium">{s.pertanyaan}</span>
                                            </div>

                                            {s.tipe_soal === 'pg' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                                                    <div className={`p-2 rounded-lg border text-[11px] ${
                                                        s.kunci_jawaban === 'A'
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                            : 'bg-white border-slate-200 text-slate-600'
                                                    }`}>
                                                        A. {s.pilihan_a}
                                                    </div>
                                                    <div className={`p-2 rounded-lg border text-[11px] ${
                                                        s.kunci_jawaban === 'B'
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                            : 'bg-white border-slate-200 text-slate-600'
                                                    }`}>
                                                        B. {s.pilihan_b}
                                                    </div>
                                                    <div className={`p-2 rounded-lg border text-[11px] ${
                                                        s.kunci_jawaban === 'C'
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                            : 'bg-white border-slate-200 text-slate-600'
                                                    }`}>
                                                        C. {s.pilihan_c}
                                                    </div>
                                                    <div className={`p-2 rounded-lg border text-[11px] ${
                                                        s.kunci_jawaban === 'D'
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                            : 'bg-white border-slate-200 text-slate-600'
                                                    }`}>
                                                        D. {s.pilihan_d}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pl-7 pt-1 flex items-center gap-2 text-[11px]">
                                                <span className="text-slate-400">Kunci Jawaban:</span>
                                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                                    {s.kunci_jawaban}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Catatan Waka Kurikulum */}
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                                    Catatan Verifikasi Waka Kurikulum (Opsional):
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Soal sudah sesuai kurikulum, atau tulis catatan perbaikan jika menolak..."
                                    value={catatanReview}
                                    onChange={(e) => setCatatanReview(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer: Action Approve / Reject */}
                        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedUjian(null)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
                            >
                                Tutup
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={submittingAcc}
                                    onClick={() => handleAccAction(selectedUjian.id, 'rejected', catatanReview || 'Ditolak untuk revisi')}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                                >
                                    <X className="w-3.5 h-3.5" /> Tolak Ujian
                                </button>
                                <button
                                    type="button"
                                    disabled={submittingAcc}
                                    onClick={() => handleAccAction(selectedUjian.id, 'approved', catatanReview || 'Disetujui oleh Waka Kurikulum')}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" /> Setujui (ACC) Ujian
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: TOLAK CEPAT DENGAN ALASAN REVISI */}
            {rejectModalUjian && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm">Konfirmasi Penolakan Draft Soal</h3>
                            </div>
                            <button
                                onClick={() => setRejectModalUjian(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                            <p>
                                Anda akan menolak paket ujian: <strong className="text-slate-800">{rejectModalUjian.judul_ujian}</strong>.
                            </p>
                            <p className="text-slate-400">Pengampu: {rejectModalUjian.nama_guru}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Alasan Penolakan / Catatan Revisi untuk Guru:
                            </label>
                            <textarea
                                rows="3"
                                required
                                placeholder="Contoh: Soal nomor 2 tidak memiliki opsi jawaban yang valid, mohon diperbaiki..."
                                value={alasanReject}
                                onChange={(e) => setAlasanReject(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setRejectModalUjian(null)}
                                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={submittingAcc}
                                onClick={() => handleAccAction(rejectModalUjian.id, 'rejected', alasanReject || 'Ditolak untuk revisi')}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                            >
                                <X className="w-3.5 h-3.5" /> Konfirmasi Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
