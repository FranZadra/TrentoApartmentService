// seed_us19.js — Dati di test per US19 (gestione appartamenti admin)
// Uso: node seed_us19.js
// Crea 2 appartamenti con un amministratoreId valido e stampa il token JWT da usare nel browser.

require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Appartamento = require('./src/models/Appartamento')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connesso al DB')

  // Genera un ObjectId valido da usare come amministratoreId
  const adminId = new mongoose.Types.ObjectId()

  // Rimuove solo gli appartamenti di test precedenti (se esistono)
  await Appartamento.deleteMany({ 'indirizzo.via': /^TEST_US19/ })

  // Crea 2 appartamenti associati a quell'amministratore
  await Appartamento.insertMany([
    {
      indirizzo: { via: 'TEST_US19 Via Roma', numero: 1, città: 'Trento', CAP: '38122', Stato: 'Italia' },
      mqTot: 80,
      numStanze: 3,
      numBagni: 1,
      terrazzo: true,
      lavatrice: true,
      classeEnergetica: 'B',
      perStudenti: false,
      foto: [],
      amministratoreId: adminId,
      posizione: { latitudine: 46.0693, longitudine: 11.1211 },
    },
    {
      indirizzo: { via: 'TEST_US19 Via Manci', numero: 5, città: 'Trento', CAP: '38122', Stato: 'Italia' },
      mqTot: 60,
      numStanze: 2,
      numBagni: 1,
      terrazzo: false,
      lavatrice: false,
      classeEnergetica: 'C',
      perStudenti: true,
      foto: [],
      amministratoreId: adminId,
      posizione: { latitudine: 46.0720, longitudine: 11.1228 },
    },
  ])

  // Genera il token JWT con l'ID dell'admin
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  const token = jwt.sign({ id: adminId.toString() }, secret, { expiresIn: '24h' })

  console.log('\n✅ Seed completato. Incolla questo nella console del browser:\n')
  console.log(`localStorage.setItem('token', '${token}')`)
  console.log('\nPoi vai su http://localhost:5173/admin/appartamenti\n')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
