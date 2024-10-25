import { viewer } from '../services/viewerInstance';
import { Rectangle, ClassificationType, HeightReference, Cartesian3 } from 'cesium';

// Function to create a color based on signal strength opacity
function getSignalColor(opacity) {
  const canvas = document.createElement('canvas');
  const size = 10; // Small size for pixel-like effect
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`; // Yellow color with varying opacity
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

  const maxSignalStrength = -55; // Define strong signal threshold
  const minSignalStrength = -130; // Define weak signal threshold

  // Check if signal strength is valid
  if (typeof signal.signalStrength !== 'number' || signal.signalStrength < minSignalStrength || signal.signalStrength > maxSignalStrength) {
    console.warn(`Invalid or missing signal strength for signal ID ${signal.id}: ${signal.signalStrength}`);
    return; // Skip this signal if signal strength is invalid or missing
  }

  // Calculate opacity based on signal strength
  // Calculate opacity based on signal strength using an exponential scale for better differentiation
  const linearScale = (maxSignalStrength - signal.signalStrength) / (maxSignalStrength - minSignalStrength);
  const exponent = 2.5; // Adjust this value to control the curve (higher = more pronounced difference)
  const opacity = Math.pow(Math.min(Math.max(linearScale, 0), 1), exponent); 
  const signalTexture = getSignalColor(opacity);

  // Define a small square around the coordinates
  const delta = 0.00005; // Adjust for desired size of the square
  const rectangleCoordinates = Rectangle.fromDegrees(
    signal.longitude - delta,
    signal.latitude - delta,
    signal.longitude + delta,
    signal.latitude + delta
  );

  // Represent each signal as a small pixel-like square
  viewer.entities.add({
    id: `signal_${signal.id}_${signal.longitude}_${signal.latitude}`,
    rectangle: {
      coordinates: rectangleCoordinates,
      material: signalTexture,
      classificationType: ClassificationType.BOTH,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    },
  });
}
