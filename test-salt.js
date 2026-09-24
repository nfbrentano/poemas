function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

for (let salt = 0; salt < 100; salt++) {
  const counts = {};
  let currentDate = new Date('2026-01-01T12:00:00Z');
  
  for (let i = 0; i < 365; i++) {
    const dateString = currentDate.toISOString().slice(0, 10);
    const seed = hashString(dateString + (salt === 0 ? "" : salt));
    const random = mulberry32(seed)();
    const podIndex = Math.floor(random * 150);
    counts[podIndex] = (counts[podIndex] || 0) + 1;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  const max = Math.max(...Object.values(counts));
  if (max <= 7) {
    console.log('Found salt:', salt, 'Max count:', max);
  }
}
