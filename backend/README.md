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
backend/
├── .env.example              # Template variabili d'ambiente (committare)
├── .env                      # Variabili reali (NON committare)
├── package.json
├── server.js                 # Entry point: avvia Express e connette MongoDB
└── src/
    ├── models/
    │   └── User.js           # Schema Mongoose della collezione "users"
    ├── controllers/
    │   └── authController.js # Logica di registrazione (validazione, bcrypt, salvataggio)
    └── routes/
        └── userRoutes.js     # Routing: collega gli URL ai controller
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
