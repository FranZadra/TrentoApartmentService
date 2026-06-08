// Service per la costruzione di link click-to-chat di WhatsApp.

const WA_BASE_URL = 'https://wa.me';

function normalizzaNumero(telefono) {
  if (!telefono) return '';
  return String(telefono).replace(/\D/g, '');
}

// Costruisce il link click-to-chat. Ritorna null se il numero non è valido,
function costruisciLinkWhatsApp(telefono, messaggio = '') {
  const numero = normalizzaNumero(telefono);
  if (!numero) return null;

  const url = `${WA_BASE_URL}/${numero}`;
  return messaggio ? `${url}?text=${encodeURIComponent(messaggio)}` : url;
}

module.exports = { costruisciLinkWhatsApp, normalizzaNumero };
