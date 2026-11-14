import{a as e}from"./html-DUzinkfe.js";import{a as t,c as n,l as r,o as i,u as a}from"./index-BNfYksz6.js";import{_ as o,d as s,m as c,y as l}from"./vendor-firebase-Dd5ijz69.js";import{t as u}from"./firebase-BNXSdU2z.js";import{t as d}from"./poems-store-DqDF5aZD.js";import{enrichCollectionsWithCurated as f,mergeRelationsWithCurated as p}from"./collections-DuSS-6xZ.js";import{c as m}from"./collection-order-CWZ7vikT.js";import{n as h}from"./collection-template-B60OdItA.js";var g={meta:{title:`Coleção`},async render(_,v){let y=typeof v==`object`?v.slug:v,b=_.getAttribute(`data-prerendered`)===`/colecao/${y}`;b||(_.innerHTML=`
        <section class="collection-detail fade-in">
          <header class="collection-header">
            <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 80%; height: 20px;"></div>
          </header>
          <div class="poems-list">
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
          </div>
        </section>
      `);let x=null,S=null,C=[];try{let e=null,t=typeof navigator<`u`&&navigator.onLine===!1;if(!t)try{let t=c(l(u,`collections`),o(`slug`,`==`,y)),n=await s(t);e=n.empty?null:n.docs[0]}catch(e){console.warn(`[Collection] Erro ou offline ao consultar Firestore, usando acervo local:`,e)}let n=e?{id:e.id,...e.data()}:null;if(!n){let e=f([]).find(e=>e.slug===y);e&&(n=e)}if(n){x=n;let e=[],r=[];if(t)r=await d();else{let t=c(l(u,`collection_poems`),o(`collection_id`,`==`,x.id)),[n,i]=await Promise.all([Promise.resolve().then(()=>s(t)).catch(()=>({docs:[],forEach:()=>{}})),d()]);r=i,n&&typeof n.forEach==`function`&&n.forEach(t=>{let n=t.data?t.data():t;n&&e.push({collection_id:x.id,...n})})}let i=p(e,r,[x]),a=new Set(i.map(e=>e.poem_id)),f=r.filter(e=>a.has(e.id)||Array.isArray(e.collection_slugs)&&e.collection_slugs.includes(x.slug));C=m(f,i)}else S=Error(`Not found`)}catch(e){S=e}if(S||!x){if(b){_.removeAttribute(`data-prerendered`);return}t(),_.innerHTML=e(`
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Página não encontrada</h2>
          <p class="not-found-desc">A coleção que você procura não existe ou foi removida.</p>
          <a href="/colecoes/" data-link class="not-found-link">← Voltar para coleções</a>
        </div>
      `);return}let w=x.name,T=x.description||`Coleção de poemas.`,E=`${n}/colecao/${x.slug}/`,D=[{name:`Início`,url:`${n}/`},{name:`Coleções`,url:`${n}/colecoes/`},{name:x.name,url:E}];i({title:w,description:T,url:E,type:`website`,structuredData:[a(x,C),r(D)]}),g.meta.title=w,document.title=`${w} — Natanael Fernando Gatti Brentano`,b?_.removeAttribute(`data-prerendered`):_.innerHTML=e(h({col:x,poemsList:C,baseUrl:`/`}))}};export{g as collection,g as default};