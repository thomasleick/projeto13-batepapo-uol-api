require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')
const { removeInactiveParticipants } = require('./controllers/inactiveParticipantsController')


const app = express()

// Connect to MongoDB
connectDB()

app.use(express.json());

// ROTAS
app.use('/participants', require('./routes/participants'))
app.use('/messages', require('./routes/messages'))
app.use('/status', require('./routes/status'))


// Start
const PORT = 5000;
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  // Set up the interval to run the function every 15 seconds
  setInterval(removeInactiveParticipants, 15000);
})