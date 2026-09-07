import React from 'react';
import { MapelManagement } from './MapelManagement';
import { KurikulumManagement } from './KurikulumManagement';
import { AccSoalUjian } from './AccSoalUjian';

export const WakaDashboard = ({ activeTab }) => {
    return (
        <div className="space-y-6">
            {/* Tab 1: Kelola Kurikulum & Waktu Mapel */}
            {(activeTab === 'kurikulum' || activeTab === 'all') && (
                <KurikulumManagement />
            )}

            {/* Tab 2: Kelola Mata Pelajaran (Mapel) */}
            {(activeTab === 'mapel' || activeTab === 'all') && (
                <MapelManagement />
            )}

            {/* Tab 3: Persetujuan (ACC) Soal Ujian */}
            {(activeTab === 'acc-soal' || activeTab === 'all') && (
                <AccSoalUjian />
            )}
        </div>
    );
};
