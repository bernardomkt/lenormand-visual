import React, {useEffect, useMemo, useRef, useState} from 'react';
import reference from './reference.json';
import imageMap from './imageMap.json';
import checkouts from './checkouts.json';
import {sales as ui} from './sales';
import Consent,{trackCheckoutClick} from './Consent';

type Lang = 'pt'|'en'|'it';
const ASSET_BASE = '/';
const answers = {
 pt:['É totalmente digital. Nenhum material físico será enviado, mas você pode imprimir se quiser.','Após a confirmação do pagamento, você recebe o acesso por e-mail imediatamente.','Sim, pode estudar pelo celular, tablet ou computador.','Não, o pagamento é único, sem cobrança recorrente.','Você tem 30 dias de garantia. Se não gostar, devolvemos seu dinheiro sem burocracia.'],
 en:['It is entirely digital. No physical material will be sent, but you can print it if you wish.','Once payment is confirmed, access is sent to you immediately by email.','Yes. You can study on your phone, tablet or computer.','No. It is a one-time payment, with no recurring subscription.','There is a 30-day guarantee. If it is not for you, your money is refunded without hassle.'],
 it:['È interamente digitale. Non verrà spedito alcun materiale fisico, ma puoi stamparlo se lo desideri.','Dopo la conferma del pagamento, ricevi immediatamente l’accesso via email.','Sì, puoi studiare dal telefono, dal tablet o dal computer.','No, il pagamento è unico e non prevede un abbonamento ricorrente.','Hai una garanzia di 30 giorni. Se non fa per te, il denaro viene rimborsato senza complicazioni.']
};
function initialLanguage():Lang {
 const match=location.pathname.match(/^\/(pt|en|it)(?:\/|$)/);
 if(match)return match[1] as Lang;
 try { const saved=localStorage.getItem('replica-language');if(['pt','en','it'].includes(saved||''))return saved as Lang; }catch{}
 return 'pt';
}
export default function App(){
 const [lang,setLang]=useState<Lang>(initialLanguage);
 const [dialog,setDialog]=useState(false);
 const [mode,setMode]=useState<'upgrade'|'terms'|'privacy'|'pending'>('upgrade');
 const buy=(plan:keyof typeof checkouts)=>{const url=checkouts[plan];if(!url){setMode('pending');setDialog(true);return;}trackCheckoutClick(plan,{basic:3.90,premium:4.99,upgrade:4.40}[plan]);const link=new URL(url);link.searchParams.set('locale',lang==='pt'?'pt_PT':lang);location.assign(link.toString());};
 const area=useRef<HTMLDivElement>(null);
 const t=ui[lang];
 const rendered=useMemo(()=>{
  const template=document.createElement('template');
  template.innerHTML=reference.html.replaceAll('__BASE__',ASSET_BASE);
  const walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);
  let node:Node|null;
  while((node=walker.nextNode())){
   const text=node.textContent||'';const key=text.trim();const index=reference.text.pt.indexOf(key);
   if(index>=0)node.textContent=text.replace(key,reference.text[lang][index]);
   else if(lang!=='pt'&&/^Bônus \d+$/.test(key))node.textContent=text.replace('Bônus','Bonus');
  }
  template.content.querySelectorAll('img').forEach((img,index)=>{
   const original=img.getAttribute('src')||'';
   img.setAttribute('data-reference-src',original);
   const relative=original.replace(ASSET_BASE,'');
   const id=imageMap[relative as keyof typeof imageMap];
   if(id>=11&&id<=19)img.setAttribute('data-testimonial','true');
   if(lang!=='pt'){
    if(id!==undefined){
     const translated=ASSET_BASE+lang+'-'+(id===20?0:id)+'.webp';
     img.src=translated;img.removeAttribute('srcset');
     img.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());

    }
   }
   if(lang!=='pt')img.alt=(lang==='en'?'Translated product image ':'Immagine del prodotto tradotta ')+(index+1);
   img.loading='eager';
  });
  template.content.querySelectorAll('button[aria-label]').forEach(button=>{
   const label=button.getAttribute('aria-label')||'';
   button.setAttribute('data-original-label',label);
   if(label==='Depoimento anterior')button.setAttribute('aria-label',ui[lang].prev);
   else if(label==='Próximo depoimento')button.setAttribute('aria-label',ui[lang].next);
   else if(label.startsWith('Ir para depoimento'))button.setAttribute('aria-label',ui[lang].go+' '+label.match(/\d+/)?.[0]);
  });
  template.content.querySelectorAll('button[aria-expanded]').forEach((button,index)=>button.setAttribute('data-faq-index',String(index)));
  template.content.querySelectorAll('a').forEach(a=>{if(a.textContent?.trim()===reference.text[lang][78])a.setAttribute('href',checkouts.premium||'#');});
  const planHeading=template.content.querySelector('#planos h2');if(planHeading)planHeading.textContent={pt:'Escolha como quer começar',en:'Choose how to start',it:'Scegli come iniziare'}[lang];
  return template.innerHTML;
 },[lang]);
 useEffect(()=>{
  document.documentElement.lang=lang==='pt'?'pt-PT':lang==='it'?'it-IT':'en';
  document.title=reference.text[lang][93];
  try{localStorage.setItem('replica-language',lang);}catch{}
  const back=()=>setLang(initialLanguage());window.addEventListener('popstate',back);
  return()=>window.removeEventListener('popstate',back);
 },[lang]);
 useEffect(()=>{
  const root=area.current;if(!root)return;
  let slide=0;
  const photos=[...root.querySelectorAll<HTMLImageElement>('img')].filter(img=>img.hasAttribute('data-testimonial'));
  let track=photos[0]?.parentElement as HTMLElement|null;
  while(track && (!track.classList.contains('flex')||track.querySelectorAll('picture').length<9))track=track.parentElement;
  const show=(n:number)=>{slide=(n+9)%9;if(track)track.style.transform=`translateX(-${slide*100}%)`;};show(0);
  const click=(event:MouseEvent)=>{
   const target=(event.target as HTMLElement).closest<HTMLElement>('button,a');if(!target)return;
   const faq=target.getAttribute('data-faq-index');
   if(faq!==null){
    const content=target.parentElement?.nextElementSibling as HTMLElement|null;if(!content)return;
    const open=target.getAttribute('aria-expanded')!=='true';target.setAttribute('aria-expanded',String(open));target.setAttribute('data-state',open?'open':'closed');
    content.hidden=!open;content.setAttribute('data-state',open?'open':'closed');content.textContent=answers[lang][Number(faq)];content.style.padding='0 0 16px';return;
   }
   const label=target.getAttribute('data-original-label')||'';
   if(label==='Depoimento anterior'){show(slide-1);return;}
   if(label==='Próximo depoimento'){show(slide+1);return;}
   if(label.startsWith('Ir para depoimento')){show(Number(label.match(/\d+/)?.[0])-1);return;}
   if(target.tagName==='A'){event.preventDefault();const label=target.textContent?.trim();if(label===reference.text[lang][94]||label===reference.text[lang][95]){setMode(label===reference.text[lang][94]?'terms':'privacy');setDialog(true);}else buy('premium');return;}
   const text=target.textContent?.trim()||'';
   if([reference.text[lang][5],reference.text[lang][26]].includes(text)){document.getElementById('planos')?.scrollIntoView({behavior:'auto'});return;}
   if(text===reference.text[lang][64]){event.preventDefault();setMode('upgrade');setDialog(true);return;}
   if(text){event.preventDefault();buy('premium');}
  };
  root.addEventListener('click',click);return()=>root.removeEventListener('click',click);
 },[rendered,lang]);
 useEffect(()=>{
  if(!dialog)return;const previous=document.activeElement as HTMLElement|null;
  const button=document.querySelector<HTMLButtonElement>('.replica-dialog button');button?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setDialog(false);if(e.key==='Tab'){const items=[...document.querySelectorAll<HTMLButtonElement>('.replica-dialog button')];const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[dialog]);
 const change=(next:Lang)=>{setLang(next);history.pushState({},'',`/${next}${location.hash}`);};
 return <><Consent lang={lang}/><div ref={area} dangerouslySetInnerHTML={{__html:rendered}}/><div className="replica-languages" role="group" aria-label="Language / Idioma"><button onClick={()=>change('pt')} aria-pressed={lang==='pt'}>Português</button><button onClick={()=>change('en')} aria-pressed={lang==='en'}>English</button><button onClick={()=>change('it')} aria-pressed={lang==='it'}>Italiano</button><small>{t.preview}</small></div>{dialog&&<div className="replica-dialog" role="dialog" aria-modal="true" aria-labelledby="copy-title"><div><h2 id="copy-title">{mode==='upgrade'?t.title:mode==='terms'?t.terms:mode==='privacy'?t.privacy:t.pending}</h2><p>{mode==='upgrade'?t.message:mode==='terms'?t.termsText:mode==='privacy'?t.privacyText:t.pending}</p>{mode==='upgrade'&&<><button onClick={()=>buy('upgrade')}>{t.accept}</button><button className="secondary-choice" onClick={()=>buy('basic')}>{t.decline}</button></>}<button className="secondary-choice" onClick={()=>setDialog(false)}>{t.close}</button></div></div>}</>;
}
