import html2canvas from 'html2canvas';
import '../styles/social-card.css';

export async function generateSocialCard(poem, container) {
  let displayContent = poem.excerpt;
  if (!displayContent) {
    let html = poem.content
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<\/?p>/gi, '\n');
      
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Split by newline and take the first 6 lines
    const lines = plainText.split('\n').map(l => l.trim());
    
    // Remove leading empty lines
    while(lines.length > 0 && lines[0] === '') {
      lines.shift();
    }
    
    displayContent = lines.join('\n').trim();
  }
  
  container.innerHTML = `
    <div class="social-card-layout" id="social-card-render">
      <h1 class="social-card-title">${poem.title}</h1>
      <div class="social-card-content" id="social-card-text">${displayContent}</div>
      <div class="social-card-footer">Natanael Brentano</div>
    </div>
  `;
  
  const renderEl = document.getElementById('social-card-render');
  const textEl = document.getElementById('social-card-text');
  
  // Wait a small tick to ensure fonts are applied
  await new Promise(r => setTimeout(r, 100));
  
  // Auto-resize font to fit the container (max ~650px height available for text)
  let fontSize = 2.2;
  textEl.style.fontSize = `${fontSize}rem`;
  while (textEl.scrollHeight > 650 && fontSize > 0.8) {
    fontSize -= 0.1;
    textEl.style.fontSize = `${fontSize}rem`;
  }
  
  const canvas = await html2canvas(renderEl, {
    scale: 2, // High resolution
    useCORS: true,
    backgroundColor: '#0a0a0a'
  });
  
  // Download logic
  const link = document.createElement('a');
  link.download = `poema-${poem.slug}-ig.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  // Clean up
  container.innerHTML = '';
}
