import React, { useState } from 'react';
import { FileText, FileUp, Check, Trash2, FileCheck } from 'lucide-react';

export const UnggahMateri = () => {
    const [judulMateri, setJudulMateri] = useState('');
    const [mapelMateri, setMapelMateri] = useState('Matematika Wajib');
    const [fileName, setFileName] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [materiList, setMateriList] = useState([
        { id: 1, judul: 'Bab 1 - Fungsi & Persamaan Kuadrat', mapel: 'Matematika Wajib', date: '02 Aug 2026', size: '2.4 MB' },
        { id: 2, judul: 'Bab 2 - Hukum Newton & Termodinamika', mapel: 'Fisika Peminatan', date: '01 Aug 2026', size: '4.1 MB' },
    ]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmitMateri = (e) => {
        e.preventDefault();
        if (!judulMateri) return;

        const newMateri = {
            id: Date.now(),
            judul: judulMateri,
            mapel: mapelMateri,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            size: '3.5 MB'
        };

        setMateriList([newMateri, ...materiList]);
        setJudulMateri('');
        setFileName('');
        setSuccessMsg(`Materi "${judulMateri}" berhasil diunggah!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleDeleteMateri = (id, judul) => {
        if (window.confirm(`Hapus materi "${judul}"?`)) {
            setMateriList(materiList.filter(m => m.id !== id));
            setSuccessMsg(`Materi "${judul}" berhasil dihapus.`);
            setTimeout(() => setSuccessMsg(''), 4000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notification Success Toast */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        {successMsg}
                    </div>
                    <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Container Unggah Materi */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Unggah Materi Pelajaran (PDF)</h2>
                        <p className="text-xs text-slate-500">Berkas materi yang diunggah akan langsung dapat diakses oleh Siswa</p>
                    </div>
                </div>

                <form onSubmit={handleSubmitMateri} className="space-y-4 max-w-xl">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                        <select
                            value={mapelMateri}
                            onChange={(e) => setMapelMateri(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
                        >
                            <option value="Matematika Wajib">📘 Matematika Wajib</option>
                            <option value="Bahasa Indonesia">📘 Bahasa Indonesia</option>
                            <option value="Fisika Peminatan">🔬 Fisika Peminatan</option>
                            <option value="Biologi Peminatan">🔬 Biologi Peminatan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Materi</label>
                        <input
                            type="text"
                            required
                            placeholder="misal: Bab 3 - Persamaan Kuadrat & Trigo"
                            value={judulMateri}
                            onChange={(e) => setJudulMateri(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Berkas PDF Materi</label>
                        <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer block">
                            <FileUp className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-600 font-medium">
                                {fileName ? `Berkas terpilih: ${fileName}` : 'Klik untuk memilih berkas PDF atau tarik file ke sini'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">Maksimal 10 MB (.pdf)</p>
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition shadow-sm">
                        Simpan & Unggah Materi
                    </button>
                </form>
            </div>

            {/* List Materi Terunggah */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Daftar Materi yang Sudah Diunggah</h3>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Judul Materi</th>
                                <th className="p-3.5">Mata Pelajaran</th>
                                <th className="p-3.5">Tanggal Unggah</th>
                                <th className="p-3.5">Ukuran</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {materiList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="p-3.5 font-semibold text-slate-800 flex items-center gap-2">
                                        <FileCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                                        {item.judul}
                                    </td>
                                    <td className="p-3.5 text-slate-600">{item.mapel}</td>
                                    <td className="p-3.5 text-slate-500 text-xs">{item.date}</td>
                                    <td className="p-3.5 font-mono text-xs text-slate-500">{item.size}</td>
                                    <td className="p-3.5 text-right">
                                        <button
                                            onClick={() => handleDeleteMateri(item.id, item.judul)}
                                            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold rounded transition inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
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
