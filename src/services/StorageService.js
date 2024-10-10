export function loadTowers() {
  const towersData = localStorage.getItem('towers');
  return towersData ? JSON.parse(towersData) : [];
}

export function saveTowers(tower) {
  let towers = loadTowers();
  const duplicateTower = towers.find(t => t.latitude === tower.latitude && t.longitude === tower.longitude);

  if (!duplicateTower) {
    towers.push(tower);
    localStorage.setItem('towers', JSON.stringify(towers));
    console.log(`Tower with ID: ${tower.id} saved successfully.`);
  } else {
    console.log(`Duplicate tower at latitude: ${tower.latitude}, longitude: ${tower.longitude} not saved.`);
  }
}
