<template>
  <!-- Contenitore della mappa Leaflet — l'ID univoco serve a Leaflet per agganciare il div -->
  <div ref="mapContainer" class="h-[480px] w-full rounded-2xl overflow-hidden z-0"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix noto per Vite + Leaflet: le icone dei marker vengono perse dal bundler
// perché Leaflet usa __dirname internamente, cosa non supportata in ES modules
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  // Array di annunci con appartamento.posizione.latitudine/longitudine
  annunci: {
    type: Array,
    required: true,
  },
})

// Evento emesso quando l'utente clicca su un marker: passa l'ID dell'annuncio
const emit = defineEmits(['marker-click'])

const mapContainer = ref(null) // riferimento al div DOM della mappa
let mapInstance = null          // istanza Leaflet (tenuta fuori dal reattivo Vue)

// Crea un marker personalizzato col colore TAS per segnalare gli annunci
function creaIconaMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#9a1528;
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  })
}

// Aggiunge un marker sulla mappa per ogni annuncio che ha coordinate valide
function aggiungiMarker() {
  if (!mapInstance) return

  props.annunci.forEach((annuncio) => {
    const pos = annuncio.appartamento?.posizione
    if (!pos?.latitudine || !pos?.longitudine) return // salta se mancano le coordinate

    const indirizzo = annuncio.appartamento?.indirizzo
    const label = indirizzo ? `${indirizzo.via} ${indirizzo.numero}, ${indirizzo.città}` : 'Annuncio'

    // Popup HTML mostrato al click sul marker
    const popupHtml = `
      <div style="font-family:'Open Sans',sans-serif;min-width:160px;">
        <strong style="font-size:0.85rem;">${label}</strong>
        <p style="font-size:0.75rem;color:#555;margin:4px 0 8px;">${annuncio.descrizione?.substring(0, 80)}…</p>
        <a href="/annunci/${annuncio._id}"
           style="background:#9a1528;color:white;padding:4px 10px;border-radius:999px;font-size:0.75rem;text-decoration:none;">
          Vedi dettaglio →
        </a>
      </div>
    `

    L.marker([pos.latitudine, pos.longitudine], { icon: creaIconaMarker() })
      .addTo(mapInstance)
      .bindPopup(popupHtml)
      .on('click', () => emit('marker-click', annuncio._id))
  })
}

onMounted(() => {
  // Centro di default su Trento se non ci sono annunci con coordinate
  const centroCitta = [46.0748, 11.1217]

  mapInstance = L.map(mapContainer.value, {
    center: centroCitta,
    zoom: 13,
    zoomControl: true,
  })

  // Tile layer OpenStreetMap (gratuito, nessuna API key)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapInstance)

  aggiungiMarker()
})

// Se la lista degli annunci cambia (es. dopo il fetch), riaggiungi i marker
watch(
  () => props.annunci,
  () => {
    if (!mapInstance) return
    // Rimuovi tutti i layer tranne il tile layer, poi aggiungi di nuovo i marker
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapInstance.removeLayer(layer)
    })
    aggiungiMarker()
  },
  { deep: true }
)

onUnmounted(() => {
  // Pulizia: rimuovi la mappa per evitare memory leak
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>
