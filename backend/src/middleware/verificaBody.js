// Middleware per la validazione del body nelle richieste di creazione e aggiornamento di appartamenti

// Verifica del body di creazione appartamento
function verificaBodyCreazione(req, res, next) {
  const data = req.body;
  const errors = [];

  // Validazione indirizzo
  if (!data.indirizzo) {
    errors.push('indirizzo è richiesto');
  } else if (typeof data.indirizzo !== 'object') {
    errors.push('indirizzo deve essere un oggetto');
  } else {
    const { via, numero, città, CAP, Stato } = data.indirizzo;

    if (!via || typeof via !== 'string' || via.trim() === '') {
      errors.push('indirizzo.via è richiesto e deve essere una stringa non vuota');
    }

    if (numero === undefined || numero === null || Number.isNaN(Number(numero))) {
      errors.push('indirizzo.numero è richiesto e deve essere un numero');
    }

    if (!città || typeof città !== 'string' || città.trim() === '') {
      errors.push('indirizzo.città è richiesto e deve essere una stringa non vuota');
    }

    if (!CAP || typeof CAP !== 'string' || CAP.trim() === '') {
      errors.push('indirizzo.CAP è richiesto e deve essere una stringa non vuota');
    }

    if (!Stato || typeof Stato !== 'string' || Stato.trim() === '') {
      errors.push('indirizzo.Stato è richiesto e deve essere una stringa non vuota');
    }
  }

  // Validazione mqTot
  if (data.mqTot === undefined || data.mqTot === null || Number.isNaN(Number(data.mqTot))) {
    errors.push('mqTot è richiesto e deve essere un numero');
  } else if (Number(data.mqTot) < 0) {
    errors.push('mqTot deve essere un numero non negativo');
  }

  // Validazione numStanze
  if (data.numStanze === undefined || data.numStanze === null || Number.isNaN(Number(data.numStanze))) {
    errors.push('numStanze è richiesto e deve essere un numero');
  } else if (!Number.isInteger(Number(data.numStanze)) || Number(data.numStanze) < 0) {
    errors.push('numStanze deve essere un numero intero non negativo');
  }

  // Validazione numBagni
  if (data.numBagni === undefined || data.numBagni === null || Number.isNaN(Number(data.numBagni))) {
    errors.push('numBagni è richiesto e deve essere un numero');
  } else if (!Number.isInteger(Number(data.numBagni)) || Number(data.numBagni) < 0) {
    errors.push('numBagni deve essere un numero intero non negativo');
  }

  // Validazione amministratoreId
  if (data.amministratoreId !== undefined && typeof data.amministratoreId !== 'string') {
    errors.push('amministratoreId deve essere una stringa (ObjectId)');
  }

  // Validazione classeEnergetica
  if (data.classeEnergetica !== undefined) {
    const classiValide = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!classiValide.includes(data.classeEnergetica)) {
      errors.push(`classeEnergetica deve essere una di: ${classiValide.join(', ')}`);
    }
  }

  // Validazione foto
  if (data.foto !== undefined && !Array.isArray(data.foto)) {
    errors.push('foto deve essere un array di stringhe (URL)');
  }

  // Validazione perStudenti
  if (data.perStudenti !== undefined && typeof data.perStudenti !== 'boolean') {
    errors.push('perStudenti deve essere un booleano');
  }

  // Validazione terrazzo
  if (data.terrazzo !== undefined && typeof data.terrazzo !== 'boolean') {
    errors.push('terrazzo deve essere un booleano');
  }

  // Validazione lavatrice
  if (data.lavatrice !== undefined && typeof data.lavatrice !== 'boolean') {
    errors.push('lavatrice deve essere un booleano');
  }

  // Se ci sono errori, ritorna 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errori di validazione nel body',
      errors,
    });
  }

  next();
}

// Valida il body per l'aggiornamento di un appartamento.
function verificaBodyAggiornamento(req, res, next) {
  const data = req.body;
  const errors = [];

  // Se non c'è niente da aggiornare
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Nessun campo da aggiornare',
    });
  }

  // Validazione indirizzo
  if (data.indirizzo !== undefined) {
    if (typeof data.indirizzo !== 'object') {
      errors.push('indirizzo deve essere un oggetto');
    } else {
      const { via, numero, città, CAP, Stato } = data.indirizzo;

      if (via !== undefined && (typeof via !== 'string' || via.trim() === '')) {
        errors.push('indirizzo.via deve essere una stringa non vuota');
      }

      if (numero !== undefined && (Number.isNaN(Number(numero)))) {
        errors.push('indirizzo.numero deve essere un numero');
      }

      if (città !== undefined && (typeof città !== 'string' || città.trim() === '')) {
        errors.push('indirizzo.città deve essere una stringa non vuota');
      }

      if (CAP !== undefined && (typeof CAP !== 'string' || CAP.trim() === '')) {
        errors.push('indirizzo.CAP deve essere una stringa non vuota');
      }

      if (Stato !== undefined && (typeof Stato !== 'string' || Stato.trim() === '')) {
        errors.push('indirizzo.Stato deve essere una stringa non vuota');
      }
    }
  }

  // Validazione mqTot
  if (data.mqTot !== undefined) {
    if (Number.isNaN(Number(data.mqTot)) || Number(data.mqTot) < 0) {
      errors.push('mqTot deve essere un numero non negativo');
    }
  }

  // Validazione numStanze
  if (data.numStanze !== undefined) {
    if (!Number.isInteger(Number(data.numStanze)) || Number(data.numStanze) < 0) {
      errors.push('numStanze deve essere un numero intero non negativo');
    }
  }

  // Validazione numBagni
  if (data.numBagni !== undefined) {
    if (!Number.isInteger(Number(data.numBagni)) || Number(data.numBagni) < 0) {
      errors.push('numBagni deve essere un numero intero non negativo');
    }
  }

  // Validazione classeEnergetica
  if (data.classeEnergetica !== undefined) {
    const classiValide = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!classiValide.includes(data.classeEnergetica)) {
      errors.push(`classeEnergetica deve essere una di: ${classiValide.join(', ')}`);
    }
  }

  // Validazione foto
  if (data.foto !== undefined && !Array.isArray(data.foto)) {
    errors.push('foto deve essere un array di stringhe (URL)');
  }

  // Validazione perStudenti
  if (data.perStudenti !== undefined && typeof data.perStudenti !== 'boolean') {
    errors.push('perStudenti deve essere un booleano');
  }

  // Validazione terrazzo
  if (data.terrazzo !== undefined && typeof data.terrazzo !== 'boolean') {
    errors.push('terrazzo deve essere un booleano');
  }

  // Validazione lavatrice
  if (data.lavatrice !== undefined && typeof data.lavatrice !== 'boolean') {
    errors.push('lavatrice deve essere un booleano');
  }

  // Se ci sono errori, ritorna 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errori di validazione nel body',
      errors,
    });
  }

  next();
}

module.exports = {
  verificaBodyCreazione,
  verificaBodyAggiornamento,
};
