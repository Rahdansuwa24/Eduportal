import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, TrendingUp, CheckCircle2 } from 'lucide-react';

export const GrafikNilaiSemester = () => {
    const dataNilaiSemester = [
        { semester: 'Sem 1', nilai: 78.5, kkm: 75 },
        { semester: 'Sem 2', nilai: 82.0, kkm: 75 },
        { semester: 'Sem 3', nilai: 80.0, kkm: 75 },
        { semester: 'Sem 4', nilai: 88.5, kkm: 75 },
        { semester: 'Sem 5', nilai: 91.0, kkm: 75 },
        { semester: 'Sem 6', nilai: 95.0, kkm: 75 },
    ];

    return (
        <div className="space-y-6">
            {/* Header & LineChart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Perkembangan Nilai Semester Siswa</h2>
                            <p className="text-xs text-slate-500">Visualisasi tren peningkatan rata-rata nilai ujian (Semester 1 - 6)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 self-start sm:self-auto">
                        <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Rata-Rata Terakhir</span>
                            <span className="text-xl font-extrabold text-indigo-600">95.00</span>
                        </div>
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Recharts Line Chart */}
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataNilaiSemester}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="semester" stroke="#64748b" fontSize={12} />
                            <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                            <Line type="monotone" dataKey="nilai" name="Nilai Rata-Rata" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                            <Line type="monotone" dataKey="kkm" name="Batas KKM" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabel Rincian Nilai Semester */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Rincian Nilai Rata-Rata per Semester</h3>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Semester</th>
                                <th className="p-3.5">Batas KKM</th>
                                <th className="p-3.5">Nilai Rata-Rata</th>
                                <th className="p-3.5 text-right">Status Kelulusan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {dataNilaiSemester.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-3.5 font-semibold text-slate-800">{item.semester}</td>
                                    <td className="p-3.5 text-slate-500 font-mono text-xs">{item.kkm}.0</td>
                                    <td className="p-3.5 font-extrabold text-indigo-600 font-mono">{item.nilai}</td>
                                    <td className="p-3.5 text-right">
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tuntas
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
