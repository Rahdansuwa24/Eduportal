import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { Menu, LogOut } from 'lucide-react';

export const Header = ({ setSidebarOpen }) => {
    const { currentRole, user, logout } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.nama || user?.name || (currentRole ? currentRole.toUpperCase() : 'User');
    const displayEmail = user?.email || `${currentRole || 'user'}@sekolah.sch.id`;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Title Placeholder */}
            <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-slate-700">
                    Sistem Informasi Manajemen Sekolah
                </h2>
            </div>

            {/* Right Controls: User Info & Logout Button */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-slate-800">{displayName}</div>
                    <div className="text-[10px] text-slate-500">{displayEmail}</div>
                </div>
                <button
                    onClick={handleLogout}
                    title="Keluar / Log Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};
