import { viewer } from '../services/viewerInstance';
import { Cartesian3, ClassificationType, HeightReference } from 'cesium';

function createUltraSmoothRadialGradientTexture() {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  
// Adjusting the gradient stops to allocate the specific starting opacities for each color
gradient.addColorStop(0.00, 'rgba(255, 255, 0, 0.5)');  // Yellow starts at 0.5 opacity
gradient.addColorStop(0.05, 'rgba(255, 253, 0, 0.48)');
gradient.addColorStop(0.10, 'rgba(255, 251, 0, 0.46)');
gradient.addColorStop(0.15, 'rgba(255, 245, 0, 0.44)');
gradient.addColorStop(0.20, 'rgba(255, 235, 0, 0.42)');
gradient.addColorStop(0.25, 'rgba(255, 225, 0, 0.40)');
gradient.addColorStop(0.30, 'rgba(255, 215, 0, 0.38)');  // End of Yellow range with transition

// Gradual transition to orange at 0.5 opacity
gradient.addColorStop(0.35, 'rgba(255, 200, 0, 0.47)');
gradient.addColorStop(0.40, 'rgba(255, 180, 0, 0.45)');
gradient.addColorStop(0.45, 'rgba(255, 160, 0, 0.43)');
gradient.addColorStop(0.50, 'rgba(255, 140, 0, 0.41)');  // Stronger orange with 0.5 opacity range

// Transitioning orange to red starting at 0.4 opacity
gradient.addColorStop(0.55, 'rgba(255, 120, 0, 0.39)');
gradient.addColorStop(0.60, 'rgba(255, 100, 0, 0.38)');
gradient.addColorStop(0.65, 'rgba(255, 80, 0, 0.37)');

// Orange blending into red
gradient.addColorStop(0.70, 'rgba(255, 60, 0, 0.36)');
gradient.addColorStop(0.75, 'rgba(255, 40, 0, 0.34)');
gradient.addColorStop(0.80, 'rgba(255, 20, 0, 0.32)');
gradient.addColorStop(0.85, 'rgba(255, 0, 0, 0.30)');  // Red with reduced opacity

// Further fade out red smoothly
gradient.addColorStop(0.90, 'rgba(250, 0, 0, 0.28)');
gradient.addColorStop(0.95, 'rgba(245, 0, 0, 0.26)');
gradient.addColorStop(1.00, 'rgba(240, 0, 0, 0.24)');  // End red at minimal opacity


  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  return canvas.toDataURL();
}

export function addSignalClassification(tower) {
  const smoothGradientTexture = createUltraSmoothRadialGradientTexture();

  viewer.entities.add({
    id: `signal-${tower.id}`,  // Associate the signal entity with the tower ID
    position: Cartesian3.fromDegrees(tower.longitude, tower.latitude),
    ellipse: {
      semiMinorAxis: 150,
      semiMajorAxis: 150,
      material: smoothGradientTexture,
      classificationType: ClassificationType.BOTH,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    },
  });

  // Dynamically adjust the radius using the slider
  document.getElementById('radiusSlider').addEventListener('input', (event) => {
    const maxRadius = 150;
    const scale = Number(event.target.value) / maxRadius;
    viewer.entities.values.forEach((entity) => {
      if (entity.ellipse) {
        entity.ellipse.semiMinorAxis = maxRadius * scale;
        entity.ellipse.semiMajorAxis = maxRadius * scale;
      }
    });

    document.getElementById('radiusValue').textContent = Math.round(maxRadius * scale);
  });
}
