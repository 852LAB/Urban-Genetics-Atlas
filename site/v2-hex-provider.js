(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.UGA_V2_HEX_PROVIDER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='V2_HEX_PROVIDER_V0_1';
  function normaliseHexId(value){
    const text=String(value??'').trim();
    if(!/^\d+$/.test(text)) throw new Error('Hex ID must be a positive integer.');
    const number=Number(text);
    if(!Number.isSafeInteger(number)||number<1||number>374784) throw new Error('Hex ID is outside the canonical range.');
    return String(number);
  }
  function shardForHex(value){
    const id=Number(normaliseHexId(value));
    return (id%256).toString(16).padStart(2,'0');
  }
  function createHexProvider(options={}){
    const config=options.config||(typeof globalThis!=='undefined'&&globalThis.UGA_V2_SITE_CONFIG);
    const fetchImpl=options.fetchImpl||(typeof fetch==='function'&&fetch.bind(globalThis));
    if(!config||!config.hexReport) throw new Error('V2 site config is required.');
    if(!fetchImpl) throw new Error('A fetch implementation is required.');
    const maxCached=Number.isInteger(options.maxCachedShards)?options.maxCachedShards:8;
    const cache=new Map(); let manifestPromise=null;
    async function fetchJson(url){
      const response=await fetchImpl(url,{cache:'force-cache'});
      if(!response||!response.ok) throw new Error(`V2 Hex provider request failed: ${url}`);
      return response.json();
    }
    function loadManifest(){
      if(!manifestPromise) manifestPromise=fetchJson(config.hexReport.manifestUrl).then(value=>{
        if(Number(value.records)!==84877||Number(value.shards)!==256) throw new Error('V2 Hex manifest contract mismatch.');
        return value;
      });
      return manifestPromise;
    }
    async function loadShard(shard){
      if(cache.has(shard)){
        const value=cache.get(shard); cache.delete(shard); cache.set(shard,value); return value;
      }
      const url=config.hexReport.shardUrlPattern.replace('{shard}',shard);
      const value=await fetchJson(url);
      cache.set(shard,value);
      while(cache.size>maxCached) cache.delete(cache.keys().next().value);
      return value;
    }
    async function loadHex(hexId){
      const id=normaliseHexId(hexId);
      await loadManifest();
      const shard=shardForHex(id);
      const records=await loadShard(shard);
      if(!Object.prototype.hasOwnProperty.call(records,id)) return null;
      const record=records[id];
      if(String(record.hex_id)!==id) throw new Error('V2 Hex shard identity mismatch.');
      return record;
    }
    function clearCache(){ cache.clear(); manifestPromise=null; }
    return Object.freeze({version:VERSION,loadHex,loadManifest,shardForHex,clearCache});
  }
  return Object.freeze({VERSION,normaliseHexId,shardForHex,createHexProvider});

});
