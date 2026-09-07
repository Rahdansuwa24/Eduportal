import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import {
    Users,
    BarChart3,
    BookOpen,
    Calendar,
    CheckSquare,
    FileText,
    Sparkles,
    CalendarCheck,
    GraduationCap,
    School,
    FileCheck,
    FilePlus,
    X
} from 'lucide-react';

const roleMenus = {
    admin: [
        { label: 'User Management', icon: Users, id: 'users' },
        // { label: 'System Analytics', icon: BarChart3, id: 'analytics' },
    ],
    waka: [
        { label: 'Jadwal & Waktu Kurikulum', icon: Calendar, id: 'kurikulum' },
        { label: 'Mata Pelajaran (Mapel)', icon: BookOpen, id: 'mapel' },
        { label: 'ACC Soal Ujian', icon: CheckSquare, id: 'acc-soal' },
    ],
    guru: [
        { label: 'Rekap & Override Presensi', icon: CalendarCheck, id: 'presensi-guru' },
        { label: 'Verifikasi ACC Surat Izin', icon: FileCheck, id: 'acc-izin' },
        { label: 'Unggah Materi PDF', icon: FileText, id: 'materi' },
        { label: 'AI Quiz Generator', icon: Sparkles, id: 'ai-quiz' },
    ],
    siswa: [
        { label: 'Presensi Harian (Waktu)', icon: CalendarCheck, id: 'presensi' },
        { label: 'Form Perizinan & Surat', icon: FilePlus, id: 'perizinan-siswa' },
        { label: 'Materi & Ujian Online', icon: GraduationCap, id: 'ujian' },
        { label: 'Grafik Nilai Semester', icon: BarChart3, id: 'nilai' },
    ],
};

export const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
    const { currentRole } = useAuth();
    const navigate = useNavigate();
    const menus = roleMenus[currentRole] || [];

    const handleMenuClick = (itemId) => {
        setActiveTab(itemId);
        setSidebarOpen(false);
        navigate(`/${currentRole}?tab=${itemId}`);
    };

    return (
        <>
            {/* Overlay Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Header Logo */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <School className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">EduPortal</h1>
                            <span className="text-xs text-indigo-400 font-medium">Pro Dashboard</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Role Badge */}
                <div className="px-6 py-4 border-b border-slate-800/60">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Role Aktif
                    </div>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                        {currentRole} Portal
                    </div>
                </div>

                {/* Menu Navigasi */}
                <nav className="p-4 space-y-1">
                    {menus.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)}
                                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};
