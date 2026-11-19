/* Urban Genetics Atlas V2 — static Building name/ID search provider. */
(function attachUGAV2BuildingSearchProvider(root,factory){
    const api=factory(root);
    if(typeof module === 'object' && module.exports) module.exports=api;
    if(root) root.UGA_V2_ADDRESS_PROVIDER=api;
})(typeof globalThis !== 'undefined' ? globalThis : this,function createProvider(root){
    'use strict';

    const VERSION='V2_BUILDING_SEARCH_PROVIDER_V0_1';
    const DEFAULT_MANIFEST='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/v2/building-search/v0.1/manifest.json';
    const DEFAULT_SHARDS='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/v2/building-search/v0.1/shards/{bucket}.json';
    const shardCache=new Map();
    const recordsByBuilding=new Map();
    let manifestPromise=null;

    function normalise(value){
        return String(value??'')
            .toLowerCase()
            .replace(/[^0-9a-z\u3400-\u9fff]+/g,' ')
            .trim()
            .replace(/\s+/g,' ');
    }

    function bucketFor(query){
        const first=normalise(query).split(' ')[0] || '';
        if(/[\u3400-\u9fff]/.test(first)) return 'zh';
        const safe=first.replace(/[^0-9a-z]/g,'');
        return safe.slice(0,2).padEnd(2,'_');
    }

    function config(){
        const runtime=root?.UGA_V2_SITE_CONFIG || {};
        return runtime.buildingSearch || {};
    }

    async function fetchJson(url,signal){
        const response=await fetch(url,{signal,cache:'force-cache'});
        if(!response.ok) throw new Error(`Building-search request failed (${response.status}): ${url}`);
        return response.json();
    }

    async function loadManifest(signal){
        if(!manifestPromise){
            manifestPromise=fetchJson(config().manifestUrl || DEFAULT_MANIFEST,signal)
                .catch(error=>{ manifestPromise=null; throw error; });
        }
        return manifestPromise;
    }

    async function loadBucket(bucket,signal){
        if(shardCache.has(bucket)) return shardCache.get(bucket);
        const manifest=await loadManifest(signal);
        const available=new Set((manifest.buckets || []).map(item=>String(item.bucket)));
        if(!available.has(bucket)) return [];
        const pattern=config().shardUrlPattern || manifest.shard_url_pattern || DEFAULT_SHARDS;
        const payload=await fetchJson(pattern.replace('{bucket}',bucket),signal);
        const rows=Array.isArray(payload.records) ? payload.records : [];
        rows.forEach(record=>recordsByBuilding.set(String(record.b),record));
        shardCache.set(bucket,rows);
        return rows;
    }

    function searchableText(record){
        return normalise([
            record.b,
            record.en,
            record.zh,
            ...(record.aliases || [])
        ].filter(Boolean).join(' '));
    }

    function score(record,query){
        const q=normalise(query);
        const id=normalise(record.b);
        const english=normalise(record.en);
        const chinese=normalise(record.zh);
        const aliases=(record.aliases || []).map(normalise);
        const text=searchableText(record);
        const queryTerms=q.split(' ').filter(Boolean);
        const recordTerms=text.split(' ').filter(Boolean);
        if(q === id) return 1000;
        if(english === q || chinese === q || aliases.includes(q)) return 950;
        if(id.startsWith(q)) return 900;
        if(english.startsWith(q) || chinese.startsWith(q)) return 850;
        const allTerms=queryTerms.every(term=>recordTerms.some(token=>token.startsWith(term)) || text.includes(term));
        if(!allTerms) return -1;
        const prefixMatches=queryTerms.filter(term=>recordTerms.some(token=>token.startsWith(term))).length;
        return 600 + prefixMatches * 20 - Math.min(english.length || text.length,100) / 100;
    }

    function candidate(record,query){
        const q=normalise(query);
        const matchType=normalise(record.b).startsWith(q)
            ? 'building_csuid'
            : /[\u3400-\u9fff]/.test(q) || (record.aliases || []).some(alias=>normalise(alias).includes(q))
                ? 'alias'
                : 'building_name';
        return {
            search_record_id:record.id,
            building_csuid:record.b,
            match_type:matchType,
            display_label_en:record.en || record.heritageNameEn || `Building ${record.b}`,
            display_label_zh:record.zh || record.heritageNameZh || null,
            longitude:record.x,
            latitude:record.y,
            ambiguity_state:'resolved_candidate',
            source:'V2_BUILDING_SEARCH_INDEX_V0_1',
            method_version:VERSION
        };
    }

    async function search(query,options={}){
        const bucket=bucketFor(query);
        if(!bucket) return [];
        const rows=await loadBucket(bucket,options.signal);
        const limit=Math.max(1,Math.min(Number(options.limit)||8,25));
        return rows
            .map(record=>({record,score:score(record,query)}))
            .filter(item=>item.score>=0)
            .sort((a,b)=>b.score-a.score || String(a.record.en||a.record.b).localeCompare(String(b.record.en||b.record.b)))
            .slice(0,limit)
            .map(item=>candidate(item.record,query));
    }

    async function resolveBuilding(buildingCsuid,options={}){
        const id=String(buildingCsuid??'').trim();
        if(!id) throw new Error('BuildingCSUID is required.');
        let record=recordsByBuilding.get(id);
        if(!record){
            await loadBucket(bucketFor(id),options.signal);
            record=recordsByBuilding.get(id);
        }
        if(!record) throw new Error(`Building record not found: ${id}`);
        const hexes=record.h ? [{
            hex_id:String(record.h),
            primary:true,
            relationship_role:'CENTROID_CONTEXT',
            centroid_distance_m:record.hd
        }] : [];
        return {
            search_record_id:record.id,
            building:{
                building_csuid:record.b,
                building_structure_id:record.sid,
                building_id:record.bid,
                display_label_en:record.en || record.heritageNameEn || `Building ${record.b}`,
                display_label_zh:record.zh || record.heritageNameZh || null,
                longitude:record.x,
                latitude:record.y,
                storeys_above_ground:record.st,
                basement_storeys:record.bs,
                building_height_m:record.ht,
                top_height_m:record.top,
                base_height_m:record.base,
                use_description:record.use,
                building_status:record.status,
                estimated_floor_area_m2:record.gfa,
                footprint_m2:record.fp,
                year:record.year,
                heritage_name_en:record.heritageNameEn,
                heritage_name_zh:record.heritageNameZh,
                heritage_grade:record.heritageGrade,
                heritage_grade_year:record.heritageYear,
                heritage_image_url:record.heritageImage
            },
            lots:[],
            hexes,
            primary_hex_id:record.h || null,
            ambiguity_state:'resolved',
            source:'V2_BUILDING_SEARCH_INDEX_V0_1',
            method_version:VERSION
        };
    }

    async function status(){
        const manifest=await loadManifest();
        return Object.freeze({
            version:VERSION,
            records:manifest.records,
            namedRecords:manifest.named_records,
            centroidContextHexRecords:manifest.centroid_context_hex_records,
            streetAddressCoverage:manifest.street_address_coverage,
            lotRelationships:manifest.lot_relationships
        });
    }

    return Object.freeze({version:VERSION,search,resolveBuilding,status,normalise,bucketFor});
});
