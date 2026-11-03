import { formatTag, slugifyTag } from '../utils/tags.js';

export const customSentiments = {
  'abraco': {
    name: 'Abraço',
    intro: 'Poemas sobre o calor do encontro, o refúgio silencioso nos braços de quem se ama e o gesto que acolhe sem precisar de palavras.'
  },
  'afeto': {
    name: 'Afeto',
    intro: 'Versos dedicados à ternura cotidiana, aos laços invisíveis que aproximam corações e à delicadeza de demonstrar presença e bem-querer.'
  },
  'alegria': {
    name: 'Alegria',
    intro: 'Poemas que celebram o entusiasmo de viver, a leveza dos instantes felizes e o brilho espontâneo que nasce nos dias de sol interior.'
  },
  'alma': {
    name: 'Alma',
    intro: 'Poemas que sondam o íntimo, as veredas do espírito e a verdade nua de quem se permite sentir com profundidade.'
  },
  'amar': {
    name: 'Amar',
    intro: 'Reflexões poéticas sobre o verbo amar como ação contínua, escolha diária, entrega consciente e construção compartilhada.'
  },
  'amor': {
    name: 'Amor',
    intro: 'Poemas que exploram as nuances do amor, da paixão ardente ao afeto sereno, da entrega ao desvelo silencioso de amar.'
  },
  'amor-proprio': {
    name: 'Amor-Próprio',
    intro: 'Versos sobre o acolhimento de si, a reconstrução da autoestima e a coragem de ser quem verdadeiramente se é.'
  },
  'apoio': {
    name: 'Apoio',
    intro: 'Poemas sobre amparo mútuo, mãos estendidas nas travessias difíceis e a força tranquila de caminhar ao lado de alguém.'
  },
  'aprendizado': {
    name: 'Aprendizado',
    intro: 'Versos sobre as lições que o tempo ensina, a maturidade conquistada nas quedas e a sabedoria colhida em cada experiência.'
  },
  'atitude': {
    name: 'Atitude',
    intro: 'Poemas sobre iniciativa, presença ativa diante da vida e a decisão de transformar intenção em gesto concreto.'
  },
  'axe': {
    name: 'Axé',
    intro: 'Versos atravessados pela ancestralidade, pela força sagrada dos caminhos, pela espiritualidade viva e pelas bênçãos de movimento e luz.'
  },
  'beijo': {
    name: 'Beijo',
    intro: 'Poemas sobre o instante suspenso do toque, o encontro de dois mundos num sopro de afeto e a linguagem silenciosa do desejo.'
  },
  'carinho': {
    name: 'Carinho',
    intro: 'Versos tecidos com suavidade sobre o cuidado nos detalhes, o toque afetuoso e a doçura que acalma os dias turbulentos.'
  },
  'ciclos': {
    name: 'Ciclos',
    intro: 'Reflexões poéticas sobre fases que se encerram e se renovam, as estações da existência e a beleza natural das transformações.'
  },
  'compromisso': {
    name: 'Compromisso',
    intro: 'Poemas sobre lealdade, constância afetiva e a escolha firme de permanecer e construir pontes duradouras.'
  },
  'comunicacao': {
    name: 'Comunicação',
    intro: 'Versos sobre a ponte entre o que se sente e o que se diz, a escuta verdadeira e os diálogos que aproximam almas.'
  },
  'conexao': {
    name: 'Conexão',
    intro: 'Poemas sobre sintonia rara, encontros que parecem reconhecer-se desde sempre e os fios invisíveis que unem duas vidas.'
  },
  'confianca': {
    name: 'Confiança',
    intro: 'Versos sobre entregar-se sem reservas, construir segurança no olhar do outro e repousar o coração em solo firme.'
  },
  'coracao': {
    name: 'Coração',
    intro: 'Poemas centrados no pulsar das emoções, nos segredos guardados no peito e na bússola afetiva que guia nossas escolhas.'
  },
  'coragem': {
    name: 'Coragem',
    intro: 'Versos sobre enfrentar o desconhecido, atravessar tempestades de peito aberto e ousar recomeçar apesar do medo.'
  },
  'cuidado': {
    name: 'Cuidado',
    intro: 'Poemas sobre zelo, atenção genuína ao outro e ao próprio ser, e a arte de cultivar o que é essencial.'
  },
  'dani': {
    name: 'Dani',
    intro: 'Poemas e dedicatórias inspirados na presença, na parceria, no encanto e nas memórias compartilhadas com Dani.'
  },
  'desejo': {
    name: 'Desejo',
    intro: 'Versos sobre a chama que impulsiona o encontro, a intensidade do querer e a pulsão viva que habita a pele e o pensamento.'
  },
  'dor': {
    name: 'Dor',
    intro: 'Poemas que dão voz ao sofrimento humano, às feridas íntimas da alma e à superação que brota da resiliência.'
  },
  'emocao': {
    name: 'Emoção',
    intro: 'Versos sobre o transbordar do sentir, o arrepio diante da beleza e a intensidade de viver cada instante à flor da pele.'
  },
  'emocoes': {
    name: 'Emoções',
    intro: 'Poemas que percorrem o caleidoscópio dos afetos humanos, acolhendo tanto a calmaria quanto as marés internas.'
  },
  'energia': {
    name: 'Energia',
    intro: 'Versos sobre vibração vital, troca de forças, magnetismo entre seres e o vigor que renova o espírito.'
  },
  'equilibrio': {
    name: 'Equilíbrio',
    intro: 'Poemas sobre a harmonia entre razão e sensibilidade, o centro sereno em meio ao caos e a temperança do caminhar.'
  },
  'escolhas': {
    name: 'Escolhas',
    intro: 'Reflexões poéticas sobre encruzilhadas da vida, renúncias necessárias e a liberdade de traçar o próprio destino.'
  },
  'espera': {
    name: 'Espera',
    intro: 'Versos sobre paciência, maturação do tempo, saudade contida na janela e a preparação silenciosa para o que há de vir.'
  },
  'esperanca': {
    name: 'Esperança',
    intro: 'Versos de renovação, fé no amanhã e a luz serena que persiste mesmo nas noites mais escuras e invernos da vida.'
  },
  'essencia': {
    name: 'Essência',
    intro: 'Poemas sobre o que permanece quando as aparências silenciam: a raiz autêntica, a identidade profunda e a verdade interior.'
  },
  'familia': {
    name: 'Família',
    intro: 'Versos sobre raízes, pertencimento, laços de sangue e de afeto, e o porto seguro construído entre gerações.'
  },
  'fe': {
    name: 'Fé',
    intro: 'Poemas sobre espiritualidade, confiança no invisível, devoção e a força interior que sustenta os passos na caminhada.'
  },
  'felicidade': {
    name: 'Felicidade',
    intro: 'Versos sobre a plenitude encontrada nas coisas simples, a gratidão pelo agora e a alegria compartilhada.'
  },
  'filha': {
    name: 'Filha',
    intro: 'Poemas dedicados ao amor paterno e familiar, à ternura de ver crescer e ao legado de afeto e proteção para a filha.'
  },
  'futuro': {
    name: 'Futuro',
    intro: 'Reflexões poéticas sobre o amanhã, os horizontes em aberto, as sementes plantadas no presente e as promessas do tempo.'
  },
  'harmonia': {
    name: 'Harmonia',
    intro: 'Versos sobre consonância interior, paz compartilhada e a sintonia delicada entre o ser, o outro e o mundo.'
  },
  'lar': {
    name: 'Lar',
    intro: 'Poemas sobre o espaço de acolhimento, o abrigo que mora no abraço de quem amamos e a paz de sentir-se em casa.'
  },
  'luz': {
    name: 'Luz',
    intro: 'Versos sobre clareza espiritual, despertar da consciência e os raios de esperança que dissipam as sombras internas.'
  },
  'mae': {
    name: 'Mãe',
    intro: 'Poemas de homenagem e gratidão ao amor materno, ao colo primordial, à sabedoria e à dedicação incondicional.'
  },
  'medo': {
    name: 'Medo',
    intro: 'Poemas que encaram as incertezas, a vulnerabilidade diante do abismo e a travessia rumo à superação dos próprios receios.'
  },
  'melodia': {
    name: 'Melodia',
    intro: 'Versos marcados pela musicalidade da alma, pelo ritmo das palavras e pela canção silenciosa que embala as memórias.'
  },
  'mente': {
    name: 'Mente',
    intro: 'Poemas sobre o universo dos pensamentos, os labirintos da consciência, a imaginação e a busca por serenidade mental.'
  },
  'morte': {
    name: 'Morte',
    intro: 'Meditações profundas sobre a finitude, a despedida, o mistério do fim e a eternidade daquilo que foi sentido.'
  },
  'mudanca': {
    name: 'Mudança',
    intro: 'Versos sobre metamorfose, desapego do que já foi e a coragem de reinventar-se a cada nova etapa da caminhada.'
  },
  'noite': {
    name: 'Noite',
    intro: 'Poemas nascidos no silêncio noturno, entre estrelas, insônias criativas, confidências e contemplação da madrugada.'
  },
  'nostalgia': {
    name: 'Nostalgia',
    intro: 'Retratos poéticos do passado, memórias de infância, aromas esquecidos e lugares guardados com ternura no coração.'
  },
  'olhos': {
    name: 'Olhos',
    intro: 'Versos sobre o espelho da alma, a verdade revelada num olhar e os diálogos silenciosos que acontecem sem uma única palavra.'
  },
  'oracao': {
    name: 'Oração',
    intro: 'Poemas em forma de prece, súplica e gratidão, conectando o coração humano ao sagrado e às forças da natureza.'
  },
  'pai': {
    name: 'Pai',
    intro: 'Versos sobre paternidade, presença protetora, ensinamentos de vida e o amor profundo que guia e acompanha.'
  },
  'paixao': {
    name: 'Paixão',
    intro: 'Poemas sobre o encantamento arrebatador, o fogo dos encontros intensos e a entrega vibrante aos sentimentos.'
  },
  'palavras': {
    name: 'Palavras',
    intro: 'Metapoesia e reflexões sobre o poder do verbo, a escrita como refúgio e o esforço de traduzir o indizível em verso.'
  },
  'paz': {
    name: 'Paz',
    intro: 'Versos de quietude e serenidade, o repouso das tempestades internas e a busca pelo equilíbrio do espírito.'
  },
  'pensamento': {
    name: 'Pensamento',
    intro: 'Poemas contemplativos sobre a reflexão íntima, o fluxo das ideias e o diálogo silencioso consigo mesmo.'
  },
  'pensamentos': {
    name: 'Pensamentos',
    intro: 'Versos que reúnem devaneios, inquietações filosóficas e observações líricas sobre o cotidiano e o existir.'
  },
  'perdao': {
    name: 'Perdão',
    intro: 'Poemas sobre reconciliação, libertação de mágoas antigas e a leveza de curar feridas para seguir adiante em paz.'
  },
  'presenca': {
    name: 'Presença',
    intro: 'Versos sobre estar inteiro no agora, o valor insubstituível da companhia verdadeira e a atenção plena ao momento.'
  },
  'protecao': {
    name: 'Proteção',
    intro: 'Poemas sobre amparo, guarda espiritual e afetiva, e o desejo de preservar aquilo que é sagrado e querido.'
  },
  'querer': {
    name: 'Querer',
    intro: 'Versos sobre vontade, afeto escolhido e o movimento espontâneo do coração em direção ao que faz sentido.'
  },
  'realidade': {
    name: 'Realidade',
    intro: 'Poemas que enxergam a beleza concreta do mundo real, o despertar das ilusões e a poesia presente na vida como ela é.'
  },
  'reciprocidade': {
    name: 'Reciprocidade',
    intro: 'Versos sobre o equilíbrio do afeto compartilhado, o encontro de duas entregas e a harmonia de amar e ser amado.'
  },
  'recomeco': {
    name: 'Recomeço',
    intro: 'Poemas sobre abrir novas páginas, reconstruir sonhos sobre bases mais maduras e celebrar cada nova aurora.'
  },
  'reflexao': {
    name: 'Reflexão',
    intro: 'Versos meditativos sobre o sentido da existência, o autoconhecimento e as perguntas que nos fazem crescer.'
  },
  'resiliencia': {
    name: 'Resiliência',
    intro: 'Poemas sobre a capacidade de florescer após o inverno, reconstruir-se das adversidades e manter a ternura intacta.'
  },
  'saudade': {
    name: 'Saudade',
    intro: 'Versos sobre a presença da ausência, as lembranças que ecoam no tempo e o carinho por aquilo que ficou na memória.'
  },
  'seguranca': {
    name: 'Segurança',
    intro: 'Poemas sobre porto seguro, estabilidade emocional e a tranquilidade de habitar um afeto sem sobressaltos.'
  },
  'sentimento': {
    name: 'Sentimento',
    intro: 'Versos dedicados à essência do sentir humano, à sensibilidade poética e à verdade que pulsa em cada emoção.'
  },
  'sentimentos': {
    name: 'Sentimentos',
    intro: 'Poemas que entrelaçam múltiplas camadas afetivas, revelando a complexidade e a riqueza da vida interior.'
  },
  'silencio': {
    name: 'Silêncio',
    intro: 'Poemas sobre a eloquência da pausa, a escuta interior e tudo aquilo que só se compreende quando o ruído cessa.'
  },
  'sinceridade': {
    name: 'Sinceridade',
    intro: 'Versos sobre transparência da alma, palavra honesta e a coragem de apresentar-se sem máscaras diante do outro.'
  },
  'sol': {
    name: 'Sol',
    intro: 'Poemas solares sobre calor humano, alvoradas que renovam o ânimo e a claridade que ilumina os dias e os afetos.'
  },
  'solidao': {
    name: 'Solidão',
    intro: 'Poemas sobre o recolhimento, o silêncio interior, o deserto da alma e o encontro consigo mesmo nas horas solitárias.'
  },
  'sonhos': {
    name: 'Sonhos',
    intro: 'Versos sobre ideais, horizontes imaginados, utopias íntimas e a força criadora que mantém viva a esperança.'
  },
  'sorriso': {
    name: 'Sorriso',
    intro: 'Poemas sobre a curva mais luminosa do rosto, a alegria compartilhada num instante e o gesto que desarma distâncias.'
  },
  'superacao': {
    name: 'Superação',
    intro: 'Versos sobre vencer limites internos, atravessar fases difíceis com dignidade e descobrir a própria força.'
  },
  'tempo': {
    name: 'Tempo',
    intro: 'Reflexões poéticas sobre as horas que passam, a brevidade dos instantes e o ritmo inexorável da existência humana.'
  },
  'tristeza': {
    name: 'Tristeza',
    intro: 'Versos sobre o peso da melancolia, os dias cinzentos e a beleza sutil que habita na vulnerabilidade dos sentimentos.'
  },
  'vazio': {
    name: 'Vazio',
    intro: 'Poemas que contemplam as lacunas da existência, o espaço deixado pelas ausências e o silêncio fértil de onde brota o novo.'
  },
  'verdade': {
    name: 'Verdade',
    intro: 'Versos sobre autenticidade, clareza ética e afetiva, e o compromisso com o que é genuíno na vida e na arte.'
  },
  'vida': {
    name: 'Vida',
    intro: 'Poemas sobre o pulsar da existência, as pequenas descobertas cotidianas e o milagre efêmero de estar vivo.'
  },
  'viver': {
    name: 'Viver',
    intro: 'Versos sobre a arte de experimentar o presente por inteiro, celebrar a caminhada e transformar o cotidiano em poesia.'
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
  return `Antologia de poemas autorais sobre ${formattedName.toLowerCase()}, reunindo versos e reflexões da poesia contemporânea de Natanael Fernando Gatti Brentano sobre as nuances desse tema na experiência humana.`;
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
