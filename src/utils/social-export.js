import { snapdom } from '@zumer/snapdom';
import '../styles/social-card.css';

export async function generateSocialCard(poem, container, theme = 'dark', customText = null, aspectRatio = 'feed') {
  let displayContent = customText || poem.excerpt;
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

  // If it's a quote, format the quote styling with quotes around it
  if (customText) {
    displayContent = `“ ${displayContent} ”`;
  }
  
  const titleColors = {
    dark: '#c5a880',
    light: '#967d54',
    sepia: '#6e502c'
  };
  const titleColor = titleColors[theme] || '#c5a880';
  const displayTitle = (customText ? `De “${poem.title}”` : poem.title) || 'Poema';
  
  container.innerHTML = `
    <div class="social-card-layout theme-${theme} ratio-${aspectRatio}" id="social-card-render">
      <h1 class="social-card-title" style="color: ${titleColor};">${displayTitle}</h1>
      <div class="social-card-content" id="social-card-text" style="${customText ? 'font-style: italic;' : ''}">${displayContent}</div>
      <div class="social-card-footer">
        <div class="card-author">Natanael Brentano</div>
        <div class="card-meta">@nfgbrentano &nbsp;•&nbsp; nfbrentano.github.io/poemas</div>
      </div>
    </div>
  `;
  
  const renderEl = document.getElementById('social-card-render');
  const textEl = document.getElementById('social-card-text');
  
  // Wait a small tick to ensure fonts are applied
  await new Promise(r => setTimeout(r, 100));
  
  // Auto-resize font to fit the container (max height available for text: ~850px for 4:5, ~1350px for 9:16)
  const maxContentHeight = aspectRatio === 'stories' ? 1300 : 850;
  let fontSize = aspectRatio === 'stories' ? 45 : 40; // Use px instead of rem to avoid isolated SVG rendering issues
  textEl.style.fontSize = `${fontSize}px`;
  while (textEl.scrollHeight > maxContentHeight && fontSize > 14) {
    fontSize -= 1.5;
    textEl.style.fontSize = `${fontSize}px`;
  }

  const bgColors = {
    dark: '#050505',
    light: '#fdfdfd',
    sepia: '#eae0c7'
  };
  
  const blob = await snapdom.toBlob(renderEl, {
    type: 'png',
    scale: 2
  });
  
  // Download logic
  const filename = customText ? `citacao-${poem.slug}-${theme}-${aspectRatio}.png` : `poema-${poem.slug}-${theme}-${aspectRatio}.png`;
  const link = document.createElement('a');
  link.download = filename;
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  
  // Clean up
  container.innerHTML = '';
}
