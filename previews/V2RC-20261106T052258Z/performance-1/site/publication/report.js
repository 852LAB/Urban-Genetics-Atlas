/* 852LAB publication adapter. The report providers retain ownership of values and scope. */
(() => {
  'use strict';
  const directory = new URL('.', document.currentScript.src);
  const css = new URL('publication.css?v=4', directory);
  const logo = new URL('../../assets/Logo.png', directory);
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const read = node => clean(node?.textContent);
  const make = (tag, value, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value) el.textContent = value;
    return el;
  };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const native = () => document.querySelector('#placeReportBody');
  const host = () => document.querySelector('#placeReportPanel');
  const bindings = new WeakMap();
  function bind(article, vm, mapStyle) { if(article) bindings.set(article,{vm,mapStyle}); }
  function identity() {
    const state = window.UGA_V2_SELECTION?.snapshot?.();
    const external = host().dataset.externalReportKind;
    const article = native().querySelector('article');
    return external ? [external, read(article?.querySelector('h1,h2')), article?.querySelector('[aria-pressed=true]')?.textContent].join('|')
      : ['native', state?.focus?.type, state?.focus?.id, state?.selection?.primaryHexId].join('|');
  }
  function loading(body) {
    if (body.querySelector('[data-state="loading"],[aria-busy="true"]')) return true;
    return Array.from(body.querySelectorAll('p,small,span,div,section')).some(n =>
      !n.children.length && /^(?:loading|calculating|searching|preparing)\b/i.test(read(n)) &&
      !/unavailable|failed|could not/i.test(read(n)));
  }
  async function capture() {
    const id = identity(), body = native(), end = Date.now() + 150000;
    const current = () => {
      if (host().hidden || identity() !== id) throw Error('The selected report changed. Open the publication from the place you want to print.');
      if (Date.now() >= end) throw Error('The report is still waiting for evidence. Return to the Atlas and try Print again once it has settled.');
    };
    current();
    // An entity transition may briefly leave the previous article in the host.
    const matchesFocus=()=>{
      const article=body.querySelector('article'),focus=window.UGA_V2_SELECTION?.snapshot?.()?.focus;
      if(!article)return false;
      if(host().dataset.externalReportKind||!focus)return true;
      const vm=bindings.get(article)?.vm;
      return vm && vm.focus.type===focus.type && String(vm.focus.id)===String(focus.id);
    };
    while (!matchesFocus() && !body.querySelector('.v2-report-failure')) { current(); await wait(100); }
    if (!host().dataset.externalReportKind) {
      let timer;
      try {
        await Promise.race([window.UGA_V2_MOBILITY_PROFILES?.settleForPublication?.(),
          new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Mobility evidence is still being prepared. Please retry from the report.')), Math.max(1,end-Date.now())); })]);
      } finally { clearTimeout(timer); }
    }
    let changed = Date.now();
    const watch = new MutationObserver(() => { changed = Date.now(); });
    watch.observe(body, {subtree:true, childList:true, characterData:true});
    try {
      while (loading(body) || Date.now() - changed < 180) { current(); await wait(70); }
      current();
      const bound=bindings.get(body.querySelector('article'));
      if(bound?.vm.record){
        const manifest=await bound.mapStyle.publicFrame().catch(()=>null);
        bound.mapStyle.publicCells=manifest?.records;
      }
      current();
      const model=collect(body);
      if (model.mapSpec) model.locator=await window.UGA_PUBLICATION_LOCATOR.render(model.mapSpec);
      if(host().hidden || identity()!==id) throw Error('The selected report changed while its publication was being prepared.');
      return model;
    } finally { watch.disconnect(); }
  }

  const menus = 'nav,script,style,[role=tablist],.ug-pr-print-choice,.ugsp-action,.unet-actions,.unet-path-controls';
  function selectedLabel(select) {
    const label = select.closest('label');
    const name = label ? clean([...label.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join(' ')) : select.getAttribute('aria-label');
    return [name, read(select.selectedOptions[0])].filter(Boolean).join(' · ');
  }
  // Isolate graphics from web breakpoints. Only SVG drawing properties cross the boundary.
  function vector(node) {
    const copy = node.cloneNode(true);
    const old = [node,...node.querySelectorAll('*')], fresh = [copy,...copy.querySelectorAll('*')];
    const properties = ['fill','stroke','stroke-width','stroke-dasharray','fill-opacity','stroke-opacity','opacity','font-size','font-weight','text-anchor','dominant-baseline'];
    old.forEach((el,i) => {
      const style = getComputedStyle(el);
      fresh[i].removeAttribute('style');
      for (const prop of properties) fresh[i].style.setProperty(prop,style.getPropertyValue(prop));
      if (el.tagName.toLowerCase()==='text') fresh[i].style.fontFamily='Arial,sans-serif';
    });
    copy.removeAttribute('width'); copy.removeAttribute('height');
    copy.setAttribute('class','publication-vector');
    return copy;
  }
  function collect(body) {
    const article = body.querySelector('article') || body;
    const mast = article.querySelector('.v2-sheet-masthead');
    const sourceHead = article.querySelector('.ug-nd-heading h2,h1,h2');
    const title = (host().dataset.externalReportKind && body.dataset.publicationTitle) || read(mast?.querySelector('h1') || sourceHead) || read(document.querySelector('#placeReportTitle'));
    const sourceKind = host().dataset.externalReportKind;
    const type = article.matches('.v2-report-sheet--building')?'Building':article.matches('.v2-report-sheet--lot')?'Lot':
      sourceKind ? (body.dataset.publicationType||'Market') : article.matches('.v2-report-sheet--hex') || title.startsWith('LAB-ID')?'Place':'Evidence';
    const description = read(mast?.querySelector('p') || (sourceHead?.nextElementSibling?.matches('p') ? sourceHead.nextElementSibling : null));
    const place = body.dataset.publicationLocation || description || 'Hong Kong';
    const model = {title, type, placeTitle:!sourceKind && type==='Place' ? body.dataset.publicationName : '', location:place, description, id:body.dataset.publicationId||'',
      signature:read(mast?.querySelector('.v2-sheet-id span')), code:type==='Place'?read(mast?.querySelector('.v2-sheet-id strong')):'', accent:mast?.style.getPropertyValue('--v2-ugs-colour'), date:new Date(), units:[], sources:[]};
    const units = model.units, witnesses=[];
    function add(kind, element) { if (element && (read(element) || element.querySelector('svg') || element.matches('svg'))) units.push({kind,element}); }
    const heading = (value, level=3) => add('heading',make('h'+level,value));
    function inline(node, target) {
      for (const child of node.childNodes) {
        if (child.nodeType===3) { target.append(child.textContent); continue; }
        if (child.nodeType!==1 || child.matches(menus)) continue;
        if (child.matches('select')) {target.append(selectedLabel(child));continue;}
        if (child.matches('input,button,textarea')) continue;
        if (child.matches('br')) {target.append(make('br'));continue;}
        if (child.matches('svg')) {target.append(vector(child));continue;}
        const tag=child.tagName.toLowerCase();
        const el=make(['strong','b','em','small','sup','sub','a'].includes(tag)?tag:'span');
        if (tag==='a') {
          try {
            const url=new URL(child.getAttribute('href'),document.baseURI);
            if (['https:','http:'].includes(url.protocol)) {
              el.href=url.href;
              if (!model.sources.some(x=>x.url===url.href)) model.sources.push({name:read(child)||url.hostname,url:url.href, row:!!child.closest('tr')});
            }
          } catch { /* Text still identifies a source without an explicit URL. */ }
        }
        inline(child,el);
        target.append(' ',el,' ');
      }
    }
    function rich(n,cls) { const p=make('p','',cls);inline(n,p);return p; }
    function drawMetrics(n,hero=false) {
      const items=[...n.children];
      const width=hero || items.length===4 ? 4 : 3;
      for(let i=0;i<items.length;i+=width) {
        const grid=make('div','',hero?'metrics lead-metrics':'metrics');
        grid.style.setProperty('--columns',Math.min(width,items.length));
        for (const item of items.slice(i,i+width)) {
          const cell=make('div'), label=item.querySelector('span'), value=item.querySelector('strong,b');
          if (!label || !value) {cell.append(rich(item));}
          else {
            const text=make('strong'),parts=read(value).split('/');
            parts.forEach((part,index)=>{if(index)text.append('/',document.createElement('wbr'));text.append(part);});
            cell.append(make('span',read(label)),text);
            const meta=[...item.querySelectorAll('small,em')].map(read).filter(Boolean);
            if(meta.length) cell.append(make('small',meta.join(' · ')));
          }
          grid.append(cell);
        }
        add('block',grid);
      }
    }
    function table(headers,rows,cls='') {
      const t=make('table','',cls), head=t.createTHead().insertRow(), tb=t.createTBody();
      for(const v of headers) head.append(make('th',v));
      for(const row of rows) {
        const tr=tb.insertRow();
        for(const val of row) {const td=tr.insertCell();if(typeof val==='string')td.textContent=val;else td.append(val);}
      }
      add('table',t);
    }
    function traverse(n) {
      if (n.nodeType!==1 || n.matches(menus) || n===mast || n===sourceHead || n.matches('.v2-sheet-footer')) return;
      if (sourceKind && n===sourceHead?.nextElementSibling && n.matches('p')) return;
      if (n.hidden && !n.matches('[role=tabpanel],[data-ug-report-panel],[data-ugmp-reading-pane]')) return;
      if (n.matches('button,input,textarea,[role=button]')) {
        if(n.matches('.v2-report-relation')) add('block',make('p',[read(n.querySelector('strong')),read(n.querySelector('small'))].filter(Boolean).join('  ·  '),'relation'));
        else if(n.matches('[data-nd-action="source"],[data-ph-action="estate"],[data-pr-action="place"]')) add('block',make('p',read(n),'relation'));
        return;
      }
      if(n.matches('.v2-sheet-section-title')) {
        const el=make('h2',read(n.querySelector('h2')));const scope=read(n.querySelector('small'));
        if(scope) el.append(make('small',scope));
        add('heading',el); return;
      }
      if(n.matches('h1,h2,h3,h4,h5,h6,summary')) { heading(read(n),n.matches('h1,h2')?2:n.matches('summary,h4,h5,h6')?4:3);return; }
      if(n.matches('select,label:has(select)')) {
        const select=n.matches('select')?n:n.querySelector('select');
        add('block',make('p',selectedLabel(select),'setting'));return;
      }
      if(n.matches('.v2-sheet-metric-grid,.ug-nd-metrics,.ug-pr-metrics')) {drawMetrics(n,n.matches('.v2-sheet-metric-grid--hero'));return;}
      if(n.matches('.v2-radar-wrap')) {
        const chart=make('div','','radar');chart.append(vector(n.querySelector('svg')));
        const list=make('div','','axis-list');for(const row of n.querySelectorAll('.v2-radar-value-row')) {
          const line=make('div');line.append(make('b',read(row.querySelector('strong'))),make('strong',read(row.querySelector('b'))),make('small',read(row.querySelector('small'))));list.append(line);
        }
        chart.append(list);add('block',chart);return;
      }
      if(n.matches('.v2-analysis-bars')) {
        for(const row of n.children) {
          const label=row.firstElementChild,value=row.lastElementChild,el=make('div','','lens');
          const text=make('div');text.append(make('b',clean(label.firstChild.textContent)),make('small',read(label.querySelector('small'))),make('p',read(label.querySelector('em'))));
          const marker=make('div','','lens-value'), bar=make('i'),fill=make('i');fill.style.width=row.querySelector('i>b')?.style.width||'0';bar.append(fill);
          marker.append(make('b',clean(value.firstChild.textContent)),bar,make('small',read(value.querySelector('small'))));
          el.append(text,marker);add('block',el);
        }return;
      }
      if(n.matches('.ug-market-peer-group') && n.querySelector('.ug-market-peer')) {
        let records=[];
        const flush=()=>{if(records.length)table(['Comparison','This value','Benchmark','Difference and support'],records,'comparisons');records=[];};
        for(const child of n.children) {
          if(!child.matches('.ug-market-peer')) {flush();traverse(child);continue;}
          const vals=child.querySelectorAll(':scope>div b');
          records.push([read(child.querySelector('strong')),read(vals[0]),read(vals[1]),[read(child.querySelector('p')),read(child.querySelector('small'))].filter(Boolean).join(' · ')]);
        }
        flush();return;
      }
      if(n.matches('pre') && sourceKind==='public-housing'){
        let fields;try{fields=JSON.parse(n.textContent);}catch{/* Keep unstructured source notes readable. */}
        if(fields && !Array.isArray(fields) && typeof fields==='object'){
          const fieldText=x=>String(x??'').replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
          const rows=Object.entries(fields).map(([k,v])=>{
            if(v && typeof v==='object'){
              const text=fieldText(v.en??Object.values(v)[0]);
              const chinese=/name|block/i.test(k)?fieldText(v['zh-Hant']):'';
              return [k,[text,chinese!==text?chinese:''].filter(Boolean).join(' · ')];
            }
            return [k,fieldText(v)];
          });
          table(['Catalogue field','Source value'],rows,'pairs');return;
        }
      }
      if(n.matches('dl')) {
        const entries=[...n.children],rows=[];
        for(const e of entries) {if(e.matches('dt')) rows.push([read(e),'']);else if(e.matches('dd')&&rows.length) rows.at(-1)[1]+=(rows.at(-1)[1]?' · ':'')+read(e);}
        if(rows.length){table(['Measure','Evidence'],rows,'pairs');return;}
      }
      if(n.matches('.v2-technical-section')) {
        heading(read(n.querySelector('h4')),3);
        table(['Field','Reported value'],[...n.querySelectorAll('p')].map(p=>[read(p.querySelector('span')),read(p.querySelector('strong'))]),'pairs');return;
      }
      if(n.matches('table')) {
        const t=make('table');if(n.caption)t.createCaption().textContent=read(n.caption);
        for(const group of n.children) {
          if(!group.matches('thead,tbody,tfoot'))continue;
          const g=make(group.tagName.toLowerCase());
          for(const row of group.rows){const tr=make('tr');for(const cell of row.cells){const c=make(cell.tagName.toLowerCase());c.colSpan=cell.colSpan;c.rowSpan=cell.rowSpan;
            const details=[...cell.querySelectorAll(':scope >details')];
            if(details.length){
              const copy=cell.cloneNode(true);
              copy.querySelectorAll(':scope >details').forEach(e=>e.remove());
              inline(copy,c);
              const ref=String(witnesses.length+1),notes=make('div');
              for(const item of details) {
                const label=read(item.querySelector('summary'));
                if(label)notes.append(make('b',label));
                for(const child of item.children)if(!child.matches('summary')) notes.append(rich(child));
              }
              witnesses.push([ref,notes]);c.append(' ['+ref+']');
            } else inline(cell,c);
            tr.append(c);}g.append(tr);}t.append(g);
        }add('table',t);return;
      }
      if(n.matches('.v2-sheet-comparison,.v2-climate-profile,.v2-climate-coastal-row')) {
        const box=make('div','','comparison');const top=n.firstElementChild;
        box.append(make('b',read(top?.querySelector('span'))),make('strong',read(top?.querySelector('strong'))));
        const position=n.querySelector('.v2-sheet-scale>i,.v2-climate-profile-marker,.v2-climate-coastal-scale>b');
        if(position){const track=make('i'),tick=make('i');
          const zero=n.querySelector('.v2-climate-profile-zero');
          if(zero){const ref=make('i','','zero');ref.style.left=zero.style.left;track.append(ref);}
          if(n.matches('.v2-climate-coastal-row')){track.className='share';track.style.setProperty('--share',position.style.width);}tick.style.left=position.style.left||position.style.width||'0';track.append(tick);box.append(track);}
        const notes=[...n.children].slice(1).map(x=>clean([...x.children].length?[...x.children].map(read).filter(Boolean).join(' · '):read(x))).filter(Boolean);
        if(notes.length)box.append(make('small',notes.join('  /  ')));
        add('block',box);return;
      }
      if(n.matches('.v2-age-chart')) {
        const keys=n.querySelector('.v2-age-legend');const el=make('div','','age');const track=make('div');
        for(const span of n.querySelector('.v2-age-bar')?.children||[]){const part=make('i');part.style.width=span.style.width;part.style.background=getComputedStyle(span).backgroundColor;track.append(part);}
        el.append(track,make('small',[...(keys?.children||[])].map(read).join('    ·    ')));add('block',el);return;
      }
      if(n.matches('.ugsp-values,.ugsp-amenities') || n.matches('figure:has(.ugsp-reach-row)')) {
        const modes=['public','road'].map(k=>read(article.querySelector('[data-ugsp-'+k+']')?.selectedOptions?.[0]) || (k==='public'?'Public transport':'Vehicle'));
        const reach=n.matches('figure');
        if(reach)heading(read(n.querySelector('figcaption')),4);
        const rows=[...(reach?n.querySelectorAll('.ugsp-reach-row'):n.children)].map(r=>reach
          ?[read(r.firstElementChild),...Array.from(r.querySelectorAll('.ugsp-bar-value'),read)]
          :Array.from(r.children,read));
        table([reach?'Travel time':'Measure',...modes],rows);return;
      }
      if(n.matches('.ugmp-mode-bars,.ugmp-ranges')) {
        const rows=[...n.children].map(row=>[...row.children].length>1?[read(row.firstElementChild),read(row.lastElementChild)]:[clean(row.firstChild?.textContent),read(row.lastElementChild)]);
        if(rows.length){table(['Measure','Reading'],rows,'pairs');return;}
      }
      if(n.matches('.ugmp-reading-tabs,.ugmp-bar-scale'))return;
      if(n.matches('[data-ugmp-reading-pane]')){
        const label=document.getElementById(n.getAttribute('aria-labelledby'))?.querySelector('strong');
        if(label)heading(read(label),3);
        for(const el of n.children)traverse(el);return;
      }
      if(n.matches('svg')) {const fig=make('figure');fig.append(vector(n));add('block',fig);return;}
      if(n.matches('figure') && n.querySelector('svg')) {
        const fig=make('figure');fig.append(vector(n.querySelector('svg')));
        if(n.querySelector('figcaption')) fig.append(rich(n.querySelector('figcaption'),'caption'));
        add('block',fig);
        for(const e of n.children) if(!e.matches('figcaption,svg')&&!e.querySelector('svg')) traverse(e);
        return;
      }
      if(n.matches('.ugsp-radials')) {
        const pair=make('div','','figure-pair');
        for(const item of n.querySelectorAll(':scope >figure')){
          const fig=make('figure'),svg=item.querySelector('svg');
          if(svg)fig.append(vector(svg));
          fig.append(rich(item.querySelector('figcaption'),'caption'));
          for(const e of item.querySelectorAll('p'))fig.append(rich(e,'note'));
          pair.append(fig);
        }
        add('block',pair);return;
      }
      if(n.matches('img')) {if(n.alt)add('block',make('p',n.alt));return;}
      if(!n.children.length){
        const message=read(n);
        if(message==='Select a place or calculate reach.' || message==='Select a place to calculate reach.') {
          add('block',make('p','No journey calculation was selected.','note'));return;
        }
        if(message==='Select Show on atlas for this place to load its building coverage.'){
          add('block',make('p','Building coverage was not requested for this journey.','note'));return;
        }
        if(message.includes('Select any row to reopen the report')){
          add('block',make('p',message.split('Select any row')[0].trim(),'note'));return;
        }
      }
      if(n.matches('p,a,label,li,figcaption') || !n.children.length) {
        add('block',n.matches('a')?(()=>{const e=make('p');inline((()=>{const holder=make('span');holder.append(n.cloneNode(true));return holder;})(),e);return e;})():rich(n,
          n.matches('.v2-sheet-summary,.v2-sheet-address')?'intro':n.matches('[class*=note],[class*=scope],[class*=meta],[class*=empty],figcaption')?'note':''));
        return;
      }
      const blockChild=[...n.children].some(c=>c.matches('div,section,article,p,figure,svg,ul,ol,details,dl,table,h1,h2,h3,h4,header,footer,label,button,select,summary'));
      if(!blockChild && !n.matches('details')) {add('block',rich(n));return;}
      for(const child of n.childNodes) {
        if(child.nodeType===3 && clean(child.textContent)) add('block',make('p',clean(child.textContent)));
        else traverse(child);
      }
    }
    for(const el of body.children) traverse(el);
    if(article.matches('.ug-nd-report') && article.querySelector('.ug-nd-tabs')) {
      const extra=window.UGA_NEW_DEVELOPMENTS?.publicationContext?.();
      if(extra){const supplemental=make('section');supplemental.innerHTML=extra;traverse(supplemental);}
    }
    const method=read(article.querySelector('.v2-sheet-footer span:last-child'));
    if(method){heading('Publication basis',3);add('block',make('p',method,'note'));}
    if(witnesses.length){heading('Source record notes',3);table(['Ref.','Evidence'],witnesses,'witnesses');}
    const sources=model.sources.filter(s=>!s.row && !(witnesses.length && s.name==='Source record'));
    if(sources.length) {
      heading('Source references',2);
      table(['Source','Publisher'],sources.map(s=>{
        const url=new URL(s.url), a=make('a',s.name);a.href=s.url;return [a,url.hostname];
      }));
    }
    const binding=bindings.get(article);
    if(binding && !sourceKind){
      Object.assign(model,window.UGA_PUBLICATION_EDITION.build(model,article,binding,{make,read,vector}));
      for(const unit of [...model.executive,...model.units])window.UGA_V2_REPORT.markSignature(unit.element,binding.vm.record);
    }
    return model;
  }
  function paginate(doc,model,imageData,full) {
    const main=doc.querySelector('main'), date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Hong_Kong'}).format(model.date);
    main.replaceChildren();
    let chapter='', flow, active='', subheading='', deferred=[],folio,used=0;
    function page(continued=false) {
      folio=make('section','','sheet');
      const head=make('header','','running'), brand=make('div','','brand'), mark=make('img');
      mark.src=imageData;mark.alt='';brand.append(mark,make('b','852LAB'));
      head.append(brand,make('span',model.type+' intelligence  /  '+(model.placeTitle||model.location||model.title)));
      flow=make('div','','flow');const foot=make('footer');
      foot.append(make('span','Powered by Urban Genetics'),make('span',model.type==='Place'?model.title:model.id||model.title),make('b','','folio'));
      folio.append(head,flow,foot);main.append(folio);used=0;
      if(continued && (subheading||active))flow.append(make('div',(subheading||active)+'  /  continued','continued'));
    }
    function fits(){return flow.scrollHeight<=flow.clientHeight+0.5;}
    function queueTitle(){for(const h of deferred)flow.append(h);}
    // A provider note can be longer than a sheet. Keep its inline links and split at
    // word boundaries. Ordinary figures, readings and small tables stay intact.
    function splitText(node, firstFits) {
      const walker=doc.createTreeWalker(node,NodeFilter.SHOW_TEXT), ends=[];
      let leaf;
      while((leaf=walker.nextNode())){
        for(const m of leaf.data.matchAll(/\S+\s*/g)) ends.push([leaf,m.index+m[0].length]);
      }
      let lo=1,hi=ends.length-1,best=null;
      while(lo<=hi){
        const mid=(lo+hi)>>1, range=doc.createRange();
        range.selectNodeContents(node);range.setEnd(...ends[mid-1]);
        const first=node.cloneNode(false);first.append(range.cloneContents());
        if(firstFits(first)){best={mid,first};lo=mid+1;}else hi=mid-1;
      }
      if(!best)return null;
      const tail=doc.createRange();tail.selectNodeContents(node);tail.setStart(...ends[best.mid-1]);
      const rest=node.cloneNode(false);rest.append(tail.cloneContents());
      return [best.first,rest];
    }
    function place(el) {
      queueTitle();flow.append(el);
      const needsBody=deferred.length && el.matches('p.note,p.setting') && flow.getBoundingClientRect().bottom-el.getBoundingClientRect().bottom<48;
      if((!fits() || needsBody) && used) {
        el.remove();deferred.forEach(h=>h.remove());page(!deferred.length);queueTitle();flow.append(el);
      }
      if(!fits()){
        if(el.matches('p') && !el.querySelector('svg')){
          el.remove();
          const parts=splitText(el,part=>{flow.append(part);const ok=fits();part.remove();return ok;});
          if(parts){flow.append(parts[0]);used++;deferred=[];page(true);place(parts[1]);return;}
        }
        if(el.matches('table') && el.tBodies[0]?.rows.length===1){
          const tr=el.tBodies[0].rows[0],continuation=el.cloneNode(true);
          let split=false;
          for(const [i,cell] of Array.from(tr.cells).entries()){
            const target=continuation.tBodies[0].rows[0].cells[i];
            // A single column may contain an entire witness or list. Limit each cell
            // independently to the space available below the repeated header.
            const available=flow.getBoundingClientRect().bottom-cell.getBoundingClientRect().top-12;
            const test=cell.cloneNode(false),source=doc.createElement('div');
            while(cell.firstChild)source.append(cell.firstChild);
            cell.append(test);test.replaceWith(doc.createElement('div'));
            const measure=cell.firstChild;
            const firstFits=part=>{measure.replaceChildren(part);return measure.getBoundingClientRect().height<=available;};
            if(firstFits(source.cloneNode(true))){cell.replaceChildren(...source.childNodes);target.replaceChildren();continue;}
            const pair=splitText(source,firstFits);
            if(!pair)throw Error('A source cell exceeds the printable width or height.');
            cell.replaceChildren(...pair[0].childNodes);target.replaceChildren(...pair[1].childNodes);split=true;
          }
          if(split && fits()){used++;deferred=[];page(true);place(continuation);return;}
        }
        throw Error('A graphic exceeds the printable page. The document could not be composed.');
      }
      used++;deferred=[];
    }
    function placeTable(t) {
      const rows=[...t.tBodies].flatMap(b=>[...b.rows]);
      if(!rows.length){place(t);return;}
      const template=t.cloneNode(true);
      for(const b of [...template.tBodies])b.remove();
      const foot=template.tFoot;foot?.remove();
      let current,body;
      function start(row){current=template.cloneNode(true);body=current.createTBody();body.append(row);place(current);current=flow.lastElementChild;body=current.tBodies[0];}
      if(rows.length<=6 && used){
        queueTitle();flow.append(t);
        const move=!fits() && t.getBoundingClientRect().height<flow.clientHeight*.65;
        t.remove();deferred.forEach(h=>h.remove());if(move)page(!deferred.length);
      }
      start(rows[0]);
      for(const row of rows.slice(1)) {
        body.append(row);
        if(!fits()){row.remove();page(true);start(row);}
      }
      if(foot){current.append(foot);if(!fits()){foot.remove();place(foot.cloneNode(true));}}
    }
    page();
    const intro=make('div','','opening'), crest=make('img');
    crest.src=imageData;crest.alt='852LAB';const identity=make('div');
    identity.append(make('small','Hong Kong  /  '+model.type+' intelligence'),make('h1',model.placeTitle||model.title),
      make('p',model.location,'location'),make('p',[model.type==='Place'?model.title:model.id||model.title,date].filter(Boolean).join('   /   '),'edition'));
    intro.append(crest,identity);place(intro);
    if(model.executive){
      const guide=make('div','','cover-index');
      guide.append(make('b',model.type==='Place'?'A place, through five lenses':model.type==='Building'?'Building and neighbourhood':'Lot and land context'),
        make('span','City fabric   /   Mobility   /   Market   /   Demographics   /   Climate'));
      place(guide);
      const locator=window.UGA_PUBLICATION_EDITION.mapFigure(model.locator,make);
      if(locator)place(locator);
    }
    const archive=full||!model.executive;
    const units=model.executive ? [...model.executive] : [];
    if(archive){
      if(model.executive)units.push({kind:'chapter',element:make('h2','Evidence and source records'),label:'Appendix',turn:true});
      units.push(...model.units);
    }
    for(const entry of units) {
      const {kind}=entry,element=entry.element.cloneNode(true);
      if(kind==='chapter'){
        if(entry.turn && used && flow.lastElementChild) page();
        active=read(element);subheading='';chapter=entry.label;
        const tag=make('div',chapter,'section-id');element.classList.add('chapter-title');
        deferred.push(tag,element);continue;
      }
      if(kind==='heading'){
        if(element.tagName==='H2'){active=element.firstChild?.textContent||read(element);subheading='';}
        else subheading=read(element);
        deferred.push(element);continue;
      }
      if(kind==='table')placeTable(element);else place(element);
    }
    if(deferred.length)place(make('p','No further evidence is available for this section.','note'));
    const all=[...main.children];all.forEach((s,i)=>s.querySelector('.folio').textContent=(i+1)+' / '+all.length);
    return all.length;
  }
  // Render the already composed physical pages offline. Only the file-sharing path
  // loads the encoder. The browser's print action retains text, links and vectors.
  let encoder;
  function loadEncoder(){
    if(!encoder)encoder=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=new URL('vendor/pdf-lib-1.17.1.min.js',directory);
      script.onload=()=>resolve(window.PDFLib);
      script.onerror=()=>{encoder=null;reject(Error('The PDF encoder could not be loaded.'));};
      document.head.append(script);
    });
    return encoder;
  }
  async function pageImage(win,sheet,stylesheet){
    const size=win.getComputedStyle(sheet),w=parseFloat(size.width),h=parseFloat(size.height);
    const serializer=new XMLSerializer(),doc=win.document;
    const body=doc.createElement('body');
    const style=doc.createElement('style');style.textContent=stylesheet+'\nbody{background:white;margin:0;} .sheet{margin:0;}';
    body.append(style,sheet.cloneNode(true));
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><foreignObject width="100%" height="100%">'+serializer.serializeToString(body)+'</foreignObject></svg>';
    const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
    const source=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob);});
    const img=new Image();img.src=source;await img.decode();
    const canvas=doc.createElement('canvas');canvas.width=Math.round(w*2.5);canvas.height=Math.round(h*2.5);
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,Math.ceil(canvas.height*.19)).data;
    let ink=0;for(let n=0;n<pixels.length;n+=32){if(pixels[n]<160)ink++;}
    if(ink<100)throw Error('The browser could not draw this page.');
    const png=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Page encoding failed.')),'image/png'));
    canvas.width=canvas.height=0;return png.arrayBuffer();
  }
  async function prepareFile(win,model,toolbar,action,full){
    action.disabled=true;
    const d=win.document,sheets=[...d.querySelectorAll('.sheet')],style=d.querySelector('head style').textContent;
    try{
      const lib=await loadEncoder(),pdf=await lib.PDFDocument.create();
      pdf.setTitle((model.placeTitle||model.title)+' — 852LAB '+model.type+(full?' · full evidence':''));pdf.setAuthor('852LAB · Urban Genetics');pdf.setSubject(model.location||model.type);
      for(const [i,sheet] of sheets.entries()){
        if(win.closed)return;
        action.textContent='Preparing '+(i+1)+' / '+sheets.length;
        const image=await pdf.embedPng(await pageImage(win,sheet,style));
        const page=pdf.addPage([595.276,841.89]);page.drawImage(image,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});
        const bounds=sheet.getBoundingClientRect(),scaleX=page.getWidth()/bounds.width,scaleY=page.getHeight()/bounds.height;
        for(const a of sheet.querySelectorAll('a[href]')){
          if(!/^https?:/.test(a.href))continue;
          for(const box of a.getClientRects()){
            const annotation=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[(box.left-bounds.left)*scaleX,(bounds.bottom-box.bottom)*scaleY,(box.right-bounds.left)*scaleX,(bounds.bottom-box.top)*scaleY],Border:[0,0,0],A:{S:'URI',URI:lib.PDFString.of(a.href)}});
            page.node.addAnnot(pdf.context.register(annotation));
          }
        }
      }
      const name='852LAB-'+[model.type,model.placeTitle||model.title,...(full?['Full-evidence']:[])].join('-').replace(/[^\p{L}\p{N}.-]+/gu,'-').slice(0,112)+'.pdf';
      const file=new File([await pdf.save()],name,{type:'application/pdf'}),url=URL.createObjectURL(file);
      const download=make('a','Download PDF');download.dataset.export='';download.href=url;download.download=name;action.replaceWith(download);
      win.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
      if(win.navigator.canShare?.({files:[file]})){
        const send=make('button','Share PDF');send.dataset.export='';send.onclick=async()=>{
          try{await win.navigator.share({title:model.title,files:[file]});}
          catch(error){if(error.name!=='AbortError')send.textContent='Use Download PDF';}
        };toolbar.append(send);
      }
      d.documentElement.dataset.pdfFile='ready';
    }catch(error){
      action.disabled=false;action.textContent='Retry PDF';action.title=error.message;
      let note=toolbar.querySelector('[role=status]');if(!note){note=make('span');note.setAttribute('role','status');toolbar.append(note);}
      note.textContent='File export unavailable. Use Print / Save PDF.';d.documentElement.dataset.pdfFile='error';
    }
  }
  async function display(win,model,prepare) {
    const d=win.document;d.title=model.title+' — 852LAB '+model.type+' report';
    const controller=new AbortController(), deadline=setTimeout(()=>controller.abort(),15000);
    let imageData;
    try {
      const load=async url=>{
        const response=await fetch(url,{signal:controller.signal});
        if(!response.ok)throw Error('The publication assets could not be loaded.');
        return response;
      };
      const [styles,mark]=await Promise.all([load(css).then(r=>r.text()),load(logo).then(r=>r.blob())]);
      const style=d.createElement('style');style.textContent=styles;d.head.append(style);
      imageData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(mark);});
    } finally {clearTimeout(deadline);}
    const main=d.createElement('main');const toolbar=make('div','','toolbar'),label=make('span',model.title),button=make('button','Print / Save PDF');button.type='button';button.disabled=true;
    button.addEventListener('click',()=>win.print());toolbar.append(label,button);
    d.body.replaceChildren(toolbar,main);
    let full=false,file;
    const paint=()=>{
      d.title=(model.placeTitle||model.title)+' — 852LAB '+model.type+' report'+(full?' · full evidence':'');
      return paginate(d,model,imageData,full);
    };
    paint();
    if(model.executive){
      const edition=make('select');edition.setAttribute('aria-label','Publication edition');
      for(const [value,title] of [['brief','Executive report'],['full','Executive report + full evidence']]){
        const opt=make('option',title);opt.value=value;edition.append(opt);
      }
      toolbar.insertBefore(edition,button);
      edition.onchange=()=>{
        full=edition.value==='full';paint();fitPreview();win.scrollTo(0,0);
        toolbar.querySelectorAll('[data-export]').forEach(el=>el.remove());
        delete d.documentElement.dataset.pdfFile;addFileAction();
      };
    }
    function fitPreview(){
      const width=Number.parseFloat(win.getComputedStyle(main.firstElementChild).width);
      if(width>0)main.style.setProperty('--page-zoom',Math.min(1,d.documentElement.clientWidth/width));
    }
    fitPreview();win.addEventListener('resize',fitPreview);
    await Promise.all([...main.querySelectorAll('img')].map(img=>img.decode()));
    button.disabled=false;
    function addFileAction(){
      file=make('button','Prepare PDF');file.dataset.export='';
      file.onclick=async()=>{
        const selector=toolbar.querySelector('select');if(selector)selector.disabled=true;
        try {await prepareFile(win,model,toolbar,file,full);} finally {if(selector)selector.disabled=false;}
      };toolbar.append(file);
    }
    addFileAction();
    d.documentElement.dataset.publication='ready';if(prepare===true)file.click();return d;
  }
  async function open(prepare=false) {
    const win=window.open('','_blank');
    if(!win){window.alert('Allow the Atlas to open the publication in a new tab, then choose Print again.');return;}
    win.opener=null;
    const d=win.document;d.documentElement.lang='en';
    const viewport=d.createElement('meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';d.head.append(viewport);
    d.title='Preparing 852LAB publication';d.body.append(make('p','Preparing the selected report…'));
    try{const data=await capture();if(!win.closed)await display(win,data,prepare);}
    catch(e){if(!win.closed){d.documentElement.dataset.publication='error';d.body.replaceChildren(make('h1','Publication unavailable'),make('p',e.message));}}
  }
  window.UGA_PUBLICATION=Object.freeze({open,bind});
  window.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='p' && host() && !host().hidden){
      e.preventDefault();open();
    }
  });
})();
