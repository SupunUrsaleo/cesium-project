import { Math as CesiumMath } from 'cesium';

export function calculateOffsetPosition(latitude, longitude, offset, azimuth) {
  const R = 6371000;
  const latOffset = offset / R * (180 / Math.PI);
  const lonOffset = offset / (R * Math.cos(Math.PI * latitude / 180)) * (180 / Math.PI);

  const newLatitude = latitude + latOffset * Math.cos(CesiumMath.toRadians(azimuth));
  const newLongitude = longitude + lonOffset * Math.sin(CesiumMath.toRadians(azimuth));

  return { latitude: newLatitude, longitude: newLongitude };
}
