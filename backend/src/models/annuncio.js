// Model per gli annunci

const mongoose = require('mongoose')

// Schema del modello annuncio
const AnnuncioSchema = new mongoose.Schema({
 stato: { type: String, enum: ['Creato', 'Attivo', 'Archiviato'], default: 'Creato' },
 descrizione: { type: String, required: true },
 dataPubbl: { type: Date },
 appartamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' },
 appartamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' }
}, { timestamps: true,
   collection: 'Annunci' })


// Controllo presenza di almeno un collegamento con l'appartamento per considerare valido il documento.
AnnuncioSchema.path('appartamento').validate(function () {
 return Boolean(this.appartamento || this.appartamentoId)
}, 'appartamento o appartamentoId è obbligatorio')

AnnuncioSchema.pre('validate', function () {
 if (!this.appartamento && this.appartamentoId) {
   this.appartamento = this.appartamentoId
 }

 if (!this.appartamentoId && this.appartamento) {
   this.appartamentoId = this.appartamento
 }
})

module.exports = mongoose.model('Annuncio', AnnuncioSchema)