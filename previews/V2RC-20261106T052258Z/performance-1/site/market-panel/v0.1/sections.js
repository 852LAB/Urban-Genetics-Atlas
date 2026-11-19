/* Collapsible Market groups. Existing controls are moved intact, never rebuilt. */
(function(root){
 'use strict';
 const VERSION='UG_MARKET_LEGEND_SECTIONS_V0_1';
 if(root.UGA_MARKET_LEGEND_SECTIONS)return;
 const definitions=[
  {key:'new-developments',selector:'.ug-nd-controls',title:'New Developments'},
  {key:'public-housing',selector:'.ug-ph-controls',title:'Public Housing'},
  {key:'private-residential',selector:'.ug-pr-controls',title:'Private Residential'}
 ];
 const storageKey='uga.market.legend.sections.v1',preferences={};
 try{const saved=JSON.parse(root.localStorage.getItem(storageKey)||'{}');for(const d of definitions)if(typeof saved?.[d.key]==='boolean')preferences[d.key]=saved[d.key];}catch{}
 let host=null,observer=null,pending=false;
 function save(){try{root.localStorage.setItem(storageKey,JSON.stringify(preferences));}catch{}}
 function reconcile(){
  if(!host)return;
  for(const d of definitions){
   const controls=host.querySelector(d.selector);
   if(!controls||controls.closest('[data-ug-market-section]'))continue;
   const group=root.document.createElement('details');group.className='ug-market-section';group.dataset.ugMarketSection=d.key;group.open=preferences[d.key]===true;
   const summary=root.document.createElement('summary'),text=root.document.createElement('span'),title=root.document.createElement('span');
   text.className='ug-market-section-heading';title.className='ug-market-section-title';title.textContent=d.title;text.appendChild(title);
   const caption=controls.querySelector('h3 small')?.textContent?.trim();
   if(caption){const small=root.document.createElement('small');small.textContent=caption;text.appendChild(small);}
   summary.appendChild(text);group.appendChild(summary);
   controls.parentNode.insertBefore(group,controls);group.appendChild(controls);
   group.addEventListener('toggle',()=>{preferences[d.key]=group.open;save();});
  }
 }
 function schedule(){if(pending)return;pending=true;(root.queueMicrotask||(fn=>Promise.resolve().then(fn)))(()=>{pending=false;reconcile();});}
 function boot(){
  if(host||!root.document)return;
  host=root.document.getElementById('marketDataBody');if(!host)return;
  reconcile();
  if(root.MutationObserver){observer=new root.MutationObserver(schedule);observer.observe(host,{childList:true});}
 }
 function diagnostics(){return{version:VERSION,sections:definitions.map(d=>{const group=host?.querySelector('[data-ug-market-section="'+d.key+'"]');return{key:d.key,present:!!group,open:group?.open??null};})};}
 root.UGA_MARKET_LEGEND_SECTIONS=Object.freeze({version:VERSION,refresh:reconcile,diagnostics});
 if(root.document?.readyState==='loading')root.document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(globalThis);
