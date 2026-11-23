import sys,json,re,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
p=Path(sys.argv[1]);archive=Path(sys.argv[2]);out=p/'site/publication/signature';out.mkdir(exist_ok=True)
section=(p/'atlas.js').read_text().split('const UGS_SIGNATURES = {')[1].split('};')[0]
cols=dict(re.findall(r"\b([A-Z]{1,2}):\{\s*name:'[^']+',\s*colour:'(#[\da-fA-F]+)'",section))
assert len(cols)==9
palette=[0,0,0]
for c in cols.values():palette.extend(bytes.fromhex(c[1:]))
images={};tileids=[];sz=384;group=4
for line in sys.stdin:
 x,y,extent,polys=json.loads(line);k=(x//group,y//group);img=Image.new('P',(sz,sz));g=ImageDraw.Draw(img)
 for cat,rings in polys:
  idx=list(cols).index(cat)+1
  for ring in rings:
   if len(ring)<3:continue
   area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))
   g.polygon([(round(a*sz/extent),round(b*sz/extent)) for a,b in ring],fill=idx if area>0 else 0)
 if not img.getbbox():continue
 tileids.append(f'{x}/{y}')
 if k not in images:images[k]=Image.new('P',(sz*group,sz*group))
 images[k].paste(img,((x%group)*sz,(y%group)*sz))
assert len(tileids)>100
for (x,y),image in images.items():
 image.putpalette(palette);image.save(out/f'{x}-{y}.png',optimize=True,transparency=0,bits=4)
meta={'release':'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/releases/V2RC-20261106T052258Z/v2/v2-public-hex-map-v0.1.pmtiles','source_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'source_layer':'atlas_v2','zoom':14,'tile_pixels':sz,'group':group,'palette':cols,'tiles':tileids}
(out/'index.json').write_text(json.dumps(meta,separators=(',',':'))+'\n')
print(len(images),len(tileids),sum(f.stat().st_size for f in out.iterdir()))
