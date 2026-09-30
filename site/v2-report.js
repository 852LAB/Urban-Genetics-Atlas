/* Urban Genetics Atlas V2 — visual entity report and print-sheet router. */
(function attachUGAV2Report(root,factory){
    const api=factory(root);
    if(typeof module === 'object' && module.exports) module.exports=api;
    if(root) root.UGA_V2_REPORT=api;
})(typeof globalThis !== 'undefined' ? globalThis : this,function createUGAV2Report(root){
    'use strict';

    const VERSION='V2_ENTITY_REPORT_V0_8_0';
    const UGS_SIGNATURES=Object.freeze({
        TC:Object.freeze({name:'TRANSFORMING CORE',colour:'#D25B48'}),
        EC:Object.freeze({name:'EMERGING CHANGE',colour:'#D89A43'}),
        AT:Object.freeze({name:'AGEING TRANSITION',colour:'#A95F68'}),
        VM:Object.freeze({name:'VERTICAL MATURE',colour:'#786AA0'}),
        LF:Object.freeze({name:'LEGACY FABRIC',colour:'#8F7862'}),
        CF:Object.freeze({name:'CONNECTED FABRIC',colour:'#518882'}),
        SF:Object.freeze({name:'STABLE FABRIC',colour:'#7D8790'}),
        C:Object.freeze({name:'CONSTRAINED',colour:'#A8ADB2'}),
        U:Object.freeze({name:'UNASSESSED',colour:'#D0D3D7'})
    });
    const MTR_POSITIVE_DISTRIBUTION=Object.freeze({
        q10:0.0407,q25:0.1473,median:0.8568,q75:2.2277,q90:4.0961,max:6.1761
    });
    const TECHNICAL_SECTION_ORDER=[
        '01_EVIDENCE_STATUS','02_BUILT_FORM','04_SIGNATURE_ANALYSIS',
        '05_PLANNING_CAPACITY','06_ACCESSIBILITY','07_BUILDINGS_LOTS',
        '08_ADMIN_CONTEXT','09_PROVENANCE'
    ];
    const TECHNICAL_SECTION_TITLES={
        '01_EVIDENCE_STATUS':'Evidence status','02_BUILT_FORM':'Built form evidence',
        '04_SIGNATURE_ANALYSIS':'Urban analysis evidence','05_PLANNING_CAPACITY':'Planning and capacity evidence',
        '06_ACCESSIBILITY':'Accessibility evidence','07_BUILDINGS_LOTS':'Building and Lot evidence',
        '08_ADMIN_CONTEXT':'Administrative context','09_PROVENANCE':'Provenance and method'
    };

    function escapeHtml(value){
        return String(value??'').replace(/[&<>"']/g,ch=>({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        })[ch]);
    }

    function clean(value){
        if(value === null || value === undefined) return null;
        const text=String(value).trim();
        return text === '' ? null : text;
    }

    function numeric(value){
        if(value === null || value === undefined || value === '') return null;
        const result=Number(value);
        return Number.isFinite(result) ? result : null;
    }

    function number(value,digits=0){
        const result=numeric(value);
        return result === null ? 'Not available' : result.toLocaleString('en-HK',{maximumFractionDigits:digits});
    }

    function percent(value,digits=0){
        const result=numeric(value);
        return result === null ? 'Not available' : `${number(result,digits)}%`;
    }

    function metres(value,digits=0){
        const result=numeric(value);
        return result === null ? 'Not available' : `${number(result,digits)} m²`;
    }

    function stateLabel(value){
        if(!clean(value)) return 'Not available';
        return String(value).replaceAll('_',' ').toLowerCase().replace(/(^|\s)\S/g,ch=>ch.toUpperCase());
    }

    function fieldAdapter(){ return root?.UGA_V2_FIELD_ADAPTER || null; }
    function benchmarkFields(){ return root?.UGA_V2_REPORT_BENCHMARKS?.fields || {}; }

    function entityRows(selection,key){
        const rows=selection?.entities?.[key];
        return Array.isArray(rows) ? rows : [];
    }

    function relationship(type,row,index=0){
        const id=type === 'building'
            ? row.buildingCsuid || row.building_csuid || row.id
            : type === 'lot'
                ? row.lotCsuid || row.lot_csuid || row.lotId || row.lot_id || row.id
                : row.hexId || row.hex_id || row.id;
        if(!clean(id)) return null;
        const label=type === 'building'
            ? row.displayLabelEn || row.display_label_en || row.displayLabelZh || row.display_label_zh || `Building ${id}`
            : type === 'lot'
                ? row.lotId || row.lot_id || row.lotCsuid || row.lot_csuid || `Lot ${id}`
                : `LAB-ID-${id}`;
        return Object.freeze({
            ...row,type,id:String(id),label:String(label),
            meta:clean(row.relationshipRole || row.relationship_role),
            share:numeric(row.relationshipShare ?? row.share),
            shareRelated:numeric(row.relationshipShareRelated ?? row.share_related ?? row.share_entity),
            overlapM2:numeric(row.overlapM2 ?? row.overlap_m2)
        });
    }

    function buildReportViewModel(selection,focus=null){
        if(!selection || typeof selection !== 'object') throw new Error('A V2 selection is required to build the report.');
        const activeFocus=focus || selection.initialFocus || {type:'hex',id:selection.hexId || selection.primaryHexId};
        if(!activeFocus || !['hex','building','lot'].includes(activeFocus.type)) throw new Error('A Hex, Building or Lot report focus is required.');
        const record=selection.record && typeof selection.record === 'object' ? selection.record : null;
        const hexId=String(record?.hex_id || (activeFocus.type === 'hex' ? activeFocus.id : '') || selection.primaryHexId || '');
        const relationships=Object.freeze({
            buildings:Object.freeze(entityRows(selection,'buildings').map((row,index)=>relationship('building',row,index)).filter(Boolean)),
            lots:Object.freeze(entityRows(selection,'lots').map((row,index)=>relationship('lot',row,index)).filter(Boolean)),
            hexes:Object.freeze(entityRows(selection,'hexes').map((row,index)=>relationship('hex',row,index)).filter(Boolean))
        });
        const entity=(selection.activeEntity && String(selection.activeEntity.id)===String(activeFocus.id)
            ? selection.activeEntity
            : relationships[`${activeFocus.type}s`]?.find(row=>String(row.id)===String(activeFocus.id))) || null;
        const title=activeFocus.type === 'hex'
            ? `LAB-ID-${hexId}`
            : activeFocus.label || entity?.label || `${activeFocus.type === 'building' ? 'Building' : 'Lot'} ${activeFocus.id}`;
        const subtitle=activeFocus.type === 'hex'
            ? 'Place overview · Lenses and supporting evidence'
            : activeFocus.type === 'building'
                ? 'Property evidence with immediate, neighbourhood and city context'
                : 'Lot evidence with local analytical context';
        return Object.freeze({
            version:VERSION,entityType:activeFocus.type,focus:Object.freeze({...activeFocus}),entity,
            title,subtitle,origin:selection.origin || 'map',
            hydrationState:selection.hydrationState || (record ? 'loaded' : 'not_loaded'),
            hexId,record,climate:selection.climateRecord || null,
            climateState:selection.climateState || (selection.climateRecord ? 'loaded' : 'not_connected'),
            place:selection.place || {},
            methodVersion:selection.methodVersion || record?.public_release_method_version || null,
            relationships
        });
    }

    function card(title,body,className='',style=''){
        return `<section class="v2-sheet-card ${escapeHtml(className)}"${style?` style="${escapeHtml(style)}"`:''}><h3>${escapeHtml(title)}</h3>${body}</section>`;
    }

    function metric(label,value,detail=''){
        return `<div class="v2-sheet-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${detail?`<small>${escapeHtml(detail)}</small>`:''}</div>`;
    }

    function categoricalMetric(label,value,presentation,detail=''){
        const colour=presentation?.colour || '#9ca3af';
        const text=presentation?.label || stateLabel(value);
        return `<div class="v2-sheet-metric v2-sheet-metric--categorical" style="--v2-category-colour:${escapeHtml(colour)}"><span>${escapeHtml(label)}</span><strong><i aria-hidden="true"></i>${escapeHtml(text)}</strong>${detail?`<small>${escapeHtml(detail)}</small>`:''}</div>`;
    }

    function dominantUsePresentation(value){
        const key=String(value||'').toUpperCase();
        const exact={
            OBSERVED_DOMESTIC:['Residential','#d65f5f'],
            SUPPORTED_RESIDENTIAL_POSITIVE:['Residential','#e38173'],
            SUPPORTED_RESIDENTIAL_OR_COMPOSITE:['Residential / composite','#e9a27d'],
            HD_SEMANTIC_RESIDENTIAL_OR_COMPOSITE:['Residential / composite','#efbd8c'],
            SEMANTIC_RESIDENTIAL_OR_COMPOSITE:['Residential / composite','#f2c99b'],
            SUPPORTED_OFFICE_COMMERCIAL:['Office / commercial','#7f80c9'],
            SEMANTIC_OFFICE_COMMERCIAL:['Office / commercial','#999adc'],
            SUPPORTED_INDUSTRIAL:['Industrial','#8c78a8'],
            SEMANTIC_INDUSTRIAL:['Industrial','#aa96bf'],
            SUPPORTED_MIXED_OR_CONFLICT:['Mixed / unresolved','#d6b65c'],
            OBSERVED_NONDOMESTIC:['Non-domestic','#5f9ea0'],
            SUPPORTED_OTHER:['Other','#8ca38c'],
            SEMANTIC_OTHER:['Other','#aab7a6'],
            UNRESOLVED:['Unresolved','#aaaaaa']
        };
        const found=exact[key];
        return found ? {label:found[0],colour:found[1]} : {label:stateLabel(value),colour:'#aaaaaa'};
    }

    function planningZonePresentation(value){
        const key=String(value||'').trim().toUpperCase();
        const colours={
            'R(A)':'#d76b63','R(B)':'#dc8275','R(C)':'#e19a88','R(D)':'#e6b09b','R(E)':'#ebc4ae',
            C:'#7f80c9','C/R':'#999adc',I:'#8c78a8','G/IC':'#5f9ea0',V:'#d6b65c',OU:'#8ca38c',
            O:'#72a777',REC:'#89b88b',GB:'#6fa56a',AGR:'#adc477',CA:'#7396a8',CP:'#7f9eae',
            SSSI:'#4e8872',CDA:'#b08f62',MRDJ:'#b2a5a0'
        };
        const inferred=key.startsWith('RESIDENTIAL') ? '#d76b63'
            : key.startsWith('COMMERCIAL') ? '#7f80c9'
                : key.startsWith('INDUSTRIAL') ? '#8c78a8'
                    : key.startsWith('GREEN') ? '#6fa56a'
                        : '#aaaaaa';
        return {label:clean(value)||'Not available',colour:colours[key]||inferred};
    }

    function metricGrid(items,className=''){
        return `<div class="v2-sheet-metric-grid ${escapeHtml(className)}">${items.join('')}</div>`;
    }

    function note(text,kind='method'){
        return `<p class="v2-sheet-note" data-kind="${escapeHtml(kind)}">${escapeHtml(text)}</p>`;
    }

    function sectionTitle(kicker,title,meta=''){
        return `<div class="v2-sheet-section-title"><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div>${meta?`<small>${escapeHtml(meta)}</small>`:''}</div>`;
    }

    function hexToRgb(hex){
        const match=/^#([0-9a-f]{6})$/i.exec(String(hex||''));
        if(!match) return null;
        const value=parseInt(match[1],16);
        return {r:(value>>16)&255,g:(value>>8)&255,b:value&255};
    }

    function signaturePresentation(record){
        const signature=UGS_SIGNATURES[String(record?.signature_code||'').toUpperCase()]||null;
        if(!signature) return null;
        const rgb=hexToRgb(signature.colour);
        if(!rgb) return null;
        const luminance=(0.2126*rgb.r+0.7152*rgb.g+0.0722*rgb.b)/255;
        return {
            ...signature,
            onColour:luminance>.62?'#1f2937':'#ffffff',
            style:`--v2-ugs-colour:${signature.colour};--v2-ugs-on:${luminance>.62?'#1f2937':'#ffffff'};--v2-ugs-fill:rgba(${rgb.r},${rgb.g},${rgb.b},.22);--v2-ugs-soft:rgba(${rgb.r},${rgb.g},${rgb.b},.12)`
        };
    }

    function interpolatePosition(value,anchors){
        if(value<=anchors[0][0]) return anchors[0][1];
        for(let index=1;index<anchors.length;index+=1){
            const [highValue,highPosition]=anchors[index];
            const [lowValue,lowPosition]=anchors[index-1];
            if(value<=highValue){
                const ratio=highValue===lowValue?0:(value-lowValue)/(highValue-lowValue);
                return lowPosition+ratio*(highPosition-lowPosition);
            }
        }
        return anchors[anchors.length-1][1];
    }

    function mtrAccessibility(value){
        const result=numeric(value);
        if(result===null) return null;
        const positive=Math.max(0,result);
        const d=MTR_POSITIVE_DISTRIBUTION;
        const label=positive<=0
            ? 'No modelled signal'
            : positive<d.q25
                ? 'Lower accessibility'
                : positive<d.q75
                    ? 'Mid-range accessibility'
                    : 'Higher accessibility';
        const position=interpolatePosition(positive,[
            [0,0],[d.q10,10],[d.q25,25],[d.median,50],[d.q75,75],[d.q90,90],[d.max,100]
        ]);
        return {label,position};
    }

    function mtrComparison(value){
        const context=mtrAccessibility(value);
        if(!context){
            return `<div class="v2-sheet-comparison is-missing"><div><span>MTR accessibility</span><strong>Not available</strong></div><small>Comparison unavailable</small></div>`;
        }
        return `<div class="v2-sheet-comparison v2-sheet-comparison--mtr">
            <div class="v2-sheet-comparison-head"><span>MTR accessibility</span><strong>${escapeHtml(context.label)}</strong></div>
            <div class="v2-sheet-scale" aria-label="${escapeHtml(context.label)}"><i style="left:${context.position.toFixed(1)}%"></i></div>
            <div class="v2-sheet-scale-labels"><span>Lower</span><b>${escapeHtml(context.label)}</b><span>Higher</span></div>
            <small>Relative position within the positive Hong Kong MTR-index distribution; the raw index remains in detailed evidence.</small>
        </div>`;
    }

    function contextPosition(value,field){
        const numericValue=numeric(value);
        const context=benchmarkFields()[field];
        if(numericValue === null || !context || numeric(context.q10) === null || numeric(context.q90) === null) return null;
        const low=Number(context.q10);
        const high=Number(context.q90);
        const position=high === low ? 50 : Math.max(0,Math.min(100,(numericValue-low)/(high-low)*100));
        let label='Typical range';
        if(numericValue < Number(context.q25)) label='Lower context';
        else if(numericValue > Number(context.q75)) label='Higher context';
        return {position,label,low,median:Number(context.median),high,count:Number(context.count)||0};
    }

    function comparison(label,value,field,formatted,detail=''){
        const position=contextPosition(value,field);
        if(!position){
            return `<div class="v2-sheet-comparison is-missing"><div><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatted)}</strong></div><small>Comparison unavailable</small></div>`;
        }
        return `<div class="v2-sheet-comparison">
            <div class="v2-sheet-comparison-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatted)}</strong></div>
            <div class="v2-sheet-scale" aria-label="${escapeHtml(position.label)}"><i style="left:${position.position.toFixed(1)}%"></i></div>
            <div class="v2-sheet-scale-labels"><span>Lower</span><b>${escapeHtml(position.label)}</b><span>Higher</span></div>
            ${detail?`<small>${escapeHtml(detail)}</small>`:''}
        </div>`;
    }

    function ageComposition(record){
        const young=numeric(record?.census_under15_pct);
        const older=numeric(record?.census_age65plus_pct);
        if(young === null || older === null) return `<div class="v2-report-empty" data-state="not_available">Age composition is not available for this Census context.</div>`;
        const working=Math.max(0,100-young-older);
        return `<div class="v2-age-chart">
            <div class="v2-age-bar" role="img" aria-label="Under 15 ${young}%, age 15 to 64 ${working.toFixed(1)}%, age 65 plus ${older}%">
                <i data-age="young" style="width:${young}%"></i><i data-age="working" style="width:${working}%"></i><i data-age="older" style="width:${older}%"></i>
            </div>
            <div class="v2-age-legend"><span><i data-age="young"></i>Under 15 <b>${percent(young,1)}</b></span><span><i data-age="working"></i>15–64 <b>${percent(working,1)}</b></span><span><i data-age="older"></i>65+ <b>${percent(older,1)}</b></span></div>
        </div>`;
    }

    function radarChart(record){
        const axes=[
            ['Intensity','intensity_axis_01'],['Access','accessibility_axis_01'],['Form','height_form_axis_01'],['Change','change_axis_01'],['Age','age_axis_01']
        ];
        const values=axes.map(([,field])=>numeric(record?.[field]));
        if(values.filter(value=>value!==null).length<3) return `<div class="v2-report-empty" data-state="not_available">The five-axis place profile is not available.</div>`;
        const cx=90,cy=78,radius=57;
        const point=(index,scale)=>{
            const angle=-Math.PI/2+index*Math.PI*2/axes.length;
            return [cx+Math.cos(angle)*radius*scale,cy+Math.sin(angle)*radius*scale];
        };
        const polygon=values.map((value,index)=>point(index,Math.max(0,Math.min(1,value??0))).map(x=>x.toFixed(1)).join(',')).join(' ');
        const rings=[.25,.5,.75,1].map(scale=>`<polygon points="${axes.map((_,index)=>point(index,scale).map(x=>x.toFixed(1)).join(',')).join(' ')}"></polygon>`).join('');
        const spokes=axes.map((_,index)=>{const [x,y]=point(index,1);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;}).join('');
        const labels=axes.map(([label],index)=>{const [x,y]=point(index,1.27);return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${escapeHtml(label)}</text>`;}).join('');
        return `<div class="v2-radar-wrap"><svg class="v2-radar" viewBox="0 0 180 160" role="img" aria-label="Five-axis urban profile"><g class="v2-radar-grid">${rings}${spokes}</g><polygon class="v2-radar-value" points="${polygon}"></polygon>${labels}</svg>
            <div class="v2-radar-values">${axes.map(([label],index)=>`<span>${escapeHtml(label)} <b>${values[index]===null?'—':Math.round(values[index]*100)}</b></span>`).join('')}</div></div>`;
    }

    function lensBand(value){
        const numericValue=numeric(value);
        if(numericValue===null) return 'Not assessed';
        if(numericValue<.25) return 'Lower expression';
        if(numericValue<.50) return 'Moderate expression';
        if(numericValue<.75) return 'Elevated expression';
        return 'Stronger expression';
    }

    function analysisBars(record){
        const items=[
            ['Development pressure',record.development_pressure_raw_01,'Lens · Diagnostic','Structural conditions combined with recorded development activity.'],
            ['Renewal potential',record.renewal_observed_base_01,'Lens · Strategic screening','Established, connected and built-out renewal conditions.'],
            ['Genesis potential',record.genesis_observed_base_01,'Lens · Strategic screening','Capacity and enabling conditions associated with emerging growth.'],
            ['Capacity context',record.capacity_opportunity_mid_01,'Lens · Screening context','Observed form relative to the supported planning-envelope context.']
        ];
        return `<div class="v2-analysis-intro">Derived interpretations from connected evidence; they are not direct observations or predictions.</div><div class="v2-analysis-bars">${items.map(([label,value,role,description])=>{
            const numericValue=numeric(value);
            const width=numericValue===null?0:Math.max(0,Math.min(100,numericValue*100));
            return `<div><span>${escapeHtml(label)}<small>${escapeHtml(role)}</small><em>${escapeHtml(description)}</em></span><i><b style="width:${width}%"></b></i><strong>${escapeHtml(lensBand(numericValue))}<small>${numericValue===null?'':`Index ${Math.round(numericValue*100)} / 100`}</small></strong></div>`;
        }).join('')}</div>`;
    }

    function relationList(items,emptyText){
        if(!items.length) return `<div class="v2-report-empty" data-state="not_connected">${escapeHtml(emptyText)}</div>`;
        return `<div class="v2-report-relations">${items.slice(0,36).map(item=>{
            const share=item.share===null?'':`${Math.max(0,Math.min(100,item.share*100)).toFixed(item.share<0.1?1:0)}%`;
            const detail=[share?`${share} of current area`:null,item.shareRelated===null?null:`${(item.shareRelated*100).toFixed(item.shareRelated<0.1?1:0)}% of related entity`,item.overlapM2===null?null:`${number(item.overlapM2,0)} m² overlap`].filter(Boolean).join(' · ');
            return `<button type="button" class="v2-report-relation" data-v2-focus-type="${escapeHtml(item.type)}" data-v2-focus-id="${escapeHtml(item.id)}" data-v2-focus-label="${escapeHtml(item.label)}"><span><strong>${escapeHtml(item.label)}</strong>${detail?`<small>${escapeHtml(detail)}</small>`:''}${share?`<i><b style="width:${Math.max(1,Math.min(100,item.share*100)).toFixed(1)}%"></b></i>`:''}</span><b aria-hidden="true">›</b></button>`;
        }).join('')}${items.length>36?`<p class="v2-sheet-note">Showing the 36 largest intersections of ${number(items.length,0)}.</p>`:''}</div>`;
    }

    function signedDegrees(value,digits=1){
        const result=numeric(value);
        if(result===null) return 'Not available';
        const magnitude=Math.abs(result).toLocaleString('en-HK',{minimumFractionDigits:digits,maximumFractionDigits:digits});
        return `${result>0?'+':result<0?'−':''}${magnitude} °C`;
    }

    function climatePercent(value,digits=0){
        const result=numeric(value);
        return result===null ? 'Not available' : `${number(result*100,digits)}%`;
    }

    function climatePercentilePhrase(kind,metric){
        const percentile=numeric(metric?.percentile);
        if(percentile===null) return 'Hong Kong comparison unavailable';
        const p=Math.max(0,Math.min(100,Math.round(percentile)));
        if(kind==='heat'){
            if(p===50) return 'Near the middle of supported Climate locations';
            return p>50
                ? `Warmer than about ${p}% of supported Climate locations`
                : `Cooler than about ${100-p}% of supported Climate locations`;
        }
        if(kind==='variability'){
            if(p===50) return 'Near the middle of the supported variability distribution';
            return p>50
                ? `More variable than about ${p}% of supported Climate locations`
                : `More consistent than about ${100-p}% of supported Climate locations`;
        }
        if(kind==='terrain'){
            if(p===50) return 'Near the middle of supported terrain locations';
            return p>50
                ? `Higher than about ${p}% of supported terrain locations`
                : `Lower than about ${100-p}% of supported terrain locations`;
        }
        return `${p}th percentile of supported locations`;
    }

    function climateProfileBar({label,value,metric,left,right,centre='',zeroReference=false,detail=''}){
        const position=numeric(metric?.position);
        if(position===null){
            return `<div class="v2-climate-profile is-missing"><div class="v2-climate-profile-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div><small>Comparison unavailable</small></div>`;
        }
        const marker=Math.max(0,Math.min(100,position));
        const zero=numeric(metric?.zeroPosition);
        return `<div class="v2-climate-profile">
            <div class="v2-climate-profile-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
            <div class="v2-climate-profile-scale" role="img" aria-label="${escapeHtml(`${label}: ${value}`)}">
                ${zeroReference&&zero!==null?`<i class="v2-climate-profile-zero" style="left:${Math.max(0,Math.min(100,zero)).toFixed(1)}%"></i>`:''}
                <i class="v2-climate-profile-marker" style="left:${marker.toFixed(1)}%"></i>
            </div>
            <div class="v2-climate-profile-labels"><span>${escapeHtml(left)}</span>${centre?`<b>${escapeHtml(centre)}</b>`:'<b></b>'}<span>${escapeHtml(right)}</span></div>
            ${detail?`<small>${escapeHtml(detail)}</small>`:''}
        </div>`;
    }

    function climateCoastalBar(climate,prefix,label){
        const fraction=numeric(climate?.[`${prefix}_affected_fraction`]);
        const depth=numeric(climate?.[`${prefix}_depth_median_m`]);
        if(fraction===null){
            return `<div class="v2-climate-coastal-row is-missing"><div><span>${escapeHtml(label)}</span><strong>Not available</strong></div><small>No coastal screening context</small></div>`;
        }
        const pct=Math.max(0,Math.min(100,fraction*100));
        const value=fraction<=0?'0%':`${number(pct,pct<1?1:0)}%`;
        const detail=fraction<=0
            ? 'No affected land indicated in this local context'
            : depth===null
                ? 'Median affected depth not available'
                : `Median affected depth ${number(depth,2)} m`;
        return `<div class="v2-climate-coastal-row">
            <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)} affected</strong></div>
            <i class="v2-climate-coastal-scale"><b style="width:${pct.toFixed(2)}%"></b></i>
            <small>${escapeHtml(detail)}</small>
        </div>`;
    }

    function climateReport(model){
        const climate=model?.climate;
        const heading=sectionTitle('CLIMATE · LENS, CONTEXT & SCREENING','Heat, terrain and coastal scenario evidence');
        if(!climate){
            const state=model?.climateState==='no_context'?'not_available':'not_connected';
            return `${heading}${card('Climate context',`<div class="v2-report-empty" data-state="${state}">No public Climate context is available for this primary area. Missing Climate evidence is not interpreted as zero.</div>`)}`;
        }

        const heatValue=numeric(climate.heat_persistent_relative_c);
        const variability=numeric(climate.heat_interannual_mad_c);
        const heatProfile=climate.climate_profile?.heatRelative || null;
        const variabilityProfile=climate.climate_profile?.heatVariability || null;
        const terrainProfile=climate.climate_profile?.terrainElevation || null;
        const heatSupport=stateLabel(climate.heat_support_status);

        const heatBody=`<div class="v2-climate-profile-stack">
            ${climateProfileBar({
                label:'Persistent Relative Surface Heat',
                value:signedDegrees(heatValue,1),
                metric:heatProfile,
                left:'Cooler',centre:'0°C reference',right:'Warmer',zeroReference:true,
                detail:climatePercentilePhrase('heat',heatProfile)
            })}
            ${climateProfileBar({
                label:'Interannual variability',
                value:variability===null?'Not available':`${number(variability,2)} °C`,
                metric:variabilityProfile,
                left:'More consistent',right:'More variable',
                detail:climatePercentilePhrase('variability',variabilityProfile)
            })}
        </div>` + metricGrid([
            metric('Persistent support',climatePercent(climate.heat_valid_fraction,0),heatSupport),
            metric('Seven-year support',climatePercent(climate.heat_7yr_support_fraction,0),'share observed in all seven study years')
        ]) + note('Persistent Relative Surface Heat is a derived observational lens from repeated summer Landsat surface-temperature evidence. Interannual variability is shown separately rather than folded into a composite heat score. It is not average air temperature or a property-specific measurement.');

        const terrainValue=numeric(climate.terrain_elevation_mean_m_hkpd);
        const terrainBody=`<div class="v2-climate-profile-stack">
            ${climateProfileBar({
                label:'Mean terrain elevation',
                value:terrainValue===null?'Not available':`${number(terrainValue,1)} m HKPD`,
                metric:terrainProfile,
                left:'Lower',right:'Higher',
                detail:climatePercentilePhrase('terrain',terrainProfile)
            })}
        </div>` + metricGrid([
            metric('Coastal land support',climatePercent(climate.terrain_land_fraction,0),stateLabel(climate.coastal_context_status))
        ]);

        const coastalBody=`<div class="v2-climate-coastal-bars">
            ${climateCoastalBar(climate,'coastal_present_p95','Present P95')}
            ${climateCoastalBar(climate,'coastal_2050_ssp245_med','2050 SSP2-4.5 median')}
            ${climateCoastalBar(climate,'coastal_2100_ssp245_med','2100 SSP2-4.5 median')}
            ${climateCoastalBar(climate,'coastal_2100_ssp585_med','2100 SSP5-8.5 median')}
            ${climateCoastalBar(climate,'coastal_2100_ssp585_high','2100 SSP5-8.5 high')}
        </div>` + note('Coastal bars show the absolute share of supported local land context indicated as affected under each screening scenario. Coastal values are modelled screening evidence: not observed flooding and not a hydraulic flood prediction.','caution');

        const entityNote=model.entityType==='hex'
            ? ''
            : note(`Climate values describe the primary local area context (LAB-ID-${model.hexId || 'not available'}), not the ${model.entityType==='building'?'Building':'Lot'} as an asset-specific observation.`,'caution');

        return `${heading}${card('Heat',heatBody,'v2-sheet-card--climate')}${card('Terrain context',terrainBody,'v2-sheet-card--climate')}${card('Coastal screening',coastalBody,'v2-sheet-card--climate')}${entityNote}`;
    }

    function marketReport(record){
        const html=root?.UGA_MARKET_REPORT?.reportHtml?.(record);
        return html ? `${sectionTitle('MARKET · LENSES & EVIDENCE','Market movement, activity and place context')}${card('Market context',html,'v2-sheet-card--market')}` : '';
    }

    function reportMasthead(model,eyebrow){
        const record=model.record || {};
        const badge=model.entityType === 'hex' ? (record.signature_code || 'PLACE') : model.entityType.toUpperCase();
        const signature=model.entityType==='hex'?signaturePresentation(record):null;
        return `<header class="v2-sheet-masthead${signature?' has-ugs-colour':''}"${signature?` style="${escapeHtml(signature.style)}"`:''}>
            <div><span>${escapeHtml(eyebrow)}</span><h1>${escapeHtml(model.title)}</h1><p>${escapeHtml(model.subtitle)}</p></div>
            <div class="v2-sheet-id"><strong>${escapeHtml(badge)}</strong><span>${escapeHtml(record.signature_name || record.had_name_en || 'Urban Genetics Atlas')}</span></div>
        </header>`;
    }

    function hexNarrative(record){
        const parts=[];
        if(clean(record.signature_plain_language_summary)) parts.push(record.signature_plain_language_summary);
        else if(clean(record.signature_name)) parts.push(`This place is classified as ${record.signature_name}.`);
        if(clean(record.baseline_dominant_use)) parts.push(`Its dominant observed use is ${stateLabel(record.baseline_dominant_use)}.`);
        if(clean(record.planning_dominant_zone_label)) parts.push(`The dominant planning context is ${record.planning_dominant_zone_label}.`);
        return parts.join(' ') || 'A concise narrative is not available for this place.';
    }

    function renderHex(model){
        if(!model.record) return `<article class="v2-report-sheet">${reportMasthead(model,'PLACE OVERVIEW')}<div class="v2-report-empty" data-state="not_loaded">The authoritative place record could not be loaded. Missing data is not interpreted as zero.</div>${climateReport(model)}</article>`;
        const record=model.record;
        const signature=signaturePresentation(record);
        const population=numeric(record.population_allocated);
        const populationLabel=population===null?'Not available':number(population,0);
        const age=numeric(record.baseline_building_age);
        const height=numeric(record.baseline_building_height);
        const overview=metricGrid([
            metric('Allocated population',populationLabel,'2021 model allocation'),
            metric('Built floor area',metres(record.baseline_current_floor_area_m2,0),'current physical estimate'),
            metric('Typical building height',height===null?'Not available':`${number(height,1)} m`,'local baseline'),
            metric('Typical building age',age===null?'Not available':`${number(age,0)} years`,'local baseline')
        ],'v2-sheet-metric-grid--hero');
        const censusAvailable=numeric(record.census_under15_pct)!==null || numeric(record.census_average_household_size)!==null;
        const censusBody=censusAvailable ? `${ageComposition(record)}<div class="v2-sheet-comparison-grid">
            ${comparison('Average household size',record.census_average_household_size,'census_average_household_size',number(record.census_average_household_size,1),'people')}
            ${comparison('Median household income',record.census_median_household_income_hkd,'census_median_household_income_hkd',numeric(record.census_median_household_income_hkd)===null?'Not available':`HK$${number(record.census_median_household_income_hkd,0)}`,'monthly')}
            ${comparison('Median household floor area',record.census_median_household_floor_area_m2,'census_median_household_floor_area_m2',metres(record.census_median_household_floor_area_m2,0),'source-geography statistic')}
        </div>${note(`Census source: ${clean(record.census_control_name)||clean(record.census_observed_geography)||'not available'}. Values describe the source geography, not measurements for LAB-ID-${model.hexId}.`)}`
        : `<div class="v2-report-empty" data-state="not_available">No Census context is connected to this place record.</div>`;
        const builtBody=`<div class="v2-sheet-comparison-grid">
            ${comparison('Building height',record.baseline_building_height,'baseline_building_height',height===null?'Not available':`${number(height,1)} m`)}
            ${comparison('Building age',record.baseline_building_age,'baseline_building_age',age===null?'Not available':`${number(age,0)} years`)}
            ${comparison('Pedestrian network',record.pedestrian_index,'pedestrian_index',number(record.pedestrian_index,3),'relative connected-context position')}
            ${comparison('Road connectivity',record.road_connectivity_index,'road_connectivity_index',number(record.road_connectivity_index,3),'relative connected-context position')}
        </div>${metricGrid([
            categoricalMetric('Dominant use',record.baseline_dominant_use,dominantUsePresentation(record.baseline_dominant_use)),
            categoricalMetric('Planning zone',record.planning_dominant_zone_label,planningZonePresentation(record.planning_dominant_zone_label)),
            metric('Buildings intersecting',number(record.building_intersection_count,0)),
            metric('Lots intersecting',number(record.lot_intersection_count,0))
        ])}`;
        const livingBody=metricGrid([
            metric('Total BFA / allocated resident',metres(record.total_bfa_per_allocated_resident_context_m2,1),'all represented uses'),
            metric('Observed domestic area / allocated resident',metres(record.observed_domestic_floor_area_per_allocated_resident_m2,1),'partial observed-use evidence'),
            metric('Use evidence coverage',numeric(record.use_evidence_coverage_share)===null?'Not available':percent(Number(record.use_evidence_coverage_share)*100,0)),
            metric('Domestic evidence state',stateLabel(record.domestic_measure_state))
        ]) + note('Floor-area-per-resident measures are context indicators—not dwelling size, saleable area, statutory GFA, direct occupancy or development entitlement.','caution');

        return `<article class="v2-report-sheet v2-report-sheet--hex">
            ${reportMasthead(model,'PLACE OVERVIEW')}
            <p class="v2-sheet-summary">${escapeHtml(hexNarrative(record))}</p>
            ${overview}
            ${sectionTitle('LENSES','Urban character and derived conditions',record.signature_name || 'Unassessed')}
            ${card('Urban Genetic Signature',radarChart(record),'v2-sheet-card--radar',signature?.style||'')}
            ${card('Lens profiles',analysisBars(record),'v2-sheet-card--lenses')}
            ${sectionTitle('EVIDENCE · PEOPLE','Population and household context',record.census_hma_name || '')}
            ${card('Population and age evidence',censusBody,'v2-sheet-card--demographics')}
            ${sectionTitle('EVIDENCE · FABRIC & ACCESS','Built form and connection evidence')}
            ${card('Built form and accessibility',builtBody)}
            ${sectionTitle('EVIDENCE · LIVING CONTEXT','Floor area and evidence coverage')}
            ${card('Public living-space evidence',livingBody)}
            ${climateReport(model)}
            ${marketReport(record)}
            <footer class="v2-sheet-footer"><span>852LAB · ${escapeHtml(record.had_name_en || 'Hong Kong')} · LAB-ID-${escapeHtml(model.hexId)}</span><span>Powered by Urban Genetics · ${escapeHtml(model.methodVersion || 'V2 public payload')}</span></footer>
        </article>${relationshipEvidence(model)}${technicalEvidence(model)}`;
    }

    function entityValue(entity,...keys){
        for(const key of keys){
            if(entity && entity[key] !== undefined && entity[key] !== null && entity[key] !== '') return entity[key];
        }
        return null;
    }

    function renderBuilding(model){
        const building=model.entity || model.relationships.buildings[0] || {};
        const height=numeric(entityValue(building,'height_m','building_height_m','buildingHeightM'));
        const label=entityValue(building,'name_en','displayLabelEn','display_label_en','name_zh','displayLabelZh','display_label_zh','address') || model.title;
        const address=entityValue(building,'address');
        const opDateMin=entityValue(building,'op_date_min');
        const opDateMax=entityValue(building,'op_date_max');
        const operationPeriod=[opDateMin,opDateMax].filter(Boolean).join(' – ') || 'Not available';
        const buildingMetrics=metricGrid([
            metric('Status',entityValue(building,'status') || 'Not available'),
            metric('Use',entityValue(building,'use','use_description','useDescription') || 'Not available'),
            metric('Storeys above ground',number(entityValue(building,'storeys','storeys_above_ground','storeysAboveGround'),0)),
            metric('Basements',number(entityValue(building,'basements'),0)),
            metric('Building height',height===null?'Not available':`${number(height,1)} m`),
            metric('Footprint',metres(entityValue(building,'footprint_m2','footprintM2'),0)),
            metric('Operation-date range',operationPeriod),
            metric('Population role',stateLabel(entityValue(building,'population_role_2021')),'2021 model evidence role')
        ]);
        const hex=model.record;
        const signature=signaturePresentation(hex);
        const hexContext=hex ? `${metricGrid([
            metric('Primary area context',`LAB-ID-${model.hexId}`,'largest trusted polygon intersection'),
            metric('Urban signature',hex.signature_name || 'Unassessed'),
            metric('Allocated population',number(hex.population_allocated,0),'local model allocation'),
            categoricalMetric('Dominant use',hex.baseline_dominant_use,dominantUsePresentation(hex.baseline_dominant_use)),
            categoricalMetric('Planning zone',hex.planning_dominant_zone_label,planningZonePresentation(hex.planning_dominant_zone_label))
        ])}${mtrComparison(hex.mtr_index_built)}${note('The primary context is the largest trusted analytical-area intersection recorded for this Building. Other related areas remain listed below.','caution')}`
        : `<div class="v2-report-empty" data-state="not_connected">No place context is connected to this Building.</div>`;
        const lensContext=hex
            ? `${analysisBars(hex)}${note('These readings describe the local area context. They are not Building-specific predictions, valuations or development conclusions.','caution')}`
            : `<div class="v2-report-empty" data-state="not_connected">No local area context is available for a Lens reading.</div>`;
        const neighbourhoodContext=hex
            ? `${ageComposition(hex)}${metricGrid([
                metric('Census source geography',clean(hex.census_control_name)||clean(hex.census_observed_geography)||'Not available'),
                metric('Average household size',number(hex.census_average_household_size,1),'source geography'),
                metric('Median household income',numeric(hex.census_median_household_income_hkd)===null?'Not available':`HK$${number(hex.census_median_household_income_hkd,0)}`,'monthly · source geography'),
                metric('Median household floor area',metres(hex.census_median_household_floor_area_m2,0),'source geography'),
                metric('Administrative district',hex.had_name_en || 'Not available'),
                metric('Planning context',hex.planning_dominant_zone_label || 'Not available')
            ])}${note('Neighbourhood statistics retain their Census or planning source geography. They are not observations for this Building, Lot, household or analytical cell.')}`
            : `<div class="v2-report-empty" data-state="not_connected">Neighbourhood context is not connected.</div>`;
        const cityContext=hex
            ? `<div class="v2-sheet-comparison-grid">
                ${comparison('Local building height',hex.baseline_building_height,'baseline_building_height',numeric(hex.baseline_building_height)===null?'Not available':`${number(hex.baseline_building_height,1)} m`)}
                ${comparison('Local building age',hex.baseline_building_age,'baseline_building_age',numeric(hex.baseline_building_age)===null?'Not available':`${number(hex.baseline_building_age,0)} years`)}
                ${comparison('Pedestrian network',hex.pedestrian_index,'pedestrian_index',number(hex.pedestrian_index,3),'connected-place position')}
                ${comparison('Road connectivity',hex.road_connectivity_index,'road_connectivity_index',number(hex.road_connectivity_index,3),'connected-place position')}
                ${mtrComparison(hex.mtr_index_built)}
            </div>${note('Comparison bars position the local area context within accepted Hong Kong analytical distributions. They do not rank the Building itself.')}`
            : `<div class="v2-report-empty" data-state="not_connected">City comparison is not available.</div>`;
        return `<article class="v2-report-sheet v2-report-sheet--building">
            ${reportMasthead({...model,title:String(label)},'BUILDING & PLACE OVERVIEW')}
            ${address?`<p class="v2-sheet-address">${escapeHtml(address)}</p>`:''}
            <p class="v2-sheet-summary">Building-specific evidence is kept separate from the immediate place, neighbourhood and Hong Kong comparison contexts connected to it.</p>
            ${sectionTitle('PROPERTY','Evidence specific to the Building')}${card('Building snapshot',buildingMetrics)}
            ${sectionTitle('IMMEDIATE CONTEXT','Local analytical context')}${card('Primary area context',hexContext,signature?'v2-sheet-card--place-signature':'',signature?.style||'')}
            ${sectionTitle('LENS READING','Local derived conditions')}${card('Lens profiles',lensContext,'v2-sheet-card--lenses')}
            ${sectionTitle('NEIGHBOURHOOD','Census, planning and administrative context')}${card('Neighbourhood evidence',neighbourhoodContext,'v2-sheet-card--demographics')}
            ${sectionTitle('CITY CONTEXT','Local context compared across Hong Kong')}${card('Hong Kong comparison',cityContext)}
            ${climateReport(model)}
            ${model.record?marketReport(model.record):''}
            ${sectionTitle('RELATIONSHIPS','Connected entities')}
            <div class="v2-sheet-columns"><div>${card('Related areas',relationList(model.relationships.hexes,'No analytical-area intersection is connected.'))}</div><div>${card('Related Lots',relationList(model.relationships.lots,'No Lot intersection is connected.'))}</div></div>
            <footer class="v2-sheet-footer"><span>852LAB · Building evidence record</span><span>Powered by Urban Genetics · ${escapeHtml(model.methodVersion || 'V2 entity payload v0.1')}</span></footer>
        </article>${model.record?technicalEvidence(model):''}`;
    }

    function renderLot(model){
        const lot=model.entity || model.relationships.lots[0] || {};
        const lotId=entityValue(lot,'lot_id','lotId') || 'Not available';
        const lotCsuId=entityValue(lot,'lot_csuid','lotCsuid','id') || model.focus.id;
        const lotIds=entityValue(lot,'lot_ids') || [];
        const snapshot=metricGrid([
            metric('Lot ID',lotId),
            metric('Recorded area',metres(entityValue(lot,'area_m2'),0),'foundation geometry'),
            metric('Recorded Lot IDs',Array.isArray(lotIds)&&lotIds.length?lotIds.join(', '):lotId),
            metric('Buildings intersecting',number(model.relationships.buildings.length,0)),
            metric('Place areas intersecting',number(model.relationships.hexes.length,0))
        ]);
        const hex=model.record;
        const signature=signaturePresentation(hex);
        const immediateContext=hex ? `${metricGrid([
            metric('Primary area context',`LAB-ID-${model.hexId}`,'largest trusted polygon intersection'),
            metric('Urban signature',hex.signature_name || 'Unassessed'),
            categoricalMetric('Dominant use',hex.baseline_dominant_use,dominantUsePresentation(hex.baseline_dominant_use)),
            categoricalMetric('Planning zone',hex.planning_dominant_zone_label,planningZonePresentation(hex.planning_dominant_zone_label)),
            metric('Allocated population',number(hex.population_allocated,0),'local model allocation')
        ])}${mtrComparison(hex.mtr_index_built)}${note('These values belong to the connected local place and are not Lot-specific observations.','caution')}`
        : `<div class="v2-report-empty" data-state="not_connected">No place context is connected to this Lot.</div>`;
        return `<article class="v2-report-sheet v2-report-sheet--lot">${reportMasthead({...model,title:`Lot ${lotId}`},'LOT & PLACE OVERVIEW')}
            <p class="v2-sheet-summary">Stable Lot identity evidence is connected to Buildings and local place context without treating spatial intersection as ownership, entitlement or compliance evidence.</p>
            ${sectionTitle('PROPERTY','Evidence specific to the Lot record')}${card('Lot snapshot',snapshot)}
            ${sectionTitle('IMMEDIATE CONTEXT','Local analytical context')}${card('Primary area context',immediateContext,signature?'v2-sheet-card--place-signature':'',signature?.style||'')}
            ${hex?`${sectionTitle('LENS READING','Local derived conditions')}${card('Lens profiles',`${analysisBars(hex)}${note('These readings describe the local area context, not the Lot as a development proposition.','caution')}`,'v2-sheet-card--lenses')}`:''}
            ${climateReport(model)}
            ${model.record?marketReport(model.record):''}
            ${sectionTitle('RELATIONSHIPS','Connected entities')}<div class="v2-sheet-columns"><div>${card('Related Buildings',relationList(model.relationships.buildings,'No Building intersection is connected.'))}</div><div>${card('Related areas',relationList(model.relationships.hexes,'No analytical-area intersection is connected.'))}</div></div>
            ${card('Evidence boundary',note('A spatial intersection is not evidence of ownership, a cadastral legal conclusion, redevelopment entitlement, statutory GFA or regulatory compliance.','caution'))}
            <footer class="v2-sheet-footer"><span>852LAB · Lot evidence record</span><span>Powered by Urban Genetics · ${escapeHtml(model.methodVersion || 'V2 entity payload v0.1')}</span></footer>
        </article>${model.record?technicalEvidence(model):''}`;
    }

    function formattedField(record,field,definition){
        const adapter=fieldAdapter();
        return adapter?.format ? adapter.format(record,field,{decimals:definition.data_type === 'INTEGER'?0:3}) : String(record[field]);
    }

    function technicalEvidence(model){
        const record=model.record;
        const adapter=fieldAdapter();
        if(!record || !adapter?.FIELDS) return '';
        const definitions=Object.values(adapter.FIELDS).sort((a,b)=>Number(a.field_order)-Number(b.field_order));
        const sections=TECHNICAL_SECTION_ORDER.map(sectionId=>{
            const fields=definitions.filter(def=>def.report_section===sectionId && Object.prototype.hasOwnProperty.call(record,def.field_name) && !adapter.isMissing(record[def.field_name]));
            if(!fields.length) return '';
            return `<section class="v2-technical-section"><h4>${escapeHtml(TECHNICAL_SECTION_TITLES[sectionId]||sectionId)}</h4><div>${fields.map(def=>`<p><span>${escapeHtml(def.display_label)}</span><strong>${escapeHtml(formattedField(record,def.field_name,def))}</strong></p>`).join('')}</div></section>`;
        }).join('');
        return `<details class="v2-report-technical"><summary>Detailed evidence and provenance</summary>${sections}</details>`;
    }

    function relationshipEvidence(model){
        return `<details class="v2-report-technical v2-report-relationships" open><summary>Buildings and Lots connected to this place</summary><div class="v2-sheet-columns"><div>${card('Connected Buildings',relationList(model.relationships.buildings,'No Building intersection is recorded.'))}</div><div>${card('Connected Lots',relationList(model.relationships.lots,'No Lot intersection is recorded.'))}</div></div>${note('Shares are calculated from polygon intersections with the underlying analytical area. Select any row to reopen the report from that Building or Lot viewpoint.')}</details>`;
    }

    function renderReportHtml(model){
        if(!model || model.version!==VERSION) throw new Error('A V2 visual entity report view model is required.');
        if(model.entityType==='hex') return renderHex(model);
        if(model.entityType==='building') return renderBuilding(model);
        return renderLot(model);
    }

    return Object.freeze({version:VERSION,buildReportViewModel,renderReportHtml,escapeHtml,contextPosition,signaturePresentation,mtrAccessibility});
});
