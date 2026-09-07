import React, { useState } from 'react';
import { Users, ShieldCheck, UserX, UserCheck, UserPlus, X, Check, Search, Filter, RotateCcw, Eye, EyeOff, Key, User, Mail, Calendar, Clock, Info, ExternalLink } from 'lucide-react';

export const UserManagement = () => {
    const [usersList, setUsersList] = useState([
        { id: 1, nama: 'Admin Utama', email: 'admin@sekolah.sch.id', role: 'admin', is_active: true },
        { id: 2, nama: 'Waka Kurikulum', email: 'waka@sekolah.sch.id', role: 'waka', is_active: true },
        { id: 3, nama: 'Pak Budi (Guru Math)', email: 'budi@sekolah.sch.id', role: 'guru', is_active: true },
        { id: 4, nama: 'Siti Rahma (Siswa)', email: 'siti@sekolah.sch.id', role: 'siswa', is_active: true },
        { id: 5, nama: 'Ahmad Fauzi (Siswa)', email: 'ahmad@sekolah.sch.id', role: 'siswa', is_active: false },
    ]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // State untuk Detail User Modal Popup
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal state untuk Tambah Akun Baru
    const [showModal, setShowModal] = useState(false);
    const [newNama, setNewNama] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordToggle, setShowPasswordToggle] = useState(false);
    const [newRole, setNewRole] = useState('siswa');
    const [successMsg, setSuccessMsg] = useState('');

    const toggleUserActive = (id) => {
        setUsersList(usersList.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
        if (selectedUser && selectedUser.id === id) {
            setSelectedUser(prev => ({ ...prev, is_active: !prev.is_active }));
        }
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!newNama || !newEmail || !newPassword) return;
        const newUser = {
            id: Date.now(),
            nama: newNama,
            email: newEmail,
            role: newRole,
            is_active: true
        };
        setUsersList([...usersList, newUser]);
        setNewNama('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('siswa');
        setShowModal(false);
        setSuccessMsg(`Akun (${newRole.toUpperCase()}) untuk "${newNama}" berhasil dibuat!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    // Filter Logic
    const filteredUsers = usersList.filter(user => {
        const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' ? user.is_active : !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setStatusFilter('all');
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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.length}</div>
                        <div className="text-xs text-slate-500 font-medium">Total Pengguna</div>
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
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><UserX className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{usersList.filter(u => !u.is_active).length}</div>
                        <div className="text-xs text-slate-500 font-medium">Pengguna Nonaktif</div>
                    </div>
                </div>
            </div>

            {/* User Management Table Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Manajemen Pengguna & Pengaktifan Akun</h2>
                            <p className="text-xs text-slate-500">Klik pada nama pengguna untuk melihat detail rincian profil akun</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" /> Buat Akun Baru
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    {/* Search Input */}
                    <div className="sm:col-span-6 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email pengguna..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Role */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                            <option value="all">Semua Role</option>
                            <option value="admin">🔑 Admin</option>
                            <option value="waka">📑 Waka</option>
                            <option value="guru">👨‍🏫 Guru</option>
                            <option value="siswa">🎓 Siswa</option>
                        </select>
                    </div>

                    {/* Filter Status */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">🟢 Status Aktif</option>
                            <option value="inactive">🔴 Status Nonaktif</option>
                        </select>
                    </div>
                </div>

                {/* Filter info indicator */}
                {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-600">
                        <span>Menampilkan <strong>{filteredUsers.length}</strong> dari <strong>{usersList.length}</strong> pengguna</span>
                        <button onClick={resetFilters} className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                            <RotateCcw className="w-3 h-3" /> Reset Filter
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3.5">Nama</th>
                                <th className="p-3.5">Email</th>
                                <th className="p-3.5">Role</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Aksi Toggle Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-indigo-50/30 transition">
                                        <td className="p-3.5">
                                            <button
                                                onClick={() => setSelectedUser(u)}
                                                className="font-semibold text-indigo-600 hover:text-indigo-900 hover:underline text-left inline-flex items-center gap-1.5 group"
                                            >
                                                {u.nama}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </td>
                                        <td className="p-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded text-xs capitalize font-semibold ${
                                                u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                u.role === 'waka' ? 'bg-amber-100 text-amber-800' :
                                                u.role === 'guru' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {u.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button onClick={() => toggleUserActive(u.id)} className={`px-3 py-1.5 rounded text-xs font-semibold transition ${u.is_active ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                                                {u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                                        Tidak ada akun pengguna yang cocok dengan kriteria pencarian/filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail User Popup */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                                    {selectedUser.nama.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedUser.nama}</h3>
                                    <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                                        selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        selectedUser.role === 'waka' ? 'bg-amber-100 text-amber-800' :
                                        selectedUser.role === 'guru' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                                    }`}>
                                        {selectedUser.role} Portal
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Rincian Detail User */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-indigo-500" /> ID Pengguna
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-700">#USR-00{selectedUser.id}</div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Terdaftar
                                </div>
                                <div className="text-xs font-semibold text-slate-700 truncate">{selectedUser.email}</div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Tanggal Registrasi
                                </div>
                                <div className="text-xs font-semibold text-slate-700">10 Januari 2026</div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Aktivitas Terakhir
                                </div>
                                <div className="text-xs font-semibold text-slate-700">Hari ini, 18:45 WIB</div>
                            </div>
                        </div>

                        {/* Status Access Box */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-slate-700">Status Hak Akses Portal</div>
                                <div className="text-[11px] text-slate-500">Pengguna dapat login jika status AKTIF</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {selectedUser.is_active ? 'AKTIF' : 'NONAKTIF'}
                            </span>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                                onClick={() => toggleUserActive(selectedUser.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${selectedUser.is_active ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                            >
                                {selectedUser.is_active ? 'Nonaktifkan Akses Akun Ini' : 'Aktifkan Akses Akun Ini'}
                            </button>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Akun Pengguna (4 Role) */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">Buat Akun Pengguna Baru</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Budi Santoso, M.Pd"
                                    value={newNama}
                                    onChange={(e) => setNewNama(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="budi@sekolah.sch.id"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Password Akun</label>
                                <div className="relative">
                                    <input
                                        type={showPasswordToggle ? "text" : "password"}
                                        required
                                        minLength={6}
                                        placeholder="Ketik password pengguna..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-3.5 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswordToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Akun (Pilih 1 dari 4 Role)</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="admin">🔑 Admin (Administrator System)</option>
                                    <option value="waka">📑 Waka (Wakil Kepala Kurikulum)</option>
                                    <option value="guru">👨‍🏫 Guru (Tenaga Pengajar)</option>
                                    <option value="siswa">🎓 Siswa (Peserta Didik)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Check className="w-4 h-4" /> Simpan & Buat Akun
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};



