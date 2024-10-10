import { ScreenSpaceEventType } from 'cesium';
import { viewer, dataSource } from '../services/viewerInstance';
import { showTowerInfo, hideTowerInfo } from '../utils/CoordinateUtils'; // Assume this is a function to display tower info

export function setupEventHandlers() {
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (pickedObject && pickedObject.id.id.startsWith('pin-')) {
      const towerId = pickedObject.id.id.split('pin-')[1];
      const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
      if (towerEntity) {
        viewer.camera.flyTo({ destination: towerEntity.position.getValue(viewer.clock.currentTime), duration: 3 });
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.endPosition);
    if (pickedObject && pickedObject.id.id.startsWith('tower-')) {
      showTowerInfo(pickedObject.id.id);
    } else {
      hideTowerInfo();
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
}
