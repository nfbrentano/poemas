function e(e){return typeof e==`string`?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`).replace(/\//g,`&#x2F;`):``}function t(e){if(typeof e!=`string`||!e)return``;if(typeof DOMParser<`u`){let t=e.replace(/<br\s*\/?>/gi,`
`).replace(/<\/p\s*>/gi,`

`).replace(/<\/div\s*>/gi,`
`),n=new DOMParser().parseFromString(t,`text/html`);return n.querySelectorAll(`script, style, noscript, iframe`).forEach(e=>e.remove()),(n.body.textContent||``).trim()}let t=e.replace(/<br\s*\/?>/gi,`
`).replace(/<\/p\s*>/gi,`

`).replace(/<\/div\s*>/gi,`
`),n;do n=t,t=t.replace(/<[^>]*>/g,``);while(t!==n);return t.trim()}function n(e){if(typeof e!=`string`)return``;let t=e.trim();if(!t||/^(?:javascript|vbscript):/i.test(t)||/[\u0000-\u001f\u007f-\u009f]/.test(t))return``;if(t.startsWith(`/`)&&!t.startsWith(`//`)&&!t.startsWith(`/\\`)||/^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[a-z0-9+/=]+$/i.test(t))return t;try{let e=new URL(t);if(e.protocol===`http:`||e.protocol===`https:`)return e.href}catch{return``}return``}export{n,t as r,e as t};