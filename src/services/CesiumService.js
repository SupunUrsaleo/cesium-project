import { defined, ClippingPolygon, Cartesian2, Cartographic, HorizontalOrigin, ClippingPolygonCollection, GeoJsonDataSource, Cartesian3, IonResource, Math as CesiumMath, HeightReference, sampleTerrainMostDetailed, Transforms, HeadingPitchRoll, PinBuilder, Color, ScreenSpaceEventType, BoundingSphere, HeadingPitchRange, VerticalOrigin } from 'cesium';
import { viewer, dataSource } from './viewerInstance';
import { saveTowers, loadTowers } from '../services/StorageService';
import { closeInfoTowerForm } from '../utils/FormUtils';

// Display and hide tower information functions
function displayTowerInfo(towerId) {
  const towerEntity = dataSource.entities.getById(towerId);
  if (towerEntity) {
    const towerInfo = document.getElementById('towerInfo');
    towerInfo.innerHTML = `
      <p style="color: white;"><strong>Latitude:</strong> ${towerEntity.position.getValue().latitude}</p>
      <p style="color: white;"><strong>Longitude:</strong> ${towerEntity.position.getValue().longitude}</p>
      <p style="color: white;"><strong>Height:</strong> ${towerEntity.position.getValue().height} m</p>
    `;
    document.getElementById('infoTowerForm').style.display = 'block';
  }
}

function hideTowerInfo() {
  document.getElementById('infoTowerForm').style.display = 'none';
}

let selectedTowerId = null;
let selectedTowerData = {};

// Function to enable clustering
export function enableClustering() {
  dataSource.clustering.enabled = true;
  dataSource.clustering.pixelRange = 50;
  dataSource.clustering.minimumClusterSize = 2;

  const pinBuilder = new PinBuilder();
  const clustersMap = new Map(); // Map to store clusters by unique IDs

  // Cluster event listener to handle cluster appearance and interaction
  dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
    // Generate a unique ID for each cluster
    const clusterId = `cluster_${Date.now()}_${Math.random()}`;
    
    // Hide default label and ensure billboard is shown
    cluster.label.show = false;
    cluster.billboard.show = true;

    // Set the cluster image to a green pin with the number of entities in it
    const towerCount = clusteredEntities.length;
    const clusterText = `${towerCount}`;
    cluster.billboard.image = pinBuilder.fromText(clusterText, Color.GREEN, 48).toDataURL();
    cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

    // Assign the unique ID to the billboard and store it in the clustersMap
    cluster.billboard.id = clusterId;
    clustersMap.set(clusterId, { entities: clusteredEntities, billboard: cluster.billboard });

  });


// Event handler for clicking on clusters and individual pins
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position);

  if (pickedObject && pickedObject.id) {
    // Get the ID of the picked object (entity)
    const entityId = typeof pickedObject.id === 'string' ? pickedObject.id : pickedObject.id.id;

    // Check if the clicked object is a cluster
    if (clustersMap.has(entityId)) {
      const clusterData = clustersMap.get(entityId);
      const positions = clusterData.entities.map(entity => entity.position.getValue(viewer.clock.currentTime));
      const boundingSphere = BoundingSphere.fromPoints(positions);
      
      viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: 3,
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45), boundingSphere.radius * 3.0)
      });
    }

    // // Check if the clicked object is an individual tower pin
    // else if (typeof entityId === 'string' && entityId.startsWith("pin_")) {
    //   // Get the position of the clicked tower pin entity
    //   const towerPosition = pickedObject.id.position.getValue(viewer.clock.currentTime);
      
    //   // Create an offset position, e.g., 500 meters to the east and 300 meters above the tower
    //   const offset = Cartesian3.fromElements(0, 0, 60);
    //   const destination = Cartesian3.add(towerPosition, offset, new Cartesian3());
      
    //   // Fly the camera to the offset position
    //   viewer.camera.flyTo({
    //     destination: destination,
    //     duration: 2,
    //     offset: new HeadingPitchRange(0, CesiumMath.toRadians(-30), 300.0) // Adjust pitch and range as needed
    //   });
    // }
  }
}, ScreenSpaceEventType.LEFT_CLICK);


  // viewer.dataSources.add(dataSource); // Ensure dataSource is added to the viewer
}


// Function to set up event handlers for towers
// Function to set up event handlers for towers and clusters
export function setupEventHandlers() {
  document.getElementById("closeBtn").onclick = closeInfoTowerForm;

  // Add event listener for delete button
  document.getElementById('deleteTowerBtn').addEventListener('click', () => {
    if (selectedTowerId) {
      deleteTowerFromLocalStorage(selectedTowerId);
    }
  });

  // MOUSE_MOVE event for hover effect to show latitude and longitude in HTML overlay
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    const cartesian = viewer.scene.pickPosition(movement.endPosition);
    const overlay = document.getElementById('coordinatesOverlay');
    const coordinatesText = document.getElementById('coordinatesText');

    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian);
      const longitude = CesiumMath.toDegrees(cartographic.longitude).toFixed(10);
      const latitude = CesiumMath.toDegrees(cartographic.latitude).toFixed(10);
      const height = CesiumMath.toDegrees(cartographic.height).toFixed(10)

      coordinatesText.innerText = `Lat: ${latitude}°\nLon: ${longitude}°\nHeight: ${height}`;

      // Update the overlay position near the mouse
      overlay.style.left = `${movement.endPosition.x + 10}px`;
      overlay.style.top = `${movement.endPosition.y + 10}px`;
      overlay.style.display = 'block';  // Show the overlay
    } else {
      overlay.style.display = 'none';  // Hide overlay if no position is found
    }

    // Existing tower hover logic remains unchanged
    const pickedObject = viewer.scene.pick(movement.endPosition);
    if (pickedObject && pickedObject.id && pickedObject.id.id) {
      const pickedId = pickedObject.id.id;

      if (pickedId.startsWith('pin_')) {
        const towerId = pickedId.split('pin_')[1];
        const towerEntity = dataSource.entities.getById(`tower_${towerId}`);
        
        if (towerEntity) {
          // Here you could implement camera flyTo functionality if needed
        } else {
          console.error(`Tower entity with ID tower_${towerId} not found.`);
        }
      } else if (pickedId.startsWith('tower_')) {
        selectedTowerId = pickedId.split('_')[1];
        const towers = loadTowers();
        selectedTowerData = towers.find(tower => tower.id.startsWith(selectedTowerId));

        console.log("Selected Tower ID:", selectedTowerId);
  
        if (selectedTowerData) {
          document.getElementById('towerInfo').innerHTML = `
            <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
            <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
            <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
          `;
          document.getElementById('infoTowerForm').style.display = 'block';
        } else {
          console.warn("No data found for the selected tower ID:", selectedTowerId);
          document.getElementById('towerInfo').innerHTML = `
          <p style="color: white;"><strong>This is a demo Tower</strong></p>
        `;
          document.getElementById('infoTowerForm').style.display = 'block';
        }
      }
    } else {
      document.getElementById('infoTowerForm').style.display = 'none';
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
}

// Function to add a tower entity to the dataSource and hide existing area elements
export async function placeTower(tower, globalTileset) {
  // Remove the height from the position to let it be clamped to terrain
  const position = Cartesian3.fromDegrees(tower.longitude, tower.latitude); // Removed tower.height to clamp to ground
  
  const orientation = Transforms.headingPitchRollQuaternion(
    position,
    new HeadingPitchRoll(CesiumMath.toRadians(tower.heading), CesiumMath.toRadians(tower.pitch), CesiumMath.toRadians(tower.roll))
  );

  const towerEntityId = `tower_${tower.id}`;
  const towerUri = await IonResource.fromAssetId(tower.assetId);
  const pinBuilder = new PinBuilder();
  const pin = pinBuilder.fromText("T", Color.BLUE, 48).toDataURL();

  // Load a GeoJSON file defining the footprint for the area to be clipped
  let footprint;
  try {
    const resource = await IonResource.fromAssetId(2810160);
    const dataSource = await GeoJsonDataSource.load(resource, { clampToGround: true });

    viewer.dataSources.add(dataSource);

    // Find the footprint entity with a polygon and hide it
    footprint = dataSource.entities.values.find((entity) => defined(entity.polygon));
    if (footprint) {
      footprint.polygon.outline = false;
      footprint.show = false; // Hide the footprint visualization

      // Extract positions from the footprint polygon and create a clipping polygon
      const positions = footprint.polygon.hierarchy.getValue().positions;
      const clippingPolygons = new ClippingPolygonCollection({
        polygons: [
          new ClippingPolygon({
            positions: positions,
          }),
        ],
      });

      // Apply the clipping polygon to the global tileset (e.g., photorealistic 3D tiles)
      globalTileset.clippingPolygons = clippingPolygons;
    }

    // Zoom to the footprint area with a custom camera offset
    const cameraOffset = new HeadingPitchRange(
      CesiumMath.toRadians(95.0),
      CesiumMath.toRadians(-18.0),
      600.0
    );
    viewer.zoomTo(footprint, cameraOffset);

    // Update the home view to zoom to the footprint area
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
      e.cancel = true;
      viewer.zoomTo(footprint, cameraOffset);
    });
  } catch (error) {
    console.log(`Error loading GeoJSON footprint: ${error}`);
  }

  // Add the tower model and clamp to ground
  dataSource.entities.add({
    id: towerEntityId,
    position: position,
    model: { 
      uri: towerUri,
      heightReference: HeightReference.CLAMP_TO_GROUND, // Clamp tower to the ground
    },
    orientation: orientation,
  });

  // Add the pin, also clamped to the ground
  dataSource.entities.add({
    id: `pin_${tower.id}`,
    position: position,
    billboard: {
      image: pin,
      verticalOrigin: VerticalOrigin.BOTTOM,
      heightReference: HeightReference.CLAMP_TO_GROUND, // Clamp pin to the ground
    }
  });
}


// Function to add equipment to the map
export async function placeEquipment(assetId, position, height, tilt) {
  const equipmentUri = await IonResource.fromAssetId(assetId);
  const orientation = Transforms.headingPitchRollQuaternion(
    Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    new HeadingPitchRoll(CesiumMath.toRadians(0), CesiumMath.toRadians(tilt), 0)
  );

  viewer.entities.add({
    position: Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    model: { uri: equipmentUri },
    orientation: orientation
  });
}

function deleteTowerFromLocalStorage(towerId) {
  const towerEntityId = `tower_${towerId}`;
  const pinEntityId = `pin_${towerId}`;
  const signalEntityId = `signal_${towerId}`;

  console.log(`Attempting to delete entities with IDs: ${towerEntityId}, ${pinEntityId}, and ${signalEntityId}`);
  
  // Remove entities from dataSource and viewer
  const towerRemoved = dataSource.entities.removeById(towerEntityId);
  const pinRemoved = dataSource.entities.removeById(pinEntityId);
  const signalRemoved = viewer.entities.removeById(signalEntityId);

  if (!towerRemoved) {
    console.warn(`No tower entity found with ID: ${towerEntityId}`);
  }
  if (!pinRemoved) {
    console.warn(`No pin entity found with ID: ${pinEntityId}`);
  }
  if (!signalRemoved) {
    console.warn(`No signal entity found with ID: ${signalEntityId}`);
  }

  // Clear the selected tower and hide the info panel
  if (towerRemoved || pinRemoved || signalRemoved) {
    document.getElementById('infoTowerForm').style.display = 'none';
    selectedTowerId = null;
    console.log(`Deleted entities with IDs: ${towerEntityId}, ${pinEntityId}, and ${signalEntityId}`);
  }
}

