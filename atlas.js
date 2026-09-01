// =====================================================
// Urban Genetics Atlas V1.1
// 852LAB Map Engine
// =====================================================


// =====================================================
// PERFORMANCE / STARTUP TIMING
// =====================================================

const PERF = {
    start: performance.now(),
    marks: {}
};

function perfMark(name){

    PERF.marks[name] =
        performance.now() -
        PERF.start;

    console.log(
        `[ATLAS PERF] ${name}:`,
        `${PERF.marks[name].toFixed(0)} ms`
    );

}

// =====================================================
// PMTILES PROTOCOL
// =====================================================

const pmtilesProtocol =
    new pmtiles.Protocol();

maplibregl.addProtocol(
    'pmtiles',
    pmtilesProtocol.tile
);

// =====================================================
// INITIAL VIEW
// =====================================================

const atlasIsMobile =
    window.matchMedia(
        '(max-width:900px)'
    ).matches;


// Desktop opening view

const desktopInitialCenter = [
    114.220,
    22.340
];

const desktopInitialZoom =
    10.5;


// Mobile opening view

const mobileInitialCenter = [
    114.180,
    22.325
];

const mobileInitialZoom =
    10.0;


// Select opening view

const atlasInitialCenter =
    atlasIsMobile
        ? mobileInitialCenter
        : desktopInitialCenter;


const atlasInitialZoom =
    atlasIsMobile
        ? mobileInitialZoom
        : desktopInitialZoom;


// =====================================================
// MAP INITIALISATION
// =====================================================

const map = new maplibregl.Map({

    container:'map',

    style:
        'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',

    center:
        atlasInitialCenter,

    zoom:
        atlasInitialZoom

});

// =====================================================
// ATLAS VECTOR TILE SOURCE LAYER
// =====================================================
//
// v1.4 PMTiles was generated directly from the GeoJSON,
// so Tippecanoe used the filename-derived layer name.
// Keep this explicit so the existing Atlas layer logic
// continues to use a single shared hex source.
//

const ATLAS_SOURCE_LAYER =
    '852LAB_v14_WGS84';

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

map.addControl(
    new maplibregl.NavigationControl(),
    'top-right'
);

perfMark('Map initialised');

// =====================================================
// UI REFERENCES
// =====================================================


// -----------------------------------------------------
// Urban Analysis
// -----------------------------------------------------

const themeSelect =
    document.getElementById('theme');

const analysisToggle =
    document.getElementById('analysisToggle');

const analysisSelectorControl =
    document.getElementById('analysisSelectorControl');

const analysisControls =
    document.getElementById('analysisControls');

const capacityContext =
    document.getElementById('capacityContext');


// -----------------------------------------------------
// Urban Analysis — Legend
// -----------------------------------------------------

const analysisLegend =
    document.getElementById('analysisLegend');

const legendTitle =
    document.getElementById('legendTitle');

const legendDescription =
    document.getElementById('legendDescription');

const legendGradient =
    document.getElementById('legendGradient');


const legendInterpretation =
    document.getElementById('legendInterpretation');


// -----------------------------------------------------
// Top-Level Panels
// -----------------------------------------------------

const analysisSection =
    document.getElementById('analysisSection');

const analysisSectionToggle =
    document.getElementById('analysisSectionToggle');

const analysisBody =
    document.getElementById('analysisBody');

const fabricSection =
    document.getElementById('fabricSection');

const fabricSectionToggle =
    document.getElementById('fabricSectionToggle');

const fabricBody =
    document.getElementById('fabricBody');

// -----------------------------------------------------
// Urban Fabric — Layer Toggles
// -----------------------------------------------------


const fabricToggle =
    document.getElementById('fabricToggle');

const terrainToggle =
    document.getElementById('terrainToggle');

const reclaimedToggle =
    document.getElementById('reclaimedToggle');

const buildingAgeToggle =
    document.getElementById('buildingAgeToggle');

const heritageToggle =
    document.getElementById('heritageToggle');

const mtrToggle =
    document.getElementById('mtrToggle');


// Terrain starts on, as in the current Atlas
terrainToggle.checked = true;


// -----------------------------------------------------
// Urban Fabric — Modules
// -----------------------------------------------------

const terrainModule =
    document.getElementById('terrainModule');

const reclaimedModule =
    document.getElementById('reclaimedModule');

const buildingAgeModule =
    document.getElementById('buildingAgeModule');

const heritageModule =
    document.getElementById('heritageModule');

const mtrModule =
    document.getElementById('mtrModule');


// -----------------------------------------------------
// Urban Fabric — Reclaimed Land
// -----------------------------------------------------

const reclamationControls =
    document.getElementById('reclamation-controls');

const reclamationLegend =
    document.getElementById('reclamationLegend');

const reclamationLegendGradient =
    document.getElementById('reclamationLegendGradient');

const reclamationSlider =
    document.getElementById('reclamation-year');

const reclamationYearValue =
    document.getElementById('reclamation-year-value');

const reclamationAreaValue =
    document.getElementById('reclamation-area-value');


// -----------------------------------------------------
// Urban Fabric — Building Age
// -----------------------------------------------------

const buildingAgeControls =
    document.getElementById('buildingAgeControls');

const buildingAgeYear =
    document.getElementById('building-age-year');

const buildingAgeYearValue =
    document.getElementById('building-age-year-value');

const buildingAgeCountValue =
    document.getElementById('building-age-count-value');

const buildingAgeLegend =
    document.getElementById('buildingAgeLegend');

const buildingAgeLegendGradient =
    document.getElementById('buildingAgeLegendGradient');


// -----------------------------------------------------
// Urban Fabric — Heritage
// -----------------------------------------------------

const heritageControls =
    document.getElementById('heritageControls');

const grade1Toggle =
    document.getElementById('grade1Toggle');

const grade2Toggle =
    document.getElementById('grade2Toggle');

const grade3Toggle =
    document.getElementById('grade3Toggle');

const heritageCountValue =
    document.getElementById('heritage-count-value');

const heritageLegend =
    document.getElementById('heritageLegend');


// -----------------------------------------------------
// Urban Fabric — MTR Network
// -----------------------------------------------------


const mtrColourToggle =
    document.getElementById('mtrColourToggle');


// -----------------------------------------------------
// Atlas initialisation
// -----------------------------------------------------

const atlasLoader =
    document.getElementById(
        'atlasLoader'
    );

const atlasLoaderStatus =
    document.getElementById(
        'atlasLoaderStatus'
    );

const atlasLoaderDots =
    document.getElementById(
        'atlasLoaderDots'
    );

// -----------------------------------------------------
// Map UI
// -----------------------------------------------------

const popup =
    document.getElementById('popup');

const status =
    document.getElementById('status');

// -----------------------------------------------------
// Welcome / Atlas Introduction
// -----------------------------------------------------

const welcomeOverlay =
    document.getElementById(
        'welcomeOverlay'
    );

const welcomeClose =
    document.getElementById(
        'welcomeClose'
    );

const welcomeCloseButton =
    document.getElementById(
        'welcomeCloseButton'
    );

const welcomeDontShow =
    document.getElementById(
        'welcomeDontShow'
    );

const WELCOME_STORAGE_KEY =
    'urbanGeneticsAtlasWelcomeDismissed';

// -----------------------------------------------------
// Atlas Control Panel
// -----------------------------------------------------

const panel =
    document.getElementById('panel');

const panelMinimize =
    document.getElementById('panelMinimize');

// =====================================================
// WELCOME / ATLAS INTRODUCTION
// =====================================================


// -----------------------------------------------------
// Open welcome message
// -----------------------------------------------------

function showWelcome(){

    if(!welcomeOverlay){
        return;
    }

    welcomeOverlay.classList.remove(
        'hidden'
    );

    welcomeOverlay.setAttribute(
        'aria-hidden',
        'false'
    );

}


// -----------------------------------------------------
// Close welcome message
// -----------------------------------------------------

function closeWelcome(){

    if(!welcomeOverlay){
        return;
    }

    welcomeOverlay.classList.add(
        'hidden'
    );

    welcomeOverlay.setAttribute(
        'aria-hidden',
        'true'
    );


    if(
        welcomeDontShow &&
        welcomeDontShow.checked
    ){

        localStorage.setItem(
            WELCOME_STORAGE_KEY,
            'true'
        );

    }

        armMobileBrandAfterWelcome();

}


// -----------------------------------------------------
// Welcome controls
// -----------------------------------------------------

welcomeClose?.addEventListener(
    'click',
    closeWelcome
);


welcomeCloseButton?.addEventListener(
    'click',
    closeWelcome
);


// -----------------------------------------------------
// Show on first visit
// -----------------------------------------------------

const welcomeDismissed =
    localStorage.getItem(
        WELCOME_STORAGE_KEY
    );
    
// =====================================================
// MOBILE ARRIVAL BRAND
// =====================================================
//
// On mobile, the Atlas brand is slightly enlarged after
// the welcome message clears. The first real interaction
// then returns it to the normal compact mobile size.
// =====================================================

const mobileViewportQuery =
    window.matchMedia(
        '(max-width:900px)'
    );

let mobileBrandEmphasisActive = false;


// -----------------------------------------------------
// Show enlarged mobile brand
// -----------------------------------------------------

function showMobileBrandEmphasis(){

    const header =
        document.getElementById(
            'header'
        );

    if(
        !header ||
        !mobileViewportQuery.matches
    ){
        return;
    }


    header.classList.add(
        'mobile-brand-emphasis'
    );

    mobileBrandEmphasisActive = true;

}


// -----------------------------------------------------
// Return to normal mobile brand
// -----------------------------------------------------

function shrinkMobileBrand(){

    if(!mobileBrandEmphasisActive){
        return;
    }


    const header =
        document.getElementById(
            'header'
        );

    if(header){

        header.classList.remove(
            'mobile-brand-emphasis'
        );

    }


    mobileBrandEmphasisActive = false;

}


// -----------------------------------------------------
// Arm after welcome message closes
// -----------------------------------------------------

function armMobileBrandAfterWelcome(){

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    showMobileBrandEmphasis();

                }
            );

        }
    );

}


// -----------------------------------------------------
// First interaction removes emphasis
// -----------------------------------------------------

document.addEventListener(
    'pointerdown',
    shrinkMobileBrand,
    { passive:true }
);

document.addEventListener(
    'wheel',
    shrinkMobileBrand,
    { passive:true }
);


// Keyboard interaction counts as interaction too

document.addEventListener(
    'keydown',
    shrinkMobileBrand
);


// -----------------------------------------------------
// Handle desktop / mobile switching
// -----------------------------------------------------

mobileViewportQuery.addEventListener(
    'change',
    event => {

        if(event.matches){

            const welcome =
                document.getElementById(
                    'welcomeOverlay'
                );

            if(
                welcome &&
                welcome.classList.contains(
                    'hidden'
                )
            ){

                showMobileBrandEmphasis();

            }

        } else {

            const header =
                document.getElementById(
                    'header'
                );

            if(header){

                header.classList.remove(
                    'mobile-brand-emphasis'
                );

            }

            mobileBrandEmphasisActive = false;

        }

    }
);


// Returning visitors have no welcome message,
// so arm the enlarged brand immediately.

if(
    welcomeDismissed &&
    mobileViewportQuery.matches
){

    armMobileBrandAfterWelcome();

}
// -----------------------------------------------------
// Urban Analysis — Expand / Collapse
// -----------------------------------------------------

analysisSectionToggle.addEventListener(
    'click',
    () => {

        const willCollapse =
            !analysisSection.classList.contains(
                'collapsed'
            );


        analysisSection.classList.toggle(
            'collapsed',
            willCollapse
        );

        analysisSection.classList.toggle(
            'expanded',
            !willCollapse
        );


        analysisSectionToggle.setAttribute(
            'aria-expanded',
            String(!willCollapse)
        );


        analysisSectionToggle.setAttribute(
            'aria-label',
            willCollapse
                ? 'Expand Urban Analysis'
                : 'Collapse Urban Analysis'
        );


        analysisSectionToggle.textContent =
            willCollapse
                ? '▸'
                : '▾';

    }
);


// -----------------------------------------------------
// Urban Fabric — Expand / Collapse
// -----------------------------------------------------

fabricSectionToggle.addEventListener(
    'click',
    () => {

        const willCollapse =
            !fabricSection.classList.contains(
                'collapsed'
            );


        fabricSection.classList.toggle(
            'collapsed',
            willCollapse
        );

        fabricSection.classList.toggle(
            'expanded',
            !willCollapse
        );


        fabricSectionToggle.setAttribute(
            'aria-expanded',
            String(!willCollapse)
        );


        fabricSectionToggle.setAttribute(
            'aria-label',
            willCollapse
                ? 'Expand Urban Fabric'
                : 'Collapse Urban Fabric'
        );


        fabricSectionToggle.textContent =
            willCollapse
                ? '▸'
                : '▾';

    }
);

// =====================================================
// URBAN FABRIC VISIBILITY
// =====================================================


// -----------------------------------------------------
// Safe MapLibre layer visibility helper
// -----------------------------------------------------

function setLayerVisibility(layerId, visible){

    if(!map.getLayer(layerId)){
        return;
    }

    map.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none'
    );

}


// -----------------------------------------------------
// Apply Fabric master visibility
// -----------------------------------------------------

function setFabricMaster(enabled){

    if(!fabricSection || !fabricBody){
        return;
    }

    if(enabled){

        fabricSection.classList.remove(
            'collapsed'
        );

        fabricSection.classList.add(
            'expanded'
        );

        fabricBody.style.display = '';

    } else {

        fabricSection.classList.remove(
            'expanded'
        );

        fabricSection.classList.add(
            'collapsed'
        );

        fabricBody.style.display = 'none';

    }

}


function updateFabricVisibility(){

    const fabricVisible =
        fabricToggle.checked;


    const fabricLayers = [

        {
            layer:'terrain',
            toggle:terrainToggle
        },

        {
            layer:'reclaimed',
            toggle:reclaimedToggle
        },

        {
            layer:'reclaimed-outline',
            toggle:reclaimedToggle
        },

        {
            layer:'buildingAge',
            toggle:buildingAgeToggle
        },

        {
            layer:'heritage',
            toggle:heritageToggle
        },

        {
            layer:'mtr',
            toggle:mtrToggle
        }

    ];


    fabricLayers.forEach(
        item => {

            setLayerVisibility(
                item.layer,
                fabricVisible &&
                item.toggle.checked
            );

        }
    );

}

fabricToggle.addEventListener(
    'change',
    () => {

        updateFabricVisibility();

        setFabricMaster(
            fabricToggle.checked
        );

    }
);

// =====================================================
// FABRIC MODULE COLLAPSING
// =====================================================


// -----------------------------------------------------
// Module Chevron Behaviour
// -----------------------------------------------------

document
    .querySelectorAll('.module-chevron')
    .forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const module =
                    document.getElementById(
                        button.dataset.module
                    );

                if(!module){
                    return;
                }

                if(module.classList.contains('expanded')){
                    collapseFabricModule(module);
                } else {
                    expandFabricModule(module);
                }

            }
        );

    });

// =====================================================
// FABRIC MODULE HELPERS
// =====================================================


// -----------------------------------------------------
// Expand module
// -----------------------------------------------------

function expandFabricModule(module, shouldScroll = true){

    if(!module){
        return;
    }


    module.classList.add(
        'expanded'
    );


    const button =
        module.querySelector(
            '.module-chevron'
        );


    if(button){

        button.textContent = '▾';

        button.setAttribute(
            'aria-expanded',
            'true'
        );

        const label =
            module.querySelector(
                '.toggle span'
            )?.textContent ||
            'module';

        button.setAttribute(
            'aria-label',
            `Collapse ${label}`
        );

    }

    // Scroll opened module into view only when explicitly requested.
    // This prevents the initial Terrain module from scrolling the
    // entire mobile Atlas panel away from the hamburger control.

    if(
        shouldScroll &&
        fabricToggle &&
        fabricToggle.checked
    ){

        setTimeout(() => {

            module.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });

        }, 80);

    }
}


// -----------------------------------------------------
// Collapse module
// -----------------------------------------------------

function collapseFabricModule(module){

    if(!module){
        return;
    }


    module.classList.remove(
        'expanded'
    );


    const button =
        module.querySelector(
            '.module-chevron'
        );


    if(button){

        button.textContent = '▸';

        button.setAttribute(
            'aria-expanded',
            'false'
        );

        const label =
            module.querySelector(
                '.toggle span'
            )?.textContent ||
            'module';

        button.setAttribute(
            'aria-label',
            `Expand ${label}`
        );

    }

}

// =====================================================
// INITIAL UI STATE
// =====================================================


// -----------------------------------------------------
// Initial Fabric Module State
// -----------------------------------------------------

expandFabricModule(
    terrainModule,
    false
);

// -----------------------------------------------------
// Initial Analysis scroll position
// -----------------------------------------------------

if(analysisBody){

    analysisBody.scrollTop = 0;

}


// =====================================================
// MAP INTERACTION STATE
// =====================================================

// =====================================================
// PANEL MINIMISE / RESTORE
// =====================================================

// -----------------------------------------------------
// Set panel minimised state
//
// The control button lives outside #panel.
// The panel itself is hidden when minimised.
// The button independently shows:
//     X          = panel expanded
//     ☰          = panel minimised
// -----------------------------------------------------

function setPanelMinimized(minimized){

    if(!panel || !panelMinimize){
        return;
    }


    // Panel visibility/state

    panel.classList.toggle(
        'panel-minimized',
        minimized
    );


    // Button visual state

    panelMinimize.classList.toggle(
        'panel-control-minimized',
        minimized
    );


    // Accessibility state

    panelMinimize.setAttribute(
        'aria-expanded',
        String(!minimized)
    );


    panelMinimize.setAttribute(
        'aria-label',
        minimized
            ? 'Restore Atlas controls'
            : 'Minimize Atlas controls'
    );

}


// -----------------------------------------------------
// Minimise / restore button
// -----------------------------------------------------

panelMinimize.addEventListener(
    'click',
    () => {

        const minimized =
            panel.classList.contains(
                'panel-minimized'
            );


        // Opening the controls clears
        // any active map popup.

        if(minimized){

            hidePopup();

        }


        setPanelMinimized(
            !minimized
        );

    }
);


// -----------------------------------------------------
// Responsive initial state
//
// Mobile / tablet:
//     Start minimised.
//
// Desktop:
//     Start expanded.
//
// The same matchMedia query used by the
// mobile brand logic is reused here.
// -----------------------------------------------------

function syncPanelToViewport(){

    setPanelMinimized(
        mobileViewportQuery.matches
    );

}


// -----------------------------------------------------
// Apply after viewport dimensions exist
// -----------------------------------------------------

requestAnimationFrame(
    syncPanelToViewport
);


// -----------------------------------------------------
// Respond to desktop / mobile switching
// -----------------------------------------------------

mobileViewportQuery.addEventListener(
    'change',
    syncPanelToViewport
);

// -----------------------------------------------------
// Movement / Hover State
// -----------------------------------------------------

let moving = false;
let hoverTimer = null;
const HOVER_DELAY = 100;

// Used to stop background warm-up once the user
// begins interacting with the map.

let userHasInteracted = false;

map.on('movestart', () => {

    moving = true;
    userHasInteracted = true;
    hidePopup();

});


map.on('zoomstart', () => {

    hidePopup();

});


map.on('moveend', () => {

    moving = false;

    updateStatus();

});


// =====================================================
// URBAN ANALYSIS
// =====================================================

// =====================================================
// URBAN GENETIC SIGNATURE
// =====================================================

const UGS_SIGNATURES = {

    TC:{
        name:'TRANSFORMING CORE',
        colour:'#D25B48',
        description:
            'Highly intensive existing urban fabric with a strong change signal.'
    },

    EC:{
        name:'EMERGING CHANGE',
        colour:'#D89A43',
        description:
            'Relatively lower-intensity urban fabric showing a strong change signal.'
    },

    AT:{
        name:'AGEING TRANSITION',
        colour:'#A95F68',
        description:
            'Older urban fabric combined with an elevated change signal.'
    },

    VM:{
        name:'VERTICAL MATURE',
        colour:'#786AA0',
        description:
            'Intensive and vertical urban fabric without an exceptionally high change signal.'
    },

    LF:{
        name:'LEGACY FABRIC',
        colour:'#8F7862',
        description:
            'Older established urban fabric without an exceptional change signal.'
    },

    CF:{
        name:'CONNECTED FABRIC',
        colour:'#518882',
        description:
            'Highly accessible urban fabric without an exceptional change signal.'
    },

    SF:{
        name:'STABLE FABRIC',
        colour:'#7D8790',
        description:
            'No exceptional v0.1 combination detected in the available urban indicators.'
    },

    C:{
        name:'CONSTRAINED',
        colour:'#A8ADB2',
        description:
            'A constrained or non-urban planning context, treated separately from normal urban genetic types.'
    },

    U:{
        name:'UNASSESSED',
        colour:'#D0D3D7',
        description:
            'Insufficient meaningful analytical context to assign a normal urban genetic signature.'
    }

};

// -----------------------------------------------------
// Analysis Legend Definitions
// -----------------------------------------------------

const LEGENDS = {

    'Development Pressure': {

        title: 'Development Pressure',

        description:
            'Measures redevelopment pressure using building age, density, and recent development signals. Higher values indicate locations where the existing urban fabric is under greater transformation pressure.',

        gradient:
            'linear-gradient(90deg,#313695,#74ADD1,#FFFFFF,#FFF7BC,#FEC44F,#FE9929,#EC7014,#993404)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Stable urban fabric with limited redevelopment pressure.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Emerging redevelopment activity and ageing building stock.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Strategic renewal priority and strong transformation potential.
            </div>
        `
    },


    'GFA - Saturation': {

        title: 'GFA Saturation',

        description:
            'Indicates how much legally permissible floor area has already been realised within each hex cell.',

        gradient:
            'linear-gradient(90deg,#56BEEE40,#6FB8CE8C,#50A2EE9E,#2949FE9E,#4902CC9E,#390C6D9E)',

        interpretation: `
            <div class='legend-item'>
                <strong>0.00</strong>
                Minimal realized development.
            </div>

            <div class='legend-item'>
                <strong>0.25</strong>
                Significant redevelopment headroom.
            </div>

            <div class='legend-item'>
                <strong>0.50</strong>
                Moderate redevelopment headroom.
            </div>

            <div class='legend-item'>
                <strong>0.75</strong>
                Most capacity realized.
            </div>

            <div class='legend-item'>
                <strong>1.00</strong>
                Development capacity largely realized.
            </div>
        `
    },


    'MTR - Index (Built)': {

        title: 'MTR Built Accessibility',

        description:
            'Accessibility strength derived from proximity and connectivity to the existing MTR network.',

        gradient:
            'linear-gradient(90deg,#FFFFFF,#FFFDE7,#FFF176,#9CCC65,#2E7D32,#004D40)',

        interpretation: `
            <div class='legend-item'>
                <strong>Weak</strong>
                — Limited access to rapid transit infrastructure.
            </div>

            <div class='legend-item'>
                <strong>Moderate</strong>
                — Served by nearby stations and network connections.
            </div>

            <div class='legend-item'>
                <strong>Strong</strong>
                — Major interchange or high-connectivity transit hub.
            </div>
        `
    },


    'Renewal Potential': {

        title: 'Renewal Potential',

        description:
            'Identifies ageing urban fabric with increasing redevelopment and renewal priority.',

        gradient:
            'linear-gradient(90deg,#FFFFFF,#FFF7BC,#FEE391,#FEC44F,#FDB863,#F46D43,#D7301F,#7F0000)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Contemporary or recently renewed urban fabric.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Ageing districts with emerging redevelopment pressure.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Strategic renewal priority areas.
            </div>
        `
    },


    'Genesis Potential': {

        title: 'Genesis Potential',

        description:
            'Highlights areas with capacity for future urban transformation, expansion, and strategic development.',

        gradient:
            'linear-gradient(90deg,#FFFFFF,#E5F5E0,#74C476,#31A354,#756BB1,#6A51A3,#4A1486)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Limited opportunity for new urban genesis.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Emerging transformation and growth potential.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Major strategic development opportunity.
            </div>
        `
    },


    'GFA per Capita': {

        title: 'Living Space (sqm/cap)',

        description:
            'Estimated residential floor area available per resident within each hex cell.',

        gradient:
            'linear-gradient(90deg,#F7FCF5,#E5F5E0,#C7E9C0,#74C476,#41AB5D,#238B45,#00441B)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Constrained living space and higher residential intensity.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Typical Hong Kong residential conditions.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Larger living space and lower residential crowding.
            </div>
        `
    },


    'Population per Building': {

        title: 'Population Intensity',

        description:
            'Estimated number of residents associated with buildings within each hex cell.',

        gradient:
            'linear-gradient(90deg,#FFF5F0,#FEE0D2,#FCBBA1,#FC9272,#FB6A4A,#EF3B2C,#CB181D,#67000D)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Sparse residential occupation.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Typical urban residential intensity.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Extremely dense residential occupation.
            </div>
        `
    },


    'Latent Urban Capacity': {

        title: 'Latent Urban Capacity',

        description:
            'Estimated proportion of reasonable development capacity that remains unrealised within each 100 m hex.',

        gradient:
            'linear-gradient(90deg,rgba(255,255,255,0),#e2e2f4,#c2bae2,#9d91d1,#7e6cbe,#5f49a9,#442d8b,#26125c)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Most reasonable development capacity has already been realised.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Meaningful unrealised development capacity remains.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — A large proportion of reasonable development capacity remains unrealised.
            </div>
        `
    },

    'Urban Genetic Signature': {

        title:'Urban Genetic Signature',

        description:
            'A categorical reading of urban condition, combining intensity, accessibility, height, age and modelled change signals. The Signature describes observed urban condition; it is not a prediction.',

        categorical:true,

        interpretation: `

            <div class="ugs-legend-list">

                ${Object.values(UGS_SIGNATURES).map(
                    item => `
                        <div class="ugs-legend-item">
                            <span
                                class="ugs-legend-swatch"
                                style="background:${item.colour};"
                            ></span>

                            <span>
                                ${item.name}
                            </span>
                        </div>
                    `
                ).join('')}

            </div>
        `
    }

};

// -----------------------------------------------------
// Analysis Legend Update
// -----------------------------------------------------

function updateLegend(){

    const theme =
        themeSelect.value;

    const cfg =
        LEGENDS[theme];


    if(!cfg){
        return;
    }


    legendTitle.textContent =
        cfg.title;

    legendDescription.textContent =
        cfg.description;


    if(cfg.categorical){

        legendGradient.style.display =
            'none';

        const labels =
            legendGradient
                .parentElement
                ?.querySelector(
                    '.legend-labels'
                );

        if(labels){
            labels.style.display =
                'none';
        }

    } else {

        legendGradient.style.display =
            '';

        const labels =
            legendGradient
                .parentElement
                ?.querySelector(
                    '.legend-labels'
                );

        if(labels){
            labels.style.display =
                '';
        }

        legendGradient.style.background =
            cfg.gradient;

    }


    legendInterpretation.innerHTML =
        cfg.interpretation;

}


// =====================================================
// ANALYSIS COLOUR EXPRESSIONS
// =====================================================

function colourExpression(){

    const theme =
        themeSelect.value;

// -------------------------------------------------
// Urban Genetic Signature
// -------------------------------------------------

    if(theme === 'Urban Genetic Signature'){

        return [

            'match',

            [
                'get',
                'UGS_v01_Code'
            ],

            'TC',
            UGS_SIGNATURES.TC.colour,

            'EC',
            UGS_SIGNATURES.EC.colour,

            'AT',
            UGS_SIGNATURES.AT.colour,

            'VM',
            UGS_SIGNATURES.VM.colour,

            'LF',
            UGS_SIGNATURES.LF.colour,

            'CF',
            UGS_SIGNATURES.CF.colour,

            'SF',
            UGS_SIGNATURES.SF.colour,

            'C',
            UGS_SIGNATURES.C.colour,

            'U',
            UGS_SIGNATURES.U.colour,

            UGS_SIGNATURES.U.colour

        ];

    }

// -----------------------------------------------------
// Development Pressure
// -----------------------------------------------------

    if(theme === 'Development Pressure'){

        return [

            'case',

            // Negative values
            [
                '<',
                [
                    'coalesce',
                    ['to-number',
                        ['get','Development Pressure']
                    ],
                    0
                ],
                0
            ],

            [
                'interpolate',
                ['linear'],

                [
                    'sqrt',

                    [
                        '*',
                        -1,

                        [
                            'coalesce',
                            [
                                'to-number',
                                [
                                    'get',
                                    'Development Pressure'
                                ]
                            ],
                            0
                        ]
                    ]
                ],

                0.00,
                'rgba(255,255,255,0.00)',

                0.05,
                'rgba(220,239,248,0.25)',

                0.10,
                'rgba(169,211,234,0.55)',

                0.20,
                'rgba(95,168,211,0.62)',

                0.35,
                'rgba(44,123,182,0.62)'
            ],


            // Positive values

            [
                'interpolate',
                ['linear'],

                [
                    'sqrt',

                    [
                        'coalesce',

                        [
                            'to-number',
                            [
                                'get',
                                'Development Pressure'
                            ]
                        ],

                        0
                    ]
                ],

                0.00,
                'rgba(255,255,255,0.00)',

                0.06,
                'rgba(255,248,201,0.25)',

                0.12,
                'rgba(254,227,145,0.55)',

                0.20,
                'rgba(254,196,79,0.62)',

                0.32,
                'rgba(254,153,41,0.62)',

                0.46,
                'rgba(236,112,20,0.62)',

                0.60,
                'rgba(204,76,2,0.62)',

                0.80,
                'rgba(153,52,4,0.62)',

                1.00,
                'rgba(102,37,6,0.62)'
            ]

        ];

    }


// -----------------------------------------------------
// GFA Saturation
// -----------------------------------------------------

    if(theme === 'GFA - Saturation'){

        return [

            'case',

            [
                '==',

                [
                    'coalesce',

                    [
                        'to-number',
                        [
                            'get',
                            'GFA - Saturation'
                        ]
                    ],

                    0
                ],

                0
            ],

            'rgba(255,255,255,0.00)',


            [
                'interpolate',
                ['linear'],

                [
                    'coalesce',

                    [
                        'to-number',
                        [
                            'get',
                            'GFA - Saturation'
                        ]
                    ],

                    0
                ],

                0.10,
                'rgba(86,190,238,0.25)',

                0.25,
                'rgba(111,184,206,0.55)',

                0.50,
                'rgba(80,162,238,0.62)',

                0.70,
                'rgba(41,73,254,0.62)',

                0.85,
                'rgba(73,2,204,0.62)',

                1.00,
                'rgba(57,12,109,0.62)'
            ]

        ];

    }


// -----------------------------------------------------
// MTR Built
// -----------------------------------------------------

    if(theme === 'MTR - Index (Built)'){

        return [

            'interpolate',

            ['linear'],

            [
                '/',

                [
                    'ln',

                    [
                        '+',
                        1,

                        [
                            'coalesce',

                            [
                                'to-number',
                                [
                                    'get',
                                    'MTR - Index (Built)'
                                ]
                            ],

                            0
                        ]
                    ]
                ],

                2
            ],

            0.00,
            'rgba(255,255,255,0.00)',

            0.05,
            'rgba(220,245,220,0.25)',

            0.15,
            'rgba(229,230,170,0.55)',

            0.30,
            'rgba(255,241,118,0.62)',

            0.45,
            'rgba(220,231,117,0.62)',

            0.60,
            'rgba(156,204,101,0.62)',

            0.75,
            'rgba(102,187,106,0.62)',

            0.88,
            'rgba(46,125,50,0.62)',

            1.00,
            'rgba(0,77,64,0.62)'

        ];

    }


// -----------------------------------------------------
// GFA per Capita
// -----------------------------------------------------

    if(theme === 'GFA per Capita'){

        return [

            'interpolate',

            ['linear'],

            [
                'sqrt',

                [
                    'coalesce',

                    [
                        'to-number',
                        [
                            'get',
                            'GFA per Capita'
                        ]
                    ],

                    0
                ]
            ],

            0,
            'rgba(255,255,255,0.00)',

            3,
            'rgba(220,245,220,0.25)',

            5,
            'rgba(185,226,185,0.55)',

            7,
            'rgba(161,217,155,0.62)',

            9,
            'rgba(135,196,116,0.62)',

            11,
            'rgba(95,171,65,0.62)',

            13,
            'rgba(56,139,35,0.62)',

            15,
            'rgba(16,68,0,0.62)'

        ];

    }


// -----------------------------------------------------
// Population per Building
// -----------------------------------------------------

    if(theme === 'Population per Building'){

        return [

            'interpolate',

            ['linear'],

            [
                'ln',

                [
                    '+',
                    1,

                    [
                        'coalesce',

                        [
                            'to-number',
                            [
                                'get',
                                'Population per Building'
                            ]
                        ],

                        0
                    ]
                ]
            ],

            0,
            'rgba(255,255,255,0.00)',

            1,
            'rgba(245,240,220,0.25)',

            2,
            'rgba(230,199,170,0.55)',

            3,
            'rgba(252,146,114,0.62)',

            4,
            'rgba(253,131,104,0.62)',

            5,
            'rgba(238,88,74,0.62)',

            6,
            'rgba(199,62,67,0.62)',

            7,
            'rgba(112,35,45,0.62)'

        ];

    }


// -----------------------------------------------------
// Renewal Potential
// -----------------------------------------------------

    if(theme === 'Renewal Potential'){

        return [

            'interpolate',

            ['linear'],

            [
                'sqrt',

                [
                    '*',

                    [
                        'coalesce',

                        [
                            'to-number',
                            [
                                'get',
                                'Renewal Potential'
                            ]
                        ],

                        0
                    ],

                    2
                ]
            ],

            0.00,
            'rgba(255,255,255,0.00)',

            0.10,
            'rgba(61, 154, 197, 0.25)',

            0.20,
            'rgba(63, 176, 180, 0.55)',

            0.35,
            'rgba(224, 235, 72, 0.62)',

            0.50,
            'rgba(231, 190, 54, 0.62)',

            0.70,
            'rgba(236,112,20,0.62)',

            0.85,
            'rgba(204, 49, 2, 0.62)',

            1.00,
            'rgba(173, 29, 10, 0.62)'

        ];

    }


// -----------------------------------------------------
// Genesis Potential
// -----------------------------------------------------

    if(theme === 'Genesis Potential'){

        return [

            'interpolate',

            ['linear'],

            [
                'sqrt',

                [
                    '*',

                    [
                        'coalesce',

                        [
                            'to-number',
                            [
                                'get',
                                'Genesis Potential'
                            ]
                        ],

                        0
                    ],

                    3
                ]
            ],

            0.00,
            'rgba(255,255,255,0.00)',

            0.08,
            'rgba(220,245,220,0.25)',

            0.18,
            'rgba(170,230,170,0.55)',

            0.35,
            'rgba(142,201,143,0.62)',

            0.55,
            'rgba(98,170,101,0.62)',

            0.75,
            'rgba(114,80,151,0.62)',

            1.00,
            'rgba(83,38,134,0.62)'

        ];

    }


// -----------------------------------------------------
// Latent Urban Capacity
// -----------------------------------------------------

    if(theme === 'Latent Urban Capacity'){

        return [

            'interpolate',

            ['linear'],

            [
                'coalesce',

                [
                    'to-number',
                    [
                        'get',
                        'Latent Urban Capacity'
                    ]
                ],

                0
            ],

            0.00,
            'rgba(255,255,255,0.00)',

            0.10,
            'rgba(226,226,244,0.25)',

            0.25,
            'rgba(194,186,226,0.55)',

            0.40,
            'rgba(157,145,209,0.62)',

            0.55,
            'rgba(126,108,190,0.62)',

            0.70,
            'rgba(95,73,169,0.62)',

            0.85,
            'rgba(68,45,139,0.62)',

            1.00,
            'rgba(38,18,92,0.62)'

        ];

    }


// -----------------------------------------------------
// Default
// -----------------------------------------------------

    return [

        'interpolate',

        ['linear'],

        [
            'coalesce',

            [
                'to-number',
                [
                    'get',
                    theme
                ]
            ],

            0
        ],

        0,
        '#F7FBFF',

        0.5,
        '#6BAED6',

        1,
        '#08306B'

    ];

}


// =====================================================
// FABRIC MODULE LEGENDS
// =====================================================


// -----------------------------------------------------
// Reclaimed Land legend
// -----------------------------------------------------

function updateReclamationLegend(){

    if(!reclamationLegend){
        return;
    }


    reclamationLegend.style.display =
        reclaimedToggle.checked
            ? 'block'
            : 'none';


    if(reclaimedToggle.checked){

        reclamationLegendGradient.style.background =
            'linear-gradient(' +
            '90deg,' +
            '#f4d7ee,' +
            '#e9b7de,' +
            '#db8dcc,' +
            '#c963b8,' +
            '#b63aa6,' +
            '#9f268f,' +
            '#7f187f,' +
            '#5f187f,' +
            '#43206f' +
            ')';

    }

}


// -----------------------------------------------------
// Building Age legend
// -----------------------------------------------------

function updateBuildingAgeLegend(){

    if(!buildingAgeLegend){
        return;
    }


    buildingAgeLegend.style.display =
        buildingAgeToggle.checked
            ? 'block'
            : 'none';


    if(buildingAgeToggle.checked){

        buildingAgeLegendGradient.style.background =
            'linear-gradient(' +
            '90deg,' +
            '#ce6529,' +
            '#c08923,' +
            '#ceb630,' +
            '#d8cc29,' +
            '#b0d330,' +
            '#a1ca2f,' +
            '#64db40,' +
            '#2bbd8c,' +
            '#367ec2,' +
            '#2f32be' +
            ')';

    }

}


// -----------------------------------------------------
// Heritage legend
// -----------------------------------------------------

function updateHeritageLegend(){

    if(!heritageLegend){
        return;
    }


    heritageLegend.style.display =
        heritageToggle.checked
            ? 'block'
            : 'none';

}


// -----------------------------------------------------
// Update all Fabric module legends
// -----------------------------------------------------

function updateFabricModuleLegends(){

    updateReclamationLegend();

    updateBuildingAgeLegend();

    updateHeritageLegend();

}


// =====================================================
// URBAN ANALYSIS VISIBILITY
// =====================================================


// -----------------------------------------------------
// Urban Analysis visibility
// -----------------------------------------------------

function updateAnalysisVisibility(){

    const visible =
        analysisToggle.checked
            ? 'visible'
            : 'none';


    // Analysis hex layer

    if(map.getLayer('atlas')){

        map.setLayoutProperty(
            'atlas',
            'visibility',
            visible
        );

    }


    // Hover layer

    if(map.getLayer('hover')){

        map.setLayoutProperty(
            'hover',
            'visibility',
            visible
        );

    }


    // Analysis selector

    if(analysisSelectorControl){

        analysisSelectorControl.style.display =
            analysisToggle.checked
                ? ''
                : 'none';

    }


    // Planning Context controls

    if(analysisControls){

        const planningContextAvailable =
            planningContextApplies();

        analysisControls.style.display =
            planningContextAvailable &&
            analysisToggle.checked
                ? 'flex'
                : 'none';

    }


    // Analysis legend

    if(analysisLegend){

        analysisLegend.style.display =
            analysisToggle.checked
                ? 'block'
                : 'none';

    }

}


// -----------------------------------------------------
// Analysis master toggle
// -----------------------------------------------------

analysisToggle.addEventListener(
    'change',
    () => {

        updateAnalysisVisibility();


        if(analysisToggle.checked){

            analysisSection.classList.remove(
                'collapsed'
            );

            analysisSection.classList.add(
                'expanded'
            );

            analysisSectionToggle.setAttribute(
                'aria-expanded',
                'true'
            );

            analysisSectionToggle.setAttribute(
                'aria-label',
                'Collapse Urban Analysis'
            );

            analysisSectionToggle.textContent =
                '▾';

        } else {

            analysisSection.classList.remove(
                'expanded'
            );

            analysisSection.classList.add(
                'collapsed'
            );

            analysisSectionToggle.setAttribute(
                'aria-expanded',
                'false'
            );

            analysisSectionToggle.setAttribute(
                'aria-label',
                'Expand Urban Analysis'
            );

            analysisSectionToggle.textContent =
                '▸';

        }

    }
);


// =====================================================
// MAP LAYER MANAGEMENT
// =====================================================


// -----------------------------------------------------
// Analysis Hex Layer
// -----------------------------------------------------

function drawAtlas(){

    const fillColor =
        colourExpression();


    // Create the analysis layer once.
    // Subsequent theme changes update paint only,
    // avoiding unnecessary layer removal/recreation.

    if(!map.getLayer('atlas')){

        map.addLayer({

            id:'atlas',

            type:'fill',

            source:'atlas',

            'source-layer':
                ATLAS_SOURCE_LAYER,

            paint:{

                'fill-color':
                    fillColor,

                'fill-opacity':[
                    'interpolate',
                    ['linear'],
                    ['zoom'],

                    8,
                    0.55,

                    12,
                    0.78,

                    15,
                    0.90
                ],

                'fill-outline-color':
                    'rgba(60,60,60,0.04)'

            }

        });

    } else {

        map.setPaintProperty(
            'atlas',
            'fill-color',
            fillColor
        );

    }


    // -------------------------------------------------
    // Layer ordering
    // -------------------------------------------------

    if(map.getLayer('building')){

        map.moveLayer(
            'atlas',
            'building'
        );

    }


    if(map.getLayer('building-top')){

        map.moveLayer(
            'atlas'
        );

    }


    // Roads above atlas

    const roadLayers =
        map.getStyle().layers

            .map(
                layer => layer.id
            )

            .filter(
                id =>
                    id.startsWith('road_')
            );


    roadLayers.forEach(
        id => {

            if(map.getLayer(id)){

                map.moveLayer(id);

            }

        }
    );


    // MTR above roads

    if(map.getLayer('mtr')){

        map.moveLayer(
            'mtr'
        );

    }


    // Labels above analysis

    const symbolLayers =
        map.getStyle().layers

            .filter(
                layer =>
                    layer.type === 'symbol'
            )

            .map(
                layer => layer.id
            );


    symbolLayers.forEach(
        id => {

            if(map.getLayer(id)){

                map.moveLayer(id);

            }

        }
    );


    // Building Age / Heritage above analysis hexes

    if(map.getLayer('buildingAge')){

        map.moveLayer(
            'buildingAge'
        );

    }


    if(map.getLayer('heritage')){

        map.moveLayer(
            'heritage'
        );

    }


    // Hover above everything

    if(map.getLayer('hover')){

        map.moveLayer(
            'hover'
        );

    }


    // Restore current Planning Context filter

    if(
        planningContextApplies()
    ){

        applyCapacityContextFilter();

    }

}


// -----------------------------------------------------
// Planning Context — eligible analysis modes
// -----------------------------------------------------

const PLANNING_CONTEXT_ANALYSES = [

    'Development Pressure',

    'GFA - Saturation',

    'Renewal Potential',

    'Genesis Potential',

    'Latent Urban Capacity'

];


function planningContextApplies(){

    return PLANNING_CONTEXT_ANALYSES.includes(
        themeSelect.value
    );

}


// -----------------------------------------------------
// Planning Context — apply filter
// -----------------------------------------------------

function applyCapacityContextFilter(){

    if(!map.getLayer('atlas')){
        return;
    }


    if(!planningContextApplies()){

        map.setFilter(
            'atlas',
            null
        );

        return;
    }


    const context =
        capacityContext.value;


    if(context === 'All'){

        map.setFilter(
            'atlas',
            null
        );

        return;
    }


    map.setFilter(
        'atlas',

        [
            '==',

            [
                'get',
                'SPZ - Capacity Context'
            ],

            context

        ]
    );

}

// =====================================================
// ATLAS INITIALISATION / MAP WARM-UP
// =====================================================


// -----------------------------------------------------
// Loader status
// -----------------------------------------------------

function setAtlasLoaderStatus(message){

    if(atlasLoaderStatus){

        atlasLoaderStatus.textContent =
            message;

    }

}


// -----------------------------------------------------
// Animated loading dots
// -----------------------------------------------------

let loaderDotTimer = null;

function startAtlasLoaderDots(){

    if(!atlasLoaderDots){
        return;
    }


    let step = 0;


    loaderDotTimer =
        setInterval(
            () => {

                step =
                    (step + 1) % 4;


                atlasLoaderDots.textContent =
                    '.'.repeat(step);

            },

            350
        );

}


function stopAtlasLoaderDots(){

    if(loaderDotTimer){

        clearInterval(
            loaderDotTimer
        );

        loaderDotTimer =
            null;

    }

}


// -----------------------------------------------------
// Wait for MapLibre to settle
// -----------------------------------------------------

function waitForMapIdle(){

    return new Promise(
        resolve => {

            if(
                map.loaded() &&
                map.areTilesLoaded()
            ){

                requestAnimationFrame(
                    resolve
                );

                return;

            }


            map.once(
                'idle',
                resolve
            );

        }
    );

}


// -----------------------------------------------------
// Warm individual zoom level
// -----------------------------------------------------

// -----------------------------------------------------
// Warm a map zoom level
// -----------------------------------------------------

async function warmMapZoom(
    zoom,
    label,
    wait = 1200
){

    perfMark(
        `Warm-up started: zoom ${zoom}`
    );


    setAtlasLoaderStatus(
        label
    );


    map.setZoom(
        zoom
    );


    perfMark(
        `Zoom ${zoom} requested`
    );


    // Give MapLibre time to request and render
    // the new view without waiting for a full
    // idle cycle.

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                wait
            )
    );


    perfMark(
        `Warm-up wait completed: zoom ${zoom}`
    );

}

// -----------------------------------------------------
// Main warm-up routine
// -----------------------------------------------------

async function initialiseAtlas(){

    if(!atlasLoader){
        return;
    }

    startAtlasLoaderDots();

    perfMark(
        'Atlas initialisation started'
    );


    const originalCenter =
        map.getCenter();


    const originalZoom =
        map.getZoom();


    try {

            // -------------------------------------------------
        // Phase 1 — Initial map settlement
        // -------------------------------------------------

        setAtlasLoaderStatus(
            'Loading core map'
        );


        await waitForMapIdle();


        perfMark(
            'Initial map settled'
        );


        // -------------------------------------------------
        // Phase 2 — Warm immediately useful zoom levels
        // -------------------------------------------------

        await warmMapZoom(
            11,
            'Preparing urban analysis',
            1200
        );


        await warmMapZoom(
            12,
            'Preparing urban fabric',
            1200
        );


        perfMark(
            'Blocking warm-up completed'
        );


        // -------------------------------------------------
        // Restore opening view
        // -------------------------------------------------

        map.jumpTo({

            center:
                originalCenter,

            zoom:
                originalZoom

        });


        // -------------------------------------------------
        // Wait for opening view to settle
        // -------------------------------------------------

        await waitForMapIdle();


        perfMark(
            'Opening view restored'
        );


    // -------------------------------------------------
// Atlas is now interactive
// -------------------------------------------------

setAtlasLoaderStatus(
    'Atlas ready'
);


await new Promise(
    resolve =>
        setTimeout(
            resolve,
            280
        )
);


stopAtlasLoaderDots();


perfMark(
    'Atlas interactive'
);


// -------------------------------------------------
// Fade out initialisation overlay
// -------------------------------------------------

atlasLoader.classList.add(
    'hidden'
);


setTimeout(
    () => {

        atlasLoader.style.display =
            'none';


        if(!welcomeDismissed){

            showWelcome();

        }

    },

    450
);


// -------------------------------------------------
// Background zoom pre-warming
// -------------------------------------------------

setTimeout(
    () => {

        warmBackgroundZooms();

    },

    600
);

    } catch(error){

        console.error(
            'Atlas initialisation failed:',
            error
        );


        // Never leave the user trapped
        // behind the loader.

        stopAtlasLoaderDots();


        atlasLoader.classList.add(
            'hidden'
        );


        // If initialisation fails, still allow
        // the user into the Atlas after the fade.

        setTimeout(
            () => {

                atlasLoader.style.display =
                    'none';


                if(!welcomeDismissed){

                    showWelcome();

                }

            },

            450
        );

    }

}

// =====================================================
// BACKGROUND MAP WARM-UP
// =====================================================


// -----------------------------------------------------
// Warm deeper zoom levels without blocking the UI
// -----------------------------------------------------

async function warmBackgroundZooms(){

    // Stop if the user has already started interacting.

    if(userHasInteracted){
        return;
    }


    const originalCenter =
        map.getCenter();

    const originalZoom =
        map.getZoom();


    try {

        // -------------------------------------------------
        // Zoom 13
        // -------------------------------------------------

        if(userHasInteracted){
            return;
        }


        perfMark(
            'Background warm-up: zoom 13 started'
        );


        map.setZoom(
            13
        );


        await waitForMapIdle();


        perfMark(
            'Background warm-up: zoom 13 completed'
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        // -------------------------------------------------
        // Zoom 14
        // -------------------------------------------------

        if(userHasInteracted){
            return;
        }


        perfMark(
            'Background warm-up: zoom 14 started'
        );


        map.setZoom(
            14
        );


        await waitForMapIdle();


        perfMark(
            'Background warm-up: zoom 14 completed'
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        // -------------------------------------------------
        // Zoom 15
        // -------------------------------------------------

        if(userHasInteracted){
            return;
        }


        perfMark(
            'Background warm-up: zoom 15 started'
        );


        map.setZoom(
            15
        );


        await waitForMapIdle();


        perfMark(
            'Background warm-up: zoom 15 completed'
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );


        // -------------------------------------------------
        // Zoom 16
        // -------------------------------------------------

        if(userHasInteracted){
            return;
        }


        perfMark(
            'Background warm-up: zoom 16 started'
        );


        map.setZoom(
            16
        );


        await waitForMapIdle();


        perfMark(
            'Background warm-up: zoom 16 completed'
        );


        // -------------------------------------------------
        // Restore opening view
        // -------------------------------------------------

        if(userHasInteracted){
            return;
        }


        map.jumpTo({

            center:
                originalCenter,

            zoom:
                originalZoom

        });


        perfMark(
            'Background warm-up completed'
        );


    } catch(error){

        console.warn(
            'Background map warm-up stopped:',
            error
        );

    }

}

// =====================================================
// MAP LOAD
// =====================================================

map.on('load', () => {

    perfMark('Load handler started');
    perfMark('Map load event');

// -----------------------------------------------------
// Data Sources
// -----------------------------------------------------

    // -----------------------------------------------------
    // Primary Atlas — PMTiles vector source
    // -----------------------------------------------------

    map.addSource('atlas',{
        type:'vector',
        url:'pmtiles://https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/atlas/852LAB_V1.4.pmtiles'
    });

    // -----------------------------------------------------
    // Primary Atlas — Other sources
    // -----------------------------------------------------

    map.addSource('mtr',{
        type:'geojson',
        data:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mtr/MTR_Lines_TEST.geojson'
    });


    map.addSource('terrain',{
        type:'raster',
        tiles:[
            'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/terrain/{z}/{x}/{y}.png?v=5'
        ],
        scheme:'tms',
        tileSize:512,
        bounds:[
            113.82,
            22.15,
            114.45,
            22.58
        ]
    });


    map.addSource('reclaimed',{
        type:'geojson',
        data:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/reclaimed/Reclaimed%20Land%20_%20V1.1.geojson'
    });


    map.addSource('buildingAge',{
        type:'geojson',
        data:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/buildings/Buildings%20-%20Age%20or%20Heritage%20Grade.geojson'
    });

perfMark('All data sources added');
perfMark('All sources registered');

// -----------------------------------------------------
// Basemap layer references
// -----------------------------------------------------

    const buildingLayerId =
        map.getStyle().layers.find(
            layer =>
                layer.id
                    .toLowerCase()
                    .includes('building')
        )?.id;


    const firstLabelId =
        map.getStyle().layers.find(
            layer =>
                layer.type === 'symbol' &&
                (
                    (
                        layer.layout &&
                        layer.layout['text-field']
                    ) ||
                    (
                        layer.layout &&
                        layer.layout['symbol-placement']
                    )
                )
        )?.id;


// =====================================================
// TERRAIN LAYER
// =====================================================

    map.addLayer({

        id:'terrain',

        type:'raster',

        source:'terrain',

        layout:{
            visibility:'visible'
        },

        paint:{
            'raster-opacity':0.15,
            'raster-contrast':0.60,
            'raster-brightness-min':0.08,
            'raster-brightness-max':0.83,
            'raster-saturation':-1
        }

    }, buildingLayerId || firstLabelId);


// =====================================================
// RECLAIMED LAND
// =====================================================


// -----------------------------------------------------
// Reclaimed Land fill
// -----------------------------------------------------

    map.addLayer({

        id:'reclaimed',

        type:'fill',

        source:'reclaimed',

        layout:{
            visibility:'none'
        },

        filter:[
            '<=',
            [
                'to-number',
                ['get','year']
            ],
            9999
        ],

        paint:{

            'fill-color':[

                'step',

                [
                    'to-number',
                    ['get','year']
                ],

                '#f4d7ee99',

                1900,
                '#e9b7de99',

                1910,
                '#db8dcc99',

                1950,
                '#c963b899',

                1970,
                '#b63aa699',

                1980,
                '#9f268f99',

                2010,
                '#7f187f99',

                2020,
                '#5f187f99',

                2025,
                '#43206f99'

            ],

            'fill-opacity':0.65,

            'fill-outline-color':
                'rgba(68,68,68,0.5)'
        }

    });


// -----------------------------------------------------
// Reclaimed Land outline
// -----------------------------------------------------

    map.addLayer({

        id:'reclaimed-outline',

        type:'line',

        source:'reclaimed',

        layout:{
            visibility:'none'
        },

        filter:[
            '<=',
            [
                'to-number',
                ['get','year']
            ],
            9999
        ],

        paint:{

            'line-color':
                'rgba(117,91,117,0.55)',

            'line-width':0.2

        }

    });


// Keep reclaimed land below roads

    if(
        map.getLayer('road_service_case')
    ){

        map.moveLayer(
            'reclaimed',
            'road_service_case'
        );

    }


// =====================================================
// BUILDING AGE
// =====================================================

    map.addLayer({

        id:'buildingAge',

        type:'circle',

        source:'buildingAge',

        layout:{
            visibility:'none'
        },

        paint:{

            'circle-radius':[

                'interpolate',

                ['linear'],

                ['zoom'],

                10,
                0.8,

                13,
                1.8,

                15,
                2.0,

                16,
                3.5,

                18,
                4.0

            ],


            'circle-color':[

                'interpolate',

                ['linear'],

                [
                    'to-number',
                    ['get','Year']
                ],

                1945,
                '#ce6529',

                1950,
                '#c08923',

                1960,
                '#ceb630',

                1970,
                '#d8cc29',

                1980,
                '#b0d330',

                1990,
                '#a1ca2f',

                2000,
                '#64db40',

                2010,
                '#2bbd8c',

                2020,
                '#367ec2',

                2025,
                '#2f32be'

            ],

            'circle-opacity':0.65,

            'circle-stroke-color':
                'rgba(105,105,105,0.3)',

            'circle-stroke-width':0.2

        }

    });


// =====================================================
// HERITAGE
// =====================================================

    map.addLayer({

        id:'heritage',

        type:'circle',

        source:'buildingAge',

        layout:{
            visibility:'none'
        },

        paint:{

            'circle-radius':[

                'interpolate',

                ['linear'],

                ['zoom'],

                10,
                1.8,

                13,
                3.2,

                16,
                4.5,

                18,
                5.0

            ],


            'circle-color':[

                'match',

                [
                    'get',
                    'HBG_GRADE'
                ],

                'Grade 1',
                '#b503cc',

                'Grade 2',
                '#8f0866',

                'Grade 3',
                '#500d41',

                'rgba(53,53,53,0)'

            ],

            'circle-opacity':0.85,

            'circle-stroke-color':
                'rgba(255,255,255,0.75)',

            'circle-stroke-width':0.75

        }

    });


// =====================================================
// ANALYSIS HEX LAYER
// =====================================================

    drawAtlas();


// =====================================================
// MTR NETWORK
// =====================================================

    map.addLayer({

        id:'mtr',

        type:'line',

        source:'mtr',

        layout:{
            visibility:'none'
        },

        paint:{

            'line-color':[

                'match',

                [
                    'get',
                    'Line Code'
                ],

                'ISL',
                '#005EB8',

                'KTL',
                '#00A94F',

                'TWL',
                '#E2231A',

                'TKL',
                '#7A3E9D',

                'TCL',
                '#F57C00',

                'EAL',
                '#4DA6FF',

                'TML',
                '#9B6A4B',

                'SIL',
                '#9ACD32',

                'DRL',
                '#E78AC3',

                'AEL',
                '#008C95',

                'NOL',
                '#C2188B',

                '#4d4c4c'

            ],


            'line-width':[

                'interpolate',

                ['linear'],

                ['zoom'],

                10,
                1.2,

                13,
                1.7,

                16,
                2.2,

                18,
                2.8

            ],

            'line-opacity':0.75,


            'line-dasharray':[

                'case',

                [
                    '==',
                    [
                        'get',
                        'Line Code'
                    ],
                    'NOL'
                ],

                ['literal',[2,2]],

                ['literal',[1,0]]

            ]

        }

    });


// =====================================================
// HOVER LAYER
// =====================================================

    map.addLayer({

        id:'hover',

        type:'line',

        source:'atlas',

        'source-layer':
            ATLAS_SOURCE_LAYER,

        paint:{

            'line-color':[

                'match',

                [
                    'get',
                    'UGS_v01_Code'
                ],

                'TC',
                UGS_SIGNATURES.TC.colour,

                'EC',
                UGS_SIGNATURES.EC.colour,

                'AT',
                UGS_SIGNATURES.AT.colour,

                'VM',
                UGS_SIGNATURES.VM.colour,

                'LF',
                UGS_SIGNATURES.LF.colour,

                'CF',
                UGS_SIGNATURES.CF.colour,

                'SF',
                UGS_SIGNATURES.SF.colour,

                'C',
                UGS_SIGNATURES.C.colour,

                'U',
                UGS_SIGNATURES.U.colour,

                'rgba(0,0,0,0.45)'

            ],

            'line-width':1.5,

            'line-blur':0.5

        },

        filter:[
            '==',
            'Hex ID',
            ''
        ]

    });

perfMark('All layers registered');

// =====================================================
// BASEMAP STYLING
// =====================================================


// -----------------------------------------------------
// Soften road colours
// -----------------------------------------------------

    const roadFillLayers = [

        'road_service_fill',
        'road_minor_fill',
        'road_pri_fill_ramp',
        'road_trunk_fill_ramp',
        'road_mot_fill_ramp',
        'road_sec_fill_noramp',
        'road_pri_fill_noramp',
        'road_trunk_fill_noramp',
        'road_mot_fill_noramp'

    ];


    roadFillLayers.forEach(
        id => {

            if(map.getLayer(id)){

                map.setPaintProperty(
                    id,
                    'line-color',
                    '#E6E8EB'
                );

            }

        }
    );


// -----------------------------------------------------
// Road case colours
// -----------------------------------------------------

    const roadCaseLayers = [

        'road_service_case',
        'road_minor_case',
        'road_pri_case_ramp',
        'road_trunk_case_ramp',
        'road_mot_case_ramp',
        'road_sec_case_noramp',
        'road_pri_case_noramp',
        'road_trunk_case_noramp',
        'road_mot_case_noramp'

    ];


    roadCaseLayers.forEach(
        id => {

            if(map.getLayer(id)){

                map.setPaintProperty(
                    id,
                    'line-color',
                    '#D0D4D9'
                );

            }

        }
    );


// -----------------------------------------------------
// Building colours
// -----------------------------------------------------

    if(map.getLayer('building')){

        map.setPaintProperty(
            'building',
            'fill-color',
            '#C8CDD3'
        );

    }


    if(map.getLayer('building-top')){

        map.setPaintProperty(
            'building-top',
            'fill-color',
            '#B9C0C7'
        );

    }

perfMark('All map layers created');

// =====================================================
// ATLAS OPENING UI STATE
// =====================================================

    updateLegend();

    updateAnalysisVisibility();

    updateFabricModuleLegends();

    updateFabricVisibility();

    
perfMark('Initial UI state applied');

// -----------------------------------------------------
// Begin deliberate Atlas initialisation
// -----------------------------------------------------

    initialiseAtlas();

});


// =====================================================
// HOVER INTERACTION
// =====================================================


// -----------------------------------------------------
// Atlas hover
// -----------------------------------------------------

map.on(
    'mousemove',
    'atlas',
    (e) => {

        clearTimeout(
            hoverTimer
        );


        hoverTimer =
            setTimeout(
                () => {

                    if(moving){
                        return;
                    }


                    const feature =
                        e.features?.[0];


                    if(!feature){
                        return;
                    }


                    const id =
                        feature.properties[
                            'Hex ID'
                        ];


                    if(id === lastHex){
                        return;
                    }


                    lastHex =
                        id;


                    if(
                        map.getLayer(
                            'hover'
                        )
                    ){

                        map.setFilter(
                            'hover',

                            [
                                '==',
                                'Hex ID',
                                id
                            ]
                        );

                    }

                },

                HOVER_DELAY
            );

    }
);


// -----------------------------------------------------
// Atlas hover leave
// -----------------------------------------------------

map.on(
    'mouseleave',
    'atlas',
    () => {

        clearTimeout(
            hoverTimer
        );


        lastHex =
            null;


        if(
            map.getLayer(
                'hover'
            )
        ){

            map.setFilter(
                'hover',

                [
                    '==',
                    'Hex ID',
                    ''
                ]

            );

        }

    }
);


// =====================================================
// POPUP
// =====================================================


// -----------------------------------------------------
// Hide Popup
// -----------------------------------------------------

function hidePopup(){

    popup.scrollTop = 0;

    popup.classList.remove(
        'visible'
    );

    popup.style.display =
        'none';

    popup.style.visibility =
        '';

    popup.style.opacity =
        '';

    popup.style.pointerEvents =
        '';

}

// =====================================================
// URBAN GENETIC SIGNATURE HELPERS
// =====================================================


function ugsValue(
    properties,
    field
){

    if(
        !properties ||
        properties[field] === undefined ||
        properties[field] === null ||
        properties[field] === ''
    ){

        return null;

    }

    return properties[field];

}


function ugsNumber(
    properties,
    field
){

    const value =
        Number(
            ugsValue(
                properties,
                field
            )
        );

    return Number.isFinite(value)
        ? value
        : null;

}


function ugsFriendlyBand(
    value
){

    if(!value){
        return 'Not available';
    }

    return String(value)
        .toLowerCase()
        .replace(/-/g,' / ');

}


function ugsProfileRow(
    label,
    pct,
    band,
    accent
){

    if(
        pct === null ||
        pct === undefined ||
        !Number.isFinite(Number(pct))
    ){

        return '';

    }


    const numericPct =
        Math.max(
            0,
            Math.min(
                100,
                Number(pct)
            )
        );


    return `

        <div class="ugs-profile-row">

            <div class="ugs-profile-label">
                ${label}
            </div>

            <div class="ugs-profile-track">

                <div
                    class="ugs-profile-fill"
                    style="
                        width:${numericPct}%;
                        background:${accent};
                    "
                ></div>

            </div>

            <div class="ugs-profile-value">
                ${ugsFriendlyBand(band)}
            </div>

        </div>

    `;

}


function ugsWhyItems(
    properties
){

    const candidates = [

        {
            label:'Intensity',
            pct:ugsNumber(
                properties,
                'UGS_v01_Intensity_Pct'
            ),
            band:ugsValue(
                properties,
                'UGS_v01_Intensity_Band'
            )
        },

        {
            label:'Accessibility',
            pct:ugsNumber(
                properties,
                'UGS_v01_Access_Pct'
            ),
            band:ugsValue(
                properties,
                'UGS_v01_Access_Band'
            )
        },

        {
            label:'Height / Form',
            pct:ugsNumber(
                properties,
                'UGS_v01_Height_Pct'
            ),
            band:ugsValue(
                properties,
                'UGS_v01_Height_Band'
            )
        },

        {
            label:'Change',
            pct:ugsNumber(
                properties,
                'UGS_v01_Change_Pct'
            ),
            band:ugsValue(
                properties,
                'UGS_v01_Change_Band'
            )
        },

        {
            label:'Age',
            pct:ugsNumber(
                properties,
                'UGS_v01_Age_Pct'
            ),
            band:ugsValue(
                properties,
                'UGS_v01_Building_Age_Band'
            )
        }

    ];


    return candidates

        .filter(
            item =>
                item.pct !== null &&
                item.pct !== undefined
        )

        .sort(
            (a,b) =>
                b.pct - a.pct
        )

        .slice(
            0,
            4
        );

}


function ugsInterpretation(
    properties,
    signature
){

    const traits = [];


    const intensity =
        ugsValue(
            properties,
            'UGS_v01_Intensity_Band'
        );

    const height =
        ugsValue(
            properties,
            'UGS_v01_Height_Band'
        );

    const access =
        ugsValue(
            properties,
            'UGS_v01_Access_Band'
        );

    const change =
        ugsValue(
            properties,
            'UGS_v01_Change_Band'
        );

    const age =
        ugsValue(
            properties,
            'UGS_v01_Building_Age_Band'
        );


    if(intensity){

        traits.push(
            `${ugsFriendlyBand(intensity)} intensity`
        );

    }


    if(change){

        traits.push(
            `${ugsFriendlyBand(change)} change signal`
        );

    }


    if(height){

        traits.push(
            `${ugsFriendlyBand(height)} vertical form`
        );

    }


    if(access){

        traits.push(
            `${ugsFriendlyBand(access)} accessibility`
        );

    }


    if(age){

        traits.push(
            `${ugsFriendlyBand(age)} building age`
        );

    }


    if(signature === 'CONSTRAINED'){

        return 'This location falls within a constrained or non-urban planning context and is treated separately from the normal urban genetic types.';

    }


    if(signature === 'UNASSESSED'){

        return 'There is not enough meaningful analytical context here to assign a normal urban genetic type.';

    }


    if(traits.length === 0){

        return 'The available indicators do not provide enough information for a more detailed interpretation.';

    }


    return `This hex combines ${traits
        .slice(0,3)
        .join(', ')}.`;

}


function ugsActivitySection(
    properties
){

    const approvalYear =
        ugsNumber(
            properties,
            'UGS_v01_Latest_Approval_Year'
        );

    const approvalFlag =
        ugsValue(
            properties,
            'UGS_v01_Recent_Approval_Flag'
        );

    const landDealYear =
        ugsNumber(
            properties,
            'UGS_v01_Latest_Land_Deal_Year'
        );

    const landDealFlag =
        ugsValue(
            properties,
            'UGS_v01_Recent_Land_Deal_Flag'
        );

    const evidence =
        ugsValue(
            properties,
            'UGS_v01_Observed_Change_Evidence'
        );


    const approvalValue =
        approvalYear !== null
            ? `${approvalYear}${approvalFlag === 'YES' ? ' · recent' : ''}`
            : '—';


    const landDealValue =
        landDealYear !== null
            ? `${landDealYear}${landDealFlag === 'YES' ? ' · recent' : ''}`
            : '—';


    let evidenceText =
        'No recent activity recorded.';


    if(evidence){

        evidenceText =
            String(
                evidence
            )
            .toLowerCase()
            .replace(
                /recent /g,
                'Recent '
            );

    }


    return `

        <div class="ugs-section">

            <div class="ugs-section-title">
                RECENT ACTIVITY
            </div>

            <div class="popup-row">
                <span>Latest building approval</span>
                <span>${approvalValue}</span>
            </div>

            <div class="popup-row">
                <span>Latest land deal</span>
                <span>${landDealValue}</span>
            </div>

            <div class="ugs-activity-note">
                ${evidenceText}
            </div>

        </div>

    `;

}

// =====================================================
// POPUP POSITIONING
// =====================================================

function positionPopup(point){

    popup.scrollTop = 0;

    popup.style.visibility =
        'hidden';

    popup.style.display =
        'block';

    popup.classList.add(
        'visible'
    );


    const mobilePopup =
        window.matchMedia(
            '(max-width:900px)'
        ).matches;


    if(mobilePopup){

        popup.style.position =
            'fixed';

        popup.style.left =
            '10px';

        popup.style.right =
            'auto';

        popup.style.top =
            'auto';

        popup.style.bottom =
            '44px';

        popup.style.width =
            '225px';

        popup.style.minWidth =
            '0';

        popup.style.maxWidth =
            '225px';

        popup.style.maxHeight =
            '35dvh';

        popup.style.overflowY =
            'auto';

        popup.style.pointerEvents =
            'auto';

        popup.style.touchAction =
            'pan-y';

        popup.style.visibility =
            'visible';

        return;

    }


    popup.style.position =
        'absolute';

    popup.style.right =
        '';

    popup.style.bottom =
        '';

    popup.style.width =
        '';

    popup.style.minWidth =
        '';

    popup.style.maxWidth =
        '';

    popup.style.maxHeight =
        '';

    popup.style.overflowY =
        '';

    popup.style.pointerEvents =
        'auto';


    const offset = 18;

    const popupWidth =
        popup.offsetWidth;

    const popupHeight =
        popup.offsetHeight;


    let left =
        point.x + offset;

    let top =
        point.y - 18;


    if(
        left + popupWidth >
        window.innerWidth - 24
    ){

        left =
            point.x -
            popupWidth -
            offset;

    }


    if(
        top + popupHeight >
        window.innerHeight - 24
    ){

        top =
            point.y -
            popupHeight -
            offset;

    }


    if(top < 24){

        top = 24;

    }


    if(left < 24){

        left = 24;

    }


    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;

    popup.style.visibility =
        'visible';

}

// -----------------------------------------------------
// Build Popup
// -----------------------------------------------------

function showPopup(
    feature,
    point,
    reclaimedFeature = null
){

    popup.scrollTop = 0;


    const p =
        feature
            ? feature.properties
            : null;


    const r =
        reclaimedFeature
            ? reclaimedFeature.properties
            : null;


    // -------------------------------------------------
    // Reclaimed-land-only popup
    // -------------------------------------------------

    if(!p && r){

        popup.innerHTML = `

            <h3>
                Reclaimed Land
            </h3>

            <div class="popup-subtitle">
                Historical urban fabric
            </div>

            <div class="popup-section">

                <div class="popup-label">
                    Urban Fabric · Reclaimed Land
                </div>

                <div class="popup-row">
                    <span>Reclamation year</span>
                    <span>${r['year'] ?? '—'}</span>
                </div>

                <div class="popup-row">
                    <span>Reclaimed area</span>
                    <span>
                        ${
                            Number(
                                r[
                                    'reclamation_area_sqm'
                                ] || 0
                            ).toLocaleString()
                        }
                        sqm
                    </span>
                </div>

            </div>

        `;

        positionPopup(
            point
        );

        return;

    }


    if(!p){

        hidePopup();

        return;

    }


    // -------------------------------------------------
    // Signature
    // -------------------------------------------------

    const signatureCode =
        String(
            ugsValue(
                p,
                'UGS_v01_Code'
            ) || 'U'
        );


    const signature =
        UGS_SIGNATURES[
            signatureCode
        ] ||
        UGS_SIGNATURES.U;


    const signatureName =
        ugsValue(
            p,
            'UGS_v01_Signature'
        ) ||
        signature.name;


    const landUse =
        ugsValue(
            p,
            'Land Use (SPZ)'
        ) ||
        'Urban fabric';


    const interpretation =
        ugsInterpretation(
            p,
            signatureName
        );


    const completeness =
        ugsValue(
            p,
            'UGS_v01_Data_Completeness'
        );


    const why =
        ugsWhyItems(
            p
        );


    // -------------------------------------------------
    // Visual fingerprint
    // -------------------------------------------------

    const profileRows = [

        ugsProfileRow(
            'INTENSITY',
            ugsNumber(
                p,
                'UGS_v01_Intensity_Pct'
            ),
            ugsValue(
                p,
                'UGS_v01_Intensity_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'ACCESSIBILITY',
            ugsNumber(
                p,
                'UGS_v01_Access_Pct'
            ),
            ugsValue(
                p,
                'UGS_v01_Access_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'HEIGHT / FORM',
            ugsNumber(
                p,
                'UGS_v01_Height_Pct'
            ),
            ugsValue(
                p,
                'UGS_v01_Height_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'CHANGE',
            ugsNumber(
                p,
                'UGS_v01_Change_Pct'
            ),
            ugsValue(
                p,
                'UGS_v01_Change_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'AGE',
            ugsNumber(
                p,
                'UGS_v01_Age_Pct'
            ),
            ugsValue(
                p,
                'UGS_v01_Building_Age_Band'
            ),
            signature.colour
        )

    ].join('');


    // -------------------------------------------------
    // Why Signature
    // -------------------------------------------------

    const whyHtml =
        why.length
            ? why.map(
                item => `
                    <div class="ugs-why-item">
                        <strong>
                            ${item.label}
                        </strong>

                        ${item.band
                            ? ugsFriendlyBand(
                                item.band
                            )
                            : 'not available'
                        }
                    </div>
                `
            ).join('')
            : `
                <div class="ugs-why-item">
                    No strong component signal is available.
                </div>
            `;


    // -------------------------------------------------
    // Existing underlying Atlas information
    // -------------------------------------------------

    const urbanFabricSection = `

        <details
            class="ugs-detail"
        >

            <summary>
                Urban Fabric
            </summary>

            <div class="ugs-detail-body">

                <div class="popup-row">
                    <span>Existing GFA</span>
                    <span>
                        ${
                            Number(
                                p[
                                    'GFA - Current (Est.)'
                                ] || 0
                            ).toFixed(1)
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Potential GFA</span>
                    <span>
                        ${
                            Number(
                                p[
                                    'GFA - Potential'
                                ] || 0
                            ).toFixed(1)
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Remaining GFA</span>
                    <span>
                        ${
                            Number(
                                p[
                                    'GFA - Remaining'
                                ] || 0
                            ).toFixed(1)
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>GFA saturation</span>
                    <span>
                        ${
                            p[
                                'GFA - Saturation'
                            ] == null
                                ? '—'
                                :
                                (
                                    Number(
                                        p[
                                            'GFA - Saturation'
                                        ]
                                    ) * 100
                                ).toFixed(1) + '%'
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Planning context</span>
                    <span>
                        ${
                            p[
                                'SPZ - Capacity Context'
                            ] ?? '—'
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Capacity status</span>
                    <span>
                        ${
                            p[
                                'Latent Capacity Status'
                            ] ?? '—'
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Living space</span>
                    <span>
                        ${
                            p[
                                'GFA per Capita'
                            ] == null
                                ? '—'
                                :
                                Number(
                                    p[
                                        'GFA per Capita'
                                    ]
                                ).toFixed(1) +
                                ' sqm/cap'
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Population / building</span>
                    <span>
                        ${
                            p[
                                'Population per Building'
                            ] == null
                                ? '—'
                                :
                                Number(
                                    p[
                                        'Population per Building'
                                    ]
                                ).toFixed(1)
                        }
                    </span>
                </div>

            </div>

        </details>

    `;


    const connectivitySection = `

        <details
            class="ugs-detail"
        >

            <summary>
                Connectivity
            </summary>

            <div class="ugs-detail-body">

                <div class="popup-row">
                    <span>MTR built</span>
                    <span>
                        ${
                            p[
                                'MTR - Index (Built)'
                            ] == null
                                ? '—'
                                :
                                Number(
                                    p[
                                        'MTR - Index (Built)'
                                    ]
                                ).toFixed(3)
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Road connectivity</span>
                    <span>
                        ${
                            p[
                                'Road_Con_Idx'
                            ] == null
                                ? '—'
                                :
                                Number(
                                    p[
                                        'Road_Con_Idx'
                                    ]
                                ).toFixed(3)
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Pedestrian access</span>
                    <span>
                        ${
                            p[
                                'Ped_Idx'
                            ] == null
                                ? '—'
                                :
                                Number(
                                    p[
                                        'Ped_Idx'
                                    ]
                                ).toFixed(3)
                        }
                    </span>
                </div>

            </div>

        </details>

    `;


    const methodologySection = `

        <details
            class="ugs-detail ugs-methodology"
        >

            <summary>
                How is the Signature calculated?
            </summary>

            <div class="ugs-detail-body">

                <p>
                    The Signature is a rule-based profile of
                    urban condition. It combines percentile-ranked
                    intensity, accessibility and building form
                    with building age and a modelled change signal.
                </p>

                <p>
                    The change signal uses Renewal Potential and
                    Development Pressure. These modelled indicators
                    are kept separate from observed activity such
                    as building approvals and land deals.
                </p>

                <p>
                    The Signature describes the condition detected
                    by the v0.1 model. It is not a prediction of
                    redevelopment.
                </p>

                ${
                    p[
                        'UGS_v01_Change_Basis'
                    ]
                        ? `
                            <div class="ugs-methodology-meta">
                                Change basis:
                                <strong>
                                    ${
                                        p[
                                            'UGS_v01_Change_Basis'
                                        ]
                                    }
                                </strong>
                            </div>
                        `
                        : ''
                }

                ${
                    completeness
                        ? `
                            <div class="ugs-methodology-meta">
                                Data completeness:
                                <strong>
                                    ${completeness}
                                </strong>
                            </div>
                        `
                        : ''
                }

            </div>

        </details>

    `;


    // -------------------------------------------------
    // Build final popup
    // -------------------------------------------------

    popup.innerHTML = `

        <div
            class="ugs-popup"
            style="--ugs-accent:${signature.colour};"
        >

            <div class="ugs-popup-header">

                <div>

                    <div class="ugs-hex">
                        HEX ${p['Hex ID'] ?? '—'}
                    </div>

                    <div class="ugs-landuse">
                        ${landUse}
                    </div>

                </div>

                <div
                    class="ugs-signature-code"
                    style="
                        border-color:${signature.colour};
                        color:${signature.colour};
                    "
                >
                    ${signatureCode}
                </div>

            </div>


            <div class="ugs-kicker">
                URBAN GENETIC SIGNATURE
            </div>


            <div
                class="ugs-signature-name"
                style="
                    color:${signature.colour};
                "
            >
                ${signatureName}
            </div>


            <div class="ugs-signature-description">
                ${signature.description}
            </div>


            <div class="ugs-profile">

                ${profileRows}

            </div>


            <div class="ugs-section">

                <div class="ugs-section-title">
                    WHY THIS SIGNATURE?
                </div>

                <div class="ugs-why-list">
                    ${whyHtml}
                </div>

                <p class="ugs-interpretation">
                    ${interpretation}
                </p>

            </div>


            ${ugsActivitySection(p)}


            ${r ? `

                <div class="ugs-section">

                    <div class="ugs-section-title">
                        RECLAIMED LAND
                    </div>

                    <div class="popup-row">
                        <span>Reclamation year</span>
                        <span>
                            ${r['year'] ?? '—'}
                        </span>
                    </div>

                    <div class="popup-row">
                        <span>Reclaimed area</span>
                        <span>
                            ${
                                Number(
                                    r[
                                        'reclamation_area_sqm'
                                    ] || 0
                                ).toLocaleString()
                            }
                            sqm
                        </span>
                    </div>

                </div>

            ` : ''}


            <div class="ugs-section">

                <div class="ugs-section-title">
                    UNDERLYING DATA
                </div>

                ${urbanFabricSection}

                ${connectivitySection}

                ${methodologySection}

            </div>

        </div>

    `;


    positionPopup(
        point
    );

}

// =====================================================
// UNIFIED MAP CLICK HANDLER
// =====================================================

map.on(
    'click',
    (e) => {

        const atlasFeatures =
            map.queryRenderedFeatures(
                e.point,
                {
                    layers:[
                        'atlas'
                    ]
                }
            );


        const reclaimedFeatures =
            map.queryRenderedFeatures(
                e.point,
                {
                    layers:[
                        'reclaimed'
                    ]
                }
            );


        const atlasFeature =
            atlasFeatures.length > 0
                ? atlasFeatures[0]
                : null;


        const reclaimedFeature =
            reclaimedFeatures.length > 0
                ? reclaimedFeatures[0]
                : null;


// -----------------------------------------------------
// Nothing clicked
// -----------------------------------------------------

        if(
            !atlasFeature &&
            !reclaimedFeature
        ){

            hidePopup();

            return;

        }


// -----------------------------------------------------
// Show unified popup
// -----------------------------------------------------

        showPopup(
            atlasFeature,
            e.point,
            reclaimedFeature
        );

    }
);


// =====================================================
// STATUS / THEME
// =====================================================


// -----------------------------------------------------
// Status strip
// -----------------------------------------------------

function updateStatus(){

    const zoom =
        map.getZoom().toFixed(1);


    status.textContent =
        `Hong Kong SAR · EPSG:4326 · 100 m Hex Grid · ${themeSelect.value} · Zoom ${zoom}`;

}


map.on(
    'zoom',
    updateStatus
);


// -----------------------------------------------------
// Theme switching
// -----------------------------------------------------

themeSelect.addEventListener(
    'change',
    () => {

        hidePopup();

        // Changing the analysis theme automatically
        // re-enables Urban Analysis.

        if(!analysisToggle.checked){

            analysisToggle.checked =
                true;

            analysisSection.classList.remove(
                'collapsed'
            );

            analysisSection.classList.add(
                'expanded'
            );


            analysisBody.style.display =
                '';


            analysisSectionToggle.setAttribute(
                'aria-expanded',
                'true'
            );

            analysisSectionToggle.setAttribute(
                'aria-label',
                'Collapse Urban Analysis'
            );

            analysisSectionToggle.textContent =
                '▾';

        }


        // Planning Context availability

        const planningContextAvailable =
            planningContextApplies();


        analysisControls.style.display =
            planningContextAvailable &&
            analysisToggle.checked
                ? 'flex'
                : 'none';


        // Reset context when changing analysis

        if(!planningContextAvailable){

            capacityContext.value =
                'All';

        }


        // Update the existing analysis layer

        drawAtlas();


        // Reapply the context filter

        applyCapacityContextFilter();


        // Refresh legend and status

        updateLegend();

        updateStatus();

    }
);


capacityContext.addEventListener(
    'change',
    () => {

        applyCapacityContextFilter();

    }
);


// =====================================================
// FABRIC LAYER TOGGLES
// =====================================================


// -----------------------------------------------------
// Terrain
// -----------------------------------------------------

terrainToggle.addEventListener(
    'change',
    (e) => {

        setLayerVisibility(
            'terrain',
            e.target.checked &&
            fabricToggle.checked
        );


        if(e.target.checked){

            expandFabricModule(
                terrainModule
            );

        } else {

            collapseFabricModule(
                terrainModule
            );

        }

    }
);


// -----------------------------------------------------
// Reclaimed Land
// -----------------------------------------------------

reclaimedToggle.addEventListener(
    'change',
    (e) => {

        setLayerVisibility(
            'reclaimed',
            e.target.checked &&
            fabricToggle.checked
        );


        setLayerVisibility(
            'reclaimed-outline',
            e.target.checked &&
            fabricToggle.checked
        );


        reclamationControls.style.display =
            e.target.checked
                ? 'flex'
                : 'none';


        updateReclamationLegend();


        if(e.target.checked){

            expandFabricModule(
                reclaimedModule
            );

            updateReclamation();

        } else {

            collapseFabricModule(
                reclaimedModule
            );

        }

    }
);


// -----------------------------------------------------
// Building Age
// -----------------------------------------------------

buildingAgeToggle.addEventListener(
    'change',
    (e) => {

        setLayerVisibility(
            'buildingAge',
            e.target.checked &&
            fabricToggle.checked
        );


        buildingAgeControls.style.display =
            e.target.checked
                ? 'flex'
                : 'none';


        updateBuildingAgeLegend();


        if(e.target.checked){

            expandFabricModule(
                buildingAgeModule
            );

            updateBuildingAgeFilter();
            updateBuildingAgeCount();

        } else {

            collapseFabricModule(
                buildingAgeModule
            );

        }

    }
);


// -----------------------------------------------------
// Heritage
// -----------------------------------------------------

heritageToggle.addEventListener(
    'change',
    (e) => {

        setLayerVisibility(
            'heritage',
            e.target.checked &&
            fabricToggle.checked
        );


        heritageControls.style.display =
            e.target.checked
                ? 'flex'
                : 'none';


        updateHeritageLegend();


        if(e.target.checked){

            expandFabricModule(
                heritageModule
            );

            updateHeritageFilter();
            updateHeritageCount();

        } else {

            collapseFabricModule(
                heritageModule
            );

        }

    }
);


// -----------------------------------------------------
// MTR Network
// -----------------------------------------------------

mtrToggle.addEventListener(
    'change',
    (e) => {

        setLayerVisibility(
            'mtr',
            e.target.checked &&
            fabricToggle.checked
        );


        if(e.target.checked){

            expandFabricModule(
                mtrModule
            );

        } else {

            collapseFabricModule(
                mtrModule
            );

        }

    }
);

// =====================================================
// Shared Handler
// =====================================================
//
// Fabric name behaviour:
//
// 1. Unchecked layer + click name:
//       → turn layer on
//       → expand module
//
// 2. Checked layer + click name:
//       → simply expand / collapse module
//
// The checkbox itself remains the only control that
// turns a layer off.
// =====================================================

document
    .querySelectorAll('.fabric-module-label')
    .forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const module =
                    document.getElementById(
                        button.dataset.module
                    );


                if(!module){
                    return;
                }


                const toggle =
                    module.querySelector(
                        '.toggle input'
                    );


                if(!toggle){
                    return;
                }


                // -------------------------------------------------
                // If the layer is currently off, clicking its name
                // turns it on. The existing checkbox change handler
                // will make the layer visible and expand the module.
                // -------------------------------------------------

                if(!toggle.checked){

                    toggle.checked = true;

                    toggle.dispatchEvent(
                        new Event(
                            'change',
                            {
                                bubbles:true
                            }
                        )
                    );

                    return;

                }


                // -------------------------------------------------
                // Layer is already on:
                // clicking the name simply expands / collapses
                // the module without changing visibility.
                // -------------------------------------------------

                if(
                    module.classList.contains(
                        'expanded'
                    )
                ){

                    collapseFabricModule(
                        module
                    );

                } else {

                    expandFabricModule(
                        module
                    );

                }

            }
        );

    });
    
// =====================================================
// URBAN FABRIC — BUILDING AGE
// =====================================================


// -----------------------------------------------------
// Building Age Filter
// -----------------------------------------------------

function updateBuildingAgeFilter(){

    if(!map.getLayer('buildingAge')){

        return;

    }


    const selectedYear =
        Number(
            buildingAgeYear.value
        );


    map.setFilter(
        'buildingAge',

        [
            'all',

            // Ignore missing / zero years

            [
                '>',
                [
                    'to-number',
                    [
                        'get',
                        'Year'
                    ]
                ],
                0
            ],

            // Show buildings up to selected year

            [
                '<=',
                [
                    'to-number',
                    [
                        'get',
                        'Year'
                    ]
                ],
                selectedYear
            ]

        ]

    );

}


// -----------------------------------------------------
// Building Age Count
// -----------------------------------------------------

function updateBuildingAgeCount(){

    if(!map.getSource('buildingAge')){

        buildingAgeCountValue.textContent =
            '—';

        return;

    }


    const selectedYear =
        Number(
            buildingAgeYear.value
        );


    const features =
        map
            .getSource('buildingAge')
            ._data
            .features;


    let count = 0;


    features.forEach(
        feature => {

            const year =
                Number(
                    feature
                        .properties
                        ?.Year
                );


            if(

                Number.isFinite(year) &&

                year > 0 &&

                year <= selectedYear

            ){

                count++;

            }

        }
    );


    buildingAgeCountValue.textContent =
        count.toLocaleString();

}


// -----------------------------------------------------
// Building Age Year Slider
// -----------------------------------------------------

buildingAgeYear.addEventListener(
    'input',
    (e) => {

        const selectedYear =
            Number(e.target.value);


        buildingAgeYearValue.textContent =
            selectedYear;


        updateBuildingAgeFilter();

        updateBuildingAgeCount();

    }
);


// =====================================================
// URBAN FABRIC — HERITAGE
// =====================================================


// -----------------------------------------------------
// Heritage Filter
// -----------------------------------------------------

function updateHeritageFilter(){

    if(!map.getLayer('heritage')){

        return;

    }


    const grades = [];


    if(grade1Toggle.checked){

        grades.push(
            'Grade 1'
        );

    }


    if(grade2Toggle.checked){

        grades.push(
            'Grade 2'
        );

    }


    if(grade3Toggle.checked){

        grades.push(
            'Grade 3'
        );

    }


// -----------------------------------------------------
// No grades selected
// -----------------------------------------------------

    if(grades.length === 0){

        map.setFilter(

            'heritage',

            [
                '==',
                [
                    'get',
                    'HBG_GRADE'
                ],
                '__none__'
            ]

        );

        return;

    }


// -----------------------------------------------------
// Grade filter expression
// -----------------------------------------------------

    const gradeExpression =

        grades.length === 1

            ? [

                '==',

                [
                    'get',
                    'HBG_GRADE'
                ],

                grades[0]

              ]

            : [

                'in',

                [
                    'get',
                    'HBG_GRADE'
                ],

                [
                    'literal',
                    grades
                ]

              ];


    map.setFilter(
        'heritage',
        gradeExpression
    );

}


// -----------------------------------------------------
// Heritage Count
// -----------------------------------------------------

function updateHeritageCount(){

    if(!map.getSource('buildingAge')){

        heritageCountValue.textContent =
            '—';

        return;

    }


    const grades = [];


    if(grade1Toggle.checked){

        grades.push(
            'Grade 1'
        );

    }


    if(grade2Toggle.checked){

        grades.push(
            'Grade 2'
        );

    }


    if(grade3Toggle.checked){

        grades.push(
            'Grade 3'
        );

    }


    const features =
        map
            .getSource('buildingAge')
            ._data
            .features;


    let count = 0;


    features.forEach(
        feature => {

            const grade =
                feature
                    .properties
                    ?.HBG_GRADE;


            if(

                grade !== null &&

                grade !== undefined &&

                grades.includes(grade)

            ){

                count++;

            }

        }
    );


    heritageCountValue.textContent =
        count.toLocaleString();

}


// -----------------------------------------------------
// Heritage Grade Toggles
// -----------------------------------------------------

grade1Toggle.addEventListener(
    'change',
    () => {

        updateHeritageFilter();

        updateHeritageCount();

    }
);


grade2Toggle.addEventListener(
    'change',
    () => {

        updateHeritageFilter();

        updateHeritageCount();

    }
);


grade3Toggle.addEventListener(
    'change',
    () => {

        updateHeritageFilter();

        updateHeritageCount();

    }
);


// =====================================================
// URBAN FABRIC — RECLAIMED LAND
// =====================================================


// -----------------------------------------------------
// Reclaimed Slider
// -----------------------------------------------------

function updateReclamation(){

    const selectedYear =
        Number(
            reclamationSlider.value
        );


    // Update displayed year

    reclamationYearValue.textContent =
        selectedYear;


// -----------------------------------------------------
// Update reclaimed fill
// -----------------------------------------------------

    if(
        map.getLayer(
            'reclaimed'
        )
    ){

        map.setFilter(
            'reclaimed',

            [
                '<=',

                [
                    'to-number',
                    [
                        'get',
                        'year'
                    ]
                ],

                selectedYear
            ]

        );

    }


// -----------------------------------------------------
// Update reclaimed outline
// -----------------------------------------------------

    if(
        map.getLayer(
            'reclaimed-outline'
        )
    ){

        map.setFilter(
            'reclaimed-outline',

            [
                '<=',

                [
                    'to-number',
                    [
                        'get',
                        'year'
                    ]
                ],

                selectedYear
            ]

        );

    }


// -----------------------------------------------------
// Reclaimed Area Calculation
// -----------------------------------------------------

    const features =
        map.querySourceFeatures(
            'reclaimed'
        );


    let totalArea = 0;


    features.forEach(
        feature => {

            const year =
                Number(
                    feature.properties.year
                );


            const area =
                Number(
                    feature
                        .properties
                        .reclamation_area_sqm
                );


            if(

                year <= selectedYear &&

                Number.isFinite(area)

            ){

                totalArea += area;

            }

        }
    );


    reclamationAreaValue.textContent =
        (
            totalArea / 1000000
        ).toFixed(1) +
        ' km²';

}


// -----------------------------------------------------
// Slider interaction
// -----------------------------------------------------

reclamationSlider.addEventListener(
    'input',
    updateReclamation
);


// -----------------------------------------------------
// Initialise once map is idle
// -----------------------------------------------------

map.once(
    'idle',
    updateReclamation
);


// =====================================================
// URBAN FABRIC — MTR NETWORK
// =====================================================


// -----------------------------------------------------
// MTR Colour Mode
// -----------------------------------------------------

function updateMtrColours(){

    if(!map.getLayer('mtr')){

        return;

    }


    if(!mtrColourToggle.checked){

        map.setPaintProperty(
            'mtr',
            'line-color',
            '#4d4c4c'
        );

        return;

    }


    map.setPaintProperty(
        'mtr',
        'line-color',

        [

            'match',

            [
                'get',
                'Line Code'
            ],

            'ISL',
            '#005EB8',

            'KTL',
            '#00A94F',

            'TWL',
            '#E2231A',

            'TKL',
            '#7A3E9D',

            'TCL',
            '#F57C00',

            'EAL',
            '#4DA6FF',

            'TML',
            '#9B6A4B',

            'SIL',
            '#9ACD32',

            'DRL',
            '#E78AC3',

            'AEL',
            '#008C95',

            'NOL',
            '#C2188B',

            '#4d4c4c'

        ]

    );

}


mtrColourToggle.addEventListener(
    'change',
    updateMtrColours
);


// =====================================================
// CURSOR BEHAVIOUR
// =====================================================

map.on(
    'mouseenter',
    'atlas',
    () => {

        map
            .getCanvas()
            .style
            .cursor =
                'pointer';

    }
);


map.on(
    'mouseleave',
    'atlas',
    () => {

        map
            .getCanvas()
            .style
            .cursor =
                '';

    }
);


// =====================================================
// CLOSE POPUP / WELCOME
// =====================================================

document.addEventListener(
    'keydown',
    (e) => {

        if(e.key !== 'Escape'){

            return;

        }


// -----------------------------------------------------
// Welcome overlay
// -----------------------------------------------------

        if(

            welcomeOverlay &&

            !welcomeOverlay.classList.contains(
                'hidden'
            )

        ){

            closeWelcome();

            return;

        }


// -----------------------------------------------------
// Map popup
// -----------------------------------------------------

        hidePopup();

    }
);


// =====================================================
// INITIAL STATUS
// =====================================================

updateStatus();