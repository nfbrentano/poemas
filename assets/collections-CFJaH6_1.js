import{S as e,b as t}from"./index-3IBTfuIH.js";import{a as n,l as r,n as i,o as a,r as o,s,u as c}from"./data-C7fAQ5he.js";function l(e){let t={};return(e||[]).forEach(e=>{let n=e&&e.collection_id;n&&(t[n]=(t[n]||0)+1)}),t}function u(e,t){if(!e)return`—`;let n=e[t]||0;return n===1?`1 obra`:`${n} obras`}async function d(d){let f=async()=>{d.innerHTML=`<div class="loading">Carregando coleções...</div>`;let[{data:n,error:r},a]=await Promise.all([s(`collections`),s(`collection_poems`)]);if(r){d.innerHTML=`<div class="error">Erro ao carregar coleções: ${r.message}</div>`;return}let o=a.error?null:l(a.data),c=n.map(n=>{let r=e(n.image_url);return`
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${r?`
            <div style="height: 120px; background-image: url('${t(r)}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          `:`
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${t(n.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${u(o,n.id)}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${t(n.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${t(n.description||`Sem descrição.`)}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${n.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${n.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        `}).join(``);d.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${n.length===0?`
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          `:`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${c}
            </div>
          `}
        </div>
      `,d.querySelector(`#new-col-btn`).addEventListener(`click`,()=>p()),d.querySelectorAll(`.edit-col-btn`).forEach(e=>{e.addEventListener(`click`,()=>p(e.dataset.id))}),d.querySelectorAll(`.delete-col-btn`).forEach(e=>{let t=!1;e.addEventListener(`click`,async n=>{if(!t){e.innerText=`Confirmar?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,t=!0,setTimeout(()=>{e&&(e.innerText=`Excluir`,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,t=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:r}=await i(`collections`,e.dataset.id);r&&alert(`Erro ao excluir coleção: `+r.message),f()})})},p=async(i=null)=>{d.innerHTML=`<div class="loading">Carregando formulário...</div>`;let l={name:``,slug:``,description:``,image_url:``},u=new Set;try{let[p,m,h]=await Promise.all([s(`poems`,{orderBy:[`title`,`asc`]}),i?s(`collections`,{where:[[`id`,`==`,i]],single:!0}):Promise.resolve({data:null}),i?s(`collection_poems`,{where:[[`collection_id`,`==`,i]]}):Promise.resolve({data:[]})]);if(p.error)throw p.error;if(i&&m.error)throw m.error;if(i&&h.error)throw h.error;let g=p.data||[];m.data&&(l=m.data),h.data&&h.data.forEach(e=>u.add(e.poem_id)),d.innerHTML=`
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${i?`Editar Coleção`:`Nova Coleção`}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${t(l.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${t(l.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${t(l.description||``)}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${t(l.image_url||``)}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="btn-secondary" for="col-img-upload" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.8rem; display: inline-block;">
                      Fazer Upload
                    </label>
                    <input type="file" id="col-img-upload" accept="image/*" style="display: none;">
                    <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-ui);"></span>
                  </div>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Preview da Capa</label>
                  <div id="col-img-preview-container" style="width: 100%; height: 105px; border: 1px solid var(--border-strong); border-radius: 2px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; color: var(--text-muted); font-size: 0.8rem;">
                    ${e(l.image_url)?`
                      <img src="${t(e(l.image_url))}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
                    `:`
                      <span id="col-preview-placeholder">Nenhuma imagem</span>
                    `}
                  </div>
                </div>
              </div>
              
              <!-- Poem checklist -->
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Associar Poemas</label>
                
                <input type="text" id="checklist-search" placeholder="Filtrar poemas na lista..." style="width: 100%; padding: 0.4rem var(--space-sm); border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px; font-size: 0.85rem;">
                
                <div id="checklist-container" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-2xs); background: var(--bg-secondary); display: grid; gap: 4px;">
                  ${g.map(e=>{let n=u.has(e.id);return`
                      <label class="checklist-item" data-title="${e.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${e.id}" ${n?`checked`:``} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${t(e.title)}</span>
                        <span style="font-size: 0.7rem; color: ${e.status===`published`?`var(--success)`:`var(--text-muted)`}; margin-left: auto; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${e.status===`published`?`var(--success)`:`var(--border-strong)`}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui);">
                          ${e.status===`published`?`Publicado`:`Rascunho`}
                        </span>
                      </label>
                    `}).join(``)}
                </div>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <button type="button" id="cancel-form-btn" style="padding: 0.6rem 1.5rem; color: var(--text-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                <button type="submit" id="save-col-btn" style="padding: 0.6rem 1.5rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; border: none; cursor: pointer; font-size: 0.85rem;">
                  ${i?`Salvar Alterações`:`Criar Coleção`}
                </button>
              </div>
            </form>
          </div>
        `;let _=d.querySelector(`#col-name`),v=d.querySelector(`#col-slug`);_.addEventListener(`input`,()=>{(!i||v.value===``)&&(v.value=_.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let y=d.querySelector(`#checklist-search`),b=d.querySelectorAll(`.checklist-item`);y.addEventListener(`input`,()=>{let e=y.value.toLowerCase().trim();b.forEach(t=>{t.dataset.title.includes(e)?t.style.display=`flex`:t.style.display=`none`})});let x=d.querySelector(`#col-img-url`),S=d.querySelector(`#col-img-preview-container`),C=t=>{S.replaceChildren();let n=e(t);if(n){let e=document.createElement(`img`);e.id=`col-img-preview`,e.setAttribute(`src`,encodeURI(n)),e.style.width=`100%`,e.style.height=`100%`,e.style.objectFit=`cover`,S.appendChild(e)}else{let e=document.createElement(`span`);e.id=`col-preview-placeholder`,e.textContent=`Nenhuma imagem`,S.appendChild(e)}};x.addEventListener(`input`,()=>{C(x.value.trim())});let w=d.querySelector(`#col-img-upload`),T=d.querySelector(`#upload-status`);w.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){T.textContent=`Enviando...`,T.style.color=`var(--accent-subtle)`,w.disabled=!0;try{let e=t.name.split(`.`).pop().toLowerCase(),r=`col_cover_${Date.now()}.${e}`,{data:i,error:a}=await c(`avatars`,r,t);if(a)throw a;let o=n(`avatars`,r);x.value=o,C(o),T.textContent=`Sucesso!`,T.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de capa:`,e),T.textContent=`Erro!`,T.style.color=`var(--error)`}finally{w.disabled=!1,setTimeout(()=>{T.textContent=``},3e3)}}}),d.querySelector(`#cancel-form-btn`).addEventListener(`click`,()=>f()),d.querySelector(`#col-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=d.querySelector(`#save-col-btn`);t.innerText=`Salvando...`,t.disabled=!0;let n={name:_.value.trim(),slug:v.value.trim(),description:d.querySelector(`#col-description`).value.trim(),image_url:x.value.trim()||null},s=i,c=null;if(i)c=(await r(`collections`,i,n)).error;else{n.created_at=new Date().toISOString();let e=await a(`collections`,n);c=e.error,e.data&&(s=e.data.id)}if(c){alert(`Erro ao salvar coleção: `+c.message),t.innerText=i?`Salvar Alterações`:`Criar Coleção`,t.disabled=!1;return}let l=d.querySelectorAll(`input[name="associated-poems"]:checked`),u=Array.from(l).map(e=>e.value);if(await o(`collection_poems`,`collection_id`,s),u.length>0){let e=u.map(e=>({collection_id:s,poem_id:e})),{error:t}=await a(`collection_poems`,e);t&&alert(`Coleção salva, mas houve um erro ao associar poemas: `+t.message)}f()})}catch(e){console.error(e),d.innerHTML=`<div class="error">Erro ao carregar o formulário: ${e.message}</div>`}};await f()}export{d as renderCollections};