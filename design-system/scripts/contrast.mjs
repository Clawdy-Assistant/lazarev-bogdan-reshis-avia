import {readFileSync} from 'node:fs';
const t=JSON.parse(readFileSync(new URL('../project/tokens.json',import.meta.url)));
const c=Object.fromEntries(t.color.tokens.map(x=>[x.name,x.value]));
const L=h=>{const n=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*n[0]+.7152*n[1]+.0722*n[2]};
const R=(a,b)=>{const[x,y]=[L(a),L(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
const P=[['ink','surface',4.5],['ink','surface-raised',4.5],['ink','surface-muted',4.5],['ink','brand-soft',4.5],['ink-muted','surface',4.5],['ink-muted','surface-raised',4.5],['ink-muted','surface-muted',4.5],['on-hero','hero',4.5],['on-cta','cta',3],['on-cta','cta-hover',3],['brand-ink','surface',4.5],['brand-ink','surface-raised',4.5],['brand-ink','brand-soft',4.5],['capacity','surface',4.5],['capacity','surface-raised',4.5],['capacity','capacity-soft',4.5],['line-strong','surface',3],['line-strong','surface-raised',3],['focus','surface',3],['focus','surface-raised',3],['brand','surface-raised',3],['capacity','surface-raised',3],['danger','surface-raised',4.5],['danger','danger-soft',4.5],['on-hero','brand',0]];
let bad=0;for(const[a,b,min]of P){const r=R(c[a],c[b]);const f=r<min;if(f)bad++;if(f)console.log(a,'on',b,r.toFixed(2),'FAIL <'+min)}
console.log('fails',bad)
