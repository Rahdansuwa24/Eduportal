import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
    const { login, switchDemoRole } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email dan Password wajib diisi!');
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            navigate(`/${data.user.role}`);
        } catch (err) {
            setError(err.message || 'Email atau password salah! Pastikan server backend aktif.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (roleKey) => {
        const dummyEmails = {
            admin: 'admin@sekolah.sch.id',
            waka: 'waka@sekolah.sch.id',
            guru: 'budi@sekolah.sch.id',
            siswa: 'siti@sekolah.sch.id',
        };
        const targetEmail = dummyEmails[roleKey];
        const targetPass = 'password123';
        setEmail(targetEmail);
        setPassword(targetPass);
        setLoading(true);
        setError('');
        try {
            const data = await login(targetEmail, targetPass);
            navigate(`/${data.user.role}`);
        } catch (err) {
            setError(err.message || 'Gagal masuk secara instan! Pastikan backend aktif.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
            {/* Background Decorative Gradients */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Container Card */}
            <div className="w-full max-w-5xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

                {/* Left Side: Branding Banner */}
                <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="space-y-6 relative z-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="font-extrabold text-2xl tracking-tight text-white leading-none">EduPortal<span className="text-amber-300">Pro</span></h1>
                                <p className="text-[11px] text-indigo-100 font-medium tracking-wide">Sistem Manajemen Sekolah Terpadu</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <h2 className="text-xl lg:text-2xl font-bold leading-tight">
                                Selamat Datang di Portal Edukasi Sekolah
                            </h2>
                            <p className="text-xs text-indigo-100 leading-relaxed opacity-90">
                                Akses terpusat untuk Manajemen Kurikulum, Presensi Berbasis AI, Bank Soal Ujian, dan Analitik Performa untuk 4 Role Pengguna.
                            </p>
                        </div>
                    </div>

                    {/* Features List Bullet */}
                    <div className="pt-8 lg:pt-0 space-y-3 border-t border-white/15 mt-8 relative z-10">
                        <div className="flex items-center gap-2.5 text-xs text-indigo-100 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>Presensi Harian Berbasis Waktu (07:30 WIB)</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-indigo-100 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>AI Auto-Generate Quiz Generator & Bank Soal</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-indigo-100 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>Monitoring Analitik System & Multi-Role Security</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="lg:col-span-7 p-8 lg:p-12 space-y-6 bg-slate-800/40">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Masuk ke Akun Anda</h2>
                        <p className="text-xs text-slate-400 mt-1">Masukkan alamat email dan password terdaftar Anda</p>
                    </div>

                    {error && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">Alamat Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@sekolah.sch.id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-slate-300">Password</label>
                                <a href="#" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi Admin Sekolah untuk reset password Anda.'); }} className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                                    Lupa Password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                />
                                <span className="text-xs text-slate-300 font-medium">Ingat Saya di Perangkat Ini</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Masuk ke Portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Login Section */}
                    <div className="pt-4 border-t border-slate-700/60 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                            <span>🚀 Demo Quick Login (Pilih 1 Role):</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                onClick={() => handleQuickLogin('admin')}
                                className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                            >
                                🔑 Admin
                            </button>
                            <button
                                onClick={() => handleQuickLogin('waka')}
                                className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                            >
                                📑 Waka
                            </button>
                            <button
                                onClick={() => handleQuickLogin('guru')}
                                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                            >
                                👨‍🏫 Guru
                            </button>
                            <button
                                onClick={() => handleQuickLogin('siswa')}
                                className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                            >
                                🎓 Siswa
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
