import{a as e,t}from"./html-DUzinkfe.js";import{n,s as r,x as i}from"./index-BNfYksz6.js";import{n as a,s as o}from"./data-BxfxRve7.js";import{t as s}from"./debounce-C89F3TY9.js";var c={published:`publish`,draft:`draft`,scheduled:`future`},l=`<!-- wp:verse {"textAlign":"center"} -->
<pre class="wp-block-verse has-text-align-center">`,u=`</pre>
<!-- /wp:verse -->`,d=`<?xml version="1.0" encoding="UTF-8" ?>
<!-- This is a WordPress eXtended RSS file generated as an export of the poems from this site. -->
<!-- It follows the same format as the WordPress export (WXR 1.2). -->
<!-- You may use this file as a backup or to transfer the poems to a WordPress site. -->

<!-- To import this information into a WordPress site follow these steps: -->
<!-- 1. Log in to that site as an administrator. -->
<!-- 2. Go to Tools: Import in the WordPress admin panel. -->
<!-- 3. Install the "WordPress" importer from the list. -->
<!-- 4. Activate & Run Importer. -->
<!-- 5. Upload this file using the form provided on that page. -->
<!-- 6. You will first be asked to map the authors in this export file to users -->
<!--    on the site. For each author, you may choose to map to an -->
<!--    existing user on the site or to create a new user. -->
<!-- 7. WordPress will then import each of the posts, pages, comments, categories, etc. -->
<!--    contained in this file into your site. -->
`,f={id:98882272,login:`nataroots`,email:`natanaelfernando@outlook.com`,displayName:`Natanael`,firstName:`Natanael Fernando`,lastName:`Gatti Brentano`};function p(e){return`<![CDATA[${String(e??``).replace(/\]\]>/g,`]]]]><![CDATA[>`)}]]>`}function m(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var h=e=>String(e).padStart(2,`0`);function g(e){return`${e.getUTCFullYear()}-${h(e.getUTCMonth()+1)}-${h(e.getUTCDate())} ${h(e.getUTCHours())}:${h(e.getUTCMinutes())}:${h(e.getUTCSeconds())}`}function _(e){let t=Object.fromEntries(new Intl.DateTimeFormat(`en-CA`,{timeZone:`America/Sao_Paulo`,hourCycle:`h23`,year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`,second:`2-digit`}).formatToParts(e).map(e=>[e.type,e.value]));return`${t.year}-${t.month}-${t.day} ${t.hour}:${t.minute}:${t.second}`}function v(e){return e.toUTCString().replace(` GMT`,` +0000`)}var y=e=>{let t=e?new Date(e):null;return t&&!Number.isNaN(t.getTime())?t:null},b=e=>/<\/?[a-z][^>]*>/i.test(e);function x(e){let t=String(e??``);if(!b(t))return`${l}${m(t)}${u}`;let n=t.trim();return/^<pre class="wp-block-verse[^"]*">[\s\S]*<\/pre>$/.test(n)&&!n.includes(`<!-- wp:`)?`<!-- wp:verse {"textAlign":"center"} -->\n${n}\n<!-- /wp:verse -->`:t}function S(e){let t=new Set,n=[`		<category domain="category" nicename="sem-categoria"><![CDATA[Sem categoria]]></category>`];return(Array.isArray(e)?e:[]).forEach(e=>{let r=typeof e==`string`?e.trim():``,a=i(r);r&&a&&!t.has(a)&&(t.add(a),n.push(`\t\t<category domain="post_tag" nicename="${a}">${p(r)}</category>`))}),n.join(`
`)}function C(e,t,n){let r=y(e.published_at)||y(e.created_at)||new Date(0),i=y(e.updated_at)||r,a=c[e.status]||`draft`;return`\t\t<item>
\t\t<title>${p(e.title)}</title>
\t\t<link>${n}/poema/${encodeURIComponent(e.slug||``)}</link>
\t\t<pubDate>${v(r)}</pubDate>
\t\t<dc:creator>${p(f.login)}</dc:creator>
\t\t<guid isPermaLink="false">${n}/?p=${t}</guid>
\t\t<description></description>
\t\t<content:encoded>${p(x(e.content))}</content:encoded>
\t\t<excerpt:encoded>${p(e.excerpt||``)}</excerpt:encoded>
\t\t<wp:post_id>${t}</wp:post_id>
\t\t<wp:post_date>${p(_(r))}</wp:post_date>
\t\t<wp:post_date_gmt>${p(g(r))}</wp:post_date_gmt>
\t\t<wp:post_modified>${p(_(i))}</wp:post_modified>
\t\t<wp:post_modified_gmt>${p(g(i))}</wp:post_modified_gmt>
\t\t<wp:comment_status>${p(`open`)}</wp:comment_status>
\t\t<wp:ping_status>${p(`open`)}</wp:ping_status>
\t\t<wp:post_name>${p(e.slug||``)}</wp:post_name>
\t\t<wp:status>${p(a)}</wp:status>
\t\t<wp:post_parent>0</wp:post_parent>
\t\t<wp:menu_order>0</wp:menu_order>
\t\t<wp:post_type>${p(`post`)}</wp:post_type>
\t\t<wp:post_password>${p(``)}</wp:post_password>
\t\t<wp:is_sticky>0</wp:is_sticky>
${S(e.tags)}
\t\t</item>`}function w({poems:e,siteUrl:t=r,now:n=new Date}={}){let i=String(t).replace(/\/+$/,``),a=[...e||[]].sort((e,t)=>(y(e.published_at)||y(e.created_at)||new Date(0)).getTime()-(y(t.published_at)||y(t.created_at)||new Date(0)).getTime()).map((e,t)=>C(e,t+1,i)).join(`
`);return`${d}
\t<!-- generator="sitepoemas" created="${g(n).slice(0,16)}"-->
<rss version="2.0"
\txmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:wp="http://wordpress.org/export/1.2/"
>

<channel>
\t<title>Poemas de Natanael</title>
\t<link>${i}</link>
\t<description>Em poucas palavras este é o refúgio das minhas falas, é onde transcrevo sensações, sentimentos, angústias e alegrias.</description>
\t<pubDate>${v(n)}</pubDate>
\t<language>pt-BR</language>
\t<wp:wxr_version>1.2</wp:wxr_version>
\t<wp:base_site_url>${i}</wp:base_site_url>
\t<wp:base_blog_url>${i}</wp:base_blog_url>

\t\t<wp:author><wp:author_id>${f.id}</wp:author_id><wp:author_login>${p(f.login)}</wp:author_login><wp:author_email>${p(f.email)}</wp:author_email><wp:author_display_name>${p(f.displayName)}</wp:author_display_name><wp:author_first_name>${p(f.firstName)}</wp:author_first_name><wp:author_last_name>${p(f.lastName)}</wp:author_last_name></wp:author>

\t<generator>${i}</generator>

${a}
\t\t</channel>
</rss>
`}function T(e,t=new Date){return{filename:`poemas-${t.toISOString().slice(0,10)}.xml`,xml:w({poems:e,now:t})}}function E(e,t,n=`application/xml`){let r=URL.createObjectURL(new Blob([t],{type:`${n};charset=utf-8`})),i=document.createElement(`a`);i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(r)}function D(e){let{filename:t,xml:n}=T(e);return E(t,n),e.length}async function O(r){r.innerHTML=`<div class="loading">Carregando obras...</div>`;try{let i=new Date(Date.now()-2592e6).toISOString(),[c,l]=await Promise.all([o(`poems`),o(`page_views`,{where:[[`created_at`,`>=`,i]],limit:5e3})]);if(c.error)throw c.error;let u=c.data||[],d=l.data||[],f={};d.forEach(e=>{e.poem_id&&(f[e.poem_id]=(f[e.poem_id]||0)+1)});let p=new Set;u.forEach(e=>e.tags?.forEach(e=>p.add(e.trim())));let m=Array.from(p).sort();r.innerHTML=e(`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          
          <!-- Filters Toolbar -->
          <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 4px; border: 1px solid var(--border-subtle);">
            <input type="text" id="list-search" placeholder="Buscar por título ou slug..." style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; min-width: 200px; font-size: 0.85rem;">
            
            <select id="list-filter-status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="all">Todos os Estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="scheduled">Agendados</option>
            </select>
            
            <select id="list-filter-tag" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; max-width: 180px; cursor: pointer;">
              <option value="all">Todos os Sentimentos</option>
              ${m.map(e=>`<option value="${t(e)}">${t(e)}</option>`).join(``)}
            </select>
            
            <select id="list-sort" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="title-az">Título (A-Z)</option>
              <option value="title-za">Título (Z-A)</option>
              <option value="views">Mais Vistos (Views)</option>
            </select>
          </div>
          
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div>
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${u.length}</strong> obras
            </div>
            <button type="button" id="export-xml-btn" ${u.length?``:`disabled`} title="Baixa um XML (formato WordPress) com todas as obras, inclusive rascunhos e agendadas" style="font-size: 0.8rem; padding: 0.35rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; background: transparent; color: var(--text-primary); cursor: pointer; font-family: var(--font-ui);">Exportar XML</button>
          </div>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500; text-align: center;" title="Visualizações nos últimos 30 dias">Visualizações (30d)</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="list-tbody"></tbody>
            </table>
          </div>
        </div>
      `);let h=r.querySelector(`#list-tbody`),g=r.querySelector(`#results-count`),_=r=>{g.innerText=r.length,r.length===0?h.innerHTML=e(`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `):(h.innerHTML=e(r.map(e=>{let n=f[e.id]||0,r=``,i=!1;if(e.status===`scheduled`){let t=e.scheduled_at?new Date(e.scheduled_at).getTime():NaN;i=!isNaN(t)&&t<Date.now()-36e5,r=`${i?`<span style="color: var(--error); font-weight: 600;">Atrasado</span> • `:``}Agendado • ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}`}else r=e.status===`published`?`Publicado • ${new Date(e.published_at).toLocaleDateString(`pt-BR`)}`:`Criado • ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}`;let a=e.status===`published`?`var(--success)`:e.status===`scheduled`?i?`var(--error)`:`var(--accent-subtle)`:`var(--border-strong)`,o=e.status===`published`?`var(--success)`:e.status===`scheduled`?i?`var(--error)`:`var(--accent-subtle)`:`var(--text-muted)`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${t(e.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${t(e.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${a}; color: ${o}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
                  ${e.status===`published`?`Publicado`:e.status===`scheduled`?`Agendado`:`Rascunho`}
                </span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-ui); white-space: nowrap;">${r}</div>
              </td>
              <td style="padding: var(--space-md) 0; text-align: center; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.9rem;" title="${n} visualizações nos últimos 30 dias">
                👁 ${n}
              </td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <a href="/admin?view=editor&id=${e.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast); text-decoration: none;">Editar</a>
                <button class="delete-btn" data-id="${e.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer; padding: 0;">Excluir</button>
              </td>
            </tr>
          `}).join(``)),h.querySelectorAll(`.delete-btn`).forEach(e=>{let t=!1;e.addEventListener(`click`,async r=>{r.preventDefault();let i=e.dataset.id;if(!t){let n=e.innerText;e.innerText=`Tem certeza?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,e.style.opacity=`1`,t=!0,setTimeout(()=>{e&&!e.disabled&&(e.innerText=n,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,e.style.opacity=`0.7`,t=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:o}=await a(`poems`,i);o?(console.error(o),alert(`Erro ao excluir: `+o.message),e.innerText=`Excluir`,e.disabled=!1):n(`/admin?view=list`)})}))},v=r.querySelector(`#list-search`),y=r.querySelector(`#list-filter-status`),b=r.querySelector(`#list-filter-tag`),x=r.querySelector(`#list-sort`),S=()=>{let e=v.value.toLowerCase().trim(),t=y.value,n=b.value,r=x.value,i=[...u];e&&(i=i.filter(t=>t.title.toLowerCase().includes(e)||t.slug.toLowerCase().includes(e))),t!==`all`&&(i=i.filter(e=>e.status===t)),n!==`all`&&(i=i.filter(e=>e.tags&&e.tags.includes(n))),r===`newest`?i.sort((e,t)=>new Date(t.published_at||t.created_at)-new Date(e.published_at||e.created_at)):r===`oldest`?i.sort((e,t)=>new Date(e.published_at||e.created_at)-new Date(t.published_at||t.created_at)):r===`title-az`?i.sort((e,t)=>e.title.localeCompare(t.title)):r===`title-za`?i.sort((e,t)=>t.title.localeCompare(e.title)):r===`views`&&i.sort((e,t)=>(f[t.id]||0)-(f[e.id]||0)),_(i)},C=r.querySelector(`#export-xml-btn`);C.addEventListener(`click`,()=>{let e=D(u);C.textContent=`Baixado: ${e} obras`,setTimeout(()=>{C.textContent=`Exportar XML`},3e3)}),v.addEventListener(`input`,s(S,150)),y.addEventListener(`change`,S),b.addEventListener(`change`,S),x.addEventListener(`change`,S),S()}catch(n){console.error(n),r.innerHTML=e(`<div class="error">Erro ao carregar obras: ${t(n.message)}</div>`)}}export{O as renderList};