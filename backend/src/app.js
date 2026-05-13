// src/app.js — Express application setup
//
// Configura Express con middleware, route e documentazione Swagger

const express = require('express');

// Import routes
const routesAppartamenti = require('./routes/routesAppartamenti');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware per parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (opzionale, commenta se non necessario)
// const cors = require('cors');
// app.use(cors());

// Swagger UI — Documentazione interattiva
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Trento Apartment Service API Docs',
// }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/appartamenti', routesAppartamenti);

// 404 handler per route non trovate
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trovata',
    path: req.path,
  });
});

// Import middleware

// ... rest of the code ...

// Error handler middleware (deve essere l'ultimo)
app.use(errorHandler);

module.exports = app;

module.exports = app;
