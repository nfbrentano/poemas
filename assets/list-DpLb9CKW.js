import{a as e,b as t,n,y as r}from"./index-DadoRXS-.js";import{n as i,s as a}from"./data-KIeY_Y8W.js";import{t as o}from"./debounce-C89F3TY9.js";var s={published:`publish`,draft:`draft`,scheduled:`future`},c=`<!-- wp:verse {"textAlign":"center"} -->
<pre class="wp-block-verse has-text-align-center">`,l=`</pre>
<!-- /wp:verse -->`,u=`<?xml version="1.0" encoding="UTF-8" ?>
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
`,d={id:98882272,login:`nataroots`,email:`natanaelfernando@outlook.com`,displayName:`Natanael`,firstName:`Natanael Fernando`,lastName:`Gatti Brentano`};function f(e){return`<![CDATA[${String(e??``).replace(/\]\]>/g,`]]]]><![CDATA[>`)}]]>`}function p(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var m=e=>String(e).padStart(2,`0`);function h(e){return`${e.getUTCFullYear()}-${m(e.getUTCMonth()+1)}-${m(e.getUTCDate())} ${m(e.getUTCHours())}:${m(e.getUTCMinutes())}:${m(e.getUTCSeconds())}`}function g(e){let t=Object.fromEntries(new Intl.DateTimeFormat(`en-CA`,{timeZone:`America/Sao_Paulo`,hourCycle:`h23`,year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`,second:`2-digit`}).formatToParts(e).map(e=>[e.type,e.value]));return`${t.year}-${t.month}-${t.day} ${t.hour}:${t.minute}:${t.second}`}function _(e){return e.toUTCString().replace(` GMT`,` +0000`)}var v=e=>{let t=e?new Date(e):null;return t&&!Number.isNaN(t.getTime())?t:null},y=e=>/<\/?[a-z][^>]*>/i.test(e);function b(e){let t=String(e??``);if(!y(t))return`${c}${p(t)}${l}`;let n=t.trim();return/^<pre class="wp-block-verse[^"]*">[\s\S]*<\/pre>$/.test(n)&&!n.includes(`<!-- wp:`)?`<!-- wp:verse {"textAlign":"center"} -->\n${n}\n<!-- /wp:verse -->`:t}function x(e){let t=new Set,n=[`		<category domain="category" nicename="sem-categoria"><![CDATA[Sem categoria]]></category>`];return(Array.isArray(e)?e:[]).forEach(e=>{let i=typeof e==`string`?e.trim():``,a=r(i);i&&a&&!t.has(a)&&(t.add(a),n.push(`\t\t<category domain="post_tag" nicename="${a}">${f(i)}</category>`))}),n.join(`
`)}function S(e,t,n){let r=v(e.published_at)||v(e.created_at)||new Date(0),i=v(e.updated_at)||r,a=s[e.status]||`draft`;return`\t\t<item>
\t\t<title>${f(e.title)}</title>
\t\t<link>${n}/poema/${encodeURIComponent(e.slug||``)}</link>
\t\t<pubDate>${_(r)}</pubDate>
\t\t<dc:creator>${f(d.login)}</dc:creator>
\t\t<guid isPermaLink="false">${n}/?p=${t}</guid>
\t\t<description></description>
\t\t<content:encoded>${f(b(e.content))}</content:encoded>
\t\t<excerpt:encoded>${f(e.excerpt||``)}</excerpt:encoded>
\t\t<wp:post_id>${t}</wp:post_id>
\t\t<wp:post_date>${f(g(r))}</wp:post_date>
\t\t<wp:post_date_gmt>${f(h(r))}</wp:post_date_gmt>
\t\t<wp:post_modified>${f(g(i))}</wp:post_modified>
\t\t<wp:post_modified_gmt>${f(h(i))}</wp:post_modified_gmt>
\t\t<wp:comment_status>${f(`open`)}</wp:comment_status>
\t\t<wp:ping_status>${f(`open`)}</wp:ping_status>
\t\t<wp:post_name>${f(e.slug||``)}</wp:post_name>
\t\t<wp:status>${f(a)}</wp:status>
\t\t<wp:post_parent>0</wp:post_parent>
\t\t<wp:menu_order>0</wp:menu_order>
\t\t<wp:post_type>${f(`post`)}</wp:post_type>
\t\t<wp:post_password>${f(``)}</wp:post_password>
\t\t<wp:is_sticky>0</wp:is_sticky>
${x(e.tags)}
\t\t</item>`}function C({poems:t,siteUrl:n=e,now:r=new Date}={}){let i=String(n).replace(/\/+$/,``),a=[...t||[]].sort((e,t)=>(v(e.published_at)||v(e.created_at)||new Date(0)).getTime()-(v(t.published_at)||v(t.created_at)||new Date(0)).getTime()).map((e,t)=>S(e,t+1,i)).join(`
`);return`${u}
\t<!-- generator="sitepoemas" created="${h(r).slice(0,16)}"-->
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
\t<pubDate>${_(r)}</pubDate>
\t<language>pt-BR</language>
\t<wp:wxr_version>1.2</wp:wxr_version>
\t<wp:base_site_url>${i}</wp:base_site_url>
\t<wp:base_blog_url>${i}</wp:base_blog_url>

\t\t<wp:author><wp:author_id>${d.id}</wp:author_id><wp:author_login>${f(d.login)}</wp:author_login><wp:author_email>${f(d.email)}</wp:author_email><wp:author_display_name>${f(d.displayName)}</wp:author_display_name><wp:author_first_name>${f(d.firstName)}</wp:author_first_name><wp:author_last_name>${f(d.lastName)}</wp:author_last_name></wp:author>

\t<generator>${i}</generator>

${a}
\t\t</channel>
</rss>
`}function w(e,t=new Date){return{filename:`poemas-${t.toISOString().slice(0,10)}.xml`,xml:C({poems:e,now:t})}}function T(e,t,n=`application/xml`){let r=URL.createObjectURL(new Blob([t],{type:`${n};charset=utf-8`})),i=document.createElement(`a`);i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(r)}function E(e){let{filename:t,xml:n}=w(e);return T(t,n),e.length}async function D(e){e.innerHTML=`<div class="loading">Carregando obras...</div>`;try{let[r,s]=await Promise.all([a(`poems`),a(`page_views`)]);if(r.error)throw r.error;let c=r.data||[],l=s.data||[],u={};l.forEach(e=>{e.poem_id&&(u[e.poem_id]=(u[e.poem_id]||0)+1)});let d=new Set;c.forEach(e=>e.tags?.forEach(e=>d.add(e.trim()))),e.innerHTML=`
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
              ${Array.from(d).sort().map(e=>`<option value="${t(e)}">${t(e)}</option>`).join(``)}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${c.length}</strong> obras
            </div>
            <button type="button" id="export-xml-btn" ${c.length?``:`disabled`} title="Baixa um XML (formato WordPress) com todas as obras, inclusive rascunhos e agendadas" style="font-size: 0.8rem; padding: 0.35rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; background: transparent; color: var(--text-primary); cursor: pointer; font-family: var(--font-ui);">Exportar XML</button>
          </div>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500; text-align: center;">Visualizações</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="list-tbody"></tbody>
            </table>
          </div>
        </div>
      `;let f=e.querySelector(`#list-tbody`),p=e.querySelector(`#results-count`),m=e=>{p.innerText=e.length,e.length===0?f.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `:(f.innerHTML=e.map(e=>{let n=u[e.id]||0,r=``;r=e.status===`scheduled`?`Agendado • ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}`:e.status===`published`?`Publicado • ${new Date(e.published_at).toLocaleDateString(`pt-BR`)}`:`Criado • ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}`;let i=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--border-strong)`,a=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--text-muted)`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${t(e.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${t(e.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${i}; color: ${a}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
                  ${e.status===`published`?`Publicado`:e.status===`scheduled`?`Agendado`:`Rascunho`}
                </span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-ui); white-space: nowrap;">${r}</div>
              </td>
              <td style="padding: var(--space-md) 0; text-align: center; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.9rem;">
                👁 ${n}
              </td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <a href="/admin?view=editor&id=${e.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast); text-decoration: none;">Editar</a>
                <button class="delete-btn" data-id="${e.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer; padding: 0;">Excluir</button>
              </td>
            </tr>
          `}).join(``),f.querySelectorAll(`.delete-btn`).forEach(e=>{let t=!1;e.addEventListener(`click`,async r=>{r.preventDefault();let a=e.dataset.id;if(!t){let n=e.innerText;e.innerText=`Tem certeza?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,e.style.opacity=`1`,t=!0,setTimeout(()=>{e&&!e.disabled&&(e.innerText=n,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,e.style.opacity=`0.7`,t=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:o}=await i(`poems`,a);o?(console.error(o),alert(`Erro ao excluir: `+o.message),e.innerText=`Excluir`,e.disabled=!1):n(`/admin?view=list`)})}))},h=e.querySelector(`#list-search`),g=e.querySelector(`#list-filter-status`),_=e.querySelector(`#list-filter-tag`),v=e.querySelector(`#list-sort`),y=()=>{let e=h.value.toLowerCase().trim(),t=g.value,n=_.value,r=v.value,i=[...c];e&&(i=i.filter(t=>t.title.toLowerCase().includes(e)||t.slug.toLowerCase().includes(e))),t!==`all`&&(i=i.filter(e=>e.status===t)),n!==`all`&&(i=i.filter(e=>e.tags&&e.tags.includes(n))),r===`newest`?i.sort((e,t)=>new Date(t.published_at||t.created_at)-new Date(e.published_at||e.created_at)):r===`oldest`?i.sort((e,t)=>new Date(e.published_at||e.created_at)-new Date(t.published_at||t.created_at)):r===`title-az`?i.sort((e,t)=>e.title.localeCompare(t.title)):r===`title-za`?i.sort((e,t)=>t.title.localeCompare(e.title)):r===`views`&&i.sort((e,t)=>(u[t.id]||0)-(u[e.id]||0)),m(i)},b=e.querySelector(`#export-xml-btn`);b.addEventListener(`click`,()=>{let e=E(c);b.textContent=`Baixado: ${e} obras`,setTimeout(()=>{b.textContent=`Exportar XML`},3e3)}),h.addEventListener(`input`,o(y,150)),g.addEventListener(`change`,y),_.addEventListener(`change`,y),v.addEventListener(`change`,y),y()}catch(t){console.error(t),e.innerHTML=`<div class="error">Erro ao carregar obras: ${t.message}</div>`}}export{D as renderList};