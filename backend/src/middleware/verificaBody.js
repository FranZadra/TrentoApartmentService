// src/middleware/verificaBody.js — Validazione body per Appartamento
//
// Controlla che il body della richiesta contenga i campi richiesti
// e che rispettino i tipi attesi.

/**
 * Valida il body per la creazione di un appartamento.
 * Campi richiesti:
 *   - indirizzo (object con via, numero, città, CAP, Stato)
 *   - mqTot (number)
 *   - numStanze (number)
 *   - numBagni (number)
 *   [Opzionali: foto, perStudenti, terrazzo, lavatrice, classeEnergetica, amministratoreId]
 */
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

  // Validazione amministratoreId (opzionale nel body, ma consigliato)
  if (data.amministratoreId !== undefined && typeof data.amministratoreId !== 'string') {
    errors.push('amministratoreId deve essere una stringa (ObjectId)');
  }

  // Validazione classeEnergetica (opzionale)
  if (data.classeEnergetica !== undefined) {
    const classiValide = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!classiValide.includes(data.classeEnergetica)) {
      errors.push(`classeEnergetica deve essere una di: ${classiValide.join(', ')}`);
    }
  }

  // Validazione foto (opzionale)
  if (data.foto !== undefined && !Array.isArray(data.foto)) {
    errors.push('foto deve essere un array di stringhe (URL)');
  }

  // Validazione perStudenti (opzionale)
  if (data.perStudenti !== undefined && typeof data.perStudenti !== 'boolean') {
    errors.push('perStudenti deve essere un booleano');
  }

  // Validazione terrazzo (opzionale)
  if (data.terrazzo !== undefined && typeof data.terrazzo !== 'boolean') {
    errors.push('terrazzo deve essere un booleano');
  }

  // Validazione lavatrice (opzionale)
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

  // Se tutto è valido, passa al prossimo middleware/controller
  next();
}

/**
 * Valida il body per l'aggiornamento (PUT) di un appartamento.
 * Tutti i campi sono opzionali, ma se presenti devono essere validi.
 */
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

  // Validazione indirizzo (opzionale)
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

  // Validazione mqTot (opzionale)
  if (data.mqTot !== undefined) {
    if (Number.isNaN(Number(data.mqTot)) || Number(data.mqTot) < 0) {
      errors.push('mqTot deve essere un numero non negativo');
    }
  }

  // Validazione numStanze (opzionale)
  if (data.numStanze !== undefined) {
    if (!Number.isInteger(Number(data.numStanze)) || Number(data.numStanze) < 0) {
      errors.push('numStanze deve essere un numero intero non negativo');
    }
  }

  // Validazione numBagni (opzionale)
  if (data.numBagni !== undefined) {
    if (!Number.isInteger(Number(data.numBagni)) || Number(data.numBagni) < 0) {
      errors.push('numBagni deve essere un numero intero non negativo');
    }
  }

  // Validazione classeEnergetica (opzionale)
  if (data.classeEnergetica !== undefined) {
    const classiValide = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!classiValide.includes(data.classeEnergetica)) {
      errors.push(`classeEnergetica deve essere una di: ${classiValide.join(', ')}`);
    }
  }

  // Validazione foto (opzionale)
  if (data.foto !== undefined && !Array.isArray(data.foto)) {
    errors.push('foto deve essere un array di stringhe (URL)');
  }

  // Validazione perStudenti (opzionale)
  if (data.perStudenti !== undefined && typeof data.perStudenti !== 'boolean') {
    errors.push('perStudenti deve essere un booleano');
  }

  // Validazione terrazzo (opzionale)
  if (data.terrazzo !== undefined && typeof data.terrazzo !== 'boolean') {
    errors.push('terrazzo deve essere un booleano');
  }

  // Validazione lavatrice (opzionale)
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

  // Se tutto è valido, passa al prossimo middleware
  next();
}

module.exports = {
  verificaBodyCreazione,
  verificaBodyAggiornamento,
};
