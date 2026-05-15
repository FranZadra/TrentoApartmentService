# Trento Apartment Service (TAS)
Repository GitHub per il progetto di Ingegneria del Software

## Breve descrizione del progetto 
Il progetto Trento Apartment Service (TAS) nasce dalla necessità di risolvere la frammentazione informativa e operativa che caratterizza il mercato delle locazioni nella città di Trento.
La soluzione proposta è un ecosistema digitale centralizzato che funge da unico punto di contatto per tutti gli attori coinvolti. 
La piattaforma digitalizza l'intero ciclo di vita della locazione: dalla ricerca dell'immobile fino alla gestione interna dell'appartamento e alla comunicazione con l'amministratore.

## Informazioni utili
### Documentazione API
Link documentazione delle API (Apiary): https://app.apiary.io/trentoapartmentservice

### Strategia di branching
- **Main branch**: ramo principale del repository che rimane inalterato fino al momento della release di una versione valida e funzionante;
- **Dev branch**: ramo di sviluppo principale su cui andranno a convergere i branch delle varie feature;
- **Releases branches**: rami temporanei che si distaccano dal branch di dev nel momento in cui il lavoro effettuato compone una versione che soddisfa la definizione di "done";
- **Features branches**: rami di sviluppo delle singole feature su cui lavorano direttamente i membri del team.

### Struttura del repository
TRENTOAPART.../
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── server.js
├── frontend/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── App.vue
│   │   └── main.js
│   ├── .env.example
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── apiary.apib
└── README.md

- **backend/**: contiene il server Node.js con tutta la logica applicativa lato server.
- **frontend/**: contiene l'applicazione client Vue.js sviluppata con Vite + Tailwind CSS.
- **apiary.apib** – file Blueprint per la documentazione delle API su Apiary

## Autori
Mikele Golemi
Leonardo Tartini
Francesco Zadra
