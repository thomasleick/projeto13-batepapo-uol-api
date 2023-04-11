require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')


const app = express()

// Connect to MongoDB
connectDB()

app.use(express.json());

// ROTAS


// Start
const PORT = 5000;
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})