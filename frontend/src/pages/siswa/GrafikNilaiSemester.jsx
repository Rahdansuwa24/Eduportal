import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import {
    Award,
    TrendingUp,
    CheckCircle2,
    XCircle,
    BookOpen,
    Clock,
    RefreshCw,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/services/api';

export const GrafikNilaiSemester = () => {
    const [chartData, setChartData] = useState([]);
    const [semesterSummary, setSemesterSummary] = useState([]);
    const [riwayatUjian, setRiwayatUjian] = useState([]);
    const [stats, setStats] = useState({
        rata_rata_terakhir: 0,
        rata_rata_kumulatif: 0,
        total_ujian_selesai: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchNilaiData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiFetch('/ujian/my-results');
            setChartData(data.chart_data || []);
            setSemesterSummary(data.semester_summary || []);
            setRiwayatUjian(data.riwayat_ujian || []);
            setStats({
                rata_rata_terakhir: data.rata_rata_terakhir || 0,
                rata_rata_kumulatif: data.rata_rata_kumulatif || 0,
                total_ujian_selesai: data.total_ujian_selesai || 0
            });
            setErrorMessage('');
        } catch (err) {
            console.error('Error fetching nilai data:', err);
            setErrorMessage('Gagal memuat rekap nilai: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNilaiData();
    }, []);

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => fetchNilaiData(true)} className="text-xs text-rose-700 underline font-semibold">Coba Lagi</button>
                </div>
            )}

            {/* Header & LineChart Card */}
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

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchNilaiData(true)}
                            disabled={refreshing}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>

                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Rata-Rata Kumulatif</span>
                                <span className="text-lg font-extrabold text-indigo-600 font-mono">
                                    {stats.rata_rata_kumulatif.toFixed(1)}
                                </span>
                            </div>
                            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recharts Line Chart */}
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <span className="text-xs">Memuat visualisasi nilai semester...</span>
                    </div>
                ) : (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="semester" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="nilai"
                                    name="Nilai Rata-Rata"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#4f46e5' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="kkm"
                                    name="Batas KKM"
                                    stroke="#94a3b8"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Rincian Rata-Rata Per Semester */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Rincian Rata-Rata Nilai per Semester</h3>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="p-3.5">Semester</th>
                                <th className="p-3.5">Batas Minimal KKM</th>
                                <th className="p-3.5">Nilai Rata-Rata</th>
                                <th className="p-3.5 text-right">Status Ketercapaian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                            {semesterSummary.map((item, idx) => {
                                const hasScore = item.nilai !== null;
                                const isPassed = hasScore && item.nilai >= item.kkm;

                                return (
                                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                                        <td className="p-3.5 font-bold text-slate-800">{item.semester}</td>
                                        <td className="p-3.5 text-slate-500 font-mono">{item.kkm}.00</td>
                                        <td className="p-3.5 font-extrabold text-indigo-600 font-mono text-sm">
                                            {hasScore ? item.nilai.toFixed(2) : '-'}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            {hasScore ? (
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 ${
                                                    isPassed
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {isPassed ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                    )}
                                                    <span>{isPassed ? 'Tuntas' : 'Remedial'}</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Belum Berjalan</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Riwayat Nilai Ujian Lengkap */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">Riwayat Pengerjaan Ujian dan Kuis</h3>
                        <p className="text-xs text-slate-500">Daftar riwayat seluruh nilai ujian yang telah Anda selesaikan</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                        {riwayatUjian.length} Ujian Diselesaikan
                    </span>
                </div>

                {riwayatUjian.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                        Belum ada riwayat pengerjaan ujian. Ujian yang Anda selesaikan pada menu Ujian Online akan muncul di sini.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                                <tr>
                                    <th className="p-3.5">Tanggal</th>
                                    <th className="p-3.5">Mata Pelajaran</th>
                                    <th className="p-3.5">Judul Ujian</th>
                                    <th className="p-3.5">Semester</th>
                                    <th className="p-3.5 text-right">Skor Diperoleh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {riwayatUjian.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                                            {r.submitted_at
                                                ? new Date(r.submitted_at).toLocaleDateString('id-ID', {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      year: 'numeric'
                                                  })
                                                : '-'}
                                        </td>
                                        <td className="p-3.5 font-medium text-slate-700">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                                                {r.nama_mapel}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-semibold text-slate-800">
                                            {r.judul_ujian}
                                        </td>
                                        <td className="p-3.5 font-mono text-slate-600">
                                            Semester {r.semester}
                                        </td>
                                        <td className="p-3.5 text-right font-black text-indigo-600 font-mono text-sm">
                                            {r.skor}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
