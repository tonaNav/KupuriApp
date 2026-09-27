// Camera and Image Capture / Compression Handler
import { sound } from './audio.js';

class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.facingMode = 'environment'; // default to rear camera for environmental monitoring
    this.isStreaming = false;
  }

  // Initialize camera stream
  async startCamera(videoElement) {
    this.videoElement = videoElement;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('La API de cámara no es soportada por este navegador.');
    }

    // Stop existing stream if any
    this.stopCamera();

    const constraints = {
      video: {
        facingMode: { ideal: this.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      this.isStreaming = true;
      return true;
    } catch (err) {
      console.warn('Fallback to any camera:', err);
      // Fallback without facingMode constraint
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        this.isStreaming = true;
        return true;
      } catch (fallbackErr) {
        this.isStreaming = false;
        throw fallbackErr;
      }
    }
  }

  // Toggle between front and rear cameras (if on mobile)
  async flipCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    if (this.videoElement) {
      return await this.startCamera(this.videoElement);
    }
  }

  // Capture current video frame into a compressed base64 JPEG
  capturePhoto() {
    if (!this.videoElement || !this.isStreaming) return null;

    sound.playShutter();

    const canvas = document.createElement('canvas');
    const width = this.videoElement.videoWidth || 640;
    const height = this.videoElement.videoHeight || 480;

    // Constrain maximum dimensions to 1280 for performance & storage
    const maxDim = 1200;
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        targetWidth = maxDim;
        targetHeight = Math.round((height * maxDim) / width);
      } else {
        targetHeight = maxDim;
        targetWidth = Math.round((width * maxDim) / height);
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Draw frame
    ctx.drawImage(this.videoElement, 0, 0, targetWidth, targetHeight);

    // Add optional environmental watermark timestamp & tag
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, targetHeight - 34, targetWidth, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textBaseline = 'middle';
    const nowStr = new Date().toLocaleString();
    ctx.fillText(`Kupuri HidroAlerta • ${nowStr}`, 14, targetHeight - 17);

    // Return compressed image
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  // Stop camera stream cleanly
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isStreaming = false;
  }

  // Process and compress user-uploaded image file (from gallery or input[type=file])
  async processFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('El archivo seleccionado no es una imagen válida.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              width = maxDim;
              height = Math.round((img.height * maxDim) / img.width);
            } else {
              height = maxDim;
              width = Math.round((img.width * maxDim) / img.height);
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Add environmental verification watermark
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(0, height - 34, width, 34);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textBaseline = 'middle';
          const nowStr = new Date().toLocaleString();
          ctx.fillText(`Kupuri HidroAlerta • ${nowStr}`, 14, height - 17);

          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }
}

export const cameraManager = new CameraManager();
