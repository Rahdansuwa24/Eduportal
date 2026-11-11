import React, { useState, useEffect } from 'react';
import {
    FilePlus,
    FileText,
    Check,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    AlertCircle,
    Loader2,
    RefreshCw,
    UploadCloud
} from 'lucide-react';
import { apiFetch, getFileUrl } from '@/services/api';

export const FormPerizinanSiswa = () => {
    const [riwayatList, setRiwayatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [alasanIzin, setAlasanIzin] = useState('sakit');
    const [keterangan, setKeterangan] = useState('');
    const [tglMulai, setTglMulai] = useState('');
    const [tglSelesai, setTglSelesai] = useState('');
    const [fileBukti, setFileBukti] = useState(null);

    // Toast
    const [toastMessage, setToastMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 5000);
    };

    // Load Riwayat Perizinan Siswa
    const fetchRiwayat = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await apiFetch('/perizinan/my');
            setRiwayatList(data || []);
            setErrorMessage('');
        } catch (err) {
            console.error('Error fetching riwayat perizinan:', err);
            setErrorMessage('Gagal memuat riwayat perizinan: ' + err.message);
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran berkas maksimal 5 MB.');
                return;
            }
            setFileBukti(file);
        }
    };

    // Handle Submit Form Perizinan
    const handleSubmitPerizinan = async (e) => {
        e.preventDefault();
        if (!tglMulai || !tglSelesai) {
            alert('Tanggal mulai dan tanggal selesai perizinan wajib diisi!');
            return;
        }
        if (new Date(tglMulai) > new Date(tglSelesai)) {
            alert('Tanggal mulai tidak boleh melebihi tanggal selesai!');
            return;
        }
        if (!fileBukti) {
            alert('Berkas bukti surat izin (PDF/Gambar) wajib diunggah!');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('alasan', alasanIzin);
            formData.append('keterangan', keterangan.trim());
            formData.append('tanggal_mulai', tglMulai);
            formData.append('tanggal_selesai', tglSelesai);
            formData.append('bukti_surat', fileBukti);

            const res = await apiFetch('/perizinan/submit', {
                method: 'POST',
                body: formData
            });

            showToast(res.message || 'Pengajuan perizinan berhasil dikirim.');
            setKeterangan('');
            setTglMulai('');
            setTglSelesai('');
            setFileBukti(null);
            fetchRiwayat();
        } catch (err) {
            alert(`Gagal mengirim perizinan: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Alert */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => fetchRiwayat(true)} className="text-xs text-rose-700 underline font-semibold">Coba Lagi</button>
                </div>
            )}

            {/* Form Pengajuan Perizinan */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                            <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Form Pengajuan Perizinan & Upload Surat</h2>
                            <p className="text-xs text-slate-500">
                                Siswa yang berhalangan hadir wajib mengunggah surat dokter atau surat izin orang tua untuk diverifikasi Guru
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchRiwayat(true)}
                        disabled={refreshing}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 transition hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                    </button>
                </div>

                <form onSubmit={handleSubmitPerizinan} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Perizinan</label>
                            <select
                                value={alasanIzin}
                                onChange={(e) => setAlasanIzin(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
                            >
                                <option value="sakit">Sakit (Memerlukan Surat Dokter)</option>
                                <option value="izin_keluarga">Izin Keperluan Keluarga</option>
                                <option value="lainnya">Alasan Mendesak Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Diagnosa Tambahan</label>
                            <input
                                type="text"
                                placeholder="misal: Demam tinggi, opname di RS..."
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai Izin</label>
                            <input
                                type="date"
                                required
                                value={tglMulai}
                                onChange={(e) => setTglMulai(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai Izin</label>
                            <input
                                type="date"
                                required
                                value={tglSelesai}
                                onChange={(e) => setTglSelesai(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Unggah Berkas Bukti Surat (.PDF / Foto Gambar)</label>
                        <label className={`border-2 border-dashed rounded-lg p-5 text-center hover:bg-slate-50 transition cursor-pointer block ${
                            fileBukti ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-300'
                        }`}>
                            <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${fileBukti ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <p className="text-xs text-slate-700 font-semibold">
                                {fileBukti ? `Berkas Terpilih: ${fileBukti.name}` : 'Klik untuk memilih berkas surat izin atau tarik file ke sini'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {fileBukti ? `Ukuran: ${(fileBukti.size / 1024).toFixed(1)} KB` : 'Format menerima PDF, JPG, PNG (Maksimal 5 MB)'}
                            </p>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                required
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex justify-start pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                            <span>{submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Perizinan'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Riwayat Pengajuan Perizinan */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">Riwayat Status Pengajuan Perizinan Anda</h3>
                        <p className="text-xs text-slate-500">Pantau proses verifikasi persetujuan (ACC) surat izin oleh Guru</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                        {riwayatList.length} Pengajuan
                    </span>
                </div>

                {loading ? (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                        <span className="text-xs">Memuat riwayat perizinan...</span>
                    </div>
                ) : riwayatList.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                        Belum ada riwayat pengajuan surat izin. Seluruh pengajuan izin Anda akan tercatat di sini.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                                <tr>
                                    <th className="p-3.5">Tanggal Pengajuan</th>
                                    <th className="p-3.5">Alasan & Keterangan</th>
                                    <th className="p-3.5">Periode Izin</th>
                                    <th className="p-3.5">Bukti Surat</th>
                                    <th className="p-3.5">Status Persetujuan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {riwayatList.map((item) => {
                                    const fileUrl = getFileUrl(item.bukti_file_path);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-3.5 font-medium text-slate-800">
                                                <div className="font-bold capitalize text-slate-900">
                                                    {item.alasan.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs font-medium text-slate-700 mt-0.5">
                                                    {item.keterangan ? `"${item.keterangan}"` : <span className="text-slate-400 italic">Tidak ada keterangan tambahan</span>}
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                                                {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} s.d.{' '}
                                                {new Date(item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-3.5">
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded transition inline-flex items-center gap-1 border border-indigo-200"
                                                    title="Buka berkas surat izin"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>Buka Surat</span>
                                                </a>
                                            </td>
                                            <td className="p-3.5">
                                                <div>
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 ${
                                                        item.status_acc === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                        item.status_acc === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {item.status_acc === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                        {item.status_acc === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                                                        {item.status_acc === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                                                        <span>{item.status_acc === 'approved' ? 'Disetujui' : item.status_acc === 'rejected' ? 'Ditolak' : 'Menunggu ACC'}</span>
                                                    </span>
                                                    {item.disetujui_oleh_guru && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            Oleh: {item.disetujui_oleh_guru}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
