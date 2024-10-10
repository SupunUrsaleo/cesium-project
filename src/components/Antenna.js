import { viewer } from '../services/viewerInstance';
import { Color, Cartesian3, ClassificationType } from 'cesium';

let radius = 100;

export function addSignalClassification(tower) {
  const circleEntity = viewer.entities.add({
    position: Cartesian3.fromDegrees(tower.longitude, tower.latitude),
    ellipse: {
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      material: Color.BLUE.withAlpha(0.3),
      classificationType: ClassificationType.BOTH
    }
  });

  document.getElementById('radiusSlider').addEventListener('input', (event) => {
    radius = Number(event.target.value);
    circleEntity.ellipse.semiMinorAxis = radius;
    circleEntity.ellipse.semiMajorAxis = radius;
    document.getElementById('radiusValue').textContent = radius;
  });
}
