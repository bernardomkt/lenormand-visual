import React,{useEffect,useState} from 'react';
import config from './tracking.json';
type Lang='pt'|'en'|'it';
type Choice='accepted'|'rejected'|null;
type PixelFn=((...args:unknown[])=>void)&{queue:unknown[][];loaded:boolean;version:string;callMethod?:(...args:unknown[])=>void;push?:PixelFn};
const w=window as Window & {fbq?:PixelFn;_fbq?:PixelFn};
const KEY='lenormand-marketing-consent-v1';
const copy={pt:{title:'A sua privacidade',body:'Podemos usar o pixel da Meta para medir visitas e o desempenho dos anúncios. Só o ativamos se aceitar. Pode recusar e continuar a comprar, ou alterar a escolha mais tarde.',yes:'Aceitar marketing',no:'Recusar marketing',settings:'Preferências de privacidade'},en:{title:'Your privacy',body:'We can use the Meta pixel to measure visits and advertising performance. It only loads if you accept. You can decline and still purchase, or change your choice later.',yes:'Accept marketing',no:'Reject marketing',settings:'Privacy preferences'},it:{title:'La tua privacy',body:'Possiamo usare il pixel Meta per misurare visite e risultati pubblicitari. Si attiva solo con il tuo consenso. Puoi rifiutare e acquistare comunque, oppure cambiare scelta in seguito.',yes:'Accetta marketing',no:'Rifiuta marketing',settings:'Preferenze privacy'}};
function saved():Choice{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return ['accepted','rejected'].includes(v?.choice)?v.choice:null;}catch{return null;}}
function start(){
 if(!/^\d{8,20}$/.test(config.metaPixelId)||w.fbq)return;
 const fn=((...args:unknown[])=>{if(fn.callMethod)fn.callMethod(...args);else fn.queue.push(args);}) as PixelFn;
 fn.queue=[];fn.loaded=true;fn.version='2.0';fn.push=fn;w.fbq=fn;w._fbq=fn;
 fn('consent','grant');fn('init',config.metaPixelId);fn('track','PageView');fn('track','ViewContent',{content_name:'Lenormand Visual',content_ids:['lenormand-visual'],content_type:'product'});
 const script=document.createElement('script');script.id='meta-pixel-consented';script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(script);
}
export function trackCheckoutClick(plan:string,value:number){if(saved()==='accepted'&&w.fbq)w.fbq('trackCustom','CheckoutClick',{plan,value,currency:'EUR'});}
export default function Consent({lang}:{lang:Lang}){
 const [choice,setChoice]=useState<Choice>(saved);const [open,setOpen]=useState(()=>!saved());const t=copy[lang];
 useEffect(()=>{if(choice==='accepted')start();},[choice]);
 const choose=(next:Exclude<Choice,null>)=>{try{localStorage.setItem(KEY,JSON.stringify({choice:next,at:new Date().toISOString(),version:1}));}catch{}setChoice(next);setOpen(false);if(next==='rejected'&&w.fbq){w.fbq('consent','revoke');for(const n of ['_fbp','_fbc']){document.cookie=n+'=; Max-Age=0; path=/; SameSite=Lax';document.cookie=n+'=; Max-Age=0; path=/; domain=.'+location.hostname+'; SameSite=Lax';}location.reload();}};
 if(!config.metaPixelId)return null;
 return <><button className="consent-settings" onClick={()=>setOpen(true)}>{t.settings}</button>{open&&<aside className="consent-panel" aria-labelledby="consent-title"><h2 id="consent-title">{t.title}</h2><p>{t.body}</p><div><button onClick={()=>choose('accepted')}>{t.yes}</button><button onClick={()=>choose('rejected')}>{t.no}</button></div></aside>}</>;
}
