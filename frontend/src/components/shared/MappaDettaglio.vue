<template>
  <!-- Mappa che mostra la posizione di un singolo appartamento (TC32) -->
  <div ref="mapContainer" class="h-64 w-full rounded-2xl overflow-hidden z-0"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Vite + Leaflet per le icone dei marker (stesso fix di MappaAnnunci)
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
  // Coordinate geografiche dell'appartamento
  latitudine: { type: Number, required: true },
  longitudine: { type: Number, required: true },
  // Etichetta mostrata nel popup del marker
  etichetta: { type: String, default: 'Appartamento' },
})

const mapContainer = ref(null)
let mapInstance = null

onMounted(() => {
  mapInstance = L.map(mapContainer.value, {
    center: [props.latitudine, props.longitudine],
    zoom: 15,
    zoomControl: false, // zoom nascosto per la mappa piccola del dettaglio
    dragging: false,    // mappa fissa, non trascinabile (comportamento mappa statica)
    scrollWheelZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapInstance)

  // Marker con popup che mostra l'indirizzo
  L.marker([props.latitudine, props.longitudine])
    .addTo(mapInstance)
    .bindPopup(props.etichetta)
    .openPopup()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>
