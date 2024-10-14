import { viewer } from '../services/viewerInstance';
import { Cartesian3, ClassificationType, HeightReference } from 'cesium';

function createUltraSmoothRadialGradientTexture() {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  
  // Your existing color stops for the coverage area
  gradient.addColorStop(0.0, 'rgba(255, 255, 0, 0.8)');  // Strong Yellow
  gradient.addColorStop(0.1, 'rgba(255, 253, 0, 0.75)');
  gradient.addColorStop(0.2, 'rgba(255, 251, 0, 0.7)');
  gradient.addColorStop(0.3, 'rgba(255, 248, 0, 0.65)');
  gradient.addColorStop(0.4, 'rgba(255, 243, 0, 0.6)');
  gradient.addColorStop(0.5, 'rgba(255, 235, 0, 0.55)');
  gradient.addColorStop(0.6, 'rgba(255, 225, 0, 0.5)');
  gradient.addColorStop(0.7, 'rgba(255, 210, 0, 0.45)');
  gradient.addColorStop(0.8, 'rgba(255, 190, 0, 0.4)');
  gradient.addColorStop(1.0, 'rgba(255, 255, 0, 0)');


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
