import React, { useState, useEffect } from 'react';
import { FileCheck, FileDown, Check, X } from 'lucide-react';
import { apiFetch, getFileUrl } from '@/services/api';

export const GuruAccPerizinan = () => {
    const [perizinanList, setPerizinanList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPerizinan = async () => {
        try {
            const data = await apiFetch('/perizinan');
            setPerizinanList(data);
        } catch (err) {
            console.error('Gagal memuat data perizinan:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPerizinan();
    }, []);

    const handleAccPerizinan = async (id, newStatus) => {
        try {
            const res = await apiFetch(`/perizinan/${id}/acc`, {
                method: 'PATCH',
                body: JSON.stringify({ status_acc: newStatus })
            });
            setPerizinanList(perizinanList.map(p => p.id === id ? { ...p, status_acc: res.perizinan.status_acc } : p));
        } catch (err) {
            alert(`Gagal memverifikasi surat izin: ${err.message}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                    <FileCheck className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">Verifikasi ACC Surat Izin Siswa</h2>
                    <p className="text-xs text-slate-500">Periksa pengajuan izin dan berkas bukti surat yang diunggah siswa</p>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                        <tr>
                            <th className="p-3.5">Nama Siswa</th>
                            <th className="p-3.5">Alasan & Tanggal</th>
                            <th className="p-3.5">Berkas Bukti Surat</th>
                            <th className="p-3.5">Status Verifikasi</th>
                            <th className="p-3.5 text-right">Aksi ACC</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {perizinanList.map((p) => (
                            <tr key={p.id}>
                                <td className="p-3.5 font-semibold text-slate-800">
                                    {p.nama_siswa || p.nama}
                                    <div className="text-xs text-slate-400 font-normal">{p.kelas}</div>
                                </td>
                                <td className="p-3.5 text-xs text-slate-700">
                                    <div className="font-medium text-slate-900 uppercase font-bold">{p.alasan}</div>
                                    <div className="text-[11px] text-slate-500">{p.tanggal_mulai} s.d {p.tanggal_selesai}</div>
                                </td>
                                <td className="p-3.5">
                                    <a
                                        href={getFileUrl(p.bukti_file_path)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-mono text-xs rounded transition border border-slate-200"
                                    >
                                        <FileDown className="w-3.5 h-3.5" /> Buka File Bukti
                                    </a>
                                </td>
                                <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${p.status_acc === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                            p.status_acc === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {p.status_acc || p.status}
                                    </span>
                                </td>
                                <td className="p-3.5 text-right space-x-1.5">
                                    <button
                                        onClick={() => handleAccPerizinan(p.id, 'approved')}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                                    >
                                        <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAccPerizinan(p.id, 'rejected')}
                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                                    >
                                        <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
