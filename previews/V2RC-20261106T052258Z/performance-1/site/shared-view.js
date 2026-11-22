/* Public URL contract. Entries in these version-one dictionaries are append-only. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const city='#ugMobilityCitywideSection ';
  const ids=s=>s.split(' ').map(id=>'#'+id);
  const data=s=>s.split(' ').map(key=>'[data-'+key+']');
  // Dependency order matters. A change to a parent can rebuild its available controls.
  const controls=[
    ...ids('basemapToggle buildingBaseToggle fabricToggle fabricOpacity terrainToggle reclaimedToggle reclamation-min reclamation-max buildingAgeToggle building-age-min building-age-max heritageToggle grade1Toggle grade2Toggle grade3Toggle mtrToggle mtrColourToggle buildingHeightToggle building-height-min building-height-max roadsToggle roadHighwayToggle roadMainToggle roadSecondaryToggle analysisToggle theme capacityContext analysisOpacity fabricMeasureTheme'),
    ...ids('marketVisibilityToggle marketContextOverlay marketContextOpacity'),
    ...data('nd-enable nd-branch nd-colour ph-enable ph-filter ph-measure ph-min pr-enable'),
    ...['segment','source','types','period','minimum','metric'].map(k=>'#marketDataBody [data-pr-control="'+k+'"]'),
    ...data('ma-source ma-basis'),...ids('demographicsToggle demographicsTheme'),'[data-uga-demo-opacity]',
    ...ids('climateToggle climateTheme climateScenario climateOpacity ugCitywideView ugCitywideBand ugCitywideTime ugCitywideFamily'),
    ...data('ugsp-map-mode ugsp-map-distance ugsp-map-time ugsp-road-reading ugsp-road-time ugc-signature-reading ugc-signature-focus ugc-signature-mode ugc-signature-minutes visible opacity').map(s=>city+s),
    ...['0','1'].map(i=>city+'[data-legend-bound="'+i+'"]')
  ];
  const modes=['all','walk','main','light','car','taxi'];
  const recordTypes=['hex','building','lot'], sources=['public-housing','private-resale','new-development'];
  const tabs=['overview','analysis','demographics','mobility','climate','market'];
  const byKind=()=>[window.UGA_PUBLIC_HOUSING,window.UGA_PRIVATE_RESALE,window.UGA_NEW_DEVELOPMENTS];
  const safeId=v=>typeof v==='string' && /^[a-zA-Z0-9:_./-]{1,100}$/.test(v) && !v.includes('..') && !v.includes('/');
  const recordOK=e=>Array.isArray(e)&&recordTypes.includes(e[0])&&safeId(e[1])&&(e[0]!=='hex'||/^[1-9]\d{0,8}$/.test(e[1]));
  const round=(n,d)=>Number(n.toFixed(d));
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const selection=()=>window.UGA_V2_SELECTION?.snapshot();
  function value(n){return n.type==='checkbox'?Number(n.checked):n.type==='range'?Number(n.value):n.value;}
  function apply(n,v) {
    if(!n || v===null || value(n)===v)return;
    if(n.type==='checkbox'){if(v!==0&&v!==1)return;n.checked=!!v;}
    else if(n.tagName==='SELECT'){if(![...n.options].some(o=>o.value===v))return;n.value=v;}
    else if(n.type==='range'){
      if(!Number.isFinite(v)||v<Number(n.min||0)||v>Number(n.max||100))return;
      n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));
    }else return;
    n.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function names(selector,attr){return $$(selector).filter(n=>!n.checked).map(n=>n.getAttribute(attr));}
  function entity(){
    const state=selection(), f=state?.focus||state?.selection?.initialFocus;
    return f && recordOK([f.type,String(f.id)])?[f.type,String(f.id)]:null;
  }
  function external(){
    const kind=$('#placeReportPanel').dataset.externalReportKind, index=sources.indexOf(kind), s=byKind()[index]?.state;
    if(!s)return null;
    return [index,s.view,s.selected||null,s.pinned||null,s.tab||null,(index===1&&s.view!=='catalogue'?s.tablePage:s.page)||0,s.snapshotKind||null,s.recordSort||null,s.building||null,s.snapshotSort||null];
  }
  const querySelectors=['[data-ph-query]','[data-pr-query]','[data-nd-query]'];
  function searchable(record,index){
    const fields=index===0?[record.name,record.name_zh,record.district,record.provider,record.category]:
      index===1?[record.name,record.name_zh,record.district,record.hma]:[record.name_en,record.name_zh,record.phase,record.address,record.planning_area,window.UGA_NEW_DEVELOPMENTS_BUILDING_LINKS?.records?.[record.source_native_id]?.display_label_zh];
    const text=fields.join(' ').toLowerCase();return index===2?normaliseDevelopment(text):text;
  }
  const normaliseDevelopment=s=>s.normalize('NFKC').replace(/[’']/g,'').replace(/[^0-9a-z\u3400-\u9fff]+/g,' ').trim().replace(/\s+/g,' ');
  function sourceFilter(api,index){
    if(!api?.state.query)return null;
    const term=api.state.query.toLowerCase();
    const words=index===2?normaliseDevelopment(term).split(' '):[index===1?term.trim():term];
    if(!words[0])return null;
    const row=api.select()[0];
    if(!row)return [0];
    const publicText=searchable(row,index);
    const ranges=words.map(word=>[publicText.indexOf(word),word.length]);
    if(ranges.some(r=>r[0]<0)||ranges.length>32)return null;
    return [String(row.id||row.source_native_id),ranges];
  }
  function applySourceFilter(api,index,descriptor){
    if(!descriptor)return true;
    const input=$(querySelectors[index]);if(!api||!input)return false;
    let term='No matching public record';
    if(descriptor[0]!==0){
      const rows=index===2?api.select('all',''):api.data()?.records;
      const row=rows?.find(r=>String(r.id||r.source_native_id)===descriptor[0]);if(!row)return false;
      const publicText=searchable(row,index);
      if(descriptor[1].some(([start,len])=>start+len>publicText.length))return false;
      term=descriptor[1].map(([start,len])=>publicText.slice(start,start+len)).join(' ');
    }
    input.value=term;input.dispatchEvent(new Event('input',{bubbles:true}));return true;
  }
  function read(report){
    const map=window.UGA_V2_MAP,c=map.getCenter(),z=map.getZoom(),network=window.UGA_V2_MOBILITY_NETWORK?.state(),f=entity();
    const v={c:[round(c.lng,5),round(c.lat,5),round(z,3),round(map.getBearing(),2),round(map.getPitch(),2)],a:controls.map(s=>$(s)?value($(s)):null)};
    while(v.a.at(-1)===null)v.a.pop();
    const u=names('[data-ugs-code]','data-ugs-code'),k=names(city+'[data-legend-class]','data-legend-class');
    if(u.length)v.u=u;if(k.length)v.k=k;if(f)v.e=f;
    const hit=selection()?.selection?.clickedLngLat;
    if(f?.[0]==='hex' && Number.isFinite(hit?.lng)&&Number.isFinite(hit?.lat))v.o=[round(hit.lng,5),round(hit.lat,5)];
    const pins=byKind().map(api=>[api?.state.selected||null,api?.state.pinned||null]);
    if(pins.some(pair=>pair.some(Boolean)))v.m=pins;
    const filters=byKind().map(sourceFilter);if(filters.some(Boolean))v.q=filters;
    const choices=byKind().map(api=>api?.state.choices||null);
    if(choices.some(items=>items?.length))v.b=choices;
    if(network){
      const t=network.target;
      v.j=[network.minutes,network.modes,Math.round(network.opacity*100),t&&recordOK([t.grain,String(t.id)])?[t.grain,String(t.id)]:null,
        network.pathVisible?2:(network.enabled||network.profile)?1:0,network.profile?.basis||t?.basis||null];
      if(network.sharedDestinations?.[0])v.g=network.sharedDestinations;
      if(network.facilitiesVisible)v.f=1;
    }
    if(report){
      v.r=1;
      const x=external();if(x)v.x=x;
      const detail=$('#placeReportBody [data-ph-records][data-kind]');
      if(x?.[0]===0 && detail)v.d=[detail.dataset.kind,detail.dataset.period,Number(detail.dataset.page||0)];
      const tab=$('#placeReportBody [data-report-tab][aria-selected=true]')?.dataset.reportTab;
      if(tabs.includes(tab))v.t=tab;
      const pane=$('#placeReportBody [data-ugmp-reading-pane]:not([hidden])');if(pane)v.p=pane.dataset.ugmpReadingPane;
      v.h=data('ugsp-public ugsp-road ugsp-distance ugsp-time ugmp-profile ugmp-band').map(s=>$('#placeReportBody '+s)?.value||null);
    }
    return v;
  }
  const token=v=>btoa(Array.from(new TextEncoder().encode(JSON.stringify(v)),b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  function validSourceFilter(q){
    if(q===null)return true;
    if(!Array.isArray(q))return false;
    if(q.length===1 && q[0]===0)return true;
    if(q.length!==2 || !safeId(q[0]) || !Array.isArray(q[1]) || !q[1].length || q[1].length>32)return false;
    return q[1].every(r=>Array.isArray(r) && r.length===2 && r.every(Number.isInteger) && r[0]>=0 && r[1]>0 && r[0]+r[1]<=8000);
  }
  function validate(v){
    if(!v||!Array.isArray(v.c)||v.c.length!==5||!v.c.every(Number.isFinite))return false;
    if(Math.abs(v.c[0])>540||Math.abs(v.c[1])>85.052||v.c[2]<0||v.c[2]>25||Math.abs(v.c[3])>360||v.c[4]<0||v.c[4]>85)return false;
    if(!Array.isArray(v.a)||v.a.length>controls.length||!v.a.every(x=>x===null||Number.isFinite(x)||(typeof x==='string'&&x.length<=100)))return false;
    if(v.e&&!recordOK(v.e))return false;
    if(v.o&&(!Array.isArray(v.o)||v.o.length!==2||!v.o.every(Number.isFinite)||Math.abs(v.o[0])>180||Math.abs(v.o[1])>85.052))return false;
    if(v.m&&(!Array.isArray(v.m)||v.m.length!==3||!v.m.every(pair=>Array.isArray(pair)&&pair.length===2&&pair.every(id=>id===null||safeId(id)))))return false;
    if(v.f!=null&&v.f!==1)return false;
    if(v.q && (!Array.isArray(v.q) || v.q.length!==3 || !v.q.every(validSourceFilter)))return false;
    if(v.b&&(!Array.isArray(v.b)||v.b.length!==3||!v.b.every(ids=>ids===null||(Array.isArray(ids)&&ids.length<=180&&ids.every(safeId)))))return false;
    if(v.r!==undefined && (v.r!==1||(!v.x&&!v.e)))return false;
    if(v.d&&(!Array.isArray(v.d)||!['tps','scheme'].includes(v.d[0])||!['recent','all'].includes(v.d[1])||!Number.isInteger(v.d[2])||v.d[2]<0||v.d[2]>10000))return false;
    if(v.x && (!Array.isArray(v.x)||!Number.isInteger(v.x[0])||!sources[v.x[0]]||!['source','catalogue','estate','compare','building-records'].includes(v.x[1]) || [2,3,8].some(k=>v.x[k]!=null&&!safeId(v.x[k])) || !Number.isInteger(v.x[5])||v.x[5]<0||v.x[5]>10000))return false;
    if(v.j && (!Array.isArray(v.j)||v.j.length!==6||![10,20,30,40,50,60].includes(v.j[0])||!modes.includes(v.j[1])||!Number.isFinite(v.j[2])||v.j[2]<0||v.j[2]>100||(v.j[3]&&!recordOK(v.j[3]))||![0,1,2].includes(v.j[4])||(v.j[5]!=null&&!['hex','building','building_initial','building_nearest'].includes(v.j[5]))))return false;
    return ['u','k','g','h'].every(k=>v[k]==null||(Array.isArray(v[k])&&v[k].length<=32&&v[k].every(x=>x===null||typeof x==='string'&&x.length<=60)));
  }
  let incoming=null;
  const match=/^#view=1\.([A-Za-z0-9_-]{1,9000})$/.exec(location.hash);
  if(match)try{const parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(match[1].replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));if(validate(parsed))incoming=parsed;}catch{/* Normal entry for invalid links. */}
  function url(report=false){
    const state=read(report);if(!validate(state))throw Error('This selection cannot be shared yet.');
    const link=new URL('./',location.href);link.searchParams.set('v','glass-1');const encoded=token(state);if(encoded.length>9000)throw Error('This source selection is too large for a shareable link.');
    link.hash='view=1.'+encoded;return link.href;
  }
  async function until(fn,timeout=20000){const end=performance.now()+timeout;while(performance.now()<end){const x=fn();if(x)return x;await delay(70);}return null;}
  function notice(msg){const n=$('#shareStatus');if(n){n.textContent=msg;n.hidden=!msg;}}
  async function restoreExternal(x) {
    const [idx,view,id,pin,tab,page,kind,sort,building,snapshotSort]=x;
    const api=await until(()=>byKind()[idx]);if(!api)throw Error('Market source unavailable');
    api.state.pinned=pin;
    if(view==='catalogue')api.openCatalogue();
    else if(idx===2){
      api.openSource(id,{forceDetail:view!=='compare',tab:['overview','units','evidence','snapshot','building'].includes(tab)?tab:'overview'});
    }else if(idx===1 && view==='building-records' && building){api.state.building=building;api.state.view=view;}
    else api.openEstate(id);
    if(api.state.view!==view && view==='compare'&&pin)api.state.view='compare';
    if(idx===1&&view!=='catalogue'){api.state.tablePage=page;if(['date','amount','size','rate'].includes(sort))api.state.recordSort=sort;}
    else api.state.page=page;
    if(idx===2&&['ASKING','RECORDED','AREA','ACTIVITY'].includes(kind))api.state.snapshotKind=kind;
    if(idx===2 && ['date','price','rate','size'].includes(snapshotSort))api.state.snapshotSort=snapshotSort;
    api.renderSharedReport();
    if(view!=='catalogue' && id && api.state.selected!==id)throw Error('Source record unavailable');
  }
  async function restore(v) {
    const map=await until(()=>window.UGA_V2_MAP?.getLayer('atlas') && window.UGA_V2_MAP);
    if(!map)throw Error('Map layers are unavailable');
    const camera={center:v.c.slice(0,2),zoom:v.c[2],bearing:v.c[3],pitch:v.c[4]};
    map.jumpTo(camera);
    const missing=[];
    // Independently mounted sections may arrive after the basemap.
    await until(()=>v.a.every((x,i)=>x===null||$(controls[i])),5000);
    for(let i=0;i<v.a.length;i++){
      const x=v.a[i];if(x===null)continue;
      const n=$(controls[i]);if(!n){missing.push(controls[i]);continue;}
      apply(n,x);
    }
    for(const [sel,attr,off] of [['[data-ugs-code]','data-ugs-code',v.u||[]],[city+'[data-legend-class]','data-legend-class',v.k||[]]]){
      const codes=$$(sel).map(n=>n.getAttribute(attr));
      for(const code of codes)apply($$(sel).find(n=>n.getAttribute(attr)===code),off.includes(code)?0:1);
    }
    if(v.q)v.q.forEach((q,i)=>{if(!applySourceFilter(byKind()[i],i,q))missing.push('Market filter');});
    if(v.m)v.m.forEach((pair,i)=>{const api=byKind()[i];if(api){[api.state.selected,api.state.pinned]=pair;api.refreshMap?.();}});
    if(v.b)v.b.forEach((ids,i)=>{const src=byKind()[i];if(src)src.state.choices=ids;});
    const api=window.UGA_V2_SELECTION;
    if(v.e){
      const [type,id]=v.e;
      if(type==='hex') api.setSelection(api.createHexSelection({identity:{hexId:id}},v.o?{lng:v.o[0],lat:v.o[1]}:{}));
      else {const res=await window.UGA_V2_ENTITY_PROVIDER.resolveEntity(type,id);api.setSelection(type==='building'?api.createBuildingSelection(res):api.createLotSelection(res));}
    }
    if(v.r){
      if(v.x){await restoreExternal(v.x);if(v.b?.[v.x[0]]&&v.x[1]==='catalogue'){const src=byKind()[v.x[0]];src.state.choices=v.b[v.x[0]];src.renderSharedReport();}if(v.d && v.x[0]===0 && !await byKind()[0].restoreRecords(...v.d))missing.push('Estate records');}
      else{
        api.openReport();
        if(!await until(()=>$('#placeReportBody article')))throw Error('Report unavailable');
        if(tabs.includes(v.t)){const tab=await until(()=>$('#placeReportBody [data-report-tab="'+v.t+'"]'),3000);tab?.click();}
        if(['connectivity','mobility','accessibility'].includes(v.p)){
          const pane=await until(()=>$('#placeReportBody [data-ugmp-reading-pane="'+v.p+'"]'),2500);
          if(pane)document.getElementById(pane.getAttribute('aria-labelledby'))?.click();
        }
        if(v.h?.some(x=>x!==null)){
          const list=data('ugsp-public ugsp-road ugsp-distance ugsp-time ugmp-profile ugmp-band');
          await until(()=>list.every((sel,i)=>!v.h[i]||$('#placeReportBody '+sel)),3000);
          list.forEach((s,i)=>{if(v.h[i]!=null)apply($('#placeReportBody '+s),v.h[i]);});
        }
      }
    }
    if(v.j){
      const network=await until(()=>window.UGA_V2_MOBILITY_NETWORK),[minutes,mode,opacity,t,result,basis]=v.j;
      if(network){
        network.changeJourney(minutes,mode);network.setOpacity(opacity);
        if(t){const place={grain:t[0],id:t[1]};network.setTarget(place);
          if(result){const ok=await network.restoreReach(place,basis,result===2);if(!ok)missing.push('Mobility calculation');}
          if(v.g && !(await network.restoreDestinations(v.g)))missing.push('Reachable destinations');
          if(v.f)apply($('[data-unet-facilities]'),1);
        }
      }else missing.push('Mobility module');
    }
    if(v.j?.[4]===2){const i=controls.indexOf(city+'[data-visible]');if(v.a[i]!=null)apply($(controls[i]),v.a[i]);}
    map.jumpTo(camera);
    return missing;
  }
  const dialog=()=>$('#atlasShareDialog');
  async function shareLink(link,forceCopy){
    if(!forceCopy && navigator.share){
      try{await navigator.share({title:'852LAB · Hong Kong Atlas',url:link});return;}
      catch(e){if(e.name==='AbortError')return;}
    }
    try{await navigator.clipboard.writeText(link);$('#shareFeedback').textContent='Link copied.';}
    catch{const field=$('#shareLinkText');field.hidden=false;field.value=link;field.focus();field.select();$('#shareFeedback').textContent='Copy the selected link.';}
  }
  function showDialog(report){
    let link;
    try{link=url(report);}catch(e){notice(e.message);return;}
    const d=dialog();
    $('#shareTitle').textContent=report?'Share this report':'Share map view';
    $('#sharePDF').hidden=!report;$('#shareNative').hidden=!navigator.share;
    $('#shareNative').onclick=()=>shareLink(link,false);$('#shareCopy').onclick=()=>shareLink(link,true);
    $('#sharePDF').onclick=()=>{d.close();window.UGA_PUBLICATION.open(true);};
    $('#shareFeedback').textContent='';$('#shareLinkText').hidden=true;
    d.showModal();
  }
  window.UGA_SHARED_VIEW=Object.freeze({incoming:!!incoming,url});
  window.addEventListener('DOMContentLoaded',()=>{
    $('#shareMap').onclick=()=>showDialog(false);$('#shareReport').onclick=()=>showDialog(true);
    $('#shareClose').onclick=()=>dialog().close();
    if(incoming){
      notice('Restoring shared view…');
      restore(incoming).then(missing=>{
        notice(missing.length?'Shared view opened. Some evidence or settings are currently unavailable.':'');
        document.documentElement.dataset.sharedView=missing.length?'partial':'restored';
      }).catch(()=>{notice('The shared view could only be partly restored. Some data is unavailable.');document.documentElement.dataset.sharedView='partial';});
    }
  },{once:true});
})();
