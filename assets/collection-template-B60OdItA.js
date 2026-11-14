import{i as e,t}from"./html-DUzinkfe.js";import{c as n,h as r}from"./index-BNfYksz6.js";import{t as i}from"./favorites-DfHnCJDr.js";function a(t,n=140){if(!t)return``;let r=(t.excerpt&&t.excerpt.trim()?t.excerpt.trim():e(t.content||``)).replace(/\s+/g,` `).trim();return r?r.length<=n?r:r.slice(0,n-3).trimEnd()+`...`:``}function o({col:e,poemsList:o=[],baseUrl:s=`/`}={}){let c=`${n}/colecao/${e.slug}/`,l=[{name:`Início`,url:s},{name:`Coleções`,url:`${s}colecoes/`},{name:e.name,url:c}],u=(e.description||``).trim(),d=u?`<p class="collection-desc-large" style="margin-top: 1rem;">${t(u)}</p>`:``;return`
      <section class="collection-detail fade-in">
        <header class="collection-header">
          ${r(l)}
          <a href="${s}colecoes/" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${t(e.name)}</h1>
          <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
            ${o.length} poema${o.length===1?``:`s`}
          </p>
          ${d}
        </header>

        <div class="poems-list">
          ${(()=>{let e=i();return o.length>0?o.map(n=>{let r=n.published_at?new Date(n.published_at).getFullYear():``,i=a(n,140),o=e.has(n.slug)||n.id&&e.has(n.id)?` <span class="favorite-badge" aria-label="Poema favoritado" title="Poema favoritado">🔖</span>`:``;return`
              <article class="poem-row">
                <a href="${s}poema/${t(n.slug)}/" class="poem-row-link" data-link>
                  <div class="poem-row-main" style="flex: 1; min-width: 0;">
                    <h3 class="poem-row-title">${t(n.title)}${o}</h3>
                    ${i?`<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${t(i)}</p>`:``}
                  </div>
                  ${r?`<span class="poem-row-year">${r}</span>`:``}
                </a>
              </article>
            `}).join(``):`<p class="empty-state-desc">Nenhum poema publicado nesta coleção ainda.</p>`})()}
        </div>
      </section>
  `}export{o as n,a as t};