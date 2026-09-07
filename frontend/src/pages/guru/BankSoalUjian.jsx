import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle, Clock, X, Check, Search, Filter, RotateCcw } from 'lucide-react';

export const BankSoalUjian = () => {
    const [bankSoalList, setBankSoalList] = useState([
        { id: 1, judul: 'Kuis Bab 2 Trigonometri', mapel: 'Matematika Wajib', jumlahSoal: 10, durasi: 45, status: 'pending' },
        { id: 2, judul: 'UTS Fisika Dasar Semester 1', mapel: 'Fisika Peminatan', jumlahSoal: 25, durasi: 90, status: 'approved' },
        { id: 3, judul: 'Latihan Ulangan Harian Aljabar', mapel: 'Matematika Wajib', jumlahSoal: 15, durasi: 60, status: 'draft' },
    ]);

    // Modal state untuk Paket Soal Baru
    const [showModal, setShowModal] = useState(false);
    const [judul, setJudul] = useState('');
    const [mapel, setMapel] = useState('Matematika Wajib');
    const [jumlahSoal, setJumlahSoal] = useState(10);
    const [durasi, setDurasi] = useState(60);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [successMsg, setSuccessMsg] = useState('');

    const handleCreateSoal = (e) => {
        e.preventDefault();
        if (!judul) return;

        const newPaket = {
            id: Date.now(),
            judul,
            mapel,
            jumlahSoal: Number(jumlahSoal),
            durasi: Number(durasi),
            status: 'pending' // langsung diajukan ke Waka
        };

        setBankSoalList([newPaket, ...bankSoalList]);
        setJudul('');
        setShowModal(false);
        setSuccessMsg(`Paket soal "${judul}" berhasil dibuat dan diajukan ke Waka Kurikulum!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const filteredList = bankSoalList.filter(item => {
        const matchesSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mapel.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

            {/* Container Bank Soal */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Bank Soal & Manajemen Ujian Guru</h2>
                            <p className="text-xs text-slate-500">Kelola draft paket soal ujian dan ajukan persetujuan (ACC) ke Waka Kurikulum</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" /> Buat Paket Soal Baru
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari judul soal atau mata pelajaran..."
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
                            <option value="approved">🟢 Approved (Disetujui Waka)</option>
                            <option value="pending">🟡 Pending (Menunggu ACC)</option>
                            <option value="draft">⚪ Draft</option>
                        </select>
                    </div>
                </div>

                {/* Table Daftar Paket Soal */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Judul Ujian / Kuis</th>
                                <th className="p-3.5">Mata Pelajaran</th>
                                <th className="p-3.5">Jumlah Soal</th>
                                <th className="p-3.5">Durasi</th>
                                <th className="p-3.5">Status Persetujuan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredList.length > 0 ? (
                                filteredList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="p-3.5 font-semibold text-slate-800">{item.judul}</td>
                                        <td className="p-3.5 text-slate-600">{item.mapel}</td>
                                        <td className="p-3.5 font-mono text-xs text-slate-700">{item.jumlahSoal} Soal</td>
                                        <td className="p-3.5 text-slate-600">{item.durasi} Menit</td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${
                                                item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {item.status === 'approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                                {item.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                                        Tidak ada paket soal yang cocok dengan kriteria pencarian/filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Popup Buat Paket Soal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">Buat Paket Soal Ujian Baru</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Paket Ujian / Kuis</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Kuis Bab 3 Trigonometri"
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                                <select
                                    value={mapel}
                                    onChange={(e) => setMapel(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
                                >
                                    <option value="Matematika Wajib">📘 Matematika Wajib</option>
                                    <option value="Bahasa Indonesia">📘 Bahasa Indonesia</option>
                                    <option value="Fisika Peminatan">🔬 Fisika Peminatan</option>
                                    <option value="Biologi Peminatan">🔬 Biologi Peminatan</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Soal</label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={jumlahSoal}
                                        onChange={(e) => setJumlahSoal(e.target.value)}
                                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                                    <input
                                        type="number"
                                        min={5}
                                        required
                                        value={durasi}
                                        onChange={(e) => setDurasi(e.target.value)}
                                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Check className="w-4 h-4" /> Ajukan ke Waka ACC
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
