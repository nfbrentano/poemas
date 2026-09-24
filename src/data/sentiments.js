import { formatTag, slugifyTag } from '../utils/tags.js';

export const customSentiments = {
  'amor': {
    name: 'Amor',
    intro: 'Poemas que exploram as nuances do amor, da paixão ardente ao afeto sereno, da entrega ao desvelo silencioso de amar.'
  },
  'saudade': {
    name: 'Saudade',
    intro: 'Versos sobre a presença da ausência, as lembranças que ecoam no tempo e o carinho por aquilo que ficou na memória.'
  },
  'tempo': {
    name: 'Tempo',
    intro: 'Reflexões poéticas sobre as horas que passam, a brevidade dos instantes e o ritmo inexorável da existência humana.'
  },
  'solidao': {
    name: 'Solidão',
    intro: 'Poemas sobre o recolhimento, o silêncio interior, o deserto da alma e o encontro consigo mesmo nas horas solitárias.'
  },
  'esperanca': {
    name: 'Esperança',
    intro: 'Versos de renovação, fé no amanhã e a luz serena que persiste mesmo nas noites mais escuras e invernos da vida.'
  },
  'dor': {
    name: 'Dor',
    intro: 'Poemas que dão voz ao sofrimento humano, às feridas íntimas da alma e à superação que brota da resiliência.'
  },
  'nostalgia': {
    name: 'Nostalgia',
    intro: 'Retratos poéticos do passado, memórias de infância, aromas esquecidos e lugares guardados com ternura no coração.'
  },
  'paz': {
    name: 'Paz',
    intro: 'Versos de quietude e serenidade, o repouso das tempestades internas e a busca pelo equilíbrio do espírito.'
  },
  'vida': {
    name: 'Vida',
    intro: 'Poemas sobre o pulsar da existência, as pequenas descobertas cotidianas e o milagre efêmero de estar vivo.'
  },
  'morte': {
    name: 'Morte',
    intro: 'Meditações profundas sobre a finitude, a despedida, o mistério do fim e a eternidade daquilo que foi sentido.'
  },
  'tristeza': {
    name: 'Tristeza',
    intro: 'Versos sobre o peso da melancolia, os dias cinzentos e a beleza sutil que habita na vulnerabilidade dos sentimentos.'
  },
  'alma': {
    name: 'Alma',
    intro: 'Poemas que sondam o íntimo, as veredas do espírito e a verdade nua de quem se permite sentir com profundidade.'
  },
  'amor-proprio': {
    name: 'Amor-Próprio',
    intro: 'Versos sobre o acolhimento de si, a reconstrução da autoestima e a coragem de ser quem verdadeiramente se é.'
  }
};

/**
 * Returns the introductory text for a sentiment.
 * @param {string} name
 * @param {string} slug
 * @returns {string}
 */
export function getSentimentIntro(name, slug) {
  const cleanSlug = slugifyTag(slug || name);
  if (customSentiments[cleanSlug]?.intro) {
    return customSentiments[cleanSlug].intro;
  }
  const formattedName = name || getSentimentName(cleanSlug);
  return `Uma seleção de poemas e versos contemporâneos sobre ${formattedName.toLowerCase()}, explorando emoções, reflexões e vivências através da poesia de Natanael Brentano.`;
}

/**
 * Returns the display name for a sentiment slug.
 * @param {string} slug
 * @param {string} [fallback]
 * @returns {string}
 */
export function getSentimentName(slug, fallback = '') {
  const cleanSlug = slugifyTag(slug);
  if (customSentiments[cleanSlug]?.name) {
    return customSentiments[cleanSlug].name;
  }
  return fallback ? formatTag(fallback) : formatTag(cleanSlug);
}
