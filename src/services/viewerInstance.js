import { Viewer, CustomDataSource, Terrain, Ion, createGooglePhotorealistic3DTileset } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { createOsmBuildingsAsync } from 'cesium'


window.CESIUM_BASE_URL = '/Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize viewer without terrain
export const viewer = new Viewer('cesiumContainer', {
  timeline: false,
  animation: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  globe: false,  // Disable the default globe to avoid conflicts with Google Photorealistic 3D Tiles
});

// Add a Custom Data Source for towers
export const dataSource = new CustomDataSource("towers");
viewer.dataSources.add(dataSource);

// Function to load Google Photorealistic 3D Tiles
async function loadGooglePhotorealistic3D() {
  try {
    // Load Google Photorealistic 3D Tiles
    const google3DTiles = await createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(google3DTiles);
  } catch (error) {
    console.error("Error loading Google Photorealistic 3D Tiles:", error);
  }
}

// Call function to load the 3D tiles
loadGooglePhotorealistic3D();
