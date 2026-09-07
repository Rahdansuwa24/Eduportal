import React, { useState } from 'react';
import { CheckSquare, Check, X } from 'lucide-react';

export const AccSoalUjian = () => {
    const [ujianAccList, setUjianAccList] = useState([
        { id: 101, judul: 'Kuis Bab 2 Trigonometri', guru: 'Pak Budi (Math)', mapel: 'Matematika Wajib', durasi: 45, status: 'pending' },
        { id: 102, judul: 'UTS Fisika Dasar', guru: 'Bu Ani (Fisika)', mapel: 'Fisika Peminatan', durasi: 60, status: 'approved' },
    ]);

    const handleAccStatus = (id, newStatus) => {
        setUjianAccList(ujianAccList.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                    <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">Persetujuan (ACC) Draft Soal Ujian</h2>
                    <p className="text-xs text-slate-500">Verifikasi dan setujui soal ujian yang diajukan oleh Guru</p>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="p-3.5">Judul Ujian</th>
                            <th className="p-3.5">Guru Pengaju</th>
                            <th className="p-3.5">Mapel</th>
                            <th className="p-3.5">Durasi</th>
                            <th className="p-3.5">Status ACC</th>
                            <th className="p-3.5 text-right">Aksi Konfirmasi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {ujianAccList.map((u) => (
                            <tr key={u.id}>
                                <td className="p-3.5 font-semibold text-slate-800">{u.judul}</td>
                                <td className="p-3.5 text-slate-600">{u.guru}</td>
                                <td className="p-3.5 text-slate-600">{u.mapel}</td>
                                <td className="p-3.5 text-slate-600">{u.durasi} Menit</td>
                                <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                        u.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                        u.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="p-3.5 text-right space-x-2">
                                    <button onClick={() => handleAccStatus(u.id, 'approved')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition">
                                        <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button onClick={() => handleAccStatus(u.id, 'rejected')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition">
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
