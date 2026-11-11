import React, { useState, useEffect } from 'react';
import {
    GraduationCap,
    Clock,
    AlertCircle,
    FileText,
    Download,
    CheckCircle,
    BookOpen,
    ExternalLink,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Eye,
    ChevronLeft,
    ChevronRight,
    Send,
    Award,
    X,
    Loader2
} from 'lucide-react';
import { apiFetch, getFileUrl } from '@/services/api';

export const MateriUjianOnline = () => {
    // Mode Tab: 'materi' atau 'ujian'
    const [subTab, setSubTab] = useState('ujian');

    // Data List
    const [materiList, setMateriList] = useState([]);
    const [ujianList, setUjianList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search
    const [searchMateri, setSearchMateri] = useState('');
    const [searchUjian, setSearchUjian] = useState('');

    // Active CBT State
    const [activeExam, setActiveExam] = useState(null);
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [submittingExam, setSubmittingExam] = useState(false);

    // Result Score Modal
    const [examResultModal, setExamResultModal] = useState(null);

    // Review Modal (Untuk Ujian yang Sudah Selesai)
    const [reviewExam, setReviewExam] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);

    // Load Data Materi dan Ujian
    const loadData = async () => {
        try {
            const [materiData, ujianData] = await Promise.all([
                apiFetch('/materi'),
                apiFetch('/ujian')
            ]);
            setMateriList(materiData || []);
            setUjianList(ujianData || []);
        } catch (err) {
            console.error('Error fetching materi & ujian siswa:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // CBT Timer Effect
    useEffect(() => {
        if (!activeExam || secondsLeft <= 0) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [activeExam, secondsLeft]);

    // Format Timer MM:SS
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
    };

    // Mulai Kerjakan Ujian
    const handleStartExam = async (ujianItem) => {
        try {
            const detail = await apiFetch(`/ujian/${ujianItem.id}`);
            if (!detail.soal || detail.soal.length === 0) {
                alert('Paket ujian ini belum memiliki butir soal.');
                return;
            }

            setActiveExam(detail);
            setActiveQuestions(detail.soal);
            setCurrentIndex(0);
            setUserAnswers({});
            setSecondsLeft((detail.durasi_menit || 30) * 60);
        } catch (err) {
            alert('Gagal memuat soal ujian: ' + err.message);
        }
    };

    // Pilih Opsi Jawaban
    const handleSelectOption = (soalId, optionKey) => {
        setUserAnswers((prev) => ({
            ...prev,
            [soalId]: optionKey
        }));
    };

    // Auto submit ketika waktu habis
    const handleAutoSubmit = () => {
        alert('Waktu ujian telah habis! Jawaban Anda akan otomatis dikumpulkan ke server.');
        submitExamAnswers(true);
    };

    // Manual Submit Exam
    const handleManualSubmit = () => {
        const answeredCount = Object.keys(userAnswers).length;
        const total = activeQuestions.length;
        const confirmMsg = answeredCount < total
            ? `Anda baru menjawab ${answeredCount} dari ${total} butir soal. Yakin ingin mengumpulkan ujian sekarang?`
            : 'Apakah Anda yakin ingin menyelesaikan dan mengumpulkan jawaban ujian ini?';

        if (window.confirm(confirmMsg)) {
            submitExamAnswers(false);
        }
    };

    // Kirim Jawaban ke API
    const submitExamAnswers = async (isAuto = false) => {
        if (!activeExam) return;
        setSubmittingExam(true);
        try {
            const res = await apiFetch(`/ujian/${activeExam.id}/submit`, {
                method: 'POST',
                body: JSON.stringify({ jawaban: userAnswers })
            });

            setActiveExam(null);
            setExamResultModal({
                judul: activeExam.judul_ujian,
                mapel: activeExam.nama_mapel,
                skor: res.skor,
                total_soal: res.total_soal,
                benar: res.benar,
                salah: res.salah
            });

            loadData();
        } catch (err) {
            alert('Gagal mengumpulkan ujian: ' + err.message);
        } finally {
            setSubmittingExam(false);
        }
    };

    // Buka Modal Review Ujian yang Sudah Dikerjakan
    const handleOpenReview = async (ujianId) => {
        setLoadingReview(true);
        try {
            const detail = await apiFetch(`/ujian/${ujianId}`);
            setReviewExam(detail);
        } catch (err) {
            alert('Gagal memuat review ujian: ' + err.message);
        } finally {
            setLoadingReview(false);
        }
    };

    // Filter List
    const filteredMateri = materiList.filter(m =>
        m.judul.toLowerCase().includes(searchMateri.toLowerCase()) ||
        (m.nama_mapel && m.nama_mapel.toLowerCase().includes(searchMateri.toLowerCase()))
    );

    const filteredUjian = ujianList.filter(u =>
        u.judul_ujian.toLowerCase().includes(searchUjian.toLowerCase()) ||
        (u.nama_mapel && u.nama_mapel.toLowerCase().includes(searchUjian.toLowerCase()))
    );

    // ==========================================
    // CBT FULL SCREEN EXAM MODE INTERFACE
    // ==========================================
    if (activeExam && activeQuestions.length > 0) {
        const currentSoal = activeQuestions[currentIndex];
        const isAnswered = Boolean(userAnswers[currentSoal.id]);
        const isTimeCritical = secondsLeft < 300; // Kurang dari 5 menit

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                {/* Header CBT */}
                <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase rounded border border-indigo-500/30">
                                {activeExam.nama_mapel}
                            </span>
                            <span className="text-xs text-slate-400">
                                Soal {currentIndex + 1} dari {activeQuestions.length}
                            </span>
                        </div>
                        <h2 className="font-bold text-base sm:text-lg text-white mt-0.5">
                            {activeExam.judul_ujian}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Countdown Timer */}
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm border ${
                            isTimeCritical
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-slate-800 text-indigo-300 border-slate-700'
                        }`}>
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(secondsLeft)}</span>
                        </div>

                        <button
                            onClick={handleManualSubmit}
                            disabled={submittingExam}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {submittingExam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Kumpulkan</span>
                        </button>
                    </div>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left/Main Column: Question Card & Options */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                                Butir Soal Nomor {currentIndex + 1}
                            </div>
                            <div className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                                {currentSoal.pertanyaan}
                            </div>
                        </div>

                        {/* Options A, B, C, D */}
                        <div className="space-y-3">
                            {[
                                { key: 'A', text: currentSoal.pilihan_a },
                                { key: 'B', text: currentSoal.pilihan_b },
                                { key: 'C', text: currentSoal.pilihan_c },
                                { key: 'D', text: currentSoal.pilihan_d }
                            ].map((opt) => {
                                const isSelected = userAnswers[currentSoal.id] === opt.key;
                                return (
                                    <div
                                        key={opt.key}
                                        onClick={() => handleSelectOption(currentSoal.id, opt.key)}
                                        className={`p-4 rounded-xl border transition cursor-pointer flex items-center gap-3.5 ${
                                            isSelected
                                                ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {opt.key}
                                        </div>
                                        <div className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'}`}>
                                            {opt.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stepper Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
                            </button>

                            <button
                                onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                                disabled={currentIndex === activeQuestions.length - 1}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Soal Selanjutnya <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Question Palette Grid */}
                    <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Nomor Soal
                            </h3>
                            <span className="text-[11px] font-semibold text-indigo-700">
                                {Object.keys(userAnswers).length} dari {activeQuestions.length} Terjawab
                            </span>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {activeQuestions.map((q, idx) => {
                                const answered = Boolean(userAnswers[q.id]);
                                const isCurrent = idx === currentIndex;

                                return (
                                    <button
                                        key={q.id || idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-9 rounded-lg font-bold text-xs transition flex items-center justify-center cursor-pointer ${
                                            isCurrent
                                                ? 'ring-2 ring-indigo-600 ring-offset-1 '
                                                : ''
                                        } ${
                                            answered
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-emerald-600 rounded"></span>
                                <span>Sudah Dijawab</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-white border border-slate-300 rounded"></span>
                                <span>Belum Dijawab</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleManualSubmit}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Selesaikan Ujian</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // NORMAL VIEW: TABS MATERI & UJIAN
    // ==========================================
    return (
        <div className="space-y-6">
            {/* Modal Skor Hasil Ujian Selesai */}
            {examResultModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center space-y-5 animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Award className="w-8 h-8" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-xl">Ujian Berhasil Diselesaikan!</h3>
                            <p className="text-xs text-slate-500">
                                {examResultModal.judul} ({examResultModal.mapel})
                            </p>
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="text-xs uppercase font-semibold text-slate-500">Nilai Akhir Anda</div>
                            <div className="text-4xl font-black text-indigo-600 font-mono">
                                {examResultModal.skor}
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-200">
                                <span className="text-emerald-700">✓ Benar: {examResultModal.benar} Soal</span>
                                <span className="text-rose-700">✕ Salah: {examResultModal.salah} Soal</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setExamResultModal(null)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                        >
                            Tutup & Kembali ke Beranda
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Review Soal & Kunci Jawaban */}
            {reviewExam && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 animate-in fade-in">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Pembahasan Soal Ujian</h3>
                                <p className="text-xs text-slate-500">
                                    {reviewExam.judul_ujian} • Skor Anda: {reviewExam.hasil_siswa ? reviewExam.hasil_siswa.skor : '-'}
                                </p>
                            </div>
                            <button onClick={() => setReviewExam(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {reviewExam.soal && reviewExam.soal.map((s, idx) => (
                                <div key={s.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                                    <div className="font-semibold text-slate-800">
                                        {idx + 1}. {s.pertanyaan}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                                        <div className={`p-1.5 rounded ${s.kunci_jawaban === 'A' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                            A. {s.pilihan_a}
                                        </div>
                                        <div className={`p-1.5 rounded ${s.kunci_jawaban === 'B' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                            B. {s.pilihan_b}
                                        </div>
                                        <div className={`p-1.5 rounded ${s.kunci_jawaban === 'C' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                            C. {s.pilihan_c}
                                        </div>
                                        <div className={`p-1.5 rounded ${s.kunci_jawaban === 'D' ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}>
                                            D. {s.pilihan_d}
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-emerald-700 font-bold pt-1">
                                        Kunci Jawaban Benar: Pilihan {s.kunci_jawaban}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setReviewExam(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                                Tutup Pembahasan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Tab Navigation Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setSubTab('ujian')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        subTab === 'ujian'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>Ujian Online CBT ({filteredUjian.length})</span>
                </button>
                <button
                    onClick={() => setSubTab('materi')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        subTab === 'materi'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Materi Pembelajaran ({filteredMateri.length})</span>
                </button>
            </div>

            {/* TAB CONTENT: UJIAN ONLINE CBT */}
            {subTab === 'ujian' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Daftar Ujian Online (CBT)</h2>
                                <p className="text-xs text-slate-500">Pilih paket ujian aktif yang telah disetujui kurikulum untuk mulai mengerjakan</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari judul ujian / mapel..."
                                value={searchUjian}
                                onChange={(e) => setSearchUjian(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                            <span className="text-xs">Memuat daftar ujian aktif...</span>
                        </div>
                    ) : filteredUjian.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Belum ada ujian online yang tersedia.</p>
                            <p className="text-xs text-slate-400 mt-1">Ujian akan muncul di sini setelah paket soal disetujui oleh Waka Kurikulum.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUjian.map((item) => {
                                const sudah = item.sudah_dikerjakan;

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-5 rounded-xl border transition space-y-4 shadow-2xs ${
                                            sudah
                                                ? 'bg-slate-50/70 border-slate-200'
                                                : 'bg-white border-slate-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase rounded border border-indigo-200">
                                                    {item.nama_mapel}
                                                </span>
                                                <h3 className="font-bold text-slate-800 text-base pt-1">
                                                    {item.judul_ujian}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Guru: {item.nama_guru || 'Guru'} • {item.durasi_menit} Menit • {item.jumlah_soal || 0} Soal
                                                </p>
                                            </div>

                                            {sudah ? (
                                                <div className="text-right">
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        Selesai
                                                    </span>
                                                    <div className="text-lg font-black text-emerald-700 font-mono mt-1">
                                                        {item.skor_siswa}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    Tersedia
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            {sudah ? (
                                                <button
                                                    onClick={() => handleOpenReview(item.id)}
                                                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Review Soal & Pembahasan</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartExam(item)}
                                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <span>Mulai Kerjakan Ujian Sekarang</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: MATERI PEMBELAJARAN (PDF) */}
            {subTab === 'materi' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Materi Pembelajaran (PDF)</h2>
                                <p className="text-xs text-slate-500">Unduh modul dan materi pelajaran resmi yang diterbitkan oleh Guru</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari materi / mapel..."
                                value={searchMateri}
                                onChange={(e) => setSearchMateri(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
                            <span className="text-xs">Memuat katalog materi...</span>
                        </div>
                    ) : filteredMateri.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Belum ada materi pembelajaran untuk kelas Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredMateri.map((item) => {
                                const fileUrl = getFileUrl(item.file_path);

                                return (
                                    <div
                                        key={item.id}
                                        className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl hover:bg-white hover:border-violet-300 transition space-y-3 shadow-2xs"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <span className="px-2 py-0.5 bg-violet-100 text-violet-800 font-bold text-[10px] uppercase rounded">
                                                    {item.nama_mapel}
                                                </span>
                                                <h3 className="font-bold text-slate-800 text-base pt-1 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                                                    <span>{item.judul}</span>
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Pengampu: {item.nama_guru || 'Guru'} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Buka & Unduh PDF</span>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
