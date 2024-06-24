const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const listingsRoutes = require('./routes/listings');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', listingsRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
