import React, { useState, useEffect } from 'react';
import {
    FileCheck,
    FileDown,
    Check,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    RefreshCw,
    Loader2,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { apiFetch, getFileUrl } from '@/services/api';

export const GuruAccPerizinan = () => {
    const [perizinanList, setPerizinanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Toast
    const [toastMessage, setToastMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 5000);
    };

    // Helper format tanggal Indonesia yang rapi
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Helper periksa batas waktu revisi keputusan (hanya berlaku 1 hari / 24 jam)
    const getRevisionInfo = (p) => {
        if (!p.status_acc || p.status_acc === 'pending') {
            return { allowed: true, text: '' };
        }
        const accTimestamp = p.waktu_acc
            ? new Date(p.waktu_acc).getTime()
            : new Date(p.created_at).getTime();
        const diffHours = (Date.now() - accTimestamp) / (1000 * 60 * 60);

        if (diffHours <= 24) {
            const hoursLeft = Math.max(1, Math.ceil(24 - diffHours));
            return {
                allowed: true,
                text: `Tersisa ~${hoursLeft} jam untuk revisi`
            };
        }

        return {
            allowed: false,
            text: 'Terkunci permanen (> 24 jam)'
        };
    };

    const loadPerizinan = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiFetch('/perizinan');
            setPerizinanList(data || []);
            setErrorMessage('');
        } catch (err) {
            console.error('Gagal memuat data perizinan:', err);
            setErrorMessage('Gagal memuat data perizinan: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPerizinan();
    }, []);

    const handleAccPerizinan = async (id, newStatus, namaSiswa) => {
        const actionLabel = newStatus === 'approved' ? 'menyetujui (ACC)' : 'menolak';
        if (!window.confirm(`Konfirmasi: Apakah Anda yakin ingin ${actionLabel} surat izin siswa ${namaSiswa || ''}?`)) {
            return;
        }

        setActionLoadingId(id);
        try {
            const res = await apiFetch(`/perizinan/${id}/acc`, {
                method: 'PATCH',
                body: JSON.stringify({ status_acc: newStatus })
            });

            showToast(res.message || `Surat perizinan berhasil di-${newStatus}!`);

            setPerizinanList(perizinanList.map(p =>
                p.id === id
                    ? {
                          ...p,
                          status_acc: res.perizinan?.status_acc || newStatus,
                          disetujui_oleh_guru: res.perizinan?.disetujui_oleh_guru || 'Anda (Guru)'
                      }
                    : p
            ));
        } catch (err) {
            alert(`Gagal memverifikasi surat izin: ${err.message}`);
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filter data
    const filteredList = perizinanList.filter(p => {
        const matchesSearch =
            (p.nama_siswa || p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.alasan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || p.status_acc === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
            {/* Toast Success */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-xs">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => loadPerizinan(true)} className="text-xs text-rose-700 font-semibold underline hover:no-underline">Coba Lagi</button>
                </div>
            )}

            {/* Main Container */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Verifikasi ACC Surat Izin Siswa</h2>
                            <p className="text-xs text-slate-500">Periksa permohonan izin belajar, berkas surat bukti, dan finalisasi status ke rekap presensi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadPerizinan(true)}
                            disabled={refreshing}
                            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                            title="Segarkan data"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa, alasan izin, atau keterangan..."
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

                    <div className="sm:col-span-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                            <option value="all">Semua Status Verifikasi</option>
                            <option value="pending">Menunggu Review (Pending)</option>
                            <option value="approved">Disetujui (Approved)</option>
                            <option value="rejected">Ditolak (Rejected)</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                        <span>Memuat data permohonan izin siswa...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">Tidak ada pengajuan izin yang ditemukan</p>
                        <p className="text-slate-400 mt-0.5">Siswa yang mengajukan surat izin sakit atau keperluan keluarga akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3.5">Nama Siswa</th>
                                    <th className="p-3.5">Alasan & Periode Tanggal</th>
                                    <th className="p-3.5">Berkas Bukti</th>
                                    <th className="p-3.5">Status Verifikasi</th>
                                    <th className="p-3.5 text-right">Aksi & Finalisasi ACC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.map((p) => {
                                    const namaSiswa = p.nama_siswa || p.nama;
                                    const isLoading = actionLoadingId === p.id;
                                    const alasanClean = p.alasan ? p.alasan.replace(/_/g, ' ') : 'Izin Siswa';

                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                            {/* Nama Siswa */}
                                            <td className="p-3.5">
                                                <div className="font-semibold text-slate-800 text-sm">{namaSiswa}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">Kelas {p.kelas || '10'}</div>
                                            </td>

                                            {/* Alasan & Periode */}
                                            <td className="p-3.5 text-slate-700">
                                                <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                                    <span>{alasanClean}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span>
                                                        {formatDateDisplay(p.tanggal_mulai)} s.d {formatDateDisplay(p.tanggal_selesai)}
                                                    </span>
                                                </div>
                                                {p.keterangan && (
                                                    <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1" title={p.keterangan}>
                                                        "{p.keterangan}"
                                                    </p>
                                                )}
                                            </td>

                                            {/* Berkas Bukti */}
                                            <td className="p-3.5">
                                                {p.bukti_file_path ? (
                                                    <a
                                                        href={getFileUrl(p.bukti_file_path)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] rounded-lg transition border border-indigo-200 shadow-2xs"
                                                    >
                                                        <FileDown className="w-3.5 h-3.5" />
                                                        <span>Buka Surat Bukti</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">Tanpa lampiran</span>
                                                )}
                                            </td>

                                            {/* Status Verifikasi Badge */}
                                            <td className="p-3.5">
                                                {p.status_acc === 'approved' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disetujui
                                                        </span>
                                                        <div className="text-[10px] text-slate-400">
                                                            Oleh: {p.disetujui_oleh_guru || 'Guru Pengampu'}
                                                        </div>
                                                    </div>
                                                )}
                                                {p.status_acc === 'rejected' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Ditolak
                                                        </span>
                                                        <div className="text-[10px] text-slate-400">
                                                            Oleh: {p.disetujui_oleh_guru || 'Guru Pengampu'}
                                                        </div>
                                                    </div>
                                                )}
                                                {(!p.status_acc || p.status_acc === 'pending') && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Review
                                                    </span>
                                                )}
                                            </td>

                                            {/* Kolom Aksi & Finalisasi ACC */}
                                            <td className="p-3.5 text-right">
                                                {isLoading ? (
                                                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium py-1">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </div>
                                                ) : p.status_acc === 'approved' ? (
                                                    // State Final: Sudah Disetujui
                                                    (() => {
                                                        const revision = getRevisionInfo(p);
                                                        return (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                                    <Check className="w-3 h-3 text-emerald-600" /> Final (Tercatat Presensi)
                                                                </span>
                                                                {revision.allowed ? (
                                                                    <button
                                                                        onClick={() => handleAccPerizinan(p.id, 'rejected', namaSiswa)}
                                                                        title={`Ubah status menjadi tolak (${revision.text})`}
                                                                        className="text-[11px] text-slate-400 hover:text-rose-600 hover:underline px-1 py-1 transition"
                                                                    >
                                                                        Ubah ke Tolak
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="Keputusan terkunci permanen karena telah melewati batas 1 hari">
                                                                        🔒 Terkunci (&gt; 24 Jam)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()
                                                ) : p.status_acc === 'rejected' ? (
                                                    // State Final: Sudah Ditolak
                                                    (() => {
                                                        const revision = getRevisionInfo(p);
                                                        return (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                                                    <X className="w-3 h-3 text-rose-600" /> Final (Ditolak)
                                                                </span>
                                                                {revision.allowed ? (
                                                                    <button
                                                                        onClick={() => handleAccPerizinan(p.id, 'approved', namaSiswa)}
                                                                        title={`Tinjau ulang dan setujui izin ini (${revision.text})`}
                                                                        className="text-[11px] text-slate-400 hover:text-emerald-600 hover:underline px-1 py-1 transition"
                                                                    >
                                                                        Ubah ke Setujui
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="Keputusan terkunci permanen karena telah melewati batas 1 hari">
                                                                        🔒 Terkunci (&gt; 24 Jam)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    // State Pending: Tombol Aksi Utama
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAccPerizinan(p.id, 'approved', namaSiswa)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition shadow-2xs"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAccPerizinan(p.id, 'rejected', namaSiswa)}
                                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition shadow-2xs"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
