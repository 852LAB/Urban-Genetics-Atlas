/* Internal report: HKHA source-native estate evidence, separate market segment. */
(function(root){
 'use strict';
 const EXPECTED='014b2917d541c3b50b824c2eada5e6404d10fc012d604d28bdf867fecc710caf';
 const local=()=>!root.location||root.location.protocol==='file:'||(['localhost','127.0.0.1','::1','[::1]'].includes(root.location.hostname)||(root.location?.hostname==='852lab.github.io'&&root.location?.pathname?.startsWith('/Urban-Genetics-Atlas/previews/V2RC-20261106T052258Z/')));
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const N=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('en-HK',{maximumFractionDigits:2}):'—';
 const cache=new Map();let booted=false;
 const script='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/site/market-report/v0.1/hkha-secondary.js';
 function data(){const d=root.UGA_HKHA_SECONDARY_DATA;return d?.schema==='HKHA_SECONDARY_SOURCE_COHORT_V0_1'&&d.source_profile_sha256===EXPECTED&&d.observed_entries===61664&&d.estate_identities===252?d:null;}
 function choose(district,min=5,order='rate',query=''){
  const d=data();if(!d)return [];
  const key={rate:'published_rate_hkd_psf',price:'price_hkd',size:'published_saleable_sqft'}[order];
  return Object.values(d.estates).filter(x=>(!district||x.districts.includes(district))&&x.recent.entries>=min&&x.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>(key?(b.recent[key].median??-Infinity)-(a.recent[key].median??-Infinity):b.recent.entries-a.recent.entries)||a.name.localeCompare(b.name));
 }
 function estateTable(district,min=5,order='rate',query=''){
  const rows=choose(district,min,order,query);
  return '<p class="ug-market-meta">'+N(rows.length)+' estates meet this filter. Medians use October 2025–September 2026 entries with the displayed sample counts.</p><div class="ug-market-table"><table><thead><tr><th>Estate / court</th><th>Entries</th><th>Median HK$</th><th>Median HK$/sq ft</th><th>Median sq ft</th><th></th></tr></thead><tbody>'+rows.map(x=>'<tr><th>'+E(x.name)+'</th><td>'+N(x.recent.entries)+'</td><td>'+N(x.recent.price_hkd.median)+'</td><td>'+N(x.recent.published_rate_hkd_psf.median)+'</td><td>'+N(x.recent.published_saleable_sqft.median)+'</td><td><button type="button" data-hkha-estate="'+E(x.estate_native_id)+'">Records</button></td></tr>').join('')+'</tbody></table></div>';
 }
 function render(g={}){
  const d=data();if(!d)return '<p class="ug-market-meta">Saved HKHA secondary context is unavailable.</p>';
  const district=g.district||'',x=district?d.districts[district]?.recent:d.recent,scope=district?'District secondary context · '+district:'Hong Kong secondary overview';
  const metric=(label,value,note)=>'<div class="v2-sheet-metric"><span>'+E(label)+'</span><strong>'+E(value)+'</strong><small>'+E(note)+'</small></div>';
  return '<section class="ug-market-scale ug-hkha-context"><header><span class="ug-market-eyebrow">SUBSIDISED SECONDARY · SEPARATE SOURCE COHORT</span><h4>'+E(scope)+'</h4><p class="ug-market-meta">HOS Secondary Market scheme · PASP months October 2025–September 2026</p></header>'+(x?'<div class="v2-sheet-metric-grid">'+metric('Published HK$/sq ft · median',N(x.published_rate_hkd_psf.median),N(x.published_rate_hkd_psf.sample)+' source entries')+metric('Price · median HK$',N(x.price_hkd.median),N(x.price_hkd.sample)+' source entries')+metric('Saleable size · median sq ft',N(x.published_saleable_sqft.median),N(x.published_saleable_sqft.sample)+' source entries')+'</div>':'<p class="ug-market-empty">No entries for this district are present in the saved source cohort. This is not evidence of zero market activity.</p>')+'<p class="ug-market-meta">'+(district?'District estate context':'Territory source-cohort context')+'; these values are not observations assigned to the selected Building, Lot or Hex. Published rates remain separate from private first-hand rates.</p><details data-hkha-browser data-hkha-district="'+E(district)+'"><summary>Compare estates and inspect source records</summary><div class="ug-hkha-controls"><label>Estate <input type="search" data-hkha-query placeholder="Filter estate names"></label><label>Order <select data-hkha-order><option value="rate">Highest median HK$/sq ft</option><option value="price">Highest median price</option><option value="size">Largest median size</option><option value="count">Most entries</option></select></label><label>Minimum entries <select data-hkha-min><option>5</option><option>1</option><option>10</option><option>20</option></select></label></div><div data-hkha-estates>'+estateTable(district)+'</div><div data-hkha-records aria-live="polite"></div></details><details><summary>Coverage and interpretation</summary><p>Saved evidence contains 61,664 entries across 252 native estate/court identities and 297 monthly sources from January 2002 to September 2026. The recent window contains 4,565 entries; 16 districts possess source observations. No Building or unit identity is supplied by this source. Floor bands are not floor numbers. Counts are not distinct/completed/net sales. Premium-paid status is not inferred. All 113 exact-signature excess entries and historical published extreme values remain retained. Medians describe this changing source sample, not a constant-quality price index or valuation.</p></details></section>';
 }
 async function load(id){
  if(cache.has(id))return cache.get(id);
  const d=data(),file=d?.detail_files[id];if(!/^hkha-details\/[a-f0-9]{64}\.json$/.test(file||''))throw Error('Saved estate route is unavailable.');
  const base=script||(root.document?.querySelector('script[src*="hkha-secondary.js"]')?.src)||new URL('site/market-report/v0.1/hkha-secondary.js',root.document.baseURI).href;
  const r=await root.fetch(new URL(file,base).href);if(!r.ok)throw Error('Saved estate records could not load ('+r.status+').');
  const x=await r.json();if(x.schema!=='HKHA_ESTATE_DETAIL_V0_1'||x.estate_native_id!==id||x.source_profile_sha256!==EXPECTED||x.records.length!==d.estates[id].all.entries)throw Error('Saved estate binding differs.');
  if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(id,x);return x;
 }
 function sourceLink(row){const url=data()?.documents[row.source_sha256]?.source_url;try{const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='www.housingauthority.gov.hk')return '';return '<a href="'+E(u.href)+'" target="_blank" rel="noopener">Official monthly source</a>';}catch{return '';}}
 function recordTable(detail,kind='recent',page=0){
  const rows=detail.records.filter(r=>kind==='all'||(r.pasp_month>='2025-10'&&r.pasp_month<='2026-09')).slice().sort((a,b)=>b.pasp_month.localeCompare(a.pasp_month)||a.witness_id.localeCompare(b.witness_id));
  const last=Math.max(0,Math.ceil(rows.length/50)-1);page=Math.min(Math.max(0,page),last);
  return '<h4>'+E(data().estates[detail.estate_native_id].name)+'</h4><p class="ug-market-meta">'+N(rows.length)+' retained source entries · page '+(page+1)+' / '+(last+1)+'</p><label>Period <select data-hkha-period><option value="recent"'+(kind==='recent'?' selected':'')+'>October 2025–September 2026</option><option value="all"'+(kind==='all'?' selected':'')+'>All saved history · from 2002</option></select></label><button type="button" data-hkha-close>Close records</button><div class="ug-market-table"><table><thead><tr><th>PASP month</th><th>Price · HK$</th><th>Saleable sq ft</th><th>Published HK$/sq ft</th><th>Floor band</th><th>Source</th></tr></thead><tbody>'+rows.slice(page*50,(page+1)*50).map(r=>'<tr><td>'+E(r.pasp_month)+'</td><td>'+N(r.price_hkd)+'</td><td>'+N(r.published_saleable_sqft)+'</td><td>'+N(r.published_rate_hkd_psf)+'</td><td>'+E(r.raw.floor)+'</td><td>'+sourceLink(r)+'<details><summary>Source fields</summary><pre>'+E(JSON.stringify(r.raw,null,2))+'</pre><small>Source-position witness '+E(r.witness_id)+'</small></details></td></tr>').join('')+'</tbody></table></div><button type="button" data-hkha-page="'+(page-1)+'"'+(page===0?' disabled':'')+'>Previous</button><button type="button" data-hkha-page="'+(page+1)+'"'+(page===last?' disabled':'')+'>Next</button>';
 }
 function renderRecords(host,kind='recent',page=0){const detail=cache.get(host.dataset.estate);if(!detail)return;host.dataset.kind=kind;host.dataset.page=String(page);host.innerHTML=recordTable(detail,kind,page);}
 function filter(browser){browser.querySelector('[data-hkha-estates]').innerHTML=estateTable(browser.dataset.hkhaDistrict,Number(browser.querySelector('[data-hkha-min]').value),browser.querySelector('[data-hkha-order]').value,browser.querySelector('[data-hkha-query]').value);}
 function boot(){if(booted||!local()||!root.document)return;const report=root.document.getElementById('placeReportBody');if(!report)return;booted=true;
  report.addEventListener('input',e=>{if(e.target.matches?.('[data-hkha-query]'))filter(e.target.closest('[data-hkha-browser]'));});
  report.addEventListener('change',e=>{if(e.target.matches?.('[data-hkha-order],[data-hkha-min]'))filter(e.target.closest('[data-hkha-browser]'));if(e.target.matches?.('[data-hkha-period]'))renderRecords(e.target.closest('[data-hkha-records]'),e.target.value,0);});
  report.addEventListener('click',async e=>{const button=e.target.closest?.('[data-hkha-estate],[data-hkha-page],[data-hkha-close]');if(!button)return;e.preventDefault();const host=button.closest('[data-hkha-browser]').querySelector('[data-hkha-records]');
   if(button.hasAttribute('data-hkha-close')){host.innerHTML='';host.dataset.estate='';return;}
   if(button.hasAttribute('data-hkha-page')){renderRecords(host,host.dataset.kind,Number(button.dataset.hkhaPage));return;}
   const id=button.dataset.hkhaEstate;host.dataset.estate=id;host.textContent='Loading saved estate records…';
   try{await load(id);if(host.isConnected&&host.dataset.estate===id)renderRecords(host);}catch(error){if(host.isConnected&&host.dataset.estate===id)host.textContent=error.message+' Select Records to retry.';}
  });
 }
 root.UGA_HKHA_SECONDARY_VIEW=Object.freeze({data,render,choose,estateTable,recordTable,load,cache,boot});
 if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
})(globalThis);
