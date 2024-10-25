import { loadTowersFromJSON, setupFormSubmission } from './components/Tower';
import { viewer, dataSource } from './services/viewerInstance';
import { enableClustering, setupEventHandlers } from './services/CesiumService';
import towerData from './data/tower_data.json';
import signalData from './data/signal_data.json';
import { addSignalClassification } from './components/Antenna';

import './styles/main.css';
// Add the data source to the viewer
// viewer.dataSources.add(dataSource);

// Enable clustering and set up event handlers
enableClustering();
setupEventHandlers();

loadTowersFromJSON(towerData);
setupFormSubmission();

// // Process each signal point from the imported JSON data
// signalData.forEach(point => {
//     addSignalClassification({
//       id: point.rf_source_id,
//       longitude: point.lon,
//       latitude: point.lat,
//       signalStrength: point.rf_signal_strength_dbm,
//     });
//   });

signalData.forEach(point => {
  addSignalClassification({
    id: point.rf_source_id,
    longitude: point.x,
    latitude: point.y,
    signalStrength: point.max_rf_signal_strength_dbm,
  });
});
