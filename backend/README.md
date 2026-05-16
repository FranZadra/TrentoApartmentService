# TAS — Backend

Backend REST API del progetto **Trento Apartment Service**, sviluppato con Node.js, Express e MongoDB Atlas.

---

## Tecnologie utilizzate

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| Node.js | >= 18 | Runtime JavaScript |
| Express | ^5.2.1 | Framework HTTP |
| Mongoose | ^9.6.2 | ODM per MongoDB |
| bcrypt | ^6.0.0 | Hash delle password |
| jsonwebtoken | ^9.x | Creazione token JWT |
| dotenv | ^17.4.2 | Gestione variabili d'ambiente |

---

## Setup e avvio

### 1. Installa le dipendenze

```bash
cd backend
npm install
```

### 2. Configura le variabili d'ambiente

Copia il file template e inserisci i tuoi dati reali:

```bash
cp .env.example .env
```

Apri `.env` e sostituisci i valori:

```
MONGODB_URI=mongodb+srv://<utente>:<password>@<cluster>.mongodb.net/tas
PORT=3000
JWT_SECRET=<chiave_lunga_e_sicura>
JWT_EXPIRES_IN=7d
```

> Il file `.env` non va mai committato — è già incluso nel `.gitignore`.

### 3. Avvia il server

```bash
npm start
```

Output atteso:

```
Connesso a MongoDB Atlas
Server in ascolto sulla porta 3000
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

### POST /api/v1/users/register

Registra un nuovo utente nel sistema.

**URL:** `http://localhost:3000/api/v1/users/register`

**Headers:**
```
Content-Type: application/json
```

**Body richiesta:**
```json
{
  "nome": "Mario",
  "email": "mario.rossi@example.com",
  "password": "Password123",
  "ruolo": "inquilino"
}
```

| Campo | Tipo | Obbligatorio | Valori accettati |
|-------|------|--------------|-----------------|
| `nome` | string | Si | qualsiasi stringa non vuota |
| `email` | string | Si | formato valido, es. `nome@dominio.com` |
| `password` | string | Si | qualsiasi stringa non vuota |
| `ruolo` | string | No | `inquilino` oppure `proprietario` (default: `inquilino`) |

---

## Codici di stato HTTP e risposte

### 201 — Utente creato con successo

```json
{
  "messaggio": "Utente registrato con successo",
  "token": "<jwt>",
  "utente": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "nome": "Mario",
    "email": "mario.rossi@example.com",
    "ruolo": "inquilino"
  }
}
```

> La password non è mai inclusa nella risposta, nemmeno nella forma hashata.

---

### 400 — Campo obbligatorio mancante

Restituito quando `nome`, `email` o `password` sono assenti o vuoti.

```json
{
  "messaggio": "campo obbligatorio mancante"
}
```

---

### 400 — Email non valida

Restituito quando il formato dell'email non è corretto (es. `user/gmail.com`).

```json
{
  "messaggio": "email non valida"
}
```

---

### 409 — Email già in uso

Restituito quando esiste già un account con la stessa email.

```json
{
  "messaggio": "email già in uso"
}
```

---

## Test manuali con curl

```bash
# Test OK — registrazione valida
curl -s -X POST http://localhost:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"nome":"Mario","email":"mario.rossi@example.com","password":"Password123"}' | python3 -m json.tool

# Test — email malformata
curl -s -X POST http://localhost:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"nome":"Glen","email":"glenmyers/gmail.com","password":"Password123"}' | python3 -m json.tool

# Test — email già registrata
curl -s -X POST http://localhost:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"nome":"Mario","email":"mario.rossi@example.com","password":"AltroPass"}' | python3 -m json.tool

# Test — nome vuoto
curl -s -X POST http://localhost:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"nome":"","email":"test@example.com","password":"Password123"}' | python3 -m json.tool

# Test — password vuota
curl -s -X POST http://localhost:3000/api/v1/users/register -H "Content-Type: application/json" -d '{"nome":"Mario","email":"test2@example.com","password":""}' | python3 -m json.tool
```
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
