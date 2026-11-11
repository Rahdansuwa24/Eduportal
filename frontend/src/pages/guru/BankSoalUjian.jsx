import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    CheckCircle,
    Clock,
    X,
    Check,
    Search,
    Filter,
    RotateCcw,
    Trash2,
    Eye,
    AlertCircle,
    Loader2,
    RefreshCw,
    FileQuestion,
    MessageSquare,
    XCircle
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/authContext';

export const BankSoalUjian = () => {
    const { user } = useAuth();
    const [bankSoalList, setBankSoalList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal Create State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [judul, setJudul] = useState('');
    const [mapelId, setMapelId] = useState('');
    const [durasi, setDurasi] = useState(60);

    // Dynamic questions in Create Modal
    const [soalList, setSoalList] = useState([
        {
            pertanyaan: '',
            pilihan_a: '',
            pilihan_b: '',
            pilihan_c: '',
            pilihan_d: '',
            kunci_jawaban: 'A'
        }
    ]);

    // Modal Preview State
    const [selectedUjian, setSelectedUjian] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Toast & Error Messages
    const [toastMessage, setToastMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Load Data Ujian dan Mapel dari Backend
    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [ujianData, mapelData] = await Promise.all([
                apiFetch('/ujian'),
                apiFetch('/mapel')
            ]);
            setBankSoalList(ujianData || []);
            setMapelList(mapelData || []);
            if (mapelData && mapelData.length > 0 && !mapelId) {
                setMapelId(String(mapelData[0].id));
            }
            setErrorMessage('');
        } catch (err) {
            console.error('Error fetching ujian data:', err);
            setErrorMessage('Gagal memuat data ujian: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Soal Form Dynamic Add / Remove / Edit
    const handleAddQuestion = () => {
        setSoalList([
            ...soalList,
            {
                pertanyaan: '',
                pilihan_a: '',
                pilihan_b: '',
                pilihan_c: '',
                pilihan_d: '',
                kunci_jawaban: 'A'
            }
        ]);
    };

    const handleRemoveQuestion = (idx) => {
        if (soalList.length <= 1) {
            alert('Minimal paket soal harus memiliki 1 butir pertanyaan.');
            return;
        }
        setSoalList(soalList.filter((_, i) => i !== idx));
    };

    const handleQuestionChange = (idx, field, value) => {
        const updated = [...soalList];
        updated[idx][field] = value;
        setSoalList(updated);
    };

    // Submit Create Paket Ujian
    const handleCreateSoal = async (e) => {
        e.preventDefault();
        if (!judul.trim()) {
            alert('Judul ujian wajib diisi!');
            return;
        }
        if (!mapelId) {
            alert('Mata pelajaran wajib dipilih!');
            return;
        }

        // Validasi butir soal
        for (let i = 0; i < soalList.length; i++) {
            const s = soalList[i];
            if (!s.pertanyaan.trim() || !s.pilihan_a.trim() || !s.pilihan_b.trim() || !s.pilihan_c.trim() || !s.pilihan_d.trim()) {
                alert(`Soal #${i + 1} belum lengkap. Pertanyaan dan keempat opsi A, B, C, D wajib diisi.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            await apiFetch('/ujian', {
                method: 'POST',
                body: JSON.stringify({
                    judul_ujian: judul.trim(),
                    mapel_id: mapelId,
                    durasi_menit: parseInt(durasi, 10) || 60,
                    soal: soalList
                })
            });

            showToast(`Paket soal "${judul}" berhasil dibuat dan diajukan ke Waka Kurikulum.`);
            setShowCreateModal(false);
            setJudul('');
            setSoalList([
                {
                    pertanyaan: '',
                    pilihan_a: '',
                    pilihan_b: '',
                    pilihan_c: '',
                    pilihan_d: '',
                    kunci_jawaban: 'A'
                }
            ]);
            fetchData();
        } catch (err) {
            alert('Gagal membuat paket soal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Open Detail Modal Preview
    const handleViewDetail = async (ujianId) => {
        setLoadingDetail(true);
        setSelectedUjian(null);
        try {
            const detail = await apiFetch(`/ujian/${ujianId}`);
            setSelectedUjian(detail);
        } catch (err) {
            alert('Gagal memuat detail soal: ' + err.message);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Delete Paket Ujian
    const handleDeleteUjian = async (id, judul) => {
        if (!window.confirm(`Hapus paket soal "${judul}" beserta seluruh butir soalnya?`)) {
            return;
        }

        try {
            await apiFetch(`/ujian/${id}`, {
                method: 'DELETE'
            });
            showToast(`Paket soal "${judul}" berhasil dihapus.`);
            setBankSoalList(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            alert('Gagal menghapus paket soal: ' + err.message);
        }
    };

    // Filter List
    const filteredList = bankSoalList.filter(item => {
        const matchesSearch = item.judul_ujian.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.nama_mapel && item.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.nama_guru && item.nama_guru.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || item.status_acc === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Toast Success */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => fetchData(true)} className="text-xs text-rose-700 font-semibold underline hover:no-underline">Coba Lagi</button>
                </div>
            )}

            {/* Container Bank Soal Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Bank Soal dan Manajemen Ujian</h2>
                            <p className="text-xs text-slate-500">Kelola paket kuis serta ujian, lalu ajukan persetujuan (ACC) ke Waka Kurikulum</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                            title="Segarkan data"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Paket Soal Baru</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari judul ujian, nama guru, atau mata pelajaran..."
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
                            <option value="all">Semua Status Persetujuan</option>
                            <option value="approved">Disetujui Waka (Approved)</option>
                            <option value="pending">Menunggu ACC (Pending)</option>
                            <option value="rejected">Ditolak / Revisi (Rejected)</option>
                        </select>
                    </div>
                </div>

                {/* Table Daftar Paket Soal */}
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <span className="text-xs">Memuat daftar bank soal...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Belum ada paket ujian ditemukan.</p>
                        <p className="text-xs text-slate-400 mt-1">Klik tombol "Buat Paket Soal Baru" untuk menyusun ujian pertama Anda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                                <tr>
                                    <th className="p-3.5">Judul Ujian / Kuis</th>
                                    <th className="p-3.5">Mata Pelajaran</th>
                                    <th className="p-3.5">Jumlah Soal</th>
                                    <th className="p-3.5">Durasi Waktu</th>
                                    <th className="p-3.5">Status Persetujuan</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {filteredList.map((item) => {
                                    const isOwner = user && (user.role === 'admin' || user.role === 'waka' || user.id === item.guru_id);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3.5 font-semibold text-slate-800">
                                                <div>{item.judul_ujian}</div>
                                                <div className="text-[11px] font-normal text-slate-400">
                                                    Dibuat oleh: {item.nama_guru || 'Guru'} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-slate-600">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                                                    {item.nama_mapel}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-mono text-slate-700 font-semibold">
                                                {item.jumlah_soal || 0} Soal
                                            </td>
                                            <td className="p-3.5 text-slate-600 font-mono">
                                                {item.durasi_menit} Menit
                                            </td>
                                            <td className="p-3.5">
                                                <div className="space-y-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 ${
                                                        item.status_acc === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                        item.status_acc === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {item.status_acc === 'approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                                        {item.status_acc === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                                                        {item.status_acc === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                                                        {item.status_acc}
                                                    </span>

                                                    {item.catatan_waka && (
                                                        <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span className="truncate max-w-xs" title={item.catatan_waka}>
                                                                Catatan: {item.catatan_waka}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleViewDetail(item.id)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition inline-flex items-center gap-1"
                                                        title="Lihat Butir Soal"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Preview</span>
                                                    </button>

                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleDeleteUjian(item.id, item.judul_ujian)}
                                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded transition inline-flex items-center gap-1 border border-rose-200"
                                                            title="Hapus paket ujian"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal 1: Buat Paket Soal Baru */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-800 text-base">Buat Paket Soal Ujian Baru</h3>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSoal} className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="sm:col-span-3">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Ujian / Kuis</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="misal: Ulangan Harian Bab 2: Kinematika"
                                        value={judul}
                                        onChange={(e) => setJudul(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                                    <select
                                        value={mapelId}
                                        onChange={(e) => setMapelId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {mapelList.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nama_mapel} ({m.tingkat_kelas || 'Semua'} {m.jurusan || ''})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="300"
                                        required
                                        value={durasi}
                                        onChange={(e) => setDurasi(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                </div>
                            </div>

                            {/* Section Butir Soal */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h4 className="font-bold text-slate-800 text-sm">
                                        Daftar Butir Soal Pilihan Ganda ({soalList.length} Soal)
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg flex items-center gap-1 transition border border-indigo-200"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Butir Soal</span>
                                    </button>
                                </div>

                                {soalList.map((s, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-900 uppercase">
                                                Nomor {idx + 1}
                                            </span>
                                            {soalList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(idx)}
                                                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus Soal
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pertanyaan</label>
                                            <textarea
                                                rows="2"
                                                required
                                                placeholder="Tuliskan pertanyaan soal di sini..."
                                                value={s.pertanyaan}
                                                onChange={(e) => handleQuestionChange(idx, 'pertanyaan', e.target.value)}
                                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pilihan A</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={s.pilihan_a}
                                                    onChange={(e) => handleQuestionChange(idx, 'pilihan_a', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pilihan B</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={s.pilihan_b}
                                                    onChange={(e) => handleQuestionChange(idx, 'pilihan_b', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pilihan C</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={s.pilihan_c}
                                                    onChange={(e) => handleQuestionChange(idx, 'pilihan_c', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pilihan D</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={s.pilihan_d}
                                                    onChange={(e) => handleQuestionChange(idx, 'pilihan_d', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-48">
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kunci Jawaban Benar</label>
                                            <select
                                                value={s.kunci_jawaban}
                                                onChange={(e) => handleQuestionChange(idx, 'kunci_jawaban', e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="A">Pilihan A</option>
                                                <option value="B">Pilihan B</option>
                                                <option value="C">Pilihan C</option>
                                                <option value="D">Pilihan D</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    {submitting ? 'Menyimpan Paket Ujian...' : 'Ajukan ke Waka Kurikulum'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Preview Detail Butir Soal */}
            {selectedUjian && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 animate-in fade-in">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">{selectedUjian.judul_ujian}</h3>
                                <p className="text-xs text-slate-500">
                                    {selectedUjian.nama_mapel} • {selectedUjian.durasi_menit} Menit • Status: {selectedUjian.status_acc}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedUjian(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {selectedUjian.soal && selectedUjian.soal.length > 0 ? (
                                selectedUjian.soal.map((s, idx) => (
                                    <div key={s.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                                        <div className="font-semibold text-slate-800">
                                            {idx + 1}. {s.pertanyaan}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                                            <div className={`p-1.5 rounded ${s.kunci_jawaban === 'A' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                                A. {s.pilihan_a}
                                            </div>
                                            <div className={`p-1.5 rounded ${s.kunci_jawaban === 'B' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                                B. {s.pilihan_b}
                                            </div>
                                            <div className={`p-1.5 rounded ${s.kunci_jawaban === 'C' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                                C. {s.pilihan_c}
                                            </div>
                                            <div className={`p-1.5 rounded ${s.kunci_jawaban === 'D' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                                D. {s.pilihan_d}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-500 text-xs">Tidak ada butir soal pada paket ini.</p>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedUjian(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                                Tutup Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
