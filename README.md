# 💧 Kupuri HidroAlerta

> **Plataforma Ciudadana de Monitoreo y Protección de Aguas y Sistemas Hídricos**  
> *"Kupuri"* (fuerza vital / espíritu del agua en Wixárika). Diseñada para empoderar a comunidades, brigadas, colectivos y ciudadanos en la vigilancia, denuncia y conservación de ríos, lagos, humedales, cenotes y cuencas.

---

## 🌊 Características Principales

### 1. Mapas Libres Especializados en Hidrografía
- **Carto Voyager (Hidro)**: Vista limpia de alto contraste optimizada para masas de agua continentales y costeras.
- **OpenTopoMap**: Capa topográfica libre que muestra con claridad la red de ríos, arroyos, cuencas, curvas de nivel y humedales.
- **Esri Satélite de Alta Resolución**: Permite inspección visual aérea de riberas, sedimentación y descargas.
- **OpenStreetMap Estándar**: Cartografía abierta y colaborativa global.
- **Mapa de Calor de Contaminación**: Capa dinámica que resalta las zonas y cuencas con mayor densidad de vertidos o emergencias críticas.

### 2. Sistema de Reportes de Contaminación Ciudadana
- **Marcador en Mapa o GPS**:
  - Detección automática de ubicación por GPS de alta precisión.
  - Modo interactivo para colocar o arrastrar el marcador directamente en el río, lago o humedal con geocodificación inversa de OpenStreetMap Nominatim.
- **Clasificación del Sistema Hídrico**:
  - Río / Cuenca
  - Humedal / Manglar
  - Lago / Laguna
  - Cenote / Manantial (sistemas kársticos y aguas subterráneas)
  - Arroyo / Cañada
  - Estuario / Desembocadura
- **Clasificación de Contaminantes**:
  - Vertido de aguas residuales / drenaje sanitario
  - Residuos sólidos y plásticos
  - Químicos o desechos industriales
  - Manchas de petróleo / aceites / hidrocarburos
  - Espuma tóxica persistente
  - Eutrofización y proliferación acelerada de microalgas
  - Mortandad de peces o fauna silvestre
  - Extracción ilegal o desecación de ribera
- **Nivel de Gravedad**:
  - Leve, Moderado, Alto y Crítico / Emergencia ecológica (con pulsos animados de radar).
- **Indicadores Sensoriales**:
  - Aspecto y color del agua (turbia, negra, lechosa, verde por algas, iridiscente).
  - Olor perceptible (inodoro, fétido, solvente químico, azufre, combustible, pescado podrido).

### 3. Evidencia Fotográfica y Cámara en Vivo
- **Cámara en Vivo integrada**: Captura instantánea de evidencia con la cámara de tu smartphone o laptop mediante WebRTC (`navigator.mediaDevices.getUserMedia`) con selector de cámara frontal/trasera.
- **Subida de Archivos**: Permite arrastrar o seleccionar fotos de la galería o explorador.
- **Compresión y Estampado en Cliente**: Optimización a 1200px con sello de agua temporal de verificación ciudadana y almacenamiento eficiente.

### 4. Privacidad e Identidad
- **🛡️ Reporte Anónimo**: Tu identidad se mantiene 100% protegida y confidencial para evitar represalias en zonas conflictivas.
- **👤 Publicar con mi Nombre o Colectivo**: Permite firmar la alerta con el nombre de tu ONG ambiental, colectivo vecinal o brigada comunitaria, con correo opcional de seguimiento.

### 5. Participación Comunitaria y Validación
- **Validación Ciudadana ("+1 Confirmar que he visto esto")**: Fortalece la legitimidad de cada alerta y previene falsos positivos.
- **Hilo de Comentarios y Seguimiento**: Espacio para que brigadistas y vecinos informen si la fuga continúa o si se ha organizado una faena comunitaria.
- **Exportación de Datos**:
  - 🗺️ **GeoJSON**: Compatible con QGIS, ArcGIS y Google Earth para análisis geoespacial.
  - 📊 **CSV**: Listado tabular listo para denuncias formales ante organismos como CONAGUA, PROFEPA o comisiones de cuenca.

---

## 🚀 Cómo Ejecutar el Proyecto

El servidor de desarrollo ya está activo en tu máquina:

```bash
# Iniciar servidor local
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```

Abre tu navegador en:
👉 **[http://localhost:5173/](http://localhost:5173/)**
