# Frontend - Sistema di Ricerca con Filtri

## Componenti Creati

### 1. **FilterModal.vue** 
Modale bottom-sheet per la selezione dei filtri.

**Features:**
- Sezione "Appartamento": numStanze, numBagni, terrazzo, classeEnergetica, mqMin/Max
- Sezione "Camere": tipoCam, prezzoMin/Max
- Pulsanti "Resetta" e "Applica filtri"
- Transizioni smooth (fade + slide-up)
- Teleport a `<body>` per evitare problemi di z-index

**Props:**
- `isOpen` (boolean): Controlla l'apertura/chiusura
- `filtriAttuali` (object): Filtri attuali per popolare i campi

**Events:**
- `@close`: Chiude la modale
- `@apply`: Emette i filtri selezionati

---

### 2. **FilterTags.vue**
Componente per visualizzare i filtri attivi come tag removibili.

**Features:**
- Mostra ogni filtro con una label leggibile e la "X" per rimuoverlo
- Pulsante "Cancella tutto" per resetare tutti i filtri
- Formattazione intelligente dei valori (es. SINGOLA → Singola)

**Props:**
- `filtri` (object): I filtri da visualizzare

**Events:**
- `@remove-filter`: Emette la chiave del filtro da rimuovere
- `@clear-all`: Emette quando si clicca "Cancella tutto"

---

### 3. **AnnunciPage.vue (Aggiornato)**
Pagina principale della ricerca con integrazione completa dei filtri.

**Nuove Features:**
- Pulsante "Filtri" con icona di filtro
- Visualizzazione dei tag dei filtri attivi
- Logica reattiva: aggiunta/rimozione filtri → ricerca automatica
- Sceglie automaticamente l'endpoint corretto (con/senza filtri)

**Nuove Funzioni:**
- `apriModaleFiltri()`: Apre la modale
- `chiudiModaleFiltri()`: Chiude la modale
- `applicaFiltri(nuoviFiltri)`: Applica i filtri e ricerca
- `rimuoviFiltro(chiaveFiltro)`: Rimuove un singolo filtro
- `cancellaFiltri()`: Resetta tutti i filtri

---

## Aggiornamenti al Servizio

### **annunciService.js**
Aggiunto metodo `searchWithFilters()`:

```javascript
searchWithFilters(params = {}) {
  return api.get('/annunci/search/filter', { params })
}
```

Uso:
```javascript
// Esempio: cercare camere doppie tra 300 e 500 €
const risultati = await annunciService.searchWithFilters({
  tipoCam: 'DOPPIA',
  prezzoMin: 300,
  prezzoMax: 500
})
```

---

## Flusso Utente

1. **Utente clicca "Filtri"** → Apre la modale `FilterModal`
2. **Seleziona i filtri** → Campi reattivi
3. **Clicca "Applica filtri"** → 
   - Modale chiude
   - Filtri salvati in `filtriAttivi`
   - `caricaAnnunci()` chiama il backend con i parametri
   - Tag dei filtri appaiono sotto il pulsante
4. **Risultati aggiornati** → Grid si popola con i nuovi annunci
5. **Clicca "X" su un tag** → Filtro rimosso, ricerca aggiornata
6. **Clicca "Cancella tutto"** → Tutti i filtri cancellati, lista di default

---

## UX Details

- **Senza filtri**: Mostra messaggio "Nessun annuncio attivo al momento"
- **Con filtri**: Mostra messaggio "Nessun annuncio trovato. Prova a modificare i filtri"
- **Loading**: Spinner durante il caricamento dei risultati
- **Errore**: Messaggio di errore con pulsante "Riprova"
- **Mappa**: Si aggiorna dinamicamente con gli annunci filtrati

---

## Styling Notes

- **Tema**: TAS red (#9a1528) per pulsanti e tag
- **Modale**: Bottom-sheet responsive, scrollabile
- **Tag**: Background red con testo bianco, icona X per rimuovere
- **Tailwind**: Classe `chip` usata in AnnuncioCard per tag piccoli

---

## Testing Checklist

- [ ] Aprire modale filtri
- [ ] Selezionare filtri e applicare → risultati filtrati
- [ ] Rimuovere singolo filtro con "X" → aggiornamento automatico
- [ ] Cliccare "Cancella tutto" → ritorno alla lista completa
- [ ] Provare combinazioni di filtri
- [ ] Verificare caricamento e gestione errori
