import React, { useState } from 'react';
import { GraduationCap, Clock, AlertCircle, FileText, Download, CheckCircle } from 'lucide-react';

export const MateriUjianOnline = () => {
    const [activeExamStarted, setActiveExamStarted] = useState(false);
    const [examSubmitted, setExamSubmitted] = useState(false);

    const activeUjian = {
        judul: 'Ujian Tengah Semester (UTS) - Matematika Wajib',
        durasi: 60,
        jumlahSoal: 10,
        guru: 'Pak Budi (Math)',
        deadline: 'Hari ini, 23:59 WIB'
    };

    const materiList = [
        { id: 1, judul: 'Bab 1 - Fungsi & Persamaan Kuadrat', mapel: 'Matematika Wajib', guru: 'Pak Budi', size: '2.4 MB' },
        { id: 2, judul: 'Bab 2 - Termodinamika & Hukum Newton', mapel: 'Fisika Peminatan', guru: 'Bu Ani', size: '4.1 MB' },
    ];

    const handleStartExam = () => {
        setActiveExamStarted(true);
    };

    const handleSubmitExam = () => {
        setActiveExamStarted(false);
        setExamSubmitted(true);
    };

    return (
        <div className="space-y-6">
            {/* Active Exam Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">{activeUjian.judul}</h2>
                            <p className="text-xs text-slate-500">Pengampu: {activeUjian.guru} • Durasi: {activeUjian.durasi} Menit • {activeUjian.jumlahSoal} Soal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 font-mono font-bold text-sm rounded-lg border border-rose-200 shrink-0">
                        <AlertCircle className="w-4 h-4" /> 45:00 Waktu Tersisa
                    </div>
                </div>

                {!examSubmitted ? (
                    !activeExamStarted ? (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-slate-600">Pastikan koneksi internet stabil sebelum memulai pengerjaan ujian.</p>
                            <button
                                onClick={handleStartExam}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition shadow-sm"
                            >
                                Mulai Kerjakan Ujian ➔
                            </button>
                        </div>
                    ) : (
                        <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Soal 1 dari 10</span>
                                <span className="text-xs font-mono font-bold text-indigo-700">Waktu berjalan...</span>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm font-semibold text-slate-800">
                                Tentukan nilai x jika diketahui persamaan x² - 5x + 6 = 0.
                            </div>
                            <div className="space-y-2">
                                {['A. x = 2 atau x = 3', 'B. x = 1 atau x = 6', 'C. x = -2 atau x = -3'].map((opt, idx) => (
                                    <label key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <input type="radio" name="soal1" className="text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-xs text-slate-700 font-medium">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={handleSubmitExam}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                            >
                                Selesai & Kirim Jawaban Ujian
                            </button>
                        </div>
                    )
                ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-sm text-emerald-800 font-semibold">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Ujian telah berhasil dikirim! Nilai Anda akan diumumkan setelah dikonfirmasi oleh Guru.
                        </div>
                    </div>
                )}
            </div>

            {/* List Materi Pembelajaran */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Materi Pelajaran Pelengkap</h2>
                        <p className="text-xs text-slate-500">Unduh modul materi berbentuk PDF dari guru pengampu</p>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Judul Materi</th>
                                <th className="p-3.5">Mata Pelajaran</th>
                                <th className="p-3.5">Guru Pengajar</th>
                                <th className="p-3.5">Ukuran File</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {materiList.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50">
                                    <td className="p-3.5 font-semibold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                        {m.judul}
                                    </td>
                                    <td className="p-3.5 text-slate-600">{m.mapel}</td>
                                    <td className="p-3.5 text-slate-600">{m.guru}</td>
                                    <td className="p-3.5 font-mono text-xs text-slate-500">{m.size}</td>
                                    <td className="p-3.5 text-right">
                                        <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition inline-flex items-center gap-1">
                                            <Download className="w-3.5 h-3.5" /> Download PDF
                                        </button>
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
