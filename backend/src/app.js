const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const investmentRoutes = require('./routes/investment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const referralRoutes = require('./routes/referral.routes');
const planRoutes = require('./routes/plan.routes');
const walletRoutes = require('./routes/wallet.routes');
const roiRoutes = require('./routes/roi.routes');

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', data: null, meta: null });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/roi', roiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
    meta: null,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
