import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CalendarCheck, Clock, Award, CheckCircle2, AlertCircle, FilePlus, BookOpen, Building } from 'lucide-react';
import { apiFetch } from '@/services/api';

const dataNilaiSemester = [
    { semester: 'Sem 1', nilai: 78.5 },
    { semester: 'Sem 2', nilai: 82.0 },
    { semester: 'Sem 3', nilai: 80.0 },
    { semester: 'Sem 4', nilai: 88.5 },
    { semester: 'Sem 5', nilai: 91.0 },
    { semester: 'Sem 6', nilai: 95.0 },
];

export const SiswaDashboard = ({ activeTab }) => {
    const [jadwalTodayList, setJadwalTodayList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [presensiMsgMap, setPresensiMsgMap] = useState({});

    // State Form Perizinan Siswa
    const [alasanIzin, setAlasanIzin] = useState('sakit');
    const [keterangan, setKeterangan] = useState('');
    const [tglMulai, setTglMulai] = useState('');
    const [tglSelesai, setTglSelesai] = useState('');
    const [fileBukti, setFileBukti] = useState(null);
    const [perizinanSubmitted, setPerizinanSubmitted] = useState(false);
    const [perizinanMsg, setPerizinanMsg] = useState('');

    // Fetch Jadwal Kurikulum Per Mapel Hari Ini dari Backend
    const loadJadwalToday = async () => {
        try {
            const data = await apiFetch('/kurikulum');
            setJadwalTodayList(data);
        } catch (err) {
            console.error('Gagal mengambil jadwal mapel:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJadwalToday();
    }, []);

    // Handle Submit Absen Per Mata Pelajaran (Per Mapel & Waktu Kurikulum)
    const handlePresensiMapel = async (kurikulumId) => {
        try {
            const res = await apiFetch('/presensi/submit', {
                method: 'POST',
                body: JSON.stringify({ kurikulum_id: kurikulumId })
            });
            setPresensiMsgMap(prev => ({
                ...prev,
                [kurikulumId]: res.message
            }));
            loadJadwalToday();
        } catch (err) {
            alert(`Gagal presensi mapel: ${err.message}`);
        }
    };

    // Handle Submit Form Perizinan + File Upload ke Express API
    const handleFormPerizinan = async (e) => {
        e.preventDefault();
        if (!fileBukti || !tglMulai || !tglSelesai) {
            alert('Mohon lengkapi tanggal dan upload berkas bukti surat!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('alasan', alasanIzin);
            formData.append('keterangan', keterangan);
            formData.append('tanggal_mulai', tglMulai);
            formData.append('tanggal_selesai', tglSelesai);
            formData.append('bukti_surat', fileBukti);

            const res = await apiFetch('/perizinan/submit', {
                method: 'POST',
                body: formData
            });

            setPerizinanMsg(res.message);
            setPerizinanSubmitted(true);
        } catch (err) {
            alert(`Gagal mengirim perizinan: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab 1: Presensi Per Mata Pelajaran (Berbasis Waktu Belajar Kurikulum) */}
            {(activeTab === 'presensi' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-green-100 text-green-700 rounded-lg">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Presensi Kehadiran Per Mata Pelajaran</h2>
                                <p className="text-xs text-slate-500">Absensi dilakukan sesuai jadwal waktu belajar masing-masing mapel</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                                📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jadwalTodayList.map((j) => (
                            <div key={j.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition space-y-3 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] uppercase rounded">
                                            {j.hari} • {j.tipe_mapel}
                                        </span>
                                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 pt-1">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                            {j.nama_mapel}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono">{j.kode_mapel} • Kelas {j.tingkat_kelas}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {j.waktu_mulai ? j.waktu_mulai.substring(0, 5) : '07:30'} - {j.waktu_selesai ? j.waktu_selesai.substring(0, 5) : '09:00'} WIB
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                                            <Building className="w-3 h-3 text-slate-400" />
                                            {j.ruangan}
                                        </div>
                                    </div>
                                </div>

                                {presensiMsgMap[j.id] ? (
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        {presensiMsgMap[j.id]}
                                    </div>
                                ) : (
                                    <div className="pt-2 flex items-center justify-between">
                                        <button
                                            onClick={() => handlePresensiMapel(j.id)}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Absen Hadir Mapel Ini
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 2: Form Perizinan & Upload Surat Izin */}
            {(activeTab === 'perizinan-siswa' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                            <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Form Pengajuan Perizinan & Upload Surat</h2>
                            <p className="text-xs text-slate-500">Siswa yang izin/sakit wajib mengunggah berkas bukti surat agar tidak terhitung Alpa</p>
                        </div>
                    </div>

                    <form onSubmit={handleFormPerizinan} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Izin</label>
                            <select
                                value={alasanIzin}
                                onChange={e => setAlasanIzin(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="sakit">🤒 Sakit (Membutuhkan Surat Dokter)</option>
                                <option value="izin_keluarga">✉️ Izin Acara Keluarga</option>
                                <option value="lainnya">❓ Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                            <input
                                type="text"
                                placeholder="misal: Demam tinggi sejak semalam"
                                value={keterangan}
                                onChange={e => setKeterangan(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                                <input type="date" required value={tglMulai} onChange={e => setTglMulai(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                                <input type="date" required value={tglSelesai} onChange={e => setTglSelesai(e.target.value)} className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Berkas Bukti Surat (.PDF / Gambar)</label>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                required
                                onChange={e => setFileBukti(e.target.files[0])}
                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>

                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm">
                            Kirim Pengajuan Perizinan
                        </button>
                    </form>

                    {perizinanSubmitted && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900 uppercase">Status Pengajuan Surat Izin Anda</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">Status: PENDING ACC GURU</span>
                            </div>
                            <p className="text-xs text-slate-600">{perizinanMsg || 'Surat bukti izin Anda telah terisi dan sedang menunggu verifikasi dari Guru.'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Grafik Nilai Semester */}
            {(activeTab === 'nilai' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Perkembangan Nilai Semester</h2>
                                <p className="text-xs text-slate-500">Visualisasi Rata-Rata Nilai Ujian (Semester 1 - 6)</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-indigo-600">95.00</span>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Nilai Terakhir</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataNilaiSemester}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="semester" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                                <Line type="monotone" dataKey="nilai" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Tab 4: Ujian Online Active */}
            {(activeTab === 'ujian' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-base">Ujian Tengah Semester - Matematika Wajib</h2>
                                <p className="text-xs text-slate-500">Durasi: 60 Menit • 10 Soal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 font-mono font-bold text-sm rounded-lg border border-rose-200">
                            <AlertCircle className="w-4 h-4" /> 45:00 Waktu Tersisa
                        </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition">
                        Mulai Kerjakan Ujian ➔
                    </button>
                </div>
            )}
        </div>
    );
};
