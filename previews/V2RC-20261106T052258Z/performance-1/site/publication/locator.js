/* A north-up publication crop. No camera, filter or opacity is borrowed from the interactive map. */
(() => {
  'use strict';
  async function render(spec) {
    if (!spec) return null;
    const {point, palette, basemap, tile, basis} = spec;
    const [lng,lat] = point;
    const stage = document.createElement('div');
    stage.setAttribute('aria-hidden','true');
    stage.style.cssText='position:fixed;left:-2400px;top:0;width:960px;height:390px;pointer-events:none';
    document.body.append(stage);
    let map, timer;
    const abort = new AbortController();
    try {
      const timeout = new Promise((_,reject) => {
        timer = setTimeout(() => reject(Error('Map tiles did not settle.')),32000);
      });
      const draw = async () => {
        const response = await fetch(basemap,{signal:abort.signal});
        if (!response.ok) throw Error('Basemap unavailable.');
        const style = await response.json();
        style.sources.signature = {type:'vector',url:'pmtiles://'+tile.pmtilesUrl};
        const layer = {id:'publication-signature',type:'fill',source:'signature','source-layer':tile.sourceLayer,
          paint:{'fill-color':['match',['get','signature_code'],...Object.entries(palette).flatMap(([k,v])=>[k,v.colour]),'rgba(0,0,0,0)'],'fill-opacity':0.6}};
        const firstLabel = style.layers.findIndex(l=>l.type==='symbol');
        style.layers.splice(firstLabel<0?style.layers.length:firstLabel,0,layer);
        map = new maplibregl.Map({container:stage,style,center:point,zoom:13.5,pitch:0,bearing:0,pixelRatio:1.5,
          interactive:false,attributionControl:false,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true}});
        await new Promise((resolve,reject)=>{
          map.on('error',e=>reject(e.error||Error('Map resource unavailable.')));
          map.once('idle',resolve);
        });
        const cells = map.queryRenderedFeatures({layers:[layer.id]});
        if (!cells.length) throw Error('Signature coverage unavailable.');
        const scale = 250 / (78271.516964*Math.cos(lat*Math.PI/180)/2**map.getZoom()) / 960*100;
        return {image:map.getCanvas().toDataURL('image/png'),lng,lat,basis,scale};
      };
      return await Promise.race([draw(),timeout]);
    } catch (error) {console.warn('[852LAB publication locator]',error.message);return {lng,lat,basis};}
    finally {clearTimeout(timer);abort.abort();map?.remove();stage.remove();}
  }
  window.UGA_PUBLICATION_LOCATOR=Object.freeze({render});
})();
