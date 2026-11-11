import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Loader2,
    Check,
    FileUp,
    FileCheck,
    AlertCircle,
    BookOpen,
    Trash2,
    Plus,
    Save,
    RotateCcw
} from 'lucide-react';
import { apiFetch } from '@/services/api';

export const AiQuizGenerator = () => {
    const [mapelList, setMapelList] = useState([]);
    const [selectedMapelId, setSelectedMapelId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [questionCount, setQuestionCount] = useState(5);

    const [loadingAi, setLoadingAi] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);

    // AI Generation Results
    const [aiResult, setAiResult] = useState(null);
    const [examTitle, setExamTitle] = useState('');
    const [durasiMenit, setDurasiMenit] = useState(45);
    const [questions, setQuestions] = useState([]);

    // Alerts & Toasts
    const [toastMessage, setToastMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 5000);
    };

    // Load Mata Pelajaran options
    useEffect(() => {
        const loadMapel = async () => {
            try {
                const data = await apiFetch('/mapel');
                setMapelList(data || []);
                if (data && data.length > 0) {
                    setSelectedMapelId(String(data[0].id));
                }
            } catch (err) {
                console.error('Gagal memuat mata pelajaran:', err);
            }
        };
        loadMapel();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                alert('Dokumen acuan harus berformat PDF!');
                return;
            }
            if (file.size > 15 * 1024 * 1024) {
                alert('Ukuran berkas maksimal 15 MB.');
                return;
            }
            setSelectedFile(file);
        }
    };

    // Trigger AI Generation via Backend
    const handleGenerateAi = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Silakan pilih berkas PDF acuan kuis terlebih dahulu!');
            return;
        }

        setLoadingAi(true);
        setErrorMessage('');
        try {
            const formData = new FormData();
            formData.append('file_doc', selectedFile);
            formData.append('jumlah_soal', questionCount);

            const result = await apiFetch('/ujian/ai-generate', {
                method: 'POST',
                body: formData
            });

            setAiResult(result);
            setExamTitle(result.suggested_title || `Kuis Evaluasi ${selectedFile.name.replace(/\.pdf$/i, '')}`);
            setQuestions(result.questions || []);
            showToast('Kuis berhasil digenerasi oleh AI dari dokumen PDF!');
        } catch (err) {
            console.error('Error generate AI quiz:', err);
            setErrorMessage(err.message || 'Gagal mengekstrak soal dari dokumen PDF.');
        } finally {
            setLoadingAi(false);
        }
    };

    // Handle Edit Question in Draft
    const handleQuestionTextChange = (idx, field, value) => {
        const updated = [...questions];
        updated[idx][field] = value;
        setQuestions(updated);
    };

    const handleDeleteQuestion = (idx) => {
        if (questions.length <= 1) {
            alert('Minimal harus ada 1 butir soal dalam kuis.');
            return;
        }
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handleAddManualQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: questions.length + 1,
                pertanyaan: `${questions.length + 1}. Pertanyaan baru...`,
                tipe_soal: 'pg',
                pilihan_a: '',
                pilihan_b: '',
                pilihan_c: '',
                pilihan_d: '',
                kunci_jawaban: 'A'
            }
        ]);
    };

    // Save As Draft Exam to Bank Soal
    const handleSaveDraft = async () => {
        if (!examTitle.trim()) {
            alert('Judul ujian wajib diisi!');
            return;
        }
        if (!selectedMapelId) {
            alert('Mata pelajaran target wajib dipilih!');
            return;
        }

        setSavingDraft(true);
        try {
            await apiFetch('/ujian', {
                method: 'POST',
                body: JSON.stringify({
                    judul_ujian: examTitle.trim(),
                    mapel_id: selectedMapelId,
                    durasi_menit: parseInt(durasiMenit, 10) || 45,
                    soal: questions
                })
            });

            showToast(`Draft kuis "${examTitle}" berhasil disimpan ke Bank Soal dan diajukan ke Waka Kurikulum!`);
            setAiResult(null);
            setQuestions([]);
            setSelectedFile(null);
        } catch (err) {
            alert('Gagal menyimpan draft ujian: ' + err.message);
        } finally {
            setSavingDraft(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Toast */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={() => setToastMessage('')} className="text-xs text-emerald-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage('')} className="text-xs text-rose-600 hover:underline">Tutup</button>
                </div>
            )}

            {/* AI Generator Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">AI Auto-Generate Quiz Generator</h2>
                        <p className="text-xs text-slate-500">
                            Ekstrak materi dari dokumen PDF untuk menyusun butir soal pilihan ganda secara cerdas dan instan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleGenerateAi} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran Terkait</label>
                            <select
                                value={selectedMapelId}
                                onChange={(e) => setSelectedMapelId(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                            >
                                {mapelList.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nama_mapel} ({m.tingkat_kelas || 'Semua'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Jumlah Butir Soal</label>
                            <select
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                            >
                                <option value="3">3 Soal Ringkas</option>
                                <option value="5">5 Soal Standar</option>
                                <option value="8">8 Soal Mendalam</option>
                                <option value="10">10 Soal Komprehensif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Unggah Dokumen Acuan (PDF)</label>
                        <label className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer block ${
                            selectedFile ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-300'
                        }`}>
                            <FileUp className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <p className="text-xs text-slate-700 font-semibold">
                                {selectedFile ? `Berkas Terpilih: ${selectedFile.name}` : 'Klik untuk memilih dokumen PDF atau tarik file ke sini'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                                {selectedFile ? `Ukuran: ${(selectedFile.size / 1024).toFixed(1)} KB` : 'Format PDF berbasis teks, ukuran maksimal 15 MB'}
                            </p>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex justify-start">
                        <button
                            disabled={loadingAi || !selectedFile}
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>{loadingAi ? 'AI sedang mengekstrak teks & merumuskan soal...' : 'Auto-Generate Draft Soal via AI'}</span>
                        </button>
                    </div>
                </form>

                {/* Hasil Generasi AI & Editor Draft Ujian */}
                {aiResult && questions.length > 0 && (
                    <div className="p-6 bg-slate-50 border border-indigo-200 rounded-xl space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                            <div>
                                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
                                    Draft Soal Hasil Generasi AI ({questions.length} Soal)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Sumber: {aiResult.document_name} • {aiResult.total_characters} karakter teks berhasil diproses
                                </span>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md self-start sm:self-auto flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Siap Ditinjau & Disimpan
                            </span>
                        </div>

                        {/* Pengaturan Paket Ujian Sebelum Disimpan */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-slate-200">
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Paket Ujian di Bank Soal</label>
                                <input
                                    type="text"
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Durasi Ujian (Menit)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="300"
                                    value={durasiMenit}
                                    onChange={(e) => setDurasiMenit(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* List Soal yang Bisa Diedit Guru */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-xs text-slate-700">Tinjau dan Edit Butir Soal:</h3>
                                <button
                                    onClick={handleAddManualQuestion}
                                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Soal Tambahan
                                </button>
                            </div>

                            {questions.map((q, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">Soal Nomor {idx + 1}</span>
                                        <button
                                            onClick={() => handleDeleteQuestion(idx)}
                                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>

                                    <div>
                                        <textarea
                                            rows="2"
                                            value={q.pertanyaan}
                                            onChange={(e) => handleQuestionTextChange(idx, 'pertanyaan', e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Opsi A</label>
                                            <input
                                                type="text"
                                                value={q.pilihan_a}
                                                onChange={(e) => handleQuestionTextChange(idx, 'pilihan_a', e.target.value)}
                                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Opsi B</label>
                                            <input
                                                type="text"
                                                value={q.pilihan_b}
                                                onChange={(e) => handleQuestionTextChange(idx, 'pilihan_b', e.target.value)}
                                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Opsi C</label>
                                            <input
                                                type="text"
                                                value={q.pilihan_c}
                                                onChange={(e) => handleQuestionTextChange(idx, 'pilihan_c', e.target.value)}
                                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Opsi D</label>
                                            <input
                                                type="text"
                                                value={q.pilihan_d}
                                                onChange={(e) => handleQuestionTextChange(idx, 'pilihan_d', e.target.value)}
                                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[11px] font-semibold text-slate-700">Kunci Jawaban:</span>
                                        <select
                                            value={q.kunci_jawaban}
                                            onChange={(e) => handleQuestionTextChange(idx, 'kunci_jawaban', e.target.value)}
                                            className="px-2 py-1 text-xs border border-slate-300 rounded font-bold text-emerald-800 bg-emerald-50 focus:outline-none"
                                        >
                                            <option value="A">Pilihan A</option>
                                            <option value="B">Pilihan B</option>
                                            <option value="C">Pilihan C</option>
                                            <option value="D">Pilihan D</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Submit to Bank Soal */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                onClick={() => { setAiResult(null); setQuestions([]); }}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                            >
                                Batalkan Hasil
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={savingDraft}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{savingDraft ? 'Menyimpan ke Bank Soal...' : 'Simpan Sebagai Draft Ujian di Bank Soal'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
