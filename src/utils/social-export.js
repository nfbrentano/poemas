import { snapdom } from '@zumer/snapdom';
import { stripHtml } from './html.js';
import '../styles/social-card.css';

export async function generateSocialCard(poem, container, theme = 'dark', customText = null, aspectRatio = 'feed') {
  let displayContent = customText;
  if (!displayContent) {
    const plainText = stripHtml(poem.content || '');
    
    // Split by newline and take the lines
    const lines = plainText.split('\n').map(l => l.trim());
    
    // Remove leading empty lines
    while (lines.length > 0 && lines[0] === '') {
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
  
  container.replaceChildren();

  const renderEl = document.createElement('div');
  renderEl.className = `social-card-layout theme-${theme} ratio-${aspectRatio}`;
  renderEl.id = 'social-card-render';

  const titleEl = document.createElement('h1');
  titleEl.className = 'social-card-title';
  titleEl.style.color = titleColor;
  titleEl.textContent = displayTitle;

  const textEl = document.createElement('div');
  textEl.className = 'social-card-content';
  textEl.id = 'social-card-text';
  if (customText) {
    textEl.style.fontStyle = 'italic';
  }
  textEl.textContent = displayContent;

  const footerEl = document.createElement('div');
  footerEl.className = 'social-card-footer';

  const authorEl = document.createElement('div');
  authorEl.className = 'card-author';
  authorEl.textContent = 'Natanael Brentano';

  footerEl.appendChild(authorEl);
  renderEl.appendChild(titleEl);
  renderEl.appendChild(textEl);
  renderEl.appendChild(footerEl);
  container.appendChild(renderEl);
  
  // Wait a small tick to ensure fonts are applied
  await new Promise(r => setTimeout(r, 100));
  
  // Auto-resize font to fit the container (max height available for text: ~850px for 4:5, ~1000px for 15x21, ~1100px for 10x15, ~1300px for 9:16)
  const maxContentHeight = aspectRatio === 'stories' ? 1300 : (aspectRatio === '10x15' ? 1100 : (aspectRatio === '15x21' ? 1000 : 850));
  let fontSize = aspectRatio === 'stories' ? 45 : (aspectRatio === '10x15' ? 42 : (aspectRatio === '15x21' ? 42 : 40)); // Use px instead of rem to avoid isolated SVG rendering issues
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
  container.replaceChildren();
}
