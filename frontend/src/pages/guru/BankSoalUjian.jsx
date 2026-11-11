import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    XCircle,
    ArrowLeft,
    CheckSquare
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/authContext';

export const BankSoalUjian = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [bankSoalList, setBankSoalList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Navigation & Page State for Create View
    const queryParams = new URLSearchParams(location.search);
    const isUrlCreate = queryParams.get('action') === 'create';
    const [localCreateView, setLocalCreateView] = useState(false);
    const isCreatePage = isUrlCreate || localCreateView;

    const handleOpenCreateView = () => {
        setLocalCreateView(true);
        navigate('/guru?tab=bank-soal&action=create');
    };

    const handleCancelCreate = () => {
        setLocalCreateView(false);
        navigate('/guru?tab=bank-soal');
    };

    // Form State for Creating Soal
    const [submitting, setSubmitting] = useState(false);
    const [judul, setJudul] = useState('');
    const [mapelId, setMapelId] = useState('');
    const [durasi, setDurasi] = useState(60);

    // Dynamic questions in Create View
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

    // Modal Preview State (Read Only)
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
        if (e && e.preventDefault) e.preventDefault();
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
            handleCancelCreate();
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
            setBankSoalList(bankSoalList.filter(item => item.id !== id));
        } catch (err) {
            alert('Gagal menghapus paket soal: ' + err.message);
        }
    };

    // Filter Ujian
    const filteredUjian = bankSoalList.filter((item) => {
        const matchesSearch =
            item.judul_ujian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_guru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_mapel?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || item.status_acc === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // -------------------------------------------------------------
    // TAMPILAN HALAMAN DEDIKASI: BUAT PAKET SOAL BARU (FULL PAGE)
    // -------------------------------------------------------------
    if (isCreatePage) {
        return (
            <div className="space-y-6 animate-in fade-in duration-200">
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

                {/* Top Action Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancelCreate}
                                className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition"
                                title="Kembali ke Daftar Bank Soal"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Penyusunan Ujian Manual</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">Formulir Penuh</span>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 mt-0.5">Buat Paket Soal Ujian Baru</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleCancelCreate}
                                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateSoal}
                                disabled={submitting}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                                <span>{submitting ? 'Menyimpan...' : 'Ajukan ke Waka Kurikulum'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleCreateSoal} className="space-y-6">
                    {/* Card 1: Informasi Dasar Paket Ujian */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-bold text-slate-800">1. Informasi & Pengaturan Ujian</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            <div className="sm:col-span-6">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Judul Ujian / Kuis <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="misal: Ulangan Harian Bab 2: Kinematika Gerak Lurus"
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                                />
                            </div>

                            <div className="sm:col-span-4">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Mata Pelajaran <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={mapelId}
                                    onChange={(e) => setMapelId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                                >
                                    {mapelList.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama_mapel} ({m.tingkat_kelas || 'Semua'} {m.jurusan || ''})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Durasi Ujian <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="5"
                                        max="300"
                                        required
                                        value={durasi}
                                        onChange={(e) => setDurasi(e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 pr-14"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                                        Menit
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Daftar Butir Soal Pilihan Ganda */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-xs">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">
                                    2. Daftar Butir Pertanyaan ({soalList.length} Soal)
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Tuliskan pertanyaan dan tentukan 4 pilihan opsi (A, B, C, D) serta kunci jawaban yang benar.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-indigo-200 shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Butir Soal</span>
                            </button>
                        </div>

                        {soalList.map((s, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 transition hover:border-slate-300">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                            Soal Nomor {idx + 1}
                                        </span>
                                    </div>
                                    {soalList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(idx)}
                                            className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus Soal</span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Kalimat Pertanyaan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder="Ketikkan teks pertanyaan soal secara jelas di sini..."
                                        value={s.pertanyaan}
                                        onChange={(e) => handleQuestionChange(idx, 'pertanyaan', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 leading-relaxed"
                                    />
                                </div>

                                {/* Pilihan Jawaban A, B, C, D */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Pilihan Jawaban (A, B, C, D) & Tentukan Kunci Benar:
                                        </label>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            Klik tombol tombol "Jadikan Kunci" pada opsi yang benar
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {['a', 'b', 'c', 'd'].map((optKey) => {
                                            const upperKey = optKey.toUpperCase();
                                            const isKey = s.kunci_jawaban === upperKey;
                                            return (
                                                <div
                                                    key={optKey}
                                                    className={`p-3.5 rounded-xl border transition ${
                                                        isKey
                                                            ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400'
                                                            : 'bg-slate-50/60 border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-bold ${isKey ? 'text-emerald-800' : 'text-slate-600'}`}>
                                                            Pilihan {upperKey} {isKey && '✓ (Kunci Jawaban)'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuestionChange(idx, 'kunci_jawaban', upperKey)}
                                                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                                                                isKey
                                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                                    : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                                                            }`}
                                                        >
                                                            {isKey ? 'Kunci Terpilih' : 'Jadikan Kunci'}
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder={`Teks pilihan jawaban ${upperKey}...`}
                                                        value={s[`pilihan_${optKey}`]}
                                                        onChange={(e) => handleQuestionChange(idx, `pilihan_${optKey}`, e.target.value)}
                                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Tombol Tambah Soal Tambahan */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="w-full py-4 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Butir Pertanyaan Berikutnya (Soal #{soalList.length + 1})</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleCancelCreate}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                        >
                            ← Batalkan & Kembali ke Bank Soal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                            <span>{submitting ? 'Menyimpan Paket Ujian...' : 'Simpan & Ajukan ke Waka Kurikulum'}</span>
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // -------------------------------------------------------------
    // TAMPILAN DAFTAR BANK SOAL & MANAJEMEN UJIAN (LIST VIEW)
    // -------------------------------------------------------------
    return (
        <div className="space-y-6 animate-in fade-in duration-200">
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

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => fetchData(true)} className="text-xs text-rose-700 font-semibold underline hover:no-underline">Coba Lagi</button>
                </div>
            )}

            {/* Container Bank Soal Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
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
                            onClick={handleOpenCreateView}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
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
                            <option value="rejected">Ditolak Waka (Rejected)</option>
                        </select>
                    </div>
                </div>

                {/* Table Daftar Paket Soal */}
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                        <span>Memuat data paket soal ujian...</span>
                    </div>
                ) : filteredUjian.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        <FileQuestion className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                        <p className="font-semibold text-sm text-slate-700">Belum Ada Paket Soal Ujian</p>
                        <p className="text-xs text-slate-400 mt-1">Klik tombol "Buat Paket Soal Baru" untuk menyusun ujian pertama Anda.</p>
                        <button
                            onClick={handleOpenCreateView}
                            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Mulai Buat Soal Sekarang</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                                    <th className="py-3 px-4">Judul Ujian</th>
                                    <th className="py-3 px-4">Mata Pelajaran</th>
                                    <th className="py-3 px-4">Durasi</th>
                                    <th className="py-3 px-4">Status ACC</th>
                                    <th className="py-3 px-4">Catatan Waka</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUjian.map((item) => {
                                    const isMine = !item.guru_id || (user && user.id === item.guru_id);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                <div>{item.judul_ujian}</div>
                                                <div className="text-[10px] text-slate-400 font-normal">Dibuat oleh: {item.nama_guru || 'Guru Pengampu'}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-medium border border-slate-200">
                                                    {item.nama_mapel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.durasi_menit} Menit
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {item.status_acc === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Disetujui
                                                    </span>
                                                )}
                                                {item.status_acc === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5" /> Menunggu Review
                                                    </span>
                                                )}
                                                {item.status_acc === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Ditolak Waka
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                                                {item.catatan_waka ? (
                                                    <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 block truncate" title={item.catatan_waka}>
                                                        {item.catatan_waka}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum ada catatan</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleViewDetail(item.id)}
                                                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Lihat Detail Butir Soal"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {isMine && (
                                                        <button
                                                            onClick={() => handleDeleteUjian(item.id, item.judul_ujian)}
                                                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                                                            title="Hapus Paket Soal"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

            {/* Modal Detail Soal (Read Only Preview) */}
            {selectedUjian && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 animate-in fade-in">
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
                                    <div key={s.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                        <div className="font-semibold text-slate-800">
                                            {idx + 1}. {s.pertanyaan}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                                            <div className={`p-2 rounded-lg border ${s.kunci_jawaban === 'A' ? 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                A. {s.pilihan_a}
                                            </div>
                                            <div className={`p-2 rounded-lg border ${s.kunci_jawaban === 'B' ? 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                B. {s.pilihan_b}
                                            </div>
                                            <div className={`p-2 rounded-lg border ${s.kunci_jawaban === 'C' ? 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                C. {s.pilihan_c}
                                            </div>
                                            <div className={`p-2 rounded-lg border ${s.kunci_jawaban === 'D' ? 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
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
