import { loadTowersFromJSON, setupFormSubmission } from './components/Tower';
import { viewer, dataSource } from './services/viewerInstance';
import { enableClustering, setupEventHandlers } from './services/CesiumService';
import towerData from './data/tower_data.json';

import './styles/main.css';
// Add the data source to the viewer
// viewer.dataSources.add(dataSource);

// Enable clustering and set up event handlers
enableClustering();
setupEventHandlers();

loadTowersFromJSON(towerData);
setupFormSubmission();

