/* A fixed, north-up locator drawn from public vector tiles in the report's own
   coordinate frame. Canvas 2D works while Print has focus in a separate tab. */
(() => {
  'use strict';
  const width=960, height=390, zoom=14, tileSize=512/Math.sqrt(2), resolution=1.5;
  const archives=new Map();
  const sheets=new URL('signature/',document.currentScript.src);
  async function signatureGraphic(spec,tiles,signal) {
    // This release's transparent print artwork contains only the public category colours.
    const index=await (await resource(new URL('index.json',sheets),signal)).json();
    if(index.release!==spec.tile.pmtilesUrl || index.source_layer!==spec.tile.sourceLayer || index.zoom!==zoom ||
       Object.entries(index.palette).some(([code,colour])=>spec.palette[code]?.colour!==colour))throw Error('Print artwork does not match this release.');
    const available=new Set(index.tiles),groups=new Map(),over=chart(),size=index.tile_pixels;
    for(const t of tiles){
      if(!available.has(t.x+'/'+t.y))continue;
      const file=Math.floor(t.x/index.group)+'-'+Math.floor(t.y/index.group)+'.png';
      if(!groups.has(file))groups.set(file,[]);
      groups.get(file).push(t);
    }
    if(!groups.size)return null;
    await Promise.all([...groups].map(async ([file,group])=>{
      const blob=await (await resource(new URL(file,sheets),signal)).blob();
      const url=URL.createObjectURL(blob),img=new Image();
      try{
        img.src=url;await img.decode();
        if(img.width!==size*index.group || img.height!==img.width)throw Error('Print artwork size differs.');
        for(const t of group)over.drawImage(img,(t.x%index.group)*size,(t.y%index.group)*size,size,size,t.left,t.top,tileSize,tileSize);
      }finally{URL.revokeObjectURL(url);}
    }));
    return over.canvas;
  }
  async function signatureOverlay(spec,tiles,signal){
    try{return await signatureGraphic(spec,tiles,signal);}
    catch(error){if(signal.aborted)throw error;}
    const data=await signatureTiles(spec,tiles,signal),over=chart();let visible=false;
    tiles.forEach((t,i)=>tileAt(over,t,()=>features(data[i],f=>{
      const colour=spec.palette[f.properties.signature_code]?.colour;
      if(f.type===3 && colour){shape(over,f,colour);visible=true;}
    })));
    return visible?over.canvas:null;
  }
  function frame(point) {
    const count=2**zoom, rad=point[1]*Math.PI/180;
    const left=(point[0]+180)/360*count*tileSize-width/2;
    const top=(1-Math.asinh(Math.tan(rad))/Math.PI)/2*count*tileSize-height/2;
    const tiles=[];
    for(let y=Math.floor(top/tileSize);y<Math.ceil((top+height)/tileSize);y++)
      for(let x=Math.floor(left/tileSize);x<Math.ceil((left+width)/tileSize);x++)
        tiles.push({x,y,left:x*tileSize-left,top:y*tileSize-top});
    return {tiles,scale:250*count*tileSize/(40075016.686*Math.cos(rad))/width*100};
  }
  function chart() {
    const canvas=document.createElement('canvas');
    canvas.width=width*resolution;canvas.height=height*resolution;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.scale(resolution,resolution);
    return ctx;
  }
  async function resource(url,signal) {
    const response=await fetch(url,{signal});
    if(!response.ok)throw Error('Map resource returned '+response.status);
    return response;
  }
  async function basemapTiles(spec,tiles,signal) {
    const style=await (await resource(spec.basemap,signal)).json();
    const sourceId=style.layers.find(layer=>layer['source-layer']==='water')?.source;
    const source=style.sources[sourceId];
    const template=source?.tiles?.[0];
    if(!template)throw Error('Basemap tile source unavailable.');
    return Promise.all(tiles.map(async tile=>{
      const url=template.replace('{z}',zoom).replace('{x}',tile.x).replace('{y}',tile.y);
      const bytes=await (await resource(url,signal)).arrayBuffer();
      const layers=UGA_PUBLICATION_VECTOR.decode(bytes);
      if(!Object.keys(layers).length)throw Error('Basemap tile contains no layers.');
      return layers;
    }));
  }
  async function signatureTiles(spec,tiles,signal) {
    const url=spec.tile.pmtilesUrl;
    if(!archives.has(url))archives.set(url,new pmtiles.PMTiles(url));
    const archive=archives.get(url);
    return Promise.all(tiles.map(async tile=>{
      const data=await archive.getZxy(zoom,tile.x,tile.y,signal);
      if(!data)return null; // A tile outside the published mask has no polygons.
      const layer=UGA_PUBLICATION_VECTOR.decode(data.data)[spec.tile.sourceLayer];
      if(!layer)throw Error('Signature tile lacks the published source layer.');
      return layer;
    }));
  }
  function features(layer,visit) {
    if(layer)for(let i=0;i<layer.length;i++)visit(layer.feature(i));
  }
  function shape(ctx,f,colour,lineWidth=0) {
    const ratio=tileSize/f.extent;
    ctx.beginPath();
    for(const ring of f.loadGeometry()){
      if(!ring.length)continue;
      ctx.moveTo(ring[0].x*ratio,ring[0].y*ratio);
      for(const p of ring.slice(1))ctx.lineTo(p.x*ratio,p.y*ratio);
      if(f.type===3)ctx.closePath();
    }
    if(lineWidth){ctx.strokeStyle=colour;ctx.lineWidth=lineWidth;ctx.stroke();}
    else{ctx.fillStyle=colour;ctx.fill('evenodd');}
  }
  function tileAt(ctx,t,draw) {
    ctx.save();ctx.translate(t.left,t.top);
    ctx.beginPath();ctx.rect(0,0,tileSize,tileSize);ctx.clip();
    draw();ctx.restore();
  }
  function paintBase(ctx,layers,t,labels) {
    features(layers.landuse,f=>{
      if(f.type===3 && ['park','forest','wood','grass','nature_reserve','recreation_ground'].includes(f.properties.kind))shape(ctx,f,'#e2e9df');
    });
    features(layers.water,f=>{if(f.type===3)shape(ctx,f,'#d0dadd');else if(f.type===2)shape(ctx,f,'#c4d2d6',1);});
    features(layers.buildings,f=>{if(f.type===3)shape(ctx,f,'#e1e2df');});
    features(layers.places,f=>{
      const name=f.properties['name:en']||f.properties.name;
      if(f.type!==1 || !name || !['neighbourhood','locality','quarter','suburb','borough'].includes(f.properties.kind))return;
      const p=f.loadGeometry()[0]?.[0];
      if(p)labels.push({name,x:t.left+p.x*tileSize/f.extent,y:t.top+p.y*tileSize/f.extent,rank:Number(f.properties.min_zoom)||14});
    });
  }
  function paintRoads(ctx,layers){
    features(layers.roads,f=>{
      if(f.type===2)shape(ctx,f,'#fffefb',['highway','major_road'].includes(f.properties.kind)?2.15:.85);
    });
  }
  function paintLabels(ctx,labels) {
    const boxes=[];const names=new Set();ctx.font='600 12px Arial, sans-serif';ctx.textAlign='center';
    for(const l of labels.sort((a,b)=>a.rank-b.rank)){
      const w=ctx.measureText(l.name).width/2+5,b={left:l.x-w,right:l.x+w,top:l.y-14,bottom:l.y+5};
      if(names.has(l.name)||b.left<3||b.right>width-3||b.top<3||b.bottom>height-3||
         (Math.abs(l.x-width/2)<w+12&&Math.abs(l.y-height/2)<20)||
         boxes.some(k=>k.left<b.right&&k.right>b.left&&k.top<b.bottom&&k.bottom>b.top))continue;
      boxes.push(b);names.add(l.name);
      ctx.lineWidth=3;ctx.strokeStyle='#f7f8f4';ctx.strokeText(l.name,l.x,l.y);
      ctx.fillStyle='#525f63';ctx.fillText(l.name,l.x,l.y);
    }
  }
  async function bounded(read) {
    const controller=new AbortController();let timer;
    try{return await Promise.race([read(controller.signal),new Promise((_,reject)=>{
      timer=setTimeout(()=>{controller.abort();reject(Error('Map resource timed out.'));},6500);
    })]);}finally{clearTimeout(timer);controller.abort();}
  }
  async function render(spec) {
    if(!spec)return null;
    const [lng,lat]=spec.point,result={lng,lat,basis:spec.basis};
    try{
      const {tiles,scale}=frame(spec.point);
      const [base,signature]=await Promise.allSettled([
        bounded(signal=>basemapTiles(spec,tiles,signal)),
        bounded(signal=>signatureOverlay(spec,tiles,signal))
      ]);
      const hasBase=base.status==='fulfilled',labels=[];
      const ctx=chart();ctx.fillStyle='#f7f7f4';ctx.fillRect(0,0,width,height);
      if(hasBase)tiles.forEach((t,i)=>tileAt(ctx,t,()=>paintBase(ctx,base.value[i],t,labels)));
      const overlay=signature.status==='fulfilled' && signature.value;
      if(overlay){
        ctx.globalAlpha=.60;ctx.drawImage(overlay,0,0,width,height);ctx.globalAlpha=1;
      }
      if(!hasBase&&!overlay)throw Error('No drawable cartography.');
      if(hasBase)tiles.forEach((t,i)=>tileAt(ctx,t,()=>paintRoads(ctx,base.value[i])));
      paintLabels(ctx,labels);
      return {...result,image:ctx.canvas.toDataURL('image/png'),scale,hasBase,hasSignature:!!overlay};
    }catch(error){console.warn('[852LAB publication locator]',error.message);return result;}
  }
  window.UGA_PUBLICATION_LOCATOR=Object.freeze({render});
})();
