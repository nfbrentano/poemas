function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const counts = {};
let currentDate = new Date('2026-01-01T12:00:00Z');

for (let i = 0; i < 365; i++) {
  const dateString = currentDate.toISOString().slice(0, 10);
  
  let selectedPoem = null;
  let maxHash = -1;

  for (let j=0; j<150; j++) {
    const key = `poema-${j}`;
    const h = hashString(dateString + key);
    if (h > maxHash) {
      maxHash = h;
      selectedPoem = key;
    }
  }

  counts[selectedPoem] = (counts[selectedPoem] || 0) + 1;
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}

console.log('Max count:', Math.max(...Object.values(counts)));
