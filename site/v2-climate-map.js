/* Urban Genetics Atlas V2 — Climate map renderer v0.1. */
(function attachUGAV2ClimateMap(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports) module.exports=api;
    if(root){
        root.UGA_V2_CLIMATE_MAP=api;
        if(root.document){
            const boot=()=>api.install({
                root,
                document:root.document,
                map:root.UGA_V2_MAP,
                config:root.UGA_V2_SITE_CONFIG
            });
            if(root.document.readyState==='loading'){
                root.document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});
            }else{
                setTimeout(boot,0);
            }
        }
    }
})(typeof globalThis!=='undefined'?globalThis:this,function createUGAV2ClimateMap(){
    'use strict';

    const VERSION='V2_CLIMATE_MAP_RENDERER_V0_1';
    const SOURCE_ID='v2-climate-map';
    const LAYER_ID='v2-climate-map-fill';
    const DEFAULT_OPACITY=70;
    const DEFAULT_SCENARIO='c_2100_245';

    const SCENARIOS=Object.freeze({
        c_present:'Present P95',
        c_2050_245:'2050 SSP2-4.5 median',
        c_2100_245:'2100 SSP2-4.5 median',
        c_2100_585:'2100 SSP5-8.5 median',
        c_2100_585_hi:'2100 SSP5-8.5 high'
    });

    function heatColourExpression(){
        return [
            'interpolate',['linear'],['to-number',['get','heat_c']],
            -6,'#2c7fb8',
            -3,'#7fcdbb',
            0,'#eceee8',
            3,'#fdae61',
            6,'#d73027',
            9,'#8f1d20'
        ];
    }

    function coastalColourExpression(field){
        return [
            'interpolate',['linear'],['to-number',['get',field]],
            0.001,'#dceff2',
            0.10,'#b6dfe5',
            0.25,'#8ccbd6',
            0.50,'#5eaabb',
            0.75,'#337e9b',
            1.00,'#174f73'
        ];
    }

    function coastalOpacityExpression(field,opacity=DEFAULT_OPACITY){
        const scale=Math.max(0,Math.min(1,Number(opacity)/100));
        return [
            '*',scale,
            [
                'interpolate',['linear'],['to-number',['get',field]],
                0.001,0.22,
                0.10,0.35,
                0.25,0.50,
                0.50,0.68,
                0.75,0.80,
                1.00,0.90
            ]
        ];
    }

    function heatFilter(){
        return ['all',['has','heat_c'],['!=',['get','heat_c'],null]];
    }

    function coastalFilter(field){
        return ['>',['coalesce',['to-number',['get',field]],0],0];
    }

    function install({root=globalThis,document,map,config}={}){
        if(!document||!map||!config?.climate?.map){
            console.warn('[UGA CLIMATE MAP] Required map/config is unavailable.');
            return null;
        }
        const section=document.getElementById('climateSection');
        if(!section){
            console.warn('[UGA CLIMATE MAP] Climate panel is unavailable.');
            return null;
        }
        if(section.dataset.ugaClimateMap==='ready') return root.UGAClimateMapState?.() || null;
        section.dataset.ugaClimateMap='ready';

        const toggle=document.getElementById('climateToggle');
        const theme=document.getElementById('climateTheme');
        const scenario=document.getElementById('climateScenario');
        const scenarioBlock=document.getElementById('climateScenarioBlock');
        const opacity=document.getElementById('climateOpacity');
        const opacityValue=document.getElementById('climateOpacityValue');
        const legend=document.getElementById('climateLegendHost');
        const methodNote=document.getElementById('climateMethodNote');
        const compactOpacity=section.querySelector('[data-uga-climate-opacity]');
        const compactValue=section.querySelector('[data-uga-climate-opacity-value]');

        const state={
            visible:false,
            mode:theme?.value==='coastal'?'coastal':'heat',
            scenario:SCENARIOS[scenario?.value]?scenario.value:DEFAULT_SCENARIO,
            opacity:Number(opacity?.value)||DEFAULT_OPACITY,
            sourceReady:false,
            layerReady:false
        };

        function sourceConfig(){
            return config.climate.map;
        }

        function layerBeforeId(){
            for(const id of ['buildingHeight','mtr','hover','v2-selected-place']){
                if(map.getLayer(id)) return id;
            }
            return undefined;
        }

        function ensureLayer(){
            if(!map.isStyleLoaded?.() && !map.loaded?.()) return false;
            const cfg=sourceConfig();
            if(!map.getSource(SOURCE_ID)){
                map.addSource(SOURCE_ID,{
                    type:'vector',
                    url:`pmtiles://${cfg.pmtilesUrl}`,
                    minzoom:cfg.minzoom,
                    maxzoom:cfg.maxzoom
                });
            }
            state.sourceReady=true;
            if(!map.getLayer(LAYER_ID)){
                const before=layerBeforeId();
                map.addLayer({
                    id:LAYER_ID,
                    type:'fill',
                    source:SOURCE_ID,
                    'source-layer':cfg.sourceLayer,
                    layout:{visibility:'none'},
                    paint:{
                        'fill-color':heatColourExpression(),
                        'fill-opacity':state.opacity/100,
                        'fill-outline-color':'rgba(0,0,0,0)',
                        'fill-antialias':false
                    },
                    filter:heatFilter()
                },before);
            }
            state.layerReady=true;
            return true;
        }

        function renderLegend(){
            if(!legend||!methodNote) return;
            if(state.mode==='coastal'){
                const label=SCENARIOS[state.scenario]||state.scenario;
                methodNote.innerHTML='Modelled screening evidence · affected share of supported coastal land context. Terrain remains available under <strong>Fabric</strong> and in the place report.';
                legend.innerHTML=`
                    <div class="uga-climate-legend-title">${label}</div>
                    <p class="uga-climate-legend-description">Share of supported land context indicated as affected by the selected coastal screening scenario.</p>
                    <div class="uga-climate-gradient uga-climate-gradient--coastal"></div>
                    <div class="uga-climate-legend-labels"><span>Low affected share</span><span>50%</span><span>100%</span></div>
                    <div class="uga-climate-evidence-role">Modelled screening evidence · Only affected Hexes are coloured. This is not observed flooding or a hydraulic flood prediction.</div>
                `;
            }else{
                methodNote.innerHTML='Derived observational Lens · summer Landsat record, 2020–2026. Terrain remains available under <strong>Fabric</strong> and in the place report.';
                legend.innerHTML=`
                    <div class="uga-climate-legend-title">Persistent Relative Surface Heat</div>
                    <p class="uga-climate-legend-description">Repeated surface warmth or coolness relative to Hong Kong's same-date territorial reference.</p>
                    <div class="uga-climate-gradient uga-climate-gradient--heat"></div>
                    <div class="uga-climate-legend-labels"><span>≤ −6°C cooler</span><span>0°C reference</span><span>≥ +9°C warmer</span></div>
                    <div class="uga-climate-evidence-role">Derived observational Lens · The delivered raster grid does not imply independent 30 m thermal measurement resolution.</div>
                `;
            }
        }

        function syncOpacityUi(){
            const pct=Math.round(state.opacity);
            if(opacity && Number(opacity.value)!==pct) opacity.value=String(pct);
            if(compactOpacity && Number(compactOpacity.value)!==pct) compactOpacity.value=String(pct);
            if(opacityValue) opacityValue.textContent=`${pct}%`;
            if(compactValue) compactValue.textContent=`${pct}%`;
        }

        function updateLayer(){
            renderLegend();
            if(scenarioBlock) scenarioBlock.hidden=state.mode!=='coastal';
            syncOpacityUi();
            if(!state.visible){
                if(map.getLayer(LAYER_ID)) map.setLayoutProperty(LAYER_ID,'visibility','none');
                return;
            }
            if(!ensureLayer()){
                map.once('load',updateLayer);
                return;
            }
            map.setLayoutProperty(LAYER_ID,'visibility','visible');
            if(state.mode==='coastal'){
                const field=state.scenario;
                map.setFilter(LAYER_ID,coastalFilter(field));
                map.setPaintProperty(LAYER_ID,'fill-color',coastalColourExpression(field));
                map.setPaintProperty(LAYER_ID,'fill-opacity',coastalOpacityExpression(field,state.opacity));
            }else{
                map.setFilter(LAYER_ID,heatFilter());
                map.setPaintProperty(LAYER_ID,'fill-color',heatColourExpression());
                map.setPaintProperty(LAYER_ID,'fill-opacity',Math.max(0,Math.min(1,state.opacity/100)));
            }
            map.setPaintProperty(LAYER_ID,'fill-outline-color','rgba(0,0,0,0)');
        }

        function ensureVisibleFromControl(){
            if(toggle && !toggle.checked){
                toggle.checked=true;
                state.visible=true;
            }
        }

        toggle?.addEventListener('change',()=>{
            state.visible=!!toggle.checked;
            updateLayer();
        });
        theme?.addEventListener('change',()=>{
            state.mode=theme.value==='coastal'?'coastal':'heat';
            ensureVisibleFromControl();
            updateLayer();
        });
        scenario?.addEventListener('change',()=>{
            if(SCENARIOS[scenario.value]) state.scenario=scenario.value;
            ensureVisibleFromControl();
            updateLayer();
        });
        opacity?.addEventListener('input',()=>{
            state.opacity=Number(opacity.value)||0;
            updateLayer();
        });
        compactOpacity?.addEventListener('input',()=>{
            state.opacity=Number(compactOpacity.value)||0;
            updateLayer();
        });

        renderLegend();
        syncOpacityUi();

        root.UGAClimateMapState=()=>({
            version:VERSION,
            visible:state.visible,
            mode:state.mode,
            scenario:state.scenario,
            scenarioLabel:SCENARIOS[state.scenario]||null,
            opacity:state.opacity,
            sourceReady:!!map.getSource(SOURCE_ID),
            layerReady:!!map.getLayer(LAYER_ID),
            sourceId:SOURCE_ID,
            layerId:LAYER_ID
        });
        root.UGARefreshClimateMap=updateLayer;

        console.info('[UGA CLIMATE MAP] v0.1 controls connected. Map asset remains lazy until Climate is shown.');
        return root.UGAClimateMapState();
    }

    return Object.freeze({
        VERSION,SOURCE_ID,LAYER_ID,DEFAULT_OPACITY,DEFAULT_SCENARIO,SCENARIOS,
        heatColourExpression,coastalColourExpression,coastalOpacityExpression,
        heatFilter,coastalFilter,install
    });
});
