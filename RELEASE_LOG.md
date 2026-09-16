# Urban Genetics Atlas — Live Release Log


# Urban Genetics Atlas — V1.4-20260903-170848

**Date:** 2026-09-03 17:08:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed Land _ V1.1.geojson` → `reclaimed/Reclaimed Land _ V1.1.geojson`
- GeoJSON: `Buildings - Age or Heritage Grade.geojson` → `buildings/Buildings - Age or Heritage Grade.geojson`
- Terrain: `51941` objects → `terrain/`

## Automated pre-release checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- Deployment paths generated from fresh Development code.
- Favicon/logo/social metadata checked.
- Complete self-contained local archive created.
- Public AI context regenerated.

# Urban Genetics Atlas — V1.4-20260903-205342

**Date:** 2026-09-03 20:53:42 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects → `terrain/`

## Automated pre-release checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- Deployment paths generated from fresh Development code.
- Favicon/logo/social metadata checked.
- Complete self-contained local archive created.
- Public AI context regenerated.

## Maintainer notes

Renamed public runtime GeoJSON files to remove spaces and improve deployment reliability.

Added satellite imagery as an online basemap option.

This release also tests the automated Development → Live deployment, runtime dependency discovery, complete local archiving, AI context generation and release logging.

Updated Mean Building Height colours to improve contrast between cells.

# Urban Genetics Atlas — V1.4-20260904-011047

**Date:** 2026-09-04 01:10:47 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **baseline**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Updated basemap switch to binary slider.

Added toggles and filters for each UGS Class to control visbility.

# Urban Genetics Atlas — V1.4-20260904-211207

**Date:** 2026-09-04 21:12:07 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.4-20260905-190715

**Date:** 2026-09-05 19:07:15 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`.
- PMTiles: `852LAB_V1.4.pmtiles` → `atlas/852LAB_V1.4.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Functional changes:
- Dual-handle mean building-height range control on one visual track.
- Building-height minimum can be 0 m; maximum 500 m represents 500+ m.
- Basemap / satellite switch aligned.
- Basemap BUILDINGS visibility toggle added.
- Reclaimed Land ordering above satellite imagery.

Cleanup performed:
- Removed unused basemapControl JavaScript reference.
- Removed unused popupRectsOverlap helper.
- Removed stale one-way building-height CSS reference.
- Consolidated the building-height range event handlers into one set.
- Kept current visual/behavioural structure otherwise unchanged.
- No language/content rewrite performed.

# Urban Genetics Atlas — V1.5-20260909-205856

**Date:** 2026-09-09 20:58:56 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`.
- PMTiles: `852LAB_V1.5.pmtiles` → `atlas/852LAB_V1.5.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Complete local archive prepared for this release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.5-20260910-020423

**Date:** 2026-09-10 02:04:23 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`.
- PMTiles: `852LAB_V1.5.pmtiles` → `atlas/852LAB_V1.5.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.6-20260911-192850

**Date:** 2026-09-11 19:28:50 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Revision and integration of data analysis:
- Dev Pressure Idx
- Renewal
- Genesis
- UGS

Market Exposure re-calibrated.

Standardisation and systematic review of colour ramp principals.

Color ramp improvements based on distribution of data.

Opacity controls for UI - analysis & fabric.

Language pass and refinement.

Added conditional colour to key market elements - green if up trend. Red down (strike chart and figure with arrow).

Minor formatting on UI market snapshot.

# Urban Genetics Atlas — V1.6-20260911-195715

**Date:** 2026-09-11 19:57:15 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

# Urban Genetics Atlas — V1.6-20260912-000148

**Date:** 2026-09-12 00:01:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

UI & navigation update:

- Reworked Atlas controls into three dedicated Fabric, Analysis and Market panels with custom icons.
- Added responsive content-fit panel behaviour for desktop and mobile.
- Added persistent Fabric and Analysis opacity controls, including when panels are minimised.
- Separated Map View controls from Fabric; Terrain now operates independently from Fabric opacity.
- Improved Reclaimed Land visibility above Satellite/Terrain.
- Added two-location Market comparison using the retained previous hex and current popup selection.
- Corrected UGS profile-bar scaling.
- Added compact auto-minimising MapLibre attribution.
- Removed native zoom/compass controls.
- General mobile, spacing, alignment and responsive UI refinements.

# Urban Genetics Atlas — V1.6-20260912-192048

**Date:** 2026-09-12 19:20:48 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Market analysis + UI update:

- Added Land Registry Transaction Activity using monthly ASP building-unit registration statistics while preserving the geography of the official source.
- Added Transaction Pulse to show whether recent transaction activity is stronger or weaker than its own recent norm and whether activity is rising or falling.
- Added Transaction Exposure, combining Transaction Pulse with local Development Pressure and Capacity Opportunity to provide finer-grained local differentiation without inventing 100 m transaction counts.
- Added a secondary Market overlay control so Market Momentum, Market Exposure, Transaction Pulse and Transaction Exposure can be compared with the primary Analysis layer, with independent opacity.
- Introduced distinct colour families for the four Market signals to make layered comparisons easier to read.
- Integrated the Land Registry transaction history into the repeatable Market update pipeline and public Market Context.
- Added a mobile master hamburger to hide/show the complete control rail when more map space is wanted.
- Refined panel behaviour: Market now minimises to an opacity bar like Fabric and Analysis; master visibility switches no longer minimise panels; panel icons are the sole minimise/expand controls.
- Restored the custom Analysis panel icon and standardised all interface sliders to a neutral grey treatment.
- Refined information controls and general responsive UI presentation.

# Urban Genetics Atlas — V1.6-20260913-160341

**Date:** 2026-09-13 16:03:41 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Mobile interface refinement:

- Reworked mobile controls into a single Layers launcher and shared control sheet, keeping the map as the primary interface.
- Replaced the persistent stack of collapsed panels with four clear Map, Fabric, Analysis and Market tabs; only one section is shown at a time.
- Improved mobile scrolling so each selected section behaves as one continuous control surface and all panel content remains reachable.
- Unified the mobile sheet visually so navigation and selected content read as one element rather than nested floating panels.
- Refined portrait alignment, spacing and information controls for a calmer, more compact mobile interface.
- Added a dedicated landscape-mobile layout: a narrower right-side control sheet preserves more of the map while using the available screen height.
- Map View now fits its content in landscape, while Fabric, Analysis and Market retain the taller sheet where additional controls require it.
- Compacted landscape Map controls so Basemap, Satellite, Buildings and Terrain remain on a single line.
- Refined panel shadow behaviour so shadows belong to the individual interface panels rather than their structural container.

No changes to Atlas data, analytical models, Market calculations or PMTiles in this release.

# Urban Genetics Atlas — V1.6-20260916-122651

**Date:** 2026-09-16 12:26:51 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Information architecture + interface release:

- Reorganised the Atlas around five public domains: Fabric, Urban Analysis, Market, Demographics and Climate.
- Added a first-visit starting-point chooser so visitors can begin from the part of the city that interests them, while retaining the existing "Do not show again" preference.
- Reframed Urban Analysis around higher-order cross-domain interpretation: Urban Genetic Signature, Development Pressure, Renewal Potential and Genesis Potential.
- Re-homed GFA Saturation, Latent Urban Capacity and MTR Built Accessibility under Fabric as independent Built-City Measures.
- Added an independent Demographics domain with Population Intensity and Living Space, its own visibility and opacity controls, and clear status language while the demographic foundation is being rebuilt.
- Added the Climate domain to the interface as a structured "Coming soon" panel ready for the developing heat / flood / environmental module.
- Kept Fabric, Urban Analysis, Market and Demographics map renderers independent so layers can be compared together without changing one another's selections or opacity.
- Reworked the desktop legend as one scrollable five-panel rail. Panels may all remain open, expand naturally to their full content height, and only minimise from their own category icon.
- Preserved the compact mobile shared-sheet interface with Map / Fabric / Analysis / Market / Demographics / Climate navigation.
- Added dedicated Demographics and Climate icons and aligned panel composition, type hierarchy, spacing and selected-view information across domains.
- Expanded Market into a self-contained analytical section with visibility control, 0–100% context opacity, selected-view descriptions, colour ramps, interpretation and native methodology information for Market Momentum, Market Exposure, Transaction Pulse and Transaction Exposure.
- Standardised information controls so Fabric measures, Market views and Demographics views use the same native Atlas information popover pattern as Urban Analysis.
- Removed legacy desktop max-two-panel and content-fit behaviour from the new five-panel rail while retaining the established mobile sheet behaviour.

This release reorganises and improves access to existing Atlas data and analyses. It does not change the underlying PMTiles, Market calculations or analytical model mathematics. Population Intensity and Living Space remain the current Atlas estimates pending the Demographics v2 rebuild; Climate remains a public interface placeholder while the first module outputs are prepared.

# Urban Genetics Atlas — V1.6-20260916-125932

**Date:** 2026-09-16 12:59:32 CST
**Live:** https://852lab.github.io/Urban-Genetics-Atlas/

## Release changes

- Application files released from Development: `index.html`, `atlas.js`, `styles.css`, `site/market-data.js`, `site/market-data.css`, `site/atlas-stats.json`.
- PMTiles: `852LAB_V1.6.pmtiles` → `atlas/852LAB_V1.6.pmtiles`
- GeoJSON: `MTR_Lines_TEST.geojson` → `mtr/MTR_Lines_TEST.geojson`
- GeoJSON: `Reclaimed_Land_V1.1.geojson` → `reclaimed/Reclaimed_Land_V1.1.geojson`
- GeoJSON: `Buildings_Age_or_Heritage_Grade.geojson` → `buildings/Buildings_Age_or_Heritage_Grade.geojson`
- Terrain: `51941` objects — **unchanged**

## Public AI context

- `llms.txt` — AI entry point.
- `llms-full.txt` — full plain-text AI briefing.
- `atlas-context.md` / `atlas-context.txt` — current project context.

## Automated checks

- Runtime dependencies discovered from fresh Development `atlas.js`.
- All discovered local runtime resources exist.
- R2 destination collisions checked.
- External basemap sources remain external and were not copied to R2.
- Compact local archive prepared; fixed terrain is not duplicated per release.
- Public AI context regenerated.
- R2/CORS/range verification performed before Git push.
- GitHub Pages and public AI files verified after push.

## Maintainer release notes

Information architecture + interface release:

- Reorganised the Atlas around five public domains: Fabric, Urban Analysis, Market, Demographics and Climate.
- Added a first-visit starting-point chooser so visitors can begin from the part of the city that interests them, while retaining the existing "Do not show again" preference.
- Reframed Urban Analysis around higher-order cross-domain interpretation: Urban Genetic Signature, Development Pressure, Renewal Potential and Genesis Potential.
- Re-homed GFA Saturation, Latent Urban Capacity and MTR Built Accessibility under Fabric as independent Built-City Measures.
- Added an independent Demographics domain with Population Intensity and Living Space, its own visibility and opacity controls, and clear status language while the demographic foundation is being rebuilt.
- Added the Climate domain to the interface as a structured "Coming soon" panel ready for the developing heat / flood / environmental module.
- Kept Fabric, Urban Analysis, Market and Demographics map renderers independent so layers can be compared together without changing one another's selections or opacity.
- Reworked the desktop legend as one scrollable five-panel rail. Panels may all remain open, expand naturally to their full content height, and only minimise from their own category icon.
- Preserved the compact mobile shared-sheet interface with Map / Fabric / Analysis / Market / Demographics / Climate navigation.
- Added dedicated Demographics and Climate icons and aligned panel composition, type hierarchy, spacing and selected-view information across domains.
- Expanded Market into a self-contained analytical section with visibility control, 0–100% context opacity, selected-view descriptions, colour ramps, interpretation and native methodology information for Market Momentum, Market Exposure, Transaction Pulse and Transaction Exposure.
- Standardised information controls so Fabric measures, Market views and Demographics views use the same native Atlas information popover pattern as Urban Analysis.
- Removed legacy desktop max-two-panel and content-fit behaviour from the new five-panel rail while retaining the established mobile sheet behaviour.

This release reorganises and improves access to existing Atlas data and analyses. It does not change the underlying PMTiles, Market calculations or analytical model mathematics. Population Intensity and Living Space remain the current Atlas estimates pending the Demographics v2 rebuild; Climate remains a public interface placeholder while the first module outputs are prepared.
