import { addSignalClassification, addSignalClassificationDemo } from './Antenna';
import { placeTower, placeEquipment } from '../services/CesiumService';
import { saveTowers } from '../services/StorageService';
import { calculateOffsetPosition } from '../utils/CoordinateUtils';

// Load towers from JSON
export function loadTowersFromJSON(dataArray) {
  dataArray.forEach((data, index) => {
    const { latitude, longitude, ground_elevation_m } = data.tower.location;
    const towerId = `${latitude}&${longitude}`;
    
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
    // addSignalClassification(newTower);
  });
}

// Function to place tower from the form submission
export function setupFormSubmission() {
  const placeTowerBtn = document.getElementById('placeTowerBtn');
  
  placeTowerBtn.addEventListener('click', () => {
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const height = parseFloat(document.getElementById('height').value);
    const assetId = parseInt(document.getElementById('assetId').value, 10);
    const heading = parseFloat(document.getElementById('heading').value);
    const pitch = parseFloat(document.getElementById('pitch').value);
    const roll = parseFloat(document.getElementById('roll').value);

    const newTower = {
      id: `${latitude}&${longitude}`,
      latitude,
      longitude,
      height,
      assetId,
      heading,
      pitch,
      roll,
      equipments: []
    };

    // Place the tower and add it to the map
    placeTower(newTower);
    // saveTowers(newTower);
    addSignalClassificationDemo(newTower);

    // Optional: clear the form after submission
    // document.getElementById('inputForm').reset();
  });
}
