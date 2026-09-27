// Kupuri HidroAlerta - Main Application Controller
import { store, WATER_BODY_TYPES, CONTAMINANT_TYPES, SEVERITY_LEVELS } from './store.js';
import { HydroMap } from './map.js';
import { cameraManager } from './camera.js';
import { sound } from './audio.js';
import { renderStatisticsHTML } from './stats.js';
import confetti from 'canvas-confetti';

// State
let hydroMap = null;
let currentTab = 'reports'; // 'reports', 'stats', 'guide'
let currentFilter = 'all';
let searchQuery = '';
let pendingReportCoords = null;
let currentCapturedPhoto = null;
let activeModalReportId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  bindUIEvents();
  renderApp();
});

function initMap() {
  hydroMap = new HydroMap('map', {
    onMarkerClick: (report) => {
      openReportDetailModal(report.id);
    },
    onLocationPicked: (lat, lng) => {
      pendingReportCoords = [lat, lng];
      updatePickerBannerUI(lat, lng);
    }
  });

  // Subscribe to store updates
  store.subscribe(() => {
    renderApp();
  });
}

function bindUIEvents() {
  // Brand click -> fit all markers
  document.getElementById('brand-btn')?.addEventListener('click', () => {
    hydroMap.fitAllReports(store.getAll());
    sound.playWaterDrop();
  });

  // New Report Header Action Button
  document.getElementById('btn-new-report-nav')?.addEventListener('click', () => {
    openNewReportModal();
  });

  // Drawer Toggle Button
  const drawer = document.getElementById('drawer-panel');
  const drawerToggleBtn = document.getElementById('drawer-toggle-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  drawerCloseBtn?.addEventListener('click', () => {
    drawer.classList.add('collapsed');
    drawerToggleBtn.style.display = 'flex';
  });

  drawerToggleBtn?.addEventListener('click', () => {
    drawer.classList.remove('collapsed');
    drawerToggleBtn.style.display = 'none';
  });

  // Drawer Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      currentTab = target.dataset.tab;
      sound.playWaterDrop();
      renderDrawerContent();
    });
  });

  // Filter Chips in Drawer
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      currentFilter = target.dataset.filter;
      sound.playWaterDrop();
      renderApp();
    });
  });

  // Search Input in Navbar
  const searchInput = document.getElementById('nav-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderReportsList();
  });

  // Map Floating Control: Layers Menu Toggle
  const layersBtn = document.getElementById('btn-layer-switcher');
  const layersMenu = document.getElementById('layers-menu');
  layersBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    layersMenu.classList.toggle('show');
    sound.playWaterDrop();
  });

  document.addEventListener('click', () => {
    layersMenu?.classList.remove('show');
  });

  // Basemap Option Buttons
  document.querySelectorAll('.layer-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const layerKey = e.currentTarget.dataset.layer;
      document.querySelectorAll('.layer-opt-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      hydroMap.setBaseLayer(layerKey);
      showToast(`Capa de mapa cambiada: ${e.currentTarget.textContent.trim()}`);
      sound.playWaterDrop();
    });
  });

  // Heatmap Toggle Button
  const heatmapBtn = document.getElementById('btn-toggle-heatmap');
  heatmapBtn?.addEventListener('click', () => {
    const isActive = hydroMap.toggleHeatmap(store.getAll());
    heatmapBtn.classList.toggle('active', isActive);
    showToast(isActive ? '🔥 Mapa de calor activado' : 'Mapa de calor desactivado');
    sound.playWaterDrop();
  });

  // Geolocation Button
  document.getElementById('btn-locate-user')?.addEventListener('click', async () => {
    showToast('Buscando tu ubicación GPS...');
    try {
      const pos = await hydroMap.locateUser();
      showToast('📍 Ubicación encontrada');
    } catch (err) {
      showToast('⚠️ No se pudo obtener la ubicación GPS');
    }
  });

  // Fit all markers
  document.getElementById('btn-fit-bounds')?.addEventListener('click', () => {
    hydroMap.fitAllReports(store.getAll());
    sound.playWaterDrop();
  });

  // Export GeoJSON / CSV
  document.getElementById('btn-export-geojson')?.addEventListener('click', () => {
    store.exportGeoJSON();
    showToast('🗺️ Archivo GeoJSON exportado');
    sound.playWaterDrop();
  });

  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    store.exportCSV();
    showToast('📊 Denuncias exportadas en CSV');
    sound.playWaterDrop();
  });

  // Modal: New Report Events
  setupNewReportModal();

  // Modal: Camera Events
  setupCameraModal();

  // Modal: Detail View Events
  setupDetailModal();

  // Delegate event for Popup "Ver Ficha Completa" button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.popup-view-btn');
    if (btn) {
      const id = btn.dataset.reportId;
      openReportDetailModal(id);
    }
  });
}

function renderApp() {
  const allReports = store.getAll();
  hydroMap.renderReports(allReports, currentFilter);
  renderDrawerContent();
}

function renderDrawerContent() {
  const container = document.getElementById('drawer-body-content');
  if (!container) return;

  if (currentTab === 'reports') {
    container.innerHTML = `
      <div class="quick-filters">
        <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
        <button class="filter-chip ${currentFilter === 'rio' ? 'active' : ''}" data-filter="rio">🌊 Ríos</button>
        <button class="filter-chip ${currentFilter === 'humedal' ? 'active' : ''}" data-filter="humedal">🌿 Humedales</button>
        <button class="filter-chip ${currentFilter === 'lago' ? 'active' : ''}" data-filter="lago">⛵ Lagos</button>
        <button class="filter-chip ${currentFilter === 'cenote' ? 'active' : ''}" data-filter="cenote">💧 Cenotes</button>
        <button class="filter-chip ${currentFilter === 'critico' ? 'active' : ''}" data-filter="critico">🚨 Críticos</button>
      </div>
      <div id="reports-list-cards"></div>
    `;

    // Re-bind filter chips inside drawer
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.dataset.filter;
        sound.playWaterDrop();
        renderApp();
      });
    });

    renderReportsList();
  } else if (currentTab === 'stats') {
    container.innerHTML = renderStatisticsHTML(store.getAll());
  } else if (currentTab === 'guide') {
    renderCitizenGuide(container);
  }
}

function renderReportsList() {
  const listContainer = document.getElementById('reports-list-cards');
  if (!listContainer) return;

  let reports = store.getAll();

  // Filter by category
  if (currentFilter !== 'all') {
    reports = reports.filter(r => r.waterType === currentFilter || r.severity === currentFilter);
  }

  // Filter by search query
  if (searchQuery) {
    reports = reports.filter(r =>
      r.title.toLowerCase().includes(searchQuery) ||
      (r.waterBody && r.waterBody.toLowerCase().includes(searchQuery)) ||
      (r.description && r.description.toLowerCase().includes(searchQuery)) ||
      (r.authorName && r.authorName.toLowerCase().includes(searchQuery))
    );
  }

  if (reports.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <p style="font-size: 2.2rem; margin-bottom: 8px;">💧</p>
        <p style="font-size: 0.95rem; font-weight: 600; color: #fff;">No se encontraron reportes</p>
        <p style="font-size: 0.8rem; margin-top: 4px;">Intenta cambiar los filtros o sé el primero en reportar este cuerpo de agua.</p>
        <button class="btn-primary-action" style="margin: 16px auto 0;" id="btn-empty-new-report">
          + Crear Reporte Hídrico
        </button>
      </div>
    `;
    document.getElementById('btn-empty-new-report')?.addEventListener('click', openNewReportModal);
    return;
  }

  listContainer.innerHTML = reports.map(r => {
    const sev = SEVERITY_LEVELS[r.severity] || SEVERITY_LEVELS.moderado;
    const water = WATER_BODY_TYPES[r.waterType] || WATER_BODY_TYPES.rio;
    const contaminant = CONTAMINANT_TYPES[r.contaminant] || CONTAMINANT_TYPES.aguas_negras;
    const thumb = r.images && r.images.length > 0 ? r.images[0] : '/samples/river_pollution.jpg';

    const authorHtml = r.isAnonymous
      ? `<span class="anon-tag">🛡️ Anónimo</span>`
      : `<span class="author-tag" title="${r.authorName}">👤 ${r.authorName || 'Ciudadano'}</span>`;

    return `
      <div class="report-card" data-id="${r.id}">
        <div class="report-card-img-wrap">
          <img src="${thumb}" alt="${r.title}" class="report-card-img" loading="lazy" />
          <div class="report-card-badges">
            <span class="pill-water">${water.icon} ${water.label}</span>
            <span class="pill-sev" style="background: ${sev.color};">${sev.label}</span>
          </div>
        </div>
        <div class="report-card-body">
          <h3 class="report-card-title">${r.title}</h3>
          <div class="report-card-location">📍 ${r.waterBody || 'Cuerpo Hídrico'}</div>
          <p class="report-card-desc">${r.description || ''}</p>
          <div class="report-card-footer">
            ${authorHtml}
            <div class="card-meta-right">
              <span>${contaminant.icon}</span>
              <span>👍 ${r.confirmations || 1}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Click card to open modal & center on map
  listContainer.querySelectorAll('.report-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const rep = store.getById(id);
      if (rep) {
        hydroMap.flyTo(rep.coords[0], rep.coords[1], 15);
        openReportDetailModal(id);
      }
    });
  });
}

function renderCitizenGuide(container) {
  container.innerHTML = `
    <div class="guide-container">
      <div class="guide-card">
        <h4>🛡️ ¿Por qué reportar de forma anónima o pública?</h4>
        <p>En Kupuri protegemos a las personas defensoras del agua. Si temes represalias de empresas contaminantes o autoridades coludidas, elige <strong>"Reporte Anónimo"</strong>. Tus datos jamás serán compartidos ni almacenados.</p>
        <p>Si representas a una ONG ambiental, colectivo vecinal o brigada, reportar públicamente fortalece el respaldo institucional de la denuncia.</p>
      </div>

      <div class="guide-card">
        <h4>⚠️ Seguridad al tomar fotos de contaminación</h4>
        <ul>
          <li><strong>No toques</strong> el agua ni residuos con apariencia química o aceitosa.</li>
          <li>Mantén distancia prudente de barrancas, taludes inestables y tuberías con vapores.</li>
          <li>Toma fotos panorámicas del cuerpo hídrico y fotos de detalle de la descarga o basura.</li>
          <li>Si hay personas agresivas en el lugar, prioriza tu seguridad y toma la foto a distancia.</li>
        </ul>
      </div>

      <div class="guide-card">
        <h4>📋 Elementos clave para un reporte sólido</h4>
        <ul>
          <li><strong>Color del agua:</strong> ¿Turbia, rojiza, negra, lechosa o verde por algas?</li>
          <li><strong>Olor:</strong> Descompuesto, azufre, cloro, gasolina, solvente.</li>
          <li><strong>Presencia de fauna:</strong> ¿Hay peces flotando, aves ausentes o espuma acumulada?</li>
          <li><strong>Origen aparente:</strong> Tubería municipal, parque industrial, basurero a cielo abierto.</li>
        </ul>
      </div>

      <div class="guide-card">
        <h4>⚖️ Marco Jurídico y Denuncia Formal</h4>
        <p>Este mapa libre sirve de evidencia pública verificable. Puedes descargar la ficha de denuncia técnica en PDF y presentarla ante:</p>
        <ul>
          <li><strong>CONAGUA</strong> (Comisión Nacional del Agua) - Denuncias de aguas nacionales.</li>
          <li><strong>PROFEPA</strong> - Inspección de descargas industriales y zonas federales marítimo-terrestres.</li>
          <li>Organismos de cuenca y comisiones de derechos humanos locales (Derecho humano al agua y saneamiento).</li>
        </ul>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// New Report Modal & Form Handling
// -------------------------------------------------------------
function setupNewReportModal() {
  const modal = document.getElementById('modal-new-report');
  const closeBtn = document.getElementById('btn-close-new-report');
  const cancelBtn = document.getElementById('btn-cancel-new-report');
  const form = document.getElementById('form-new-report');

  closeBtn?.addEventListener('click', closeNewReportModal);
  cancelBtn?.addEventListener('click', closeNewReportModal);

  // Radio cards selection for Water Body
  document.querySelectorAll('#water-type-grid .radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#water-type-grid .radio-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const input = card.querySelector('input');
      if (input) input.checked = true;
      sound.playWaterDrop();
    });
  });

  // Radio cards selection for Contaminant
  document.querySelectorAll('#contaminant-grid .radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#contaminant-grid .radio-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const input = card.querySelector('input');
      if (input) input.checked = true;
      sound.playWaterDrop();
    });
  });

  // Severity buttons
  document.querySelectorAll('.sev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('input-severity').value = btn.dataset.severity;
      sound.playWaterDrop();
    });
  });

  // Privacy Options (Anonymous vs Public)
  const optAnon = document.getElementById('privacy-opt-anon');
  const optPublic = document.getElementById('privacy-opt-public');
  const publicFields = document.getElementById('public-author-fields');
  const isAnonInput = document.getElementById('input-is-anonymous');

  optAnon?.addEventListener('click', () => {
    optAnon.classList.add('active');
    optPublic.classList.remove('active');
    publicFields.classList.remove('show');
    isAnonInput.value = 'true';
    sound.playWaterDrop();
  });

  optPublic?.addEventListener('click', () => {
    optPublic.classList.add('active');
    optAnon.classList.remove('active');
    publicFields.classList.add('show');
    isAnonInput.value = 'false';
    sound.playWaterDrop();
  });

  // Pin on map button from form
  document.getElementById('btn-pick-on-map')?.addEventListener('click', () => {
    modal.classList.remove('open');
    startMapPickerMode();
  });

  // GPS Detect button from form
  document.getElementById('btn-form-gps')?.addEventListener('click', async () => {
    showToast('Obteniendo coordenadas GPS...');
    try {
      const pos = await hydroMap.locateUser();
      setReportCoordinates(pos.lat, pos.lng);
      showToast('📍 Coordenadas actualizadas');
    } catch (e) {
      showToast('⚠️ No se pudo obtener GPS');
    }
  });

  // Remove photo preview
  document.getElementById('btn-remove-photo')?.addEventListener('click', () => {
    clearPhotoPreview();
  });

  // File Upload input
  const fileInput = document.getElementById('file-input-photo');
  document.getElementById('btn-upload-file-trigger')?.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showToast('Procesando imagen...');
        const compressedBase64 = await cameraManager.processFile(file);
        setPhotoPreview(compressedBase64);
        showToast('📸 Foto adjuntada con éxito');
      } catch (err) {
        showToast(`⚠️ ${err.message}`);
      }
    }
  });

  // Form Submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitNewReport();
  });
}

function openNewReportModal(defaultCoords = null) {
  const modal = document.getElementById('modal-new-report');
  modal.classList.add('open');

  // Coords fallback
  if (defaultCoords) {
    setReportCoordinates(defaultCoords[0], defaultCoords[1]);
  } else if (!pendingReportCoords) {
    const center = hydroMap.map.getCenter();
    setReportCoordinates(center.lat, center.lng);
  } else {
    setReportCoordinates(pendingReportCoords[0], pendingReportCoords[1]);
  }
}

function closeNewReportModal() {
  document.getElementById('modal-new-report')?.classList.remove('open');
}

function setReportCoordinates(lat, lng) {
  pendingReportCoords = [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
  const input = document.getElementById('input-coords-display');
  if (input) {
    input.value = `${pendingReportCoords[0]}, ${pendingReportCoords[1]}`;
  }

  // Reverse geocoding lookup
  reverseGeocode(lat, lng);
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
    if (res.ok) {
      const data = await res.json();
      const waterField = document.getElementById('input-water-body');
      if (waterField && !waterField.value) {
        const waterName = data.address?.water || data.address?.river || data.address?.lake || data.address?.natural;
        const municipality = data.address?.county || data.address?.city || data.address?.state;
        if (waterName) {
          waterField.value = `${waterName}${municipality ? ' (' + municipality + ')' : ''}`;
        } else if (municipality) {
          waterField.placeholder = `Ej. Río cercano a ${municipality}`;
        }
      }
    }
  } catch (e) {
    // Non-critical fallback
  }
}

function setPhotoPreview(dataUrl) {
  currentCapturedPhoto = dataUrl;
  const box = document.getElementById('photo-capture-box');
  const previewWrap = document.getElementById('photo-preview-wrap');
  const previewImg = document.getElementById('photo-preview-img');
  const promptWrap = document.getElementById('photo-prompt-wrap');

  if (previewImg && previewWrap && promptWrap && box) {
    previewImg.src = dataUrl;
    previewWrap.style.display = 'block';
    promptWrap.style.display = 'none';
    box.classList.add('has-preview');
  }
}

function clearPhotoPreview() {
  currentCapturedPhoto = null;
  const box = document.getElementById('photo-capture-box');
  const previewWrap = document.getElementById('photo-preview-wrap');
  const previewImg = document.getElementById('photo-preview-img');
  const promptWrap = document.getElementById('photo-prompt-wrap');
  const fileInput = document.getElementById('file-input-photo');

  if (previewImg && previewWrap && promptWrap && box) {
    previewImg.src = '';
    previewWrap.style.display = 'none';
    promptWrap.style.display = 'block';
    box.classList.remove('has-preview');
    if (fileInput) fileInput.value = '';
  }
}

function submitNewReport() {
  const title = document.getElementById('input-title')?.value.trim();
  const waterBody = document.getElementById('input-water-body')?.value.trim();
  const waterType = document.querySelector('input[name="water-type"]:checked')?.value || 'rio';
  const contaminant = document.querySelector('input[name="contaminant"]:checked')?.value || 'aguas_negras';
  const severity = document.getElementById('input-severity')?.value || 'moderado';
  const isAnonymous = document.getElementById('input-is-anonymous')?.value === 'true';
  const authorName = document.getElementById('input-author-name')?.value.trim();
  const authorEmail = document.getElementById('input-author-email')?.value.trim();
  const description = document.getElementById('input-description')?.value.trim();
  const odor = document.getElementById('input-odor')?.value || 'No determinado';
  const waterColor = document.getElementById('input-water-color')?.value || 'No determinado';

  if (!title) {
    showToast('⚠️ Por favor agrega un título descriptivo al reporte');
    return;
  }

  // Use captured photo or sample fallback
  const images = currentCapturedPhoto ? [currentCapturedPhoto] : ['/samples/pipe_discharge.jpg'];

  const reportData = {
    title,
    waterBody: waterBody || 'Cuerpo Hídrico No Especificado',
    waterType,
    contaminant,
    severity,
    coords: pendingReportCoords || [hydroMap.map.getCenter().lat, hydroMap.map.getCenter().lng],
    isAnonymous,
    authorName: isAnonymous ? '' : (authorName || 'Ciudadano Vigilante'),
    authorEmail: isAnonymous ? '' : authorEmail,
    description: description || 'Sin observaciones adicionales.',
    odor,
    waterColor,
    images
  };

  const created = store.addReport(reportData);

  // Play celebration effects
  sound.playSuccess();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00f2fe', '#4facfe', '#10b981', '#38bdf8']
  });

  closeNewReportModal();
  clearPhotoPreview();
  document.getElementById('form-new-report')?.reset();

  // Reset selected radio cards to defaults
  document.querySelectorAll('#water-type-grid .radio-card').forEach((c, i) => {
    c.classList.toggle('selected', i === 0);
  });
  document.querySelectorAll('#contaminant-grid .radio-card').forEach((c, i) => {
    c.classList.toggle('selected', i === 0);
  });

  showToast('💧 ¡Reporte hídrico publicado con éxito!');

  // Zoom into new marker
  hydroMap.flyTo(created.coords[0], created.coords[1], 15);
}

// -------------------------------------------------------------
// Interactive Map Picker Mode
// -------------------------------------------------------------
function startMapPickerMode() {
  const banner = document.getElementById('picker-banner');
  banner.style.display = 'flex';
  hydroMap.startPickerMode(pendingReportCoords);

  const confirmBtn = document.getElementById('btn-picker-confirm');
  const cancelBtn = document.getElementById('btn-picker-cancel');

  const onConfirm = () => {
    hydroMap.stopPickerMode();
    banner.style.display = 'none';
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
    openNewReportModal(pendingReportCoords);
  };

  const onCancel = () => {
    hydroMap.stopPickerMode();
    banner.style.display = 'none';
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
    openNewReportModal();
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
}

function updatePickerBannerUI(lat, lng) {
  const text = document.getElementById('picker-banner-text');
  if (text) {
    text.textContent = `Punto fijado: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Arrastra o haz clic)`;
  }
}

// -------------------------------------------------------------
// Live Camera Modal Viewfinder
// -------------------------------------------------------------
function setupCameraModal() {
  const cameraModal = document.getElementById('modal-camera');
  const videoElem = document.getElementById('camera-video');
  const triggerBtn = document.getElementById('btn-camera-trigger');
  const shutterBtn = document.getElementById('btn-camera-shutter');
  const flipBtn = document.getElementById('btn-camera-flip');
  const closeBtn = document.getElementById('btn-close-camera');

  triggerBtn?.addEventListener('click', async () => {
    try {
      cameraModal.classList.add('open');
      await cameraManager.startCamera(videoElem);
    } catch (e) {
      showToast('⚠️ No se pudo acceder a la cámara. Revisa los permisos.');
      cameraModal.classList.remove('open');
    }
  });

  shutterBtn?.addEventListener('click', () => {
    const photoBase64 = cameraManager.capturePhoto();
    if (photoBase64) {
      cameraManager.stopCamera();
      cameraModal.classList.remove('open');
      setPhotoPreview(photoBase64);
      showToast('📸 Foto capturada correctamente');
    }
  });

  flipBtn?.addEventListener('click', async () => {
    await cameraManager.flipCamera();
  });

  closeBtn?.addEventListener('click', () => {
    cameraManager.stopCamera();
    cameraModal.classList.remove('open');
  });
}

// -------------------------------------------------------------
// Report Detail View & Community Interactions
// -------------------------------------------------------------
function setupDetailModal() {
  const detailModal = document.getElementById('modal-detail');
  const closeBtn = document.getElementById('btn-close-detail');

  closeBtn?.addEventListener('click', () => {
    detailModal.classList.remove('open');
  });

  // Confirm / Validate alert button
  document.getElementById('btn-confirm-alert')?.addEventListener('click', () => {
    if (activeModalReportId) {
      store.confirmReport(activeModalReportId);
      sound.playSuccess();
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
      showToast('👍 ¡Has validado este reporte ciudadano!');
      openReportDetailModal(activeModalReportId); // refresh
    }
  });

  // Share alert button
  document.getElementById('btn-share-alert')?.addEventListener('click', () => {
    if (!activeModalReportId) return;
    const report = store.getById(activeModalReportId);
    if (!report) return;

    const shareText = `🚨 ALERTA HÍDRICA CIUDADANA: ${report.title} en ${report.waterBody}. Ver evidencia y mapa en Kupuri: ${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('📋 Enlace y texto de denuncia copiados al portapapeles');
    }
  });

  // Add Comment Form
  const commentForm = document.getElementById('form-add-comment');
  commentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeModalReportId) return;

    const authorInput = document.getElementById('input-comment-author');
    const textInput = document.getElementById('input-comment-text');

    const author = authorInput?.value.trim() || 'Ciudadano Vigilante';
    const text = textInput?.value.trim();

    if (text) {
      store.addComment(activeModalReportId, { author, text });
      sound.playWaterDrop();
      textInput.value = '';
      showToast('💬 Comentario añadido al reporte');
      openReportDetailModal(activeModalReportId);
    }
  });
}

function openReportDetailModal(reportId) {
  const report = store.getById(reportId);
  if (!report) return;

  activeModalReportId = reportId;
  const modal = document.getElementById('modal-detail');
  const container = document.getElementById('detail-modal-content');

  const sev = SEVERITY_LEVELS[report.severity] || SEVERITY_LEVELS.moderado;
  const water = WATER_BODY_TYPES[report.waterType] || WATER_BODY_TYPES.rio;
  const contaminant = CONTAMINANT_TYPES[report.contaminant] || CONTAMINANT_TYPES.aguas_negras;
  const image = report.images && report.images.length > 0 ? report.images[0] : '/samples/river_pollution.jpg';

  const authorBadge = report.isAnonymous
    ? `<span class="anon-pill" style="font-size: 0.85rem;">🛡️ Reporte 100% Anónimo (Identidad Protegida)</span>`
    : `<span class="author-pill" style="font-size: 0.85rem;">👤 Denuncia Pública por: <strong>${report.authorName || 'Ciudadano'}</strong></span>`;

  const commentsList = (report.comments || []).map(c => `
    <div class="comment-item">
      <div class="comment-meta">
        <strong>${c.author}</strong>
        <span>${new Date(c.date).toLocaleDateString()} ${new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p class="comment-text">${c.text}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="detail-hero">
      <img src="${image}" alt="${report.title}" class="detail-img" />
      <div class="detail-badges-overlay">
        <span class="pill-water" style="font-size: 0.85rem; padding: 5px 12px;">
          ${water.icon} ${water.label}
        </span>
        <span class="pill-sev" style="background: ${sev.color}; font-size: 0.85rem; padding: 5px 14px;">
          ${sev.label}
        </span>
      </div>
    </div>

    <div class="detail-section">
      <h2 class="detail-title">${report.title}</h2>
      <div class="detail-waterbody">
        📍 <strong>${report.waterBody || 'Cuerpo Hídrico'}</strong>
        <span style="font-size: 0.78rem; color: var(--text-muted);">(${report.coords[0]}, ${report.coords[1]})</span>
      </div>

      <div class="detail-grid-meta">
        <div class="meta-box">
          <span>Contaminante Detectado</span>
          <strong>${contaminant.icon} ${contaminant.label}</strong>
        </div>
        <div class="meta-box">
          <span>Fecha y Hora</span>
          <strong>${new Date(report.date).toLocaleDateString()} ${new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
        <div class="meta-box">
          <span>Color del Agua</span>
          <strong>${report.waterColor || 'No indicado'}</strong>
        </div>
        <div class="meta-box">
          <span>Olor Percibido</span>
          <strong>${report.odor || 'No indicado'}</strong>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        ${authorBadge}
      </div>

      <div class="detail-description">
        ${report.description}
      </div>

      <div class="community-actions-bar">
        <button class="btn-confirm-alert" id="btn-confirm-alert">
          👍 Confirmar que he visto esto (${report.confirmations || 1})
        </button>
        <button class="btn-share-alert" id="btn-share-alert">
          📢 Compartir Alerta
        </button>
      </div>

      <div class="comments-thread">
        <h4 style="font-family: var(--font-display); font-size: 0.95rem; color: #fff; margin-bottom: 12px;">
          💬 Seguimiento Comunitario (${(report.comments || []).length})
        </h4>
        <div id="comments-container">
          ${commentsList || '<p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">No hay comentarios todavía. Agrega el primer testimonio de seguimiento.</p>'}
        </div>

        <form id="form-add-comment" style="margin-top: 14px;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" id="input-comment-author" class="form-control" placeholder="Tu nombre o colectivo (ej. Vecino de la cuenca)" style="flex: 1;" />
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="input-comment-text" class="form-control" placeholder="Añadir actualización o informe de campo..." required style="flex: 1;" />
            <button type="submit" class="btn-primary-action" style="padding: 0 16px; border-radius: var(--radius-md);">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Re-bind modal buttons since HTML was replaced
  setupDetailModal();
  modal.classList.add('open');
  sound.playWaterDrop();
}

// -------------------------------------------------------------
// Toast Notifications
// -------------------------------------------------------------
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>💧</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
