/* Urban Genetics Atlas V2 — Address / Building / Lot search contract. */
(function attachUGAV2AddressSearch(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root) root.UGA_V2_ADDRESS_SEARCH=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createSearchContract(){
    'use strict';
    const VERSION='V2_ENTITY_SEARCH_CONTRACT_V0_2';
    const TYPES=['building','lot'];
    const MATCH_TYPES=['address','building_name','building_csuid','georef_no','lot_id','lot_csuid','alias'];
    function clean(value){ const text=String(value??'').trim(); return text||null; }
    function finite(value){ const number=Number(value); return Number.isFinite(number)?number:null; }
    function normaliseQuery(value){ return clean(value)?.replace(/\s+/g,' ')||''; }
    function normaliseResult(result){
        if(!result||typeof result!=='object') throw new Error('Search result must be an object.');
        const entityType=clean(result.entityType??result.entity_type??(result.lotCsuid||result.lot_csuid?'lot':'building'));
        const entityId=clean(result.entityId??result.entity_id??result.buildingCsuid??result.building_csuid??result.lotCsuid??result.lot_csuid);
        const searchRecordId=clean(result.searchRecordId??result.search_record_id);
        const matchType=clean(result.matchType??result.match_type);
        const displayLabelEn=clean(result.displayLabelEn??result.display_label_en);
        const displayLabelZh=clean(result.displayLabelZh??result.display_label_zh);
        if(!TYPES.includes(entityType)) throw new Error(`Unsupported entity type: ${entityType||'missing'}.`);
        if(!entityId||!searchRecordId) throw new Error('Search result requires stable entity_id and search_record_id.');
        if(!MATCH_TYPES.includes(matchType)) throw new Error(`Unsupported search match type: ${matchType||'missing'}.`);
        if(!displayLabelEn&&!displayLabelZh) throw new Error('Search result requires a display label.');
        const longitude=finite(result.longitude); const latitude=finite(result.latitude);
        return Object.freeze({
            ...result,searchRecordId,entityType,entityId,matchType,displayLabelEn,displayLabelZh,
            secondaryLabel:clean(result.secondaryLabel??result.secondary_label),
            buildingCsuid:entityType==='building'?entityId:null,lotCsuid:entityType==='lot'?entityId:null,
            lotId:clean(result.lotId??result.lot_id),
            coordinates:longitude!==null&&latitude!==null?Object.freeze({lng:longitude,lat:latitude}):null,
            ambiguityState:clean(result.ambiguityState??result.ambiguity_state)||'candidate',
            source:clean(result.source),methodVersion:clean(result.methodVersion??result.method_version)
        });
    }
    function assertProvider(provider){
        if(!provider||typeof provider.search!=='function'||typeof provider.resolve!=='function') throw new Error('Address / Building / Lot search provider is not connected.');
        return provider;
    }
    async function search(provider,query,options={}){
        const text=normaliseQuery(query);
        if(text.length<(options.minLength??2)) return Object.freeze({status:'too_short',query:text,results:Object.freeze([]),message:'Enter at least two characters.'});
        assertProvider(provider);
        const raw=await provider.search(text,{limit:Math.max(1,Math.min(Number(options.limit)||10,25)),signal:options.signal});
        const rows=Array.isArray(raw)?raw:(raw?.results||[]);
        const results=Object.freeze(rows.map(normaliseResult));
        return Object.freeze({status:results.length?'results':'no_results',query:text,results,message:results.length?null:'No matching address, Building or Lot was found.'});
    }
    async function resolve(provider,result,options={}){
        assertProvider(provider); const candidate=normaliseResult(result);
        const resolution=await provider.resolve(candidate,{signal:options.signal});
        if(!resolution||!resolution.entity) throw new Error('Entity resolution did not return an entity record.');
        if(String(resolution.entity.id)!==candidate.entityId||resolution.entity.type!==candidate.entityType) throw new Error('Entity resolution returned a different stable entity.');
        return Object.freeze({...resolution,searchRecordId:resolution.searchRecordId||candidate.searchRecordId,candidate});
    }
    function providerStatus(provider){
        try{assertProvider(provider);return Object.freeze({connected:true,state:'ready',message:'Address, Building and Lot search connected.'});}
        catch(error){return Object.freeze({connected:false,state:'not_connected',message:error.message});}
    }
    return Object.freeze({version:VERSION,entityTypes:TYPES,matchTypes:MATCH_TYPES,normaliseQuery,normaliseResult,providerStatus,search,resolve});
});
