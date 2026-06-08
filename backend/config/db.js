// Connessione al database MongoDB tramite Mongoose.
const mongoose = require('mongoose');

const connectDB = async () => {
 if (!process.env.MONGODB_URI) {
   console.warn('MONGODB_URI non impostato — salto la connessione al DB (dev mode)');
   return Promise.resolve();
 }


 try {
   const conn = await mongoose.connect(process.env.MONGODB_URI);
   console.log(`MongoDB connesso: ${conn.connection.host}`);
 } catch (error) {
   console.error('Errore connessione MongoDB:', error.message);
   process.exit(1); // Termina l'app se il DB non è raggiungibile
 }
};


module.exports = connectDB;