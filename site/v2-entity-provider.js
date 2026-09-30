/* Urban Genetics Atlas V2 — local Address / Building / Lot entity provider. */
(function attachUGAV2EntityProvider(root,factory){
    const api=factory(root);
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root){
        root.UGA_V2_ENTITY_PROVIDER=api;
        root.UGA_V2_ADDRESS_PROVIDER=api;
    }
})(typeof globalThis!=='undefined'?globalThis:this,function createProvider(root){
    'use strict';

    const VERSION='V2_ENTITY_SEARCH_PROVIDER_V0_1';
    const DEFAULT_BASE='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/';
    const cache={manifest:null,search:new Map(),compact:new Map(),entity:new Map(),hex:new Map()};

    function config(){ return root?.UGA_V2_SITE_CONFIG?.entities||{}; }
    function base(){ const value=config().baseUrl||DEFAULT_BASE; return value.endsWith('/')?value:`${value}/`; }
    function clean(value){ const text=String(value??'').trim(); return text||null; }
    function numeric(value){ const result=Number(value); return Number.isFinite(result)?result:null; }
    function normalise(value){ return String(value??'').toLowerCase().replace(/[^0-9a-z\u3400-\u9fff]+/g,' ').trim().replace(/\s+/g,' '); }
    function tokens(value){ return normalise(value).split(' ').filter(Boolean); }
    function hasChinese(value){ return /[\u3400-\u9fff]/.test(value); }

    async function sha256(value){
        const bytes=new TextEncoder().encode(String(value));
        const digest=await root.crypto.subtle.digest('SHA-256',bytes);
        return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    async function idShard(value){ return (await sha256(value)).slice(0,2); }
    async function tokenBucket(token){
        if(hasChinese(token)) return `z${(await sha256(token[0])).slice(0,2)}`;
        const safe=token.replace(/[^0-9a-z]/g,'');
        return safe.slice(0,2).padEnd(2,'_');
    }
    async function fetchJson(url,signal){
        const response=await fetch(url,{signal,cache:'force-cache'});
        if(!response.ok) throw new Error(`Entity payload request failed (${response.status}): ${url}`);
        return response.json();
    }
    async function manifest(signal){
        if(!cache.manifest){
            cache.manifest=fetchJson(`${base()}manifest.json`,signal).catch(error=>{cache.manifest=null;throw error;});
        }
        return cache.manifest;
    }
    async function searchShard(bucket,signal){
        if(cache.search.has(bucket)) return cache.search.get(bucket);
        const info=await manifest(signal);
        const available=new Set((info.search?.buckets||[]).map(item=>String(item.bucket)));
        if(!available.has(bucket)) return {terms:{}};
        const promise=fetchJson(`${base()}search/shards/${bucket}.json`,signal).catch(error=>{cache.search.delete(bucket);throw error;});
        cache.search.set(bucket,promise);
        return promise;
    }
    async function compactShard(shard,signal){
        if(cache.compact.has(shard)) return cache.compact.get(shard);
        const promise=fetchJson(`${base()}search/entities/${shard}.json`,signal).catch(error=>{cache.compact.delete(shard);throw error;});
        cache.compact.set(shard,promise);
        return promise;
    }
    async function entityShard(type,shard,signal){
        const key=`${type}:${shard}`;
        if(cache.entity.has(key)) return cache.entity.get(key);
        const promise=fetchJson(`${base()}entities/${type}/${shard}.json`,signal).catch(error=>{cache.entity.delete(key);throw error;});
        cache.entity.set(key,promise);
        return promise;
    }
    async function hexShard(shard,signal){
        if(cache.hex.has(shard)) return cache.hex.get(shard);
        const promise=fetchJson(`${base()}relationships/hex/${shard}.json`,signal).catch(error=>{cache.hex.delete(shard);throw error;});
        cache.hex.set(shard,promise);
        return promise;
    }

    function unionForPrefix(terms,prefix){
        const ids=new Set();
        (terms?.[prefix]||[]).forEach(id=>ids.add(String(id)));
        Object.entries(terms||{}).forEach(([token,rows])=>{
            if(token!==prefix&&token.startsWith(prefix)) (rows||[]).forEach(id=>ids.add(String(id)));
        });
        return ids;
    }
    function intersect(sets){
        if(!sets.length) return new Set();
        const ordered=[...sets].sort((a,b)=>a.size-b.size);
        const result=new Set(ordered[0]);
        for(const set of ordered.slice(1)){
            for(const value of result) if(!set.has(value)) result.delete(value);
        }
        return result;
    }
    async function compactRecords(entityKeys,options={}){
        const groups=new Map();
        for(const key of entityKeys){
            const [,id]=String(key).split(':',2);
            const shard=await idShard(id);
            if(!groups.has(shard)) groups.set(shard,[]);
            groups.get(shard).push(String(key));
        }
        const records=new Map();
        await Promise.all([...groups].map(async([shard,keys])=>{
            const payload=await compactShard(shard,options.signal);
            for(const key of keys){
                const record=payload.records?.[key];
                if(record) records.set(key,record);
            }
        }));
        return records;
    }
    function recordText(record){
        return normalise([record.id,record.name_en,record.name_zh,record.address,record.lot_id,...(record.lot_ids||[])].filter(Boolean).join(' '));
    }
    function score(record,query){
        const q=normalise(query); const text=recordText(record); const id=normalise(record.id);
        const nameEn=normalise(record.name_en); const nameZh=normalise(record.name_zh);
        const address=normalise(record.address); const lotIds=(record.lot_ids||[]).map(normalise);
        if(q===id||lotIds.includes(q)||normalise(record.lot_id)===q) return 1000;
        if(q===nameEn||q===nameZh||q===address) return 960;
        if(nameEn.startsWith(q)||nameZh.startsWith(q)||address.startsWith(q)) return 900;
        const queryTokens=tokens(q);
        if(!queryTokens.every(term=>text.split(' ').some(token=>token.startsWith(term)))) return -1;
        return 700+queryTokens.length*20-(text.length/1000);
    }
    function candidate(key,record,query){
        const type=key.startsWith('l:')?'lot':'building';
        const q=normalise(query); const address=normalise(record.address);
        const matchType=type==='lot'?'lot_id':address && tokens(q).every(term=>address.includes(term))?'address':q===normalise(record.id)?'building_csuid':'building_name';
        const primary=type==='lot'
            ? (record.lot_id?`Lot ${record.lot_id}`:`Lot ${record.id}`)
            : (record.name_en||record.name_zh||record.address||`Building ${record.id}`);
        const secondary=type==='lot'
            ? `LotCSUID ${record.id}`
            : (record.address||record.name_zh||`BuildingCSUID ${record.id}`);
        return {
            search_record_id:key,entity_type:type,entity_id:String(record.id),
            building_csuid:type==='building'?String(record.id):null,
            lot_csuid:type==='lot'?String(record.id):null,lot_id:type==='lot'?clean(record.lot_id):null,
            match_type:matchType,display_label_en:primary,display_label_zh:type==='building'?clean(record.name_zh):null,
            secondary_label:secondary,longitude:numeric(record.longitude),latitude:numeric(record.latitude),
            ambiguity_state:'resolved_candidate',source:'V2_ENTITY_MARKET_DEMOGRAPHICS_BROWSER_V0_1',method_version:VERSION
        };
    }
    async function search(query,options={}){
        const queryTokens=tokens(query);
        if(!queryTokens.length) return [];
        const sets=[];
        for(const token of queryTokens){
            const bucket=await tokenBucket(token);
            const payload=await searchShard(bucket,options.signal);
            sets.push(unionForPrefix(payload.terms,token));
        }
        const matches=[...intersect(sets)].slice(0,128);
        if(!matches.length) return [];
        const previews=await compactRecords(matches,{signal:options.signal});
        const limit=Math.max(1,Math.min(Number(options.limit)||10,25));
        return matches.map(key=>({key,record:previews.get(key)})).filter(item=>item.record)
            .map(item=>({...item,score:score(item.record,query)})).filter(item=>item.score>=0)
            .sort((a,b)=>b.score-a.score||String(a.record.name_en||a.record.lot_id||a.record.id).localeCompare(String(b.record.name_en||b.record.lot_id||b.record.id)))
            .slice(0,limit).map(item=>candidate(item.key,item.record,query));
    }

    async function fullEntity(type,id,options={}){
        const shard=await idShard(id); const payload=await entityShard(type,shard,options.signal);
        const record=payload.records?.[String(id)];
        if(!record) throw new Error(`${type} record not found: ${id}`);
        return record;
    }
    function relatedKeys(entity){
        const rows=[];
        if(entity.type==='building') (entity.lots||[]).slice(0,32).forEach(row=>rows.push(`l:${row.id}`));
        if(entity.type==='lot') (entity.buildings||[]).slice(0,32).forEach(row=>rows.push(`b:${row.id}`));
        return rows;
    }
    async function enrichEntity(entity,options={}){
        const previews=await compactRecords(relatedKeys(entity),options);
        const hexes=(entity.hexes||[]).map((row,index)=>({
            ...row,hexId:String(row.id),id:String(row.id),type:'hex',primary:index===0,
            relationshipRole:'POLYGON_INTERSECTION',relationshipShare:row.share,
            relationshipShareRelated:row.share_related??row.share_entity??null,
            overlapM2:row.overlap_m2??null
        }));
        if(entity.type==='building'){
            const lots=(entity.lots||[]).map(row=>{
                const preview=previews.get(`l:${row.id}`)||{};
                return {...row,id:String(row.id),type:'lot',lotCsuid:String(row.id),lotId:row.lot_id||preview.lot_id||null,
                    displayLabelEn:row.lot_id||preview.lot_id?`Lot ${row.lot_id||preview.lot_id}`:`Lot ${row.id}`,
                    relationshipRole:'POLYGON_INTERSECTION',relationshipShare:row.share,
                    relationshipShareRelated:row.share_related??row.share_entity??null,overlapM2:row.overlap_m2??null};
            });
            return {entity,buildings:[entity],lots,hexes};
        }
        const buildings=(entity.buildings||[]).map(row=>{
            const preview=previews.get(`b:${row.id}`)||{};
            return {...row,id:String(row.id),type:'building',buildingCsuid:String(row.id),
                displayLabelEn:preview.name_en||preview.address||`Building ${row.id}`,displayLabelZh:preview.name_zh||null,
                relationshipRole:'POLYGON_INTERSECTION',relationshipShare:row.share,
                relationshipShareRelated:row.share_related??row.share_entity??null,overlapM2:row.overlap_m2??null};
        });
        return {entity,buildings,lots:[entity],hexes};
    }
    async function resolveEntity(type,id,options={}){
        if(!['building','lot'].includes(type)) throw new Error(`Unsupported entity type: ${type}`);
        const entity=await fullEntity(type,String(id),options);
        const enriched=await enrichEntity(entity,options);
        return {...enriched,primaryHexId:enriched.hexes[0]?.id||null,source:'V2_ENTITY_MARKET_DEMOGRAPHICS_BROWSER_V0_1',methodVersion:VERSION};
    }
    async function resolveHex(hexId,options={}){
        const id=String(hexId); const shard=await idShard(id); const payload=await hexShard(shard,options.signal);
        const raw=payload.records?.[id]||{buildings:[],lots:[]};
        const keys=[...(raw.buildings||[]).slice(0,36).map(row=>`b:${row.id}`),...(raw.lots||[]).slice(0,36).map(row=>`l:${row.id}`)];
        const previews=await compactRecords(keys,options);
        const buildings=(raw.buildings||[]).map(row=>{const p=previews.get(`b:${row.id}`)||{};return {...row,id:String(row.id),type:'building',buildingCsuid:String(row.id),displayLabelEn:p.name_en||p.address||`Building ${row.id}`,displayLabelZh:p.name_zh||null,relationshipRole:'POLYGON_INTERSECTION',relationshipShare:row.share,relationshipShareRelated:row.share_entity??null,overlapM2:row.overlap_m2??null};});
        const lots=(raw.lots||[]).map(row=>{const p=previews.get(`l:${row.id}`)||{};return {...row,id:String(row.id),type:'lot',lotCsuid:String(row.id),lotId:p.lot_id||null,displayLabelEn:p.lot_id?`Lot ${p.lot_id}`:`Lot ${row.id}`,relationshipRole:'POLYGON_INTERSECTION',relationshipShare:row.share,relationshipShareRelated:row.share_entity??null,overlapM2:row.overlap_m2??null};});
        return {entity:{id,type:'hex'},buildings,lots,hexes:[{id,type:'hex',hexId:id,primary:true}],primaryHexId:id,source:'V2_ENTITY_MARKET_DEMOGRAPHICS_BROWSER_V0_1',methodVersion:VERSION};
    }
    async function resolve(candidate,options={}){
        const type=candidate.entityType||candidate.entity_type||(candidate.lotCsuid||candidate.lot_csuid?'lot':'building');
        const id=candidate.entityId||candidate.entity_id||candidate.buildingCsuid||candidate.building_csuid||candidate.lotCsuid||candidate.lot_csuid;
        const resolution=await resolveEntity(type,id,options);
        return {...resolution,searchRecordId:candidate.searchRecordId||candidate.search_record_id};
    }
    async function resolveBuilding(id,options={}){ return resolveEntity('building',id,options); }
    async function resolveLot(id,options={}){ return resolveEntity('lot',id,options); }
    async function status(){ const info=await manifest(); return {version:VERSION,buildings:info.entities?.building_records,lots:info.entities?.lot_records,buildingLotRelationships:info.relationships?.building_lot,addressBearingBuildings:46557}; }

    return Object.freeze({version:VERSION,normalise,search,resolve,resolveEntity,resolveBuilding,resolveLot,resolveHex,status,idShard,tokenBucket});
});
