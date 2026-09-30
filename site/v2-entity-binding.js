/* Urban Genetics Atlas V2 — entity/Hex report hydration boundary. */
(function attachUGAV2EntityBinding(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root) root.UGA_V2_ENTITY_BINDING=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createEntityBinding(){
    'use strict';
    const VERSION='V2_ENTITY_REPORT_BINDING_V0_2';

    async function hexRecord(hexId,hexProvider,hexBinding,fieldAdapter){
        if(!hexId||!hexProvider||!hexBinding||!fieldAdapter) return null;
        const hydrated=await hexBinding.hydrateHex(
            {type:'hex',id:String(hexId),hexId:String(hexId)},
            hexProvider,
            fieldAdapter
        );
        return hydrated?.record||null;
    }

    async function climateRecord(hexId,climateProvider){
        if(!hexId||!climateProvider?.loadHex) return null;
        return climateProvider.loadHex(String(hexId));
    }

    function mergeRows(primary,secondary){
        const result=[]; const seen=new Set();
        for(const row of [...(primary||[]),...(secondary||[])]){
            const id=String(row?.id??row?.hexId??row?.buildingCsuid??row?.lotCsuid??'');
            if(!id||seen.has(id)) continue;
            seen.add(id); result.push(row);
        }
        return Object.freeze(result);
    }

    async function hydrate(selection,focus,services={}){
        const active=focus||selection?.initialFocus;
        if(!selection||!active) throw new Error('Selection and report focus are required.');
        const provider=services.entityProvider;
        let relation=null;
        if(provider){
            relation=active.type==='hex'
                ? await provider.resolveHex(active.id)
                : await provider.resolveEntity(active.type,active.id);
        }
        const primaryHexId=active.type==='hex'
            ? String(active.id)
            : String(relation?.primaryHexId||selection.primaryHexId||'')||null;
        const [record,climate]=await Promise.all([
            hexRecord(
                primaryHexId,
                services.hexProvider,
                services.hexBinding,
                services.fieldAdapter
            ),
            climateRecord(
                primaryHexId,
                services.climateProvider
            )
        ]);
        const entities={
            buildings:mergeRows(relation?.buildings,selection.entities?.buildings),
            lots:mergeRows(relation?.lots,selection.entities?.lots),
            hexes:mergeRows(relation?.hexes,selection.entities?.hexes)
        };
        return Object.freeze({
            ...selection,
            version:selection.version,
            primaryHexId,
            hexId:primaryHexId,
            record,
            climateRecord:climate,
            climateState:!primaryHexId?'not_connected':climate?'loaded':'no_context',
            activeEntity:relation?.entity||null,
            entities:Object.freeze(entities),
            hydrationState:record?'loaded':relation?'entity_loaded':'not_loaded',
            methodVersion:relation?.methodVersion||selection.methodVersion
        });
    }

    return Object.freeze({version:VERSION,hydrate});
});
