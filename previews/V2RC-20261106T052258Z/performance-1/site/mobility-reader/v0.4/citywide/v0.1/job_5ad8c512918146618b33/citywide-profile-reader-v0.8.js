(function(root){'use strict';
if(!root.document||!(['localhost','127.0.0.1','::1','[::1]'].includes(root.location.hostname) || (root.location?.origin==='https://852lab.github.io' && root.location.pathname.startsWith('/Urban-Genetics-Atlas/previews/V2RC-20261106T052258Z/'))))return;
const VERSION='MOBILITY_CITYWIDE_FILTERS_V0_5',doc=root.document,base=new URL("https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/site/mobility-reader/v0.4/citywide/v0.1/job_5ad8c512918146618b33/"),ui=new URL('.',doc.currentScript.src),sourceId='ug-mobility-citywide-v01',layerId=sourceId+'-fill';
const bands=[50,100,200,500,1000,2000],families={bus:'Bus / feeder',minibus:'Minibus',rail:'Rail',tram:'Tram',ferry:'Ferry',peak:'Peak Tram'},labels=['Bus','Ferry','Minibus','Feeder bus','Peak Tram','Rail legacy','Rail provider','Tram'];
const colours=['#f6efdc','#d5edb3','#8ed1bb','#36b5b5','#2583bd','#23499a','#44206b'],nearColours=['#42206b','#23499a','#2583bd','#159a8c','#91b54b','#e0af40'],missing='#969fa3';
let map,pane,section,body,visible,styleMap,observer,data,summary,pending,bound=false,opened=false,needsPaint=false,painting=false,opacity=100,band=3,view='overall',family='rail',ticket=0,selectedId=null,selectedProfile=null,infoWrapped=false;
/* Add Mobility profile readings to the existing map source and legend. */
const trialViews = ['profile_connectivity','profile_mobility','profile_accessibility'];
const trialView = () => trialViews.indexOf(view);
const trial = () => trialView()>=0;
let trialMode='all',trialDistance=2,trialTime=0,roadMinutes=10;
const roadReadingsByView=['time','coverage','time'];
const roadReading=()=>roadReadingsByView[trialView()];
let trialReference,trialData,trialSource,trialStateKey;
let roadPaint=-1,roadDisplayKey,roadPreview,roadProgress,roadData,roadValidator,roadPending,roadLoad,roadTimer;
const roadPreviewSHA='3c1580fb00e9dd85620e8b5fb55d85a4bc2cbefaf0a84593b4e87f2d7fcb863f';
const roadPath=new URL("https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mobility-snapshots/2f5eb4e0ad1ca356da77fec700b18d1930d1ddd38e9bc9a8da86aede2f2b6aaf/");
const NO_NETWORK=-1,OUTSIDE_TIME=-2,AWAITING_REPLAY=-3,NO_ROAD_RESULT=-4,READING_UNAVAILABLE=-5;
const signature=()=>view==='signature_preview';
const signatureRoadTimes=[20,30,40,60];
const signatureRoles=['Tested CBD','Tested district centre','Airport Station','Lo Wu Station'];
const signatureLocalClasses=[
 [0,'#d5c9b1','Below both thresholds'],
 [1,'#d78f76','Wider reach enabled by rail'],
 [2,'#c29953','Wider reach on foot'],
 [3,'#4ca38b','Local provision'],
 [4,'#7660a4','Local provision and rail-enabled wider reach'],
 [5,'#235b87','Local provision and wider reach on foot'],
];
const signatureRoadClasses=[
 [0,'#d5c9b1','No tested centre or airport reached'],
 [1,'#44977b','CBD'],
 [2,'#caab5b','District centre'],
 [3,'#267c78','CBD and district centre'],
 [4,'#d78f76','Airport Station'],
 [5,'#8c5b98','CBD and Airport Station'],
 [6,'#528ec3','District centre and Airport Station'],
 [7,'#3b407d','CBD, district centre and Airport Station'],
 [NO_ROAD_RESULT,'#9eacb4','No usable road result'],
];
const SHAPE_UNASSESSED=-7,SIGNATURE_SCOPE_EXCLUDED=-8;
const signatureShapeBreaks=[40,60,75,85];
const signatureShapeClasses=[
 [0,'#e5b476','Highly concentrated · <40'],
 [1,'#b4ce92','Concentrated · 40–<60'],
 [2,'#66b9ad','Mixed spread · 60–<75'],
 [3,'#458db9','Broadly spread · 75–<85'],
 [4,'#344979','Evenly spread · 85–100'],
 [SHAPE_UNASSESSED,'#b9a8c0','Too few outer Hexes to assess shape'],
];
const compass=['N','NE','E','SE','S','SW','W','NW'];
let signatureData,signaturePending,signatureDisplay;
let signatureReading='profile',signatureMode='car',signatureMinutes=30,signatureProfileFilter='all';
const signatureFocused=()=>signature()&&signatureReading==='shape'&&signatureProfileFilter!=='all';
/* Road map scales are display bands shared by car and taxi. */
const roadBands=[5,10,15,20,30,40,50,60];
const roadPal=['#fbf5de','#dfedc9','#a7d8be','#64b6af','#3696a9','#306d99','#284e80','#1e315c'];
const scoreBreaks=[25,50,75];
const coverageClasses=[
 [AWAITING_REPLAY,'#d9c8ac','Awaiting road replay'],
 [NO_ROAD_RESULT,'#9eacb4','Checked · no usable road result'],
 [NO_NETWORK,'#d9dde0','No retained network start'],
 [READING_UNAVAILABLE,'#c59269','Selected reading unavailable'],
];
const roadContrast={
 5:[.02,.05,.1,.25,.5,1,2],
 10:[.1,.25,.5,1,2,4,8],
 15:[.5,1,3,5,8,12,18],
 20:[2,5,10,18,28,40,55],
 30:[10,20,30,40,50,60,70],
 40:[30,45,55,65,75,82,88],
 50:[50,65,75,80,84,87,90],
 60:[60,75,82,85,87,89,91],
};

function countAt(value,minutes) {
 if (!value) return null;
 const extra=[5,15].indexOf(minutes);
 return extra>=0 ? value.short_hex?.[extra]??null :
  value.hex?.[trialAPI().times.indexOf(minutes)]??null;
}

function roadScale() {
 const metric=trialView(), reading=roadReading();
 let breaks, colours=roadPal, label, unit, value;
 if (metric===0) {
  if (reading==='classes') {
   label='Road-class access score';
   breaks=[15,30,45,60,72,82,90];unit='/100';
   value=v=>trialAPI().scores(v,trialReference,'hex',trialMode,trialDistance,1)[0];
  } else {
   label='Time to a trunk road or motorway';
   breaks=[3,5,7,10,12,15,18];unit=' min';colours=[...roadPal].reverse();
   value=v=>{const t=v.roads.slice(2).filter(Number.isFinite);return t.length?Math.min(...t):OUTSIDE_TIME};
  }
 } else if (metric===1&&reading==='time') {
  label='Time to reach half of target Hexes';
  breaks=[20,25,30,35,40,45,50];unit=' min';colours=[...roadPal].reverse();
  value=v=>v.time_to_coverage ? v.time_to_coverage[1]??OUTSIDE_TIME : null;
 } else if (metric===1) {
  label='Target Hexes reachable within '+roadMinutes+' min';
  breaks=roadContrast[roadMinutes];unit='%';
  value=v=>{const n=countAt(v,roadMinutes);return n===null?null:100*n/trialReference.target_hexes};
 } else if (reading==='coverage') {
  label='Everyday choice within '+roadMinutes+' min';
  breaks=[1,2,4,6,8,10,12];unit='/12';
  value=v=>{
   const extra=[5,15].indexOf(roadMinutes);
   const counts=extra>=0?v.short_amenities?.[extra]:v.amenities?.[trialAPI().times.indexOf(roadMinutes)];
   return counts ? counts.reduce((n,count)=>n+Math.min(2,count),0) : null;
  };
 } else {
  label='Time to two choices in each amenity group';
  breaks=[8,10,12,15,18,22,30];unit=' min';colours=[...roadPal].reverse();
  value=v=>Object.hasOwn(v,'time_to_choice')?v.time_to_choice??OUTSIDE_TIME:null;
 }
 const lastMinute=metric===0?20:60;
 const limit=metric===0?'No match within 20 min':'Target not reached within 60 min';
 return {breaks,colours,label,unit,value,limit,lastMinute};
}

function roadBin(value,scale) {
 if (!Number.isFinite(value)) return READING_UNAVAILABLE;
 if (value===OUTSIDE_TIME) return OUTSIDE_TIME;
 return scale.breaks.filter(edge=>value>=edge).length;
}

function roadValue(id) {
 const saved=savedRoad(id,trialMode);
 return saved===undefined?trialAPI().valueFor(trialData,id,trialMode):saved;
}

function roadCategory(id,scale,value) {
 if (value) return roadBin(scale.value(value),scale);
 if (!Object.hasOwn(trialData.public,id)) return NO_NETWORK;
 return savedRoad(id,trialMode)===null?NO_ROAD_RESULT:AWAITING_REPLAY;
}

function roadLegendClasses(scale) {
 const format=n=>String(n)+scale.unit;
 const items=scale.colours.map((colour,i)=>{
  const lo=scale.breaks[i-1],hi=scale.breaks[i];
  const label=lo===undefined?'<'+format(hi):
   hi!==undefined?lo+'–<'+format(hi):
   scale.unit===' min'?lo+'–'+format(scale.lastMinute):
   scale.unit==='/12'?format(lo):'≥'+format(lo);
  return [i,colour,label];
 });
 if (scale.unit===' min') items.push([OUTSIDE_TIME,'#a48bbd',scale.limit]);
 items.push(...coverageClasses);
 return items;
}

function roadCellHTML(value) {
 if (!value) return '';
 const scale=roadScale(), measured=scale.value(value);
 if (!Number.isFinite(measured)) return '<p>This saved result has no value for the selected reading.</p>';
 if (measured===OUTSIDE_TIME) return '<p><b>'+esc(scale.limit)+'</b></p>';
 const rounded=scale.unit==='/12'?String(measured):Number(measured).toLocaleString('en-GB',{maximumFractionDigits:2});
 const count=scale.unit==='%'?' <span>'+fmt(countAt(value,roadMinutes))+' of '+fmt(trialReference.target_hexes)+'</span>':'';
 return '<p><b>'+esc(rounded+scale.unit)+'</b> · '+esc(scale.label)+count+'</p>';
}

function roadScope() {
 const mode=trialMode;
 const assessed=roadData?.assessed[mode]??0;
 const complete=roadData?.completed[mode]??0;
 const eligible=roadData?.eligible??trialReference.public_count;
 const pending=eligible-complete;
 return fmt(assessed)+' saved '+trialAPI().modes[mode].toLowerCase()+' readings. '+
  (pending?fmt(complete)+' of '+fmt(eligible)+' supported origins checked. '+fmt(pending)+' awaiting replay.':
   fmt(eligible)+' supported origins checked. Road replay complete for this mode.')+
  ' '+fmt(complete-assessed)+' checked without a usable road result. '+
  fmt(trialReference.mapped-eligible)+' mapped Hexes have no retained network start.';
}

function modeSettings() {
 const road=roadTrial(),metric=trialView(),select=pane.querySelector('[data-ugsp-road-reading]');
 const settings=metric===0?[['time','Trunk road or motorway time'],['classes','Road class score']]:
  metric===1?[['coverage','Coverage within time'],['time','Time to half of target Hexes']]:
  [['time','Time to everyday choice'],['coverage','Choice within time']];
 if (select.dataset.metric!==String(metric)) {
  select.innerHTML=settings.map(([key,label])=>'<option value="'+key+'">'+esc(label)+'</option>').join('');
  select.dataset.metric=String(metric);
 }
 select.value=roadReading();
 pane.querySelector('[data-ugsp-road-reading-wrap]').hidden=!road;
 pane.querySelector('[data-ugsp-road-time-wrap]').hidden=!road||metric===0||roadReading()!=='coverage';
 pane.querySelector('[data-ugsp-road-time]').value=String(roadMinutes);
 pane.querySelector('[data-ugsp-map-time-wrap]').hidden=road||metric===0;
}

const roadTrial=()=>trial()&&trialAPI().isRoad(trialMode);

function analysisInsertionPoint() {
 const overlays=['ug-native-network-reach-lines','ug-road-network-lines','ug-road-facilities-points',
  'ug-native-destination-records-points','ug-native-destination-records-points-clusters'];
 const layers = map.getStyle().layers;
 const anchor = layers.find(layer => overlays.includes(layer.id) ||
  (layer.type === 'line' && layer.id.startsWith('road_')));
 return anchor?.id ?? layers.find(layer => layer.type === 'symbol')?.id;
}

function trialAPI() {
 return root.UGA_V2_MOBILITY_PROFILES.signature;
}

async function loadTrial() {
 if (!trialData) {
  const api=trialAPI();
  [trialReference,trialData]=await Promise.all([api.loadReferences(),api.loadRecords()]);
 }
 if (roadTrial()) await loadRoadData();
}

function loadRoadData() {
 if (!roadLoad) {
  const api=trialAPI();
  roadLoad=api.loadReferences().then(async ref=>{
   trialReference=ref;
   const preview=json(new URL('road-citywide-expanded.json',roadPath),roadPreviewSHA).then(validRoadProgress);
   const progress=refreshProgress().catch(()=>false);
   roadPreview=await preview;
   await progress;
   mergeRoadCoverage();
  }).catch(error=>{roadLoad=null;throw error});
 }
 return roadLoad;
}

// A complete road pair in the newer replay already has final precedence.
async function loadRoadCell(id) {
 if(roadData)return;
 trialReference=await trialAPI().loadReferences();
 await refreshProgress().catch(()=>false);
 const row=roadProgress?.records[id];
 if(row?.car!=null && row?.taxi!=null)return;
 await loadRoadData();
}

function savedRoad(id,mode) {
 return roadData ? roadData.records[id]?.[mode] : roadProgress?.records[id]?.[mode] ?? undefined;
}

function validRoadProgress(next) {
 if (next?.version!=='MOBILITY_ROAD_CITYWIDE_V0_1'||next.eligible!==trialReference.public_count||
     !['preview','running','complete'].includes(next.status)||!next.records||
     !['car','taxi'].every(mode=>Number.isInteger(next.completed?.[mode])&&
       Number.isInteger(next.assessed?.[mode])&&next.assessed[mode]>=0&&
       next.completed[mode]>=next.assessed[mode]&&next.completed[mode]<=next.eligible&&
       (next.status!=='complete'||next.completed[mode]===next.eligible))) {
  throw Error('Road replay coverage differs.');
 }
 return next;
}

function mergeRoadCoverage() {
 const records={...roadPreview.records};
 for (const [id,row] of Object.entries(roadProgress?.records??{})) {
  const previous=records[id]??{};
  const combined={...previous};
  for (const mode of ['car','taxi']) {
   if (Object.hasOwn(row,mode)) combined[mode]=row[mode]??previous[mode]??null;
  }
  records[id]=combined;
 }
 const completed={car:0,taxi:0},assessed={car:0,taxi:0};
 for (const row of Object.values(records)) {
  for (const mode of ['car','taxi']) {
   if (Object.hasOwn(row,mode)) {
    completed[mode]++;
    if (row[mode]!==null) assessed[mode]++;
   }
  }
 }
 roadData={records,completed,assessed,eligible:roadPreview.eligible};
 roadDisplayKey=null;
}

async function refreshProgress() {
 if (roadProgress) return false;
 if (roadPending) return roadPending;
 roadPending=(async()=>{
  const headers=roadValidator?{[roadValidator.request]:roadValidator.value}:{};
  const response=await root.fetch(new URL('road-citywide-progress.json',roadPath),{cache:'no-store',headers});
  if (response.status===404||response.status===304) return false;
  if (!response.ok) throw Error('Road replay HTTP '+response.status);
  const etag=response.headers.get('ETag'),modified=response.headers.get('Last-Modified');
  const validator=etag?{request:'If-None-Match',value:etag}:
   modified?{request:'If-Modified-Since',value:modified}:null;
  if (validator&&validator.request===roadValidator?.request&&validator.value===roadValidator.value) return false;
  const next=validRoadProgress(await response.json());
  if (roadProgress&&['car','taxi'].some(mode=>next.completed[mode]<roadProgress.completed[mode])) return false;
  const changed=!roadProgress||next.status!==roadProgress.status||validator!==null||['car','taxi'].some(mode=>
   next.completed[mode]!==roadProgress.completed[mode]||next.assessed[mode]!==roadProgress.assessed[mode]);
  if (changed) {
   roadProgress=next;
   if(roadPreview)mergeRoadCoverage();
  }
  roadValidator=validator;
  return changed;
 })().finally(()=>{roadPending=null});
 return roadPending;
}

function watchRoadReplay() {
 root.clearTimeout(roadTimer);
 if (!opened||!roadTrial()||roadProgress) return;
 roadTimer=root.setTimeout(async()=>{
  try {
   if (await refreshProgress()&&opened&&roadTrial()) {
    paint();
    if (selectedId) trialCell(selectedId,false);
   }
  } catch (error) {
   if (opened&&roadTrial()) status(error.message);
  }
  watchRoadReplay();
 },30000);
}

function trialCategory() {
 if (roadTrial()) return roadPaint;
 const score=['number',['feature-state','ugMobilityProfile'],NO_NETWORK];
 return ['case',['<',score,0],score,['==',score,0],0,
  ['step',score,1,...scoreBreaks.flatMap((edge,i)=>[edge,i+2])]];
}

function trialLegendClasses() {
 if (roadTrial()) return roadLegendClasses(roadScale());
 const api=trialAPI(), labels=['0','>0–<25','25–<50','50–<75','75–100'];
 return [...api.steps.map((colour,i)=>[i,colour,labels[i]]),
  [NO_NETWORK,api.missing,'No retained network start'],[READING_UNAVAILABLE,'#c59269','Selected reading unavailable']];
}

function trialFill() {
 const classes=trialLegendClasses();
 return ['match',trialCategory(),...classes.flatMap(([id,colour])=>[id,colour]),trialAPI().missing];
}

function trialState() {
 if (!map||!data||!trialData||roadTrial()) return;
 if (!map.getSource(sourceId)&&!map.isStyleLoaded()) return;
 if (!map.getSource(sourceId)) map.addSource(sourceId,{type:'geojson',data,generateId:false,promoteId:'hex_id'});
 const source=map.getSource(sourceId), metric=trialView();
 const key=[metric,trialMode,trialDistance,trialTime].join('|');
 if (trialSource===source&&trialStateKey===key) return;
 const api=trialAPI();
 for (const id of Object.keys(trialData.public)) {
  const value=api.valueFor(trialData,id,trialMode);
  const score=api.scores(value,trialReference,'hex',trialMode,trialDistance,trialTime)[metric];
  map.setFeatureState({source:sourceId,id},{ugMobilityProfile:score??READING_UNAVAILABLE});
 }
 trialSource=source;
 trialStateKey=key;
}

function roadReadings() {
 const key=[trialView(),trialMode,roadMinutes,roadReading()].join('|');
 if (roadDisplayKey===key) return;
 const scale=roadScale();
 const ids=new Set([...Object.keys(trialData.public),...Object.keys(trialData.road)]);
 for (const row of root.UGA_V2_MOBILITY_NETWORK?.cachedRoadHexes(trialMode)??[]) ids.add(row.id);
 const matches=new Map();
 for (const id of ids) {
  const value=roadValue(id);
  const bin=roadCategory(id,scale,value);
  if (bin===NO_NETWORK) continue;
  if (!matches.has(bin)) matches.set(bin,[]);
  matches.get(bin).push(id);
 }
 roadPaint=matches.size?['match',['to-string',['get','hex_id']],
  ...[...matches].flatMap(([bin,ids])=>[ids,bin]),NO_NETWORK]:NO_NETWORK;
 roadDisplayKey=key;
}

function refreshRoad(mode) {
 roadDisplayKey=null;
 if (trialMode!==mode||!opened||!trial()) return;
 paint();
 if (selectedId) trialCell(selectedId,false);
}

function trialLegend() {
 if (!pane) return;
 pane.querySelector('[data-ugsp-map]').hidden=false;
 pane.querySelector('[data-band-wrap]').hidden=true;
 pane.querySelector('[data-time-wrap]').hidden=true;
 pane.querySelector('[data-family-wrap]').hidden=true;
 const road=roadTrial();
 pane.querySelector('[data-ugsp-map-distance-wrap]').hidden=trialView()!==0||road;
 modeSettings();
 if (!trialReference) {
  pane.querySelector('[data-legend]').textContent='';
  pane.querySelector('[data-scope]').textContent='';
  pane.querySelector('[data-summary]').textContent='';
  return;
 }
 const reading=trialAPI().legend(trialReference,trialMode,trialView(),trialDistance,trialTime);
 const title=road?roadScale().label:reading.title+' · score /100';
 pane.querySelector('[data-legend]').innerHTML='<strong>'+esc(title)+'</strong><div class="ugc-legend"></div>';
 const targets=trialReference.target_hexes;
 pane.querySelector('[data-scope]').textContent=road?
  (trialView()===1?(roadReading()==='time'?fmt(targets/2)+' of ':'')+fmt(targets)+' target Hexes.':''):
  reading.note;
 pane.querySelector('[data-summary]').textContent=road?roadScope():
  fmt(trialReference.public_count)+' origins with retained network starts. '+
  fmt(trialReference.mapped-trialReference.public_count)+' mapped Hexes have no retained network start.';
 root.UGARefreshOpenInfoPanel?.();
}

async function trialCell(id,loadPlace=true) {
 if (!trialData||!trialReference||!pane) return;
 const api=trialAPI(), mode=trialMode, value=roadTrial()?roadValue(id):api.valueFor(trialData,id,mode);
 const place={grain:'hex',id}, host=pane.querySelector('[data-place]');
 const network=root.UGA_V2_MOBILITY_NETWORK;
 const heading=cellHeading(id);
 const saved=savedRoad(id,mode)!==undefined||Object.hasOwn(trialData.road,id)||network?.cachedSignature(place,'hex',mode);
 const eligible=api.isRoad(mode)&&!saved&&Object.hasOwn(trialData.public,id);
 const target=network?.state().target;
 const active=()=>opened&&trial()&&mode===trialMode&&id===selectedId;
 if (value||!eligible||!loadPlace||target?.grain!=='hex'||target.id!==id) {
   const supported=Object.hasOwn(trialData.public,id);
   if (value&&roadTrial()) host.innerHTML=heading+roadCellHTML(value);
   else if (value) {
    const score=api.scores(value,trialReference,'hex',mode,trialDistance,trialTime)[trialView()];
    host.innerHTML=heading+(score===null?'<p>This Hex has no value for the selected reading.</p>':
     api.cell(value,trialReference,mode,trialView(),trialDistance,trialTime));
   } else if (!supported) host.innerHTML=heading+'<p>No retained network start for this Hex.</p>';
   else host.innerHTML=heading+(savedRoad(id,mode)===null?
    '<p>The replay checked this Hex and returned no usable road result.</p>':
    '<p>This Hex is awaiting the road replay.</p>');
  return;
 }
 host.innerHTML=heading+'<p>Calculating '+esc(api.modes[mode].toLowerCase())+' reach…</p>';
 try {
  await network.signatureReading(place,'hex',mode,active);
  if (active()) trialCell(id,false);
 } catch (error) {
  if (active()) host.innerHTML=heading+'<p>'+esc(error.message)+'</p>';
 }
}

async function trialChanged() {
 root.UGA_V2_MOBILITY_PROFILES.clearDestinations();
 const current=++ticket;
 legend();
 if (!opened) {
  pane.querySelector('[data-place]').textContent='Switch on the Mobility map to inspect cells.';
  return;
 }
 if (map?.getLayer(layerId)) map.setLayoutProperty(layerId,'visibility','none');
 status('Loading Mobility profile readings…');
 try {
  await load();
  await loadTrial();
  if (current!==ticket||!opened||!trial()) return;
  paint();
  if (selectedId) trialCell(selectedId);
  else pane.querySelector('[data-place]').textContent='Click a cell to see its reading.';
  watchRoadReplay();
 } catch (error) {
  if (current===ticket) status(error.message);
 }
}

function trialControls() {
 const api=trialAPI();
 const reading=pane.querySelector('[data-view]');
 reading.options[0].textContent='Mode breadth · all assessed modes';
 for (const [i,id] of trialViews.entries()) {
  reading.add(new root.Option('Overall '+api.titles[i],id),i);
 }
 reading.add(new root.Option('Mobility Signature · preview','signature_preview'),trialViews.length);
 reading.value=view;
 const wrap=doc.createElement('div');
 wrap.className='ugsp-map-controls';
 wrap.setAttribute('data-ugsp-map','');
 wrap.hidden=true;
 const options=(entries,current)=>entries.map(([v,label])=>'<option value="'+v+'"'+(v===current?' selected':'')+'>'+
  esc(label)+'</option>').join('');
 wrap.innerHTML='<label>Travel mode<select data-ugsp-map-mode>'+options(Object.entries(api.modes),trialMode)+'</select></label>'+
  '<label data-ugsp-map-distance-wrap>Walk to services<select data-ugsp-map-distance>'+
  options(api.distances.map((v,i)=>[i,v+' m']),trialDistance)+'</select></label>'+
  '<label data-ugsp-map-time-wrap>Journey time<select data-ugsp-map-time>'+
  options(api.times.map((v,i)=>[i,v+' min']),trialTime)+'</select></label>'+
  '<label data-ugsp-road-reading-wrap hidden>Road reading<select data-ugsp-road-reading></select></label>'+
  '<label data-ugsp-road-time-wrap hidden>Journey time<select data-ugsp-road-time>'+
  options(roadBands.map(v=>[v,v+' min']),roadMinutes)+'</select></label>';
 pane.querySelector('[data-legend]').before(wrap);
 wrap.querySelector('[data-ugsp-map-mode]').onchange=e=>{trialMode=e.target.value;trialChanged()};
 wrap.querySelector('[data-ugsp-road-reading]').onchange=e=>{
  roadReadingsByView[trialView()]=e.target.value;
  trialChanged();
 };
 wrap.querySelector('[data-ugsp-road-time]').onchange=e=>{roadMinutes=Number(e.target.value);trialChanged()};
 wrap.querySelector('[data-ugsp-map-distance]').onchange=e=>{trialDistance=Number(e.target.value);trialChanged()};
 wrap.querySelector('[data-ugsp-map-time]').onchange=e=>{trialTime=Number(e.target.value);trialChanged()};
}

function mountSignatureControls() {
 const controls=doc.createElement('div');
 controls.className='ugsp-map-controls';
 controls.setAttribute('data-ugc-signature-controls','');
 controls.hidden=true;
 controls.innerHTML='<label>Signature reading<select data-ugc-signature-reading>'+
  '<option value="profile">Local provision and wider reach</option>'+
  '<option value="shape">Walking catchment shape</option>'+
  '<option value="road">Road destinations</option></select></label>'+
  '<label data-ugc-signature-focus-wrap hidden>Compare within profile<select data-ugc-signature-focus>'+
  '<option value="all">All profiles</option>'+
  signatureLocalClasses.map(([id,,label])=>'<option value="'+id+'">'+esc(label)+'</option>').join('')+
  '</select></label>'+
  '<label data-ugc-signature-road>Road mode<select data-ugc-signature-mode>'+
  '<option value="car">Private car</option><option value="taxi">Taxi</option></select></label>'+
  '<label data-ugc-signature-budget>Elapsed journey time<select data-ugc-signature-minutes>'+
  signatureRoadTimes.map(n=>'<option value="'+n+'"'+(n===30?' selected':'')+'>'+n+' min</option>').join('')+
  '</select></label>';
 pane.querySelector('[data-legend]').before(controls);
 controls.querySelector('[data-ugc-signature-reading]').onchange=e=>{signatureReading=e.target.value;updateSignature()};
 controls.querySelector('[data-ugc-signature-focus]').onchange=e=>{signatureProfileFilter=e.target.value;updateSignature()};
 controls.querySelector('[data-ugc-signature-mode]').onchange=e=>{signatureMode=e.target.value;updateSignature()};
 controls.querySelector('[data-ugc-signature-minutes]').onchange=e=>{signatureMinutes=Number(e.target.value);updateSignature()};
}

function loadSignature() {
 if (!signaturePending) {
  signaturePending=json(new URL('signature-map-preview-9d2bdc0564ebbc5e.json',roadPath),'9d2bdc0564ebbc5e89001369e695870af16a7e91adcd8d171839e584dc0f3fa8').then(value=>{
   if (value.version!=='MOBILITY_SIGNATURE_MAP_PREVIEW_V0_2'||value.mapped!==84877||
       value.origins!==40146||Object.keys(value.records??{}).length!==value.origins) {
    throw Error('Saved Signature preview scope differs.');
   }
   signatureData=value;
   signatureDisplay=null;
  }).catch(error=>{signaturePending=null;throw error});
 }
 return signaturePending;
}

function signatureKey() {
 if (signatureReading==='profile') return 'profile';
 if (signatureReading==='shape') return 'shape|'+signatureProfileFilter;
 return signatureMode+'|'+signatureMinutes;
}

function signatureCategory(record) {
 if (!record) return NO_NETWORK;
 if (signatureReading==='profile') return record[0];
 if (signatureReading==='shape') {
  if (signatureFocused()&&String(record[0])!==signatureProfileFilter) return SIGNATURE_SCOPE_EXCLUDED;
  const spread=record[7][1];
  return spread===null?SHAPE_UNASSESSED:signatureShapeBreaks.filter(edge=>spread>=edge).length;
 }
 const roleBands=record[signatureMode==='car'?5:6];
 if (!roleBands) return NO_ROAD_RESULT;
 let code=0;
 for (let i=0;i<3;i++) if (roleBands[i]!==null&&roleBands[i]<=signatureMinutes) code|=1<<i;
 return code;
}

function signatureMap() {
 const key=signatureKey();
 if (signatureDisplay?.key===key) return signatureDisplay;
 const groups=new Map();
 for (const [id,record] of Object.entries(signatureData?.records??{})) {
  const code=signatureCategory(record);
  if (code===SIGNATURE_SCOPE_EXCLUDED) continue;
  if (!groups.has(code)) groups.set(code,[]);
  groups.get(code).push(id);
 }
 const fallback=signatureFocused()?SIGNATURE_SCOPE_EXCLUDED:NO_NETWORK;
 const category=groups.size
  ?['match',['to-string',['get','hex_id']],...[...groups].flatMap(([code,ids])=>[ids,code]),fallback]
  :fallback;
 return signatureDisplay={key,category,groups};
}

function signatureLegendClasses() {
 const source=signatureReading==='profile'?signatureLocalClasses:
  signatureReading==='shape'?signatureShapeClasses:signatureRoadClasses;
 const {groups}=signatureMap();
 const classes=source.filter(([code])=>groups.has(code));
 if(!signatureFocused()) classes.push([NO_NETWORK,'#d9dde0','Outside assessed origin frame']);
 return classes;
}

function signatureHelp() {
 return infoSection('Mobility Signature preview',
  '<p>Local provision uses four of six everyday groups within 20 minutes on foot. Wider reach uses 971 target '+
  'Hexes within 30 minutes. The preview distinguishes reaching that threshold on foot from crossing it with rail.</p>'+
  '<p>Walking catchment shape measures how evenly the 10-minute walking reach spreads around a Hex. It uses reached '+
  'Hex centres at least 200 m away. A low score marks a reach concentrated to one side or along an axis. '+
  'Shape is assessed where at least eight outer Hexes are reached.</p>'+
  '<p>Road destinations use Central and Kowloon East as the tested CBDs, five modelled town centres and Airport Station. '+
  'A destination combination includes only targets reached within the selected elapsed time. Taxi includes five minutes '+
  'of modelled waiting. Lo Wu appears separately in the Hex details as a station target.</p>');
}

function signatureTitle() {
 if (signatureReading==='profile') return 'Local provision and wider reach';
 if (signatureReading==='shape') return 'Walking catchment shape · 10 min';
 const mode=signatureMode==='car'?'Private car':'Taxi';
 return mode+' destinations within '+signatureMinutes+' min';
}

function signatureLegend() {
 for (const name of ['band','time','family']) pane.querySelector('[data-'+name+'-wrap]').hidden=true;
 const controls=pane.querySelector('[data-ugc-signature-controls]');
 const showRoad=signatureReading==='road';
 const showShape=signatureReading==='shape';
 controls.querySelector('[data-ugc-signature-road]').hidden=!showRoad;
 controls.querySelector('[data-ugc-signature-budget]').hidden=!showRoad;
 controls.querySelector('[data-ugc-signature-focus-wrap]').hidden=!showShape;
 pane.querySelector('[data-legend]').innerHTML='<strong>'+esc(signatureTitle())+'</strong><div class="ugc-legend"></div>';
 pane.querySelector('[data-scope]').textContent=showRoad
  ?'Selected CBDs, district centres and Airport Station. Taxi includes five minutes of modelled waiting.'
  :showShape?'Directional spread of reached Hexes at least 200 m from the origin Hex centre.'
   :'Four of six everyday groups in a 20-minute walk. Wider reach starts at 971 Hexes within 30 minutes.';
 const coverage=signatureData;
 const usable=coverage?.assessed[signatureMode];
 let summaryText='';
 if (coverage) {
  if (signatureFocused()) {
   const count=[...signatureMap().groups.values()].reduce((n,ids)=>n+ids.length,0);
   summaryText=fmt(count)+' origins in this profile';
  } else {
   summaryText=fmt(showRoad?usable:coverage.origins)+(showShape?' origins assessed for walking reach':' origins with results')+
    ' · '+fmt(coverage.mapped-coverage.origins)+' outside the assessed frame';
  }
 }
 pane.querySelector('[data-summary]').textContent=summaryText;
 root.UGARefreshOpenInfoPanel?.();
}

function signatureShapeText([outer,spread,kind,heading]) {
 const scope=fmt(outer)+' Hexes at least 200 m away within a 10-minute walk';
 if (spread===null) return '<p><b>Walking catchment shape</b> · '+scope+'. Too few to assess shape.</p>';
 let direction='';
 if (spread<60) direction=kind==='side'?' · Leans '+compass[heading]:' · '+compass[heading]+'–'+compass[heading+4]+' axis';
 return '<p><b>Walking spread '+fmt(spread)+' / 100</b>'+direction+'<br>'+scope+'</p>';
}

function signatureCell(id) {
 const host=pane.querySelector('[data-place]');
 const heading=cellHeading(id);
 const row=signatureData?.records[id];
 if (!signatureData) {host.innerHTML=heading+'<p>Loading the saved Signature preview…</p>';return}
 if (signatureFocused()&&String(row?.[0])!==signatureProfileFilter) {
  host.textContent='Select a Hex in this profile to see its walking catchment.';
  return;
 }
 if (!row) {host.innerHTML=heading+'<p>Outside the assessed origin frame.</p>';return}
 const [code,groups,families,walk,rail,car,taxi,shape]=row;
 const roadBand=(bands,i)=>bands===null?'No result':bands[i]===null?'—':'≤'+bands[i]+' min';
 const rows=signatureRoles.map((role,i)=>'<tr><th scope="row">'+esc(role)+'</th><td>'+
  roadBand(car,i)+'</td><td>'+roadBand(taxi,i)+'</td></tr>').join('');
 host.innerHTML=heading+'<p><strong>'+esc(signatureLocalClasses[code][2])+'</strong></p>'+
  '<div class="ugc-signature-facts"><p><b>'+groups+' / 6</b> everyday groups on foot within 20 min</p>'+
  '<p><b>'+families+' / 7</b> mode families within 200 m</p>'+
  '<p><b>'+fmt(walk)+'</b> Hexes walking · <b>'+fmt(rail)+'</b> walk + rail within 30 min</p>'+
  '<p><b>+'+fmt(rail-walk)+'</b> Hexes from rail at 30 min</p>'+signatureShapeText(shape)+'</div>'+
  '<details open><summary>First elapsed band to a tested destination</summary>'+
  '<table class="ugc-signature-targets"><thead><tr><th scope="col">Destination</th><th scope="col">Car</th>'+
  '<th scope="col">Taxi</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<p class="ugc-note">A dash means the tested destination was outside the saved 60-minute reach.</p></details>';
}

async function updateSignature() {
 const current=++ticket;
 legend();
 if (!opened) return;
 if (!signatureData) {
  if (map?.getLayer(layerId)) map.setLayoutProperty(layerId,'visibility','none');
  status('Loading the saved Mobility Signature preview…');
 }
 try {
  await load();
  await loadSignature();
  if (!opened||!signature()||current!==ticket) return;
  paint();
  if (selectedId) signatureCell(selectedId);
  else pane.querySelector('[data-place]').textContent='Click a Hex to see its Signature traits.';
 } catch (error) {
  if (current===ticket) status(error.message);
 }
}

const routeColours=['#f6efdc','#d5edb3','#8ed1bb','#36b5b5','#2583bd','#23499a','#44206b','#25113e'],routeBreaks=[1,5,10,25,50,100,200],routeLabels=['0','1–4','5–9','10–24','25–49','50–99','100–199','200+'],routeUnresolved='#c7a36b';let routeData=null,routePending=null,selectedService=null;
function routeBin(v){return routeBreaks.filter(b=>v>=b).length}
async function loadRoutes(){if(routeData)return;if(routePending)return routePending;routePending=(async()=>{let d=await root.UGA_V2_MOBILITY_PROFILES.citywideServices();for(let f of data.features){let v=d.records[String(f.properties.hex_id)];if(v===undefined||v!==null&&(!Array.isArray(v)||v.length!==2||!v.every(a=>Array.isArray(a)&&a.length===6&&a.every(n=>Number.isInteger(n)&&n>=0))))throw Error('Service map cell values differ');for(let b=0;b<6;b++){f.properties['sr'+b]=v===null?-1:v[0][b];f.properties['su'+b]=v===null?-1:v[1][b]}}routeData=d;map?.getSource(sourceId)?.setData?.(data)})().catch(e=>{routePending=null;routeData=null;throw e});return routePending}
function routeHelp(){return infoSection('SERVICE ROUTES WITHIN WALKING REACH','<p>Counts distinct retained GTFS route IDs reached through an exactly matched native stop pattern, with a matching source pickup role and at least one later destination with a matching drop-off role. Several nearby stops or directions of one route count once. Joint-operation namespaces remain intact.</p><p>Five mapped service families: bus including TD feeder references, minibus, ferry, tram and Peak Tram. Rail has a separate main/Light Rail source-potential reading; the separate MTR feeder namespace remains unresolved. Existing six-family mode connectivity is a different reading.</p><p>This uses the existing cell starting positions and walking-network bands. The snapshot is not filtered by date or time; it is not independent service choice, operating frequency, travel time or a weighted strength score.</p><p>Amber means no mapped qualifying route at this band while service-link evidence is unresolved. Positive counts can also have unresolved evidence; click a cell to inspect it. Grey means no assessed network start. None of these states establishes physical transport absence.</p>')}
function routeCellHTML(p){if(!p)return '<p>Loading service-route profile…</p>';if(!p.assessed)return '<p>Service routes remain unassessed: no recorded network start is retained.</p>';let row=p.routes[band],max=Math.max(1,...row),u=p.unresolved[band].reduce((a,b)=>a+b,0),names=['Bus / feeder','Minibus','Ferry','Tram','Peak Tram'];return '<p><strong>Source route IDs within '+fmt(bands[band])+' m</strong></p>'+row.map((n,i)=>'<div class="ugc-row"><span>'+names[i]+'</span><i style="width:'+(n/max*110)+'px"></i><b>'+fmt(n)+'</b></div>').join('')+'<p class="ugc-note">Several stops serving one route count once. '+fmt(u)+' reached reference records have unresolved service links. Rail has a separate main/Light Rail source-potential reading. No date/time filtering or operating-service claim.</p>'}

let railData=null,railPending=null;const isRail=()=>['rail_stations','rail_lines','rail_onward'].includes(view),railMetric=()=>view==='rail_lines'?1:view==='rail_onward'?2:0,railBreaks=()=>railMetric()===2?[1,10,25,50,75,90]:[1,2,3,4,6,8],railLabels=()=>railMetric()===2?['0','1–9','10–24','25–49','50–74','75–89','90+']:['0','1','2','3','4–5','6–7','8+'];
async function loadRails(){if(railData)return;if(railPending)return railPending;railPending=(async()=>{let d=await root.UGA_V2_MOBILITY_PROFILES.railCity();for(let f of data.features){let v=d.records[String(f.properties.hex_id)];if(v===undefined||v!==null&&(!Array.isArray(v)||v.length!==4||!v.every(a=>Array.isArray(a)&&a.length===6&&a.every(n=>Number.isInteger(n)&&n>=0))))throw Error('Rail map cell differs');for(let b=0;b<6;b++){for(let g=0;g<3;g++)f.properties['rp'+g+'b'+b]=v===null?-1:v[g][b];f.properties['ru'+b]=v===null?-1:v[3][b]}}railData=d;map?.getSource(sourceId)?.setData?.(data)})().catch(e=>{railPending=null;railData=null;throw e});return railPending}
function distanceValue(p){if(!isRail())return nativeValue(p);let n=Number(p['rp'+railMetric()+'b'+band]);return n===0&&Number(p['ru'+band])>0?-2:n}
function distanceColour(p){if(!isRail())return nativeColour(p);let n=value(p);return n===-2?routeUnresolved:n<0?missing:colours[railBreaks().filter(v=>n>=v).length]}
function distanceExpression(){if(!isRail())return nativeExpression();let key='rp'+railMetric()+'b'+band;return ['case',['<',['get',key],0],missing,['all',['==',['get',key],0],['>',['get','ru'+band],0]],routeUnresolved,['step',['get',key],colours[0],...railBreaks().flatMap((n,i)=>[n,colours[i+1]])]]}
function distanceTitle(){return isRail()?['Main + Light Rail station/stop codes','Main + Light Rail lines/routes','Direct onward rail station/stop codes'][railMetric()]+' · '+fmt(bands[band])+' m source-network reach':nativeTitle()}
function distanceRows(){if(!isRail())return nativeRows();if(!railData)return null;let h=railData.histograms[railMetric()][band];return {counts:[...h,railData.unresolved_only[railMetric()][band]],labels:[...railLabels(),'No source match; unmapped terminal'],denominator:railData.assessed,unknown:railData.unassessed}}
function railHelp(){return infoSection('RAIL SOURCE POTENTIAL',"<p>Combines native station-related path intervals and the previously retained named entrance candidates. Covers the saved 97 main-rail station codes and 68 Light Rail stop codes. The paths retain their original levels; no transfer edge is added.</p><p>Station and stop counts are distinct within their source namespaces. Lines/routes and strictly later direct destinations describe published source order, without a transfer or time model. Main rail and Light Rail are summed in these map views and shown separately in each place reading.</p><p>Zero distance may mean a starting position lies on a station-related path, not that boarding is immediate. Building approach gaps remain separate. Grey means no assessed network start; amber means no qualifying rail result while an unmapped native rail context is reached. A zero does not prove rail is absent. Entrance identity, physical/public/step-free passage, operating service and journey times remain unverified.</p>")}
function distanceInformation(key){if(isRail()&&key!=='mobility:distance')return {title:'Mobility · rail potential',html:(key==='mobility:distribution'?distributionHTML():'')+railHelp()};return nativeInformation(key)}
function distanceLegend(){nativeLegend();if(!isRail()||!pane)return;let items=[...colours.map((c,i)=>[c,railLabels()[i]]),[routeUnresolved,'No source match; unmapped terminal'],[missing,'Unassessed']];pane.querySelector('[data-legend]').innerHTML='<div class="ugc-label-row"><strong>'+esc(title())+'</strong>'+helpButton('mobility:reading','About conditional rail potential')+'</div><div class="ugc-legend">'+items.map(([c,label])=>'<span><i style="background:'+c+'"></i>'+esc(label)+'</span>').join('')+'</div>';pane.querySelector('[data-band-wrap]').hidden=false;pane.querySelector('[data-scope]').textContent='Combined main-rail and Light Rail source potential. Physical boarding, transfers and time remain unassessed.';root.UGARefreshOpenInfoPanel?.()}
function distancePaint(){if(isRail()&&!railData){legend();if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading the conditional rail reading…');return}nativePaint()}
function destinationLauncher(host){let box=doc.createElement('div');box.innerHTML='<button type="button" data-surface-explore>Explore direct surface destinations</button><div data-surface-destinations></div>';host.appendChild(box);box.querySelector('[data-surface-explore]').onclick=async()=>{let current=ticket,id=selectedId,b=band,active=()=>current===ticket&&opened&&id===selectedId&&b===band,target=box.querySelector('[data-surface-destinations]');target.innerHTML='';try{await root.UGA_V2_MOBILITY_PROFILES.surfaceDestinations(target,id,b,active)}catch(e){if(active())target.textContent='Surface destination reading unavailable: '+e.message}}}
function distanceRenderProfile(r){root.UGA_V2_MOBILITY_PROFILES.clearDestinations();if(!isRail()){nativeRenderProfile(r);let host=pane?.querySelector('[data-place]');if(host)destinationLauncher(host);return}let current=ticket,id=selectedId,v=view,b=band,host=pane.querySelector('[data-place]');host.innerHTML=cellHeading(id)+'<p>Loading rail source potential…</p>';Promise.all([root.UGA_V2_MOBILITY_PROFILES.railProfile('hex',id),root.UGA_V2_MOBILITY_PROFILES.railCatalogue()]).then(([p,c])=>{if(current!==ticket||!opened||id!==selectedId||v!==view||b!==band)return;root.UGA_V2_MOBILITY_PROFILES.railCheck(p,c);host.innerHTML=cellHeading(id)+root.UGA_V2_MOBILITY_PROFILES.railHTML(p,c,b);destinationLauncher(host)}).catch(e=>{if(current===ticket&&opened)host.innerHTML='<p>Rail reading unavailable: '+esc(e.message)+'</p>'})}
async function distanceChanged(){root.UGA_V2_MOBILITY_PROFILES.clearDestinations();if(!isRail())return nativeChanged();let current=++ticket;if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading and checking rail values…');try{await load();await loadRails()}catch(e){if(current===ticket){close();status('Rail reading unavailable: '+e.message)}return}if(current!==ticket)return;paint();if(selectedProfile)renderProfile(selectedProfile);else if(selectedId&&opened)selectCell(selectedId)}

const isTime=()=>['rail_time_main','rail_time_light','rail_time_all'].includes(view),timeGroup=()=>view==='rail_time_light'?1:view==='rail_time_all'?2:0,timeLimits=[1,10,25,40,60,80],timeLabels=['0','1–9','10–24','25–39','40–59','60–79','80+'];let timeBand=2,timeData=null,timePending=null,timeStateKey=null,timeStateSource=null;
function timeCount(r,g=timeGroup(),b=timeBand){if(!r)return null;let a=r.counts[b];if(g<2)return a[g];return a.every(v=>v===null)?null:a.reduce((n,v)=>n+(v===null?0:v),0)}
async function loadTimes(){if(timeData)return;if(timePending)return timePending;timePending=root.UGA_V2_MOBILITY_PROFILES.timeCity().then(d=>{for(let f of data.features){let r=d.records[String(f.properties.hex_id)];if(r===undefined||r!==null&&(!Array.isArray(r.counts)||r.counts.length!==12||r.counts.some(a=>!Array.isArray(a)||a.length!==2||a.some((v,f)=>v!==null&&(!Number.isInteger(v)||v<0||v>[97,68][f])))))throw Error('Time map cell differs')}timeData=d}).catch(e=>{timePending=null;throw e});return timePending}
function timeState(){if(!map||!data||!timeData||!map.isStyleLoaded())return;if(!map.getSource(sourceId))map.addSource(sourceId,{type:'geojson',data,generateId:false,promoteId:'hex_id'});let source=map.getSource(sourceId),key=view+'|'+timeBand;if(source===timeStateSource&&key===timeStateKey)return;for(let f of data.features){let r=timeData.records[String(f.properties.hex_id)];if(r!==null)map.setFeatureState({source:sourceId,id:f.properties.hex_id},{nominal_time:timeCount(r)??-1})}timeStateKey=key;timeStateSource=source}
const timeStateValue=()=>['coalesce',['feature-state','nominal_time'],-1];
function timeCategory(){let n=timeStateValue();return ['case',['<',n,0],-1,['step',n,0,...timeLimits.flatMap((v,i)=>[v,i+1])]]}
function timeHelp(){return infoSection('WALKING + RAIL TIME POTENTIAL','<p>How many other station/stop endpoints can the recorded cell starting options potentially reach within the selected total time?</p><p>For every destination, choose the lowest retained walking approach plus a complete published weekday-morning MTR journey estimate, then allow 5 minutes for unmeasured access to the platform. Walking is a nominal 80 m/min and is searched up to 2 km. Operator estimates may already include waiting and interchanges; no extra blanket waiting time is added.</p><p>Main rail and Light Rail are separate. The combined view adds their available source results; transfers between those networks are not modelled. A cell can use different starting options for different destinations. This is an ordinary-walking research scenario; physical entry and continuous step-free passage remain unverified.</p><p>Grey means no temporal estimate for the selected source family; zero means no retained endpoint fits this time band. Neither establishes no real transport. Counts describe station endpoints, not destinations reached after exiting and walking onward, people/jobs access or a calibrated Accessibility score. Click a cell for its time profile and station markers on the main map.</p>')}
function value(p){return isTime()?(timeCount(timeData?.records[String(p.hex_id)])??-1):distanceValue(p)}
function colour(p){if(!isTime())return distanceColour(p);let n=value(p);return n<0?missing:colours[timeLimits.filter(v=>n>=v).length]}
function expression(){if(signature())return ['match',signatureMap().category,...signatureLegendClasses().flatMap(([id,colour])=>[id,colour]),missing];if(trial())return trialFill();if(!isTime())return distanceExpression();let n=timeStateValue();return ['case',['<',n,0],missing,['step',n,colours[0],...timeLimits.flatMap((v,i)=>[v,colours[i+1]])]]}
function title(){if(signature())return signatureTitle();if(trial())return 'Overall '+trialAPI().titles[trialView()]+' · '+trialAPI().modes[trialMode];return isTime()?['Main-rail station endpoints','Light Rail stop endpoints','Main + Light Rail endpoints · available families'][timeGroup()]+' within '+((timeBand+1)*10)+' min':distanceTitle()}
function rows(){if(!isTime())return distanceRows();if(!timeData)return null;let g=timeGroup();return {counts:timeData.histograms[g][timeBand],labels:timeLabels,denominator:timeData.denominators[g],unknown:84877-timeData.denominators[g]}}
function information(key){
 if(signature()&&key==='mobility:reading')return {title:'Mobility Signature preview',html:signatureHelp()};
 if(trial()&&trialReference){
  const reading=trialAPI().legend(trialReference,trialMode,trialView(),trialDistance,trialTime);
  if (roadTrial()) return {title:reading.title,html:'<p>'+esc(roadScale().label)+'</p><p>'+esc(roadScope())+'</p>'};
  return {title:reading.title,html:'<p>'+esc(reading.note)+'</p><p>'+esc(reading.scope)+'</p>'};
 }
 return isTime()?{title:'Mobility · walking + rail time',html:(key==='mobility:distribution'?distributionHTML():'')+timeHelp()}:distanceInformation(key)}
function unfilteredLegend(){distanceLegend();if(!pane)return;pane.querySelector('[data-time-wrap]').hidden=!isTime();if(!isTime())return;pane.querySelector('[data-band-wrap]').hidden=true;pane.querySelector('[data-family-wrap]').hidden=true;pane.querySelector('[data-scope]').textContent='Nominal walking + operator rail journey + 5 min platform access. Station endpoints only; final exit and onward walking are not included.';pane.querySelector('[data-legend]').innerHTML='<div class="ugc-label-row"><strong>'+esc(title())+'</strong>'+helpButton('mobility:time','How walking + rail time is calculated')+'</div><div class="ugc-legend"></div>';root.UGARefreshOpenInfoPanel?.()}
function unfilteredPaint(){if(!isTime())return distancePaint();if(!timeData){legend();if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading walking + rail time values…');return}timeState();nativePaint()}
function renderProfile(r){if(!isTime())return distanceRenderProfile(r);let current=ticket,id=selectedId,b=timeBand,v=view,host=pane.querySelector('[data-place]'),active=()=>current===ticket&&opened&&id===selectedId&&b===timeBand&&v===view;host.innerHTML=cellHeading(id)+'<div data-time-card><p>Loading walking + rail time profile…</p></div>';Promise.all([root.UGA_V2_MOBILITY_PROFILES.timeProfile('hex',id),root.UGA_V2_MOBILITY_PROFILES.timeCatalogue()]).then(([p,c])=>{if(active())root.UGA_V2_MOBILITY_PROFILES.renderTime(host.querySelector('[data-time-card]'),p,c,'hex',id,active,b,timeGroup(),next=>{timeBand=next;pane.querySelector('[data-time-band]').value=String(next);changed()})}).catch(e=>{if(active())host.querySelector('[data-time-card]').textContent='Time reading unavailable: '+e.message})}
async function changed(){root.clearTimeout(roadTimer);if(signature())return updateSignature();if(trial())return trialChanged();if(!isTime())return distanceChanged();timeStateKey=null;root.UGA_V2_MOBILITY_PROFILES.clearDestinations();let current=++ticket;if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading walking + rail time values…');try{await load();await loadTimes()}catch(e){if(current===ticket){close();status('Time reading unavailable: '+e.message)}return}if(current!==ticket)return;paint();if(selectedProfile)renderProfile(selectedProfile);else if(selectedId&&opened)selectCell(selectedId)}

const legendFilters=new Map();
function legendFilterKey(){
 if (signature()) return view+'|'+signatureKey();
 if (!trial()) return view+'|'+(view==='nearest'?family:'');
 if (!roadTrial()) return view+'|'+trialMode;
 const reading=roadReading();
 return [view,trialMode,reading,reading==='coverage'?roadMinutes:''].join('|');
}

function legendFilter(){
 const key=legendFilterKey();
 if (!legendFilters.has(key)) legendFilters.set(key,{hidden:new Set(),range:null});
 return legendFilters.get(key);
}

function legendClasses(){
 if (signature()) return signatureLegendClasses();
 if (trial()) return trialLegendClasses();
 if (isTime()) return [...colours.map((c,i)=>[i,c,timeLabels[i]]),[-1,missing,'No temporal estimate']];
 return distanceLegendClasses();
}

function distanceLabel(i){
 return (i===0?'≤':'>'+fmt(bands[i-1])+'–≤')+fmt(bands[i])+' m';
}

function distanceLegendClasses(){let items;if(isRail())items=colours.map((c,i)=>[i,c,i===0?'0 · no rail source match':railLabels()[i]]).concat([[-2,routeUnresolved,'Unmapped native rail context']]);else if(view==='routes')items=routeColours.map((c,i)=>[i,c,i===0?'0 · no mapped route':routeLabels[i]]).concat([[-2,routeUnresolved,'Unresolved service links']]);else if(view==='nearest')items=bands.map((b,i)=>[b,nearColours[i],distanceLabel(i)]).concat([[0,colours[0],'No match by 2 km']]);else items=colours.map((c,i)=>[i,c,i===0?(view==='presence'?'0 · no reference inside':'0 · no mode-family match'):String(i)]);if(view!=='presence')items.push([-1,missing,'Unassessed']);return items}
function distanceCategoryExpression(){if(isRail()||view==='routes'){let key=isRail()?'rp'+railMetric()+'b'+band:'sr'+band,unknown=isRail()?'ru'+band:'su'+band,breaks=isRail()?railBreaks():routeBreaks;return ['case',['<',['get',key],0],-1,['all',['==',['get',key],0],['>',['get',unknown],0]],-2,['step',['get',key],0,...breaks.flatMap((v,i)=>[v,i+1])]]}return ['get',view==='presence'?'presence':view==='nearest'?'n_'+family:'b'+band]}

function rangeClasses(classes){
 if (view==='nearest') return classes.filter(([id])=>id>0);
 return trial()?classes.filter(([id])=>id>=0):[];
}

function visibleClasses(classes){
 const {hidden,range}=legendFilter();
 const ordered=rangeClasses(classes);
 const outside=id=>{
  if (!range) return false;
  const index=ordered.findIndex(([key])=>key===id);
  return index>=0&&(index<range[0]||index>range[1]);
 };
 const visible=classes.filter(([id])=>!hidden.has(id)&&!outside(id)).map(([id])=>id);
 return {visible,outside};
}

function applyLegendFilter(paintMap=true){
 const classes=legendClasses();
 const {visible,outside}=visibleClasses(classes);
 if (paintMap&&map?.getLayer(layerId)) {
  const category=signature()?signatureMap().category:trial()?trialCategory():isTime()?timeCategory():distanceCategoryExpression();
  const test=visible.length===classes.length&&!signatureFocused()?null:['in',category,['literal',visible]];
  if (isTime()||(trial()&&!roadTrial())) {
   // MapLibre permits feature-state in paint expressions.
   map.setFilter(layerId,null);
   map.setPaintProperty(layerId,'fill-opacity',test?['case',test,opacity/100,0]:opacity/100);
  } else {
   map.setFilter(layerId,test);
  }
 }
 const swatches=pane?.querySelector('[data-legend] .ugc-legend');
 if (!swatches) return;
 for (const input of swatches.querySelectorAll('[data-legend-class]')) {
  const id=Number(input.dataset.legendClass);
  input.checked=!legendFilter().hidden.has(id);
  input.parentElement.classList.toggle('ugc-band-outside',outside(id));
 }
 const note=swatches.querySelector('[data-legend-filter-note]');
 if (note) note.textContent=visible.length+' of '+classes.length+' bands shown';
}

function renderBandRange(host,ordered,kind){
 if (!ordered.length) return;
 const panel=doc.createElement('div');
 panel.className='ugc-band-range';
 panel.setAttribute('role','group');
 panel.setAttribute('aria-label',kind+' range');
 panel.innerHTML='<strong>'+kind+' range</strong>'+['First','Last'].map((label,i)=>
  '<label><span>'+label+' band</span><input type="range" min="0" max="'+(ordered.length-1)+
  '" step="1" data-legend-bound="'+i+'" aria-label="'+label+' '+kind.toLowerCase()+
  ' band"><output></output></label>').join('');
 const inputs=[...panel.querySelectorAll('[data-legend-bound]')];
 const full=[0,ordered.length-1];
 const filter=legendFilter();
 const sync=()=>{
  const range=filter.range??full;
  inputs.forEach((input,i)=>{
   const index=range[i],label=ordered[index][2];
   input.value=String(index);
   input.setAttribute('aria-valuetext',label);
   input.parentElement.querySelector('output').textContent=label;
  });
 };
 inputs.forEach((input,i)=>{input.oninput=()=>{
  const range=[...(filter.range??full)];
  const index=Number(input.value);
  range[i]=i===0?Math.min(index,range[1]):Math.max(index,range[0]);
  filter.range=range;
  sync();
  applyLegendFilter();
 }});
 host.before(panel);
 sync();
 return sync;
}

function legend(){
 if (!pane) return;
 pane.querySelector('[data-ugc-signature-controls]').hidden=!signature();
 if (signature()) {
  pane.querySelector('[data-ugsp-map]').hidden=true;
  signatureLegend();
 } else if (trial()) trialLegend();
 else {
  pane.querySelector('[data-ugsp-map]').hidden=true;
  unfilteredLegend();
 }
 const swatches=pane.querySelector('[data-legend] .ugc-legend');
 if (!swatches) return;
 const classes=legendClasses(),filter=legendFilter();
 const kind=view==='nearest'?'Distance':roadTrial()&&roadScale().unit===' min'?'Time':'Band';
 const syncRange=renderBandRange(swatches,rangeClasses(classes),kind);
 swatches.innerHTML=classes.map(([id,colour,label])=>
  '<label class="ugc-band-check"><input type="checkbox" data-legend-class="'+id+'">'+
  '<i style="background:'+colour+'"></i><span>'+esc(label)+'</span></label>').join('')+
  '<div class="ugc-band-actions"><button type="button" data-legend-all>Show all</button>'+
  '<button type="button" data-legend-none>Hide all</button></div>'+
  '<p class="ugc-note ugc-band-note" data-legend-filter-note></p>';
 swatches.querySelectorAll('[data-legend-class]').forEach(input=>{input.onchange=()=>{
  const id=Number(input.dataset.legendClass);
  if (input.checked) filter.hidden.delete(id);
  else filter.hidden.add(id);
  applyLegendFilter();
 }});
 swatches.querySelector('[data-legend-all]').onclick=()=>{
  filter.hidden.clear();
  filter.range=null;
  syncRange?.();
  applyLegendFilter();
 };
 swatches.querySelector('[data-legend-none]').onclick=()=>{
  classes.forEach(([id])=>filter.hidden.add(id));
  applyLegendFilter();
 };
 applyLegendFilter(false);
}

function paint(){
 const tiles=!!tileView();
 if(map&&opened&&tiledSource!==tiles){
  if(map.getLayer(layerId))map.removeLayer(layerId);
  if(map.getSource(sourceId))map.removeSource(sourceId);
  tiledSource=tiles;
 }
 if(signature()){
  if(!signatureData){legend();return}
  nativePaint();
 }else if(trial()){
  if(!trialData){legend();return}
  if(opened&&roadTrial()) roadReadings();
  if(opened) trialState();
  nativePaint();
 }else unfilteredPaint();
 applyLegendFilter();
}

const profiles=new Map(),esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),fmt=v=>Number(v).toLocaleString('en-GB'),mobile=()=>root.matchMedia?.('(max-width:900px)').matches||false;
function nativeValue(p){if(view==='routes'){let v=Number(p['sr'+band]);return v===0&&Number(p['su'+band])>0?-2:v}return view==='presence'?Number(p.presence):view==='nearest'?Number(p['n_'+family]):Number(p['b'+band])}
function nativeColour(p){let v=value(p);if(view==='routes')return v===-2?routeUnresolved:v<0?missing:routeColours[routeBin(v)];return v<0?missing:view==='nearest'?(v===0?colours[0]:nearColours[bands.indexOf(v)]):colours[v]}
function nativeExpression(){if(view==='routes')return ['case',['<',['get','sr'+band],0],missing,['all',['==',['get','sr'+band],0],['>',['get','su'+band],0]],routeUnresolved,['step',['get','sr'+band],routeColours[0],...routeBreaks.flatMap((n,i)=>[n,routeColours[i+1]])]];let key=view==='presence'?'presence':view==='nearest'?'n_'+family:'b'+band;return ['match',['get',key],-1,missing,...(view==='nearest'?[0,colours[0],...bands.flatMap((b,i)=>[b,nearColours[i]])]:colours.flatMap((c,i)=>[i,c])),missing]}
function nativeTitle(){return view==='routes'?'Surface service routes within '+fmt(bands[band])+' m':view==='presence'?'Mode families mapped inside each cell':view==='nearest'?'Nearest '+families[family]+' · source-network band':'Overall connectivity · mode families within '+fmt(bands[band])+' m'}
async function json(url,pin){let r=await root.fetch(url,{cache:'force-cache'});if(!r.ok)throw Error('Citywide data HTTP '+r.status);let raw=await r.text(),hash=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));if([...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('')!==pin)throw Error('Citywide checksum differs');return JSON.parse(raw)}

const tileURL="pmtiles://https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mobility-display/b2e1c10687df41a8ae4fec523c6ce424f772d179d99e01e8ccbaa6063f44748b/citywide.pmtiles";
const tileView=()=>tileURL && ['overall','presence'].includes(view);
let shared, tiledSource=false;
function manifestAndSummary(){
 if(!shared) shared=(async()=>{
  const m=await json(new URL('manifest.json',base),'ea8748f569b10b1088c1e4199c82e486bd590a3786efdfc2d5e7d027c78e8ec6');
  if(m.public_hexes!==84877||m.version!=='MOBILITY_CITYWIDE_BASELINE_V0_1')throw Error('Citywide scope differs');
  summary=await json(new URL('summary.json',base),m.files['summary.json'].sha256);
  return m;
 })().catch(e=>{shared=null;throw e});
 return shared;
}
async function load(){
 const m=await manifestAndSummary();
 if(tileView()||data)return;
 if(!pending)pending=json(new URL('citywide-hexes.geojson',base),m.files['citywide-hexes.geojson'].sha256).then(g=>{
  if(g.type!=='FeatureCollection'||g.features.length!==m.public_hexes)throw Error('Citywide map frame differs');
  data=g;
 }).catch(e=>{pending=null;throw e});
 return pending;
}
function baseRows(){if(!summary)return null;let s=summary.public;if(view==='presence')return {counts:s.presence_breadth,labels:colours.map((_,i)=>String(i)+' / 6'),denominator:s.hexes,unknown:0};if(view==='nearest')return {counts:s.nearest[family].slice(0,7),labels:[...bands.map(b=>'≤'+fmt(b)+' m'),'No match by 2 km'],denominator:s.network_profiles,unknown:s.no_recorded_network};return {counts:s.reach_breadth[band],labels:colours.map((_,i)=>String(i)+' / 6'),denominator:s.network_profiles,unknown:s.no_recorded_network}}
function nativeRows(){if(view!=='routes')return baseRows();if(!routeData)return null;return {counts:[...routeData.histograms[band],routeData.unresolved_only[band]],labels:[...routeLabels,'No mapped offer; unresolved links'],denominator:routeData.assessed,unknown:routeData.unassessed}}
function distributionHTML(){let r=rows();if(!r)return '<p>The distribution is available after the map data loads.</p>';let maximum=Math.max(1,...r.counts);return '<p><strong>'+esc(title())+'</strong></p><p>Denominator: '+fmt(r.denominator)+(view==='presence'?' mapped report cells.':' assessed report cells.')+'</p>'+r.counts.map((n,i)=>'<div class="ugc-row"><span>'+esc(r.labels[i])+'</span><i style="width:'+(n/maximum*110)+'px;background:'+(isRail()?(colours[i]||routeUnresolved):view==='routes'?(routeColours[i]||routeUnresolved):view==='nearest'?(i===6?colours[0]:nearColours[i]):colours[i])+'"></i><b>'+fmt(n)+'</b><small>'+(100*n/r.denominator).toFixed(1)+'%</small></div>').join('')+'<p>'+fmt(r.unknown)+' cells remain unassessed for this network reading.</p><p>Full engine frame: '+fmt(summary.full.hexes)+' cells / '+fmt(summary.full.network_profiles)+' network profiles; a separate denominator.</p>'}
function infoSection(label,text){return '<section class="atlas-info-section"><h4>'+esc(label)+'</h4>'+text+'</section>'}
function nativeInformation(key){if(view==='routes'&&key!=='mobility:distance')return {title:'Mobility · surface service routes',html:(key==='mobility:distribution'?distributionHTML():'')+routeHelp()};let overview=infoSection('WHAT IS SHOWN','<p>Connectivity describes physical network potential. Mobility adds movement and service through time. Accessibility describes the destinations and opportunities that can be reached.</p><p>This layer currently assesses six public-transport families: bus/feeder, minibus, rail, tram, ferry and Peak Tram. Road, car, taxi and cycling analysis remains to be added.</p>');
 let method=infoSection('HOW IT IS CALCULATED','<p>Overall connectivity counts how many of those six families have a retained reference reached within the selected source-network distance. A bus, minibus and rail result therefore gives 3 / 6. Either rail feed establishes one rail family; bus and feeder count as one family.</p><p>It is a combined mode-variety reading at a declared distance, not a weighted strength, service-quality or journey-time score. Changing distance changes the question.</p>');
 let distance=infoSection('WALKING-NETWORK DISTANCE','<p>The bands are 50, 100, 200, 500, 1,000 and 2,000 m along the retained XYZ pedestrian network, including recorded vertical geometry. A reference is included if reached from any retained source position inside or on the cell.</p><p>Different levels and fragments can contribute separate starting alternatives without being joined. The reading is area potential, not the same journey from every Building. Initial and destination attachment gaps are excluded and remain unverified.</p>');
 let presence=infoSection('MAPPED PRESENCE AND NEAREST MODES','<p>Mapped presence counts transport families whose retained point references lie inside or on the cell in plan. It includes reference-only and unresolved attachments; presence and network reach are separate and can overlap.</p><p>Nearest mode shows the first existing network-distance band with a reference for the chosen family. It is a band, not an exact minimum, straight-line distance or travel time.</p>');
 let limits=infoSection('HOW TO READ IT','<p>Grey means unassessed. Zero or no match describes this retained model and distance; it does not establish transport absence. Source records are not unique stations, stops, routes or services.</p><p>Walking potential does not establish step-free suitability, public passage, permitted access, boarding or operation. Frequency, waiting, congestion, onward journeys and opportunity reach remain separate work.</p>');
 if(key==='mobility:distribution')return {title:'Mobility · citywide distribution',html:distributionHTML()+limits};if(key==='mobility:distance')return {title:'Mobility · walking-network bands',html:distance+limits};return {title:'Mobility · '+(key==='mobility:reading'?title():'connectivity across Hong Kong'),html:overview+method+presence+distance+limits}}
function installInformation(){if(infoWrapped||typeof root.getInfoPanel!=='function')return;let native=root.getInfoPanel;root.getInfoPanel=function(key){return String(key).startsWith('mobility:')?information(key):native.apply(this,arguments)};infoWrapped=true}
function helpButton(key,label){return '<button type="button" class="info-trigger" data-info-key="'+key+'" aria-label="'+esc(label)+'" title="'+esc(label)+'">i</button>'}
function nativeLegend(){if(!pane)return;let items=view==='routes'?[...routeColours.map((c,i)=>[c,routeLabels[i]]),[routeUnresolved,'No mapped offer; unresolved links']]:view==='nearest'?[...bands.map((b,i)=>[nearColours[i],'≤'+fmt(b)+' m']),[colours[0],'No match by 2 km']]:colours.map((c,i)=>[c,String(i)]);if(view!=='presence')items.push([missing,'Unassessed']);pane.querySelector('[data-legend]').innerHTML='<div class="ugc-label-row"><strong>'+esc(title())+'</strong>'+helpButton('mobility:reading','About this connectivity reading')+'</div><div class="ugc-legend">'+items.map(([c,label])=>'<span><i style="background:'+c+'"></i>'+esc(label)+'</span>').join('')+'</div>';pane.querySelector('[data-band-wrap]').hidden=!['overall','routes'].includes(view);pane.querySelector('[data-scope]').textContent=view==='routes'?'Five mapped surface service families. Rail service links remain unassessed; counts are not filtered by date or time.':'Six assessed public-transport families. Road and cycling readings remain unassessed.';pane.querySelector('[data-family-wrap]').hidden=view!=='nearest';pane.querySelector('[data-summary]').innerHTML=summary?'<div class="ugc-label-row"><span>'+fmt(summary.public.hexes)+' mapped cells · '+fmt(summary.public.network_profiles)+' network profiles</span>'+helpButton('mobility:distribution','Citywide distribution and coverage')+'</div>':'';installInformation();root.UGARefreshOpenInfoPanel?.()}
function status(text){if(pane)pane.querySelector('[data-status]').textContent=text}
function nativePaint(){legend();if(!map||!opened||(!data&&!tileView()))return;if(view==='routes'&&!routeData){if(map.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading the service-route reading…');return;}let layer=map.getLayer(layerId);if(!layer&&!map.isStyleLoaded()){needsPaint=true;status('Preparing the map; the latest reading will appear when it is ready.');return}if(painting)return;painting=true;needsPaint=false;try{if(!map.getSource(sourceId))map.addSource(sourceId,tileView()?{type:'vector',url:tileURL,promoteId:'hex_id'}:{type:'geojson',data,generateId:false,promoteId:'hex_id'});if(!map.getLayer(layerId))map.addLayer({id:layerId,type:'fill',source:sourceId,...(tileView()?{'source-layer':'mobility'}:{}),paint:{'fill-color':expression(),'fill-color-transition':{duration:0,delay:0},'fill-opacity':opacity/100,'fill-opacity-transition':{duration:0,delay:0},'fill-outline-color':'rgba(255,255,255,0.18)'}},analysisInsertionPoint());else{map.setPaintProperty(layerId,'fill-color-transition',{duration:0,delay:0});map.setPaintProperty(layerId,'fill-color',expression());map.setPaintProperty(layerId,'fill-opacity',opacity/100)}map.setLayoutProperty(layerId,'visibility','visible');if(!bound){map.on('mouseenter',layerId,()=>{map.getCanvas().style.cursor='pointer'});map.on('mouseleave',layerId,()=>{map.getCanvas().style.cursor=''});bound=true}status('Showing '+title().toLowerCase()+'.')}catch(error){status('Map update unavailable: '+error.message)}finally{painting=false}}
function bindMap(){if(styleMap===map)return;styleMap=map;map.on('style.load',()=>{needsPaint=true;paint()});map.on('idle',()=>{if(needsPaint&&opened)paint()})}
function setOpacity(v){opacity=Math.round(Math.max(0,Math.min(100,Number(v)||0)));section?.querySelectorAll('[data-opacity]').forEach(input=>input.value=String(opacity));section?.querySelectorAll('[data-opacity-value]').forEach(output=>output.textContent=opacity+'%');section?.querySelectorAll('[data-opacity-caption]').forEach(output=>output.textContent='Mobility opacity · '+opacity+'%');if(map?.getLayer(layerId))map.setPaintProperty(layerId,'fill-opacity',opacity/100);root.UGA_V2_MOBILITY_PROFILES?.timeOpacity?.(opacity);if(isTime()||(trial()&&!roadTrial()))applyLegendFilter()}
function nearestLabel(){let n=Number(data?.features.find(f=>String(f.properties.hex_id)===String(selectedId))?.properties['n_'+family]);return n<0?'Unassessed':n===0?'No match by 2 km':Number.isFinite(n)?'≤'+fmt(n)+' m':'Unavailable'}
function cellHeading(id){return '<h3>LAB-ID-'+esc(id)+'</h3>'}
function baseRenderProfile(r){if(!pane)return;let cc=r.counts?.[band],maximum=Math.max(1,...(cc||[])),heading=view==='presence'?'Mapped inside this cell':view==='nearest'?'Source references · '+families[family]:'Source references reached by '+fmt(bands[band])+' m';pane.querySelector('[data-place]').innerHTML=cellHeading(r.id||selectedId)+'<p>'+fmt(Number(r.path_length_3d).toFixed(1))+' m recorded paths · '+r.local_fragments+' local fragments · '+r.global_components+' wider source networks.</p><p><strong>'+esc(heading)+'</strong></p>'+(view==='presence'?r.inside_counts.map((n,g)=>'<div class="ugc-row"><span>'+esc(labels[g])+'</span><b>'+fmt(n)+'</b></div>').join(''):view==='nearest'?'<p>First matching band: '+esc(nearestLabel())+'.</p>':cc?cc.map((n,g)=>'<div class="ugc-row"><span>'+esc(labels[g])+'</span><i style="width:'+(n/maximum*110)+'px"></i><b>'+fmt(n)+'</b></div>').join(''):'<p>Network reach is unassessed.</p>')+'<p class="ugc-note">Source references, not unique services. Different cell starts can contribute different journeys.</p>'}
function nativeRenderProfile(r){if(view!=='routes')return baseRenderProfile(r);if(pane)pane.querySelector('[data-place]').innerHTML=cellHeading(r.id||selectedId)+routeCellHTML(selectedService)+'<p class="ugc-note">Different recorded cell starts can contribute different route options; this is not one journey from every Building.</p>'}
async function selectCell(id){root.UGA_V2_MOBILITY_NETWORK?.selectHex(String(id));selectedId=String(id);
 if(signature()){ticket++;selectedProfile=null;selectedService=null;signatureCell(selectedId);return}
 if(trial()){
  ticket++;selectedProfile=null;selectedService=null;trialCell(selectedId);return;
 }selectedProfile=null;selectedService=null;let current=++ticket;pane.querySelector('[data-place]').innerHTML=cellHeading(id)+'<p>Loading connectivity…</p>';try{if(!profiles.has(selectedId))profiles.set(selectedId,root.UGA_V2_MOBILITY_PROFILES.citywideProfile(selectedId).catch(error=>{profiles.delete(String(id));throw error}));let [r,p]=await Promise.all([profiles.get(selectedId),view==='routes'?root.UGA_V2_MOBILITY_PROFILES.serviceProfile('hex',selectedId):Promise.resolve(null)]);if(current!==ticket||!opened)return;selectedProfile=r;selectedService=p;renderProfile(r)}catch(error){if(current===ticket&&opened)pane.querySelector('[data-place]').innerHTML=cellHeading(id)+'<p>'+esc(error.message)+'. This reading remains unavailable.</p>'}}
function inspectAt(point){
 if (!opened || !opacity || !map?.getLayer(layerId) ||
     map.getLayoutProperty(layerId,'visibility')==='none') return null;
 const feature=map.queryRenderedFeatures(point,{layers:[layerId]})[0];
 const id=feature?.properties?.hex_id;
 if (id==null) return null;
 // Invisible features can still receive clicks when filtering through paint.
 if (isTime()||(trial()&&!roadTrial())) {
  const classes=legendClasses(),{visible}=visibleClasses(classes);
  if (visible.length!==classes.length) {
   const value=isTime()?timeCount(timeData?.records[String(id)]):
    trialAPI().scores(trialAPI().valueFor(trialData,String(id),trialMode),
     trialReference,'hex',trialMode,trialDistance,trialTime)[trialView()];
   const edges=isTime()?timeLimits:scoreBreaks;
   const category=value===null?(isTime()||!Object.hasOwn(trialData.public,id)?NO_NETWORK:READING_UNAVAILABLE):value===0?0:
    edges.filter(edge=>value>=edge).length+(isTime()?0:1);
   if (!visible.includes(category)) return;
  }
 }
 selectCell(id);
 const count=view==='overall'?feature.properties['b'+band]:
  view==='presence'?feature.properties.presence:null;
 const detail=Number.isInteger(count)&&count>=0&&count<=6
  ? count+' of 6 assessed mode families' : '';
 return {hexId:String(id),label:title(),detail};
}
async function nativeChanged(){let current=++ticket;if(!opened){legend();return}try{await load()}catch(e){if(current===ticket){close();status(e.message)}return}if(current!==ticket||!opened)return;if(view==='routes'){if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');status('Loading and checking service route values…');try{await load();await loadRoutes()}catch(error){if(current===ticket){close();status(error.message+'. This reading remains unavailable.')}return}if(current!==ticket)return}paint();if(selectedProfile&&(view!=='routes'||selectedService))renderProfile(selectedProfile);else if(selectedId&&opened)selectCell(selectedId)}
function expanded(on){if(!section)return;let was=section.classList.contains('expanded');section.classList.toggle('expanded',on);section.classList.toggle('collapsed',!on);body.hidden=!on;let b=section.querySelector('[data-expand]');b.setAttribute('aria-expanded',String(on));b.setAttribute('aria-label',(on?'Collapse':'Expand')+' Mobility');if(on&&!was)root.UGAFocusRailPanel?.(section)}
async function open(){boot();map=root.UGA_V2_MAP;if(!map){status('The map is initialising. Please try the visibility switch again.');visible.checked=false;return}bindMap();opened=true;visible.checked=true;expanded(true);status('Loading and checking the saved citywide data…');const openingView=view;try{await load();if(!opened||view!==openingView)return;if(signature())await loadSignature();if(trial())await loadTrial();if(isTime())await loadTimes();if(isRail())await loadRails();if(view==='routes')await loadRoutes();if(opened){paint();if(selectedId)selectCell(selectedId);watchRoadReplay()}}catch(error){if(opened){close();status(error.message+'. The map remains off.')}}}
function close(){root.clearTimeout(roadTimer);root.UGA_V2_MOBILITY_PROFILES.clearDestinations();opened=false;needsPaint=false;ticket++;if(visible)visible.checked=false;if(map?.getLayer(layerId))map.setLayoutProperty(layerId,'visibility','none');if(map)map.getCanvas().style.cursor='';status('Map layer is off. Reading and opacity settings are retained.')}
function positionModule(){let rail=doc.getElementById('panelScroll'),fabric=doc.getElementById('fabricSection');if(rail&&section&&fabric?.parentElement===rail&&fabric.nextElementSibling!==section)fabric.after(section)}
function mobileSection(){let panel=doc.getElementById('panel'),rail=doc.getElementById('panelScroll');if(!panel||!rail)return;if(panel.classList.contains('panel-minimized'))doc.getElementById('panelMinimize')?.click();panel.dataset.mobileSheetTab='mobility';panel.classList.remove('mobile-sheet-map-active');doc.getElementById('basemapControl')?.classList.remove('mobile-sheet-active');rail.classList.add('mobile-sheet-active');rail.querySelectorAll(':scope > .mode-panel').forEach(s=>{let active=s===section;s.classList.toggle('mobile-sheet-active',active);s.setAttribute('aria-hidden',String(!active))});doc.querySelectorAll('.mobile-sheet-tab').forEach(t=>{let active=t.hasAttribute('data-ug-mobility-tab');t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});expanded(true);rail.scrollTop=0}
function navigation(){let tabs=doc.querySelector('.mobile-sheet-tabs');if(!tabs||tabs.querySelector('[data-ug-mobility-tab]'))return;let b=doc.createElement('button');b.type='button';b.className='mobile-sheet-tab';b.dataset.mobileSheetTab='mobility';b.setAttribute('data-ug-mobility-tab','');b.setAttribute('role','tab');b.setAttribute('aria-selected','false');b.tabIndex=-1;b.setAttribute('aria-controls','ugMobilityCitywideSection');b.innerHTML='<img class="uga-mobile-domain-icon" src="assets/Mobility_Icon.png" alt="" aria-hidden="true"><span>MOBILITY</span>';tabs.appendChild(b);tabs.setAttribute('data-ug-mobility-nav','true')}
const CSS=`#panel #ugMobilityCitywideSection{width:100%!important;overflow:visible}#panel #ugMobilityCitywideSection [hidden]{display:none!important}#panel #ugMobilityCitywideSection.expanded>.mode-header{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:13px!important}#panel #ugMobilityCitywideSection.expanded .mode-header-text{display:block!important;order:1!important;flex:1 1 auto!important;min-width:0!important}#panel #ugMobilityCitywideSection.expanded .mode-icon-toggle{display:flex!important;order:2!important;flex:0 0 52px!important;width:52px!important;height:52px!important;margin:-5px -4px 0 0!important}#panel #ugMobilityCitywideSection.expanded .mode-stack-icon{width:47px!important;height:47px!important;object-fit:contain!important;opacity:.9!important}#panel #ugMobilityCitywideSection.expanded .stack-collapsed-opacity{display:none!important}#panel #ugMobilityCitywideSection.collapsed{display:block!important;width:100%!important;height:64px!important;min-height:64px!important;max-height:64px!important;flex:0 0 64px!important;padding:0!important;overflow:hidden!important;border-radius:16px!important}#panel #ugMobilityCitywideSection.collapsed>.mode-header{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;width:100%!important;height:64px!important;min-height:64px!important;padding:6px 7px 6px 12px!important;gap:10px!important;box-sizing:border-box!important}#panel #ugMobilityCitywideSection.collapsed .mode-header-text,#panel #ugMobilityCitywideSection.collapsed>.mode-body{display:none!important}#panel #ugMobilityCitywideSection.collapsed .stack-collapsed-opacity{display:flex!important;flex:1 1 auto!important;min-width:0!important;align-items:center!important;gap:10px!important}#panel #ugMobilityCitywideSection.collapsed .stack-collapsed-opacity-meta{display:flex!important;flex:0 0 118px!important;flex-direction:column!important;gap:3px!important;min-width:0!important}#panel #ugMobilityCitywideSection.collapsed .stack-collapsed-opacity-label{color:var(--text-secondary)!important;font-size:.62rem!important;font-weight:700!important;letter-spacing:.08em!important;line-height:1.05!important;white-space:nowrap!important}#panel #ugMobilityCitywideSection.collapsed .stack-collapsed-opacity-value{color:var(--text-primary)!important;font-size:.62rem!important;font-weight:500!important;line-height:1.05!important;white-space:nowrap!important}#panel #ugMobilityCitywideSection.collapsed .stack-collapsed-opacity-range{display:block!important;flex:1 1 auto!important;width:auto!important;min-width:74px!important;margin:0!important;accent-color:#6f767d!important}#panel #ugMobilityCitywideSection.collapsed .mode-icon-toggle{display:flex!important;order:2!important;flex:0 0 52px!important;width:52px!important;height:52px!important;margin:0!important;padding:0!important;border-radius:14px!important}#panel #ugMobilityCitywideSection.collapsed .mode-stack-icon{display:block!important;width:43px!important;height:43px!important;object-fit:contain!important;opacity:.9!important}#panel #ugMobilityCitywideSection .mode-icon-toggle{color:transparent!important;font-size:0!important;text-indent:0!important}#panel #ugMobilityCitywideSection .mode-icon-toggle::before,#panel #ugMobilityCitywideSection .mode-icon-toggle::after{content:none!important;display:none!important}#ugMobilityCitywideSection .mode-title-line,.ugc-label-row{display:flex;align-items:center;gap:7px}.ugc-label-row{justify-content:space-between;margin:8px 0}.ugc-label-row label{margin:0!important}.ugc-label-row .info-trigger{flex:0 0 auto}#ugMobilityCitywideSection .uga-domain-opacity-card{margin:0 0 12px}#ugConnectivityCitywide{position:static;width:auto;max-width:100%;margin:0;padding:0;color:var(--text-primary);font:12px/1.5 system-ui;overflow-wrap:anywhere}#ugConnectivityCitywide select{box-sizing:border-box;width:100%;max-width:100%}.ugc-legend{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.ugc-legend span{display:flex;align-items:center;gap:4px}.ugc-legend i{display:inline-block;width:14px;height:14px;border:1px solid #7c898d}.ugc-row{display:flex;align-items:center;gap:6px;margin:5px 0}.ugc-row span{min-width:70px}.ugc-row i{height:10px;background:#2583bd}.ugc-row b{margin-left:auto}.ugc-row small{min-width:42px;text-align:right}.ugc-note,#ugConnectivityCitywide [data-status]{font-size:11px;color:var(--text-secondary);margin:8px 0}#ugConnectivityCitywide [data-place]{border-top:1px solid #ccd7d0;margin-top:12px;padding-top:8px}.mobile-sheet-tabs[data-ug-mobility-nav]{overflow-x:auto}@media(max-width:900px){#panel #ugMobilityCitywideSection .mode-icon-toggle,#panel #ugMobilityCitywideSection .stack-collapsed-opacity{display:none!important}.mobile-sheet-tabs[data-ug-mobility-nav]{display:flex!important}.mobile-sheet-tabs[data-ug-mobility-nav]>.mobile-sheet-tab{flex:0 0 66px}#panelScroll>#ugMobilityCitywideSection.mobile-sheet-active{display:block!important}}@media print{#ugMobilityCitywideSection{display:none!important}}
#ugConnectivityCitywide .ugc-signature-facts p{margin:5px 0}
#ugConnectivityCitywide .ugc-signature-targets{width:100%;text-align:left;border-collapse:collapse;margin-top:6px;font-size:11px}
#ugConnectivityCitywide .ugc-signature-targets th,#ugConnectivityCitywide .ugc-signature-targets td{padding:4px 3px;border-bottom:1px solid var(--border-soft,#ccd7d0)}
#ugConnectivityCitywide .ugc-band-range{display:grid;gap:4px;margin:9px 0 4px;font-size:11px}
#ugConnectivityCitywide .ugc-band-range label{display:grid;grid-template-columns:4.4em minmax(44px,1fr) minmax(5.5em,auto);align-items:center;gap:8px;min-height:23px;margin:0}
#ugConnectivityCitywide .ugc-band-range input{width:100%;margin:0;accent-color:#6f767d}
#ugConnectivityCitywide .ugc-band-range output{text-align:right;font-variant-numeric:tabular-nums}
#ugConnectivityCitywide .ugc-band-check{display:inline-flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;margin:2px 0}
#ugConnectivityCitywide .ugc-band-check input{width:13px;height:13px;margin:0;accent-color:#6f767d}
#ugConnectivityCitywide .ugc-band-check i{flex:none}
#ugConnectivityCitywide .ugc-band-outside{opacity:.55}
#ugConnectivityCitywide .ugc-band-actions{flex-basis:100%;display:flex;gap:5px;margin:4px 0}
#ugConnectivityCitywide .ugc-band-note{flex-basis:100%;margin:0}
`;
function boot(){if(pane){positionModule();navigation();installInformation();return true}let rail=doc.getElementById('panelScroll');if(!rail)return false;if(doc.getElementById('ugMobilityCitywideSection'))return false;let style=doc.createElement('style');style.textContent=CSS;doc.head.appendChild(style);section=doc.createElement('section');section.id='ugMobilityCitywideSection';section.className='mode-panel collapsed has-collapsed-opacity uga-domain-panel';section.dataset.ugMobilityCitywide='true';section.setAttribute('aria-label','Mobility citywide connectivity');section.innerHTML='<div class="mode-header"><div class="mode-header-text"><div class="mode-title-line"><div class="mode-title">Mobility</div>'+helpButton('mobility:overview','About Mobility')+'</div><div class="mode-description">Compare connections across Hong Kong. Select a place for modelled journey times and reachable destinations.</div></div><div class="stack-collapsed-opacity uga-native-peer-compact" aria-label="Mobility opacity while collapsed"><div class="stack-collapsed-opacity-meta"><span class="stack-collapsed-opacity-label">MOBILITY</span><output class="stack-collapsed-opacity-value" data-opacity-caption>Mobility opacity · 100%</output></div><input type="range" class="stack-collapsed-opacity-range" data-opacity min="0" max="100" value="100" step="1" aria-label="Mobility opacity while collapsed"></div><button type="button" class="mode-icon-toggle uga-domain-icon-toggle" data-expand aria-expanded="false" aria-label="Expand Mobility" aria-controls="ugMobilityCitywideBody"><img class="mode-stack-icon" src="assets/Mobility_Icon.png" alt="" aria-hidden="true"></button></div><div id="ugMobilityCitywideBody" class="mode-body" hidden><label class="toggle uga-domain-master-toggle"><input type="checkbox" data-visible><span>Show Mobility map</span></label><div class="uga-domain-opacity-card"><div class="uga-domain-opacity-head"><span>MAP OVERLAY OPACITY</span><strong data-opacity-value>100%</strong></div><input type="range" data-opacity min="0" max="100" value="100" step="1" aria-label="Mobility map opacity"></div></div>';body=section.querySelector('.mode-body');visible=section.querySelector('[data-visible]');pane=doc.createElement('div');pane.id='ugConnectivityCitywide';pane.innerHTML='<div class="uga-selector-block"><div class="ugc-label-row"><label class="section-label" for="ugCitywideView">Map reading</label>'+helpButton('mobility:reading','How this reading is calculated')+'</div><select id="ugCitywideView" data-view class="uga-domain-select"><option value="overall">Overall connectivity · all assessed modes</option><option value="routes">Surface service routes · walking reach</option><option value="rail_stations">Rail · main + Light Rail stations/stops</option><option value="rail_lines">Rail · main + Light Rail lines/routes</option><option value="rail_onward">Rail · main + Light Rail onward stops</option><option value="rail_time_main">Rail mobility · Main rail</option><option value="rail_time_light">Rail mobility · Light Rail</option><option value="rail_time_all">Rail mobility · Both families</option><option value="presence">Modes mapped inside each cell</option><option value="nearest">Nearest mode · network-distance band</option></select></div><div data-band-wrap class="uga-selector-block"><div class="ugc-label-row"><label class="section-label" for="ugCitywideBand">Walking-network distance</label>'+helpButton('mobility:distance','About network-distance bands')+'</div><select id="ugCitywideBand" data-band class="uga-domain-select">'+bands.map((b,i)=>'<option value="'+i+'"'+(i===band?' selected':'')+'>'+fmt(b)+' m</option>').join('')+'</select></div><div data-time-wrap class="uga-selector-block" hidden><div class="ugc-label-row"><label class="section-label" for="ugCitywideTime">Total walking + rail time</label>'+helpButton('mobility:time','About nominal journey time')+'</div><select id="ugCitywideTime" data-time-band class="uga-domain-select"><option value="0">10 min</option><option value="1">20 min</option><option value="2" selected>30 min</option><option value="3">40 min</option><option value="4">50 min</option><option value="5">60 min</option><option value="6">70 min</option><option value="7">80 min</option><option value="8">90 min</option><option value="9">100 min</option><option value="10">110 min</option><option value="11">120 min</option></select></div><div data-family-wrap class="uga-selector-block" hidden><label class="section-label" for="ugCitywideFamily">Transport family</label><select id="ugCitywideFamily" data-family class="uga-domain-select">'+Object.entries(families).map(([k,v])=>'<option value="'+k+'"'+(k===family?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select></div><div data-legend></div><p class="ugc-note" data-scope>Six assessed public-transport families. Road and cycling readings remain unassessed.</p><p data-status aria-live="polite">Choose a reading, then switch on the citywide map.</p><div data-summary></div><div data-place><p>Click a coloured cell to inspect its connectivity.</p></div>';body.appendChild(pane);rail.appendChild(section);positionModule();navigation();section.querySelector('[data-expand]').onclick=()=>{if(mobile())mobileSection();else expanded(body.hidden)};trialControls();mountSignatureControls();visible.onchange=()=>{if(visible.checked)open();else close()};section.querySelectorAll('[data-opacity]').forEach(input=>{input.oninput=()=>setOpacity(input.value);input.onchange=()=>setOpacity(input.value)});for(let name of ['click','pointerdown','pointerup','touchstart','touchend'])section.querySelector('.stack-collapsed-opacity').addEventListener(name,event=>event.stopPropagation());pane.querySelector('[data-time-band]').onchange=event=>{let v=Number(event.target.value);if(Number.isInteger(v)&&v>=0&&v<12){timeBand=v;changed()}};pane.querySelector('[data-view]').onchange=event=>{view=event.target.value;changed()};pane.querySelector('[data-band]').onchange=event=>{band=Number(event.target.value);changed()};pane.querySelector('[data-family]').onchange=event=>{family=event.target.value;changed()};legend();return true}
function mount(){
 boot();
 if(section&&doc.querySelector('[data-ug-mobility-tab]')){
  const choice=doc.querySelector('#welcomePanel [data-uga-start="mobility"]');
  if(choice)choice.hidden=false;
  observer?.disconnect();
  observer=null;
 }
}
doc.addEventListener('click',event=>{let tab=event.target.closest?.('.mobile-sheet-tab');if(!tab)return;if(tab.hasAttribute('data-ug-mobility-tab')){event.preventDefault();event.stopImmediatePropagation();boot();mobileSection()}else if(section){section.classList.remove('mobile-sheet-active');section.setAttribute('aria-hidden','true');let own=doc.querySelector('[data-ug-mobility-tab]');own?.classList.remove('active');own?.setAttribute('aria-selected','false');if(own)own.tabIndex=-1}},true);
doc.addEventListener('keydown',event=>{let tab=event.target.closest?.('.mobile-sheet-tab'),tabs=tab?.closest('[data-ug-mobility-nav]');if(!tabs||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;let buttons=[...tabs.querySelectorAll('.mobile-sheet-tab')].filter(b=>!b.disabled),index=buttons.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;event.preventDefault();event.stopImmediatePropagation();buttons[next]?.click();buttons[next]?.focus()},true);
root.matchMedia?.('(max-width:900px)').addEventListener?.('change',event=>{if(!event.matches&&section){section.classList.remove('mobile-sheet-active');section.removeAttribute('aria-hidden')}});
root.UGA_MOBILITY_CITYWIDE=Object.freeze({VERSION,open,close,inspectAt,refreshRoad,loadRoadData,loadRoadCell,savedRoad});if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});else mount();root.addEventListener('load',mount,{once:true});if(root.MutationObserver&&doc.body&&!doc.querySelector('[data-ug-mobility-tab]')){observer=new root.MutationObserver(mount);observer.observe(doc.body,{childList:true,subtree:true})}
if(typeof module==='object'&&module.exports)module.exports={value,colour,expression,information,rows,set:(b,v,f)=>{band=b;view=v;family=f},state:()=>({opened,opacity,band,view,family,needsPaint})};
})(globalThis);
