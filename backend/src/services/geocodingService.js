// src/services/geocodingService.js — Conversione indirizzo → coordinate (geocoding)
//
// Usiamo Nominatim, il geocoder gratuito di OpenStreetMap: è coerente con le tile
// OSM già usate dalla mappa Leaflet del frontend e non richiede API key.
// La conversione è centralizzata qui così ogni appartamento (creato o modificato)
// ottiene le coordinate allo stesso modo, senza duplicare la logica nei controller.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Nominatim richiede un User-Agent identificativo nella sua policy d'uso.
const USER_AGENT = 'TrentoApartmentService/1.0 (progetto universitario UniTN)';

// Compone la stringa di ricerca a partire dal sotto-documento indirizzo.
// L'ordine "via numero, CAP città, Stato" è quello che Nominatim interpreta meglio.
function componiQuery(indirizzo) {
  if (!indirizzo) return '';
  const { via, numero, CAP, città, Stato } = indirizzo;
  return [
    [via, numero].filter(Boolean).join(' '),
    [CAP, città].filter(Boolean).join(' '),
    Stato,
  ]
    .filter(Boolean)
    .join(', ');
}

// Converte un indirizzo in { latitudine, longitudine }.
// Ritorna null se l'indirizzo non è geocodificabile o se il servizio non risponde:
// in quel caso l'appartamento viene comunque salvato, semplicemente senza marker.
async function geocodificaIndirizzo(indirizzo) {
  const query = componiQuery(indirizzo);
  if (!query) return null;

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) return null;

    const risultati = await response.json();
    if (!Array.isArray(risultati) || risultati.length === 0) return null;

    const { lat, lon } = risultati[0];
    return {
      latitudine: parseFloat(lat),
      longitudine: parseFloat(lon),
    };
  } catch (error) {
    // Non blocchiamo il salvataggio se il geocoding fallisce (rete, rate limit, ecc.)
    console.error('Geocoding fallito per:', query, '-', error.message);
    return null;
  }
}

module.exports = { geocodificaIndirizzo };
