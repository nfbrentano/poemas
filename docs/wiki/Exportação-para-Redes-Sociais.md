# 🎨 Exportação para Redes Sociais

O projeto inclui uma funcionalidade para gerar imagens prontas para compartilhamento em redes sociais (Instagram, WhatsApp, etc.) diretamente no navegador.

## Como Funciona

No painel Admin, ao gerenciar um poema, o recurso **"Exportar p/ Instagram"** utiliza a biblioteca `@zumer/snapdom` para capturar o poema como uma imagem PNG de alta resolução.

### Fluxo

1. O poema é renderizado em um elemento HTML com estilos CSS específicos (`social-card.css`)
2. As fontes são aplicadas e o texto é auto-redimensionado para caber no container
3. O `snapdom` converte o elemento para um **Blob** (PNG com `scale: 2` para retina)
4. O download é disparado automaticamente via `<a download>`

### Código

```javascript
import { snapdom } from '@zumer/snapdom';

const blob = await snapdom.toBlob(renderEl, {
  type: 'png',
  scale: 2  // 2x para displays retina
});
```

## Temas Disponíveis

As imagens podem ser geradas em 3 temas:

| Tema | Fundo | Texto | Cor do Título |
|------|-------|-------|---------------|
| **Dark** | `#050505` | `#e2e2e2` | `#c5a880` (Champagne) |
| **Light** | `#fdfdfd` | - | `#967d54` |
| **Sepia** | `#eae0c7` | - | `#6e502c` |

## Formatos (Aspect Ratios)

| Formato | Ideal Para |
|---------|-----------|
| `feed` (4:5) | Posts do Instagram Feed |
| `stories` (9:16) | Instagram Stories, Reels |
| `10x15` | Impressão 10×15cm |
| `15x21` | Impressão 15×21cm |

## Auto-redimensionamento de Fonte

O texto do poema é automaticamente redimensionado para caber no container:

```javascript
const maxContentHeight = aspectRatio === 'stories' ? 1300 : 850;
let fontSize = 40; // px
while (textEl.scrollHeight > maxContentHeight && fontSize > 14) {
  fontSize -= 1.5;
  textEl.style.fontSize = `${fontSize}px`;
}
```

## Modos de Exportação

1. **Poema completo** — Exporta o poema inteiro com título e assinatura
2. **Citação** — Exporta um trecho selecionado com aspas e referência ao poema de origem

### Nomeação de Arquivos

```
poema-<slug>-<tema>-<ratio>.png     # Poema completo
citacao-<slug>-<tema>-<ratio>.png   # Citação
```

Exemplo: `poema-primeiro-verso-dark-feed.png`
