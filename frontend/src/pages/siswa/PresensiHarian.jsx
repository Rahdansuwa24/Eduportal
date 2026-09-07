import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PresensiHarian = () => {
    const [presensiSubmitted, setPresensiSubmitted] = useState(false);
    const [presensiStatus, setPresensiStatus] = useState('hadir');
    const [presensiTime, setPresensiTime] = useState('');

    const [historyPresensi, setHistoryPresensi] = useState([
        { id: 1, tanggal: 'Senin, 03 Agu 2026', status: 'hadir', jam: '07:15 WIB' },
        { id: 2, tanggal: 'Jumat, 31 Jul 2026', status: 'hadir', jam: '07:10 WIB' },
        { id: 3, tanggal: 'Kamis, 30 Jul 2026', status: 'izin', jam: '08:00 WIB' },
        { id: 4, tanggal: 'Rabu, 29 Jul 2026', status: 'hadir', jam: '07:05 WIB' },
    ]);

    const handlePresensi = (status) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

        setPresensiStatus(status);
        setPresensiTime(timeString);
        setPresensiSubmitted(true);

        const newRecord = {
            id: Date.now(),
            tanggal: dateString,
            status: status,
            jam: timeString
        };
        setHistoryPresensi([newRecord, ...historyPresensi]);
    };

    return (
        <div className="space-y-6">
            {/* Presensi Action Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Presensi Kehadiran Harian Siswa</h2>
                            <p className="text-xs text-slate-500">
                                Hari Ini: <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {!presensiSubmitted ? (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-600">Silakan konfirmasi status kehadiran Anda hari ini:</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => handlePresensi('hadir')}
                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                                ✓ Hadir
                            </button>
                            <button
                                onClick={() => handlePresensi('izin')}
                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                                ✉ Izin
                            </button>
                            <button
                                onClick={() => handlePresensi('alpa')}
                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                                ✕ Alpa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3 text-emerald-800 font-semibold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <div>Presensi Hari Ini Berhasil Diterima: <span className="uppercase underline font-bold">{presensiStatus}</span></div>
                                <div className="text-xs text-emerald-600 font-normal mt-0.5">Waktu Pencatatan: {presensiTime}</div>
                            </div>
                        </div>
                        <button onClick={() => setPresensiSubmitted(false)} className="text-xs text-emerald-700 hover:underline font-medium px-2 py-1 bg-emerald-100 rounded">
                            Ubah Status
                        </button>
                    </div>
                )}
            </div>

            {/* Riwayat Presensi */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Riwayat Presensi Kehadiran</h3>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Tanggal</th>
                                <th className="p-3.5">Jam Log</th>
                                <th className="p-3.5 text-right">Status Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {historyPresensi.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="p-3.5 font-semibold text-slate-800">{item.tanggal}</td>
                                    <td className="p-3.5 font-mono text-xs text-slate-600">{item.jam}</td>
                                    <td className="p-3.5 text-right">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                            item.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                            item.status === 'izin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
