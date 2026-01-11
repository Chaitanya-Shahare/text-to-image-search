const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const uploadRouter = require('./routes/upload');
const searchRouter = require('./routes/search');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/search', searchRouter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Database
const sequelize = require('./config/database');
const Image = require('./models/Image'); // Import to ensure model registration

// Start server
if (require.main === module) {
    sequelize.sync().then(() => {
        console.log('Database synced.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Failed to sync database:', err);
    });
}

module.exports = app;
