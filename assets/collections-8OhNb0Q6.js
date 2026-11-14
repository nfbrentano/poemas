import{a as e,r as t,t as n}from"./html-DUzinkfe.js";import{a as r,c as i,d as a,i as o,n as s,o as c,s as l,u}from"./data-BxfxRve7.js";import{a as d,c as f,i as p,n as m,o as h,r as g,s as _,t as v}from"./collection-order-CWZ7vikT.js";function y(e){let t={},n=new Set;return(e||[]).forEach(e=>{let r=e&&e.collection_id,i=e&&e.poem_id;if(r){let e=i?`${r}::${i}`:null;(!e||!n.has(e))&&(e&&n.add(e),t[r]=(t[r]||0)+1)}}),t}function b(e,t){if(!e)return`—`;let n=e[t]||0;return n===1?`1 obra`:`${n} obras`}async function x(x){let S=async()=>{x.innerHTML=`<div class="loading">Carregando coleções...</div>`;let[{data:r,error:i},a]=await Promise.all([l(`collections`),l(`collection_poems`)]);if(i){x.innerHTML=e(`<div class="error">Erro ao carregar coleções: ${n(i.message)}</div>`);return}let o=a.error?null:y(a.data),c=r.map(e=>{let r=t(e.image_url);return`
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${r?`
            <div style="height: 120px; background-image: url('${n(r)}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          `:`
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${n(e.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${b(o,e.id)}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${n(e.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${n(e.description||`Sem descrição.`)}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        `}).join(``);x.innerHTML=e(`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${r.length===0?`
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          `:`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${c}
            </div>
          `}
        </div>
      `),x.querySelector(`#new-col-btn`).addEventListener(`click`,()=>C()),x.querySelectorAll(`.edit-col-btn`).forEach(e=>{e.addEventListener(`click`,()=>C(e.dataset.id))}),x.querySelectorAll(`.delete-col-btn`).forEach(e=>{let t=!1;e.addEventListener(`click`,async n=>{if(!t){e.innerText=`Confirmar?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,t=!0,setTimeout(()=>{e&&(e.innerText=`Excluir`,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,t=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:r}=await s(`collections`,e.dataset.id);r&&alert(`Erro ao excluir coleção: `+r.message),S()})})},C=async(s=null)=>{x.innerHTML=`<div class="loading">Carregando formulário...</div>`;let y={name:``,slug:``,description:``,image_url:``},b=new Set;try{let[C,w,T]=await Promise.all([l(`poems`,{orderBy:[`title`,`asc`]}),s?o(`collections`,s):Promise.resolve({data:null}),s?l(`collection_poems`,{where:[[`collection_id`,`==`,s]]}):Promise.resolve({data:[]})]);if(C.error)throw C.error;if(s&&w.error)throw w.error;if(s&&T.error)throw T.error;let E=C.data||[];w.data&&(y=w.data);let D=T.data||[];D.forEach(e=>b.add(e.poem_id));let O=D.some(e=>typeof e.order==`number`),k=!1,A=E.filter(e=>b.has(e.id)),j=O?f(A,D):_(A);x.innerHTML=e(`
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${s?`Editar Coleção`:`Nova Coleção`}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${n(y.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${n(y.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${n(y.description||``)}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${n(y.image_url||``)}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
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
                    ${t(y.image_url)?`
                      <img src="${n(t(y.image_url))}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
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
                  ${E.map(e=>{let t=b.has(e.id);return`
                      <label class="checklist-item" data-title="${e.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${e.id}" ${t?`checked`:``} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${n(e.title)}</span>
                        <span style="font-size: 0.7rem; color: ${e.status===`published`?`var(--success)`:`var(--text-muted)`}; margin-left: auto; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${e.status===`published`?`var(--success)`:`var(--border-strong)`}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui);">
                          ${e.status===`published`?`Publicado`:`Rascunho`}
                        </span>
                      </label>
                    `}).join(``)}
                </div>
              </div>

              <!-- Ordem de Leitura dos Poemas -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-2xs); margin-bottom: var(--space-xs);">
                  <div>
                    <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">
                      Ordem de Leitura dos Poemas (<span id="order-count">${j.length}</span>)
                    </label>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                      Arraste os itens ou use as setas ↑ ↓ para definir a ordem na qual os poemas aparecem nesta coleção.
                    </p>
                  </div>
                  <div>
                    <span id="order-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 2px; font-family: var(--font-ui); text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${O?`var(--accent-subtle)`:`var(--border-strong)`}; color: ${O?`var(--accent-subtle)`:`var(--text-muted)`};">
                      ${O?`✓ Ordem manual`:`Ordem automática`}
                    </span>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; margin-bottom: var(--space-xs);">
                  <button type="button" id="save-order-btn" class="btn-secondary" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.8rem; background: var(--bg-secondary); color: var(--text-primary);">
                    Salvar ordem
                  </button>
                  <button type="button" id="restore-order-btn" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid transparent; border-radius: 2px; font-size: 0.8rem; background: transparent; color: var(--text-secondary);">
                    Restaurar ordem automática
                  </button>
                  <span id="order-feedback" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
                </div>

                <div id="order-list-container" style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-2xs); background: var(--bg-secondary); display: grid; gap: 4px;">
                </div>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <button type="button" id="cancel-form-btn" style="padding: 0.6rem 1.5rem; color: var(--text-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                <button type="submit" id="save-col-btn" style="padding: 0.6rem 1.5rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; border: none; cursor: pointer; font-size: 0.85rem;">
                  ${s?`Salvar Alterações`:`Criar Coleção`}
                </button>
              </div>
            </form>
          </div>
        `);let M=x.querySelector(`#col-name`),N=x.querySelector(`#col-slug`);M.addEventListener(`input`,()=>{(!s||N.value===``)&&(N.value=M.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let P=x.querySelector(`#checklist-search`),F=x.querySelectorAll(`.checklist-item`);P.addEventListener(`input`,()=>{let e=P.value.toLowerCase().trim();F.forEach(t=>{t.dataset.title.includes(e)?t.style.display=`flex`:t.style.display=`none`})});let I=x.querySelector(`#col-img-url`),L=x.querySelector(`#col-img-preview-container`),R=e=>{L.replaceChildren();let n=t(e);if(n){let e=document.createElement(`img`);e.id=`col-img-preview`,e.setAttribute(`src`,encodeURI(n)),e.style.width=`100%`,e.style.height=`100%`,e.style.objectFit=`cover`,L.appendChild(e)}else{let e=document.createElement(`span`);e.id=`col-preview-placeholder`,e.textContent=`Nenhuma imagem`,L.appendChild(e)}};I.addEventListener(`input`,()=>{R(I.value.trim())});let z=x.querySelector(`#col-img-upload`),B=x.querySelector(`#upload-status`);z.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){B.textContent=`Enviando...`,B.style.color=`var(--accent-subtle)`,z.disabled=!0;try{let e=t.name.split(`.`).pop().toLowerCase(),n=`col_cover_${Date.now()}.${e}`,{error:i}=await a(`avatars`,n,t);if(i)throw i;let o=r(`avatars`,n);I.value=o,R(o),B.textContent=`Sucesso!`,B.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de capa:`,e),B.textContent=`Erro!`,B.style.color=`var(--error)`}finally{z.disabled=!1,setTimeout(()=>{B.textContent=``},3e3)}}});let V=x.querySelector(`#order-list-container`),H=x.querySelector(`#order-count`),U=x.querySelector(`#order-badge`),W=x.querySelector(`#order-feedback`),G=x.querySelector(`#save-order-btn`),K=x.querySelector(`#restore-order-btn`),q=()=>{U&&(U.textContent=O?`✓ Ordem manual`:`Ordem automática`,U.style.borderColor=O?`var(--accent-subtle)`:`var(--border-strong)`,U.style.color=O?`var(--accent-subtle)`:`var(--text-muted)`),H&&(H.textContent=String(j.length))},J=null,Y=()=>{V&&(j.length===0?V.innerHTML=e(`
              <p style="color: var(--text-muted); font-size: 0.85rem; padding: 16px; margin: 0; text-align: center;">
                Nenhum poema selecionado para esta coleção. Marque poemas na lista acima para ordená-los.
              </p>
            `):(V.innerHTML=e(j.map((e,t)=>`
            <div class="poem-order-item" data-id="${e.id}" data-index="${t}" draggable="true" tabindex="0" role="listitem"
                 style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 2px; cursor: grab; user-select: none; transition: background-color var(--transition-fast), border-color var(--transition-fast);">
              <span class="order-handle" title="Arraste para mover" style="color: var(--text-muted); font-size: 1rem; cursor: grab; padding: 0 4px;">⠿</span>
              <span class="order-num" style="font-family: var(--font-ui); font-size: 0.8rem; color: var(--text-muted); width: 22px; text-align: right; font-variant-numeric: tabular-nums;">${t+1}.</span>
              <span style="flex: 1; font-size: 0.85rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${n(e.title)}</span>
              <span style="font-size: 0.68rem; color: ${e.status===`published`?`var(--success)`:`var(--text-muted)`}; border: 1px solid ${e.status===`published`?`var(--success)`:`var(--border-strong)`}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui); text-transform: uppercase;">
                ${e.status===`published`?`Pub`:`Rasc`}
              </span>
              <div style="display: flex; gap: 2px;">
                <button type="button" class="btn-move-up" data-index="${t}" aria-label="Mover ${n(e.title)} para cima" ${t===0?`disabled`:``}
                        style="background: transparent; border: 1px solid var(--border-subtle); border-radius: 2px; padding: 1px 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: ${t===0?`not-allowed`:`pointer`}; opacity: ${t===0?`0.4`:`1`};">
                  ↑
                </button>
                <button type="button" class="btn-move-down" data-index="${t}" aria-label="Mover ${n(e.title)} para baixo" ${t===j.length-1?`disabled`:``}
                        style="background: transparent; border: 1px solid var(--border-subtle); border-radius: 2px; padding: 1px 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: ${t===j.length-1?`not-allowed`:`pointer`}; opacity: ${t===j.length-1?`0.4`:`1`};">
                  ↓
                </button>
              </div>
            </div>
          `).join(``)),V.querySelectorAll(`.btn-move-up`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=parseInt(e.dataset.index,10);if(n>0){j=d(j,n),O=!0,k=!0,q(),Y();let e=V.querySelector(`.btn-move-up[data-index="${n-1}"]`);e&&e.focus()}})}),V.querySelectorAll(`.btn-move-down`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=parseInt(e.dataset.index,10);if(n<j.length-1){j=p(j,n),O=!0,k=!0,q(),Y();let e=V.querySelector(`.btn-move-down[data-index="${n+1}"]`);e&&e.focus()}})}),V.querySelectorAll(`.poem-order-item`).forEach(e=>{e.addEventListener(`keydown`,t=>{let n=parseInt(e.dataset.index,10);if(t.key===`ArrowUp`&&(t.altKey||t.ctrlKey)){if(t.preventDefault(),n>0){j=d(j,n),O=!0,k=!0,q(),Y();let e=V.querySelector(`.poem-order-item[data-index="${n-1}"]`);e&&e.focus()}}else if(t.key===`ArrowDown`&&(t.altKey||t.ctrlKey)&&(t.preventDefault(),n<j.length-1)){j=p(j,n),O=!0,k=!0,q(),Y();let e=V.querySelector(`.poem-order-item[data-index="${n+1}"]`);e&&e.focus()}}),e.addEventListener(`dragstart`,t=>{J=parseInt(e.dataset.index,10),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`,t.dataTransfer.setData(`text/plain`,String(J))),e.style.opacity=`0.4`}),e.addEventListener(`dragend`,()=>{e.style.opacity=`1`,V.querySelectorAll(`.poem-order-item`).forEach(e=>{e.style.borderTop=``,e.style.borderBottom=``})}),e.addEventListener(`dragover`,t=>{t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`);let n=parseInt(e.dataset.index,10);J!==null&&J!==n&&(J<n?(e.style.borderBottom=`2px solid var(--accent-subtle)`,e.style.borderTop=``):(e.style.borderTop=`2px solid var(--accent-subtle)`,e.style.borderBottom=``))}),e.addEventListener(`dragleave`,()=>{e.style.borderTop=``,e.style.borderBottom=``}),e.addEventListener(`drop`,t=>{t.preventDefault();let n=parseInt(e.dataset.index,10);J!==null&&J!==n&&(j=g(j,J,n),O=!0,k=!0,q(),Y()),J=null});let t=null;e.addEventListener(`touchstart`,t=>{t.touches.length===1&&(t.touches[0].clientY,J=parseInt(e.dataset.index,10))},{passive:!0}),e.addEventListener(`touchmove`,n=>{if(J===null||n.touches.length!==1)return;let r=n.touches[0],i=document.elementFromPoint(r.clientX,r.clientY),a=i?i.closest(`.poem-order-item`):null;a&&a!==e&&(t=parseInt(a.dataset.index,10),V.querySelectorAll(`.poem-order-item`).forEach(e=>{e.style.backgroundColor=e===a?`var(--bg-elevated)`:`var(--bg-primary)`}))},{passive:!0}),e.addEventListener(`touchend`,()=>{J!==null&&t!==null&&J!==t&&(j=g(j,J,t),O=!0,k=!0,q(),Y()),J=null,t=null,V.querySelectorAll(`.poem-order-item`).forEach(e=>{e.style.backgroundColor=`var(--bg-primary)`})})})))};Y(),x.querySelectorAll(`input[name="associated-poems"]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.value,n=E.find(e=>e.id===t);e.checked?n&&(j=v(j,n),k=!0):(j=h(j,t),k=!0),q(),Y()})}),G&&G.addEventListener(`click`,async()=>{if(!s){alert(`Por favor, crie e salve a coleção antes de gravar a ordem individualmente.`);return}G.disabled=!0,G.textContent=`Salvando ordem...`,W.textContent=``;let e=m(s,j,!0),{error:t}=await i(s,e,{collectionSlug:y.slug});G.disabled=!1,G.textContent=`Salvar ordem`,t?(W.textContent=`Erro ao salvar ordem: `+(t.message||`Falha na rede`),W.style.color=`var(--error)`):(O=!0,k=!1,q(),W.textContent=`✓ Ordem salva com sucesso!`,W.style.color=`var(--success)`,setTimeout(()=>{W.textContent.startsWith(`✓`)&&(W.textContent=``)},4e3))}),K&&K.addEventListener(`click`,async()=>{if(confirm(`Deseja restaurar a ordem automática (cronológica) dos poemas desta coleção?`)){if(j=_(j),O=!1,q(),Y(),s){K.disabled=!0,W.textContent=`Restaurando...`,W.style.color=`var(--text-muted)`;let e=m(s,j,!1),{error:t}=await i(s,e,{collectionSlug:y.slug});K.disabled=!1,t?(W.textContent=`Erro ao restaurar ordem: `+(t.message||`Falha`),W.style.color=`var(--error)`):(k=!1,W.textContent=`✓ Ordem restaurada para o padrão cronológico.`,W.style.color=`var(--success)`,setTimeout(()=>{W.textContent.startsWith(`✓`)&&(W.textContent=``)},4e3))}else k=!0}});let X=e=>{k&&(e.preventDefault(),e.returnValue=``)};window.addEventListener(`beforeunload`,X),x.querySelector(`#cancel-form-btn`).addEventListener(`click`,()=>{(!k||confirm(`Há alterações não salvas na ordem dos poemas. Deseja realmente sair sem salvar?`))&&(window.removeEventListener(`beforeunload`,X),S())}),x.querySelector(`#col-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=x.querySelector(`#save-col-btn`);t.innerText=`Salvando...`,t.disabled=!0;let n={name:M.value.trim(),slug:N.value.trim(),description:x.querySelector(`#col-description`).value.trim(),image_url:I.value.trim()||null},r=s,a=null;if(s)a=(await u(`collections`,s,n)).error;else{n.created_at=new Date().toISOString();let e=await c(`collections`,n);a=e.error,e.data&&(r=e.data.id)}if(a)alert(`Erro ao salvar coleção: `+a.message),t.innerText=s?`Salvar Alterações`:`Criar Coleção`,t.disabled=!1;else{if(window.removeEventListener(`beforeunload`,X),j.length>0){let e=m(r,j,O),{error:t}=await i(r,e,{collectionSlug:n.slug});t&&alert(`Coleção salva, mas houve um erro ao associar/ordenar poemas: `+t.message)}else await i(r,[],{collectionSlug:n.slug});S()}})}catch(t){console.error(t),x.innerHTML=e(`<div class="error">Erro ao carregar o formulário: ${n(t.message)}</div>`)}};await S()}export{x as renderCollections};