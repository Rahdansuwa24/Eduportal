import React from 'react';
import { BarChart3, Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export const SystemAnalytics = () => {
    // Data simulasi analitik sistem
    const activityData = [
        { hari: 'Senin', siswa: 450, guru: 38, waka: 5 },
        { hari: 'Selasa', siswa: 520, guru: 42, waka: 6 },
        { hari: 'Rabu', siswa: 480, guru: 40, waka: 4 },
        { hari: 'Kamis', siswa: 610, guru: 45, waka: 7 },
        { hari: 'Jumat', siswa: 590, guru: 44, waka: 5 },
        { hari: 'Sabtu', siswa: 230, guru: 15, waka: 2 },
    ];

    const roleDistribution = [
        { name: 'Siswa', value: 1200, color: '#6366f1' },
        { name: 'Guru', value: 85, color: '#10b981' },
        { name: 'Waka', value: 12, color: '#f59e0b' },
        { name: 'Admin', value: 5, color: '#ec4899' },
    ];

    return (
        <div className="space-y-6">
            {/* Card Header & Status Monitoring */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">System Analytics & Monitoring</h2>
                        <p className="text-xs text-slate-500">Statistik aktivitas sistem, kesehatan server, dan pemantauan lalu lintas pengguna</p>
                    </div>
                </div>

                {/* Indikator Kesehatan Sistem */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-md"><Activity className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Status Sistem</div>
                            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Normal (99.9%)
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-md"><Cpu className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Beban CPU</div>
                            <div className="text-sm font-bold text-slate-800">24.5%</div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-md"><Zap className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Latency API</div>
                            <div className="text-sm font-bold text-slate-800">42 ms</div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-violet-100 text-violet-600 rounded-md"><HardDrive className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Penyimpanan</div>
                            <div className="text-sm font-bold text-slate-800">12.4 / 100 GB</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visualisasi Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart: Tren Login Pengguna */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">Tren Aktivitas Pengguna (Minggu Ini)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorSiswa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorGuru" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="hari" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="siswa" name="Siswa" stroke="#6366f1" fillOpacity={1} fill="url(#colorSiswa)" />
                                <Area type="monotone" dataKey="guru" name="Guru" stroke="#10b981" fillOpacity={1} fill="url(#colorGuru)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Distribusi Role Pengguna */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">Distribusi Role Pengguna</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
