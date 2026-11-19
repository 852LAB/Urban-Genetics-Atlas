/* Internal DEV Market view: native context, separate scales and source drill-down. */
(function(root){
 'use strict';
 const VERSION='UG_MARKET_REPORT_VIEW_V0_4',EXPECTED_SOURCE='9b818f5365766d8b60d3f0565b03654f77a36810b414bb98d7153f9b02ab4808';
 const local=()=>!root.location||root.location.protocol==='file:'||(['localhost','127.0.0.1','::1','[::1]'].includes(root.location.hostname)||(root.location?.hostname==='852lab.github.io'&&root.location?.pathname?.startsWith('/Urban-Genetics-Atlas/previews/V2RC-20261106T052258Z/')));
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const valid=v=>typeof v==='number'&&Number.isFinite(v);
 const num=v=>valid(v)?v.toLocaleString('en-HK',{maximumFractionDigits:0}):'—';
 const pct=v=>valid(v)?v.toLocaleString('en-HK',{maximumFractionDigits:1})+'%':'—';
 const trend=v=>valid(v)?(v>0?'+':'')+v.toLocaleString('en-HK',{maximumFractionDigits:1})+'%':'—';
 const date=v=>/^\d{4}-\d{2}(?:-\d{2})?$/.test(v||'')?new Date(v.length===7?v+'-01T00:00:00Z':v+'T00:00:00Z').toLocaleDateString('en-GB',{...(v.length===7?{}:{day:'numeric'}),month:'short',year:'numeric',timeZone:'UTC'}):String(v||'date unavailable');
 const metric=(label,value,detail='')=>'<div class="v2-sheet-metric"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong>'+(detail?'<small>'+esc(detail)+'</small>':'')+'</div>';
 let activeModel=null,legacyBridge=null,booted=false;
 function context(){const d=root.UGA_MARKET_REPORT_CONTEXT;return d?.schema==='UG_MARKET_REPORT_CONTEXT_V0_1'&&d.source_engine_sha256===EXPECTED_SOURCE&&d.macro?.version==='macro-market-v2.0'&&d.meso?.version==='meso-market-v2.0'&&Object.keys(d.meso.districts||{}).length===18?d:null;}
 function geography(record={}){record=record||{};const d=context(),name=String(record.had_name_en||record.HAD_EN||'').trim().replace(/\s+District$/i,'');if(!d?.meso.districts[name])return {district:null,region:null};const hk=['Central and Western','Eastern','Southern','Wan Chai'],kowloon=['Kowloon City','Kwun Tong','Sham Shui Po','Wong Tai Sin','Yau Tsim Mong'];return {district:name,region:hk.includes(name)?'Hong Kong':kowloon.includes(name)?'Kowloon':'New Territories'};}
 function safeLink(value,label){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?'<a href="'+esc(u.href)+'" target="_blank" rel="noopener">'+esc(label)+'</a>':'';}catch{return '';}}
 function chart(rows,key,label){const values=(rows||[]).filter(r=>valid(r[key])&&/^\d{4}-\d{2}$/.test(r.date));if(values.length<2)return '';const lo=Math.min(...values.map(r=>r[key])),hi=Math.max(...values.map(r=>r[key])),span=hi-lo||1;const points=values.map((r,i)=>(5+i*290/(values.length-1)).toFixed(2)+','+(65-(r[key]-lo)/span*55).toFixed(2)).join(' ');return '<figure class="ug-market-chart"><svg viewBox="0 0 300 76" role="img" aria-label="'+esc(label)+'"><path d="M5 65H295" stroke="currentColor" opacity=".15"/><polyline points="'+points+'" fill="none" stroke="currentColor" stroke-width="2"/></svg><figcaption><strong>'+esc(label)+'</strong><span>'+esc(date(values[0].date))+'–'+esc(date(values.at(-1).date))+' · '+num(lo)+'–'+num(hi)+'</span></figcaption></figure>';}
 // Descriptive comparisons retain their source cohort and native measure.
 const median=values=>{const xs=values.filter(valid).sort((a,b)=>a-b),i=Math.floor(xs.length/2);return xs.length?(xs.length%2?xs[i]:(xs[i-1]+xs[i])/2):null;};
 function relative(value,baseline,points=false){
  if(!valid(value)||!valid(baseline))return 'Comparison unavailable';
  const difference=value-baseline;
  if(Math.abs(difference)<1e-9)return 'At the benchmark';
  if(points)return Math.abs(difference).toLocaleString('en-HK',{maximumFractionDigits:2})+' percentage points '+(difference>0?'above':'below');
  return baseline>0?Math.abs(difference/baseline*100).toLocaleString('en-HK',{maximumFractionDigits:1})+'% '+(difference>0?'above':'below'):'Difference '+num(difference);
 }
 function peerCard(title,value,baseline,unit,support,note='',points=false){
  if(!valid(value)||!valid(baseline))return '';
  const show=v=>(unit==='%'?pct(v):(unit==='HK$'?'HK$':'')+num(v)+(unit==='HK$/sq ft'?' HK$/sq ft':unit==='sq ft'?' sq ft':''));
  return '<div class="ug-market-peer"><strong>'+esc(title)+'</strong><div><span>This value <b>'+esc(show(value))+'</b></span><span>Benchmark <b>'+esc(show(baseline))+'</b></span></div><p>'+esc(relative(value,baseline,points))+' · '+esc(support)+'</p>'+(note?'<small>'+esc(note)+'</small>':'')+'</div>';
 }
 function privatePeers(r){
  const a=root.UGA_PRIVATE_RESALE;if(!a?.data())return '';
  const all=a.data().records,cohort=group=>a.rows(group),own=cohort(r),minimum=a.state.minimum;
  const sets=[...(r.hma?[['Provider area · '+r.hma,all.filter(x=>x.hma===r.hma)]]:[]),['Captured Hong Kong cohort',all]];
  let content='';
  for(const [title,places] of sets){
   const rs=places.flatMap(cohort);
   for(const [key,label,unit] of [['published_rate_hkd_psf','Saleable rate','HK$/sq ft'],['amount_hkd',a.state.segment==='sale'?'Sale price':'Published rent','HK$']]){
    const values=own.map(x=>x[key]).filter(x=>valid(x)&&x>0),peers=rs.map(x=>x[key]).filter(x=>valid(x)&&x>0);
    if(values.length<minimum||peers.length<minimum)continue;
    content+=peerCard(label+' · '+title,median(values),median(peers),unit,values.length+' place entries / '+peers.length+' benchmark entries');
   }
  }
  return content?'<section class="ug-market-peer-group"><h3>How this captured sample compares</h3><p class="ug-market-meta">'+esc(a.sourceText()+' · '+a.typeText())+' · '+esc(a.state.period==='all'?a.data().date_start+'–'+a.data().date_end:'Last '+a.state.period+' calendar days to '+a.data().snapshot_date)+'</p>'+content+'<p class="ug-market-meta">Entry-weighted medians using the same source, property and period filters; special cases excluded. Benchmarks include this place and unmapped records. Provider area is its published HMA. Text search does not redefine these benchmarks. Property size/mix is not adjusted; differences are descriptive.</p></section>':'<p class="ug-market-meta">Comparison needs at least '+num(minimum)+' positive values in this place and benchmark, under the selected cohort.</p>';
 }
 function housingPeers(r){
  const a=root.UGA_PUBLIC_HOUSING;if(!a?.data())return '';
  let content='';
  for(const [key,title] of [['secondary','Secondary-market scheme'],['tps','TPS sales to tenants']]){
   const get=x=>key==='tps'?x.tps?.recent:x.secondary,own=get(r),value=own?.published_rate_hkd_psf?.median,n=own?.published_rate_hkd_psf?.sample;
   if(!valid(value)||value<=0||!valid(n)||n<a.state.min)continue;
   for(const [label,places] of [['Same official district',a.data().records.filter(x=>x.district===r.district)],['Captured Hong Kong estates',a.data().records]]){
    if(label==='Same official district'&&!r.district)continue;
    const xs=places.map(get).filter(s=>valid(s?.published_rate_hkd_psf?.median)&&s.published_rate_hkd_psf.median>0&&s.published_rate_hkd_psf.sample>=a.state.min);
    if(xs.length<3)continue;
    content+=peerCard(title+' · '+label,value,median(xs.map(s=>s.published_rate_hkd_psf.median)),'HK$/sq ft',num(n)+' place entries / '+num(xs.length)+' supported estate medians',key==='tps'?'Assignment dates · tenant-purchase prices':'PASP months · secondary scheme evidence');
   }
  }
  return content?'<section class="ug-market-peer-group"><h3>Estate rates in context</h3><p class="ug-market-meta">October 2025–September 2026 · minimum '+num(a.state.min)+' rate observations per estate; minimum 3 comparable estates.</p>'+content+'<p class="ug-market-meta">Unweighted median of supported estate medians, including this estate; not a pooled transaction median. Each programme stays separate. No size, premium or property-mix adjustment; this is a descriptive comparison.</p></section>':'';
 }
 function buildingPeers(rs){
  const a=root.UGA_PRIVATE_RESALE;if(!a?.data())return '';
  const all=a.data().records.flatMap(r=>r.rows);let html='';
  for(const [segment,source,title] of [['sale','Land','Registry-labelled sales'],['rent','AC','Agency-reported rentals']]){
   const values=rows=>rows.filter(x=>x.segment===segment&&x.source_label===source&&x.unit_type==='AP'&&!x.special_case).map(x=>x.published_rate_hkd_psf).filter(v=>valid(v)&&v>0),own=values(rs),peers=values(all);
   if(own.length>=3&&peers.length>=3)html+=peerCard(title,median(own),median(peers),'HK$/sq ft',own.length+' Building entries / '+peers.length+' captured HK entries');
  }
  return html?'<section class="ug-market-peer-group"><h4>Building rates in context</h4>'+html+'<p class="ug-market-meta">Standard apartment source class · '+esc(a.data().date_start+'–'+a.data().date_end)+'. Entry-weighted medians; minimum 3 observations. Benchmarks include this Building and unmapped records. No size or mix adjustment; not a valuation. Rental payment period remains unspecified by the source.</p></section>':'';
 }
 function developmentPeers(r){
  const a=root.UGA_NEW_DEVELOPMENTS;if(!a)return '';
  const cohort=a.select(a.state.branch,''),rows=[];
  for(const [mode,title] of [['asking_rate','Asking rates'],['current_area_rate','Recorded rates · current area']]){
   const eligible=x=>{const c=a.currentFor(x),g=a.registryFor(x);return mode==='asking_rate'?c?.asking?.ranking_eligible&&c.asking.rows>=3:g?.recent?.rate_sample_count>=3;};
   if(!eligible(r))continue;
   const xs=cohort.filter(eligible).map(x=>a.metric(x,mode)).filter(v=>valid(v)&&v>0),v=a.metric(r,mode);
   if(xs.length>=3&&valid(v))rows.push(peerCard(title,v,median(xs),'HK$/sq ft',num(xs.length)+' supported development medians',mode==='asking_rate'?'Published generic asking basis · current snapshot':'Retained recent 365-day register cohort / current published area'));
  }
  return rows.length?'<section class="ug-market-peer-group"><h4>Compared with captured developments</h4>'+rows.join('')+'<p class="ug-market-meta">Unweighted median of development medians in the '+esc(a.state.branch)+' branch, including this project. At least 3 rate observations per development and 3 developments. Text search does not redefine the benchmark. Size, launch and payment mix differ; this is not a discount, valuation or price-change measure.</p></section>':'';
 }
 function districtPeers(d,g){
  const selected=d.meso.districts[g.district];if(!selected)return '';
  const s=selected.supply_balance||{},stock=selected.structure?.stock,actual=Object.keys(s.actual_completions||{}).sort().at(-1),forecast=Object.keys(s.published_forecast_completions||{}).sort().at(-1),all=Object.values(d.meso.districts);
  const ratePercent=(x,kind,year)=>{const value=x.supply_balance?.[kind]?.[year]?.rate_of_stock;return x.structure?.stock?.period===stock?.period&&valid(value)?value*100:null;};
  const specs=[['Vacancy',x=>x.supply_balance?.vacancy?.period===s.vacancy?.period?x.supply_balance.vacancy.pct:null,s.vacancy?.period],['Actual completions / stock',x=>ratePercent(x,'actual_completions',actual),actual],['Published forecast / stock',x=>ratePercent(x,'published_forecast_completions',forecast),forecast]];
  const rows=specs.map(([title,get,period])=>{const v=get(selected),xs=all.map(get).filter(valid);return xs.length>=3?peerCard(title,v,median(xs),'%',xs.length+' same-period districts · '+period,title==='Vacancy'?'Unweighted median of district vacancy percentages':'Unweighted median of district supply/stock ratios; stock year '+stock?.period,true):'';}).join('');
  return rows?'<section class="ug-market-peer-group"><h4>District position</h4>'+rows+'<p class="ug-market-meta">Comparisons use each measure’s matching published period. Higher supply or vacancy is a structural difference, not a quality score.</p></section>':'';
 }
 function macroPeers(d,g){
  const a=d.macro.activity||{},regions=d.macro.direction?.regions||{},r=regions[g.region];let html='';
  if(valid(a.recent_3m_average)&&valid(a.baseline_24m_median))html+=peerCard('Recent registration activity',a.recent_3m_average,a.baseline_24m_median,'entries','3-month monthly average / 24-month monthly median','Hong Kong territory · through '+date(a.latest_date));
  if(r)for(const [key,title,period] of [['price_trend_12m_pct','Regional price change · 12m','latest_price_date'],['rent_trend_12m_pct','Regional rent change · 12m','latest_rent_date']]){
   const xs=Object.values(regions).filter(x=>x[period]===r[period]).map(x=>x[key]).filter(valid);
   if(xs.length>=2)html+=peerCard(title,r[key],median(xs),'%',xs.length+' published regions · '+date(r[period]),'Unweighted median regional change; not a territory-weighted index',true);
  }
  return html?'<section class="ug-market-peer-group"><h4>Wider market in context</h4>'+html+'</section>':'';
 }
 function mapButtons(kind,label,id=''){
  return '<div class="ug-market-actions"><button type="button" data-ug-market-map="'+esc(kind)+'" data-map-id="'+esc(id)+'">Show '+esc(label)+' on map</button></div>';
 }
 function mapMessage(message){
  let el=root.document?.querySelector('#placeReportBody [data-market-map-message]');
  if(!el){const body=root.document?.getElementById('placeReportBody');if(!body)return;el=root.document.createElement('p');el.dataset.marketMapMessage='';el.setAttribute('role','status');body.prepend(el);}
  el.textContent=message;
 }
 function showOnMap(kind,id=''){
  const config={nd:[root.UGA_NEW_DEVELOPMENTS,'nd'],ph:[root.UGA_PUBLIC_HOUSING,'ph'],pr:[root.UGA_PRIVATE_RESALE,'pr']}[kind],a=config?.[0],map=root.UGA_V2_MAP;
  if(!a||!map){mapMessage('The map is not available yet. This report and its records remain open.');return false;}
  const features=a.geojson().features.filter(f=>!id||String(f.properties?.id)===String(id)),points=features.map(f=>f.geometry?.coordinates).filter(p=>Array.isArray(p)&&p.length>=2&&p.every(valid));
  if(!points.length){mapMessage('No mapped locations match this selection and the current legend filters. Unmapped records remain in the catalogue.');return false;}
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),same=xs.every(x=>x===xs[0])&&ys.every(y=>y===ys[0]);
  try{
   a.state.enabled=true;if(id)a.state.selected=String(id);
   const control=root.document?.querySelector('[data-'+config[1]+'-enable]');if(control){control.checked=true;control.dispatchEvent(new root.Event('change',{bubbles:true}));}
   a.refreshMap();
   if(same)map.easeTo({center:points[0],zoom:15,duration:500});
   else map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:70,maxZoom:15,duration:500});
   const section=control?.closest('details');if(section)section.open=true;
   // Explicit map action reveals the map; opening a catalogue alone never enables a layer.
   root.UGA_V2_REPORT_HOST?.close();return true;
  }catch(e){mapMessage('Map navigation unavailable: '+e.message);return false;}
 }

 function browse(){return mapButtons('nd','new developments')+'<button type="button" data-ug-market-browse>Browse development records</button>';}
 function entityEvidence(model){const a=root.UGA_NEW_DEVELOPMENTS;let content='';if(model?.entityType==='building'&&a){const linked=a.select('all','').filter(r=>a.buildingId(r)===String(model.focus?.id));for(const r of linked){content+='<div class="ug-market-source"><p class="ug-market-eyebrow">NEW DEVELOPMENTS · PRIVATE FIRST-HAND</p><h4>'+esc(r.name_en)+(r.phase?' · '+esc(r.phase):'')+'</h4>';if(a.currentFor(r))content+=a.currentOverview(r);else{const s=a.areaFor(r);content+='<p class="ug-market-meta">Retained register · '+esc(date(r.register_update))+'</p><div class="v2-sheet-metric-grid">'+metric('Retained entries',num(r.entry_count))+metric('Dated-area rate sample',num(s?.summary.rate_sample_count))+'</div><p>Current snapshot comparison is not connected for this source.</p><button type="button" data-nd-action="detail" data-nd-id="'+esc(r.source_native_id)+'">Explore retained records and sources</button>';}content+='</div>';}}
  if(!content)content='<p class="ug-market-empty">'+(model?.entityType==='building'?'No reviewed SRPE new-development link is connected to this Building.':'Unit-price evidence remains with reviewed Buildings and development phases; no unit rate is assigned to this area or Lot.')+'</p>'+browse();
  return '<section class="ug-market-scale ug-market-entity"><header><span class="ug-market-eyebrow">MICRO · THIS PLACE</span><h4>'+esc(model?.entityType==='building'?'This Building · linked market evidence':'This selected area · linked market evidence')+'</h4></header>'+content+'</section>';
 }
 function wider(d,g){const m=d.macro,regional=m.direction?.regions||{},r=regional[g.region],a=m.activity||{},mix=m.market_mix||{};const regionalRows=Object.entries(regional).map(([key,x])=>'<tr><th>'+esc(key==='Hong Kong'?'Hong Kong Island':key)+'</th><td>'+trend(x.price_trend_12m_pct)+'</td><td>'+trend(x.rent_trend_12m_pct)+'</td><td>'+esc(date(x.latest_price_date))+'</td></tr>').join('');
  const movement=r?'<div class="v2-sheet-metric-grid">'+metric('Regional price movement · 12m',trend(r.price_trend_12m_pct),date(r.latest_price_date))+metric('Regional rent movement · 12m',trend(r.rent_trend_12m_pct),date(r.latest_rent_date))+'</div>':'<p class="ug-market-empty">No regional context is assigned to this place. The three published regions remain separate below.</p>';
  const share=valid(mix.primary_share)?Math.max(0,Math.min(100,mix.primary_share*100)):null;
  return '<section class="ug-market-scale"><header><span class="ug-market-eyebrow">MACRO · WIDER MARKET</span><h4>Hong Kong overview · '+esc(g.region==='Hong Kong'?'Hong Kong Island':g.region||'regional detail below')+'</h4><p class="ug-market-meta">Scope: regional prices/rents; Hong Kong territory registrations · through '+esc(date(a.latest_date))+'</p></header>'+movement+'<div class="v2-sheet-metric-grid ug-market-spaced">'+metric('Residential ASP registrations',num(a.latest_transactions),'Hong Kong territory · '+date(a.latest_date))+metric('Primary / secondary mix',pct(valid(mix.primary_share)?mix.primary_share*100:null)+' / '+pct(valid(mix.secondary_share)?mix.secondary_share*100:null),date(mix.latest_date))+'</div>'+(share===null?'':'<div class="ug-market-mix" role="img" aria-label="Primary '+pct(mix.primary_share*100)+'; secondary '+pct(mix.secondary_share*100)+'"><i style="width:'+share+'%"></i></div>')+chart(a.series,'transactions','Hong Kong residential ASP registrations')+macroPeers(d,g)+'<details><summary>Regional comparison and interpretation</summary><div class="ug-market-table"><table><thead><tr><th>Region</th><th>Price · 12m</th><th>Rent · 12m</th><th>Period</th></tr></thead><tbody>'+regionalRows+'</tbody></table></div><p>Price and rent movement are the retained derived regional measures based on published RVD evidence. Regional movement and territory activity are context, not a valuation of this property. ASP registrations are not completed-sale counts; subsidised segments retain their own coverage.</p></details></section>';
 }
 function district(d,g){const x=d.meso.districts[g.district];if(!x)return '<section class="ug-market-scale"><header><span class="ug-market-eyebrow">MESO · DISTRICT</span><h4>District context not connected</h4></header><p class="ug-market-empty">A supported district key is needed to show vacancy, stock and supply here. No district is inferred from a name or nearby point.</p></section>';
  const stock=x.structure?.stock||{},s=x.supply_balance||{},vacancy=s.vacancy||{},actual=Object.entries(s.actual_completions||{}).sort().at(-1),forecast=Object.entries(s.published_forecast_completions||{}).sort().at(-1),activity=x.activity||{},direct=activity.scope==='DISTRICT_DIRECT',reading=direct?activity.district_activity:activity.broader_market_context;
  return '<section class="ug-market-scale"><header><span class="ug-market-eyebrow">MESO · DISTRICT</span><h4>District context · '+esc(g.district)+'</h4><p class="ug-market-meta">Private domestic structure · published source periods</p></header><div class="v2-sheet-metric-grid">'+metric('Housing stock',num(stock.total_units),stock.period||'period unavailable')+metric('Vacancy',pct(vacancy.pct),vacancy.period||'period unavailable')+metric('Actual completions',num(actual?.[1].total),actual?.[0]||'period unavailable')+metric('Published forecast completions',num(forecast?.[1].total),forecast?.[0]||'period unavailable')+'</div><div class="ug-market-activity"><strong>'+esc(direct?'District activity':'Broader activity context')+'</strong><span>'+num(reading?.latest_transactions)+' building-unit ASP registrations · '+esc(activity.source_geography==='Hong Kong'?'Hong Kong Island':activity.source_geography||'geography unavailable')+' · '+esc(date(reading?.latest_date))+'</span><small>'+esc(direct?'Directly published for this district.':'Inherited regional context; this is not a count observed in the district.')+'</small></div>'+districtPeers(d,g)+'<details><summary>Supply detail and source support</summary><p>Stock '+esc(stock.period)+' · vacant units '+num(vacancy.vacant_units)+' ('+esc(vacancy.period)+'). Completions and published forecasts retain their own years; forecasts are not observed supply.</p><div class="ug-market-table"><table><thead><tr><th>Year</th><th>Actual completions</th><th>Published forecast</th></tr></thead><tbody>'+[...new Set([...Object.keys(s.actual_completions||{}),...Object.keys(s.published_forecast_completions||{})])].sort().map(y=>'<tr><th>'+esc(y)+'</th><td>'+num(s.actual_completions?.[y]?.total)+'</td><td>'+num(s.published_forecast_completions?.[y]?.total)+'</td></tr>').join('')+'</tbody></table></div><p>District evidence is context for this place. No stock, vacancy or transaction total is allocated to its Building, Lot or Hex.</p></details></section>';
 }
 function render(record,model,legacy=''){const d=context(),g=geography(record),source=d?'<details class="ug-market-sources"><summary>Sources, dates and methods</summary><p>Engine snapshot '+esc(d.raw_snapshot)+' · generated '+esc(d.generated_at_utc)+'. '+esc(d.macro.version)+' / '+esc(d.meso.version)+'. Values are retained from the accepted saved product; no source refresh or analytical recalculation is performed by this report.</p><ul>'+Object.entries(d.sources).map(([id,s])=>'<li>'+safeLink(s.catalog_url||s.url,s.name||({rvd_pd_stock_by_district:'RVD private domestic stock by district',rvd_pd_completions_forecast_by_district:'RVD completions and forecast supply',rvd_pd_forecast_by_class_district:'RVD forecast supply by class and district',rvd_pd_assessments_by_district:'RVD valuation-list assessments'})[id]||s.provider||'Official source')+'</li>').join('')+'</ul><p>Monthly market evidence, annual district structure and the new-development snapshot have different periods. Missing values remain unassessed. Rateable values are not transaction prices; no Dynamism or UGS-M score is calculated.</p></details>':'';
  return '<div class="ug-market-view" data-ug-market-report="'+VERSION+'"><p class="ug-market-scope">Selected '+esc(model?.entityType||'place')+' · the sections below retain their own geography.</p>'+entityEvidence(model)+(root.UGA_MARKET_ANALYSIS?.hexReport(record,model)||'')+(d?'<div class="ug-market-context-grid">'+district(d,g)+wider(d,g)+'</div>':'<p class="ug-market-empty">The saved Macro/Meso product is unavailable or its source binding differs. Entity evidence remains separately inspectable.</p>')+(d&&root.UGA_HKHA_SECONDARY_VIEW?root.UGA_HKHA_SECONDARY_VIEW.render(g):'')+'<p class="ug-market-scope">Public &amp; subsidised housing: <button type="button" data-ph-open-browser>Browse housing records</button></p>'+mapButtons('ph','public / subsidised locations')+''+source+(legacy?'<details class="ug-market-legacy"><summary>Contextual screens and retained class tables · '+esc(date(d?.legacy_browser_period))+'</summary><p class="ug-market-meta">Browser snapshot '+esc(d?.legacy_browser_snapshot||'unavailable')+'. When the current analysis bridge is installed, Momentum, Pulse and Exposure use its separately labelled market period. Class tables retain the original browser observation dates; they are not refreshed by recalculating scores.</p>'+legacy+'</details>':'')+'</div>';
 }
 function installBridge(){const old=root.UGA_MARKET_REPORT;if(!old||old.marketReportViewVersion===VERSION)return;legacyBridge=old;root.UGA_MARKET_REPORT=Object.freeze({...old,marketReportViewVersion:VERSION,reportHtml(record){let previous='';try{previous=old.reportHtml(record);}catch{}return render(record,activeModel,previous);}});}
 function install(api=root.UGA_V2_REPORT){if(!local()||!api||api.marketReportViewVersion===VERSION)return api;const wrapped=Object.freeze({...api,marketReportViewVersion:VERSION,renderReportHtml(model){const before=activeModel;activeModel=model;try{installBridge();let value=api.renderReportHtml(model);if(!value.includes('data-ug-market-report=')){const block='<div class="v2-sheet-section-title"><div><span>MARKET</span><h2>Prices, activity and place context</h2></div></div><section class="v2-sheet-card v2-sheet-card--market"><h3>Market context</h3>'+render(model.record,model)+'</section>';const at=value.indexOf('<footer class="v2-sheet-footer">');if(at>=0)value=value.slice(0,at)+block+value.slice(at);}return value.replace('<span>MARKET · LENSES &amp; EVIDENCE</span><h2>Market movement, activity and place context</h2>','<span>MARKET</span><h2>Prices, activity and place context</h2>');}finally{activeModel=before;}}});root.UGA_V2_REPORT=wrapped;return wrapped;}
 function suppressNativeBuilding(id){return !!activeModel&&activeModel.entityType==='building'&&String(activeModel.focus?.id)===String(id);}
 function focusMarket(expectedId){
  const host=root.document?.getElementById('placeReportBody');if(!host)return false;
  const choose=()=>{const focus=root.UGA_V2_SELECTION?.snapshot?.()?.focus;if(expectedId&&focus?.id&&String(focus.id)!==String(expectedId))return true;const button=host.querySelector('[data-report-tab="market"]');if(!button)return false;button.click();return true;};
  if(choose())return true;if(!root.MutationObserver)return false;
  let timer;const observer=new root.MutationObserver(()=>{if(choose()){observer.disconnect();root.clearTimeout?.(timer);}});observer.observe(host,{childList:true,subtree:true});timer=root.setTimeout(()=>observer.disconnect(),2500);return true;
 }
 function boot(){if(booted||!local()||!root.document)return;booted=true;installBridge();root.document.getElementById('placeReportBody')?.addEventListener('click',event=>{const mapButton=event.target.closest?.('[data-ug-market-map]');if(mapButton){event.preventDefault();showOnMap(mapButton.dataset.ugMarketMap,mapButton.dataset.mapId||'');return;}if(event.target.closest?.('[data-ug-market-browse]')){event.preventDefault();root.UGA_NEW_DEVELOPMENTS?.openCatalogue();}});}
 root.UGA_MARKET_REPORT_VIEW=Object.freeze({version:VERSION,context,geography,render,entityEvidence,install,suppressNativeBuilding,focusMarket,chart,safeLink,boot,median,relative,peerCard,privatePeers,buildingPeers,housingPeers,developmentPeers,districtPeers,macroPeers,mapButtons,showOnMap});
 if(local())install();
 if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
})(globalThis);
