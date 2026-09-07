require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// Import All API Routers
var authRouter = require('./routes/authRoutes');
var userRouter = require('./routes/userRoutes');
var mapelRouter = require('./routes/mapelRoutes');
var kurikulumRouter = require('./routes/kurikulumRoutes');
var presensiRouter = require('./routes/presensiRoutes');
var perizinanRouter = require('./routes/perizinanRoutes');

var app = express();

// Enable CORS for Frontend (Vite on port 8000 / 3000)
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve Static Files (Public Assets & Uploaded Files)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/mapel', mapelRouter);
app.use('/api/kurikulum', kurikulumRouter);
app.use('/api/presensi', presensiRouter);
app.use('/api/perizinan', perizinanRouter);

// Root Health Check Route
app.get('/', function(req, res) {
  res.json({ message: '⚡ EduPortal Pro API Server v2.1 Ready!' });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
