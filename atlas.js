// === IA V1.7 PRODUCTION ATLAS PATCH: FIVE-DOMAIN INFORMATION ARCHITECTURE ===
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
        atlasInitialZoom,

    attributionControl:false

});

// =====================================================
// ATLAS VECTOR TILE SOURCE LAYER
// =====================================================
//
// v1.5 PMTiles is generated directly from the spatial master GeoJSON,
// so Tippecanoe used the filename-derived layer name.
// Keep this explicit so the existing Atlas layer logic
// continues to use a single shared hex source.
//

const ATLAS_SOURCE_LAYER =
    'atlas';


// === PANEL STACK V3.7 COMPACT ATTRIBUTION START ===
// Keep source/provider attribution accessible but visually quiet. MapLibre's
// native compact control is deliberately used rather than hiding attribution.
map.addControl(
    new maplibregl.AttributionControl({
        compact:true
    }),
    'bottom-left'
);
// === PANEL STACK V3.7 COMPACT ATTRIBUTION END ===

// === PANEL STACK V3.8 ATTRIBUTION LAYOUT START ===
// Keep attribution compact by default, close it after use, and treat the
// attribution/status/rights note as one small bottom-left UI stack.
(function initialiseAtlasAttributionLayout(){

    const GAP = 8;
    const MOBILE_QUERY = window.matchMedia('(max-width:900px)');
    let autoCloseTimer = null;
    let resizeObserver = null;

    function attributionElements(){
        const corner = document.querySelector('.maplibregl-ctrl-bottom-left');
        const attribution = corner?.querySelector('.maplibregl-ctrl-attrib');
        const button = attribution?.querySelector('.maplibregl-ctrl-attrib-button');
        return { corner, attribution, button };
    }

    function clearAutoClose(){
        if(autoCloseTimer !== null){
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }
    }

    function closeAtlasAttribution(){
        const { attribution, button } = attributionElements();
        if(!attribution){
            return;
        }
        clearAutoClose();
        attribution.classList.remove('maplibregl-compact-show');
        if(button){
            button.setAttribute('aria-expanded','false');
        }
    }

    function scheduleAttributionClose(delay=8000){
        const { attribution } = attributionElements();
        if(!attribution?.classList.contains('maplibregl-compact-show')){
            return;
        }
        clearAutoClose();
        autoCloseTimer = setTimeout(closeAtlasAttribution, delay);
    }

    function layoutAtlasAttribution(){
        const { corner } = attributionElements();
        const status = document.getElementById('status');
        const rights = document.getElementById('copyright');
        const mapNode = map?.getContainer?.();

        if(!corner || !rights || !mapNode){
            return;
        }

        const mapRect = mapNode.getBoundingClientRect();
        const mobile = MOBILE_QUERY.matches;

        // Keep the left edges aligned with the rest of the Atlas chrome.
        corner.style.setProperty('left', mobile ? '7px' : '10px', 'important');
        rights.style.setProperty('left', mobile ? '7px' : '10px', 'important');

        // Status is intentionally hidden on mobile, so attribution sits one
        // standard gap above the rights note. On desktop, status sits one gap
        // above the rights note and attribution one gap above the status.
        const rightsRect = rights.getBoundingClientRect();

        if(mobile || !status || getComputedStyle(status).display === 'none'){
            const bottom = Math.max(
                GAP,
                Math.round(mapRect.bottom - rightsRect.top + GAP)
            );
            corner.style.setProperty('bottom', `${bottom}px`, 'important');
            return;
        }

        status.style.setProperty('left', '10px', 'important');
        const statusBottom = Math.max(
            GAP,
            Math.round(mapRect.bottom - rightsRect.top + GAP)
        );
        status.style.setProperty('bottom', `${statusBottom}px`, 'important');

        // Reading the rectangle after setting bottom gives the true rendered
        // height, including padding and any future language/content changes.
        const statusRect = status.getBoundingClientRect();
        const attributionBottom = Math.max(
            GAP,
            Math.round(mapRect.bottom - statusRect.top + GAP)
        );
        corner.style.setProperty('bottom', `${attributionBottom}px`, 'important');
    }

    function bindAtlasAttribution(){
        const { attribution } = attributionElements();
        const status = document.getElementById('status');
        const rights = document.getElementById('copyright');

        if(!attribution){
            requestAnimationFrame(bindAtlasAttribution);
            return;
        }

        // Explicitly start every page load in compact state.
        closeAtlasAttribution();
        layoutAtlasAttribution();

        const classObserver = new MutationObserver(() => {
            if(attribution.classList.contains('maplibregl-compact-show')){
                scheduleAttributionClose(8000);
            }else{
                clearAutoClose();
            }
            // Expanded and compact states share exactly the same anchor.
            requestAnimationFrame(layoutAtlasAttribution);
        });
        classObserver.observe(attribution, {
            attributes:true,
            attributeFilter:['class']
        });

        attribution.addEventListener('pointerenter', clearAutoClose);
        attribution.addEventListener('pointerleave', () => {
            scheduleAttributionClose(3000);
        });

        // Any interaction elsewhere in the Atlas returns attribution to its
        // compact state immediately.
        document.addEventListener('pointerdown', event => {
            if(
                attribution.classList.contains('maplibregl-compact-show') &&
                !attribution.contains(event.target)
            ){
                closeAtlasAttribution();
            }
        }, true);

        map.on('movestart', closeAtlasAttribution);

        window.addEventListener('resize', () => {
            requestAnimationFrame(layoutAtlasAttribution);
        });

        if(typeof ResizeObserver !== 'undefined'){
            resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(layoutAtlasAttribution);
            });
            if(status){ resizeObserver.observe(status); }
            if(rights){ resizeObserver.observe(rights); }
        }

        // Exposed only as a lightweight diagnostic/helper.
        window.UGAAttributionState = () => ({
            expanded: attribution.classList.contains('maplibregl-compact-show'),
            mobile: MOBILE_QUERY.matches,
            cornerBottom: getComputedStyle(attribution.closest('.maplibregl-ctrl-bottom-left')).bottom
        });
    }

    requestAnimationFrame(bindAtlasAttribution);

})();
// === PANEL STACK V3.8 ATTRIBUTION LAYOUT END ===
// === PANEL STACK V3.9 DESKTOP ATTRIBUTION POSITION FIX ===
// Measured bottom-left offsets now override CSS fallbacks with !important.


map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

// === PANEL STACK V3.9 NAVIGATION CONTROL REMOVAL START ===
// Native MapLibre zoom/compass controls are intentionally omitted on both
// desktop and mobile; direct map gestures remain available.
// === PANEL STACK V3.9 NAVIGATION CONTROL REMOVAL END ===

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

const analysisOpacity =
    document.getElementById('analysisOpacity');

const analysisOpacityValue =
    document.getElementById('analysisOpacityValue');

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

const legendInfoButton =
    document.getElementById('legendInfoButton');

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
// Panel order — Fabric → Analysis → Market
// -----------------------------------------------------

const panelScroll =
    document.getElementById('panelScroll');

if(
    panelScroll &&
    fabricSection &&
    analysisSection
){
    panelScroll.insertBefore(
        fabricSection,
        analysisSection
    );
}

// -----------------------------------------------------
// Urban Fabric — Layer Toggles
// -----------------------------------------------------


const fabricToggle =
    document.getElementById('fabricToggle');

const fabricOpacity =
    document.getElementById('fabricOpacity');

const fabricOpacityValue =
    document.getElementById('fabricOpacityValue');

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
// Urban Fabric — Building Height
// -----------------------------------------------------

const buildingHeightModule =
    document.getElementById('buildingHeightModule');

const buildingHeightToggle =
    document.getElementById('buildingHeightToggle');

const buildingHeightMin =
    document.getElementById(
        'building-height-min'
    );

const buildingHeightMax =
    document.getElementById(
        'building-height-max'
    );

const buildingHeightValue =
    document.getElementById(
        'building-height-value'
    );

const buildingHeightSliderFill =
    document.getElementById(
        'building-height-slider-fill'
    );


// -----------------------------------------------------
// Urban Fabric — Roads
// -----------------------------------------------------

const roadsModule =
    document.getElementById('roadsModule');

const roadsToggle =
    document.getElementById('roadsToggle');

const roadHighwayToggle =
    document.getElementById('roadHighwayToggle');

const roadMainToggle =
    document.getElementById('roadMainToggle');

const roadSecondaryToggle =
    document.getElementById('roadSecondaryToggle');


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

const atlasInfoPopover =
    document.getElementById('atlasInfoPopover');

const atlasInfoTitle =
    document.getElementById('atlasInfoTitle');

const atlasInfoBody =
    document.getElementById('atlasInfoBody');

const atlasInfoClose =
    document.getElementById('atlasInfoClose');

const buildingHeightCoverageStat =
    document.getElementById('buildingHeightCoverageStat');

let atlasStats = null;
let activeInfoKey = null;
let activeInfoTrigger = null;

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

const basemapToggle =
    document.getElementById('basemapToggle');

const basemapMapLabel =
    document.getElementById('basemapMapLabel');

const basemapSatelliteLabel =
    document.getElementById('basemapSatelliteLabel');

const buildingBaseToggle =
    document.getElementById('buildingBaseToggle');

const marketContextOverlay =
    document.getElementById('marketContextOverlay');

const marketContextOpacity =
    document.getElementById('marketContextOpacity');

const marketContextOpacityValue =
    document.getElementById('marketContextOpacityValue');


// =====================================================
// EDITORIAL INFORMATION / STATISTICS SYSTEM
// =====================================================

const ATLAS_STATS_URL = './site/atlas-stats.json';

const ANALYSIS_STATS_KEYS = {
    'Urban Genetic Signature':'ugs',
    'Development Pressure':'developmentPressure',
    'GFA - Saturation':'gfaSaturation',
    'MTR - Index (Built)':'mtrBuilt',
    'Renewal Potential':'renewalPotential',
    'Genesis Potential':'genesisPotential',
    'GFA per Capita':'livingSpace',
    'Population per Building':'populationIntensity',
    'Latent Urban Capacity':'latentCapacity',
    'Market Exposure':'marketExposure'
};

function infoEsc(value){
    return String(value ?? '').replace(
        /[&<>"']/g,
        char => ({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#39;'
        })[char]
    );
}

function infoNumber(value){
    const n = Number(value);
    return Number.isFinite(n)
        ? n.toLocaleString()
        : '—';
}

function infoPct(value, digits=1){
    const n = Number(value);
    return Number.isFinite(n)
        ? `${n.toFixed(digits)}%`
        : '—';
}

function infoTrend(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return '—';
    return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function infoSection(title, html){
    return `
        <section class="atlas-info-block">
            <div class="atlas-info-heading">${title}</div>
            ${html}
        </section>
    `;
}

function currentReleaseId(){
    return (
        document
            .querySelector('meta[name="atlas-release"]')
            ?.getAttribute('content')
        ||
        atlasStats?.atlas?.releaseId
        ||
        'Local development build'
    );
}

function marketSnapshotHtml(){
    const context = window.UGA_MARKET_CONTEXT;
    const regions = context?.analytics?.regions;

    if(!regions){
        return `<p>Current market snapshot is loading.</p>`;
    }

    const names = [
        'Hong Kong',
        'Kowloon',
        'New Territories'
    ];

    const rows = names.map(name => {
        const row = regions[name] || {};
        return `
            <tr>
                <td>${infoEsc(name)}</td>
                <td>${infoEsc(infoTrend(row.price_trend_12m_pct))}</td>
                <td>${infoEsc(infoTrend(row.rent_trend_12m_pct))}</td>
                <td>${infoEsc(row.momentum_label || '—')}</td>
            </tr>
        `;
    }).join('');

    const periods = names.flatMap(name => {
        const row = regions[name] || {};
        return [
            row.latest_price_date,
            row.latest_rent_date
        ].filter(Boolean);
    });

    const latest = periods.length
        ? periods.sort().at(-1)
        : '—';

    return `
        <table class="atlas-info-snapshot">
            <thead>
                <tr>
                    <th>Region</th>
                    <th>Price</th>
                    <th>Rent</th>
                    <th>Momentum</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:8px;">
            Latest available period:
            <strong>${infoEsc(latest)}</strong>
        </p>
    `;
}

function analysisInfoPanel(theme){
    const ugs = atlasStats?.ugs || {};
    const coverage = atlasStats?.coverage || {};
    const total = Number(atlasStats?.atlas?.totalHexes);
    const meaningful = Number(ugs.meaningfulUrbanCount);

    const cov = key => coverage?.[key] || {};

    const fullCoverage = key => {
        const row = cov(key);
        return Number.isFinite(Number(row.count))
            ? `${infoNumber(row.count)} of ${infoNumber(total)} Atlas cells (${infoPct(row.pct,1)})`
            : 'Coverage unavailable';
    };

    const meaningfulCoverage = key => {
        const row = cov(key);
        const count = Number(row.count);
        if(!Number.isFinite(count) || !Number.isFinite(meaningful) || meaningful <= 0){
            return 'Coverage unavailable';
        }
        return `${infoNumber(count)} of ${infoNumber(meaningful)} meaningful urban cells (${infoPct((count/meaningful)*100,1)})`;
    };

    const panels = {

        'Urban Genetic Signature':{
            title:'Urban Genetic Signature',
            html:
                infoSection(
                    'WHAT IS A SIGNATURE?',
                    `<p>
                        Different parts of a city combine characteristics in
                        different ways — how built-up they are, how tall, how
                        connected, how old and how strongly the data shows change.
                    </p>
                    <p>
                        <strong>A Signature is a recognisable combination of
                        those characteristics.</strong>
                    </p>
                    <p>
                        The individual layers tell us what is there. The
                        Signature helps show how those things fit together.
                    </p>`
                )
                +
                infoSection(
                    'THE FIVE-PART PROFILE',
                    `<div class="atlas-info-profile">
                        <div><strong>Intensity</strong> — how built-up the place is relative to other urban cells.</div>
                        <div><strong>Accessibility</strong> — how strongly it connects to pedestrian, road and built MTR networks.</div>
                        <div><strong>Height / Form</strong> — how tall and vertically built the recorded fabric is.</div>
                        <div><strong>Change</strong> — how strong the Development Pressure signal is relative to other urban cells.</div>
                        <div><strong>Age</strong> — how old the recorded building stock is.</div>
                    </div>
                    <p style="margin-top:8px;">
                        The bars form a profile. They are <strong>not</strong>
                        combined into a single overall score.
                    </p>`
                )
                +
                infoSection(
                    'HOW A SIGNATURE IS ASSIGNED',
                    `<p>
                        The classification is rule-based. A Signature is
                        assigned when a particular combination crosses its
                        defining thresholds. Not every characteristic is used
                        to assign every Signature, and Stable Fabric simply means
                        that no other Signature-defining combination stands out.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Neighbouring places can share one strong characteristic
                        but receive different Signatures because the rest of
                        their profiles differ.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        <strong>${infoNumber(ugs.meaningfulUrbanCount)}</strong>
                        cells have meaningful urban context.
                        <strong>${infoNumber(ugs.constrainedCount)}</strong>
                        are treated as constrained / non-urban, and
                        <strong>${infoNumber(ugs.unassessedCount)}</strong>
                        remain unassessed.
                    </p>
                    <p>
                        Stable Fabric accounts for
                        <strong>${infoPct(ugs.stableShare,1)}</strong> of the
                        meaningful urban set.
                    </p>
                    ${
                        Number.isFinite(Number(ugs.recentApprovalCount))
                        ? `<p>
                            ${infoNumber(ugs.recentApprovalCount)} meaningful
                            urban cells record a building approval from 2021
                            onward; ${infoNumber(ugs.recentApprovalHighChangeCount)}
                            of those also sit in the high Change group.
                        </p>`
                        : ''
                    }`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A Signature describes a detected urban condition. It is
                        not a judgement of quality and does not predict
                        redevelopment.
                    </p>`
                )
        },

        'Development Pressure':{
            title:'Development Pressure',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Development Pressure is a diagnostic model asking where
                        structural conditions and recorded development activity
                        combine into a stronger pressure signal.
                    </p>
                    <p>
                        It brings together building age, remaining development
                        opportunity, physical form and recorded building approvals.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        No single factor creates the result. Older fabric can
                        remain relatively quiet, while places where several
                        conditions overlap become more prominent.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        ${meaningfulCoverage('developmentPressure')} have enough
                        evidence to receive a Development Pressure score.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Higher values mean the selected conditions combine more
                        strongly. They do not mean redevelopment is planned,
                        approved or imminent.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<ul class="atlas-info-list">
                        <li><strong>35% — Age Stress</strong></li>
                        <li><strong>30% — Capacity Opportunity</strong></li>
                        <li><strong>20% — Form Susceptibility</strong></li>
                        <li><strong>15% — Approval Activity</strong></li>
                    </ul>
                    <p>
                        Approval Activity gives more weight to recent approvals
                        while also recognising repeated recorded events. Each
                        recorded approval-year entry is treated as one event.
                    </p>
                    <p>
                        Missing structural inputs are omitted and the available
                        weights are rebalanced. A blank approval history is read
                        as zero recorded approval events in that source history,
                        not as missing coverage.
                    </p>`
                )
        },

        'GFA - Saturation':{
            title:'GFA Saturation',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Gross floor area (GFA) Saturation estimates how much of
                        the modelled development capacity in a hex has already
                        been realised.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Saturation and Latent Urban Capacity describe opposite
                        sides of the same capacity relationship: a highly
                        saturated hex has less proportional capacity remaining.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('gfaSaturation')} have an assessed GFA Saturation value.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Higher values mean more estimated capacity is already
                        built. This is a capacity-model result, not a statement
                        that additional development is immediately feasible or
                        permitted.
                    </p>`
                )
        },

        'MTR - Index (Built)':{
            title:'MTR Built Accessibility',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        This index measures relative accessibility to the built
                        MTR network using proximity and network connectivity.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Stronger values cluster around places with better access
                        to the existing rail network. Planned additions are kept
                        separate from this built-network view.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('mtrBuilt')} carry a valid index value, including genuine zeros.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        It is a relative accessibility measure — not a measure
                        of journey time, passenger volume or service frequency.
                        A zero means no signal under this index, not no public
                        transport of any kind.
                    </p>`
                )
        },

        'Renewal Potential':{
            title:'Renewal Potential',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Renewal Potential is a strategic lens for established
                        urban fabric. It asks where age, existing intensity,
                        built-out capacity, accessibility and policy relevance
                        combine strongly enough to make renewal worth investigating.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Renewal tends to favour established, relatively built-out
                        and connected fabric. Compare it with Genesis, which asks
                        a different question about room for new growth.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        ${meaningfulCoverage('renewalPotential')} receive a
                        Renewal score. Component coverage still varies, so score
                        strength and data support are not the same thing.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A higher value means a stronger combination of the
                        selected renewal conditions. It does not mean
                        redevelopment will occur.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<ul class="atlas-info-list">
                        <li><strong>30% — Age Stress</strong></li>
                        <li><strong>25% — Existing Intensity</strong></li>
                        <li><strong>20% — GFA Saturation</strong></li>
                        <li><strong>15% — Existing Accessibility</strong></li>
                        <li><strong>10% — Renewal Policy Alignment</strong></li>
                    </ul>
                    <p>
                        Policy Alignment is an explicit analytical assumption,
                        not an observed property of the site. Missing inputs are
                        omitted and available weights are rebalanced.
                    </p>`
                )
        },

        'Genesis Potential':{
            title:'Genesis Potential',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Genesis Potential is a strategic lens for under-used or
                        more mutable urban conditions. It asks where remaining
                        capacity, lower existing intensity, planning flexibility
                        and new accessibility catalysts combine more strongly.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Genesis is designed to highlight a different condition
                        from Renewal: room to grow, comparatively less existing
                        intensity and the presence of enabling conditions.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        ${meaningfulCoverage('genesisPotential')} receive a
                        Genesis score. Component coverage still varies, so the
                        model also retains a separate data-support measure.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A higher value means a stronger combination of the
                        selected Genesis conditions. It does not identify a
                        guaranteed development site or forecast what will be built.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<ul class="atlas-info-list">
                        <li><strong>35% — Capacity Opportunity</strong></li>
                        <li><strong>25% — Low Existing Intensity</strong></li>
                        <li><strong>20% — Policy Flexibility</strong></li>
                        <li><strong>20% — Planned Accessibility Additionality</strong></li>
                    </ul>
                    <p>
                        Planned Accessibility Additionality counts only positive
                        accessibility added by the planned MTR network over the
                        built network. Policy Flexibility is an explicit analytical
                        assumption. Missing inputs are omitted and available
                        weights are rebalanced.
                    </p>`
                )
        },

        'GFA per Capita':{
            title:'Living Space (m² per resident)',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Estimated residential floor area per resident within each
                        hex.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Read this alongside Population Intensity and existing GFA.
                        Similar amounts of built floor area can support very
                        different numbers of residents.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('livingSpace')} have enough source data for this estimate.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        This is an area-based estimate. It is not a direct
                        measurement of dwelling size, household crowding or
                        housing quality.
                    </p>`
                )
        },

        'Population per Building':{
            title:'Population Intensity',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Estimated number of residents associated with the
                        buildings in each hex.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Use it with Living Space and existing GFA to see how
                        similar built forms can support very different levels of
                        residential concentration.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('populationIntensity')} have enough source data for this estimate.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        This is a spatial estimate for comparison across the
                        Atlas. It should not be read as an exact headcount for a
                        specific building or property.
                    </p>`
                )
        },

        'Latent Urban Capacity':{
            title:'Latent Urban Capacity',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Latent Urban Capacity estimates the share of modelled
                        development capacity that remains unrealised.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Compare it with GFA Saturation. A high-capacity share can
                        still represent a small absolute amount of floor area,
                        which is why Development Pressure and Genesis also use an
                        absolute remaining-GFA signal.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('latentCapacity')} have an assessed capacity value.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Latent capacity is not the same as vacant land,
                        development feasibility, land ownership or permission to
                        build immediately.
                    </p>`
                )
        },

        'Transaction Exposure':{
            title:'Transaction Exposure',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Transaction Exposure is a local analytical layer. It asks
                        where stronger observed Transaction Pulse overlaps with
                        stronger local Development Pressure and Capacity Opportunity.
                    </p>`
                )
                +
                infoSection(
                    'WHY IS IT MORE GRANULAR?',
                    `<p>
                        Transaction Pulse retains the geography published by the
                        Land Registry, so neighbouring hexes within the same source
                        geography can share the same pulse. Transaction Exposure
                        does not invent finer transaction counts; it combines that
                        wider activity signal with local Atlas conditions that vary
                        from hex to hex.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p><strong>Local Opportunity</strong> = equal-weight Development Pressure + Capacity Opportunity.</p>
                     <p><strong>Transaction Exposure</strong> = Transaction Pulse × Local Opportunity.</p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        It is not a 100 m transaction count, property valuation,
                        forecast or investment signal. Use Transaction Pulse to read
                        the observed market context and Transaction Exposure to see
                        where that context intersects with local urban conditions.
                    </p>`
                )
        },

        'Transaction Pulse':{
            title:'Transaction Pulse',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Transaction Pulse is a descriptive market analysis built
                        from Land Registry sale-and-purchase agreement activity.
                        It asks whether recent transaction activity is stronger or
                        weaker than the same source geography's recent norm, and
                        whether activity is rising or falling compared with a year ago.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        This layer is intentionally different from Market Exposure.
                        Transaction Pulse is based on observed registration activity;
                        Market Exposure combines wider price/rent momentum with local
                        Atlas conditions.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p>
                        <strong>Activity Level</strong> compares the latest three-month
                        average number of ASP building-unit transactions with the
                        median monthly count over the latest 24 months.
                    </p>
                    <p>
                        <strong>Activity Trend</strong> compares that recent three-month
                        average with the same three months one year earlier.
                    </p>
                    <p>
                        <strong>Transaction Pulse</strong> is the equal-weight mean of
                        the normalised Activity Level and Activity Trend signals.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Values inherit the geography published by the Land Registry;
                        they are not direct transaction counts for each 100 m hex.
                        Registration statistics can also lag the underlying transaction
                        date because instruments are lodged after execution.
                    </p>`
                )
        },

        'Market Exposure':{
            title:'Market Exposure',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Market Exposure is a combined market-and-urban indicator.
                        It asks where wider market movement overlaps with local
                        Development Pressure and Capacity Opportunity.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Market Momentum is regional, so many hexes share the same
                        market backdrop. The map becomes locally differentiated
                        when that backdrop meets different urban conditions.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>${fullCoverage('marketExposure')} currently have the local and regional inputs required for Market Exposure.</p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p>
                        <strong>Market Momentum</strong> combines normalised
                        12-month regional private-domestic price and rent trends.
                    </p>
                    <p>
                        <strong>Local Opportunity</strong> combines Development Pressure
                        with Capacity Opportunity.
                    </p>
                    <p>
                        <strong>Capacity Opportunity</strong> combines the share of
                        development capacity remaining with the absolute amount
                        of remaining GFA.
                    </p>
                    <p>
                        <strong>Market Exposure</strong> = Market Momentum ×
                        Local Opportunity.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Price, rent and momentum retain the geography of their
                        official source. Market Exposure is not a property
                        valuation, investment recommendation or forecast.
                    </p>
                    <p>
                        Market data is kept separate from the Development,
                        Renewal, Genesis and Signature models so it can be
                        compared with them rather than silently built into them.
                    </p>`
                )
        }
    };

    return panels[theme] || {
        title:theme,
        html:`<p>No additional information is available for this view.</p>`
    };
}

function getInfoPanel(key){

    if(key === 'about'){
        const total = atlasStats?.atlas?.totalHexes;
        const ugs = atlasStats?.ugs || {};

        return {
            title:'About the Atlas',
            html:
                infoSection(
                    'WHAT IS THE ATLAS?',
                    `<p>
                        The Urban Genetics Atlas is a map-first way to explore
                        how Hong Kong is built, connected and changing. It brings
                        different spatial datasets into a common 100 m reference
                        so patterns can be compared across the city.
                    </p>
                    <p>
                        Some layers show recorded physical conditions. Some
                        analyses derive patterns from those data. Renewal and
                        Genesis apply explicit assumptions to strategic questions,
                        while market data retains the geography of its official
                        source.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ THE DIFFERENT OUTPUTS',
                    `<div class="atlas-info-profile">
                        <div><strong>Urban Fabric</strong> shows physical, infrastructural and historical evidence.</div>
                        <div><strong>Urban Analysis</strong> reveals derived patterns and relationships.</div>
                        <div><strong>Urban Genetic Signature</strong> classifies recognisable combinations of urban characteristics.</div>
                        <div><strong>Renewal and Genesis</strong> are strategic lenses built from explicit assumptions.</div>
                        <div><strong>Market Data</strong> describes the wider property-market context and can be compared with local Atlas conditions.</div>
                    </div>`
                )
                +
                infoSection(
                    'DATA & COVERAGE',
                    `<p>
                        The working Atlas currently contains
                        <strong>${infoNumber(total)}</strong> 100 m cells.
                        <strong>${infoNumber(ugs.meaningfulUrbanCount)}</strong>
                        have meaningful urban planning context,
                        <strong>${infoNumber(ugs.constrainedCount)}</strong> are
                        treated as constrained / non-urban, and coverage of
                        individual datasets varies.
                    </p>
                    <p>
                        A blank value is not automatically treated as zero. Each
                        analysis keeps the distinction between a low value and
                        missing evidence wherever the source data allows it.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO USE IT',
                    `<p>
                        Compare places, switch between views and look for where
                        patterns agree or diverge. The Atlas is designed to help
                        frame questions and test ideas, not to make a precise
                        property-level determination.
                    </p>`
                )
        };
    }

    if(key === 'analysis'){
        const total = atlasStats?.atlas?.totalHexes;
        const ugs = atlasStats?.ugs || {};

        return {
            title:'Urban Analysis',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Urban Analysis brings selected datasets together to make
                        relationships easier to see. Some views describe existing
                        conditions; Development Pressure is diagnostic; Renewal
                        and Genesis apply explicit strategic assumptions.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        The same place can look very different from one analysis
                        to another. That difference is useful: each view asks a
                        different question rather than trying to produce one
                        universal score for the city.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        <strong>${infoNumber(total)}</strong> 100 m cells form
                        the working spatial set. Within it,
                        <strong>${infoNumber(ugs.meaningfulUrbanCount)}</strong>
                        cells have meaningful urban context. The status bar shows
                        coverage for the selected analysis.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Stronger colour means stronger expression of the selected
                        measure. It does not mean better, worse or more certain.
                        Missing data is treated separately from a genuine low or
                        zero value.
                    </p>`
                )
        };
    }

    if(key === 'fabric'){
        const height = atlasStats?.fabric || {};

        return {
            title:'Urban Fabric',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Urban Fabric shows the physical and historical evidence
                        that helps explain how the city took shape — terrain,
                        reclaimed land, buildings, heritage, rail and roads.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Hong Kong is not one continuous urban condition.
                        Topography, infrastructure, planning and history have
                        produced distinct urban pockets with different forms and
                        development histories.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        Mean building-height data is available for
                        <strong>${infoNumber(height.heightCoverageCount)}</strong>
                        cells (${infoPct(height.heightCoveragePct,1)} of the
                        working Atlas). Other Fabric layers have their own
                        coverage and source limits.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Fabric layers are evidence, not conclusions. Use them on
                        their own, or reduce their opacity and compare them with
                        the analytical layers above.
                    </p>`
                )
        };
    }

    if(key === 'market'){
        return {
            title:'Market Data',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Market Data adds official property-market context to the
                        map. Price and rent observations are reported at regional
                        geography, while some stock and vacancy measures are
                        reported by district.
                    </p>
                    <p>
                        Selecting a hex links that place to the relevant source
                        area; the Atlas does not invent a 100 m market price.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Compare Hong Kong Island, Kowloon and the New Territories
                        in the 12-month snapshot, then select a hex to see how the
                        same regional market backdrop meets different local urban
                        conditions.
                    </p>`
                )
                +
                infoSection(
                    'MARKET MOMENTUM',
                    `<p>
                        Market Momentum summarises the direction of 12-month
                        regional private-domestic price and rent movement.
                    </p>`
                )
                +
                infoSection(
                    'MARKET EXPOSURE',
                    `<p>
                        Market Exposure combines that wider momentum with a local
                        opportunity measure based on Development Pressure and
                        Capacity Opportunity.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Market observations retain the geography of their
                        official source. Market Exposure is not a property
                        valuation, investment recommendation or forecast.
                    </p>`
                )
        };
    }

    if(key === 'demographics'){
        return {
            title:'Demographics',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Demographics brings population and living-condition data
                        into the same spatial framework as the rest of the Atlas.
                        The current public views are Population Intensity and
                        Living Space.
                    </p>`
                )
                +
                infoSection(
                    'CURRENT STATUS',
                    `<p>
                        These two layers are existing Atlas estimates. Their data
                        foundations are being rebuilt using finer Census geography,
                        so they should currently be read as comparative spatial
                        estimates rather than exact 100 m population counts.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Demographics is an independent map domain. It can be shown
                        on its own or compared directly with Fabric, Market and
                        Urban Analysis using its own visibility and opacity controls.
                    </p>`
                )
        };
    }

    if(key === 'climate'){
        return {
            title:'Climate',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Climate is the developing environmental domain of the Atlas.
                        Initial work is focused on urban heat and flood / coastal
                        exposure, with further climate relationships to follow.
                    </p>`
                )
                +
                infoSection(
                    'CURRENT STATUS',
                    `<p>
                        The public Climate panel is present as a structural placeholder
                        while the first climate datasets and analyses are being prepared.
                    </p>`
                )
        };
    }

    if(key === 'demographics:Population per Building'){
        return {title:'Population Intensity',html:
            infoSection('WHAT IS THIS?',`<p>Population Intensity is the current Atlas estimate of the number of residents associated with residential fabric in each 100 m hex.</p>`)
            + infoSection('HOW IS IT CALCULATED?',`<p>The current public layer predates the new Demographics rebuild and distributes population spatially using the residential building context available to the Atlas. It is being replaced with a finer Census-geography method.</p>`)
            + infoSection('HOW TO READ IT',`<p>Use it for comparative spatial pattern rather than as an exact building- or hex-level headcount. Stronger colour means higher estimated population intensity.</p>`)};
    }
    if(key === 'demographics:GFA per Capita'){
        return {title:'Living Space',html:
            infoSection('WHAT IS THIS?',`<p>Living Space compares estimated residential floor area with the population currently allocated to each hex.</p>`)
            + infoSection('HOW IS IT CALCULATED?',`<p>The current measure is estimated residential floor area per resident. Because it depends on the existing population allocation, it will be recalculated as part of the new Demographics foundation.</p>`)
            + infoSection('HOW TO READ IT',`<p>It is a spatial comparison, not a direct measurement of dwelling size, net saleable area, crowding or housing quality.</p>`)};
    }
    if(key === 'fabric:GFA - Saturation'){
        return {title:'GFA Saturation',html:infoSection('WHAT IS THIS?',`<p>GFA Saturation estimates how much of a hex's modelled development capacity has already been realised.</p>`)+infoSection('HOW TO READ IT',`<p>Higher values mean more of the modelled capacity is already expressed. It is not a direct statement of development feasibility, ownership or permission to build.</p>`)};
    }
    if(key === 'fabric:Latent Urban Capacity'){
        return {title:'Latent Urban Capacity',html:infoSection('WHAT IS THIS?',`<p>Latent Urban Capacity estimates the share of modelled development capacity that remains unrealised.</p>`)+infoSection('HOW TO READ IT',`<p>Higher values indicate a larger remaining share of modelled capacity. They do not necessarily mean vacant land or an immediately developable site.</p>`)};
    }
    if(key === 'fabric:MTR - Index (Built)'){
        return {title:'MTR Built Accessibility',html:infoSection('WHAT IS THIS?',`<p>MTR Built Accessibility is a relative measure based on proximity and network connectivity to the existing MTR system.</p>`)+infoSection('HOW TO READ IT',`<p>It is not a direct measure of journey time, service frequency or passenger volume.</p>`)};
    }
    if(key === 'market:Market Momentum'){
        return {title:'Market Momentum',html:infoSection('WHAT IS THIS?',`<p>Market Momentum summarises the direction of 12-month regional private-domestic price and rent movement.</p>`)+infoSection('HOW IS IT CALCULATED?',`<p>Regional price trend and rent trend are each converted to a bounded 0–1 score and combined equally: <strong>50% price + 50% rent</strong>.</p>`)+infoSection('HOW TO READ IT',`<p>The result retains the geography of the official RVD source. It is regional market context, not a 100 m property value, valuation or forecast.</p>`)};
    }
    if(key === 'market:Market Exposure'){
        return {title:'Market Exposure',html:infoSection('WHAT IS THIS?',`<p>Market Exposure asks where wider Market Momentum overlaps with local Atlas opportunity conditions.</p>`)+infoSection('HOW IS IT CALCULATED?',`<p><strong>Local Opportunity</strong> combines Development Pressure and Capacity Opportunity equally. <strong>Market Exposure = Market Momentum × Local Opportunity.</strong></p>`)+infoSection('HOW TO READ IT',`<p>The market signal remains regional; local differentiation comes from Atlas conditions. It is not a valuation, investment recommendation or forecast.</p>`)};
    }
    if(key === 'market:Transaction Pulse'){
        return {title:'Transaction Pulse',html:infoSection('WHAT IS THIS?',`<p>Transaction Pulse describes whether recent registered building-unit transaction activity is stronger or weaker than its recent reference level.</p>`)+infoSection('HOW IS IT CALCULATED?',`<p><strong>Activity level</strong> compares the latest 3-month average with the median monthly count over the latest 24 months. <strong>Trend</strong> compares the latest 3 months with the same 3 months one year earlier. The two scores are combined equally.</p>`)+infoSection('HOW TO READ IT',`<p>The result retains the geography published by the Land Registry source. Registration can lag the underlying transaction date.</p>`)};
    }
    if(key === 'market:Transaction Exposure'){
        return {title:'Transaction Exposure',html:infoSection('WHAT IS THIS?',`<p>Transaction Exposure asks where Transaction Pulse overlaps with local urban opportunity.</p>`)+infoSection('HOW IS IT CALCULATED?',`<p><strong>Local Opportunity</strong> combines Development Pressure and Capacity Opportunity equally. <strong>Transaction Exposure = Transaction Pulse × Local Opportunity.</strong></p>`)+infoSection('HOW TO READ IT',`<p>The broad transaction signal is interpreted locally without inventing 100 m transaction counts.</p>`)};
    }

    if(key.startsWith('analysis:')){
        return analysisInfoPanel(
            key.slice('analysis:'.length)
        );
    }

    return {
        title:'Atlas information',
        html:`<p>No additional information is available.</p>`
    };
}

function positionInfoPopover(trigger){

    if(
        !atlasInfoPopover ||
        atlasInfoPopover.hidden ||
        !trigger
    ){
        return;
    }

    if(
        window.matchMedia('(max-width:720px)').matches
    ){
        atlasInfoPopover.style.left = '';
        atlasInfoPopover.style.top = '';
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const margin = 10;
    const gap = 8;

    atlasInfoPopover.style.left = '0px';
    atlasInfoPopover.style.top = '0px';

    const box = atlasInfoPopover.getBoundingClientRect();

    let left = rect.right - box.width;
    let top = rect.bottom + gap;

    left = Math.max(
        margin,
        Math.min(
            left,
            window.innerWidth - box.width - margin
        )
    );

    if(
        top + box.height >
        window.innerHeight - margin
    ){
        top = rect.top - box.height - gap;
    }

    top = Math.max(
        margin,
        Math.min(
            top,
            window.innerHeight - box.height - margin
        )
    );

    atlasInfoPopover.style.left = `${left}px`;
    atlasInfoPopover.style.top = `${top}px`;
}

function closeInfoPopover(){

    if(!atlasInfoPopover){
        return;
    }

    atlasInfoPopover.hidden = true;

    if(activeInfoTrigger){
        activeInfoTrigger.setAttribute(
            'aria-expanded',
            'false'
        );
    }

    activeInfoKey = null;
    activeInfoTrigger = null;
}

function openInfoPopover(key, trigger){

    if(
        !atlasInfoPopover ||
        !atlasInfoTitle ||
        !atlasInfoBody
    ){
        return;
    }

    if(
        activeInfoKey === key &&
        !atlasInfoPopover.hidden
    ){
        closeInfoPopover();
        return;
    }

    if(activeInfoTrigger){
        activeInfoTrigger.setAttribute(
            'aria-expanded',
            'false'
        );
    }

    const panel = getInfoPanel(key);

    atlasInfoTitle.textContent =
        panel.title;

    atlasInfoBody.innerHTML =
        panel.html;

    atlasInfoPopover.hidden =
        false;

    activeInfoKey =
        key;

    activeInfoTrigger =
        trigger;

    trigger?.setAttribute(
        'aria-expanded',
        'true'
    );

    requestAnimationFrame(
        () => positionInfoPopover(trigger)
    );
}

function refreshOpenInfoPopover(){

    if(
        !activeInfoKey ||
        atlasInfoPopover?.hidden
    ){
        return;
    }

    const panel =
        getInfoPanel(activeInfoKey);

    atlasInfoTitle.textContent =
        panel.title;

    atlasInfoBody.innerHTML =
        panel.html;

    requestAnimationFrame(
        () => positionInfoPopover(activeInfoTrigger)
    );
}

window.UGARefreshOpenInfoPanel =
    refreshOpenInfoPopover;

document.addEventListener(
    'click',
    event => {

        const trigger =
            event.target.closest(
                '.info-trigger'
            );

        if(trigger){

            event.preventDefault();
            event.stopPropagation();

            openInfoPopover(
                trigger.dataset.infoKey,
                trigger
            );

            return;
        }

        if(
            !atlasInfoPopover?.hidden &&
            !atlasInfoPopover.contains(event.target)
        ){
            closeInfoPopover();
        }

    }
);

atlasInfoClose?.addEventListener(
    'click',
    closeInfoPopover
);

document.addEventListener(
    'keydown',
    event => {

        if(
            event.key === 'Escape' &&
            !atlasInfoPopover?.hidden
        ){
            closeInfoPopover();
        }

    }
);

window.addEventListener(
    'resize',
    () => {

        if(
            !atlasInfoPopover?.hidden
        ){
            positionInfoPopover(
                activeInfoTrigger
            );
        }

    }
);

function updateLegendInfoButton(){

    if(!legendInfoButton){
        return;
    }

    const theme =
        themeSelect.value;

    const title =
        LEGENDS[theme]?.title || theme;

    legendInfoButton.dataset.infoKey =
        `analysis:${theme}`;

    legendInfoButton.setAttribute(
        'aria-label',
        `About ${title}`
    );

    legendInfoButton.title =
        `About ${title}`;

    if(
        activeInfoTrigger === legendInfoButton &&
        !atlasInfoPopover?.hidden
    ){
        activeInfoKey =
            `analysis:${theme}`;

        refreshOpenInfoPopover();
    }
}

function updateEditorialStatsUI(){

    if(buildingHeightCoverageStat){

        const height =
            atlasStats?.fabric;

        if(
            height &&
            Number.isFinite(
                Number(
                    height.heightCoverageCount
                )
            )
        ){

            buildingHeightCoverageStat.textContent =
                `Height data: ${
                    Number(
                        height.heightCoverageCount
                    ).toLocaleString()
                } / ${
                    Number(
                        atlasStats.atlas.totalHexes
                    ).toLocaleString()
                } cells (${
                    Number(
                        height.heightCoveragePct
                    ).toFixed(1)
                }%)`;

        } else {

            buildingHeightCoverageStat.textContent =
                'Height coverage unavailable';

        }

    }

}

async function loadAtlasStats(){

    try{

        const response =
            await fetch(
                ATLAS_STATS_URL,
                {
                    cache:'no-store'
                }
            );

        if(!response.ok){
            throw new Error(
                `${response.status} ${response.statusText}`
            );
        }

        atlasStats =
            await response.json();

        updateEditorialStatsUI();
        updateStatus();
        refreshOpenInfoPopover();

    } catch(error){

        console.warn(
            'Atlas statistics unavailable:',
            error
        );

        updateStatus();

    }

}

loadAtlasStats();


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

    // V1.4: the master visibility switch controls the map layers only.
    // It must not collapse the panel or hide its controls; users may wish
    // to switch the current fabric off, adjust another layer, then restore it.
    fabricBody.style.display = '';

}

// -----------------------------------------------------
// Road layer groups
//
// Uses the existing Carto basemap layers already present
// in the Atlas. No new road dataset is required.
// Secondary controls secondary, minor and service roads.
// -----------------------------------------------------

const ROAD_LAYER_GROUPS = {

    highway: [
        'road_mot_fill_ramp',
        'road_mot_case_ramp',
        'road_mot_fill_noramp',
        'road_mot_case_noramp'
    ],

    main: [
        'road_trunk_fill_ramp',
        'road_trunk_case_ramp',
        'road_trunk_fill_noramp',
        'road_trunk_case_noramp',
        'road_pri_fill_ramp',
        'road_pri_case_ramp',
        'road_pri_fill_noramp',
        'road_pri_case_noramp'
    ],

    secondary: [
        'road_sec_fill_noramp',
        'road_sec_case_noramp',
        'road_minor_fill',
        'road_minor_case',
        'road_service_fill',
        'road_service_case'
    ]

};

function updateRoadVisibility(){

    const visible =
        fabricToggle.checked &&
        roadsToggle.checked;

    ROAD_LAYER_GROUPS.highway.forEach(
        layerId => {

            setLayerVisibility(
                layerId,
                visible &&
                roadHighwayToggle.checked
            );

        }
    );

    ROAD_LAYER_GROUPS.main.forEach(
        layerId => {

            setLayerVisibility(
                layerId,
                visible &&
                roadMainToggle.checked
            );

        }
    );

    ROAD_LAYER_GROUPS.secondary.forEach(
        layerId => {

            setLayerVisibility(
                layerId,
                visible &&
                roadSecondaryToggle.checked
            );

        }
    );

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
        },

        {
            layer:'buildingHeight',
            toggle:buildingHeightToggle
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

    updateRoadVisibility();

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

collapseFabricModule(
    terrainModule,
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
            'High-intensity urban fabric with a strong change signal.'
    },

    EC:{
        name:'EMERGING CHANGE',
        colour:'#D89A43',
        description:
            'Lower-intensity urban fabric with a strong change signal.'
    },

    AT:{
        name:'AGEING TRANSITION',
        colour:'#A95F68',
        description:
            'Older building fabric with a strong change signal.'
    },

    VM:{
        name:'VERTICAL MATURE',
        colour:'#786AA0',
        description:
            'High-intensity, taller urban fabric without a high change signal.'
    },

    LF:{
        name:'LEGACY FABRIC',
        colour:'#8F7862',
        description:
            'Older established fabric without a high change signal.'
    },

    CF:{
        name:'CONNECTED FABRIC',
        colour:'#518882',
        description:
            'Highly connected urban fabric without a high change signal.'
    },

    SF:{
        name:'STABLE FABRIC',
        colour:'#7D8790',
        description:
            'Meaningful urban fabric without another Signature-defining combination.'
    },

    C:{
        name:'CONSTRAINED',
        colour:'#A8ADB2',
        description:
            'A constrained or non-urban planning context, read separately from the urban Signatures.'
    },

    U:{
        name:'UNASSESSED',
        colour:'#D0D3D7',
        description:
            'Not enough analytical context is available to assign a Signature.'
    }

};

// -----------------------------------------------------
// Active UGS signature classes
// -----------------------------------------------------

const activeUgsSignatureCodes =
    new Set(
        Object.keys(
            UGS_SIGNATURES
        )
    );

// -----------------------------------------------------
// Analysis Legend Definitions
// Atlas Analytical Colour Standard v1: continuous analytical layers use
// neutral low/mid values with semantic colour emerging in the upper range.
// -----------------------------------------------------

const LEGENDS = {

    'Development Pressure': {

        title: 'Development Pressure',

        description:
            'Shows where the conditions associated with development pressure combine more or less strongly.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#C6C6C0,#F1E299,#E8B748,#DE8030,#C23F2F,#701F21)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Fewer pressure conditions coincide.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — A moderate combination of pressure conditions.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — More pressure conditions coincide strongly.
            </div>
        `
    },


    'GFA - Saturation': {

        title: 'GFA Saturation',

        description:
            'Shows how much of the estimated development capacity is already realised in each hex.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#D0D2D1,#C3C8CB,#BDD7EA,#5795C9,#344985)',

        interpretation: `
            <div class='legend-item'>
                <strong>0.00</strong>
                — Very little of the estimated capacity is realised.
            </div>

            <div class='legend-item'>
                <strong>0.25</strong>
                — More capacity remains than has been realised.
            </div>

            <div class='legend-item'>
                <strong>0.50</strong>
                — Around half of the estimated capacity is realised.
            </div>

            <div class='legend-item'>
                <strong>0.75</strong>
                — Most of the estimated capacity is realised.
            </div>

            <div class='legend-item'>
                <strong>1.00</strong>
                — Estimated capacity is largely realised.
            </div>
        `
    },


    'MTR - Index (Built)': {

        title: 'MTR Built Accessibility',

        description:
            'Shows relative accessibility to the existing MTR network.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#D2D6D4,#C9E3E1,#73C7C7,#249B9B,#006D70,#004C4C)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Lower MTR accessibility in this index.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — Moderate MTR accessibility.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Higher MTR accessibility.
            </div>
        `
    },


    'Renewal Potential': {

        title: 'Renewal Potential',

        description:
            'A strategic model showing where selected renewal conditions combine more strongly.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#C9C6BB,#E2D396,#CDA44B,#BE6E40,#9D3F3C,#5C252F)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Fewer renewal conditions coincide.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — A moderate combination of renewal conditions.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Renewal conditions coincide more strongly.
            </div>
        `
    },


    'Genesis Potential': {

        title: 'Genesis Potential',

        description:
            'A strategic model showing where capacity and catalytic conditions combine more strongly.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#C9CEC8,#B4DAB8,#60B280,#26937B,#087071,#00484C)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Fewer Genesis conditions coincide.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — A moderate combination of Genesis conditions.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Genesis conditions coincide more strongly.
            </div>
        `
    },


    'GFA per Capita': {

        title: 'Living Space (m² per resident)',

        description:
            'Estimated residential floor area per resident within each hex.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#CED2CE,#C3DCC8,#81C596,#3E9B65,#176B45,#0A472F)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Lower estimated floor area per resident.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — Mid-range estimated floor area per resident.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Higher estimated floor area per resident.
            </div>
        `
    },


    'Population per Building': {

        title: 'Population Intensity',

        description:
            'Estimated number of residents associated with buildings within each hex.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#D2CCCC,#E5C4C8,#D98B92,#C84F58,#983642,#5F202C)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Lower estimated residential concentration.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — Moderate estimated residential concentration.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Higher estimated residential concentration.
            </div>
        `
    },


    'Latent Urban Capacity': {

        title: 'Latent Urban Capacity',

        description:
            'Shows how much of the estimated development capacity remains unrealised.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#D2CED8,#D6CCE8,#A98CCC,#7655B6,#513083,#2D174F)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Little estimated capacity remains.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — A moderate share of estimated capacity remains.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — A larger share of estimated capacity remains.
            </div>
        `
    },

    'Transaction Exposure': {

        title: 'Transaction Exposure',

        description:
            'Shows where stronger transaction activity overlaps with stronger local Development Pressure and Capacity Opportunity.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#D8D3DE,#CEC6E4,#AA9AD0,#806BB6,#5B478F,#382D63)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Limited overlap between transaction activity and local opportunity conditions.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — Transaction activity overlaps with meaningful local pressure or capacity opportunity.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Stronger transaction activity coincides with stronger local opportunity conditions.
            </div>
        `
    },

    'Transaction Pulse': {

        title: 'Transaction Pulse',

        description:
            'Shows whether recent Land Registry building-unit transaction activity is strong or soft relative to its recent norm, while also considering its 12-month direction.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#DED2D2,#E1BFC0,#D98F94,#C96473,#99485F,#5F2C46)',

        interpretation: `
            <div class='legend-item'>
                <strong>Softer</strong>
                — Recent transaction activity is below its recent norm and/or falling.
            </div>

            <div class='legend-item'>
                <strong>Typical</strong>
                — Activity is close to the recent range for that source geography.
            </div>

            <div class='legend-item'>
                <strong>Stronger</strong>
                — Recent activity is elevated and/or rising compared with a year ago.
            </div>
        `
    },

    'Market Exposure': {

        title: 'Market Exposure',

        description:
            'Shows where regional market momentum overlaps with local Development Pressure and Capacity Opportunity.',

        gradient:
            'linear-gradient(90deg,#E0E1DE,#CBD2D3,#B7E0E3,#62C0CF,#348DC4,#3156A4,#172B62)',

        interpretation: `
            <div class='legend-item'>
                <strong>Lower</strong>
                — Limited overlap between market movement and local opportunity conditions.
            </div>

            <div class='legend-item'>
                <strong>Mid-range</strong>
                — Market movement overlaps with meaningful local pressure or capacity opportunity.
            </div>

            <div class='legend-item'>
                <strong>Higher</strong>
                — Stronger market movement coincides with stronger local opportunity conditions.
            </div>

            <div class='legend-item'>
                <strong>Unassessed</strong>
                — Local pressure or capacity evidence is insufficient for this measure.
            </div>
        `
    },

    'Urban Genetic Signature': {

    title:'Urban Genetic Signature',

    description:
        'A Signature brings several characteristics together to describe what kind of urban place this is. It is a classification, not an overall score or redevelopment forecast.',

    categorical:true,

    interpretation:''
},

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

    updateLegendInfoButton();


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


        if(
            theme ===
            'Urban Genetic Signature'
        ){

            legendInterpretation.innerHTML = `

                <div class="ugs-legend-list">

                    ${
                        Object.entries(
                            UGS_SIGNATURES
                        )
                        .map(
                            ([code,item]) => `

                                <label
                                    class="ugs-legend-item
                                    ${
                                        activeUgsSignatureCodes.has(code)
                                            ? 'active'
                                            : 'inactive'
                                    }"
                                >

                                    <input
                                        type="checkbox"
                                        class="ugs-legend-check"
                                        data-ugs-code="${code}"
                                        ${
                                            activeUgsSignatureCodes.has(code)
                                                ? 'checked'
                                                : ''
                                        }
                                        style="
                                            accent-color:${item.colour};
                                        "
                                    >

                                    <span
                                        class="ugs-legend-swatch"
                                        style="
                                            background:${item.colour};
                                        "
                                    ></span>

                                    <span class="ugs-legend-name">
                                        ${item.name}
                                    </span>

                                </label>

                            `
                        )
                        .join('')
                    }

                </div>

            `;


            // -------------------------------------------------
            // UGS class toggles
            // -------------------------------------------------

            legendInterpretation
                .querySelectorAll(
                    '.ugs-legend-check'
                )
                .forEach(
                    checkbox => {

                        checkbox.addEventListener(
                            'change',
                            () => {

                                const code =
                                    checkbox.dataset.ugsCode;


                                if(checkbox.checked){

                                    activeUgsSignatureCodes.add(
                                        code
                                    );

                                } else {

                                    activeUgsSignatureCodes.delete(
                                        code
                                    );

                                }


                                const item =
                                    checkbox.closest(
                                        '.ugs-legend-item'
                                    );


                                if(item){

                                    item.classList.toggle(
                                        'active',
                                        checkbox.checked
                                    );

                                    item.classList.toggle(
                                        'inactive',
                                        !checkbox.checked
                                    );

                                }


                                applyUgsSignatureFilter();

                            }
                        );

                    }
                );

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


    if(
    theme !==
    'Urban Genetic Signature'
    ){

        legendInterpretation.innerHTML =
            cfg.interpretation;

    }

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
                'UGS_v02_Code'
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
// Development Pressure v2
// -----------------------------------------------------

    if(theme === 'Development Pressure'){

        const field = 'Development Pressure v2';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0000, 'rgba(224,225,222,0.16)',
                0.0774, 'rgba(214,215,211,0.22)',
                0.2857, 'rgba(198,198,192,0.30)',
                0.4541, 'rgba(241,226,153,0.44)',
                0.5812, 'rgba(232,183,72,0.60)',
                0.6689, 'rgba(222,128,48,0.72)',
                0.7596, 'rgba(194,63,47,0.82)',
                0.9261, 'rgba(112,31,33,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// GFA Saturation
// -----------------------------------------------------// -----------------------------------------------------
// GFA Saturation — distribution-aware raw scale
// -----------------------------------------------------

    if(theme === 'GFA - Saturation'){

        const field = 'GFA - Saturation';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0000, 'rgba(224,225,222,0.16)',
                0.0114, 'rgba(212,214,213,0.22)',
                0.0995, 'rgba(195,200,203,0.30)',
                0.3829, 'rgba(189,215,234,0.44)',
                0.8126, 'rgba(87,149,201,0.65)',
                1.0000, 'rgba(52,73,133,0.86)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// MTR Built
// -----------------------------------------------------// -----------------------------------------------------
// MTR Built — positive-value distribution-aware scale
// -----------------------------------------------------

    if(theme === 'MTR - Index (Built)'){

        const field = 'MTR - Index (Built)';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0000, 'rgba(224,225,222,0.16)',
                0.0407, 'rgba(215,217,215,0.22)',
                0.1473, 'rgba(201,211,210,0.30)',
                0.4153, 'rgba(201,227,225,0.42)',
                0.8568, 'rgba(115,199,199,0.56)',
                1.5914, 'rgba(36,155,155,0.68)',
                2.2277, 'rgba(0,109,112,0.76)',
                4.0961, 'rgba(0,82,85,0.85)',
                6.1761, 'rgba(0,76,76,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// GFA per Capita
// -----------------------------------------------------// -----------------------------------------------------
// GFA per Capita — distribution-aware raw scale
// -----------------------------------------------------

    if(theme === 'GFA per Capita'){

        const field = 'GFA per Capita';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0,   'rgba(224,225,222,0.16)',
                15,  'rgba(211,213,209,0.23)',
                19,  'rgba(201,207,202,0.30)',
                29,  'rgba(195,220,200,0.44)',
                46,  'rgba(129,197,150,0.60)',
                70,  'rgba(62,155,101,0.72)',
                134, 'rgba(23,107,69,0.82)',
                224, 'rgba(10,71,47,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// Population per Building
// -----------------------------------------------------// -----------------------------------------------------
// Population per Building — distribution-aware raw scale
// -----------------------------------------------------

    if(theme === 'Population per Building'){

        const field = 'Population per Building';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0,     'rgba(224,225,222,0.16)',
                14.57,   'rgba(214,211,211,0.23)',
                62.06,   'rgba(210,204,204,0.30)',
                371.11,  'rgba(229,196,200,0.44)',
                1095.23, 'rgba(217,139,146,0.60)',
                1620.72, 'rgba(200,79,88,0.72)',
                2732.39, 'rgba(152,54,66,0.82)',
                6555.0,  'rgba(95,32,44,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// Renewal Potential// -----------------------------------------------------
// Renewal Potential v2 — grey → yellow → red
// -----------------------------------------------------

    if(theme === 'Renewal Potential'){

        const field = 'Renewal Potential v2';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0516, 'rgba(224,225,222,0.16)',
                0.2553, 'rgba(215,213,207,0.23)',
                0.3555, 'rgba(201,198,187,0.30)',
                0.4924, 'rgba(226,211,150,0.44)',
                0.6102, 'rgba(205,164,75,0.60)',
                0.6813, 'rgba(190,110,64,0.72)',
                0.7946, 'rgba(157,63,60,0.82)',
                0.9849, 'rgba(92,37,47,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// Genesis Potential
// -----------------------------------------------------// -----------------------------------------------------
// Genesis Potential v2 — green → purple
// -----------------------------------------------------

    if(theme === 'Genesis Potential'){

        const field = 'Genesis Potential v2';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.0333, 'rgba(224,225,222,0.16)',
                0.2814, 'rgba(213,216,212,0.23)',
                0.3851, 'rgba(201,206,200,0.30)',
                0.4571, 'rgba(180,218,184,0.44)',
                0.5371, 'rgba(96,178,128,0.60)',
                0.6019, 'rgba(38,147,123,0.72)',
                0.6753, 'rgba(8,112,113,0.82)',
                0.9331, 'rgba(0,72,76,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// Latent Urban Capacity
// -----------------------------------------------------// -----------------------------------------------------
// Latent Urban Capacity — high-end distribution-aware scale
// -----------------------------------------------------

    if(theme === 'Latent Urban Capacity'){

        const field = 'Latent Urban Capacity';

        return [
            'case',
            [
                'all',
                ['has',field],
                ['!=',['get',field],null]
            ],
            [
                'interpolate',
                ['linear'],
                ['to-number',['get',field]],

                0.000000, 'rgba(224,225,222,0.16)',
                0.617141, 'rgba(214,212,218,0.23)',
                0.900506, 'rgba(205,199,213,0.30)',
                0.988587, 'rgba(214,204,232,0.44)',
                0.999251, 'rgba(169,140,204,0.60)',
                0.999783, 'rgba(118,85,182,0.72)',
                0.999968, 'rgba(81,48,131,0.82)',
                1.000000, 'rgba(45,23,79,0.90)'
            ],
            'rgba(0,0,0,0)'
        ];

    }

// -----------------------------------------------------
// Transaction Exposure — Transaction Pulse × Local Opportunity
// -----------------------------------------------------

    if(theme === 'Transaction Exposure'){

        const activity =
            window.UGA_MARKET_ANALYTICS?.transaction_activity || null;

        const hadScores = activity?.had_scores || {};
        const matchParts = [];

        for(const [hadName,rawScore] of Object.entries(hadScores)){
            const score = Number(rawScore);
            if(Number.isFinite(score)) matchParts.push(hadName,score);
        }

        if(matchParts.length === 0){
            return 'rgba(255,255,255,0.00)';
        }

        const pulseExpression = [
            'match', ['get','HAD_EN'], ...matchParts, -1
        ];

        const pressureComponent = [
            'max',0,['min',1,['to-number',['get','Development Pressure v2'],0]]
        ];
        const capacityComponent = [
            'max',0,['min',1,['to-number',['get','Analysis_v2_Capacity_Opportunity'],0]]
        ];
        const localOpportunity = ['/', ['+',pressureComponent,capacityComponent], 2];
        const txExposure = ['*',pulseExpression,localOpportunity];

        const assessable = [
            'all',
            ['has','Development Pressure v2'],
            ['has','Analysis_v2_Capacity_Opportunity'],
            ['!=',['get','Development Pressure v2'],null],
            ['!=',['get','Analysis_v2_Capacity_Opportunity'],null],
            ['>=',pulseExpression,0]
        ];

        const d = activity?.transaction_exposure?.distribution || {};
        const fallback = [0.00,0.15,0.25,0.35,0.45,0.55,0.70,0.85];
        const raw = [d.min,d.p25,d.p50,d.p75,d.p90,d.p95,d.p99,d.max]
            .map((v,i)=>Number.isFinite(Number(v)) ? Number(v) : fallback[i]);
        const stops = [...raw];
        // Guarantee strictly increasing interpolation stops without changing
        // the underlying score. This only protects very flat test distributions.
        for(let i=1;i<stops.length;i++){
            if(stops[i] <= stops[i-1]) stops[i] = Math.min(1,stops[i-1] + 0.000001);
        }

        return [
            'case', assessable,
            [
                'interpolate',['linear'],txExposure,
                stops[0], 'rgba(224,225,222,0.16)',
                stops[1], 'rgba(216,211,222,0.22)',
                stops[2], 'rgba(206,198,228,0.30)',
                stops[3], 'rgba(170,154,208,0.44)',
                stops[4], 'rgba(128,107,182,0.60)',
                stops[5], 'rgba(91,71,143,0.72)',
                stops[6], 'rgba(56,45,99,0.82)',
                stops[7], 'rgba(35,29,66,0.90)'
            ],
            'rgba(255,255,255,0.00)'
        ];
    }

// -----------------------------------------------------
// Transaction Pulse
// -----------------------------------------------------

    if(theme === 'Transaction Pulse'){

        const activity =
            window.UGA_MARKET_ANALYTICS?.transaction_activity || null;

        const hadScores =
            activity?.had_scores || {};

        const matchParts = [];

        for(const [hadName,rawScore] of Object.entries(hadScores)){

            const score = Number(rawScore);

            if(Number.isFinite(score)){
                matchParts.push(hadName,score);
            }

        }

        if(matchParts.length === 0){
            return 'rgba(255,255,255,0.00)';
        }

        const pulseExpression = [
            'match',
            ['get','HAD_EN'],
            ...matchParts,
            -1
        ];

        return [
            'case',
            ['>=',pulseExpression,0],
            [
                'interpolate',
                ['linear'],
                pulseExpression,

                0.00, 'rgba(224,225,222,0.16)',
                0.25, 'rgba(222,210,210,0.23)',
                0.40, 'rgba(225,191,192,0.30)',
                0.50, 'rgba(217,143,148,0.44)',
                0.60, 'rgba(201,100,115,0.60)',
                0.75, 'rgba(153,72,95,0.74)',
                0.90, 'rgba(95,44,70,0.86)',
                1.00, 'rgba(61,29,48,0.92)'
            ],
            'rgba(255,255,255,0.00)'
        ];

    }

// -----------------------------------------------------
// Market Exposure
// -----------------------------------------------------// -----------------------------------------------------
// Market Exposure
// -----------------------------------------------------

    if(theme === 'Market Exposure'){

        const analytics =
            window.UGA_MARKET_ANALYTICS?.regions || {};

        const marketMomentum = region => {

            const value =
                Number(
                    analytics?.[region]
                        ?.market_momentum
                );

            return Number.isFinite(value)
                ? value
                : -1;

        };

        const hongKongMomentum =
            marketMomentum('Hong Kong');

        const kowloonMomentum =
            marketMomentum('Kowloon');

        const newTerritoriesMomentum =
            marketMomentum('New Territories');

        const hongKongDistricts = [
            'Central and Western District',
            'Eastern District',
            'Southern District',
            'Wan Chai District'
        ];

        const kowloonDistricts = [
            'Kowloon City District',
            'Kwun Tong District',
            'Sham Shui Po District',
            'Wong Tai Sin District',
            'Yau Tsim Mong District'
        ];

        const regionMomentumExpression = [
            'case',

            [
                'in',
                ['get','HAD_EN'],
                ['literal',hongKongDistricts]
            ],
            hongKongMomentum,

            [
                'in',
                ['get','HAD_EN'],
                ['literal',kowloonDistricts]
            ],
            kowloonMomentum,

            [
                'all',
                ['has','HAD_EN'],
                ['!=',['get','HAD_EN'],null],
                ['!=',['get','HAD_EN'],'']
            ],
            newTerritoriesMomentum,

            -1
        ];

        // Market Exposure v2 uses the rebuilt local analysis.
        // Development Pressure v2 and Capacity Opportunity are both 0–1.
        // Capacity Opportunity combines proportional latent capacity with
        // the ranked absolute amount of remaining GFA.

        const pressureComponent = [
            'max',
            0,
            [
                'min',
                1,
                [
                    'to-number',
                    ['get','Development Pressure v2'],
                    0
                ]
            ]
        ];

        const capacityComponent = [
            'max',
            0,
            [
                'min',
                1,
                [
                    'to-number',
                    ['get','Analysis_v2_Capacity_Opportunity'],
                    0
                ]
            ]
        ];

        const localOpportunity = [
            '/',
            [
                '+',
                pressureComponent,
                capacityComponent
            ],
            2
        ];

        const exposure = [
            '*',
            regionMomentumExpression,
            localOpportunity
        ];

        const assessable = [
            'all',
            ['has','Development Pressure v2'],
            ['has','Analysis_v2_Capacity_Opportunity'],
            ['!=',['get','Development Pressure v2'],null],
            ['!=',['get','Analysis_v2_Capacity_Opportunity'],null],
            ['>=',regionMomentumExpression,0]
        ];

        return [
            'case',
            assessable,
            [
                'interpolate',
                ['linear'],
                exposure,

                0.000000,
                'rgba(224,225,222,0.16)',

                0.206466,
                'rgba(214,216,216,0.22)',

                0.363558,
                'rgba(205,210,211,0.30)',

                0.465686,
                'rgba(183,224,227,0.44)',

                0.540181,
                'rgba(98,192,207,0.60)',

                0.578715,
                'rgba(52,141,196,0.72)',

                0.663285,
                'rgba(49,86,164,0.82)',

                0.746058,
                'rgba(23,43,98,0.90)'
            ],
            'rgba(255,255,255,0.00)'
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
// GROUP OPACITY CONTROLS
// =====================================================

let analysisOpacityFactor =
    analysisOpacity
        ? Number(analysisOpacity.value) / 100
        : 1;

let fabricOpacityFactor =
    fabricOpacity
        ? Number(fabricOpacity.value) / 100
        : 1;

function analysisFillOpacityExpression(){

    // MapLibre requires a zoom expression to be the input of a
    // top-level step/interpolate expression. Multiplying an entire
    // zoom expression (['*', factor, ['interpolate', ..., ['zoom']]])
    // is rejected by the style validator. Apply the user opacity
    // multiplier to each zoom stop instead.

    return [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,  0.55 * analysisOpacityFactor,
        12, 0.78 * analysisOpacityFactor,
        15, 0.90 * analysisOpacityFactor
    ];
}

function updateAnalysisOpacity(){

    if(analysisOpacityValue){
        analysisOpacityValue.textContent =
            `${Math.round(analysisOpacityFactor * 100)}%`;
    }

    if(map.getLayer('atlas')){
        map.setPaintProperty(
            'atlas',
            'fill-opacity',
            analysisFillOpacityExpression()
        );
    }
}

const FABRIC_OPACITY_LAYERS = [
    ['reclaimed', 'fill-opacity', 0.65],
    ['reclaimed-outline', 'line-opacity', 1.00],
    ['buildingAge', 'circle-opacity', 0.65],
    ['buildingAge', 'circle-stroke-opacity', 1.00],
    ['heritage', 'circle-opacity', 0.85],
    ['heritage', 'circle-stroke-opacity', 1.00],
    ['buildingHeight', 'fill-opacity', 0.80],
    ['mtr', 'line-opacity', 0.75]
];

function updateFabricOpacity(){

    if(fabricOpacityValue){
        fabricOpacityValue.textContent =
            `${Math.round(fabricOpacityFactor * 100)}%`;
    }

    FABRIC_OPACITY_LAYERS.forEach(
        ([layerId, property, baseOpacity]) => {
            if(map.getLayer(layerId)){
                map.setPaintProperty(
                    layerId,
                    property,
                    baseOpacity * fabricOpacityFactor
                );
            }
        }
    );

    Object.values(ROAD_LAYER_GROUPS)
        .flat()
        .forEach(layerId => {
            if(map.getLayer(layerId)){
                map.setPaintProperty(
                    layerId,
                    'line-opacity',
                    fabricOpacityFactor
                );
            }
        });
}

if(analysisOpacity){
    analysisOpacity.addEventListener(
        'input',
        () => {
            analysisOpacityFactor =
                Number(analysisOpacity.value) / 100;
            updateAnalysisOpacity();
        }
    );
}

if(fabricOpacity){
    fabricOpacity.addEventListener(
        'input',
        () => {
            fabricOpacityFactor =
                Number(fabricOpacity.value) / 100;
            updateFabricOpacity();
        }
    );
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


    // V1.4: keep the panel controls available even while the analysis map
    // layer is hidden. Visibility is a map state, not a panel state.
    if(analysisSelectorControl){
        analysisSelectorControl.style.display = '';
    }

    if(analysisControls){
        analysisControls.style.display =
            planningContextApplies()
                ? 'flex'
                : 'none';
    }

    if(analysisLegend){
        analysisLegend.style.display = 'block';
    }

}


// -----------------------------------------------------
// Analysis master toggle
// -----------------------------------------------------

analysisToggle.addEventListener(
    'change',
    () => {

        // V1.4: master visibility changes the map only. The Analysis panel
        // remains exactly as the user left it; only the panel icon minimises it.
        updateAnalysisVisibility();

    }
);


// =====================================================
// MARKET CONTEXT OVERLAY
// =====================================================
// V1.3 adds Transaction Exposure to the secondary Market overlay and
// gives each market signal a deliberately distinct colour family.

function marketContextMomentumExpression(){
    const analytics = window.UGA_MARKET_ANALYTICS?.regions || {};
    const value = key => {
        const n=Number(analytics?.[key]?.market_momentum);
        return Number.isFinite(n) ? n : -1;
    };
    const hk=['Central and Western District','Eastern District','Southern District','Wan Chai District'];
    const kln=['Kowloon City District','Kwun Tong District','Sham Shui Po District','Wong Tai Sin District','Yau Tsim Mong District'];
    return ['case',
        ['in',['get','HAD_EN'],['literal',hk]], value('Hong Kong'),
        ['in',['get','HAD_EN'],['literal',kln]], value('Kowloon'),
        ['all',['has','HAD_EN'],['!=',['get','HAD_EN'],null],['!=',['get','HAD_EN'],'']], value('New Territories'),
        -1
    ];
}

function marketContextPulseExpression(){
    const scores=window.UGA_MARKET_ANALYTICS?.transaction_activity?.had_scores || {};
    const parts=[];
    for(const [name,raw] of Object.entries(scores)){
        const n=Number(raw); if(Number.isFinite(n)) parts.push(name,n);
    }
    return parts.length ? ['match',['get','HAD_EN'],...parts,-1] : -1;
}

function marketContextExposureExpression(){
    const momentum=marketContextMomentumExpression();
    const pressure=[
        'max',0,['min',1,['to-number',['get','Development Pressure v2'],0]]
    ];
    const capacity=[
        'max',0,['min',1,['to-number',['get','Analysis_v2_Capacity_Opportunity'],0]]
    ];
    const localOpportunity=['/', ['+',pressure,capacity], 2];
    const exposure=['*',momentum,localOpportunity];
    const assessable=[
        'all',
        ['has','Development Pressure v2'],
        ['has','Analysis_v2_Capacity_Opportunity'],
        ['!=',['get','Development Pressure v2'],null],
        ['!=',['get','Analysis_v2_Capacity_Opportunity'],null],
        ['>=',momentum,0]
    ];
    return {exposure,assessable};
}


function marketContextTransactionExposureExpression(){
    const pulse=marketContextPulseExpression();
    const pressure=[
        'max',0,['min',1,['to-number',['get','Development Pressure v2'],0]]
    ];
    const capacity=[
        'max',0,['min',1,['to-number',['get','Analysis_v2_Capacity_Opportunity'],0]]
    ];
    const localOpportunity=['/', ['+',pressure,capacity], 2];
    const exposure=['*',pulse,localOpportunity];
    const assessable=[
        'all',
        ['has','Development Pressure v2'],
        ['has','Analysis_v2_Capacity_Opportunity'],
        ['!=',['get','Development Pressure v2'],null],
        ['!=',['get','Analysis_v2_Capacity_Opportunity'],null],
        ['>=',pulse,0]
    ];
    return {exposure,assessable};
}

function marketContextColourExpression(){
    const mode=marketContextOverlay?.value || 'Off';

    // Market Momentum — warm amber/orange: broad market direction.
    if(mode==='Market Momentum'){
        const x=marketContextMomentumExpression();
        return ['case',['>=',x,0],['interpolate',['linear'],x,
            0.00,'#E0E1DE',0.35,'#DDD7C8',0.50,'#E5D49A',0.65,'#E2B45D',0.80,'#D48739',1.00,'#713820'
        ],'rgba(255,255,255,0)'];
    }

    // Market Exposure — aqua/blue/navy: market movement × local opportunity.
    if(mode==='Market Exposure'){
        const {exposure,assessable}=marketContextExposureExpression();
        return ['case',assessable,['interpolate',['linear'],exposure,
            0.000000,'#E0E1DE',0.206466,'#D6D8D8',0.363558,'#CDD2D3',0.465686,'#B7E0E3',0.540181,'#62C0CF',0.578715,'#348DC4',0.663285,'#3156A4',0.746058,'#172B62'
        ],'rgba(255,255,255,0)'];
    }

    // Transaction Pulse — rose/coral/wine: observed transaction activity.
    if(mode==='Transaction Pulse'){
        const x=marketContextPulseExpression();
        if(x===-1) return 'rgba(255,255,255,0)';
        return ['case',['>=',x,0],['interpolate',['linear'],x,
            0.00,'#E0E1DE',0.25,'#DED2D2',0.40,'#E1BFC0',0.55,'#D98F94',0.70,'#C96473',0.85,'#99485F',1.00,'#5F2C46'
        ],'rgba(255,255,255,0)'];
    }

    // Transaction Exposure — lavender/violet/deep purple: activity × local opportunity.
    if(mode==='Transaction Exposure'){
        const {exposure,assessable}=marketContextTransactionExposureExpression();
        const d=window.UGA_MARKET_ANALYTICS?.transaction_activity?.transaction_exposure?.distribution || {};
        const fallback=[0.00,0.15,0.25,0.35,0.45,0.55,0.70,0.85];
        const raw=[d.min,d.p25,d.p50,d.p75,d.p90,d.p95,d.p99,d.max]
            .map((v,i)=>Number.isFinite(Number(v)) ? Number(v) : fallback[i]);
        const stops=[...raw];
        for(let i=1;i<stops.length;i++){
            if(stops[i] <= stops[i-1]) stops[i]=Math.min(1,stops[i-1]+0.000001);
        }
        return ['case',assessable,['interpolate',['linear'],exposure,
            stops[0],'#E0E1DE',stops[1],'#D8D3DE',stops[2],'#CEC6E4',stops[3],'#AA9AD0',stops[4],'#806BB6',stops[5],'#5B478F',stops[6],'#382D63',stops[7],'#231D42'
        ],'rgba(255,255,255,0)'];
    }

    return 'rgba(255,255,255,0)';
}

function updateMarketContextOverlay(){
    if(typeof map==='undefined' || !map.getSource('atlas') || !map.getLayer('atlas')) return;
    if(!map.getLayer('market-context-overlay')){
        map.addLayer({
            id:'market-context-overlay', type:'fill', source:'atlas',
            'source-layer':ATLAS_SOURCE_LAYER,
            paint:{'fill-color':'rgba(255,255,255,0)','fill-opacity':0,'fill-outline-color':'rgba(255,255,255,0)'}
        },'atlas');
    }
    const mode=marketContextOverlay?.value || 'Off';
    const opacity=marketContextOpacity ? Number(marketContextOpacity.value)/100 : 0.30;
    map.setPaintProperty('market-context-overlay','fill-color',marketContextColourExpression());
    map.setPaintProperty('market-context-overlay','fill-opacity',mode==='Off'?0:opacity);
    if(map.getLayer('atlas')) map.moveLayer('market-context-overlay','atlas');
    if(marketContextOpacityValue) marketContextOpacityValue.value=`${Math.round(opacity*100)}%`;
}
window.UGARefreshMarketContextOverlay=updateMarketContextOverlay;
window.UGAMarketContextOverlayState=()=>({
    mode:marketContextOverlay?.value || 'Off',
    opacity:marketContextOpacity ? Number(marketContextOpacity.value) : 30,
    layer:typeof map!=='undefined' && !!map.getLayer('market-context-overlay')
});

marketContextOverlay?.addEventListener('change',updateMarketContextOverlay);
marketContextOpacity?.addEventListener('input',updateMarketContextOverlay);

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

                'fill-opacity':
                    analysisFillOpacityExpression(),

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


    updateMarketContextOverlay();

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


    // Restore current Planning Context and UGS filters

    applyAtlasFilters();

}


// -----------------------------------------------------
// Planning Context — eligible analysis modes
// -----------------------------------------------------

const PLANNING_CONTEXT_ANALYSES = [

    'Urban Genetic Signature',

    'Development Pressure',

    'GFA - Saturation',

    'Renewal Potential',

    'Genesis Potential',

    'Latent Urban Capacity',

    'Market Exposure',

    'Transaction Exposure'

];


function planningContextApplies(){

    return PLANNING_CONTEXT_ANALYSES.includes(
        themeSelect.value
    );

}

// -----------------------------------------------------
// Urban Genetic Signature + Planning Context filters
// -----------------------------------------------------

function applyAtlasFilters(){

    if(!map.getLayer('atlas')){
        return;
    }

    const filters = [];

    if(planningContextApplies()){

        const context =
            capacityContext.value;

        if(context !== 'All'){

            filters.push([
                '==',
                [
                    'get',
                    'SPZ - Capacity Context'
                ],
                context
            ]);

        }

    }

    if(themeSelect.value === 'Urban Genetic Signature'){

        const codes =
            Array.from(
                activeUgsSignatureCodes
            );

        filters.push(
            codes.length
                ? [
                    'in',
                    [
                        'get',
                        'UGS_v02_Code'
                    ],
                    [
                        'literal',
                        codes
                    ]
                ]
                : [
                    '==',
                    [
                        'get',
                        'UGS_v02_Code'
                    ],
                    '__none__'
                ]
        );

    }

    map.setFilter(
        'atlas',
        filters.length
            ? ['all', ...filters]
            : null
    );

}

function applyUgsSignatureFilter(){
    applyAtlasFilters();
}

function applyCapacityContextFilter(){
    applyAtlasFilters();
    updateStatus();
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
        url:'pmtiles://https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/atlas/852LAB_V1.6.pmtiles'
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
        data:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/reclaimed/Reclaimed_Land_V1.1.geojson'
    });


    map.addSource('buildingAge',{
        type:'geojson',
        data:'https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/buildings/Buildings_Age_or_Heritage_Grade.geojson'
    });

perfMark('All data sources added');
perfMark('All sources registered');

    findBasemapBuildingLayers();

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
// SATELLITE BASEMAP
// =====================================================
//
// Optional satellite reference layer.
// It sits beneath the Atlas terrain / analysis overlays
// while the existing Carto labels and map infrastructure
// remain available above it.
//

    map.addSource('satellite',{
        type:'raster',

        tiles:[
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],

        tileSize:256,

        attribution:
            'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });


    map.addLayer({

        id:'satellite',

        type:'raster',

        source:'satellite',

        layout:{
            visibility:'none'
        },

        paint:{
            'raster-opacity':1
        }

    }, 'terrain');

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


// Keep reclaimed land above satellite/base imagery and below roads.

    if(map.getLayer('road_service_case')){

        if(map.getLayer('reclaimed')){

            map.moveLayer(
                'reclaimed',
                'road_service_case'
            );

        }

        if(map.getLayer('reclaimed-outline')){

            map.moveLayer(
                'reclaimed-outline',
                'road_service_case'
            );

        }

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
// BUILDING HEIGHT
// =====================================================

    map.addLayer({

        id:'buildingHeight',

        type:'fill',

        source:'atlas',

        'source-layer':
            ATLAS_SOURCE_LAYER,

        layout:{
            visibility:'none'
        },

        paint:{

            'fill-color': [

    'case',

    [
        '<=',
        [
            'coalesce',
            [
                'to-number',
                [
                    'get',
                    'Building Height_mean'
                ]
            ],
            0
        ],
        0
    ],

    'rgba(0,0,0,0)',

    [
        'interpolate',

        ['linear'],

        [
            'to-number',
            [
                'get',
                'Building Height_mean'
            ]
        ],

        10,
        'rgba(127, 236, 169, 0.28)',

        20,
        'rgba(95, 218, 161, 0.32)',

        30,
        'rgba(81, 197, 201, 0.36)',

        40,
        'rgba(70, 140, 187, 0.4)',

        50,
        'rgba(54, 121, 163, 0.44)',

        75,
        'rgba(50, 116, 156, 0.48)',

        100,
        'rgba(59, 91, 151, 0.52)',

        150,
        'rgba(70, 65, 134, 0.56)',

        200,
        'rgba(96, 58, 133, 0.6)',

        250,
        'rgba(86, 39, 124, 0.64)',

        400,
        'rgba(112, 52, 128, 0.68)',

        500,
        'rgba(102, 27, 112, 0.72)'
    ]

],

            'fill-outline-color':
                'rgba(55,65,81,0.12)',

            'fill-opacity':0.80

        },

        filter:[

            '>=',

            [

                'coalesce',

                [
                    'to-number',
                    [
                        'get',
                        'Building Height_mean'
                    ]
                ],

                0

            ],

            30

        ]

    });


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
                    'UGS_v02_Code'
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
    updateAnalysisOpacity();
    updateFabricOpacity();

    
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

    popupAnchorPoint = null;

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


    // UGS v0.2 profile percentiles are stored on a 0–1 unit scale.
    // Convert to CSS percentage points only at render time.
    const numericPct =
        Math.max(
            0,
            Math.min(
                100,
                Number(pct) * 100
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
                ${
                    band
                        ? ugsFriendlyBand(band)
                        : ''
                }
            </div>

        </div>

    `;

}

function ugsIndexProfileRow(
    label,
    value,
    maxValue,
    accent,
    formatter
){

    if(
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ){

        return '';

    }


    const numericValue =
        Number(value);


    const numericMax =
        Number(maxValue);


    if(
        !Number.isFinite(numericMax) ||
        numericMax <= 0
    ){

        return '';

    }


    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                numericValue /
                numericMax *
                100
            )
        );


    const displayValue =
        formatter
            ? formatter(numericValue)
            : numericValue.toFixed(3);


    return `

        <div class="ugs-profile-row">

            <div class="ugs-profile-label">
                ${label}
            </div>

            <div class="ugs-profile-track">

                <div
                    class="ugs-profile-fill"
                    style="
                        width:${percentage}%;
                        background:${accent};
                    "
                ></div>

            </div>

            <div class="ugs-profile-value">
                ${displayValue}
            </div>

        </div>

    `;

}

function ugsWhyItems(
    properties,
    signatureCode
){

    const definitions = {

        TC:[
            {label:'Intensity',field:'UGS_v02_Intensity_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        EC:[
            {label:'Intensity',field:'UGS_v02_Intensity_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        AT:[
            {label:'Building age',field:'UGS_v02_Building_Age_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        VM:[
            {label:'Intensity',field:'UGS_v02_Intensity_Band'},
            {label:'Height / Form',field:'UGS_v02_Height_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        LF:[
            {label:'Building age',field:'UGS_v02_Building_Age_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        CF:[
            {label:'Accessibility',field:'UGS_v02_Access_Band'},
            {label:'Change',field:'UGS_v02_Change_Band'}
        ],

        SF:[],

        C:[
            {label:'Planning context',field:'SPZ - Capacity Context'}
        ],

        U:[
            {label:'Data availability',field:'UGS_v02_Data_Completeness'}
        ]

    };

    return (
        definitions[signatureCode] || []
    )
        .map(
            item => ({
                label:item.label,
                band:ugsValue(
                    properties,
                    item.field
                )
            })
        )
        .filter(
            item =>
                item.band !== null
        );

}

function ugsInterpretation(
    properties,
    signature
){

    switch(signature){

        case 'TRANSFORMING CORE':
            return (
                'This is a highly built-up hex with a strong ' +
                'modelled change signal.'
            );

        case 'EMERGING CHANGE':
            return (
                'This is a lower-intensity hex with a strong ' +
                'modelled change signal.'
            );

        case 'AGEING TRANSITION':
            return (
                'This hex combines older building fabric with a ' +
                'strong modelled change signal.'
            );

        case 'VERTICAL MATURE':
            return (
                'This hex is highly built-up and tall, while its ' +
                'change signal remains below the high-change threshold.'
            );

        case 'LEGACY FABRIC':
            return (
                'This hex contains older building fabric without an ' +
                'unusually strong change signal.'
            );

        case 'CONNECTED FABRIC':
            return (
                'This hex is highly connected without an unusually ' +
                'strong change signal.'
            );

        case 'STABLE FABRIC':
            return (
                'No Signature-defining combination crossed the relevant ' +
                'thresholds here. This does not imply permanent stability.'
            );

        case 'CONSTRAINED':
            return (
                'This location sits within a constrained or non-urban ' +
                'planning context and is treated separately from the ' +
                'normal urban Signatures.'
            );

        case 'UNASSESSED':
            return (
                'There is not enough analytical context here to assign ' +
                'a normal Urban Genetic Signature.'
            );

        default:
            return (
                'This combination of urban characteristics forms a distinct Signature.'
            );

    }

}

// =====================================================
// UGS CONNECTIVITY HELPERS
// =====================================================

function ugsConnectivityBar(
    label,
    value,
    maxValue,
    displayValue,
    accent
){

    if(
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ){

        return '';

    }


    const numericValue =
        Math.max(
            0,
            Number(value)
        );


    const width =
        Math.max(
            0,
            Math.min(
                100,
                (
                    numericValue /
                    maxValue
                ) * 100
            )
        );


    return `

        <div class="ugs-connectivity-row">

            <div class="ugs-connectivity-label">
                ${label}
            </div>

            <div class="ugs-connectivity-track">

                <div
                    class="ugs-connectivity-fill"
                    style="
                        width:${width}%;
                        background:${accent};
                    "
                ></div>

            </div>

            <div class="ugs-connectivity-value">
                ${displayValue}
            </div>

        </div>

    `;

}

function ugsActivitySection(
    properties
){

    const approvalYear =
        ugsNumber(
            properties,
            'Analysis_v2_Latest_Approval_Year'
        );

    const approvalCount =
        ugsNumber(
            properties,
            'Analysis_v2_Approval_Event_Count'
        );

    const landDealYear =
        ugsNumber(
            properties,
            'Analysis_v2_Latest_Land_Deal_Year'
        );

    const landDealCount =
        ugsNumber(
            properties,
            'Analysis_v2_Land_Deal_Event_Count'
        );


    const hasActivity =
        approvalYear !== null ||
        landDealYear !== null;


    return `

        <div class="ugs-section">

            <div class="ugs-section-title">
                RECORDED ACTIVITY
            </div>

            <div class="popup-row">

                <span>
                    Latest recorded building approval
                </span>

                <span>
                    ${
                        approvalYear !== null
                            ? `${approvalYear}${approvalCount > 1 ? ` · ${approvalCount} events recorded` : ''}`
                            : '—'
                    }
                </span>

            </div>


            <div class="popup-row">

                <span>
                    Latest recorded land deal
                </span>

                <span>
                    ${
                        landDealYear !== null
                            ? `${landDealYear}${landDealCount > 1 ? ` · ${landDealCount} events recorded` : ''}`
                            : '—'
                    }
                </span>

            </div>


            ${
                hasActivity
                    ? ''
                    : `
                        <div class="ugs-activity-note">
                            No building-approval or land-deal year is recorded
                            for this hex in the available source history.
                        </div>
                    `
            }

        </div>

    `;

}

// =====================================================
// POPUP POSITIONING
// =====================================================

let popupAnchorPoint = null;

let popupResizeObserver = null;

let popupResizeFrame = null;

// =====================================================
// POPUP POSITIONING
// =====================================================

function repositionPopup(){

    if(
        !popupAnchorPoint ||
        !popup.classList.contains('visible')
    ){
        return;
    }


    const mobilePopup =
        window.matchMedia(
            '(max-width:900px)'
        ).matches;


    // -------------------------------------------------
    // Mobile
    // -------------------------------------------------

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


    // -------------------------------------------------
    // Desktop
    // -------------------------------------------------

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
        'auto';

    popup.style.pointerEvents =
        'auto';


    const offset = 18;

    const screenMargin = 24;


    const popupWidth =
        popup.offsetWidth;

    const popupHeight =
        popup.offsetHeight;


    let left =
        popupAnchorPoint.x + offset;

    let top =
        popupAnchorPoint.y - 18;


    // -------------------------------------------------
    // Horizontal positioning
    // -------------------------------------------------

    if(
        left + popupWidth >
        window.innerWidth - screenMargin
    ){

        left =
            popupAnchorPoint.x -
            popupWidth -
            offset;

    }


    if(left < screenMargin){

        left =
            screenMargin;

    }


    // -------------------------------------------------
    // Vertical positioning
    //
    // Prefer above the click point when necessary.
    // -------------------------------------------------

    if(
        top + popupHeight >
        window.innerHeight - screenMargin
    ){

        top =
            popupAnchorPoint.y -
            popupHeight -
            offset;

    }


    // -------------------------------------------------
    // Final hard screen bounds
    // -------------------------------------------------

    top =
        Math.max(
            screenMargin,
            Math.min(
                top,
                window.innerHeight -
                popupHeight -
                screenMargin
            )
        );


    left =
        Math.max(
            screenMargin,
            Math.min(
                left,
                window.innerWidth -
                popupWidth -
                screenMargin
            )
        );


    popup.style.left =
        `${left}px`;

    popup.style.top =
        `${top}px`;

    popup.style.visibility =
        'visible';

}


function positionPopup(point){

    popupAnchorPoint = {
        x:point.x,
        y:point.y
    };


    popup.scrollTop = 0;


    popup.style.visibility =
        'hidden';

    popup.style.display =
        'block';

    popup.classList.add(
        'visible'
    );


    repositionPopup();


    // -------------------------------------------------
    // Watch for expandable popup content changing
    // the popup's height.
    // -------------------------------------------------

    if(!popupResizeObserver){

        popupResizeObserver =
            new ResizeObserver(
                () => {

                    cancelAnimationFrame(
                        popupResizeFrame
                    );

                    popupResizeFrame =
                        requestAnimationFrame(
                            repositionPopup
                        );

                }
            );

        popupResizeObserver.observe(
            popup
        );

    }

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
                        m²
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
                'UGS_v02_Code'
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
            'UGS_v02_Signature'
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


    const dataCompletenessValue =
        ugsNumber(
            p,
            'UGS_v02_Data_Completeness'
        );

    const dataCompleteness =
        dataCompletenessValue === null
            ? null
            : `${Math.round(dataCompletenessValue * 100)}%`;


    const why =
        ugsWhyItems(
            p,
            signatureCode
        );


    // -------------------------------------------------
    // Visual fingerprint
    // -------------------------------------------------

    const profileRows = [

        ugsProfileRow(
            'INTENSITY',
            ugsNumber(
                p,
                'UGS_v02_Intensity_Pct'
            ),
            ugsValue(
                p,
                'UGS_v02_Intensity_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'ACCESSIBILITY',
            ugsNumber(
                p,
                'UGS_v02_Access_Pct'
            ),
            ugsValue(
                p,
                'UGS_v02_Access_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'HEIGHT / FORM',
            ugsNumber(
                p,
                'UGS_v02_Height_Pct'
            ),
            ugsValue(
                p,
                'UGS_v02_Height_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'CHANGE',
            ugsNumber(
                p,
                'UGS_v02_Change_Pct'
            ),
            ugsValue(
                p,
                'UGS_v02_Change_Band'
            ),
            signature.colour
        ),

        ugsProfileRow(
            'AGE',
            ugsNumber(
                p,
                'UGS_v02_Age_Pct'
            ),
            ugsValue(
                p,
                'UGS_v02_Building_Age_Band'
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
                            ? (
                                item.label === 'Data availability' &&
                                Number.isFinite(Number(item.band))
                                    ? `${Math.round(Number(item.band) * 100)}%`
                                    : ugsFriendlyBand(item.band)
                            )
                            : 'not available'
                        }
                    </div>
                `
            ).join('')
            : `
                <div class="ugs-why-item">
                    No Signature-defining combination crossed the
                    relevant thresholds here.
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
                                ' m²/person'
                        }
                    </span>
                </div>

                <div class="popup-row">
                    <span>Residents / building</span>
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


    const pedestrianIndex =
        ugsNumber(
            p,
            'Pedestrian - Index'
        );


    const roadConnectivityIndex =
        ugsNumber(
            p,
            'Road - Connectivity Index'
        );


    const mtrBuiltIndex =
        ugsNumber(
            p,
            'MTR - Index (Built)'
        );


    const connectivityRows = [

        ugsIndexProfileRow(
            'Pedestrian',
            pedestrianIndex,
            1,
            signature.colour,
            value =>
                `${(value * 100).toFixed(0)}%`
        ),

        ugsIndexProfileRow(
            'Road',
            roadConnectivityIndex,
            1,
            signature.colour,
            value =>
                `${(value * 100).toFixed(0)}%`
        ),

        ugsIndexProfileRow(
            'MTR built',
            mtrBuiltIndex,
            7,
            signature.colour,
            value =>
                value.toFixed(3)
        )

    ].join('');


    const connectivitySection = `

        <details
            class="ugs-detail"
        >

            <summary>
                Connectivity
            </summary>

            <div class="ugs-detail-body">

                ${
                    connectivityRows ||
                    `
                        <div class="popup-row">
                            <span>Connectivity</span>
                            <span>Not available</span>
                        </div>
                    `
                }

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
                    The Urban Genetic Signature is a rule-based classification.
                    It compares each hex with the meaningful urban reference set
                    across five characteristics: Intensity, Accessibility,
                    Height / Form, Age and Change.
                </p>

                <p>
                    A Signature is assigned when a defining combination crosses
                    its thresholds. It is not an average of the five
                    characteristics and it is not an overall score.
                </p>

                <p>
                    Change is based on the relative Development Pressure signal.
                    Renewal and Genesis remain separate strategic analyses and do
                    not feed into the Signature classification.
                </p>

                <p>
                    Development Pressure includes recorded building-approval
                    activity as one component. Approvals are also shown separately
                    so recorded activity can be distinguished from a modelled
                    signal.
                </p>

                <p>
                    The Signature describes a detected combination of urban
                    characteristics. It does not predict redevelopment.
                </p>

                ${
                    ugsNumber(
                        p,
                        'UGS_v02_Pressure_Pct'
                    ) !== null
                        ? `
                            <div class="popup-row">
                                <span>Change profile</span>
                                <span>
                                    ${
                                        ugsNumber(
                                            p,
                                            'UGS_v02_Pressure_Pct'
                                        ).toFixed(0)
                                    }%
                                </span>
                            </div>
                        `
                        : ''
                }

                ${
                dataCompleteness
                ? `
                    <div class="ugs-methodology-meta">
                                Profile data coverage:
                                <strong>
                                    ${dataCompleteness}
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
                            m²
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

            </div>

            ${methodologySection}

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

// =====================================================
// BASEMAP
// =====================================================


// -----------------------------------------------------
// Basemap visibility
// -----------------------------------------------------

function updateBasemap(){

    if(!map.getLayer('satellite')){

        return;

    }


    const satelliteVisible =
        basemapToggle &&
        basemapToggle.checked;


    map.setLayoutProperty(
        'satellite',
        'visibility',
        satelliteVisible
            ? 'visible'
            : 'none'
    );


    // -------------------------------------------------
    // Update switch state
    // -------------------------------------------------

    if(basemapToggle){

        basemapToggle.setAttribute(
            'aria-checked',
            String(satelliteVisible)
        );

    }


    // -------------------------------------------------
    // Update active label
    // -------------------------------------------------

    if(basemapMapLabel){

        basemapMapLabel.classList.toggle(
            'active',
            !satelliteVisible
        );

    }


    if(basemapSatelliteLabel){

        basemapSatelliteLabel.classList.toggle(
            'active',
            satelliteVisible
        );

    }

    updateBasemapBuildingVisibility();

}


// -----------------------------------------------------
// Basemap Buildings visibility
// -----------------------------------------------------

let basemapBuildingLayerIds = [];

function findBasemapBuildingLayers(){

    basemapBuildingLayerIds =
        map.getStyle().layers
            .filter(
                layer =>
                    /building/i.test(layer.id) &&
                    (
                        layer.type === 'fill' ||
                        layer.type === 'fill-extrusion'
                    ) &&
                    layer.id !== 'buildingAge' &&
                    layer.id !== 'buildingHeight' &&
                    layer.id !== 'heritage'
            )
            .map(
                layer =>
                    layer.id
            );

}

function updateBasemapBuildingVisibility(){

    const visible =
        !buildingBaseToggle ||
        buildingBaseToggle.checked;

    basemapBuildingLayerIds.forEach(
        layerId => {

            setLayerVisibility(
                layerId,
                visible
            );

        }
    );

}

// -----------------------------------------------------
// Basemap switch
// -----------------------------------------------------

basemapToggle?.addEventListener(
    'change',
    updateBasemap
);

buildingBaseToggle?.addEventListener(
    'change',
    updateBasemapBuildingVisibility
);

// -----------------------------------------------------
// Status strip
// -----------------------------------------------------

function updateStatus(){

    const zoom =
        map.getZoom().toFixed(1);

    const theme =
        themeSelect.value;

    const analysisName =
        LEGENDS[theme]?.title || theme;

    const statsKey =
        ANALYSIS_STATS_KEYS[theme];

    let coverage =
        statsKey
            ? atlasStats?.coverage?.[statsKey]
            : null;

    if(theme === 'Transaction Pulse'){
        coverage =
            window.UGA_MARKET_ANALYTICS
                ?.transaction_activity
                ?.coverage || null;
    }

    const total =
        Number(
            atlasStats?.atlas?.totalHexes
        );

    let coverageText =
        'Coverage unavailable';

    if(
        coverage &&
        Number.isFinite(
            Number(coverage.count)
        ) &&
        Number.isFinite(total)
    ){

        coverageText =
            `Coverage ${
                Number(
                    coverage.count
                ).toLocaleString()
            } / ${
                total.toLocaleString()
            } (${
                Number(
                    coverage.pct
                ).toFixed(1)
            }%)`;

    }

    const filter =
        capacityContext?.value &&
        capacityContext.value !== 'All'
            ? ` · Filter: ${capacityContext.value}`
            : '';

    status.textContent =
        `Hong Kong SAR · 100 m grid · ${analysisName} · ` +
        `${coverageText}${filter} · Zoom ${zoom}`;

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

        // V1.4: changing the selected analysis preserves the current master
        // visibility state. A user can hide the map layer, choose another
        // analysis, and then turn the layer back on without the panel moving.


        // Planning Context availability

        const planningContextAvailable =
            planningContextApplies();


        analysisControls.style.display =
            planningContextAvailable
                ? 'flex'
                : 'none';


        // Reset context when changing analysis

        if(!planningContextAvailable){

            capacityContext.value =
                'All';

        }


        // Update the existing analysis layer

        drawAtlas();


        // Reapply planning-context and UGS filters

        applyAtlasFilters();


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
// URBAN FABRIC — BUILDING HEIGHT
// =====================================================

let buildingHeightFilterFrame = null;

function updateBuildingHeightLabels(){

    if(!buildingHeightMin || !buildingHeightMax){
        return;
    }

    const minValue =
        Number(buildingHeightMin.value);

    const maxValue =
        Number(buildingHeightMax.value);

    if(buildingHeightValue){

        buildingHeightValue.textContent =
            `${minValue}–${maxValue >= 500 ? '500+' : maxValue} m`;

    }

    if(buildingHeightSliderFill){

        const rangeMin =
            Number(buildingHeightMin.min || 0);

        const rangeMax =
            Number(buildingHeightMin.max || 500);

        const span =
            rangeMax - rangeMin;

        const left =
            span > 0
                ? ((minValue - rangeMin) / span) * 100
                : 0;

        const right =
            span > 0
                ? ((maxValue - rangeMin) / span) * 100
                : 100;

        buildingHeightSliderFill.style.left =
            `${Math.max(0, Math.min(100, left))}%`;

        buildingHeightSliderFill.style.width =
            `${Math.max(0, Math.min(100, right - left))}%`;

    }

}

function normaliseBuildingHeightRange(changed){

    if(!buildingHeightMin || !buildingHeightMax){
        return;
    }

    const minValue =
        Number(buildingHeightMin.value);

    const maxValue =
        Number(buildingHeightMax.value);

    if(minValue > maxValue){

        if(changed === 'min'){

            buildingHeightMin.value =
                buildingHeightMax.value;

        } else {

            buildingHeightMax.value =
                buildingHeightMin.value;

        }

    }

}

function activateBuildingHeightHandle(handle){

    if(!buildingHeightMin || !buildingHeightMax){
        return;
    }

    buildingHeightMin.style.zIndex =
        handle === buildingHeightMin
            ? '5'
            : '3';

    buildingHeightMax.style.zIndex =
        handle === buildingHeightMax
            ? '5'
            : '2';

}

function updateBuildingHeightFilter(){

    if(!map.getLayer('buildingHeight')){
        return;
    }

    normaliseBuildingHeightRange();

    const minValue = Math.min(
        Number(buildingHeightMin?.value ?? 0),
        Number(buildingHeightMax?.value ?? 500)
    );

    const maxValue = Math.max(
        Number(buildingHeightMin?.value ?? 50),
        Number(buildingHeightMax?.value ?? 500)
    );

    updateBuildingHeightLabels();

    const heightExpression = [
        'coalesce',
        [
            'to-number',
            [
                'get',
                'Building Height_mean'
            ]
        ],
        0
    ];

    const filterClauses = [
        [
            '>=',
            heightExpression,
            minValue
        ]
    ];

    if(maxValue < 500){

        filterClauses.push([
            '<=',
            heightExpression,
            maxValue
        ]);

    }

    map.setFilter(
        'buildingHeight',
        ['all', ...filterClauses]
    );

}

function scheduleBuildingHeightUpdate(changed){

    normaliseBuildingHeightRange();
    updateBuildingHeightLabels();

    if(buildingHeightFilterFrame){

        cancelAnimationFrame(
            buildingHeightFilterFrame
        );

    }

    buildingHeightFilterFrame =
        requestAnimationFrame(() => {

            buildingHeightFilterFrame =
                null;

            updateBuildingHeightFilter();

        });

}

buildingHeightToggle.addEventListener(
    'change',
    () => {

        setLayerVisibility(
            'buildingHeight',
            buildingHeightToggle.checked &&
            fabricToggle.checked
        );

        if(buildingHeightToggle.checked){

            expandFabricModule(
                buildingHeightModule
            );

        } else {

            collapseFabricModule(
                buildingHeightModule
            );

        }

        updateBuildingHeightFilter();

    }
);

buildingHeightMin?.addEventListener(
    'input',
    () => scheduleBuildingHeightUpdate('min')
);

buildingHeightMax?.addEventListener(
    'input',
    () => scheduleBuildingHeightUpdate('max')
);

buildingHeightMin?.addEventListener(
    'pointerdown',
    () => activateBuildingHeightHandle(buildingHeightMin),
    { passive:true }
);

buildingHeightMax?.addEventListener(
    'pointerdown',
    () => activateBuildingHeightHandle(buildingHeightMax),
    { passive:true }
);

buildingHeightMin?.addEventListener(
    'focus',
    () => activateBuildingHeightHandle(buildingHeightMin)
);

buildingHeightMax?.addEventListener(
    'focus',
    () => activateBuildingHeightHandle(buildingHeightMax)
);

if(buildingHeightMin){
    buildingHeightMin.value = 0;
}

if(buildingHeightMax){
    buildingHeightMax.value = 500;
}

updateBuildingHeightLabels();

// =====================================================
// URBAN FABRIC — ROADS
// =====================================================


// -----------------------------------------------------
// Roads master toggle
// -----------------------------------------------------

roadsToggle.addEventListener(
    'change',
    () => {

        updateFabricVisibility();
        updateRoadVisibility();


        if(roadsToggle.checked){

            expandFabricModule(
                roadsModule
            );

        } else {

            collapseFabricModule(
                roadsModule
            );

        }

    }
);


// -----------------------------------------------------
// Highway roads
// -----------------------------------------------------

roadHighwayToggle.addEventListener(
    'change',
    updateRoadVisibility
);


// -----------------------------------------------------
// Main roads
// -----------------------------------------------------

roadMainToggle.addEventListener(
    'change',
    updateRoadVisibility
);


// -----------------------------------------------------
// Secondary roads
// -----------------------------------------------------

roadSecondaryToggle.addEventListener(
    'change',
    updateRoadVisibility
);

// =====================================================
// URBAN FABRIC — BUILDING AGE
// =====================================================

let buildingAgeFilterFrame = null;
let buildingAgeYearsCache = null;

function getBuildingAgeYears(){

    if(buildingAgeYearsCache){
        return buildingAgeYearsCache;
    }

    const features =
        map.getSource('buildingAge')?._data?.features || [];

    buildingAgeYearsCache =
        features
            .map(
                feature =>
                    Number(feature.properties?.Year)
            )
            .filter(
                year =>
                    Number.isFinite(year) &&
                    year > 0
            )
            .sort((a,b) => a - b);

    return buildingAgeYearsCache;

}

function countYearsUpTo(
    sortedYears,
    target
){

    let low = 0;
    let high = sortedYears.length;

    while(low < high){

        const mid =
            Math.floor((low + high) / 2);

        if(sortedYears[mid] <= target){
            low = mid + 1;
        } else {
            high = mid;
        }

    }

    return low;

}

function updateBuildingAgeFilter(){

    if(!map.getLayer('buildingAge')){
        return;
    }

    const selectedYear =
        Number(buildingAgeYear.value);

    map.setFilter(
        'buildingAge',
        [
            'all',
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

function updateBuildingAgeCount(){

    if(!map.getSource('buildingAge')){

        buildingAgeCountValue.textContent =
            '—';

        return;

    }

    const selectedYear =
        Number(buildingAgeYear.value);

    buildingAgeCountValue.textContent =
        countYearsUpTo(
            getBuildingAgeYears(),
            selectedYear
        ).toLocaleString();

}

function scheduleBuildingAgeUpdate(){

    if(buildingAgeFilterFrame){

        cancelAnimationFrame(
            buildingAgeFilterFrame
        );

    }

    buildingAgeFilterFrame =
        requestAnimationFrame(() => {

            buildingAgeFilterFrame =
                null;

            updateBuildingAgeFilter();
            updateBuildingAgeCount();

        });

}

buildingAgeYear.addEventListener(
    'input',
    (e) => {

        const selectedYear =
            Number(e.target.value);

        buildingAgeYearValue.textContent =
            selectedYear;

        scheduleBuildingAgeUpdate();

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

updateLegendInfoButton();
updateStatus();

// =====================================================
// UI + MARKET TRANSACTION V1.4 — PANEL INTERACTION POLISH
// Master visibility toggles no longer expand/collapse panels.
// Panel icons are the sole panel minimise/expand affordance.
// =====================================================

// =====================================================
// THREE PANEL STACK V3 — PRODUCTION UI + MARKET TRANSACTION V1 + MOBILE CONTROL SHEET V2.6
// Stable top-right rail · desktop max 2 · mobile max 1
// LRU eviction · separate Map View · terrain independent
// =====================================================
(function initThreePanelStackV3(){
    const panel = document.getElementById('panel');
    const panelScroll = document.getElementById('panelScroll');
    if(!panel || !panelScroll || panel.dataset.stackV3 === 'ready') return;

    panel.dataset.stackV3 = 'ready';
    panel.classList.add('panel-stack-v3');
    if(!window.matchMedia('(max-width:900px)').matches){
        panel.classList.remove('panel-minimized');
    }

    const entries = [
        {
            key:'fabric',
            section:document.getElementById('fabricSection'),
            toggle:document.getElementById('fabricSectionToggle'),
            title:'Urban Fabric',
            icon:'assets/Fabric_Icon.png'
        },
        {
            key:'analysis',
            section:document.getElementById('analysisSection'),
            toggle:document.getElementById('analysisSectionToggle'),
            title:'Urban Analysis',
            icon:'assets/Analysis_Icon.png'
        },
        {
            key:'market',
            section:document.getElementById('marketSection'),
            toggle:document.getElementById('marketSectionToggle'),
            title:'Market Data',
            icon:'assets/Market_Icon.png'
        }
    ].filter(x => x.section && x.toggle);

    if(entries.length !== 3){
        console.warn('[ATLAS UI] Three-panel stack V3 not initialised: expected Fabric, Analysis and Market.');
        return;
    }

    // Canonical visible order, independent of source HTML order.
    for(const entry of entries){
        panelScroll.appendChild(entry.section);
    }

    // Desktop uses the persistent three-panel rail directly. On mobile the
    // original master control becomes a drawer toggle for the entire rail.
    const oldMinimise = document.getElementById('panelMinimize');
    const mobileMasterQuery = window.matchMedia('(max-width:900px)');

    function syncMasterPanelButton(){
        if(!oldMinimise) return;
        const mobileMode = mobileMasterQuery.matches;
        oldMinimise.hidden = !mobileMode;
        oldMinimise.setAttribute('aria-hidden',String(!mobileMode));
        oldMinimise.tabIndex = mobileMode ? 0 : -1;
        if(!mobileMode){
            setPanelMinimized(false);
        }
    }

    syncMasterPanelButton();
    mobileMasterQuery.addEventListener('change',syncMasterPanelButton);

    // Preserve the global Atlas information trigger when the old outer header is hidden.
    const aboutTrigger = document.querySelector('.atlas-control-header .info-trigger[data-info-key="about"]');
    const version = document.querySelector('#brand .version');
    if(aboutTrigger && version && !version.contains(aboutTrigger)){
        aboutTrigger.classList.add('atlas-about-trigger');
        aboutTrigger.setAttribute('aria-label','About the Urban Genetics Atlas');
        aboutTrigger.setAttribute('title','About the Atlas');
        version.appendChild(aboutTrigger);
    }

    // -------------------------------------------------
    // Separate Map View utility
    // -------------------------------------------------
    // Basemap / satellite / buildings remain outside Fabric.
    // Terrain is promoted here as a view control too, and is therefore
    // kept independent from Fabric master visibility / opacity.
    const basemapControl = document.getElementById('basemapControl');
    const terrainToggle = document.getElementById('terrainToggle');
    const terrainModule = document.getElementById('terrainModule');
    const fabricToggle = document.getElementById('fabricToggle');
    const fabricOpacity = document.getElementById('fabricOpacity');

    if(basemapControl){
        basemapControl.classList.add('stack-map-view-control');
        basemapControl.setAttribute('aria-label','Map view');

        if(!basemapControl.querySelector('.stack-map-view-title')){
            const title = document.createElement('span');
            title.className = 'stack-map-view-title';
            title.textContent = 'MAP VIEW';
            basemapControl.insertBefore(title, basemapControl.firstChild);
        }

        if(terrainToggle && !basemapControl.querySelector('.stack-terrain-toggle')){
            const terrainLabel = document.createElement('label');
            terrainLabel.className = 'basemap-building-toggle stack-terrain-toggle';
            terrainLabel.title = 'Show or hide terrain';
            terrainLabel.appendChild(terrainToggle); // move original input; existing listener follows it
            const text = document.createElement('span');
            text.textContent = 'TERRAIN';
            terrainLabel.appendChild(text);
            basemapControl.appendChild(terrainLabel);
        }

        if(basemapControl.parentElement !== panel){
            panel.insertBefore(basemapControl, panelScroll);
        }
    }

    if(terrainModule){
        terrainModule.classList.add('stack-terrain-module-hidden');
        terrainModule.setAttribute('aria-hidden','true');
    }

    // Terrain now belongs to Map View, not the Fabric master.
    function restoreIndependentTerrain(){
        try{
            if(terrainToggle && map.getLayer('terrain')){
                map.setLayoutProperty(
                    'terrain',
                    'visibility',
                    terrainToggle.checked ? 'visible' : 'none'
                );
                map.setPaintProperty('terrain','raster-opacity',0.15);
            }
        }catch(error){
            console.warn('[ATLAS UI] Could not restore independent terrain state:', error);
        }
    }

    terrainToggle?.addEventListener('change', () => requestAnimationFrame(restoreIndependentTerrain));
    fabricToggle?.addEventListener('change', () => requestAnimationFrame(restoreIndependentTerrain));
    fabricOpacity?.addEventListener('input', () => requestAnimationFrame(restoreIndependentTerrain));

    // -------------------------------------------------
    // Icon headers
    // -------------------------------------------------
    // Reuse the existing accessible section-toggle buttons as icon buttons.
    // V1.4 deliberately re-asserts the image whenever toggle state is synced;
    // older Analysis code used textContent for a chevron and could erase it.
    function ensureEntryIcon(entry){
        let img = entry.toggle.querySelector('.mode-stack-icon');
        if(!img){
            entry.toggle.textContent = '';
            img = document.createElement('img');
            img.className = 'mode-stack-icon';
            img.alt = '';
            img.setAttribute('aria-hidden','true');
            entry.toggle.appendChild(img);
        }
        if(img.getAttribute('src') !== entry.icon){
            img.src = entry.icon;
        }
    }

    for(const entry of entries){
        const header = entry.section.querySelector('.mode-header');
        if(!header) continue;

        entry.toggle.classList.add('mode-icon-toggle');
        entry.toggle.setAttribute('title', `Open or collapse ${entry.title}`);
        ensureEntryIcon(entry);

        // Icon first, then title/description. No separate chevron remains.
        header.insertBefore(entry.toggle, header.firstChild);
    }

    let syncing = false;
    let interactionSerial = 0;
    const mobile = window.matchMedia('(max-width:900px)');

    function panelLimit(){
        return mobile.matches ? 1 : Number.POSITIVE_INFINITY;
    }

    function markInteraction(entry){
        entry.lastInteraction = ++interactionSerial;
        for(const item of entries){
            item.section.classList.toggle('panel-most-recent', item === entry);
        }
    }

    function expandedEntries(){
        return entries.filter(x => x.section.classList.contains('expanded'));
    }

    function syncToggle(entry, expanded){
        ensureEntryIcon(entry);
        entry.toggle.setAttribute('aria-expanded', String(expanded));
        entry.toggle.setAttribute(
            'aria-label',
            expanded ? `Collapse ${entry.title}` : `Expand ${entry.title}`
        );
        entry.toggle.setAttribute('title', expanded ? `Collapse ${entry.title}` : `Open ${entry.title}`);
    }

    function setEntry(entry, expanded){
        entry.section.classList.toggle('expanded', expanded);
        entry.section.classList.toggle('collapsed', !expanded);
        syncToggle(entry, expanded);
        if(expanded && !mobile.matches){
            requestAnimationFrame(() => window.UGAFocusRailPanel?.(entry.section));
        }
    }

    function updateStackState(){
        const count = expandedEntries().length;
        panelScroll.dataset.expandedCount = String(count);
        panel.classList.toggle('two-panels-open', count === 2);
        panel.classList.toggle('one-panel-open', count === 1);
        panel.classList.toggle('all-panels-collapsed', count === 0);
    }

    function closeLeastRecent(exceptEntry, targetLimit = panelLimit()){
        let current = expandedEntries().filter(x => x !== exceptEntry);
        while(expandedEntries().length >= targetLimit && current.length){
            current.sort((a,b) => (a.lastInteraction || 0) - (b.lastInteraction || 0));
            const oldest = current.shift();
            setEntry(oldest, false);
            current = expandedEntries().filter(x => x !== exceptEntry);
        }
    }

    function enforcePanelLimit(preferredEntry = null){
        const limit = panelLimit();
        let open = expandedEntries();
        while(open.length > limit){
            const candidates = open.filter(x => x !== preferredEntry);
            candidates.sort((a,b) => (a.lastInteraction || 0) - (b.lastInteraction || 0));
            const victim = candidates[0] || open[0];
            setEntry(victim, false);
            open = expandedEntries();
        }
        updateStackState();
    }

    function openEntry(entry){
        if(entry.section.classList.contains('expanded')){
            markInteraction(entry);
            return;
        }

        syncing = true;
        closeLeastRecent(entry);
        setEntry(entry, true);
        markInteraction(entry);
        enforcePanelLimit(entry);
        syncing = false;
    }

    function toggleEntry(entry){
        syncing = true;
        if(entry.section.classList.contains('expanded')){
            setEntry(entry, false);
            const stillOpen = expandedEntries();
            if(stillOpen.length){
                const recent = stillOpen.sort((a,b) => (b.lastInteraction || 0) - (a.lastInteraction || 0))[0];
                markInteraction(recent);
            }
        }else{
            closeLeastRecent(entry);
            setEntry(entry, true);
            markInteraction(entry);
        }
        enforcePanelLimit(entry);
        syncing = false;
    }

    function collapseAll(){
        syncing = true;
        for(const entry of entries) setEntry(entry, false);
        updateStackState();
        syncing = false;
    }

    function entryForToggle(toggle){
        return entries.find(x => x.toggle === toggle) || null;
    }

    // The icon is the sole expand/collapse affordance.
    document.addEventListener('click', event => {
        const toggle = event.target.closest(
            '#fabricSectionToggle, #analysisSectionToggle, #marketSectionToggle'
        );
        if(!toggle) return;
        const entry = entryForToggle(toggle);
        if(!entry) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleEntry(entry);
    }, true);

    // Any deliberate interaction with an expanded panel makes it the most recent.
    panelScroll.addEventListener('pointerdown', event => {
        const section = event.target.closest('.mode-panel');
        const entry = entries.find(x => x.section === section);
        if(entry && entry.section.classList.contains('expanded')){
            markInteraction(entry);
        }
    }, true);

    panelScroll.addEventListener('focusin', event => {
        const section = event.target.closest('.mode-panel');
        const entry = entries.find(x => x.section === section);
        if(entry && entry.section.classList.contains('expanded')){
            markInteraction(entry);
        }
    }, true);

    // Keep compatibility with existing code that changes section classes.
    const observer = new MutationObserver(mutations => {
        if(syncing) return;

        const newlyExpanded = mutations
            .map(m => entries.find(x => x.section === m.target))
            .filter(Boolean)
            .find(x => x.section.classList.contains('expanded'));

        syncing = true;
        if(newlyExpanded){
            markInteraction(newlyExpanded);
            enforcePanelLimit(newlyExpanded);
        }
        for(const entry of entries){
            syncToggle(entry, entry.section.classList.contains('expanded'));
        }
        updateStackState();
        if(!mobile.matches){
            panel.classList.remove('panel-minimized');
        }
        syncing = false;
    });

    for(const entry of entries){
        observer.observe(entry.section, {attributes:true, attributeFilter:['class']});
    }

    function initialState(){
        if(mobile.matches){
            collapseAll();
            setPanelMinimized(true);
        }else{
            setPanelMinimized(false);
            syncing = true;
            for(const entry of entries) setEntry(entry, entry.key === 'analysis');
            markInteraction(entries.find(x => x.key === 'analysis'));
            updateStackState();
            syncing = false;
        }
    }

    requestAnimationFrame(initialState);

    mobile.addEventListener('change', event => {
        panel.classList.remove('panel-minimized');
        syncing = true;
        if(event.matches){
            setPanelMinimized(true);
            // Mobile: keep only the most recently interacted open panel.
            const open = expandedEntries();
            if(open.length > 1){
                open.sort((a,b) => (b.lastInteraction || 0) - (a.lastInteraction || 0));
                const keep = open[0];
                for(const entry of open.slice(1)) setEntry(entry, false);
                markInteraction(keep);
            }
            updateStackState();
        }else if(expandedEntries().length === 0){
            setPanelMinimized(false);
            const analysis = entries.find(x => x.key === 'analysis') || entries[0];
            setEntry(analysis, true);
            markInteraction(analysis);
            updateStackState();
        }
        syncing = false;
    });

    // -------------------------------------------------
    // Reclaimed land / satellite draw-order safeguard
    // -------------------------------------------------
    // Reclaimed land must be above the satellite and terrain raster layers.
    // Rather than anchoring it to a basemap road layer (whose position can be
    // below the custom raster overlays), place it immediately above Terrain.
    function ensureFabricLayerOrder(){
        try{
            const styleLayers = map.getStyle()?.layers || [];

            // Satellite below terrain.
            if(map.getLayer('satellite') && map.getLayer('terrain')){
                map.moveLayer('satellite', 'terrain');
            }

            // Find the first layer currently above Terrain and use it as the
            // insertion anchor. This guarantees reclaimed fill/outline are
            // above both Terrain and Satellite while remaining below later
            // building/label/overlay layers.
            const refreshed = map.getStyle()?.layers || [];
            const terrainIndex = refreshed.findIndex(layer => layer.id === 'terrain');
            const skip = new Set(['reclaimed','reclaimed-outline']);
            let aboveTerrainId = null;
            if(terrainIndex >= 0){
                for(let i = terrainIndex + 1; i < refreshed.length; i++){
                    const id = refreshed[i]?.id;
                    if(id && !skip.has(id)){
                        aboveTerrainId = id;
                        break;
                    }
                }
            }

            if(map.getLayer('reclaimed')){
                if(aboveTerrainId) map.moveLayer('reclaimed', aboveTerrainId);
                else map.moveLayer('reclaimed');
            }
            if(map.getLayer('reclaimed-outline')){
                if(aboveTerrainId) map.moveLayer('reclaimed-outline', aboveTerrainId);
                else map.moveLayer('reclaimed-outline');
            }
        }catch(error){
            console.warn('[ATLAS UI] Could not re-assert satellite / reclamation layer order:', error);
        }
    }

    const basemapToggle = document.getElementById('basemapToggle');
    const reclaimedToggle = document.getElementById('reclaimedToggle');
    basemapToggle?.addEventListener('change', () => requestAnimationFrame(ensureFabricLayerOrder));
    reclaimedToggle?.addEventListener('change', () => requestAnimationFrame(ensureFabricLayerOrder));
    map.once('idle', () => {
        ensureFabricLayerOrder();
        restoreIndependentTerrain();
    });

    console.info('[ATLAS UI] Three-panel stack V3 initialised.');
})();

// === PANEL STACK V3.3 CONTENT-FIT ARCHITECTURE START ===
//
// Expanded panels use their natural visible-content height where possible.
// The stack only introduces internal scrolling once the combined content would
// exceed the viewport-safe rail. Desktop supports up to two expanded panels;
// mobile remains one-at-a-time through the existing V3 controller.
//
(function initPanelStackContentFitV33(){
    const panel = document.getElementById('panel');
    const panelScroll = document.getElementById('panelScroll');
    if(!panel || !panelScroll || panel.dataset.stackContentFitV33 === 'ready') return;

    const sections = [
        document.getElementById('fabricSection'),
        document.getElementById('analysisSection'),
        document.getElementById('marketSection')
    ].filter(Boolean);

    if(sections.length !== 3) return;

    if(window.matchMedia('(min-width:901px)').matches){
        panel.dataset.stackContentFitV33 = 'desktop-disabled-by-ia-v1-7-production';
        for(const section of sections){
            section.style.removeProperty('--stack-fit-height');
            section.classList.remove('panel-content-scrolls');
            delete section.dataset.fitNaturalHeight;
            delete section.dataset.fitAllocatedHeight;
        }
        console.info('[ATLAS UI] V3.3 content-fit disabled on desktop by IA V1.7 production; outer rail owns scrolling.');
        return;
    }

    panel.dataset.stackContentFitV33 = 'ready';

    let layoutFrame = 0;
    let followupTimer = 0;

    function px(value){
        const n = Number.parseFloat(value);
        return Number.isFinite(n) ? n : 0;
    }

    function panelNaturalHeight(section){
        const body = section.querySelector('.mode-body');
        const border = Math.max(0, section.offsetHeight - section.clientHeight);

        if(!body){
            return Math.ceil(section.scrollHeight + border);
        }

        // section.scrollHeight already contains the visible body box. Replace
        // that box with body.scrollHeight to recover the full currently-visible
        // nested content even when the body is already scroll-constrained.
        const natural =
            section.scrollHeight -
            body.clientHeight +
            body.scrollHeight +
            border;

        return Math.ceil(Math.max(natural, 0));
    }

    function allocateTwo(naturalA, naturalB, available){
        const a = Math.max(0, naturalA);
        const b = Math.max(0, naturalB);
        const room = Math.max(0, available);

        if(a + b <= room){
            return [a, b];
        }

        // Max-min fair allocation: a naturally short panel keeps only what it
        // needs and the larger panel receives the remaining room. If both are
        // tall, they share the available height evenly.
        const half = room / 2;

        if(a <= b && a <= half){
            return [a, Math.max(0, room - a)];
        }

        if(b < a && b <= half){
            return [Math.max(0, room - b), b];
        }

        return [half, Math.max(0, room - half)];
    }

    function layoutPanels(){
        layoutFrame = 0;

        if(window.matchMedia('(min-width:901px)').matches){
            for(const section of sections){
                section.style.removeProperty('--stack-fit-height');
                section.classList.remove('panel-content-scrolls');
                delete section.dataset.fitNaturalHeight;
                delete section.dataset.fitAllocatedHeight;
            }
            return;
        }

        const railHeight = panelScroll.clientHeight;
        if(railHeight <= 0) return;

        const expanded = sections.filter(section => section.classList.contains('expanded'));
        const collapsed = sections.filter(section => !section.classList.contains('expanded'));

        for(const section of collapsed){
            section.style.removeProperty('--stack-fit-height');
            section.classList.remove('panel-content-scrolls');
            delete section.dataset.fitNaturalHeight;
            delete section.dataset.fitAllocatedHeight;
        }

        if(expanded.length === 0) return;

        const scrollStyle = getComputedStyle(panelScroll);
        const gap = px(scrollStyle.rowGap || scrollStyle.gap);
        const totalGaps = gap * Math.max(0, sections.length - 1);

        const collapsedHeight = collapsed.reduce((sum, section) => {
            return sum + section.getBoundingClientRect().height;
        }, 0);

        const available = Math.max(0, railHeight - totalGaps - collapsedHeight);
        const naturals = expanded.map(panelNaturalHeight);

        let allocations;
        if(expanded.length === 1){
            allocations = [Math.min(naturals[0], available)];
        }else if(expanded.length === 2){
            allocations = allocateTwo(naturals[0], naturals[1], available);
        }else{
            // Defensive fallback. Existing V3 logic prevents this on desktop
            // and mobile, but an even split remains viewport-safe if it occurs.
            const each = available / expanded.length;
            allocations = expanded.map(() => each);
        }

        expanded.forEach((section, index) => {
            const natural = Math.max(0, naturals[index]);
            const allocated = Math.max(0, Math.floor(allocations[index]));
            const value = `${allocated}px`;

            if(section.style.getPropertyValue('--stack-fit-height') !== value){
                section.style.setProperty('--stack-fit-height', value);
            }

            section.dataset.fitNaturalHeight = String(Math.round(natural));
            section.dataset.fitAllocatedHeight = String(allocated);
            section.classList.toggle('panel-content-scrolls', natural > allocated + 2);
        });
    }

    function scheduleLayout(followup = true){
        if(layoutFrame) cancelAnimationFrame(layoutFrame);
        layoutFrame = requestAnimationFrame(layoutPanels);

        if(followup){
            clearTimeout(followupTimer);
            followupTimer = setTimeout(() => {
                if(layoutFrame) cancelAnimationFrame(layoutFrame);
                layoutFrame = requestAnimationFrame(layoutPanels);
            }, 260);
        }
    }

    // Structural changes: panel open/close, nested accordions, market snapshot
    // population and other content that changes the natural card height.
    const mutationObserver = new MutationObserver(() => scheduleLayout());
    mutationObserver.observe(panelScroll, {
        subtree:true,
        childList:true,
        characterData:true,
        attributes:true,
        attributeFilter:['class','hidden','aria-expanded']
    });

    // Viewport / rail changes, including Map View wrapping at narrower widths.
    if('ResizeObserver' in window){
        const resizeObserver = new ResizeObserver(() => scheduleLayout(false));
        resizeObserver.observe(panelScroll);
        const mapView = panel.querySelector('.stack-map-view-control, #basemapControl');
        if(mapView) resizeObserver.observe(mapView);
    }

    // Existing controls can reveal/hide nested content synchronously or after
    // a short transition; schedule both the immediate and settled measurement.
    panelScroll.addEventListener('click', () => scheduleLayout(), true);
    panelScroll.addEventListener('change', () => scheduleLayout(), true);
    panelScroll.addEventListener('input', () => scheduleLayout(false), true);
    window.addEventListener('resize', () => scheduleLayout());

    // Tiny diagnostic hook for future UI work. It changes nothing and simply
    // reports the measured/allocated height of each card.
    window.atlasPanelFitState = function(){
        return sections.map(section => ({
            id:section.id,
            state:section.classList.contains('expanded') ? 'expanded' : 'collapsed',
            natural:Number(section.dataset.fitNaturalHeight || 0),
            allocated:Number(section.dataset.fitAllocatedHeight || 0),
            scrolling:section.classList.contains('panel-content-scrolls')
        }));
    };

    requestAnimationFrame(() => scheduleLayout());
    console.info('[ATLAS UI] Panel content-fit architecture V3.3 initialised.');
})();
// === PANEL STACK V3.3 CONTENT-FIT ARCHITECTURE END ===

// === PANEL STACK V3.4 COLLAPSED OPACITY CONTROLS START ===
// Fabric and Analysis keep their master opacity available even while their
// main panels are collapsed. The compact control mirrors the canonical range
// input so there remains one source of truth for each opacity value.
(function initCollapsedOpacityControlsV34(){
    const configs = [
        {
            sectionId:'fabricSection',
            sourceId:'fabricOpacity',
            sourceOutputId:'fabricOpacityValue',
            label:'Fabric opacity',
            panelLabel:'URBAN FABRIC',
            className:'fabric'
        },
        {
            sectionId:'analysisSection',
            sourceId:'analysisOpacity',
            sourceOutputId:'analysisOpacityValue',
            label:'Analysis opacity',
            panelLabel:'URBAN ANALYSIS',
            className:'analysis'
        },
        {
            sectionId:'marketSection',
            sourceId:'marketContextOpacity',
            sourceOutputId:'marketContextOpacityValue',
            label:'Market opacity',
            panelLabel:'MARKET DATA',
            className:'market'
        }
    ];

    for(const config of configs){
        const section = document.getElementById(config.sectionId);
        const source = document.getElementById(config.sourceId);
        const sourceOutput = document.getElementById(config.sourceOutputId);
        const header = section?.querySelector('.mode-header');
        const iconToggle = section?.querySelector('.mode-icon-toggle');

        if(!section || !source || !header || !iconToggle) continue;
        if(header.querySelector('.stack-collapsed-opacity')) continue;

        section.classList.add('has-collapsed-opacity');

        const compact = document.createElement('div');
        compact.className = `stack-collapsed-opacity stack-collapsed-opacity-${config.className}`;
        compact.setAttribute('aria-label', `${config.label} while panel is collapsed`);

        const meta = document.createElement('div');
        meta.className = 'stack-collapsed-opacity-meta';

        const label = document.createElement('span');
        label.className = 'stack-collapsed-opacity-label';
        label.textContent = config.panelLabel;

        const value = document.createElement('output');
        value.className = 'stack-collapsed-opacity-value';
        value.textContent = `${config.label} · ${Math.round(Number(source.value) || 0)}%`;

        meta.append(label, value);

        const proxy = document.createElement('input');
        proxy.type = 'range';
        proxy.className = 'stack-collapsed-opacity-range';
        proxy.min = source.min || '0';
        proxy.max = source.max || '100';
        proxy.step = source.step || '1';
        proxy.value = source.value;
        proxy.setAttribute('aria-label', config.label);

        compact.append(meta, proxy);
        header.insertBefore(compact, iconToggle);

        function syncFromSource(){
            proxy.value = source.value;
            value.textContent = `${config.label} · ${Math.round(Number(source.value) || 0)}%`;
        }

        function applyProxyValue(){
            source.value = proxy.value;
            source.dispatchEvent(new Event('input', {bubbles:true}));
            value.textContent = `${config.label} · ${Math.round(Number(proxy.value) || 0)}%`;
        }

        proxy.addEventListener('input', applyProxyValue);
        proxy.addEventListener('change', () => {
            applyProxyValue();
            source.dispatchEvent(new Event('change', {bubbles:true}));
        });
        source.addEventListener('input', syncFromSource);
        source.addEventListener('change', syncFromSource);

        // Keep slider gestures from becoming panel-collapse/expand gestures.
        for(const eventName of ['click','pointerdown','pointerup','touchstart','touchend']){
            compact.addEventListener(eventName, event => event.stopPropagation());
        }

        if(sourceOutput){
            const observer = new MutationObserver(syncFromSource);
            observer.observe(sourceOutput, {childList:true, characterData:true, subtree:true});
        }

        syncFromSource();
    }

    console.info('[ATLAS UI] Collapsed Fabric/Analysis/Market opacity controls initialised.');
})();
// === PANEL STACK V3.4 COLLAPSED OPACITY CONTROLS END ===

// === PANEL STACK V3.6 MOBILE UNIFIED RAIL START ===
// Keep the complete mobile control rail below the actual Atlas header. The
// header changes height briefly during the arrival animation, so static pixel
// offsets are not reliable. ResizeObserver keeps the safe top boundary current.
(function initMobileUnifiedRailV36(){
    const panel=document.getElementById('panel');
    const header=document.getElementById('header');
    if(!panel || !header || panel.dataset.mobileUnifiedRailV36==='ready') return;

    panel.dataset.mobileUnifiedRailV36='ready';
    const mobile=window.matchMedia('(max-width:900px)');
    let raf=0;

    function numberPx(value){
        const n=Number.parseFloat(value);
        return Number.isFinite(n)?n:0;
    }

    function update(){
        raf=0;
        if(!mobile.matches){
            panel.style.removeProperty('--mobile-stack-top-guard');
            panel.style.removeProperty('--mobile-map-view-height');
            return;
        }

        const panelStyle=getComputedStyle(panel);
        const railGap=Math.max(0, numberPx(panelStyle.rowGap || panelStyle.gap) || 8);
        const headerBottom=Math.max(0, header.getBoundingClientRect().bottom);
        const mapView=panel.querySelector('.stack-map-view-control, #basemapControl');
        const mapViewHeight=mapView ? Math.ceil(mapView.getBoundingClientRect().height) : 0;

        // The minimum separation from the header is deliberately the same as
        // the separation used between Map View and each legend panel.
        panel.style.setProperty('--mobile-stack-top-guard', `${Math.ceil(headerBottom + railGap)}px`);
        panel.style.setProperty('--mobile-map-view-height', `${mapViewHeight}px`);
    }

    function schedule(){
        if(raf) cancelAnimationFrame(raf);
        raf=requestAnimationFrame(update);
    }

    if('ResizeObserver' in window){
        const observer=new ResizeObserver(schedule);
        observer.observe(header);
        observer.observe(panel);
        const mapView=panel.querySelector('.stack-map-view-control, #basemapControl');
        if(mapView) observer.observe(mapView);
    }

    mobile.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    panel.addEventListener('click', schedule, true);

    requestAnimationFrame(schedule);
    console.info('[ATLAS UI] Mobile unified Map View + legend rail V3.6 initialised.');
})();
// === PANEL STACK V3.6 MOBILE UNIFIED RAIL END ===

// === UI + MARKET TRANSACTION V1 TEST MARKER ===


// =====================================================
// MOBILE CONTROL SHEET V2.6 — PRODUCTION
// Mobile replaces the stacked rail with one bottom sheet and category tabs.
// Desktop remains on the approved V1.4 three-panel architecture.
// =====================================================
(function initMobileControlSheetV2(){
    const panel = document.getElementById('panel');
    const panelScroll = document.getElementById('panelScroll');
    const launcher = document.getElementById('panelMinimize');
    const basemap = document.getElementById('basemapControl');
    if(!panel || !panelScroll || !launcher || !basemap || panel.dataset.mobileSheetV2 === 'ready') return;

    const mq = window.matchMedia('(max-width:900px)');
    const entries = [
        {key:'fabric', label:'FABRIC', section:document.getElementById('fabricSection'), icon:'assets/Fabric_Icon.png'},
        {key:'analysis', label:'ANALYSIS', section:document.getElementById('analysisSection'), icon:'assets/Analysis_Icon.png'},
        {key:'market', label:'MARKET', section:document.getElementById('marketSection'), icon:'assets/Market_Icon.png'}
    ].filter(x => x.section);
    if(entries.length !== 3) return;

    panel.dataset.mobileSheetV2 = 'ready';

    const chrome = document.createElement('div');
    chrome.className = 'mobile-sheet-chrome';
    chrome.setAttribute('aria-label','Atlas mobile controls');

    const grip = document.createElement('button');
    grip.type = 'button';
    grip.className = 'mobile-sheet-grip';
    grip.setAttribute('aria-label','Expand controls');
    grip.setAttribute('aria-pressed','false');
    grip.innerHTML = '<span aria-hidden="true"></span>';

    const tabs = document.createElement('div');
    tabs.className = 'mobile-sheet-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Atlas control categories');

    const tabSpecs = [
        {key:'map', label:'MAP', icon:null},
        ...entries.map(x => ({key:x.key,label:x.label,icon:x.icon}))
    ];

    const tabButtons = new Map();
    for(const spec of tabSpecs){
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mobile-sheet-tab';
        button.dataset.mobileSheetTab = spec.key;
        button.setAttribute('role','tab');
        button.setAttribute('aria-selected','false');
        button.setAttribute('aria-label',spec.label === 'MAP' ? 'Map View' : spec.label);

        if(spec.icon){
            const img = document.createElement('img');
            img.src = spec.icon;
            img.alt = '';
            img.setAttribute('aria-hidden','true');
            button.appendChild(img);
        }else{
            const mapIcon = document.createElement('span');
            mapIcon.className = 'mobile-sheet-map-icon';
            mapIcon.setAttribute('aria-hidden','true');
            mapIcon.innerHTML = '<i></i><i></i><i></i><i></i>';
            button.appendChild(mapIcon);
        }

        const text = document.createElement('span');
        text.textContent = spec.label;
        button.appendChild(text);
        tabs.appendChild(button);
        tabButtons.set(spec.key,button);
    }

    chrome.appendChild(grip);
    chrome.appendChild(tabs);
    panel.insertBefore(chrome,panel.firstChild);

    let activeKey = 'analysis';
    let dragStartY = null;

    function setActive(key, focus=false){
        if(!tabButtons.has(key)) key='analysis';
        activeKey=key;
        panel.dataset.mobileSheetTab=key;
        panel.classList.toggle('mobile-sheet-map-active',key==='map');

        for(const [tabKey,button] of tabButtons){
            const active=tabKey===key;
            button.classList.toggle('active',active);
            button.setAttribute('aria-selected',String(active));
            button.tabIndex=active ? 0 : -1;
        }

        basemap.classList.toggle('mobile-sheet-active',key==='map');
        panelScroll.classList.toggle('mobile-sheet-active',key!=='map');

        // Keep the legacy V3 panel state aligned with the mobile tab state.
        // This prevents the old collapsed-card rules from leaking a spare bar
        // into the sheet and stops the V3 observer fighting tab navigation.
        for(const entry of entries){
            const active=entry.key===key;
            entry.section.classList.toggle('mobile-sheet-active',active);
            entry.section.classList.toggle('expanded',active && key!=='map');
            entry.section.classList.toggle('collapsed',!active || key==='map');
            entry.section.setAttribute('aria-hidden',String(!active || key==='map'));
        }

        // Each category is one continuous scroll surface. Returning to the top
        // on tab change avoids inheriting a confusing scroll position from the
        // previously selected category.
        if(key!=='map'){
            panelScroll.scrollTop=0;
            const body=entries.find(entry => entry.key===key)?.section.querySelector('.mode-body');
            if(body) body.scrollTop=0;
        }

        if(focus) tabButtons.get(key)?.focus({preventScroll:true});
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }

    function syncLauncherText(){
        const closed=panel.classList.contains('panel-minimized');
        launcher.classList.toggle('mobile-sheet-launcher',mq.matches);
        launcher.dataset.mobileSheetClosed=String(closed);
        launcher.setAttribute('aria-label',closed ? 'Open Atlas controls' : 'Close Atlas controls');
    }

    function setTall(tall){
        panel.classList.toggle('mobile-sheet-tall',tall);
        grip.setAttribute('aria-pressed',String(tall));
        grip.setAttribute('aria-label',tall ? 'Reduce controls' : 'Expand controls');
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }

    function enterMobile(){
        panel.classList.add('mobile-control-sheet-v2');
        launcher.classList.add('mobile-sheet-launcher');
        setActive(activeKey);
        syncLauncherText();
    }

    function leaveMobile(){
        panel.classList.remove('mobile-control-sheet-v2','mobile-sheet-tall','mobile-sheet-map-active');
        panel.removeAttribute('data-mobile-sheet-tab');
        launcher.classList.remove('mobile-sheet-launcher');
        for(const entry of entries){
            entry.section.classList.remove('mobile-sheet-active');
            entry.section.removeAttribute('aria-hidden');
        }
        basemap.classList.remove('mobile-sheet-active');
        panelScroll.classList.remove('mobile-sheet-active');
    }

    function syncMode(){
        if(mq.matches) enterMobile();
        else leaveMobile();
    }

    // Bind each tab directly rather than relying on delegation through the
    // legacy panel stack. This is more reliable for touch input and isolates
    // mobile category navigation from the old panel interaction handlers.
    for(const [key,button] of tabButtons){
        button.addEventListener('click',event => {
            event.preventDefault();
            event.stopPropagation();
            setActive(key,false);
        });
    }

    tabs.addEventListener('keydown',event => {
        if(!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        const keys=tabSpecs.map(x => x.key);
        const index=keys.indexOf(activeKey);
        const delta=event.key==='ArrowRight' ? 1 : -1;
        const next=keys[(index+delta+keys.length)%keys.length];
        event.preventDefault();
        setActive(next,true);
    });

    grip.addEventListener('click',()=>setTall(!panel.classList.contains('mobile-sheet-tall')));
    grip.addEventListener('pointerdown',event => {
        dragStartY=event.clientY;
        try{ grip.setPointerCapture(event.pointerId); }catch(_e){}
    });
    grip.addEventListener('pointerup',event => {
        if(dragStartY===null) return;
        const dy=event.clientY-dragStartY;
        dragStartY=null;
        if(Math.abs(dy)<28) return;
        setTall(dy<0);
    });

    // Existing canonical launcher logic still owns panel-minimized. Observe it
    // so the pill text and state remain synchronised without duplicating logic.
    new MutationObserver(() => syncLauncherText()).observe(panel,{attributes:true,attributeFilter:['class']});

    mq.addEventListener('change',syncMode);
    requestAnimationFrame(syncMode);

    window.UGAMobileControlSheetState = () => ({
        mobile:mq.matches,
        open:!panel.classList.contains('panel-minimized'),
        tab:activeKey,
        tall:panel.classList.contains('mobile-sheet-tall')
    });

    console.info('[ATLAS UI] Mobile Control Sheet V2.6 initialised.');
})();

// === IA V1.7 PRODUCTION RUNTIME START ===
/* =============================================================
   URBAN GENETICS ATLAS — INFORMATION ARCHITECTURE V1.7 — PRODUCTION
   Non-destructive runtime layer over the current canonical Atlas.
   ============================================================= */
(() => {
    'use strict';

    const VERSION = 'IA-v1.7-production';
    const WELCOME_KEY = 'urbanGeneticsAtlasWelcomeDismissed';
    const MOBILE_QUERY = window.matchMedia('(max-width:900px)');

    const DOMAIN_PANEL_IDS = [
        'fabricSection',
        'analysisSection',
        'marketSection',
        'demographicsSection',
        'climateSection'
    ];
    const railRecency = new Map();
    let railSequence = 0;
    let railReconciling = false;

    const FABRIC_MEASURE_LAYER_ID = 'fabric-measure-atlas';
    const fabricMeasureState = {
        theme:'',
        visible:true
    };
    let fabricMeasureLayerReady = false;

    const DEMOGRAPHICS_LAYER_ID = 'demographics-atlas';
    const demographicsState = {
        visible:false,
        opacity:100,
        theme:'Population per Building'
    };
    let demographicsLayerReady = false;
    let demographicsMapClickBound = false;
    let marketLastVisibleSelection = null;

    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    function dispatchChange(el){
        if(!el) return;
        el.dispatchEvent(new Event('change', { bubbles:true }));
    }

    function setChecked(el, checked){
        if(!el) return;
        if(el.checked !== checked){
            el.checked = checked;
            dispatchChange(el);
        }
    }

    function optionValueMatching(select, matcher){
        if(!select) return null;
        const option = Array.from(select.options).find(o => matcher.test(`${o.value} ${o.textContent}`));
        return option ? option.value : null;
    }

    function setSelectValue(select, value){
        if(!select || value == null) return false;
        const found = Array.from(select.options).some(o => o.value === value);
        if(!found) return false;
        select.value = value;
        dispatchChange(select);
        return true;
    }

    function panelIsMinimised(){
        return $('#panel')?.classList.contains('panel-minimized');
    }

    function openPanelShell(){
        const btn = $('#panelMinimize');
        if(panelIsMinimised() && btn) btn.click();
    }

    function isCollapsed(section){
        return !!section && section.classList.contains('collapsed') && !section.classList.contains('expanded');
    }

    function setSectionExpanded(section, expanded){
        if(!section) return;
        const body = $('.mode-body', section);
        const toggle = $('.mode-chevron', section);
        const iconToggle = $('.mode-icon-toggle, .uga-domain-icon-toggle', section);
        section.classList.toggle('expanded', expanded);
        section.classList.toggle('collapsed', !expanded);
        if(body) body.style.display = expanded ? '' : 'none';
        const title = $('.mode-title', section)?.textContent?.trim() || 'section';
        if(toggle){
            toggle.setAttribute('aria-expanded', String(expanded));
            toggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${title}`);
            if(!toggle.classList.contains('mode-icon-toggle')){
                toggle.textContent = expanded ? '▾' : '▸';
            }
        }
        if(iconToggle){
            iconToggle.setAttribute('aria-expanded', String(expanded));
            iconToggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${title}`);
            iconToggle.title = `${expanded ? 'Collapse' : 'Expand'} ${title}`;
        }
    }

    function domainPanels(){
        return DOMAIN_PANEL_IDS.map(id => document.getElementById(id)).filter(Boolean);
    }

    function markPanelRecent(section){
        if(!section) return;
        railRecency.set(section.id, ++railSequence);
    }

    function nativePanelToggle(section){
        if(!section) return null;
        return section.querySelector(
            '.mode-icon-toggle, .uga-domain-icon-toggle, .stack-mode-icon, .mode-icon-button, .mode-chevron, button[aria-controls]'
        );
    }

    function setPanelExpandedCompat(section, expanded){
        if(!section) return;
        const current = section.classList.contains('expanded') && !section.classList.contains('collapsed');
        if(current === expanded){
            if(expanded) markPanelRecent(section);
            return;
        }

        // New IA panels are controlled here. Existing Fabric / Analysis / Market
        // retain their native click handlers so their opacity bars / icon states
        // remain exactly in sync with the established rail behaviour.
        if(section.dataset.ugaDomainPanel === 'true'){
            setSectionExpanded(section, expanded);
        } else {
            const control = nativePanelToggle(section);
            if(control){
                control.click();
            } else {
                setSectionExpanded(section, expanded);
            }
        }
        if(expanded) markPanelRecent(section);
    }

    function limitDesktopPanels(_preferred){
        // V1.0 desktop policy: no automatic panel collapsing.
        // Panels only minimise when their own top-level icon is clicked.
        return;
    }

    function revealRailPanel(section){
        if(!section || MOBILE_QUERY.matches) return;
        requestAnimationFrame(() => window.UGAFocusRailPanel?.(section));
    }

    function activateDesktopSection(section){
        if(!section) return;
        openPanelShell();
        setPanelExpandedCompat(section, true);
        limitDesktopPanels(section);
        revealRailPanel(section);
    }


    let analysisLegend = null;
    let analysisControls = null;
    let legendHome = null;
    let controlsHome = null;
    let proxyChanging = false;
    let owner = 'analysis';

    function prepareSharedAnalysisUI(){
        analysisLegend = $('#analysisLegend');
        analysisControls = $('#analysisControls');
        if(analysisLegend && !$('#analysisLegendHome')){
            legendHome = document.createElement('div');
            legendHome.id = 'analysisLegendHome';
            analysisLegend.parentNode.insertBefore(legendHome, analysisLegend);
        } else {
            legendHome = $('#analysisLegendHome');
        }
        if(analysisControls && !$('#analysisControlsHome')){
            controlsHome = document.createElement('div');
            controlsHome.id = 'analysisControlsHome';
            analysisControls.parentNode.insertBefore(controlsHome, analysisControls);
        } else {
            controlsHome = $('#analysisControlsHome');
        }
    }

    function moveSharedAnalysisUI(target){
        installRailFocus();
        prepareSharedAnalysisUI();
        if(target === 'analysis'){
            if(controlsHome && analysisControls) controlsHome.after(analysisControls);
            if(legendHome && analysisLegend) legendHome.after(analysisLegend);
            owner = 'analysis';
            return;
        }
        const host = target === 'fabric' ? $('#fabricMeasureLegendHost') : $('#demographicsLegendHost');
        if(!host) return;
        if(analysisControls) host.appendChild(analysisControls);
        if(analysisLegend) host.appendChild(analysisLegend);
        owner = target;
    }

    function themeSelect(){ return $('#theme'); }
    function analysisToggle(){ return $('#analysisToggle'); }

    function restoreRehomedOwner(targetOwner){
        if(targetOwner === 'analysis') return;
        const analysisSection = $('#analysisSection');
        if(MOBILE_QUERY.matches){
            analysisSection?.classList.remove('mobile-sheet-active');
            analysisSection?.setAttribute('aria-hidden','true');
            return;
        }
        // V1.5 desktop contract: changing a selector or moving shared legend
        // content must never open/close any top-level panel. Panel state is
        // controlled only by that panel's own top-right icon.
        return;
    }

    function activateTheme(value, targetOwner){
        const select = themeSelect();
        if(!select || value == null) return false;
        proxyChanging = true;
        const ok = setSelectValue(select, value);
        proxyChanging = false;
        if(!ok) return false;
        setChecked(analysisToggle(), true);
        moveSharedAnalysisUI(targetOwner);
        restoreRehomedOwner(targetOwner);
        return true;
    }

    function allowedAnalysisOption(option){
        const t = `${option.value} ${option.textContent}`;
        return /Urban Genetic Signature|UGS|Development Pressure|Renewal Potential|Genesis Potential/i.test(t);
    }

    function organiseAnalysisSelector(){
        const select = themeSelect();
        if(!select) return;
        Array.from(select.options).forEach(option => {
            if(!allowedAnalysisOption(option)){
                option.hidden = true;
                option.dataset.ugaRehomed = 'true';
            }
        });
        const label = $('#analysisSelectorControl .section-label');
        if(label) label.textContent = 'Choose an analysis:';
        const desc = $('#analysisSection .mode-description');
        if(desc) desc.textContent = 'Higher-order patterns that emerge when different parts of the city are read together.';
        const title = $('#analysisSection .mode-title');
        if(title) title.textContent = 'Urban Analysis';
        $('#analysisSelectorControl')?.classList.add('uga-selector-block');
        $('#analysisControls')?.classList.add('uga-selector-block','uga-planning-selector-block');
        select.classList.add('uga-domain-select');
        $('#capacityContext')?.classList.add('uga-domain-select');

        select.addEventListener('change', () => {
            if(proxyChanging) return;
            owner = 'analysis';
        });
    }

    function createFabricMeasures(){
        const body = $('#fabricBody');
        if(!body || $('#fabricMeasureControl')) return;
        const first = body.firstElementChild;
        const block = document.createElement('div');
        block.id = 'fabricMeasureControl';
        block.className = 'uga-domain-measures uga-selector-block';
        block.innerHTML = `
            <div class="uga-domain-kicker">BUILT-CITY MEASURES</div>
            <div class="uga-domain-note">Derived readings of capacity and connectivity that describe the existing urban fabric.</div>
            <label class="section-label" for="fabricMeasureTheme">Choose a measure:</label>
            <select id="fabricMeasureTheme" class="uga-domain-select">
                <option value="">None</option>
                <option value="GFA - Saturation">GFA Saturation</option>
                <option value="Latent Urban Capacity">Latent Urban Capacity</option>
                <option value="MTR - Index (Built)">MTR Built Accessibility</option>
            </select>
            <div id="fabricMeasureLegendHost" class="uga-shared-legend-host"></div>
            <hr class="mode-divider">
        `;
        body.insertBefore(block, first || null);
        const title = $('#fabricSection .mode-title');
        if(title) title.textContent = 'Fabric';
        const desc = $('#fabricSection .mode-description');
        if(desc) desc.textContent = 'The physical city — land, buildings, connections, history and capacity.';

        const select = $('#fabricMeasureTheme');
        select?.addEventListener('change', () => {
            fabricMeasureState.theme = select.value || '';
            updateFabricMeasureRenderer();
            renderFabricMeasureLegend();
        });
    }

    function makeModePanel({id,title,description,bodyHtml,comingSoon=false,iconSrc,infoKey}){
        const section = document.createElement('section');
        section.id = id;
        section.className = `mode-panel collapsed has-collapsed-opacity uga-domain-panel${comingSoon ? ' uga-coming-soon-panel' : ''}`;
        section.dataset.ugaDomainPanel = 'true';
        const isClimate = id === 'climateSection';
        const compactValue = isClimate
            ? 'Opacity · <span data-uga-climate-opacity-value>100%</span>'
            : 'Opacity · <span data-uga-demo-opacity-value>100%</span>';
        section.innerHTML = `
            <div class="mode-header">
                <div class="mode-header-text">
                    <div class="mode-title-line">
                        <div class="mode-title">${title}</div>
                        <button type="button" class="info-trigger" data-info-key="${infoKey || id.replace('Section','')}" aria-label="About ${title}" title="About ${title}">ⓘ</button>
                        ${comingSoon ? '<span class="uga-coming-soon-badge">COMING SOON</span>' : ''}
                    </div>
                    <div class="mode-description">${description}</div>
                </div>
                <div class="stack-collapsed-opacity uga-native-peer-compact" aria-label="${title} compact controls">
                    <div class="stack-collapsed-opacity-meta">
                        <span class="stack-collapsed-opacity-label">${title.toUpperCase()}</span>
                        <output class="stack-collapsed-opacity-value">${compactValue}</output>
                    </div>
                    <input type="range" class="stack-collapsed-opacity-range" ${isClimate ? 'data-uga-climate-opacity disabled' : 'data-uga-demo-opacity'} min="0" max="100" step="1" value="100" aria-label="${title} opacity${isClimate ? ' — coming soon' : ''}">
                </div>
                <button type="button" class="mode-icon-toggle uga-domain-icon-toggle" id="${id}Toggle" aria-expanded="false" aria-label="Expand ${title}" aria-controls="${id}Body" title="Expand ${title}">
                    <img class="mode-stack-icon" src="${iconSrc}" alt="" aria-hidden="true">
                </button>
            </div>
            <div id="${id}Body" class="mode-body" style="display:none;">${bodyHtml}</div>
        `;
        const button = section.querySelector('.mode-icon-toggle');
        button?.addEventListener('click', event => {
            if(MOBILE_QUERY.matches) return;
            event.preventDefault();
            event.stopPropagation();
            const open = section.classList.contains('collapsed');
            setSectionExpanded(section, open);
            if(open) revealRailPanel(section);
        });
        // Slider gestures must never become expand/collapse gestures.
        const compact = section.querySelector('.uga-native-peer-compact');
        for(const eventName of ['click','pointerdown','pointerup','touchstart','touchend']){
            compact?.addEventListener(eventName,event => event.stopPropagation());
        }
        return section;
    }


    function createDemographicsPanel(){
        if($('#demographicsSection')) return;
        const panelScroll = $('#panelScroll');
        if(!panelScroll) return;
        const section = makeModePanel({
            id:'demographicsSection',
            title:'Demographics',
            description:'Where people live and how population and living conditions vary across the city.',
            iconSrc:'assets/Demographics_Icon.png',
            infoKey:'demographics',
            bodyHtml:`
                <label class="toggle uga-domain-master-toggle">
                    <input type="checkbox" id="demographicsToggle">
                    <span>Show Demographics</span>
                </label>
                <div id="demographicsOpacityHost" class="uga-domain-opacity-host"></div>
                <div class="uga-selector-block uga-domain-selector-block">
                <label class="section-label" for="demographicsTheme">Choose a demographic view:</label>
                <select id="demographicsTheme" class="uga-domain-select">
                    <option value="Population per Building">Population Intensity</option>
                    <option value="GFA per Capita">Living Space (sqm/cap)</option>
                </select>
                </div>
                <div class="uga-domain-note uga-method-note">Current Atlas estimates are shown here while the demographic foundation is being rebuilt from finer Census geography.</div>
                <hr class="mode-divider">
                <div id="demographicsLegendHost" class="uga-demographics-legend-host"></div>
            `
        });
        panelScroll.appendChild(section);

        const select = $('#demographicsTheme');
        const toggle = $('#demographicsToggle');
        select?.addEventListener('change', () => {
            demographicsState.theme = select.value;
            if(toggle && !toggle.checked){
                toggle.checked = true;
                demographicsState.visible = true;
            }
            updateDemographicsRenderer();
            renderDemographicsLegend();
        });
        toggle?.addEventListener('change', () => {
            demographicsState.visible = !!toggle.checked;
            updateDemographicsRenderer();
        });
    }

    function createClimatePanel(){
        if($('#climateSection')) return;
        const panelScroll = $('#panelScroll');
        if(!panelScroll) return;
        const section = makeModePanel({
            id:'climateSection',
            title:'Climate',
            description:'Heat, terrain and environmental conditions across the city.',
            comingSoon:true,
            iconSrc:'assets/Climate_Icon.png',
            infoKey:'climate',
            bodyHtml:`
                <div class="uga-coming-soon-content">
                    <div class="uga-domain-kicker">CLIMATE MODULE</div>
                    <p>Heat and flood / coastal exposure are being developed as the first public climate views.</p>
                    <p class="uga-domain-note">Coming soon. No climate layer is shown yet.</p>
                </div>
            `
        });
        panelScroll.appendChild(section);
    }

    function improveMarketSection(){
        const section = $('#marketSection');
        if(!section) return;
        const title = $('.mode-title', section);
        if(title) title.textContent = 'Market';
        let desc = $('.mode-description', section);
        if(!desc){
            desc = document.createElement('div');
            desc.className = 'mode-description';
            $('.mode-header-text', section)?.appendChild(desc);
        }
        if(desc) desc.textContent = 'Property and transaction activity — from broad market context to local exposure.';
        ensureMarketVisibilityControl();
        normaliseMarketOpacityRange();
    }

    function hideMarketFromAnalysis(){
        const select = themeSelect();
        if(!select) return;
        Array.from(select.options).forEach(option => {
            if(/market/i.test(`${option.value} ${option.textContent}`)){
                option.hidden = true;
                option.disabled = true;
                option.dataset.ugaRehomed = 'true';
            }
        });
        // Remove the now-empty / misleading "Market analysis" group header as
        // Market is a first-class domain rather than an Urban Analysis mode.
        Array.from(select.querySelectorAll('optgroup')).forEach(group => {
            const options = Array.from(group.querySelectorAll('option'));
            const hasVisible = options.some(option => !option.hidden && !option.disabled);
            if(/market/i.test(group.label || '') || !hasVisible){
                group.hidden = true;
                group.disabled = true;
                group.style.display = 'none';
            }
        });
    }

    function normaliseTopLevelControls(){
        const selectorBlocks = [
            $('#analysisSelectorControl'),
            $('#analysisControls'),
            $('#fabricMeasureControl'),
            $('#demographicsSection .uga-domain-selector-block')
        ].filter(Boolean);
        selectorBlocks.forEach(block => block.classList.add('uga-selector-block'));
        [$('#theme'),$('#capacityContext'),$('#fabricMeasureTheme'),$('#demographicsTheme')].filter(Boolean).forEach(select => select.classList.add('uga-domain-select'));
        $$('#marketSection select').forEach(select => {
            select.classList.add('uga-domain-select');
            select.closest('div')?.classList.add('uga-market-selector-host');
        });
    }

    function watchMarketControls(){
        const market = $('#marketSection');
        if(!market || market.dataset.ugaControlObserver === 'true') return;
        market.dataset.ugaControlObserver = 'true';
        let attempts = 0;
        const settle = () => {
            attempts += 1;
            normaliseTopLevelControls();
            ensureMarketVisibilityControl();
            normaliseMarketOpacityRange();
            syncMarketVisibilityToggle();
            const ready = initialiseMarketViewPresentation();
            if(ready || attempts >= 50) clearInterval(timer);
        };
        // Market content arrives asynchronously. Poll until its canonical control
        // exists instead of observing our own DOM writes and creating a feedback loop.
        const timer = setInterval(settle, 200);
        settle();
    }

    const FABRIC_MEASURE_INFO = {
        'GFA - Saturation':{
            title:'GFA Saturation',
            description:'Shows how much of the estimated development capacity is already realised in each hex.',
            gradient:'linear-gradient(90deg,rgba(86,190,238,.30),rgb(80,162,238),rgb(57,12,109))',
            info:'GFA Saturation compares estimated realised floor area with modelled development capacity. It describes capacity utilisation rather than development feasibility, ownership or permission to build.'
        },
        'Latent Urban Capacity':{
            title:'Latent Urban Capacity',
            description:'Shows the share of estimated development capacity that remains unrealised in each hex.',
            gradient:'linear-gradient(90deg,rgba(226,226,244,.35),rgb(126,108,190),rgb(38,18,92))',
            info:'Latent Urban Capacity is the remaining side of the modelled capacity relationship. A high value does not necessarily mean vacant land or an immediately developable site.'
        },
        'MTR - Index (Built)':{
            title:'MTR Built Accessibility',
            description:'Shows relative accessibility associated with the existing MTR network.',
            gradient:'linear-gradient(90deg,rgba(220,245,220,.35),rgb(255,241,118),rgb(0,77,64))',
            info:'MTR Built Accessibility is a relative measure based on proximity and network connectivity to the built MTR system. It is not a direct measure of journey time, service frequency or passenger volume.'
        }
    };

    function fabricMeasureColourExpression(theme){
        if(theme === 'GFA - Saturation'){
            return ['case',
                ['==',['coalesce',['to-number',['get','GFA - Saturation']],0],0],
                'rgba(255,255,255,0.00)',
                ['interpolate',['linear'],['coalesce',['to-number',['get','GFA - Saturation']],0],
                    0.10,'rgba(86,190,238,0.25)',
                    0.25,'rgba(111,184,206,0.55)',
                    0.50,'rgba(80,162,238,0.62)',
                    0.70,'rgba(41,73,254,0.62)',
                    0.85,'rgba(73,2,204,0.62)',
                    1.00,'rgba(57,12,109,0.62)']
            ];
        }
        if(theme === 'Latent Urban Capacity'){
            return ['interpolate',['linear'],['coalesce',['to-number',['get','Latent Urban Capacity']],0],
                0.00,'rgba(255,255,255,0.00)',
                0.10,'rgba(226,226,244,0.25)',
                0.25,'rgba(194,186,226,0.55)',
                0.40,'rgba(157,145,209,0.62)',
                0.55,'rgba(126,108,190,0.62)',
                0.70,'rgba(95,73,169,0.62)',
                0.85,'rgba(68,45,139,0.62)',
                1.00,'rgba(38,18,92,0.62)'];
        }
        if(theme === 'MTR - Index (Built)'){
            return ['interpolate',['linear'],
                ['/',['ln',['+',1,['coalesce',['to-number',['get','MTR - Index (Built)']],0]]],2],
                0.00,'rgba(255,255,255,0.00)',
                0.05,'rgba(220,245,220,0.25)',
                0.15,'rgba(229,230,170,0.55)',
                0.30,'rgba(255,241,118,0.62)',
                0.45,'rgba(220,231,117,0.62)',
                0.60,'rgba(156,204,101,0.62)',
                0.75,'rgba(102,187,106,0.62)',
                0.88,'rgba(46,125,50,0.62)',
                1.00,'rgba(0,77,64,0.62)'];
        }
        return 'rgba(255,255,255,0.00)';
    }

    function fabricOpacityPercent(){
        const input = findOpacitySlider($('#fabricSection'));
        if(!input) return 100;
        const raw = Number(input.value || 0);
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        if(max <= 1) return Math.round(Math.max(0,Math.min(1,raw)) * 100);
        const span = Math.max(1e-9,max-min);
        return Math.round(Math.max(0,Math.min(1,(raw-min)/span)) * 100);
    }

    function fabricMeasureOpacityExpression(){
        const scale = fabricOpacityPercent() / 100;
        return ['interpolate',['linear'],['zoom'],
            8,0.55*scale,
            12,0.78*scale,
            15,0.90*scale];
    }

    function ensureFabricMeasureLayer(){
        if(typeof map === 'undefined' || !map) return false;
        if(map.getLayer(FABRIC_MEASURE_LAYER_ID)){
            fabricMeasureLayerReady = true;
            return true;
        }
        if(!map.getSource('atlas')) return false;
        const before = map.getLayer('atlas') ? 'atlas' : (map.getLayer('hover') ? 'hover' : undefined);
        const layer = {
            id:FABRIC_MEASURE_LAYER_ID,
            type:'fill',
            source:'atlas',
            'source-layer':demographicsSourceLayer(),
            layout:{visibility:'none'},
            paint:{
                'fill-color':fabricMeasureColourExpression(fabricMeasureState.theme),
                'fill-opacity':fabricMeasureOpacityExpression(),
                'fill-outline-color':'rgba(60,60,60,0.035)'
            }
        };
        try{
            if(before) map.addLayer(layer,before); else map.addLayer(layer);
        }catch(err){
            fabricMeasureLayerReady=false;
            console.error('[ATLAS IA] Fabric measure layer creation failed:',err);
            return false;
        }
        fabricMeasureLayerReady=!!map.getLayer(FABRIC_MEASURE_LAYER_ID);
        return fabricMeasureLayerReady;
    }

    function fabricMeasureVisible(){
        const master=$('#fabricToggle');
        return !!fabricMeasureState.theme && (!master || !!master.checked);
    }

    function updateFabricMeasureRenderer(){
        if(!fabricMeasureState.theme){
            if(typeof map !== 'undefined' && map?.getLayer?.(FABRIC_MEASURE_LAYER_ID)){
                map.setLayoutProperty(FABRIC_MEASURE_LAYER_ID,'visibility','none');
            }
            return;
        }
        if(!ensureFabricMeasureLayer() || !map.getLayer(FABRIC_MEASURE_LAYER_ID)) return;
        map.setPaintProperty(FABRIC_MEASURE_LAYER_ID,'fill-color',fabricMeasureColourExpression(fabricMeasureState.theme));
        map.setPaintProperty(FABRIC_MEASURE_LAYER_ID,'fill-opacity',fabricMeasureOpacityExpression());
        map.setLayoutProperty(FABRIC_MEASURE_LAYER_ID,'visibility',fabricMeasureVisible() ? 'visible' : 'none');
    }

    function renderFabricMeasureLegend(){
        const host=$('#fabricMeasureLegendHost');
        if(!host) return;
        const info=FABRIC_MEASURE_INFO[fabricMeasureState.theme];
        if(!info){ host.innerHTML=''; return; }
        host.innerHTML=`
            <div class="uga-fabric-measure-legend">
                <div class="legend-title-row uga-fabric-measure-heading">
                    <h3 class="uga-fabric-measure-title">${info.title}</h3>
                    <button type="button" class="info-trigger uga-fabric-measure-info-trigger" data-info-key="fabric:${fabricMeasureState.theme}" aria-label="About ${info.title}" title="About ${info.title}">i</button>
                </div>
                <div class="uga-fabric-measure-copy">${info.description}</div>
                <div class="uga-fabric-measure-gradient" style="background:${info.gradient}"></div>
                <div class="uga-fabric-measure-gradient-labels"><span>Lower</span><span>Higher</span></div>
            </div>`;
    }

    function initialiseFabricMeasureRenderer(){
        const select=$('#fabricMeasureTheme');
        if(select) fabricMeasureState.theme=select.value || '';
        const master=$('#fabricToggle');
        master?.addEventListener('change',updateFabricMeasureRenderer);
        const fabric=$('#fabricSection');
        if(fabric && fabric.dataset.ugaFabricRendererBound!=='true'){
            fabric.dataset.ugaFabricRendererBound='true';
            const opacityEvent=event=>{
                const input=event.target;
                if(!(input instanceof HTMLInputElement) || input.type!=='range') return;
                const context=`${input.id||''} ${input.className||''} ${input.closest('div,section,label')?.textContent||''}`;
                if(/opacity/i.test(context)) updateFabricMeasureRenderer();
            };
            fabric.addEventListener('input',opacityEvent,true);
            fabric.addEventListener('change',opacityEvent,true);
        }
        const boot=()=>{
            updateFabricMeasureRenderer();
            renderFabricMeasureLegend();
        };
        if(typeof map!=='undefined' && map){
            if(map.loaded()) boot(); else map.on('load',boot);
        }
    }

    function demographicsColourExpression(theme){
        if(theme === 'GFA per Capita'){
            return [
                'interpolate',['linear'],
                ['sqrt',['coalesce',['to-number',['get','GFA per Capita']],0]],
                0,'rgba(255,255,255,0.00)',
                3,'rgba(220,245,220,0.25)',
                5,'rgba(185,226,185,0.55)',
                7,'rgba(161,217,155,0.62)',
                9,'rgba(135,196,116,0.62)',
                11,'rgba(95,171,65,0.62)',
                13,'rgba(56,139,35,0.62)',
                15,'rgba(16,68,0,0.62)'
            ];
        }
        return [
            'interpolate',['linear'],
            ['ln',['+',1,['coalesce',['to-number',['get','Population per Building']],0]]],
            0,'rgba(255,255,255,0.00)',
            1,'rgba(245,240,220,0.25)',
            2,'rgba(230,199,170,0.55)',
            3,'rgba(252,146,114,0.62)',
            4,'rgba(253,131,104,0.62)',
            5,'rgba(238,88,74,0.62)',
            6,'rgba(199,62,67,0.62)',
            7,'rgba(112,35,45,0.62)'
        ];
    }

    function demographicsOpacityExpression(){
        const scale = Math.max(0, Math.min(1, demographicsState.opacity / 100));
        return [
            'interpolate',['linear'],['zoom'],
            8, 0.55 * scale,
            12, 0.78 * scale,
            15, 0.90 * scale
        ];
    }

    function demographicsSourceLayer(){
        try{
            const atlasLayer = map.getLayer('atlas');
            if(atlasLayer && atlasLayer['source-layer']) return atlasLayer['source-layer'];
        } catch(_err){}
        return (typeof ATLAS_SOURCE_LAYER !== 'undefined' && ATLAS_SOURCE_LAYER) ? ATLAS_SOURCE_LAYER : 'atlas';
    }

    function ensureDemographicsLayer(){
        if(typeof map === 'undefined' || !map) return false;
        if(map.getLayer(DEMOGRAPHICS_LAYER_ID)){
            demographicsLayerReady = true;
            return true;
        }
        if(!map.getSource('atlas')) return false;
        const before = map.getLayer('hover') ? 'hover' : undefined;
        const layer = {
            id:DEMOGRAPHICS_LAYER_ID,
            type:'fill',
            source:'atlas',
            'source-layer':demographicsSourceLayer(),
            layout:{ visibility:demographicsState.visible ? 'visible' : 'none' },
            paint:{
                'fill-color':demographicsColourExpression(demographicsState.theme),
                'fill-opacity':demographicsOpacityExpression(),
                'fill-outline-color':'rgba(60,60,60,0.035)'
            }
        };
        try{
            if(before) map.addLayer(layer,before); else map.addLayer(layer);
        } catch(err){
            demographicsLayerReady = false;
            console.error('[ATLAS IA] Demographics layer creation failed:', err);
            return false;
        }
        demographicsLayerReady = !!map.getLayer(DEMOGRAPHICS_LAYER_ID);
        return demographicsLayerReady;
    }

    function updateDemographicsRenderer(){
        if(!ensureDemographicsLayer() || !map.getLayer(DEMOGRAPHICS_LAYER_ID)) return;
        map.setPaintProperty(DEMOGRAPHICS_LAYER_ID,'fill-color',demographicsColourExpression(demographicsState.theme));
        map.setPaintProperty(DEMOGRAPHICS_LAYER_ID,'fill-opacity',demographicsOpacityExpression());
        map.setLayoutProperty(DEMOGRAPHICS_LAYER_ID,'visibility',demographicsState.visible ? 'visible' : 'none');
        syncDemographicsOpacityUI();
    }

    function setDemographicsOpacity(value){
        demographicsState.opacity = Math.round(Math.max(0,Math.min(100,Number(value) || 0)));
        updateDemographicsRenderer();
    }

    function renderDemographicsLegend(){
        const host = $('#demographicsLegendHost');
        if(!host) return;
        const living = demographicsState.theme === 'GFA per Capita';
        const title = living ? 'Living Space' : 'Population Intensity';
        const desc = living
            ? 'Estimated residential floor area per resident within each hex.'
            : 'Estimated number of residents associated with buildings within each hex.';
        const gradient = living
            ? 'linear-gradient(90deg,rgba(220,245,220,.35),rgb(135,196,116),rgb(16,68,0))'
            : 'linear-gradient(90deg,rgba(245,240,220,.35),rgb(252,146,114),rgb(112,35,45))';
        const infoKey = living ? 'demographics:GFA per Capita' : 'demographics:Population per Building';
        host.innerHTML = `
            <div class="uga-demographics-legend">
                <div class="legend-title-row uga-demographics-legend-heading">
                    <h3 class="uga-demographics-legend-title">${title}</h3>
                    <button type="button" class="info-trigger uga-demographics-info-trigger" data-info-key="${infoKey}" aria-label="About ${title}" title="About ${title}">i</button>
                </div>
                <div class="uga-demographics-legend-copy">${desc}</div>
                <div class="uga-demographics-gradient" style="background:${gradient}"></div>
                <div class="uga-demographics-gradient-labels"><span>Lower</span><span>Higher</span></div>
            </div>
        `;
    }

    function syncDemographicsOpacityUI(){
        const pct = `${demographicsState.opacity}%`;
        $$('#demographicsSection input[data-uga-demo-opacity]').forEach(input => { input.value = String(demographicsState.opacity); });
        $$('#demographicsSection [data-uga-demo-opacity-value]').forEach(el => { el.textContent = pct; });
    }

    function initialiseDemographicsOpacity(){
        const expanded = $('#demographicsOpacityHost');
        const collapsed = $('#demographicsSection .uga-native-peer-compact');
        if(expanded && expanded.dataset.ugaOpacityReady !== 'true'){
            expanded.dataset.ugaOpacityReady='true';
            expanded.innerHTML = `
                <div class="uga-domain-opacity-card">
                    <div class="uga-domain-opacity-head"><span>DEMOGRAPHICS OPACITY</span><strong data-uga-demo-opacity-value>100%</strong></div>
                    <input data-uga-demo-opacity type="range" min="0" max="100" step="1" value="100" aria-label="Demographics opacity">
                </div>`;
        }
        $$('#demographicsSection input[data-uga-demo-opacity]').forEach(input => {
            if(input.dataset.ugaBound === 'true') return;
            input.dataset.ugaBound='true';
            input.addEventListener('input',() => setDemographicsOpacity(input.value));
        });
        syncDemographicsOpacityUI();
    }

    function bindDemographicsMapClick(){
        if(demographicsMapClickBound || typeof map === 'undefined' || !map) return;
        demographicsMapClickBound = true;
        map.on('click', (e) => {
            if(!demographicsState.visible) return;
            if(!map.getLayer(DEMOGRAPHICS_LAYER_ID)) return;
            const feature = map.queryRenderedFeatures(e.point,{layers:[DEMOGRAPHICS_LAYER_ID]})[0] || null;
            if(!feature) return;
            if(typeof showPopup === 'function') showPopup(feature,e.point,null);
            if(typeof marketRenderFeature === 'function') setTimeout(() => marketRenderFeature(feature),0);
        });
    }

    function initialiseDemographicsRenderer(){
        const boot = () => {
            ensureDemographicsLayer();
            initialiseDemographicsOpacity();
            renderDemographicsLegend();
            updateDemographicsRenderer();
            bindDemographicsMapClick();
        };
        if(typeof map !== 'undefined' && map){
            if(map.loaded()) boot(); else map.on('load',boot);
        }
    }

    function marketOverlaySelect(){
        const section = $('#marketSection');
        if(!section) return null;
        return $$('select',section).find(select => {
            const text = Array.from(select.options).map(o => o.textContent || '').join(' ');
            return /off/i.test(text) && /(market|transaction|exposure|pulse|momentum)/i.test(text);
        }) || null;
    }

    function marketOpacitySliders(){
        const section = $('#marketSection');
        if(!section) return [];
        return $$('input[type="range"]',section).filter(input => {
            const context = input.closest('div,section,label')?.textContent || '';
            return /opacity/i.test(`${input.id || ''} ${input.className || ''} ${context}`);
        });
    }

    function normaliseMarketOpacityRange(){
        marketOpacitySliders().forEach(input => {
            const max = Number(input.max || 100);
            // Current Market Context opacity uses percent units and was capped
            // at 30. Lift that presentation cap without changing its renderer.
            if(max > 1 && max < 100) input.max = '100';
        });
    }

    function syncMarketVisibilityToggle(){
        const toggle = $('#marketVisibilityToggle');
        const select = marketOverlaySelect();
        if(!toggle || !select) return;
        const selectedText = select.options[select.selectedIndex]?.textContent || select.value || '';
        const visible = !/^\s*off\s*$/i.test(selectedText);
        toggle.checked = visible;
        if(visible) marketLastVisibleSelection = select.value;
    }

    function setMarketVisibility(visible){
        const select = marketOverlaySelect();
        if(!select) return;
        const options = Array.from(select.options);
        const off = options.find(o => /^\s*off\s*$/i.test(o.textContent || o.value));
        if(!visible){
            const current = options[select.selectedIndex];
            if(current && current !== off) marketLastVisibleSelection = current.value;
            if(off) setSelectValue(select,off.value);
        } else {
            let value = marketLastVisibleSelection;
            if(!value || !options.some(o => o.value === value && o !== off)){
                value = (options.find(o => /Transaction Exposure/i.test(o.textContent || '')) ||
                         options.find(o => /Market Exposure/i.test(o.textContent || '')) ||
                         options.find(o => o !== off))?.value;
            }
            if(value != null) setSelectValue(select,value);
        }
        syncMarketVisibilityToggle();
    }

    function ensureMarketVisibilityControl(){
        const section = $('#marketSection');
        const body = $('.mode-body',section);
        if(!section || !body || $('#marketVisibilityControl')) return;
        const wrap = document.createElement('label');
        wrap.id='marketVisibilityControl';
        wrap.className='toggle uga-domain-master-toggle uga-market-master-toggle';
        wrap.innerHTML='<input type="checkbox" id="marketVisibilityToggle"><span>Show Market</span>';
        body.insertBefore(wrap,body.firstElementChild || null);
        $('#marketVisibilityToggle')?.addEventListener('change',event => setMarketVisibility(!!event.target.checked));
        const select = marketOverlaySelect();
        select?.addEventListener('change',syncMarketVisibilityToggle);
        syncMarketVisibilityToggle();
    }

    const MARKET_VIEW_LEGENDS = {
        'Market Momentum': {
            title:'Market Momentum',
            description:'Summarises the direction of 12-month regional private-domestic price and rent movement. The value retains the geography of the official source rather than inventing a 100 m market price.',
            gradient:'linear-gradient(90deg,#d9dde0,#d4cec1,#d9b779,#d89145,#c76d2d,#8a421f)',
            low:'Weaker or downward regional movement.', mid:'Broadly stable / mixed regional movement.', high:'Stronger upward regional movement.',
            note:'Regional market context. It is not a property valuation or forecast.'
        },
        'Market Exposure': {
            title:'Market Exposure',
            description:'Shows where wider Market Momentum overlaps with local Atlas opportunity conditions. Local differentiation comes from Development Pressure and Capacity Opportunity.',
            gradient:'linear-gradient(90deg,#edf8f6,#ccece6,#7fcdbb,#41b6c4,#25788e,#084081)',
            low:'Limited market movement and/or local opportunity.', mid:'Meaningful overlap between market movement and local opportunity.', high:'Stronger market movement coinciding with stronger local opportunity.',
            note:'A combined market-and-urban indicator; not a valuation, investment recommendation or forecast.'
        },
        'Transaction Pulse': {
            title:'Transaction Pulse',
            description:'Shows whether recent registered transaction activity is stronger or weaker relative to its recent norm and the same period a year earlier. It retains the geography published by the source.',
            gradient:'linear-gradient(90deg,#e2e4e6,#ebd1d0,#e9aaa4,#df7c78,#c94f5c,#8b2948)',
            low:'Quieter recent registered transaction activity.', mid:'Activity broadly around its recent reference level.', high:'Stronger recent registered transaction activity.',
            note:'This is an activity signal at source geography, not an invented transaction count for each 100 m hex.'
        },
        'Transaction Exposure': {
            title:'Transaction Exposure',
            description:'Shows where Transaction Pulse overlaps with local Atlas opportunity conditions. The broad transaction signal is interpreted against local Development Pressure and Capacity Opportunity.',
            gradient:'linear-gradient(90deg,#e3e4e6,#ded5e8,#c9b3df,#a884cf,#7a51b5,#4d2688)',
            low:'Limited transaction activity and/or local opportunity.', mid:'Meaningful overlap between transaction activity and local opportunity.', high:'Stronger transaction activity coinciding with stronger local opportunity.',
            note:'Local differentiation comes from Atlas conditions; it does not imply 100 m transaction observations.'
        }
    };

    function selectedMarketViewName(){
        const select = marketOverlaySelect();
        const option = select?.options?.[select.selectedIndex];
        return String(option?.textContent || option?.value || '').trim();
    }

    function marketViewConfig(name){
        for(const [key,cfg] of Object.entries(MARKET_VIEW_LEGENDS)){
            if(String(name).toLowerCase().includes(key.toLowerCase())) return [key,cfg];
        }
        return [null,null];
    }

    function marketLeafText(section, pattern){
        return $$('*', section).find(el => el.children.length === 0 && pattern.test((el.textContent || '').trim())) || null;
    }

    function normaliseMarketViewSelector(){
        const section = $('#marketSection');
        const select = marketOverlaySelect();
        if(!section || !select) return false;
        const heading = marketLeafText(section,/^Map context overlay$/i);
        if(heading){ heading.textContent = 'CHOOSE A MARKET VIEW:'; heading.classList.add('section-label','uga-market-view-label'); }
        const helper = marketLeafText(section,/^Optional secondary market layer$/i);
        if(helper) helper.textContent = 'Market layer shown over the map';
        select.classList.add('uga-domain-select');
        if(select.dataset.ugaV17LegendBound !== 'true'){
            select.dataset.ugaV17LegendBound = 'true';
            select.addEventListener('change', renderMarketViewLegend);
        }
        return true;
    }

    function marketControlCard(select){
        if(!select) return null;
        let node = select.parentElement;
        while(node && node.id !== 'marketSection'){
            if(node.querySelector('input[type="range"]') && node.contains(select)) return node;
            node = node.parentElement;
        }
        return select.parentElement;
    }

    function ensureMarketViewLegendHost(){
        const section = $('#marketSection');
        const select = marketOverlaySelect();
        if(!section || !select) return null;
        let host = $('#ugaMarketViewLegend',section);
        if(host) return host;
        host = document.createElement('div');
        host.id = 'ugaMarketViewLegend';
        host.className = 'uga-market-layer-legend';
        const card = marketControlCard(select);
        if(card) card.appendChild(host); else $('.mode-body',section)?.appendChild(host);
        return host;
    }

    function renderMarketViewLegend(){
        normaliseMarketViewSelector();
        const host = ensureMarketViewLegendHost();
        if(!host) return;
        const name = selectedMarketViewName();
        if(!name || /^off$/i.test(name)){ host.hidden=true; host.innerHTML=''; host.dataset.ugaLegendKey='Off'; return; }
        const [key,cfg] = marketViewConfig(name);
        if(!key || !cfg){ host.hidden=true; host.innerHTML=''; host.dataset.ugaLegendKey=name; return; }
        host.hidden=false;
        host.dataset.ugaLegendKey=key;
        host.innerHTML = `
            <div class="legend-title-row uga-market-layer-heading">
                <h3 class="uga-market-layer-title">${cfg.title}</h3>
                <button type="button" class="info-trigger uga-market-info-trigger" data-info-key="market:${key}" aria-label="About ${cfg.title}" title="About ${cfg.title}">i</button>
            </div>
            <div class="uga-market-layer-copy">${cfg.description}</div>
            <div class="uga-market-layer-gradient" style="background:${cfg.gradient}"></div>
            <div class="uga-market-layer-gradient-labels"><span>Lower</span><span>Higher</span></div>
            <div class="uga-market-layer-interpretation">
                <div><strong>Low</strong><span>${cfg.low}</span></div>
                <div><strong>Medium</strong><span>${cfg.mid}</span></div>
                <div><strong>High</strong><span>${cfg.high}</span></div>
            </div>
            <div class="uga-market-layer-note">${cfg.note}</div>`;
    }

    function initialiseMarketViewPresentation(){
        if(!normaliseMarketViewSelector()) return false;
        renderMarketViewLegend();
        return true;
    }

    function findOpacitySlider(section){
        if(!section) return null;
        const ranges = Array.from(section.querySelectorAll('input[type="range"]'));
        return ranges.find(input => {
            const own = `${input.id || ''} ${input.className || ''}`;
            const context = input.closest('div,section,label')?.textContent || '';
            return /opacity/i.test(`${own} ${context}`);
        }) || null;
    }

    function formatOpacityValue(input){
        if(!input) return '100%';
        const raw = Number(input.value);
        const max = Number(input.max || 100);
        const percent = max <= 1 ? raw * 100 : (max ? (raw / max) * 100 : raw);
        return `${Math.round(Math.max(0,Math.min(100,percent)))}%`;
    }

    function setProxyToNative(proxy,native){
        if(!proxy || !native) return;
        const nmin = Number(native.min || 0);
        const nmax = Number(native.max || 100);
        const p = Number(proxy.value) / 100;
        native.value = String(nmin + (nmax - nmin) * p);
        native.dispatchEvent(new Event('input',{bubbles:true}));
        native.dispatchEvent(new Event('change',{bubbles:true}));
    }

    function createOpacityProxy(host,{sectionId,label,nativeSectionId,disabled=false}){
        if(!host || host.dataset.ugaOpacityReady === 'true') return;
        const native = disabled ? null : findOpacitySlider(document.getElementById(nativeSectionId));
        if(!native && !disabled){
            // Current production builds provide an Analysis opacity slider. If
            // an older test base does not, leave the host empty rather than
            // introducing a second opacity engine.
            return;
        }
        host.dataset.ugaOpacityReady = 'true';
        const nativeValue = native ? Math.round((Number(native.value)-Number(native.min||0)) / Math.max(1e-9,(Number(native.max||100)-Number(native.min||0))) * 100) : 100;
        host.innerHTML = `
            <div class="uga-domain-opacity-card${disabled ? ' uga-opacity-disabled' : ''}">
                <div class="uga-domain-opacity-head"><span>${label.toUpperCase()} OPACITY</span><strong>${nativeValue}%</strong></div>
                <input type="range" min="0" max="100" step="1" value="${nativeValue}" ${disabled ? 'disabled' : ''} aria-label="${label} opacity">
            </div>
        `;
        const proxy = host.querySelector('input[type="range"]');
        const value = host.querySelector('strong');
        if(proxy && native){
            const syncFromNative = () => {
                const pct = formatOpacityValue(native);
                proxy.value = pct.replace('%','');
                if(value) value.textContent = pct;
                const collapsed = document.querySelector(`#${sectionId} .uga-domain-collapsed-opacity input[type="range"]`);
                const collapsedValue = document.querySelector(`#${sectionId} .uga-domain-collapsed-opacity strong`);
                if(collapsed){ collapsed.value = proxy.value; }
                if(collapsedValue){ collapsedValue.textContent = pct; }
            };
            proxy.addEventListener('input',() => {
                setProxyToNative(proxy,native);
                if(value) value.textContent = `${proxy.value}%`;
            });
            native.addEventListener('input',syncFromNative);
            native.addEventListener('change',syncFromNative);
            syncFromNative();
        }
    }

    function createCollapsedOpacity(sectionId,label,nativeSectionId){
        const section = document.getElementById(sectionId);
        const host = section?.querySelector('.uga-domain-collapsed-opacity');
        const native = findOpacitySlider(document.getElementById(nativeSectionId));
        if(!section || !host || !native) return;
        const pct = formatOpacityValue(native);
        host.innerHTML = `
            <div class="uga-domain-collapsed-copy">
                <span>${label.toUpperCase()}</span>
                <strong>${label} opacity · <b>${pct}</b></strong>
            </div>
            <input type="range" min="0" max="100" step="1" value="${pct.replace('%','')}" aria-label="${label} opacity">
        `;
        const proxy = host.querySelector('input[type="range"]');
        const value = host.querySelector('b');
        const expanded = document.querySelector(`#${sectionId} .uga-domain-opacity-host input[type="range"]`);
        const syncFromNative = () => {
            const p = formatOpacityValue(native);
            if(proxy) proxy.value = p.replace('%','');
            if(value) value.textContent = p;
            if(expanded) expanded.value = p.replace('%','');
            const expandedValue = document.querySelector(`#${sectionId} .uga-domain-opacity-host strong`);
            if(expandedValue) expandedValue.textContent = p;
        };
        proxy?.addEventListener('input',() => {
            setProxyToNative(proxy,native);
            if(value) value.textContent = `${proxy.value}%`;
        });
        native.addEventListener('input',syncFromNative);
        native.addEventListener('change',syncFromNative);
        syncFromNative();
    }

    function initialiseDomainOpacity(){
        initialiseDemographicsOpacity();
        // Climate deliberately gains the same independent opacity structure
        // only when its first public map layer exists.
    }

    function normaliseDomainIconScale(){
        const reference = [
            document.querySelector('#fabricSection img[src*="Fabric_Icon"]'),
            document.querySelector('#analysisSection img[src*="Analysis_Icon"]'),
            document.querySelector('#marketSection img[src*="Market_Icon"]')
        ].find(Boolean);
        let size = 40;
        if(reference){
            const r = reference.getBoundingClientRect();
            size = Math.round(Math.max(r.width,r.height)) || size;
        }
        document.documentElement.style.setProperty('--uga-domain-reference-icon-size', `${size}px`);
    }

    function initialiseFiveDomainRail(){
        const scroll = $('#panelScroll');
        if(!scroll) return;
        scroll.classList.add('uga-five-domain-rail');
    }

    function createMobileTab(key,label,iconSrc){
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mobile-sheet-tab uga-added-mobile-tab';
        b.dataset.mobileSheetTab = key;
        b.setAttribute('role','tab');
        b.setAttribute('aria-selected','false');
        b.innerHTML = `<img class="uga-mobile-domain-icon" src="${iconSrc}" alt="" aria-hidden="true"><span>${label}</span>`;
        return b;
    }

    function clearAddedMobilePanels(except=null){
        ['demographicsSection','climateSection'].forEach(id => {
            const section = document.getElementById(id);
            if(!section || id === except) return;
            section.classList.remove('mobile-sheet-active');
            section.classList.add('collapsed');
            section.classList.remove('expanded');
            section.setAttribute('aria-hidden','true');
        });
    }

    function activateAddedMobileSection(key){
        const panel = $('#panel');
        const scroll = $('#panelScroll');
        const basemap = $('#basemapControl');
        const target = key === 'demographics' ? $('#demographicsSection') : $('#climateSection');
        if(!panel || !scroll || !target) return;
        openPanelShell();
        panel.dataset.mobileSheetTab = key;
        panel.classList.remove('mobile-sheet-map-active');
        basemap?.classList.remove('mobile-sheet-active');
        scroll.classList.add('mobile-sheet-active');
        $$('.mobile-sheet-tab').forEach(tab => {
            const active = tab.dataset.mobileSheetTab === key;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        $$('#panelScroll > .mode-panel').forEach(section => {
            const active = section === target;
            section.classList.toggle('mobile-sheet-active', active);
            section.classList.toggle('expanded', active);
            section.classList.toggle('collapsed', !active);
            section.setAttribute('aria-hidden', String(!active));
        });
        target.style.display = '';
        scroll.scrollTop = 0;
    }

    function extendMobileNavigation(){
        const tabs = $('.mobile-sheet-tabs');
        if(!tabs || tabs.dataset.ugaIaExtended === 'true') return false;
        tabs.dataset.ugaIaExtended = 'true';
        const demo = createMobileTab('demographics','DEMOGRAPHICS','assets/Demographics_Icon.png');
        const climate = createMobileTab('climate','CLIMATE','assets/Climate_Icon.png');
        tabs.append(demo, climate);

        // Existing V2.6 tabs keep their own handlers. Capture clears the two
        // added sections before the original handler selects Map/Fabric/etc.
        tabs.addEventListener('click', (event) => {
            const btn = event.target.closest('.mobile-sheet-tab');
            if(!btn) return;
            const key = btn.dataset.mobileSheetTab;
            if(key === 'demographics'){
                event.preventDefault();
                event.stopImmediatePropagation();
                activateAddedMobileSection('demographics');
                demographicsState.theme = $('#demographicsTheme')?.value || 'Population per Building';
                demographicsState.visible = !!$('#demographicsToggle')?.checked;
                updateDemographicsRenderer();
                return;
            }
            if(key === 'climate'){
                event.preventDefault();
                event.stopImmediatePropagation();
                activateAddedMobileSection('climate');
                return;
            }
            clearAddedMobilePanels();
        }, true);
        return true;
    }

    function mobileSelect(key){
        const tab = $(`.mobile-sheet-tab[data-mobile-sheet-tab="${key}"]`);
        if(tab){ tab.click(); return true; }
        return false;
    }

    function chooseMarketDefault(){
        const section = $('#marketSection');
        if(!section) return;
        const selects = $$('select', section);
        const patterns = [/Transaction Exposure/i,/Market Exposure/i];
        for(const pattern of patterns){
            for(const select of selects){
                const value = optionValueMatching(select, pattern);
                if(value != null){ setSelectValue(select, value); return; }
            }
        }
        // Some market controls use buttons/radios rather than a select.
        for(const pattern of patterns){
            const candidate = $$('button,label', section).find(el => pattern.test(el.textContent || ''));
            if(candidate){ candidate.click(); return; }
        }
    }

    function collapseOtherDesktopSections(keep){
        // Historical function name retained only for welcome compatibility.
        // V1.6 desktop does NOT collapse peers: it simply opens the requested panel.
        if(MOBILE_QUERY.matches || !keep) return;
        if(keep.classList.contains('collapsed')){
            if(keep.dataset.ugaDomainPanel === 'true'){
                setSectionExpanded(keep,true);
            }else{
                nativePanelToggle(keep)?.click();
            }
        }
        revealRailPanel(keep);
    }

    function activateStart(key){
        openPanelShell();
        if(key === 'fabric'){
            setChecked(analysisToggle(), false);
            setChecked($('#reclaimedToggle'), true);
            if(MOBILE_QUERY.matches) mobileSelect('fabric');
            else collapseOtherDesktopSections($('#fabricSection'));
        } else if(key === 'analysis'){
            const select = themeSelect();
            const ugs = optionValueMatching(select, /Urban Genetic Signature|UGS/i) || optionValueMatching(select, /Development Pressure/i);
            activateTheme(ugs,'analysis');
            if(MOBILE_QUERY.matches) mobileSelect('analysis');
            else collapseOtherDesktopSections($('#analysisSection'));
        } else if(key === 'market'){
            setChecked(analysisToggle(), false);
            chooseMarketDefault();
            if(MOBILE_QUERY.matches) mobileSelect('market');
            else collapseOtherDesktopSections($('#marketSection'));
        } else if(key === 'demographics'){
            const demoSelect = $('#demographicsTheme');
            if(demoSelect) demoSelect.value = 'Population per Building';
            demographicsState.theme = 'Population per Building';
            demographicsState.visible = true;
            if($('#demographicsToggle')) $('#demographicsToggle').checked = true;
            setChecked(analysisToggle(), false);
            updateDemographicsRenderer();
            renderDemographicsLegend();
            if(MOBILE_QUERY.matches) mobileSelect('demographics');
            else collapseOtherDesktopSections($('#demographicsSection'));
        } else if(key === 'map'){
            setChecked(analysisToggle(), false);
            if(MOBILE_QUERY.matches) mobileSelect('map');
            else $$('#panelScroll > .mode-panel').forEach(section => {
                if(section.classList.contains('expanded')){
                    if(section.dataset.ugaDomainPanel === 'true') setSectionExpanded(section,false);
                    else nativePanelToggle(section)?.click();
                }
            });
        }
    }

    function rebuildWelcome(){
        const content = $('#welcomePanel .welcome-content');
        const footer = $('#welcomePanel .welcome-footer');
        const subtitle = $('#welcomePanel .welcome-subtitle');
        const closeButton = $('#welcomeCloseButton');
        if(!content || content.dataset.ugaIaWelcome === 'true') return;
        content.dataset.ugaIaWelcome = 'true';
        if(subtitle) subtitle.textContent = 'Read Hong Kong through data';
        content.innerHTML = `
            <p class="uga-welcome-lead">Explore how the city is built, who lives in it, how its markets are moving, and the patterns that emerge when these things are read together.</p>
            <p class="uga-welcome-prompt"><strong>Choose what interests you about the city and start there.</strong><br><span>You can explore everything else at any time.</span></p>
            <div class="uga-welcome-choices" role="group" aria-label="Choose where to start">
                <button type="button" class="uga-welcome-choice" data-uga-start="fabric"><span class="uga-choice-title"><span class="uga-choice-heading"><img class="uga-choice-icon" src="assets/Fabric_Icon.png" alt="">Fabric</span></span><span class="uga-choice-copy">How the city is physically built and connected.</span></button>
                <button type="button" class="uga-welcome-choice" data-uga-start="analysis"><span class="uga-choice-title"><span class="uga-choice-heading"><img class="uga-choice-icon" src="assets/Analysis_Icon.png" alt="">Urban Analysis</span></span><span class="uga-choice-copy">Patterns that emerge when different parts of the city are read together.</span></button>
                <button type="button" class="uga-welcome-choice" data-uga-start="market"><span class="uga-choice-title"><span class="uga-choice-heading"><img class="uga-choice-icon" src="assets/Market_Icon.png" alt="">Market</span></span><span class="uga-choice-copy">How property and transaction activity vary across the city and relate to place.</span></button>
                <button type="button" class="uga-welcome-choice" data-uga-start="demographics"><span class="uga-choice-title"><span class="uga-choice-heading"><img class="uga-choice-icon" src="assets/Demographics_Icon.png" alt="">Demographics</span></span><span class="uga-choice-copy">Where people live and how population and living conditions vary.</span></button>
                <button type="button" class="uga-welcome-choice uga-welcome-choice-disabled" disabled aria-disabled="true"><span class="uga-choice-title"><span class="uga-choice-heading"><img class="uga-choice-icon" src="assets/Climate_Icon.png" alt="">Climate</span><em>Coming soon</em></span><span class="uga-choice-copy">How heat, terrain and environmental conditions affect the city.</span></button>
            </div>
            <p class="uga-welcome-caveat">The Atlas combines sources with different dates, scales and levels of coverage. Use it to explore patterns and relationships rather than as a precise statement about an individual property.</p>
        `;
        if(closeButton) closeButton.textContent = 'Explore map';
        footer?.classList.add('uga-welcome-footer');
        $$('.uga-welcome-choice[data-uga-start]', content).forEach(button => {
            button.addEventListener('click', () => {
                const key = button.dataset.ugaStart;
                // Let the existing close handler persist "Do not show again".
                $('#welcomeCloseButton')?.click();
                requestAnimationFrame(() => activateStart(key));
            });
        });
    }

    function returningVisitorDefault(){
        if(localStorage.getItem(WELCOME_KEY) !== 'true') return;
        // Returning visitors deliberately start from Map rather than restoring
        // a potentially stale prior analytical mode.
        setTimeout(() => activateStart('map'), 900);
    }


    function installRailFocus(){
        window.UGAFocusRailPanel = section => {
            if(MOBILE_QUERY.matches || !section) return;
            const rail = $('#panelScroll');
            if(!rail) return;
            requestAnimationFrame(() => {
                const rr = rail.getBoundingClientRect();
                const pr = section.getBoundingClientRect();
                const margin = 10;
                let delta = 0;
                if(pr.height >= rr.height - margin * 2){
                    delta = pr.top - (rr.top + margin);
                }else if(pr.top < rr.top + margin){
                    delta = pr.top - (rr.top + margin);
                }else if(pr.bottom > rr.bottom - margin){
                    delta = pr.bottom - (rr.bottom - margin);
                }
                if(Math.abs(delta) > 1){
                    const max = Math.max(0, rail.scrollHeight - rail.clientHeight);
                    rail.scrollTop = Math.max(0, Math.min(max, rail.scrollTop + delta));
                }
            });
        };
    }

    function exposeDebugState(){
        window.UGAInformationArchitectureState = () => ({
            version:VERSION,
            owner,
            mobile:MOBILE_QUERY.matches,
            mobileTab:$('#panel')?.dataset?.mobileSheetTab || null,
            theme:themeSelect()?.value || null,
            fabricMeasure:fabricMeasureState.theme || null,
            fabricMeasureLayerReady:fabricMeasureLayerReady,
            fabricOpacity:fabricOpacityPercent(),
            demographics:!!$('#demographicsSection'),
            demographicsVisible:demographicsState.visible,
            demographicsOpacity:demographicsState.opacity,
            demographicsTheme:demographicsState.theme,
            climate:!!$('#climateSection'),
            openPanels:domainPanels().filter(p => p.classList.contains('expanded') && !p.classList.contains('collapsed')).map(p => p.id)
        });
        window.UGAStartAt = activateStart;
        window.UGAClearWelcomePreference = () => { localStorage.removeItem(WELCOME_KEY); return true; };
        window.UGADemographicsState = () => ({...demographicsState,layerReady:demographicsLayerReady});
        window.UGARailV17 = () => {
            const rail = $('#panelScroll');
            const panel = $('#panel');
            return {
                version:VERSION,
                mobile:MOBILE_QUERY.matches,
                railHeight:rail?.clientHeight || 0,
                railScrollHeight:rail?.scrollHeight || 0,
                railScrollTop:rail?.scrollTop || 0,
                shellHeight:panel?.clientHeight || 0,
                panels:domainPanels().map(section => ({
                    id:section.id,
                    expanded:section.classList.contains('expanded'),
                    collapsed:section.classList.contains('collapsed'),
                    height:Math.round(section.getBoundingClientRect().height),
                    bodyOverflow:section.querySelector('.mode-body') ? getComputedStyle(section.querySelector('.mode-body')).overflowY : null,
                    maxHeight:getComputedStyle(section).maxHeight
                }))
            };
        };
    }

    function init(){
        const required = ['#welcomeOverlay','#panel','#panelScroll','#analysisSection','#fabricSection','#theme'];
        const missing = required.filter(sel => !$(sel));
        if(missing.length){
            console.warn('[ATLAS IA] Required UI missing:', missing.join(', '));
            return;
        }
        installRailFocus();
        prepareSharedAnalysisUI();
        organiseAnalysisSelector();
        hideMarketFromAnalysis();
        createFabricMeasures();
        initialiseFabricMeasureRenderer();
        createDemographicsPanel();
        createClimatePanel();
        improveMarketSection();
        normaliseTopLevelControls();
        initialiseFiveDomainRail();
        initialiseDemographicsRenderer();
        setTimeout(() => { initialiseDomainOpacity(); normaliseDomainIconScale(); ensureMarketVisibilityControl(); normaliseMarketOpacityRange(); syncMarketVisibilityToggle(); initialiseMarketViewPresentation(); }, 0);
        watchMarketControls();
        rebuildWelcome();
        exposeDebugState();

        let attempts = 0;
        const mobileTimer = setInterval(() => {
            attempts += 1;
            if(extendMobileNavigation() || attempts > 40) clearInterval(mobileTimer);
        }, 100);

        returningVisitorDefault();
        console.info('[ATLAS IA] Information Architecture V1.7 production layer initialised.');
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
    else init();
})();
// === IA V1.7 PRODUCTION RUNTIME END ===
