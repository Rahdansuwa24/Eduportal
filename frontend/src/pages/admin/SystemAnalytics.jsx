import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Activity,
    Cpu,
    HardDrive,
    Zap,
    RefreshCw,
    Users,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Calendar,
    Database,
    Server,
    UserCheck,
    UserX,
    GraduationCap,
    AlertTriangle,
    BookOpen
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { apiFetch } from '@/services/api';

const roleColors = {
    siswa: '#6366f1', // indigo
    guru: '#10b981',  // emerald
    waka: '#f59e0b',  // amber
    admin: '#ec4899', // pink
};

const roleLabels = {
    siswa: 'Siswa',
    guru: 'Guru',
    waka: 'Waka Kurikulum',
    admin: 'Administrator'
};

const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}j ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}d`;
    return `${secs} detik`;
};

export const SystemAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadAnalytics = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        setError('');
        try {
            const data = await apiFetch('/users/analytics');
            setAnalytics(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Gagal mengambil data analitik:', err);
            setError(err.message || 'Gagal memuat data analitik sistem.');
        } finally {
            setLoading(false);
            if (isManualRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-700">Mengambil data analitik dan performa sistem...</p>
                <p className="text-xs text-slate-400">Menghubungkan ke PostgreSQL eduportal_db</p>
            </div>
        );
    }

    if (error && !analytics) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="font-bold text-base">Gagal Memuat Analitik Sistem</h3>
                </div>
                <p className="text-xs text-slate-600">{error}</p>
                <button
                    onClick={() => loadAnalytics(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
                >
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );
    }

    const {
        roleDistribution = [],
        statusOverview = { active_count: 0, inactive_count: 0, total_count: 0 },
        siswaStatusDistribution = [],
        presensiToday = { total_submitted: 0, hadir: 0, izin: 0, alpa: 0, late: 0 },
        weeklyPresensi = [],
        academicCounts = { total_mapel: 0, total_kurikulum: 0, total_perizinan: 0, perizinan_pending: 0, perizinan_approved: 0, total_ujian: 0 },
        recentUsers = [],
        systemHealth = {}
    } = analytics || {};

    const pieData = roleDistribution.map((item) => ({
        name: roleLabels[item.role] || item.role,
        value: Number(item.count) || 0,
        color: roleColors[item.role] || '#64748b'
    }));

    const siswaStatusData = [
        { status: 'Aktif', count: 0 },
        { status: 'Lulus', count: 0 },
        { status: 'Pindah', count: 0 },
        { status: 'Drop Out', count: 0 },
    ];
    siswaStatusDistribution.forEach(s => {
        if (s.status_siswa === 'aktif') siswaStatusData[0].count = Number(s.count);
        if (s.status_siswa === 'lulus') siswaStatusData[1].count = Number(s.count);
        if (s.status_siswa === 'pindah') siswaStatusData[2].count = Number(s.count);
        if (s.status_siswa === 'drop_out') siswaStatusData[3].count = Number(s.count);
    });

    return (
        <div className="space-y-6">
            {/* Header Analitik & Tombol Refresh */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">System Analytics & Monitoring</h2>
                        <p className="text-xs text-slate-500">
                            Statistik aktivitas real-time, performa infrastruktur Node.js, dan rekap data sekolah
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    {lastUpdated && (
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-slate-400 font-medium block">Pembaruan Terakhir</span>
                            <span className="text-xs font-mono font-semibold text-slate-600">
                                {lastUpdated.toLocaleTimeString('id-ID')} WIB
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => loadAnalytics(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        title="Perbarui Data Analitik"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                        {refreshing ? 'Memperbarui...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            {/* Indikator Kesehatan Sistem (System Health Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Status Server & DB */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Database & Server</span>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Database className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            PostgreSQL ({systemHealth.database?.dbName || 'eduportal_db'})
                        </p>
                    </div>
                </div>

                {/* 2. Beban Memori Node.js */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Memori Node.js</span>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Cpu className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-800">
                            {systemHealth.memory?.heapUsedMB || 0} MB
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            RSS: {systemHealth.memory?.rssMB || 0} MB • Total: {systemHealth.memory?.heapTotalMB || 0} MB
                        </p>
                    </div>
                </div>

                {/* 3. Server Uptime */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Server Uptime</span>
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-800">
                            {formatUptime(systemHealth.serverUptimeSeconds)}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Node {systemHealth.nodeVersion || 'v20'} • {systemHealth.platform || 'OS'}
                        </p>
                    </div>
                </div>

                {/* 4. Pengajuan Izin Menunggu ACC */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Antrean Perizinan</span>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span>{academicCounts.perizinan_pending || 0}</span>
                            <span className="text-xs font-normal text-slate-500">Pending</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Dari total {academicCounts.total_perizinan || 0} surat pengajuan
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick KPI Counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">Total Pengguna</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{statusOverview.total_count}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                        {statusOverview.active_count} aktif • {statusOverview.inactive_count} nonaktif
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Mata Pelajaran</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{academicCounts.total_mapel}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                        {academicCounts.total_kurikulum} jadwal aktif di kurikulum
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100 shadow-2xs">
                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Presensi Hari Ini</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{presensiToday.total_submitted}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                        {presensiToday.hadir} Hadir • {presensiToday.izin} Izin • {presensiToday.alpa} Alpa
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-xl border border-rose-100 shadow-2xs">
                    <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">Terlambat Hari Ini</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{presensiToday.late}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                        Melewati batas toleransi 15 menit
                    </div>
                </div>
            </div>

            {/* Visualisasi Grafik (2 Kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tren Presensi 7 Hari Terakhir */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Tren Presensi Siswa (7 Hari Terakhir)</h3>
                            <p className="text-xs text-slate-500">Pergerakan kehadiran, izin, dan alpa harian</p>
                        </div>
                        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            Minggu Ini
                        </span>
                    </div>

                    <div className="h-72 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyPresensi} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorIzin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAlpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="hari" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                                    labelFormatter={(label, payload) => {
                                        const item = payload && payload[0] ? payload[0].payload : null;
                                        return item ? `${label} (${item.tanggal})` : label;
                                    }}
                                />
                                <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHadir)" />
                                <Area type="monotone" dataKey="izin" name="Izin" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorIzin)" />
                                <Area type="monotone" dataKey="alpa" name="Alpa" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAlpa)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribusi Role Pengguna */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">Distribusi Role Pengguna</h3>
                        <p className="text-xs text-slate-500">Komposisi total akun terdaftar</p>
                    </div>

                    <div className="h-60 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        {roleDistribution.map((item) => (
                            <div key={item.role} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                                <span className="font-medium text-slate-600 capitalize">{item.role}</span>
                                <span className="font-mono font-bold text-slate-800">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Status Siswa Bar & 5 Pengguna Terdaftar Terakhir */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Status Siswa BarChart */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">Status Siswa Terdaftar</h3>
                        <p className="text-xs text-slate-500">Distribusi status siswa aktif vs kelulusan</p>
                    </div>

                    <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={siswaStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="status" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                                />
                                <Bar dataKey="count" name="Jumlah Siswa" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5 Akun Baru Didaftarkan */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Pengguna Terbaru Didaftarkan</h3>
                            <p className="text-xs text-slate-500">5 akun terakhir yang terdaftar pada sistem</p>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                            Total: {statusOverview.total_count} Akun
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Nama & Email</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Kelas</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60">
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-800">{u.nama}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-pink-100 text-pink-700' :
                                                u.role === 'waka' ? 'bg-amber-100 text-amber-700' :
                                                u.role === 'guru' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-slate-600">
                                            {u.role === 'siswa' ? `Kelas ${u.tingkat_kelas}` : 'Staff'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                                                u.is_active ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    u.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                                }`}></span>
                                                {u.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
