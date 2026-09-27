// Store and Data Management for Kupuri HidroAlerta

export const WATER_BODY_TYPES = {
  rio: { id: 'rio', label: 'Río / Cuenca', icon: '🌊', color: '#06b6d4' },
  humedal: { id: 'humedal', label: 'Humedal / Manglar', icon: '🌿', color: '#10b981' },
  lago: { id: 'lago', label: 'Lago / Laguna', icon: '⛵', color: '#3b82f6' },
  cenote: { id: 'cenote', label: 'Cenote / Manantial', icon: '💧', color: '#00f2fe' },
  arroyo: { id: 'arroyo', label: 'Arroyo / Cañada', icon: '🏞️', color: '#14b8a6' },
  estuario: { id: 'estuario', label: 'Estuario / Desembocadura', icon: '🐚', color: '#6366f1' }
};

export const CONTAMINANT_TYPES = {
  aguas_negras: { id: 'aguas_negras', label: 'Vertido de Aguas Negras / Drenaje', icon: '☣️', color: '#78350f' },
  basura_plasticos: { id: 'basura_plasticos', label: 'Residuos Sólidos y Plásticos', icon: '🗑️', color: '#f59e0b' },
  quimicos_industriales: { id: 'quimicos_industriales', label: 'Químicos / Desechos Industriales', icon: '⚠️', color: '#dc2626' },
  hidrocarburos: { id: 'hidrocarburos', label: 'Manchas de Petróleo / Aceite / Combustible', icon: '🛢️', color: '#475569' },
  espuma_toxica: { id: 'espuma_toxica', label: 'Espuma Tóxica / Detergentes', icon: '🫧', color: '#cbd5e1' },
  eutrofizacion: { id: 'eutrofizacion', label: 'Eutrofización / Proliferación de Algas', icon: '🦠', color: '#84cc16' },
  muerte_fauna: { id: 'muerte_fauna', label: 'Mortandad de Peces / Aves Acuáticas', icon: '☠️', color: '#b91c1c' },
  desecacion: { id: 'desecacion', label: 'Extracción Ilegal o Desecación de Ribera', icon: '🏜️', color: '#d97706' }
};

export const SEVERITY_LEVELS = {
  leve: { id: 'leve', label: 'Leve', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', description: 'Turbidez superficial o basura aislada sin afección mayor' },
  moderado: { id: 'moderado', label: 'Moderado', color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', description: 'Olores detectables y acumulación visible de contaminantes' },
  alto: { id: 'alto', label: 'Alto', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', description: 'Descarga activa continua, fuerte olor fétido y cambio de color' },
  critico: { id: 'critico', label: 'Crítico / Emergencia', color: '#b91c1c', glow: 'rgba(185, 28, 28, 0.8)', description: 'Riesgo inminente para la salud humana o colapso del ecosistema acuático' }
};

// Seed realistic data for major water bodies
const INITIAL_REPORTS = [
  {
    id: 'kupuri-rep-101',
    title: 'Descarga industrial y densa espuma tóxica en Río Santiago',
    waterBody: 'Río Lerma-Santiago (Tramo El Salto)',
    waterType: 'rio',
    contaminant: 'espuma_toxica',
    severity: 'critico',
    coords: [20.5186, -103.1784], // El Salto, Jalisco
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    isAnonymous: false,
    authorName: 'Colectivo Agua Viva y Ribereños',
    authorEmail: 'defensa.santiago@ecored.org',
    waterColor: 'Grisácea oscura con natas blancas',
    odor: 'Químico penetrante y azufre',
    description: 'Enorme manto de espuma que supera los dos metros de altura sobre la caída de agua. Persistente olor a solventes químicos que causa irritación ocular a los vecinos de la ribera. Solicitamos inspección urgente.',
    images: ['/samples/river_pollution.jpg'],
    confirmations: 24,
    status: 'en_revision', // pendiente, en_revision, atendido
    comments: [
      {
        id: 'c1',
        author: 'Dra. Elena Ramos (Bióloga)',
        date: new Date(Date.now() - 3600000 * 3).toISOString(),
        text: 'Se tomaron muestras preliminares de DBO y metales pesados. Urge presentar informe formal a la comisión de cuenca.'
      },
      {
        id: 'c2',
        author: 'Vecino Vigilante El Salto',
        date: new Date(Date.now() - 3600000 * 1).toISOString(),
        text: 'El viento está llevando la espuma hacia las escuelas primarias cercanas. Gracias por subir la foto.'
      }
    ]
  },
  {
    id: 'kupuri-rep-102',
    title: 'Eutrofización acelerada y acumulación plástica en canales lacustres',
    waterBody: 'Humedales y Canales de Xochimilco',
    waterType: 'humedal',
    contaminant: 'eutrofizacion',
    severity: 'alto',
    coords: [19.2682, -99.0988], // Xochimilco, CDMX
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    isAnonymous: true,
    authorName: '',
    authorEmail: '',
    waterColor: 'Verde intenso opaco por algas',
    odor: 'Materia orgánica descompuesta',
    description: 'Capa vegetal flotante desmedida y acumulación de botellas PET y bolsas en la orilla del canal tradicional. Los niveles de oxígeno disuelto parecen muy bajos; la fauna nativa como charales y ajolotes está en riesgo.',
    images: ['/samples/wetland_algae.jpg'],
    confirmations: 16,
    status: 'pendiente',
    comments: [
      {
        id: 'c3',
        author: 'Canoero de Cuemanco',
        date: new Date(Date.now() - 3600000 * 12).toISOString(),
        text: 'Este fin de semana organizaremos una brigada ciudadana en trajineras para extraer el plástico superficial.'
      }
    ]
  },
  {
    id: 'kupuri-rep-103',
    title: 'Tubería clandestina arrojando aguas residuales sin tratar',
    waterBody: 'Río Magdalena (Último río vivo de la CDMX)',
    waterType: 'rio',
    contaminant: 'aguas_negras',
    severity: 'alto',
    coords: [19.3175, -99.2321], // Los Dinamos / Río Magdalena
    date: new Date(Date.now() - 3600000 * 42).toISOString(),
    isAnonymous: false,
    authorName: 'Mtra. Mariana Solís',
    authorEmail: 'mariana.solis@guardianesagua.org',
    waterColor: 'Marrón terroso con turbidez',
    odor: 'Aguas negras y lodos',
    description: 'A 200 metros de la entrada al tercer dinamo detectamos una tubería de concreto rota de 30 pulgadas drenando agua fétida directamente al cauce rocoso natural. Provoca turbidez inmediata en el agua cristalina del río.',
    images: ['/samples/pipe_discharge.jpg'],
    confirmations: 31,
    status: 'en_revision',
    comments: [
      {
        id: 'c4',
        author: 'Senderistas de la Cuenca',
        date: new Date(Date.now() - 3600000 * 20).toISOString(),
        text: 'Confirmado. El hedor se percibe desde la vereda principal. Subiremos reporte complementario.'
      }
    ]
  },
  {
    id: 'kupuri-rep-104',
    title: 'Filtración de hidrocarburos y lixiviados en sistema kárstico',
    waterBody: 'Cenote y Acuífero Kárstico Tulum-Cobá',
    waterType: 'cenote',
    contaminant: 'hidrocarburos',
    severity: 'critico',
    coords: [20.2114, -87.4654], // Tulum, Quintana Roo
    date: new Date(Date.now() - 3600000 * 60).toISOString(),
    isAnonymous: true,
    authorName: '',
    authorEmail: '',
    waterColor: 'Iridiscente con película aceitosa',
    odor: 'Gasolina / diésel quemado',
    description: 'Se observa una capa tornasolada de combustible sobre el espejo de agua subterránea conectado a la cueva. Probable derrame de maquinaria pesada o tanque subterráneo de desarrollo inmobiliario cercano.',
    images: ['/samples/river_pollution.jpg'],
    confirmations: 42,
    status: 'pendiente',
    comments: [
      {
        id: 'c5',
        author: 'Espeleobuzo Comunitario',
        date: new Date(Date.now() - 3600000 * 30).toISOString(),
        text: 'La corriente subterránea fluye hacia el sistema Sac Actun. Es urgente instalar barreras absorbentes antes de que llegue al arrecife.'
      }
    ]
  },
  {
    id: 'kupuri-rep-105',
    title: 'Extracción excesiva y mortandad de peces en ribera lacustre',
    waterBody: 'Lago de Chapala (Ribera Poniente)',
    waterType: 'lago',
    contaminant: 'muerte_fauna',
    severity: 'moderado',
    coords: [20.2878, -103.2081], // Chapala
    date: new Date(Date.now() - 3600000 * 80).toISOString(),
    isAnonymous: false,
    authorName: 'Red de Pescadores Ribereños',
    authorEmail: 'pescadores.chapala@gmail.com',
    waterColor: 'Verdosa con baja profundidad',
    odor: 'Pescado descompuesto y lodo seco',
    description: 'En los últimos 4 días han aparecido carpas y mojarras muertas en la orilla del muelle. El nivel del agua ha retrocedido más de 15 metros dejando fango expuesto.',
    images: ['/samples/wetland_algae.jpg'],
    confirmations: 19,
    status: 'atendido',
    comments: [
      {
        id: 'c6',
        author: 'Protección Civil Ribera',
        date: new Date(Date.now() - 3600000 * 40).toISOString(),
        text: 'Se realizó limpieza de la ribera y se enviaron muestras al laboratorio estatal para descartar cianotoxinas.'
      }
    ]
  }
];

const STORAGE_KEY = 'kupuri_hidro_reports_v2';

export class Store {
  constructor() {
    this.reports = this.loadReports();
    this.listeners = [];
  }

  loadReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using initial defaults:', e);
    }
    this.saveReports(INITIAL_REPORTS);
    return INITIAL_REPORTS;
  }

  saveReports(reports) {
    this.reports = reports;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Error saving reports to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.reports));
  }

  getAll() {
    return [...this.reports];
  }

  getById(id) {
    return this.reports.find(r => r.id === id);
  }

  addReport(reportData) {
    const newReport = {
      id: `kupuri-rep-${Date.now()}`,
      date: new Date().toISOString(),
      confirmations: 1, // Author confirms it initially
      status: 'pendiente',
      comments: [],
      ...reportData
    };

    const updated = [newReport, ...this.reports];
    this.saveReports(updated);
    return newReport;
  }

  confirmReport(id) {
    const updated = this.reports.map(r => {
      if (r.id === id) {
        return { ...r, confirmations: (r.confirmations || 0) + 1 };
      }
      return r;
    });
    this.saveReports(updated);
  }

  addComment(id, { author, text }) {
    const updated = this.reports.map(r => {
      if (r.id === id) {
        const comments = r.comments || [];
        const newComment = {
          id: `c-${Date.now()}`,
          author: author || 'Ciudadano Vigilante',
          date: new Date().toISOString(),
          text
        };
        return { ...r, comments: [...comments, newComment] };
      }
      return r;
    });
    this.saveReports(updated);
  }

  updateStatus(id, newStatus) {
    const updated = this.reports.map(r => {
      if (r.id === id) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    this.saveReports(updated);
  }

  deleteReport(id) {
    const updated = this.reports.filter(r => r.id !== id);
    this.saveReports(updated);
  }

  resetToDefaults() {
    this.saveReports(INITIAL_REPORTS);
  }

  // Export as GeoJSON FeatureCollection
  exportGeoJSON() {
    const features = this.reports.map(r => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.coords[1], r.coords[0]] // GeoJSON uses [longitude, latitude]
      },
      properties: {
        id: r.id,
        title: r.title,
        waterBody: r.waterBody,
        waterType: r.waterType,
        waterTypeLabel: WATER_BODY_TYPES[r.waterType]?.label || r.waterType,
        contaminant: r.contaminant,
        contaminantLabel: CONTAMINANT_TYPES[r.contaminant]?.label || r.contaminant,
        severity: r.severity,
        status: r.status,
        date: r.date,
        isAnonymous: r.isAnonymous,
        author: r.isAnonymous ? 'Anónimo' : r.authorName,
        confirmations: r.confirmations,
        description: r.description,
        odor: r.odor,
        waterColor: r.waterColor
      }
    }));

    const geojson = {
      type: 'FeatureCollection',
      name: 'Kupuri_HidroAlerta_Reportes',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
      },
      features
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kupuri_hidroalerta_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export as CSV for table and report analysis
  exportCSV() {
    const headers = [
      'ID',
      'Fecha',
      'Cuerpo de Agua',
      'Tipo Hídrico',
      'Contaminante',
      'Gravedad',
      'Estado',
      'Latitud',
      'Longitud',
      'Anonimato',
      'Autor',
      'Confirmaciones',
      'Olor',
      'Color Agua',
      'Descripción'
    ];

    const rows = this.reports.map(r => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${(r.waterBody || '').replace(/"/g, '""')}"`,
      `"${WATER_BODY_TYPES[r.waterType]?.label || r.waterType}"`,
      `"${CONTAMINANT_TYPES[r.contaminant]?.label || r.contaminant}"`,
      `"${r.severity}"`,
      `"${r.status}"`,
      r.coords[0],
      r.coords[1],
      r.isAnonymous ? 'Anónimo' : 'Público',
      `"${(r.isAnonymous ? 'Anónimo' : r.authorName || '').replace(/"/g, '""')}"`,
      r.confirmations || 0,
      `"${(r.odor || '').replace(/"/g, '""')}"`,
      `"${(r.waterColor || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kupuri_denuncias_hidricas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const store = new Store();
