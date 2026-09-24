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
  const seed = hashString(dateString);
  const podIndex = seed % 150;
  counts[podIndex] = (counts[podIndex] || 0) + 1;
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}

const max = Math.max(...Object.values(counts));
console.log('Max count without PRNG:', max);
