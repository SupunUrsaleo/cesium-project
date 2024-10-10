import { addSignalClassification } from './Antenna';
import { placeTower, placeEquipment } from '../services/CesiumService';
import { saveTowers, loadTowers } from '../services/StorageService';
import { dataSource } from '../services/viewerInstance';
import { calculateOffsetPosition } from '../utils/CoordinateUtils';

export function loadTowersFromJSON(dataArray) {
  dataArray.forEach((data, index) => {
    const { latitude, longitude, ground_elevation_m } = data.tower.location;
    const towerId = `${latitude}_${longitude}`;
    
    const newTower = { 
      id: towerId, 
      latitude, 
      longitude, 
      height: ground_elevation_m, 
      assetId: 2749930, 
      heading: 0, 
      pitch: 90, 
      roll: 0,
      equipments: [] 
    };

    placeTower(newTower);

    data.antennas.forEach((antenna) => {
      const equipmentData = {
        assetId: 2756072,
        equipmentHeight: antenna.height_agl_m,
        azimuth: antenna.azimuth_degrees,
        tilt: antenna.mechanical_tilt_degrees,
        offset: 1.5,
      };

      const equipmentPosition = calculateOffsetPosition(latitude, longitude, 1.5, equipmentData.azimuth);
      placeEquipment(equipmentData.assetId, equipmentPosition, equipmentData.equipmentHeight, equipmentData.tilt);
      newTower.equipments.push(equipmentData);
    });

    saveTowers(newTower);
    addSignalClassification(newTower);
  });
}
