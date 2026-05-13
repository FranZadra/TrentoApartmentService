// src/config/swaggerJsDoc.js — Configurazione Swagger JSDoc
//
// Configura swagger-jsdoc per leggere i commenti JSDoc dalle route
// e generare automaticamente la documentazione OpenAPI 3.0.3

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Trento Apartment Service APIs',
      version: '1.0.0',
      description: 'APIs per la gestione di appartamenti, annunci, contratti e utenti',
      contact: {
        name: 'Development Team',
        email: 'dev@trentoapartments.local',
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Autenticazione tramite token JWT. Usa il formato "Bearer <token>"',
        },
      },
      schemas: {
        // Reusable schema per indirizzo
        Indirizzo: {
          type: 'object',
          properties: {
            via: {
              type: 'string',
              example: 'Via Roma',
            },
            numero: {
              type: 'number',
              example: 42,
            },
            città: {
              type: 'string',
              example: 'Trento',
            },
            CAP: {
              type: 'string',
              example: '38100',
            },
            Stato: {
              type: 'string',
              example: 'Italia',
            },
          },
          required: ['via', 'numero', 'città', 'CAP', 'Stato'],
        },
        // Reusable schema per appartamento
        Appartamento: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            indirizzo: {
              $ref: '#/components/schemas/Indirizzo',
            },
            mqTot: {
              type: 'number',
              example: 95.5,
            },
            perStudenti: {
              type: 'boolean',
              example: false,
            },
            numStanze: {
              type: 'number',
              example: 3,
            },
            numBagni: {
              type: 'number',
              example: 2,
            },
            foto: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['https://example.com/foto1.jpg', 'https://example.com/foto2.jpg'],
            },
            terrazzo: {
              type: 'boolean',
              example: true,
            },
            lavatrice: {
              type: 'boolean',
              example: true,
            },
            classeEnergetica: {
              type: 'string',
              enum: ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'],
              example: 'B',
            },
            amministratoreId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Schema per risposta di successo
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operazione completata con successo',
            },
            data: {
              type: 'object',
            },
          },
        },
        // Schema per risposta di errore
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Errore durante l\'operazione',
            },
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  // Scansiona questi file per i commenti JSDoc
  apis: [
    './backend/src/routes/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
