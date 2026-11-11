import React, { useState, useEffect } from 'react';
import {
    FileText,
    FileUp,
    Check,
    Trash2,
    FileCheck,
    Download,
    ExternalLink,
    RefreshCw,
    Search,
    Filter,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { apiFetch, getFileUrl } from '@/services/api';
import { useAuth } from '@/context/authContext';

export const UnggahMateri = () => {
    const { user } = useAuth();
    const [materiList, setMateriList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form State
    const [judulMateri, setJudulMateri] = useState('');
    const [selectedMapelId, setSelectedMapelId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMapel, setFilterMapel] = useState('all');

    // Toast & Error Messages
    const [toastMessage, setToastMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Load Data Materi dan Mapel
    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [materiData, mapelData] = await Promise.all([
                apiFetch('/materi'),
                apiFetch('/mapel')
            ]);
            setMateriList(materiData || []);
            setMapelList(mapelData || []);
            if (mapelData && mapelData.length > 0 && !selectedMapelId) {
                setSelectedMapelId(String(mapelData[0].id));
            }
            setErrorMessage('');
        } catch (err) {
            console.error('Error fetching data materi:', err);
            setErrorMessage('Gagal memuat data: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                alert('Berkas harus berformat PDF!');
                return;
            }
            if (file.size > 25 * 1024 * 1024) {
                alert('Ukuran berkas maksimal 25 MB.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmitMateri = async (e) => {
        e.preventDefault();
        if (!judulMateri.trim()) {
            alert('Judul materi wajib diisi!');
            return;
        }
        if (!selectedMapelId) {
            alert('Silakan pilih mata pelajaran!');
            return;
        }
        if (!selectedFile) {
            alert('Silakan pilih berkas materi PDF!');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('judul', judulMateri.trim());
            formData.append('mapel_id', selectedMapelId);
            formData.append('file_materi', selectedFile);

            await apiFetch('/materi', {
                method: 'POST',
                body: formData
            });

            showToast(`Materi "${judulMateri}" berhasil diunggah.`);
            setJudulMateri('');
            setSelectedFile(null);
            fetchData();
        } catch (err) {
            alert('Gagal mengunggah materi: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMateri = async (id, judul) => {
        if (!window.confirm(`Hapus materi "${judul}"? File fisik di server juga akan dihapus.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await apiFetch(`/materi/${id}`, {
                method: 'DELETE'
            });
            showToast(`Materi "${judul}" berhasil dihapus.`);
            setMateriList(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Gagal menghapus materi: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    // Filtered Materi
    const filteredMateri = materiList.filter(item => {
        const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.nama_mapel && item.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.nama_guru && item.nama_guru.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMapel = filterMapel === 'all' || String(item.mapel_id) === String(filterMapel);
        return matchesSearch && matchesMapel;
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

            {/* Form Unggah Materi */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Unggah Materi Pembelajaran (PDF)</h2>
                            <p className="text-xs text-slate-500">Berkas modul dan materi yang diunggah akan langsung tersinkronisasi ke portal Siswa</p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                        title="Segarkan data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                    </button>
                </div>

                <form onSubmit={handleSubmitMateri} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran Target</label>
                            <select
                                value={selectedMapelId}
                                onChange={(e) => setSelectedMapelId(e.target.value)}
                                required
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
                            >
                                {mapelList.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nama_mapel} ({m.tingkat_kelas || 'Semua'} {m.jurusan || ''})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Materi Pembelajaran</label>
                            <input
                                type="text"
                                required
                                placeholder="misal: Bab 3: Dinamika Gerak dan Hukum Newton"
                                value={judulMateri}
                                onChange={(e) => setJudulMateri(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Berkas PDF Dokumen Materi</label>
                        <label className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer block ${
                            selectedFile ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-300'
                        }`}>
                            <FileUp className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <p className="text-xs text-slate-700 font-semibold">
                                {selectedFile ? `Berkas Terpilih: ${selectedFile.name}` : 'Klik untuk memilih dokumen PDF atau letakkan file di sini'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                                {selectedFile ? `Ukuran: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Format wajib PDF, ukuran maksimal 25 MB'}
                            </p>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                            {submitting ? 'Mengunggah ke Server...' : 'Simpan dan Terbitkan Materi'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Materi Terunggah */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">Katalog Materi yang Tersedia</h3>
                        <p className="text-xs text-slate-500">Total {filteredMateri.length} materi terdaftar</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari materi / mapel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                            <select
                                value={filterMapel}
                                onChange={(e) => setFilterMapel(e.target.value)}
                                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                            >
                                <option value="all">Semua Mapel</option>
                                {mapelList.map(m => (
                                    <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <span className="text-xs">Memuat katalog materi...</span>
                    </div>
                ) : filteredMateri.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Belum ada materi pembelajaran yang diunggah.</p>
                        <p className="text-xs text-slate-400 mt-1">Gunakan formulir di atas untuk mengunggah materi pelajaran pertama Anda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                                <tr>
                                    <th className="p-3.5">Judul Materi</th>
                                    <th className="p-3.5">Mata Pelajaran</th>
                                    <th className="p-3.5">Guru Pengunggah</th>
                                    <th className="p-3.5">Tanggal Dibuat</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {filteredMateri.map((item) => {
                                    const fileUrl = getFileUrl(item.file_path);
                                    const isOwner = user && (user.role === 'admin' || user.role === 'waka' || user.id === item.guru_id);
                                    const isDeleting = deletingId === item.id;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3.5 font-semibold text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <FileCheck className="w-4 h-4 text-violet-600 shrink-0" />
                                                    <span>{item.judul}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-slate-600 font-medium">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                                                    {item.nama_mapel}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-slate-600">
                                                {item.nama_guru || 'Guru'}
                                            </td>
                                            <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded transition inline-flex items-center gap-1 border border-indigo-200"
                                                        title="Buka / Unduh Berkas PDF"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Buka PDF</span>
                                                    </a>

                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleDeleteMateri(item.id, item.judul)}
                                                            disabled={isDeleting}
                                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded transition inline-flex items-center gap-1 border border-rose-200 disabled:opacity-50"
                                                            title="Hapus materi ini"
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
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
        </div>
    );
};
