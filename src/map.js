// Map management with Leaflet, open hydrographic layers, and custom markers
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { WATER_BODY_TYPES, CONTAMINANT_TYPES, SEVERITY_LEVELS } from './store.js';
import { sound } from './audio.js';

export class HydroMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.onMarkerClick = options.onMarkerClick || (() => {});
    this.onLocationPicked = options.onLocationPicked || (() => {});

    this.map = null;
    this.baseLayers = {};
    this.currentBaseLayer = null;
    this.markerLayerGroup = null;
    this.heatLayer = null;
    this.pickerMarker = null;
    this.isPickerMode = false;
    this.heatmapActive = false;

    this.init();
  }

  init() {
    // Center initially on Mexico/Latin America's rich water networks (lat: 20.6, lng: -100.5, zoom: 6)
    this.map = L.map(this.containerId, {
      center: [20.6, -100.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: true
    });

    // Custom repositioned Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Free Open Basemaps emphasizing hydrography
    this.baseLayers = {
      topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      }),
      voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    };

    // Default to Carto Voyager (very clean high-contrast water bodies)
    this.currentBaseLayer = this.baseLayers.voyager;
    this.currentBaseLayer.addTo(this.map);

    // Marker Layer Group
    this.markerLayerGroup = L.layerGroup().addTo(this.map);

    // Map click handler for picking location
    this.map.on('click', (e) => {
      if (this.isPickerMode) {
        this.setPickerLocation(e.latlng.lat, e.latlng.lng);
        sound.playWaterDrop();
      }
    });

    // Add scale indicator in metric units
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(this.map);
  }

  // Switch basemap layer
  setBaseLayer(layerKey) {
    if (this.baseLayers[layerKey] && this.currentBaseLayer !== this.baseLayers[layerKey]) {
      this.map.removeLayer(this.currentBaseLayer);
      this.currentBaseLayer = this.baseLayers[layerKey];
      this.currentBaseLayer.addTo(this.map);
    }
  }

  // Render report markers on map
  renderReports(reports, activeFilter = 'all') {
    this.markerLayerGroup.clearLayers();

    const filtered = reports.filter(r => {
      if (activeFilter === 'all') return true;
      if (r.waterType === activeFilter) return true;
      if (r.severity === activeFilter) return true;
      return true;
    });

    // Update Heatmap if active
    if (this.heatmapActive) {
      this.updateHeatmap(filtered);
    }

    filtered.forEach(report => {
      const marker = this.createCustomMarker(report);
      marker.addTo(this.markerLayerGroup);
    });
  }

  // Create custom animated SVG ripple marker
  createCustomMarker(report) {
    const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.moderado;
    const waterType = WATER_BODY_TYPES[report.waterType] || WATER_BODY_TYPES.rio;
    const contaminant = CONTAMINANT_TYPES[report.contaminant] || CONTAMINANT_TYPES.aguas_negras;

    const isCritical = report.severity === 'critico' || report.severity === 'alto';
    const rippleClass = isCritical ? 'hydro-ripple critical' : 'hydro-ripple';

    const customHtml = `
      <div class="hydro-marker-wrapper" data-id="${report.id}">
        <div class="${rippleClass}" style="--ripple-color: ${sev.color}"></div>
        <div class="hydro-marker-pin" style="background: ${sev.color}; box-shadow: 0 0 16px ${sev.glow};">
          <span class="hydro-marker-icon">${waterType.icon}</span>
        </div>
        <div class="hydro-marker-badge">${contaminant.icon}</div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: customHtml,
      className: 'custom-hydro-divicon',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24]
    });

    const marker = L.marker(report.coords, { icon: customIcon });

    // Build rich popup content
    const authorText = report.isAnonymous
      ? `<span class="anon-pill">🛡️ Anónimo</span>`
      : `<span class="author-pill">👤 ${report.authorName || 'Ciudadano'}</span>`;

    const imageHtml = report.images && report.images.length > 0
      ? `<div class="popup-thumb-wrap"><img src="${report.images[0]}" alt="${report.title}" class="popup-thumb"/></div>`
      : '';

    const popupContent = `
      <div class="hydro-popup-card">
        ${imageHtml}
        <div class="popup-header">
          <span class="popup-tag" style="background: ${waterType.color}22; color: ${waterType.color}; border: 1px solid ${waterType.color}44;">
            ${waterType.icon} ${waterType.label}
          </span>
          <span class="popup-sev-badge" style="background: ${sev.color}; color: #fff;">
            ${sev.label}
          </span>
        </div>
        <h4 class="popup-title">${report.title}</h4>
        <p class="popup-waterbody">📍 ${report.waterBody || 'Cuerpo Hídrico'}</p>
        <p class="popup-desc">${(report.description || '').slice(0, 110)}...</p>
        <div class="popup-footer">
          ${authorText}
          <span class="confirm-count">👍 ${report.confirmations || 1} validaciones</span>
        </div>
        <button class="popup-view-btn" data-report-id="${report.id}">
          Ver Evidencia Completa &rarr;
        </button>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 320,
      className: 'kupuri-leaflet-popup'
    });

    marker.on('click', () => {
      sound.playWaterDrop();
    });

    return marker;
  }

  // Toggle Heatmap of pollution intensity
  toggleHeatmap(reports) {
    this.heatmapActive = !this.heatmapActive;
    if (this.heatmapActive) {
      this.updateHeatmap(reports);
    } else {
      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
        this.heatLayer = null;
      }
    }
    return this.heatmapActive;
  }

  updateHeatmap(reports) {
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    // Heat points with intensity weight: critico = 1.0, alto = 0.8, moderado = 0.5, leve = 0.3
    const heatPoints = reports.map(r => {
      let intensity = 0.5;
      if (r.severity === 'critico') intensity = 1.0;
      else if (r.severity === 'alto') intensity = 0.8;
      else if (r.severity === 'moderado') intensity = 0.5;
      else if (r.severity === 'leve') intensity = 0.3;

      return [r.coords[0], r.coords[1], intensity];
    });

    this.heatLayer = L.heatLayer(heatPoints, {
      radius: 40,
      blur: 28,
      maxZoom: 16,
      gradient: {
        0.2: '#06b6d4',
        0.4: '#10b981',
        0.6: '#eab308',
        0.8: '#f97316',
        1.0: '#ef4444'
      }
    }).addTo(this.map);
  }

  // Picker Mode for dropping pin
  startPickerMode(initialCoords = null) {
    this.isPickerMode = true;
    this.map.getContainer().classList.add('map-picker-active');

    const coords = initialCoords || [this.map.getCenter().lat, this.map.getCenter().lng];
    this.setPickerLocation(coords[0], coords[1]);
  }

  setPickerLocation(lat, lng) {
    if (!this.pickerMarker) {
      const pickerIcon = L.divIcon({
        html: `
          <div class="picker-pin-wrapper">
            <div class="picker-radar"></div>
            <div class="picker-pin">📍</div>
          </div>
        `,
        className: 'picker-divicon',
        iconSize: [40, 40],
        iconAnchor: [20, 38]
      });

      this.pickerMarker = L.marker([lat, lng], {
        icon: pickerIcon,
        draggable: true
      }).addTo(this.map);

      this.pickerMarker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        this.onLocationPicked(newPos.lat, newPos.lng);
      });
    } else {
      this.pickerMarker.setLatLng([lat, lng]);
    }

    this.onLocationPicked(lat, lng);
  }

  stopPickerMode() {
    this.isPickerMode = false;
    this.map.getContainer().classList.remove('map-picker-active');
    if (this.pickerMarker) {
      this.map.removeLayer(this.pickerMarker);
      this.pickerMarker = null;
    }
  }

  // Pan smoothly to specific coordinates
  flyTo(lat, lng, zoom = 14) {
    sound.playWaterDrop();
    this.map.flyTo([lat, lng], zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }

  // Geolocation
  locateUser() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('La geolocalización no está disponible en este dispositivo.'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.flyTo(lat, lng, 14);

          // Add temporary pulse circle
          const userCircle = L.circleMarker([lat, lng], {
            radius: 12,
            fillColor: '#00f2fe',
            fillOpacity: 0.9,
            color: '#ffffff',
            weight: 3
          }).addTo(this.map);

          setTimeout(() => {
            this.map.removeLayer(userCircle);
          }, 6000);

          resolve({ lat, lng });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // Fit bounds to show all markers
  fitAllReports(reports) {
    if (!reports || reports.length === 0) return;
    const bounds = L.latLngBounds(reports.map(r => r.coords));
    this.map.fitBounds(bounds, { padding: [60, 60] });
  }
}
