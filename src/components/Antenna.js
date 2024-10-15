import { viewer } from '../services/viewerInstance';
import { Cartesian3, ClassificationType, HeightReference } from 'cesium';

// Function to create a smooth radial gradient texture
function createUltraSmoothRadialGradientTexture(opacity) {
  const canvas = document.createElement('canvas');
  const size = 50;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

  // Apply color stops for coverage gradient
  gradient.addColorStop(0.0, `rgba(255, 255, 0, ${opacity})`);  // Strong Yellow
  gradient.addColorStop(0.1, `rgba(255, 253, 0, ${opacity * 0.9})`);
  gradient.addColorStop(0.2, `rgba(255, 251, 0, ${opacity * 0.8})`);
  gradient.addColorStop(0.3, `rgba(255, 248, 0, ${opacity * 0.7})`);
  gradient.addColorStop(0.4, `rgba(255, 243, 0, ${opacity * 0.6})`);
  gradient.addColorStop(0.5, `rgba(255, 235, 0, ${opacity * 0.5})`);
  gradient.addColorStop(0.6, `rgba(255, 225, 0, ${opacity * 0.4})`);
  gradient.addColorStop(0.7, `rgba(255, 210, 0, ${opacity * 0.3})`);
  gradient.addColorStop(0.8, `rgba(255, 190, 0, ${opacity * 0.2})`);
  gradient.addColorStop(1.0, `rgba(255, 255, 0, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return canvas.toDataURL();
}

export function addSignalClassification(signal) {
  // Validate latitude and longitude
  if (
    typeof signal.latitude !== 'number' || 
    typeof signal.longitude !== 'number' || 
    signal.latitude < -90 || 
    signal.latitude > 90 || 
    signal.longitude < -180 || 
    signal.longitude > 180
  ) {
    console.error(`Invalid signal coordinates: ${signal.latitude}, ${signal.longitude}`);
    return; // Skip this signal if coordinates are invalid
  }

  const maxSignalStrength = -65; // Define strong signal threshold
  const minSignalStrength = -130; // Define weak signal threshold
  const maxRadius = 150; // Define max radius for coverage
  const minRadius = 10; // Set a minimum radius for weak signals

  // Check if signal strength is valid
  if (typeof signal.signalStrength !== 'number' || signal.signalStrength < minSignalStrength || signal.signalStrength > maxSignalStrength) {
    console.warn(`Invalid or missing signal strength for signal ID ${signal.id}: ${signal.signalStrength}`);
    return; // Skip this signal if signal strength is invalid or missing
  }

  // Calculate radius based on signal strength, and ensure it’s at least the minimum radius
  const scale = (maxSignalStrength - signal.signalStrength) / (maxSignalStrength - minSignalStrength);
  const radius = Math.max(maxRadius * scale, minRadius);

  // Generate gradient texture based on opacity
  const opacity = Math.min(Math.max(scale, 0), 1);
  const smoothGradientTexture = createUltraSmoothRadialGradientTexture(opacity);

  // Add the entity to Cesium viewer
  viewer.entities.add({
    id: `signal-${signal.id}`,
    position: Cartesian3.fromDegrees(signal.longitude, signal.latitude),
    ellipse: {
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      material: smoothGradientTexture,
      classificationType: ClassificationType.BOTH,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    },
  });
}


