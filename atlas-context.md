# Urban Genetics Atlas — Public AI Context

> Curated public context for AI systems and researchers reviewing the live Atlas.
> Generated automatically for each Live release from public project files.

## Live Atlas

https://852lab.github.io/Urban-Genetics-Atlas/

## Public review resources

- Live interface: https://852lab.github.io/Urban-Genetics-Atlas/
- Main HTML: https://852lab.github.io/Urban-Genetics-Atlas/index.html
- Map/application logic: https://852lab.github.io/Urban-Genetics-Atlas/atlas.js
- Interface styling: https://852lab.github.io/Urban-Genetics-Atlas/styles.css
- AI-readable index: https://852lab.github.io/Urban-Genetics-Atlas/llms.txt
- Repository: https://github.com/852LAB/Urban-Genetics-Atlas

## Current snapshot

- Page title: **Urban Genetics Atlas**
- UI version label: **v1.0 Beta**
- Release ID: **V1.4-20260903-205342**
- Generated: **2026-09-03 12:56 UTC**
- PMTiles: **atlas/852LAB_V1.4.pmtiles**
- Public GeoJSON resources: **3**
- Terrain objects: **51941**

## Project character

The Urban Genetics Atlas is a map-first exploratory system for reading Hong Kong's urban fabric. Its intended character is **Windy + Wiki for cities**: spatial, visual, open and understandable without specialist GIS knowledge.

The Atlas is intended to move from:

**data → interpretation → understanding**

rather than simply presenting a collection of GIS attributes.

## Urban Analysis modes currently present

- `map` — Map
- `satellite` — Satellite
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

The UGS fingerprint is intended to let users compare neighbouring cells through:

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

The Atlas is a static HTML/CSS/JavaScript application using MapLibre GL JS. The primary hexagonal atlas is delivered using PMTiles, with selected supporting data and terrain delivered separately.

## Data caveats

The Atlas is an analytical and exploratory tool rather than a definitive representation of Hong Kong. Source datasets vary in coverage, completeness and detail. Missing values, outliers and uneven source coverage exist.

- **CONSTRAINED** is a special planning-context state.
- **UNASSESSED** means insufficient evidence, not low performance.
- A Signature is not a redevelopment forecast.
- Recorded approvals and land activity describe observed activity, not certainty about future change.

## Recommended AI review

For a comprehensive review, inspect the live Atlas first, then use the public context and source files.

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

# Urban Genetics Atlas — Release Automation

The final package automates Development → Live releases.

### It discovers runtime data
It scans the fresh Development `atlas.js` for every locally referenced `.pmtiles` and `.geojson`, plus the terrain tile directory when referenced. Multiple PMTiles and multiple GeoJSON sources are supported.

### It archives complete releases
Every successful run creates a self-contained archive under `C:\UrbanGeneticsAtlas_Releases\`. The archive includes `range_server.py`, application files, assets, discovered runtime data, terrain, AI context, release notes, release log and SHA-256 checksums. Its `atlas.js` retains local data paths so the archive is independently launchable.

### It deploys
Runtime data is uploaded to Cloudflare R2; application/context files are committed and pushed to GitHub; GitHub Pages is checked for the exact release marker; R2 objects/CORS/PMTiles range support are checked; and a GitHub Release is created.

### It protects GitHub
GeoJSON, PMTiles, terrain, `range_server.py` and `.qmd` files are rejected from the Git staging set.

### AI context
`public-ai-notes.md` is the human-controlled conceptual layer. The release generates `atlas-context.md` and `llms.txt` for each release.

### Optional human release note
Put a short note in `C:\UrbanGeneticsAtlas\release-notes.txt` before a release. It is included automatically.

### Install
Copy the supplied files into `C:\UrbanGeneticsAtlas` and its `scripts` subdirectory as described in `INSTALL.txt`.
