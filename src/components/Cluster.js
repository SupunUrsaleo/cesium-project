import { CesiumService } from '../services/CesiumService';

export const Cluster = {
  enableClustering(dataSource, clusterOptions) {
    CesiumService.addClustering(dataSource, clusterOptions);
  }
};
