import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';

export const AiQuizGenerator = () => {
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiDraftReady, setAiDraftReady] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');

    const handleGenerateAi = (e) => {
        e.preventDefault();
        setLoadingAi(true);
        setTimeout(() => {
            setLoadingAi(false);
            setAiDraftReady(true);
        }, 1500);
    };

    const handleSaveDraft = () => {
        setSavedMsg('Draft kuis hasil generasi AI berhasil disimpan ke Bank Soal!');
        setTimeout(() => setSavedMsg(''), 4000);
    };

    return (
        <div className="space-y-6">
            {/* Success Notification */}
            {savedMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        {savedMsg}
                    </div>
                    <button onClick={() => setSavedMsg('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Container AI Generator */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">AI Auto-Generate Quiz Generator ✨</h2>
                        <p className="text-xs text-slate-500">Ekstrak teks otomatis dari dokumen PDF/Word untuk menghasilkan draft kuis secara instant</p>
                    </div>
                </div>

                <form onSubmit={handleGenerateAi} className="space-y-4 max-w-xl">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Unggah Dokumen Acuan (PDF/Word)</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            required
                            className="text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                    </div>
                    <button
                        disabled={loadingAi}
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loadingAi ? 'AI sedang mengekstrak & membuat kuis...' : 'Auto-Generate Draft Soal via AI'}
                    </button>
                </form>

                {aiDraftReady && (
                    <div className="p-5 bg-slate-50 border border-indigo-200 rounded-xl space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Draft Soal Hasil Generasi AI (5 Soal Pilihan Ganda)</span>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">Berhasil Dibuat</span>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                <div className="font-semibold text-slate-800">1. Apa rumus Pythagoras untuk mencari sisi miring c pada segitiga siku-siku?</div>
                                <div className="text-slate-500 pl-3">A. c² = a² + b² • B. c = a + b • C. c² = a² - b²</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                <div className="font-semibold text-slate-800">2. Tentukan nilai x jika diketahui x² = 16 (x &gt; 0).</div>
                                <div className="text-slate-500 pl-3">A. x = 2 • B. x = 4 • C. x = 8</div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveDraft}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                        >
                            Simpan Sebagai Draft Ujian di Bank Soal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
