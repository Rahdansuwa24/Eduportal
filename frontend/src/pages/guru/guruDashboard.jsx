import React from 'react';
import { GuruPresensiOverride } from './GuruPresensiOverride';
import { GuruAccPerizinan } from './GuruAccPerizinan';
import { UnggahMateri } from './UnggahMateri';
import { BankSoalUjian } from './BankSoalUjian';
import { AiQuizGenerator } from './AiQuizGenerator';

export const GuruDashboard = ({ activeTab }) => {
    return (
        <div className="space-y-6">
            {/* Tab 1: Rekap & Override Presensi Siswa */}
            {(activeTab === 'presensi-guru' || activeTab === 'all') && (
                <GuruPresensiOverride />
            )}

            {/* Tab 2: Verifikasi ACC Surat Izin Siswa */}
            {(activeTab === 'acc-izin' || activeTab === 'all') && (
                <GuruAccPerizinan />
            )}

            {/* Tab 3: Bank Soal & Manajemen Ujian */}
            {(activeTab === 'bank-soal' || activeTab === 'all') && (
                <BankSoalUjian />
            )}

            {/* Tab 4: Unggah Materi PDF */}
            {(activeTab === 'materi' || activeTab === 'all') && (
                <UnggahMateri />
            )}

            {/* Tab 5: AI Quiz Generator */}
            {(activeTab === 'ai-quiz' || activeTab === 'all') && (
                <AiQuizGenerator />
            )}
        </div>
    );
};
