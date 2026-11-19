/* Urban Genetics Atlas V2 — Climate Hex lookup provider. */
(function attachUGAV2ClimateProvider(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root) root.UGA_V2_CLIMATE_PROVIDER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function createUGAV2ClimateProvider(){
    'use strict';

    const VERSION='V2_CLIMATE_PROVIDER_V0_2';
    const MASTER_HEXES=374784;

    function normaliseHexId(value){
        const text=String(value??'').trim();
        if(!/^\d+$/.test(text)) throw new Error('Climate Hex ID must be a positive integer.');
        const number=Number(text);
        if(!Number.isSafeInteger(number)||number<1||number>MASTER_HEXES){
            throw new Error('Climate Hex ID is outside the canonical range.');
        }
        return number;
    }

    function baseDirectory(url){
        const text=String(url||'');
        const index=text.lastIndexOf('/');
        return index>=0 ? text.slice(0,index+1) : '';
    }

    function resolveRelative(base,relative){
        const value=String(relative||'');
        if(/^(?:[a-z]+:)?\/\//i.test(value)||value.startsWith('/')) return value;
        return `${baseDirectory(base)}${value}`;
    }

    function numeric(value){
        const n=Number(value);
        return Number.isFinite(n)?n:null;
    }

    function percentileFromQuantiles(value,quantiles){
        const x=numeric(value);
        if(x===null||!Array.isArray(quantiles)||quantiles.length!==101) return null;
        if(x<=Number(quantiles[0])) return 0;
        if(x>=Number(quantiles[100])) return 100;
        for(let i=1;i<quantiles.length;i+=1){
            const lo=Number(quantiles[i-1]);
            const hi=Number(quantiles[i]);
            if(x<=hi){
                if(!Number.isFinite(lo)||!Number.isFinite(hi)) return null;
                if(hi===lo) return i;
                return (i-1)+((x-lo)/(hi-lo));
            }
        }
        return 100;
    }

    function robustPosition(value,distribution){
        const x=numeric(value);
        const low=numeric(distribution?.p05);
        const high=numeric(distribution?.p95);
        if(x===null||low===null||high===null||high===low) return null;
        return Math.max(0,Math.min(100,((x-low)/(high-low))*100));
    }

    function profileMetric(value,distribution,options={}){
        const percentile=percentileFromQuantiles(value,distribution?.quantiles_0_100);
        const position=robustPosition(value,distribution);
        const low=numeric(distribution?.p05);
        const median=numeric(distribution?.p50);
        const high=numeric(distribution?.p95);
        if(percentile===null||position===null||low===null||median===null||high===null) return null;
        const result={
            percentile,
            position,
            low,
            median,
            high,
            count:Number(distribution?.n)||0
        };
        if(options.zeroReference){
            result.zeroPosition=Math.max(0,Math.min(100,((0-low)/(high-low))*100));
        }
        if(options.invertPercentile){
            result.inversePercentile=Math.max(0,Math.min(100,100-percentile));
        }
        return Object.freeze(result);
    }

    function createClimateProvider(options={}){
        const config=options.config||(typeof globalThis!=='undefined'&&globalThis.UGA_V2_SITE_CONFIG);
        const fetchImpl=options.fetchImpl||(typeof fetch==='function'&&fetch.bind(globalThis));
        if(!config?.climate) throw new Error('V2 Climate config is required.');
        if(!fetchImpl) throw new Error('A fetch implementation is required.');

        const maxCached=Number.isInteger(options.maxCachedChunks)
            ? Math.max(1,options.maxCachedChunks)
            : Number(config.climate.maxCachedChunks)||4;
        const cache=new Map();
        let manifestPromise=null;
        let profilePromise=null;

        async function fetchJson(url){
            const response=await fetchImpl(url,{cache:'force-cache'});
            if(!response||!response.ok) throw new Error(`V2 Climate provider request failed: ${url}`);
            return response.json();
        }

        function validateManifest(value){
            if(value?.status!=='FROZEN_QA_PASSED') throw new Error('V2 Climate manifest is not frozen / QA passed.');
            if(Number(value.master_hex_population)!==MASTER_HEXES) throw new Error('V2 Climate master-Hex population mismatch.');
            if(Number(value.climate_context_hexes)!==Number(config.climate.contextHexes)) throw new Error('V2 Climate context population mismatch.');
            if(Number(value.chunk_size)!==Number(config.climate.chunkSize)) throw new Error('V2 Climate chunk-size mismatch.');
            if(Number(value.chunk_count)!==Number(config.climate.chunks)) throw new Error('V2 Climate chunk-count mismatch.');
            if(!Array.isArray(value.chunks)||value.chunks.length!==Number(config.climate.chunks)) throw new Error('V2 Climate chunk manifest is incomplete.');
            if(!Array.isArray(value.record_layout?.fields)) throw new Error('V2 Climate field layout is missing.');
            return value;
        }

        function validateProfile(value){
            if(value?.status!=='FROZEN_QA_PASSED'||value?.product!=='CLIMATE_PROFILE_CALIBRATION_V0.1'){
                throw new Error('V2 Climate profile calibration is not frozen / QA passed.');
            }
            const fields=['heat_persistent_relative_c','heat_interannual_mad_c','terrain_elevation_mean_m_hkpd'];
            for(const field of fields){
                const d=value.distributions?.[field];
                if(!d||!Array.isArray(d.quantiles_0_100)||d.quantiles_0_100.length!==101){
                    throw new Error(`V2 Climate profile calibration missing ${field}.`);
                }
            }
            return value;
        }

        function loadManifest(){
            if(!manifestPromise){
                manifestPromise=fetchJson(config.climate.manifestUrl).then(validateManifest);
            }
            return manifestPromise;
        }

        function loadProfile(){
            if(!config.climate.profileUrl) return Promise.resolve(null);
            if(!profilePromise){
                profilePromise=fetchJson(config.climate.profileUrl).then(validateProfile);
            }
            return profilePromise;
        }

        function chunkIndexForHex(hexId,manifest){
            const id=normaliseHexId(hexId);
            return Math.floor((id-1)/Number(manifest.chunk_size));
        }

        function decodeStatus(field,value,manifest){
            if(value===null||value===undefined) return null;
            const codes=manifest.codes?.[field];
            if(!codes) return value;
            const decoded=codes[String(value)];
            if(decoded===undefined) throw new Error(`V2 Climate code mismatch for ${field}: ${value}`);
            return decoded;
        }

        function decodeRecord(hexId,row,manifest,profile){
            if(row===null||row===undefined) return null;
            if(!Array.isArray(row)) throw new Error('V2 Climate row is not a compact record array.');
            const fields=manifest.record_layout.fields;
            const result={hex_id:String(normaliseHexId(hexId))};
            for(const definition of fields){
                const index=Number(definition.index);
                const name=String(definition.name||'');
                if(!name||!Number.isInteger(index)||index<0||index>=row.length){
                    throw new Error('V2 Climate compact record layout mismatch.');
                }
                result[name]=decodeStatus(name,row[index],manifest);
            }
            if(profile){
                result.climate_profile=Object.freeze({
                    heatRelative:profileMetric(
                        result.heat_persistent_relative_c,
                        profile.distributions.heat_persistent_relative_c,
                        {zeroReference:true}
                    ),
                    heatVariability:profileMetric(
                        result.heat_interannual_mad_c,
                        profile.distributions.heat_interannual_mad_c,
                        {invertPercentile:true}
                    ),
                    terrainElevation:profileMetric(
                        result.terrain_elevation_mean_m_hkpd,
                        profile.distributions.terrain_elevation_mean_m_hkpd
                    ),
                    calibrationVersion:String(profile.product)
                });
            }
            result.climate_site_lookup_version=String(manifest.product||VERSION);
            return Object.freeze(result);
        }

        async function loadChunk(index,manifest){
            if(cache.has(index)){
                const value=cache.get(index);
                cache.delete(index);
                cache.set(index,value);
                return value;
            }
            const entry=manifest.chunks[index];
            if(!entry) throw new Error(`V2 Climate chunk ${index} is not declared.`);
            const url=resolveRelative(config.climate.manifestUrl,entry.file);
            const payload=await fetchJson(url);
            if(Number(payload?.s)!==Number(entry.start_hex_id)||Number(payload?.e)!==Number(entry.end_hex_id)||!Array.isArray(payload?.r)){
                throw new Error(`V2 Climate chunk ${index} contract mismatch.`);
            }
            const expected=Number(entry.end_hex_id)-Number(entry.start_hex_id)+1;
            if(payload.r.length!==expected) throw new Error(`V2 Climate chunk ${index} row-slot mismatch.`);
            cache.set(index,payload);
            while(cache.size>maxCached) cache.delete(cache.keys().next().value);
            return payload;
        }

        async function loadHex(hexId){
            const id=normaliseHexId(hexId);
            const [manifest,profile]=await Promise.all([loadManifest(),loadProfile()]);
            const index=chunkIndexForHex(id,manifest);
            const payload=await loadChunk(index,manifest);
            const offset=id-Number(payload.s);
            if(offset<0||offset>=payload.r.length) throw new Error('V2 Climate Hex/chunk indexing mismatch.');
            return decodeRecord(id,payload.r[offset],manifest,profile);
        }

        function clearCache(){
            cache.clear();
            manifestPromise=null;
            profilePromise=null;
        }

        return Object.freeze({
            version:VERSION,
            loadHex,
            loadManifest,
            loadProfile,
            chunkIndexForHex:(hexId)=>loadManifest().then(manifest=>chunkIndexForHex(hexId,manifest)),
            clearCache
        });
    }

    return Object.freeze({
        VERSION,MASTER_HEXES,normaliseHexId,percentileFromQuantiles,robustPosition,profileMetric,createClimateProvider
    });
});
