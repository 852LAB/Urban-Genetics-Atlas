# Urban Genetics Atlas — Public AI Context

> Curated public context for AI systems and researchers reviewing the live Atlas.
> Generated automatically for each Live release from public project files.

## Live Atlas

https://852lab.github.io/Urban-Genetics-Atlas/

## Public review resources

- Live interface: https://852lab.github.io/Urban-Genetics-Atlas/
- AI index: https://852lab.github.io/Urban-Genetics-Atlas/llms.txt
- Full AI context: https://852lab.github.io/Urban-Genetics-Atlas/llms-full.txt
- Detailed context: https://852lab.github.io/Urban-Genetics-Atlas/atlas-context.md
- Plain-text context: https://852lab.github.io/Urban-Genetics-Atlas/atlas-context.txt
- Main HTML: https://852lab.github.io/Urban-Genetics-Atlas/index.html
- Map/application logic: https://852lab.github.io/Urban-Genetics-Atlas/atlas.js
- Interface styling: https://852lab.github.io/Urban-Genetics-Atlas/styles.css
- Public release manifest: https://852lab.github.io/Urban-Genetics-Atlas/release-manifest.json
- Repository: https://github.com/852LAB/Urban-Genetics-Atlas

## Current snapshot

- Page title: **Urban Genetics Atlas**
- UI version label: **v1.0 Beta**
- Release ID: **V1.4-20260904-211207**
- Generated: **2026-09-04 13:15 UTC**
- PMTiles: **atlas/852LAB_V1.4.pmtiles**
- Public GeoJSON resources: **3**
- Terrain objects: **51941**
- Terrain release status: **unchanged**

## Project character

The Urban Genetics Atlas is a map-first exploratory system for reading Hong Kong's urban fabric. Its intended character is **Windy + Wiki for cities**: spatial, visual, open and understandable without specialist GIS knowledge.

The Atlas is intended to move from:

**data → interpretation → understanding**

rather than simply presenting a collection of GIS attributes.

## Urban Analysis modes currently present

- `Urban Genetic Signature` — Urban Genetic Signature - UGS.1.0
- `Development Pressure` — Development Pressure
- `GFA - Saturation` — GFA Saturation
- `MTR - Index (Built)` — MTR Built Accessibility
- `Renewal Potential` — Renewal Potential
- `Genesis Potential` — Genesis Potential
- `GFA per Capita` — Living Space (sqm/cap)
- `Population per Building` — Population Intensity
- `Latent Urban Capacity` — Latent Urban Capacity
- `All` — All Contexts
- `Residential` — Residential
- `Commercial / Mixed` — Commercial / Mixed
- `Industrial` — Industrial
- `Comprehensive Development` — Comprehensive Development
- `Village / Other Development` — Village / Other Development
- `Constrained / Non-urban` — Constrained / Non-urban
- `Other / Unclassified` — Other / Unclassified

## Urban Genetic Signature

The Urban Genetic Signature (UGS) is a high-level interpretive layer for describing urban condition.

It is a **categorical description of urban condition**, not a redevelopment prediction and not a single overall score.

The UGS fingerprint is intended to let users compare neighbouring cells through dimensions including:

- **Intensity**
- **Accessibility**
- **Height / Form**
- **Change**
- **Age**, where meaningful data exists

## Critical conceptual distinction

The Atlas separates:

### Urban condition
Physical and spatial characteristics such as intensity, accessibility, height/form and age.

### Modelled change signal
Indicators such as Renewal Potential and Development Pressure.

### Observed activity
Recorded activity such as building approvals and land-related activity.

A high modelled change signal is therefore not equivalent to actual or imminent redevelopment.

## Public implementation

The Atlas is a static HTML/CSS/JavaScript application using MapLibre GL JS. The primary hexagonal atlas is delivered using PMTiles. Supporting datasets and terrain are delivered separately. Satellite imagery or other third-party basemaps, when present, remain external online services rather than Atlas R2 data.

## Data caveats

The Atlas is an analytical and exploratory tool rather than a definitive representation of Hong Kong. Source datasets vary in coverage, completeness and detail. Missing values, outliers and uneven source coverage exist.

- **CONSTRAINED** is a special planning-context state.
- **UNASSESSED** means insufficient evidence, not low performance.
- A Signature is not a redevelopment forecast.
- Recorded approvals and land activity describe observed activity, not certainty about future change.

## Recommended AI review

For a comprehensive review, inspect the live Atlas first, then use this context and the public source files.

Focus on whether the Atlas:

1. reveals spatial territories or clusters of urban condition;
2. makes the Signature intelligible to non-specialists;
3. makes neighbouring fingerprints naturally comparable;
4. distinguishes modelled change from observed activity;
5. keeps the popup map-native rather than turning into a dashboard;
6. remains coherent on desktop and mobile;
7. handles missing, constrained and unassessed cases honestly;
8. encourages users to ask why places differ.

## Public implementation resources

This release intentionally excludes credentials, API keys, private endpoints, raw source datasets and other non-public development material.

## Maintainer / conceptual notes

# Urban Genetics Atlas — Public AI Context Notes

## Project character

The Urban Genetics Atlas is a map-first exploratory system for reading Hong Kong's urban fabric.

Its intended character is **Windy + Wiki for cities**: spatial, visual, open and understandable without requiring specialist GIS knowledge.

The Atlas is intended to move from:

**data → interpretation → understanding**

rather than simply presenting a collection of GIS attributes.

## Urban Genetic Signature

The Urban Genetic Signature (UGS) is a categorical description of urban condition.

It is not a redevelopment prediction and not a single overall score.

The Signature is intended to let users compare neighbouring cells through a fingerprint including:

- Intensity
- Accessibility
- Height / Form
- Change
- Age, where meaningful data exists

## UGS classification logic

The current rule-based classification should be treated as the public conceptual description while those rules remain unchanged:

- **AGEING TRANSITION (AT):** age ≥ 40 years and change ≥ 75th percentile.
- **TRANSFORMING CORE (TC):** intensity ≥ 75th percentile and change ≥ 75th percentile.
- **EMERGING CHANGE (EC):** intensity ≤ 25th percentile and change ≥ 75th percentile.
- **VERTICAL MATURE (VM):** intensity ≥ 75th percentile, height ≥ 75th percentile and change < 75th percentile.
- **LEGACY FABRIC (LF):** age ≥ 50 years and change < 75th percentile.
- **CONNECTED FABRIC (CF):** accessibility ≥ 75th percentile and change < 75th percentile.
- **STABLE FABRIC (SF):** remaining meaningful urban cells without an exceptional combination.
- **CONSTRAINED (C):** constrained/non-urban planning context.
- **UNASSESSED (U):** insufficient analytical context.

These classes describe a condition detected by the model. They do not predict redevelopment.

## Critical distinction

The Atlas separates three kinds of information:

### Urban condition
The physical and spatial characteristics of a place.

### Modelled change signal
Indicators such as Renewal Potential and Development Pressure.

### Observed activity
Recorded activity such as building approvals and land-deal activity.

A high modelled change signal is therefore not equivalent to actual or imminent redevelopment.

## Signature interpretation

The Signature is intended to move from:

**identity → evidence → interpretation**

The Signature is the primary interpretive element. Supporting information provides evidence for why a classification exists.

## Spatial interpretation

The Atlas is intended to reveal spatial relationships, clusters and territories rather than simply produce scores for individual locations.

Neighbouring cells may have different signatures because their underlying urban characteristics differ.

The purpose is to encourage the user to ask:

**Why are these places different?**

## Popup and interface character

The popup is intended to remain map-native rather than becoming a dashboard. It should present the Signature first, then supporting evidence and interpretation, with methodology available when needed.

The Atlas should remain understandable on desktop, tablet and phone while retaining the map as the primary interface.

## Urban Fabric

The Atlas may include physical, infrastructural and historical context such as terrain, reclamation, building age, heritage, MTR and other supporting layers present in the current release.

## Data caveats

The Atlas is an analytical and exploratory tool rather than a definitive representation of Hong Kong.

Source datasets vary in coverage, completeness and detail. Missing values, outliers and uneven source coverage exist.

- **CONSTRAINED** is a special planning/context state.
- **UNASSESSED** means insufficient evidence, not low performance.
- A Signature is not a redevelopment forecast.
- Recorded approvals and land activity describe observed activity, not certainty about future change.

## Public/private boundary

This file is intended to contain public conceptual context only. It must not contain credentials, API keys, private endpoints, confidential working data or unreleased proprietary development material.
