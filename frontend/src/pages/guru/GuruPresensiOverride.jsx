import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Edit3, X, Clock, BookOpen } from 'lucide-react';
import { apiFetch } from '@/services/api';

export const GuruPresensiOverride = () => {
    const [presensiSiswaList, setPresensiSiswaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchPresensi, setSearchPresensi] = useState('');

    // State Modal Pop-up Override
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [targetStatus, setTargetStatus] = useState('hadir');
    const [catatanGuru, setCatatanGuru] = useState('');

    // Load Rekap Presensi Per Mapel Real dari API
    const loadPresensi = async () => {
        try {
            const data = await apiFetch('/presensi/today');
            setPresensiSiswaList(data);
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
            loadPresensi();
        } catch (err) {
            alert(`Gagal override status: ${err.message}`);
        }
    };

    const filteredPresensi = presensiSiswaList.filter(p =>
        (p.nama_siswa || p.nama || '').toLowerCase().includes(searchPresensi.toLowerCase()) ||
        (p.nama_mapel || '').toLowerCase().includes(searchPresensi.toLowerCase()) ||
        (p.kelas || '').toLowerCase().includes(searchPresensi.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 text-green-700 rounded-lg">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Rekap & Override Presensi Per Mata Pelajaran</h2>
                        <p className="text-xs text-slate-500">Guru dapat mengubah status presensi siswa per jadwal jam mapel</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Cari Siswa / Mapel / Kelas..."
                        value={searchPresensi}
                        onChange={e => setSearchPresensi(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                        <tr>
                            <th className="p-3.5">Nama Siswa</th>
                            <th className="p-3.5">Mata Pelajaran & Waktu Belajar</th>
                            <th className="p-3.5">Waktu Absen</th>
                            <th className="p-3.5">Status Presensi</th>
                            <th className="p-3.5">Catatan Guru</th>
                            <th className="p-3.5 text-right">Aksi Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredPresensi.map((s, idx) => (
                            <tr key={s.presensi_id || `item-${idx}`} className="hover:bg-slate-50/50">
                                <td className="p-3.5 font-semibold text-slate-800">
                                    {s.nama_siswa || s.nama}
                                    <div className="text-xs text-slate-400 font-normal">Kelas {s.kelas || '10'}</div>
                                    {s.diubah_oleh_guru && (
                                        <div className="text-[10px] text-indigo-600 font-medium pt-0.5">✏️ Override oleh: {s.diubah_oleh_guru}</div>
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
                                    {s.waktu_absen ? new Date(s.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'}
                                    {s.is_late && <span className="ml-1 text-rose-600 font-bold text-[10px]">(Terlambat)</span>}
                                </td>
                                <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${s.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                            s.status === 'izin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                        {s.status || 'alpa'}
                                    </span>
                                </td>
                                <td className="p-3.5 text-xs text-slate-500 italic">
                                    {s.catatan_guru ? `"${s.catatan_guru}"` : '-'}
                                </td>
                                <td className="p-3.5 text-right">
                                    <button
                                        onClick={() => openOverrideModal(s)}
                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition border border-indigo-200"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Ubah Status
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL POP-UP OVERRIDE PRESENSI */}
            {isModalOpen && selectedSiswa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Pop-up Override Status Presensi Mapel</h3>
                                <p className="text-xs text-slate-500">Ubah status presensi per mata pelajaran</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
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
                                    <span className="px-2 py-0.5 bg-white rounded font-mono text-[11px] font-semibold text-indigo-700">Kelas {selectedSiswa.kelas || '10'}</span>
                                </div>
                                <div className="text-xs font-semibold text-indigo-800">
                                    📘 {selectedSiswa.nama_mapel} ({selectedSiswa.hari})
                                </div>
                            </div>

                            {/* Option Radio Status Baru */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Status Presensi Baru:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <label className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${targetStatus === 'hadir'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}>
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

                                    <label className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${targetStatus === 'izin'
                                            ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}>
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

                                    <label className={`
                                        p-3 rounded-lg border text-center cursor-pointer transition flex flex-col items-center gap-1 text-xs font-bold
                                        ${targetStatus === 'alpa'
                                            ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}>
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
                                    onChange={e => setCatatanGuru(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
