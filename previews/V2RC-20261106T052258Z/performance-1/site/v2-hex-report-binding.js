(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.UGA_V2_HEX_REPORT_BINDING=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='V2_HEX_REPORT_BINDING_V0_1';
  async function hydrateHex(selection,provider,adapter){
    if(!selection||selection.type!=='hex') throw new Error('Hex selection required.');
    if(!provider||typeof provider.loadHex!=='function') throw new Error('V2 Hex provider required.');
    const record=await provider.loadHex(selection.hexId||selection.id);
    if(!record) return Object.freeze({...selection,hydrationState:'not_found',record:null});
    const adapted=adapter&&adapter.adaptHexReport?adapter.adaptHexReport(record):{grain:'hex',hexId:String(record.hex_id),record};
    return Object.freeze({...selection,hexId:adapted.hexId,hydrationState:'loaded',record:adapted.record});
  }
  return Object.freeze({VERSION,hydrateHex});

});
