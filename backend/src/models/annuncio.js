const AnnuncioSchema = new mongoose.Schema({
  stato:        { type: String, enum: ['Creato', 'Attivo', 'Archiviato'], default: 'Creato' },
  descrizione:  { type: String, required: true },
  dataPubbl:    { type: Date },
  appartamentoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appartamento', required: true },
  // opzionalmente, se l'annuncio è per una camera specifica:
  // cameraId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
}, { timestamps: true });