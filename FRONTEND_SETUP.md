# Frontend Setup - Trento Apartment Service

## Cos'è stato creato

Ho sviluppato un frontend completo in **Vue 3** con:

### 📁 Struttura dei file

```
frontend/
├── src/
│   ├── pages/
│   │   └── Register.vue           ✅ Form registrazione completo
│   ├── components/
│   ├── stores/
│   │   └── auth.js                ✅ Pinia store per autenticazione
│   ├── services/
│   │   └── api.js                 ✅ Client API con Axios
│   ├── router/
│   │   └── index.js               ✅ Vue Router
│   ├── App.vue                    ✅ Root component
│   └── main.js                    ✅ Entry point
├── index.html                     ✅ Template HTML
├── vite.config.js                 ✅ Configurazione Vite
├── package.json                   ✅ Dipendenze
├── .env.example                   ✅ Template ambiente
└── README.md                      ✅ Documentazione
```

## Funzionalità implementate

### 🔐 Pagina Registrazione (`/register`)

**Form con i seguenti campi:**
- ✅ Nome (obbligatorio)
- ✅ Cognome (obbligatorio)
- ✅ Email (obbligatorio, validazione formato)
- ✅ Password (obbligatorio, min 8 caratteri)
- ✅ Conferma Password (obbligatorio, match controllo)

**Funzionalità:**
- ✅ Validazione client-side real-time
- ✅ Toggle mostra/nascondi password con icona 👁️
- ✅ Messaggio di errore per validazione
- ✅ Gestione errori da API
- ✅ Loading state durante registrazione
- ✅ Salvataggio token JWT in localStorage
- ✅ Design moderno con gradiente viola
- ✅ Responsive su mobile

### 🔗 Integrazione API

**Service API (`src/services/api.js`):**
- ✅ Axios client con baseURL configurabile
- ✅ Interceptor per aggiungere token JWT automaticamente
- ✅ Gestione errori 401 (redirect login se token scaduto)
- ✅ Metodi: `register(data)`, `login(email, password)`, `logout()`

### 📦 State Management

**Pinia Store (`src/stores/auth.js`):**
- ✅ State: user, token, isLoading, error
- ✅ Computed: isAuthenticated
- ✅ Actions: register, login, logout
- ✅ Persistent storage in localStorage

### 🎨 Design

**UI Components:**
- ✅ Form moderno con input stili custom
- ✅ Button con loading spinner
- ✅ Alert per errori con animazione
- ✅ Decorazioni grafiche
- ✅ CSS Variables per colori (tema)
- ✅ Hover/focus states
- ✅ Responsive design (mobile-first)

**Colori tema:**
- Primary: `#2563eb` (blu)
- Secondary: `#1e40af` (blu scuro)
- Error: `#ef4444` (rosso)
- Gray: scala completa da 50 a 900

## Come avviare

### 1️⃣ Installa le dipendenze

```bash
cd frontend
npm install
```

### 2️⃣ Copia le variabili d'ambiente

```bash
cp .env.example .env.local
```

### 3️⃣ Avvia il server di sviluppo

```bash
npm run dev
# oppure dalla root:
npm run dev:frontend
```

Il frontend sarà disponibile su: **http://localhost:3000**

### 4️⃣ Assicurati che il backend sia in esecuzione

In un altro terminale:

```bash
npm run dev
# In http://localhost:5000
```

## Flusso di Registrazione

```
1. Utente compila il form
   ⬇️
2. Click "Registrati" → validazione client-side
   ⬇️
3. Se valido → POST /api/auth/register con dati
   ⬇️
4. Backend valida e crea utente in DB
   ⬇️
5. Ritorna token JWT
   ⬇️
6. Frontend salva token in localStorage
   ⬇️
7. Reindirizza a /dashboard
```

## Prossimi step

Per completare il frontend, dovrai:

1. **Creare Login page** (`/login`)
   - Form email + password
   - Riutilizzare store auth

2. **Creare Dashboard** (`/dashboard`)
   - Pagina ricerca appartamenti
   - Lista appartamenti

3. **Creare ApartmentList** (`/apartments`)
   - Filtra per prezzo, stanze, città
   - Paginazione

4. **Creare ApartmentDetail** (`/apartments/:id`)
   - Visualizza dettagli appartamento
   - Contatta proprietario

5. **Creare MyListings** (`/my-listings`)
   - Modifica/pubblica annunci
   - Gestisci i tuoi appartamenti

6. **Navigazione**
   - Header con menu
   - User profile dropdown
   - Logout

## Variabili d'ambiente

Crea un file `.env.local` (copia da `.env.example`):

```javascript
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Trento Apartment Service
```

## Tecnologie

- **Vue 3** — framework UI reattivo
- **Vite** — build tool blazing-fast
- **Vue Router** — routing e SPA
- **Pinia** — state management
- **Axios** — HTTP client

## Note importanti

⚠️ **Il backend deve essere in esecuzione** su `http://localhost:5000` affinché il frontend possa comunicare.

⚠️ **Il token JWT** viene salvato in `localStorage['auth_token']` — attento quando lo leggi/scrivi da altri componenti.

⚠️ **CORS** — Assicurati che il backend permettal CORS dal frontend (da configurare in `backend/src/app.js`).

## Accesso Swagger UI (per testare API)

Mentre il backend è in esecuzione:

```
http://localhost:5000/api-docs
```

## Comandi utili

```bash
# Sviluppo frontend
npm run dev:frontend

# Build per produzione
npm run build:frontend

# Pulisci node_modules
rm -rf node_modules && npm install

# Genera docs OpenAPI
npm run swagger-gen
```

## Debugging

Se il frontend non si connette al backend:

1. Verificare che il backend sia in esecuzione (`http://localhost:5000/health`)
2. Controllare la console del browser (F12 → Console)
3. Verificare che `VITE_API_BASE_URL` sia corretto in `.env.local`
4. Controllare che CORS sia abilitato nel backend

Buon sviluppo! 🚀
