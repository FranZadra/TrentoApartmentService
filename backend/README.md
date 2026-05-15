# Backend – Documentazione API

Documentazione delle API REST del backend. Scritta per chi sviluppa il **frontend**.

---

## Setup rapido

```bash
# 1. Installa le dipendenze
npm install

# 2. Crea il file di configurazione
cp .env.example .env
# poi apri .env e inserisci la tua MONGODB_URI

# 3. Avvia il server in modalità sviluppo (si riavvia da solo ad ogni modifica)
npm run dev
```

---

## Struttura del progetto

```
src/
├── config/db.js              → Connessione al database
├── models/Annuncio.js        → Schema Annuncio (stato, descrizione, dataPubbl)
├── models/Appartamento.js    → Schema Appartamento (dati + coordinate GPS)
├── routes/annunci.routes.js  → Definizione degli endpoint
├── controllers/annunci.controller.js → Logica delle API
├── middleware/errorHandler.js → Gestione errori centralizzata
└── app.js                    → Setup Express
```

---

## API disponibili

### `GET /api/v1/annunci`
Ritorna tutti gli annunci **attivi**, ciascuno con i dati completi dell'appartamento collegato.
Usato per popolare sia la **lista** che la **mappa interattiva**.

**Autenticazione richiesta:** No (accessibile anche agli utenti anonimi)

**Risposta di successo (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "stato": "Attivo",
      "descrizione": "Luminosa camera singola in centro, incluse utenze",
      "dataPubbl": "2024-05-15T10:30:00.000Z",
      "appartamento": {
        "_id": "664f1a2b3c4d5e6f7a8b9c0e",
        "indirizzo": {
          "via": "Via Roma",
          "numero": 12,
          "città": "Milano",
          "CAP": "20121",
          "Stato": "Italia"
        },
        "posizione": {
          "latitudine": 45.4654219,
          "longitudine": 9.1859243
        },
        "studentOnly": false,
        "numStanze": 3,
        "numBagni": 1,
        "terrazzo": true,
        "lavatrice": true,
        "classeEnergetica": "B",
        "foto": ["https://..."],
        "camere": ["664f1a2b3c4d5e6f7a8b9c0f"]
      },
      "createdAt": "2024-05-15T10:30:00.000Z"
    }
  ]
}
```

> **Nota per la mappa:** i campi `posizione.latitudine` e `posizione.longitudine`
> sono le coordinate da usare per posizionare i marker sulla mappa interattiva.
>
> **Nota su `stato`:** i valori possibili sono `Creato`, `Attivo`, `Archiviato` (enum `AdvStatus` dall'UML). Questa API ritorna solo quelli con stato `Attivo`.

---

### `GET /api/v1/annunci/:id`
Ritorna il dettaglio di un singolo annuncio. Utile quando l'utente clicca
su una card della lista o su un marker della mappa.

**Parametri URL:**
- `id` — l'`_id` dell'annuncio (ottenuto dalla lista)

**Risposta di successo (200):**
```json
{
  "success": true,
  "data": { /* stesso oggetto annuncio di prima */ }
}
```

**Risposta se non trovato (404):**
```json
{
  "success": false,
  "message": "Annuncio non trovato"
}
```

---

### `GET /health`
Verifica che il server sia attivo.

```json
{ "status": "ok", "message": "Server funzionante" }
```

---

## Formato delle risposte

Tutte le risposte seguono questo schema standard:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `success` | boolean | `true` se la richiesta è andata a buon fine |
| `data` | object/array | I dati richiesti (presente solo in caso di successo) |
| `count` | number | Numero di elementi (solo per le liste) |
| `message` | string | Messaggio di errore (solo in caso di fallimento) |

---

## Codici di stato HTTP usati

| Codice | Significato |
|--------|-------------|
| `200` | OK — richiesta riuscita |
| `400` | Bad Request — parametri non validi |
| `404` | Not Found — risorsa non trovata |
| `500` | Internal Server Error — errore del server |
