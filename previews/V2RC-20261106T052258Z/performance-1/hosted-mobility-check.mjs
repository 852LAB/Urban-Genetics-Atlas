function assert(value, message) {
    if (!value) throw new Error(message);
    return value;
}

async function waitFor(read,message,timeout=45000) {
    const end=performance.now()+timeout;
    while (performance.now()<end) {
        const value=read();
        if (value) return value;
        await new Promise(resolve=>setTimeout(resolve,80));
    }
    throw new Error(message);
}

function bounded(promise,message) {
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(new Error(message)),45000);
    })]).finally(()=>clearTimeout(timer));
}

async function navigation() {
    const result={status:'REVIEW_REQUIRED',check_version:1,user_agent:navigator.userAgent,steps:[]};
    const el=id=>document.getElementById(id);
    const selection=window.UGA_V2_SELECTION;
    const network=window.UGA_V2_MOBILITY_NETWORK;
    const map=window.UGA_V2_MAP;
    const panel=el('placeReportPanel'), body=el('placeReportBody');
    let step='load staged route';
    try {
        assert(selection && network && map && panel && body,'Wait for the Atlas map and selection controls to load.');
        const base = window.UGA_V2_SITE_CONFIG.entities.baseUrl;
        async function entity(file, id) {
            const response = await fetch(new URL('entities/' + file + '.json', base));
            if (!response.ok) throw Error('Entity shard HTTP ' + response.status);
            return assert((await response.json()).records[id], 'Missing entity ' + id);
        }
        const building = '1312710915T20050430', hex = '70663', lot = '372000695';
        const [b,l] = await Promise.all([entity('building/00',building),entity('lot/06',lot)]);
        assert(b.hexes.some(x=>String(x.id)===hex) && b.lots.some(x=>String(x.id)===lot), 'Published entity relationship differs');
        const route = {building,hex,lot,address:b.address.trim(),building_title:b.name_en||b.name_zh||b.address,
            lot_title:'Lot '+l.lot_id,center:[Number(b.longitude),Number(b.latitude)]};
        result.route={building:route.building,hex:route.hex,lot:route.lot};
        await waitFor(()=>map.getLayer('v2-selected-place'),'The selected Hex layer did not load');
        const link=type=>assert([...body.querySelectorAll('[data-v2-focus-type][data-v2-focus-id]')]
            .find(b=>b.dataset.v2FocusType===type && b.dataset.v2FocusId===route[type]),'Missing linked '+type+' '+route[type]);
        function openLink(type) {
            const button=link(type);
            const tab=button.closest('[data-ug-report-panel]');
            if (tab?.dataset.active==='false') {
                const key=tab.dataset.ugReportPanel;
                const control=[...body.querySelectorAll('[data-report-tab]')].find(t=>t.dataset.reportTab===key);
                assert(control,'Missing report section tab').click();
            }
            const disclosure=button.closest('details');
            if (disclosure && !disclosure.open) disclosure.querySelector('summary').click();
            assert(button.getClientRects().length,'Linked '+type+' control is hidden');
            button.click();
        }
        async function report(type,depth) {
            const id=route[type];
            const title=type==='hex'?'LAB-ID-'+id:route[type+'_title'];
            await waitFor(()=>{
                if (body.querySelector('.v2-report-failure')) throw new Error('Atlas could not load the report');
                const s=selection.snapshot();
                const sheet=body.querySelector('.v2-report-sheet--'+type);
                return s.reportOpen && !panel.hidden && s.focus?.type===type && s.focus.id===id &&
                    s.historyDepth===depth && sheet?.querySelector('.v2-sheet-masthead h1')?.textContent.trim()===title.trim();
            },'Expected '+type+' report, heading and history depth '+depth);
            assert(selection.snapshot().selection?.buildingCsuid===route.building,'Root Building identity changed');
            assert(el('placeReportBack').getAttribute('aria-label')===(depth?'Back to previous report':'Back to map'),
                'Back control does not match report depth');
            result.steps.push({step,type,id,depth,pass:true});
        }
        step='search accepted street address';
        const input=el('v2AddressSearchInput');
        input.focus();
        input.value=route.address;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        const candidate=await waitFor(()=>{
            const s=el('v2AddressSearchStatus');
            if (['error','no_results'].includes(s.dataset.state)) throw new Error(s.textContent);
            return [...el('v2AddressSearchResults').querySelectorAll('button[data-v2-search-entity]')]
                .find(b=>b.dataset.v2SearchEntity===route.building && b.querySelector('.v2-address-result-meta')?.textContent.startsWith('building'));
        },'The address did not return the staged Building');
        candidate.click();
        await report('building',0);
        step='locate selected Building and primary Hex';
        await waitFor(()=>{
            const p=map.getCenter();
            return Math.abs(p.lng-route.center[0])<0.00002 && Math.abs(p.lat-route.center[1])<0.00002 &&
                map.getFilter('v2-selected-place')?.at(-1)===route.hex;
        },'Building centroid or primary Hex highlight differs');
        result.steps.push({step,pass:true});
        const back=()=>el('placeReportBack').click();
        for (const [action,type,depth] of [['open','hex',1],['open','building',2],['open','lot',3],
            ['back','building',2],['back','hex',1],['back','building',0]]) {
            step=action+' '+type+' at depth '+depth;
            if (action==='back') back(); else openLink(type);
            await report(type,depth);
        }
        step='close while the linked Hex report is loading';
        const previous=window.UGA_NAVIGATION_RENDER;
        openLink('hex');
        const pending=window.UGA_NAVIGATION_RENDER;
        assert(pending?.then && pending!==previous && body.querySelector('[data-state="loading"]'),'Linked render did not start');
        el('placeReportClose').click();
        await bounded(pending,'Closed Hex render did not settle');
        const s=selection.snapshot();
        assert(!s.selection && !s.reportOpen && panel.hidden && panel.getAttribute('aria-hidden')==='true' &&
            map.getFilter('v2-selected-place')?.at(-1)==='',
            'Closed report or cleared selection reappeared');
        result.steps.push({step,pass:true});
        result.status='UG_V2_HOSTED_REPORT_NAVIGATION_PASS';
    } catch (error) {
        const s=selection?.snapshot();
        result.steps.push({step,pass:false,error:String(error.message??error),
            focus:s?.focus,depth:s?.historyDepth,panel_hidden:panel?.hidden,title:el('placeReportTitle')?.textContent,
            heading:body?.querySelector('.v2-sheet-masthead h1')?.textContent,
            search_status:el('v2AddressSearchStatus')?.textContent,mobility_target:network?.state().target});
    }
    return result;
}

const release='V2RC-20261106T052258Z';
async function market(){
  const report = {status:'REVIEW_REQUIRED', check_version:1, release, views:{}};
  function requireValue(condition, message) {
    if (!condition) throw Error(message);
  }
  async function waitFor(read, message) {
    const end = Date.now() + 30000;
    do {
      const value = read();
      if (value) return value;
      await new Promise(resolve => setTimeout(resolve, 200));
    } while (Date.now() < end);
    throw Error(message);
  }
  try {
    const api = await waitFor(() => window.UGA_NEW_DEVELOPMENTS, 'New Developments module unavailable.');
    const snap = await waitFor(() => api.currentSnapshot(), 'Current Market snapshot unavailable.');
    const registry = api.registry();
    requireValue(registry && registry.run === snap.run, 'Current-area registry missing or from a different run.');
    const id = '2605', source = snap.records[id];
    requireValue(source?.name_en==='MOUNT PAVILIA' && snap.run==='20261030T012750439438Z','Market witness differs.');
    report.source_native_id = id;
    report.development = source.name_en || source.name_zh;
    report.snapshot_run = snap.run;
    performance.setResourceTimingBufferSize(Math.max(5000, performance.getEntriesByType('resource').length + 100));
    api.openSource(id, {forceDetail:true, tab:'snapshot'});
    const details = await waitFor(() => api.snapshotCache.get(id), 'Snapshot detail did not load for the selected source.');
    // Current-area details are requested when the reader selects Recorded entries.
    const recorded = await waitFor(() => document.querySelector('#placeReportBody [data-nd-kind="RECORDED"]'),
      'Recorded entries tab did not appear.');
    recorded.click();
    const area = await waitFor(() => api.registryCache.get(id), 'Current-area detail did not load for the selected source.');
    requireValue(details.run === snap.run && area.run === snap.run &&
      details.source_native_id === id && area.source_native_id === id &&
      area.fingerprint === registry.fingerprint, 'Detail identity or run mismatch.');
    const pane = document.querySelector('#placeReportBody');
    const host = pane?.closest('[data-external-report-kind="new-development"]');
    requireValue(host && !host.hidden && pane.getClientRects().length > 0 && api.state.selected === id, 'Selected source report is not visible.');
    const fileBase = 'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/' + release + '/site/market-new-developments/v0.6/';
    const resources = new Set(performance.getEntriesByType('resource').map(e => e.name));
    for (const path of [source.detail_file, registry.records[id].detail_file]) {
      requireValue(resources.has(fileBase + path), 'Missing browser request to the release detail URL for ' + path);
    }
    const localLinks = new Set();
    for (const [kind, rows, heading] of [
      ['ASKING', details.asking, 'Document date / basis'],
      ['RECORDED', details.recorded, 'Agreement date / state'],
      ['AREA', area.areas, 'Area document date']
    ]) {
      const select = pane.querySelector('[data-nd-kind="' + kind + '"]');
      requireValue(select, 'Missing report tab ' + kind);
      select.click();
      const table = pane.querySelector('.ug-nd-table table');
      const headings = Array.from(table?.querySelectorAll('th') || [], cell => cell.textContent.trim());
      const visible = table?.tBodies[0]?.rows.length;
      requireValue(pane.querySelector('[data-nd-kind="' + kind + '"][aria-pressed="true"]') &&
        headings.includes(heading) && rows.length > 0 && visible === Math.min(rows.length,50),
        kind + ' tab, columns or first-page row count differ.');
      if (kind === 'RECORDED') requireValue(headings.includes('HK$/sq ft · current area') &&
        headings.includes('HK$/sq ft · dated evidence'), 'Recorded rate bases are missing.');
      const totalLabel = rows.length.toLocaleString('en-HK') + ' ';
      const evidenceCount = Array.from(table.closest('section').children).some(node =>
        node.tagName === 'P' && node.textContent.startsWith(totalLabel));
      requireValue(evidenceCount, kind + ' displayed total differs from the source.');
      requireValue(rows.length === {ASKING:1, RECORDED:635, AREA:601}[kind],kind+' pinned count differs.');
      report.views[kind] = {source_rows:rows.length, first_page_rows:visible};
      for (const a of pane.querySelectorAll('a[href]')) {
        if (['127.0.0.1','localhost','[::1]'].includes(a.hostname)) localLinks.add(a.href);
      }
    }
    report.loopback_link_count = localLinks.size;
    requireValue(!localLinks.size, 'The hosted report offers source links to the reader’s own computer.');
    report.status = 'UG_V2_MARKET_SNAPSHOT_REPORT_EDGE_PASS';
  } catch (e) {
    report.error = String(e.message || e);
  }
  return report;
}

async function tileHeader(url) {
    const response = await fetch(url, {headers:{Range:'bytes=0-7'}, signal:AbortSignal.timeout(30000)});
    if (response.status !== 206) {
        await response.body?.cancel();
        throw Error('PMTiles header request returned HTTP ' + response.status);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== 8 || new TextDecoder().decode(bytes.slice(0,7)) !== 'PMTiles' || bytes[7] !== 3)
        throw Error('PMTiles v3 header mismatch');
    return {status:206, version:3};
}
async function checkOverlay(prefix, themeValue, layer, legendText) {
    const theme = document.getElementById(prefix+'Theme'), toggle = document.getElementById(prefix+'Toggle');
    const map = window.UGA_V2_MAP;
    assert(map && theme && toggle, prefix+' controls unavailable');
    const oldTheme = theme.value, wasOn = toggle.checked;
    function change(el){ el.dispatchEvent(new Event('change',{bubbles:true})); }
    try {
        theme.value=themeValue;
        assert(theme.value===themeValue,prefix+' theme unavailable');
        change(theme);toggle.checked=true;change(toggle);
        await waitFor(()=>map.getLayer(layer) && map.getLayoutProperty(layer,'visibility')==='visible' &&
            document.getElementById(prefix+'LegendHost')?.textContent.includes(legendText),prefix+' layer or legend unavailable');
        const src=map.getStyle().layers.find(l=>l.id===layer).source;
        await waitFor(()=>map.isSourceLoaded(src),prefix+' source still loading');
        const uri=map.getStyle().sources[src].url;
        assert(uri?.startsWith('pmtiles://https://'),prefix+' source URL differs');
        const header=await tileHeader(uri.slice('pmtiles://'.length));
        toggle.checked=false;change(toggle);
        await waitFor(()=>map.getLayoutProperty(layer,'visibility')==='none',prefix+' layer stayed visible');
        return {theme:themeValue,source:src,header,layer_and_legend:true,off:true};
    } catch (error) {
        const src=map.getStyle()?.layers?.find(item=>item.id===layer)?.source;
        error.overlay={
            module_loaded:!!window[prefix==='climate'?'UGA_V2_CLIMATE_MAP':'UGA_V2_NATIVE_DEMOGRAPHICS'],
            themes:Array.from(theme.options,option=>option.value),
            selected:theme.value, enabled:toggle.checked,
            style_loaded:map.isStyleLoaded(), atlas_source:!!map.getSource('atlas'),
            layer_present:!!map.getLayer(layer), visibility:src?map.getLayoutProperty(layer,'visibility'):null,
            source:src??null, source_loaded:src?map.isSourceLoaded(src):null,
            legend:document.getElementById(prefix+'LegendHost')?.textContent.trim().slice(0,160)
        };
        throw error;
    } finally {
        theme.value=oldTheme;change(theme);toggle.checked=wasOn;change(toggle);
    }
}
const runJourneySwitchCheck = (() => {
const road = 'ug-road-network';
const walk = 'ug-native-network-reach';
const hex = {grain:'hex', id:'100159', basis:'hex'};
const building = {grain:'building', id:'1075917036T20231102', basis:'building_nearest'};
const missing = {grain:'hex', id:'1', basis:'hex'};

function snapshot(network, map) {
    const s = network.state();
    return {
        target:s.target?.id, id:s.profile?.id, basis:s.profile?.basis, mode:s.modes,
        minutes:s.minutes, assessed:s.profile?.assessed, paths:s.pathVisible,
        backend:s.profile?.browserRoad ? 'road' : s.profile?.browserWalkRail ? 'walk-rail' : null,
        road_layer:!!map.getLayer(road+'-lines'), walk_layer:!!map.getLayer(walk+'-lines'),
        map_status:s.lastMessage,
    };
}

async function until(predicate) {
    const deadline = performance.now()+90000;
    while (!predicate()) {
        if (performance.now()>=deadline) throw new Error('Timed out waiting for the requested map state');
        await new Promise(resolve=>setTimeout(resolve,150));
    }
}

async function runJourneySwitchCheck(root) {
    const network = root.UGA_V2_MOBILITY_NETWORK;
    const map = root.UGA_V2_MAP;
    if (!network || !map) throw new Error('Wait until Atlas loads.');
    const result = {status:'REVIEW_REQUIRED', check_version:1, user_agent:root.navigator.userAgent, cases:[]};
    const cases = [
        {name:'pending walk to car', from:'walk', to:'car', place:hex, minutes:20, source:road, count:25053},
        {name:'pending taxi to walk', from:'taxi', to:'walk', place:building, minutes:60, source:walk, count:5297},
        {name:'replace assessed origin with unassessed Hex', from:'car', to:'all', place:hex, finalPlace:missing, minutes:30},
    ];
    for (const c of cases) {
        const row = {name:c.name};
        const started = performance.now();
        try {
            network.clear();
            network.changeJourney(60,c.from);
            await until(()=>map.isStyleLoaded());
            const first = network.show(c.place,c.place.basis);
            const place = c.finalPlace ?? c.place;
            if (c.finalPlace) network.setTarget(place);
            network.changeJourney(c.minutes,c.to);
            if (c.finalPlace) await network.show(place,place.basis);
            await first;
            await until(()=>{
                const s = network.state();
                if (!s.pathVisible || s.profile?.id!==place.id) return false;
                if (!c.source) return s.profile.assessed===false && s.lastMessage.includes('unassessed');
                return map.getLayer(c.source+'-lines') && map.getSource(c.source) &&
                    map.isSourceLoaded(c.source) && s.lastMessage.includes(c.count.toLocaleString());
            });
            const state = snapshot(network,map);
            const isRoad = c.source===road;
            const path = network.state().browserPath;
            let geometry = !path && !map.getSource(walk) && !map.getSource(road);
            if (isRoad) {
                const source = map.getSource(road);
                const data = source.getData ? await source.getData() : source.serialize().data;
                geometry = data?.id===place.id && data.basis===place.basis && data.modes===c.to &&
                    data.minutes===c.minutes && data.links===c.count && !map.getSource(walk);
            } else if (c.source===walk) {
                geometry = path?.id===place.id && path.mode===c.to && path.minutes===c.minutes &&
                    map.getLayoutProperty(walk+'-lines','visibility')==='visible' && !map.getSource(road);
            }
            row.pass = state.target===place.id && state.basis===place.basis &&
                state.mode===c.to && state.minutes===c.minutes && state.backend===(isRoad?'road':'walk-rail') &&
                state.assessed===Boolean(c.source) && state.road_layer===isRoad &&
                state.walk_layer===(c.source===walk) && geometry===true;
        } catch (error) {
            row.pass = false;
            row.error = String(error.message??error);
        }
        row.state = snapshot(network,map);
        row.elapsed_ms = Math.round(performance.now()-started);
        result.cases.push(row);
        if (!row.pass) break;
    }
    if (result.cases.length===cases.length && result.cases.every(row=>row.pass)) result.status='UG_V2_JOURNEY_SWITCH_EDGE_PASS';
    return result;
}

return runJourneySwitchCheck;
})();

const runWalkRailDestinationsCheck = (() => {
const SOURCE = 'ug-native-destination-records';
const LAYER = SOURCE + '-points';
const LEGEND = '#ugMobilityCitywideSection [data-unet-named-host]';
const CASES = [
    {place:{grain:'hex',id:'100159',basis:'hex'},minutes:30,mode:'all',
        queries:[['EDB','lonlat',149,'READY'],['EDB','native_grid',149,'READY']]},
    {place:{grain:'hex',id:'175043',basis:'hex'},minutes:60,mode:'light',
        queries:[['LCSD_PARK_PILOT','lonlat',null,'RAIL_UNASSESSED']]},
    {place:{grain:'building',id:'1075917036T20231102',basis:'building_nearest'},minutes:60,mode:'walk',
        queries:[['LCSD_CULTURE','lonlat',0,'READY'],['LCSD_PARK_PILOT','lonlat',1,'READY']]},
    {place:{grain:'hex',id:'1',basis:'hex'},minutes:60,mode:'all',
        queries:[['EDB','lonlat',null,'ORIGIN_UNASSESSED']]},
];

async function waitFor(read, message) {
    const deadline = performance.now() + 45000;
    while (performance.now() < deadline) {
        const value = read();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve,200));
    }
    throw new Error(message);
}

function select(root, field, value) {
    if (!field || ![...field.options].some(option => option.value === value)) {
        throw new Error('Destination option is unavailable: ' + value);
    }
    field.value=value;
    field.dispatchEvent(new root.Event('change',{bubbles:true}));
}

async function mapKeys(map, network) {
    await waitFor(() => network.state().namedDestination?.pointsCurrent &&
        map.getLayer(LAYER) && map.getSource(SOURCE) && map.isSourceLoaded(SOURCE),
        'Destination point layer did not load');
    const source=map.getSource(SOURCE);
    const data=typeof source.getData==='function' ? await source.getData() : source.serialize?.()?.data;
    if (data?.type!=='FeatureCollection') throw new Error('Destination map source has no point collection');
    return data.features.map(feature => feature.properties.record_key);
}

async function runWalkRailDestinationsCheck(root) {
    const network=root.UGA_V2_MOBILITY_NETWORK, map=root.UGA_V2_MAP, doc=root.document;
    if (!network||!map) throw new Error('Wait until the Atlas map finishes loading.');
    const result={status:'REVIEW_REQUIRED',user_agent:root.navigator.userAgent,cases:[]};
    for (const {place,minutes,mode,queries} of CASES) {
        const started=performance.now();
        const row={place,minutes,mode,queries:[]};
        result.cases.push(row);
        const host=doc.createElement('div'), journey=doc.createElement('div'), report=doc.createElement('div');
        host.hidden=true;
        host.append(journey,report);
        doc.body.appendChild(host);
        try {
            network.clear();
            network.changeJourney(minutes,mode);
            const load=network.mountReport(journey,report,place.grain,place.id,()=>host.isConnected,place.basis,true);
            report.querySelector('details').open=true;
            await load();
            const profile=network.state().profile;
            const coverage=report.querySelector('[data-unet-destinations]');
            row.checks={
                browser_profile:profile?.browserWalkDestinations===true &&
                    profile?.destination_reach?.id===place.id && profile.destination_reach.basis===place.basis,
                report:place.id==='1' ? coverage.textContent.includes('no retained network start') :
                    !!coverage.querySelector('figure') &&
                    (mode!=='light'||coverage.textContent.includes('selected rail mode is unassessed')),
            };
            if (!row.checks.browser_profile) throw new Error(coverage.textContent.trim());
            report.querySelector('[data-unet-explore]').click();
            const legend=await waitFor(() => {
                const candidate=doc.querySelector(LEGEND);
                return candidate?.closest('[data-unet-named]')?.open && candidate.querySelector('[data-named-group]') ?
                    candidate : null;
            },'Destination legend did not open');
            for (const [group,view,expected,state] of queries) {
                const query={group,view};
                row.queries.push(query);
                try {
                    const category=legend.querySelector('[data-named-group]');
                    select(root,category,group);
                    if (view!=='lonlat') select(root,legend.querySelector('[data-named-view]'),view);
                    const response=await waitFor(() => {
                        const current=network.state().namedDestination;
                        return current?.group===group&&current.view===view ? current : null;
                    },legend.querySelector('[data-named-status]').textContent||'Destination response unavailable');
                    query.state=response.state;
                    query.total=response.total;
                    query.list_status=legend.querySelector('[data-named-status]').textContent;
                    const listed=[...legend.querySelectorAll('[data-named-point]')].map(node=>node.getAttribute('data-named-point'));
                    if (state==='READY') {
                        const points=await mapKeys(map,network);
                        query.map_points=points.length;
                        query.pass=response.state===state&&response.total===expected&&points.length===expected&&
                            listed.length===Math.min(expected,15)&&listed.every((key,i)=>key===points[i]);
                    } else {
                        await waitFor(() => !map.getSource(SOURCE),'Old destination points remained on the map');
                        query.map_points=0;
                        query.pass=response.state===state&&response.total===null&&listed.length===0&&
                            query.list_status.includes(state==='RAIL_UNASSESSED'?'selected rail mode':'no retained network start');
                    }
                } catch (error) {
                    query.pass=false;
                    query.error=String(error.message??error);
                    query.list_status=legend.querySelector('[data-named-status]')?.textContent;
                }
            }
            row.pass=Object.values(row.checks).every(Boolean)&&row.queries.every(query=>query.pass);
        } catch (error) {
            row.pass=false;
            row.error=String(error.message??error);
        } finally {
            host.remove();
        }
        row.elapsed_ms=Math.round(performance.now()-started);
    }
    if (result.cases.every(row=>row.pass)) result.status='UG_V2_WALK_RAIL_DESTINATIONS_EDGE_PASS';
    return result;
}

return runWalkRailDestinationsCheck;
})();
async function mobilityChecks() {
    const checks = {};
    async function run(name, test) {
        try { checks[name] = {pass:true, ...await test()}; }
        catch (error) { checks[name] = {pass:false, error:String(error.message ?? error)}; }
    }
    const prefix='./site/mobility-reader/v0.4/mobility-bundles/afb6007f0e7bb097b7a29ed775eb4303e9da4ab7e1fa37059fc88f894cb9ba2a-xy1/';
    const place={grain:'hex',id:'100159',basis:'hex'};
    await run('journey_switching',async()=>{
        const result=await runJourneySwitchCheck(window);
        return {...result,pass:result.status==='UG_V2_JOURNEY_SWITCH_EDGE_PASS'};
    });
    await run('road_and_taxi',async()=>{
        const {roadRequest}=await import(prefix+'road-client.mjs');
        const taxiPlace={grain:'building',id:'3293916362T20050430',basis:'building_initial'};
        const profile=await roadRequest({type:'profile',place:taxiPlace,mode:'taxi'});
        const bands=profile.rows.map(r=>r.links);
        assert(JSON.stringify(bands)==='[5008,45246,73326,102830,105194,105684]','Taxi band counts differ: '+bands.join(', '));
        const results={taxi_bands:bands};
        for (const [mode,count] of [['car',677],['taxi',793]]) {
            const data=await roadRequest({type:'facilities',mode});
            assert(data.features.length===count,mode+' facility count differs');
            results[mode+'_facilities']=count;
        }
        return results;
    });
    await run('rail_geometry_and_signature',async()=>{
        const {walkRailRequest}=await import(prefix+'walk-rail-client.mjs');
        const reach=await walkRailRequest({type:'network',place,minutes:60,mode:'all'});
        const bytes=await reach.blob.arrayBuffer();
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
        assert(hash==='47f71ca97b30c906404f22a3efe47d662818ac0dc6a415bd91964b59ff407a97' && reach.vertices===222893 && reach.intervals===71898,'Hosted rail geometry differs: '+hash);
        const sig=await window.UGA_V2_MOBILITY_NETWORK.signatureReading(place,place.basis,'all');
        assert(JSON.stringify(sig?.value?.hex)==='[162,478,830,1659,3326,4903]','Integrated Signature differs');
        return {geojson_sha256:hash, vertices:reach.vertices, intervals:reach.intervals, signature:sig.value.hex};
    });
    await run('destination_list_and_map',async()=>{
        const result=await runWalkRailDestinationsCheck(window);
        return {...result,pass:result.status==='UG_V2_WALK_RAIL_DESTINATIONS_EDGE_PASS'};
    });
    await run('citywide_reader',async()=>{
        const city=await waitFor(()=>window.UGA_MOBILITY_CITYWIDE,'Citywide reader did not start');
        const sig=window.UGA_V2_MOBILITY_PROFILES.signature;
        const ref=await sig.loadReferences(), rows=await sig.loadRecords();
        assert(ref.mapped===84877 && Object.keys(rows.public).length===40146,'Citywide Signature coverage differs');
        await city.loadRoadData();
        const map=window.UGA_V2_MAP, layer='ug-mobility-citywide-v01-fill';
        try {
            await city.open();
            await waitFor(()=>map.getLayer(layer) && map.getLayoutProperty(layer,'visibility')!=='none'
                && map.isSourceLoaded('ug-mobility-citywide-v01'),'Citywide Mobility layer did not display',90000);
        } finally { city.close(); }
        assert(map.getLayoutProperty(layer,'visibility')==='none','Citywide Mobility layer stayed visible');
        assert(map.getStyle().layers.find(l=>l.id===layer)?.['source-layer']==='mobility','Expected tiled citywide layer');return {mapped:ref.mapped, public_records:ref.public_count, layer_and_toggle:true};
    });
    const local=performance.getEntriesByType('resource').map(e=>new URL(e.name)).filter(u=>
        ['localhost','127.0.0.1','[::1]'].includes(u.hostname));
    checks.local_requests={pass:local.length===0,count:local.length};
    return {pass:Object.values(checks).every(c=>c.pass),checks};
}

async function check() {
    const result = {release, check_version:3, preview_build:'2f5eb4e0ad1c', status:'REVIEW_REQUIRED', user_agent:navigator.userAgent, tiles:{}};
    const config = window.UGA_V2_SITE_CONFIG;
    try { result.tiles.atlas=await tileHeader(config.map.pmtilesUrl); }
    catch(error) { result.tiles.atlas={error:String(error.message)}; }
    for (const [key,args] of Object.entries({
        census:['demographics','census_age65plus_pct','v2-census-context-points','Population aged 65+'],
        climate:['climate','heat','v2-climate-map-fill','Persistent Relative Surface Heat']
    })) {
        try { result.tiles[key]=await checkOverlay(...args); }
        catch(error) { result.tiles[key]={error:String(error.message),state:error.overlay}; }
    }
    result.navigation = await navigation();
    result.mobility = await mobilityChecks();
    result.market = await market();
    result.path_timings=window.UG_PATH_TIMINGS?.slice()||[];
    result.performance_candidate='performance-1';
    if (result.mobility.pass && result.tiles.atlas.status===206 && result.tiles.census.off && result.tiles.climate.off &&
        result.navigation.status==='UG_V2_HOSTED_REPORT_NAVIGATION_PASS' &&
        result.market.status==='UG_V2_MARKET_SNAPSHOT_REPORT_EDGE_PASS')
        result.status='UG_V2_HOSTED_MOBILITY_MARKET_EDGE_PASS';
    return result;
}
function panel() {
    const box = document.createElement('section');
    box.style.cssText='position:fixed;z-index:2147483647;bottom:12px;right:12px;max-height:42vh;overflow:auto;background:white;color:#142820;padding:10px;border:1px solid #678;max-width:min(38rem,90vw)';
    const start = document.createElement('button'), copy = document.createElement('button'), out = document.createElement('pre');
    start.textContent='Run Mobility and Market checks'; copy.textContent='Copy receipt'; copy.disabled=true;
    out.style.cssText='white-space:pre-wrap;font:12px monospace';
    start.onclick=async()=>{
        start.disabled=true;copy.disabled=true;out.textContent='Checking hosted Atlas…';
        try { out.textContent=JSON.stringify(await check(),null,2); }
        catch(e) { out.textContent=JSON.stringify({status:'REVIEW_REQUIRED',error:String(e.message)},null,2); }
        copy.disabled=false;start.disabled=false;
    };
    copy.onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);copy.textContent='Copied';}
        catch { const range=document.createRange();range.selectNodeContents(out);getSelection().removeAllRanges();getSelection().addRange(range); }};
    box.append(start,copy,out);document.body.append(box);
}
panel();
