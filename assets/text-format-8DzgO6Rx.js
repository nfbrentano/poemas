import{t as e}from"./html-MqnEuzWn.js";function t(e){if(!e||typeof e!=`string`)return``;let t=e.replace(/\r\n?/g,`
`),n;do n=t,t=t.replace(/<!--[\s\S]*?-->/g,``);while(t!==n);do n=t,t=t.replace(/<(strong|em)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi,(e,t,n)=>{let r=t.toLowerCase(),i=n.replace(/<br\s*\/?>/gi,`
`);if(!i.includes(`
`)){let e=i.trim();return e?`<${r}>${e}</${r}>`:``}return i.split(`
`).map(e=>{let t=e.trim();return t?`<${r}>${t}</${r}>`:``}).join(`
`)});while(t!==n);return t=t.replace(/<br\s*\/?>/gi,`
`).replace(/<\/?(?:pre|p|div)\b[^>]*>/gi,`

`).replace(/<\/?(?:span|a)\b[^>]*>/gi,``),t.split(`
`).map(e=>e.replace(/[ \t]+$/g,``)).join(`
`).replace(/\n\s*\n/g,`

`).replace(/\n{3,}/g,`

`).trim()}function n(e){let t=e,n;do n=t,t=t.replace(/&lt;(strong|em)&gt;([\s\S]*?)&lt;(?:&#x2F;|\/)\1&gt;/g,`<$1>$2</$1>`);while(t!==n);return t}var r=r=>{let i=t(r);if(!i)return``;let a=i.split(/\n\s*\n/).map(e=>e.trim()).filter(Boolean),o=0;return a.map(t=>`<div class="stanza stagger-reveal">${t.split(`
`).map(e=>e.trim()).filter(Boolean).map(t=>{o++;let r=n(e(t));return`<span class="line-reveal" style="transition-delay: ${parseFloat((o*.05).toFixed(2))}s">${r}</span>`}).join(``)}</div>`).join(``)};export{t as n,r as t};