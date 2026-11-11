import React from 'react';
import { PresensiHarian } from './PresensiHarian';
import { FormPerizinanSiswa } from './FormPerizinanSiswa';
import { MateriUjianOnline } from './MateriUjianOnline';
import { GrafikNilaiSemester } from './GrafikNilaiSemester';

export const SiswaDashboard = ({ activeTab }) => {
    return (
        <div className="space-y-6">
            {/* Tab 1: Presensi Harian Per Mapel */}
            {(activeTab === 'presensi' || activeTab === 'all') && (
                <PresensiHarian />
            )}

            {/* Tab 2: Form Perizinan & Surat Izin */}
            {(activeTab === 'perizinan-siswa' || activeTab === 'all') && (
                <FormPerizinanSiswa />
            )}

            {/* Tab 3: Materi Pembelajaran & Ujian Online CBT */}
            {(activeTab === 'ujian' || activeTab === 'all') && (
                <MateriUjianOnline />
            )}

            {/* Tab 4: Rekap & Grafik Nilai Semester */}
            {(activeTab === 'nilai' || activeTab === 'all') && (
                <GrafikNilaiSemester />
            )}
        </div>
    );
};
