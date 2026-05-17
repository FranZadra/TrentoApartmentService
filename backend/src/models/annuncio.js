const mongoose = require('mongoose')

const AnnuncioSchema = new mongoose.Schema({
  stato: { type: String, enum: ['Creato', 'Attivo', 'Archiviato'], default: 'Creato' },
  descrizione: { type: String, required: true },
  dataPubbl: { type: Date },
  appartamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' },
  appartamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' },
  // opzionalmente, se l'annuncio è per una camera specifica:
  // cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
}, { timestamps: true })

AnnuncioSchema.path('appartamento').validate(function () {
  return Boolean(this.appartamento || this.appartamentoId)
}, 'appartamento o appartamentoId è obbligatorio')

AnnuncioSchema.pre('validate', function (next) {
  if (!this.appartamento && this.appartamentoId) {
    this.appartamento = this.appartamentoId
  }

  if (!this.appartamentoId && this.appartamento) {
    this.appartamentoId = this.appartamento
  }

  next()
})

module.exports = mongoose.model('Annuncio', AnnuncioSchema)