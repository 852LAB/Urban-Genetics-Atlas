/* Urban Genetics Atlas V2 — native Census Building Group map themes. */
(function attachNativeDemographics(root){
    'use strict';
    const VERSION='V2_NATIVE_DEMOGRAPHICS_MAP_V0_4';
    const SOURCE='v2-census-context';
    const SURFACE_LAYER='v2-census-context-surface';
    const POINT_LAYER='v2-census-context-points';
    const BASE='https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/v2/entity-market-demographics/v0.1/demographics/v0.1/v2-census-context-v0.2.pmtiles';
    const THEMES={
        census_under15_pct:{label:'Population aged under 15',field:'census_under15_pct',infoKey:'demographics:census_under15_pct',unit:'%',stops:[0,8,12,16,22,30],colours:['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#e34a33','#8c2d04'],low:'Lower share',high:'Higher share'},
        census_age65plus_pct:{label:'Population aged 65+',field:'census_age65plus_pct',infoKey:'demographics:census_age65plus_pct',unit:'%',stops:[0,10,15,20,30,45],colours:['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#756bb1','#3f007d'],low:'Lower share',high:'Higher share'},
        census_median_household_income_hkd:{label:'Median monthly household income',field:'census_median_household_income_hkd',infoKey:'demographics:census_median_household_income_hkd',prefix:'HK$',stops:[10000,20000,30000,45000,70000,110000],colours:['#f7fcfd','#e5f5f9','#ccece6','#66c2a4','#238b45','#005824'],low:'Lower income',high:'Higher income'},
        census_average_household_size:{label:'Average household size',field:'census_average_household_size',infoKey:'demographics:census_average_household_size',suffix:' people',stops:[1,2,2.5,3,3.5,5],colours:['#f7fbff','#deebf7','#c6dbef','#6baed6','#2171b5','#08306b'],low:'Smaller',high:'Larger'},
        census_median_household_floor_area_m2:{label:'Median household floor area',field:'census_median_household_floor_area_m2',infoKey:'demographics:census_median_household_floor_area_m2',suffix:' m²',stops:[20,30,40,55,75,120],colours:['#fff7fb','#ece2f0','#d0d1e6','#a6bddb','#3690c0','#034e7b'],low:'Smaller',high:'Larger'}
    };

    function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
    function select(){return document.getElementById('demographicsTheme');}
    function toggle(){return document.getElementById('demographicsToggle');}
    function selected(){return THEMES[select()?.value]||null;}
    function opacity(){const input=document.querySelector('#demographicsSection input[data-uga-demo-opacity]');return Math.max(0,Math.min(1,Number(input?.value??100)/100));}
    function value(theme,properties){const n=Number(properties?.[theme.field]);return Number.isFinite(n)?n:null;}
    function formatted(theme,raw){const n=Number(raw);if(!Number.isFinite(n))return 'Not available';return `${theme.prefix||''}${n.toLocaleString('en-HK',{maximumFractionDigits:theme.field.includes('income')?0:1})}${theme.unit||theme.suffix||''}`;}
    function colourExpression(theme){const field=['to-number',['get',theme.field]];const parts=['interpolate',['linear'],field];theme.stops.forEach((stop,index)=>parts.push(stop,theme.colours[index]));return ['case',['has',theme.field],parts,'rgba(0,0,0,0)'];}

    function ensureLayer(){
        if(typeof map==='undefined'||!map) return false;
        if(!map.getSource(SOURCE)) map.addSource(SOURCE,{type:'vector',url:`pmtiles://${BASE}`,minzoom:8,maxzoom:14});
        if(!map.getLayer(SURFACE_LAYER)){
            const before=map.getLayer('hover')?'hover':undefined;
            const spec={id:SURFACE_LAYER,type:'circle',source:SOURCE,'source-layer':'census_context',layout:{visibility:'none'},paint:{
                'circle-radius':['interpolate',['linear'],['zoom'],8,6,10,10,12,16,14,24,16,32],
                'circle-color':'#756bb1','circle-opacity':.34,'circle-blur':.72,
                'circle-pitch-alignment':'map','circle-pitch-scale':'viewport'
            }};
            if(before) map.addLayer(spec,before); else map.addLayer(spec);
        }
        if(!map.getLayer(POINT_LAYER)){
            const before=map.getLayer('hover')?'hover':undefined;
            const spec={id:POINT_LAYER,type:'circle',source:SOURCE,'source-layer':'census_context',layout:{visibility:'none'},paint:{
                'circle-radius':['interpolate',['linear'],['zoom'],8,2,10,2.7,12,4,14,6,16,8],
                'circle-color':'#756bb1','circle-opacity':.9,
                'circle-stroke-width':['interpolate',['linear'],['zoom'],8,.5,14,1.15],
                'circle-stroke-color':'rgba(255,255,255,.92)',
                'circle-pitch-alignment':'map','circle-pitch-scale':'viewport'
            }};
            if(before) map.addLayer(spec,before); else map.addLayer(spec);
        }
        return true;
    }

    function renderLegend(theme){
        const host=document.getElementById('demographicsLegendHost'); if(!host||!theme)return;
        host.innerHTML=`<div class="uga-demographics-legend"><div class="legend-title-row uga-demographics-legend-heading"><h3 class="uga-demographics-legend-title">${esc(theme.label)}</h3><button type="button" class="info-trigger uga-demographics-info-trigger" data-info-key="${esc(theme.infoKey)}" aria-label="About ${esc(theme.label)}" title="About ${esc(theme.label)}">i</button></div><div class="uga-output-role" data-output-role="evidence">Evidence · 2021 Census</div><div class="uga-demographics-legend-copy">Source-geography evidence for each Census Building Group, shown from a representative map anchor. Soft edges improve continuity; they do not create independent 100 m Hex estimates.</div><div class="uga-demographics-gradient" style="background:linear-gradient(90deg,${theme.colours.join(',')})"></div><div class="uga-demographics-gradient-labels"><span>${esc(theme.low)}</span><span>${esc(theme.high)}</span></div></div>`;
    }

    function update(){
        if(!ensureLayer())return;
        const theme=selected(); const visible=!!toggle()?.checked;
        if(map.getLayer('demographics-atlas')) map.setLayoutProperty('demographics-atlas','visibility',visible&&!theme?'visible':'none');
        const visibility=visible&&theme?'visible':'none';
        map.setLayoutProperty(SURFACE_LAYER,'visibility',visibility);
        map.setLayoutProperty(POINT_LAYER,'visibility',visibility);
        if(theme){
            const colour=colourExpression(theme);
            map.setPaintProperty(SURFACE_LAYER,'circle-color',colour);
            map.setPaintProperty(SURFACE_LAYER,'circle-opacity',.34*opacity());
            map.setPaintProperty(POINT_LAYER,'circle-color',colour);
            map.setPaintProperty(POINT_LAYER,'circle-opacity',.9*opacity());
            renderLegend(theme);
        }
    }

    function popupHtml(properties){
        const metrics=Object.values(THEMES).map(theme=>`<div><span>${esc(theme.label)}</span><strong>${esc(formatted(theme,properties?.[theme.field]))}</strong></div>`).join('');
        return `<section class="v2-popup v2-census-popup"><header><small>2021 CENSUS · SOURCE GEOGRAPHY</small><h3>${esc(properties?.census_hma_name||'Census Building Group')}</h3></header><p>${esc(properties?.census_control_name||'Building Group')}</p><div class="v2-census-popup-grid">${metrics}</div><p class="v2-popup-caution">Context at the published Census Building Group geography; not a precise Building, Lot or selected-place measurement.</p></section>`;
    }

    function bind(){
        const selector=select(); if(!selector)return;
        for(const [id,theme] of Object.entries(THEMES)) if(!selector.querySelector(`option[value="${id}"]`)) selector.add(new Option(theme.label,id));
        const note=document.querySelector('#demographicsSection .uga-domain-note');
        if(note) note.innerHTML='<strong>Evidence:</strong> choose the allocated-population model or an authoritative 2021 Census Building Group statistic. Census themes use a softened source-point surface while preserving their source geography.';
        selector.addEventListener('change',()=>setTimeout(update,0));
        toggle()?.addEventListener('change',()=>setTimeout(update,0));
        document.getElementById('demographicsSection')?.addEventListener('input',event=>{if(event.target?.matches?.('[data-uga-demo-opacity]'))update();});
        map.on('click',POINT_LAYER,event=>{
            if(!selected()||!event.features?.[0])return;
            root.UGA_V2_SELECTION?.clearSelection();
            popup.innerHTML=popupHtml(event.features[0].properties||{});
            positionPopup(event.point);
            map.getCanvas().style.cursor='pointer';
        });
        map.on('mouseenter',POINT_LAYER,()=>{map.getCanvas().style.cursor='pointer';});
        map.on('mouseleave',POINT_LAYER,()=>{map.getCanvas().style.cursor='';});
        update();
    }

    const boot=()=>{try{ensureLayer();bind();}catch(error){console.error('[UGA V2] Native demographics initialisation failed.',error);}};
    if(typeof map!=='undefined'&&map){if(map.loaded())boot();else map.on('load',boot);}
    root.UGA_V2_NATIVE_DEMOGRAPHICS=Object.freeze({version:VERSION,themes:Object.keys(THEMES),layers:Object.freeze([SURFACE_LAYER,POINT_LAYER]),update});
})(typeof globalThis!=='undefined'?globalThis:this);
