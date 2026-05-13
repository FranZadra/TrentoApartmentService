// src/server.js — Server entry point
//
// Avvia il server Express con connessione a MongoDB

const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// TODO: Implementare connessione MongoDB
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trento-apartments')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📖 API Documentation at http://${HOST}:${PORT}/api-docs\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
