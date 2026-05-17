const mongoose = require('mongoose')

const AnnuncioSchema = new mongoose.Schema(
  {
    stato: { type: String, enum: ['Creato', 'Attivo', 'Archiviato'], default: 'Creato' },
    descrizione: { type: String, required: true },
    dataPubbl: { type: Date },
    appartamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' },
    appartamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento' },
    // opzionalmente, se l'annuncio è per una camera specifica:
    // cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
  },
  { timestamps: true }
)

AnnuncioSchema.pre('validate', function (next) {
  if (!this.appartamento && this.appartamentoId) {
    this.appartamento = this.appartamentoId
  }
  if (!this.appartamentoId && this.appartamento) {
    this.appartamentoId = this.appartamento
  }

  if (!this.appartamento && !this.appartamentoId) {
    this.invalidate('appartamento', 'Il campo appartamento è obbligatorio')
  }

  next()
})

module.exports = mongoose.model('Annuncio', AnnuncioSchema)