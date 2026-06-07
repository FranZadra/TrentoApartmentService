// Service per il geocoding degli indirizzi tramite Nominatim (OpenStreetMap).
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const USER_AGENT = 'TrentoApartmentService/1.0 (progetto universitario UniTN)';

// Compone la stringa di ricerca a partire dal sotto-documento indirizzo.
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

// Converte un indirizzo in { latitudine, longitudine }
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
    console.error('Geocoding fallito per:', query, '-', error.message);
    return null;
  }
}

module.exports = { geocodificaIndirizzo };
