# API Ricerca Annunci con Filtri

## Nuovo Endpoint

### GET `/api/v1/annunci/search/filter`

Ricerca annunci filtrando per proprietà dell'appartamento e camere.

#### Query Parameters

**Filtri Appartamento:**
- `numStanze` (number): Numero esatto di stanze
- `numBagni` (number): Numero esatto di bagni
- `terrazzo` (boolean): Se l'appartamento ha terrazzo (`true`/`false`)
- `classeEnergetica` (string): Classe energetica (A4, A3, A2, A1, B, C, D, E, F, G)
- `mqMin` (number): Metri quadri minimi
- `mqMax` (number): Metri quadri massimi

**Filtri Camere:**
- `prezzoMin` (number): Prezzo minimo della camera
- `prezzoMax` (number): Prezzo massimo della camera
- `tipoCam` (string): Tipo di camera (SINGOLA o DOPPIA)

#### Esempi di Utilizzo

**1. Appartamento con 3 stanze e 2 bagni:**
```
GET /api/v1/annunci/search/filter?numStanze=3&numBagni=2
```

**2. Appartamento con terrazzo, classe energetica B:**
```
GET /api/v1/annunci/search/filter?terrazzo=true&classeEnergetica=B
```

**3. Appartamento tra 70 e 100 mq:**
```
GET /api/v1/annunci/search/filter?mqMin=70&mqMax=100
```

**4. Camere singole con prezzo tra 300 e 400 €:**
```
GET /api/v1/annunci/search/filter?tipoCam=SINGOLA&prezzoMin=300&prezzoMax=400
```

**5. Combinazione: 3+ stanze, terrazzo, camere doppie sotto 600 €:**
```
GET /api/v1/annunci/search/filter?numStanze=3&terrazzo=true&tipoCam=DOPPIA&prezzoMax=600
```

#### Response

**Successo (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "annuncio_1",
      "stato": "Attivo",
      "descrizione": "Appartamento in centro...",
      "dataPubbl": "2026-03-01",
      "appartamento": {
        "_id": "apt_1",
        "indirizzo": { "via": "Via Roma 1", "numero": 10, "città": "Trento", "CAP": "38100", "Stato": "IT" },
        "mqTot": 90,
        "numStanze": 3,
        "numBagni": 2,
        "terrazzo": true,
        "classeEnergetica": "B",
        "camere": [
          { "prezzo": 350, "tipo": "SINGOLA", "mq": 14, "numFinestre": 2, "disponibile": true },
          { "prezzo": 500, "tipo": "DOPPIA", "mq": 20, "numFinestre": 1, "disponibile": true }
        ]
      }
    }
  ]
}
```

---

## Modifiche al Modello Dati

### 1. Nuovo file: `Camera.js`
Schema per le camere come sotto-documenti annidati in Appartamento.

### 2. Modifiche a `Appartamento.js`
- **Aggiunto** campo `mqTot` (meters quadri totali) - obbligatorio
- **Modificato** campo `camere`: da array di reference a array di sotto-documenti usando `CameraSchema`
- Le camere sono ora annidate direttamente nel documento dell'appartamento

### 3. Nuova funzione in `annunciController.js`
- `searchAnnunciWithFilters()`: Esegue query MongoDB con `$elemMatch` per filtrare camere che soddisfano i criteri

### 4. Nuova rotta in `annunciRoutes.js`
- `GET /search/filter`: Collega l'endpoint alla funzione di ricerca
- **Importante**: Posizionata PRIMA di `/:id` per evitare conflitti di routing

---

## Note Tecniche

- **$elemMatch**: Utilizzato per garantire che almeno una camera soddisfi TUTTI i criteri (prezzo, tipo) insieme
- **Query builder dinamico**: I filtri sono applicati solo se forniti nel query string
- **Stato filtrato**: Sempre limitato ad annunci con `stato: 'Attivo'`
- **Ordinamento**: Per data di pubblicazione decrescente (più recenti prima)

---

## Migration

Se avete documenti MongoDB esistenti con camere come reference, dovrete eseguire una migrazione per convertirle a sotto-documenti annidati.
