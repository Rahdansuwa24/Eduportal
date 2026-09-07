import React, { useState } from 'react';
import { FileText, Sparkles, FileUp, Loader2 } from 'lucide-react';
import { GuruPresensiOverride } from './GuruPresensiOverride';
import { GuruAccPerizinan } from './GuruAccPerizinan';

export const GuruDashboard = ({ activeTab }) => {
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiDraftReady, setAiDraftReady] = useState(false);

    const handleGenerateAi = (e) => {
        e.preventDefault();
        setLoadingAi(true);
        setTimeout(() => {
            setLoadingAi(false);
            setAiDraftReady(true);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Tab 1: Rekap & Override Presensi Siswa (Komponen Terpisah) */}
            {(activeTab === 'presensi-guru' || activeTab === 'all') && (
                <GuruPresensiOverride />
            )}

            {/* Tab 2: Verifikasi ACC Surat Izin Siswa (Komponen Terpisah) */}
            {(activeTab === 'acc-izin' || activeTab === 'all') && (
                <GuruAccPerizinan />
            )}

            {/* Tab 3: Unggah Materi PDF */}
            {(activeTab === 'materi' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Unggah Materi Pelajaran (PDF)</h2>
                            <p className="text-xs text-slate-500">Berkas materi yang diunggah akan dapat diakses oleh Siswa</p>
                        </div>
                    </div>

                    <form className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Materi</label>
                            <input type="text" placeholder="misal: Bab 3 - Persamaan Kuadrat" className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Berkas PDF Materi</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs text-slate-600 font-medium">Klik untuk memilih berkas PDF atau tarik file ke sini</p>
                                <p className="text-[10px] text-slate-400 mt-1">Maksimal 10 MB (.pdf)</p>
                            </div>
                        </div>
                        <button type="button" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition">
                            Simpan & Unggah Materi
                        </button>
                    </form>
                </div>
            )}

            {/* Tab 4: AI Quiz Generator */}
            {(activeTab === 'ai-quiz' || activeTab === 'all') && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">AI Auto-Generate Quiz Generator ✨</h2>
                            <p className="text-xs text-slate-500">Ekstrak teks otomatis dari PDF/Word untuk menghasilkan draft kuis</p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerateAi} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Unggah Dokumen Acuan (PDF/Word)</label>
                            <input type="file" accept=".pdf,.doc,.docx" className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                        <button disabled={loadingAi} type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm rounded-lg transition flex items-center gap-2 shadow-sm">
                            {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {loadingAi ? 'AI sedang mengekstrak & membuat kuis...' : 'Auto-Generate Draft Soal via AI'}
                        </button>
                    </form>

                    {aiDraftReady && (
                        <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Draft Soal Hasil Generasi AI (5 Soal)</span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Berhasil Dibuat</span>
                            </div>
                            <div className="space-y-2 text-xs text-slate-700">
                                <div className="p-2.5 bg-white rounded border border-slate-200"><strong>Soal 1:</strong> Apa rumus Pythagoras untuk mencari sisi miring?</div>
                                <div className="p-2.5 bg-white rounded border border-slate-200"><strong>Soal 2:</strong> Tentukan nilai x jika x² = 16.</div>
                            </div>
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition">Simpan Sebagai Draft Ujian</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
