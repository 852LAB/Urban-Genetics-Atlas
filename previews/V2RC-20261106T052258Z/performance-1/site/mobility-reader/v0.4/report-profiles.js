/* Internal DEV place/cell Mobility integration; source approaches remain conditional. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else{root.UGA_V2_MOBILITY_PROFILES=api;if(root.document?.readyState==='loading')root.document.addEventListener('DOMContentLoaded',api.boot,{once:true});else api.boot()}})(globalThis,function(root){'use strict';
const VERSION='MOBILITY_REPORT_PROFILES_V0_1',EXPECTED='84dff46077a2b16d8597235ede892242b7e9a3cf0360c557beb1b29fe4b2e108',script=root.document?.currentScript,base=new URL("https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/site/mobility-reader/v0.4/"),ui=new URL('.',script?.src||root.document?.baseURI||base),groups=['BUS','FERRY','GMB','MTR_FEEDER','PEAK_TRAM','RAIL_LEGACY','RAIL_PROVIDER','TRAM'],bands=[50,100,200,500,1000,2000],labels=['Bus','Ferry','Minibus','Feeder bus','Peak Tram','Rail legacy','Rail provider','Tram'];
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),local=()=>!root.location||root.location.protocol==='file:'||(['localhost','127.0.0.1','::1','[::1]'].includes(root.location.hostname) || (root.location?.origin==='https://852lab.github.io' && root.location.pathname.startsWith('/Urban-Genetics-Atlas/previews/V2RC-20261106T052258Z/')));
let D=null,pending=null,pane=null,bound=false,observer=null,queued=false,map=null,mapClickBound=false;
const S={open:false,follow:true,hex:null,node:null,choice:null,band:3,query:'',profile:'walking',selection:null};
function matrix(m){return m?.length===6&&m.every((r,b)=>r?.length===8&&r.every((v,g)=>Number.isInteger(v)&&v>=0&&(!b||v>=m[b-1][g])))}
function verify(d){
if(d.version!==VERSION||d.lookup_sha256!=='9d1732af359cda97af55c1ebe88cda7ae155d3cd6c74ac3240a641291208aca1'||JSON.stringify(d.groups)!==JSON.stringify(groups)||JSON.stringify(d.bands)!==JSON.stringify(bands)||d.points?.length!==1824)throw Error('Mobility report data binding differs');let nodes=new Set(),assessed=0,links=0;
for(let p of d.points){if(nodes.has(p.node)||!matrix(p.counts)||!Array.isArray(p.hexes)||!p.xy?.every(Number.isFinite)||p.xy.length!==2)throw Error('Saved position differs');nodes.add(p.node);for(let a of p.approaches){links++;if(a.counts!==null){if(!matrix(a.counts)||a.state!=='SOURCE_REACH_ASSESSED')throw Error('Alternative result differs');assessed++}else if(a.state==='SOURCE_REACH_ASSESSED')throw Error('Assessed approach missing');if(a.z!==null&&!Number.isFinite(a.z))throw Error('Approach height differs')}if(p.envelope&&!matrix(p.envelope))throw Error('Conditional envelope differs')}
if(assessed!==78||links!==15491)throw Error('Approach coverage differs');return d}
async function load(){if(D)return D;if(pending)return pending;pending=(async()=>{let text=root.UGA_MOBILITY_PROFILES_TEXT;if(typeof text!=='string'){let r=await root.fetch(new URL('report-profiles.json',base),{cache:'no-store'});if(!r.ok)throw Error('Mobility profiles HTTP '+r.status);text=await r.text()}if(!root.crypto?.subtle)throw Error('Profile integrity checking is unavailable');let digest=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)),actual=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');if(actual!==EXPECTED)throw Error('Mobility profile checksum differs');D=verify(JSON.parse(text));return D})().catch(e=>{pending=null;throw e});return pending}
function focus(state){return state?.focus||state?.selection?.initialFocus||null}
function stateKey(state){let f=focus(state);return f?.type+':'+f?.id+'|'+(state?.selection?.primaryHexId??'')+'|'+(state?.selection?.record?.hex_id??'')+'|'+(state?.selection?.hydrationState??'')}

const buildingBase=new URL('buildings/v0.3/job_f27c7cdb0f2e287cfd9c/',base),buildingManifestSHA='dca2c5821843e46943767c8a53d371d7ba025984ce84ed4470aea80da0a0235a';let buildingManifestPromise=null;const buildingBuckets=new Map();
async function buildingText(url,expected){let r=await root.fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Building profile HTTP '+r.status);let t=await r.text(),h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)),s=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('');if(s!==expected)throw Error('Building profile checksum differs');return JSON.parse(t)}
function buildingModel(p,profile='walking'){if(!p||!['CONDITIONAL_SOURCE_POTENTIAL','ATTACHMENT_UNRESOLVED'].includes(p.state)||p.state==='CONDITIONAL_SOURCE_POTENTIAL'&&!matrix(p.counts)||p.state==='ATTACHMENT_UNRESOLVED'&&p.counts!==null)throw Error('Building profile contract differs');let n=p.nearest_network_profile,nearest=!!n;if(nearest&&(p.state!=='ATTACHMENT_UNRESOLVED'||n.state!=='NEAREST_SOURCE_POSITION_POTENTIAL'||!matrix(n.counts)||!Number.isInteger(n.source_links)||n.source_links<1||!Number.isInteger(n.source_intervals)||n.source_intervals<n.source_links||n.distance_basis!=='XYZ_SOURCE_NETWORK_EXCLUDES_APPROACH_GAP'||!(gapReading(p).xy_gap_m>10)))throw Error('Nearest network profile differs');return {...p,counts:profile==='walking'?(nearest?n.counts:p.counts):null,nearestReading:nearest,displayState:profile==='walking'?(nearest?'NEAREST_SOURCE_POSITION_POTENTIAL':p.state):'STEP_FREE_UNASSESSED'}}
async function loadBuilding(id){if(!buildingManifestPromise)buildingManifestPromise=buildingText(new URL('manifest.json',buildingBase),buildingManifestSHA).catch(e=>{buildingManifestPromise=null;throw e});let m=await buildingManifestPromise;if(m.version!=='BUILDING_SOURCE_PROFILES_V0_1'||m.buildings!==342223)throw Error('Building coverage differs');let h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),bucket=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),promise=buildingBuckets.get(bucket);if(!promise){promise=buildingText(new URL(bucket+'.json',buildingBase),m.shards[bucket].sha256).catch(e=>{buildingBuckets.delete(bucket);throw e});buildingBuckets.set(bucket,promise);while(buildingBuckets.size>4)buildingBuckets.delete(buildingBuckets.keys().next().value)}let data=await promise,p=data.records?.[id];if(data.version!=='BUILDING_SOURCE_PROFILES_V0_1'||p?.id!==id)throw Error('Building identity missing');buildingModel(p);return p}

const gapBounds=[10,20,30,40,50,60,70,80,90,100,150,200,250,500,1000];
function gapReading(p){const r=p?.network_gap;if(!r||r.search_limit_m!==1000)throw Error('Building gap evidence missing');const d=r.xy_gap_m;if(d===null){if(r.state!=='NO_SOURCE_WITHIN_SEARCH'||r.lower_m!==1000||r.upper_m!==null)throw Error('Building gap scope differs');return r}if(!Number.isFinite(d)||d<0)throw Error('Building gap invalid');if(d===0){if(r.state!=='FOOTPRINT_OVERLAP_IN_PLAN'||r.lower_m!==0||r.upper_m!==0)throw Error('Building gap band differs');return r}let upper=gapBounds.find(b=>d<=b+1e-7),index=gapBounds.indexOf(upper),lower=index?gapBounds[index-1]:0;if(upper===undefined||r.state!=='APPROACH_UNVERIFIED'||r.lower_m!==lower||r.upper_m!==upper)throw Error('Building gap band differs');return r}
function gapPanel(p){const r=gapReading(p),d=r.xy_gap_m;let heading=d===null?'Nearest recorded path · unresolved beyond the search limit':d===0?'Recorded path overlaps footprint in plan':'Nearest recorded path · '+d.toLocaleString('en-GB',{minimumFractionDigits:1,maximumFractionDigits:1})+' m';let detail=d===null?'No recorded pedestrian path was found within 1,000 m of the building footprint.':d===0?'Horizontal gap: 0 m. The recorded path may be on a different level.':'Horizontal gap from the complete building footprint · '+r.lower_m+'–'+r.upper_m+' m band.';let lo=0,bands=gapBounds.map(hi=>{let current=d!==null&&d>0&&hi===r.upper_m,label=lo+'–'+hi;lo=hi;return '<span style="display:inline-block;padding:2px 5px;margin:2px;border:1px solid #b8ccc5;border-radius:3px;'+(current?'background:#dcece5;font-weight:700;':'')+'">'+label+'</span>'}).join('');return '<section class="ugmp-network-gap"><h4>'+esc(heading)+'</h4><p title="'+esc(d===null?'Search limit 1000 m':String(d)+' m horizontal geometry gap')+'">'+esc(detail)+'</p><p>An approach may exist outside this pedestrian dataset. Its route, level, public availability and suitability remain unverified.</p><details><summary>Gap bands and measurement</summary><p>Horizontal gap bands (m):</p><div>'+bands+'</div><p>These bands describe proximity to recorded paths. They do not add connections or change the modal distance bands below. Existing source-network distances exclude unverified attachment gaps.</p></details></section>'}

/* The map and place report use the same measures, bands and reference values. */
const SIGNATURE = (() => {
 const version = 'MOBILITY_SIGNATURE_PROFILE_V0_1';
 const modes = {all:'Walk + rail',walk:'Walk',car:'Private car',taxi:'Taxi'};
 const distances = [100,200,500];
 const times = [10,20,30,40,50,60];
 const publicModes = [
  ['Main rail','Rail lines'], ['Light Rail','Light Rail routes'], ['Bus / feeder','Bus and feeder routes'],
  ['Minibus','Minibus routes'], ['Ferry','Ferry routes'], ['Tram','Tram routes'], ['Peak Tram','Peak Tram routes'],
 ];
 const roadClasses = ['Secondary','Arterial','Trunk road','Motorway'];
 const groups = ['Supermarkets','Primary Healthcare','Education','Parks','Sports','Libraries / culture'];
 const titles = ['Connectivity','Mobility','Accessibility'];
 const targetHexes = 49560;
 const colour = {all:'#087d73',walk:'#087d73',car:'#8e4d1f',taxi:'#8e4d1f'};
 const steps = ['#fff3dc','#bae0d0','#6fbabc','#32799b','#22466a'];
 const modeLimits = [25,50,75];
 const missing = '#adb4b7';
 const fmt = new Intl.NumberFormat('en-GB');
 const fmtScore = v => v===null ? '—' : String(Math.round(v));
 const fmtCount = v => v===null ? '—' : fmt.format(v);
 const isRoad = mode => mode==='car'||mode==='taxi';
 let referencePending, recordsPending;

 function loadReferences() {
  if (!referencePending) {
   referencePending = serviceJSON("https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mobility-snapshots/2f5eb4e0ad1ca356da77fec700b18d1930d1ddd38e9bc9a8da86aede2f2b6aaf/reference.json",'f962440a95229ffc6cc9c29d897f1f1e5774a4525096537bb9452695910e1f60')
    .then(value => {
     if (value.version!==version||value.target_hexes!==targetHexes||value.mapped!==84877||
         value.public_count!==40146||!Number.isInteger(value.road_origins)) {
      throw Error('Mobility profile reference differs');
     }
     return value;
    }).catch(error => {referencePending=null;throw error});
  }
  return referencePending;
 }

 function loadRecords() {
  if (!recordsPending) {
   recordsPending = loadReferences().then(ref =>
    serviceJSON("https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mobility-snapshots/2f5eb4e0ad1ca356da77fec700b18d1930d1ddd38e9bc9a8da86aede2f2b6aaf/hexes.json",ref.records_sha256).then(data => {
     if (data.version!==version||Object.keys(data.public).length!==ref.public_count||
         Object.keys(data.road).length!==ref.road_origins) throw Error('Mobility profile map coverage differs');
     return data;
    })
   ).catch(error => {recordsPending=null;throw error});
  }
  return recordsPending;
 }

 function publicCounts(service, rail, basis) {
  if (!service.assessed||!rail.assessed) return null;
  if (service.basis!==basis||rail.basis!==basis) throw Error('Network start differs between Connectivity inputs');
  return distances.map((_,i)=>[rail.counts[i+1][1],rail.counts[i+1][4],...service.routes[i+1]]);
 }

 function valueFor(data,id,mode) {
  const row = data.public[id];
  if (isRoad(mode)) {
   if (Object.hasOwn(data.road,id)) return data.road[id][mode];
   return NETWORK.cachedSignature({grain:'hex',id},'hex',mode)?.value??null;
  }
  if (!row) return null;
  const timeRows = row[mode==='walk'?1:2];
  return {connections:row[0],hex:timeRows.map(r=>r[0]),amenities:timeRows.map(r=>r.slice(1))};
 }

 function ranks(counts, table) {
  return counts.map((n,i)=>table[i][n]??null);
 }

 function connectivity(counts, table) {
  if (!counts||!table) return null;
  const relative = ranks(counts,table);
  if (relative.some(v=>v===null)) return null;
  return (Math.max(...relative) + counts.filter(n=>n>0).length / counts.length * 100) / 2;
 }

 function roadConnectivity(roads) {
  if (!roads) return null;
  return roads.reduce((total,t)=>total+(t===null?0:Math.max(0,1-t/20)),0)*25;
 }

 function meanReach(counts,index) {
  let sum = 0;
  for (let i=0;i<=index;i++) sum+=counts[i];
  return sum/(index+1);
 }

 function access(counts) {
  if (!counts) return null;
  return counts.reduce((sum,n)=>sum+Math.min(2,n),0)/(2*groups.length)*100;
 }

 function scores(value,ref,basis,mode,distance,time) {
  if (!value) return [null,null,null];
  const road = isRoad(mode);
  const peak = ref.mobility_reference[road?'road':mode][time];
  return [
   road ? roadConnectivity(value.roads) : connectivity(value.connections?.[distance],ref.connectivity[basis]?.[distance]),
   value.hex&&peak>0 ? Math.min(100,100*meanReach(value.hex,time)/peak) : null,
   access(value.amenities?.[time]),
  ];
 }

 function swatch(v) {
  if (v===null) return missing;
  return steps[v===0?0:1+modeLimits.filter(n=>v>=n).length];
 }

 function roadSwatch(v) {
  if (v===null) return steps[0];
  return steps[5-Math.max(1,Math.ceil(v/5))];
 }

 function spider(readings,roadMode,publicMode) {
  const point = (i,t) => [160+[0,91,-91][i]*t,102+[-77,48,48][i]*t];
  const triangle = t => titles.map((_,i)=>point(i,t).join(',')).join(' ');
  const grid = [.25,.5,.75,1].map(t=>'<polygon points="'+triangle(t)+'" fill="none" stroke="#c4d3cf" stroke-width="1"/>').join('');
  const axes = titles.map((_,i)=>{const [x,y]=point(i,1);return '<path d="M160 102L'+x+' '+y+'" stroke="#c4d3cf"/>'}).join('');
  const marks = [[readings[0],publicMode],[readings[1],roadMode]].map(([values,mode])=>{
   const c=colour[mode];
   if (values.every(v=>v===null)) return '';
   const polygon=values.every(Number.isFinite)?
    '<polygon points="'+values.map((v,i)=>point(i,v/100).join(',')).join(' ')+'" fill="'+c+'" fill-opacity=".15" stroke="'+c+'" stroke-width="2.3"/>' : '';
   return polygon+values.map((v,i)=>{
    if (v===null) return '';
    const [x,y]=point(i,v/100);
    return '<circle cx="'+x+'" cy="'+y+'" r="3.4" fill="'+c+'" stroke="white"/>';
   }).join('');
  }).join('');
  const accessible = readings.map((row,i)=>(i?modes[roadMode]:modes[publicMode])+' '+titles.map((t,j)=>t+' '+fmtScore(row[j])).join(', ')).join('. ');
  return '<figure class="ugsp-spider"><svg role="img" aria-label="'+esc(accessible)+'" viewBox="0 0 320 178">'+
   grid+axes+marks+'<text x="171" y="40" class="ugsp-scale">100</text><text x="169" y="66" class="ugsp-scale">50</text>'+'<g text-anchor="middle" class="ugsp-svg-text"><text x="160" y="15">Connectivity</text>'+
   '<text x="68" y="171">Accessibility</text><text x="252" y="171">Mobility</text></g></svg>'+
   '<figcaption><span style="--ugsp-mode:'+colour[publicMode]+'">'+esc(modes[publicMode])+'</span><span style="--ugsp-mode:'+colour[roadMode]+'">'+esc(modes[roadMode])+'</span></figcaption></figure>';
 }

 function circles(names,counts,relative,road) {
  const center = [145,110], radius = road ? 67 : 75;
  const cells = names.map((name,i)=>{
   const angle = -Math.PI/2 + i*2*Math.PI/names.length;
   const x = center[0]+radius*Math.cos(angle);
   const y = center[1]+radius*Math.sin(angle);
   const n = counts?.[i]??null;
   const v = relative?.[i]??null;
   const display = n===null ? (road&&counts?'—':'?') : road?String(n.toFixed(1)):String(n);
   const description = n===null ?
    (road&&counts?'no matched link completed within 20 minutes':'unassessed') :
    (road?n.toFixed(2)+' minutes to complete the first matched link':fmtCount(n)+' '+publicModes[i][1].toLowerCase()+', relative rank '+fmtScore(v));
   const fill = road&&counts?roadSwatch(n):swatch(v);
   const caption = name;
   return '<g><title>'+esc(name+' · '+description)+'</title><circle cx="'+x+'" cy="'+y+'" r="'+(road?19:16)+
    '" fill="'+fill+'" stroke="#9caeaa" stroke-width=".8"/><text x="'+x+'" y="'+(y+4)+'" fill="'+
    (fill===steps[3]||fill===steps[4]?'#fff':'#223c39')+'" class="ugsp-number">'+display+
    '</text><text x="'+x+'" y="'+(y+(road?33:30))+'" class="ugsp-node-label">'+esc(caption)+'</text></g>';
  }).join('');
  return '<svg role="img" aria-label="'+esc(names.map((n,i)=>n+' '+fmtCount(counts?.[i]??null)+(road&&counts?.[i]!==null&&counts?.[i]!==undefined?' minutes':'')).join(', '))+
   '" viewBox="0 0 290 222" class="ugsp-circles">'+cells+'</svg>';
 }

 function reachPlot(publicValue,roadValue,publicMode,roadMode,time) {
  const extent = Math.max(1,...(publicValue?.hex||[]),...(roadValue?.hex||[]));
  const bars = times.map((minutes,i)=>{
   const rows = [[publicValue,publicMode],[roadValue,roadMode]].map(([v,mode])=>{
    const n=v?.hex?.[i]??null;
    return '<div class="ugsp-bar-row" aria-label="'+esc(modes[mode]+' '+(n===null?'unassessed':fmtCount(n)))+
     '"><i style="--ugsp-mode:'+colour[mode]+';width:'+(n===null?0:n/extent*100)+
     '%"></i><span class="ugsp-bar-value">'+fmtCount(n)+'</span></div>';
   }).join('');
   return '<div class="ugsp-reach-row'+(i===time?' ugsp-selected':'')+'"><span>'+minutes+' min</span><div>'+rows+'</div></div>';
  }).join('');
  return '<figure class="ugsp-detail"><figcaption>Network-supported Hexes reached</figcaption>'+bars+'</figure>';
 }

 function amenityPlot(publicValue,roadValue,publicMode,roadMode,time) {
  const values = [publicValue?.amenities?.[time],roadValue?.amenities?.[time]];
  return '<figure class="ugsp-detail"><figcaption>Everyday destinations · '+times[time]+' min</figcaption><ul class="ugsp-amenities">'+
   groups.map((name,i)=>'<li><span>'+esc(name)+'</span>'+values.map((row,j)=>{
    const n=row?.[i]??null, mode=j?roadMode:publicMode;
    return '<span class="ugsp-amenity" style="--ugsp-mode:'+colour[mode]+'" aria-label="'+
     esc(modes[mode]+' '+(n===null?'unassessed':fmtCount(n)))+'"><i class="'+(n>0?'hit':'')+'"></i><i class="'+
     (n>1?'hit':'')+'"></i><b>'+fmtCount(n)+'</b></span>';
   }).join('')+'</li>').join('')+'</ul></figure>';
 }

 function legend(ref,mode,index,distance,time) {
  const road = isRoad(mode);
  const notes = [
   road ? 'Time to complete a matched link in four road classes, up to 20 minutes.' :
    'Mode variety and the strongest route-count rank within '+distances[distance]+' m of network walking.',
   (time===0?'Reachable Hex count within 10 min':'Mean reachable Hex count across the 10–'+times[time]+
    ' min bands')+', scaled to the reference for this mode.',
   'Everyday destination coverage within '+times[time]+' min. Each group contributes for its first and second record.',
  ];
  const scope = road ?
   fmt.format(ref.road_counts[mode])+' of '+fmt.format(ref.mapped)+' Hexes have saved '+modes[mode].toLowerCase()+' readings.' :
   fmt.format(ref.public_count)+' assessed map origins. Other Hexes are grey.';
  return {title:'Overall '+titles[index]+' · '+modes[mode],note:notes[index],scope};
 }

 function cell(value,ref,mode,index,distance,time) {
  const score=scores(value,ref,'hex',mode,distance,time)[index];
  if (score===null) return '<p>Unassessed for this map reading.</p>';
  let detail='';
  if (index===0) {
   detail=(isRoad(mode)?roadClasses:publicModes.map(x=>x[0])).map((n,i)=>{
    const v=isRoad(mode)?value.roads[i]:value.connections[distance][i];
    return '<span>'+esc(n)+' <b>'+fmtCount(v)+(isRoad(mode)&&v!==null?' min':'')+'</b></span>';
   }).join('');
  } else if (index===1) {
   detail='<span><b>'+fmtCount(value.hex[time])+'</b> of '+fmtCount(ref.target_hexes)+' target Hexes within '+times[time]+' min</span>';
  } else {
   detail=groups.map((n,i)=>'<span>'+esc(n)+' <b>'+fmtCount(value.amenities[time][i])+'</b></span>').join('');
  }
  return '<p><b>'+fmtScore(score)+'/100</b> · '+esc(modes[mode])+'</p><div class="ugsp-cell">'+detail+'</div>';
 }

 function statusText(value,loading,error,waiting,mode) {
  if (error) return modes[mode]+' · '+error;
  if (loading||waiting) return 'Calculating '+modes[mode]+'…';
  return value?.hex ? '' : modes[mode]+' reach is unassessed from this start.';
 }

 function mount(host,sections,grain,id,active,basis,walking) {
  if (!local()||!['building','hex'].includes(grain)) return;
  const doc = host.ownerDocument;
  const overview = doc.createElement('section');
  overview.className='ugsp-overview';
  host.insertBefore(overview,sections.connectivity.previousElementSibling);
  if (!walking) {
   overview.textContent='Step-free Mobility profile is unassessed.';
   return;
  }
  const journey = NETWORK.state();
  const controls = '<div class="ugsp-controls">'+
   '<label>Public stream<select data-ugsp-public><option value="all">Walk + rail</option><option value="walk">Walk</option></select></label>'+
   '<label>Vehicle stream<select data-ugsp-road><option value="car">Private car</option><option value="taxi">Taxi</option></select></label>'+
   '<label>Walk to services<select data-ugsp-distance>'+distances.map((v,i)=>'<option value="'+i+'"'+(i===2?' selected':'')+'>'+v+' m</option>').join('')+'</select></label>'+
   '<label>Journey time<select data-ugsp-time>'+times.map((v,i)=>'<option value="'+i+'"'+(v===journey.minutes?' selected':'')+'>'+v+' min</option>').join('')+'</select></label></div>';
  overview.innerHTML='<div class="ugsp-heading"><h3>Mobility profile</h3><span>Trial scale 0–100</span></div>'+controls+
   '<div data-ugsp-chart></div><p class="ugsp-status" role="status">Loading saved evidence…</p>'+
   '<button class="ugsp-action" type="button" data-ugsp-retry hidden>Retry place profile</button>'+
   '<details class="ugsp-method"><summary>How to read the profile</summary>'+
   '<p>Connectivity combines mode variety and the strongest route-count rank. Each mode has its own count scale, using the assessed origins with a positive count at that walking distance. Road Connectivity averages the four road classes, with faster access scoring higher up to a 20-minute limit.</p>'+
   '<p>Mobility scales the mean reachable Hex count through the selected time band to the largest observed mean for that mode. Car and taxi share the road sample reference. Accessibility gives equal weight to each of six everyday destination groups and counts up to two choices per group. The three readings form the profile.</p>'+
   '<p>Surface services contribute to Connectivity. Journey timing covers walking, nominal rail with walking at each end, and static road travel with approach and onward walking. Taxi includes a five-minute wait. Nearest-network starts are proxies. Destination counts use retained initial Building supports and park approaches.</p>'+
   '</details>';
  const find = name => overview.querySelector('[data-ugsp-'+name+']');
  if (isRoad(journey.modes)) find('road').value=journey.modes;
  if (journey.modes==='walk') find('public').value='walk';
  const placeholders = Object.fromEntries(Object.entries(sections).map(([key,section])=>{
   const node=doc.createElement('div');
   node.className='ugsp-reading';
   section.prepend(node);
   return [key,node];
  }));
  const current = () => active()&&overview.isConnected;
  const localValues = {};
  const loading = new Set();
  const errors = new Map();
  const sites = {};
  let ref, data, connections, connectionError, siteNames;

  const place = {grain,id};
  const selections = () => [find('public').value,find('road').value,Number(find('distance').value),Number(find('time').value)];
  const needs = mode => !!data&&!Object.hasOwn(localValues,mode)&&
   (grain!=='hex'||(isRoad(mode)?!hasSavedRoad(mode):!data.public[id]));
  const savedRoad = mode => root.UGA_MOBILITY_CITYWIDE?.savedRoad?.(id,mode);
  const hasSavedRoad = mode => savedRoad(mode)!==undefined||Object.hasOwn(data.road,id);
  const values = mode => {
   const saved=grain==='hex'&&isRoad(mode)?savedRoad(mode):undefined;
   const value=saved!==undefined?saved:Object.hasOwn(localValues,mode)?localValues[mode]:
    (grain==='hex'?valueFor(data,id,mode):null);
   return !isRoad(mode)&&connections?{...value,connections}:value;
  };

  function render() {
   if (!current()||!ref||!data) return;
   const [pub,road,distance,time]=selections();
   const publicValue=values(pub), roadValue=values(road);
   const readings=[scores(publicValue,ref,basis,pub,distance,time),scores(roadValue,ref,basis,road,distance,time)];
   find('chart').innerHTML=spider(readings,road,pub)+
    '<div class="ugsp-values">'+titles.map((name,i)=>'<div><span>'+name+'</span><b style="color:'+colour[pub]+'">'+
     fmtScore(readings[0][i])+'</b><b style="color:'+colour[road]+'">'+fmtScore(readings[1][i])+'</b></div>').join('')+'</div>';
   const messages=[pub,road].map(mode=>statusText(values(mode),loading.has(mode),errors.get(mode),needs(mode),mode)).filter(Boolean);
   if (connectionError) messages.push(connectionError);
   overview.querySelector('.ugsp-status').textContent=messages.join(' ');
   find('retry').hidden=![pub,road].some(mode=>needs(mode)&&errors.has(mode));
   const counts=publicValue?.connections?.[distance]??null;
   const table=ref.connectivity[basis]?.[distance];
   const relatives=counts&&table?ranks(counts,table):null;
   placeholders.connectivity.innerHTML='<div class="ugsp-radials"><figure><figcaption>Public transport · '+distances[distance]+
    ' m</figcaption>'+circles(publicModes.map(x=>x[0]),counts,relatives,false)+
    '<p>Routes and lines · colour ranks each mode separately</p></figure><figure><figcaption>'+esc(modes[road])+
    ' · first road-class access</figcaption>'+circles(roadClasses,roadValue?.roads,null,true)+
    '<p>Minutes · darker for faster access through 20 min</p></figure></div>';
   placeholders.mobility.innerHTML=reachPlot(publicValue,roadValue,pub,road,time);
   placeholders.accessibility.innerHTML=amenityPlot(publicValue,roadValue,pub,road,time);
   if (siteNames) {
    siteOutput.innerHTML='<table class="ugsp-sites"><thead><tr><th>First time band</th><th>'+esc(modes[pub])+
     '</th><th>'+esc(modes[road])+'</th></tr></thead><tbody>'+siteNames.map((name,i)=>{
      const band = mode => !sites[mode] ? '—' : sites[mode][i]===null ? 'No match ≤60 min' : '≤'+sites[mode][i]+' min';
      return '<tr><th scope="row">'+esc(name)+'</th><td>'+band(pub)+'</td><td>'+band(road)+'</td></tr>';
     }).join('')+'</tbody></table>';
   }
   sitesButton.disabled=[pub,road].some(mode=>loading.has(mode));
   sitesButton.hidden=[pub,road].every(mode=>Object.hasOwn(sites,mode));
   siteStatus.textContent=[pub,road].map(mode=>loading.has(mode)?'Calculating '+modes[mode]+'…':errors.get(mode)||'').filter(Boolean).join(' ');
  }

  async function loadMode(mode) {
   if (!current()||loading.has(mode)) return;
   loading.add(mode);
   errors.delete(mode);
   render();
   try {
    const result=await NETWORK.signatureReading(place,basis,mode,current);
    if (!current()||!result) return;
    if (needs(mode)) localValues[mode]=result.value;
    siteNames=result.sites;
    sites[mode]=result.value?.sites??null;
   } catch (error) {
    if (current()) errors.set(mode,error.message);
   } finally {
    loading.delete(mode);
    render();
   }
  }

  function refresh() {
   if (!current()||!data) return;
   render();
   for (const mode of selections().slice(0,2)) {
    if (needs(mode)&&!errors.has(mode)) void loadMode(mode);
   }
  }

  const sitePanel=doc.createElement('details');
  sitePanel.className='ugsp-method';
  sitePanel.innerHTML='<summary>Centres and gateways</summary><p>Outward time bands to selected station and building supports.</p>'+
   '<button type="button" data-ugsp-sites-button disabled>Check the selected modes</button><p role="status"></p>'+
   '<div data-ugsp-sites-output></div><p>Lo Wu approach is conditional on eligibility. The reading ends at the station.</p>';
  placeholders.mobility.after(sitePanel);
  const siteOutput=sitePanel.querySelector('[data-ugsp-sites-output]');
  const sitesButton=sitePanel.querySelector('[data-ugsp-sites-button]');
  const siteStatus=sitePanel.querySelector('[role="status"]');
  sitesButton.addEventListener('click',()=>{
   for (const mode of selections().slice(0,2)) {
    if (data&&!Object.hasOwn(sites,mode)) void loadMode(mode);
   }
  });
  overview.ugspJourneyChanged=(minutes,mode)=>{
   if (!current()) return;
   find('time').value=String(times.indexOf(minutes));
   if (isRoad(mode)) find('road').value=mode;
   if (mode==='walk'||mode==='all') find('public').value=mode;
   refresh();
  };
  overview.querySelector('.ugsp-controls').addEventListener('change',event=>{
   const [pub,road,,time]=selections();
   const mode=event.target===find('public')?pub:event.target===find('road')?road:NETWORK.state().modes;
   if (event.target!==find('distance')) NETWORK.changeJourney(times[time],mode);
   refresh();
  });
  find('retry').addEventListener('click',()=>{
   for (const mode of selections().slice(0,2)) {
    if (needs(mode)&&errors.has(mode)) void loadMode(mode);
   }
  });
  Promise.all([loadReferences(),loadRecords()]).then(async ([r,d])=>{
   if (!current()) return;
   ref=r;data=d;
   try { await root.UGA_MOBILITY_CITYWIDE?.loadRoadData?.(); } catch {}
   refresh();
   if (grain==='building'||!data.public[id]) {
    try {
     const [service,rail]=await Promise.all([loadServiceProfile(grain,id),railProfile(grain,id)]);
     connections=publicCounts(service,rail,basis);
    } catch (error) {
     if (current()) connectionError='Mode counts · '+error.message;
    }
   }
   render();
  }).catch(error=>{
   if (current()) overview.querySelector('.ugsp-status').textContent=error.message;
  });
 }

 function syncJourney(minutes,mode) {
  root.document?.querySelector('.ugsp-overview')?.ugspJourneyChanged?.(minutes,mode);
 }

 return Object.freeze({mount,syncJourney,loadReferences,loadRecords,valueFor,isRoad,scores,legend,cell,titles,times,distances,modes,steps,missing});
})();

const mobilityReadingOrder = [
 ['connectivity','Connectivity','What connects here?'],
 ['mobility','Mobility','How far can I get?'],
 ['accessibility','Accessibility','What can I reach?'],
];
let lastMobilityReading = {place:'', section:'connectivity'};
let mobilityReadingSerial = 0;

function arrangeMobilityReport(host, grain, id, active, basis) {
 if (!host.hasAttribute('data-ugmp-card')) return null;
 const place = grain+':'+id;
 if (lastMobilityReading.place !== place) lastMobilityReading = {place, section:'connectivity'};

 const doc = host.ownerDocument;
 const nav = doc.createElement('div');
 nav.className = 'ugmp-reading-tabs';
 nav.setAttribute('role','tablist');
 nav.setAttribute('aria-label','Mobility readings');
 const previous = [...host.childNodes].filter(node=>node!==host.firstElementChild);
 const sections = {};
 const buttons = [];
 const prefix = 'ugmp-reading-'+(++mobilityReadingSerial);
 for (const [key, title, question] of mobilityReadingOrder) {
  const button = doc.createElement('button');
  const section = doc.createElement('section');
  button.id = prefix+'-tab-'+key;
  section.id = prefix+'-'+key;
  button.type = 'button';
  button.setAttribute('role','tab');
  button.setAttribute('aria-controls',section.id);
  button.innerHTML = '<strong>'+title+'</strong><span>'+question+'</span>';
  section.setAttribute('role','tabpanel');
  section.setAttribute('aria-labelledby',button.id);
  section.setAttribute('data-ugmp-reading-pane',key);
  sections[key] = section;
  buttons.push(button);
  nav.appendChild(button);
 }
 for (const node of previous) {
  if (node.matches?.('.ugmp-measures')) node.remove();
  else sections.connectivity.appendChild(node);
 }
 host.append(nav,...Object.values(sections));
 const detail = doc.createElement('details');
 detail.innerHTML = '<summary>Network and service evidence</summary>';
 detail.append(...sections.connectivity.childNodes);
 sections.connectivity.append(detail);
 sections.evidence = detail;
 SIGNATURE.mount(host,{connectivity:sections.connectivity,mobility:sections.mobility,accessibility:sections.accessibility},
  grain,String(id),active,basis,S.profile==='walking');
 const load = NETWORK.mountReport(sections.mobility,sections.accessibility,grain,id,active,basis,S.profile==='walking');
 function select(key) {
  lastMobilityReading = {place, section:key};
  mobilityReadingOrder.forEach(([reading],index)=>{
   const selected = key===reading;
   buttons[index].setAttribute('aria-selected',String(selected));
   buttons[index].tabIndex = selected ? 0 : -1;
   sections[reading].hidden = !selected;
  });
  if (key==='accessibility') load();
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>select(mobilityReadingOrder[index][0]));
  button.addEventListener('keydown',event=>{
   const last = buttons.length-1;
   const next = event.key==='Home' ? 0 : event.key==='End' ? last :
    event.key==='ArrowLeft' ? (index+last)%buttons.length :
    event.key==='ArrowRight' ? (index+1)%buttons.length : null;
   if (next===null) return;
   event.preventDefault();
   select(mobilityReadingOrder[next][0]);
   buttons[next].focus();
  });
 });
 select(lastMobilityReading.section);
 return sections;
}

async function addPlaceMobilityReadings(host, grain, id, active, basis) {
 const sections = arrangeMobilityReport(host,grain,id,active,basis);
 if (!sections) {
  await serviceReading(host,grain,id,active,basis);
  await railReading(host,grain,id,active,basis);
  return;
 }
 const evidence=host.ownerDocument.createElement('details');
 evidence.innerHTML='<summary>Service and rail station evidence</summary>';
 sections.mobility.appendChild(evidence);
 await Promise.all([
  railReferenceReading(sections.evidence,grain,id,active,basis),
  serviceReading(evidence,grain,id,active,basis),
 ]);
 if (active()&&S.profile==='walking') await timeReading(evidence,grain,id,active,basis);
}

async function _renderBuildingCard(host,id,state){let ticket=Symbol();host._ugmpBuildingTicket=ticket;host.innerHTML='<h2>Mobility · building profile</h2>'+measures()+'<p>Loading building connectivity…</p>';let active=()=>{let f=focus(root.UGA_V2_SELECTION?.snapshot?.()||state),isPane=host===pane?.querySelector('[data-content]');return host.isConnected&&host._ugmpBuildingTicket===ticket&&f?.type==='building'&&String(f.id)===id&&(!isPane||S.follow)};try{let p=await loadBuilding(id);if(!active())return;let m=buildingModel(p,S.profile);host.innerHTML='<h2>Mobility · building profile</h2>'+measures()+gapPanel(p)+gapGraphic(p)+choices(p,null)+bandControl();if(m.displayState==='STEP_FREE_UNASSESSED')host.innerHTML+='<p class="ugmp-empty">Step-free / wheelchair connectivity is unassessed. Walking potential is not a step-free route assessment.</p>';else if(m.counts)host.innerHTML+=(m.nearestReading?'<h4>Nearest network position · conditional connectivity</h4><p>The radial shows transport references reached along the recorded network from the closest source position. Its distance bands start there. The separately displayed building gap is excluded; the approach remains unverified. Equal nearest positions are alternative starts, without transfers between levels.</p><p>'+p.nearest_network_profile.source_links+' equal-nearest source link(s); '+p.nearest_network_profile.source_intervals+' retained starting position(s) or interval(s).</p>':'<h4>Walking connectivity · source potential</h4><p>Potential across source paths within 10 m of the building footprint, at all recorded levels. Entry to those paths remains unverified; this is not a door-to-stop route.</p>')+modalGraphics(m.counts)+radial(m.counts)+'<div class="ugmp-ranges">'+m.counts[S.band].map((v,g)=>'<span>'+esc(labels[g])+'<b>'+v+'</b></span>').join('')+'</div>';else host.innerHTML+='<p class="ugmp-empty">The modal connectivity reading remains unresolved because the approach to the recorded network has not been established. A legitimate path may exist outside the pedestrian dataset. Connectivity has not been assigned a zero.</p>';host.innerHTML+='<details><summary>Source support and limits</summary><p>'+p.nearby_links+' source links within the original 10 m footprint search; '+p.source_intervals+' retained source intervals. Separate starting options do not create a transfer between levels. Initial and destination attachment gaps are excluded. Counts are transport reference records, not unique services or strength scores.</p></details>';host.querySelector('[data-ugmp-band]').onchange=e=>{let v=Number(e.target.value);if(!Number.isInteger(v)||v<0||v>5)return;S.band=v;onwardClear();renderBuildingCard(host,id,state)};bindReading(host,{envelope:false},null,()=>renderBuildingCard(host,id,state));await addPlaceMobilityReadings(host,'building',id,active,m.nearestReading?'building_nearest':'building_initial')}catch(e){if(active())host.innerHTML='<h2>Mobility · building profile</h2><p class="ugmp-empty">Building evidence is unavailable: '+esc(e.message)+'. Connectivity remains unassessed.</p>';if(active())arrangeMobilityReport(host,'building',id,active,null)}}


const hexBase=new URL('hexes/v0.2/job_e93f2469698cfe77adce/',base),hexManifestSHA='8c6c522e518d8e5fb936ea8e9abac5f294ed32e6f67f8017d740e5cd023fa64e';let hexManifestPromise=null;const hexBuckets=new Map();
function hexModel(p,profile='walking'){if(!p||!['CELL_NETWORK_POTENTIAL','NO_RECORDED_NETWORK_IN_CELL'].includes(p.state)||typeof p.boundary_review!=='boolean'||!['registered_nodes','metric_nodes','source_links','local_fragments','global_components','cut_ends','source_intervals','source_nodes'].every(k=>Number.isInteger(p[k])&&p[k]>=0)||!Number.isFinite(p.path_length_3d)||p.path_length_3d<0||p.state==='CELL_NETWORK_POTENTIAL'&&(!matrix(p.counts)||p.source_intervals+p.source_nodes<1)||p.state==='NO_RECORDED_NETWORK_IN_CELL'&&(p.counts!==null||p.source_intervals+p.source_nodes!==0))throw Error('Hex profile contract differs');if(!Array.isArray(p.inside_counts)||p.inside_counts.length!==8||!p.inside_counts.every(v=>Number.isInteger(v)&&v>=0))throw Error('In-cell evidence missing');return {...p,counts:profile==='walking'?p.counts:null,displayState:profile==='walking'?p.state:'STEP_FREE_UNASSESSED'}}
async function loadHex(id){if(!hexManifestPromise)hexManifestPromise=buildingText(new URL('manifest.json',hexBase),hexManifestSHA).catch(e=>{hexManifestPromise=null;throw e});let m=await hexManifestPromise;if(m.version!=='HEX_PRESENCE_REACH_V0_2'||m.hexes!==374784||JSON.stringify(m.groups)!==JSON.stringify(groups)||JSON.stringify(m.bands)!==JSON.stringify(bands))throw Error('Hex coverage differs');let h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),bucket=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),promise=hexBuckets.get(bucket);if(!promise){promise=buildingText(new URL(bucket+'.json',hexBase),m.shards[bucket].sha256).catch(e=>{hexBuckets.delete(bucket);throw e});hexBuckets.set(bucket,promise);while(hexBuckets.size>4)hexBuckets.delete(hexBuckets.keys().next().value)}let data=await promise,p=data.records?.[id];if(data.version!=='HEX_PRESENCE_REACH_V0_2'||p?.id!==id)throw Error('Hex identity missing');hexModel(p);return p}
async function _renderHexCard(host,id,state){let ticket=Symbol();host._ugmpHexTicket=ticket;host.innerHTML='<h2>Mobility · Hex connectivity</h2>'+measures()+'<p>Loading cell network potential…</p>';let active=()=>{let f=focus(root.UGA_V2_SELECTION?.snapshot?.()||state),isPane=host===pane?.querySelector('[data-content]');return host.isConnected&&host._ugmpHexTicket===ticket&&f?.type==='hex'&&String(f.id)===id&&(!isPane||S.follow)};try{let p=await loadHex(id);if(!active())return;let m=hexModel(p,S.profile);host.innerHTML='<h2>Mobility · Hex connectivity</h2>'+measures()+choices(p,null)+bandControl()+(!m.counts?modeBars(p.inside_counts,'1 · Mapped inside the cell','Retained point references in plan. Path reach remains separately unassessed. Zero means no retained point reference, not transport absence.'):'');if(m.displayState==='STEP_FREE_UNASSESSED')host.innerHTML+='<p class="ugmp-empty">Step-free / wheelchair connectivity is unassessed. Walking potential is not a step-free route assessment.</p>';else if(m.counts)host.innerHTML+='<h4>Cell network potential</h4><p>Transport references reachable from at least one recorded path position inside or on this cell boundary. Distance bands begin at those paths. Different fragments can contribute different journeys.</p>'+modalGraphics(m.counts,p.inside_counts)+radial(m.counts)+'<div class="ugmp-ranges">'+m.counts[S.band].map((v,g)=>'<span>'+esc(labels[g])+'<b>'+v+'</b></span>').join('')+'</div>';else host.innerHTML+='<p class="ugmp-empty">No recorded pedestrian starting position was identified inside this cell. Connectivity remains unassessed. Nearby paths or legitimate approaches outside the recorded cell network may exist.</p>';host.innerHTML+='<p>'+Number(p.path_length_3d).toLocaleString('en-GB',{maximumFractionDigits:1})+' m of recorded paths · '+p.local_fragments+' local fragment(s) · '+p.global_components+' wider source network(s).</p>'+(p.boundary_review?'<p class="ugmp-note">Existing boundary review retained for this cell.</p>':'')+'<details><summary>Cell coverage and source limits</summary><p>'+p.source_intervals+' retained source intervals or boundary positions; '+p.source_nodes+' metric-closure native nodes. Registered native nodes: '+p.registered_nodes+'. Paths passing through the cell contribute even when no junction lies inside it.</p><p>Separate fragments are alternative starts, without new transfers between them. This is cell potential, not an average or a reading for every building. Boundary cut ends are accounting observations, not verified gateways. Adjacent Hex counts share paths and transport references and are not additive. Source reference counts describe this distance reading. The Mobility and Accessibility tabs use separate journey and destination models.</p></details>';host.querySelector('[data-ugmp-band]').onchange=e=>{let v=Number(e.target.value);if(!Number.isInteger(v)||v<0||v>5)return;S.band=v;onwardClear();renderHexCard(host,id,state)};bindReading(host,{envelope:false},null,()=>renderHexCard(host,id,state));await addPlaceMobilityReadings(host,'hex',id,active,'hex')}catch(e){if(active())host.innerHTML='<h2>Mobility · Hex connectivity</h2><p class="ugmp-empty">Hex evidence is unavailable: '+esc(e.message)+'. Connectivity remains unassessed.</p>';if(active())arrangeMobilityReport(host,'hex',id,active,'hex')}}

function model(d,state,band=3,profile=S.profile){let f=focus(state),id=f?.type==='hex'?String(f.id):null,points=id?d.points.filter(p=>p.hexes.includes(id)):[],ranges=groups.map((_,g)=>points.length&&profile==='walking'?[Math.min(...points.map(p=>(p.envelope||p.counts)[band][g])),Math.max(...points.map(p=>(p.envelope||p.counts)[band][g]))]:null);return {type:f?.type||null,id:f?.id??null,hex:id,points,ranges,travelProfile:profile,profileState:profile==='walking'?'SOURCE_POTENTIAL':'UNASSESSED',alternativeSamples:points.filter(p=>p.envelope).length,state:f?.type==='hex'?(points.length?'SAMPLE_CONTEXT':'NO_SAVED_SAMPLES'):f?'ENTITY_ACCESS_UNASSESSED':'BROWSE',contextHex:state?.selection?.primaryHexId??state?.selection?.record?.hex_id??null}}

function bandControl(){return '<label>Source-distance band<select data-ugmp-band>'+bands.map((b,i)=>'<option value="'+i+'"'+(i===S.band?' selected':'')+'>'+b+' m</option>').join('')+'</select></label>'}
function measures(){return '<div class="ugmp-measures"><div><b>Connectivity</b><span>'+(S.profile==='stepfree'?'Step-free potential · unassessed':'Physical walking potential')+'</span></div><div><b>Mobility</b><span>Service through time · unassessed</span></div><div><b>Accessibility</b><span>Destination reach · unassessed</span></div></div>'}
function sampleSummary(m){if(S.profile==='stepfree')return '<p>'+m.points.length+' sampled starting positions are registered to this cell. Step-free connectivity and a step-free cell summary remain unassessed.</p>';if(!m.points.length)return '<p class="ugmp-empty">No saved mobility sample is registered to this cell. Its connectivity is unassessed.</p>';return '<p><b>'+m.points.length+' sampled starting position'+(m.points.length===1?'':'s')+'</b> registered to this cell; '+m.alternativeSamples+' with assessed alternative approaches. These samples do not represent every entrance or the whole cell.</p><details><summary>Variation across sampled starts · '+bands[S.band]+' m</summary><p>Ranges use the best available walking-potential reading for each sample. Coverage can differ between samples; this is not a whole-cell score.</p><div class="ugmp-ranges">'+m.ranges.map((r,g)=>'<span>'+esc(labels[g])+'<b>'+r[0]+(r[0]===r[1]?'':'–'+r[1])+'</b></span>').join('')+'</div></details>'}
function choices(p,choice){return '<label>Travel profile<select data-ugmp-profile><option value="walking"'+(S.profile==='walking'?' selected':'')+'>Walking potential</option><option value="stepfree"'+(S.profile==='stepfree'?' selected':'')+'>Step-free / wheelchair · unassessed</option></select></label>'}
function sourceEvidence(p){let b=S.band,assessed=p.approaches.filter(a=>a.counts!==null).length;return '<details><summary>Source evidence and coverage</summary><p>'+p.approaches.length+' nearby source positions; '+assessed+' with reach calculations. Uncalculated alternatives remain unassessed.</p><p>The potential reading uses the tested alternatives where available, otherwise the original saved start. It is conditional on physical attachment. Separate source starts do not create a connection between levels. Initial and destination attachment gaps remain excluded and unverified.</p><div class="ugmp-ranges">'+labels.map((label,g)=>'<span>'+esc(label)+'<b>'+p.counts[b][g]+(p.envelope?' → '+p.envelope[b][g]:'')+'</b></span>').join('')+'</div><p>Original saved start → potential across tested starts, at '+bands[b]+' m. These are walking-source records, not a step-free assessment, unique services or strength scores.</p><details><summary>Recorded source positions and levels</summary><pre>'+esc(JSON.stringify(p.approaches,null,2))+'</pre></details></details>'}
function reading(p,choice){if(S.profile==='stepfree')return '<h4>Step-free / wheelchair travel</h4><p class="ugmp-empty">Not yet assessed for this place. The source evidence must support a continuous route, including steps, ramps, lifts, gradients and operating access. The walking-potential reading is not substituted for a step-free result.</p>'+sourceEvidence(p);let cc=p.envelope||p.counts,note=p.envelope?'Potential from the assessed starting options, with each source reference counted once. The physical attachment to those options remains conditional.':'Potential from the original recorded start. Nearby alternative starts have not all been assessed, so this reading may underrepresent the place.';return '<h4>Walking potential</h4><p>'+esc(note)+'</p>'+radial(cc)+'<details><summary>Source-reference counts · '+bands[S.band]+' m</summary><div class="ugmp-ranges">'+cc[S.band].map((v,g)=>'<span>'+esc(labels[g])+'<b>'+v+'</b></span>').join('')+'</div><p>Records are not unique stops, stations, services or strength scores.</p></details>'+sourceEvidence(p)}
function locate(p){let xy=p.xy;root.UGA_V2_MAP?.flyTo({center:[xy[0]/6378137*180/Math.PI,(2*Math.atan(Math.exp(xy[1]/6378137))-Math.PI/2)*180/Math.PI],zoom:Math.max(root.UGA_V2_MAP.getZoom(),15)})}
function bindReading(host,p,choice,rerender){host.querySelector('[data-ugmp-profile]')?.addEventListener('change',e=>{if(!['walking','stepfree'].includes(e.target.value))return;S.profile=e.target.value;onwardClear();rerender(p.envelope?'potential':'original');let card=root.document?.getElementById('placeReportBody')?.querySelector('[data-ugmp-card]');if(card&&card!==host)renderCard(card,root.UGA_V2_SELECTION?.snapshot?.()||S.selection);if(S.open&&pane&&host!==pane.querySelector('[data-content]'))renderPane()});host.querySelector('[data-ugmp-locate]')?.addEventListener('click',()=>locate(p))}
function renderCard(card,state){let m=model(D,state,S.band);card.innerHTML='<h2>Mobility · place profile</h2>'+measures();if(m.type==='hex'){renderHexCard(card,String(m.id),state);return}if(m.type==='building'){renderBuildingCard(card,String(m.id),state);return}if(m.state==='ENTITY_ACCESS_UNASSESSED'){card.innerHTML+='<p class="ugmp-empty">Access from this '+esc(m.type==='lot'?'Lot':'Building')+' is not yet linked to its entrances or approach positions. Area samples are separate context.</p>'+(m.contextHex?'<button type="button" data-ugmp-context>Explore samples in the related cell</button>':'');card.querySelector('[data-ugmp-context]')?.addEventListener('click',()=>open({hex:String(m.contextHex),follow:false}));return}if(m.state==='BROWSE'){card.innerHTML+='<p>Select a cell to inspect its saved mobility evidence.</p>';return}card.innerHTML+=sampleSummary(m);if(!m.points.length)return;let selected=card.dataset.node,p=m.points.find(p=>p.node===selected)||m.points[0],choice=card.dataset.choice||(p.envelope?'potential':'original');if(choice==='potential'&&!p.envelope)choice='original';card.dataset.node=p.node;card.dataset.choice=choice;card.innerHTML+='<label>Sampled place<select data-ugmp-node>'+m.points.map(q=>'<option value="'+esc(q.node)+'"'+(q.node===p.node?' selected':'')+'>'+esc(q.label)+'</option>').join('')+'</select></label>'+bandControl()+choices(p,choice)+reading(p,choice)+'<button type="button" data-ugmp-locate>Locate sampled start</button><button type="button" data-ugmp-open>Explore place approaches</button>';card.querySelector('[data-ugmp-node]').addEventListener('change',e=>{card.dataset.node=e.target.value;delete card.dataset.choice;renderCard(card,state)});card.querySelector('[data-ugmp-band]').onchange=e=>{S.band=Number(e.target.value);renderCard(card,state)};bindReading(card,p,choice,v=>{card.dataset.choice=v;renderCard(card,state)});card.querySelector('[data-ugmp-open]').addEventListener('click',()=>open({hex:m.hex,node:p.node,follow:false}))}
async function mount(){queued=false;let body=root.document?.getElementById('placeReportBody'),state=root.UGA_V2_SELECTION?.snapshot?.();if(!body||!state?.reportOpen)return;let article=body.querySelector('.v2-report-sheet');if(!article)return;let id=stateKey(state),card=article.querySelector('[data-ugmp-card]');if(card?.dataset.focus===id)return;if(!card){card=root.document.createElement('section');card.className='ugmp-card';card.setAttribute('data-ugmp-card','');let footer=article.querySelector('.v2-sheet-footer');article.insertBefore(card,footer?.parentNode===article?footer:null)}card.dataset.focus=id;card.textContent='Loading Mobility profile…';try{await load();let current=root.UGA_V2_SELECTION?.snapshot?.();if(card.isConnected&&stateKey(current)===id)renderCard(card,current)}catch(e){card.textContent='Mobility evidence is unavailable: '+e.message+'. Access remains unassessed.'}}
function queue(){if(queued)return;queued=true;root.requestAnimationFrame?root.requestAnimationFrame(mount):root.setTimeout(mount,0)}
function filtered(){let q=S.query.toLowerCase().trim();return D.points.filter(p=>(S.hex===null||p.hexes.includes(S.hex))&&(!q||(p.label+' '+p.node+' '+p.hexes.join(' ')).toLowerCase().includes(q)))}
function renderPane(){if(!D||!pane)return;let state=S.selection,f=focus(state);if(S.follow&&f?.type==='hex'){pane.querySelector('[data-context]').textContent='Selected Hex · cell network potential';renderHexCard(pane.querySelector('[data-content]'),String(f.id),state);return}if(S.follow&&f?.type==='building'){pane.querySelector('[data-context]').textContent='Selected building · connectivity profile';renderBuildingCard(pane.querySelector('[data-content]'),String(f.id),state);return}if(S.follow&&f&&f.type!=='hex'){pane.querySelector('[data-context]').textContent='Selected '+(f.type==='lot'?'Lot':'Building')+' · access points not yet linked.';pane.querySelector('[data-content]').innerHTML=measures()+'<p>Access from the selected '+esc(f.type==='lot'?'Lot':'Building')+' is unassessed. Browse saved places or explore its related cell as separate context.</p><button type="button" data-all>Browse saved places</button>';pane.querySelector('[data-all]').onclick=()=>{S.follow=false;S.hex=null;renderPane()};return}let pp=filtered(),p=pp.find(p=>p.node===S.node)||pp[0];S.node=p?.node||null;let choice=S.choice??(p?.envelope?'potential':'original');if(choice==='potential'&&!p?.envelope)choice='original';S.choice=choice;pane.querySelector('[data-context]').textContent=S.hex?'Cell '+S.hex+' · '+pp.length+' matching sampled starts. Coverage is limited to saved positions.':'Saved places across Hong Kong · '+pp.length+' matches. Each reading belongs to its selected starting scenario.';let content=pane.querySelector('[data-content]');content.innerHTML=measures()+(p?'<label>Saved place<select data-node>'+pp.map(q=>'<option value="'+esc(q.node)+'"'+(q.node===p.node?' selected':'')+'>'+esc(q.label)+'</option>').join('')+'</select></label>'+bandControl()+choices(p,choice)+reading(p,choice)+'<button type="button" data-ugmp-locate>Locate sampled start</button>':'<p>No saved profile matches this selection. Connectivity remains unassessed.</p>');if(p){content.querySelector('[data-node]').onchange=e=>{S.node=e.target.value;S.choice=null;renderPane();syncMap()};content.querySelector('[data-ugmp-band]').onchange=e=>{S.band=Number(e.target.value);renderPane()};bindReading(content,p,choice,v=>{S.choice=v;renderPane()})}syncMap()}
async function open(){return false}
function close(){S.open=false;if(pane)pane.hidden=true}
const mapSource='ug-mobility-profile-starts';
function syncMap(){if(!map||!D||!map.isStyleLoaded())return;let pp=filtered(),data={type:'FeatureCollection',features:pp.map(p=>({type:'Feature',properties:{node:p.node},geometry:{type:'Point',coordinates:[p.xy[0]/6378137*180/Math.PI,(2*Math.atan(Math.exp(p.xy[1]/6378137))-Math.PI/2)*180/Math.PI]}}))};if(!map.getSource(mapSource))map.addSource(mapSource,{type:'geojson',data});else map.getSource(mapSource).setData(data);if(!map.getLayer(mapSource))map.addLayer({id:mapSource,type:'circle',source:mapSource,paint:{'circle-radius':5,'circle-color':'#276f62','circle-stroke-color':'white','circle-stroke-width':1}});map.setLayoutProperty(mapSource,'visibility',S.open?'visible':'none');if(!mapClickBound){mapClickBound=true;map.on('click',mapSource,e=>{let hits=[...new Set((e.features||[]).map(f=>f.properties.node))];if(hits.length===1){S.node=hits[0];S.choice=null;renderPane()}else if(hits.length>1&&pane){pane.querySelector('[data-context]').textContent='Several source positions overlap here; choose a saved place from the list.'}})}}
function citywideBoot(){if(!local()||!root.document||root.document.getElementById('ug-citywide-script'))return;let s=root.document.createElement('script');s.id='ug-citywide-script';s.src=new URL('citywide/v0.1/job_5ad8c512918146618b33/citywide-profile-reader-v0.8.js?v=mobility-host-20261119',ui).href;s.async=true;root.document.head.appendChild(s)}
function boot(){citywideBoot();installProfileDesign();NETWORK.boot();if(bound||!local()||!root.document)return;bound=true;let css=root.document.createElement('link');css.rel='stylesheet';css.href=new URL('report-profiles.css?v=mobility-host-20261119',ui).href;root.document.head.appendChild(css);let signatureCss=root.document.createElement('style');signatureCss.textContent=".ugsp-overview,.ugsp-reading{color:inherit}\n.ugsp-overview{margin:12px 0 16px;padding:12px;border:1px solid #afc6bc;border-radius:9px;background:#f4f8f5}\n.ugsp-heading{display:flex;align-items:baseline;flex-wrap:wrap;justify-content:space-between;gap:5px}\n.ugsp-heading h3{margin:0;color:#22483f}\n.ugsp-heading span,.ugsp-status,.ugsp-method,.ugsp-radials p{font-size:11px;color:#46625a}\n.ugsp-status:empty{display:none}\n.ugsp-controls,.ugsp-map-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:8px 0}\n.ugsp-controls label,.ugsp-map-controls label{display:grid;gap:3px;font-size:11px}\n.ugsp-controls select,.ugsp-map-controls select{width:100%;min-width:0;font:inherit;padding:4px}\n.ugsp-action[hidden],.ugsp-map-controls[hidden],.ugsp-map-controls label[hidden]{display:none!important}\n.ugsp-spider,.ugsp-detail,.ugsp-radials figure{margin:6px 0 9px}\n.ugsp-spider svg{display:block;width:min(100%,330px);height:auto;margin:auto}\n.ugsp-spider figcaption{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin:3px 0;font-size:11px;color:#36534b}\n.ugsp-spider figcaption span::before{content:\"\";display:inline-block;width:10px;height:3px;margin:0 5px 3px 0;background:var(--ugsp-mode)}\n.ugsp-svg-text{font:600 13px system-ui;fill:#2a4940}\n.ugsp-values{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));text-align:center;gap:4px;margin:10px 0}\n.ugsp-values div{border-top:1px solid #c9dbd3;padding-top:4px}\n.ugsp-values span{display:block;overflow-wrap:anywhere;font-size:11px}\n.ugsp-values b{display:inline-block;font-variant-numeric:tabular-nums;margin:2px 5px}\n.ugsp-radials{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:8px}\n.ugsp-radials figure{text-align:center;border:1px solid #ccddd5;border-radius:8px;padding:8px}\n.ugsp-radials figcaption,.ugsp-detail figcaption{font-weight:650;font-size:12px}\n.ugsp-circles{display:block;width:min(100%,300px);height:auto;margin:0 auto;text-anchor:middle}\n.ugsp-node-label{font:600 10.5px system-ui;fill:#305146}\n.ugsp-number{font:700 11px system-ui;font-variant-numeric:tabular-nums}\n.ugsp-detail{padding:7px 0}\n.ugsp-reach-row{display:grid;grid-template-columns:47px 1fr;align-items:center;padding:3px 4px;gap:5px;font-size:11px}\n.ugsp-selected{background:#eaf1ed;border-radius:3px}\n.ugsp-bar-row{display:flex;align-items:center;min-height:13px;gap:6px;position:relative;padding-right:44px}\n.ugsp-bar-row i{display:block;height:5px;background:var(--ugsp-mode);border-radius:3px}\n.ugsp-bar-value{position:absolute;right:0;font-size:10px;font-variant-numeric:tabular-nums}\n.ugsp-amenities{list-style:none;padding:0;margin:6px 0}\n.ugsp-amenities li{display:grid;grid-template-columns:minmax(80px,1fr) 72px 72px;gap:4px;align-items:center;border-top:1px solid #d6e2dc;padding:3px 0;font-size:11px}\n.ugsp-amenity{display:flex;justify-content:end;align-items:center;gap:3px}\n.ugsp-amenity i{border:1px solid #a0b3ab;width:6px;height:6px;border-radius:50%}\n.ugsp-amenity i.hit{background:var(--ugsp-mode);border-color:var(--ugsp-mode)}\n.ugsp-amenity b{min-width:30px;text-align:right;font-variant-numeric:tabular-nums}\n.ugsp-ramp{height:8px;border-radius:3px}\n.ugsp-ramp-labels,.ugsp-cell{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;font-size:11px}\n.ugsp-missing{font-size:11px;display:flex;align-items:center;gap:4px}\n.ugsp-missing i{display:inline-block;width:8px;height:8px;border:1px solid #697579}\n@media(max-width:340px){.ugsp-controls,.ugsp-map-controls{grid-template-columns:1fr}}\n@media print{.ugsp-controls,.ugsp-action{display:none!important}.ugsp-spider,.ugsp-detail,.ugsp-radials{print-color-adjust:exact;break-inside:avoid}}\n\n.ugsp-scale{font:10px system-ui;fill:#4b6a60}\n.ugsp-sites{width:100%;border-collapse:collapse;margin:8px 0;font-size:11px}\n.ugsp-sites th,.ugsp-sites td{padding:4px;border-bottom:1px solid #d6e2dc;text-align:left}\n.ugsp-sites th:first-child{width:50%}\n.ugmp-card .ugsp-action,.ugmp-card [data-ugsp-sites-button]{border:1px solid #8ea89c;border-radius:5px;background:#fff;color:#21473d;padding:6px 8px;font:inherit}\n";root.document.head.appendChild(signatureCss);S.selection=root.UGA_V2_SELECTION?.snapshot?.()||null;root.UGA_V2_SELECTION?.subscribe(state=>{onwardClear();S.selection=state;queue()});let body=root.document.getElementById('placeReportBody');if(body&&root.MutationObserver){observer=new root.MutationObserver(()=>{if(body.querySelector('.v2-report-sheet')&&!body.querySelector('[data-ugmp-card]'))queue()});observer.observe(body,{childList:true,subtree:true})}queue()}

const serviceBase=new URL('services/v0.1/job_0e049b46c3c6d9ed0e8e/',base),serviceManifestSHA='5ed7a9b58318ab62af071ff595af75d71d726d640c89485e22d41fc7d76d518e',serviceFamilies=['Bus / feeder','Minibus','Ferry','Tram','Peak Tram'];let serviceManifestPending=null,cityServicePending=null;const serviceBuckets=new Map();
async function serviceJSON(url,pin){let r=await root.fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Service profiles HTTP '+r.status);let t=await r.text(),h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));if([...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('')!==pin)throw Error('Service profile checksum differs');return JSON.parse(t)}
async function serviceManifest(){if(!serviceManifestPending)serviceManifestPending=serviceJSON(new URL('manifest.json',serviceBase),serviceManifestSHA).then(m=>{if(m.version!=='MOBILITY_SERVICE_READER_V0_1'||JSON.stringify(m.bands)!==JSON.stringify(bands)||m.grains.building.records!==342223||m.grains.hex.records!==374784)throw Error('Service profile coverage differs');return m}).catch(e=>{serviceManifestPending=null;throw e});return serviceManifestPending}
function serviceMatrix(m,n){return Array.isArray(m)&&m.length===6&&m.every((r,b)=>Array.isArray(r)&&r.length===n&&r.every((v,g)=>Number.isInteger(v)&&v>=0&&(!b||v>=m[b-1][g])))}
async function loadServiceProfile(grain,id){id=String(id);if(!['building','hex'].includes(grain))throw Error('Service profile grain is unassessed');let m=await serviceManifest(),h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),bucket=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),key=grain+'/'+bucket;if(!serviceBuckets.has(key)){serviceBuckets.set(key,serviceJSON(new URL(key+'.json',serviceBase),m.grains[grain].shards[bucket].sha256).catch(e=>{serviceBuckets.delete(key);throw e}));while(serviceBuckets.size>8)serviceBuckets.delete(serviceBuckets.keys().next().value)}let d=await serviceBuckets.get(key),p=d.records?.[id];if(d.version!==m.version||d.grain!==grain||p?.id!==id||typeof p.assessed!=='boolean'||!['building_initial','building_nearest','hex'].includes(p.basis)||(grain==='hex')!==(p.basis==='hex')||(p.assessed?(!serviceMatrix(p.routes,5)||!serviceMatrix(p.unresolved,8)):p.routes!==null||p.unresolved!==null))throw Error('Service profile identity or values differ');if(p.assessed&&p.routes.some(row=>row.some((v,g)=>v>m.family_route_limits[g])))throw Error('Service route count exceeds source catalogue');return p}
async function loadCityServices(){if(!cityServicePending)cityServicePending=(async()=>{let m=await serviceManifest(),d=await serviceJSON(new URL('citywide-services.json',serviceBase),m.citywide.sha256);if(d.version!==m.version||Object.keys(d.records||{}).length!==84877||d.assessed!==40146||d.unassessed!==44731||d.histograms?.length!==6||d.unresolved_only?.length!==6)throw Error('Citywide service coverage differs');return d})().catch(e=>{cityServicePending=null;throw e});return cityServicePending}
function serviceHTML(p){if(S.profile!=='walking')return '<h4>Service routes</h4><p class="ugmp-note">Step-free service access remains unassessed.</p>';if(!p.assessed)return '<h4>Service routes</h4><p class="ugmp-note">Unassessed: no recorded network starting position is retained for this profile.</p>';let row=p.routes[S.band],maximum=Math.max(1,...row),u=p.unresolved[S.band],unresolved=u.reduce((a,b)=>a+b,0);return '<h4 style="margin:0 0 8px">Source routes within '+bands[S.band].toLocaleString('en-GB')+' m</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px">'+row.map((n,i)=>'<div><strong style="font-size:19px">'+n+'</strong><div style="height:6px;background:#e5ede8;margin:4px 0"><i style="display:block;height:100%;width:'+(n/maximum*100)+'%;background:#276f62"></i></div><span style="font-size:11px">'+serviceFamilies[i]+'</span></div>').join('')+'</div><p class="ugmp-note">Distinct source route IDs; several nearby stops serving one route count once. Directions and patterns of one route are grouped. No date/time filtering.</p>'+(unresolved?'<p class="ugmp-note">Service links remain unresolved for '+unresolved+' reached source references at this distance. Existing route options are retained alongside these gaps.</p>':'')+'<p class="ugmp-note">Rail is reported separately below; separate MTR feeder identities remain unassessed. '+(p.basis==='building_nearest'?'Distances begin at the nearest recorded network positions; the building approach gap remains separate.':'The existing network starting positions and unverified attachment gaps are retained.')+'</p>'}
async function serviceReading(host,grain,id,active,expectedBasis){let block=root.document.createElement('section');block.className='ugmp-graphic';block.style.gridColumn='1 / -1';block.setAttribute('data-ugmp-services','');block.innerHTML='<p class="ugmp-note">Loading service route options…</p>';let grid=host.querySelector('.ugmp-graphic-grid');if(grid)grid.insertBefore(block,grid.querySelector('.ugmp-strength'));else host.appendChild(block);try{let p=await loadServiceProfile(grain,id);if(!active())return;if(p.basis!==expectedBasis)throw Error('Service starting-position basis differs');block.innerHTML=serviceHTML(p)}catch(e){if(active())block.innerHTML='<h4>Service routes</h4><p class="ugmp-note">Unavailable: '+esc(e.message)+'. This reading remains unassessed.</p>'}}

const onwardBase=new URL('destinations/v0.1/job_b06f5317e47ed42df105/',base),onwardPin='8de3a53d54c64b781ee613784c43a54e8133f715e539376e394958d21172e6ed';let onwardManifestPromise=null,onwardCataloguePromise=null,onwardMap=null,onwardLayerOwner=null;const onwardBuckets=new Map(),onwardColours=['#276f62','#9b5c9d','#2879ae','#b57b26','#525fa9'],onwardNames=['Bus / feeder','Minibus','Ferry','Tram','Peak Tram'];
async function onwardManifest(){if(!onwardManifestPromise)onwardManifestPromise=serviceJSON(new URL('manifest.json',onwardBase),onwardPin).then(m=>{if(m.version!=='MOBILITY_DESTINATION_MAP_V0_1'||JSON.stringify(m.bands)!==JSON.stringify(bands)||m.grains.building.records!==342223||m.grains.hex.records!==374784)throw Error('Destination coverage differs');return m}).catch(e=>{onwardManifestPromise=null;throw e});return onwardManifestPromise}
async function onwardCatalogue(){if(!onwardCataloguePromise)onwardCataloguePromise=(async()=>{let m=await onwardManifest(),c=await serviceJSON(new URL('catalogue.json',onwardBase),m.catalogue.sha256);if(c.stops.length!==9367||c.references.length!==12986)throw Error('Destination catalogue differs');c.stops.forEach(s=>{if(!Array.isArray(s)||s.length!==4||typeof s[0]!=='string'||typeof s[1]!=='string'||!Number.isFinite(s[2])||!Number.isFinite(s[3])||s[2]<-180||s[2]>180||s[3]<-85||s[3]>85)throw Error('Destination coordinates differ')});c.references.forEach(r=>{if(!Array.isArray(r)||r.length!==3||typeof r[0]!=='string'||!Number.isInteger(r[1])||r[1]<0||r[1]>4||!Array.isArray(r[2])||!r[2].length||r[2].some((v,i)=>!Number.isInteger(v)||v<0||v>=c.stops.length||i&&v<=r[2][i-1]))throw Error('Destination reference differs')});return c})().catch(e=>{onwardCataloguePromise=null;throw e});return onwardCataloguePromise}
async function onwardProfile(grain,id){if(!['building','hex'].includes(grain)||typeof id!=='string')throw Error('Destination grain or identity differs');let m=await onwardManifest(),h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),b=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),key=grain+'/'+b;if(!onwardBuckets.has(key)){onwardBuckets.set(key,serviceJSON(new URL(key+'.json',onwardBase),m.grains[grain].shards[b].sha256).catch(e=>{onwardBuckets.delete(key);throw e}));while(onwardBuckets.size>6)onwardBuckets.delete(onwardBuckets.keys().next().value)}let d=await onwardBuckets.get(key),p=d.records?.[id];if(d.version!==m.version||d.grain!==grain||!p||typeof p.assessed!=='boolean'||!['building_initial','building_nearest','hex'].includes(p.basis)||(grain==='hex')!==(p.basis==='hex')||!Array.isArray(p.references)||p.references.length%2||p.references.some((v,i)=>!Number.isInteger(v)||(i%2?v<0||v>5:v<0||v>=12986||i>0&&v<=p.references[i-2]))||(p.assessed?!serviceMatrix(p.counts,6):p.counts!==null||p.references.length))throw Error('Destination profile differs');return p}
function onwardSet(p,c,b,f=-1){let reached=new Map();for(let i=0;i<p.references.length;i+=2){if(p.references[i+1]>b)continue;let r=c.references[p.references[i]],g=r[1];if(f!==-1&&g!==f)continue;for(let k of r[2])reached.set(k,(reached.get(k)||0)|(1<<g))}return reached}
function onwardVerify(p,c){if(!p.assessed)return;for(let b=0;b<6;b++){let all=onwardSet(p,c,b),row=[all.size,...onwardNames.map((_,g)=>[...all.values()].filter(mask=>mask&(1<<g)).length)];if(JSON.stringify(row)!==JSON.stringify(p.counts[b]))throw Error('Destination set and reviewed count differ')}}
function onwardClear(){timeClear();let m=onwardMap;if(m){try{if(m.getLayer('ug-direct-destinations'))m.removeLayer('ug-direct-destinations');if(m.getSource('ug-direct-destinations'))m.removeSource('ug-direct-destinations')}catch(e){}if(onwardLayerOwner){m.off?.('style.load',onwardLayerOwner.style);m.off?.('mousemove','ug-direct-destinations',onwardLayerOwner.click)}}onwardMap=null;onwardLayerOwner=null}
function onwardShow(c,reached,status){onwardClear();let m=root.UGA_V2_MAP;if(!m||!m.isStyleLoaded?.()){status.textContent='The atlas map is still loading. Try again shortly.';return}let features=[...reached].map(([k,mask])=>({type:'Feature',geometry:{type:'Point',coordinates:c.stops[k].slice(2)},properties:{name:c.stops[k][1],stop:c.stops[k][0],colour:onwardColours[[0,1,2,3,4].find(g=>mask&(1<<g))]}}));if(!features.length){status.textContent='No qualified mapped direct destinations at this distance. Other service evidence may remain unresolved.';return}try{m.addSource('ug-direct-destinations',{type:'geojson',data:{type:'FeatureCollection',features}});m.addLayer({id:'ug-direct-destinations',type:'circle',source:'ug-direct-destinations',paint:{'circle-radius':['interpolate',['linear'],['zoom'],9,2.5,15,5],'circle-color':['get','colour'],'circle-stroke-color':'#ffffff','circle-stroke-width':0.7,'circle-opacity':0.85}});let xx=features.map(f=>f.geometry.coordinates[0]),yy=features.map(f=>f.geometry.coordinates[1]);m.fitBounds([[Math.min(...xx),Math.min(...yy)],[Math.max(...xx),Math.max(...yy)]],{padding:{top:90,left:80,bottom:80,right:Math.min(650,Math.round((root.innerWidth||1200)*0.45))},maxZoom:14,duration:700});onwardMap=m;let style=()=>onwardClear(),click=e=>{let q=e.features?.[0]?.properties;if(q&&status.isConnected)status.textContent=q.name+' · source stop '+q.stop};onwardLayerOwner={style,click};m.on('style.load',style);m.on('mousemove','ug-direct-destinations',click);status.textContent=features.length.toLocaleString('en-GB')+' destination stop IDs shown. Hover over a destination dot for its name.'}catch(e){onwardMap=m;onwardClear();status.textContent='Destination overlay unavailable: '+e.message}}
function onwardBounds(c,reached){let points=[...reached.keys()].map(k=>c.stops[k]).map(s=>[30+(s[2]-113.8)*560,310-(s[3]-22.12)*560/Math.cos(22.35*Math.PI/180)]);if(!points.length)return [0,0,440,330];let xx=points.map(p=>p[0]),yy=points.map(p=>p[1]),x0=Math.min(...xx),x1=Math.max(...xx),y0=Math.min(...yy),y1=Math.max(...yy),w=Math.max(12,x1-x0)*1.16,h=Math.max(10,y1-y0)*1.16;w=Math.max(w,h*1.4);h=w/1.4;return [(x0+x1-w)/2,(y0+y1-h)/2,w,h]}
function onwardMapControls(block,c,reached){let svg=block.querySelector('svg'),tools=root.document.createElement('div');tools.style.cssText='display:flex;flex-wrap:wrap;gap:5px;margin:8px 0';tools.innerHTML='<button type="button" data-dest-zoom="in" aria-label="Zoom in on destination map">＋</button><button type="button" data-dest-zoom="out" aria-label="Zoom out on destination map">−</button><button type="button" data-dest-fit>Fit destinations</button><button type="button" data-dest-expand aria-expanded="false">Enlarge map</button>';svg.before(tools);svg.style.cssText='width:100%;height:400px;min-height:300px;max-height:none;touch-action:none;cursor:grab';svg.setAttribute('aria-label','Direct surface-service destination map. Use zoom buttons and drag to pan. Rail is not yet included.');let view=onwardBounds(c,reached),expanded=false,drag=null;const paint=()=>svg.setAttribute('viewBox',view.join(' '));const zoom=factor=>{let w=Math.max(2,Math.min(1200,view[2]*factor)),h=w/1.4;view=[view[0]+(view[2]-w)/2,view[1]+(view[3]-h)/2,w,h];paint()};paint();tools.querySelector('[data-dest-zoom="in"]').onclick=()=>zoom(0.65);tools.querySelector('[data-dest-zoom="out"]').onclick=()=>zoom(1/0.65);tools.querySelector('[data-dest-fit]').onclick=()=>{view=onwardBounds(c,reached);paint()};tools.querySelector('[data-dest-expand]').onclick=e=>{expanded=!expanded;svg.style.height=expanded?'650px':'400px';e.currentTarget.textContent=expanded?'Reduce map':'Enlarge map';e.currentTarget.setAttribute('aria-expanded',String(expanded))};svg.onpointerdown=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,view:[...view]};svg.setPointerCapture?.(e.pointerId);svg.style.cursor='grabbing'};svg.onpointermove=e=>{if(!drag)return;let rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/view[2],rect.height/view[3]);if(!scale)return;view=[drag.view[0]-(e.clientX-drag.x)/scale,drag.view[1]-(e.clientY-drag.y)/scale,view[2],view[3]];paint()};svg.onpointerup=svg.onpointercancel=()=>{drag=null;svg.style.cursor='grab'};svg.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();zoom(e.deltaY<0?0.85:1/0.85)},{passive:false})}

function onwardSVG(c,reached){const x=lon=>30+(lon-113.8)*560,y=lat=>310-(lat-22.12)*560/Math.cos(22.35*Math.PI/180);let dots=c.stops.map(s=>'<circle cx="'+x(s[2]).toFixed(2)+'" cy="'+y(s[3]).toFixed(2)+'" r="0.65" fill="#c5cccb"/>').join('');for(let [k,mask] of reached){let s=c.stops[k],g=[0,1,2,3,4].find(i=>mask&(1<<i));dots+='<circle cx="'+x(s[2]).toFixed(2)+'" cy="'+y(s[3]).toFixed(2)+'" r="1.7" fill="'+onwardColours[g]+'"><title>'+esc(s[1])+' · '+esc(s[0])+'</title></circle>'}return '<svg viewBox="0 0 440 330" role="img" aria-label="Geographic distribution of direct destination stops. Grey dots are other source stops; coloured dots are reached destinations."><rect width="440" height="330" rx="5" fill="#f2f5f5"/>'+dots+'<g fill="#53615f" font-size="12"><text x="231" y="267">Hong Kong Island</text><text x="241" y="180">Kowloon</text><text x="171" y="83">New Territories</text><text x="105" y="241">Lantau</text><text x="400" y="20">N ↑</text></g></svg>'}
async function onwardReading(host,grain,id,active,expectedBasis,options={}){let readingBand=options.band??S.band,readingProfile=options.profile??S.profile;onwardClear();let block=root.document.createElement('section');block.className='ugmp-graphic';block.style.gridColumn='1 / -1';block.setAttribute('data-ugmp-destinations','');let grid=host.querySelector('.ugmp-graphic-grid');if(grid)grid.appendChild(block);else host.appendChild(block);block.innerHTML='<h4>Where direct surface services can take you</h4><p class="ugmp-note">Loading destination reach…</p>';if(readingProfile!=='walking'){block.innerHTML='<h4>Direct destination reach</h4><p class="ugmp-note">Step-free journeys remain unassessed.</p>';return}try{let [p,c]=await Promise.all([onwardProfile(grain,id),onwardCatalogue()]);if(!active())return;if(p.basis!==expectedBasis)throw Error('Destination starting-position basis differs');onwardVerify(p,c);if(!p.assessed){block.innerHTML='<h4>Direct destination reach</h4><p class="ugmp-note">Unassessed: no retained network start. A legitimate approach may exist outside the pedestrian data.</p>';return}let f=-1;const draw=()=>{if(!active())return;onwardClear();let reached=onwardSet(p,c,readingBand,f);block.innerHTML='<h4 style="margin:0 0 6px">Where direct surface services can take you</h4><p class="ugmp-note"><strong>'+reached.size.toLocaleString('en-GB')+' destination stop IDs</strong> · boarding references within '+bands[readingBand].toLocaleString('en-GB')+' m on the walking network.</p><label style="font-size:12px">Destination modes <select data-onward-family><option value="-1">All mapped surface modes</option>'+onwardNames.map((n,g)=>'<option value="'+g+'"'+(f===g?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label><p class="ugmp-note"><strong>Rail not yet included.</strong> Drag to pan; use + / − to zoom or enlarge the map.</p>'+onwardSVG(c,reached)+'<p class="ugmp-note">'+onwardNames.map((n,g)=>'<span style="color:'+onwardColours[g]+'">● '+esc(n)+'</span>').join(' · ')+'<br>Grey: other source stops. A stop shared by families is shown once; filter by mode to inspect each family.</p><button type="button" data-onward-show>Show destinations on atlas map</button> <button type="button" data-onward-clear>Clear destinations</button><p class="ugmp-note" data-onward-status aria-live="polite"></p><p class="ugmp-note">Direct ordered surface services, without transfers or timetable filtering. This shows stop locations, not a continuous reachable area or an isochrone. Rail remains unassessed. '+(p.basis==='building_nearest'?'The building-to-network approach gap remains separate.':grain==='hex'?'Different starts in this cell can contribute different journeys.':'Access from the building to the source paths remains conditional.')+' Walking beyond the arrival stop is not included.</p>';block.querySelector('[data-onward-family]').onchange=e=>{let n=Number(e.target.value);if(Number.isInteger(n)&&n>=-1&&n<=4){f=n;draw()}};let status=block.querySelector('[data-onward-status]');block.querySelector('[data-onward-show]').onclick=()=>{if(active())onwardShow(c,reached,status)};block.querySelector('[data-onward-clear]').onclick=()=>{onwardClear();status.textContent='Destination overlay cleared.'};onwardMapControls(block,c,reached)};draw()}catch(e){if(active())block.innerHTML='<h4>Direct destination reach</h4><p class="ugmp-note">Unavailable: '+esc(e.message)+'. This reading remains unassessed.</p>'}}

const railBase=new URL('rail/v0.2/job_8b825f93f5fb962273c9/',base),railManifestPin='a4d9f91f7c56a8c39bacdef1e50117bf75aa29d68e52cfbbdfe8b820cc7346ac';let railManifestPromise=null,railCataloguePromise=null,railCityPromise=null;const railBuckets=new Map();
async function railManifest(){if(!railManifestPromise)railManifestPromise=serviceJSON(new URL('manifest.json',railBase),railManifestPin).then(m=>{if(m.version!=='MOBILITY_NATIVE_RAIL_READER_V0_1'||JSON.stringify(m.bands)!==JSON.stringify(bands)||m.grains.building.records!==342223||m.grains.hex.records!==374784||m.targets!==168)throw Error('Rail coverage differs');return m}).catch(e=>{railManifestPromise=null;throw e});return railManifestPromise}
async function railCatalogue(){if(!railCataloguePromise)railCataloguePromise=(async()=>{let m=await railManifest(),c=await serviceJSON(new URL('catalogue.json',railBase),m.catalogue.sha256);if(c.targets.length!==168||c.targets.some(t=>t.labels.length!==7))throw Error('Rail catalogue differs');return c})().catch(e=>{railCataloguePromise=null;throw e});return railCataloguePromise}
async function railProfile(grain,id){id=String(id);if(!['building','hex'].includes(grain))throw Error('Rail grain remains unassessed');let m=await railManifest(),h=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),b=[...new Uint8Array(h)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),key=grain+'/'+b;if(!railBuckets.has(key)){railBuckets.set(key,serviceJSON(new URL(key+'.json',railBase),m.grains[grain].shards[b].sha256).catch(e=>{railBuckets.delete(key);throw e}));while(railBuckets.size>6)railBuckets.delete(railBuckets.keys().next().value)}let d=await railBuckets.get(key),p=d.records?.[id];if(d.version!==m.version||d.grain!==grain||!p||typeof p.assessed!=='boolean'||!['building_initial','building_nearest','hex'].includes(p.basis)||(grain==='hex')!==(p.basis==='hex')||!Array.isArray(p.references)||p.references.length%2||p.references.some((v,i)=>!Number.isInteger(v)||(i%2?v<0||v>5:v<0||v>=168||i>0&&v<=p.references[i-2]))||(p.assessed?!serviceMatrix(p.counts,7):p.counts!==null||p.references.length))throw Error('Rail profile values differ');if(p.assessed&&p.counts.some(row=>row.some((v,i)=>v>m.limits[i])))throw Error('Rail values exceed catalogue');return p}
async function railCity(){if(!railCityPromise)railCityPromise=(async()=>{let m=await railManifest(),d=await serviceJSON(new URL('citywide.json',railBase),m.citywide.sha256);if(d.version!==m.version||Object.keys(d.records).length!==84877||d.assessed!==40146||d.unassessed!==44731)throw Error('Rail map coverage differs');return d})().catch(e=>{railCityPromise=null;throw e});return railCityPromise}
function railSets(p,c,b){let sets=Array.from({length:7},()=>new Set());for(let i=0;i<p.references.length;i+=2){if(p.references[i+1]>b)continue;let t=c.targets[p.references[i]];for(let g=0;g<7;g++)t.labels[g].forEach(v=>sets[g].add(v))}return {sets}}
function railCheck(p,c){if(!p.assessed)return;for(let b=0;b<6;b++)if(JSON.stringify(railSets(p,c,b).sets.map(s=>s.size))!==JSON.stringify(p.counts[b]))throw Error('Rail source sets differ from reviewed counts')}
function railHTML(p,c,b){if(!p.assessed)return '<h4>Rail potential</h4><p class="ugmp-note">Unassessed: no retained network start for this profile.</p>';let r=railSets(p,c,b),v=p.counts[b],names=(set,ns)=>[...set].sort().map(code=>esc(c.names[ns]?.[code]||code)+' <small>('+esc(code)+')</small>').join(' · '),row=(name,k)=>'<div style="margin:7px 0"><strong>'+name+'</strong><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px">'+[[v[k],'Stations / stops'],[v[k+1],'Lines / routes'],[v[k+2],'Direct onward stops']].map(([n,label])=>'<div><b style="font-size:19px">'+n+'</b><div style="font-size:11px">'+label+'</div></div>').join('')+'</div></div>';return '<h4 style="margin:0 0 5px">Rail · source potential</h4><p class="ugmp-note">Within '+bands[b].toLocaleString('en-GB')+' m on the recorded walking network'+(p.basis==='building_nearest'?' · building approach gap excluded':'')+'</p>'+row('Main rail',0)+row('Light Rail',3)+'<details><summary>Stations, stops and direct connections</summary><p><strong>Main rail:</strong> '+(names(r.sets[0],'MTR_MAIN')||'No source match in this band')+'</p><p><strong>Lines:</strong> '+([...r.sets[1]].sort().map(esc).join(' · ')||'None reached in this source model')+'</p><p><strong>Light Rail:</strong> '+(names(r.sets[3],'MTR_LIGHT_RAIL')||'No source match in this band')+'</p><p><strong>Routes:</strong> '+([...r.sets[4]].sort().map(esc).join(' · ')||'None reached in this source model')+'</p><p><strong>Direct main-rail destinations:</strong> '+(names(r.sets[2],'MTR_MAIN')||'No source match')+'</p><p><strong>Direct Light Rail destinations:</strong> '+(names(r.sets[5],'MTR_LIGHT_RAIL')||'No source match')+'</p></details><p class="ugmp-note">Retains named entrance options and adds native station-related paths at their recorded levels. Zero distance can mean a start already on a station-related path; it does not establish entry or boarding time. Different starts can contribute different options. Onward stops follow one published direction; transfers and journey times remain unassessed.</p><p class="ugmp-note">'+v[6]+' reached native terminal context(s) lack an operator-pattern match. Provider entrance IDs remain unresolved as station identities. A zero does not establish no rail access. Physical passage, current operation and continuous step-free access remain unverified.</p>'}
async function railReferenceReading(host,grain,id,active,expectedBasis){let block=root.document.createElement('section');block.className='ugmp-graphic';block.style.gridColumn='1 / -1';block.setAttribute('data-ugmp-rail','');let grid=host.querySelector('.ugmp-graphic-grid');if(grid)grid.appendChild(block);else host.appendChild(block);block.innerHTML='<p class="ugmp-note">Loading rail stations and onward potential…</p>';if(S.profile!=='walking'){block.innerHTML='<h4>Rail potential</h4><p class="ugmp-note">Step-free rail access remains unassessed.</p>';return}try{let [p,c]=await Promise.all([railProfile(grain,id),railCatalogue()]);if(!active())return;if(p.basis!==expectedBasis)throw Error('Rail starting-position basis differs');railCheck(p,c);block.innerHTML=railHTML(p,c,S.band)}catch(e){if(active())block.innerHTML='<h4>Rail potential</h4><p class="ugmp-note">Unavailable: '+esc(e.message)+'. This reading remains unassessed.</p>'}}
async function surfaceDestinations(host,id,b,active){let p=await loadHex(String(id));if(!active())return;await onwardReading(host,'hex',String(id),active,'hex',{band:b,profile:'walking'})}

const reportTasks=new Set();let reportTabsStarted=false,reportTab='overview',reportTabCounter=0;
function trackReportTask(p){reportTasks.add(p);p.then(()=>reportTasks.delete(p),()=>reportTasks.delete(p));return p}
function renderHexCard(...args){return trackReportTask(_renderHexCard(...args))}
function renderBuildingCard(...args){return trackReportTask(_renderBuildingCard(...args))}
function breadth(row){return [[0,3],[2],[5,6],[7],[1],[4]].filter(gg=>gg.some(g=>row[g]>0)).length}
function caption(name,value,text){return '<figcaption><strong>'+esc(value)+'</strong><b>'+esc(name)+'</b><span>'+esc(text)+'</span></figcaption>'}
function modeBars(row,title,description,limit){let max=limit||Math.max(1,...row),s='<figure class="ugmp-graphic"><div class="ugmp-bar-scale" aria-hidden="true"><span>0</span><span>'+max+'</span></div><div class="ugmp-mode-bars" role="group" aria-label="'+esc(title)+'">';row.forEach((v,g)=>{s+='<div class="ugmp-mode-row"><span>'+esc(labels[g])+'</span><i aria-hidden="true"><i style="width:'+v/max*100+'%"></i></i><b>'+v+'</b></div>'});return s+'</div>'+caption(title,'Reference counts',description)+'</figure>'}
function strength(counts,inside){let row=counts[S.band],n=breadth(row),local=inside?breadth(inside):null;return '<figure class="ugmp-graphic ugmp-strength"><div class="ugmp-strength-value">'+n+'<small> / 6</small></div><div class="ugmp-family-track">'+Array.from({length:6},(_,i)=>'<i class="'+(i<n?'is-present':'')+'"></i>').join('')+'</div>'+caption('Connectivity breadth · '+bands[S.band].toLocaleString('en-GB')+' m',n+' of 6 transport families', (local===null?'':local+' families mapped inside the cell. ')+'Network reach uses bus (including feeder), minibus, rail, tram, ferry and Peak Tram. This is a descriptive component of strength; proximity, routes, quality and temporal performance are not combined into a score. Road and cycling remain unassessed.')+'</figure>'}
function modalGraphics(counts,inside=null){if(!counts)return '';let row=counts[S.band],peak=Math.max(1,...row,...(inside||[])),limit=peak<=10?10:Math.ceil(peak/Math.pow(10,Math.floor(Math.log10(peak))))*Math.pow(10,Math.floor(Math.log10(peak)));return '<div class="ugmp-graphic-grid">'+(inside?modeBars(inside,'1 · Mapped inside the cell','Point references inside or on the boundary, independent of path reach, height or travel profile. Both bar charts use the same count scale.',limit):'')+modeBars(row,(inside?'2 · ':'')+'Network reach · '+bands[S.band].toLocaleString('en-GB')+' m','References reached from retained starting options. '+(inside?'Inside references may also be reached; the two readings must not be added. ':'')+'Rail feeds remain separate and can overlap. Records are not unique services or verified boarding points.',limit)+strength(counts,inside)+'</div>'}
function gapGraphic(p){let r=gapReading(p),d=r.xy_gap_m,n=gapBounds.length,w=390/n,s='<figure class="ugmp-graphic ugmp-gap"><svg viewBox="0 0 460 90" role="img" aria-label="Horizontal building to recorded path gap">';gapBounds.forEach((hi,i)=>{s+='<rect x="'+(30+i*w)+'" y="32" width="'+(w-1)+'" height="16" fill="'+(hi===r.upper_m?'#276f62':'#e5ede8')+'"/>';if([10,50,100,250,1000].includes(hi))s+='<text x="'+(30+(i+1)*w)+'" y="68" text-anchor="middle">'+hi+'</text>'});if(d!==null){let i=d===0?0:gapBounds.indexOf(r.upper_m),lo=i?gapBounds[i-1]:0,x=30+(i+(d-lo)/(gapBounds[i]-lo))*w;s+='<path d="M'+x+' 22v32" stroke="#945d24" stroke-width="3"/>'}return s+'</svg>'+caption('Approach to the recorded network',d===null?'> 1,000 m search limit':d.toLocaleString('en-GB',{maximumFractionDigits:1})+' m','Horizontal footprint-to-path gap; approach unverified and excluded from onward network distances. Equal-width bands: 10 m increments to 100 m, then 150, 200, 250, 500 and 1,000 m.')+'</figure>'}
function radial(cc){if(!cc)return '<p class="ugmp-empty">Network reach remains unassessed.</p>';let modes=[['Bus',[0]],['Minibus',[2]],['Rail',[5,6]],['Tram',[7]],['Ferry',[1]],['Feeder bus',[3]],['Peak Tram',[4]],['Road',[]],['Cycling',[]]],s='<figure class="ugmp-graphic ugmp-radial"><svg viewBox="0 0 480 480" role="img" aria-label="Transport references by mode and network distance band"><circle cx="240" cy="240" r="58" fill="#f4f7f2" stroke="#b8ccc3"/><text x="240" y="236" text-anchor="middle">Starting</text><text x="240" y="252" text-anchor="middle">options</text>';bands.forEach((b,j)=>{let r=80+j*18;s+='<circle cx="240" cy="240" r="'+r+'" fill="none" stroke="'+(j===S.band?'#276f62':'#d0dcd4')+'" stroke-width="'+(j===S.band?2:1)+'"/><text x="'+(236-r*.707)+'" y="'+(236-r*.707)+'" text-anchor="end" style="font-size:10px">'+b+'</text>'});modes.forEach(([name,gg],i)=>{let a=-Math.PI/2+i*Math.PI*2/9;s+='<path d="M'+(240+58*Math.cos(a))+' '+(240+58*Math.sin(a))+'L'+(240+176*Math.cos(a))+' '+(240+176*Math.sin(a))+'" stroke="#dce4de"/><text x="'+(240+204*Math.cos(a))+'" y="'+(244+204*Math.sin(a))+'" text-anchor="middle">'+name+'</text>';if(!gg.length){s+='<text x="'+(240+125*Math.cos(a))+'" y="'+(244+125*Math.sin(a))+'" text-anchor="middle">—</text>';return}gg.forEach(g=>{let aa=a+(gg.length===2?(g===5?-.065:.065):0),any=false;bands.forEach((b,j)=>{let n=cc[j][g]-(j?cc[j-1][g]:0);if(n){any=true;let r=80+j*18;s+='<circle cx="'+(240+r*Math.cos(aa))+'" cy="'+(240+r*Math.sin(aa))+'" r="'+Math.min(8,3+Math.log2(n+1))+'" fill="#276f62" fill-opacity="'+(g===5?.35:.85)+'"><title>'+esc(labels[g])+' · '+n+' added; '+cc[j][g]+' by '+b+' m</title></circle>'}});if(!any)s+='<text x="'+(240+125*Math.cos(aa))+'" y="'+(244+125*Math.sin(aa))+'" text-anchor="middle">?</text>'})});return s+'</svg>'+caption('Mode reach across distance bands','50–2,000 m','Open centre separates modes at short distances. Rings are equally spaced distance bands; dots show additional records. ? means no source match; — means unassessed. Neither establishes transport absence.')+'</figure>'}
function tabCategory(nodes){if(nodes.some(n=>n.matches?.('[data-ugmp-card]')))return 'mobility';if(nodes.some(n=>n.matches?.('.v2-sheet-metric-grid--hero')))return 'overview';if(/^mobility/.test(nodes[0]?.textContent?.toLowerCase()||''))return 'mobility';for(let [key,cls] of [['market','market'],['demographics','demographics'],['climate','climate']])if(nodes.some(n=>n.matches?.('.v2-sheet-card--'+cls)||n.querySelector?.('.v2-sheet-card--'+cls)))return key;if(/market/.test(nodes[0]?.textContent?.toLowerCase()||''))return 'market';if(/census|demograph|population|household/.test(nodes[0]?.textContent?.toLowerCase()||''))return 'demographics';if(/climate|coastal|terrain/.test(nodes[0]?.textContent?.toLowerCase()||''))return 'climate';if(/property|relationships|immediate context/.test(nodes[0]?.textContent?.toLowerCase()||''))return 'overview';return 'analysis'}
function organiseReportTabs(article){let doc=root.document,nav=article.querySelector('[data-ug-report-tabs]');if(!nav&&article.querySelector(':scope > [role="tablist"]'))return;let candidates=Array.from(article.children).filter(n=>!n.matches('header,.v2-sheet-summary,.v2-sheet-address,.v2-sheet-footer,[data-ug-report-tabs],[data-ug-report-panel]'));if(!candidates.length)return;if(!nav){nav=doc.createElement('nav');nav.dataset.ugReportTabs='';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Report sections');article.insertBefore(nav,candidates[0]);article._ugTabsId='ug-report-'+(++reportTabCounter)}let chunks=[],chunk=[];for(let n of candidates){if((n.matches('.v2-sheet-section-title,[data-ugmp-card]'))&&chunk.length){chunks.push(chunk);chunk=[]}chunk.push(n);if(n.matches('[data-ugmp-card]')){chunks.push(chunk);chunk=[]}}if(chunk.length)chunks.push(chunk);for(let nodes of chunks){let key=tabCategory(nodes),panel=article.querySelector('[data-ug-report-panel="'+key+'"]');if(!panel){panel=doc.createElement('section');panel.dataset.ugReportPanel=key;panel.id=article._ugTabsId+'-'+key;panel.setAttribute('role','tabpanel');article.insertBefore(panel,article.querySelector('.v2-sheet-footer'));}nodes.forEach(n=>panel.appendChild(n))}let order=[['overview','Overview'],['analysis','Analysis'],['demographics','Demographics'],['mobility','Mobility'],['climate','Climate'],['market','Market']].filter(([key])=>article.querySelector('[data-ug-report-panel="'+key+'"]'));if(!order.some(([key])=>key===reportTab))reportTab=order[0][0];nav.innerHTML=order.map(([key,label])=>'<button type="button" role="tab" id="'+article._ugTabsId+'-tab-'+key+'" aria-controls="'+article._ugTabsId+'-'+key+'" data-report-tab="'+key+'">'+label+'</button>').join('');const select=key=>{reportTab=key;nav.querySelectorAll('[role="tab"]').forEach(b=>{let on=b.dataset.reportTab===key;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});article.querySelectorAll('[data-ug-report-panel]').forEach(p=>{p.setAttribute('aria-labelledby',article._ugTabsId+'-tab-'+p.dataset.ugReportPanel);p.dataset.active=String(p.dataset.ugReportPanel===key)})};select(reportTab);nav.onclick=e=>{let b=e.target.closest('[data-report-tab]');if(b){select(b.dataset.reportTab);root.UGA_V2_MOBILITY_PROFILES?.refresh?.()}};nav.onkeydown=e=>{let buttons=Array.from(nav.querySelectorAll('[role="tab"]')),i=buttons.indexOf(e.target),j=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowRight'?(i+1)%buttons.length:e.key==='ArrowLeft'?(i+buttons.length-1)%buttons.length:null;if(j!==null){e.preventDefault();select(buttons[j].dataset.reportTab);buttons[j].focus()}}}
function installProfileDesign(){if(!local()||!root.document||reportTabsStarted)return;reportTabsStarted=true;let doc=root.document,style=doc.createElement('style');style.textContent='[data-ugmp-card].ugmp-card{padding:12px;margin:12px 0}.ugmp-graphic{margin:10px 0;padding:10px;border:1px solid #dce5df;border-radius:8px;background:#fff;break-inside:avoid;min-width:0}.ugmp-graphic svg{width:100%;height:auto;display:block;max-height:none}.ugmp-graphic svg text{font-size:11px;fill:#476157}.ugmp-graphic figcaption{display:grid;gap:3px;padding-top:6px;font-size:11px;line-height:1.4}.ugmp-graphic figcaption strong{font-size:13px;color:#254f43}.ugmp-graphic figcaption b{font-size:12px}.ugmp-graphic figcaption span{color:#60766a}.ugmp-graphic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(210px,100%),1fr));gap:8px;align-items:start}.ugmp-graphic-grid .ugmp-graphic{margin:0}.ugmp-mode-bars{display:grid;gap:5px}.ugmp-mode-row{display:grid;grid-template-columns:82px minmax(0,1fr) 30px;align-items:center;gap:6px;font-size:11px;line-height:1.2}.ugmp-mode-row>span{overflow-wrap:anywhere}.ugmp-mode-row>i{display:block;background:#e5ede8;border-radius:3px;height:9px;overflow:hidden}.ugmp-mode-row>i>i{display:block;height:100%;background:#276f62}.ugmp-mode-row>b{font-size:11px;text-align:right}.ugmp-bar-scale{display:flex;justify-content:space-between;margin:0 36px 6px 88px;font-size:10px;color:#60766a}.ugmp-strength{grid-column:1/-1;display:grid;grid-template-columns:68px minmax(0,1fr);column-gap:12px;align-items:start}.ugmp-strength-value{grid-column:1;grid-row:1;font-size:32px;line-height:1.1;font-weight:700;color:#276f62}.ugmp-strength-value small{font-size:14px;color:#68796f}.ugmp-strength figcaption{grid-column:2;grid-row:1/span 2;padding:0}.ugmp-strength figcaption strong{font-size:12px}.ugmp-family-track{grid-column:1;grid-row:2;display:flex;gap:3px;margin:7px 0 0}.ugmp-family-track i{height:7px;flex:1;background:#e5ede8;border-radius:2px}.ugmp-family-track .is-present{background:#276f62}.ugmp-card .ugmp-radial>svg{max-width:360px;margin:0 auto}.ugmp-card .ugmp-radial>svg text{font-size:15px}.ugmp-card .ugmp-gap>svg{max-width:420px;margin:0 auto}[data-ug-report-tabs]{display:flex;gap:4px;flex-wrap:nowrap;align-items:stretch;max-width:100%;min-width:0;overflow-x:auto;margin:12px 0;padding:6px 0;border-bottom:1px solid #b8bdc2;scrollbar-width:thin}[data-ug-report-tabs] button{box-sizing:border-box;flex:1 0 auto;min-width:0;white-space:nowrap;font:600 12px/1.3 system-ui;cursor:pointer;padding:8px 10px;border:1px solid #a5abb0;border-radius:5px;background:transparent;color:#434a51}[data-ug-report-tabs] button:hover{background:#e8eaec;border-color:#7c848b}[data-ug-report-tabs] button[aria-selected=true]{background:#d9dde0;border-color:#7c848b;color:#343b42}[data-ug-report-tabs] button:focus-visible{outline:2px solid #626970;outline-offset:2px}[data-ug-report-panel][data-active=false]{display:none}@media print{[data-ug-report-tabs]{display:none!important}[data-ug-report-panel]{display:block!important;content-visibility:visible!important}.ugmp-graphic{print-color-adjust:exact;-webkit-print-color-adjust:exact}.ugmp-graphic-grid{display:block}.ugmp-graphic svg{max-width:460px;margin:auto}}';doc.head.appendChild(style);let body=doc.getElementById('placeReportBody'),queued=false;const scan=()=>{queued=false;body?.querySelectorAll('.v2-report-sheet').forEach(organiseReportTabs)};if(body&&root.MutationObserver){new root.MutationObserver(()=>{if(!queued){queued=true;root.requestAnimationFrame(scan)}}).observe(body,{childList:true,subtree:true})}scan();root.addEventListener?.('beforeprint',scan);if(typeof root.print==='function'){let nativePrint=root.print.bind(root);root.print=async()=>{let timeout;try{await Promise.race([(async()=>{for(let i=0;i<4&&reportTasks.size;i++)await Promise.allSettled([...reportTasks])})(),new Promise(resolve=>{timeout=root.setTimeout(resolve,20000)})]);scan();nativePrint()}finally{root.clearTimeout(timeout)}}}}

const timeBase=new URL('rail-time/v0.1/job_a0c47849bd5253406fe5/',base),timeManifestPin='736519450f1f3b7d9f2548fd529815139d87251abf8b6336739e45659a15cfe8',timeBands=Array.from({length:12},(_,i)=>(i+1)*10),timeAllowances=[5,10,15];let timeManifestPromise,timeCataloguePromise,timeCityPromise;const timeBuckets=new Map();
async function timeManifest(){if(!timeManifestPromise)timeManifestPromise=serviceJSON(new URL('manifest.json',timeBase),timeManifestPin).then(m=>{if(m.version!=='MOBILITY_RAIL_TIME_READER_V0_1'||m.stations!==165||JSON.stringify(m.bands)!==JSON.stringify(timeBands)||JSON.stringify(m.allowances)!==JSON.stringify(timeAllowances)||m.grains.building.records!==342223||m.grains.hex.records!==374784)throw Error('Time manifest differs');return m}).catch(e=>{timeManifestPromise=null;throw e});return timeManifestPromise}
async function timeCatalogue(){if(!timeCataloguePromise)timeCataloguePromise=(async()=>{let m=await timeManifest(),c=await serviceJSON(new URL('catalogue.json',timeBase),m.catalogue.sha256);if(c.stations.length!==165||c.stations.filter(s=>s.namespace==='MTR_MAIN').length!==97||c.stations.filter(s=>s.namespace==='MTR_LIGHT_RAIL').length!==68)throw Error('Time station frame differs');return c})().catch(e=>{timeCataloguePromise=null;throw e});return timeCataloguePromise}
function timeCheck(p,c){if(!p||typeof p.assessed!=='boolean'||!['building_initial','building_nearest','hex'].includes(p.basis)||!Array.isArray(p.options)||p.options.length!==2||p.options.some((n,f)=>!Number.isInteger(n)||n<0||n>[97,68][f]))throw Error('Time origin differs');let available=p.options.some(n=>n>0);if(!p.assessed&&available)throw Error('Unassessed time origin acquired support');if(!available){if(p.minutes!==null||p.winners!==null||p.counts!==null)throw Error('Unavailable time coerced to values');return}if(!Array.isArray(p.minutes)||p.minutes.length!==165||!Array.isArray(p.winners)||p.winners.length!==165||!Array.isArray(p.gaps)||p.gaps.some(i=>!Number.isInteger(i)||i<0||i>=165)||!Array.isArray(p.counts)||p.counts.length!==3)throw Error('Time vectors differ');for(let i=0;i<165;i++){let t=p.minutes[i],s=p.winners[i];if(t===null){if(s!==null)throw Error('Missing time witness differs')}else if(!Number.isFinite(t)||t<0||!Number.isInteger(s)||s<0||s>=165||c.stations[s].namespace!==c.stations[i].namespace||s===i)throw Error('Time witness differs')}for(let a=0;a<3;a++){if(!Array.isArray(p.counts[a])||p.counts[a].length!==12)throw Error('Time count bands differ');for(let b=0;b<12;b++){let row=p.counts[a][b];if(!Array.isArray(row)||row.length!==2)throw Error('Time family counts differ');for(let f=0;f<2;f++){let n=p.options[f]===0?null:p.minutes.filter((t,i)=>t!==null&&c.stations[i].namespace===['MTR_MAIN','MTR_LIGHT_RAIL'][f]&&t+timeAllowances[a]<=timeBands[b]+1e-9).length;if(row[f]!==n)throw Error('Time counts differ from arrival values')}}}}
async function timeProfile(grain,id){if(!['building','hex'].includes(grain))throw Error('Native Lot timing remains unavailable');id=String(id);let m=await timeManifest(),digest=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)),b=[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,2),key=grain+'/'+b;if(!timeBuckets.has(key)){timeBuckets.set(key,serviceJSON(new URL(key+'.json',timeBase),m.grains[grain].shards[b].sha256).catch(e=>{timeBuckets.delete(key);throw e}));while(timeBuckets.size>6)timeBuckets.delete(timeBuckets.keys().next().value)}let d=await timeBuckets.get(key),p=d.records?.[id];if(d.version!==m.version||d.grain!==grain||!p||(grain==='hex')!==(p.basis==='hex'))throw Error('Time profile frame differs');timeCheck(p,await timeCatalogue());return p}
async function timeCity(){if(!timeCityPromise)timeCityPromise=(async()=>{let m=await timeManifest(),d=await serviceJSON(new URL('citywide.json',timeBase),m.citywide.sha256);if(d.version!==m.version||Object.keys(d.records).length!==84877||d.denominators.length!==3||d.histograms.length!==3)throw Error('Citywide time coverage differs');return d})().catch(e=>{timeCityPromise=null;throw e});return timeCityPromise}
function timeHTML(p,c,b=2,group=2){let note=p.basis==='building_nearest'?' The building-to-network approach gap is excluded.':'';if(!p.options.some(n=>n>0))return '<h4 style="margin:0 0 6px">Mobility · walking + rail time</h4><p class="ugmp-note">'+(p.assessed?'No retained rail starting option within the 2 km network search.':'No retained walking-network start.')+' A time estimate is unavailable; this does not establish no rail access.'+note+'</p>';let cols=['#276f62','#527fa1'],names=['Main rail','Light Rail'],max=100,x=i=>38+i*34,y=n=>132-n*1.05,points=(a,f)=>timeBands.map((_,i)=>x(i)+','+y(p.counts[a][i][f])).join(' '),s='<h4 style="margin:0 0 5px">Mobility · walking + rail time</h4><p class="ugmp-note" style="margin:4px 0">Other station/stop endpoints potentially reached within total time</p><svg viewBox="0 0 450 170" style="width:100%;max-height:175px;display:block" role="img" aria-label="Station endpoints reached by total walking and rail time">';[0,25,50,75,100].forEach(n=>s+='<path d="M35 '+y(n)+'H420" stroke="#e0e5e4"/><text x="30" y="'+(y(n)+4)+'" text-anchor="end" style="font-size:10px;fill:#68746e">'+n+'</text>');for(let f=0;f<2;f++)if(p.options[f]){let polygon=points(0,f)+' '+timeBands.map((_,j)=>{let i=11-j;return x(i)+','+y(p.counts[2][i][f])}).join(' ');s+='<polygon points="'+polygon+'" fill="'+cols[f]+'" opacity=".16"/><polyline points="'+points(0,f)+'" fill="none" stroke="'+cols[f]+'" stroke-width="2.2"/>'}timeBands.forEach((n,i)=>{s+='<text x="'+x(i)+'" y="151" text-anchor="middle" style="font-size:10px;fill:#68746e">'+n+'</text><rect data-time-pick="'+i+'" x="'+(x(i)-16)+'" y="20" width="32" height="116" fill="'+(i===b?'#68746e':'transparent')+'" opacity=".07" style="cursor:pointer"><title>Explore '+n+' minutes</title></rect>'});s+='</svg><div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">'+names.map((name,f)=>'<span style="color:'+cols[f]+'"><strong>'+name+'</strong> · '+(p.counts[0][b][f]===null?'— no estimate':p.counts[0][b][f]+' by '+timeBands[b]+' min')+'</span>').join('')+'</div><p class="ugmp-note" style="margin:6px 0">Nominal walking: 80 m/min; platform access: 5 min. Shading shows the 5–15 min platform-access range. Walking approach is searched up to 2 km.'+note+'</p><div style="display:flex;gap:5px;flex-wrap:wrap"><button type="button" data-time-show'+(group<2&&!p.options[group]?' disabled':'')+'>Show '+timeBands[b]+' min '+(['main-rail','Light Rail','station'][group])+' arrivals on map</button><button type="button" data-time-fit>Fit station arrivals</button><button type="button" data-time-clear>Clear station markers</button></div><p class="ugmp-note" data-time-status></p><details><summary>Destinations and assumptions</summary><p class="ugmp-note">Operator estimates follow published weekday-morning assumptions and may include waiting and interchange time. Station arrival excludes the final platform-to-street exit and onward walk. Main rail and Light Rail are calculated separately; transfers between those networks are not modelled. Different retained starts can support different destinations. Physical entry, operating conditions and step-free passage remain unverified. '+(p.gaps.length?'Some station-pair estimates remain missing.':'')+'</p>'+p.minutes.map((t,i)=>({t:t===null?Infinity:t+5,i})).filter(v=>Number.isFinite(v.t)).sort((a,b)=>a.t-b.t||a.i-b.i).slice(0,12).map(v=>'<div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;margin:4px 0"><span>'+esc(c.stations[v.i].name)+' <small>via '+esc(c.stations[p.winners[v.i]].name)+'</small></span><b>~'+v.t.toFixed(1)+' min</b></div>').join('')+'</details>';return s}
const timePointSource='ug-mobility-rail-time-stations-v01',timePointLayer=timePointSource+'-points',timePointColours=['#25866b','#269b95','#318db5','#3d78b1','#5465a5','#6d519b','#85458f','#983c7e','#a94070','#b44d65','#c26260','#ce795f'];let timePlot=null,timePlotTicket=0,timePlotMap=null,timePointOpacity=1;
function timeDraw(){let m=root.UGA_V2_MAP;if(!m||!timePlot||!m.isStyleLoaded())return;if(!m.getSource(timePointSource))m.addSource(timePointSource,{type:'geojson',data:timePlot});else m.getSource(timePointSource).setData(timePlot);if(!m.getLayer(timePointLayer))m.addLayer({id:timePointLayer,type:'circle',source:timePointSource,paint:{'circle-radius':['interpolate',['linear'],['zoom'],6,1.5,12,3,17,6],'circle-color':['step',['get','minutes'],timePointColours[0],...timeBands.slice(0,-1).flatMap((n,i)=>[n+1e-7,timePointColours[i+1]])],'circle-opacity':.9*timePointOpacity,'circle-stroke-color':'#fff','circle-stroke-width':1}});else m.setPaintProperty(timePointLayer,'circle-opacity',.9*timePointOpacity);if(timePlotMap!==m){timePlotMap=m;m.on('style.load',()=>{if(timePlot)timeDraw()})}}
function timeClear(){timePlotTicket++;timePlot=null;let m=root.UGA_V2_MAP;if(m?.getLayer(timePointLayer))m.removeLayer(timePointLayer);if(m?.getSource(timePointSource))m.removeSource(timePointSource)}
function timeOpacity(v){timePointOpacity=Math.max(0,Math.min(1,Number(v)/100));let m=root.UGA_V2_MAP;if(m?.getLayer(timePointLayer))m.setPaintProperty(timePointLayer,'circle-opacity',.9*timePointOpacity)}
async function showTimeDestinations(grain,id,b,active=()=>true,group=2){onwardClear();let current=timePlotTicket,[p,c]=await Promise.all([timeProfile(grain,id),timeCatalogue()]);if(current!==timePlotTicket||!active())return null;if(group<2&&!p.options[group])throw Error('No temporal estimate for this source family within the walking-search scope');let features=[];if(p.minutes)for(let i=0;i<165;i++){let t=p.minutes[i],point=c.stations[i].point;if(t!==null&&t+5<=timeBands[b]+1e-9&&point&&(group===2||c.stations[i].namespace===['MTR_MAIN','MTR_LIGHT_RAIL'][group]))features.push({type:'Feature',geometry:{type:'Point',coordinates:point},properties:{station:c.stations[i].name,code:c.stations[i].code,minutes:t+5}})}if(!root.UGA_V2_MAP)throw Error('Main map is not ready');timePlot={type:'FeatureCollection',features};timeDraw();return features.length}
function renderTime(host,p,c,grain,id,active=()=>true,b=2,group=2,onPick=null){const draw=()=>{host.innerHTML=timeHTML(p,c,b,group);NETWORK.mount(host,grain,id,active,p.basis)};draw();host.onclick=async e=>{let pick=e.target.closest?.('[data-time-pick]');if(pick){timeClear();let next=Number(pick.dataset.timePick);if(onPick){onPick(next);return}b=next;draw();return}if(e.target.closest?.('[data-time-clear]')){timeClear();return}if(e.target.closest?.('[data-time-fit]')){timeFit();return}if(!e.target.closest?.('[data-time-show]'))return;let status=host.querySelector('[data-time-status]');try{let n=await showTimeDestinations(grain,id,b,active,group);if(active()&&n!==null)status.textContent=n+' operator-map station references shown on the main map. Marker colours follow 10-minute arrival bands; these are endpoints, not a continuous catchment.'}catch(e){if(active())status.textContent='Station map unavailable: '+e.message}}}
async function timeReading(host,grain,id,active,expectedBasis){let block=root.document.createElement('section');block.className='ugmp-graphic';block.style.marginTop='12px';host.appendChild(block);block.innerHTML='<p class="ugmp-note">Loading walking + rail time potential…</p>';try{let [p,c]=await Promise.all([timeProfile(grain,id),timeCatalogue()]);if(!active())return;if(p.basis!==expectedBasis)throw Error('Time starting-position basis differs');renderTime(block,p,c,grain,id,active)}catch(e){if(active())block.innerHTML='<h4>Mobility · walking + rail time</h4><p class="ugmp-note">Unavailable: '+esc(e.message)+'</p>'}}

async function railReading(host,grain,id,active,expectedBasis){await railReferenceReading(host,grain,id,active,expectedBasis);if(active()&&S.profile==='walking')await timeReading(host,grain,id,active,expectedBasis)}

function timeFit(){let m=root.UGA_V2_MAP;if(!m||!timePlot?.features.length)return;let xx=timePlot.features.map(f=>f.geometry.coordinates[0]),yy=timePlot.features.map(f=>f.geometry.coordinates[1]);m.fitBounds([[Math.min(...xx),Math.min(...yy)],[Math.max(...xx),Math.max(...yy)]],{padding:{top:90,left:70,bottom:70,right:Math.min(500,Math.round((root.innerWidth||1200)*.36))},maxZoom:14,duration:600})}

/* Native network reach: shared report controls and main Mobility module. */
const browserSignatureReadings=new WeakSet();
const NETWORK=(()=>{
const endpoint=base.href,source='ug-native-network-reach',layer=source+'-lines',colours=['#156a50','#279789','#469ec9','#6563ad','#a34a91','#cf643b'];
const roadSource='ug-road-network',roadLayer=roadSource+'-lines';
const facilitySource='ug-road-facilities',facilityLayer=facilitySource+'-points';
let facilitiesVisible=false, facilityMode=null, facilityTicket=0;
const facilityCache=new Map();
const roadMode=mode=>mode==='car'||mode==='taxi';
const workerBase=new URL("mobility-bundles/afb6007f0e7bb097b7a29ed775eb4303e9da4ab7e1fa37059fc88f894cb9ba2a-xy1/",ui);
const useBrowserRoad=true,useBrowserWalkRail=true,useBrowserWalkDestinations=true,useBrowserWalkSignature=true;
const browserRequest=message=>import(new URL('road-client.mjs',workerBase)).then(client=>client.roadRequest(message));
const walkRailRequest=(message,signal)=>import(new URL('walk-rail-client.mjs',workerBase))
 .then(client=>client.walkRailRequest(message,signal));
const walkUrls=new Set();
let walkNative=null,walkDestinationError='',waitingForWalkStyle=false;
function disposeWalkUrls() {
 for (const url of walkUrls) {
  if (shownGeometry?.data_url===url||viewportCache.some(item=>item.g.data_url===url)) continue;
  root.URL.revokeObjectURL(url);
  walkUrls.delete(url);
 }
}
const roadProfiles=new Map(),roadRequests=new Set(),roadErrors=new Map();
const roadKey=()=>job+':'+modes;
let opening=false,calculation=null,target=null,minutes=30,modes='all',job=null,profile=null,enabled=false,ticket=0,viewTicket=0,map=null,opacity=1,timer=null,controller=null,hooked=false,panel=null,lastMessage='Select a Building or Hex.';
const native=f=>f&&['building','hex'].includes(f.type)?{grain:f.type,id:String(f.id)}:null;
const key=t=>t?t.grain+':'+t.id:'';
let pendingShow=null;
let displayWait=null;
const samples=root.UG_PATH_TIMINGS=[];
function sample(phase,start){samples.push({phase,mode:modes,minutes,id:target?.id,ms:Math.round(performance.now()-start)});if(samples.length>100)samples.shift()}
function cancelDisplay(){if(displayWait){displayWait();displayWait=null}}
function submitted(m,id,start){
 cancelDisplay(); sample('prepare_geometry_and_submit',start);
 const submittedAt=performance.now();
 const finish=()=>{if(!visible()||!m.getSource(id)){cancelDisplay();pathNotice('');return}if(!m.isSourceLoaded(id))return;
  cancelDisplay();sample('submit_to_loaded_render',submittedAt);pathNotice('')};
 const fail=e=>{if(e.sourceId===id){cancelDisplay();pathNotice('')}};
 displayWait=()=>{m.off('render',finish);m.off('error',fail)};
 m.on('render',finish);m.on('error',fail);pathNotice('Drawing journey paths…');m.triggerRepaint();
}

function pathNotice(text){
 const n=root.document?.getElementById('ug-path-progress');
 if(!n)return;
 if(n.textContent!==text)n.textContent=text;
 n.hidden=!text;
}
let pathVisible=false,drawing=false,redraw=false,viewportCache=[],shownGeometry=null,shownModes=null;
function say(s){lastMessage=s;renderDestinationCoverage();renderNamed();root.document?.querySelectorAll('[data-unet-status]').forEach(n=>{n.textContent=s});renderBuildingCoverage()}
function removeRoadNetwork(){if(map?.getLayer(roadLayer))map.removeLayer(roadLayer);if(map?.getSource(roadSource))map.removeSource(roadSource)}
function remove(){if(map?.getLayer(layer))map.removeLayer(layer);if(map?.getSource(source))map.removeSource(source);removeRoadNetwork();shownGeometry=null;shownModes=null}
function clear(){cancelDisplay();pathNotice('');pendingShow=null;walkNative=null;walkDestinationError='';waitingForWalkStyle=false;clearNamed();roadProfiles.clear();roadRequests.clear();roadErrors.clear();viewportCache=[];redraw=false;calculation=null;pathVisible=false;ticket++;viewTicket++;enabled=false;job=null;profile=null;controller?.abort();root.clearTimeout(timer);remove();disposeWalkUrls();say('Select a place or calculate reach.');sync()}
function detach(){if(map){map.off?.('moveend',move);map.off?.('style.load',style);map.off?.('idle',resumeWalkDraw);map.off?.('sourcedata',pathsReady);map.off?.('error',pathsError);map=null}}
function setTarget(t){if(key(t)!==key(target)){clear();target=t}sync()}
function sync() {
 const doc=root.document;
 doc?.querySelectorAll('[data-unet-path-visible]').forEach(node=>{node.checked=pathVisible});
 doc?.querySelectorAll('[data-unet-path-label]').forEach(node=>{
  node.textContent=roadMode(modes)?'Show reached roads':'Show reached paths';
 });
 doc?.querySelectorAll('[data-unet-show]').forEach(node=>{
  node.textContent=roadMode(modes)?'Show roads on atlas':'Show paths on atlas';
 });
 const facility=doc?.querySelector('[data-unet-facilities]');
 if (facility) {
  facility.checked=facilitiesVisible;
  facility.closest('label').hidden=!roadMode(modes);
  facility.closest('label').querySelector('span').textContent=modes==='car'?'Show car park entrances and exits':'Show taxi stands and stopping points';
 }
 doc?.querySelectorAll('[data-unet-walk-note]').forEach(node=>{node.hidden=roadMode(modes)});
 setOpacity(opacity*100);
 doc?.querySelectorAll('[data-unet-context]').forEach(node=>{
  node.textContent=target?(target.grain==='building'?'Building ':'Hex ')+target.id:'Select a Building or Hex.';
 });
 doc?.querySelectorAll('[data-unet-minutes]').forEach(node=>{node.value=String(minutes)});
 doc?.querySelectorAll('[data-unet-time]').forEach(node=>{
  node.setAttribute('aria-pressed',String(Number(node.dataset.unetTime)===minutes));
 });
 doc?.querySelectorAll('[data-unet-time-caption]').forEach(node=>{node.textContent=minutes+' min'});
 doc?.querySelectorAll('[data-unet-modes]').forEach(node=>{node.value=modes});
 const reportPlace=native(focus(root.UGA_V2_SELECTION?.snapshot?.()));
 doc?.querySelectorAll('[data-unet-report]').forEach(node=>{
  node.hidden=!target||key(reportPlace)!==key(target);
 });
 renderBuildingCoverage();
 renderDestinationCoverage();
 renderNamed();
}
async function request(path,options={}) {
 if (profile?.browserWalkRail) {
  const url=new URL(path,endpoint),q=url.searchParams;
  if (q.get('job')===job) {
   const place={grain:profile.grain,id:profile.id,basis:profile.basis};
   if (url.pathname==='/v1/network') return walkRailRequest({type:'network',place,
    minutes:Number(q.get('minutes')),mode:q.get('modes')},options.signal);
   if (url.pathname==='/v1/destinations') {
    if (useBrowserWalkDestinations) return walkRailRequest({type:'destinations',place,
     minutes:Number(q.get('minutes')),mode:q.get('modes'),view:q.get('view'),group:q.get('group')},options.signal);
    const selected=profile;
    for (let attempt=0;attempt<2;attempt++) {
     const pending=loadWalkDestinations(),native=await pending;
     if (!native||profile!==selected) throw Error(walkDestinationError||'Native destination selection expired.');
     q.set('job',native.job);
     try {return await fetchNetworkService(url.pathname+url.search,options)}
     catch (error) {
      if (attempt||profile!==selected||!error.message.includes('Job expired')) throw error;
      if (walkNative===pending) walkNative=null;
     }
    }
   }
  }
 }
 if (useBrowserRoad) {
  const url=new URL(path,endpoint);
  const q=url.searchParams;
  const mode=q.get('modes');
  if (roadMode(mode)) {
   if (url.pathname==='/v1/road/facilities') return browserRequest({type:'facilities',mode});
   const type={'/v1/road/profile':'profile','/v1/road/network':'network',
    '/v1/destinations':'destinations','/v1/signature':'signature'}[url.pathname];
   if (type) {
    if (q.get('job')!==job||!profile?.browserRoad) throw Error('Browser road selection expired');
    const place={grain:profile.grain,id:profile.id,basis:profile.basis};
    return browserRequest({type,place,mode,params:{minutes:Number(q.get('minutes')),view:q.get('view'),group:q.get('group')}});
   }
  }
 }
 return fetchNetworkService(path,options);
}
async function fetchNetworkService(path) {
 throw Error('No bundled worker operation for '+path.split('?')[0]);
}
function attach(){let m=root.UGA_V2_MAP;if(!m)throw Error('Atlas map is not ready');if(m!==map){detach();map=m;map.on('moveend',move);map.on('style.load',style);map.on('idle',resumeWalkDraw);map.on('sourcedata',pathsReady);map.on('error',pathsError)}return m}
function move(){}
function resumeWalkDraw() {
 if (waitingForNamedStyle&&map?.isStyleLoaded?.()) drawNamed();
 if (waitingForWalkStyle&&map?.isStyleLoaded?.()&&enabled&&visible()) draw();
}
function walkStyleReady(m) {
 if (m.isStyleLoaded?.()||m.getLayer(layer)) {
  waitingForWalkStyle=false;
  return true;
 }
 waitingForWalkStyle=true;
 say('Waiting for the map to finish loading.');
 return false;
}
function style(){drawNamed();drawFacilities();if(enabled){root.clearTimeout(timer);timer=root.setTimeout(()=>draw(),100)}}
function visible(){let m=root.document?.querySelector('#ugMobilityCitywideSection [data-visible]');return pathVisible&&(!m||m.checked)}
async function loadRoadProfile() {
 if (!job||!profile||!roadMode(modes)) return;
 const stamp=roadKey(),originJob=job,mode=modes;
 if (roadProfiles.has(stamp)||roadRequests.has(stamp)||roadErrors.has(stamp)) return;
 roadRequests.add(stamp);
 try {
  const data=await request('/v1/road/profile?'+new URLSearchParams({job:originJob,modes:mode}));
  if (job!==originJob) return;
  if (data.contract!=='MOBILITY_ROAD_NETWORK_V0_2'||data.grain!==profile.grain||
      data.id!==profile.id||data.basis!==profile.basis||data.modes!==mode)
   throw Error('Road reach response identity differs.');
  roadProfiles.set(stamp,data);
 } catch (error) {
  if (job===originJob) roadErrors.set(stamp,error.message);
 } finally {
  roadRequests.delete(stamp);
  if (job===originJob&&modes===mode) sync();
 }
}
function legend(){return '<div class="unet-bands">'+colours.map((c,i)=>'<span><i style="background:'+c+'"></i>'+((i+1)*10)+' min</span>').join('')+'</div>'}
const namedSource='ug-native-destination-records',namedLayer=namedSource+'-points';
let namedConfig={view:'lonlat',group:'',subtype:'',query:'',show:true,page:0,located:''};
let waitingForNamedStyle=false,namedData=null,namedStamp='',namedPending='',namedTicket=0,namedCache=new Map(),namedError='';
const publishedVenueGroups=new Set(['FEHD_RESTAURANT','LCSD_SPORT','LCSD_CULTURE']);

function namedKey() {
 return job&&profile&&namedConfig.group?JSON.stringify([job,minutes,modes,namedConfig.view,namedConfig.group]):'';
}

function subtypeCoverage(group, subtype) {
 if (!subtype||group==='FEHD_RESTAURANT') return null;
 return profile?.destination_reach?.scope?.lcsd_sport_culture_by_source?.[subtype]??null;
}

function namedRows() {
 const query=namedConfig.query.trim().toLocaleLowerCase();
 return (namedData?.rows||[]).filter(row=>{
  const subtype=namedConfig.subtype;
  if (subtype&&row.category!==subtype&&!row.source_records?.some(source=>source.dataset===subtype)) return false;
  return !query||[row.name,row.name_zh,row.category,row.native_id,row.record_key,row.point?.source_address??row.address,row.address_zh]
   .join(' ').toLocaleLowerCase().includes(query);
 });
}

function dropNamedMap() {
 for (const layerId of [namedLayer,namedLayer+'-cluster-label',namedLayer+'-clusters']) {
  if (map?.getLayer(layerId)) map.removeLayer(layerId);
 }
 if (map?.getSource(namedSource)) map.removeSource(namedSource);
}

function clearNamed() {
 waitingForNamedStyle=false;
 namedTicket++;
 namedPending='';
 namedData=null;
 namedStamp='';
 namedError='';
 namedCache.clear();
 namedConfig.page=0;
 namedConfig.located='';
 dropNamedMap();
}

function drawNamed() {
 const master=root.document?.querySelector('#ugMobilityCitywideSection [data-visible]');
 if (!map) return;
 const show=namedConfig.show&&namedData&&namedStamp===namedKey()&&namedData.state==='READY'&&(!master||master.checked);
 if (!map.isStyleLoaded?.()) {
  if (useBrowserWalkDestinations&&profile?.browserWalkRail) waitingForNamedStyle=true;
  return;
 }
 waitingForNamedStyle=false;
 if (!show) {
  dropNamedMap();
  return;
 }
 const clustered=namedData.group==='FEHD_RESTAURANT';
 const stamp=JSON.stringify([namedStamp,namedConfig.subtype,namedConfig.query]);
 let source=map.getSource(namedSource);
 if (source&&map._ugNamedClustered!==clustered) {dropNamedMap();source=null}
 if (!source||map._ugNamedStamp!==stamp) {
  const keys=new Set(namedRows().map(row=>row.record_key));
  const data={type:'FeatureCollection',features:namedData.map.features.filter(feature=>keys.has(feature.properties.record_key))};
  if (source) source.setData(data);
  else map.addSource(namedSource,{type:'geojson',data,maxzoom:18,cluster:clustered,clusterRadius:32,clusterMaxZoom:14});
  map._ugNamedClustered=clustered;
  map._ugNamedStamp=stamp;
 }
 if (!map.getLayer(namedLayer)) map.addLayer({
  id:namedLayer,type:'circle',source:namedSource,filter:['!', ['has','point_count']],
  paint:{'circle-color':'#ffffff','circle-radius':['interpolate',['linear'],['zoom'],9,2,14,4,18,6],
   'circle-opacity':.9,'circle-stroke-color':'#30383d','circle-stroke-width':1.5},
 });
 if (map._ugNamedLocated!==namedConfig.located||!source) {
  map.setPaintProperty(namedLayer,'circle-color',
   ['case',['==',['get','record_key'],namedConfig.located],'#ed9d43','#ffffff']);
  map._ugNamedLocated=namedConfig.located;
 }
 if (clustered&&!map.getLayer(namedLayer+'-clusters')) {
  map.addLayer({id:namedLayer+'-clusters',type:'circle',source:namedSource,filter:['has','point_count'],
   paint:{'circle-color':'#f3f7f6','circle-radius':['step',['get','point_count'],10,30,13,150,17],
    'circle-stroke-color':'#30383d','circle-stroke-width':1.5}});
  map.addLayer({id:namedLayer+'-cluster-label',type:'symbol',source:namedSource,filter:['has','point_count'],
   layout:{'text-field':['get','point_count_abbreviated'],'text-size':10,'text-allow-overlap':true},
   paint:{'text-color':'#30383d'}});
 }
}

function legendCategoryOptions(groups) {
 const byKey=new Map(groups.filter(group=>!group.detail).map(group=>[group.key,group]));
 const sections=destinationFamilies.map(([label,...keys])=>[label,keys.map(key=>byKey.get(key)).filter(Boolean)]);
 const used=new Set(sections.flatMap(([,entries])=>entries.map(g=>g.key)));
 const option=group=>'<option value="'+esc(group.key)+'">'+esc(group.label)+'</option>';
 return '<option value="">Choose a category</option>'+sections.map(([label,entries])=>{
  if (!entries.length) return '';
  const details=label==='Education'?groups.filter(g=>g.detail&&g.source==='EDB'):[];
  if (entries.length===1&&!details.length) return option(entries[0]);
  return '<optgroup label="'+esc(label)+'">'+[...entries,...details].map(option).join('')+'</optgroup>';
 }).join('')+groups.filter(g=>!g.detail&&!used.has(g.key)).map(option).join('');
}

async function loadLegendSelection() {
 if (!target) return;
 const place=target;
 try {
  await preparePathMap();
  if (key(target)!==key(place)) return;
  if (await calculateReach(place,null)) {
   if (profile?.browserWalkRail&&!await loadWalkDestinations()) return;
   await loadNamed();
  }
 } catch (error) {
  if (key(target)===key(place)) say(error.message);
 }
}

function namedShell(host,coverage) {
 host.innerHTML='<div class="unet-controls"><label>Category<select data-named-group>'+
  legendCategoryOptions(coverage.groups)+'</select></label>'+
  '<label data-named-subtype-label hidden>Venue type<select data-named-subtype></select></label></div>'+
  '<label class="unet-destination-search">Name or address<input data-named-search type="search"></label>'+
  '<label class="unet-destination-visibility"><input type="checkbox" data-named-visible> Show destination points</label>'+
  '<p data-named-status role="status"></p><div data-named-list></div>'+
  '<details data-named-coordinate-options><summary>Coordinate sources</summary>'+
  '<label>Recorded coordinates<select data-named-view></select></label></details>';
 host.onchange=event=>{
  const field=event.target;
  if (field.hasAttribute('data-named-visible')) {
   namedConfig.show=field.checked;
   renderNamed();
   if (namedConfig.show) loadLegendSelection();
   return;
  }
  if (field.hasAttribute('data-named-group')) {
   namedConfig.group=field.value;
   namedConfig.subtype='';
   namedConfig.query='';
   namedConfig.view='lonlat';
  } else if (field.hasAttribute('data-named-view')) {
   namedConfig.view=field.value;
  } else if (field.hasAttribute('data-named-subtype')) {
   namedConfig.subtype=field.value;
   namedConfig.page=0;
   namedConfig.located='';
   renderNamed();
   return;
  } else return;
  namedConfig.page=0;
  namedConfig.located='';
  namedTicket++;
  namedPending='';
  namedError='';
  renderNamed();
  if (namedConfig.group) loadLegendSelection();
 };
 host.oninput=event=>{
  if (!event.target.hasAttribute('data-named-search')) return;
  namedConfig.query=event.target.value;
  namedConfig.page=0;
  namedConfig.located='';
  renderNamed();
 };
 host.onclick=async event=>{
  const page=event.target.closest('[data-named-page]');
  if (page) {
   namedConfig.page+=Number(page.getAttribute('data-named-page'));
   renderNamed();
   return;
  }
  if (event.target.closest('[data-named-retry]')) {loadLegendSelection();return}
  const locate=event.target.closest('[data-named-point]');
  const row=locate&&namedData?.rows.find(row=>row.record_key===locate.getAttribute('data-named-point'));
  if (!row) return;
  const stamp=namedStamp;
  try {
   await preparePathMap();
   if (stamp!==namedStamp||stamp!==namedKey()) return;
   namedConfig.located=row.record_key;
   namedConfig.show=true;
   map.flyTo({center:row.point.coordinates,zoom:Math.max(map.getZoom(),16),duration:500});
   renderNamed();
  } catch (error) {say(error.message)}

 };
}

function namedFields(host) {
 const group=namedConfig.group;
 host.querySelector('[data-named-group]').value=group;
 const types=destinationTypeOptions[group];
 const subtype=host.querySelector('[data-named-subtype]');
 subtype.closest('label').hidden=!types;
 if (subtype._group!==group) {
  subtype._group=group;
  subtype.innerHTML=types?'<option value="">All types</option>'+types.map(([key,label])=>{
   const support=subtypeCoverage(group,key);
   return '<option value="'+esc(key)+'">'+esc(label+(support?.initial_supported===0?' · unassessed':''))+'</option>';
  }).join(''):'';
 }
 subtype.value=namedConfig.subtype;
 const coordinates=host.querySelector('[data-named-coordinate-options]');
 const view=host.querySelector('[data-named-view]');
 const school=group==='EDB'||group.startsWith('EDB:');
 coordinates.hidden=roadMode(modes)||group!=='FEHD_MARKET'&&!school;
 if (view._group!==group) {
  view._group=group;
  view.innerHTML=group==='FEHD_MARKET'?'<option value="lonlat">FEHD register</option><option value="csdi_market">Older CSDI points</option>':
   '<option value="lonlat">Published longitude / latitude</option><option value="native_grid">School native grid</option>';
 }
 view.value=namedConfig.view;
 const search=host.querySelector('[data-named-search]');
 if (search.value!==namedConfig.query) search.value=namedConfig.query;
 search.disabled=!group;
 host.querySelector('[data-named-visible]').checked=namedConfig.show;
}

function destinationEvidence(row) {
 if (row.road) {
  const leg=row.road,minute=s=>Math.ceil(s/60)+' min';
  return '<p>'+minute(leg.walk_start_seconds)+' walk to '+esc(leg.origin_interface)+'</p>'+
   (leg.wait_seconds?'<p>'+minute(leg.wait_seconds)+' taxi wait allowance</p>':'')+
   '<p>'+minute(leg.road_seconds)+' on the road to '+esc(leg.arrival_interface)+'</p>'+
   '<p>'+minute(leg.walk_end_seconds)+' walk to '+esc(row.point.approach||row.name)+'</p>';
 }
 if (row.entrance) return '<p>'+esc(row.entrance.label)+'</p>';
 const place = [row.name_zh,row.point.source_address??row.address].filter(Boolean).map(esc).join('<br>');
 const witness = row.attachments.map(a=>esc(a.building_id+' · '+a.basis+
  (a.first_band===null?'': ' · '+a.first_band+' min band'))).join('<br>');
 return (place?'<p>'+place+'</p>':'')+'<p>'+esc(row.point.variant)+' · '+row.point.covering_footprints+
  ' covering footprints</p>'+(witness?'<p>'+witness+'</p>':'');
}

function namedList(rows,start,size,pages,group) {
 const entries=rows.slice(start,start+size).map(row=>
  '<li><div><button type="button" data-named-point="'+esc(row.record_key)+'" aria-label="Locate '+esc(row.name)+
  ' on the atlas">'+esc(row.name)+'</button><strong>'+(row.road?'≈'+Math.ceil(row.road.total_seconds/60):row.first_band)+' min</strong></div>'+
  '<p>'+esc(row.category)+(row.rail_added_at_selected_band?' · added by rail':'')+'</p>'+
  '<details><summary>Source evidence</summary>'+destinationEvidence(row)+'</details></li>'
 ).join('');
 const source=namedData.source_detail;
 const credit=source?'<p class="unet-coverage-note">'+esc(source.note)+' <a href="'+esc(source.url)+'">'+
  esc(source.source)+'</a> © HKSAR Government</p>':group.startsWith('RETAIL_')?
  '<p class="unet-coverage-note"><a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> · Geofabrik · Housing Authority · '+
  '<a href="https://data.gov.hk/en-data/dataset/hk-landsd-openmap-development-hkms-digital-geocom">iGeoCom</a> © HKSAR Government, Lands Department</p>':'';
 const parks=group==='LCSD_PARK_PILOT'?
  '<details><summary>Unassessed parks and gardens</summary><ul>'+
  namedData.unassessed_records.map(row=>'<li>'+esc(row.name)+' · '+esc(row.note)+'</li>').join('')+'</ul></details>':'';
 return (entries?'<ul class="unet-destination-list">'+entries+'</ul>':'')+
  (pages>1?'<div class="unet-list-pages"><span>'+formatReachCount(start+1)+'–'+formatReachCount(Math.min(rows.length,start+size))+
  ' of '+formatReachCount(rows.length)+'</span><button type="button" data-named-page="-1"'+(namedConfig.page===0?' disabled':'')+
  '>Previous</button><button type="button" data-named-page="1"'+(namedConfig.page===pages-1?' disabled':'')+'>Next</button></div>':'')+
  credit+parks;
}

function renderNamed() {
 const coverage=profile?.destination_reach;
 for (const host of root.document?.querySelectorAll('[data-unet-main] [data-unet-named-host]')||[]) {
  if (!coverage) {
   const stamp=key(target)+'|'+!!calculation+'|'+walkDestinationError;
   if (host._namedOwner!==stamp) {
    host._namedOwner=stamp;
    host.innerHTML=target?'<button type="button" data-named-start>Calculate destinations</button>':
     '<p class="unet-coverage-note">Select a Building or Hex.</p>';
    if (walkDestinationError) host.insertAdjacentHTML('beforeend',
     '<p class="unet-coverage-note">'+esc(walkDestinationError)+'</p>');
    host.querySelector('[data-named-start]')?.addEventListener('click',loadLegendSelection);
   }
   continue;
  }
  const group=namedConfig.group;
  if (group&&!coverage.groups.some(g=>g.key===group)) {
   namedConfig.group='';
   namedConfig.view='lonlat';
   namedConfig.subtype='';
  }
  const owner=profile.grain+':'+profile.id+':'+job;
  if (host._namedOwner!==owner) {namedShell(host,coverage);host._namedOwner=owner}
  namedFields(host);
  const status=host.querySelector('[data-named-status]');
  const list=host.querySelector('[data-named-list]');
  const wanted=namedKey();
  const valid=namedData&&namedStamp===wanted;
  const subtype=subtypeCoverage(namedConfig.group,namedConfig.subtype);
  if (!wanted||!valid||namedData.state!=='READY'||subtype?.initial_supported===0) {
   list._namedRenderKey=null;
   list.innerHTML='';
   if (!wanted) status.textContent='Choose a category to show reachable locations.';
   else if (subtype?.initial_supported===0) {
    status.textContent='Unassessed · '+formatReachCount(subtype.catalogue_records)+' source records need network support.';
   } else if (!valid) {
    status.textContent=namedError||'Loading reachable destinations…';
    if (namedError) list.innerHTML='<button type="button" data-named-retry>Retry destinations</button>';
    else if (!namedPending&&host.closest('[data-unet-named]')?.open) root.queueMicrotask(()=>loadNamed());
   } else status.textContent=namedData.state==='ORIGIN_UNASSESSED'?
    (roadMode(modes)?'Unassessed · no screened departure point within walking range.':'Unassessed · no retained network start.'):
    'Unassessed · no estimate for the selected rail mode.';
   continue;
  }
  const rows=namedRows(),size=15,pages=Math.max(1,Math.ceil(rows.length/size));
  namedConfig.page=Math.min(Math.max(0,namedConfig.page),pages-1);
  const stamp=JSON.stringify([wanted,namedConfig.subtype,namedConfig.query,namedConfig.show,namedConfig.page]);
  if (list._namedRenderKey===stamp) continue;
  list._namedRenderKey=stamp;
  const prefix=namedConfig.subtype||namedConfig.query?
   formatReachCount(rows.length)+' of '+formatReachCount(namedData.total):formatReachCount(namedData.total);
  status.textContent=roadMode(modes)&&namedData.modelled_records===0?'Unassessed · no modelled road arrivals for this category.':
   prefix+' reached within '+minutes+' min'+(namedConfig.show?'':' · points hidden');
  list.innerHTML=namedList(rows,namedConfig.page*size,size,pages,namedConfig.group);
 }
 drawNamed();
}

async function loadNamed(){
 let wanted=namedKey();if(!wanted||namedPending===wanted)return;if(namedStamp===wanted&&namedData){renderNamed();return}namedPending=wanted;namedError='';let current=++namedTicket,wantedJob=job,wantedMinutes=minutes,wantedModes=modes,wantedView=namedConfig.view,wantedGroup=namedConfig.group;
 try{
  let data=namedCache.get(wanted)||await request('/v1/destinations?'+new URLSearchParams({job:wantedJob,minutes:String(wantedMinutes),modes:wantedModes,view:wantedView,group:wantedGroup}));
  if(current!==namedTicket||wanted!==namedKey())return;
  if(data.contract!=='MOBILITY_NAMED_DESTINATIONS_V0_1'||data.grain!==profile.grain||data.id!==profile.id||data.basis!==profile.basis||data.minutes!==minutes||data.modes!==modes||data.view!==namedConfig.view||data.group!==namedConfig.group)throw Error('Named destination identity differs');
  if(data.state==='READY'&&(data.total!==data.rows.length||data.total!==data.map.features.length||new Set(data.rows.map(r=>r.record_key)).size!==data.total||data.rows.some((r,i)=>r.record_key!==data.map.features[i].properties.record_key||r.first_band!==data.map.features[i].properties.first_band||r.point.coordinates.some((v,j)=>v!==data.map.features[i].geometry.coordinates[j]))))throw Error('List/map/count reconciliation differs');
  namedData=data;namedStamp=wanted;if(data.group==='FEHD_RESTAURANT')for(const [key,value] of namedCache){if(value.group===data.group)namedCache.delete(key)}namedCache.set(wanted,data);while(namedCache.size>3)namedCache.delete(namedCache.keys().next().value)
 }catch(e){if(current===namedTicket){namedData=null;namedStamp='';namedError='Destination list unavailable: '+e.message}}
 finally{if(current===namedTicket){namedPending='';renderNamed()}}
}

const destinationFamilies = [
 ['Education','EDB'],
 ['HA healthcare','HA_HOSPITAL','HA_FAMILY','HA_SPECIALIST'],
 ['Shopping centres','RETAIL_MALL'],
 ['Restaurant licences','FEHD_RESTAURANT'],
 ['Public markets','FEHD_MARKET'],
 ['Everyday retail','RETAIL_SUPERMARKET','RETAIL_CONVENIENCE','RETAIL_GREENGROCER'],
 ['Sports','LCSD_SPORT'],
 ['Culture','LCSD_CULTURE'],
 ['Public libraries','LCSD_LIBRARY'],
 ['Parks and gardens','LCSD_PARK_PILOT'],
];
const destinationTypeOptions = {
 LCSD_SPORT:[
  ['sports_centres','Sports centres'],['pools','Swimming pools'],['grounds','Sports grounds'],
  ['tennis','Tennis venues'],['stadia','Indoor stadia'],
 ],
 LCSD_CULTURE:[['museums','Museums and visual arts venues'],['performance','Performance venues']],
 FEHD_RESTAURANT:[
  ['General restaurant licence','General restaurants'],
  ['Light refreshment restaurant licence','Light refreshment restaurants'],
 ],
};
const reachModes = [
 ['all','Walking + rail'],['walk','Walking'],['main','Walking + main rail'],['light','Walking + Light Rail'],
 ['car','Private car'],['taxi','Taxi'],
];
const reachBands = [10,20,30,40,50,60];
const formatReachCount = value=>Number(value).toLocaleString('en-HK');

function countRange(counts) {
 if (!counts) return null;
 if (Number.isInteger(counts.published_total)) return [counts.published_total,counts.published_total];
 return counts.total;
}

function formatCountRange(value) {
 if (!value) return '—';
 const [lo,hi] = value;
 return lo===hi ? formatReachCount(lo) : formatReachCount(lo)+'–'+formatReachCount(hi);
}

function overviewCounts(coverage, band, mode) {
 const positions = new Map(coverage.groups.map((group,i)=>[group.key,i]));
 const used = new Set(destinationFamilies.flatMap(([, ...keys])=>keys));
 const families = [...destinationFamilies,
  ...coverage.groups.filter(g=>!g.detail&&!used.has(g.key)).map(g=>[g.label,g.key])];
 return families.flatMap(([label,...keys])=>{
  const indices = keys.map(k=>positions.get(k)).filter(i=>i!==undefined);
  if (!indices.length) return [];
  const supported = indices.some(i=>coverage.groups[i].supported_records?.some(n=>n>0));
  const sum = mode=>{
   if (!supported||!coverage.rail_available[mode]) return null;
   const totals = indices.map(i=>countRange(band.groups[i].counts[mode]));
   if (totals.some(value=>!value)) return null;
   return totals.reduce(([lo,hi],[min,max])=>[lo+min,hi+max],[0,0]);
  };
  return [{label,walk:sum('walk'),combined:mode==='walk'?null:sum(mode)}];
 });
}

function destinationChart(coverage,band,mode) {
 const showRail = mode!=='walk';
 const label = mode==='main'?'Main rail':mode==='light'?'Light Rail':'With rail';
 const rows = overviewCounts(coverage,band,mode);
 const average = value=>value ? (value[0]+value[1])/2 : 0;
 const body = rows.map(row=>{
  const walk = average(row.walk);
  const total = average(row.combined||row.walk);
  const split = total ? Math.max(0,Math.min(100,100*walk/total)) : 0;
  const accessible = row.label+', '+(row.walk?formatCountRange(row.walk)+' walking':'walking unassessed')+
   (showRail?', '+(row.combined?formatCountRange(row.combined)+' walking with rail':'selected rail unassessed'):'');
  return '<li class="unet-reach-grid" aria-label="'+esc(accessible)+'"><span>'+esc(row.label)+'</span>'+
   '<span aria-hidden="true" class="unet-reach-track'+(total?' has-reach':'')+'"><i style="width:'+split.toFixed(3)+'%"></i></span>'+
   '<span class="unet-reach-value">'+formatCountRange(row.walk)+'</span>'+
   (showRail?'<strong class="unet-reach-value">'+formatCountRange(row.combined)+'</strong>':'')+'</li>';
 }).join('');
 return '<figure class="unet-reach-chart'+(showRail?'':' unet-walk-chart')+'" aria-label="Share and count of reachable records by category">'+
  '<div class="unet-reach-grid unet-reach-head" aria-hidden="true"><span>Category</span><span>Share of reach</span><span>Walk</span>'+
  (showRail?'<span>'+label+'</span>':'')+'</div><ul>'+body+'</ul><figcaption><span class="unet-walk-key">Walking</span>'+
  (showRail?'<span class="unet-rail-key">Added by rail</span>':'')+'</figcaption></figure>';
}

function dataCoverage(coverage, wasOpen) {
 const rows = coverage.groups.filter(group=>!group.detail).map(group=>
  '<li><span>'+esc(group.label)+'</span><b>'+formatCountRange(group.supported_records)+' / '+
  formatReachCount(group.catalogue_records)+'</b></li>'
 ).join('');
 const bySource = coverage.scope?.lcsd_sport_culture_by_source;
 const subtypeRows = bySource ? Object.entries(destinationTypeOptions).filter(([key])=>key!=='FEHD_RESTAURANT')
  .flatMap(([, types])=>types.map(([key,label])=>{
   const entry = bySource[key];
   if (!entry) return '';
   const support = entry.initial_supported ? formatReachCount(entry.initial_supported)+' / '+formatReachCount(entry.catalogue_records) :
    'Unassessed · '+formatReachCount(entry.catalogue_records)+' records';
   return '<li><span>'+esc(label)+'</span><b>'+support+'</b></li>';
  })).join('') : '';
 return '<details data-unet-data-coverage'+(wasOpen?' open':'')+'><summary>Data coverage</summary>'+
  '<p class="unet-coverage-note">Network-supported records / source catalogue. HA service listings may share a site. Some venue records share a location. '+ 
  'Counts use the primary published coordinate view where available. Ranges indicate coordinate-view variation.</p>'+
  '<ul class="unet-data-coverage">'+rows+'</ul>'+
  (subtypeRows?'<details><summary>LCSD coverage by venue type</summary><ul class="unet-data-coverage">'+subtypeRows+'</ul></details>':'')+
  '<p class="unet-coverage-note">Reach uses Building network supports or mapped park approaches. Building access gaps, internal travel, opening hours and step-free journeys remain unassessed.</p></details>';
}

function roadAssumptions(reading) {
 return 'Static road times from the closest linked street departure, plus walking to and from the road. '+
  (reading.modes==='taxi'?'Includes a '+reading.wait_seconds/60+' min taxi wait scenario. ':'')+
  ' Street access is modelled. Kerb rules, parking availability and venue entrances require local verification.';
}

function roadChart(reading, band, wasOpen) {
 const groups=new Map(reading.groups.map(group=>[group.key,group]));
 const rows=destinationFamilies.flatMap(([label,...keys])=>{
  const sources=keys.map(k=>groups.get(k)).filter(Boolean);
  if (!sources.length) return [];
  const reached=sources.reduce((n,g)=>n+band.groups[g.key],0);
  const modelled=sources.reduce((n,g)=>n+g.modelled,0);
  const total=sources.reduce((n,g)=>n+g.catalogue_records,0);
  return [{label,reached,modelled,total}];
 });
 const body=rows.map(({label,reached,modelled})=>{
  const fraction=modelled?100*reached/modelled:0;
  return '<li class="unet-reach-grid" aria-label="'+esc(label+(modelled?', '+formatReachCount(reached)+' reachable':', unassessed'))+
   '"><span>'+esc(label)+'</span><span aria-hidden="true" class="unet-reach-track"><i style="width:'+fraction.toFixed(3)+
   '%"></i></span><strong class="unet-reach-value">'+(modelled?formatReachCount(reached):'—')+'</strong></li>';
 }).join('');
 const coverage=rows.map(r=>'<li><span>'+esc(r.label)+'</span><b>'+formatReachCount(r.modelled)+' / '+
  formatReachCount(r.total)+'</b></li>').join('');
 return '<figure class="unet-reach-chart unet-walk-chart" aria-label="Reachable destinations by road">'+
  '<div class="unet-reach-grid unet-reach-head" aria-hidden="true"><span>Category</span><span>Share of modelled</span><span>Reached</span></div>'+
  '<ul>'+body+'</ul></figure><details data-unet-data-coverage'+(wasOpen?' open':'')+'><summary>Road coverage and assumptions</summary>'+
  '<p class="unet-coverage-note">Modelled records / source catalogue</p><ul class="unet-data-coverage">'+coverage+
  '</ul><p class="unet-coverage-note">'+esc(roadAssumptions(reading))+'</p></details>';
}

function renderDestinationCoverage() {
 root.document?.querySelectorAll('[data-unet-destinations]').forEach(host=>{
  const owner = host.closest('[data-unet]');
  const place = owner?.getAttribute('data-unet-grain')+':'+owner?.getAttribute('data-unet-id');
  const c = key(target)===place ? profile?.destination_reach : null;
  const reading=roadMode(modes)&&c?roadProfiles.get(roadKey()):null;
  const error=roadMode(modes)&&c?roadErrors.get(roadKey()):null;
  const stamp = [place,job,c?.version,minutes,modes,!!reading,error,walkDestinationError].join(':');
  if (host._ugDestinationCoverage===stamp) return;
  host._ugDestinationCoverage = stamp;
  const wasOpen = host.querySelector('[data-unet-data-coverage]')?.open;
  const heading = '<h4>Destination reach</h4>';
  if (!c) {
   host.innerHTML=heading+(key(target)===place&&walkDestinationError?
    '<p class="unet-coverage-note">'+esc(walkDestinationError)+'</p>':'');
   return;
  }
  if (roadMode(modes)) {
   if (error) {
    host.innerHTML=heading+'<p class="unet-coverage-note">'+esc(error)+'</p><button type="button" data-unet-road-retry>Retry road reach</button>';
    host.querySelector('[data-unet-road-retry]').addEventListener('click',()=>{
     roadErrors.delete(roadKey());sync();
    });
   } else if (!reading) {
    host.innerHTML=heading+'<p class="unet-coverage-note">Loading road reach…</p>';
    root.queueMicrotask(loadRoadProfile);
   } else if (!reading.assessed) {
    host.innerHTML=heading+'<p class="unet-coverage-note">Unassessed · no usable street departure within a 10-minute walk.</p>';
   } else {
    host.innerHTML=heading+roadChart(reading,reading.rows.find(row=>row.minutes===minutes),wasOpen);
   }
   return;
  }
  if (c.grain!==profile.grain||c.id!==profile.id||c.basis!==profile.basis) {
   host.textContent='Destination reading is unavailable for this place.';
   return;
  }
  if (!c.assessed) {
   host.innerHTML=heading+'<p class="unet-coverage-note">Unassessed. This place has no retained network start.</p>'+dataCoverage(c,wasOpen);
   return;
  }
  const row = c.rows.find(row=>row.minutes===minutes);
  if (!row) {host.innerHTML=heading;return}
  host.innerHTML=heading+destinationChart(c,row,modes)+
   (modes!=='walk'&&!c.rail_available[modes]?'<p class="unet-coverage-note">The selected rail mode is unassessed for this place.</p>':'')+
   dataCoverage(c,wasOpen);
 });
}

function renderBuildingCoverage(){
 root.document?.querySelectorAll('[data-unet-buildings]').forEach(host=>{
  let c=profile?.building_references,owner=host.closest?.('[data-unet]'),expectedGrain=owner?.getAttribute?.('data-unet-grain'),expectedId=owner?.getAttribute?.('data-unet-id'),different=c&&expectedGrain&&(c.grain!==expectedGrain||c.id!==expectedId),stamp=(different?'different:'+expectedGrain+':'+expectedId:c?c.version+':'+c.grain+':'+c.id+':'+c.basis+':'+c.assessed:'pending')+':'+minutes+':'+modes;
  if (roadMode(modes)) {
   const road=!different&&job?roadProfiles.get(roadKey()):null;
   const roadStamp=stamp+':'+job+':'+!!road;
   if (host._ugBuildingCoverage===roadStamp) return;
   host._ugBuildingCoverage=roadStamp;
   if (!road) {
    host.textContent='Select a place and calculate its road reach.';
    if (!different&&job) root.queueMicrotask(loadRoadProfile);
   } else {
    const row=road.rows.find(r=>r.minutes===minutes);
    host.innerHTML='<p>'+(!road.assessed?'Street departure unassessed.':esc(road.departure)+' · '+
     formatReachCount(row.links)+' road links reached within '+minutes+' min.')+'</p>'+
     '<p class="unet-coverage-note">'+esc(roadAssumptions(road))+'</p>';
   }
   return;
  }
  if(host._ugBuildingCoverage===stamp)return;host._ugBuildingCoverage=stamp;
  if(!c||different){host.innerHTML='<p class="unet-coverage-note">Select Show on atlas for this place to load its building coverage.</p>';return}
  if(c.version!=='MOBILITY_BUILDING_SUPPORT_REACH_V0_1'||c.grain!==profile.grain||c.id!==profile.id){host.textContent='Building coverage identity differs.';return}
  if(!c.assessed){host.textContent='Building coverage is unassessed for this network start.';return}
  let row=c.rows.find(r=>r.minutes===minutes),fmt=n=>Number(n).toLocaleString(),line=(label,v)=>'<tr><th scope="row">'+label+'</th><td>'+fmt(v.initial)+'</td><td>'+fmt(v.nearest_proxy)+'</td><td>'+fmt(v.total)+'</td></tr>',body=line('Walking',row.counts.walk);
  if(modes!=='walk'){body+=line(modes==='main'?'Walking + main rail':modes==='light'?'Walking + Light Rail':'Walking + retained rail',row.counts[modes]);if(row.rail_added[modes]!==null)body+=line('Added by rail',row.rail_added[modes])}
  host.innerHTML='<h4>Potential building coverage · '+minutes+' min</h4><table class="unet-coverage"><thead><tr><th>Network reach</th><th>Initial match</th><th>Nearest proxy</th><th>Total</th></tr></thead><tbody>'+body+'</tbody></table><p class="unet-coverage-note">Distinct Building references whose network supports are reached. Nearest proxies exclude the building-to-network gap. These counts do not confirm an entrance or physical access.'+(c.source_building_included?' The selected Building is included.':' Hex starts contribute a combined envelope; reach is not uniform across the cell.')+(modes!=='walk'&&!c.rail_available[modes]?' The selected rail family has no retained estimate; its additional coverage is unassessed.':'')+'</p><details><summary>Coverage basis and citywide scope</summary><p>'+fmt(c.denominators.initial_supported)+' initial network matches; '+fmt(c.denominators.nearest_proxy_supported)+' nearest-network proxies; '+fmt(c.denominators.unassessed)+' unassessed Building references. A Building qualifies once if any retained edge/3D-chainage support is reached. Parallel edges and levels remain distinct. This is source-support coverage, not land-use opportunity, population served or an Accessibility score.</p><table class="unet-coverage"><thead><tr><th>Minutes</th><th>Walking</th><th>'+(modes==='walk'?'Walking':modes==='main'?'With main rail':modes==='light'?'With Light Rail':'With retained rail')+'</th></tr></thead><tbody>'+c.rows.map(r=>'<tr><th scope="row">'+r.minutes+'</th><td>'+fmt(r.counts.walk.total)+'</td><td>'+fmt(r.counts[modes].total)+'</td></tr>').join('')+'</tbody></table></details>'
 })
}

function summary(){if(!profile)return '';if(!profile.assessed)return 'No retained native network start; this is unassessed, not zero access.';let s=profile.summary.find(x=>x.exit_minutes===5&&x.band_minutes===minutes),km=v=>(v/1000).toFixed(1),rail=modes==='main'?s.main_m:modes==='light'?s.light_m:s.rail_added_m;return profile.grain+' '+profile.id+' · '+minutes+' min: '+km(s.walk_m)+' km walking'+(modes==='walk'?'':rail===null?'; selected rail family unavailable':'; '+km(rail)+' km '+(modes==='all'?'additional with rail':modes==='main'?'main-rail component':'Light Rail component'))+'. Native-edge lengths retain parallel edges and levels; not unique street lengths.'}

async function preparePathMap() {
 attach();
 const master = root.document?.querySelector('#ugMobilityCitywideSection [data-visible]');
 if (master&&!master.checked) {
  opening=true;
  try { await root.UGA_MOBILITY_CITYWIDE?.open?.(); }
  finally { opening=false; }
 }
 if (master&&!master.checked) throw Error('The Mobility map could not be opened.');
}

async function nativeSignatureJob(place,basis,active,detailed=false) {
 const health=await request('/health');
 if (health.phase!=='ready'||health.lookup_sha256!=='3714ecc75cb72df365711d572e3a1b6db6acd2455ba93d1383c2467e1ae29894') {
  throw Error(health.error||'The local Mobility service is not ready.');
 }
 const lookup=await request('/v1/lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(place)});
 if (!lookup.job) throw Error('Local Mobility service returned no journey job.');
 for (let i=0;i<150&&active();i++) {
  const state=await request('/v1/status?job='+encodeURIComponent(lookup.job));
  if (state.state==='ready') {
   const p=state.profile;
   if (p.grain!==place.grain||p.id!==place.id||basis&&p.basis!==basis) throw Error('Mobility result identity differs.');
   return detailed?{job:lookup.job,profile:p}:lookup.job;
  }
  if (['error','expired','superseded'].includes(state.state)) throw Error(state.message||'Place calculation '+state.state+'.');
  await new Promise(resolve=>root.setTimeout(resolve,500));
 }
 throw Error('Local Mobility signature calculation expired.');
}
async function loadWalkDestinations() {
 if (!profile?.browserWalkRail) return null;
 if (walkNative) return walkNative;
 const selected=profile,current=ticket;
 const active=()=>ticket===current&&profile===selected;
 const place={grain:selected.grain,id:selected.id};
 walkDestinationError='';
 const operation=useBrowserWalkDestinations?
  walkRailRequest({type:'destination-profile',place:{...place,basis:selected.basis}})
   .then(destination_reach=>({profile:{destination_reach}})):
  nativeSignatureJob(place,selected.basis,active,true);
 walkNative=operation.then(result=>{
  if (!active()) return null;
  const reading=result.profile.destination_reach;
  if (reading?.version!=='MOBILITY_CURRENT_DESTINATION_REACH_V0_1'||
      reading.grain!==selected.grain||reading.id!==selected.id||reading.basis!==selected.basis||
      reading.assessed!==selected.assessed) throw Error('Destination profile identity differs.');
  selected.destination_reach=reading;
  selected.browserWalkDestinations=useBrowserWalkDestinations;
  sync();
  return result;
 }).catch(error=>{
  if (active()) {
   walkNative=null;
   walkDestinationError=error.message==='Failed to fetch'?
    (useBrowserWalkDestinations?'The destination catalogue could not be loaded.':
     'Walking and rail destinations require the local Mobility service on port 8768.'):error.message;
   sync();
  }
  return null;
 });
 return walkNative;
}
async function calculateReach(place,basis,active=()=>true,mode=modes) {
 if (!place||!active()) return false;
 setTarget(place);
 const placeKey = key(place);
 const portable=useBrowserRoad&&roadMode(mode);
 const portableWalk=useBrowserWalkRail&&!roadMode(mode);
 if (profile&&(portable!==!!profile.browserRoad||portableWalk!==!!profile.browserWalkRail)) clear();
 if (!profile&&!calculation) {
  const revision = ++ticket;
  const isCurrent = ()=>revision===ticket&&key(target)===placeKey;
  say('Calculating journey and destination reach…');
  calculation = (async()=>{
   try {
    if (portableWalk) {
     const result=await walkRailRequest({type:'origin',place:{...place,basis}});
     if (!isCurrent()||!active()) return false;
     job='browser-walk-rail:'+revision;
     profile=result;
     enabled=true;
     say(result.assessed?'Reach calculated.':'Reach is unassessed for this network start.');
     return true;
    }
    if (portable) {
     const result=await browserRequest({type:'origin',place:{...place,basis}});
     if (!isCurrent()||!active()) return false;
     job='browser-road:'+revision;
     profile=result;
     enabled=true;
     say('Browser road reach ready to calculate.');
     return true;
    }
    const health = await request('/health');
    if (!isCurrent()) return false;
    if (!/^MOBILITY_NETWORK_MAP_V0_(?:[789]|1[0-9]|2[012])$/.test(health.version)||
        health.lookup_sha256!=='3714ecc75cb72df365711d572e3a1b6db6acd2455ba93d1383c2467e1ae29894') {
     throw Error('Local Mobility service version differs.');
    }
    if (health.phase!=='ready') throw Error(health.error||'Local Mobility service is still loading.');
    const {job:requestedJob} = await request('/v1/lookup',{
     method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(place),
    });
    if (!requestedJob) throw Error('Local Mobility service returned no journey job.');
    for (let i=0;i<150&&isCurrent();i++) {
     const state = await request('/v1/status?job='+encodeURIComponent(requestedJob));
     if (!isCurrent()) return false;
     if (state.state==='ready') {
      const result = state.profile;
      if (result.grain!==place.grain||result.id!==place.id||basis&&result.basis!==basis) {
       throw Error('Mobility result belongs to a different place or network start.');
      }
      job=requestedJob;
      profile=result;
      enabled=true;
      say(result.assessed?'Reach calculated.':'Reach is unassessed for this network start.');
      return true;
     }
     if (['error','expired','superseded'].includes(state.state)) {
      throw Error(state.message||'Place calculation '+state.state+'.');
     }
     await new Promise(resolve=>root.setTimeout(resolve,500));
    }
    if (isCurrent()) throw Error('Reach calculation timed out.');
    return false;
   } catch (error) {
    if (isCurrent()) say(error.message==='Failed to fetch'?
     'The browser could not load the hosted Mobility runtime.':error.message);
    return false;
   } finally {
    if (isCurrent()) calculation=null;
   }
  })();
 }
 if (calculation&&!await calculation) return false;
 return active()&&key(target)===placeKey&&!!profile&&(!basis||profile.basis===basis);
}

const signatureCache=new Map(), signaturePending=new Map();
const signatureKey=(place,basis,mode)=>JSON.stringify([place.grain,place.id,basis,mode]);

function cachedSignature(place,basis,mode) {
 return signatureCache.get(signatureKey(place,basis,mode));
}

function cachedRoadHexes(mode) {
 return [...signatureCache.values()].filter(r=>r.grain==='hex'&&r.mode===mode);
}

async function signatureReading(place,basis,mode,active=()=>true) {
 if (!active()) return null;
 const stamp=signatureKey(place,basis,mode);
 const saved=signatureCache.get(stamp);
 if (saved) return saved;
 if (!signaturePending.has(stamp)) {
  const pending=(async()=>{
   let r;
   if (useBrowserRoad&&roadMode(mode)) {
    r=await browserRequest({type:'signature',place:{...place,basis},mode});
   } else if (useBrowserWalkSignature&&(mode==='walk'||mode==='all')) {
    r=await walkRailRequest({type:'signature',place:{...place,basis},mode});
    browserSignatureReadings.add(r);
   } else if (useBrowserRoad||useBrowserWalkRail) {
    const token=await nativeSignatureJob(place,basis,active);
    r=await request('/v1/signature?'+new URLSearchParams({job:token,modes:mode}));
   } else {
    if (!await calculateReach(place,basis,active,mode)) throw Error(lastMessage||'The local Mobility service could not assess this place.');
    const token=job;
    r=await request('/v1/signature?'+new URLSearchParams({job:token,modes:mode}));
   }
   if (r.version!=='MOBILITY_SIGNATURE_PROFILE_V0_1'||r.grain!==place.grain||r.id!==place.id||
       r.mode!==mode||r.target_hexes!==49560||basis&&r.basis!==basis) throw Error('Mobility profile identity differs.');
   signatureCache.set(stamp,r);
   const changed=new Set();
   if (r.grain==='hex'&&roadMode(mode)) changed.add(mode);
   if (signatureCache.size>48) {
    const oldest=signatureCache.keys().next().value;
    const dropped=signatureCache.get(oldest);
    signatureCache.delete(oldest);
    if (dropped.grain==='hex'&&roadMode(dropped.mode)) changed.add(dropped.mode);
   }
   if (changed.size) root.queueMicrotask(()=>{
    for (const updated of changed) root.UGA_MOBILITY_CITYWIDE?.refreshRoad?.(updated);
   });
   return r;
  })().finally(()=>signaturePending.delete(stamp));
  signaturePending.set(stamp,pending);
 }
 return signaturePending.get(stamp);
}

async function show(place,basis,active=()=>true) {
 if (!place||!active()) return;
 const originStart=performance.now();const originReady=calculateReach(place,basis,active);
 const intent={place,basis,active};
 pendingShow=intent;pathNotice('Calculating journey reach…');
 const current=()=>pendingShow===intent&&active();
 try {
  const mapStart=performance.now();
  const [ready]=await Promise.all([
   originReady.then(ok=>{if(current()){sample('origin_ready',originStart);pathNotice('Preparing journey paths…')}return ok}),
   preparePathMap().then(()=>{if(current())sample('map_ready',mapStart)})
  ]);
  if(!ready||!current())return;
  pathVisible=true;
  sync();
  await draw();
 } catch (error) {
  if (current()) say(error.message);
 } finally {
  if (pendingShow===intent){pendingShow=null;if(!displayWait)pathNotice('')}
 }
}

async function exploreDestinations(place,basis,active=()=>true) {
 if (!await calculateReach(place,basis,active)) return;
 try {
  await preparePathMap();
  if (key(target)!==key(place)||!active()) return;
  installPanel();
  const doc=root.document;
  const section=doc.getElementById('ugMobilityCitywideSection');
  const details=panel?.querySelector('[data-unet-named]');
  if (!section||!details) throw Error('The Mobility legend is unavailable.');
  const mobile=root.matchMedia?.('(max-width:900px)').matches;
  const mobileTab=doc.querySelector('[data-ug-mobility-tab]');
  if (mobile&&mobileTab) mobileTab.click();
  else {
   if (doc.getElementById('panel')?.classList.contains('panel-minimized')) doc.getElementById('panelMinimize')?.click();
   if (section.querySelector('.mode-body')?.hidden) section.querySelector('[data-expand]')?.click();
  }
  namedConfig.show=true;
  details.open=true;
  sync();
  const selection=root.UGA_V2_SELECTION;
  if (selection?.isReportOpen?.()) selection.closeReport();
  root.requestAnimationFrame?.(()=>{
   if (key(target)!==key(place)||!details.isConnected) return;
   details.scrollIntoView({block:'nearest'});
   details.querySelector('[data-named-group]')?.focus({preventScroll:true});
  });
  if (profile?.browserWalkRail&&!await loadWalkDestinations()) return;
  await loadNamed();
 } catch (error) {
  if (key(target)===key(place)) say(error.message);
 }
}

function applyPaths(g,m){
 let keep=shownGeometry&&shownGeometry.grain===g.grain&&shownGeometry.id===g.id&&shownGeometry.modes===g.modes,loading=shownGeometry!==g;shownModes=modes;let src=m.getSource(source);if(!src){m.addSource(source,{type:'geojson',data:g.data_url,maxzoom:18,tolerance:0,buffer:32});shownGeometry=g}else if(shownGeometry!==g){src.setData(g.data_url);shownGeometry=g}
 if(!m.getLayer(layer))m.addLayer({id:layer,type:'line',source,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['match',['get','minutes'],10,colours[0],20,colours[1],30,colours[2],40,colours[3],50,colours[4],colours[5]],'line-width':['interpolate',['linear'],['zoom'],10,1,14,2,18,4],'line-opacity':opacity}});
 m.setFilter(layer,['<=',['get','minutes'],minutes]);m.setPaintProperty(layer,'line-opacity',opacity);m.setLayoutProperty(layer,'visibility',visible()&&(!loading||keep||!src&&walkUrls.has(g.data_url))?'visible':'none');let count=Object.entries(g.band_counts).reduce((n,[band,value])=>n+(Number(band)<=minutes?value:0),0);say((count?count.toLocaleString()+' reached network intervals. ':'No reached paths for this selection. ')+summary())
}
function pathsReady(e){if(waitingForWalkStyle) resumeWalkDraw();if(e.sourceId===source&&e.isSourceLoaded&&shownGeometry&&enabled){if(map?.getLayer(layer))map.setLayoutProperty(layer,'visibility',visible()?'visible':'none');let count=Object.entries(shownGeometry.band_counts).reduce((n,[band,value])=>n+(Number(band)<=minutes?value:0),0);say(count.toLocaleString()+' reached network intervals. '+summary())}}
function pathsError(e){if(e.sourceId===source){clear();say('Network display unavailable; select Show on atlas to reload.')}}
function rememberGeometry(item){
 viewportCache.push(item);let vertices=()=>viewportCache.reduce((n,v)=>n+(v.g.vertices||0),0);while(viewportCache.length>2||(viewportCache.length>1&&vertices()>1000000))viewportCache.shift();
 disposeWalkUrls();
}
async function drawRoadNetwork(wantedJob,wantedMinutes,wantedModes,generation) {
 const data=await request('/v1/road/network?'+new URLSearchParams({job:wantedJob,minutes:String(wantedMinutes),modes:wantedModes}));
 if (wantedJob!==job||generation!==viewTicket||!visible()) return;
 if (data.type!=='FeatureCollection'||data.grain!==profile.grain||data.id!==profile.id||data.basis!==profile.basis||
     data.modes!==wantedModes||data.minutes!==wantedMinutes) throw Error('Road network identity differs');
 const mapSource=map.getSource(roadSource);
 if (mapSource) mapSource.setData(data);
 else map.addSource(roadSource,{type:'geojson',data,maxzoom:18});
 if (!map.getLayer(roadLayer)) {
  map.addLayer({id:roadLayer,type:'line',source:roadSource,layout:{'line-cap':'round','line-join':'round'},paint:{
   'line-color':['match',['get','first_band'],...reachBands.flatMap((b,i)=>[b,colours[i]]),colours[0]],
   'line-width':['interpolate',['linear'],['zoom'],8,1.1,14,2.5,18,5],
   'line-opacity':opacity,
  }});
 }
 say(data.assessed?formatReachCount(data.links)+' road links reached within '+wantedMinutes+' min.':'Street departure unassessed.');
}

function removeFacilities() {
 facilityTicket++;
 if (map?.getLayer(facilityLayer)) map.removeLayer(facilityLayer);
 if (map?.getSource(facilitySource)) map.removeSource(facilitySource);
 facilityMode=null;
}

async function drawFacilities() {
 const master=root.document?.querySelector('#ugMobilityCitywideSection [data-visible]');
 if (!facilitiesVisible||!roadMode(modes)||master&&!master.checked) {removeFacilities();return}
 if (!map?.isStyleLoaded?.()||map.getSource(facilitySource)&&facilityMode===modes) return;
 const mode=modes,wantedMap=map,current=++facilityTicket;
 try {
  const data=facilityCache.get(mode)||await request('/v1/road/facilities?'+new URLSearchParams({modes:mode}));
  if (data.type!=='FeatureCollection'||data.modes!==mode) throw Error('Road facility identity differs');
  facilityCache.set(mode,data);
  if (current!==facilityTicket||map!==wantedMap||!map.isStyleLoaded?.()) return;
  const currentSource=map.getSource(facilitySource);
  if (currentSource) currentSource.setData(data);
  else map.addSource(facilitySource,{type:'geojson',data});
  if (!map.getLayer(facilityLayer)) map.addLayer({id:facilityLayer,type:'circle',source:facilitySource,paint:{
   'circle-color':'#fff','circle-stroke-color':'#273847','circle-stroke-width':1.6,
   'circle-radius':['interpolate',['linear'],['zoom'],10,2.5,16,5],
  }});
  facilityMode=mode;
 } catch (error) {
  if (current===facilityTicket) say(error.message);
 }
}

async function draw(){
 if(!enabled||!job||!profile)return;if(drawing){redraw=true;return}drawing=true;cancelDisplay();const geometryStart=performance.now();if(visible())pathNotice('Preparing journey paths…');let generation=viewTicket,current=ticket,wantedJob=job,wantedMinutes=minutes,wantedModes=modes;
 try{
  let m=attach();
  const portable=profile.browserWalkRail;
  if (profile.browserRoad&&!m.isStyleLoaded?.()&&visible()) {
   waitingForWalkStyle=true;
   say('Waiting for the map to finish loading.');
   return;
  }
  if (!portable&&!m.isStyleLoaded?.()) return;
  if (profile.browserRoad) waitingForWalkStyle=false;
  if (!visible()) {
   waitingForWalkStyle=false;
   removeRoadNetwork();
   if (m.getLayer(layer)) m.setLayoutProperty(layer,'visibility','none');
   return;
  }
  if (portable&&profile.assessed&&!walkStyleReady(m)) return;
  if (roadMode(wantedModes)) {
   await drawRoadNetwork(wantedJob,wantedMinutes,wantedModes,generation);if(generation===viewTicket&&current===ticket&&visible()&&m.getSource(roadSource))submitted(m,roadSource,geometryStart);
   return;
  }
  if(!profile.assessed){remove();say(summary());return}
  let hit=[...viewportCache].reverse().find(c=>c.job===job&&c.modes===modes&&c.minutes>=minutes&&c.g.complete_network);if(hit){applyPaths(hit.g,m);return}
  if(shownModes!==modes&&m.getLayer(layer))m.setLayoutProperty(layer,'visibility','none');say('Loading the complete '+wantedMinutes+' minute reach…');controller=new root.AbortController();let signal=controller.signal,q='/v1/network?'+new URLSearchParams({job:wantedJob,minutes:String(wantedMinutes),modes:wantedModes,complete:'meta'}),g;
  for(let i=0;i<5;i++){
   try{g=await request(q,{signal});break}catch(e){if(!e.message.includes('busy')||i===4)throw e;await new Promise(resolve=>root.setTimeout(resolve,400*(i+1)));if(current!==ticket)return}
  }
  if(current!==ticket)return;if(!g.complete_network||g.type!=='NetworkReachMetadata'||g.grain!==profile.grain||g.id!==profile.id||g.minutes!==wantedMinutes||g.modes!==wantedModes)throw Error('Complete reach response identity differs');if (g.blob) {
   g.data_url=root.URL.createObjectURL(g.blob);
   walkUrls.add(g.data_url);
   delete g.blob;
  } else g.data_url=endpoint+q.replace('complete=meta','complete=1');
  rememberGeometry({job:wantedJob,modes:wantedModes,minutes:wantedMinutes,g});
  if(generation!==viewTicket||wantedMinutes!==minutes||wantedModes!==modes||!enabled||!visible())return;
  if (portable&&!walkStyleReady(m)) return;
  shownModes=modes;applyPaths(g,m);submitted(m,source,geometryStart);disposeWalkUrls();
 }catch(e){if(current===ticket&&e.name!=='AbortError'){if(e.message.includes('expired')){job=null;profile=null;enabled=false;remove()}say('Network drawing unavailable: '+e.message)}}
 finally{if(!displayWait&&generation===viewTicket)pathNotice('');drawing=false;if(redraw&&enabled){redraw=false;root.queueMicrotask(()=>draw())}}
}
function journeyFields(asButtons) {
 const time = asButtons ?
  '<div class="unet-time-bands" role="group" aria-label="Journey time in minutes">'+
   reachBands.map(band=>'<button type="button" data-unet-time="'+band+'" aria-label="'+band+
    ' minutes" aria-pressed="'+String(band===minutes)+'">'+band+'</button>').join('')+'</div>' :
  '<label>Journey time<select data-unet-minutes>'+reachBands.map(band=>'<option value="'+band+
   '">'+band+' min</option>').join('')+'</select></label>';
 return (asButtons?'<div class="unet-time-label">Journey time <output data-unet-time-caption></output></div>':'')+
  '<div class="unet-controls">'+time+
  '<label>Travel mode<select data-unet-modes>'+reachModes.map(([id,label])=>
   '<option value="'+id+'">'+label+'</option>').join('')+'</select></label></div>';
}

function changeJourney(nextMinutes,nextMode) {
 if (!reachBands.includes(nextMinutes)||!reachModes.some(([key])=>key===nextMode)) return;
 if (minutes===nextMinutes&&modes===nextMode) return;
 if (nextMode!==modes&&(roadMode(nextMode)||roadMode(modes))) {
  remove();
  removeFacilities();
  namedConfig.view='lonlat';
  namedConfig.located='';
 }
 const switchBackend=(useBrowserRoad||useBrowserWalkRail)&&roadMode(nextMode)!==roadMode(modes);
 const intent=pendingShow;
 const restorePaths=pathVisible;
 const basis=intent?.basis??profile?.basis??null;
 const restart=switchBackend&&target&&!!(enabled||calculation);
 minutes=nextMinutes;
 modes=nextMode;
 if (switchBackend) clear();
 SIGNATURE.syncJourney(minutes,modes);
 namedConfig.page=0;
 viewTicket++;
 sync();
 drawFacilities();
 if (restart) {
  if (intent) show(intent.place,basis,intent.active);
  else if (restorePaths) show(target,basis);
  else calculateReach(target,basis);
 } else if (enabled&&pathVisible) draw();
}

function bindJourneyControls(el) {
 el.querySelector('[data-unet-modes]').value=modes;
 const time=el.querySelector('[data-unet-minutes]');
 if (time) time.value=String(minutes);
 el.addEventListener('change',event=>{
  const control=event.target;
  if (control.hasAttribute('data-unet-minutes')) changeJourney(Number(control.value),modes);
  if (control.hasAttribute('data-unet-modes')) changeJourney(minutes,control.value);
 });
 el.querySelectorAll('[data-unet-time]').forEach(button=>{
  button.addEventListener('click',()=>changeJourney(Number(button.dataset.unetTime),modes));
 });
}

function placeControls(place) {
 const el=root.document.createElement('section');
 el.className='unet';
 el.setAttribute('data-unet','');
 if (place) {
  el.setAttribute('data-unet-grain',place.grain);
  el.setAttribute('data-unet-id',place.id);
 }
 return el;
}

function controls(place,basis,active,main=false) {
 const el=placeControls(place);
 if (main) el.setAttribute('data-unet-main','');
 const settings = main ? '<div class="unet-path-controls"><label><input type="checkbox" data-unet-path-visible> <span data-unet-path-label>Show reached paths</span></label>'+
  '<label>Path opacity <output data-unet-opacity-label></output><input type="range" data-unet-opacity min="0" max="100" aria-label="Path opacity"></label></div>'+
  '<label class="unet-destination-visibility" data-unet-facility-label hidden><input type="checkbox" data-unet-facilities> <span></span></label>' : '';
 el.innerHTML='<h4>'+(main?'Reach from selected place':'Journey reach')+'</h4>'+
  (main?'<p data-unet-context></p>':'')+journeyFields(false)+
  '<div class="unet-actions">'+(main?'<button type="button" data-unet-report>Place report</button>':
   '<button type="button" data-unet-show>Show paths on atlas</button>')+'</div>'+settings+legend()+
  '<p data-unet-status role="status">'+esc(lastMessage)+'</p>'+
  (main?'<details data-unet-named><summary>Reachable destinations</summary><div data-unet-named-host></div></details>':
   '<details><summary>Building coverage and journey assumptions</summary><div data-unet-buildings></div>'+
   '<p class="unet-coverage-note" data-unet-walk-note>Walking uses 80 m/min on recorded 3D paths. Rail uses nominal station times, 5 min at entry and exit, and 2 km walking approach and egress caps. A Hex combines its retained starts.</p></details>');
 bindJourneyControls(el);
 el.querySelector('[data-unet-show]')?.addEventListener('click',()=>show(place,basis,active));
 if (!main) return el;
 el.querySelector('[data-unet-report]').addEventListener('click',()=>root.UGA_V2_SELECTION?.openReport?.());
 el.querySelector('[data-unet-opacity]').addEventListener('input',event=>setOpacity(event.target.value));
 el.querySelector('[data-unet-facilities]').addEventListener('change',async event=>{
  facilitiesVisible=event.target.checked;
  if (!facilitiesVisible) {removeFacilities();return}
  try {
   await preparePathMap();
   await drawFacilities();
  } catch (error) {say(error.message)}
 });
 el.querySelector('[data-unet-path-visible]').addEventListener('change',event=>{
  const showPaths=event.target.checked;
  if (showPaths&&!profile&&target) {show(target,null);return}
  if (!showPaths){cancelDisplay();pendingShow=null;pathNotice('')}
  pathVisible=showPaths;
  if (!showPaths) removeRoadNetwork();
  if (map?.getLayer(layer)) map.setLayoutProperty(layer,'visibility',visible()?'visible':'none');
  sync();
  if (enabled&&visible()) draw();
 });
 const details=el.querySelector('[data-unet-named]');
 details.addEventListener('toggle',()=>{
  if (details.open) renderNamed();
 });
 return el;
}

function mount(host,grain,id,active,basis) {
 if (!local()||!['building','hex'].includes(grain)||
     host.closest?.('#ugMobilityCitywideSection,[data-ugmp-reading-pane]')) return;
 host.appendChild(controls({grain,id:String(id)},basis,active));
 root.queueMicrotask(sync);
}

function mountReport(journey,destinations,grain,id,active,basis,walking) {
 if (!walking) {
  journey.innerHTML='<h4>Journey reach</h4><p class="ugmp-empty">Step-free journey reach is unassessed.</p>';
  destinations.innerHTML='<h4>Destination reach</h4><p class="ugmp-empty">Step-free destination reach is unassessed.</p>';
  return ()=>{};
 }
 const place={grain,id:String(id)};
 journey.appendChild(controls(place,basis,active));
 const access=placeControls(place);
 access.setAttribute('data-unet-accessibility','');
 access.innerHTML=journeyFields(true)+
  '<div class="unet-actions"><button type="button" data-unet-explore>Explore destinations in the legend</button>'+
  '<button type="button" data-unet-retry-reach hidden>Retry calculation</button></div>'+
  '<p data-unet-status role="status">'+esc(lastMessage)+'</p>'+
  '<details><summary>All reachable categories</summary><div data-unet-destinations></div></details>';
 destinations.appendChild(access);
 bindJourneyControls(access);
 access.querySelector('[data-unet-explore]').addEventListener('click',()=>exploreDestinations(place,basis,active));
 const retry=access.querySelector('[data-unet-retry-reach]');
 async function load() {
  retry.hidden=true;
  if (!await calculateReach(place,basis,active)) {
   if (active()) retry.hidden=false;
   return;
  }
  if (active()&&profile?.browserWalkRail&&access.querySelector('details').open) await loadWalkDestinations();
 }
 access.querySelector('details').addEventListener('toggle',event=>{
  if (event.target.open&&active()&&key(target)===key(place)&&profile?.browserWalkRail) loadWalkDestinations();
 });
 retry.addEventListener('click',load);
 root.queueMicrotask(sync);
 return load;
}

function installPanel() {
 if (panel?.isConnected) return;
 const body=root.document?.querySelector('#ugMobilityCitywideSection .mode-body');
 if (!body) return;
 panel=controls(null,null,()=>true,true);
 body.appendChild(panel);
 sync();
 body.querySelector('[data-visible]')?.addEventListener('change',event=>{
  drawNamed();
  drawFacilities();
  if (event.target.checked) {if (enabled&&pathVisible) draw()}
  else {
   removeRoadNetwork();
   if (map?.getLayer(layer)) map.setLayoutProperty(layer,'visibility','none');
  }
 });
}

function boot(){if(hooked||!local()||!root.document)return;hooked=true;let css=root.document.createElement('style');css.textContent='.unet{border-top:1px solid #c9d0cd;margin-top:12px;padding-top:9px;font:12px/1.45 system-ui}.unet h4,.unet p{margin:5px 0}.unet-controls{display:flex;align-items:end;gap:6px;flex-wrap:wrap}.unet-controls label[hidden]{display:none}.unet-controls label{display:flex;flex-direction:column;gap:3px;flex:1 1 120px}.unet-controls select,.unet-controls button{font:inherit;border:1px solid #8b9496;border-radius:5px;padding:6px;background:transparent;color:inherit}.unet-controls button{cursor:pointer;background:#e5e7e7}.unet-bands{display:flex;flex-wrap:wrap;gap:5px 10px;margin:8px 0}.unet-bands span{display:flex;align-items:center;gap:4px;font-size:11px}.unet-bands i{width:17px;height:4px}.unet [role=status]{font-size:11px;color:#526461}.unet-path-controls{display:flex;align-items:center;gap:15px;flex-wrap:wrap;margin:8px 0}.unet-path-controls label:last-child{flex:1;min-width:140px}.unet-path-controls input[type=range]{display:block;width:100%}.unet-path-controls output{float:right}.unet details{font-size:11px}.unet-coverage{width:100%;border-collapse:collapse;font-size:11px;margin:6px 0}.unet-coverage th,.unet-coverage td{padding:4px;border-bottom:1px solid #d4dbd7;text-align:right;vertical-align:top}.unet-coverage th:first-child{text-align:left}.unet-coverage-note{font-size:10px!important;line-height:1.45}@media print{.unet-controls{display:none}}';css.textContent+='.ugmp-reading-tabs {\n display:grid;\n grid-template-columns:repeat(3,minmax(0,1fr));\n gap:6px;\n margin:10px 0 14px;\n}\n.ugmp-card .ugmp-reading-tabs button {\n display:block;\n min-width:0;\n margin:0;\n padding:7px 5px;\n border:0;\n border-bottom:2px solid #cfddd4;\n border-radius:0;\n text-align:left;\n color:#294237;\n background:transparent;\n}\n.ugmp-reading-tabs button[aria-selected="true"] {border-color:#276f62}\n.ugmp-reading-tabs strong,.ugmp-reading-tabs span {display:block;overflow-wrap:anywhere}\n.ugmp-reading-tabs span {font-size:11px;color:#526b60;margin-top:2px}\n.ugmp-card [data-ugmp-reading-pane][hidden] {display:none}\n.unet [hidden] {display:none!important}\n.unet-actions {display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}\n.unet-actions button,.unet-time-bands button,.unet-list-pages button,\n.unet button[data-named-start],.unet button[data-named-retry] {\n font:inherit;\n border:1px solid #9badab;\n border-radius:5px;\n padding:5px 7px;\n color:inherit;\n background:transparent;\n}\n.unet-time-label {font-size:12px;font-weight:600}\n.unet-time-label output {margin-left:4px;font-variant-numeric:tabular-nums}\n.unet-time-bands {\n display:grid;\n grid-template-columns:repeat(6,minmax(0,1fr));\n flex:1 1 220px;\n align-self:stretch;\n gap:3px;\n margin:3px 0;\n}\n.unet-time-bands button {min-width:0;margin:0}\n.ugmp-card .unet-time-bands button[aria-pressed="true"] {\n color:white;\n background:#276f62;\n border-color:#276f62;\n}\n.unet-reach-chart {margin:8px 0 12px}\n.unet-reach-grid {\n display:grid;\n grid-template-columns:minmax(0,1.15fr) minmax(38px,1.4fr) minmax(43px,.52fr) minmax(50px,.58fr);\n gap:5px;\n align-items:center;\n}\n.unet-walk-chart .unet-reach-grid {grid-template-columns:minmax(0,1.15fr) minmax(38px,1.4fr) minmax(43px,.6fr)}\n.unet-reach-chart ul,.unet-data-coverage,.unet-destination-list {\n margin:0;\n padding:0;\n list-style:none;\n}\n.unet-reach-chart li {border-top:1px solid #d0ddd4;padding:5px 0}\n.unet-reach-head {font-size:11px;color:#526b60;margin-bottom:4px}\n.unet-reach-head span:nth-child(n+3),.unet-reach-value {\n text-align:right;\n font-variant-numeric:tabular-nums;\n}\n.unet-reach-value {overflow-wrap:anywhere}\n.unet-reach-track {\n display:block;\n background:#e5ede8;\n height:7px;\n border-radius:3px;\n overflow:hidden;\n}\n.unet-reach-track.has-reach {background:#a9bdc8}\n.unet-reach-track i {display:block;height:100%;background:#276f62}\n.unet-reach-chart figcaption {display:flex;flex-wrap:wrap;gap:10px;font-size:11px;margin:7px 0}\n.unet-reach-chart figcaption span::before {\n content:"";\n display:inline-block;\n height:6px;\n width:13px;\n border-radius:2px;\n margin-right:5px;\n vertical-align:1px;\n}\n.unet-walk-key::before {background:#276f62}\n.unet-rail-key::before {background:#a9bdc8}\n.unet-data-coverage li {\n display:flex;\n justify-content:space-between;\n gap:10px;\n padding:3px 0;\n border-bottom:1px solid #d0ddd4;\n}\n.unet-data-coverage li b {text-align:right}\n.unet-destination-search {display:block;margin-top:7px}\n.unet-destination-search input {\n display:block;\n box-sizing:border-box;\n width:100%;\n padding:5px;\n border:1px solid #9badab;\n border-radius:5px;\n font:inherit;\n color:inherit;\n background:transparent;\n}\n.unet-destination-visibility {display:block;margin:6px 0}\n.unet-destination-list li {border-top:1px solid #9badab66;padding:5px 0}\n.unet-destination-list li>div,.unet-list-pages {display:flex;align-items:start;gap:7px}\n.unet-destination-list li>div strong {margin-left:auto;white-space:nowrap;font-size:11px}\n.unet-destination-list li>div button {\n color:inherit;\n background:transparent;\n border:0;\n text-align:left;\n padding:0;\n font:600 12px/1.4 system-ui;\n text-decoration:underline;\n overflow-wrap:anywhere;\n}\n.unet-destination-list li p {margin:2px 0}\n.unet-destination-list details {margin:4px 0}\n.unet-list-pages {align-items:center;flex-wrap:wrap;margin:6px 0}\n.unet-list-pages span {flex:1 1 auto}\n@media(pointer:coarse) {\n .unet-actions button,.unet-time-bands button {min-height:40px}\n}\n@media print {\n .ugmp-card [data-ugmp-reading-pane][hidden] {display:block}\n .ugmp-reading-tabs,.unet-actions,.unet-time-bands,.unet-controls {display:none!important}\n .unet-reach-chart {print-color-adjust:exact;break-inside:avoid}\n}\n';root.document.head.appendChild(css);installPanel();let rail=root.document.getElementById('panelScroll');if(rail&&root.MutationObserver)new root.MutationObserver(installPanel).observe(rail,{childList:true,subtree:true});target=native(focus(root.UGA_V2_SELECTION?.snapshot?.()));root.UGA_V2_SELECTION?.subscribe(s=>setTarget(native(focus(s))));sync()}
function setOpacity(v){opacity=Math.max(0,Math.min(1,Number(v)/100));root.document?.querySelectorAll('[data-unet-opacity]').forEach(n=>{n.value=String(Math.round(opacity*100))});root.document?.querySelectorAll('[data-unet-opacity-label]').forEach(n=>{n.textContent=Math.round(opacity*100)+'%'});if(map?.getLayer(layer))map.setPaintProperty(layer,'line-opacity',opacity);if(map?.getLayer(roadLayer))map.setPaintProperty(roadLayer,'line-opacity',opacity)}
return Object.freeze({boot,mount,mountReport,signatureReading,cachedSignature,cachedRoadHexes,changeJourney,clear,setOpacity,show,draw,earliestColours:colours,state:()=>({target,minutes,modes,enabled,job,profile,lastMessage,opacity,pathVisible,cachedViews:viewportCache.length,waitingForWalkStyle,
  namedDestination:useBrowserWalkDestinations&&namedData&&namedStamp===namedKey()?{
   group:namedData.group,view:namedData.view,total:namedData.total,state:namedData.state,
   pointsCurrent:map?._ugNamedStamp===JSON.stringify([namedStamp,namedConfig.subtype,namedConfig.query])
  }:null,
  browserPath:walkUrls.has(shownGeometry?.data_url)?{
   grain:shownGeometry.grain,id:shownGeometry.id,mode:shownGeometry.modes,
   minutes:shownGeometry.minutes,url:shownGeometry.data_url
  }:null}),setTarget,selectHex:id=>{if(!opening)setTarget({grain:'hex',id:String(id)})}});
})();
root.UGA_V2_MOBILITY_NETWORK=NETWORK;
return Object.freeze({VERSION,signature:SIGNATURE,network:NETWORK,verify,timeProfile,timeCatalogue,timeCheck,timeHTML,timeCity,renderTime,timeOpacity,showTimeDestinations,railProfile,railCatalogue,railCheck,railHTML,railCity,surfaceDestinations,clearDestinations:onwardClear,citywideProfile:loadHex,serviceProfile:loadServiceProfile,citywideServices:loadCityServices,hexModel,buildingModel,gapReading,gapPanel,model,radial,load,open,close,boot,state:()=>({...S}),data:()=>D});
});
