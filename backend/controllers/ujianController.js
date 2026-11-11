const db = require('../config/db');
const { PDFParse } = require('pdf-parse');
const { generateQuestionsFromText } = require('../utils/aiQuizHelper');

// 1. Ambil Seluruh Daftar Ujian (dengan Filter & Jumlah Soal)
const getAllUjian = async (req, res) => {
    try {
        const { status, mapel_id, guru_id } = req.query;
        const isSiswa = req.user && req.user.role === 'siswa';
        const siswaId = isSiswa ? req.user.id : null;

        let queryText = `
            SELECT 
                u.id, 
                u.guru_id, 
                u.mapel_id, 
                u.judul_ujian, 
                u.durasi_menit, 
                u.status_acc, 
                u.catatan_waka,
                u.created_at,
                g.nama AS nama_guru,
                g.email AS email_guru,
                m.nama_mapel,
                m.kode_mapel,
                m.tingkat_kelas,
                m.jurusan,
                m.tipe_mapel,
                COUNT(DISTINCT d.id)::int AS jumlah_soal
                ${isSiswa ? `, MAX(h.skor) AS skor_siswa, MAX(h.submitted_at) AS tanggal_selesai_siswa, (COUNT(h.id) > 0) AS sudah_dikerjakan` : ''}
            FROM ujian u
            JOIN users g ON u.guru_id = g.id
            JOIN mapel m ON u.mapel_id = m.id
            LEFT JOIN detail_soal d ON u.id = d.ujian_id
            ${isSiswa ? `LEFT JOIN hasil_ujian h ON u.id = h.ujian_id AND h.siswa_id = ${siswaId}` : ''}
            WHERE 1=1
        `;
        const queryParams = [];

        if (status && status !== 'all') {
            queryParams.push(status);
            queryText += ` AND u.status_acc = $${queryParams.length}`;
        }
        if (mapel_id) {
            queryParams.push(mapel_id);
            queryText += ` AND u.mapel_id = $${queryParams.length}`;
        }
        if (guru_id) {
            queryParams.push(guru_id);
            queryText += ` AND u.guru_id = $${queryParams.length}`;
        }

        // Siswa hanya boleh melihat ujian yang sudah disetujui (approved)
        if (isSiswa) {
            queryText += ` AND u.status_acc = 'approved'`;
            if (req.user.tingkat_kelas) {
                queryParams.push(req.user.tingkat_kelas);
                queryText += ` AND (m.tingkat_kelas = $${queryParams.length} OR m.tingkat_kelas = 'semua')`;
            }
        }

        queryText += `
            GROUP BY u.id, g.nama, g.email, m.nama_mapel, m.kode_mapel, m.tingkat_kelas, m.jurusan, m.tipe_mapel
            ORDER BY u.created_at DESC
        `;

        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetAllUjian:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil daftar ujian.' });
    }
};

// 2. Ambil Detail Ujian beserta Butir-Butir Soal (PG & Isian)
const getUjianDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const headerQuery = `
            SELECT 
                u.id, u.guru_id, u.mapel_id, u.judul_ujian, u.durasi_menit, u.status_acc, u.catatan_waka, u.created_at,
                g.nama AS nama_guru, g.email AS email_guru,
                m.nama_mapel, m.kode_mapel, m.tingkat_kelas, m.jurusan, m.tipe_mapel
            FROM ujian u
            JOIN users g ON u.guru_id = g.id
            JOIN mapel m ON u.mapel_id = m.id
            WHERE u.id = $1
        `;
        const headerResult = await db.query(headerQuery, [id]);
        if (headerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Data ujian tidak ditemukan.' });
        }

        const ujian = headerResult.rows[0];

        // Cek apakah siswa sudah pernah mengerjakan ujian ini
        let sudahDikerjakan = false;
        let hasilSiswa = null;
        if (req.user && req.user.role === 'siswa') {
            const checkHasil = await db.query(
                'SELECT * FROM hasil_ujian WHERE siswa_id = $1 AND ujian_id = $2 ORDER BY submitted_at DESC LIMIT 1',
                [req.user.id, id]
            );
            if (checkHasil.rows.length > 0) {
                sudahDikerjakan = true;
                hasilSiswa = checkHasil.rows[0];
            }
        }

        // Jika siswa belum mengerjakan, sembunyikan kunci jawaban untuk mencegah kebocoran
        let soalQuery;
        if (req.user && req.user.role === 'siswa' && !sudahDikerjakan) {
            soalQuery = `
                SELECT id, ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d
                FROM detail_soal
                WHERE ujian_id = $1
                ORDER BY id ASC
            `;
        } else {
            soalQuery = `
                SELECT id, ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban
                FROM detail_soal
                WHERE ujian_id = $1
                ORDER BY id ASC
            `;
        }

        const soalResult = await db.query(soalQuery, [id]);

        ujian.soal = soalResult.rows;
        ujian.jumlah_soal = soalResult.rows.length;
        ujian.sudah_dikerjakan = sudahDikerjakan;
        ujian.hasil_siswa = hasilSiswa;

        res.json(ujian);
    } catch (err) {
        console.error('Error GetUjianDetail:', err);
        res.status(500).json({ message: 'Gagal mengambil detail soal ujian.' });
    }
};

// 3. Konfirmasi Persetujuan (ACC / Reject) Draft Soal Ujian oleh Waka Kurikulum
const verifyUjianAcc = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_acc, catatan_waka } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status_acc)) {
            return res.status(400).json({ message: 'Status ACC harus "approved", "rejected", atau "pending".' });
        }

        const queryText = `
            UPDATE ujian
            SET status_acc = $1, catatan_waka = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await db.query(queryText, [status_acc, catatan_waka || null, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data ujian tidak ditemukan.' });
        }

        res.json({
            message: `Status ujian berhasil diubah menjadi ${status_acc.toUpperCase()}!`,
            ujian: result.rows[0]
        });
    } catch (err) {
        console.error('Error VerifyUjianAcc:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui status ACC ujian.' });
    }
};

// 4. Tambah Paket Soal Ujian Baru (Guru / Waka)
const createUjian = async (req, res) => {
    try {
        const guru_id = req.user.role === 'guru' ? req.user.id : (req.body.guru_id || req.user.id);
        const { mapel_id, judul_ujian, durasi_menit, soal = [] } = req.body;

        if (!mapel_id || !judul_ujian || !durasi_menit) {
            return res.status(400).json({ message: 'Mapel, Judul Ujian, dan Durasi Waktu Wajib Diisi!' });
        }

        const ujianResult = await db.query(`
            INSERT INTO ujian (guru_id, mapel_id, judul_ujian, durasi_menit, status_acc)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *;
        `, [guru_id, mapel_id, judul_ujian, durasi_menit]);

        const newUjian = ujianResult.rows[0];

        if (Array.isArray(soal) && soal.length > 0) {
            for (const s of soal) {
                await db.query(`
                    INSERT INTO detail_soal (ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    newUjian.id,
                    s.pertanyaan,
                    s.tipe_soal || 'pg',
                    s.pilihan_a || null,
                    s.pilihan_b || null,
                    s.pilihan_c || null,
                    s.pilihan_d || null,
                    s.kunci_jawaban || 'A'
                ]);
            }
        }

        res.status(201).json({
            message: 'Paket ujian berhasil dibuat dan diajukan ke Waka Kurikulum!',
            ujian: newUjian
        });
    } catch (err) {
        console.error('Error CreateUjian:', err);
        res.status(500).json({ message: 'Gagal membuat draft ujian: ' + err.message });
    }
};

// 5. Hapus Paket Soal Ujian
const deleteUjian = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM ujian WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data ujian tidak ditemukan.' });
        }
        res.json({ message: 'Paket ujian berhasil dihapus.' });
    } catch (err) {
        console.error('Error DeleteUjian:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus ujian.' });
    }
};

// 6. AI Auto-Generate Quiz dari PDF Dokumen Acuan (Guru / Waka)
const generateAiQuiz = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Berkas dokumen PDF acuan kuis wajib diunggah!' });
        }

        let fullText = '';
        try {
            const parser = new PDFParse({ data: req.file.buffer });
            await parser.load();
            const parsedData = await parser.getText();
            await parser.destroy();
            fullText = (parsedData && parsedData.text) ? parsedData.text : '';
        } catch (pdfErr) {
            console.error('PDF Parse Error:', pdfErr);
            return res.status(400).json({
                message: 'Gagal membaca isi dokumen PDF. Pastikan file valid dan tidak dikunci dengan sandi.'
            });
        }

        if (!fullText || fullText.trim().length < 15) {
            return res.status(400).json({
                message: 'Teks pada dokumen PDF tidak mencukupi untuk diolah oleh AI. Pastikan dokumen berisi teks, bukan sekadar gambar scan.'
            });
        }

        const questionCount = parseInt(req.body.jumlah_soal || '5', 10);
        const questions = generateQuestionsFromText(fullText, questionCount);

        const docName = req.file.originalname.replace(/\.pdf$/i, '');
        const suggestedTitle = `Kuis Evaluasi: ${docName}`;

        res.json({
            message: 'Draft kuis berhasil dibuat secara otomatis oleh AI!',
            document_name: req.file.originalname,
            total_characters: fullText.length,
            suggested_title: suggestedTitle,
            questions: questions
        });
    } catch (err) {
        console.error('Error GenerateAiQuiz:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat generasi kuis AI: ' + err.message });
    }
};

// 7. Submit Jawaban Ujian Siswa (Auto-Grading & Pencatatan ke hasil_ujian)
const submitJawabanUjian = async (req, res) => {
    try {
        const { id } = req.params;
        const siswaId = req.user.id;
        const { jawaban = {} } = req.body; // Map: { [soalId]: 'A'|'B'|'C'|'D' }

        const ujianCheck = await db.query('SELECT * FROM ujian WHERE id = $1', [id]);
        if (ujianCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Ujian tidak ditemukan.' });
        }

        const ujian = ujianCheck.rows[0];
        if (ujian.status_acc !== 'approved') {
            return res.status(400).json({ message: 'Ujian ini belum disetujui untuk dikerjakan.' });
        }

        // Ambil butir soal beserta kunci jawabannya
        const soalResult = await db.query('SELECT id, kunci_jawaban FROM detail_soal WHERE ujian_id = $1 ORDER BY id ASC', [id]);
        const soalList = soalResult.rows;

        if (soalList.length === 0) {
            return res.status(400).json({ message: 'Ujian ini tidak memiliki butir soal.' });
        }

        let benar = 0;
        soalList.forEach((s) => {
            const studentAns = (jawaban[s.id] || '').trim().toUpperCase();
            const correctAns = (s.kunci_jawaban || '').trim().toUpperCase();
            if (studentAns && studentAns === correctAns) {
                benar++;
            }
        });

        const totalSoal = soalList.length;
        const skor = Number(((benar / totalSoal) * 100).toFixed(2));

        // Tentukan semester
        let semester = 1;
        try {
            const userRes = await db.query('SELECT tingkat_kelas FROM users WHERE id = $1', [siswaId]);
            const kelas = userRes.rows[0]?.tingkat_kelas || '10';
            const settingsRes = await db.query('SELECT semester_aktif FROM pengaturan_sekolah LIMIT 1');
            const isGanjil = settingsRes.rows[0]?.semester_aktif !== 'Genap';

            if (kelas === '10') semester = isGanjil ? 1 : 2;
            else if (kelas === '11') semester = isGanjil ? 3 : 4;
            else if (kelas === '12') semester = isGanjil ? 5 : 6;
        } catch (e) {
            semester = 1;
        }

        // Masukkan rekaman baru ke tabel hasil_ujian
        const insertQuery = `
            INSERT INTO hasil_ujian (siswa_id, ujian_id, skor, semester)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const hasilResult = await db.query(insertQuery, [siswaId, id, skor, semester]);

        res.json({
            message: 'Jawaban ujian berhasil dikumpulkan dan dinilai secara otomatis!',
            hasil: hasilResult.rows[0],
            skor: skor,
            total_soal: totalSoal,
            benar: benar,
            salah: totalSoal - benar
        });
    } catch (err) {
        console.error('Error SubmitJawabanUjian:', err);
        res.status(500).json({ message: 'Gagal mengumpulkan jawaban ujian: ' + err.message });
    }
};

// 8. Rekap Nilai Semester & Riwayat Ujian Siswa
const getMyNilaiSemester = async (req, res) => {
    try {
        const siswaId = req.user.id;

        const riwayatQuery = `
            SELECT 
                h.id,
                h.ujian_id,
                h.skor,
                h.semester,
                h.submitted_at,
                COALESCE(u.judul_ujian, 'Ujian Evaluasi Mandiri') AS judul_ujian,
                COALESCE(m.nama_mapel, 'Akademik Umum') AS nama_mapel,
                COALESCE(m.kode_mapel, 'UMUM') AS kode_mapel
            FROM hasil_ujian h
            LEFT JOIN ujian u ON h.ujian_id = u.id
            LEFT JOIN mapel m ON u.mapel_id = m.id
            WHERE h.siswa_id = $1
            ORDER BY h.submitted_at DESC;
        `;
        const riwayatResult = await db.query(riwayatQuery, [siswaId]);

        // Hitung rata-rata tiap semester 1 - 6
        const semesterData = [1, 2, 3, 4, 5, 6].map((sem) => {
            const scoresInSem = riwayatResult.rows
                .filter(r => r.semester === sem)
                .map(r => parseFloat(r.skor));

            let avgScore = null;
            if (scoresInSem.length > 0) {
                const sum = scoresInSem.reduce((acc, curr) => acc + curr, 0);
                avgScore = Number((sum / scoresInSem.length).toFixed(1));
            }

            return {
                semester: `Sem ${sem}`,
                nilai: avgScore,
                kkm: 75
            };
        });

        const chartData = semesterData.filter(d => d.nilai !== null);
        const finalChartData = chartData.length > 0 ? chartData : [
            { semester: 'Sem 1', nilai: 75.0, kkm: 75 }
        ];

        const allScores = riwayatResult.rows.map(r => parseFloat(r.skor));
        const lastScore = allScores.length > 0 ? allScores[0] : 0;
        const cumulativeAverage = allScores.length > 0
            ? Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2))
            : 0;

        res.json({
            chart_data: finalChartData,
            semester_summary: semesterData,
            riwayat_ujian: riwayatResult.rows,
            rata_rata_terakhir: lastScore,
            rata_rata_kumulatif: cumulativeAverage,
            total_ujian_selesai: riwayatResult.rows.length
        });
    } catch (err) {
        console.error('Error GetMyNilaiSemester:', err);
        res.status(500).json({ message: 'Gagal mengambil data nilai semester: ' + err.message });
    }
};

module.exports = {
    getAllUjian,
    getUjianDetail,
    verifyUjianAcc,
    createUjian,
    deleteUjian,
    generateAiQuiz,
    submitJawabanUjian,
    getMyNilaiSemester
};
