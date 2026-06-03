// src/services/whatsappService.js — Costruzione del link di contatto WhatsApp
//
// Usiamo la "Click to Chat" API di WhatsApp (https://wa.me/<numero>?text=<messaggio>):
// è gratuita, non richiede API key né account business e apre semplicemente una
// chat già pronta verso il numero indicato. Centralizziamo qui la normalizzazione
// del numero e la composizione del link, così la logica non si sparpaglia tra
// controller e frontend.

const WA_BASE_URL = 'https://wa.me';

// wa.me accetta il numero con il solo prefisso internazionale e nient'altro:
// rimuoviamo +, spazi, trattini e ogni altro carattere non numerico.
function normalizzaNumero(telefono) {
  if (!telefono) return '';
  return String(telefono).replace(/\D/g, '');
}

// Costruisce il link click-to-chat. Ritorna null se il numero non è valido,
// così il chiamante può decidere di non mostrare il pulsante.
function costruisciLinkWhatsApp(telefono, messaggio = '') {
  const numero = normalizzaNumero(telefono);
  if (!numero) return null;

  const url = `${WA_BASE_URL}/${numero}`;
  return messaggio ? `${url}?text=${encodeURIComponent(messaggio)}` : url;
}

module.exports = { costruisciLinkWhatsApp, normalizzaNumero };
