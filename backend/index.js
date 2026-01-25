require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
// const bodyMetricRoutes = require('./routes/bodyMetricRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', bodyMetricRoutes);
app.use('/api/workouts', workoutRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
