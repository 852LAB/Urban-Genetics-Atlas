/* Executive pages share the provider snapshot with the complete evidence edition. */
(() => {
  'use strict';
  const finite = value => value!==null && value!==undefined && String(value).trim()!=='' && Number.isFinite(Number(value));
  const number = v => finite(v) ? Number(v).toLocaleString('en-HK',{maximumFractionDigits:1}) : 'Unassessed';
  const numeric = text => {
    const s=String(text).trim().replace(/,/g,'').replace('−','-');
    return /^[+-]?\d+(\.\d+)?%?$/.test(s) ? Number(s.replace('%','')) : null;
  };
  const colours=['#297263','#738b99','#b08b70','#83768f'];
  function mapFigure(map,make) {
    if(!map)return make('p','Location reference unavailable for this record.','map-note');
    const fig=make('figure','','locator'), cap=make('figcaption');
    if(map.image){
      const frame=make('div','','map-frame'),img=make('img');img.src=map.image;img.alt=map.hasBase?(map.hasSignature?'Signature Analysis over the Hong Kong basemap':'Hong Kong basemap'):'Public Signature cell locations';
      const bar=make('span','250 m','map-scale');bar.style.width=map.scale+'%';
      frame.append(img,make('i','','pin'),bar,make('b','N ↑','north'));fig.append(frame);
    }
    cap.append(make('b',map.basis),make('span',map.lat.toFixed(4)+'° N  /  '+map.lng.toFixed(4)+'° E'));
    const credit=map.hasBase?(map.hasSignature?'':'Signature coverage unavailable · ')+'© OpenStreetMap contributors · © CARTO':
      map.hasSignature?'852LAB Signature cells · basemap unavailable':'Cartographic layers unavailable. Coordinates identify the location reference.';
    fig.append(cap,make('small',credit));
    return fig;
  }
  function locatorSpec(vm,mapStyle){
    const r=vm.record||{},place=vm.entityType==='hex',type=vm.entityType==='building'?'Building':'Lot';
    const coordinates=o=>o && finite(o.longitude??o.lng)&&finite(o.latitude??o.lat) ? [Number(o.longitude??o.lng),Number(o.latitude??o.lat)] : null;
    let point=place?null:coordinates(vm.entity?.coordinates)||coordinates(vm.entity);
    let basis=point?type+' location reference':'Analytical area centre';
    if(!point)point=coordinates(r);
    if(!place && point && basis==='Analytical area centre')basis='Primary area centre · LAB-ID-'+vm.hexId;
    return point && Math.abs(point[0])<=180 && Math.abs(point[1])<=85 ? {...mapStyle,point,basis}:null;
  }
  function build(model,article,{vm,mapStyle},{make,read}) {
    const units=[],r=vm.record||{},type=model.type,place=type==='Place',building=type==='Building';
    const put=el=>{if(el)units.push({kind:'block',element:el});};
    const chapter=(label,title,turn=true)=>units.push({kind:'chapter',label,element:make('h2',title),turn});
    const label=t=>units.push({kind:'heading',element:make('h3',t,'subhead')});
    const note=t=>{if(t)put(make('p',t,'editor-note'));};
    const rowValues=(grid)=>[...(grid?.children||[])].map(c=>[read(c.querySelector('span')),read(c.querySelector('strong')),Array.from(c.querySelectorAll('small,em'),read).join(' · ')]).filter(a=>a[0]);
    function strip(rows,cls=''){
      if(!rows.length)return;
      const grid=make('div','','readings '+cls);grid.style.setProperty('--n',Math.min(4,rows.length));
      for(const [name,value,basis] of rows){
        const cell=make('div'),reading=make('b');
        const text=String(value||'Unassessed');
        if(text.includes('/')){cell.className='text-reading';text.split('/').forEach((word,i)=>{if(i)reading.append('/',document.createElement('wbr'));reading.append(word);});}
        else reading.textContent=text;
        cell.append(make('small',name),reading);
        if(basis)cell.append(make('span',basis));grid.append(cell);
      }
      put(grid);
    }
    function track(value,max,colour){
      const bar=make('i','','track');
      if(finite(value)&&max>0){const fill=make('i');fill.style.width=Math.min(100,Math.abs(Number(value))/max*100)+'%';fill.style.background=colour;bar.append(fill);}
      return bar;
    }
    function table(headers,rows){
      if(!rows.length)return;
      const t=make('table','','brief-table'),tr=t.createTHead().insertRow(),body=t.createTBody();
      headers.forEach(h=>tr.append(make('th',h)));
      rows.forEach(row=>{const rr=body.insertRow();row.forEach(v=>{rr.insertCell().textContent=v;});});
      units.push({kind:'table',element:t});
    }
    function graphic(title,value,detail){
      const el=make('div','',title==='Urban Genetic Signature'?'callout signature-callout':'callout');el.append(make('small',title),make('b',value),make('p',detail));put(el);
    }
    const mapSpec=locatorSpec(vm,mapStyle);
    const coverGrid=place?article.querySelector('.v2-sheet-metric-grid--hero'):Array.from(article.querySelectorAll('.v2-sheet-card')).find(c=>/^(Building|Lot) snapshot$/i.test(read(c.querySelector('h3'))))?.querySelector('.v2-sheet-metric-grid');
    const measures=rowValues(coverGrid);
    label(place?'At a glance':building?'The building record':'The lot record');
    if(!place){const address=read(article.querySelector('.v2-sheet-address'));if(address)note(address);}
    const keyMeasures=['Use','Storeys above ground','Building height','Footprint'];
    const lead=building?measures.filter(row=>keyMeasures.includes(row[0])):type==='Lot'?measures.filter(row=>!['Lot ID','Recorded Lot IDs'].includes(row[0])):measures;
    strip(lead,building && lead.length===4?'cover-readings building-readings':'cover-readings');
    if(place)graphic('Urban Genetic Signature',r.signature_name||'Unassessed',r.signature_plain_language_summary||'No descriptive reading is available.');
    else {
      const rel=vm.relationships;
      if(building){
        const status=measures.find(row=>row[0]==='Status')?.[1];
        const period=measures.find(row=>row[0]==='Operation-date range')?.[1];
        note([status&&'Status · '+status,period&&'Operation date · '+period.split(' – ').filter((x,i,all)=>all.indexOf(x)===i).join(' – '),
          number(rel.lots.length)+' related lot'+(rel.lots.length===1?'':'s'),number(rel.hexes.length)+' related area'+(rel.hexes.length===1?'':'s')].filter(Boolean).join('   /   '));
      }
      note('Primary area · '+(vm.hexId?'LAB-ID-'+vm.hexId:'Unassessed')+' · largest trusted intersection.');
      if(!building){const ids=measures.find(row=>row[0]==='Recorded Lot IDs');if(ids&&ids[1]!==measures.find(row=>row[0]==='Lot ID')?.[1])note('Recorded Lot IDs · '+ids[1]);}
      note(building?'Building attributes belong to the selected record. The following place readings describe its connected analytical area.':'Mapped intersections describe spatial relationships. Ownership, building rights and statutory development entitlement require separate evidence.');
    }
    const axes=[['Intensity','intensity_axis_01'],['Access','accessibility_axis_01'],['Height / form','height_form_axis_01'],['Change','change_axis_01'],['Age','age_axis_01']];
    chapter('01  /  City fabric',place?'What kind of place is this?':'The surrounding urban fabric',!!mapSpec || measures.length>3);
    note(place?'Descriptive character and strategic readings for the selected analytical cell.':('Primary area '+(vm.hexId?'LAB-ID-'+vm.hexId:'unavailable')+' · these profiles describe the area around the '+type.toLowerCase()+'.'));
    const profile=make('div','','profile'),axbox=make('div','','axis-graphic'),list=make('div','','axis-profile');
    const ns='http://www.w3.org/2000/svg',svg=(tag,attrs={},txt='')=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);el.textContent=txt;return el;};
    const radar=svg('svg',{viewBox:'0 0 280 224',role:'img','aria-label':'Five-axis Signature profile, zero to 100'});
    const cx=140,cy=110,rad=72;const xy=(i,v)=>{const a=(-90+i*72)*Math.PI/180;return [cx+Math.cos(a)*rad*v,cy+Math.sin(a)*rad*v];};
    const score=axes.map(([,key])=>finite(r[key])&&Number(r[key])>=0&&Number(r[key])<=1?Number(r[key]):null);
    for(const f of [.25,.5,.75,1])radar.append(svg('polygon',{points:axes.map((_,i)=>xy(i,f).join(',')).join(' '),fill:'none',stroke:'#cac8ce','stroke-width':1}));
    axes.forEach(([key],i)=>{const [x,y]=xy(i,1);radar.append(svg('line',{x1:cx,y1:cy,x2:x,y2:y,stroke:'#d5d3d8'}));});
    const tint=mapStyle.palette[r.signature_code]?.colour||'#807788';
    if(score.every(v=>v!==null))radar.append(svg('polygon',{points:score.map((v,i)=>xy(i,v).join(',')).join(' '),fill:tint,'fill-opacity':.25,stroke:tint,'stroke-width':2.2}));
    const positions=[[140,20],[222,88],[198,191],[80,191],[58,88]];
    axes.forEach(([key],i)=>{
      if(score[i]!==null){const [x,y]=xy(i,score[i]);radar.append(svg('circle',{cx:x,cy:y,r:3.3,fill:tint}));}
      radar.append(svg('text',{x:positions[i][0],y:positions[i][1],'text-anchor':i===1?'start':i===4?'end':'middle','font-family':'Arial','font-size':12,fill:'#31383c'},key));
    });
    axbox.append(make('small','Five-axis Signature'),radar);
    list.append(make('h3',r.signature_name||'Unassessed'));
    for(const [i,[key]] of axes.entries()){
      const row=make('div');row.append(make('span',key),make('b',score[i]===null?'Unassessed':Math.round(score[i]*100)+' / 100'),track(score[i],1,tint));list.append(row);
    }
    profile.append(axbox,list);put(profile);
    label('Analyses');
    const lensKeys=[['Development pressure','development_pressure_raw_01','Diagnostic · recorded pressure signal'],['Renewal potential','renewal_observed_base_01','Strategic · observed-base screening'],['Genesis potential','genesis_observed_base_01','Strategic · observed-base screening'],['Capacity context','capacity_opportunity_mid_01','Screening · supported planning envelope']];
    for(const [i,[name,key,scope]] of lensKeys.entries()){
      const n=finite(r[key])?Number(r[key]):null,el=make('div','','analysis-row'),text=make('div');text.append(make('b',name),make('small',scope));el.append(text,track(n,1,colours[[3,2,0,1][i]]),make('b',n===null?'Not assessed':Math.round(n*100)+' / 100'));put(el);
    }
    strip([['Intersecting buildings',number(r.building_intersection_count)],['Intersecting lots',number(r.lot_intersection_count)],['Zone context',r.planning_dominant_zone_label||'Unassessed']]);
    note([r.planning_overlay_state,r.planning_evidence_state].filter(Boolean).map(x=>String(x).replace(/_/g,' ').toLowerCase()).join(' · ')||'Planning and physical floor-area measures describe context. Site-specific entitlement requires separate assessment.');
    if(place){
      const living=Array.from(article.querySelectorAll('.v2-sheet-card')).find(c=>/public living-space evidence/i.test(read(c.querySelector('h3'))));
      if(living){
        label('Floor area and evidence coverage');
        strip(rowValues(living.querySelector('.v2-sheet-metric-grid')).slice(0,3));
        note('Total built floor area includes all represented uses. Floor area per allocated resident is a context indicator, independent of dwelling size, saleable area or statutory GFA.');
      }
    }
    const mob=article.querySelector('[data-ugmp-card]')||article.querySelector('[data-ug-report-panel="mobility"]');
    const groups=Array.from(mob?.querySelectorAll('.ugsp-radials figure')||[]), reach=Array.from(mob?.querySelectorAll('.ugsp-reach-row')||[]);
    const modes=['public','road'].map(k=>read(mob?.querySelector('[data-ugsp-'+k+']')?.selectedOptions?.[0])||(k==='public'?'Public transport':'Vehicle'));
    const hasMob=groups.length||reach.length;
    chapter('02  /  Mobility',place?'What connects this place?':'Accessibility in the vicinity',!!hasMob);
    if(!place && vm.hexId)note('LAB-ID-'+vm.hexId+' · largest recorded intersection with this '+type.toLowerCase()+'. Travel and destinations use the cell’s network starts. Direct '+type.toLowerCase()+' access is unassessed.');
    const publicInk='#267564', roadInk='#627f91';
    const chartPair=()=>make('div','','mob-pair');
    function panel(parent,title,subtitle){
      const el=make('figure','','mob-figure');
      el.append(make('h4',title),make('small',subtitle));parent.append(el);return el;
    }
    function connectionRadial(fig,items,road,band,withInside){
      const chart=svg('svg',{viewBox:'0 0 320 216',role:'img','aria-label':read(fig.querySelector('h4'))});
      const cx=160,cy=108,radius=62,stroke='#cedbd8';
      const peak=Math.max(1,...items.flatMap(item=>[item.n,item.inside]).filter(finite));
      const step=peak<=4?1:peak<=8?2:5,limit=Math.max(step,Math.ceil(peak/step)*step);
      const ring=r=>chart.append(svg('circle',{cx,cy,r,fill:'none',stroke}));
      const txt=(x,y,text,anchor='middle',ink='#293e43',weight=500)=>chart.append(svg('text',{x,y,'text-anchor':anchor,fill:ink,'font-size':11,'font-weight':weight},text));
      const pos=(i,r)=>{const angle=2*Math.PI*i/items.length-Math.PI/2;return [cx+r*Math.cos(angle),cy+r*Math.sin(angle)];};
      const dot=(x,y,n,ink)=>{
        if(!finite(n))return;
        const r=n===0?3.1:Math.sqrt(5+57*n/peak);
        chart.append(svg('circle',{cx:x,cy:y,r,fill:n===0?'white':ink,stroke:n===0?'#95aaa5':'white','stroke-width':1}));
      };
      items.forEach((_,i)=>{const [x,y]=pos(i,radius);chart.append(svg('line',{x1:cx,y1:cy,x2:x,y2:y,stroke}));});
      if(road){
        for(let v=step;v<=limit;v+=step){ring(radius*v/limit);txt(cx-.73*radius*v/limit-4,cy-.69*radius*v/limit,String(v),'end','#6a7e80');}
      }else{
        ring(radius);if(withInside)ring(32);
        chart.append(svg('circle',{cx,cy,r:16,fill:'#f3f6f4',stroke}));txt(cx,cy+4,'Cell');
      }
      items.forEach((item,i)=>{
        const [x,y]=pos(i,road&&finite(item.n)?radius*item.n/limit:radius);
        dot(x,y,item.n,road?roadInk:publicInk);
        if(withInside){const [xx,yy]=pos(i,32);dot(xx,yy,item.inside,roadInk);}
        const [lx,ly]=pos(i,radius+(i===0?28:16)),anchor=Math.abs(lx-cx)<2?'middle':lx<cx?'end':'start';
        txt(lx,ly-3,item.name,anchor);
        txt(lx,ly+10,item.label,anchor,road?roadInk:publicInk,700);
      });
      fig.append(chart,make('figcaption',road?'Ring interval '+step+' min. Larger dots indicate longer access times.':
        withInside?'Inner ring · in cell. Outer ring · within '+band+'. Counts shown in that order.':'Dot size indicates count. Hollow dots indicate zero.'));
    }
    if(groups.length){
      const top=chartPair(),bars=Array.from(mob.querySelectorAll('.ugmp-mode-bars'));
      const reached=bars.find(g=>/network reach/i.test(g.getAttribute('aria-label')||''));
      const inside=bars.find(g=>/inside the cell/i.test(g.getAttribute('aria-label')||''));
      const readBars=g=>new Map(Array.from(g?.querySelectorAll('.ugmp-mode-row')||[],row=>[read(row.querySelector('span')),numeric(read(row.querySelector('b')))]));
      function nodes(fig){
        return Array.from(fig?.querySelectorAll('svg g:has(>title)')||[],g=>{
          const n=read(g.querySelector('.ugsp-number')),name=read(g.querySelector('.ugsp-node-label'));
          return {name,n:numeric(n),label:n==='?'?'Unassessed':n==='—'&&read(g.querySelector('title')).includes('20 minutes')?'>20 min':n};
        });
      }
      if(reached){
        const band=reached.getAttribute('aria-label').match(/\d[\d,]*\s*m\b/i)?.[0]||'selected band',inner=readBars(inside),outer=readBars(reached);
        const order=['Bus','Minibus','Tram','Rail legacy','Rail provider','Ferry','Feeder bus','Peak Tram'];
        const items=[...new Set([...order,...outer.keys()])].filter(name=>outer.has(name)).map(name=>{
          const n=outer.get(name),inCell=inner.get(name);
          return {name,n,inside:inCell,label:(inside?(inCell??'—')+' / ':'')+(n??'—')};
        });
        connectionRadial(panel(top,'Source references by mode',band+' source-network distance'),items,false,band,!!inside);
      }else if(groups[0]){
        connectionRadial(panel(top,read(groups[0].querySelector('figcaption')),'Public transport connections'),nodes(groups[0]),false,'',false);
      }
      if(groups[1]){
        const items=nodes(groups[1]);items.forEach(item=>{if(item.n!==null)item.label+=' min';});
        connectionRadial(panel(top,'First road-class access',modes[1]+' · minutes'),items,true,'',false);
      }
      put(top);
      const origin=mob.querySelector('.ugmp-network-evidence >h4 + p');if(origin)note(read(origin));
      if(reached)note('Reference counts follow each source feed. Legacy and provider rail can overlap. Road times indicate the first matched link completed in each class.');
    }
    const lower=chartPair();
    const reachAvailable=reach.some(row=>Array.from(row.querySelectorAll('.ugsp-bar-value'),read).some(v=>numeric(v)!==null));
    const modeStatus=read(mob?.querySelector('.ugsp-status'));
    if(reach.length && !reachAvailable){
      panel(lower,'Network-supported reach','Travel-time reach is unavailable for the selected origin and modes.');
    }
    if(reachAvailable){
      const el=panel(lower,'Network-supported reach','Modelled cells by journey time');
      const rows=reach.map(row=>[read(row.firstElementChild),...Array.from(row.querySelectorAll('.ugsp-bar-value'),read)]);
      const nums=rows.map(v=>v.slice(1).map(numeric)),max=Math.max(1,...nums.flat().filter(finite)),chart=svg('svg',{viewBox:'0 0 320 178',role:'img','aria-label':'Network-supported analytical cells by time band'}),px=i=>45+i*251/Math.max(1,rows.length-1),py=n=>138-108*n/max;
      for(const ratio of [0,.5,1]){const y=py(max*ratio);chart.append(svg('line',{x1:45,x2:296,y1:y,y2:y,stroke:'#d5dcd9'}),svg('text',{x:40,y:y+4,'text-anchor':'end'},number(Math.round(max*ratio))));}
      rows.forEach(([time],i)=>chart.append(svg('text',{x:px(i),y:161,'text-anchor':'middle'},time.replace(/ min$/,''))));
      for(const k of [0,1]){
        let prev=null;
        nums.forEach((vals,i)=>{const value=vals[k];if(value===null||value===undefined){prev=null;return;}const x=px(i),y=py(value);if(prev)chart.append(svg('line',{x1:prev[0],y1:prev[1],x2:x,y2:y,stroke:(k?roadInk:publicInk),'stroke-width':2.6}));chart.append(svg('circle',{cx:x,cy:y,r:3.5,fill:(k?roadInk:publicInk)}));prev=[x,y];});
      }
      el.append(chart,make('figcaption','Time bands in minutes.'));
    }
    const sourceProfile=mob?.querySelector('.ugsp-spider svg');
    if(sourceProfile){
      const el=panel(lower,'Mobility profile','Trial scores · 0–100');
      const copy=sourceProfile.cloneNode(true);
      copy.querySelectorAll('polygon[fill-opacity],circle[fill]').forEach(n=>{
        const replace=c=>c==='#8e4d1f'?roadInk:c==='#087d73'?publicInk:c;
        for(const k of ['fill','stroke'])if(n.hasAttribute(k))n.setAttribute(k,replace(n.getAttribute(k)));
      });
      const values=Array.from(mob.querySelectorAll('.ugsp-values > div'),v=>read(v.querySelector('span'))+' '+Array.from(v.querySelectorAll('b'),read).join(' / '));
      el.append(copy,make('figcaption',values.join(' · ')));
    }
    if(lower.children.length){
      put(lower);
      const legend=make('div','','mob-key');
      modes.forEach((name,i)=>{const key=make('span',name);key.style.setProperty('--ink',i?roadInk:publicInk);legend.append(key);});put(legend);
    }
    if(modeStatus)note(modeStatus);
    if(reachAvailable){
      const selected=reach.find(row=>row.classList.contains('ugsp-selected'))||reach[0];
      strip(Array.from(selected.querySelectorAll('.ugsp-bar-value'),(n,i)=>[modes[i],read(n),read(selected.firstElementChild)+' · supported cells']));
      note('Reach counts modelled analytical cells within each time band.'+(finite(mapStyle.publicCells)?' The public release contains '+number(mapStyle.publicCells)+' mapped report cells.':'')+' A cell count measures network-supported potential and gives no guarantee of a trip to a particular entrance.');
    }
    if(!hasMob){
      const status=read(mob?.querySelector('.ugmp-empty,.ugsp-status,.ugmp-note'))||read(mob?.querySelector('p'))||'No assessed origin is available for this record.';
      note(status);
    }
    const stationDetail=Array.from(mob?.querySelectorAll('details')||[]).find(d=>read(d.querySelector(':scope >summary'))==='Destinations and assumptions');
    const stations=Array.from(stationDetail?.querySelectorAll(':scope >div:has(>b)')||[],d=>{
      const n=d.querySelector('span'),first=n?.firstChild?.textContent?.trim();
      return [first||'',read(n?.querySelector('small')),read(d.querySelector('b'))];
    }).filter(row=>row[0]&&row[2]);
    if(stations.length){
      chapter('02  /  Mobility  /  continued','Where can I go?',!!hasMob);
      label('Named rail destinations');
      const grid=make('div','','stations');
      const durations=stations.map(row=>parseFloat(row[2].replace(/^[^0-9]+/,'')));
      for(const [i,[name,via,time]] of stations.entries()){
        const item=make('div'),txt=make('div');txt.append(make('b',name),make('small',via));
        item.append(txt,track(durations[i],Math.max(1,...durations.filter(Number.isFinite)),colours[0]),make('b',time));grid.append(item);
      }
      put(grid);note('Nominal weekday-morning station arrival, including the modelled platform allowance. Final exit, onward walk and step-free access are outside this estimate.');
    }
    const amen=mob?.querySelector('.ugsp-amenities');
    const amenAvailable=Array.from(amen?.children||[]).some(row=>Array.from(row.children).slice(1).some(n=>numeric(read(n))!==null));
    if(amen && !amenAvailable)note('Everyday destination counts are unavailable for the selected time band.');
    if(amenAvailable){
      label(read(amen.closest('figure')?.querySelector('figcaption'))||'Everyday destinations');
      const rows=Array.from(amen.children,row=>Array.from(row.children,read));
      const t=make('div','','destination-list'),head=make('div','','dest-head');
      head.append(make('b','Destination category'),make('span','Within-category comparison'),...modes.map(name=>make('b',name)));t.append(head);
      for(const [name,a,b] of rows){
        const row=make('div'),bars=make('span','','dest-bars'),max=Math.max(1,numeric(a)||0,numeric(b)||0);
        bars.append(track(numeric(a),max,colours[0]),track(numeric(b),max,colours[1]));
        row.append(make('span',name),bars,make('b',a),make('b',b));t.append(row);
      }
      put(t);note('Each pair compares the two modes within one category. Counts retain the destination groups returned for this origin and time band.');
    }
    market();people();climate();endnotes();
    function market(){
      chapter('03  /  Market','Movement and context',stations.length>0 || !amenAvailable);
      const regional=[...article.querySelectorAll('.ug-market-scale table')].find(t=>/region/i.test(read(t.tHead))&&/rent/i.test(read(t.tHead)));
      if(regional){
        label('Regional price and rent movement');
        const rows=[...regional.tBodies[0].rows].map(row=>Array.from(row.cells,read)),max=Math.max(1,...rows.flatMap(v=>v.slice(1,3).map(numeric)).filter(finite).map(Math.abs));
        for(const [region,price,rent,period] of rows){
          const item=make('div','','regional'),id=make('div');id.append(make('b',region),make('small','12 months · '+period));item.append(id);
          for(const [i,v] of [price,rent].entries()){const series=make('div');series.append(make('small',i?'Rent':'Price'),track(numeric(v),max,colours[i?1:2]),make('b',v));item.append(series);}put(item);
        }
        note('Bars show magnitude on a shared scale. Signed percentages give the direction of change.');
      }
      const district=Array.from(article.querySelectorAll('.ug-market-peer-group')).find(g=>/district position/i.test(read(g.querySelector('h4,h3'))));
      if(district){label('District structure'+(r.had_name_en?' · '+r.had_name_en:''));table(['Measure','District','Benchmark','Period and support'],Array.from(district.querySelectorAll('.ug-market-peer'),el=>[read(el.querySelector('strong')),...Array.from(el.querySelectorAll(':scope >div b'),read),read(el.querySelector('p'))]));}
      const activity=Array.from(article.querySelectorAll('.ug-market-peer')).find(g=>/recent registration activity/i.test(read(g.querySelector('strong'))));
      if(activity){label('Territory · residential ASP registrations');const values=Array.from(activity.querySelectorAll(':scope >div b'),read);strip([['3-month monthly average',values[0]],['24-month monthly median',values[1]]]);note(read(activity.querySelector('p')));}
      const micro=article.querySelector('.ug-market-entity');
      if(micro){const records=[...micro.querySelectorAll('.ug-market-source h4')].map(read);note(records.length?'Linked source evidence · '+records.join(' · '):read(micro.querySelector('.ug-market-empty')));}
      if(!regional&&!district&&!activity)note('Published regional and district comparisons are unavailable for this record.');
      const exposure=Array.from(article.querySelectorAll('.ug-ma-hex-scores>div'),n=>[read(n.querySelector('strong')),read(n.querySelector('b')),'local screen · 0–1']);
      if(exposure.length)strip(exposure);
      note('Regional movement and district stock retain their published geography. They do not establish a local price or rental valuation.');
    }
    function people(){
      const el=article.querySelector('.v2-age-legend'),items=Array.from(el?.children||[],read);
      chapter('04  /  Demographics','People and households',Boolean(items.length) && (stations.length>0 || !amenAvailable));
      if(items.length){
        const fig=make('div','','age-strip'),bands=make('div');for(const [i,span] of Array.from(article.querySelector('.v2-age-bar')?.children||[]).entries()){const part=make('i');part.style.width=span.style.width;part.style.background=[colours[2],colours[0],colours[3]][i];bands.append(part);}
        fig.append(bands,make('small',items.join('     /     ')));put(fig);
      }
      strip([['Average household size',number(r.census_average_household_size),'people'],['Median monthly income',finite(r.census_median_household_income_hkd)?'HK$'+number(r.census_median_household_income_hkd):'Unassessed','households'],['Median household floor area',finite(r.census_median_household_floor_area_m2)?number(r.census_median_household_floor_area_m2)+' m²':'Unassessed','source geography']]);
      note('2021 Census geography · '+(r.census_control_name||r.census_observed_geography||'Source geography unavailable')+'.');
    }
    function climate(){
      chapter('05  /  Climate','Heat and environmental screening',false);
      const profiles=Array.from(article.querySelectorAll('.v2-climate-profile'));
      if(!profiles.length){note('Climate evidence is unavailable for the primary analytical area.');return;}
      const profile=profiles[0],labelOf=p=>read(p.querySelector('strong'));
      graphic('Persistent relative surface heat',labelOf(profile),read(profile.querySelector('small'))||'Repeated summer surface-temperature observation.');
      const c=vm.climate||{};
      strip([['Interannual variation',labelOf(profiles[1]||document.createElement('div'))||'Unassessed'],['Terrain elevation',labelOf(profiles[2]||document.createElement('div'))||'Unassessed'],['Seven-year support',finite(c.heat_7yr_support_fraction)?number(c.heat_7yr_support_fraction*100)+'%':'Unassessed']]);
      const rows=Array.from(article.querySelectorAll('.v2-climate-coastal-row'),p=>[read(p.querySelector('span')),read(p.querySelector('strong'))]);
      if(rows.length)table(['Coastal screening scenario','Share of supported local land'],rows);
      note('Surface heat measures land-surface conditions. Coastal shares describe scenario screening on supported land. Neither is a property-specific forecast.');
    }
    function endnotes(){
      label('Evidence and sources');
      note('The full evidence edition includes field values, cohort definitions, source records and methodological notes for this selection.');
      const refs=model.sources.filter(x=>!x.row).slice(0,5);
      if(refs.length){const p=make('p','','source-line');for(const [i,ref] of refs.entries()){if(i)p.append('   /   ');const a=make('a',ref.name);a.href=ref.url;p.append(a);}put(p);}
      try {
        const shared=new URL(window.UGA_SHARED_VIEW.url(true)),canonical=document.querySelector('link[rel="canonical"]')?.href;
        if(canonical && new URL(canonical).origin===shared.origin)shared.pathname=new URL(canonical).pathname;
        const link=make('a','Open the interactive report');link.href=shared.href;
        const p=make('p','','source-line');p.append(link);put(p);
      }catch{/* The printed evidence remains self-contained. */}
    }
    return {executive:units,mapSpec};
  }
  window.UGA_PUBLICATION_EDITION=Object.freeze({build,mapFigure,locatorSpec});
})();
