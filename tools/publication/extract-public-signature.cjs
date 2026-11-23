const fs=require('node:fs'),vm=require('node:vm');
const [archivePath,pmtilesPath,vectorPath]=process.argv.slice(2);
const {PMTiles}=vm.runInNewContext(fs.readFileSync(pmtilesPath,'utf8')+'\n;pmtiles',{Uint8Array,DataView,TextDecoder,Response,Headers,ReadableStream,DecompressionStream,AbortController,Blob,console,Map,TextEncoder});
const reader=vm.runInNewContext(fs.readFileSync(vectorPath,'utf8')+'\n;UGA_PUBLICATION_VECTOR',{Uint8Array,DataView,TextDecoder,TextEncoder});
const bytes=fs.readFileSync(archivePath);
const archive=new PMTiles({getKey:()=>archivePath,getBytes:async(o,n)=>({data:bytes.buffer.slice(bytes.byteOffset+o,bytes.byteOffset+o+n)})});
(async()=>{
 const z=14, count=2**z,h=await archive.getHeader();
 const x=lon=>Math.floor((lon+180)/360*count),y=lat=>Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*count);
 for(let ty=y(h.maxLat);ty<=y(h.minLat);ty++)for(let tx=x(h.minLon);tx<=x(h.maxLon);tx++){
  const tile=await archive.getZxy(z,tx,ty);if(!tile)continue;
  const layer=reader.decode(tile.data).atlas_v2;if(!layer)throw Error('Expected atlas_v2');
  const shapes=[];
  for(let i=0;i<layer.length;i++){
   const f=layer.feature(i);if(f.type!==3)continue;
   const code=f.properties.signature_code;if(!code)continue;
   shapes.push([code,f.loadGeometry().map(r=>r.map(p=>[p.x,p.y]))]);
  }
  if(shapes.length)process.stdout.write(JSON.stringify([tx,ty,layer.extent,shapes])+'\n');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
