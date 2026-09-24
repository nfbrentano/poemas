function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const dateString = '2026-09-23';
let maxHash = -1;
for (let i=0; i<150; i++) {
  const h = hashString(dateString + `poema-${i}`);
  if (h > maxHash) maxHash = h;
}
const newH = hashString(dateString + 'poema-novo');
console.log('Max:', maxHash, 'New:', newH, 'Will change?', newH > maxHash);
