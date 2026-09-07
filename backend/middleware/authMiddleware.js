const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'eduportal_secret_key_2026';

// 1. Middleware Memeriksa Token Login JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil token setelah 'Bearer '

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Menyimpan data user (id, nama, role) ke req.user
        next(); // Lolos, lanjut ke controller
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa!' });
    }
};

// 2. Middleware Memeriksa Hak Akses Role (Authorization)
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Akses ditolak! Fitur ini khusus role: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
