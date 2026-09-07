import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/authContext';

export const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentRole } = useAuth();

    // Auto reset active tab ketika role berganti
    useEffect(() => {
        const defaultTabs = {
            admin: 'users',
            waka: 'mapel',
            guru: 'presensi-guru',
            siswa: 'presensi'
        };
        setActiveTab(defaultTabs[currentRole]);
    }, [currentRole, setActiveTab]);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
