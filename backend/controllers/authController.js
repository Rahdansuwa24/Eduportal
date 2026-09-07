const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan Password wajib diisi" })
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }
        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ message: 'Akun Anda nonaktif. Silakan hubungi Admin Sekolah.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, nama: user.nama, email: user.email, role: user.role, tingkat_kelas: user.tingkat_kelas, jurusan: user.jurusan },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                tingkat_kelas: user.tingkat_kelas,
                jurusan: user.jurusan
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Terjadi kesalahan server" })
    }
}

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT id, nama, email, role, tingkat_kelas, jurusan, is_active FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(444).json({ message: 'User tidak ditemukan.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error GetMe:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

module.exports = { login, getMe };