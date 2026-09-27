// Statistics and Basin Analysis Module for Kupuri HidroAlerta
import { WATER_BODY_TYPES, CONTAMINANT_TYPES, SEVERITY_LEVELS } from './store.js';

export function computeStatistics(reports) {
  const total = reports.length;
  const critical = reports.filter(r => r.severity === 'critico').length;
  const high = reports.filter(r => r.severity === 'alto').length;
  const moderate = reports.filter(r => r.severity === 'moderado').length;
  const low = reports.filter(r => r.severity === 'leve').length;

  const anonymousCount = reports.filter(r => r.isAnonymous).length;
  const publicCount = total - anonymousCount;

  // By water body type
  const waterTypeCounts = {};
  Object.keys(WATER_BODY_TYPES).forEach(k => { waterTypeCounts[k] = 0; });
  reports.forEach(r => {
    if (waterTypeCounts[r.waterType] !== undefined) {
      waterTypeCounts[r.waterType]++;
    }
  });

  // By contaminant
  const contaminantCounts = {};
  Object.keys(CONTAMINANT_TYPES).forEach(k => { contaminantCounts[k] = 0; });
  reports.forEach(r => {
    if (contaminantCounts[r.contaminant] !== undefined) {
      contaminantCounts[r.contaminant]++;
    }
  });

  // By status
  const statusCounts = {
    pendiente: reports.filter(r => r.status === 'pendiente').length,
    en_revision: reports.filter(r => r.status === 'en_revision').length,
    atendido: reports.filter(r => r.status === 'atendido').length
  };

  // Total citizen validations
  const totalConfirmations = reports.reduce((acc, r) => acc + (r.confirmations || 0), 0);

  return {
    total,
    critical,
    high,
    moderate,
    low,
    anonymousCount,
    publicCount,
    waterTypeCounts,
    contaminantCounts,
    statusCounts,
    totalConfirmations
  };
}

export function renderStatisticsHTML(reports) {
  const stats = computeStatistics(reports);

  // Build contaminant bar rows
  const contaminantRows = Object.entries(stats.contaminantCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => {
      const info = CONTAMINANT_TYPES[key] || { label: key, icon: '⚠️', color: '#06b6d4' };
      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      return `
        <div class="stat-bar-item">
          <div class="stat-bar-header">
            <span class="stat-bar-label">${info.icon} ${info.label}</span>
            <span class="stat-bar-val">${count} (${pct}%)</span>
          </div>
          <div class="stat-progress-track">
            <div class="stat-progress-fill" style="width: ${pct}%; background: ${info.color};"></div>
          </div>
        </div>
      `;
    }).join('');

  // Water system breakdown cards
  const waterTypeBadges = Object.entries(stats.waterTypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => {
      const info = WATER_BODY_TYPES[key] || { label: key, icon: '💧', color: '#00f2fe' };
      return `
        <div class="stat-water-badge" style="border-left: 3px solid ${info.color};">
          <span class="stat-w-icon">${info.icon}</span>
          <div class="stat-w-meta">
            <strong>${count}</strong>
            <small>${info.label}</small>
          </div>
        </div>
      `;
    }).join('');

  return `
    <div class="stats-container">
      <div class="stats-overview-grid">
        <div class="stat-card stat-total">
          <div class="stat-icon">🌊</div>
          <div class="stat-num">${stats.total}</div>
          <div class="stat-name">Reportes Hídricos Totales</div>
        </div>
        <div class="stat-card stat-critical">
          <div class="stat-icon">🚨</div>
          <div class="stat-num">${stats.critical}</div>
          <div class="stat-name">Emergencias Críticas</div>
        </div>
        <div class="stat-card stat-validated">
          <div class="stat-icon">👥</div>
          <div class="stat-num">${stats.totalConfirmations}</div>
          <div class="stat-name">Validaciones Ciudadanas</div>
        </div>
        <div class="stat-card stat-resolved">
          <div class="stat-icon">🌱</div>
          <div class="stat-num">${stats.statusCounts.atendido}</div>
          <div class="stat-name">Casos Atendidos</div>
        </div>
      </div>

      <div class="stats-section">
        <h4 class="stats-heading">Sistemas Hídricos Monitoreados</h4>
        <div class="stat-water-grid">
          ${waterTypeBadges}
        </div>
      </div>

      <div class="stats-section">
        <h4 class="stats-heading">Contaminantes más Frecuentes</h4>
        <div class="stat-bars-list">
          ${contaminantRows || '<p class="text-muted">Sin datos de contaminantes aún.</p>'}
        </div>
      </div>

      <div class="stats-section">
        <h4 class="stats-heading">Protección y Participación Ciudadana</h4>
        <div class="stat-privacy-box">
          <div class="stat-privacy-item">
            <span class="p-icon">🛡️</span>
            <div>
              <strong>${stats.anonymousCount} Reportes Anónimos</strong>
              <p>Personas que protegieron su identidad de posibles represalias.</p>
            </div>
          </div>
          <div class="stat-privacy-item">
            <span class="p-icon">📢</span>
            <div>
              <strong>${stats.publicCount} Denuncias Públicas</strong>
              <p>Firmadas por colectivos, brigadas y vecinos vigilantes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
