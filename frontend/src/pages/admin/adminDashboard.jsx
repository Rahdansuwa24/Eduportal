import React, { useState, useEffect, useMemo } from 'react';
import { Users, ShieldCheck, UserX, UserCheck, UserPlus, Plus, Trash2, X, AlertCircle, Edit3, KeyRound, Search, Filter, Calendar, GraduationCap, Clock } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { addYears, addMonths, format } from 'date-fns';

export const AdminDashboard = ({ activeTab }) => {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Academic Info State
    const [academicInfo, setAcademicInfo] = useState({
        tahun_ajaran_aktif: '2026/2027',
        semester_aktif: 'Ganjil',
        tanggal_masuk_default: '',
        tanggal_lulus_default: ''
    });

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterKelas, setFilterKelas] = useState('all');
    const [filterJurusan, setFilterJurusan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterStatusSiswa, setFilterStatusSiswa] = useState('all');

    // Modal State Registrasi
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    // Modal State Edit User
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editModalError, setEditModalError] = useState('');

    // Template default 1 baris pendaftaran (Menggunakan kalkulasi presisi date-fns)
    const emptyUserRow = (info = academicInfo) => {
        const today = new Date();
        // Hari Ini + 3 Tahun + 1 Bulan
        const tglLulusCalc = format(addMonths(addYears(today, 3), 1), 'yyyy-MM-dd');
        const tglMasukCalc = format(today, 'yyyy-MM-dd');

        return {
            nama: '',
            email: '',
            role: 'siswa',
            tingkat_kelas: '10',
            jurusan: 'MIPA',
            tanggal_masuk: info.tanggal_masuk_default || tglMasukCalc,
            tanggal_lulus: info.tanggal_lulus_default || tglLulusCalc,
            status_siswa: 'aktif',
            password: 'password123'
        };
    };

    // State Multiple Users dalam Modal
    const [inputUsers, setInputUsers] = useState([emptyUserRow()]);

    // Fetch All Users & Academic Info dari Backend
    const loadUsers = async () => {
        try {
            const data = await apiFetch('/users');
            setUsersList(data);
        } catch (err) {
            console.error('Gagal mengambil data user:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAcademicInfo = async () => {
        try {
            const data = await apiFetch('/users/akademik-info');
            setAcademicInfo(data);
            // Re-initialize 1 baris modal dengan tanggal default presisi
            setInputUsers([emptyUserRow(data)]);
        } catch (err) {
            console.error('Gagal mengambil info akademik:', err);
        }
    };

    useEffect(() => {
        loadUsers();
        loadAcademicInfo();
    }, []);

    // Filter & Search Logic
    const filteredUsers = useMemo(() => {
        return usersList.filter(u => {
            // Search by nama or email
            const searchLower = searchTerm.toLowerCase().trim();
            const matchesSearch = !searchLower || 
                (u.nama && u.nama.toLowerCase().includes(searchLower)) || 
                (u.email && u.email.toLowerCase().includes(searchLower));

            // Filter by role
            const matchesRole = filterRole === 'all' || u.role === filterRole;

            // Filter by kelas (hanya relevan jika role siswa / all)
            const matchesKelas = filterKelas === 'all' || String(u.tingkat_kelas) === filterKelas;

            // Filter by jurusan (hanya relevan jika role siswa / all)
            const matchesJurusan = filterJurusan === 'all' || u.jurusan === filterJurusan;

            // Filter by status aktif (Akun AKTIF / NONAKTIF)
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'active' && u.is_active) || 
                (filterStatus === 'inactive' && !u.is_active);

            // Filter by status siswa (aktif / lulus / pindah / drop_out)
            const matchesStatusSiswa = filterStatusSiswa === 'all' || u.status_siswa === filterStatusSiswa;

            return matchesSearch && matchesRole && matchesKelas && matchesJurusan && matchesStatus && matchesStatusSiswa;
        });
    }, [usersList, searchTerm, filterRole, filterKelas, filterJurusan, filterStatus, filterStatusSiswa]);

    // Buka Modal Edit User
    const handleOpenEditModal = (user) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const defaultLulus = format(addMonths(addYears(new Date(), 3), 1), 'yyyy-MM-dd');

        setEditingUser({
            id: user.id,
            nama: user.nama || '',
            email: user.email || '',
            role: user.role || 'siswa',
            tingkat_kelas: user.tingkat_kelas || '10',
            jurusan: user.jurusan || 'MIPA',
            tanggal_masuk: user.tanggal_masuk ? user.tanggal_masuk.substring(0, 10) : todayStr,
            tanggal_lulus: user.tanggal_lulus ? user.tanggal_lulus.substring(0, 10) : defaultLulus,
            status_siswa: user.status_siswa || 'aktif',
            password: '' // kosongkan jika tidak ingin ganti password
        });
        setEditModalError('');
        setIsEditModalOpen(true);
    };

    // Update Input Edit User
    const handleEditInputChange = (field, value) => {
        setEditingUser(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'role') {
                if (value === 'siswa') {
                    updated.tingkat_kelas = '10';
                    updated.jurusan = 'MIPA';
                    updated.status_siswa = 'aktif';
                } else {
                    updated.tingkat_kelas = 'staff';
                    updated.jurusan = null;
                    updated.tanggal_masuk = null;
                    updated.tanggal_lulus = null;
                    updated.status_siswa = 'aktif';
                }
            }
            return updated;
        });
    };

    // Submit Update User
    const handleUpdateUserSubmit = async (e) => {
        e.preventDefault();
        setEditModalError('');
        setEditSubmitting(true);

        try {
            if (!editingUser.nama.trim()) throw new Error('Nama lengkap tidak boleh kosong!');
            if (!editingUser.email.trim()) throw new Error('Email akun tidak boleh kosong!');

            const res = await apiFetch(`/users/${editingUser.id}`, {
                method: 'PUT',
                body: JSON.stringify(editingUser)
            });

            setToastMessage(`✅ ${res.message || 'Data pengguna berhasil diperbarui!'}`);
            setIsEditModalOpen(false);
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            setEditModalError(err.message || 'Gagal memperbarui data pengguna');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Hapus Pengguna Permanen
    const handleDeleteUser = async (user) => {
        const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.nama}" (${user.email}) secara permanen? Data yang terhapus tidak dapat dikembalikan!`);
        if (!confirmDelete) return;

        try {
            const res = await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
            setToastMessage(`✅ ${res.message || 'Akun pengguna berhasil dihapus!'}`);
            loadUsers();
        } catch (err) {
            alert(`Gagal menghapus pengguna: ${err.message}`);
        }
    };

    // Tambah Baris Pengguna dalam Modal
    const handleAddRow = () => {
        setInputUsers([...inputUsers, emptyUserRow()]);
    };

    // Hapus Baris Pengguna dalam Modal
    const handleRemoveRow = (index) => {
        if (inputUsers.length === 1) {
            setInputUsers([emptyUserRow()]);
            return;
        }
        setInputUsers(inputUsers.filter((_, i) => i !== index));
    };

    // Update Nilai per Field per Baris
    const handleInputChange = (index, field, value) => {
        const updated = [...inputUsers];
        updated[index][field] = value;

        // Reset default jurusan/kelas saat role berubah
        if (field === 'role') {
            if (value === 'siswa') {
                const today = new Date();
                updated[index].tingkat_kelas = '10';
                updated[index].jurusan = 'MIPA';
                updated[index].tanggal_masuk = academicInfo.tanggal_masuk_default || format(today, 'yyyy-MM-dd');
                updated[index].tanggal_lulus = academicInfo.tanggal_lulus_default || format(addMonths(addYears(today, 3), 1), 'yyyy-MM-dd');
                updated[index].status_siswa = 'aktif';
            } else {
                updated[index].tingkat_kelas = 'staff';
                updated[index].jurusan = null;
                updated[index].tanggal_masuk = null;
                updated[index].tanggal_lulus = null;
                updated[index].status_siswa = 'aktif';
            }
        }

        setInputUsers(updated);
    };

    // Submit Pendaftaran Multiple Users
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setSubmitting(true);

        try {
            // Validasi data di client-side
            for (let i = 0; i < inputUsers.length; i++) {
                const u = inputUsers[i];
                if (!u.nama.trim()) throw new Error(`Baris ke-${i + 1}: Nama belum diisi!`);
                if (!u.email.trim()) throw new Error(`Baris ke-${i + 1}: Email belum diisi!`);
            }

            const res = await apiFetch('/users/register', {
                method: 'POST',
                body: JSON.stringify({ users: inputUsers })
            });

            setToastMessage(`✅ ${res.message || 'Pengguna berhasil didaftarkan!'}`);
            setIsModalOpen(false);
            setInputUsers([emptyUserRow()]);
            loadUsers();
        } catch (err) {
            setModalError(err.message || 'Terjadi kesalahan saat mendaftarkan pengguna');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleUserActive = async (id) => {
        try {
            const res = await apiFetch(`/users/${id}/toggle`, { method: 'PATCH' });
            setUsersList(usersList.map(u => u.id === id ? { ...u, is_active: res.is_active } : u));
        } catch (err) {
            alert(`Gagal mengubah status: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notifikasi Toast Sukses */}
            {toastMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">✕ Tutup</button>
                </div>
            )}

            {/* BAR INFORMASI TAHUN AJARAN & SEMESTER AKTIF SEKOLAH */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-indigo-300 border border-white/10">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Tahun Akademik Sekolah</div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            <span>Tahun Ajaran {academicInfo.tahun_ajaran_aktif}</span>
                            <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-semibold text-indigo-200">
                                Semester {academicInfo.semester_aktif}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-200 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Scheduler Cron Job Active 24/7 (00:00:00)</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.length}</div>
                        <div className="text-xs text-slate-500 font-medium">Total Pengguna Terdaftar</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><UserCheck className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.filter(u => u.is_active).length}</div>
                        <div className="text-xs text-slate-500 font-medium">Pengguna Aktif</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><GraduationCap className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.filter(u => u.status_siswa === 'lulus').length}</div>
                        <div className="text-xs text-slate-500 font-medium">Siswa Lulus</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><UserX className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.filter(u => !u.is_active).length}</div>
                        <div className="text-xs text-slate-500 font-medium">Pengguna Nonaktif</div>
                    </div>
                </div>
            </div>

            {/* Tab: User Management Table & Action Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Daftar Pengguna & Kelola Kelulusan</h2>
                            <p className="text-xs text-slate-500">Klik nama pengguna untuk mengedit data, atau hapus permanen dengan icon tempat sampah</p>
                        </div>
                    </div>

                    {/* Tombol Buka Pop-up Registrasi */}
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setModalError('');
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition hover:shadow shrink-0"
                    >
                        <UserPlus className="w-4 h-4" /> Daftarkan Pengguna Baru
                    </button>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search Box */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama lengkap atau email pengguna..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter Role */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg">
                            <span className="text-[11px] font-semibold text-slate-500">Role:</span>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="text-xs bg-transparent focus:outline-none font-medium text-slate-700"
                            >
                                <option value="all">Semua</option>
                                <option value="siswa">🎓 Siswa</option>
                                <option value="guru">👨‍🏫 Guru</option>
                                <option value="waka">📋 Waka</option>
                                <option value="admin">⚙️ Admin</option>
                            </select>
                        </div>

                        {/* Filter Kelas */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg">
                            <span className="text-[11px] font-semibold text-slate-500">Kelas:</span>
                            <select
                                value={filterKelas}
                                onChange={(e) => setFilterKelas(e.target.value)}
                                className="text-xs bg-transparent focus:outline-none font-medium text-slate-700"
                            >
                                <option value="all">Semua</option>
                                <option value="10">Kelas 10</option>
                                <option value="11">Kelas 11</option>
                                <option value="12">Kelas 12</option>
                            </select>
                        </div>

                        {/* Filter Jurusan */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg">
                            <span className="text-[11px] font-semibold text-slate-500">Jurusan:</span>
                            <select
                                value={filterJurusan}
                                onChange={(e) => setFilterJurusan(e.target.value)}
                                className="text-xs bg-transparent focus:outline-none font-medium text-slate-700"
                            >
                                <option value="all">Semua</option>
                                <option value="MIPA">🔬 MIPA</option>
                                <option value="IPS">🌍 IPS</option>
                                <option value="Bahasa">📚 Bahasa</option>
                            </select>
                        </div>

                        {/* Filter Status Siswa */}
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg">
                            <span className="text-[11px] font-semibold text-slate-500">Status Siswa:</span>
                            <select
                                value={filterStatusSiswa}
                                onChange={(e) => setFilterStatusSiswa(e.target.value)}
                                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-700"
                            >
                                <option value="all">Semua Status</option>
                                <option value="aktif">🟢 Siswa Aktif</option>
                                <option value="lulus">🎓 Lulus</option>
                                <option value="pindah">➡️ Pindah</option>
                                <option value="drop_out">🚫 Drop Out</option>
                            </select>
                        </div>

                        {/* Reset Filter Button */}
                        {(searchTerm || filterRole !== 'all' || filterKelas !== 'all' || filterJurusan !== 'all' || filterStatus !== 'all' || filterStatusSiswa !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('all');
                                    setFilterKelas('all');
                                    setFilterJurusan('all');
                                    setFilterStatus('all');
                                    setFilterStatusSiswa('all');
                                }}
                                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg font-semibold transition"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Information Result Count */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                        Menampilkan <strong className="text-slate-800">{filteredUsers.length}</strong> dari total {usersList.length} pengguna
                    </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="p-3.5">Nama Lengkap (Klik utk Edit)</th>
                                <th className="p-3.5">Email Akun</th>
                                <th className="p-3.5">Role</th>
                                <th className="p-3.5">Kelas & Jurusan</th>
                                <th className="p-3.5">Tgl Masuk / Tgl Lulus</th>
                                <th className="p-3.5">Status Siswa</th>
                                <th className="p-3.5">Akses Akun</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400 text-sm">
                                        Tidak ada pengguna yang cocok dengan kriteria pencarian / filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                        {/* Nama Lengkap Sebagai Hyperlink Pemicu Edit Modal */}
                                        <td className="p-3.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(u)}
                                                className="group text-left font-semibold text-indigo-600 hover:text-indigo-900 underline decoration-indigo-300 underline-offset-4 hover:decoration-indigo-600 flex items-center gap-1.5 transition"
                                                title="Klik untuk mengedit data pengguna ini"
                                            >
                                                <span>{u.nama}</span>
                                                <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                                            </button>
                                        </td>
                                        <td className="p-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                                        <td className="p-3.5">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs capitalize font-semibold">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-xs">
                                            {u.role === 'siswa' ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-700 font-medium">Kelas {u.tingkat_kelas}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                        u.jurusan === 'MIPA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        u.jurusan === 'IPS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        'bg-purple-50 text-purple-700 border border-purple-200'
                                                    }`}>
                                                        {u.jurusan || 'MIPA'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-normal">Staff Sekolah</span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-xs">
                                            {u.role === 'siswa' ? (
                                                <div className="space-y-0.5 font-mono text-[11px]">
                                                    <div className="text-slate-600 flex items-center gap-1">
                                                        <span className="text-slate-400">Masuk:</span> {u.tanggal_masuk ? u.tanggal_masuk.substring(0, 10) : '-'}
                                                    </div>
                                                    <div className="text-slate-600 flex items-center gap-1">
                                                        <span className="text-slate-400">Lulus:</span> {u.tanggal_lulus ? u.tanggal_lulus.substring(0, 10) : '-'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-normal">-</span>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            {u.role === 'siswa' ? (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    u.status_siswa === 'lulus' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                    u.status_siswa === 'aktif' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                    'bg-slate-100 text-slate-700 border border-slate-200'
                                                }`}>
                                                    {u.status_siswa === 'lulus' ? '🎓 LULUS' : u.status_siswa.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-normal text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                {u.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right flex items-center justify-end gap-2">
                                            {/* Icon Tempat Sampah (Hapus Akun Permanen) */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(u)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                                                title={`Hapus akun "${u.nama}" permanen`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => toggleUserActive(u.id)} 
                                                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${u.is_active ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                                            >
                                                {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POP-UP MODAL: Multiple User Registration */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Registrasi Akun Terpusat (Banyak Pengguna)</h3>
                                    <p className="text-xs text-slate-500">Pendaftaran otomatis menghitung Tanggal Lulus presisi (+3 Thn +1 Bln)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Error Alert */}
                        {modalError && (
                            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        {/* Modal Body - Form Table */}
                        <form onSubmit={handleBatchSubmit} className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3 w-8 text-center">#</th>
                                                <th className="p-3 min-w-[150px]">Nama Lengkap *</th>
                                                <th className="p-3 min-w-[160px]">Email Login *</th>
                                                <th className="p-3 min-w-[110px]">Role</th>
                                                <th className="p-3 min-w-[100px]">Kelas</th>
                                                <th className="p-3 min-w-[100px]">Jurusan</th>
                                                <th className="p-3 min-w-[125px]">Tanggal Masuk</th>
                                                <th className="p-3 min-w-[125px]">Tanggal Lulus</th>
                                                <th className="p-3 min-w-[120px]">Password Awal</th>
                                                <th className="p-3 w-10 text-center">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {inputUsers.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/60">
                                                    <td className="p-3 text-center font-bold text-slate-400">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="misal: Budi Utomo"
                                                            value={row.nama}
                                                            onChange={(e) => handleInputChange(idx, 'nama', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="email"
                                                            required
                                                            placeholder="budi@sekolah.sch.id"
                                                            value={row.email}
                                                            onChange={(e) => handleInputChange(idx, 'email', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            value={row.role}
                                                            onChange={(e) => handleInputChange(idx, 'role', e.target.value)}
                                                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                                                        >
                                                            <option value="siswa">🎓 Siswa</option>
                                                            <option value="guru">👨‍🏫 Guru</option>
                                                            <option value="waka">📋 Waka</option>
                                                            <option value="admin">⚙️ Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        {row.role === 'siswa' ? (
                                                            <select
                                                                value={row.tingkat_kelas}
                                                                onChange={(e) => handleInputChange(idx, 'tingkat_kelas', e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            >
                                                                <option value="10">Kelas 10</option>
                                                                <option value="11">Kelas 11</option>
                                                                <option value="12">Kelas 12</option>
                                                            </select>
                                                        ) : (
                                                            <span className="block px-2 py-1.5 text-slate-400 bg-slate-50 rounded-lg text-center font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        {row.role === 'siswa' ? (
                                                            <select
                                                                value={row.jurusan}
                                                                onChange={(e) => handleInputChange(idx, 'jurusan', e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700"
                                                            >
                                                                <option value="MIPA">🔬 MIPA</option>
                                                                <option value="IPS">🌍 IPS</option>
                                                                <option value="Bahasa">📚 Bahasa</option>
                                                            </select>
                                                        ) : (
                                                            <span className="block px-2 py-1.5 text-slate-400 bg-slate-50 rounded-lg text-center font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        {row.role === 'siswa' ? (
                                                            <input
                                                                type="date"
                                                                value={row.tanggal_masuk || ''}
                                                                onChange={(e) => handleInputChange(idx, 'tanggal_masuk', e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                                            />
                                                        ) : (
                                                            <span className="block px-2 py-1.5 text-slate-400 bg-slate-50 rounded-lg text-center font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        {row.role === 'siswa' ? (
                                                            <input
                                                                type="date"
                                                                value={row.tanggal_lulus || ''}
                                                                onChange={(e) => handleInputChange(idx, 'tanggal_lulus', e.target.value)}
                                                                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-semibold text-indigo-700"
                                                            />
                                                        ) : (
                                                            <span className="block px-2 py-1.5 text-slate-400 bg-slate-50 rounded-lg text-center font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.password}
                                                            onChange={(e) => handleInputChange(idx, 'password', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(idx)}
                                                            title="Hapus baris ini"
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Tombol Tambah Baris */}
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Baris Pengguna
                                    </button>
                                    <span className="text-xs text-slate-500">
                                        Total: <strong className="text-slate-800">{inputUsers.length}</strong> akun akan didaftarkan
                                    </span>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {submitting ? 'Menyimpan...' : `Simpan ${inputUsers.length} Pengguna`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POP-UP MODAL: Edit Data Pengguna */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                        {/* Header Modal Edit */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Edit Data Pengguna</h3>
                                    <p className="text-xs text-slate-500">Ubah informasi akun, role, kelulusan, atau reset password</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error Alert Edit */}
                        {editModalError && (
                            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>{editModalError}</span>
                            </div>
                        )}

                        {/* Form Edit */}
                        <form onSubmit={handleUpdateUserSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingUser.nama}
                                    onChange={(e) => handleEditInputChange('nama', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Akun *</label>
                                <input
                                    type="email"
                                    required
                                    value={editingUser.email}
                                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role Akun</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => handleEditInputChange('role', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="siswa">🎓 Siswa</option>
                                        <option value="guru">👨‍🏫 Guru</option>
                                        <option value="waka">📋 Waka Kurikulum</option>
                                        <option value="admin">⚙️ Admin</option>
                                    </select>
                                </div>

                                {editingUser.role === 'siswa' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                                        <select
                                            value={editingUser.tingkat_kelas}
                                            onChange={(e) => handleEditInputChange('tingkat_kelas', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="10">Kelas 10</option>
                                            <option value="11">Kelas 11</option>
                                            <option value="12">Kelas 12</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">Tingkat Kelas</label>
                                        <div className="px-3 py-2 text-sm bg-slate-100 text-slate-500 rounded-lg font-medium">Staff</div>
                                    </div>
                                )}
                            </div>

                            {editingUser.role === 'siswa' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Jurusan Siswa</label>
                                        <select
                                            value={editingUser.jurusan || 'MIPA'}
                                            onChange={(e) => handleEditInputChange('jurusan', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700"
                                        >
                                            <option value="MIPA">🔬 MIPA (Matematika & IPA)</option>
                                            <option value="IPS">🌍 IPS (Ilmu Pengetahuan Sosial)</option>
                                            <option value="Bahasa">📚 Bahasa & Budaya</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Masuk</label>
                                            <input
                                                type="date"
                                                value={editingUser.tanggal_masuk || ''}
                                                onChange={(e) => handleEditInputChange('tanggal_masuk', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lulus</label>
                                            <input
                                                type="date"
                                                value={editingUser.tanggal_lulus || ''}
                                                onChange={(e) => handleEditInputChange('tanggal_lulus', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-semibold text-indigo-700"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status Siswa</label>
                                        <select
                                            value={editingUser.status_siswa || 'aktif'}
                                            onChange={(e) => handleEditInputChange('status_siswa', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                                        >
                                            <option value="aktif">🟢 Siswa Aktif</option>
                                            <option value="lulus">🎓 Lulus</option>
                                            <option value="pindah">➡️ Pindah Sekolah</option>
                                            <option value="drop_out">🚫 Drop Out (DO)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                    Ganti Password (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Biarkan kosong jika password tidak diubah"
                                    value={editingUser.password}
                                    onChange={(e) => handleEditInputChange('password', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono placeholder:text-slate-400 text-xs"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Kosongkan jika hanya ingin memperbarui profil atau status.</p>
                            </div>

                            {/* Footer Modal Edit */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                >
                                    {editSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
