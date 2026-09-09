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
// v1.5 PMTiles is generated directly from the spatial master GeoJSON,
// so Tippecanoe used the filename-derived layer name.
// Keep this explicit so the existing Atlas layer logic
// continues to use a single shared hex source.
//

const ATLAS_SOURCE_LAYER =
    'atlas';

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

    const panels = {

        'Urban Genetic Signature':{
            title:'Urban Genetic Signature',
            html:
                infoSection(
                    'WHAT IS A SIGNATURE?',
                    `<p>
                        Different parts of a city have different combinations
                        of characteristics — how built-up they are, how tall,
                        how connected, how old and how strongly the data shows
                        change.
                    </p>
                    <p>
                        <strong>A Signature is a recognisable combination of
                        those characteristics.</strong>
                    </p>
                    <p>
                        The individual layers tell us what is there. The
                        Signature helps us see how those things fit together.
                    </p>`
                )
                +
                infoSection(
                    'THE FIVE-PART PROFILE',
                    `<div class="atlas-info-profile">
                        <div><strong>Intensity</strong> — how built-up this place is.</div>
                        <div><strong>Accessibility</strong> — how connected this place is.</div>
                        <div><strong>Height / Form</strong> — how tall and vertically built this place is.</div>
                        <div><strong>Change</strong> — where the model shows stronger signs of change.</div>
                        <div><strong>Age</strong> — how old the recorded building stock is.</div>
                    </div>
                    <p style="margin-top:8px;">
                        The bars compare this place with other urban areas in
                        the Atlas. They are the place's profile; they are
                        <strong>not</strong> an overall Signature-strength score.
                    </p>`
                )
                +
                infoSection(
                    'HOW A SIGNATURE IS ASSIGNED',
                    `<p>
                        UGS is rule-based. A Signature is assigned when a
                        particular combination of characteristics crosses the
                        relevant thresholds. Not every characteristic is used
                        to assign every Signature.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Neighbouring places can share one strong characteristic
                        but receive different Signatures because their other
                        characteristics combine differently.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        <strong>${infoNumber(ugs.meaningfulUrbanCount)}</strong>
                        cells have meaningful urban context.
                        <strong>${infoNumber(ugs.constrainedCount)}</strong>
                        are treated as constrained / non-urban.
                        <strong>${infoNumber(ugs.unassessedCount)}</strong>
                        remain unassessed.
                    </p>
                    <p>
                        <strong>${infoPct(ugs.stableShare,2)}</strong> of
                        meaningful urban cells are Stable Fabric.
                    </p>
                    ${
                        Number.isFinite(Number(ugs.recentApprovalCount))
                        ? `<p>
                            <strong>RECORDED CHANGE ≠ MODELLED CHANGE</strong><br>
                            ${infoNumber(ugs.recentApprovalCount)} meaningful
                            urban cells record a recent building approval;
                            ${infoNumber(ugs.recentApprovalHighChangeCount)}
                            also sit in the high Change group.
                        </p>`
                        : ''
                    }`
                )
        },

        'Development Pressure':{
            title:'Development Pressure',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Development Pressure combines building age, physical
                        development condition and recent approved-development
                        activity to show where those signals are stronger or
                        weaker across the existing city.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A high value does not mean redevelopment is planned,
                        approved or imminent. Recorded development activity is
                        shown separately where the data is available.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p>
                        The existing V1.5 field was calculated upstream from
                        three components:
                    </p>
                    <ul class="atlas-info-list">
                        <li><strong>40% — Building Age</strong></li>
                        <li><strong>30% — Building Height / redevelopment susceptibility</strong></li>
                        <li><strong>30% — Recent approved development activity</strong></li>
                    </ul>
                    <p>
                        The source model used building-age thresholds of
                        40–50 years → 1, 50–60 years → 2 and 60+ years → 3.
                        Its height component treated 10–30 m buildings as the
                        stronger redevelopment-susceptibility band, 30–50 m as
                        a weaker band, and excluded very low village-scale
                        buildings below 10 m from this particular signal.
                    </p>
                    <p>
                        Approved new buildings since March 2015 were aggregated
                        into the hex grid. Component measures were normalised to
                        make them comparable, with skew treatment where required.
                    </p>
                    <p>
                        This browser pass explains the existing field; it does
                        not recalculate it in JavaScript.
                    </p>`
                )
        },

        'GFA - Saturation':{
            title:'GFA Saturation',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        GFA Saturation compares estimated existing floor area
                        with the development capacity used by the Atlas.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A higher value means more of that estimated capacity is
                        already built. A lower value means more remains
                        unrealised.
                    </p>
                    <p>
                        This is a capacity-model result, not a statement that
                        additional development is immediately feasible or
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
                        The index reflects proximity and network connectivity
                        to the existing MTR system.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        It is a relative accessibility measure — not a measure
                        of journey time, passenger volume or service frequency.
                    </p>`
                )
        },

        'Renewal Potential':{
            title:'Renewal Potential',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Renewal Potential is a strategic model that combines the
                        condition and development capacity of existing fabric
                        with established infrastructure and land-market activity.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A high value means a stronger combination of the
                        conditions chosen for this model. It does not mean
                        redevelopment will occur.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p>
                        Renewal is built as a staged strategic model.
                    </p>
                    <p>
                        <strong>Stage A — Physical potential</strong><br>
                        50% normalised building age + 50% normalised
                        development gap, where the development-gap term
                        represents height / GFA under-performance.
                    </p>
                    <p>
                        <strong>Stage B — Structural potential</strong><br>
                        60% Physical Potential + 40% clamped GFA Saturation.
                        This avoids treating old fabric as a renewal candidate
                        simply because it is old.
                    </p>
                    <p>
                        <strong>Stage C — Final Renewal model</strong><br>
                        50% Structural / Policy Potential + 30% Land-deal
                        recency + 20% Existing infrastructure capacity.
                    </p>
                    <p>
                        Existing infrastructure strength is derived from the
                        current active transit and established surface-
                        connectivity layers. The earlier presentation does not
                        state the internal weights between those infrastructure
                        subcomponents, so they are not invented here.
                    </p>
                    <p>
                        This browser pass explains the existing V1.5 field; it
                        does not rebuild the calculation.
                    </p>`
                )
        },

        'Genesis Potential':{
            title:'Genesis Potential',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Genesis Potential is a strategic model that tests where
                        unused development capacity, planning flexibility,
                        additional transport accessibility and land-market
                        activity combine more strongly.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        A high value identifies a stronger combination of those
                        conditions. It does not identify a guaranteed
                        development site or forecast what will be built.
                    </p>`
                )
                +
                infoSection(
                    'HOW IS IT CALCULATED?',
                    `<p>
                        Genesis tests a different condition from Renewal:
                        unused capacity + policy flexibility + new
                        infrastructure catalysts.
                    </p>
                    <p>
                        <strong>Volumetric Vacuum</strong><br>
                        Approximately 1 − GFA Saturation, so less-developed
                        capacity approaches 1 and built-out capacity approaches 0.
                    </p>
                    <p>
                        <strong>Statutory / planning-zone weight</strong><br>
                        High Mutation = 1.2 for Industrial, CDA and Business;
                        Mixed Mutation = 1.0 for mixed commercial/residential
                        zones and Residential Group E; Static Urban = 0.6 for
                        established standard residential zones. These are
                        deliberate policy assumptions.
                    </p>
                    <p>
                        <strong>Transit Additionality</strong><br>
                        Planned MTR accessibility minus Built MTR accessibility,
                        normalised against the documented maximum observed shift
                        of 0.8641. This isolates the additional accessibility
                        generated by planned infrastructure, specifically the
                        Northern Link in this iteration.
                    </p>
                    <p>
                        <strong>Land-deal momentum</strong><br>
                        Recency_Norm derived from executed land deals.
                    </p>
                    <p>
                        The documented final fold assigns
                        <strong>40%</strong> to Transit Additionality and
                        <strong>20%</strong> to land-deal momentum. The
                        Volumetric Vacuum × statutory mutation term is the
                        remaining principal component. A residual 40% follows
                        mathematically if the weights sum to 100%, but because
                        the earlier presentation does not explicitly print that
                        coefficient beside the first term, this interface does
                        not label it as an exact verified live coefficient.
                    </p>
                    <p>
                        This browser pass explains the existing V1.5 field; it
                        does not rebuild the calculation.
                    </p>`
                )
        },

        'GFA per Capita':{
            title:'Living Space (m²/cap)',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Estimated residential floor area per resident within
                        each hex.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        This is an area-based estimate from the Atlas data. It
                        is not a direct measurement of individual dwelling size,
                        household crowding or housing quality.
                    </p>`
                )
        },

        'Population per Building':{
            title:'Population Intensity',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Estimated number of residents associated with buildings
                        within each hex.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        This is a spatial estimate used for comparison across
                        the Atlas. It should not be read as an exact headcount
                        at a specific building or point.
                    </p>`
                )
        },

        'Latent Urban Capacity':{
            title:'Latent Urban Capacity',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Latent Urban Capacity describes unused capacity within
                        the assumptions of the Atlas model.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        It is not the same as vacant land, development
                        feasibility, land ownership or permission to build
                        immediately.
                    </p>`
                )
        },

        'Market Exposure':{
            title:'Market Exposure',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Market Exposure is a derived measure. It connects wider
                        market movement to local Atlas conditions.
                    </p>`
                )
                +
                infoSection(
                    'MARKET MOMENTUM',
                    `<p>
                        50% normalised 12-month regional price trend + 50%
                        normalised 12-month regional rent trend.
                    </p>`
                )
                +
                infoSection(
                    'LOCAL OPPORTUNITY',
                    `<p>
                        50% positive Development Pressure + 50% Latent Urban
                        Capacity.
                    </p>`
                )
                +
                infoSection(
                    'MARKET EXPOSURE',
                    `<p>
                        Market Momentum × Local Opportunity.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Market Momentum retains the official geography of the
                        market source. Hex-to-hex variation in Market Exposure
                        comes from the local Atlas components. It is not a
                        property valuation, investment recommendation or
                        forecast.
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
        const release = currentReleaseId();

        return {
            title:'About the Atlas',
            html:
                infoSection(
                    'ABOUT THE ATLAS',
                    `<p>
                        The Urban Genetics Atlas is an exploratory system for
                        reading patterns and relationships across Hong Kong. It
                        combines public, spatial and market datasets that differ
                        in coverage, date, scale and completeness.
                    </p>
                    <p>
                        Missing values, uneven coverage and outliers exist. The
                        Atlas is therefore best used to compare patterns,
                        identify relationships and generate questions for
                        further investigation.
                    </p>
                    <p>
                        A 100 m hex is an analytical reference cell. It should
                        not be treated as a precise statement about every
                        building, lot or property inside it.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ THE DIFFERENT OUTPUTS',
                    `<div class="atlas-info-profile">
                        <div><strong>Urban Fabric</strong> shows physical, infrastructural and historical evidence.</div>
                        <div><strong>Urban Analysis</strong> derives patterns from those and other datasets.</div>
                        <div><strong>Urban Genetic Signature</strong> classifies recognisable combinations of characteristics.</div>
                        <div><strong>Renewal and Genesis</strong> are strategic lenses that apply selected assumptions to particular questions.</div>
                        <div><strong>Market Data</strong> retains the geography of its official source, while Market Exposure connects that wider context to local Atlas conditions.</div>
                    </div>
                    <p style="margin-top:8px;">
                        Recorded activity, modelled signals and forecasts are
                        not the same thing. The Atlas labels them accordingly.
                    </p>`
                )
                +
                infoSection(
                    'TECHNICAL INFORMATION',
                    `<p class="atlas-info-technical">
                        Live release: <strong>${infoEsc(release)}</strong><br>
                        Common spatial reference: 100 m hex grid<br>
                        Map CRS: EPSG:4326
                    </p>`
                )
        };
    }

    if(key === 'analysis'){
        const total = atlasStats?.atlas?.totalHexes;

        return {
            title:'Urban Analysis',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        Urban Analysis brings selected datasets together to
                        reveal patterns that are difficult to see in the source
                        layers alone. Some views describe existing conditions;
                        others apply strategic assumptions to test questions
                        about capacity, pressure or change.
                    </p>`
                )
                +
                infoSection(
                    'FROM THE ATLAS',
                    `<p>
                        <strong>${infoNumber(total)}</strong> 100 m hexes form
                        the current common spatial reference. Not every analysis
                        has usable data in every cell, so the status bar shows
                        coverage for the selected view.
                    </p>`
                )
                +
                infoSection(
                    'TRY THIS',
                    `<p>
                        Switch between a Signature and the underlying analyses,
                        then compare neighbouring hexes. A place can look similar
                        on one measure and very different when the other
                        characteristics are considered.
                    </p>`
                )
        };
    }

    if(key === 'fabric'){
        return {
            title:'Urban Fabric',
            html:
                infoSection(
                    'WHAT IS THIS?',
                    `<p>
                        These layers show the physical evidence of the city —
                        terrain, reclaimed land, buildings, heritage, rail and
                        roads. Explore them on their own, or use them to
                        understand why analytical patterns differ from place to
                        place.
                    </p>`
                )
                +
                infoSection(
                    'WHY A 100 m GRID?',
                    `<p>
                        The common grid lets datasets that were created for
                        different purposes be compared across the same spatial
                        reference.
                    </p>`
                )
                +
                infoSection(
                    'WHAT TO NOTICE',
                    `<p>
                        Hong Kong is not one continuous urban condition.
                        Topography, infrastructure, planning and history have
                        produced distinct urban pockets with very different
                        forms and characteristics.
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
                        Official market data is reported at regional or district
                        geography. Selecting a hex links that place to the
                        relevant source area; the Atlas does not invent a 100 m
                        market price.
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
                        Market Exposure combines that wider market movement with
                        local Development Pressure and Latent Urban Capacity. It
                        shows where market movement and local urban opportunity
                        coincide.
                    </p>`
                )
                +
                infoSection(
                    'HOW TO READ IT',
                    `<p>
                        Market Exposure is not a property valuation, investment
                        recommendation or forecast. Market observations retain
                        the geography of their official source.
                    </p>`
                )
                +
                infoSection(
                    'CURRENT SNAPSHOT · 12 MONTHS',
                    marketSnapshotHtml()
                )
        };
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
            'Highly built-up, with a strong modelled change signal.'
    },

    EC:{
        name:'EMERGING CHANGE',
        colour:'#D89A43',
        description:
            'Less built-up, with a strong modelled change signal.'
    },

    AT:{
        name:'AGEING TRANSITION',
        colour:'#A95F68',
        description:
            'Older building fabric, with a strong modelled change signal.'
    },

    VM:{
        name:'VERTICAL MATURE',
        colour:'#786AA0',
        description:
            'Highly built-up and tall, without an unusually strong change signal.'
    },

    LF:{
        name:'LEGACY FABRIC',
        colour:'#8F7862',
        description:
            'Older building fabric without an unusually strong change signal.'
    },

    CF:{
        name:'CONNECTED FABRIC',
        colour:'#518882',
        description:
            'Highly connected without an unusually strong change signal.'
    },

    SF:{
        name:'STABLE FABRIC',
        colour:'#7D8790',
        description:
            'No Signature-defining combination stands out in this version of the model.'
    },

    C:{
        name:'CONSTRAINED',
        colour:'#A8ADB2',
        description:
            'A constrained or non-urban planning context, treated separately from the normal urban Signatures.'
    },

    U:{
        name:'UNASSESSED',
        colour:'#D0D3D7',
        description:
            'Not enough analytical context is available to assign a normal Signature.'
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
// -----------------------------------------------------

const LEGENDS = {

    'Development Pressure': {

        title: 'Development Pressure',

        description:
            'Shows where the current model detects weaker or stronger development pressure.',

        gradient:
            'linear-gradient(90deg,#313695,#74ADD1,#FFFFFF,#FFF7BC,#FEC44F,#FE9929,#EC7014,#993404)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Lower pressure in the current model.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Moderate or mixed pressure.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Stronger pressure in the current model.
            </div>
        `
    },


    'GFA - Saturation': {

        title: 'GFA Saturation',

        description:
            'Shows how much of the estimated development capacity is already realised in each hex.',

        gradient:
            'linear-gradient(90deg,#56BEEE40,#6FB8CE8C,#50A2EE9E,#2949FE9E,#4902CC9E,#390C6D9E)',

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
            'linear-gradient(90deg,#FFFFFF,#FFFDE7,#FFF176,#9CCC65,#2E7D32,#004D40)',

        interpretation: `
            <div class='legend-item'>
                <strong>Weak</strong>
                — Lower MTR accessibility in this index.
            </div>

            <div class='legend-item'>
                <strong>Moderate</strong>
                — Moderate MTR accessibility.
            </div>

            <div class='legend-item'>
                <strong>Strong</strong>
                — Higher MTR accessibility.
            </div>
        `
    },


    'Renewal Potential': {

        title: 'Renewal Potential',

        description:
            'A strategic model showing where selected renewal conditions combine more strongly.',

        gradient:
            'linear-gradient(90deg,#FFFFFF,#FFF7BC,#FEE391,#FEC44F,#FDB863,#F46D43,#D7301F,#7F0000)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Fewer of the model's renewal conditions coincide.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — A moderate combination of renewal conditions.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — A stronger combination of renewal conditions.
            </div>
        `
    },


    'Genesis Potential': {

        title: 'Genesis Potential',

        description:
            'A strategic model showing where capacity and catalytic conditions combine more strongly.',

        gradient:
            'linear-gradient(90deg,#FFFFFF,#E5F5E0,#74C476,#31A354,#756BB1,#6A51A3,#4A1486)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Limited combination of Genesis conditions.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Moderate combination of Genesis conditions.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Stronger combination of Genesis conditions.
            </div>
        `
    },


    'GFA per Capita': {

        title: 'Living Space (m²/cap)',

        description:
            'Estimated residential floor area per resident within each hex.',

        gradient:
            'linear-gradient(90deg,#F7FCF5,#E5F5E0,#C7E9C0,#74C476,#41AB5D,#238B45,#00441B)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Lower estimated floor area per resident.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Mid-range estimated floor area per resident.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Higher estimated floor area per resident.
            </div>
        `
    },


    'Population per Building': {

        title: 'Population Intensity',

        description:
            'Estimated number of residents associated with buildings within each hex.',

        gradient:
            'linear-gradient(90deg,#FFF5F0,#FEE0D2,#FCBBA1,#FC9272,#FB6A4A,#EF3B2C,#CB181D,#67000D)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Lower estimated residential concentration.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Moderate estimated residential concentration.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — Higher estimated residential concentration.
            </div>
        `
    },


    'Latent Urban Capacity': {

        title: 'Latent Urban Capacity',

        description:
            'Shows how much of the estimated development capacity remains unrealised.',

        gradient:
            'linear-gradient(90deg,rgba(255,255,255,0),#e2e2f4,#c2bae2,#9d91d1,#7e6cbe,#5f49a9,#442d8b,#26125c)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Little estimated capacity remains.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Meaningful estimated capacity remains.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
                — A larger share of estimated capacity remains.
            </div>
        `
    },

    'Market Exposure': {

        title: 'Market Exposure',

        description:
            'Shows where regional market momentum overlaps with local Development Pressure and remaining capacity.',

        gradient:
            'linear-gradient(90deg,#edf8f6,#ccece6,#7fcdbb,#41b6c4,#25788e,#084081)',

        interpretation: `
            <div class='legend-item'>
                <strong>Low</strong>
                — Limited overlap between market movement and local opportunity conditions.
            </div>

            <div class='legend-item'>
                <strong>Medium</strong>
                — Market movement overlaps with meaningful local pressure or capacity.
            </div>

            <div class='legend-item'>
                <strong>High</strong>
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

        // Development Pressure is signed in the Atlas.
        // For Market Exposure, negative pressure contributes zero;
        // positive pressure already occupies the 0–1 range.

        const pressureComponent = [
            'max',
            0,
            [
                'min',
                1,
                [
                    'to-number',
                    ['get','Development Pressure'],
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
                    ['get','Latent Urban Capacity'],
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
            ['has','Development Pressure'],
            ['has','Latent Urban Capacity'],
            ['!=',['get','Development Pressure'],null],
            ['!=',['get','Latent Urban Capacity'],null],
            ['>=',regionMomentumExpression,0]
        ];

        return [
            'case',
            assessable,
            [
                'interpolate',
                ['linear'],
                exposure,

                0.00,
                'rgba(237,248,246,0.28)',

                0.15,
                'rgba(204,236,230,0.48)',

                0.30,
                'rgba(127,205,187,0.64)',

                0.45,
                'rgba(65,182,196,0.72)',

                0.60,
                'rgba(37,120,142,0.80)',

                0.75,
                'rgba(8,64,129,0.88)'
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

    'Market Exposure'

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
                        'UGS_v01_Code'
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
                        'UGS_v01_Code'
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
        url:'pmtiles://https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/atlas/852LAB_V1.5.pmtiles'
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
            {label:'Intensity',field:'UGS_v01_Intensity_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        EC:[
            {label:'Intensity',field:'UGS_v01_Intensity_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        AT:[
            {label:'Building age',field:'UGS_v01_Building_Age_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        VM:[
            {label:'Intensity',field:'UGS_v01_Intensity_Band'},
            {label:'Height / Form',field:'UGS_v01_Height_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        LF:[
            {label:'Building age',field:'UGS_v01_Building_Age_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        CF:[
            {label:'Accessibility',field:'UGS_v01_Access_Band'},
            {label:'Change',field:'UGS_v01_Change_Band'}
        ],

        SF:[],

        C:[
            {label:'Planning context',field:'SPZ - Capacity Context'}
        ],

        U:[
            {label:'Data availability',field:'UGS_v01_Data_Completeness'}
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
                'The current model identifies this combination of urban ' +
                'characteristics as a distinct Signature.'
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
            'BLDG-APPR_YEAR'
        );


    const landDealYear =
        ugsNumber(
            properties,
            'LAND-DEAL_YEAR'
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
                    Latest building approval
                </span>

                <span>
                    ${
                        approvalYear !== null
                            ? approvalYear
                            : '—'
                    }
                </span>

            </div>


            <div class="popup-row">

                <span>
                    Latest land deal
                </span>

                <span>
                    ${
                        landDealYear !== null
                            ? landDealYear
                            : '—'
                    }
                </span>

            </div>


            ${
                hasActivity
                    ? ''
                    : `
                        <div class="ugs-activity-note">
                            No building approval or land-deal year is recorded
                            for this hex in the current Atlas.
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


    const dataCompleteness =
        ugsValue(
            p,
            'UGS_v01_Data_Completeness'
        );


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
                                ' m²/cap'
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
                    The Urban Genetic Signature is a rule-based
                    classification. It compares each hex with the
                    meaningful urban reference set across five
                    characteristics: Intensity, Accessibility,
                    Height / Form, Age and Change.
                </p>

                <p>
                    A Signature is assigned when a particular
                    combination crosses the thresholds defined by
                    UGS v0.1. It is not an average of the five
                    characteristics and it is not an overall score.
                </p>

                <p>
                    The current Change profile uses Development Pressure and
                    Renewal Potential. These are modelled indicators, but some
                    recorded activity also contributes to their upstream
                    calculations: approved-development activity contributes to
                    Development Pressure, while land-deal recency contributes to
                    Renewal.
                </p>

                <p>
                    The popup shows the underlying recorded activity separately
                    so the user can distinguish source evidence from the derived
                    model signal. Raw evidence and modelled interpretation are
                    displayed separately, but they are not necessarily
                    statistically independent.
                </p>

                <p>
                    The Signature describes the condition detected by the
                    current model. It does not predict redevelopment.
                </p>

                ${
                    ugsNumber(
                        p,
                        'UGS_v01_Renewal_Pct'
                    ) !== null
                        ? `
                            <div class="popup-row">
                                <span>Renewal signal</span>
                                <span>
                                    ${
                                        ugsNumber(
                                            p,
                                            'UGS_v01_Renewal_Pct'
                                        ).toFixed(0)
                                    }%
                                </span>
                            </div>
                        `
                        : ''
                }


                ${
                    ugsNumber(
                        p,
                        'UGS_v01_Pressure_Pct'
                    ) !== null
                        ? `
                            <div class="popup-row">
                                <span>Pressure signal</span>
                                <span>
                                    ${
                                        ugsNumber(
                                            p,
                                            'UGS_v01_Pressure_Pct'
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
                                Data completeness:
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

    const coverage =
        statsKey
            ? atlasStats?.coverage?.[statsKey]
            : null;

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