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
    typeof signal.y !== 'number' || 
    typeof signal.x !== 'number' || 
    signal.y < -90 || 
    signal.y > 90 || 
    signal.x < -180 || 
    signal.x > 180
  ) {
    console.error(`Invalid signal coordinates: ${signal.y}, ${signal.x}`);
    return; // Skip this signal if coordinates are invalid
  }

  const maxSignalStrength = -45; // Define strong signal threshold
  const minSignalStrength = -130; // Define weak signal threshold

  // Check if signal strength is valid
  if (typeof signal.max_rf_signal_strength_dbm !== 'number' || signal.max_rf_signal_strength_dbm < minSignalStrength || signal.max_rf_signal_strength_dbm > maxSignalStrength) {
    console.warn(`Invalid or missing signal strength for signal ID ${signal.rf_source_id}: ${signal.max_rf_signal_strength_dbm} :${signal.x} :${signal.y}`);
    return; // Skip this signal if signal strength is invalid or missing
  }

  // Calculate opacity based on signal strength using an exponential scale for better differentiation
  const linearScale = (maxSignalStrength - signal.max_rf_signal_strength_dbm) / (maxSignalStrength - minSignalStrength);
  const exponent = 2.5; // Adjust this value to control the curve (higher = more pronounced difference)
  const opacity = Math.pow(Math.min(Math.max(linearScale, 0), 1), exponent); 
  const signalTexture = getSignalColor(opacity);

  const deltaLon = 0.00006;  // Larger width (longitude change)
  const deltaLat = 0.000045; // Smaller height (latitude change)
  
  const rectangleCoordinates = Rectangle.fromDegrees(
    signal.x - deltaLon,
    signal.y - deltaLat,
    signal.x + deltaLon,
    signal.y + deltaLat
  );

  // Represent each signal as a small pixel-like square
  viewer.entities.add({
    id: `signal_${signal.rf_source_id}_${signal.x}_${signal.y}`,
    rectangle: {
      coordinates: rectangleCoordinates,
      material: signalTexture,
      classificationType: ClassificationType.BOTH,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    },
  });
}

