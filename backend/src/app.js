const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
